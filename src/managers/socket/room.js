/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: socket: room.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket: Room Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../../utilities")
const CNetwork = require("../../utilities/network")
const CRoom = require("../../utilities/room")

CNetwork.fetch("vNetworkify:Socket:onCreate").on(function(socket) {
    CNetwork.fetch("vNetworkify:Socket:onDestroy").on(function(__socket) {
        if ((socket.public != __socket.public) || (socket.private != __socket.private)) return false
        CNetwork.fetch("vNetworkify:Socket:onDestroy").off(this)
        if (CUtility.isServer) {
            for (const i in socket.private.room) {
                socket.private.room[i].destroy()
                delete socket.private.room[i]
            }
        }
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Verifies room's validity
    socket.public.isRoom = function(name) {
        if (!socket.public.isInstance()) return false
        return (CUtility.isString(name) && socket.private.room[name] && true) || false
    }

    // @Desc: Fetches an array of existing rooms
    socket.public.fetchRooms = function() {
        if (!socket.public.isInstance()) return false
        const result = []
        for (const i in socket.private.room) {
            if (socket.public.isRoom(i)) result.push(i)
        }
        return result
    }

    // @Desc: Fetches an array of existing room's members
    socket.public.fetchRoomMembers = function(name) {
        if (!socket.public.isInstance()) return false
        if (!socket.public.isRoom(name)) return false
        const result = []
        for (const i in socket.private.room[name].member) {
            if (!CUtility.isServer || socket.public.isClient(i)) result.push(i)
        }
        return result
    }

    // @Desc: Verifies whether the client belongs specified room
    socket.public.isInRoom = function(name, client) {
        if (!socket.public.isInstance()) return false
        if (!socket.public.isRoom(name) || !socket.public.client.fetch(client)) return false
        if (CUtility.isServer) {
            if (!socket.public.isClient(client)) return false
            return (socket.private.room[name].member[client] && true) || false   
        }
        return (socket.private.room[name].member[client] && true) || false
    }

    if (CUtility.isServer) {
        // @Desc: Creates a fresh room w/ specified name
        socket.public.createRoom = function(name, ...cArgs) {
            if (!socket.public.isInstance()) return false
            if (socket.public.isRoom(name)) return false
            socket.private.room[name] = CRoom.create(`Socket:${CUtility.vid.fetch(socket.public)}:${name}`, ...cArgs)
            socket.private.room[name].member = {}
            return true
        }

        // @Desc: Destroys an existing room by specified name
        socket.public.destroyRoom = function(name) {
            if (!socket.public.isInstance()) return false
            if (!socket.public.isRoom(name)) return false
            for (const i in socket.private.room[name].member) {
                socket.public.leaveRoom(name, i)
            }
            socket.private.room[name].destroy()
            delete socket.private.room[name]
            return true
        }

        // @Desc: Joins client to specified room
        socket.public.joinRoom = function(name, client) {
            if (!socket.public.isInstance()) return false
            if (!socket.public.isClient(client) || !socket.public.isRoom(name) || socket.public.isInRoom(name, client)) return false
            socket.private.room[name].member[client] = true
            const clientInstance = socket.public.client.fetch(client)
            clientInstance.socket.send(CUtility.toBase64(JSON.stringify({room: name})))
            CUtility.exec(socket.public.onClientJoinRoom, name, client)
            return true
        }

        // @Desc: Kicks client from specified room
        socket.public.leaveRoom = function(name, client) {
            if (!socket.public.isInstance()) return false
            if (!socket.public.isClient(client) || !socket.public.isInRoom(name, client)) return false
            delete socket.private.room[name].member[client]
            const clientInstance = socket.public.client.fetch(client)
            clientInstance.socket.send(CUtility.toBase64(JSON.stringify({room: name, isLeave: true})))
            CUtility.exec(socket.public.onClientLeaveRoom, name, client)
            return true
        }

        // @Desc: Emits a non-callback network to all clients connected to specified room
        socket.public.emitRoom = function(name, network, ...cArgs) {
            if (!socket.public.isInstance()) return false
            if (!socket.public.isRoom(name)) return false
            for (const i in socket.private.room[name].member) {
                socket.public.emit(network, i, ...cArgs)
            }
            return true
        }
    }
})