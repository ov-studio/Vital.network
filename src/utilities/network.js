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

const CNetwork = CUtility.createClass()
CNetwork.private.buffer = {}


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether the network is void
CNetwork.public.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CNetwork.private.buffer[name] && true) || false
})

// @Desc: Fetches network instance by name
CNetwork.public.addMethod("fetch", function(name) {
    return (!CNetwork.public.isVoid(name) && CNetwork.private.buffer[name]) || false
})

// @Desc: Creates a fresh network w/ specified name
CNetwork.public.addMethod("create", function(name, ...cArgs) {
    if (!CNetwork.public.isVoid(name)) return false
    CNetwork.private.buffer[name] = CNetwork.public.createInstance(name, ...cArgs)
    return CNetwork.private.buffer[name]
})

// @Desc: Destroys an existing network by specified name
CNetwork.public.addMethod("destroy", function(name) {
    if (CNetwork.public.isVoid(name)) return false
    return CNetwork.private.buffer[name].destroy()
})

// @Desc: Attaches a handler on specified network
CNetwork.public.addMethod("on", function(name, ...cArgs) {
    const cInstance = CNetwork.public.fetch(name)
    if (!cInstance) return false
    return cInstance.on(...cArgs)
})

// @Desc: Detaches a handler from specified network
CNetwork.public.addMethod("off", function(name, ...cArgs) {
    const cInstance = CNetwork.public.fetch(name)
    if (!cInstance) return false
    return cInstance.off(...cArgs)
})

// @Desc: Emits to all attached non-callback handlers of specified network
CNetwork.public.addMethod("emit", function(name, ...cArgs) {
    const cInstance = CNetwork.public.fetch(name)
    if (!cInstance) return false
    return cInstance.emit(...cArgs)
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CNetwork.public.addMethod("constructor", function(self, name, isCallback) {
    const private = CNetwork.instance.get(self)
    private.name = name
    private.isCallback = (CUtility.isBool(isCallback) && true) || false
    self.isCallback = private.isCallback
    private.handler = (!private.isCallback && {}) || false
})

// @Desc: Destroys the instance
CNetwork.public.addInstanceMethod("destroy", function(self) {
    const private = CNetwork.instance.get(self)
    delete CNetwork.private.buffer[(private.name)]
    self.destroyInstance()
    return true
})

// @Desc: Attaches a handler on instance
CNetwork.public.addInstanceMethod("on", function(self, exec) {
    const private = CNetwork.instance.get(self)
    if (!CUtility.isFunction(exec)) return false
    if (!private.isCallback) {
        const execVID = CUtility.vid.fetch(exec)
        if (private.handler[execVID]) return false
        private.handler[execVID] = {
            exec: exec
        }
    }
    else {
        if (private.handler) return false
        private.handler = {
            exec: exec
        }
    }
    return true
})

// @Desc: Detaches a handler from instance
CNetwork.public.addInstanceMethod("off", function(self, exec) {
    const private = CNetwork.instance.get(self)
    if (!CUtility.isFunction(exec)) return false
    if (!private.isCallback) {
        const execVID = CUtility.vid.fetch(exec, null, true)
        if (!execVID || !private.handler[execVID]) return false
        delete private.handler[execVID]
    }
    else {
        if (!private.handler || (exec != private.handler.exec)) return false
        private.handler = false
    }
    return true
})

// @Desc: Emits to all attached non-callback handlers of instance
CNetwork.public.addInstanceMethod("emit", function(self, ...cArgs) {
    const private = CNetwork.instance.get(self)
    if (private.isCallback) return false
    for (const i in private.handler) {
        const j = private.handler[i]
        j.exec(...cArgs)
    }
    return true
})

// @Desc: Emits to attached callback handler of instance
CNetwork.public.addInstanceMethod("emitCallback", async function(self, ...cArgs) {
    const private = CNetwork.instance.get(self)
    if (!private.isCallback || !private.handler) return false
    return await private.handler.exec(...cArgs)
})


//////////////
// Exports //
//////////////

module.exports = CNetwork.public