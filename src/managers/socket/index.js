/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: socket: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CWS = require("ws")
const CUtility = require("../../utilities")
const CServer = require("../server")


////////////////////
// Class: Socket //
////////////////////

CServer.socket = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

CServer.socket.addMethod("isVoid", function(route) {
    return (CUtility.isString(route) && !CUtility.isObject(CServer.socket.buffer[route]) && true) || false
})

CServer.socket.addMethod("fetch", function(route) {
    return (!CServer.socket.isVoid(route) && CServer.socket.buffer[route]) || false
})

CServer.socket.addMethod("create", function(route) {
    if (!CServer.isConnected(true) || !CServer.socket.isVoid(route)) return false
    CServer.socket.buffer[route] = new CServer.socket(route)
    return CServer.socket.buffer[route]
})

CServer.socket.addMethod("destroy", function(route) {
    if (CServer.socket.isVoid(route)) return false
    CServer.socket.buffer[route].isUnloaded = true
    if (CUtility.isServer) {
        for (const i in CServer.socket.buffer[route].instance) {
            const j = CServer.socket.buffer[route].instance[i]
            for (const k in j.queue) {
                const v = j[k]
                v.reject()
            }
        }
        for (const i in CServer.socket.buffer[route].room) {
            CServer.socket.buffer[route].destroyRoom(i)
        }
    }
    for (const i in CServer.socket.buffer[route].network) {
        CServer.socket.buffer[route].destroyNetwork(i)
    }
    delete CServer.socket.buffer[route]
    return true
})


///////////////////////
// Instance Members //
///////////////////////

CServer.socket.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CServer.socket.isVoid(self.route) && true) || false
})

CServer.socket.addInstanceMethod("destroy", function(self) {
    self.server.close()
    for (const i in self.network) {
        const j = self.network[i]
        j.destroy()
    }
    CServer.socket.destroy(this.route)
    return true
})

if (!CUtility.isServer) {
    /////////////////////
    // Static Members //
    /////////////////////

    CServer.socket.addMethod("constructor", function(self, route) {
        CUtility.fetchVID(self)
        self.config = {
            isConnected: false
        }
        self.route = route
        self.queue = {}, self.network = {}, self.room = {}
        self.connect = function() {
            if (self.isConnected()) return false
            var cResolver = false
            self.config.isAwaiting = new Promise((resolver) => cResolver = resolver)
            self.server = new WebSocket(`${((CServer.config.protocol == "https") && "wss") || "ws"}://${CServer.config.hostname}:${CServer.config.port}/${self.route}`)
            self.server.onopen = function() {
                self.config.isAwaiting = null
                self.config.isConnected = true
                cResolver(self.config.isConnected)
                return true
            }
            self.server.onerror = function(error) {
                self.config.isConnected = false
                cResolver(self.config.isConnected, error)
                self.connect()
                return true
            }
            self.server.onmessage = function(payload) {
                payload = JSON.parse(payload.data)
                if (!CUtility.isObject(payload) || !CUtility.isString(payload.networkName) || !CUtility.isArray(payload.networkArgs)) return false
                if (CUtility.isObject(payload.networkCB)) {
                    payload.networkCB.isProcessed = true
                    const cNetwork = (self.isNetwork(payload.networkName) && self.network[(payload.networkName)]) || false
                    if (!cNetwork || !cNetwork.isCallback) {
                        // TODO: HANDLE THIS...?
                        console.log("Doesn't exists")
                        return false
                    }
                    payload.networkArgs = [cNetwork.handler.exec(...payload.networkArgs)]
                    self.server.send(JSON.stringify(payload))
                    return true
                }
                self.emit(payload.networkName, null, ...payload.networkArgs)
                return true
            }
            return true
        }
        self.connect()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    CServer.socket.addInstanceMethod("isConnected", function(self, isSync) {
        if (isSync) return (CUtility.isBool(self.config.isConnected) && self.config.isConnected) || false
        return self.config.isAwaiting || self.config.isConnected || false
    })
}
else {
    /////////////////////
    // Static Members //
    /////////////////////

    CServer.socket.addMethod("constructor", function(self, route) {
        CUtility.fetchVID(self)
        self.route = route, self.network = {}
        self.instance = {}, self.room = {}
        self.server = new CWS.Server({
            noServer: true,
            path: `/${self.route}`
        })
        CServer.instance.CHTTP.on("upgrade", function(request, socket, head) {
            self.server.handleUpgrade(request, socket, head, function(socket) {
                self.server.emit("onClientConnect", socket, request)
            })
        })
        self.server.on("onClientConnect", function(socket, request) {
            var [instance, query] = request.url.split("?")
            instance = CServer.socket.fetch(instance.slice(1))
            if (!instance) return false
            const vid = CUtility.fetchVID(socket)
            self.instance[vid] = socket
            socket.queue = {}, socket.room = {}
            query = CUtility.queryString.parse(query)
            if (CUtility.isFunction(self.onClientConnect)) self.onClientConnect(socket, vid)
            socket.onclose = function() {
                for (const i in socket.room) {
                    self.leaveRoom(i, socket)
                }
                delete self.instance[vid]
                if (CUtility.isFunction(self.onClientDisconnect)) self.onClientDisconnect(socket, vid)
                return true
            }
            socket.onmessage = function(payload) {
                payload = JSON.parse(payload.data)
                if (!CUtility.isObject(payload) || !CUtility.isString(payload.networkName) || !CUtility.isArray(payload.networkArgs)) return false
                if (CUtility.isObject(payload.networkCB)) return self.resolveCallback(socket, payload)
                self.emit(payload.networkName, null, ...payload.networkArgs)
                return true
            }
        })
    }, "isInstance")

    
    ///////////////////////
    // Instance Members //
    ///////////////////////

    CServer.socket.addInstanceMethod("isClient", function(self, client) {
        const vid = CUtility.fetchVID(client)
        return (vid && CUtility.isObject(self.instance[vid]) && true) || false
    })
}