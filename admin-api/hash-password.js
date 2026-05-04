"use strict";

const crypto = require("crypto");

const password = process.argv[2];
if (!password) {
  console.error("Usage: node hash-password.js <password>");
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
console.log(`scrypt$${salt.toString("base64")}$${hash.toString("base64")}`);
