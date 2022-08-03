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
CServer.public.addMethod("create", function(...cArgs) {
    return CServer.public.createInstance(...cArgs)
})


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
        private.config.protocol = (CUtility.isString(options.protocol) && options.protocol) || window.location.protocol
        private.config.hostname = (CUtility.isString(options.hostname) && options.hostname) || window.location.hostname
    }
    else {
        private.config.isCaseSensitive = (options.isCaseSensitive && true) || false
        private.config.cors = (CUtility.isObject(options.cors) && options.cors) || false
    }
})

// @Desc: Destroys the instance
CServer.public.addInstanceMethod("destroy", function(self) {
    self.destroyInstance()
    return true
})

// @Desc: Retrieves instance's config
CServer.public.addInstanceMethod("fetchConfig", function(self) {
    return self.config
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

// @Desc: Handles Connection Status
const onConnectionStatus = function(self, resolver, state) {
    const private = CServer.instance.get(self)
    delete private.isAwaiting
    private.isConnected = state
    CUtility.exec(resolver, private.isConnected)
    CUtility.print(`━ vNetworkify (${(!CUtility.isServer && "Client") || "Server"}) | ${(state && "Launched") || "Launch failed"} ${(private.config.port && ("[Port: " + private.config.port + "]")) || ""}`)
    return true
}

// @Desc: Handles Connection Status
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
        onConnectionStatus(self, null, true)
    }
    else {
        var cResolver = false
        private.isAwaiting = new Promise((resolver) => cResolver = resolver)
        private.instance.CExpress = CExpress()
        private.instance.CHTTP = CHTTP.Server(private.instance.CExpress)
        private.instance.CExpress.use(CCors(private.config.cors))
        private.instance.CExpress.use(CExpress.json())
        private.instance.CExpress.use(CExpress.urlencoded({extended: true}))
        private.instance.CExpress.set("case sensitive routing", private.config.isCaseSensitive)
        // TODO: ADD THIS MIDDLEWARE
        //private.instance.CExpress.all("*", CServer.rest.onMiddleware)
        private.instance.CHTTP.listen(private.config.port, () => onConnectionStatus(self, cResolver, true))
        return true
    }
    return true
})

const test = CServer.public.create({
    port: 33021,
    isCaseSensitive: true
})
console.log(test)
test.public.connect()

const test2 = CServer.public.create({
    port: 33022,
    isCaseSensitive: true
})
test2.public.connect()


//////////////
// Exports //
//////////////

module.exports = CServer.public