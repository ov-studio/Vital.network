/*----------------------------------------------------------------
     Resource: vNetworkify
     Script: webpack.config.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Webpack Confign
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CFS = require("fs")
const CPath = require("path")
const CPackage = require("./package.json")
const CNodeExternals = require("webpack-node-externals")
const CUtilPath = "./src/utilities/index.js"
var CUtil = (CFS.readFileSync(CUtilPath)).toString()
CUtil = CUtil.replace(/(CUtility.version)(.*)/, `$1 = Object.defineProperty(CUtility, "version", {value: CUtility.toBase64("${CPackage.version}"), enumerable: true, configurable: false, writable: false})`)
CFS.writeFileSync(CUtilPath, CUtil)


//////////////
// Exports //
//////////////

module.exports = [
    ////////////////
    // Front End //
    ////////////////

    {
        target: "web",
        mode: "production",
        entry: {
            app: ["./src/importer.js"]
        },
        output: {
          path: CPath.resolve(__dirname, "build"),
          filename: `${CPackage.name}-client.js`
        },
        resolve: {
            alias: {
                "querystring": false,
                "crypto": false,
                "cors": false,
                "http": false,
                "https": false,
                "express": false,
                "compression": false,
                "url": false,
                "ws": false
            }
        }
    },


    ///////////////
    // Back End //
    ///////////////

    {
        target: "node",
        mode: "production",
        entry: {
          app: ["./src/importer.js"]
        },
        output: {
          path: CPath.resolve(__dirname, "build"),
          filename: `${CPackage.name}-server.js`
        },
        externals: [CNodeExternals()]
    }
]