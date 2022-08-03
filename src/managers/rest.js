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
const CServer = require("./server")(true)


//////////////////
// Class: Rest //
//////////////////

const CRest = CUtility.createClass({
    buffer: {
        post: {},
        get: {},
        put: {},
        delete: {}
    }
})
CServer.rest = CRest.public


/////////////////////
// Static Members //
/////////////////////

if (!CUtility.isServer) {
    // @Desc: Requests a fetch on specified REST API 
    CRest.public.addMethod("fetch", function(type, ...cArgs) {
        if (!CUtility.isObject(CRest.public.buffer[type])) return false
        return CServer.instance.CExpress[type](...cArgs)
    })
}
else {
    // @Desc: Verifies whether the REST API is void
    CRest.public.addMethod("isVoid", function(type, route) {
        return (CUtility.isString(type) && CUtility.isString(route) && CUtility.isObject(CRest.public.buffer[type]) && (!CUtility.isObject(CRest.public.buffer[type][route]) || !CRest.public.buffer[type][route].handler) && true) || false
    })
    
    // @Desc: Creates a fresh REST API
    CRest.public.addMethod("create", function(type, route, exec) {
        if (!CRest.public.isVoid(type, route) || !CUtility.isFunction(exec)) return false
        CRest.public.buffer[type][route] = CRest.public.buffer[type][route] || {}
        CRest.public.buffer[type][route].manager = CRest.public.buffer[type][route].manager || function(...cArgs) {
            CUtility.exec(CRest.public.buffer[type][route].handler, ...cArgs)
            return true
        }
        CRest.public.buffer[type][route].handler = exec
        CServer.instance.CExpress[type](`/${route}`, CRest.public.buffer[type][route].manager)
        return true
    })
    
    // @Desc: Destroys an existing REST API
    CRest.public.addMethod("destroy", function(type, route) {
        if (CRest.public.isVoid(type, route)) return false
        delete CRest.public.buffer[type][route].handler
        return true
    })
    
    // @Desc: Routing Middleware
    CRest.public.addMethod("onMiddleware", function(request, response, next) {
        const type = request.method.toLowerCase()
        const route = request.url.slice(1)
        if (CRest.public.isVoid(type, route)) {
            response.status(404).send({isAuthorized: false, type: type, route: route})
            return false
        }
        next()
        return true
    })
}