/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: importer.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Importer
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("./utilities")
const CServer = require("./managers/server")


//////////////
// Exports //
//////////////

const vNetworkify = CUtility.createAPIs(CServer)
vNetworkify.util = CUtility
CUtility.global.vNetworkify = vNetworkify
module.exports = vNetworkify