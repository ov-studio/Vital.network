
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: managars: network.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Network Manager
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

const CUtility = require("../utilities")
const CServer = require("./server")(true)


/*-----------------
-- Class: Socket --
-----------------*/

class CNetwork {
    /////////////////////
    // Static Mmebers //
    ////////////////////

    static isClass = true
    static buffer = {}

    static isVoid = function(name) {
        return (CUtility.isString(name) && !CUtility.isObject(CServer.network.buffer[name]) && true) || false
    }

    static fetch = function(name) {
        return (!CServer.network.isVoid(name) && CServer.network.network[name]) || false
    }

    static create = function(name) {
        if (!CServer.isConnected() || !CServer.network.isVoid(name)) return false
        CServer.network.buffer[name] = new CServer.network(name)
        return CServer.network.buffer[name]
    }

    static destroy = function(name) {
        if (CServer.network.isVoid(name)) return false
        CServer.network.buffer[name].isUnloaded = true
        delete CServer.network.buffer[name]
        return true
    }

    static on = function(name, ...cArgs) {
        const cInstance = CServer.network.fetch(name)
        if (!cInstance) return false
        return cInstance.on(...cArgs)
    }

    static off = function(name, ...cArgs) {
        const cInstance = CServer.network.fetch(name)
        if (!cInstance) return false
        return cInstance.off(...cArgs)
    }

    static emit = function(name, ...cArgs) {
        const cInstance = CServer.network.fetch(name)
        if (!cInstance) return false
        return cInstance.emit(...cArgs)
    }


    ///////////////////////
    // Instance Mmebers //
    //////////////////////

    constructor(name) {
        const self = this
        self.name = name
        self.handler = {}
    }

    isInstance() {
        const self = this
        return (!self.isUnloaded && !CServer.network.isVoid(self.name) && true) || false
    }

    destroy() {
        const self = this
        if (!self.isInstance()) return false
        CServer.network.destroy(self.name)
        return true
    }

    on(exec) {
        const self = this
        if (!self.isInstance() || !CUtility.isFunction(exec)) return false
        if (!exec.prototype.uid) {
            Object.defineProperty(exec.prototype, "uid", {
                value: CUtility.genUID.v4(),
                enumerable: true,
                configurable: false,
                writable: false
            })
        }
        if (self.handler[(exec.prototype.uid)]) return false
        self.handler[(exec.prototype.uid)] = {
            exec: exec
        }
        return true
    }

    off(exec) {
        const self = this
        if (!self.isInstance() || !CUtility.isFunction(exec)) return false
        if (!exec.prototype.uid || !self.handler[(exec.prototype.uid)]) return false
        delete self.handler[(exec.prototype.uid)]
        return true
    }

    emit(...cArgs) {
        const self = this
        if (!self.isInstance()) return false
        for (const i in self.handler) {
            const j = self.handler[i]
            j.exec(...cArgs)
        }
        return true
    }
}
CServer.network = CNetwork