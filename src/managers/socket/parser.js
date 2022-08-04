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

// @Desc: Handles socket initialization
const onSocketInitialize = function(socket, route, options) {
    CUtility.vid.fetch(socket.public)
    options = (CUtility.isObject(options) && options) || false
    socket.private.timestamp = new Date()
    socket.private.heartbeat = {interval: 10000, timeout: 60000}
    socket.private.reconnection = {attempts: -1, interval: 2500}
    socket.private.route = route, socket.private.network = {}, socket.public.room = {}
    if (options) {
        if (!CUtility.isServer) {
            if (CUtility.isObject(options.reconnection)) {
                socket.private.reconnection.attempts = (CUtility.isNumber(options.reconnection.attempts) && ((options.reconnection.attempts == -1) && options.reconnection.attempts) || Math.max(1, options.reconnection.attempts)) || socket.private.reconnection.attempts
                socket.private.reconnection.interval = (CUtility.isNumber(options.reconnection.interval) && Math.max(1, options.reconnection.interval)) || socket.private.reconnection.interval
            }
        }
        if (CUtility.isObject(options.heartbeat)) {
            socket.private.heartbeat.interval = (CUtility.isNumber(options.heartbeat.interval) && Math.max(1, options.heartbeat.interval)) || socket.private.heartbeat.interval
            socket.private.heartbeat.timeout = (CUtility.isNumber(options.heartbeat.timeout) && Math.max(socket.private.heartbeat.interval + 1, options.heartbeat.timeout)) || socket.private.heartbeat.timeout
        }
    }
    if (!CUtility.isServer) socket.public.queue = {}
    else socket.public.instance = {}
    return true
}


// @Desc: Handles socket message
const onSocketMessage = function(socket, client, socket, payload) {
    payload = JSON.parse(CUtility.fromBase64(payload.data))
    if (!CUtility.isObject(payload)) return false
    if (!CUtility.isString(payload.networkName) || !CUtility.isArray(payload.networkArgs)) {
        if (payload.heartbeat) {
            const prevTick = socket.public.heatbeatTick
            socket.public.heatbeatTick = Date.now()
            const deltaTick = socket.public.heatbeatTick - (prevTick || socket.public.heatbeatTick)
            if (!CUtility.isServer) CUtility.exec(socket.public.onHeartbeat, deltaTick)
            else CUtility.exec(socket.public.onHeartbeat, client, deltaTick)
            clearTimeout(socket.public.heartbeatTerminator)
            socket.public.heartbeatTimer = setTimeout(function() {
                socket.send(CUtility.toBase64(JSON.stringify({heartbeat: true})))
            }, socket.private.heartbeat.interval)
            socket.public.heartbeatTerminator = setTimeout(function() {
                if (!CUtility.isServer) private["@disconnect-reason"] = "heartbeat-timeout"
                else if (socket.public.isClient(client)) socket.public.instance[client]["@disconnect-reason"] = "heartbeat-timeout"
                socket.close()
            }, socket.private.heartbeat.timeout)
        }
        else {
            if (!CUtility.isServer) {
                if (payload.client) {
                    CUtility.vid.fetch(socket, payload.client)
                    CUtility.exec(socket.public.onClientConnect, payload.client)
                }
                else if (payload["@disconnect-reason"]) {
                    private["@disconnect-forced"] = true
                    private["@disconnect-reason"] = payload["@disconnect-reason"]
                }
                else if (payload.room) {
                    if (payload.action == "join") {
                        socket.public.room[(payload.room)] = socket.public.room[(payload.room)] || {}
                        socket.public.room[(payload.room)].member = socket.public.room[(payload.room)].member || {}
                        socket.public.room[(payload.room)].member[client] = true
                        CUtility.exec(socket.public.onClientJoinRoom, payload.room, client)
                    }
                    else if (payload.action == "leave") {
                        delete socket.public.room[(payload.room)]
                        CUtility.exec(socket.public.onClientLeaveRoom, payload.room, client)
                    }
                }
            }
        }
        return false
    }
    if (CUtility.isObject(payload.networkCB)) {
        if (!payload.networkCB.isProcessed) {
            payload.networkCB.isProcessed = true
            const cNetwork = socket.private.fetchNetwork(socket.public, payload.networkName)
            if (!cNetwork || !cNetwork.isCallback) payload.networkCB.isErrored = true
            else payload.networkArgs = [cNetwork.handler.exec(...payload.networkArgs)]
            socket.send(CUtility.toBase64(JSON.stringify(payload)))
        }
        else socket.private.resolveCallback(socket.public, client, payload)
        return true
    }
    socket.public.emit(payload.networkName, null, ...payload.networkArgs)
    return true
}


//////////////
// Exports //
//////////////

module.exports = {
    onSocketInitialize,
    onSocketMessage
}
