/*----------------------------------------------------------------
     Resource: vNetwork
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
    const cServer = vNetwork.create({
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
    vNetwork.util.print("* Socket-list:")
    vNetwork.util.print(Object.keys(cServer.socket.fetchSockets()))

    cSocket.onHeartbeat = function(client, id, deltaTick) {
        vNetwork.util.print(`* Client's [${client}] heartbeat [ID: ${id}] [ET: ${deltaTick}ms] received!`)
    }
    cSocket.onServerConnect = function() {
        vNetwork.util.print("* Server successfully connected!")
    }
    cSocket.onServerDisconnect = function(timestamp_start, timestamp_end, deltaTick) {
        vNetwork.util.print(`* Server successfully disconnected! | Life-Span: [${deltaTick}ms]`)
    }


    // @Non-Callback Network Examples
    cSocket.createNetwork("Server:MyNetwork")
    cSocket.on("Server:MyNetwork", function() {
        vNetwork.util.print("Non-Callback network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetwork.util.print("Non-Callback network | Handler 2")
        vNetwork.util.print(...cArgs)
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
    vNetwork.util.print(`Callback network | Result: ${networkCBResult}`)
    vNetwork.util.print("* Network-list:")
    vNetwork.util.print(cSocket.fetchNetworks())


    // @Room Examples
    cSocket.createRoom("Server:MyRoom")
    cSocket.destroyRoom("Server:MyRoom")
    cSocket.createRoom("Server:MyRoom")
    vNetwork.util.print("* Room-list:")
    vNetwork.util.print(cSocket.fetchRooms())

    cSocket.onClientConnect = async function(client) {
        vNetwork.util.print(`* Client connected [${client}]`)
        vNetwork.util.print("* Client-list:")
        vNetwork.util.print(cSocket.fetchClients())

        cSocket.joinRoom("Server:MyRoom", client)
        cSocket.emitRoom("Server:MyRoom", "Client:MyNetwork")
        const networkRemoteCBResult = await cSocket.emitCallback("Client:MyCBNetwork", client, 10, 20)
        vNetwork.util.print(`Remote-Callback network | Result: ${networkRemoteCBResult}`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetwork.util.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }

    cSocket.onClientJoinRoom = function(room, client) {
        vNetwork.util.print(`* Client [${client}] joined Room [${room}]`)
        vNetwork.util.print(`* Member-list:`)
        vNetwork.util.print(cSocket.fetchRoomMembers(room))
    }
    cSocket.onClientLeaveRoom = function(room, client) {
        vNetwork.util.print(`* Client [${client}] left Room [${room}]`)
    }


    // @Rest API Examples
    cServer.rest.create("get", "", function(request, response) {
        response.status(200).send("API Status Message")
    })
    cServer.rest.destroy("get", "")
    cServer.rest.create("get", "", function(request, response) {
        response.status(200).send({test: "Updated Status Message"})
    })
    var restAPIResult = await cServer.rest.fetch("get", "https://raw.githubusercontent.com/ov-studio/vNetwork/main/package.json")
    vNetwork.util.print(JSON.parse(restAPIResult))
}
debug()


async function debug2() {
    const cServer = vNetwork.create({
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
        vNetwork.util.print("* Server successfully connected!")
    }
    cSocket.onServerDisconnect = function(timestamp_start, timestamp_end, deltaTick) {
        vNetwork.util.print(`* Server successfully disconnected! | Life-Span: [${deltaTick}ms]`)
    }
    cSocket.onClientConnect = async function(client) {
        vNetwork.util.print(`* Client connected [${client}]`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetwork.util.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }
}
debug2()
