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


///////////////////////
// Instance Members //
///////////////////////

const fetchNetwork = function(self, name) {
    return (self.isNetwork(name) && self.network[name]) || false
}

CServer.socket.addInstanceMethod("isNetwork", function(self, name) {
    return (CUtility.isString(name) && CUtility.isObject(self.network[name]) && self.network[name].isInstance() && true) || false
})

CServer.socket.addInstanceMethod("createNetwork", function(self, name, ...cArgs) {
    if (self.isNetwork(name)) return false
    self.network[name] = CServer.network.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
    self.network[name].queue = {}
    return true
})

CServer.socket.addInstanceMethod("destroyNetwork", function(self, name) {
    if (!self.isNetwork(name)) return false
    for (const i in self.network[name].queue) {
        self.network[name].queue[i].reject()
    }
    self.network[name].destroy()
    delete self.network[name]
    return true
})

CServer.socket.addInstanceMethod("on", function(self, name, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.on(...cArgs)
})

CServer.socket.addInstanceMethod("off", function(self, name, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.off(...cArgs)
})

CServer.socket.addInstanceMethod("emit", function(self, name, isRemote, ...cArgs) {
    if (isRemote) {
        if (CUtility.isServer && !self.isClient(isRemote)) return false
        const cReceiver = (CUtility.isServer && isRemote) || self.server
        cReceiver.send(JSON.stringify({
            networkName: name,
            networkArgs: cArgs
        }))
        return true
    }
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.emit(...cArgs)
})

CServer.socket.addInstanceMethod("emitCallback", function(self, name, isRemote, ...cArgs) {
    if (isRemote) {
        if (CUtility.isServer && !self.isClient(isRemote)) return false
        const cReceiver = (CUtility.isServer && isRemote) || self.server
        const networkCB = {}
        const vid = CUtility.fetchVID(networkCB)
        networkCB.queueID = vid
        const cPromise = new Promise(function(resolve, reject) {
            self.queue[vid] = {
                resolve: function(...cArgs) {
                    delete self.queue[vid]
                    return resolve(...cArgs)
                },
                reject: function(...cArgs) {
                    delete self.queue[vid]
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
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.emitCallback(...cArgs)
})

if (!CUtility.isServer) {

}
else {

}