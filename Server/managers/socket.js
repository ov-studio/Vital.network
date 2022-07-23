
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


/*------------------
-- Class: CSocket --
------------------*/

class CSocket {
    /////////////////////
    // Static Mmebers //
    ////////////////////

    static route = {}

    static isVoid(route) {
        return (CUtility.isString(route) && !CUtility.isObject(CServer.socket.route[route]) && true) || false
    }

    static create(route) {
        if (!CServer.isConnected() || !CServer.socket.isVoid(route)) return false
        CServer.socket.route[route] = new CServer.socket(route)
        return true
    }

    static destroy(route) {
        if (CServer.socket.isVoid(route)) return false
        CServer.socket.route[route].isUnloaded = true
        delete CServer.socket.route[route]
        return true
    }


    ///////////////////////
    // Instance Mmebers //
    //////////////////////

    constructor(route) {
        const self = this
        self.route = route
        self.instance = {}, self.network = {}, self.room = {}
        self.server = new CWS.Server({
            noServer: true,
            path: "/" + self.route
        })
        self.server.on("connection", function(socket, request) {
            socket.UID = CUtility.genUID.v4()
            self.instance[socket] = {
                UID: socket.UID
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
            socket.on("message", function(data) {
                data = JSON.parse(data)
                socket.send(JSON.stringify({message: "There be gold in them thar hills."}))
            })
        })
    }

    isValid() {
        const self = this
        return (!self.isUnloaded && self.route && CSocket.route[(self.route)] && true) || false
    }

    isNetwork(name) {
        const self = this
        return (self.isValid() && CUtility.isString(name) && self.network[name]) || false
    }

    createNetwork(name) {
        const self = this
        if (self.isNetwork(name)) return false
        self.network[name] = {
            handlers: {}
        }
        return true
    }

    destroyNetwork(name) {
        const self = this
        if (!self.isNetwork(name)) return false
        delete self.network[name]
        return true
    }

    on(name, exec) {
        const self = this
        if (!self.isNetwork(name) || !CUtility.isFunction(exec) || self.network[name].handlers[exec]) return false
        self.network[name].handlers[exec] = {}
        return true
    }

    destroy() {
        const self = this
        if (!self.isValid()) return false
        CServer.socket.destroy(this.route)
        self.server.close()
        return true
    }
}
CServer.socket = CSocket