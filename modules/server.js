const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const {
  verifySignature,
  verifyOwner,
  verifyNonce,
} = require("./verificator");

app.use(cors());
app.use(bodyParser.json());

app.get("/api/verify", async (req, res) => {
  try {
    const { nonce } = req.query;
    await verifyNonce(nonce);
    res.send("Success");
  } catch (e) {
    res.send(e.message);
  }
});

app.post("/api/authorize", async (req, res) => {
  try {
    const { address, message, nonce, signature, tokenName } = req.body;
    await verifySignature(message, signature, address);
    await verifyOwner(nonce, tokenName, address);
    res.send("Success");
  } catch (e) {
    res.send(e.message);
  }
});

app.get("/api/healthcheck", async (req, res) => {
  res.send("Safe and Sound!");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
