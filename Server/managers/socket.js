
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: managars: socket.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket Manager
----------------------------------------------------------------*/


/*-----------
-- Imports --
-----------*/

const CServer = require("./server")(true)


/*------------------
-- Class: CSocket --
------------------*/

CServer.socket = {
    config: {},
    instance: {},
    room: {}
}

CServer.socket.connect = function() {
    CServer.instance.CWS.on("connection", function(socket, request) {
        CServer.socket.instance[socket] = {}
        console.log("CONNECTED SOCKET")
    })
}