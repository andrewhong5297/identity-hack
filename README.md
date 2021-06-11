# Consensys Software Internal Hackathon

## Identity-Hack

This project aims to link an ethereum address with a twitter and/or github account through signature/post verification. It integrates Serto Agent and Metamask Snaps API.
The web2/3 connection flow is common in many dapps, such as https://mirror.xyz/race. On top of adding a layer of sybil protection, it also allows for more complex rewards and airdrop systems. By hosting these connections as verifiable credentials that only the original signer/address can publically share, we allow the user to manage the privacy of their data and also save developers from having to rebuild the same flow over and over again.

---

To test this locally, run in terminal:

```
yarn && yarn react-app:start
```

and in a seperate terminal, run:

```
yarn && yarn backend:start
```

The snaps code is theoretically working (i.e. the api "getCredential" is migrated from the app to the snap), but there are issues with the build as the feature/product is not ready right now and is going through a rework.

---

## Project Sequence Diagram

![alt text](https://github.com/andrewhong5297/identity-hack/blob/master/CSI_hackflow.jpg)
