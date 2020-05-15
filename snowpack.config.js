
const fs = require("fs");
const path = require("path");

const cwd = process.cwd();
const scripts = {
  "mount:public": "mount public --to .",
  "mount:web_modules": "mount web_modules",
  "mount:src": "mount src --to _dist_",
  "plugin:ts": "./plugin.js",
};

module.exports = {
  scripts,
  devOptions: {},
  installOptions: {
    clean: true,
    installTypes: true,
  },
  installOptions: {
    rollup: {
    }
  }
};