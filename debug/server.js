
/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: debug: server.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Debugger
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

require("../src/importer")


///////////////
// Debugger //
///////////////

async function debug() {
    const isConnected = await(vNetworkify.connect(33021, {
        isCaseSensitive: true
    }))
    if (!isConnected) return false

    
    // @Socket API Examples
    const cSocket = vNetworkify.socket.create("Server:MyRoute")
    cSocket.createNetwork("Server:MyNetwork")


    // @Non-Callback Network Examples
    cSocket.on("Server:MyNetwork", function() {
        vNetworkify.utility.print("Non Callback Network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetworkify.utility.print("Non Callback Network | Handler 2")
        vNetworkify.utility.print(...cArgs)
    }
    cSocket.on("Server:MyNetwork", secondaryExec)
    cSocket.off("Server:MyNetwork", secondaryExec)
    cSocket.emit("Server:MyNetwork", false, "Argdebug1", "Argdebug2")

    // @Callback Network Examples
    cSocket.createNetwork("Server:MyCBNetwork", true)
    cSocket.on("Server:MyCBNetwork", function(argA, argB) {
        return argA + argB
    })
    const networkCBResult = await cSocket.emitCallback("Server:MyCBNetwork", false, 1, 4)
    vNetworkify.utility.print(`Callback Network | Result: ${toString(networkCBResult)}`)


    // @Room Examples
    cSocket.createRoom("Server:MyRoom")
    cSocket.destroyRoom("Server:MyRoom")
    cSocket.createRoom("Server:MyRoom")
    cSocket.emitRoom("Client:MyNetwork", "Argdebug1", "Argdebug2")


    // @Rest API Examples
    vNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("API Status Message")
    })
    vNetworkify.rest.destroy("get", "")
    vNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("Updated Status Message")
    })
}
debug()