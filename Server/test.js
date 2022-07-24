
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
console.log(vNetworkify)


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
    cSocket.on(function() {
        console.log("HI XD")
    })
    const testExec = function(...cArgs) {
        console.log("HI 2 XD")
        console.log(...cArgs)
    }
    cSocket.on(testExec)
    cSocket.off(testExec)
    cSocket.emit("test", "xD")

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