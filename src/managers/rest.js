/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: rest.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Rest Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../utilities")
const CNetwork = require("../utilities/network")


//////////////////
// Class: Rest //
//////////////////

CNetwork.fetch("vNetworkify:Server:onConnect").on(function(server) {
    const CRest = CUtility.createClass({})
    CRest.private = {
        post: {},
        get: {},
        put: {},
        delete: {}
    }
    server.public.rest = CRest.public


    /////////////////////
    // Static Members //
    /////////////////////

    CNetwork.fetch("vNetworkify:Server:onDisconnect").on(function(__server) {
        if (server == __server) CRest.private.isUnloaded = true
        delete __server.public.rest
    })

    if (!CUtility.isServer) {
        // @Desc: Requests a fetch on specified REST API 
        CRest.public.addMethod("fetch", function(type, ...cArgs) {
            if (CRest.private.isUnloaded) return false
            if (!CUtility.isObject(CRest.private[type])) return false
            return server.private.instance.CExpress[type](...cArgs)
        })
    }
    else {
        // @Desc: Verifies whether the REST API is void
        CRest.public.addMethod("isVoid", function(type, route) {
            if (CRest.private.isUnloaded) return false
            return (CUtility.isString(type) && CUtility.isString(route) && CUtility.isObject(CRest.private[type]) && (!CUtility.isObject(CRest.private[type][route]) || !CRest.private[type][route].handler) && true) || false
        })
        
        // @Desc: Creates a fresh REST API
        CRest.public.addMethod("create", function(type, route, exec) {
            if (CRest.private.isUnloaded) return false
            if (!CRest.public.isVoid(type, route) || !CUtility.isFunction(exec)) return false
            CRest.private[type][route] = CRest.private[type][route] || {}
            CRest.private[type][route].manager = CRest.private[type][route].manager || function(...cArgs) {
                CUtility.exec(CRest.private[type][route].handler, ...cArgs)
                return true
            }
            CRest.private[type][route].handler = exec
            server.private.instance.CExpress[type](`/${route}`, CRest.private[type][route].manager)
            return true
        })
        
        // @Desc: Destroys an existing REST API
        CRest.public.addMethod("destroy", function(type, route) {
            if (CRest.private.isUnloaded) return false
            if (CRest.public.isVoid(type, route)) return false
            delete CRest.private[type][route].handler
            return true
        })
        
        // @Desc: Routing middleware
        CRest.public.addMethod("onMiddleware", function(request, response, next) {
            if (CRest.private.isUnloaded) return false
            const type = request.method.toLowerCase()
            const route = request.url.slice(1)
            if (CRest.public.isVoid(type, route)) {
                response.status(404).send({isAuthorized: false, type: type, route: route})
                return false
            }
            next()
            return true
        })
        server.private.instance.CExpress.all("*", CRest.public.onMiddleware)
    }
})