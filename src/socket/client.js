/*----------------------------------------------------------------
     Resource: Vital.network
     Script: socket: client.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Client Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

// TODO: UPGRADE
const CNetwork = require("@vstudio/vital.kit/src/network")


////////////////////
// Class: Client //
////////////////////

CNetwork.fetch("vNetwork:Socket:onCreate").on((socket) => {
    if (!vKit.isServer) return false
    const CClient = vKit.Class()
    socket.public.client = CClient.public
    CClient.private.buffer = {}

    const onSocketDestroy = function(__socket) {
        if ((socket.public != __socket.public) || (socket.private != __socket.private)) return
        CNetwork.fetch("vNetwork:Socket:onDestroy").off(onSocketDestroy)
        for (const i in CClient.private.buffer) {
            CClient.private.buffer[i].destroy()
        }
        CClient.private.isUnloaded = true
        delete socket.public.client
    }
    CNetwork.fetch("vNetwork:Socket:onDestroy").on(onSocketDestroy)


    /////////////////////
    // Static Members //
    /////////////////////

    // @Desc: Fetches client instance by VID or socket
    CClient.public.addMethod("fetch", (vid, socket, isFetchSocket) => {
        if (CClient.private.isUnloaded) return false
        vid = vid || vKit.vid.fetch(socket, null, true)
        return (vid && CClient.private.buffer[vid] && ((isFetchSocket && CClient.private.buffer[vid].socket) || CClient.private.buffer[vid])) || false
    })

    // @Desc: Creates a fresh client w/ specified socket
    CClient.public.addMethod("create", (socket) => {
        if (CClient.private.isUnloaded) return false
        if (!vKit.isObject(socket) || CClient.public.fetch(null, socket)) return false
        const cInstance = CClient.public.createInstance(socket)
        const vid = vKit.vid.fetch(cInstance, null, true)
        CClient.private.buffer[vid] = cInstance
        return cInstance
    })

    // @Desc: Destroys an existing client by specified VID or socket
    CClient.public.addMethod("destroy", (vid, socket) => {
        if (CClient.private.isUnloaded) return false
        vid = vid || vKit.vid.fetch(socket, null, true)
        if (!CClient.public.fetch(vid)) return false
        return CClient.private.buffer[vid].destroy()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Instance constructor
    CClient.public.addMethod("constructor", (self, socket) => {
        if (CClient.private.isUnloaded) return false
        vKit.vid.fetch(self, vKit.vid.fetch(socket))
        self.socket = socket
        self.timer = {}
    })

    // @Desc: Destroys the instance
    CClient.public.addInstanceMethod("destroy", (self) => {
        if (CClient.private.isUnloaded) return false
        const vid = vKit.vid.fetch(self, null, true)
        if (CClient.private.buffer[vid].queue) {
            for (const i in CClient.private.buffer[vid].queue) {
                CClient.private.buffer[vid].queue[i].reject()
            }
        }
        CClient.private.buffer[vid].socket.send(vKit.toBase64(JSON.stringify({disconnect: (socket.private["@disconnect"] && socket.private["@disconnect"].reason) || (self["@disconnect"] && self["@disconnect"].reason)})))
        CClient.private.buffer[vid].socket.close()
        for (const i in CClient.private.buffer[vid].timer) {
            clearTimeout(CClient.private.buffer[vid].timer[i])
        }
        delete CClient.private.buffer[vid]
        delete socket.private.client[vid]
        self.destroyInstance()
        return true
    })
})