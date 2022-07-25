/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managars: rest.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Rest Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../utilities")
const CServer = require("./server")


//////////////////
// Class: Rest //
//////////////////

CServer.rest = CUtility.createClass({
    buffer: {
        post: {},
        get: {},
        put: {},
        delete: {}
    }
})


/////////////////////
// Static Members //
/////////////////////

if (!CUtility.isServer) {
    
}
else {
    CServer.rest.addMethod("isVoid", function(type, route) {
        return (CUtility.isString(type) && CUtility.isString(route) && CUtility.isObject(CServer.rest.buffer[type]) && (!CUtility.isObject(CServer.rest.buffer[type][route]) || !CServer.rest.buffer[type][route].handler) && true) || false
    })
    
    CServer.rest.addMethod("create", function(type, route, exec) {
        if (!CServer.isConnected(true) || !CServer.rest.isVoid(type, route) || !CUtility.isFunction(exec)) return false
        CServer.rest.buffer[type][route] = CServer.rest.buffer[type][route] || {}
        CServer.rest.buffer[type][route].manager = CServer.rest.buffer[type][route].manager || function(...cArgs) {
            CUtility.exec(CServer.rest.buffer[type][route].handler, ...cArgs)
            return true
        }
        CServer.rest.buffer[type][route].handler = exec
        CServer.instance.CExpress[type](`/${route}`, CServer.rest.buffer[type][route].manager)
        return true
    })
    
    CServer.rest.addMethod("destroy", function(type, route) {
        if (CServer.rest.isVoid(type, route)) return false
        delete CServer.rest.buffer[type][route].handler
        return true
    })
    
    CServer.rest.addMethod("onMiddleware", function(request, response, next) {
        const type = request.method.toLowerCase()
        const route = request.url.slice(1)
        if (CServer.rest.isVoid(type, route)) {
            response.status(404).send({isAuthorized: false, type: type, route: route})
            return false
        }
        next()
        return true
    })
}