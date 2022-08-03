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

const CServer = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

// @Desc: Creates a fresh server
CServer.addMethod("create", function(...cArgs) {
    return new CServer(...cArgs)
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CServer.addMethod("constructor", function(self, options) {
    options = (CUtility.isObject(options) && options) || {}
    self.config = {}, self.instance = {}
    self.config.port = (CUtility.isNumber(options.port) && options.port) || false
    if (!CUtility.isServer) {
        self.config.protocol = (CUtility.isString(options.protocol) && options.protocol) || window.location.protocol
        self.config.hostname = (CUtility.isString(options.hostname) && options.hostname) || window.location.hostname
    }
    else {
        self.config.isCaseSensitive = (options.isCaseSensitive && true) || false
        self.config.cors = (CUtility.isObject(options.cors) && options.cors) || false
    }
}, "isInstance")

// @Desc: Verifies instance's validity
CServer.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && true) || false
})

// @Desc: Destroys the instance
CServer.addInstanceMethod("destroy", function(self) {
    self.isUnloaded = true
    return true
})

// @Desc: Retrieves instance's config
CServer.addInstanceMethod("fetchConfig", function(self) {
    return self.config
})

// @Desc: Retrieves instance's server
CServer.addInstanceMethod("fetchServer", function(self, index) {
    return (index && self.instance[index]) || false
})

// @Desc: Retrieves connection's status
CServer.addInstanceMethod("isConnected", function(self, isSync) {
    if (isSync) return (CUtility.isBool(self.config.isConnected) && self.config.isConnected) || false
    return self.config.isAwaiting || self.config.isConnected || false
})

// @Desc: Handles Connection Status
const onConnectionStatus = function(self, resolver, state) {
    delete self.config.isAwaiting
    self.config.isConnected = state
    CUtility.exec(resolver, self.config.isConnected)
    CUtility.print(`━ vNetworkify (${(!CUtility.isServer && "Client") || "Server"}) | ${(state && "Launched") || "Launch failed"} ${(self.config.port && ("[Port: " + self.config.port + "]")) || ""}]`)
    return true
}

// @Desc: Handles Connection Status
CServer.addInstanceMethod("connect", function(self) {
    return (!self.isUnloaded && true) || false
})

const test = CServer.create({
    port: 33021,
    isCaseSensitive: true
})
console.log(test)
console.log(test.destroy)
/*
if (!CUtility.isServer) {
    // @Desc: Intializes & sets up server connections
    CServer.connect = function(options) {
        if (CServer.isConnected()) return false
        CServer.instance.CExpress = {
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
        onConnectionStatus(null, true)
        return true
    } 
}
else {
    // @Desc: Intializes & sets up server connections
    CServer.connect = function(options) {
        if (CServer.isConnected()) return false
        var cResolver = false
        self.config.isAwaiting = new Promise((resolver) => cResolver = resolver)
        CServer.instance.CExpress = CExpress()
        CServer.instance.CHTTP = CHTTP.Server(CServer.instance.CExpress)
        CServer.instance.CExpress.use(CCors(self.config.cors))
        CServer.instance.CExpress.use(CExpress.json())
        CServer.instance.CExpress.use(CExpress.urlencoded({extended: true}))
        CServer.instance.CExpress.set("case sensitive routing", self.config.isCaseSensitive)
        CServer.instance.CExpress.all("*", CServer.rest.onMiddleware)
        CServer.instance.CHTTP.listen(self.config.port, () => onConnectionStatus(cResolver, true))
        return true
    }    
}
*/


//////////////
// Exports //
//////////////

module.exports = CServer