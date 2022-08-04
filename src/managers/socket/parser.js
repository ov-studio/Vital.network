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


/////////////////////
// Static Members //
/////////////////////

// @Desc: Handles socket's initialization
const onSocketInitialize = function(socket, route, options) {
    CUtility.vid.fetch(socket.public)
    options = (CUtility.isObject(options) && options) || false
    socket.private.timestamp = new Date()
    socket.private.heartbeat = {interval: 10000, timeout: 60000}
    if (!CUtility.isServer) socket.private.reconnection = {attempts: -1, interval: 2500}
    socket.private.route = route, socket.private.network = {}, socket.private.room = {}
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
    else socket.private.client = {}
    return true
}

// @Desc: Handles socket's message
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
                const cDisconnection = (!CUtility.isServer && private) || (socket.public.isClient(client) && socket.private.client[client]) || false
                if (cDisconnection) {
                    cDisconnection]["@disconnect"] = cDisconnection["@disconnect"] || {}
                    cDisconnection.reason = "heartbeat-timeout"
                }
                socket.close()
            }, socket.private.heartbeat.timeout)
        }
        else {
            if (!CUtility.isServer) {
                if (payload.client) {
                    CUtility.vid.fetch(socket, payload.client)
                    CUtility.exec(socket.public.onClientConnect, payload.client)
                }
                else if (payload.disconnect) {
                    private["@disconnect"] = private["@disconnect"] || {}
                    private["@disconnect"].isForced = true
                    private["@disconnect"].reason = payload.disconnect
                }
                else if (payload.room) {
                    if (!payload.isLeave) {
                        socket.private.room[(payload.room)] = socket.private.room[(payload.room)] || {}
                        socket.private.room[(payload.room)].member = socket.private.room[(payload.room)].member || {}
                        socket.private.room[(payload.room)].member[client] = true
                        CUtility.exec(socket.public.onClientJoinRoom, payload.room, client)
                    }
                    else {
                        delete socket.private.room[(payload.room)]
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
