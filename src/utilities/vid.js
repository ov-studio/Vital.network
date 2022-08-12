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

const CVID = CUtility.createClass()
CUtility.vid = CVID.public
CVID.private.buffer = {}
CVID.private.counter = 0


/////////////////////
// Static Members //
/////////////////////

// @Desc: Creates a unique VID
CVID.public.addMethod("create", () => {
    var cvid = false
    while(!cvid) {
        const vvid = CUtility.toBase64(CUtility.crypto.getRandomValues((new Uint8Array(8)).join("")) + (Date.now() + CVID.private.counter))
        if (!CVID.private.buffer[vvid]) {
            CUtility.vid.blacklist(vvid)
            cvid = vvid
        }
        CVID.private.counter += 1
    }
    return cvid
})

// @Desc: Blacklists a VID
CVID.public.addMethod("blacklist", (vid) => {
    if (!CUtility.isString(vid) || CVID.private.buffer[vid]) return false
    CVID.private.buffer[vid] = true
    return true
})

// @Desc: Assigns/Fetches VID (Virtual ID) on/from valid instance
CVID.public.addMethod("fetch", (parent, assignVID, isReadOnly) => {
    if (CUtility.isNull(parent) || CUtility.isBool(parent) || CUtility.isString(parent) || CUtility.isNumber(parent)) return false
    parent.prototype = parent.prototype || {}
    if (!isReadOnly && !parent.prototype.vid) {
        Object.defineProperty(parent.prototype, "vid", {value: assignVID || `${CUtility.identifier}:${CUtility.vid.create()}`, enumerable: true, configurable: false, writable: false})
    }
    return parent.prototype.vid
})