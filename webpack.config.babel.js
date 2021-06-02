import webpack from "webpack"

export default {
    entry: "./js/src",
    output: {
        filename: "fluxviz.js",
        library: {
            name: "fluxviz",
            type: "umd"
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.FLUXVIZ_ENVIRONMENT': JSON.stringify(process.env.ENVIRONMENT || "development")
        }),
    ]
}