const puppeteer = require('puppeteer');
const express = require('express');
const ethers = require('ethers');

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

app.get('/github/:handle/:message/:address/:link', async (req,res) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://gist.github.com/${req.params.handle}/${req.params.link}`, { waitUntil: 'networkidle2' });

    // const username = await page.$$eval(' ')
    //[highlight tab-size js-file-line-container]
    const results = await page.$$eval('#file-hack-id-js > div.Box-body.p-0.blob-wrapper.data.type-javascript.gist-border-0 > table', (results) => results.textContent);
    console.log(results);

    // let sig = "temp"
    // let found = false;
    // results.forEach(d => {
    //     if(d.includes("Tweeting to verify ownership hack-id") && found===false)
    //     {
    //         sig = d.split("sig:")[1];
    //         found=true
    //     }
    // })
    // console.log(sig)
    // const sig_address = await ethers.utils.verifyMessage(req.params.message, sig);
    // console.log(sig_address, req.params.address)

    // const verified = sig_address==req.params.address ? true : false 

    // //issue VC here
    // res.send({sig_address, verified});
})

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`listening on port ${port}...`));