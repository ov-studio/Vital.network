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

CRoom = CUtility.createClass({
    buffer: {}
})
CServer.room = CRoom.public


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether the room is void
CRoom.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CUtility.isObject(CRoom.buffer[name]) && true) || false
})

// @Desc: Fetches room instance by name
CRoom.addMethod("fetch", function(name) {
    return (!CRoom.isVoid(name) && CRoom.buffer[name]) || false
})

// @Desc: Creates a fresh room w/ specified name
CRoom.addMethod("create", function(name, ...cArgs) {
    if (!CServer.isConnected(true) || !CRoom.isVoid(name)) return false
    CRoom.buffer[name] = CRoom.public.createInstance(name, ...cArgs)
    return CRoom.buffer[name]
})

// @Desc: Destroys an existing room by specified name
CRoom.addMethod("destroy", function(name) {
    if (CRoom.isVoid(name)) return false
    return CRoom.buffer[name].destroy()
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CRoom.addMethod("constructor", function(self, name) {
    self.name = name
})

// @Desc: Destroys the instance
CRoom.addInstanceMethod("destroy", function(self) {
    delete CRoom.buffer[(self.name)]
    self.destroyInstance()
    return true
})