
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: managars: server.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Server Manager
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

const CUtility = require("../utilities/index")


/*------------------
-- Class: CServer --
------------------*/

const CServer = {
    config: {},
    route: {},
    instance: {}
}

CServer.fetchConfig = function() {
    return CServer.config
}

CServer.fetchServer = function(index) {
    return (index && CServer.instance[index]) || false
}

CServer.isConnected = function() {
    return CServer.config.isAwaiting || CServer.config.isConnected || false
}

CServer.isRestAPIVoid = function(route) {
    return (route && (typeof(route) == "string") && !CServer.route[route] && true) || false
}

CServer.createRestAPI = function(route, exec) {
    if (!CServer.isRestAPIVoid(route) || !exec || (typeof(exec) != "function")) return false
    CServer.route[route] = exec
    CServer.instance.CExpress.get(`/${route}`, exec)
    return true
}

CServer.connect = function(port, options) {
    port = (port && (typeof(port) == "number") && port) || false
    options = (options && (typeof(options) == "object") && options) || {}
    if (!port || CServer.isConnected()) return false
    var CResolver = false
    CServer.config.isAwaiting = new Promise((resolver) => CResolver = resolver)
    CServer.config.port = port
    CServer.instance.CExpress = require("express")()
    CServer.instance.CHTTP = require("http").Server(CServer.instance.CExpress)
    CServer.instance.CEvent = new (require("events")).EventEmitter()
    CServer.instance.CExpress.use(require("cors")())
    CServer.instance.CExpress.set("case sensitive routing", (options.isCaseSensitive && true) || false)
    CServer.instance.CHTTP.listen(CServer.config.port, () => {
        CServer.config.isAwaiting = null
        CServer.config.isConnected = true
        CResolver(CServer.config.isConnected)
        console.log(`━ vNetworify (Server) | Launched [Port: ${CServer.config.port}]`)
    })
    return true
}


/*------------
-- Exports  --
------------*/

module.exports = CUtility.createAPIs(CServer)