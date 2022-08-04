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
    // @Desc: Fetches network instance by name
    socket.private.onFetchNetwork = function(self, name) {
        if (isUnloaded) return false
        return (self.isNetwork(name) && self.network[name]) || false
    }

    // @Desc: Resolves an awaiting callback network's handler
    socket.private.onResolveNetwork = function(self, client, payload) {
        if (isUnloaded) return false
        if (!CUtility.isObject(payload) || !payload.networkCB.isProcessed) return false
        if (CUtility.isServer && !self.isClient(client)) return false
        const cReceiver = (CUtility.isServer && socket.private.client.fetch(client)) || self
        const cQueue = (cReceiver && cReceiver.queue) || false
        const queueID = CUtility.vid.fetch(payload.networkCB, null, true)
        if (!cQueue || !queueID || !cQueue[queueID]) return false
        if (payload.networkCB.isErrored) cQueue[queueID].reject(...payload.networkArgs)
        else cQueue[queueID].resolve(...payload.networkArgs)
        return true
    }


    ///////////////////////
    // Instance Members //
    ///////////////////////

    // @Desc: Verifies network's validity
    socket.public.isNetwork = function(self, name) {
        if (isUnloaded) return false
        return (CUtility.isString(name) && self.network[name] && true) || false
    }

    // @Desc: Fetches an array of existing networks
    socket.public.fetchNetworks = function(self) {
        if (isUnloaded) return false
        const result = []
        for (const i in self.network) {
            if (self.isNetwork(i)) result.push(i)
        }
        return result
    }

    // @Desc: Creates a fresh network w/ specified name
    socket.public.createNetwork = function(self, name, ...cArgs) {
        if (isUnloaded) return false
        if (self.isNetwork(name)) return false
        self.network[name] = CNetwork.create(`Socket:${CUtility.vid.fetch(self)}:${name}`, ...cArgs)
        return true
    }

    // @Desc: Destroys an existing network by specified name
    socket.public.destroyNetwork = function(self, name) {
        if (isUnloaded) return false
        if (!self.isNetwork(name)) return false
        self.network[name].destroy()
        delete self.network[name]
        return true
    }

    // @Desc: Attaches a handler on specified network
    socket.public.on = function(self, name, ...cArgs) {
        if (isUnloaded) return false
        const cNetwork = socket.private.onFetchNetwork(self, name)
        if (!cNetwork) return false
        return cNetwork.on(...cArgs)
    }

    // @Desc: Detaches a handler from specified network
    socket.public.off = function(self, name, ...cArgs) {
        if (isUnloaded) return false
        const cNetwork = socket.private.onFetchNetwork(self, name)
        if (!cNetwork) return false
        return cNetwork.off(...cArgs)
    }

    // @Desc: Emits to all attached non-callback handlers of specified network
    socket.public.emit = function(self, name, isRemote, ...cArgs) {
        if (isUnloaded) return false
        if (isRemote) {
            if (CUtility.isServer && !self.isClient(isRemote)) return false
            const cReceiver = (CUtility.isServer && socket.private.client.fetch(isRemote)) || self.server
            cReceiver.socket.send(CUtility.toBase64(JSON.stringify({
                networkName: name,
                networkArgs: cArgs
            })))
            return true
        }
        const cNetwork = socket.private.onFetchNetwork(self, name)
        if (!cNetwork) return false
        return cNetwork.emit(...cArgs)
    }

    // @Desc: Emits to attached callback handler of specified network
    socket.public.emitCallback = function(self, name, isRemote, ...cArgs) {
        if (isUnloaded) return false
        if (isRemote) {
            if (CUtility.isServer && !self.isClient(isRemote)) return false
            const cReceiver = (CUtility.isServer && socket.private.client.fetch(isRemote)) || self.server
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
        const cNetwork = socket.private.onFetchNetwork(self, name)
        if (!cNetwork) return false
        return cNetwork.emitCallback(...cArgs)
    }
})