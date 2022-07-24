
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
        return (!CServer.network.isVoid(name) && CServer.network.buffer[name]) || false
    }

    static create = function(name, ...cArgs) {
        if (!CServer.isConnected(true) || !CServer.network.isVoid(name)) return false
        CServer.network.buffer[name] = new CServer.network(name, ...cArgs)
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

    constructor(name, isCallback) {
        const self = this
        self.name = name
        self.isCallback = (CUtility.isBool(isCallback) && true) || false
        self.handler = (!self.isCallback && {}) || false
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
        const vid = CUtility.createVID(exec)
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
    }

    off(exec) {
        const self = this
        if (!self.isInstance() || !CUtility.isFunction(exec)) return false
        if (!exec.prototype.uid) return false
        if (!self.isCallback) {
            if (!self.handler[(exec.prototype.uid)]) return false
            delete self.handler[(exec.prototype.uid)]
        }
        else {
            if (!self.handler || (self.handler.prototype.uid != exec.prototype.uid)) return false
            self.handler = false
        }
        return true
    }

    emit(...cArgs) {
        const self = this
        if (!self.isInstance() || self.isCallback) return false
        for (const i in self.handler) {
            const j = self.handler[i]
            j.exec(...cArgs)
        }
        return true
    }
}
CServer.network = CNetwork