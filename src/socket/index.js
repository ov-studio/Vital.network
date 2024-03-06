/*----------------------------------------------------------------
     Resource: Vital.network
     Script: socket: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CWS = require("ws")
const CNetwork = require("@vstudio/vital.kit/src/network")
const {onSocketInitialize, onSocketHeartbeat, onSocketMessage} = require("./parser")


////////////////////
// Class: Socket //
////////////////////

CNetwork.create("vNetwork:Socket:onCreate")
CNetwork.create("vNetwork:Socket:onDestroy")
CNetwork.fetch("vNetwork:Server:onConnect").on(function(server) {
    const CSocket = vKit.Class()
    server.public.socket = CSocket.public
    CSocket.private.buffer = {}
    CNetwork.fetch("vNetwork:Server:onDisconnect").on(function(__server) {
        if ((server.public != __server.public) || (server.private != __server.private)) return
        for (const i in CSocket.private.buffer) {
            CSocket.private.buffer[i].destroy()
        }
        CSocket.private.isUnloaded = true
        delete server.public.socket
    })


    /////////////////////
    // Static Members //
    /////////////////////

    // @Desc: Disconnects instance
    CSocket.private.onDisconnectInstance = (instance, reason, isForced) => {
        if (CSocket.private.isUnloaded) return false
        instance["@disconnect"] = instance["@disconnect"] || {}
        instance["@disconnect"].isForced = (isForced && true) || false
        instance["@disconnect"].reason = reason
        return true
    }

    // @Desc: Verifies socket's validity
    CSocket.public.addMethod("isVoid", (route) => {
        if (CSocket.private.isUnloaded) return false
        return (vKit.isString(route) && !CSocket.private.buffer[route] && true) || false
    })

    // @Desc: Fetches socket instance by route
    CSocket.public.addMethod("fetch", (route) => {
        if (CSocket.private.isUnloaded) return false
        return (!CSocket.public.isVoid(route) && CSocket.private.buffer[route]) || false
    })

    // @Desc: Fetches an array of existing sockets
    CSocket.public.addMethod("fetchSockets", () => {
        if (CSocket.private.isUnloaded) return false
        const result = {}
        for (const i in CSocket.private.buffer) {
            if (CSocket.public.fetch(i)) result[i] = CSocket.private.buffer[i]
        }
        return result
    })

    // @Desc: Creates a fresh socket w/ specified route
    CSocket.public.addMethod("create", (route, ...cArgs) => {
        if (CSocket.private.isUnloaded) return false
        if (!CSocket.public.isVoid(route)) return false
        CSocket.private.buffer[route] = CSocket.public.createInstance(route, ...cArgs)
        CNetwork.emit("vNetwork:Socket:onCreate", {public: CSocket.private.buffer[route], private: CSocket.instance.get(CSocket.private.buffer[route])})
        return CSocket.private.buffer[route]
    })

    // @Desc: Destroys an existing socket by specified route
    CSocket.public.addMethod("destroy", (route) => {
        if (CSocket.private.isUnloaded) return false
        if (CSocket.public.isVoid(route)) return false
        return CSocket.private.buffer[route].destroy()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Destroys the instance
    CSocket.public.addInstanceMethod("destroy", (self, isFlush) => {
        if (CSocket.private.isUnloaded) return false
        const private = CSocket.instance.get(self)
        for (const i in private.timer) {
            clearTimeout(private.timer[i])
            delete private.timer[i]
        }
        if (isFlush) {
            if (!vKit.server) {
                delete private["@heartbeat"]
                for (const i in private.room) {
                    delete private.room[i]
                }
            }
        }
        else {
            CSocket.private.onDisconnectInstance(private, `${(vKit.server && "server") || "client"}-disconnected`, true)
            CNetwork.emit("vNetwork:Socket:onDestroy", {public: self, private: private})
            private.server.close()
            delete CSocket.private.buffer[(private.route)]
            self.destroyInstance()
        }
        return true
    })

    // @Desc: Instance constructor
    CSocket.public.addMethod("constructor", (self, route, options) => {
        if (CSocket.private.isUnloaded) return false
        const private = CSocket.instance.get(self)
        const cPointer = {public: self, private: private}
        private.onDisconnectInstance = CSocket.private.onDisconnectInstance
        onSocketInitialize(cPointer, route, options)
        if (!vKit.server) {
            let cResolver = false, reconCounter = 0
            private.onConnect = (isReconnection) => {
                if (!isReconnection && self.isConnected()) return
                private.isAwaiting = private.isAwaiting || new Promise((resolver) => cResolver = resolver)
                private.server = new WebSocket(`${((server.private.config.protocol == "https") && "wss") || "ws"}://${server.private.config.hostname}${(server.private.config.port && (":" + server.private.config.port)) || ""}/${private.route}?version=${vNetwork.version}`)
                private.server.onopen = () => {
                    reconCounter = 0
                    delete private.isAwaiting
                    private.isConnected = true
                    clearTimeout(private.timer.reconnectTimer)
                    cResolver(private.isConnected)
                }
                private.server.onclose = () => {
                    self.destroy(true)
                    const isReconnection = ((!private["@disconnect"] || !private["@disconnect"].isForced) && private.onReconnect()) || false
                    if (!isReconnection) {
                        let reason = (private["@disconnect"] && private["@disconnect"].reason) || (!private.isConnected && "server-nonexistent")
                        self.destroy()
                        reason = reason || private["@disconnect"].reason
                        private.isConnected = false
                        cResolver(private.isConnected)
                        vKit.exec(self.onClientDisconnect, vKit.vid.fetch(private.server, null, true) || false, reason)
                    }
                }
                private.server.onerror = (error) => vKit.exec(self.onConnectionError, error)
                private.server.onmessage = (payload) => onSocketMessage(cPointer, vKit.vid.fetch(self, null, true), private, private.server, payload)
            }
            private.onReconnect = () => {
                reconCounter += 1
                if (private.reconnection.attempts != -1) {
                    if (reconCounter > private.reconnection.attempts) {
                        private.onDisconnectInstance(private, "client-reconnection-expired")
                        return
                    }
                }
                private.timer.reconnectTimer = vKit.scheduleExec(() => {
                    delete private.timer.reconnectTimer
                    vKit.exec(self.onClientReconnect, vKit.vid.fetch(private.server, null, true) || false, reconCounter, private.reconnection.attempts)
                    private.onConnect(true)
                }, private.reconnection.interval)
                return true
            }
            private.onConnect()
        }
        else {
            private.server = new CWS.Server({
                noServer: true,
                path: `/${private.route}`
            })
            vKit.scheduleExec(() => vKit.exec(self.onServerConnect), 1)
            private.server.onclose = () => {
                const timestamp_start = private.timestamp, timestamp_end = new Date()
                const deltaTick = timestamp_end.getTime() - timestamp_start.getTime()
                self.destroy()
                server.private.instance.http.off("upgrade", private.onUpgradeSocket)
                vKit.scheduleExec(() => vKit.exec(self.onServerDisconnect, timestamp_start, timestamp_end, deltaTick), 1)
            }
            private.server.onerror = (error) => vKit.exec(self.onConnectionError, error)
            private.server.on("close", private.server.onclose)
            private.server.on("error", private.server.onerror)
            private.onUpgradeSocket = (request, socket, head) => {
                let [path, query] = request.url.split("?")
                path = path.slice(1)
                if (path != route) return
                private.server.handleUpgrade(request, socket, head, (socket) => {
                    if (!CSocket.public.fetch(path)) return
                    const clientInstance = self.client.create(socket)
                    const client = vKit.vid.fetch(clientInstance, null, true)
                    private.client[client] = clientInstance
                    clientInstance.queue = {}, clientInstance.room = {}
                    query = vKit.query.parse(query)
                    if (!query.version || (query.version != vNetwork.version)) {
                        private.onDisconnectInstance(private.client[client], "version-mismatch")
                        clientInstance.destroy()
                        return
                    }
                    clientInstance.socket.send(vKit.toBase64(JSON.stringify({client: client})))
                    onSocketHeartbeat(cPointer, client, clientInstance, clientInstance.socket)
                    vKit.exec(self.onClientConnect, client)
                    clientInstance.socket.onclose = () => {
                        const reason = (clientInstance["@disconnect"] && clientInstance["@disconnect"].reason) || (private["@disconnect"] && private["@disconnect"].reason) || "client-disconnected"
                        for (const i in clientInstance.socket.room) {
                            self.leaveRoom(i, client)
                        }
                        clientInstance.destroy()
                        vKit.exec(self.onClientDisconnect, client, reason)
                    }
                    clientInstance.socket.onmessage = (payload) => onSocketMessage(cPointer, client, clientInstance, clientInstance.socket, payload)
                })
            }
            server.private.instance.http.on("upgrade", private.onUpgradeSocket)
        }
    })

    if (!vKit.server) {
        // @Desc: Retrieves connection's status of instance
        CSocket.public.addInstanceMethod("isConnected", (self, isSync) => {
            if (CSocket.private.isUnloaded) return false
            const private = CSocket.instance.get(self)
            if (isSync) return (vKit.isBool(private.isConnected) && private.isConnected) || false
            return private.isAwaiting || private.isConnected || false
        })
    }
    else {
        // @Desc: Verifies client's validity
        CSocket.public.addInstanceMethod("isClient", (self, client) => {
            if (CSocket.private.isUnloaded) return false
            const private = CSocket.instance.get(self)
            return (self.client.fetch(client) && private.client[client] && true) || false
        })

        // @Desc: Fetches an array of existing clients
        CSocket.public.addInstanceMethod("fetchClients", (self) => {
            if (CSocket.private.isUnloaded) return false
            const private = CSocket.instance.get(self)
            const result = []
            for (const i in private.client) {
                if (self.isClient(i)) result.push(i)
            }
            return result
        })
    }
})


//////////////
// Exports //
//////////////

require("./client")
require("./network")
require("./room")