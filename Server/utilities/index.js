
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

const CUtility = {
    print = console.log,
    loadstring = eval
}

CUtility.isNull = function(data) {
    return data == null
}

CUtility.isType = function(data, type) {
    return (!CUtility.isNull(data) && !CUtility.isNull(type) && (typeof(type) == "string") && (typeof(data) == type) && true) || false
}

CUtility.isBool = function(data) {
    return CUtility.isType(data, "boolean")
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
        if (CUtility.isFunction(j) && (!blacklist || !blacklist[j])) {
            result[i] = j
        }
    }
    return result
}


/*------------
-- Exports  --
------------*/

module.exports = CUtility