//@ts-check

"use strict";

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

/**@type {import('webpack').Configuration}*/
const config = {
  target: "web",
  entry: ["./src/index.js", "./views/style.css"],
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    libraryTarget: "global",
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
  devtool: "source-map",
  resolve: {
    extensions: [".js"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./views/index.html",
    }),
    new MiniCssExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [["./rt-polyfill/babel-plugin.js", { syntaxType: "hash" }]],
          },
        },
      },
    ],
  },
};

module.exports = config;
