/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: socket: network.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket: Network Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../../utilities")
const CNetwork = require("../../utilities/network")

CNetwork.fetch("vNetworkify:Socket:onCreate").on(function(socket) {
    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Fetches network instance by name
    socket.private.onFetchNetwork = function(name) {
        if (!socket.public.isInstance()) return false
        return (socket.public.isNetwork(name) && socket.private.network[name]) || false
    }

    // @Desc: Resolves an awaiting callback network's handler
    socket.private.onResolveNetwork = function(client, payload) {
        if (!socket.public.isInstance()) return false
        if (!CUtility.isObject(payload) || !payload.networkCB.isProcessed) return false
        if (CUtility.isServer && !socket.public.isClient(client)) return false
        const cReceiver = (CUtility.isServer && socket.public.client.fetch(client)) || socket.public
        const cQueue = (cReceiver && cReceiver.queue) || false
        const queueID = CUtility.vid.fetch(payload.networkCB, null, true)
        if (!cQueue || !queueID || !cQueue[queueID]) return false
        if (payload.networkCB.isErrored) cQueue[queueID].reject(...payload.networkArgs)
        else cQueue[queueID].resolve(...payload.networkArgs)
        return true
    }

    // @Desc: Verifies network's validity
    socket.public.isNetwork = function(name) {
        if (!socket.public.isInstance()) return false
        return (CUtility.isString(name) && socket.private.network[name] && true) || false
    }

    // @Desc: Fetches an array of existing networks
    socket.public.fetchNetworks = function() {
        if (!socket.public.isInstance()) return false
        const result = []
        for (const i in socket.private.network) {
            if (socket.public.isNetwork(i)) result.push(i)
        }
        return result
    }

    // @Desc: Creates a fresh network w/ specified name
    socket.public.createNetwork = function(name, ...cArgs) {
        if (!socket.public.isInstance()) return false
        if (socket.public.isNetwork(name)) return false
        socket.private.network[name] = CNetwork.create(`Socket:${CUtility.vid.fetch(socket.public)}:${name}`, ...cArgs)
        return true
    }

    // @Desc: Destroys an existing network by specified name
    socket.public.destroyNetwork = function(name) {
        if (!socket.public.isInstance()) return false
        if (!socket.public.isNetwork(name)) return false
        socket.private.network[name].destroy()
        delete socket.private.network[name]
        return true
    }

    // @Desc: Attaches a handler on specified network
    socket.public.on = function(name, ...cArgs) {
        if (!socket.public.isInstance()) return false
        const cNetwork = socket.private.onFetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.on(...cArgs)
    }

    // @Desc: Detaches a handler from specified network
    socket.public.off = function(name, ...cArgs) {
        if (!socket.public.isInstance()) return false
        const cNetwork = socket.private.onFetchNetwork(name)
        if (!cNetwork) return false
        return cNetwork.off(...cArgs)
    }

    // @Desc: Emits to all attached non-callback handlers of specified network
    socket.public.emit = function(name, isRemote, ...cArgs) {
        if (!socket.public.isInstance()) return false
        if (isRemote) {
            if (CUtility.isServer && !socket.public.isClient(isRemote)) return false
            const cReceiver = (CUtility.isServer && socket.public.client.fetch(isRemote)) || socket.public.server
            cReceiver.socket.send(CUtility.toBase64(JSON.stringify({
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
    socket.public.emitCallback = function(name, isRemote, ...cArgs) {
        if (!socket.public.isInstance()) return false
        if (isRemote) {
            if (CUtility.isServer && !socket.public.isClient(isRemote)) return false
            const cReceiver = (CUtility.isServer && socket.public.client.fetch(isRemote)) || socket.public.server
            const cQueue = (cReceiver && cReceiver.queue) || false
            if (!cQueue) return false
            const networkCB = {}
            const networkVID = CUtility.vid.fetch(networkCB)
            const cPromise = new Promise(function(resolve, reject) {
                cQueue[networkVID] = {
                    resolve: function(...cArgs) {
                        delete cQueue[networkVID]
                        return resolve(...cArgs)
                    },
                    reject: function(...cArgs) {
                        delete cQueue[networkVID]
                        return reject(...cArgs)
                    }
                }
            })
            cReceiver.socket.send(CUtility.toBase64(JSON.stringify({
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