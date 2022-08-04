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
const CNetwork = require("../../utilities/network")


////////////////////
// Class: Client //
////////////////////

CNetwork.fetch("vNetworkify:Server:onConnect").on(function(server) {
    const CClient = CUtility.createClass()
    server.public.socket.client = CClient.public
    CClient.private.buffer = {}

    CNetwork.fetch("vNetworkify:Server:onDisconnect").on(function(__server) {
        if ((server.public != __server.public) || (server.private != __server.private)) return false
        for (const i in CClient.private.buffer) {
            CClient.private.buffer[i].destroy()
        }
        CClient.private.isUnloaded = true
        delete server.public.socket.client
    })


    /////////////////////
    // Static Members //
    /////////////////////

    // @Desc: Fetches client instance by VID or socket
    CClient.addMethod("fetch", function(vid, socket, fetchSocket) {
        if (CClient.private.isUnloaded) return false
        vid = vid || CUtility.vid.fetch(socket, null, true)
        return (vid && CClient.private.buffer[vid] && ((fetchSocket && CClient.private.buffer[vid].socket) || CClient.private.buffer[vid])) || false
    })

    // @Desc: Creates a fresh client w/ specified socket
    CClient.addMethod("create", function(socket) {
        if (CClient.private.isUnloaded) return false
        if (!CUtility.isObject(socket) || CClient.fetch(null, socket)) return false
        const cInstance = new CClient(socket)
        const vid = CUtility.vid.fetch(cInstance, null, true)
        CClient.private.buffer[vid] = cInstance
        return cInstance
    })

    // @Desc: Destroys an existing client by specified VID or socket
    CClient.addMethod("destroy", function(vid, socket) {
        if (CClient.private.isUnloaded) return false
        vid = vid || CUtility.vid.fetch(socket, null, true)
        if (!CClient.fetch(vid)) return false
        return CClient.private.buffer[vid].destroy()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Instance constructor
    CClient.addMethod("constructor", function(self, socket) {
        if (CClient.private.isUnloaded) return false
        CUtility.vid.fetch(self, CUtility.vid.fetch(socket))
        self.socket = socket
    })

    // @Desc: Destroys the instance
    CClient.addInstanceMethod("destroy", function(self) {
        if (CClient.private.isUnloaded) return false
        const vid = CUtility.vid.fetch(self, null, true)
        delete CClient.private.buffer[vid]
        self.destroyInstance()
        return true
    })
})