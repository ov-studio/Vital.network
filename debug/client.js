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
    vNetworkify.utility.print("* Socket List:")
    vNetworkify.utility.print(Object.keys(vNetworkify.socket.fetchSockets()))

    cSocket.onClientConnect = function(client) {
        vNetworkify.utility.print(`* Client Connected [${client}]`)
    }
    cSocket.onClientDisconnect = function(client) {
        vNetworkify.utility.print(`* Client Disconnected [${client}]`)
    }
    const isSocketConnected = await cSocket.isConnected()
    if (!isSocketConnected) return false


    // @Non-Callback Network Examples
    cSocket.createNetwork("Client:MyNetwork")
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
    vNetworkify.utility.print("* Network List:")
    vNetworkify.utility.print(cSocket.fetchNetworks())

    const networkCBResult = await cSocket.emitCallback("Client:MyCBNetwork", false, 1, 4)
    vNetworkify.utility.print(`Callback Network | Result: ${networkCBResult}`)
    const networkRemoteCBResult = await cSocket.emitCallback("Server:MyCBNetwork", true, 100, 200)
    vNetworkify.utility.print(`Remote Callback Network | Result: ${networkRemoteCBResult}`)


    //@Room Examples
    cSocket.onClientJoinRoom = function(room, client) {
        vNetworkify.utility.print(`* Client [${client}] Joined Room: ${room}`)
        vNetworkify.utility.print(`Room - '${room}' Members:`)
        vNetworkify.utility.print(cSocket.fetchRoomMembers(room))
    }
    cSocket.onClientLeaveRoom = function(room, client) {
        vNetworkify.utility.print(`* Client [${client}] Left Room: ${room}`)
        vNetworkify.utility.print(`Room - '${room}' Members:`)
        vNetworkify.utility.print(cSocket.fetchRoomMembers(room))
    }


    // @Rest API Examples
    var restAPIResult = await vNetworkify.rest.fetch("get", "http://localhost:33021/")
    restAPIResult = await restAPIResult.json()
    vNetworkify.utility.print(restAPIResult)
    var restAPIResult = await vNetworkify.rest.fetch("get", "http://localhost:33021/invalid")
    restAPIResult = await restAPIResult.json()
    vNetworkify.utility.print(restAPIResult)
}
debug()