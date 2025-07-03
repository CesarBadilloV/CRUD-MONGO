const mongoose = require("mongoose");

const awardSchema = new mongoose.Schema({
  category: String,
  year: Number
}, { _id: false });

const showSchema = new mongoose.Schema({
  name: String,
  seasons: Number,
  streaming: [String],
  running: Boolean,
  awards: {
    emmys: [awardSchema],
    KidsChoiceAwards: [awardSchema],
    goldenGlobes: [awardSchema],
    // puedes agregar otros si quieres ser más completo
  }
});

module.exports = mongoose.model("Show", showSchema);
