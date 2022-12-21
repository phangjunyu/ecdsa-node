import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { useState } from "react";


function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  const [prompt, setPrompt] = useState("");

  async function onAddressChange(evt) {
    const address = evt.target.value;
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  async function onPrivateKeyChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    if (privateKey) {
      try{
        const publicKey = toHex(secp.getPublicKey(privateKey, true));
        setAddress(publicKey);
        setPrompt("valid privateKey!")
        const {
          data: { balance },
        } = await server.get(`balance/${publicKey}`);
        setBalance(balance);
      } catch(ex){
        // console.log(ex);
        setPrompt("Please enter a valid 32byte private key")
      }

  } else {
    setBalance(0);
  }
}

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Wallet Address
        <input placeholder="Type an address, for example: 0x1" value={address} onChange={onAddressChange}></input>
      </label>

      <label>
        Private Key
        <input placeholder="If you want to make a transfer, enter your private key to generate a signature" value={privateKey} onChange={onPrivateKeyChange}></input>
      </label>

      <div className="prompt">
        {prompt}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
