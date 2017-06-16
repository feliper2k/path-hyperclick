'use babel';

import path from "path";
import fs from "fs";
import Promise from "bluebird";

const autocompletePaths = [
  '.js',
  '.scss',
  '.html',
  '/index.js',
  '/index.html'
];

const fileExists = (path) => new Promise((resolve, reject) => {
  fs.access(path, (err) => {
    if(err && err.code === 'ENOENT') {
      return reject(err);
    }
    resolve(path);
  });
});

module.exports = {
  activate() {
    require("atom-package-deps").install("path-hyperclick");
  },
  getProvider() {
    return {
      wordRegExp: /\.{0,2}\/[A-Za-z0-9\-_\/.][A-Za-z0-9\-_\/. ]*/g,
      providerName: "path-hyperclick",
      /**
       * textEditor {atom$TextEditor}
       * path {string}
       * range {atom$Range}
       */
      getSuggestionForWord(textEditor, _path, range){
        let dir = path.dirname(atom.workspace.getActiveTextEditor().getPath());
        _path = path.join(dir, _path);
        return {
          range,
          callback() {
            if (_path === undefined || _path.length === 0) { return; }

            const completedPaths = autocompletePaths
              .map((postfix) => `${_path}${postfix}`);

            Promise.any([...completedPaths, _path].map(fileExists))
              .then((found) => {
                atom.workspace.open(found);
              })
              .catch((err) => {
                atom.notifications.addError("File doesn't exist");
              });
          }
        };
      }
    };
  }
};
