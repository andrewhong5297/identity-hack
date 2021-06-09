import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
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

  const [githubAccount, setGithubAccount] = useState("not set")
  const [twitterAccount, setTwitterAccount] = useState("not set")
  const [githubLink, setGithubLink] = useState("none")
  const [twitterLink, setTwitterLink] = useState("none")
  const [verificationState, setVerificationState] = useState(false)

  async function checkVC() {
    console.log("checking for VCs")
    //need to check for VCs, if false then allow buttons otherwise disable buttons.
    const verified = false
    if (verified) {
      setVerificationState(true)
      //query for VC 
    }

    setGithubAccount("andrewhong5297")
    setTwitterAccount("andrewhong5297")
    setGithubLink("ec166e0aec3ae3c9bfe7eb2a0ceeae7f")
    setTwitterLink("1402438431461064704")
  }
  
  useEffect(() => {
    try {
      const owner = provider.getSigner();

      if(owner!=undefined){
          //call metamask snaps api. need a wallet instance and attach listeners? 
          checkVC()
      } 
    } catch (error) {
    }
  },[provider])

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
            <Nav.Link href="https://staging.schemas.serto.id/schema/twitter-verify">
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
                                  disabled={verificationState}
                                >
                                  Get Twitter Verification
                                </Button >
                <TwitterForm
                  show={twitterModalShow}
                  onHide={() => setTwitterModalShow(false)}
                  provider={provider}
                />

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
                                    disabled={verificationState}
                                  >
                                    Get Github Verification
                                  </Button >
                  <GithubForm
                    show={githubModalShow}
                    onHide={() => setGithubModalShow(false)}
                    provider={provider}
                  />

                <br></br>
                <br></br>
                <h5>&nbsp;&nbsp;Found credential for Github Handle: <a target = "_blank" href={`https://github.com/${githubAccount}`} >@{githubAccount}</a></h5>
                <div className="ml-3">
                  <ReactEmbedGist gist={`${githubAccount}}/${githubLink}`}/>
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
