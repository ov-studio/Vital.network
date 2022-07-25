
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
    const cSocket = vNetworkify.socket.create("test")
    cSocket.createNetwork("test")


    // @Non-Callback Network Examples
    cSocket.on("test", function() {
        vNetworkify.utility.print("Normal Network | Handler 1")
    })
    const testExec = function(...cArgs) {
        vNetworkify.utility.print("Normal Network | Handler 2")
        vNetworkify.utility.print(...cArgs)
    }
    cSocket.on("test", testExec)
    cSocket.off("test", testExec)
    cSocket.emit("test", false, "xD")

    // @Callback Network Examples
    cSocket.createNetwork("testcb", true)
    cSocket.on("testcb", function(argA, argB) {
        return argA + argB
    })
    const callbackResult = await cSocket.emitCallback("testcb", false, 1, 4)
    vNetworkify.utility.print("Callback Network | Result: " + callbackResult)


    // @Room Examples
    cSocket.createRoom("test")
    cSocket.destroyRoom("test")
    cSocket.createRoom("test")
    cSocket.emitRoom("test", "wew", "xD")


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