import React from "react";
import { useState, useEffect } from "react";
import background from "./congruent_pentagon.png"
import { ethers } from "ethers";

import "bootstrap/dist/css/bootstrap.min.css";
import {
  Row, 
  Navbar,
  Nav,
  Col,
  Button,
  Container,
  Card
} from "react-bootstrap";

import useWeb3Modal from "./hooks/useWeb3Modal";

import { TwitterForm } from "./components/TwitterForm"
import { GithubForm } from "./components/GithubForm"
import ReactEmbedGist from 'react-embed-gist';
import { Tweet } from 'react-twitter-widgets'

import {enableFilecoinSnap, metamaskFilecoinSnap} from "@nodefactory/filsnap-adapter"

const axios = require('axios');

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {!provider ? "Connect Wallet" : "Disconnect Wallet"}
    </Button>
  );
}

function App() {
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [twitterModalShow, setTwitterModalShow] = useState(false);
  const [githubModalShow, setGithubModalShow] = useState(false);

  const [githubAccount, setGithubAccount] = useState("")
  const [twitterAccount, setTwitterAccount] = useState("")
  const [githubLink, setGithubLink] = useState("")
  const [twitterLink, setTwitterLink] = useState("")
  const [verificationStateG, setVerificationStateG] = useState(false)
  const [verificationStateT, setVerificationStateT] = useState(false)


  //this function should sit inside of metamask snap if possible.
  async function checkVC(platform) {
    const owner = provider.getSigner();
    const address = await owner.getAddress();
    const sig = await owner.signMessage(`${platform} access`);        

    console.log("checking for VC...")
    const results = await axios.get(`http://localhost:4000/getCredential/${address}/${platform}/${sig}`)
    console.log(results.data)

    if (results.data.length>0) {      
      //add method for filtering all unique later, "foreach" isn't required if we can filter straight from api query. 
      if(platform==="github"){
        let found = false;
        results.data.forEach((d) => {
          if(d.verifiableCredential.credentialSubject.id===`did:ethr:${address}` && found===false)
          {
            console.log(d.verifiableCredential.credentialSubject.proof.split("/"))
            setGithubAccount(d.verifiableCredential.credentialSubject.githubAccount)
            setGithubLink(d.verifiableCredential.credentialSubject.proof)
            setVerificationStateG(true)
            found=true
          }
        })
      } else if (platform==="twitter") {
        let found = false;
        results.data.forEach((d) => {
          if(d.verifiableCredential.credentialSubject.id===`did:ethr:${address}` && found===false)
          {
            console.log(d.verifiableCredential.credentialSubject.proof.split("/"))
            setTwitterAccount(d.verifiableCredential.credentialSubject.twitterAccount)
            setTwitterLink(d.verifiableCredential.credentialSubject.proof.split("/")[5])
            setVerificationStateT(true)
            found=true
          }
        })
      }
    } else {
      console.log(`no VC found yet for ${platform}`)
    }
  }
  
  async function connectSnap() {
    // install snap and fetch API
    const snap = await enableFilecoinSnap({network: "t"});
    const api = await metamaskFilecoinSnap.getFilecoinSnapApi();
    
    // invoke API
    const address = await api.getAddress();
    
    console.log(`Snap installed, account generated with address: ${address}`);
  }

  // /// this is for on provider load instead of onClick buttons.
  // useEffect(() => {
  //   try {
  //     const owner = provider.getSigner();
  //     if(owner!=undefined){
  //         connectSnap()
  //         // //call metamask snaps api. need a wallet instance and attach listeners? 
  //         // checkVC("twitter")
  //         // checkVC("github")
  //     } 
  //   } catch (error) {
  //   }
  // },[provider])

  return (
    <div
      style={{
        backgroundImage: `url(${background})`, height: "100vh"
      }}
    >
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">
          <span role="img" aria-label="doge">
          🆔
          </span>{" "}
          Hack-Identity
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="https://docs.serto.id/docs/serto-agent/getting-started">Serto Agent</Nav.Link>
            <Nav.Link href="https://staging.schemas.serto.id/schema/twitter-verify">
              Twitter VC Schema
            </Nav.Link>
            <Nav.Link href="https://staging.schemas.serto.id/schema/github-verify">
              Github VC Schema
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <WalletButton
            className="ml-auto"
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
      </Navbar>

      <br></br>

      <Container>
        <Row>
            <Col xs={6}>
              <Card>
                <Button style = {{fontSize: 14}}
                                  className='m-1'
                                  onClick={() => setTwitterModalShow(true)}
                                  variant="primary"
                                  disabled={verificationStateT}
                                >
                                  Get Twitter Verification
                                </Button >
                <TwitterForm
                  show={twitterModalShow}
                  onHide={() => setTwitterModalShow(false)}
                  provider={provider}
                />

                <Button style = {{fontSize: 14}}
                                  className='m-1'
                                  variant="secondary"
                                  onClick={() => checkVC("twitter")}>Check for Twitter credential</Button>

                <br></br>
                <br></br>
                <h5>&nbsp;&nbsp;Found credential for Twitter Handle: <a target = "_blank" href={`https://twitter.com/@${twitterAccount}`} >@{twitterAccount}</a></h5>
                <div className="ml-3">
                   <Tweet tweetId={twitterLink} />
                </div>
                <br></br>
              </Card>
            </Col>

            <Col xs={6}>
              <Card>
                <Button style = {{fontSize: 14}}
                                    className='m-1'
                                    onClick={() => setGithubModalShow(true)}
                                    variant="primary"
                                    disabled={verificationStateG}
                                  >
                                    Get Github Verification
                                  </Button >
                  <GithubForm
                    show={githubModalShow}
                    onHide={() => setGithubModalShow(false)}
                    provider={provider}
                  />

                <Button style = {{fontSize: 14}}
                                  className='m-1'
                                  variant="secondary"
                                  onClick={() => checkVC("github")}>Check for Github credential</Button>

                <br></br>
                <br></br>
                <h5>&nbsp;&nbsp;Found credential for Github Handle: <a target = "_blank" href={`https://github.com/${githubAccount}`} >@{githubAccount}</a></h5>
                <div className="ml-3">
                  <ReactEmbedGist gist={`${githubAccount}/${githubLink}`}/>
                </div>
                
                <br></br>
              </Card>
            </Col>
        </Row>

      </Container>
    </div>
  );
}

export default App;
