/*----------------------------------------------------------------
     Resource: Vital.network
     Script: socket: parser.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket: Parser Manager
----------------------------------------------------------------*/


/////////////////////
// Static Members //
/////////////////////

// @Desc: Handles socket's initialization
const onSocketInitialize = (socket, route, options) => {
    vKit.vid.fetch(socket.public)
    options = (vKit.isObject(options) && options) || false
    socket.private.timestamp = new Date()
    socket.private.heartbeat = {interval: 10000, timeout: 60000}
    socket.private.timer = {}
    if (!vKit.isServer) socket.private.reconnection = {attempts: -1, interval: 2500}
    socket.private.route = route, socket.private.network = {}, socket.private.room = {}
    if (options) {
        if (!vKit.isServer) {
            if (vKit.isObject(options.reconnection)) {
                socket.private.reconnection.attempts = (vKit.isNumber(options.reconnection.attempts) && ((options.reconnection.attempts == -1) && options.reconnection.attempts) || Math.max(1, options.reconnection.attempts)) || socket.private.reconnection.attempts
                socket.private.reconnection.interval = (vKit.isNumber(options.reconnection.interval) && Math.max(1, options.reconnection.interval)) || socket.private.reconnection.interval
            }
        }
        if (vKit.isObject(options.heartbeat)) {
            socket.private.heartbeat.interval = (vKit.isNumber(options.heartbeat.interval) && Math.max(1, options.heartbeat.interval)) || socket.private.heartbeat.interval
            socket.private.heartbeat.timeout = (vKit.isNumber(options.heartbeat.timeout) && Math.max(socket.private.heartbeat.interval + 1, options.heartbeat.timeout)) || socket.private.heartbeat.timeout
        }
    }
    if (!vKit.isServer) socket.public.queue = {}
    else socket.private.client = {}
    return true
}

// @Desc: Handles socket's heartbeat
const onSocketHeartbeat = function(socket, client, instance, receiver, payload) {
    const currentTick = Date.now()
    instance["@heartbeat"] = instance["@heartbeat"] || {}
    instance["@heartbeat"].id = (instance["@heartbeat"].id || (payload && 1) || 0) + 1
    if (payload) {
        const prevID = instance["@heartbeat"].id - 1
        const prevTick = instance["@heartbeat"].tick
        instance["@heartbeat"].tick = currentTick
        const deltaTick = instance["@heartbeat"].tick - (prevTick || instance["@heartbeat"].tick)
        if (!vKit.isServer) vKit.exec(socket.public.onHeartbeat, prevID, deltaTick)
        else vKit.exec(socket.public.onHeartbeat, client, prevID, deltaTick)
    }
    clearTimeout(instance.timer.heartbeatTerminator)
    const prevPreTick = instance["@heartbeat"].preTick
    instance["@heartbeat"].preTick = currentTick
    const prevDeltaTick = instance["@heartbeat"].preTick - (prevPreTick || instance["@heartbeat"].preTick)
    instance.timer.heartbeat = vKit.scheduleExec(() => {
        if (!vKit.isServer) vKit.exec(socket.public.onPreHeartbeat, instance["@heartbeat"].id, prevDeltaTick)
        else vKit.exec(socket.public.onPreHeartbeat, client, instance["@heartbeat"].id, prevDeltaTick)
        receiver.send(vKit.toBase64(JSON.stringify({heartbeat: true})))
        instance.timer.heartbeatTerminator = vKit.scheduleExec(() => {
            const cDisconnection = (!vKit.isServer && socket.private) || (socket.public.isClient(client) && socket.private.client[client]) || false
            if (cDisconnection) socket.private.onDisconnectInstance(cDisconnection, "heartbeat-timeout")
            receiver.close()
        }, socket.private.heartbeat.timeout)
    }, (payload && socket.private.heartbeat.interval) || 0)
    return true
}

// @Desc: Handles socket's message
const onSocketMessage = async (socket, client, instance, receiver, payload) => {
    payload = JSON.parse(vKit.fromBase64(payload.data))
    if (!vKit.isObject(payload)) return false
    if (!vKit.isString(payload.networkName) || !vKit.isArray(payload.networkArgs)) {
        if (payload.heartbeat) onSocketHeartbeat(socket, client, instance, receiver, payload)
        else {
            if (!vKit.isServer) {
                if (payload.client) {
                    vKit.vid.fetch(socket.public, payload.client)
                    vKit.exec(socket.public.onClientConnect, payload.client)
                }
                else if (payload.disconnect) socket.private.onDisconnectInstance(socket.private, payload.disconnect, true)
                else if (payload.room) {
                    if (!payload.isLeave) {
                        socket.private.room[(payload.room)] = socket.private.room[(payload.room)] || {}
                        socket.private.room[(payload.room)].member = socket.private.room[(payload.room)].member || {}
                        socket.private.room[(payload.room)].member[client] = true
                        vKit.exec(socket.public.onClientJoinRoom, payload.room, client)
                    }
                    else {
                        delete socket.private.room[(payload.room)]
                        vKit.exec(socket.public.onClientLeaveRoom, payload.room, client)
                    }
                }
            }
        }
        return false
    }
    if (vKit.isObject(payload.networkCB)) {
        if (!payload.networkCB.isProcessed) {
            payload.networkCB.isProcessed = true
            const cNetwork = socket.private.onFetchNetwork(payload.networkName)
            if (!cNetwork || !cNetwork.isCallback) payload.networkCB.isErrored = true
            else payload.networkArgs = [await cNetwork.emitCallback(...payload.networkArgs)]
            receiver.send(vKit.toBase64(JSON.stringify(payload)))
        }
        else socket.private.onResolveNetwork(client, payload)
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
    onSocketHeartbeat,
    onSocketMessage
}
