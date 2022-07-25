
/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managars: server.js
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
const CUtility = require("../utilities/index")


////////////////////
// Class: Server //
///////////////////

const CServer = {
    config: {},
    instance: {}
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
        CServer.config.protocol = window.location.protocol
        CServer.config.hostname = window.location.hostname
        CUtility.print(`━ vNetworkify (Client) | Launched [Port: ${CServer.config.port}]`)
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
        CServer.instance.CHTTP.listen(CServer.config.port, () => {
            CServer.config.isAwaiting = null
            CServer.config.isConnected = true
            cResolver(CServer.config.isConnected)
            CUtility.print(`━ vNetworkify (Server) | Launched [Port: ${CServer.config.port}]`)
        })
        return true
    }    
}


//////////////
// Exports //
//////////////

module.exports = CServer