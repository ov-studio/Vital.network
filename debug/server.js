/*----------------------------------------------------------------
     Resource: Vital.network
     Script: debug: server.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Debugger
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

require("../src/")


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
    vKit.print("* Socket-list:")
    vKit.print(Object.keys(cServer.socket.fetchSockets()))

    cSocket.onHeartbeat = function(client, id, deltaTick) {
        vKit.print(`* Client's [${client}] heartbeat [ID: ${id}] [ET: ${deltaTick}ms] received!`)
    }
    cSocket.onServerConnect = function() {
        vKit.print("* Server successfully connected!")
    }
    cSocket.onServerDisconnect = function(timestamp_start, timestamp_end, deltaTick) {
        vKit.print(`* Server successfully disconnected! | Life-Span: [${deltaTick}ms]`)
    }


    // @Non-Callback Network Examples
    cSocket.createNetwork("Server:MyNetwork")
    cSocket.on("Server:MyNetwork", function() {
        vKit.print("Non-Callback network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vKit.print("Non-Callback network | Handler 2")
        vKit.print(...cArgs)
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
    vKit.print(`Callback network | Result: ${networkCBResult}`)
    vKit.print("* Network-list:")
    vKit.print(cSocket.fetchNetworks())


    // @Room Examples
    cSocket.createRoom("Server:MyRoom")
    cSocket.destroyRoom("Server:MyRoom")
    cSocket.createRoom("Server:MyRoom")
    vKit.print("* Room-list:")
    vKit.print(cSocket.fetchRooms())

    cSocket.onClientConnect = async function(client) {
        vKit.print(`* Client connected [${client}]`)
        vKit.print("* Client-list:")
        vKit.print(cSocket.fetchClients())

        cSocket.joinRoom("Server:MyRoom", client)
        cSocket.emitRoom("Server:MyRoom", "Client:MyNetwork")
        const networkRemoteCBResult = await cSocket.emitCallback("Client:MyCBNetwork", client, 10, 20)
        vKit.print(`Remote-Callback network | Result: ${networkRemoteCBResult}`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vKit.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }

    cSocket.onClientJoinRoom = function(room, client) {
        vKit.print(`* Client [${client}] joined Room [${room}]`)
        vKit.print(`* Member-list:`)
        vKit.print(cSocket.fetchRoomMembers(room))
    }
    cSocket.onClientLeaveRoom = function(room, client) {
        vKit.print(`* Client [${client}] left Room [${room}]`)
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
    vKit.print(JSON.parse(restAPIResult))
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
        vKit.print("* Server successfully connected!")
    }
    cSocket.onServerDisconnect = function(timestamp_start, timestamp_end, deltaTick) {
        vKit.print(`* Server successfully disconnected! | Life-Span: [${deltaTick}ms]`)
    }
    cSocket.onClientConnect = async function(client) {
        vKit.print(`* Client connected [${client}]`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vKit.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }
}
debug2()
