import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ privateKey, setBalance, address }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [signature, setSignature] = useState("");
  const [prompt, setPrompt] = useState("")

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const details = {
      sender:address,
      recipient: recipient,
      sendAmount: parseInt(sendAmount)
    };
    const msgHash = keccak256(utf8ToBytes(JSON.stringify(
      details
    )));

    const [signature, recoveryBit] = await secp.sign(msgHash, privateKey, {recovered:true});
    console.log("recoveryBit:", recoveryBit)
    setSignature(signature);
    // console.log("message:", details)
    // console.log("sig:", typeof signature)
    // console.log("msgHash:", typeof msgHash)
    // console.log("address:", typeof address)

    const isValidSignature = await secp.verify(
      signature, 
      msgHash,
      address)
    console.log("isValid", isValidSignature);
    
    try {
      const {data:{
        _s,
        _m,
        _a
      }} = await server.post(`send2`, {
        signature: signature,
        msgHash: msgHash,
        sender: address
      });
      console.log(_s)
      console.log(typeof signature)
      console.log(_m)
      console.log(msgHash)
    
      const isValidSignature2 = await secp.verify(
        _s, 
        _m,
        _a);
      console.log("isValid2", isValidSignature2);
        console.log("_s:", _s)
        console.log("_s2:", Object.values(_s))
      console.log("signature?", signature.toString() === Object.values(_s).toString());
      console.log("msgHash?", msgHash.toString() === _m.toString());
      console.log("address?", address === _a.toString());

    } catch (ex) {
      console.log("ex:",ex);
      alert(ex.response.data.message);
    }
    // try {
    //   const {
    //     data: { balance },
    //   } = await server.post(`send`, {
    //     signature: signature,
    //     ...details
    //   });
    //   setBalance(balance);
    // } catch (ex) {
    //   alert(ex.response.data.message);
    // }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <div className="prompt">
        {prompt}
      </div>

      <input type="submit" className="button" value="Transfer"/>

    </form>
  );
}

export default Transfer;
