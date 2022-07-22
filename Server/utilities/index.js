
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: utilities: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Utility Handler
----------------------------------------------------------------*/


/*------------------
-- Class: Utility --
------------------*/

const CUtility = {}

CUtility.createAPIs = function(buffer, blacklist) {
    if (!buffer || (typeof(buffer) != "object")) return false
    blacklist = (blacklist && (typeof(blacklist) == "object") && blacklist) || false
    const cAPIs = {}
    for (const i in buffer) {
        const j = buffer[i]
        if (j && (typeof(j) == "function") && (!blacklist || !blacklist[j])) {
            cAPIs[i] = j
        }
    }
    return cAPIs
}


/*------------
-- Exports  --
------------*/


module.exports = CUtility