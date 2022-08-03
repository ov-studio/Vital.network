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
const {onSocketInitialize, onSocketMessage} = require("./parser")


////////////////////
// Class: Socket //
////////////////////

CServer.socket = CUtility.createClass({
    buffer: {},
    heartbeat: {
        interval: 10000,
        timeout: 60000
    },
    reconnection: {
        attempts: -1,
        interval: 2500
    }
})


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies socket's validity
CServer.socket.addMethod("isVoid", function(route) {
    return (CUtility.isString(route) && !CUtility.isObject(CServer.socket.buffer[route]) && true) || false
})

// @Desc: Fetches socket instance by route
CServer.socket.addMethod("fetch", function(route) {
    return (!CServer.socket.isVoid(route) && CServer.socket.buffer[route]) || false
})

// @Desc: Fetches an array of existing sockets
CServer.socket.addMethod("fetchSockets", function() {
    const result = {}
    for (const i in CServer.socket.buffer) {
        if (CServer.socket.fetch(i)) result[i] = CServer.socket.buffer[i]
    }
    return result
})

// @Desc: Creates a fresh socket w/ specified route
CServer.socket.addMethod("create", function(route, ...cArgs) {
    if (!CServer.isConnected(true) || !CServer.socket.isVoid(route)) return false
    CServer.socket.buffer[route] = new CServer.socket(route, ...cArgs)
    return CServer.socket.buffer[route]
})

