/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: socket: client.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Client Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../../utilities")
const CServer = require("../server")


////////////////////
// Class: Client //
////////////////////

CServer.socket.client = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

CServer.socket.client.addMethod("fetch", function(vid, socket, fetchSocket) {
    vid = vid || CUtility.fetchVID(socket, null, true)
    return (vid && CUtility.isObject(CServer.socket.client.buffer[vid]) && CServer.socket.client.buffer[vid] && ((fetchSocket && CServer.socket.client.buffer[vid].socket) || CServer.socket.client.buffer[vid])) || false
})

CServer.socket.client.addMethod("create", function(socket) {
    if (!CUtility.isObject(socket) || CServer.socket.client.fetch(null, socket)) return false
    const cInstance = new CServer.socket.client(socket)
    const vid = CUtility.fetchVID(cInstance, null, true)
    CServer.socket.client.buffer[vid] = cInstance
    return cInstance
})

CServer.socket.client.addMethod("destroy", function(vid, socket) {
    vid = vid || CUtility.fetchVID(socket, null, true)
    if (!CServer.socket.client.fetch(vid)) return false
    CServer.socket.client.buffer[vid].isUnloaded = true
    delete CServer.socket.client.buffer[vid]
    return true
})


///////////////////////
// Instance Members //
///////////////////////

CServer.socket.client.addMethod("constructor", function(self, socket) {
    CUtility.fetchVID(self, CUtility.fetchVID(socket))
    self.socket = socket
}, "isInstance")

CServer.socket.client.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && CServer.socket.client.fetch(null, self.socket) && true) || false
})

CServer.socket.client.addInstanceMethod("destroy", function(self) {
    CServer.socket.client.destroy(null, self.socket)
    return true
})