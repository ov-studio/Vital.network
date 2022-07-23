
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

class CRest {
    /////////////////////
    // Static Mmebers //
    ////////////////////

    static route = {
        post: {},
        get: {},
        put: {},
        delete: {}
    }

    static isVoid(type, route) {
        return (CUtility.isString(type) && CUtility.isString(route) && CUtility.isObject(CServer.rest.route[type]) && (!CUtility.isObject(CServer.rest.route[type][route]) || !CServer.rest.route[type][route].handler) && true) || false
    }

    static onMiddleware(request, response, next) {
        const type = request.method.toLowerCase()
        const route = request.url.slice(1)
        if (CServer.rest.isVoid(type, route)) {
            response.status(404).send({isAuthorized: false, type: type, route: route})
            return false
        }
        next()
        return true
    }
    
    CServer.createRestAPI = function(type, route, exec) {
        if (!CServer.rest.isVoid(type, route) || !CUtility.isFunction(exec)) return false
        CServer.rest.route[type][route] = CServer.rest.route[type][route] || {}
        CServer.rest.route[type][route].manager = CServer.rest.route[type][route].manager || function(...cArgs) {
            CUtility.exec(CServer.rest.route[type][route].handler, ...cArgs)
            return true
        }
        CServer.rest.route[type][route].handler = exec
        CServer.instance.CExpress[type](`/${route}`, CServer.rest.route[type][route].manager)
        return true
    }
    
    CServer.destroyRestAPI = function(type, route) {
        if (CServer.rest.isVoid(type, route)) return false
        CServer.rest.route[type][route].handler = null
        return true
    }

    static isVoid(route) {
        return (CUtility.isString(route) && !CUtility.isObject(CServer.rest.route[route]) && true) || false
    }

    static create(route) {
        if (!CServer.isConnected() || !CServer.rest.isVoid(route)) return false
        CServer.rest.route[route] = new CServer.rest(route)
        return CServer.rest.route[route]
    }

    static destroy(route) {
        if (CServer.rest.isVoid(route)) return false
        CServer.rest.route[route].isUnloaded = true
        delete CServer.rest.route[route]
        return true
    }
}
CServer.rest = CRest