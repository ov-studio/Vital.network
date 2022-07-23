
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
console.log(CNetworkify)

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
    CNetworkify.createRestAPI("get", "", function(request, response) {
        response.status(200).send("Some status message")
    })
    CNetworkify.destroyRestAPI("get", "")
}
test()