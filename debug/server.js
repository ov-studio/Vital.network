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
    const cServer = vNetworkify.create({
        port: 33021,
        isCaseSensitive: true
    })
    const isConnected = await cServer.connect()
    if (!isConnected) return false


    // @Socket API Examples
    const cSocket = cServer.socket.create("Server:MyRoute", {
        heartbeat: {
            interval: 10000, // Interval at which heartbeat should be executed
            timeout: 60000 // Duration at which it should disconnect instance if no response is received
        }
    })
    vNetworkify.util.print("* Socket-list:")
    vNetworkify.util.print(Object.keys(cServer.socket.fetchSockets()))

    cSocket.onHeartbeat = function(client, deltaTick) {
        vNetworkify.util.print(`* Client's [${client}] heartbeat [${deltaTick}ms] received!`)
    }
    cSocket.onServerConnect = function() {
        vNetworkify.util.print("* Server successfully connected!")
    }
    cSocket.onServerDisconnect = function(timestamp_start, timestamp_end, deltaTick) {
        vNetworkify.util.print(`* Server successfully disconnected! | Life-Span: [${deltaTick}ms]`)
    }


    // @Non-Callback Network Examples
    cSocket.createNetwork("Server:MyNetwork")
    cSocket.on("Server:MyNetwork", function() {
        vNetworkify.util.print("Non-Callback network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetworkify.util.print("Non-Callback network | Handler 2")
        vNetworkify.util.print(...cArgs)
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
    vNetworkify.util.print(`Callback network | Result: ${networkCBResult}`)
    vNetworkify.util.print("* Network-list:")
    vNetworkify.util.print(cSocket.fetchNetworks())


    // @Room Examples
    cSocket.createRoom("Server:MyRoom")
    cSocket.destroyRoom("Server:MyRoom")
    cSocket.createRoom("Server:MyRoom")
    vNetworkify.util.print("* Room-list:")
    vNetworkify.util.print(cSocket.fetchRooms())

    cSocket.onClientConnect = async function(client) {
        vNetworkify.util.print(`* Client connected [${client}]`)
        vNetworkify.util.print("* Client-list:")
        vNetworkify.util.print(cSocket.fetchClients())

        cSocket.joinRoom("Server:MyRoom", client)
        cSocket.emitRoom("Server:MyRoom", "Client:MyNetwork")
        const networkRemoteCBResult = await cSocket.emitCallback("Client:MyCBNetwork", client, 10, 20)
        vNetworkify.util.print(`Remote-Callback network | Result: ${networkRemoteCBResult}`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetworkify.util.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }

    cSocket.onClientJoinRoom = function(room, client) {
        vNetworkify.util.print(`* Client [${client}] joined Room [${room}]`)
        vNetworkify.util.print(`* Member-list:`)
        vNetworkify.util.print(cSocket.fetchRoomMembers(room))
    }
    cSocket.onClientLeaveRoom = function(room, client) {
        vNetworkify.util.print(`* Client [${client}] left Room [${room}]`)
    }


    // @Rest API Examples
    cServer.rest.create("get", "", function(request, response) {
        response.status(200).send("API Status Message")
    })
    cServer.rest.destroy("get", "")
    cServer.rest.create("get", "", function(request, response) {
        response.status(200).send({test: "Updated Status Message"})
    })
}
debug()


async function debug2() {
    const cServer = vNetworkify.create({
        port: 33022,
        isCaseSensitive: true
    })
    const isConnected = await cServer.connect()
    if (!isConnected) return false

    // @Socket API Examples
    const cSocket = cServer.socket.create("Server:MyRoute", {
        heartbeat: {
            interval: 10000, // Interval at which heartbeat should be executed
            timeout: 60000 // Duration at which it should disconnect instance if no response is received
        }
    })

    cSocket.onServerConnect = function() {
        vNetworkify.util.print("* Server successfully connected!")
    }
    cSocket.onServerDisconnect = function(timestamp_start, timestamp_end, deltaTick) {
        vNetworkify.util.print(`* Server successfully disconnected! | Life-Span: [${deltaTick}ms]`)
    }
    cSocket.onClientConnect = async function(client) {
        vNetworkify.util.print(`* Client connected [${client}]`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetworkify.util.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }
}
debug2()
