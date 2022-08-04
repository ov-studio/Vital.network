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
    const isConnected = await vNetworkify.connect({
        port: 33021
    })
    if (!isConnected) return false
    

    // @Socket API Examples
    const cSocket = vNetworkify.socket.create("Server:MyRoute", {
        heartbeat: {
            interval: 10000, // Interval at which heartbeat should be executed
            timeout: 60000 // Duration b/w each heartbeat
        },
        reconnection: {
            attempts: -1, // Number of attempts before onClientDisconnect is reached. [Note: -1 = infinite attempts]
            interval: 2500 // Duration b/w each attempt
        }
    })
    vNetworkify.util.print("* Socket-list:")
    vNetworkify.util.print(Object.keys(vNetworkify.socket.fetchSockets()))

    cSocket.onHeartbeat = function(deltaTick) {
        vNetworkify.util.print(`* Server's heartbeat [${deltaTick}ms] received!`)
    }
    cSocket.onClientConnect = function(client) {
        vNetworkify.util.print(`* Client connected [${client}]`)
    }
    cSocket.onClientReconnect = function(client, currentAttempt, maxAttempts) {
        vNetworkify.util.print(`* Client reconnecting [${client}] | Attempts: ${currentAttempt}/${maxAttempts}`)
    }
    cSocket.onClientDisconnect = function(client, reason) {
        vNetworkify.util.print(`* Client disconnected [${client}] | Reason: ${reason}`)
    }
    const isSocketConnected = await cSocket.isConnected()
    if (!isSocketConnected) return false


    // @Non-Callback Network Examples
    cSocket.createNetwork("Client:MyNetwork")
    cSocket.on("Client:MyNetwork", function() {
        vNetworkify.util.print("Non-Callback network | Handler 1")
    })
    const secondaryExec = function(...cArgs) {
        vNetworkify.util.print("Non-Callback network | Handler 2")
        vNetworkify.util.print(...cArgs)
    }
    cSocket.on("Client:MyNetwork", secondaryExec)
    cSocket.off("Client:MyNetwork", secondaryExec)
    cSocket.emit("Client:MyNetwork", false, "Arg 1", "Arg 2")

    // @Callback Network Examples
    cSocket.createNetwork("Client:MyCBNetwork", true)
    cSocket.on("Client:MyCBNetwork", function(argA, argB) {
        return argA + argB
    })
    vNetworkify.util.print("* Network-list:")
    vNetworkify.util.print(cSocket.fetchNetworks())

    const networkCBResult = await cSocket.emitCallback("Client:MyCBNetwork", false, 1, 4)
    vNetworkify.util.print(`Callback network | Result: ${networkCBResult}`)
    const networkRemoteCBResult = await cSocket.emitCallback("Server:MyCBNetwork", true, 100, 200)
    vNetworkify.util.print(`Remote-Callback network | Result: ${networkRemoteCBResult}`)


    //@Room Examples
    cSocket.onClientJoinRoom = function(room, client) {
        vNetworkify.util.print(`* Client [${client}] joined Room [${room}]`)
        vNetworkify.util.print(`* Member-list:`)
        vNetworkify.util.print(cSocket.fetchRoomMembers(room))
    }
    cSocket.onClientLeaveRoom = function(room, client) {
        vNetworkify.util.print(`* Client [${client}] left Room [${room}]`)
    }


    // @Rest API Examples
    var restAPIResult = await vNetworkify.rest.fetch("get", "http://localhost:33021/")
    restAPIResult = await restAPIResult.json()
    vNetworkify.util.print(restAPIResult)
    var restAPIResult = await vNetworkify.rest.fetch("get", "http://localhost:33021/invalid")
    restAPIResult = await restAPIResult.json()
    vNetworkify.util.print(restAPIResult)
}
debug()