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
const CNetwork = require("../utilities/network")


////////////////////
// Class: Server //
///////////////////

const CServer = CUtility.createClass()
CNetwork.create("vNetworkify:Server:onConnect")
CNetwork.create("vNetworkify:Server:onDisconnect")


/////////////////////
// Static Members //
/////////////////////

// @Desc: Creates a fresh server
CServer.public.addMethod("create", function(...cArgs) {
    return CServer.public.createInstance(...cArgs)
})

// @Desc: Handles connection's status
CServer.private.onConnectionStatus = function(self, state) {
    const private = CServer.instance.get(self)
    delete private.isAwaiting
    private.isConnected = state
    CUtility.exec(private.resolver, private.isConnected)
    CUtility.print(`━ vNetworkify (${(!CUtility.isServer && "Client") || "Server"}) | ${(state && "Launched") || "Launch failed"} ${(private.config.port && ("[Port: " + private.config.port + "]")) || "" } [Version: ${CUtility.fromBase64(CUtility.version)}]`)
    if (private.isConnected) CNetwork.emit("vNetworkify:Server:onConnect", {public: self, private: private})
    return true
}


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CServer.public.addMethod("constructor", function(self, options) {
    const private = CServer.instance.get(self)
    options = (CUtility.isObject(options) && options) || {}
    private.config = {}, private.instance = {}
    private.config.port = (CUtility.isNumber(options.port) && options.port) || false
    if (!CUtility.isServer) {
        private.config.protocol = (options.isSSL && "https") || "http"
        private.config.hostname = (CUtility.isString(options.hostname) && options.hostname) || window.location.hostname
    }
    else {
        private.config.isCaseSensitive = (options.isCaseSensitive && true) || false
        private.config.cors = (CUtility.isObject(options.cors) && options.cors) || false
    }
})

// @Desc: Destroys the instance
CServer.public.addInstanceMethod("destroy", function(self) {
    const private = CServer.instance.get(self)
    if (self.isConnected(true)) CNetwork.emit("vNetworkify:Server:onDisconnect", {public: self, private: private})
    if (CUtility.isServer) private.instance.CHTTP.close()
    self.destroyInstance()
    return true
})

// @Desc: Retrieves instance's config
CServer.public.addInstanceMethod("fetchConfig", function(self) {
    const private = CServer.instance.get(self)
    return private.config
})

// @Desc: Retrieves instance's server
CServer.public.addInstanceMethod("fetchServer", function(self, index) {
    return (index && private.instance[index]) || false
})

// @Desc: Retrieves connection's status
CServer.public.addInstanceMethod("isConnected", function(self, isSync) {
    const private = CServer.instance.get(self)
    if (isSync) return (CUtility.isBool(private.isConnected) && private.isConnected) || false
    return private.isAwaiting || private.isConnected || false
})

// @Desc: Connects the server
CServer.public.addInstanceMethod("connect", function(self) {
    if (self.isConnected()) return false
    const private = CServer.instance.get(self)
    if (!CUtility.isServer) {
        private.instance.CExpress = {
            post: function(route, data) {
                if (!CUtility.isString(route) || !CUtility.isObject(data)) return false
                return fetch(route, {
                    method: "POST",
                    headers: {["Content-Type"]: "application/json"},
                    body: JSON.stringify(data)
                })
            },
            get: function(route) {
                if (!CUtility.isString(route)) return false
                return fetch(route, {
                    method: "GET"
                })
            },
            put: function(route, data) {
                if (!CUtility.isString(route) || !CUtility.isObject(data)) return false
                return fetch(route, {
                    method: "PUT",
                    headers: {["Content-Type"]: "application/json"},
                    body: JSON.stringify(data)
                })
            },
            delete: function(route) {
                if (!CUtility.isString(route)) return false
                return fetch(route, {
                    method: "DELETE"
                })
            }
        }
        CServer.private.onConnectionStatus(self, true)
    }
    else {
        private.isAwaiting = new Promise((resolver) => private.resolver = resolver)
        private.instance.CExpress = CExpress()
        private.instance.CHTTP = CHTTP.Server(private.instance.CExpress)
        private.instance.CExpress.use(CCors(private.config.cors))
        private.instance.CExpress.use(CExpress.json())
        private.instance.CExpress.use(CExpress.urlencoded({extended: true}))
        private.instance.CExpress.set("case sensitive routing", private.config.isCaseSensitive)
        private.instance.CHTTP.listen(private.config.port, () => CServer.private.onConnectionStatus(self, true))
        .on("error", () => CServer.private.onConnectionStatus(self, false))
        return true
    }
    return true
})


//////////////
// Exports //
//////////////

module.exports = CServer.public
require("./rest")
require("./socket/")