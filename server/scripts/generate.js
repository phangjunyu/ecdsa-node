const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();
const publicKey = secp.getPublicKey(privateKey, isCompressed=true);
console.log("privateKey is: ", toHex(privateKey))
console.log("compressed publicKey is: ", toHex(publicKey))