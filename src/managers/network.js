/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managars: network.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Network Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("../utilities")
const CServer = require("./server")


/////////////////////
// Class: Network //
/////////////////////

CServer.network = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

CServer.network.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CUtility.isObject(CServer.network.buffer[name]) && true) || false
})

CServer.network.addMethod("fetch", function(name) {
    return (!CServer.network.isVoid(name) && CServer.network.buffer[name]) || false
})

CServer.network.addMethod("create", function(name, ...cArgs) {
    if (!CServer.isConnected(true) || !CServer.network.isVoid(name)) return false
    CServer.network.buffer[name] = new CServer.network(name, ...cArgs)
    return CServer.network.buffer[name]
})

CServer.network.addMethod("destroy", function(name) {
    if (CServer.network.isVoid(name)) return false
    CServer.network.buffer[name].isUnloaded = true
    delete CServer.network.buffer[name]
    return true
})

CServer.network.addMethod("on", function(name, ...cArgs) {
    const cInstance = CServer.network.fetch(name)
    if (!cInstance) return false
    return cInstance.on(...cArgs)
})

CServer.network.addMethod("off", function(name, ...cArgs) {
    const cInstance = CServer.network.fetch(name)
    if (!cInstance) return false
    return cInstance.off(...cArgs)
})

CServer.network.addMethod("emit", function(name, ...cArgs) {
    const cInstance = CServer.network.fetch(name)
    if (!cInstance) return false
    return cInstance.emit(...cArgs)
})


///////////////////////
// Instance Mmebers //
//////////////////////

CServer.network.addMethod("constructor", function(self, name, isCallback) {
    self.name = name
    self.isCallback = (CUtility.isBool(isCallback) && true) || false
    self.handler = (!self.isCallback && {}) || false
}, "isInstance")

CServer.network.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CServer.network.isVoid(self.name) && true) || false
})

CServer.network.addInstanceMethod("destroy", function(self) {
    CServer.network.destroy(self.name)
    return true
})

CServer.network.addInstanceMethod("on", function(self, exec) {
    if (!CUtility.isFunction(exec)) return false
    const vid = CUtility.fetchVID(exec)
    if (!self.isCallback) {
        if (self.handler[vid]) return false
        self.handler[vid] = {
            exec: exec
        }
    }
    else {
        if (self.handler) return false
        self.handler = {
            exec: exec
        }
    }
    return true
})

CServer.network.addInstanceMethod("off", function(self, exec) {
    if (!CUtility.isFunction(exec)) return false
    if (!self.isCallback) {
        const vid = CUtility.fetchVID(exec)
        if (!self.handler[vid]) return false
        delete self.handler[vid]
    }
    else {
        if (!self.handler || (CUtility.fetchVID(exec) != CUtility.fetchVID(self.handler))) return false
        self.handler = false
    }
    return true
})

CServer.network.addInstanceMethod("emit", function(self, ...cArgs) {
    if (self.isCallback) return false
    for (const i in self.handler) {
        const j = self.handler[i]
        j.exec(...cArgs)
    }
    return true
})

CServer.network.addInstanceMethod("emitCallback", async function(self, ...cArgs) {
    if (!self.isCallback || !self.handler) return false
    return await self.handler.exec(...cArgs)
})