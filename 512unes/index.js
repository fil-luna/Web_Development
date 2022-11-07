require("dotenv").config();
const { API_KEY, client_id, client_secret } = process.env;

const express = require("express");
// needed for PUT method
const methodOverride = require("method-override");
const app = express();
// const logger = require("morgan");
// app.use(logger("dev"));

const NB = require("nodebrainz");

// Initialize NodeBrainz
const nb = new NB({ userAgent: "512unes/0.0.1 ( lindsey@arroyoaudio.com )" });

// getting DB and URI from process.env by destructuring
const { DB, URI } = process.env;
const passport = require("passport"); //Brings in passport
const LocalStrategy = require("passport-local"); // Establishes the strategy for authenticating users
const { isLoggedIn } = require("./helpers/auth");
const request = require("request");
const mongoose = require("mongoose");

//var stateKey = "spotify_auth_state";

app.use(express.static(__dirname + "/public")).use(methodOverride("_method"));
app.set("view engine", "ejs");

// Avoid coding repetitive .ejs extensions
app.set("view engine", "ejs");

//Read the public folder
app.use(express.static("public"));

app.use(express.static("assets"));

// Body parser used to be on its own
// but now part of express module
// This is the body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connection
const url = `${URI}/${DB}`;

//Connection options
let connectionObject = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: "admin",
  user: "acc",
  pass: "acc_rocks_2020",
};

const UserModel = require("./models/User");
const venueModel = require("./models/Venue");

// Connecting to the DB
mongoose
  .connect(url, connectionObject)
  .then(() => console.log(`Connected to the ${DB} database`))
  .catch((err) =>
    console.log(`Issues connecting to the ${DB} database ${err}`)
  );

app.use(
  require("express-session")({
    secret: "Blah blah blah", // used to encrypt the user info before saving to db
    resave: false, // save the session obj even if not changed
    saveUninitialized: false, // save the session obj even if not initialized
  })
);

// Initialize passport, alters the req object to reflect the signed in user, authenticates user
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(UserModel.authenticate()));
passport.serializeUser(UserModel.serializeUser());
passport.deserializeUser(UserModel.deserializeUser());

// Root Route
app.get("/", (req, res) => {
  res.redirect("/landing_page");
});

app.get("/landing_page", (req, res) => {
  res.render("landing_page");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", (req, res) => {
  // pulling form values from req.body by destructuring
  // const { fname, lname, username, password, over18, gender } = req.body;
  // let newUser = new UserModel({
  //   fname: fname,
  //   lname: lname,
  //   username: username,
  //   over18: over18,
  //   gender: gender
  // });
  let registryData = {};
  for (key in req.body) {
    registryData[key] = req.body[key];
  }
  // console.log(registryData);
  // let errors = [];
  // if (registryData.password !== registryData.password2) {
  //   errors.push({ msg: "Passwords do not match" });
  // }
  // if (registryData.password.length < 6) {
  //   errors.push({ msg: "Password must be at least 6 characters" });
  // }
  // if (errors.length > 0) {
  //   res.render("signup", { errors, registryData });
  // }
  // UserModel.findOne({ email: registryData.email })
  //   //return promise
  //   .then((user) => {
  //     if (user) {
  //       //user exists
  //       errors.push({ msg: "Email is already registered" });
  //       res.render("registration", {
  //         errors,
  //         registryData,
  //       });
  //     } else {
  const newUser = new UserModel(registryData);
  //registers new user in DB
  UserModel.register(newUser, registryData.password, (err, user) => {
    if (err) {
      console.log(err);
      res.redirect("/landing_page", { err: err });
    } else {
      //uses passport local strategy to authenticate user
      UserModel.authenticate("local")(req, res, function () {
        res.redirect("/landing_page");
      });
    }
  });
});

app.get("/home", isLoggedIn, (req, res) => {
  res.render("home", { user: req.user });
});

app.get("/about", isLoggedIn, (req, res) => {
  res.render("about", { user: req.user });
});
app.get("/about_guest", (req, res) => {
  res.render("about_guest");
});

app.get("/contact", isLoggedIn, (req, res) => {
  res.render("contact", { user: req.user });
});

app.get("/contact_guest", (req, res) => {
  res.render("contact_guest");
});

app.get("/login", (req, res) => {
  res.render("landing_page");
});

app.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/landing_page",
  }),
  function (req, res) {
    res.redirect("/home");
  }
);

app.get("/test", (req, res) => {
  res.render("test");
});

// Search for events by city using ticket master
app.get("/events", isLoggedIn, (req, res) => {
  //Using req.query to get events
  const { city } = req.query;

  //building route to search for events in the city user entered according to Ticketmaster documentation
  let baseUrl = "https://app.ticketmaster.com/discovery/v2";
  let route = `events.json?classificationName=music&city=${city}&apikey=${API_KEY}`;
  let endpoint = `${baseUrl}/${route}`;
  //calling the API
  request(endpoint, (error, response, body) => {
    if (!error) {
      //parsing the body
      let data = JSON.parse(body);
      let results = data._embedded?.events;
      res.render("events", { data: results, user: req.user });
    } else {
      console.log("It failed");
      console.log(error);
    }
  });
});

//creating events Schema to save for mongodb
let eventsSchema = new mongoose.Schema({
  event: String,
  image: String,
  date: String,
  url: String,
});

let EventModel = new mongoose.model("favorite", eventsSchema);

