/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: socket: parser.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket: Parser Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../../utilities")
const CServer = require("../server")


/////////////////////
// Static Members //
/////////////////////

// @Desc: Handles Socket Initialization
const onSocketInitialize = function(self, route, options) {
    CUtility.fetchVID(self)
    self.config = {
        timestamp: new Date(),
        options: {}
    }
    self.config.options.heartbeat = CUtility.cloneObject(CServer.socket.heartbeat)
    if (CUtility.isObject(options)) {
        if (CUtility.isObject(options.heartbeat) && CUtility.isNumber(options.heartbeat.interval) && CUtility.isNumber(options.heartbeat.timeout)) {
            self.config.options.heartbeat.interval = Math.max(1, options.heartbeat.interval)
            self.config.options.heartbeat.timeout = Math.max(self.config.options.heartbeat.interval + 1, options.heartbeat.timeout)
        }
    }
    self.route = route, self.network = {}, self.room = {}
    if (!CUtility.isServer) {
        self.config.options.reconnection = CUtility.cloneObject(CServer.socket.reconnection)
        if (CUtility.isObject(options)) {
            if (CUtility.isObject(options.reconnection) && CUtility.isNumber(options.reconnection.attempts) && CUtility.isNumber(options.reconnection.interval)) {
                self.config.options.reconnection.attempts = ((options.reconnection.attempts == -1) && options.reconnection.attempts) || Math.max(1, options.reconnection.attempts)
                self.config.options.reconnection.interval = Math.max(1, options.reconnection.interval)
            }
        }
        self.queue = {}
    }
    else {
        self.instance = {}
    }
    return true
}


// @Desc: Handles Socket Message
const onSocketMessage = function(self, client, socket, payload) {
    payload = JSON.parse(CUtility.fromBase64(payload.data))
    if (!socket || !CUtility.isObject(payload)) return false
    if (!CUtility.isString(payload.networkName) || !CUtility.isArray(payload.networkArgs)) {
        if (payload.heartbeat) {
            const prevTick = self.heatbeatTick
            self.heatbeatTick = Date.now()
            const deltaTick = self.heatbeatTick - (prevTick || self.heatbeatTick)
            if (!CUtility.isServer) CUtility.exec(self.onHeartbeat, deltaTick)
            else CUtility.exec(self.onHeartbeat, client, deltaTick)
            clearTimeout(self.heartbeatTerminator)
            self.heartbeatTimer = setTimeout(function() {
                socket.send(CUtility.toBase64(JSON.stringify({heartbeat: true})))
            }, self.config.options.heartbeat.interval)
            self.heartbeatTerminator = setTimeout(function() {
                if (!CUtility.isServer) self["@disconnect-reason"] = "heartbeat-timeout"
                else if (self.isClient(client)) self.instance[client]["@disconnect-reason"] = "heartbeat-timeout"
                socket.close()
            }, self.config.options.heartbeat.timeout)
        }
        else {
            if (!CUtility.isServer) {
                if (payload.client) {
                    CUtility.fetchVID(socket, payload.client)
                    CUtility.exec(self.onClientConnect, payload.client)
                }
                else if (payload["@disconnect-reason"]) {
                    self["@disconnect-forced"] = true
                    self["@disconnect-reason"] = payload["@disconnect-reason"]
                }
                else if (payload.room) {
                    if (payload.action == "join") {
                        self.room[(payload.room)] = self.room[(payload.room)] || {}
                        self.room[(payload.room)].member = self.room[(payload.room)].member || {}
                        self.room[(payload.room)].member[client] = true
                        CUtility.exec(self.onClientJoinRoom, payload.room, client)
                    }
                    else if (payload.action == "leave") {
                        delete self.room[(payload.room)]
                        CUtility.exec(self.onClientLeaveRoom, payload.room, client)
                    }
                }
            }
        }
        return false
    }
    if (CUtility.isObject(payload.networkCB)) {
        if (!payload.networkCB.isProcessed) {
            payload.networkCB.isProcessed = true
            const cNetwork = CServer.socket.fetchNetwork(self, payload.networkName)
            if (!cNetwork || !cNetwork.isCallback) payload.networkCB.isErrored = true
            else payload.networkArgs = [cNetwork.handler.exec(...payload.networkArgs)]
            socket.send(CUtility.toBase64(JSON.stringify(payload)))
        }
        else CServer.socket.resolveCallback(self, client, payload)
        return true
    }
    self.emit(payload.networkName, null, ...payload.networkArgs)
    return true
}


//////////////
// Exports //
//////////////

module.exports = {
    onSocketInitialize,
    onSocketMessage
}