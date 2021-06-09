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
                console.log(idx)
                final_link = results_links[idx>0 ? idx*3-1 : 2] //multiple of 3 doesn't work if it is the most recent tweet
                found=true
            }
        })
        const sig_address = await ethers.utils.verifyMessage(req.params.message, sig);

        const verified = sig_address==req.params.address ? true : false 

        console.log(req.params.address, req.params.handle, final_link, req.params.message)

        // issue VC here
        const config = {
            "method": "POST",
            "headers": {
                "authorization": "Bearer BEARERTOKEN",
                "content-type": "application/json",
            },
            "body": `{\"credential\":{\"@context\":[\"https://www.w3.org/2018/credentials/v1\", \
            \"https://staging.api.schemas.serto.id/v1/public/twitter-verify/1.1/ld-context.json\"], \
            \"type\":[\"VerifiableCredential\",\"TwitterVerify\"], \
            \"issuer\":{\"id\":\"did:ethr:0x039c4df0450b6790efab89bc6e64375ec5c900a4e0ea5179655a94ae743643fc94\"}, \
            \"issuanceDate\":\"2021-06-08T22:14:22.770Z\", \
            \"credentialSubject\":{\"id\":\"did:ethr:${req.params.address}\", \
                                    \"twitterAccount\":\"${req.params.handle}\", \
                                    \"proof\":\"${final_link}\"}, \
            \"credentialSchema\":{\"id\":\"https://staging.api.schemas.serto.id/v1/public/twitter-verify/1.1/json-schema.json\",\"type\":\"JsonSchemaValidator2018\"}}, \
            \"revocable\":true,\"keepCopy\":true,\"save\":\"true\",\"proofFormat\":\"jwt\"}`
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
        console.log(results);

        let sig = results.code.split("sig:")[1].trim();
        const sig_address = await ethers.utils.verifyMessage(req.params.message, sig);

        const verified = sig_address==req.params.address && req.params.handle ==results.username ? true : false 

        //issue VC here
        const config = {
            "method": "POST",
            "headers": {
                "authorization": "Bearer BEARERTOKEN",
                "content-type": "application/json",
            },
            "body": `{\"credential\":{\"@context\":[\"https://www.w3.org/2018/credentials/v1\", \
            \"https://staging.api.schemas.serto.id/v1/public/github-verify/1.0/json-schema.json\"], \
            \"type\":[\"VerifiableCredential\",\"GithubVerify\"], \
            \"issuer\":{\"id\":\"did:ethr:0x039c4df0450b6790efab89bc6e64375ec5c900a4e0ea5179655a94ae743643fc94\"}, \
            \"issuanceDate\":\"2021-06-08T22:14:22.770Z\", \
            \"credentialSubject\":{\"id\":\"did:ethr:${req.params.address}\", \
                                    \"twitterAccount\":\"${req.params.handle}\", \
                                    \"proof\":\"${req.params.link}\"}, \
            \"credentialSchema\":{\"id\":\"https://staging.api.schemas.serto.id/v1/public/github-verify/1.0/json-schema.json\",\"type\":\"JsonSchemaValidator2018\"}}, \
            \"revocable\":true,\"keepCopy\":true,\"save\":\"true\",\"proofFormat\":\"jwt\"}`
            }

        res.send({sig_address, verified});
    } catch (error) {
        console.log(error)
        res.send({ error: error.reason, verified: false});
    }
})

async function sertoAuth () {
    const config = {
        method: 'post',
        url: 'http://beta.agent.serto.id/v1/auth/login',
        headers: { 
          'Content-Type': 'application/json'
        },
        data : JSON.stringify({"username":process.env.SERTO_USERNAME,"password":process.env.SERTO_PASSWORD}) 
      };

    try {
    const response = await axios(config)
    res.send(response) //response should give us the JWT token, how is this stored? 
    return "token";
    } catch (error) {
    console.error(error);
    return "failed";
    }
}

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`listening on port ${port}...`));