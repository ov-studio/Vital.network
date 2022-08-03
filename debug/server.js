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
    const isConnected = await vNetworkify.connect({
        port: 33021,
        isCaseSensitive: true
    })
    if (!isConnected) return false


    // @Socket API Examples
    const cSocket = vNetworkify.socket.create("Server:MyRoute", {
        heartbeat: {
            interval: 10000, // Interval at which heartbeat should be executed
            timeout: 60000 // Duration b/w each heartbeat
        }
    })
    vNetworkify.utility.print("* Socket-list:")
    vNetworkify.utility.print(Object.keys(vNetworkify.socket.fetchSockets()))

    cSocket.onHeartbeat = function(client, deltaTick) {
        vNetworkify.utility.print(`* Client's [${client}] heartbeat [${deltaTick}ms] received!`)
    }
    cSocket.onServerConnect = function() {
        vNetworkify.utility.print("* Server successfully connected!")
    }
    cSocket.onServerDisconnect = function(timestamp_start, timestamp_end, deltaTick) {
        vNetworkify.utility.print(`* Server successfully disconnected! | Life-Span: [${deltaTick}ms]`)
    }


    // @Non-Callback Network Examples
    cSocket.createNetwork("Server:MyNetwork")
    cSocket.on("Server:MyNetwork", function() {
        vNetworkify.utility.print("Non-Callback network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetworkify.utility.print("Non-Callback network | Handler 2")
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
    vNetworkify.utility.print(`Callback network | Result: ${networkCBResult}`)
    vNetworkify.utility.print("* Network-list:")
    vNetworkify.utility.print(cSocket.fetchNetworks())


    // @Room Examples
    cSocket.createRoom("Server:MyRoom")
    cSocket.destroyRoom("Server:MyRoom")
    cSocket.createRoom("Server:MyRoom")
    vNetworkify.utility.print("* Room-list:")
    vNetworkify.utility.print(cSocket.fetchRooms())

    cSocket.onClientConnect = async function(client) {
        vNetworkify.utility.print(`* Client connected [${client}]`)
        vNetworkify.utility.print("* Client-list:")
        vNetworkify.utility.print(cSocket.fetchClients())

        cSocket.joinRoom("Server:MyRoom", client)
        cSocket.emitRoom("Server:MyRoom", "Client:MyNetwork")
        const networkRemoteCBResult = await cSocket.emitCallback("Client:MyCBNetwork", client, 10, 20)
        vNetworkify.utility.print(`Remote-Callback network | Result: ${networkRemoteCBResult}`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetworkify.utility.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }

    cSocket.onClientJoinRoom = function(room, client) {
        vNetworkify.utility.print(`* Client [${client}] joined Room [${room}]`)
        vNetworkify.utility.print(`* Member-list:`)
        vNetworkify.utility.print(cSocket.fetchRoomMembers(room))
    }
    cSocket.onClientLeaveRoom = function(room, client) {
        vNetworkify.utility.print(`* Client [${client}] left Room [${room}]`)
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