
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
    CNetworkify.socket.create("test")

    // @Rest API Example
    CNetworkify.rest.create("get", "", function(request, response) {
        response.status(200).send("Some status message")
    })
    CNetworkify.rest.destroy("get", "")
}
test()