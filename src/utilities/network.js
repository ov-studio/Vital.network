/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: utilities: network.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Network Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("./")


/////////////////////
// Class: Network //
/////////////////////

CNetwork = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether the network is void
CNetwork.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CUtility.isObject(CNetwork.buffer[name]) && true) || false
})

// @Desc: Fetches network instance by name
CNetwork.addMethod("fetch", function(name) {
    return (!CNetwork.isVoid(name) && CNetwork.buffer[name]) || false
})

// @Desc: Creates a fresh network w/ specified name
CNetwork.addMethod("create", function(name, ...cArgs) {
    if (!CNetwork.isVoid(name)) return false
    CNetwork.buffer[name] = new CNetwork(name, ...cArgs)
    return CNetwork.buffer[name]
})

// @Desc: Destroys an existing network by specified name
CNetwork.addMethod("destroy", function(name) {
    if (CNetwork.isVoid(name)) return false
    return CNetwork.buffer[name].destroy()
})

// @Desc: Attaches a handler on specified network
CNetwork.addMethod("on", function(name, ...cArgs) {
    const cInstance = CNetwork.fetch(name)
    if (!cInstance) return false
    return cInstance.on(...cArgs)
})

// @Desc: Detaches a handler from specified network
CNetwork.addMethod("off", function(name, ...cArgs) {
    const cInstance = CNetwork.fetch(name)
    if (!cInstance) return false
    return cInstance.off(...cArgs)
})

// @Desc: Emits to all attached non-callback handlers of specified network
CNetwork.addMethod("emit", function(name, ...cArgs) {
    const cInstance = CNetwork.fetch(name)
    if (!cInstance) return false
    return cInstance.emit(...cArgs)
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CNetwork.addMethod("constructor", function(self, name, isCallback) {
    self.name = name
    self.isCallback = (CUtility.isBool(isCallback) && true) || false
    self.handler = (!self.isCallback && {}) || false
}, "isInstance")

// @Desc: Verifies instance's validity
CNetwork.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CNetwork.isVoid(self.name) && true) || false
})

// @Desc: Destroys the instance
CNetwork.addInstanceMethod("destroy", function(self) {
    CNetwork.buffer[(self.name)].isUnloaded = true
    delete CNetwork.buffer[(self.name)]
    return true
})

// @Desc: Attaches a handler on instance
CNetwork.addInstanceMethod("on", function(self, exec) {
    if (!CUtility.isFunction(exec)) return false
    if (!self.isCallback) {
        const execVID = CUtility.fetchVID(exec)
        if (self.handler[execVID]) return false
        self.handler[execVID] = {
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

// @Desc: Detaches a handler from instance
CNetwork.addInstanceMethod("off", function(self, exec) {
    if (!CUtility.isFunction(exec)) return false
    if (!self.isCallback) {
        const execVID = CUtility.fetchVID(exec, null, true)
        if (!execVID || !self.handler[execVID]) return false
        delete self.handler[execVID]
    }
    else {
        if (!self.handler || (exec != self.handler.exec)) return false
        self.handler = false
    }
    return true
})

// @Desc: Emits to all attached non-callback handlers of instance
CNetwork.addInstanceMethod("emit", function(self, ...cArgs) {
    if (self.isCallback) return false
    for (const i in self.handler) {
        const j = self.handler[i]
        j.exec(...cArgs)
    }
    return true
})

// @Desc: Emits to attached callback handler of instance
CNetwork.addInstanceMethod("emitCallback", async function(self, ...cArgs) {
    if (!self.isCallback || !self.handler) return false
    return await self.handler.exec(...cArgs)
})