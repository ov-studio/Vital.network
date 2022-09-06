/*----------------------------------------------------------------
     Resource: Vital.network
     Script: webpack.config.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Webpack Confign
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

//const CFS = require("fs")
const CPath = require("path")
const vKit = require("@vstudio/vital.kit")
const CPackage = require("./package.json")
//const CUtilPath = "./src/utilities/index.js"
//var CUtil = (CFS.readFileSync(CUtilPath)).toString()
//CUtil = CUtil.replace(/(CUtility.version)(.*)/, `$1 = Object.defineProperty(CUtility, "version", {value: CUtility.toBase64("${CPackage.version}"), enumerable: true, configurable: false, writable: false})`)
//CFS.writeFileSync(CUtilPath, CUtil)


//////////////
// Exports //
//////////////

const ignore = ["cors", "http", "express", "compression", "ws"]
ignore.forEach((i) => {
    vKit.ignore.web[i] = false
})

module.exports = [
    {
        target: "web",
        mode: "production",
        entry: {
            app: ["./src/"]
        },
        output: {
          path: CPath.resolve(__dirname, "build"),
          filename: `${CPackage.name}-client.js`
        },
        resolve: {
            alias: vKit.ignore.web
        }
    },

    {
        target: "node",
        mode: "production",
        entry: {
          app: ["./src/"]
        },
        output: {
          path: CPath.resolve(__dirname, "build"),
          filename: `${CPackage.name}-server.js`
        },
        externals: [require("webpack-node-externals")()]
    }
]