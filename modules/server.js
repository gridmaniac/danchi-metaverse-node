const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const { verifySignature, verifyOwner, verifyNonce } = require("./verificator");
const { Item } = require("./db");

if (process.env.DEVELOPMENT) app.use(cors());

app.use(bodyParser.json());
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get("/api/verify", async (req, res) => {
  try {
    const { nonce } = req.query;
    await verifyNonce(nonce);
    res.send("Success");
  } catch (e) {
    res.send(e.message);
  }
});

app.post("/api/authorize", jsonParser, async (req, res) => {
  try {
    const { address, message, nonce, signature, tokenName } = req.body;
    await verifySignature(message, signature, address);
    await verifyOwner(nonce, tokenName, address);
    res.send("Success");
  } catch (e) {
    res.send(e.message);
  }
});

app.get("/api/proxy-image", async (req, res) => {
  const { url } = req.query;
  const { data } = await axios.get(url, {
    responseType: "arraybuffer",
  });

  const img = Buffer.from(data, "binary");

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": img.length,
  });
  res.end(img);
});

app.post("/api/save-item", urlencodedParser, async (req, res) => {
  try {
    const item = JSON.parse(Object.keys(req.body)[0]);
    await Item.findOneAndUpdate({ guid: item.guid }, item, { upsert: true })
    res.send("Success");
  } catch(e) {
    console.log(e.message);
    res.send(e.message);
  }
});

app.get("/api/remove-item", async (req, res) => {
  try {
    const { guid } = req.query;
    await Item.findOneAndRemove({ guid });
    res.send("Success");
  } catch(e) {
    console.log(e.message);
    res.send(e.message);
  }
});

app.get("/api/load-items", async (req, res) => {
  try {
    const { tokenName } = req.query;
    const items = await Item.find({ tokenName })
    res.send(JSON.stringify(items));
  } catch(e) {
    console.log(e.message);
    res.send(e.message);
  }
});

app.get("/api/healthcheck", async (req, res) => {
  res.send("Safe and Sound!");
});

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${process.env.PORT}`);
});
