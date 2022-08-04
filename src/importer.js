/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: importer.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Importer
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("./utilities")
const CServer = require("./managers/server")
require("./managers/rest")
require("./managers/socket/")
/*
require("./managers/socket/client")
require("./managers/socket/network")
require("./managers/socket/room")
*/


//////////////
// Exports //
//////////////

const vNetworkify = CUtility.createAPIs(CServer, {
    socket: {
        client: true,
        fetchNetwork: true,
        resolveCallback: true
    }
})
vNetworkify.util = CUtility
CUtility.global.vNetworkify = vNetworkify
module.exports = vNetworkify


// TODO: TESTING


async function exec() {
    const test = CServer.create({
        port: 33021,
        isCaseSensitive: true
    })
    const isConnected = await test.connect()
    if (!isConnected) return false

    const cSocket = test.socket.create("Server:MyRoute", {
        heartbeat: {
            interval: 10000, // Interval at which heartbeat should be executed
            timeout: 60000 // Duration b/w each heartbeat
        }
    })
    console.log(cSocket)

    test.rest.create("get", "", function(request, response) {
        response.status(200).send("API Status Message")
    })
    test.rest.destroy("get", "")
    test.rest.create("get", "", function(request, response) {
        response.status(200).send({test: "Updated Status Message"})
    })
}
setTimeout(() => exec(), 2000)