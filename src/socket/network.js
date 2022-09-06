/*----------------------------------------------------------------
     Resource: Vital.network
     Script: socket: network.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket: Network Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CNetwork = require("@vstudio/vital.kit/src/network")

CNetwork.fetch("vNetwork:Socket:onCreate").on((socket) => {
    const onSocketDestroy = function(__socket) {
        if ((socket.public != __socket.public) || (socket.private != __socket.private)) return
        CNetwork.fetch("vNetwork:Socket:onDestroy").off(onSocketDestroy)
        for (const i in socket.private.network) {
            socket.public.destroyNetwork(i)
        }
    }
    CNetwork.fetch("vNetwork:Socket:onDestroy").on(onSocketDestroy)


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Fetches network instance by name
    socket.private.onFetchNetwork = (name) => {
        if (!socket.public.isInstance()) return false
        return (socket.public.isNetwork(name) && socket.private.network[name]) || false
    }

    // @Desc: Resolves an awaiting callback network's handler
    socket.private.onResolveNetwork = (client, payload) => {
        if (!socket.public.isInstance()) return false
        if (!vKit.isObject(payload) || !payload.networkCB.isProcessed) return false
        if (vKit.isServer && !socket.public.isClient(client)) return false
        const cReceiver = (vKit.isServer && socket.public.client.fetch(client)) || socket.public
        const cQueue = (cReceiver && cReceiver.queue) || false
        const queueID = vKit.vid.fetch(payload.networkCB, null, true)
        if (!cQueue || !queueID || !cQueue[queueID]) return false
        if (payload.networkCB.isErrored) cQueue[queueID].reject(...payload.networkArgs)
        else cQueue[queueID].resolve(...payload.networkArgs)
        return true
    }

    // @Desc: Verifies network's validity
    socket.public.isNetwork = (name) => {
        if (!socket.public.isInstance()) return false
        return (vKit.isString(name) && socket.private.network[name] && true) || false
    }

    // @Desc: Fetches an array of existing networks
    socket.public.fetchNetworks = () => {
        if (!socket.public.isInstance()) return false
        const result = []
        for (const i in socket.private.network) {
            if (socket.public.isNetwork(i)) result.push(i)
        }
        return result
    }

    // @Desc: Creates a fresh network w/ specified name
    socket.public.createNetwork = (name, ...cArgs) => {
        if (!socket.public.isInstance()) return false
        if (socket.public.isNetwork(name)) return false
        socket.private.network[name] = CNetwork.create(`Socket:${vKit.vid.fetch(socket.public)}:${name}`, ...cArgs)
        return true
    }

    // @Desc: Destroys an existing network by specified name
    socket.public.destroyNetwork = (name) => {
        if (!socket.public.isInstance()) return false
        if (!socket.public.isNetwork(name)) return false
        socket.private.network[name].destroy()
        delete socket.private.network[name]
        return true
    }

    // @Desc: Attaches a handler on specified network
    socket.public.on = (name, ...cArgs) => {
        if (!socket.public.isInstance()) return false
        const cNetwork = socket.private.onFetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.on(...cArgs)
    }

    // @Desc: Detaches a handler from specified network
    socket.public.off = (name, ...cArgs) => {
        if (!socket.public.isInstance()) return false
        const cNetwork = socket.private.onFetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.off(...cArgs)
    }

    // @Desc: Emits to all attached non-callback handlers of specified network
    socket.public.emit = (name, isRemote, ...cArgs) => {
        if (!socket.public.isInstance()) return false
        if (isRemote) {
            if (vKit.isServer && !socket.public.isClient(isRemote)) return false
            const cReceiver = (vKit.isServer && socket.public.client.fetch(isRemote)) || socket.public.server
            cReceiver.socket.send(vKit.toBase64(JSON.stringify({
                networkName: name,
                networkArgs: cArgs
            })))
            return true
        }
        const cNetwork = socket.private.onFetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.emit(...cArgs)
    }

    // @Desc: Emits to attached callback handler of specified network
    socket.public.emitCallback = (name, isRemote, ...cArgs) => {
        if (!socket.public.isInstance()) return false
        if (isRemote) {
            if (vKit.isServer && !socket.public.isClient(isRemote)) return false
            const cReceiver = (vKit.isServer && socket.public.client.fetch(isRemote)) || socket.public.server
            const cQueue = (cReceiver && cReceiver.queue) || false
            if (!cQueue) return false
            const networkCB = {}
            const networkVID = vKit.vid.fetch(networkCB)
            const cPromise = new Promise((resolve, reject) => {
                cQueue[networkVID] = {
                    resolve: ((...cArgs) => {
                        delete cQueue[networkVID]
                        return resolve(...cArgs)
                    }),
                    reject: ((...cArgs) => {
                        delete cQueue[networkVID]
                        return reject(...cArgs)
                    })
                }
            })
            cReceiver.socket.send(vKit.toBase64(JSON.stringify({
                networkName: name,
                networkArgs: cArgs,
                networkCB: networkCB
            })))
            return cPromise
        }
        const cNetwork = socket.private.onFetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.emitCallback(...cArgs)
    }
})