/*----------------------------------------------------------------
     Resource: Vital.network
     Script: rest.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Rest Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CBusBoy = require("busboy")
const CNetwork = require("@vstudio/vital.kit/src/network")


//////////////////
// Class: Rest //
//////////////////

CNetwork.fetch("vNetwork:Server:onConnect").on((server) => {
    const CRest = vKit.Class()
    server.public.rest = CRest.public
    CRest.private.post = {}, CRest.private.get = {}, CRest.private.put = {}, CRest.private.delete = {}

    CNetwork.fetch("vNetwork:Server:onDisconnect").on((__server) => {
        if ((server.public != __server.public) || (server.private != __server.private)) return
        CRest.private.isUnloaded = true
        delete server.public.rest
    })


    /////////////////////
    // Static Members //
    /////////////////////

    // @Desc: Requests a fetch on specified REST API 
    CRest.public.addMethod("fetch", (type, ...cArgs) => {
        if (CRest.private.isUnloaded) return false
        if (!vKit.isObject(CRest.private[type])) return false
        return server.private.instance.http[type](...cArgs)
    })

    if (vKit.server) {
        // @Desc: Verifies whether the REST API is void
        CRest.public.addMethod("isVoid", (type, route) => {
            if (CRest.private.isUnloaded) return false
            return (vKit.isString(type) && vKit.isString(route) && vKit.isObject(CRest.private[type]) && (!CRest.private[type][route] || !CRest.private[type][route].handler) && true) || false
        })
        
        // @Desc: Creates a fresh REST API
        CRest.public.addMethod("create", (type, route, exec) => {
            if (CRest.private.isUnloaded) return false
            if (!CRest.public.isVoid(type, route) || !vKit.isFunction(exec)) return false
            CRest.private[type][route] = CRest.private[type][route] || {}
            CRest.private[type][route].manager = CRest.private[type][route].manager || ((...cArgs) => {
                if (type == "post") {
                    cArgs.splice(2, 0, CBusBoy({
                        headers: cArgs[0].headers,
                        limits: {fieldSize: server.private.config.bandwidth*Math.pow(1024, 2)*50}
                    }))
                    cArgs[0].pipe(cArgs[2])
                }
                vKit.exec(CRest.private[type][route].handler, ...cArgs)
            })
            CRest.private[type][route].handler = exec
            server.private.instance.express[type](`/${route}`, CRest.private[type][route].manager)
            return true
        })
        
        // @Desc: Destroys an existing REST API
        CRest.public.addMethod("destroy", (type, route) => {
            if (CRest.private.isUnloaded) return false
            if ((route == server.private.healthpoint) || CRest.public.isVoid(type, route)) return false
            delete CRest.private[type][route].handler
            return true
        })
        
        // @Desc: Routing middleware
        CRest.public.addMethod("onMiddleware", (request, response, next) => {
            if (CRest.private.isUnloaded) return false
            const type = request.method.toLowerCase()
            const route = request.url.split("?")[0].slice(1)
            if (CRest.public.isVoid(type, route)) return response.status(404).send({isAuthorized: false, type: type, route: route})
            next()
        })
        server.private.instance.express.all("*", CRest.public.onMiddleware)
    }
})