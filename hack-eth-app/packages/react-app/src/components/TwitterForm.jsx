import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Row, 
    Col,
    Button,
    Spinner,
    Container,
    Alert,
    Modal
  } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
const axios = require('axios');

export const TwitterForm = (props) => {
    const [vcAlert, setAlert] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [message, setMessage] = useState()
    const [tweetUrl, setTweetUrl] = useState("https://twitter.com/intent/tweet?text=no%20sig%20yet")

    const [tweetButton,setTweetButtonState] = useState(true);
    const [getVCButton,setVCButtonState] = useState(true);
    
    function makeSalt(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * 
     charactersLength));
       }
       return result;
    }

    async function createSign (data) {
        console.log("submitted", data.handle);
        const owner = props.provider.getSigner();
        const tempMessage = data.handle + " " + makeSalt(10)
        setMessage(tempMessage);

        const sig = await owner.signMessage(tempMessage);        

        setTweetUrl(`https://twitter.com/intent/tweet?text=Tweeting%20to%20verify%20ownership%20hack-id%20sig:${sig}`)
        setTweetButtonState(false) //make tweet button visible
    } 

    async function checkSig () {
        setLoading(true)
        const owner = props.provider.getSigner();
        const address = await owner.getAddress();
        const handle = message.split(" ")[0]

        console.log(`URL: http://localhost:4000/twitter/${handle}/${encodeURI(message)}/${address}`)
        const results = await axios.get(`http://localhost:4000/twitter/${handle}/${encodeURI(message)}/${address}`)
        console.log(results.data)
        setLoading(false)

        if(results.data.verified==true){
            setAlert(
                <Alert variant="success">
                    Credential has been issued!
                    <div className="d-flex justify-content-end">
                        <Button onClick={() => setAlert(false)} variant="outline-success">
                            Close
                        </Button>
                    </div>
                    
                </Alert>
            )
        }

        if(results.data.verified==false){
            setAlert(
                <Alert variant="danger">
                    Verification failed - did you make sure to post the signature? 
                    <div className="d-flex justify-content-end">
                        <Button onClick={() => setAlert(false)} variant="outline-danger">
                            Close
                        </Button>
                    </div>
                </Alert>
            )
        }
    }

    return (
    <div>
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
            >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Twitter Verification Credential Issuance
                </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                     <p>
                    <b>Input your twitter handle and sign the message popup</b>
                    </p>
                    {/* "handleSubmit" will validate your inputs before invoking "onSubmit"  */}
                    <form onSubmit={handleSubmit(createSign)}>
                        {/* register your input into the hook by invoking the "register" function */}
                        <input defaultValue="AndrewRinkeby" {...register("handle", { required: true })} />
                        {/* errors will return when field validation fails  */}
                        {errors.handle && <span>This field is required</span>}
                        <input type="submit" />
                    </form>
                    <br></br>
                    <div>
                        <p>
                        <b>Post your signature from the inputted twitter handle</b>
                        </p>
                        <Button style={{display: "table-cell"}} href={tweetUrl} target="_blank" disabled={tweetButton} onClick={() => setVCButtonState(false)}>Create twitter post</Button>
                    </div>
                    <br></br>
                    <div>
                        <p>
                        <b>After posting, claim your credential below</b>
                        </p>
                        <Button onClick={() => checkSig()} disabled="true" disabled={getVCButton}>
                            { isLoading
                            ? <Spinner 
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true" />
                            : null
                            }
                            &nbsp;&nbsp;Claim Verification
                        </Button>
                    </div>
                    {vcAlert}
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    </div>
    );
  }