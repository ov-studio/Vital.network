/*----------------------------------------------------------------
     Resource: Vital.network
     Script: importer.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Importer
----------------------------------------------------------------*/


//////////////
// Exports //
//////////////

const vNetwork = vKit.createAPIs(require("./managers/server"))
vKit.global.vNetwork = vNetwork
module.exports = vNetwork