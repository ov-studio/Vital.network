
/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: managars: socket.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Socket Manager
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CWS = require("ws")
const CUtility = require("../utilities")
const CServer = require("./server")


////////////////////
// Class: Socket //
////////////////////

CServer.socket = CUtility.createClass({
    buffer: {}
})


/////////////////////
// Static Members //
/////////////////////

const fetchNetwork = function(self, name) {
    return (self.isNetwork(name) && self.network[name]) || false
}

CServer.socket.addMethod("isVoid", function(route) {
    return (CUtility.isString(route) && !CUtility.isObject(CServer.socket.buffer[route]) && true) || false
})

CServer.socket.addMethod("fetch", function(route) {
    return (!CServer.socket.isVoid(route) && CServer.socket.buffer[route]) || false
})

CServer.socket.addMethod("create", function(route) {
    if (!CServer.isConnected(true) || !CServer.socket.isVoid(route)) return false
    CServer.socket.buffer[route] = new CServer.socket(route)
    return CServer.socket.buffer[route]
})

CServer.socket.addMethod("destroy", function(route) {
    if (CServer.socket.isVoid(route)) return false
    CServer.socket.buffer[route].isUnloaded = true
    delete CServer.socket.buffer[route]
    return true
})


///////////////////////
// Instance Members //
///////////////////////

CServer.socket.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CServer.socket.isVoid(self.route) && true) || false
})

CServer.socket.addInstanceMethod("destroy", function(self) {
    self.server.close()
    for (const i in self.network) {
        const j = self.network[i]
        j.destroy()
    }
    CServer.socket.destroy(this.route)
    return true
})

CServer.socket.addInstanceMethod("isNetwork", function(self, name) {
    return (CUtility.isString(name) && CUtility.isObject(self.network[name]) && self.network[name].isInstance() && true) || false
})

CServer.socket.addInstanceMethod("createNetwork", function(self, name, ...cArgs) {
    if (self.isNetwork(name)) return false
    self.network[name] = CServer.network.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
    return true
})

CServer.socket.addInstanceMethod("destroyNetwork", function(self, name) {
    if (!self.isNetwork(name)) return false
    self.network[name].destroy()
    delete self.network[name]
    return true
})

CServer.socket.addInstanceMethod("on", function(self, name, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.on(...cArgs)
})

CServer.socket.addInstanceMethod("off", function(self, name, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    return cNetwork.off(...cArgs)
})

CServer.socket.addInstanceMethod("emit", function(self, name, isRemote, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    if (isRemote) {
        if (CUtility.isServer && !self.isClient(isRemote)) return false
        const cReceiver = (CUtility.isServer && isRemote) || self.server
        cReceiver.send(JSON.stringify({
            networkName: name,
            networkArgs: cArgs
        }))
        return true
    }
    return cNetwork.emit(...cArgs)
})

CServer.socket.addInstanceMethod("emitCallback", function(self, name, isRemote, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    if (isRemote) {
        if (!CUtility.isServer && !self.isClient(isRemote)) return false
        // TODO: ADD REMOTE TRANSFER
        return true
    }
    return cNetwork.emitCallback(...cArgs)
})

CServer.socket.addInstanceMethod("isRoom", function(self, name) {
    const cInstance = (CUtility.isString(name) && CUtility.isObject(self.room[name]) && self.room[name]) || false
    if (CUtility.isServer() && cInstance && (!CUtility.isObject(cInstance) || !cInstance.isInstance())) cInstance = false
    return (cInstance && true) || false
})

CServer.socket.addInstanceMethod("isInRoom", function(self, name, client) {
    if (!self.isRoom(name)) return false
    if (CUtility.isServer && !self.isClient(client)) return false
    const vid = (CUtility.isServer && CUtility.fetchVID(client)) || CUtility.fetchVID(self)
    return (CUtility.isObject(self.room[name]) && self.room[name][vid] && true) || false
})

