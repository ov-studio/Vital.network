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
const CCache = {
    vid: {
        blacklist: {},
        counter: 0
    }
}
CUtility.isServer = ((typeof(process) != "undefined") && !process.browser && true) || false
CUtility.crypto = (CUtility.isServer && require("crypto")) || crypto
CUtility.global = (CUtility.isServer && global) || window
CUtility.toBase64 = (!CUtility.isServer && btoa.bind(window)) || function(data) { return Buffer.from(data).toString("base64") }
CUtility.fromBase64 = (!CUtility.isServer && atob.bind(window)) || function(data) { return Buffer.from(data, "base64").toString("binary") }
CUtility.identifier = CUtility.toBase64(`vNetworkify-${(CUtility.isServer && "Server") || "Client"}`)

// @Desc: Executes the specified handler
CUtility.exec = function(exec, ...cArgs) {
    if (!CUtility.isFunction(exec)) return false
    return exec(...cArgs)
}

// @Desc: Creates a unique VID
CUtility.createVID = function() {
    var cvid = false
    while(!cvid) {
        const vvid = CUtility.toBase64(CUtility.crypto.randomUUID() + (Date.now() + CCache.vid.counter))
        if (!CCache.vid.blacklist[vvid]) {
            CUtility.blacklistVID(vvid)
            cvid = vvid
        }
        CCache.vid.counter += 1
    }
    return cvid
}

// @Desc: Blacklists a VID
CUtility.blacklistVID = function(vid) {
    if (!CUtility.isString(vid) || CCache.vid.blacklist[vid]) return false
    CCache.vid.blacklist[vid] = true
    return true
}

// @Desc: Assigns/Fetches VID (Virtual ID) on/from valid instance
CUtility.fetchVID = function(buffer, vid, isReadOnly) {
    if (CUtility.isNull(buffer) || CUtility.isBool(buffer) || CUtility.isString(buffer) || CUtility.isNumber(buffer)) return false
    buffer.prototype = buffer.prototype || {}
    if (!isReadOnly && !buffer.prototype.vid) {
        Object.defineProperty(buffer.prototype, "vid", {
            value: vid || `${CUtility.identifier}:${CUtility.createVID()}`,
            enumerable: true,
            configurable: false,
            writable: false
        })
    }
    return buffer.prototype.vid
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