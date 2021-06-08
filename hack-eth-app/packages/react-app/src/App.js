import React from "react";
import { Contract } from "@ethersproject/contracts";
import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import { useState, useEffect } from "react";
import background from "./congruent_pentagon.png"

import "bootstrap/dist/css/bootstrap.min.css";
import {
  Row, 
  Navbar,
  Nav,
  Col,
  Button,
  Spinner,
  Container,
  Alert,
  Modal
} from "react-bootstrap";

import useWeb3Modal from "./hooks/useWeb3Modal";

import { TwitterForm } from "./components/TwitterForm"

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

  //need to check for VCs, if false then allow buttons otherwise disable buttons.

  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
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
            <Nav.Link href="https://youtu.be/_4RbHpNJAA8">Serto Agent</Nav.Link>
            <Nav.Link href="https://hack.ethglobal.co/marketmake/teams/rechblh1Znn8U0uzU/recpnc2Ir529X7aJI">
              Verifiable Credential Schema
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
          <Col>
            <Button style = {{fontSize: 14}}
                              onClick={() => setTwitterModalShow(true)}
                              variant="secondary"
                            >
                              Get Twitter Verification
                            </Button >
            <TwitterForm
              show={twitterModalShow}
              onHide={() => setTwitterModalShow(false)}
              provider={provider}
            />
          </Col>

          <Col>
            <Button style = {{fontSize: 14}}
                              onClick={() => setTwitterModalShow(true)}
                              variant="secondary"
                            >
                              Get Github Verification
                            </Button >
            <TwitterForm
              show={twitterModalShow}
              onHide={() => setTwitterModalShow(false)}
              provider={provider}
            />
          </Col>
        </Row>

        <br></br>
        <br></br>
        <br></br>
        <br></br>

        <Row>
          <Col>
           <h3>Github data component</h3>
          </Col>
          <Col>
            <h3>Twitter data component</h3>
          </Col>
        </Row>
      </Container>
      {/* fill out the whole page with twitter and github data */}
    </div>
  );
}

export default App;
