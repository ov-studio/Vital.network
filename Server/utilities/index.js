
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

CUtility.createAPI = function(buffer, blacklist) {
    if (!buffer || (typeof(buffer) != "object")) return false
    blacklist = (blacklist && (typeof(blacklist) == "object") && blacklist) || false
    const result = {}
    for (const i in buffer) {
        const j = buffer[i]
        if (j && (typeof(j) == "function") && (!blacklist || !blacklist[j])) {
            result[i] = j
        }
    }
    return result
}


/*------------
-- Exports  --
------------*/


module.exports = CUtility