import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Button,
    Spinner,
    Alert,
    Modal
  } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { ethers } from "ethers";
const axios = require('axios');

export const GithubForm = (props) => {
    const [vcAlert, setAlert] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();
    const [message, setMessage] = useState()
    const [gistCode, setGistCode] = useState(<i>no signature yet</i>)
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
        const owner = props.provider.getSigner();
        const tempMessage = data.handle + " " + makeSalt(10)
        const sig = await owner.signMessage(tempMessage);  
        
        setMessage(tempMessage);
        console.log("submitted", data.handle);
        console.log("message: ", message)     
        console.log("signature: ", sig) 
        setVCButtonState(false) //make VC button visible

        setGistCode(`Posting to verify ownership hack-id sig:${sig}`)
    } 

    async function checkSig (data) {
        setLoading(true)
        setVCButtonState(true)

        console.log(data.link)
        const owner = props.provider.getSigner();
        const address = await owner.getAddress();
        const handle = message.split(" ")[0]
        const link = data.link.split("/")[4]

        console.log(`URL: http://localhost:4000/github/${handle}/${encodeURI(message)}/${address}/${link}`)
        const results = await axios.get(`http://localhost:4000/github/${handle}/${encodeURI(message)}/${address}/${link}`)
        console.log(results.data)
        setLoading(false)
        setVCButtonState(false)

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
                    Verification failed - did you make sure to link the correct gist? 
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
                    <b>Input your github handle and sign the message popup</b>
                    </p>
                        <form onSubmit={handleSubmit(createSign)}>
                            <input defaultValue="andrewhong5297" {...register("handle", { required: true })} />
                            {errors.handle && <span>This field is required</span>}
                            <input type="submit" />
                        </form>
                    <br></br>
                        <div className="request-top" style={{whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}>
                            <p>Copy the following text post it in a public <a target="_blank" href="https://gist.github.com/">gist</a> named <code>hack-id.js</code>: <i>{gistCode}</i></p>
                        </div>
                    <div>
                        
                    <br></br>
                    <br></br>
                    <p>
                        <b>After posting, paste the gist link below and claim your credential</b>
                    </p>
                        <form onSubmit={handleSubmit(checkSig)}>
                        <input defaultValue="https://gist.github.com/andrewhong5297/ec166e0aec3ae3c9bfe7eb2a0ceeae7f" {...register("link", { required: true })} />
                        {errors.link && <span>This field is required</span>}
                        <input type="submit" disabled={getVCButton}/>
                        { isLoading
                            ? <Spinner 
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true" />
                            : null
                            }
                        </form>
                        {vcAlert}
                    </div>
                </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    </div>
    );
  }