/*----------------------------------------------------------------
     Resource: Vital.network
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

const CRoom = CUtility.Class()
CRoom.private.buffer = {}


/////////////////////
// Static Members //
/////////////////////

// @Desc: Verifies whether the room is void
CRoom.public.addMethod("isVoid", (name) => (CUtility.isString(name) && !CRoom.private.buffer[name] && true) || false)

// @Desc: Fetches room instance by name
CRoom.public.addMethod("fetch", (name) => (!CRoom.public.isVoid(name) && CRoom.private.buffer[name]) || false)

// @Desc: Creates a fresh room w/ specified name
CRoom.public.addMethod("create", (name, ...cArgs) => {
    if (!CRoom.public.isVoid(name)) return false
    CRoom.private.buffer[name] = CRoom.public.createInstance(name, ...cArgs)
    return CRoom.private.buffer[name]
})

// @Desc: Destroys an existing room by specified name
CRoom.public.addMethod("destroy", (name) => {
    if (CRoom.public.isVoid(name)) return false
    return CRoom.private.buffer[name].destroy()
})


///////////////////////
// Instance Members //
///////////////////////

// @Desc: Instance constructor
CRoom.public.addMethod("constructor", (self, name) => {
    const private = CRoom.instance.get(self)
    private.name = name
})

// @Desc: Destroys the instance
CRoom.public.addInstanceMethod("destroy", (self) => {
    const private = CRoom.instance.get(self)
    delete CRoom.private.buffer[(private.name)]
    self.destroyInstance()
    return true
})


//////////////
// Exports //
//////////////

module.exports = CRoom.public