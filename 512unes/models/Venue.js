const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: String,
    type: String,
    address: String,
    beenThere: { type: Boolean, default: false}
  })
  




module.exports = mongoose.model('venues', placeSchema)