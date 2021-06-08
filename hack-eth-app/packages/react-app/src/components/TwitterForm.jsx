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

export const TwitterForm = (props) => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [handle, setHandle] = useState()
    const [tweetUrl, setTweetUrl] = useState("https://twitter.com/intent/tweet?text=no%20sig%20yet")

    async function createSign (data) {
        
        console.log("submitted", data.handle);
        const owner = props.provider.getSigner();

        const sig = await owner.signMessage(data.handle);
        console.log("signed", sig)
        setHandle(data.handle);
        setTweetUrl(`https://twitter.com/intent/tweet?text=Tweeting%20to%20verify%20ownership%20hack-id%20sig:${sig}`)
    } 

    async function checkSig () {
        //webscraper goes here for most recent messages under the handle
        const sig = "webscraped result"
        const sig_address = await ethers.utils.verifyMessage(handle, sig);
        console.log("signing address", sig_address)
    }

    //need a button onClick() for after submission to pass an EIP712 sign with the handle as the message
    //need to manage state of "Create twitter post" button and also the link that gets populated
    //need to manage state of "Finish verification" button after tweet that checks for tweet, if tweet isn't found you get error and can try again

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
                        <input defaultValue="test123" {...register("handle", { required: true })} />
                        {/* errors will return when field validation fails  */}
                        {errors.handle && <span>This field is required</span>}
                        <input type="submit" />
                    </form>
                    <br></br>
                    <div>
                        <p>
                        <b>Post your signature from the inputted twitter handle</b>
                        </p>
                        <Button style={{display: "table-cell"}} href={tweetUrl} target="_blank">Create twitter post</Button>
                    </div>
                    <br></br>
                    <div>
                        <p>
                        <b>After posting, claim your credential below</b>
                        </p>
                        {/* add onClick change state */}
                        <Button onClick={checkSig}>Claim Verification</Button>
                    </div>
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    </div>
    );
  }