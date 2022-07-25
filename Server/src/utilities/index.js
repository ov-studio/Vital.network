
/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: utilities: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Utility Handler
----------------------------------------------------------------*/


/////////////////////
// Class: Utility //
/////////////////////

const CUtility = {
    print: console.log,
    loadString: eval,
    genUID: require("uuid"),
    queryString: require("querystring")
}
CUtility.isServer = (global && true) || false
CUtility.global = (CUtility.isServer && global) || window

const CType = [
    {handler: "isBool", type: "boolean"},
    {handler: "isString", type: "string"},
    {handler: "isNumber", type: "number"},
    {handler: "isObject", type: "object", middleware: function(data, isArray) {return (!isArray && true) || Array.isArray(data)}},
    {handler: "isFunction", type: "function"}
]
CType.forEach(function(j) {
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

CUtility.isArray = function(data) {
    return CUtility.isObject(data, true)
}

CUtility.isClass = function(data) {
    return (CUtility.isFunction(data, "function") && data.isClass && true) || false
}

CUtility.createClass = function(parent) {
    class __C{
        static isClass = true
        constructor(...cArgs) {
            if (CUtility.isFunction(__C.constructor)) __C.constructor(this, ...cArgs)
        }
    }
    if (CUtility.isObject(parent)) {
        for (const i in parent) {
            __C[i] = parent[i]
        }
    }
    __C.addMethod = function(index, exec) {
        if (!CUtility.isString(index) || !CUtility.isFunction(exec)) return false
        __C[index] = exec
        return true
    }
    __C.removeMethod = function(index) {
        if (!CUtility.isString(index) || !CUtility.isFunction(__C[index])) return false
        delete __C[index]
        return true
    }
    __C.addInstanceMethod = function(index, exec) {
        if (!CUtility.isString(index) || !CUtility.isFunction(exec)) return false
        __C.prototype[index] = function(...cArgs) {
            const self = this
            return exec(self, ...cArgs)
        }
        return true
    }
    __C.removeInstanceMethod = function(index) {
        if (!CUtility.isString(index) || !CUtility.isFunction(__C.prototype[index])) return false
        delete __C.prototype[index]
        return true
    }
    return __C
}

CUtility.exec = function(exec, ...cArgs) {
    if (!CUtility.isFunction(exec)) return false
    return exec(...cArgs)
}

CUtility.fetchVID = function(buffer) {
    if (CUtility.isNull(buffer) || CUtility.isBool(buffer) || CUtility.isNumber(buffer)) return false
    buffer.prototype = buffer.prototype || {}
    if (!buffer.prototype.vid) {
        Object.defineProperty(buffer.prototype, "vid", {
            value: CUtility.genUID.v4(),
            enumerable: true,
            configurable: false,
            writable: false
        })
    }
    return buffer.prototype.vid
}

CUtility.createAPIs = function(buffer, blacklist) {
    if (!CUtility.isObject(buffer) && !CUtility.isClass(buffer)) return false
    blacklist = (CUtility.isObject(blacklist) && blacklist) || false
    var isVoid = true
    const result = {}
    for (const i in buffer) {
        const j = buffer[i]
        if (!blacklist || !blacklist[i]) {
            if (CUtility.isObject(j) || CUtility.isClass(j)) {
                const __result = CUtility.createAPIs(j)
                if (__result) {
                    isVoid = false
                    result[i] = __result
                }
            }
            else if (CUtility.isFunction(j)) {
                isVoid = false
                result[i] = j
            }
        }
    }
    return (!isVoid && result) || false
}


//////////////
// Exports //
//////////////

module.exports = CUtility