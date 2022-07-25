
/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: test.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Tester
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

require("./importer")


/*--------
-- Test --
--------*/

async function test() {
    const isConnected = await(vNetworkify.connect(33021, {
        isCaseSensitive: true
    }))
    if (!isConnected) return false

    
    // @Socket API Examples
    const cSocket = vNetworkify.socket.create("myRoute")
    cSocket.createNetwork("myServerNetwork")


    // @Non-Callback Network Examples
    cSocket.on("myServerNetwork", function() {
        vNetworkify.utility.print("Non Callback Network | Handler 1")
    })
    const testExec = function(...cArgs) {
        vNetworkify.utility.print("Non Callback Network | Handler 2")
        vNetworkify.utility.print(...cArgs)
    }
    cSocket.on("myServerNetwork", testExec)
    cSocket.off("myServerNetwork", testExec)
    cSocket.emit("myServerNetwork", false, "ArgTest1", "ArgTest2")

    // @Callback Network Examples
    cSocket.createNetwork("myServerCallbackNetwork", true)
    cSocket.on("myServerCallbackNetwork", function(argA, argB) {
        return argA + argB
    })
    const myServerCallbackNetworkResult = await cSocket.emitCallback("myServerCallbackNetwork", false, 1, 4)
    vNetworkify.utility.print("Callback Network | Result: " + myServerCallbackNetworkResult)


    // @Room Examples
    cSocket.createRoom("myServerRoom")
    cSocket.destroyRoom("myServerRoom")
    cSocket.createRoom("myServerRoom")
    cSocket.emitRoom("myClientNetwork", "wew", "xD")


    // @Rest API Examples
    vNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("Some status message")
    })
    vNetworkify.rest.destroy("get", "")
    vNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("Some new status message")
    })
}
test()