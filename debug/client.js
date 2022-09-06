/*----------------------------------------------------------------
     Resource: vNetwork
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
    const cServer = vNetwork.create({
        port: 33021,
        isSSL: false
    })
    const isConnected = await cServer.connect()
    if (!isConnected) return false
    

    // @Socket API Examples
    const cSocket = cServer.socket.create("Server:MyRoute", {
        heartbeat: {
            interval: 10000, // Interval at which heartbeat should be executed
            timeout: 60000 // Duration at which it should disconnect instance if no response is received
        },
        reconnection: {
            attempts: -1, // Number of attempts before onClientDisconnect is reached. [Note: -1 = infinite attempts]
            interval: 2500 // Duration b/w each attempt
        }
    })
    vNetwork.util.print("* Socket-list:")
    vNetwork.util.print(Object.keys(cServer.socket.fetchSockets()))

    cSocket.onHeartbeat = function(id, deltaTick) {
        vNetwork.util.print(`* Server's heartbeat [ID: ${id}] [ET: ${deltaTick}ms] received!`)
    }
    cSocket.onClientConnect = function(client) {
        vNetwork.util.print(`* Client connected [${client}]`)
    }
    cSocket.onClientReconnect = function(client, currentAttempt, maxAttempts) {
        vNetwork.util.print(`* Client reconnecting [${client}] | Attempts: ${currentAttempt}/${maxAttempts}`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetwork.util.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }
    const isSocketConnected = await cSocket.isConnected()
    if (!isSocketConnected) return false


    // @Non-Callback Network Examples
    cSocket.createNetwork("Client:MyNetwork")
    cSocket.on("Client:MyNetwork", function() {
        vNetwork.util.print("Non-Callback network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetwork.util.print("Non-Callback network | Handler 2")
        vNetwork.util.print(...cArgs)
    }
    cSocket.on("Client:MyNetwork", secondaryExec)
    cSocket.off("Client:MyNetwork", secondaryExec)
    cSocket.emit("Client:MyNetwork", false, "Arg 1", "Arg 2")

    // @Callback Network Examples
    cSocket.createNetwork("Client:MyCBNetwork", true)
    cSocket.on("Client:MyCBNetwork", function(argA, argB) {
        return argA + argB
    })
    vNetwork.util.print("* Network-list:")
    vNetwork.util.print(cSocket.fetchNetworks())

    const networkCBResult = await cSocket.emitCallback("Client:MyCBNetwork", false, 1, 4)
    vNetwork.util.print(`Callback network | Result: ${networkCBResult}`)
    const networkRemoteCBResult = await cSocket.emitCallback("Server:MyCBNetwork", true, 100, 200)
    vNetwork.util.print(`Remote-Callback network | Result: ${networkRemoteCBResult}`)


    //@Room Examples
    cSocket.onClientJoinRoom = function(room, client) {
        vNetwork.util.print(`* Client [${client}] joined Room [${room}]`)
        vNetwork.util.print(`* Member-list:`)
        vNetwork.util.print(cSocket.fetchRoomMembers(room))
    }
    cSocket.onClientLeaveRoom = function(room, client) {
        vNetwork.util.print(`* Client [${client}] left Room [${room}]`)
    }


    // @Rest API Examples
    var restAPIResult = await cServer.rest.fetch("get", "http://localhost:33021/")
    vNetwork.util.print(JSON.parse(restAPIResult))
    var restAPIResult = await cServer.rest.fetch("get", "http://localhost:33021/invalid")
    vNetwork.util.print(JSON.parse(restAPIResult))
}
debug()


async function debug2() {
    const cServer = vNetwork.create({
        port: 33022,
        isSSL: false
    })
    const isConnected = await cServer.connect()
    if (!isConnected) return false

    // @Socket API Examples
    const cSocket = cServer.socket.create("Server:MyRoute", {
        heartbeat: {
            interval: 10000, // Interval at which heartbeat should be executed
            timeout: 60000 // Duration at which it should disconnect instance if no response is received
        },
        reconnection: {
            attempts: -1, // Number of attempts before onClientDisconnect is reached. [Note: -1 = infinite attempts]
            interval: 2500 // Duration b/w each attempt
        }
    })

    cSocket.onClientConnect = function(client) {
        vNetwork.util.print(`* Client connected [${client}]`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetwork.util.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }
}
debug2()