if (!CUtility.isServer) {
    /////////////////////
    // Static Members //
    /////////////////////

    CServer.socket.addMethod("constructor", function(self, route) {
        CUtility.fetchVID(self)
        self.config = {
            isConnected: false
        }
        self.route = route, self.network = {}, self.room = {}
        self.connect = function() {
            if (self.isConnected()) return false
            var cResolver = false
            self.config.isAwaiting = new Promise((resolver) => cResolver = resolver)
            self.server = new WebSocket(`${((CServer.config.protocol == "https") && "wss") || "ws"}://${CServer.config.hostname}:${CServer.config.port}/${self.route}`)
            self.server.onopen = function() {
                self.config.isAwaiting = null
                self.config.isConnected = true
                cResolver(self.config.isConnected)
            }
            self.server.onerror = function(error) {
                self.config.isConnected = false
                cResolver(self.config.isConnected, error)
                self.connect()
            }
            return true
        }
        self.connect()
    })


    ///////////////////////
    // Instance Members //
    ///////////////////////

    CServer.socket.addInstanceMethod("isConnected", function(self, isSync) {
        if (isSync) return (CUtility.isBool(self.config.isConnected) && self.config.isConnected) || false
        return self.config.isAwaiting || self.config.isConnected || false
    })
}
else {
    /////////////////////
    // Static Members //
    /////////////////////

    const fetchRoom = function(self, name) {
        return (self.isRoom(name) && self.room[name]) || false
    }
    
    CServer.socket.addMethod("constructor", function(self, route) {
        CUtility.fetchVID(self)
        self.route = route, self.network = {}
        self.instance = {}, self.room = {}
        self.server = new CWS.Server({
            noServer: true,
            path: `/${self.route}`
        })
        CServer.instance.CHTTP.on("upgrade", function(request, socket, head) {
            self.server.handleUpgrade(request, socket, head, function(socket) {
                self.server.emit("onClientConnect", socket, request)
                console.log("CLIENT CONNECTED")
            })
        })
        self.server.on("onClientConnect", function(socket, request) {
            var [instance, query] = request.url.split("?")
            instance = CServer.socket.fetch(instance.slice(1))
            if (!instance) return false
            const vid = CUtility.fetchVID(socket)
            self.instance[vid] = socket
            socket.room = {}
            query = CUtility.queryString.parse(query)
            socket.onclose = function() {
                delete self.instance[vid]
                for (const i in socket.room) {
                    if (self.isRoom(i)) delete self.room[i][vid]
                }
            }
            socket.onmessage = function(payload) {
                payload = JSON.parse(payload)
                if (!CUtility.isObject(payload) || !CUtility.isString(payload.networkName) || !CUtility.isArray(payload.networkArgs)) return false
                self.emit(payload.networkName, null, ...payload.networkArgs)
            }
        })
    }, "isInstance")

    
    ///////////////////////
    // Instance Members //
    ///////////////////////

    CServer.socket.addInstanceMethod("isClient", function(self, client) {
        const vid = CUtility.fetchVID(client)
        return (vid && CUtility.isObject(self.instance[vid]) && true) || false
    })

    CServer.socket.addInstanceMethod("createRoom", function(self, name) {
        if (self.isRoom(name)) return false
        self.room[name] = CServer.room.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
        return true
    })

    CServer.socket.addInstanceMethod("destroyRoom", function(self, name) {
        if (!self.isRoom(name)) return false
        self.room[name].destroy()
        delete self.room[name]
        return true
    })

    CServer.socket.addInstanceMethod("joinRoom", function(self, name, client) {
        if (!self.isClient(client) || !self.isRoom(name) || self.isInRoom(name, client)) return false
        const vid = CUtility.fetchVID(client)
        self.room[name][vid] = true
        return true
    })

    CServer.socket.addInstanceMethod("emitRoom", function(self, name, network, ...cArgs) {
        if (!self.isRoom(name)) return false
        for (const i in self.room[name]) {
            self.emit(network, self.instance[i], ...cArgs)
        }
        return true
    })
}