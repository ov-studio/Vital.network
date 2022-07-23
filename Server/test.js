
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: test.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Tester
----------------------------------------------------------------*//*-----------
-- Imports --
-----------*/

CServer = require("./managers/server")()


/*--------
-- Test --
--------*/

async function test() {
    const isConnected = await(CServer.connect(33001, {
        isCaseSensitive: true
    }))
    if (!isConnected) return false

    // @Rest API Example
    CServer.createRestAPI("get", "", function(request, response) {
        response.status(200).send("Some status message")
    })
    CServer.destroyRestAPI("get", "")
}
test()