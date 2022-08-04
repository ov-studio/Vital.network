/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: utilities: index.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Utilities
----------------------------------------------------------------*/


/////////////////////
// Class: Utility //
/////////////////////

const CUtility = {
    print: console.log,
    loadString: eval,
    queryString: require("querystring")
}
Object.defineProperty(CUtility, "isServer", {
    value: ((typeof(process) != "undefined") && !process.browser && true) || false,
    enumerable: true, configurable: false, writable: false
})
CUtility.crypto = (CUtility.isServer && require("crypto")) || crypto
CUtility.global = (CUtility.isServer && global) || window
CUtility.toBase64 = (!CUtility.isServer && btoa.bind(window)) || function(data) { return Buffer.from(data).toString("base64") }
CUtility.fromBase64 = (!CUtility.isServer && atob.bind(window)) || function(data) { return Buffer.from(data, "base64").toString("binary") }
CUtility.identifier = CUtility.toBase64(`vNetworkify-${(CUtility.isServer && "Server") || "Client"}`)
CUtility.version = (CUtility.isServer && process.env.npm_package_version) || false

// @Desc: Executes the specified handler
CUtility.exec = function(exec, ...cArgs) {
    if (!CUtility.isFunction(exec)) return false
    return exec(...cArgs)
}

// @Desc: Creates dynamic whitelisted module APIs
CUtility.createAPIs = function(buffer, blacklist) {
    if (!CUtility.isObject(buffer) && !CUtility.isClass(buffer)) return false
    blacklist = (blacklist && CUtility.isObject(blacklist) && blacklist) || false
    var isVoid = true
    const result = {}
    for (const i in buffer) {
        const j = buffer[i]
        const isBlackListed = (blacklist && (blacklist[i] == true) && true) || false
        const isBlacklistPointer = (blacklist && !isBlackListed && blacklist[i]) || false
        if (!isBlackListed) {
            if (CUtility.isObject(j) || CUtility.isClass(j)) {
                const __result = CUtility.createAPIs(j, isBlacklistPointer)
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
const _ = [
    "./type",
    "./vid",
    "./network",
    "./room"
].forEach((value) => require(value))