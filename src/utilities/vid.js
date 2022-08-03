/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: utilities: vid.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: VID Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("./")


/////////////////
// Class: VID //
/////////////////

CUtility.vid = {}

// @Desc: Creates a unique VID
CUtility.vid.create = function() {
    var cvid = false
    while(!cvid) {
        const vvid = CUtility.toBase64(CUtility.crypto.randomUUID() + (Date.now() + CCache.vid.counter))
        if (!CCache.vid.blacklist[vvid]) {
            CUtility.vid.blacklist(vvid)
            cvid = vvid
        }
        CCache.vid.counter += 1
    }
    return cvid
}

// @Desc: Blacklists a VID
CUtility.vid.blacklist = function(vid) {
    if (!CUtility.isString(vid) || CCache.vid.blacklist[vid]) return false
    CCache.vid.blacklist[vid] = true
    return true
}

// @Desc: Assigns/Fetches VID (Virtual ID) on/from valid instance
CUtility.vid.fetch = function(parent, assignVID, isReadOnly) {
    if (CUtility.isNull(parent) || CUtility.isBool(parent) || CUtility.isString(parent) || CUtility.isNumber(parent)) return false
    parent.prototype = parent.prototype || {}
    if (!isReadOnly && !parent.prototype.vid) {
        Object.defineProperty(parent.prototype, "vid", {
            value: assignVID || `${CUtility.identifier}:${CUtility.vid.create()}`,
            enumerable: true, configurable: false, writable: false
        })
    }
    return parent.prototype.vid
}