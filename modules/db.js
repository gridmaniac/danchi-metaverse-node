const mongoose = require("mongoose");

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

main();

const itemSchema = new mongoose.Schema({
  guid: String,
  tokenName: String,
  type: String,
  position: String,
  rotation: String,
  meta: String
});

module.exports.Item = mongoose.model('Item', itemSchema);