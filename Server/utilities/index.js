
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
    print: console.log,
    loadString: eval,
    genUID: require("uuid"),
    queryString: require("querystring")
}
const CTypes = [
    {handler: "isBool", type: "boolean"},
    {handler: "isString", type: "string"},
    {handler: "isNumber", type: "number"},
    {handler: "isObject", type: "object", middleware: function(data, isArray) {return (isArray && Array.isArray(data)) || true}},
    {handler: "isFunction", type: "function"}
]
CTypes.forEach(function(j) {
    CUtility[(j.handler)] = function(data, ...cArgs) {
        var isTypeValid = CUtility.isType(data, j.type)
        if (isTypeValid && j.middleware) {
            isTypeValid = (j.middleware(data, ...cArgs) && isTypeValid) || false
        }
        return isTypeValid
    }
})

CUtility.isNull = function(data) {
    return data == null
}

CUtility.isType = function(data, type) {
    return (!CUtility.isNull(data) && !CUtility.isNull(type) && (typeof(type) == "string") && (typeof(data) == type) && true) || false
}

CUtility.exec = function(exec, ...cArgs) {
    if (!CUtility.isFunction(exec)) return false
    return exec(...cArgs)
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


/*-----------
-- Exports --
-----------*/

module.exports = CUtility