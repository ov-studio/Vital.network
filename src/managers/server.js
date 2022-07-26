/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: server.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Server Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CCors = require("cors")
const CHTTP = require("http")
const CExpress = require("express")
const CUtility = require("../utilities")


////////////////////
// Class: Server //
///////////////////

const CServer = {
    config: {},
    instance: {}
}

const onConnectionStatus = function(resolver, state) {
    CServer.config.isAwaiting = null
    CServer.config.isConnected = state
    if (CUtility.isFunction(resolver)) resolver(CServer.config.isConnected)
    CUtility.print(`━ vNetworkify (${(!CUtility.isServer && "Client") || "Server"}) | ${(state && "Launched") || "Launch failed"} [Port: ${CServer.config.port}]`)
    return true
}

CServer.fetchConfig = function() {
    return CServer.config
}

CServer.fetchServer = function(index) {
    return (index && CServer.instance[index]) || false
}

CServer.isConnected = function(isSync) {
    if (isSync) return (CUtility.isBool(CServer.config.isConnected) && CServer.config.isConnected) || false
    return CServer.config.isAwaiting || CServer.config.isConnected || false
}

if (!CUtility.isServer) {
    CServer.connect = function(port, options) {
        port = (CUtility.isNumber(port) && port) || false
        options = (CUtility.isObject(options) && options) || {}
        if (!port || CServer.isConnected()) return false
        CServer.config.port = port
        CServer.config.protocol = window.location.protocol
        CServer.config.hostname = window.location.hostname
        CServer.instance.CExpress = {
            get: function(route) {
                if (!CUtility.isString(route)) return false
                return fetch(route, {method: "GET"))
            }
        }
        onConnectionStatus(null, true)
        return true
    } 
}
else {
    CServer.connect = function(port, options) {
        port = (CUtility.isNumber(port) && port) || false
        options = (CUtility.isObject(options) && options) || {}
        if (!port || CServer.isConnected()) return false
        var cResolver = false
        CServer.config.isAwaiting = new Promise((resolver) => cResolver = resolver)
        CServer.config.port = port
        CServer.config.isCaseSensitive = (options.isCaseSensitive && true) || false
        CServer.instance.CExpress = CExpress()
        CServer.instance.CHTTP = CHTTP.Server(CServer.instance.CExpress)
        CServer.instance.CExpress.use(CCors())
        CServer.instance.CExpress.use(CExpress.json())
        CServer.instance.CExpress.use(CExpress.urlencoded({extended: true}))
        CServer.instance.CExpress.set("case sensitive routing", CServer.config.isCaseSensitive)
        CServer.instance.CExpress.all("*", CServer.rest.onMiddleware)
        CServer.instance.CHTTP.listen(CServer.config.port, () => onConnectionStatus(cResolver, true))
        return true
    }    
}


//////////////
// Exports //
//////////////

module.exports = CServer