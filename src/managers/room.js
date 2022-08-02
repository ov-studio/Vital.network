/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: room.js
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


//////////////////
// Class: Room //
//////////////////

CServer.room = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether the room is void
CServer.room.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CUtility.isObject(CServer.room.buffer[name]) && true) || false
})

// @Desc: Fetches room instance by name
CServer.room.addMethod("fetch", function(name) {
    return (!CServer.room.isVoid(name) && CServer.room.buffer[name]) || false
})

// @Desc: Creates a fresh room w/ specified name
CServer.room.addMethod("create", function(name, ...cArgs) {
    if (!CServer.isConnected(true) || !CServer.room.isVoid(name)) return false
    CServer.room.buffer[name] = new CServer.room(name, ...cArgs)
    return CServer.room.buffer[name]
})

// @Desc: Destroys an existing room by specified name
CServer.room.addMethod("destroy", function(name) {
    if (CServer.room.isVoid(name)) return false
    return CServer.room.buffer[name].destroy()
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CServer.room.addMethod("constructor", function(self, name) {
    self.name = name
}, "isInstance")

// @Desc: Verifies instance's validity
CServer.room.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CServer.room.isVoid(self.name) && true) || false
})

// @Desc: Destroys the instance
CServer.room.addInstanceMethod("destroy", function(self) {
    self.isUnloaded = true
    delete CServer.room.buffer[(self.name)]
    return true
})