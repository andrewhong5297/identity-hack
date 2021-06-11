/**
 * This example will use its app key as a signing key, and sign anything it is asked to.
 */

const ethers = require('ethers');
// const axios = require('axios');

/*
 * The `wallet` API is a superset of the standard provider,
 * and can be used to initialize an ethers.js provider like this:
 */
const provider = new ethers.providers.Web3Provider(wallet);

wallet.registerRpcMessageHandler(async (_originString, requestObject) => {
  console.log('received request', requestObject);
  const privKey = await wallet.getAppKey();
  // console.log(`privKey is ${privKey}`);
  const ethWallet = new ethers.Wallet(privKey, provider);
  // console.dir(ethWallet);

  switch (requestObject.method) {
    case 'getTwitterVC': {
      const address = ethWallet.address;
      const sig = await ethWallet.signMessage(`twitter access`);        

      console.log("checking for VC...")
      const results = await axios.get(`http://localhost:4000/getCredential/${address}/twitter/${sig}`)
      console.log(results.data)

      if (results.data.length>0) {      
        //add method for filtering all unique later, "foreach" isn't required if we can filter straight from api query. 
          results.data.forEach((d) => {
            if(d.verifiableCredential.credentialSubject.id===`did:ethr:${address}`)
            {
              console.log(d.verifiableCredential.credentialSubject.proof.split("/"))
              return ({"account":d.verifiableCredential.credentialSubject.twitterAccount, "link": d.verifiableCredential.credentialSubject.proof.split("/")[5])
            }
          })
        }
      } else {
        return({"account": "not found", "link": "not found"})
      }
    }

    default:
      throw new Error('Method not found.');
  }
});
