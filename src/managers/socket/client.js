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

CServer.socket.client.addMethod("fetch", function(clientVID, clientSocket) {
    clientVID = clientVID || CUtility.fetchVID(clientSocket, null, true)
    return (clientVID && CUtility.isObject(CServer.socket.client[clientVID]) && CServer.socket.client[clientVID]) || false
})

CServer.socket.client.addMethod("create", function(socket) {
    if (!CUtility.isObject(socket) || CServer.socket.client.fetch(null, socket)) return false
    const cInstance = new CServer.socket.client(socket)
    const clientVID = CUtility.fetchVID(cInstance, null, true)
    CServer.socket.client.buffer[clientVID] = cInstance
    return clientVID
})

CServer.socket.client.addMethod("destroy", function(clientVID) {
    if (!CServer.socket.client.fetch(clientVID)) return false
    CServer.socket.client.buffer[clientVID].isUnloaded = true
    delete CServer.socket.client.buffer[clientVID]
    return true
})


///////////////////////
// Instance Members //
///////////////////////

CServer.socket.client.addMethod("constructor", function(self) {
    CUtility.fetchVID(self, CUtility.fetchVID(socket))
    self.socket = socket
}, "isInstance")

CServer.socket.client.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && CServer.socket.client.fetch(null, self.socket) && true) || false
})

CServer.socket.client.addInstanceMethod("destroy", function(self) {
    CServer.socket.client.destroy(CUtility.fetchVID(self.socket, null, true))
    return true
})