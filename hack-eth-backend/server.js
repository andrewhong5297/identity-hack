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

app.get('/twitter/:handle/:message/:address', async (req,res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://twitter.com/${req.params.handle}`, { waitUntil: 'networkidle2' });

    const results = await page.$$eval('article div[lang]', (tweets) => tweets.map((tweet) => tweet.textContent));
    console.log(results);

    let sig = "temp"
    let found = false;
    results.forEach(d => {
        if(d.includes("Tweeting to verify ownership hack-id") && found===false)
        {
            sig = d.split("sig:")[1];
            found=true
        }
    })
    console.log(sig)
    const sig_address = await ethers.utils.verifyMessage(req.params.message, sig);
    console.log(sig_address, req.params.address)

    const verified = sig_address==req.params.address ? true : false 

    //issue VC here
    res.send({sig_address, verified});
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
        // res.send(results)

        let sig = results.code.split("sig:")[1].trim();
        console.log(sig)
        const sig_address = await ethers.utils.verifyMessage(req.params.message, sig);
        console.log(sig_address, req.params.address)

        const verified = sig_address==req.params.address && req.params.handle ==results.username ? true : false 

        //issue VC here
        res.send({sig_address, verified});
    } catch (error) {
        console.log(error)
        res.send({ error: error.reason, verified: false});
    }
})

app.get('/serto-auth', async (req,res) => {
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
        res.send(response)
      } catch (error) {
        console.error(error);
        res.send("error")
      }
})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`listening on port ${port}...`));