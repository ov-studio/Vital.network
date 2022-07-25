
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: loader.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Module Loader
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

var vNetworkify = require("./managers/server")
const vUtility = require("./utilities")
require("./managers/network")
require("./managers/rest")
require("./managers/socket")


//////////////
// Exports //
//////////////

vNetworkify = vUtility.createAPIs(vNetworkify, {
    network: true
})
vNetworkify.utility = vUtility
module.exports = vNetworkify