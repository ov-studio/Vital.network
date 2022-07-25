/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: debug: client.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Debugger
----------------------------------------------------------------*/


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
    cSocket.createNetwork("Client:MyNetwork")
    cSocket.onClientConnect = function(socket, vid) {
        console.log(`Client Connected [${vid}]`)
    }
    cSocket.onClientDisconnect = function(socket, vid) {
        console.log(`Client Disconnected [${vid}]`)
    }


    // @Non-Callback Network Examples
    cSocket.on("Client:MyNetwork", function() {
        vNetworkify.utility.print("Non Callback Network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetworkify.utility.print("Non Callback Network | Handler 2")
        vNetworkify.utility.print(...cArgs)
    }
    cSocket.on("Client:MyNetwork", secondaryExec)
    cSocket.off("Client:MyNetwork", secondaryExec)
    cSocket.emit("Client:MyNetwork", false, "Arg 1", "Arg 2")

    // @Callback Network Examples
    cSocket.createNetwork("Client:MyCBNetwork", true)
    cSocket.on("Client:MyCBNetwork", function(argA, argB) {
        return argA + argB
    })
    const networkCBResult = await cSocket.emitCallback("Client:MyCBNetwork", false, 1, 4)
    vNetworkify.utility.print(`Callback Network | Result: ${networkCBResult}`)
}
debug()