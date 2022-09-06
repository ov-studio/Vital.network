/*----------------------------------------------------------------
     Resource: Vital.network
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

const vNetwork = CUtility.createAPIs(require("./managers/server"))
CUtility.global.vNetwork = vNetwork
module.exports = vNetwork