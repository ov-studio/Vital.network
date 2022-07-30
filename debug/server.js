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
    vNetworkify.utility.print("* Socket List:")
    vNetworkify.utility.print(Object.keys(vNetworkify.socket.fetchSockets()))


    // @Non-Callback Network Examples
    cSocket.createNetwork("Server:MyNetwork")
    cSocket.on("Server:MyNetwork", function() {
        vNetworkify.utility.print("Non Callback Network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetworkify.utility.print("Non Callback Network | Handler 2")
        vNetworkify.utility.print(...cArgs)
    }
    cSocket.on("Server:MyNetwork", secondaryExec)
    cSocket.off("Server:MyNetwork", secondaryExec)
    cSocket.emit("Server:MyNetwork", false, "Arg 1", "Arg 2")

    // @Callback Network Examples
    cSocket.createNetwork("Server:MyCBNetwork", true)
    cSocket.on("Server:MyCBNetwork", function(argA, argB) {
        return argA + argB
    })
    const networkCBResult = await cSocket.emitCallback("Server:MyCBNetwork", false, 1, 4)
    vNetworkify.utility.print(`Callback Network | Result: ${networkCBResult}`)


    // @Room Examples
    cSocket.createRoom("Server:MyRoom")
    cSocket.destroyRoom("Server:MyRoom")
    cSocket.createRoom("Server:MyRoom")
    vNetworkify.utility.print("* Room List:")
    vNetworkify.utility.print(cSocket.fetchRooms())

    cSocket.onClientConnect = async function(client) {
        vNetworkify.utility.print(`* Client Connected [${client}]`)
        cSocket.joinRoom("Server:MyRoom", client)
        vNetworkify.utility.print("Room - 'Server:MyRoom' Members:")
        vNetworkify.utility.print(cSocket.fetchRoomMembers("Server:MyRoom"))

        cSocket.emitRoom("Server:MyRoom", "Client:MyNetwork")
        const networkRemoteCBResult = await cSocket.emitCallback("Client:MyCBNetwork", client, 10, 20)
        vNetworkify.utility.print(`Remote Callback Network | Result: ${networkRemoteCBResult}`)
    }
    cSocket.onClientDisconnect = function(client) {
        vNetworkify.utility.print(`* Client Disconnected [${client}]`)
    }


    // @Rest API Examples
    vNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("API Status Message")
    })
    vNetworkify.rest.destroy("get", "")
    vNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send({test: "Updated Status Message"})
    })
}
debug()