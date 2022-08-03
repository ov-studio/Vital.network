/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: utilities: room.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Room Utilities
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CUtility = require("./")


//////////////////
// Class: Room //
//////////////////

const CRoom = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether the room is void
CRoom.public.addMethod("isVoid", function(name) {
    return (CUtility.isString(name) && !CUtility.isObject(CRoom.public.buffer[name]) && true) || false
})

// @Desc: Fetches room instance by name
CRoom.public.addMethod("fetch", function(name) {
    return (!CRoom.public.isVoid(name) && CRoom.public.buffer[name]) || false
})

// @Desc: Creates a fresh room w/ specified name
CRoom.public.addMethod("create", function(name, ...cArgs) {
    if (!CRoom.public.isVoid(name)) return false
    CRoom.public.buffer[name] = CRoom.public.createInstance(name, ...cArgs)
    return CRoom.public.buffer[name]
})

// @Desc: Destroys an existing room by specified name
CRoom.public.addMethod("destroy", function(name) {
    if (CRoom.public.isVoid(name)) return false
    return CRoom.public.buffer[name].destroy()
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CRoom.public.addMethod("constructor", function(self, name) {
    const private = CRoom.instance.get(self)
    private.name = name
})

// @Desc: Destroys the instance
CRoom.public.addInstanceMethod("destroy", function(self) {
    const private = CRoom.instance.get(self)
    delete CRoom.public.buffer[(private.name)]
    self.destroyInstance()
    return true
})


//////////////
// Exports //
//////////////

module.exports = CRoom.public