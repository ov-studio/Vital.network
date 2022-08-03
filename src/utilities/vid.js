/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: utilities: VID.js
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
            enumerable: true, configurable: false, writable: false
        })
    }
    return buffer.prototype.vid
}