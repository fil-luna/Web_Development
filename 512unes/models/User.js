const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: [true, "Fname is a required field"],
  },
  lname: {
    type: String,
    required: [true, "Lname is a required field"],
  },
  username: {
    type: String,
    required: [true, "Email is a required field"],
  },
  over18: {
    type: String,
    required: [true, "Over 18 is a required field"],
  },
  gender: {
    type: String,
    required: [true, "gender is a required field"],
  }
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("users", UserSchema);
