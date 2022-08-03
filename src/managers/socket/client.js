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

// @Desc: Fetches client instance by VID or socket
CServer.socket.client.addMethod("fetch", function(vid, socket, fetchSocket) {
    vid = vid || CUtility.vid.fetch(socket, null, true)
    return (vid && CUtility.isObject(CServer.socket.client.buffer[vid]) && CServer.socket.client.buffer[vid] && ((fetchSocket && CServer.socket.client.buffer[vid].socket) || CServer.socket.client.buffer[vid])) || false
})

// @Desc: Creates a fresh client w/ specified socket
CServer.socket.client.addMethod("create", function(socket) {
    if (!CUtility.isObject(socket) || CServer.socket.client.fetch(null, socket)) return false
    const cInstance = new CServer.socket.client(socket)
    const vid = CUtility.vid.fetch(cInstance, null, true)
    CServer.socket.client.buffer[vid] = cInstance
    return cInstance
})

// @Desc: Destroys an existing client by specified VID or socket
CServer.socket.client.addMethod("destroy", function(vid, socket) {
    vid = vid || CUtility.vid.fetch(socket, null, true)
    if (!CServer.socket.client.fetch(vid)) return false
    return CServer.socket.client.buffer[vid].destroy()
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CServer.socket.client.addMethod("constructor", function(self, socket) {
    CUtility.vid.fetch(self, CUtility.vid.fetch(socket))
    self.socket = socket
}, "isInstance")

// @Desc: Verifies instance's validity
CServer.socket.client.addInstanceMethod("isInstance", function(self) {
    return (CServer.socket.client.fetch(null, self.socket) && true) || false
})

// @Desc: Destroys the instance
CServer.socket.client.addInstanceMethod("destroy", function(self) {
    const vid = CUtility.vid.fetch(self, null, true)
    delete CServer.socket.client.buffer[vid]
    self.destroyInstance()
    return true
})