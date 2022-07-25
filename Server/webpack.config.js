
/*----------------------------------------------------------------
     Resource: vNetworify
     Script: webpack.config.js
     Author: vStudio
     Developer(s): Aviril, Mario, Tron
     DOC: 22/07/2022
     Desc: Webpack Configuration
----------------------------------------------------------------*/


//////////////
// Imports //
//////////////

const CPath = require("path")
const CPackage = require("./package.json")
const CNodeExternals = require("webpack-node-externals")


//////////////
// Exports //
//////////////

module.exports = [
    ////////////////
    // Front End //
    ////////////////

    {
        target: "web",
        entry: {
            app: ["./src/importer.js"]
        },
        output: {
          path: CPath.resolve(__dirname, "build"),
          filename: `${CPackage.name}-client.js`
        },
        resolve: {
            alias: {
                "ws": false,
                "querystring": false,
                "cors": false,
                "http": false,
                "express": false
            }
        },
        devServer: {
          host: "0.0.0.0",
          publicPath: "/assets/",
          contentBase: CPath.resolve(__dirname, "./views"),
          watchContentBase: true,
          compress: true,
          port: 9001
        },
        devtool: "inline-source-map"
    },


    ///////////////
    // Back End //
    ///////////////

    {
        target: "node",
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