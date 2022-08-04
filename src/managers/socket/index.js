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
const CNetwork = require("../../utilities/network")
const {onSocketInitialize, onSocketMessage} = require("./parser")


////////////////////
// Class: Socket //
////////////////////

CNetwork.fetch("vNetworkify:Server:onConnect").on(function(server) {
    const CSocket = CUtility.createClass()
    server.public.socket = CSocket.public
    CSocket.private.buffer = {}
    CSocket.private.heartbeat = {interval: 10000, timeout: 60000}
    CSocket.private.reconnection = {attempts: -1, interval: 2500}

    CNetwork.fetch("vNetworkify:Server:onDisconnect").on(function(__server) {
        if ((server.public != __server.public) || (server.private != __server.private)) return false
        for (const i in CSocket.private.buffer[route]) {
            CSocket.private.buffer[route][i].destroy()
        }
        CSocket.private.isUnloaded = true
        delete server.public.socket
    })


    /////////////////////
    // Static Members //
    /////////////////////

    // @Desc: Verifies socket's validity
    CSocket.public.addMethod("isVoid", function(route) {
        if (CSocket.private.isUnloaded) return false
        return (CUtility.isString(route) && !CSocket.private.buffer[route] && true) || false
    })

    // @Desc: Fetches socket instance by route
    CSocket.public.addMethod("fetch", function(route) {
        if (CSocket.private.isUnloaded) return false
        return (!CSocket.public.isVoid(route) && CSocket.private.buffer[route]) || false
    })

    // @Desc: Fetches an array of existing sockets
    CSocket.public.addMethod("fetchSockets", function() {
        if (CSocket.private.isUnloaded) return false
        const result = {}
        for (const i in CSocket.private.buffer) {
            if (CSocket.public.fetch(i)) result[i] = CSocket.private.buffer[i]
        }
        return result
    })

    // @Desc: Creates a fresh socket w/ specified route
    CSocket.public.addMethod("create", function(route, ...cArgs) {
        if (CSocket.private.isUnloaded) return false
        if (!CSocket.public.isVoid(route)) return false
        CSocket.private.buffer[route] = CSocket.public.createInstance(route, ...cArgs)
        return CSocket.private.buffer[route]
    })

    // @Desc: Destroys an existing socket by specified route
    CSocket.public.addMethod("destroy", function(route) {
        if (CSocket.private.isUnloaded) return false
        if (CSocket.public.isVoid(route)) return false
        return CSocket.private.buffer[route].destroy()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Destroys the instance
    CSocket.public.addInstanceMethod("destroy", function(self, isFlush) {
        if (CSocket.private.isUnloaded) return false
        const private = CSocket.instance.get(self)
        if (isFlush) {
            if (!CUtility.isServer) {
                for (const i in private.room) {
                    delete private.room[i]
                }
            }
        }
        else {
            private["@disconnect-forced"] = true
            private["@disconnect-reason"] = `${(CUtility.isServer && "server") || "client"}-disconnected`
            for (const i in private.network) {
                private.network[i].destroy()
            }
            for (const i in private.timers) {
                clearTimeout(private.timers[i])
            }
            if (CUtility.isServer) {
                for (const i in private.room) {
                    self.destroyRoom(i)
                }
                for (const i in private.instance) {
                    const j = private.instance[i]
                    for (const k in j.queue) {
                        const v = j[k]
                        v.reject()
                    }
                    j.socket.send(CUtility.toBase64(JSON.stringify({["@disconnect-reason"]: private["@disconnect-reason"]})))
                    j.socket.close()
                }
            }
            private.server.close()
            delete CSocket.private.buffer[(this.route)]
            self.destroyInstance()
        }
        return true
    })

    if (!CUtility.isServer) {
        ///////////////////////
        // Instance Members //
        ///////////////////////

        // @Desc: Instance constructor
        CSocket.public.addMethod("constructor", function(self, route, options) {
            if (CSocket.private.isUnloaded) return false
            const private = CSocket.instance.get(self)
            onSocketInitialize(self, route, options)
            var cResolver = false, reconCounter = 0
            var connect = false, reconnect = false
            connect = function(isReconnection) {
                if (!isReconnection && self.isConnected()) return false
                private.isAwaiting = private.isAwaiting || new Promise((resolver) => cResolver = resolver)
                self.server = new WebSocket(`${((server.private.config.protocol == "https") && "wss") || "ws"}://${server.private.config.hostname}${(server.private.config.port && (":" + server.private.config.port)) || ""}/${self.route}`)
                self.server.onopen = function() {
                    reconCounter = 0
                    delete private.isAwaiting
                    private.isConnected = true
                    if (self.reconnectTimer) {
                        clearTimeout(self.reconnectTimer)
                        delete self.reconnectTimer
                    }
                    cResolver(private.isConnected)
                    return true
                }
                self.server.onclose = function() {
                    self.destroy(true)
                    const isReconnection = (!private["@disconnect-forced"] && reconnect()) || false
                    if (!isReconnection) {
                        const reason = private["@disconnect-reason"] || (private.isConnected && "client-disconnected") || "server-nonexistent"
                        self.destroy()
                        private.isConnected = false
                        cResolver(private.isConnected)
                        CUtility.exec(self.onClientDisconnect, CUtility.vid.fetch(self.server, null, true) || false, reason)
                    }
                    return true
                }
                self.server.onerror = function(error) {
                    CUtility.exec(self.onConnectionError, error)
                    return true
                }
                self.server.onmessage = function(payload) {
                    return onSocketMessage(self, CUtility.vid.fetch(self.server, null, true), self.server, payload)
                }
            }
            reconnect = function() {
                reconCounter += 1
                if (private.options.reconnection.attempts != -1) {
                    if (reconCounter > private.options.reconnection.attempts) {
                        private["@disconnect-reason"] = "client-reconnection-expired"
                        return false
                    }
                }
                self.reconnectTimer = setTimeout(function() {
                    delete self.reconnectTimer
                    CUtility.exec(self.onClientReconnect, CUtility.vid.fetch(self.server, null, true) || false, reconCounter, private.options.reconnection.attempts)
                    connect(true)
                }, private.options.reconnection.interval)
                return true
            }
            connect()
        })

        // @Desc: Retrieves connection's status of instance
        CSocket.public.addInstanceMethod("isConnected", function(self, isSync) {
            if (isSync) return (CUtility.isBool(private.isConnected) && private.isConnected) || false
            return private.isAwaiting || private.isConnected || false
        })
    }
    else {
        ///////////////////////
        // Instance Members //
        ///////////////////////

        // @Desc: Instance constructor
        CSocket.public.addMethod("constructor", function(self, route, options) {
            if (CSocket.private.isUnloaded) return false
            console.log("CALLED")
            onSocketInitialize(self, route, options)
            var heartbeat = false, upgrade = false
            self.server = new CWS.Server({
                noServer: true,
                path: `/${self.route}`
            })
            setTimeout(function() {CUtility.exec(self.onServerConnect)}, 1)
            self.server.onclose = function() {
                const timestamp_start = private.timestamp, timestamp_end = new Date()
                const deltaTick = timestamp_end.getTime() - timestamp_start.getTime()
                self.destroy()
                server.private.instance.CHTTP.off("upgrade", upgrade)
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
                    instance = CSocket.public.fetch(instance.slice(1))
                    if (!instance) return false
                    const clientInstance = CSocket.public.client.create(socket)
                    const client = CUtility.vid.fetch(clientInstance, null, true)
                    self.instance[client] = clientInstance
                    clientInstance.queue = {}, clientInstance.room = {}
                    query = CUtility.queryString.parse(query)
                    if (!query.version || (query.version != CUtility.version)) {
                        console.log("TODO: CLOSE CONNECTION DUE TO VERSION MISMATCH")
                        console.log(query)
                    }
                    clientInstance.socket.send(CUtility.toBase64(JSON.stringify({client: client})))
                    heartbeat(clientInstance)
                    CUtility.exec(self.onClientConnect, client)
                    clientInstance.socket.onclose = function() {
                        const reason = self.instance[client]["@disconnect-reason"] || private["@disconnect-reason"] || "client-disconnected"
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
            server.private.instance.CHTTP.on("upgrade", upgrade)
        })

        // @Desc: Verifies client's validity
        CSocket.public.addInstanceMethod("isClient", function(self, client) {
            if (CSocket.private.isUnloaded) return false
            return (CSocket.public.client.fetch(client) && self.instance[client] && true) || false
        })

        // @Desc: Fetches an array of existing clients
        CSocket.public.addInstanceMethod("fetchClients", function(self) {
            if (CSocket.private.isUnloaded) return false
            const result = []
            for (const i in self.instance) {
                if (self.isClient(i)) result.push(i)
            }
            return result
        })
    }
})