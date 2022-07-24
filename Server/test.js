
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: test.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Tester
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

const vNetworkify = require("./managers/server")()


/*--------
-- Test --
--------*/

async function test() {
    const isConnected = await(vNetworkify.connect(33001, {
        isCaseSensitive: true
    }))
    if (!isConnected) return false

    
    // @Socket API Examples
    const cSocket = vNetworkify.socket.create("test")
    cSocket.createNetwork("test")


    // @Normal Network Examples
    cSocket.on("test", function() {
        console.log("Normal Network | Handler 1")
    })
    const testExec = function(...cArgs) {
        console.log("Normal Network | Handler 2")
        console.log(...cArgs)
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
    console.log("Callback Network | Result: " + callbackResult)


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