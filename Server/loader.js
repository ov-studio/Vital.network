const serverPort = process.env.PORT || 3001
const expressServer = require("express")().use(require("cors")())
const httpServer = require("http").Server(expressServer).listen(serverPort, () => {
    console.log(`━ vNetworify (Server) | Launched [Port: ${serverPort}]`)
})
expressWs(expressServer, httpServer)


/*
// TODO: IMPLEMENT REST API CLASS
expressServer.get('/', (req, res) => {
    res.status(200).send("Some status message");
})
*/

// TODO: IMPLEMENT WS WRAPPER
expressServer.ws("/", async function(ws, req) {
    ws.on("message", async function(msg) {
        console.log("WS TEST: " + toString(msg))
        ws.send("WS RETURN VALUE?");
    });
});

console.log("Booted Networkify: Server")