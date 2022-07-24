
/*----------------------------------------------------------------
     Resource: vNetworify
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

const fetchNetwork = function(self, name) {
    return (self.isNetwork(name) && self.network[name]) || false
}


///////////////////////
// Instance Members //
///////////////////////

CServer.socket.addInstanceMethod("isInstance", function(self) {
    return (!self.isUnloaded && !CServer.socket.isVoid(self.route) && true) || false
})

CServer.socket.addInstanceMethod("destroy", function(self) {
    if (!self.isInstance()) return false
    self.server.close()
    for (const i in self.network) {
        const j = self.network[i]
        j.destroy()
    }
    CServer.socket.destroy(this.route)
    return true
})

CServer.socket.addInstanceMethod("createNetwork", function(self, name, ...cArgs) {
    if (!self.isInstance() || self.isNetwork(name)) return false
    self.network[name] = CServer.network.create(`Socket:${CUtility.fetchVID(self)}:${name}`, ...cArgs)
    return true
})

CServer.socket.addInstanceMethod("destroyNetwork", function(self, name) {
    if (!self.isInstance() || !self.isNetwork(name)) return false
    self.network[name].destroy()
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

if (!CUtility.isServer) {

}
else {
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
            })
        })
        self.server.on("onClientConnect", function(socket, request) {
            var [instance, query] = request.url.split("?")
            instance = CServer.socket.fetch(instance.slice(1))
            if (!instance) return false
            const vid = CUtility.fetchVID(socket)
            self.instance[vid] = socket
            query = CUtility.queryString.parse(query)
            socket.on("close", function() {
                delete self.instance[(socket.vid)]
            })
            socket.on("message", function(payload) {
                payload = JSON.parse(payload)
                if (!CUtility.isObject(payload) || !CUtility.isString(payload.networkName) || !CUtility.isArray(payload.networkArgs)) return false
                self.emit(payload.networkName, null, ...payload.networkArgs)
            })
        })
    })

    CServer.socket.addInstanceMethod("isClient", function(self, client) {
        if (!self.isInstance()) return false
        const vid = CUtility.fetchVID(client)
        return (vid && CUtility.isObject(self.instance[vid]) && true) || false
    })
}

CServer.socket.addInstanceMethod("isNetwork", function(self, name) {
    if (!self.isInstance()) return false
    return (CUtility.isString(name) && CUtility.isObject(self.network[name]) && self.network[name].isInstance() && true) || false
})

CServer.socket.addInstanceMethod("emit", function(self, name, client, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    if (client) {
        if (!self.isClient(client)) return false
        client.send(JSON.stringify({
            networkName: name,
            networkArgs: cArgs
        }))
        return true
    }
    return cNetwork.emit(...cArgs)
})

CServer.socket.addInstanceMethod("emitCallback", function(self, name, client, ...cArgs) {
    const cNetwork = fetchNetwork(self, name)
    if (!cNetwork) return false
    if (client) {
        if (!self.isClient(client)) return false
        // TODO: ADD REMOTE TRANSFER
        return true
    }
    return cNetwork.emitCallback(...cArgs)
})