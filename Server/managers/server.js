
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

const CCors = require("cors")
const CHTTP = require("http")
const CExpress = require("express")
const CEvent = require("events")
const CUtility = require("../utilities/index")


/*------------------
-- Class: CServer --
------------------*/

const CServer = {
    config: {},
    route: {
        post: {},
        get: {},
        put: {},
        delete: {}
    },
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

CServer.isRestAPIVoid = function(type, route) {
    return (CUtility.isString(type) && CUtility.isString(route) && CServer.route[type] && !CServer.route[type][route] && true) || false
}

CServer.createRestAPI = function(type, route, exec) {
    console.log("ATTACHED 1")
    if (!CServer.isRestAPIVoid(type, route) || !CUtility.isFunction(exec)) return false
    console.log("ATTACHED")
    CServer.route[type][route] = exec
    CServer.instance.CExpress.get(`/${route}`, exec)
    return true
}

CServer.connect = function(port, options) {
    port = (CUtility.isNumber(port) && port) || false
    options = (CUtility.isObject(options) && options) || {}
    if (!port || CServer.isConnected()) return false
    var CResolver = false
    CServer.config.isAwaiting = new Promise((resolver) => CResolver = resolver)
    CServer.config.port = port
    CServer.instance.CExpress = CExpress()
    CServer.instance.CHTTP = CHTTP.Server(CServer.instance.CExpress)
    CServer.instance.CEvent = new (CEvent).EventEmitter()
    CServer.instance.CExpress.use(CCors())
    CServer.instance.CExpress.use(CExpress.json())
    CServer.instance.CExpress.use(CExpress.urlencoded({ extended: true}))
    CServer.instance.CExpress.set("case sensitive routing", (options.isCaseSensitive && true) || false)
    CServer.instance.CHTTP.listen(CServer.config.port, () => {
        CServer.config.isAwaiting = null
        CServer.config.isConnected = true
        CResolver(CServer.config.isConnected)
        CUtility.log(`━ vNetworify (Server) | Launched [Port: ${CServer.config.port}]`)
    })
    return true
}


/*------------
-- Exports  --
------------*/

module.exports = function(isExtension) {
    return (isExtension && CServer) || CUtility.createAPIs(CServer)
}