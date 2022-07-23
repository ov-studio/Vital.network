
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

const CNetworkify = require("./managers/server")()


/*--------
-- Test --
--------*/

async function test() {
    const isConnected = await(CNetworkify.connect(33001, {
        isCaseSensitive: true
    }))
    if (!isConnected) return false

    // @Socket API Examples
    const cSocket = CNetworkify.socket.create("test")
    const cNetwork = cSocket.createNetwork("test")
    cNetwork.on(function() {
        console.log("HI XD")
    })
    cNetwork.on(function(...cArgs) {
        console.log("HI 2 XD")
        console.log(...cArgs)
    })
    cNetwork.emit("test", "xD")

    // @Rest API Examples
    CNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("Some status message")
    })
    CNetworkify.rest.destroy("get", "")
    CNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("Some new status message")
    })
}
test()