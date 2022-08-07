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
const CHTTPS = require("https")
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
    CUtility.print(`━ vNetworkify (${(!CUtility.isServer && "Client") || "Server"}) | ${(state && "Launched") || "Launch failed"} ${(private.config.port && ("[Port: " + private.config.port + "]")) || "" } [Version: ${CUtility.fromBase64(CUtility.version)}]`)
    if (private.isConnected) CNetwork.emit("vNetworkify:Server:onConnect", {public: self, private: private})
    CUtility.exec(private.resolver, private.isConnected)
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
    private.healthpoint = "vhealth"
    if (!CUtility.isServer) {
        private.config.protocol = (options.isSSL && "https") || "http"
        private.config.hostname = (CUtility.isString(options.hostname) && options.hostname) || window.location.hostname
        private.healthpoint = `${private.config.protocol}://${private.config.hostname}${(private.config.port && (":" + private.config.port)) || ""}/${private.healthpoint}`
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
    if (CUtility.isServer) private.instance.https.close()
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
CServer.private.onHTTPInitialize = function(http) {
    if (!CUtility.isServer) {
        http.post = function(route, data) {
            if (!CUtility.isString(route) || !CUtility.isObject(data)) return false
            return fetch(route, {
                method: "POST",
                headers: {["Content-Type"]: "application/json"},
                body: JSON.stringify(data)
            })
        },
        http.get = function(route) {
            if (!CUtility.isString(route)) return false
            return fetch(route, {
                method: "GET"
            })
        },
        http.put = function(route, data) {
            if (!CUtility.isString(route) || !CUtility.isObject(data)) return false
            return fetch(route, {
                method: "PUT",
                headers: {["Content-Type"]: "application/json"},
                body: JSON.stringify(data)
            })
        },
        http.delete = function(route) {
            if (!CUtility.isString(route)) return false
            return fetch(route, {
                method: "DELETE"
            })
        }
    } else {
        /*
        const [route] = [...cArgs]
        if (!CUtility.isString(route)) return false
        var resolver, reject = new Promise((resolver, reject) => {
            resolver = resolver
            reject = reject
        })
        const request = server.private.instance.https.request(route, (response) => {
            let data = "";
            response.on("data", (chunk) => data = data + chunk.toString())
            response.on("end", () => {
                const body = JSON.parse(data);
                console.log(body);
            });
        })
        request.on("error", (error) => reject(error))
        request.end()
        */
    }
    return true
}

CServer.public.addInstanceMethod("connect", async function(self) {
    const isConnected = self.isConnected()
    if (!CUtility.isBool(isConnected)) return isConnected
    const private = CServer.instance.get(self)
    private.isAwaiting = new Promise((resolver) => private.resolver = resolver)
    if (!CUtility.isServer) {
        private.instance.https = private.instance.https || {
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
        var isConnectionAccepted = false
        try {
            var isServerHealthy = await private.instance.CExpress.get(private.healthpoint)
            isServerHealthy = await isServerHealthy.json()
            if (isServerHealthy && (isServerHealthy.status == true)) isConnectionAccepted = true
        }
        catch(error) {}
        CServer.private.onConnectionStatus(self, isConnectionAccepted)
    }
    else {
        private.instance.CExpress = CExpress()
        private.instance.https = CHTTPS.Server(private.instance.CExpress)
        private.instance.https.request = https.request
        CServer.private.onHTTPInitialize(private.instance.https)
        private.instance.CExpress.use(CCors(private.config.cors))
        private.instance.CExpress.use(CExpress.json())
        private.instance.CExpress.use(CExpress.urlencoded({extended: true}))
        private.instance.CExpress.set("case sensitive routing", private.config.isCaseSensitive)
        private.instance.https.listen(private.config.port, function() {
            CServer.private.onConnectionStatus(self, true)
            self.rest.create("get", private.healthpoint, function(request, response) {
                response.status(200).send({status: true})
            })
        })
        .on("error", () => CServer.private.onConnectionStatus(self, false))
    }
    return private.isAwaiting
})


//////////////
// Exports //
//////////////

module.exports = CServer.public
require("./rest")
require("./socket/")