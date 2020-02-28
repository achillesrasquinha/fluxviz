import babel    from "rollup-plugin-babel";
import resolve  from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import replace  from "@rollup/plugin-replace"

import { getenv, getenvvar } from "./src/js/util/environment";

export default {
    input: "src/js/index.js",
    output: {
        file: "dist/js/fluxviz.js",
        name: "fluxviz",
        format: "iife"
    },
    plugins: [
        babel({
            exclude:        "node_modules/**",
            runtimeHelpers: true
        }),
        resolve({
            extensions: [".js", ".jsx"],
        }),
        commonjs(),
        replace({
            "process.env.NODE_ENV":                      JSON.stringify( getenv("NODE_ENV", "development", { prefix: null }) ),
            [`process.env.${getenvvar("ENVIRONMENT")}`]: getenv("ENVIRONMENT", "development")
        })
    ]
}