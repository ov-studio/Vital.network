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


//////////////
// Exports //
//////////////

const vNetworkify = CUtility.createAPIs(require("./managers/server"))
vNetworkify.util = CUtility
CUtility.global.vNetworkify = vNetworkify
module.exports = vNetworkify