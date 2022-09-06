/*----------------------------------------------------------------
     Resource: Vital.network
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
const CHTTPS = require("https")
const CExpress = require("express")
const CCompression = require("compression")
const CNetwork = require("@vstudio/vital.kit/src/network")


////////////////////
// Class: Server //
///////////////////

const CServer = vKit.Class()
CNetwork.create("vNetwork:Server:onConnect")
CNetwork.create("vNetwork:Server:onDisconnect")


/////////////////////
// Static Members //
/////////////////////

// @Desc: Creates a fresh server
CServer.public.addMethod("create", (...cArgs) => CServer.public.createInstance(...cArgs))

// @Desc: Handles connection's status
CServer.private.onConnectionStatus = (self, state) => {
    const private = CServer.instance.get(self)
    private.isConnected = state
    vKit.print(`━ vNetwork (${(!vKit.isServer && "Client") || "Server"}) | ${(state && "Launched") || "Launch failed"} ${(private.config.port && ("[Port: " + private.config.port + "]")) || "" } [Version: ${vKit.fromBase64(vKit.version)}]`)
    if (private.isConnected) CNetwork.emit("vNetwork:Server:onConnect", {public: self, private: private})
    vKit.scheduleExec(() => {
        delete private.isAwaiting
        vKit.exec(private.resolver, private.isConnected)
    }, 1)
    return true
}

// @Desc: Initializes a HTTP instance
CServer.private.onHTTPInitialize = (http) => {
    http.post = (route, data) => {
        if (!vKit.isString(route) || !vKit.isObject(data)) return false
        return vKit.fetch(route, {
            method: "POST",
            headers: {["Content-Type"]: "application/json"},
            body: JSON.stringify(data)
        })
    }
    http.get = (route) => {
        if (!vKit.isString(route)) return false
        return vKit.fetch(route, {
            method: "GET"
        })
    }
    http.put = (route, data) => {
        if (!vKit.isString(route) || !vKit.isObject(data)) return false
        return vKit.fetch(route, {
            method: "PUT",
            headers: {["Content-Type"]: "application/json"},
            body: JSON.stringify(data)
        })
    }
    http.delete = (route) => {
        if (!vKit.isString(route)) return false
        return vKit.fetch(route, {
            method: "DELETE"
        })
    }
    return true
}

if (vKit.isServer) {
    // @Desc: Sets/Revokes SSL Cert
    CServer.public.addMethod("setSSLCert", (sslcert) => {
        if (sslcert && !vKit.isObject(sslcert)) return false
        if (!sslcert) delete CServer.private.sslcert
        else CServer.private.sslcert = sslcert
        return true
    })
}


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CServer.public.addMethod("constructor", (self, options) => {
    const private = CServer.instance.get(self)
    options = (vKit.isObject(options) && options) || {}
    private.config = {}, private.instance = {}
    private.config.port = (vKit.isNumber(options.port) && options.port) || false
    private.healthpoint = "vhealth"
    if (!vKit.isServer) {
        private.config.protocol = (options.isSSL && "https") || "http"
        private.config.hostname = (vKit.isString(options.hostname) && options.hostname) || window.location.hostname
        private.healthpoint = `${private.config.protocol}://${private.config.hostname}${(private.config.port && (":" + private.config.port)) || ""}/${private.healthpoint}`
    }
    else {
        private.config.isCaseSensitive = (options.isCaseSensitive && true) || false
        private.config.cors = (vKit.isObject(options.cors) && options.cors) || false
    }
})

// @Desc: Destroys the instance
CServer.public.addInstanceMethod("destroy", (self) => {
    const private = CServer.instance.get(self)
    if (self.isConnected(true)) CNetwork.emit("vNetwork:Server:onDisconnect", {public: self, private: private})
    if (vKit.isServer) private.instance.http.close()
    self.destroyInstance()
    return true
})

// @Desc: Retrieves instance's config
CServer.public.addInstanceMethod("fetchConfig", (self) => CServer.instance.get(self).config)

// @Desc: Retrieves instance's server
CServer.public.addInstanceMethod("fetchServer", (self, index) => (index && private.instance[index]) || false)

// @Desc: Retrieves connection's status
CServer.public.addInstanceMethod("isConnected", (self, isSync, fetchHealth) => {
    const private = CServer.instance.get(self)
    if (isSync) return (vKit.isBool(private.isConnected) && private.isConnected) || false
    if (!vKit.isServer && fetchHealth) {
        let resolver = null
        const cHealth = new Promise((__resolver) => resolver = __resolver)
        if (!private.instance.http) {
            private.instance.http = {}
            CServer.private.onHTTPInitialize(private.instance.http)
        }
        vKit.scheduleExec(async () => {
            var isServerHealthy = false
            try {
                isServerHealthy = await private.instance.http.get(private.healthpoint)
                isServerHealthy = JSON.parse(isServerHealthy)
                isServerHealthy = (isServerHealthy && (isServerHealthy.status == true)) || false
            }
            catch(error) {}
            resolver(isServerHealthy)
        }, 1)
        return cHealth
    }
    return private.isAwaiting || private.isConnected || false
})

// @Desc: Connects the server
CServer.public.addInstanceMethod("connect", async (self) => {
    const isConnected = self.isConnected()
    if (!vKit.isBool(isConnected)) return isConnected
    const private = CServer.instance.get(self)
    private.isAwaiting = new Promise((resolver) => private.resolver = resolver)
    if (!vKit.isServer) {
        var isServerHealthy = await self.isConnected(null, true)
        CServer.private.onConnectionStatus(self, isServerHealthy)
    }
    else {
        private.instance.express = CExpress()
        private.instance.http = (CServer.private.sslcert && CHTTPS.Server(CServer.private.sslcert, private.instance.express)) || CHTTP.Server(private.instance.express)
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