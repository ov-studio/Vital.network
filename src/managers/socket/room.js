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
const CServer = require("../server")


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Verifies room's validity
CServer.socket.addInstanceMethod("isRoom", function(self, name) {
    var cInstance = (CUtility.isString(name) && CUtility.isObject(self.room[name]) && self.room[name]) || false
    if (CUtility.isServer && cInstance && !cInstance.isInstance()) cInstance = false
    return (cInstance && true) || false
})

// @Desc: Fetches an array of existing rooms
CServer.socket.addInstanceMethod("fetchRooms", function(self) {
    const result = []
    for (const i in self.room) {
        if (self.isRoom(i)) result.push(i)
    }
    return result
})

// @Desc: Verifies whether the client belongs specified room
CServer.socket.addInstanceMethod("isInRoom", function(self, name, client) {
    if (!self.isRoom(name) || !CServer.socket.client.fetch(client)) return false
    if (CUtility.isServer) {
        if (!self.isClient(client)) return false
        return (self.room[name].member[client] && true) || false   
    }
    return (self.room[name][client] && true) || false
})

if (!CUtility.isServer) {

}
else {
    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Fetches an array of existing room's members
    CServer.socket.addInstanceMethod("fetchRoomMembers", function(self, name) {
        if (!self.isRoom(name)) return false
        const result = []
        for (const i in self.room[name].member) {
            if (self.isClient(i)) result.push(i)
        }
        return result
    })

    // @Desc: Creates a fresh room w/ specified name
    CServer.socket.addInstanceMethod("createRoom", function(self, name, ...cArgs) {
        if (self.isRoom(name)) return false
        self.room[name] = CServer.room.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
        self.room[name].member = {}
        return true
    })

    // @Desc: Destroys an existing room by specified name
    CServer.socket.addInstanceMethod("destroyRoom", function(self, name) {
        if (!self.isRoom(name)) return false
        self.room[name].destroy()
        delete self.room[name]
        return true
    })

    // @Desc: Joins client to specified room
    CServer.socket.addInstanceMethod("joinRoom", function(self, name, client) {
        if (!self.isClient(client) || !self.isRoom(name) || self.isInRoom(name, client)) return false
        self.room[name].member[client] = true
        return true
    })

    // @Desc: Kicks client from specified room
    CServer.socket.addInstanceMethod("leaveRoom", function(self, name, client) {
        if (!self.isClient(client) || !self.isInRoom(name, client)) return false
        delete self.room[name].member[client]
        return true
    })

    // @Desc: Emits a non-callback network to all clients connected to specified room
    CServer.socket.addInstanceMethod("emitRoom", function(self, name, network, ...cArgs) {
        if (!self.isRoom(name)) return false
        for (const i in self.room[name].member) {
            self.emit(network, i, ...cArgs)
        }
        return true
    })
}