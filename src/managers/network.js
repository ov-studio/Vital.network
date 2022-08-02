/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managers: network.js
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

// @Desc: Verifies whether the network is void
CServer.network.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CUtility.isObject(CServer.network.buffer[name]) && true) || false
})

// @Desc: Fetches network instance by name
CServer.network.addMethod("fetch", function(name) {
    return (!CServer.network.isVoid(name) && CServer.network.buffer[name]) || false
})

// @Desc: Creates a fresh network w/ specified name
CServer.network.addMethod("create", function(name, ...cArgs) {
    if (!CServer.isConnected(true) || !CServer.network.isVoid(name)) return false
    CServer.network.buffer[name] = new CServer.network(name, ...cArgs)
    return CServer.network.buffer[name]
})

// @Desc: Destroys an existing network by specified name
CServer.network.addMethod("destroy", function(name) {
    if (CServer.network.isVoid(name)) return false
    return CServer.network.buffer[name].destroy()
})

// @Desc: Attaches a handler on specified network
CServer.network.addMethod("on", function(name, ...cArgs) {
    const cInstance = CServer.network.fetch(name)
    if (!cInstance) return false
    return cInstance.on(...cArgs)
})

// @Desc: Detaches a handler from specified network
CServer.network.addMethod("off", function(name, ...cArgs) {
    const cInstance = CServer.network.fetch(name)
    if (!cInstance) return false
    return cInstance.off(...cArgs)
})

// @Desc: Emits to all attached non-callback handlers of specified network
CServer.network.addMethod("emit", function(name, ...cArgs) {
    const cInstance = CServer.network.fetch(name)
    if (!cInstance) return false
    return cInstance.emit(...cArgs)
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance Constructor
CServer.network.addMethod("constructor", function(self, name, isCallback) {
    self.name = name
    self.isCallback = (CUtility.isBool(isCallback) && true) || false
    self.handler = (!self.isCallback && {}) || false
}, "isInstance")

// @Desc: Verifies instance's validity
CServer.network.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CServer.network.isVoid(self.name) && true) || false
})

// @Desc: Destroys the instance
CServer.network.addInstanceMethod("destroy", function(self) {
    CServer.network.buffer[(self.name)].isUnloaded = true
    delete CServer.network.buffer[(self.name)]
    return true
})

// @Desc: Attaches a handler on instance
CServer.network.addInstanceMethod("on", function(self, exec) {
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
CServer.network.addInstanceMethod("off", function(self, exec) {
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
CServer.network.addInstanceMethod("emit", function(self, ...cArgs) {
    if (self.isCallback) return false
    for (const i in self.handler) {
        const j = self.handler[i]
        j.exec(...cArgs)
    }
    return true
})

// @Desc: Emits to attached callback handler of instance
CServer.network.addInstanceMethod("emitCallback", async function(self, ...cArgs) {
    if (!self.isCallback || !self.handler) return false
    return await self.handler.exec(...cArgs)
})