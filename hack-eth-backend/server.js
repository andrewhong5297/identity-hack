const puppeteer = require('puppeteer');
const express = require('express');
const ethers = require('ethers');
const axios = require('axios');
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const app = express();

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
  });

app.get('/', async (req,res) => {
    res.send("hello world");
})

//http://localhost:4000/twitter/AndrewRinkeby/AndrewRinkeby%20bJouITpgII/0xa55E01a40557fAB9d87F993d8f5344f1b2408072
app.get('/twitter/:handle/:message/:address', async (req,res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`https://twitter.com/${req.params.handle}`, { waitUntil: 'networkidle2' });

        const results = await page.$$eval('article div[lang]', (tweets) => tweets.map((tweet) => tweet.textContent));
        const results_links = await page.$$eval('article a', (tweetlinks) => tweetlinks.map((link) => link["href"]));
        
        let final_link = null
        let sig = null
        let found = false;
        results.forEach((d, idx) => {
            if(d.includes("Tweeting to verify ownership hack-id") && found===false)
            {
                sig = d.split("sig:")[1];
                final_link = results_links[idx>0 ? idx*3-1 : 2] //multiple of 3 doesn't work if it is the most recent tweet
                found=true
            }
        })
        const sig_address = await ethers.utils.verifyMessage(req.params.message, sig);

        let verified = sig_address==req.params.address ? true : false 

        // console.log("finished verification: ", req.params.address, req.params.handle, final_link, req.params.message)
        
        if(verified===true) {
            console.log("try to issue vc...")
            const credential = JSON.stringify({
                "credential": {
                    "@context": [
                        "https://www.w3.org/2018/credentials/v1",
                        "https://staging.api.schemas.serto.id/v1/public/twitter-verify/1.1/ld-context.json"
                    ],
                    "type": [
                        "VerifiableCredential",
                        "TwitterVerify"
                    ],
                    "issuer": {
                        "id": "did:ethr:0x02cb339a60324c92bd8f0169c7d819d178b3014da0ec4c85dd93afb8965a539584"
                    },
                    "issuanceDate": new Date().toISOString(),
                    "credentialSubject": {
                        "id": `did:ethr:${req.params.address}`,
                        "twitterAccount": req.params.handle,
                        "proof": final_link
                    },
                    "credentialSchema": {
                        "id": "https://staging.api.schemas.serto.id/v1/public/twitter-verify/1.1/json-schema.json",
                        "type": "JsonSchemaValidator2018"
                    }
                },
                "revocable": true,
                "keepCopy": true,
                "save": "true",
                "proofFormat": "jwt"
            })

            const config = {
                method: "post",
                url: "https://beta.agent.serto.id/v1/agent/createVerifiableCredential/",
                headers: {
                    'authorization': process.env.API_KEY,
                    "content-type": "application/json",
                },
                data: credential
                }
            try {
                console.log(config)
                const response = await axios(config)
                verified=true;
                console.log(response.data)
            } catch (error) {
                console.log(error.response.data)
                res.send(error)
                verified=false;
            }
        }

        res.send({sig_address, verified});
    } catch (error) {
        console.log(error)
        res.send({ error: error.reason, verified: false})
    }
})

//http://localhost:4000/github/andrewhong5297/andrewhong5297%20dKkIjPapfo/0xa55E01a40557fAB9d87F993d8f5344f1b2408072/ec166e0aec3ae3c9bfe7eb2a0ceeae7f
app.get('/github/:handle/:message/:address/:link', async (req,res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://gist.github.com/${req.params.handle}/${req.params.link}`, { waitUntil: 'networkidle2' });
    
    try {
        const results = await page.evaluate(() => {
            let username = document.querySelector('span[class="author"]').textContent
            let code = document.querySelector('div[class="Box-body p-0 blob-wrapper data type-javascript  gist-border-0"]').textContent
            return { username, code}
        }) 

        let sig = results.code.split("sig:")[1].trim();
        const sig_address = await ethers.utils.verifyMessage(req.params.message, sig);

        let verified = sig_address==req.params.address && req.params.handle ==results.username ? true : false 

        if(verified===true) {
            const credential = JSON.stringify({
                "credential": {
                    "@context": [
                        "https://www.w3.org/2018/credentials/v1",
                        "https://staging.api.schemas.serto.id/v1/public/github-verify/1.1/ld-context.json"
                    ],
                    "type": [
                        "VerifiableCredential",
                        "GithubVerify"
                    ],
                    "issuer": {
                        "id": "did:ethr:0x02cb339a60324c92bd8f0169c7d819d178b3014da0ec4c85dd93afb8965a539584"
                    },
                    "issuanceDate": new Date().toISOString(),
                    "credentialSubject": {
                        "id": `did:ethr:${req.params.address}`,
                        "githubAccount": req.params.handle,
                        "proof": req.params.link
                    },
                    "credentialSchema": {
                        "id": "https://staging.api.schemas.serto.id/v1/public/github-verify/1.0/json-schema.json",
                        "type": "JsonSchemaValidator2018"
                    }
                },
                "revocable": true,
                "keepCopy": true,
                "save": "true",
                "proofFormat": "jwt"
            })
            const config = {
                method: "post",
                url: "https://beta.agent.serto.id/v1/agent/createVerifiableCredential/",
                headers: {
                    'authorization': process.env.API_KEY,
                    'content-type': "application/json",
                },
                data: credential
            }
            try {
                console.log(config)
                const response = await axios(config)
                verified=true;
                console.log(response.data)
            } catch (error) {
                console.log(error.response.data)
                res.send(error)
                verified=false;
            }
        }

        res.send({sig_address, verified});
    } catch (error) {
        console.log(error)
        res.send({ error: error.reason, verified: false});
    }
})
//http://localhost:4000/getCredential/0xa55E01a40557fAB9d87F993d8f5344f1b2408072/twitter/0x3e5bc75ec87956d14077a95002c2000dd128d1d7531f6985562ae33038bcda464554e033861a62afe73a85a7bd4e9aa4d65fdcda5cb6744e95a34622f1aaa2781b
app.get("/getCredential/:address/:platform/:signature", async (req, res) => {
    //get authorized to see their credential
    const sig_address = await ethers.utils.verifyMessage(`${req.params.platform}data`, req.params.signature);
    console.log("verified: ", sig_address)
    let verified = sig_address==req.params.address ? true : false 

    if(verified) {
         //post request for credential
        const config = {
            method: 'post',
            url: 'https://beta.agent.serto.id/v1/agent/dataStoreORMGetVerifiableCredentials/',
            headers: { 
            'authorization': process.env.API_KEY,
            'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                    "order": [
                    {
                        "column": "issuanceDate",
                        "direction": "DESC"
                    }
                    ],
                    "where": [
                    {
                        "column": "context",
                        "value": [
                        [
                            "https://www.w3.org/2018/credentials/v1",
                            `https://staging.api.schemas.serto.id/v1/public/${req.params.platform}-verify/1.1/ld-context.json`
                        ]
                        ]
                    },
                    {
                        "column": "subject",
                        "value": [
                            {"did": `did:ethr:${req.params.address}`}
                        ]
                    }
                    ]
                })
            }

            try {
                const response = await axios(config)
                // console.log(response.data)
                res.send(response.data);
            } catch (error) {
                console.log(error.response.data)
                res.send("failed");
            }
    } else {
        res.send("not authorized")
    }
})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`listening on port ${port}...`));