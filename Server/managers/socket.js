
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

    static create = function(route) {
        if (!CServer.isConnected() || !CServer.socket.isVoid(route)) return false
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
        self.uid = CUtility.genUID.v4()
        self.route = route, self.network = {}
        self.instance = {}, self.room = {}
        self.server = new CWS.Server({
            noServer: true,
            path: `/${self.route}`
        })
        self.server.on("connection", function(socket, request) {
            socket.uid = CUtility.genUID.v4()
            self.instance[socket] = {
                uid: socket.uid
            }
        })
        CServer.instance.CHTTP.on("upgrade", function(request, socket, head) {
            self.server.handleUpgrade(request, socket, head, function(socket) {
                self.server.emit("connection", socket, request)
            })
        })
        self.server.on("connection", function(socket, request) {
            var [_, query] = request.url.split("?")
            query = CUtility.queryString.parse(query)
            socket.on("message", function(payload) {
                payload = JSON.parse(payload)
                if (!CUtility.isObject(payload) || !CUtility.isArray(payload.processArgs)) return false
                CServer.network.emit(payload.networkName, ...(payload.processArgs))
            })
        })
    }

    isInstance() {
        const self = this
        return (!self.isUnloaded && !CServer.socket.isVoid(self.route) && true) || false
    }

    destroy() {
        const self = this
        if (!self.isInstance()) return false
        CServer.socket.destroy(this.route)
        self.server.close()
        //TODO: DESTROY NETWORKS..
        return true
    }

    isNetwork(name) {
        const self = this
        if (!self.isInstance()) return false
        return (CUtility.isString(name) && CUtility.isObject(self.network[name]) && self.network[name].isInstance() && true) || false
    }

    createNetwork(name) {
        const self = this
        if (!self.isInstance() || self.isNetwork(name)) return false
        self.network[name] = CServer.network.create(`Socket:${self.uid}:${name}`)
        return self.network[name]
    }

    destroyNetwork(name) {
        const self = this
        if (!self.isInstance() || !self.isNetwork(name)) return false
        self.network[name].destroy()
        return true
    }
}
CServer.socket = CSocket