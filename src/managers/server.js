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
const CCompression = require("compression")
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
CServer.public.addMethod("create", (...cArgs) => CServer.public.createInstance(...cArgs))

// @Desc: Handles connection's status
CServer.private.onConnectionStatus = (self, state) => {
    const private = CServer.instance.get(self)
    private.isConnected = state
    CUtility.print(`━ vNetworkify (${(!CUtility.isServer && "Client") || "Server"}) | ${(state && "Launched") || "Launch failed"} ${(private.config.port && ("[Port: " + private.config.port + "]")) || "" } [Version: ${CUtility.fromBase64(CUtility.version)}]`)
    if (private.isConnected) CNetwork.emit("vNetworkify:Server:onConnect", {public: self, private: private})
    CUtility.scheduleExec(() => {
        delete private.isAwaiting
        CUtility.exec(private.resolver, private.isConnected)
    }, 1)
    return true
}

// @Desc: Initializes a HTTP instance
CServer.private.onHTTPInitialize = (http) => {
    http.post = (route, data) => {
        if (!CUtility.isString(route) || !CUtility.isObject(data)) return false
        return CUtility.fetch(route, {
            method: "POST",
            headers: {["Content-Type"]: "application/json"},
            body: JSON.stringify(data)
        })
    }
    http.get = (route) => {
        if (!CUtility.isString(route)) return false
        return CUtility.fetch(route, {
            method: "GET"
        })
    }
    http.put = (route, data) => {
        if (!CUtility.isString(route) || !CUtility.isObject(data)) return false
        return CUtility.fetch(route, {
            method: "PUT",
            headers: {["Content-Type"]: "application/json"},
            body: JSON.stringify(data)
        })
    }
    http.delete = (route) => {
        if (!CUtility.isString(route)) return false
        return CUtility.fetch(route, {
            method: "DELETE"
        })
    }
    return true
}


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CServer.public.addMethod("constructor", (self, options) => {
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
CServer.public.addInstanceMethod("destroy", (self) => {
    const private = CServer.instance.get(self)
    if (self.isConnected(true)) CNetwork.emit("vNetworkify:Server:onDisconnect", {public: self, private: private})
    if (CUtility.isServer) private.instance.http.close()
    self.destroyInstance()
    return true
})

// @Desc: Retrieves instance's config
CServer.public.addInstanceMethod("fetchConfig", (self) => CServer.instance.get(self).config)

// @Desc: Retrieves instance's server
CServer.public.addInstanceMethod("fetchServer", (self, index) => (index && private.instance[index]) || false)

// @Desc: Retrieves connection's status
CServer.public.addInstanceMethod("isConnected", (self, isSync) => {
    const private = CServer.instance.get(self)
    if (isSync) return (CUtility.isBool(private.isConnected) && private.isConnected) || false
    return private.isAwaiting || private.isConnected || false
})

// @Desc: Connects the server
CServer.public.addInstanceMethod("connect", async (self) => {
    const isConnected = self.isConnected()
    if (!CUtility.isBool(isConnected)) return isConnected
    const private = CServer.instance.get(self)
    private.isAwaiting = new Promise((resolver) => private.resolver = resolver)
    if (!CUtility.isServer) {
        var isConnectionAccepted = false
        if (!private.instance.http) {
            private.instance.http = {}
            CServer.private.onHTTPInitialize(private.instance.http)
        }
        try {
            var isServerHealthy = await private.instance.http.get(private.healthpoint)
            isServerHealthy = JSON.parse(isServerHealthy)
            if (isServerHealthy && (isServerHealthy.status == true)) isConnectionAccepted = true
        }
        catch(error) {}
        CServer.private.onConnectionStatus(self, isConnectionAccepted)
    }
    else {
        private.instance.express = CExpress()
        private.instance.http = CHTTPS.Server(CServer.private.sslcert, private.instance.express)
        CServer.private.onHTTPInitialize(private.instance.http)
        private.instance.express.use(CCors(private.config.cors))
        private.instance.express.use(CCompression())
        private.instance.express.use(CExpress.json())
        private.instance.express.use(CExpress.urlencoded({extended: true}))
        private.instance.express.set("case sensitive routing", private.config.isCaseSensitive)
        private.instance.http.listen(private.config.port, () => {
            CServer.private.onConnectionStatus(self, true)
            self.rest.create("get", private.healthpoint, (request, response) => response.status(200).send({status: true}))
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