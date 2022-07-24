
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: managars: socket.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket Manager
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

const CWS = require("ws")
const CUtility = require("../utilities")
const CServer = require("./server")(true)


/*-----------------
-- Class: Socket --
-----------------*/

class CSocket {
    /////////////////////
    // Static Mmebers //
    ////////////////////

    static isClass = true
    static buffer = {}

    static isVoid = function(route) {
        return (CUtility.isString(route) && !CUtility.isObject(CServer.socket.buffer[route]) && true) || false
    }

    static fetch = function(route) {
        return (!CServer.socket.isVoid(route) && CServer.socket.buffer[route]) || false
    }

    static create = function(route) {
        if (!CServer.isConnected(true) || !CServer.socket.isVoid(route)) return false
        CServer.socket.buffer[route] = new CServer.socket(route)
        return CServer.socket.buffer[route]
    }

    static destroy = function(route) {
        if (CServer.socket.isVoid(route)) return false
        CServer.socket.buffer[route].isUnloaded = true
        delete CServer.socket.buffer[route]
        return true
    }


    ///////////////////////
    // Instance Mmebers //
    //////////////////////

    constructor(route) {
        const self = this
        CUtility.fetchVID(this)
        self.route = route, self.network = {}
        self.instance = {}, self.room = {}
        self.server = new CWS.Server({
            noServer: true,
            path: `/${self.route}`
        })
        self.server.on("connection", function(socket, request) {
            const vid = CUtility.fetchVID(socket)
            self.instance[vid] = socket
        })
        CServer.instance.CHTTP.on("upgrade", function(request, socket, head) {
            self.server.handleUpgrade(request, socket, head, function(socket) {
                self.server.emit("connection", socket, request)
            })
        })
        self.server.on("connection", function(socket, request) {
            var [instance, query] = request.url.split("?")
            instance = CServer.socket.fetch(instance.slice(1))
            if (!instance) return false
            query = CUtility.queryString.parse(query)
            socket.on("message", function(payload) {
                payload = JSON.parse(payload)
                if (!CUtility.isObject(payload) || !CUtility.isString(payload.networkName) || !CUtility.isArray(payload.processArgs)) return false
                self.emit(payload.networkName, null, ...payload.processArgs)
            })
        })
    }

    isInstance() {
        const self = this
        return (!self.isUnloaded && !CServer.socket.isVoid(self.route) && true) || false
    }

    isClient(client) {
        const self = this
        if (!self.isInstance()) return false
        const vid = CUtility.fetchVID(client)
        return (vid && CUtility.isObject(self.instance[vid]) && true) || false
    }

    destroy() {
        const self = this
        if (!self.isInstance()) return false
        self.server.close()
        for (const i in self.network) {
            const j = self.network[i]
            j.destroy()
        }
        CServer.socket.destroy(this.route)
        return true
    }

    isNetwork(name) {
        const self = this
        if (!self.isInstance()) return false
        return (CUtility.isString(name) && CUtility.isObject(self.network[name]) && self.network[name].isInstance() && true) || false
    }

    #fetchNetwork(name) {
        const self = this
        return (self.isNetwork(name) && self.network[name]) || false
    }

    createNetwork(name, ...cArgs) {
        const self = this
        if (!self.isInstance() || self.isNetwork(name)) return false
        self.network[name] = CServer.network.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
        return true
    }

    destroyNetwork(name) {
        const self = this
        if (!self.isInstance() || !self.isNetwork(name)) return false
        self.network[name].destroy()
        return true
    }

    on(name, ...cArgs) {
        const self = this
        const cNetwork = self.#fetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.on(...cArgs)
    }

    off(name, ...cArgs) {
        const self = this
        const cNetwork = self.#fetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.off(...cArgs)
    }

    emit(name, client, ...cArgs) {
        const self = this
        const cNetwork = self.#fetchNetwork(name)
        if (!cNetwork) return false
        if (client) {
            if (!self.isClient(socket)) return false
            // TODO: ADD REMOTE TRANSFER
            return true
        }
        return cNetwork.emit(...cArgs)
    }
}
CServer.socket = CSocket