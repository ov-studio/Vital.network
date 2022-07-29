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

CServer.socket.addInstanceMethod("isRoom", function(self, name) {
    const cInstance = (CUtility.isString(name) && CUtility.isObject(self.room[name]) && self.room[name]) || false
    if (CUtility.isServer && cInstance && !cInstance.isInstance()) cInstance = false
    return (cInstance && true) || false
})

CServer.socket.addInstanceMethod("isInRoom", function(self, name, clientVID) {
    if (!self.isRoom(name) || !CServer.socket.client.fetch(clientVID)) return false
    if (CUtility.isServer) {
        if (!self.isClient(clientVID)) return false
        return (self.room[name].member[clientVID] && true) || false   
    }
    return (self.room[name][clientVID] && true) || false
})

if (!CUtility.isServer) {

}
else {
    ///////////////////////
    // Instance Members //
    ///////////////////////

    CServer.socket.addInstanceMethod("createRoom", function(self, name, ...cArgs) {
        if (self.isRoom(name)) return false
        self.room[name] = CServer.room.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
        self.room[name].member = {}
        return true
    })

    CServer.socket.addInstanceMethod("destroyRoom", function(self, name) {
        if (!self.isRoom(name)) return false
        self.room[name].destroy()
        delete self.room[name]
        return true
    })

    CServer.socket.addInstanceMethod("joinRoom", function(self, name, clientVID) {
        if (!self.isClient(clientVID) || !self.isRoom(name) || self.isInRoom(name, clientVID)) return false
        self.room[name].member[clientVID] = true
        return true
    })

    CServer.socket.addInstanceMethod("leaveRoom", function(self, name, clientVID) {
        if (!self.isClient(clientVID) || !self.isInRoom(name, clientVID)) return false
        delete self.room[name].member[clientVID]
        return true
    })

    CServer.socket.addInstanceMethod("emitRoom", function(self, name, network, ...cArgs) {
        if (!self.isRoom(name)) return false
        for (const i in self.room[name].member) {
            self.emit(network, i, ...cArgs)
        }
        return true
    })
}