
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: test.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Tester
----------------------------------------------------------------*/

// TODO: TO BE REMOVED LATER

/*-----------
-- Imports --
-----------*/

CServer = require("./managers/server")()


// Rest API Example

/*
CServer.createRestAPI("get", "", function(request, response) {
    response.status(200).send("Some status message 2")
})
*/
// TODO: ...
async function test() {
    var test = await(CServer.connect(33001, {
        isCaseSensitive: true
    }))
    CServer.createRestAPI("get", "", function(request, response) {
        console.log("Wew 1")
        response.status(200).send("Some status message")
    })
    CServer.destroyRestAPI("get", "")
    CServer.createRestAPI("get", "", function(request, response) {
        console.log("Wew 2")
        response.status(200).send("Some status message 2")
    })
}
test()



// TODO: REPLACE LATER
/*
const expressWS = require("express-ws")
expressWS(CServer.fetchServer("CExpress"), CServer.fetchServer("CHTTP"))

// TODO: IMPLEMENT REST API CLASS
// TODO: IMPLEMENT WS WRAPPER
CServer.fetchServer("CExpress").ws("/", async function(ws, req) {
    ws.on("message", async function(msg) {
        console.log("WS TEST: " + toString(msg))
        ws.send("WS RETURN VALUE?")
    })
})
*/