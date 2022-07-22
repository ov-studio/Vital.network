
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

CServer = require("./server")(true)


/*------------------
-- Class: CSocket --
------------------*/

CServer.CSocket = {
    config: {},
    instances = {},
    rooms = {}
}
