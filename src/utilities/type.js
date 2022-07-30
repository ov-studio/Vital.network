/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: utilities: type.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Type Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("./")


//////////////////
// Class: Type //
//////////////////

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


// @Desc: Verifies whether specified data is null
CUtility.isNull = function(data) {
    return data == null
}

// @Desc: Verifies specified data's type
CUtility.isType = function(data, type) {
    return (!CUtility.isNull(data) && !CUtility.isNull(type) && (typeof(type) == "string") && (typeof(data) == type) && true) || false
}

// @Desc: Verifies whether specified data is an array
CUtility.isArray = function(data) {
    return CUtility.isObject(data, true)
}

// @Desc: Verifies whether specified data is a class
CUtility.isClass = function(data) {
    return (CUtility.isFunction(data, "function") && data.isClass && true) || false
}

// @Desc: Creates a new dynamic class
CUtility.createClass = function(parent) {
    class __C{
        static isClass = true
        constructor(...cArgs) {
            CUtility.exec(__C.constructor, this, ...cArgs)
        }
    }
    if (CUtility.isObject(parent)) {
        for (const i in parent) {
            __C[i] = parent[i]
        }
    }
    __C.addMethod = function(index, exec, isInstanceware) {
        if (!CUtility.isString(index) || !CUtility.isFunction(exec)) return false
        if ((index == "constructor") && CUtility.isString(isInstanceware)) __C.isInstanceware = isInstanceware
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
            const isInstanceware = __C.isInstanceware
            if (CUtility.isString(isInstanceware) && (index != isInstanceware) && CUtility.isFunction(self[isInstanceware]) && !self[isInstanceware]()) return false
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