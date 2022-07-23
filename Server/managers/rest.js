
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: managars: rest.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Rest Manager
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

const CUtility = require("../utilities")
const CServer = require("./server")(true)


/*---------------
-- Class: Rest --
---------------*/

CServer.isRestAPIVoid = function(type, route) {
    return (CUtility.isString(type) && CUtility.isString(route) && CUtility.isObject(CServer.route[type]) && (!CUtility.isObject(CServer.route[type][route]) || !CServer.route[type][route].handler) && true) || false
}

CServer.rest.onMiddleware = function(request, response, next) {
    const type = request.method.toLowerCase()
    const route = request.url.slice(1)
    if (CServer.isRestAPIVoid(type, route)) {
        response.status(404).send({isAuthorized: false, type: type, route: route})
        return false
    }
    next()
    return true
}

CServer.createRestAPI = function(type, route, exec) {
    if (!CServer.isRestAPIVoid(type, route) || !CUtility.isFunction(exec)) return false
    CServer.route[type][route] = CServer.route[type][route] || {}
    CServer.route[type][route].manager = CServer.route[type][route].manager || function(...cArgs) {
        CUtility.exec(CServer.route[type][route].handler, ...cArgs)
        return true
    }
    CServer.route[type][route].handler = exec
    CServer.instance.CExpress[type](`/${route}`, CServer.route[type][route].manager)
    return true
}

CServer.destroyRestAPI = function(type, route) {
    if (CServer.isRestAPIVoid(type, route)) return false
    CServer.route[type][route].handler = null
    return true
}