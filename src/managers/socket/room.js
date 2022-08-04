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
    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Verifies room's validity
    socket.public.isRoom = function(name) {
        var cInstance = (CUtility.isString(name) && self.room[name]) || false
        return (cInstance && true) || false
    }

    // @Desc: Fetches an array of existing rooms
    socket.public.fetchRooms = function(self) {
        const result = []
        for (const i in self.room) {
            if (self.isRoom(i)) result.push(i)
        }
        return result
    }

    // @Desc: Fetches an array of existing room's members
    socket.public.fetchRoomMembers = function(name) {
        if (!self.isRoom(name)) return false
        const result = []
        for (const i in self.room[name].member) {
            if (!CUtility.isServer || self.isClient(i)) result.push(i)
        }
        return result
    }

    // @Desc: Verifies whether the client belongs specified room
    socket.public.isInRoom = function(name, client) {
        if (!self.isRoom(name) || !CServer.socket.client.fetch(client)) return false
        if (CUtility.isServer) {
            if (!self.isClient(client)) return false
            return (self.room[name].member[client] && true) || false   
        }
        return (self.room[name].member[client] && true) || false
    }

    if (CUtility.isServer) {
        ///////////////////////
        // Instance Members //
        ///////////////////////

        // @Desc: Creates a fresh room w/ specified name
        socket.public.createRoom = function(name, ...cArgs) {
            if (self.isRoom(name)) return false
            self.room[name] = CRoom.create(`Socket:${CUtility.vid.fetch(self)}:${name}`, ...cArgs)
            self.room[name].member = {}
            return true
        }

        // @Desc: Destroys an existing room by specified name
        socket.public.destroyRoom = function(name) {
            if (!self.isRoom(name)) return false
            for (const i in self.room[name].member) {
                self.leaveRoom(name, i)
            }
            self.room[name].destroy()
            delete self.room[name]
            return true
        }

        // @Desc: Joins client to specified room
        socket.public.joinRoom = function(name, client) {
            if (!self.isClient(client) || !self.isRoom(name) || self.isInRoom(name, client)) return false
            self.room[name].member[client] = true
            const clientInstance = CServer.socket.client.fetch(client)
            clientInstance.socket.send(CUtility.toBase64(JSON.stringify({room: name})))
            CUtility.exec(self.onClientJoinRoom, name, client)
            return true
        }

        // @Desc: Kicks client from specified room
        socket.public.leaveRoom = function(name, client) {
            if (!self.isClient(client) || !self.isInRoom(name, client)) return false
            delete self.room[name].member[client]
            const clientInstance = CServer.socket.client.fetch(client)
            clientInstance.socket.send(CUtility.toBase64(JSON.stringify({room: name, isLeave: true})))
            CUtility.exec(self.onClientLeaveRoom, name, client)
            return true
        }

        // @Desc: Emits a non-callback network to all clients connected to specified room
        socket.public.emitRoom = function(name, network, ...cArgs) {
            if (!self.isRoom(name)) return false
            for (const i in self.room[name].member) {
                self.emit(network, i, ...cArgs)
            }
            return true
        }
    }
})