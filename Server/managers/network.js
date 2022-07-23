
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

    static fetchInstance = function(name) {
        return (CServer.network.isVoid(name) && CServer.network.network[name]) || false
    }


    ///////////////////////
    // Instance Mmebers //
    //////////////////////

    constructor(name) {
        const self = this
        self.name = name
        self.handlers = {}
        console.log("CREATED NETWORK")
    }

    isInstance() {
        const self = this
        return (!self.isUnloaded && self.name && CServer.network.buffer[(self.name)] && true) || false
    }

    on(name, exec) {
        const self = this
        if (!self.isInstance(name) || !CUtility.isFunction(exec) || self.network[name].handlers[exec]) return false
        self.network[name].handlers[exec] = {}
        return true
    }

    off(name, exec) {
        const self = this
        if (!self.isInstance(name) || !CUtility.isFunction(exec) || !self.network[name].handlers[exec]) return false
        delete self.network[name].handlers[exec]
        return true
    }

    emit(name, ...cArgs) {
        if (!self.isInstance(name)) return false
        for (const i in self.network[name].handlers) {
            const j = self.network[name].handlers[i]
            j(...cArgs)
        }
        return true
    }
}
CServer.network = CNetwork