//route to add favorites
app.post("/addFavorite", isLoggedIn, (req, res) => {
  let fave = JSON.parse(req.body.faveEvent);
  let newFave = new EventModel(fave);
  //saving the favorited event
  newFave.save((error, result) => {
    if (error) {
      console.log("There was an error adding event to favorites.");
    } else {
      console.log("Successfully added", result);
    }
  });
  res.redirect("/events");
});

//reading the favorited events
app.get("/favorites", isLoggedIn, (req, res) => {
  EventModel.find((error, result) => {
    if (error) {
      console.log("error finding data in collection", error);
    } else {
      res.render("favorites", { data: result, user: req.user });
    }
  });
});

//deleting the favorited events, because there is such a thing as too much Harry Styles
app.get("/favorites/:id", isLoggedIn, (req, res) => {
  let requestedEvent = req.params.id;
  EventModel.findByIdAndDelete(requestedEvent, (error, result) => {
    if (error) {
      console.log("Ooops something went wrong deleting from database", error);
    } else {
      console.log("This event has been deleted", result);
      res.redirect("/favorites");
    }
  });
});

//needed to call musicbrainz API using nodebrainz
const mbApi = {
  appName: "512unes",
  appVersion: "0.1.0",
  appContactInfo: "lindsey@arroyoaudio.org",
};

//reading musical artists searched by where they live
app.get("/artists", isLoggedIn, (req, res) => {
  //search whatever city user inputs
  const { city } = req.query;
  nb.search("artist", { area: city }, function (err, response) {
    console.log(response, response.artist);
    res.render("artists", { data: response, user: req.user });
  });
});

//schema for saving musical artist to db
let artistSchema = new mongoose.Schema({
  artist: String,
  type: String,
});

let ArtistModel = new mongoose.model("interests", artistSchema);

// Post route for adding artists to favorites
app.post("/addFaveArtist", isLoggedIn, (req, res) => {
  let fave = JSON.parse(req.body.faveArtist);
  let newArtist = new ArtistModel(fave);
  newArtist.save((error, result) => {
    if (error) {
      console.log("There was an error adding event to favorites.");
    } else {
      console.log("Successfully added", result);
    }
  });
  res.redirect("/artists");
});

// Get route for displaying favorite artists
app.get("/faveArtist", isLoggedIn, (req, res) => {
  ArtistModel.find((error, result) => {
    if (error) {
      console.log("error finding data in collection", error);
    } else {
      res.render("favorite_bands", { data: result, user: req.user });
    }
  });
});

// Delete route for removing favorite artists
app.get("/faveArtist/:id", isLoggedIn, (req, res) => {
  let requestedArtist = req.params.id;
  console.log(requestedArtist);
  ArtistModel.findByIdAndDelete(requestedArtist, (error, result) => {
    if (error) {
      console.log("Could not delete from database", error);
    } else {
      console.log("This artist has been deleted", result);
      res.redirect("/faveArtist");
    }
  });
});

//read route for searched venues and studios
app.get("/venues", isLoggedIn, (req, res) => {
  //grabs the value for the input
  //searches for venues and studios from the location user inputs
  const { city } = req.query;
  nb.search("place", { area: city }, function (err, response) {
    console.log(response);
    res.render("venues", { data: response, user: req.user });
  });
});

// Post route for adding venues to favorites
app.post("/addFavePlace", isLoggedIn, (req, res) => {
  let fave = JSON.parse(req.body.favePlace);
  let newVenue = new venueModel(fave);
  newVenue.save(fave, (error, result) => {
    if (error) {
      console.log("There was an error adding venue to favorites.");
    } else {
      console.log("Successfully added", result);
    }
  });
  res.redirect("/venues");
});

//route to display those favorite venues
app.get("/faveVenues", isLoggedIn, (req, res) => {
  venueModel.find((error, result) => {
    if (error) {
      console.log("error finding data in collection", error);
    } else {
      res.render("favorite_venues", { data: result, user: req.user });
    }
  });
});

//Update route to change beenThere property to true
app.put("/updatefaveVenues/:id/", async (req, res) => {
  //grabs the object id
  let requestedPlace = req.params.id;
  //updates the beenThere property of the element to true
  venueModel.findByIdAndUpdate(
    { _id: requestedPlace },
    { beenThere: true },
    function (err, result) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/favorites");
      }
    }
  );
});

//Delete route for favorited venues
app.get("/faveVenues/:id", isLoggedIn, (req, res) => {
  let requestedPlace = req.params.id;
  console.log(requestedPlace);
  venueModel.findByIdAndDelete(requestedPlace, (error, result) => {
    if (error) {
      console.log("Could not delete from database", error);
    } else {
      console.log("This place has been deleted", result);
      res.redirect("/faveVenues");
    }
  });
});
// Added for edits Phillip
//edits user profile
app.get("/edit", isLoggedIn, function (req, res) {
  UserModel.findById(req.user._id, (err, user) => {
    if (err) {
      console.log("Issue updating profile: ", err);
      res.redirect("/home");
    } else {
      res.render("edit", { user });
    }
  });
});

//put route for updating profile
app.post("/edit", isLoggedIn, (req, res) => {
  UserModel.findByIdAndUpdate(
    req.query.id,
    {
      fname: req.body.fname,
      lname: req.body.lname,
      username: req.body.username,
      over18: req.body.over18,
      gender: req.body.gender,
    },
    (error) => {
      if (error) {
        console.log("Issue saving updated profile to db: ", error);
      } else {
        res.redirect("/home");
      }
    }
  );
});
// end of edits Phillip

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
  });
  res.redirect("/landing_page");
});

app.get("/*", (req, res) => {
  res.render("error");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`512unes App listening on port ${port}`));
