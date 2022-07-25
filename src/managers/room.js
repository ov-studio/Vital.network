
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


//////////////////
// Class: Room //
//////////////////

CServer.room = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

CServer.room.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CUtility.isObject(CServer.room.buffer[name]) && true) || false
})

CServer.room.addMethod("fetch", function(name) {
    return (!CServer.room.isVoid(name) && CServer.room.buffer[name]) || false
})

CServer.room.addMethod("create", function(name, ...cArgs) {
    if (!CServer.isConnected(true) || !CServer.room.isVoid(name)) return false
    CServer.room.buffer[name] = new CServer.room(name, ...cArgs)
    return CServer.room.buffer[name]
})

CServer.room.addMethod("destroy", function(name) {
    if (CServer.room.isVoid(name)) return false
    CServer.room.buffer[name].isUnloaded = true
    delete CServer.room.buffer[name]
    return true
})


///////////////////////
// Instance Mmebers //
//////////////////////

CServer.room.addMethod("constructor", function(self, name) {
    self.name = name
}, "isInstance")

CServer.room.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CServer.room.isVoid(self.name) && true) || false
})

CServer.room.addInstanceMethod("destroy", function(self) {
    CServer.room.destroy(self.name)
    return true
})