
/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managars: room.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Room Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../utilities")
const CServer = require("./server")


///////////////////////
// Instance Members //
///////////////////////

CServer.socket.addInstanceMethod("isRoom", function(self, name) {
    if (!self.isInstance()) return false
    return (CUtility.isString(name) && CUtility.isObject(self.room[name]) && true) || false
})

CServer.socket.addInstanceMethod("isInRoom", function(self, name, client) {
    if (!self.isInstance() || !self.isRoom(name)) return false
    if (CUtility.isServer && !self.isClient(client)) return false
    const vid = (CUtility.isServer && CUtility.fetchVID(client)) || CUtility.fetchVID(self)
    return (CUtility.isObject(self.room[name]) && self.room[name][vid] && true) || false
})

if (!CUtility.isServer) {

}
else {
    ///////////////////////
    // Instance Members //
    ///////////////////////

    CServer.socket.addInstanceMethod("createRoom", function(self, name) {
        if (!self.isInstance() || self.isRoom(name)) return false
        self.room[name] = {}
        return true
    })

    CServer.socket.addInstanceMethod("destroyRoom", function(self, name) {
        if (!self.isInstance() || !self.isRoom(name)) return false
        delete self.room[name]
        return true
    })

    CServer.socket.addInstanceMethod("joinRoom", function(self, name, client) {
        if (!self.isInstance() || !self.isClient(client) || !self.isRoom(name) || self.isInRoom(name, client)) return false
        const vid = CUtility.fetchVID(client)
        self.room[name][vid] = true
        return true
    })

    CServer.socket.addInstanceMethod("emitRoom", function(self, name, network, ...cArgs) {
        if (!self.isInstance() || !self.isRoom(name)) return false
        for (const i in self.room[name]) {
            self.emit(network, self.instance[i], ...cArgs)
        }
        return true
    })
}