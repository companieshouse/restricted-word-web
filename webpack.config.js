const path = require("path");

module.exports = {
    entry: {
        fancyFramework: "./client/fancyFramework.js"
    },
    output: {
        path: path.resolve(__dirname, "dist/js"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [["@babel/preset-env"]],
                        plugins: [
                            // List can be found in dependencies of @babel/preset-env
                        ]
                    }
                }
            }
        ]
    }
};
