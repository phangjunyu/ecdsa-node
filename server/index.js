const express = require("express");
const app = express();
const cors = require("cors");

const secp = require("ethereum-cryptography/secp256k1");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } =require("ethereum-cryptography/keccak");


const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03119c422f9c1a8fc6d12b2a67f3f89221f838ccd5777b00da390ed8e4ee1af7bb": 100, //27b6df50de0ca5b6ff0ef76d6a81c2c9fe946f8b2abe93677ee31902c7e30a04
  "0329d9e90c0451639bbdb6aeb4e8eb859c4058f248a665f46f96a9bf97d6f2779d": 50, //ab66c4ecbef8e747cb76824d9e7b983bfd1d9af6b595e7df631690521c89f512
  "029e2c58daaef7f1e78f88a2a24d731d735591aa1c5e58d5fea0333cf092f77b37": 75, //fcc9bdd74cbde4b7238857a3d2e077f9adf8d051791405c1917ab7604e59445e
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send2", async (req, res) => {

  const { signature, msgHash, sender } = req.body;
  // console.log("message type:",typeof message)
  // console.log("sender:",sender)
  // console.log("recipient:", recipient)
  // console.log("sendAmount:", sendAmount)
  console.log("signature:", signature)
  console.log("msgHash:", msgHash)
  console.log("sender:", sender)
  
  const isValidSignature = await secp.verify(
    signature, 
    msgHash,
    sender);

  console.log("isValid", isValidSignature);
  res.send({ _s: signature,
     _m: msgHash,
     _a: sender   
    });
  // res.send({ isValid: isValidSignature });
 
});

app.post("/send", async (req, res) => {

  const { signature, ...message } = req.body;
  const {sender, recipient, sendAmount} = message
  // console.log("data:", req.body);
  // console.log("message type:",typeof message)
  // console.log("sender:",sender)
  // console.log("recipient:", recipient)
  // console.log("sendAmount:", sendAmount)
  const msgHash = keccak256(utf8ToBytes(JSON.stringify(message)));
  console.log("signature:", Object.values(signature).toString())
  console.log("msgHash:", msgHash)
  console.log("sender:", sender)
  
  const isValidSignature = await secp.verify(
    Object.values(signature).toString(), 
    msgHash.toString(),
    sender);

  console.log("isValid", isValidSignature);
  if(!isValidSignature){
    res.status(400).send({message:"invalid signature"});
    return;
  }
  
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < sendAmount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= sendAmount;
    balances[recipient] += sendAmount;
    res.send({ balance: balances[sender] });
  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
