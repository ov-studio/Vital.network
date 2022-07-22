
import express from 'express'
import expressWs from 'express-ws'
import http from 'http'

let app = express();
let server = http.createServer(app).listen(port);
let port = 3000
expressWs(app, server);


// Apply expressWs

/*
// TODO: IMPLEMENT REST API CLASS
app.get('/', (req, res) => {
    res.status(200).send("Some status message");
})
*/

app.ws('/', async function(ws, req) {
    ws.on('message', async function(msg) {
        console.log("WS TEST: " + toString(msg))
        ws.send("WS RETURN VALUE?");
    });
});

console.log("Booted Networkify: Server")