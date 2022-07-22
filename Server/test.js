
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

CServer = require("./managers/server")


// TODO: ...
async function test() {
    var test = await(CServer.connect(33001))
}
test()


// TODO: REPLACE LATER
/*
const expressWS = require("express-ws")
expressWS(CServer.fetchServer("CExpress"), CServer.fetchServer("CHTTP"))

// TODO: IMPLEMENT REST API CLASS
CServer.instance.CExpress.get('/', (req, res) => {
    res.status(200).send("Some status message");
})

// TODO: IMPLEMENT WS WRAPPER
CServer.fetchServer("CExpress").ws("/", async function(ws, req) {
    ws.on("message", async function(msg) {
        console.log("WS TEST: " + toString(msg))
        ws.send("WS RETURN VALUE?")
    })
})
*/