// @Desc: Destroys an existing socket by specified route
CServer.socket.addMethod("destroy", function(route) {
    if (CServer.socket.isVoid(route)) return false
    return CServer.socket.buffer[route].destroy()
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Destroys the instance
CServer.socket.addInstanceMethod("destroy", function(self, isFlush) {
    if (isFlush) {
        if (!CUtility.isServer) {
            for (const i in self.room) {
                delete self.room[i]
            }
        }
    }
    else {
        self["@disconnect-forced"] = true
        self["@disconnect-reason"] = `${(CUtility.isServer && "server") || "client"}-disconnected`
        for (const i in self.network) {
            const j = self.network[i]
            j.destroy()
        }
        clearTimeout(self.heartbeatTimer)
        clearTimeout(self.heartbeatTerminator)
        if (!CUtility.isServer) {
            clearTimeout(self.reconnectTimer)
        }
        else {
            for (const i in self.room) {
                self.destroyRoom(i)
            }
            for (const i in self.instance) {
                const j = self.instance[i]
                for (const k in j.queue) {
                    const v = j[k]
                    v.reject()
                }
                j.socket.send(CUtility.toBase64(JSON.stringify({["@disconnect-reason"]: self["@disconnect-reason"]})))
                j.socket.close()
            }
        }
        self.isUnloaded = true
        self.server.close()
        delete CServer.socket.buffer[(this.route)]
    }
    return true
})

if (!CUtility.isServer) {
    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Instance constructor
    CServer.socket.addMethod("constructor", function(self, route, options) {
        onSocketInitialize(self, route, options)
        var cResolver = false, reconCounter = 0
        var connect = false, reconnect = false
        connect = function(isReconnection) {
            if (!isReconnection && self.isConnected()) return false
            self.config.isAwaiting = self.config.isAwaiting || new Promise((resolver) => cResolver = resolver)
            self.server = new WebSocket(`${((CServer.config.protocol == "https") && "wss") || "ws"}://${CServer.config.hostname}${(CServer.config.port && (":" + CServer.config.port)) || ""}/${self.route}`)
            self.server.onopen = function() {
                reconCounter = 0
                delete self.config.isAwaiting
                self.config.isConnected = true
                if (self.reconnectTimer) {
                    clearTimeout(self.reconnectTimer)
                    delete self.reconnectTimer
                }
                cResolver(self.config.isConnected)
                return true
            }
            self.server.onclose = function() {
                self.destroy(true)
                const isReconnection = (!self.isUnloaded && !self["@disconnect-forced"] && reconnect()) || false
                if (!isReconnection) {
                    const reason = self["@disconnect-reason"] || (self.config.isConnected && "client-disconnected") || "server-nonexistent"
                    self.destroy()
                    self.config.isConnected = false
                    cResolver(self.config.isConnected)
                    CUtility.exec(self.onClientDisconnect, CUtility.fetchVID(self.server, null, true) || false, reason)
                }
                return true
            }
            self.server.onerror = function(error) {
                CUtility.exec(self.onConnectionError, error)
                return true
            }
            self.server.onmessage = function(payload) {
                return onSocketMessage(self, CUtility.fetchVID(self.server, null, true), self.server, payload)
            }
        }
        reconnect = function() {
            reconCounter += 1
            if (self.config.options.reconnection.attempts != -1) {
                if (reconCounter > self.config.options.reconnection.attempts) {
                    self["@disconnect-reason"] = "client-reconnection-expired"
                    return false
                }
            }
            self.reconnectTimer = setTimeout(function() {
                delete self.reconnectTimer
                CUtility.exec(self.onClientReconnect, CUtility.fetchVID(self.server, null, true) || false, reconCounter, self.config.options.reconnection.attempts)
                connect(true)
            }, self.config.options.reconnection.interval)
            return true
        }
        connect()
    })

    // @Desc: Retrieves connection's status of instance
    CServer.socket.addInstanceMethod("isConnected", function(self, isSync) {
        if (isSync) return (CUtility.isBool(self.config.isConnected) && self.config.isConnected) || false
        return self.config.isAwaiting || self.config.isConnected || false
    })
}
else {
    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Instance constructor
    CServer.socket.addMethod("constructor", function(self, route, options) {
        onSocketInitialize(self, route, options)
        var heartbeat = false, upgrade = false
        self.server = new CWS.Server({
            noServer: true,
            path: `/${self.route}`
        })
        setTimeout(function() {CUtility.exec(self.onServerConnect)}, 1)
        self.server.onclose = function() {
            const timestamp_start = self.config.timestamp, timestamp_end = new Date()
            const deltaTick = timestamp_end.getTime() - timestamp_start.getTime()
            self.destroy()
            CServer.instance.CHTTP.off("upgrade", upgrade)
            setTimeout(function() {CUtility.exec(self.onServerDisconnect, timestamp_start, timestamp_end, deltaTick)}, 1)
            return true
        }
        self.server.onerror = function(error) {
            CUtility.exec(self.onConnectionError, error)
            return true
        }
        self.server.on("close", self.server.onclose)
        self.server.on("error", self.server.onerror)
        heartbeat = function(instance) {
            instance.socket.send(CUtility.toBase64(JSON.stringify({heartbeat: true})))
            return true
        }
        upgrade = function(request, socket, head) {
            self.server.handleUpgrade(request, socket, head, function(socket) {
                var [instance, query] = request.url.split("?")
                instance = CServer.socket.fetch(instance.slice(1))
                if (!instance) return false
                const clientInstance = CServer.socket.client.create(socket)
                const client = CUtility.fetchVID(clientInstance, null, true)
                self.instance[client] = clientInstance
                clientInstance.queue = {}, clientInstance.room = {}
                query = CUtility.queryString.parse(query)
                clientInstance.socket.send(CUtility.toBase64(JSON.stringify({client: client})))
                heartbeat(clientInstance)
                CUtility.exec(self.onClientConnect, client)
                clientInstance.socket.onclose = function() {
                    const reason = self.instance[client]["@disconnect-reason"] || self["@disconnect-reason"] || "client-disconnected"
                    for (const i in clientInstance.socket.room) {
                        self.leaveRoom(i, client)
                    }
                    clientInstance.destroy()
                    delete self.instance[client]
                    CUtility.exec(self.onClientDisconnect, client, reason)
                    return true
                }
                clientInstance.socket.onmessage = function(payload) {
                    return onSocketMessage(self, client, clientInstance.socket, payload)
                }
            })
            return true
        }
        CServer.instance.CHTTP.on("upgrade", upgrade)
    })

    // @Desc: Verifies client's validity
    CServer.socket.addInstanceMethod("isClient", function(self, client) {
        return (CServer.socket.client.fetch(client) && self.instance[client] && true) || false
    })

    // @Desc: Fetches an array of existing clients
    CServer.socket.addInstanceMethod("fetchClients", function(self) {
        const result = []
        for (const i in self.instance) {
            if (self.isClient(i)) result.push(i)
        }
        return result
    })
}