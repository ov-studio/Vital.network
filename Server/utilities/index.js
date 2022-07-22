
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

CUtility.log = console.log

CUtility.isNull = function(data) {
    return data == null
}

CUtility.isType = function(data, type) {
    return (!CUtility.isNull(data) && !CUtility.isNull(type) && (typeof(type) == "string") && (typeof(data) == type) && true) || false
}

CUtility.isString = function(data) {
    return CUtility.isType(data, "string")
}

CUtility.isNumber = function(data) {
    return CUtility.isType(data, "number")
}

CUtility.isObject = function(data) {
    return CUtility.isType(data, "object")
}

CUtility.isFunction = function(data) {
    return CUtility.isType(data, "function")
}

CUtility.createAPIs = function(buffer, blacklist) {
    if (!CUtility.isObject(buffer)) return false
    blacklist = (CUtility.isObject(blacklist) && blacklist) || false
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