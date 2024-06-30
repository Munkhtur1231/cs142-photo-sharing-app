"use strict";

let crypto = require("crypto");
function makePasswordEntry(clearTextPassword) {
  let hash = crypto.createHash("sha1");
  let salt = crypto.randomBytes(8).toString("hex");
  hash.update(clearTextPassword + salt);
  return {
    salt: salt,
    hash: hash.digest("hex"),
  };
}

function doesPasswordMatch(hash, salt, clearTextPassword) {
  let hash1 = crypto.createHash("sha1");
  hash1.update(clearTextPassword + salt);
  let password = hash1.digest("hex");
  return password === hash;
}

module.exports = {
  makePasswordEntry: makePasswordEntry,
  doesPasswordMatch: doesPasswordMatch,
};
