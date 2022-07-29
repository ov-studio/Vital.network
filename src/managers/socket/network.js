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
const CServer = require("../server")


/////////////////////
// Static Members //
/////////////////////

CServer.socket.addMethod("fetchNetwork", function(self, name) {
    return (self.isNetwork(name) && self.network[name]) || false
})

CServer.socket.addMethod("resolveCallback", function(self, clientVID, payload) {
    if (!CUtility.isObject(payload) || !payload.networkCB.isProcessed) return false
    if (CUtility.isServer && !self.isClient(clientVID)) return false
    const cReceiver = (CUtility.isServer && CServer.socket.client.fetch(clientVID)) || self
    const cQueue = (cReceiver && cReceiver.queue) || false
    const queueID = CUtility.fetchVID(payload.networkCB, null, true)
    if (!cQueue || !queueID || !CUtility.isObject(cQueue[queueID])) return false
    if (payload.networkCB.isErrored) cQueue[queueID].reject(...payload.networkArgs)
    else cQueue[queueID].resolve(...payload.networkArgs)
    return true
})


///////////////////////
// Instance Members //
///////////////////////

CServer.socket.addInstanceMethod("isNetwork", function(self, name) {
    return (CUtility.isString(name) && CUtility.isObject(self.network[name]) && self.network[name].isInstance() && true) || false
})

CServer.socket.addInstanceMethod("createNetwork", function(self, name, ...cArgs) {
    if (self.isNetwork(name)) return false
    self.network[name] = CServer.network.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
    return true
})

CServer.socket.addInstanceMethod("destroyNetwork", function(self, name) {
    if (!self.isNetwork(name)) return false
    self.network[name].destroy()
    delete self.network[name]
    return true
})

CServer.socket.addInstanceMethod("on", function(self, name, ...cArgs) {
    const cNetwork = CServer.socket.fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.on(...cArgs)
})

CServer.socket.addInstanceMethod("off", function(self, name, ...cArgs) {
    const cNetwork = CServer.socket.fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.off(...cArgs)
})

CServer.socket.addInstanceMethod("emit", function(self, name, isRemote, ...cArgs) {
    if (isRemote) {
        if (CUtility.isServer && !self.isClient(isRemote)) return false
        const cReceiver = (CUtility.isServer && CServer.socket.client.fetch(isRemote)) || self.server
        cReceiver.send(JSON.stringify({
            networkName: name,
            networkArgs: cArgs
        }))
        return true
    }
    const cNetwork = CServer.socket.fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.emit(...cArgs)
})

CServer.socket.addInstanceMethod("emitCallback", function(self, name, isRemote, ...cArgs) {
    if (isRemote) {
        if (CUtility.isServer && !self.isClient(isRemote)) return false
        const cQueue = (CUtility.isServer && isRemote.queue) || self.queue
        if (!cQueue) return false
        const cReceiver = (CUtility.isServer && CServer.socket.client.fetch(isRemote)) || self.server
        const networkCB = {}
        const networkVID = CUtility.fetchVID(networkCB)
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
        cReceiver.send(JSON.stringify({
            networkName: name,
            networkArgs: cArgs,
            networkCB: networkCB
        }))
        return cPromise
    }
    const cNetwork = CServer.socket.fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.emitCallback(...cArgs)
})