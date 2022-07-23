
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: managars: socket.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket Manager
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

const CWS = require("ws")
const CUtility = require("../utilities")
const CServer = require("./server")(true)


/*------------------
-- Class: CSocket --
------------------*/

class CSocket {
    /////////////////////
    // Static Mmebers //
    ////////////////////

    static route = {}

    static isVoid(route) {
        return (CUtility.isString(route) && !CUtility.isObject(CServer.socket.route[route]) && true) || false
    }

    static create(route) {
        if (!CServer.socket.isVoid(route)) return false
        CServer.socket.route[route] = new CServer.socket(route)
        return true
    }

    static destroy(route) {
        if (CServer.socket.isVoid(route)) return false
        CServer.socket.route[route].isUnloaded = true
        delete CServer.socket.route[route]
        return true
    }


    ///////////////////////
    // Instance Mmebers //
    //////////////////////

    constructor(route) {
        const self = this
        self.route = route
        self.instance = {}, self.room = {}
        self.server = new CWS.Server({
            noServer: true,
            path: "/" + self.route
        })
        self.server.on("connection", function(socket, request) {
            self.instance[socket] = {}
            // TODO: REMOVE LATER
            CUtility.print("CONNECTED SOCKET")
        })
    }

    isValid() {
        const self = this
        return (!self.isUnloaded && self.route && CSocket.route[(self.route)] && true) || false
    }

    destroy() {
        const self = this
        if (!self.isValid()) return false
        CServer.socket.destroy(this.route)
        return true
    }
}
CServer.socket = CSocket

const testRT = CServer.socket.create("test")