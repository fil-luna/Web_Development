require('dotenv').config()
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const postRoutes = require('./routes/posts');
const { DB, URI } = process.env;

let connectionObject = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    authSource: "admin",
    user: "acc",
    pass: "acc_rocks_2020",
  };

let url = `${URI}/${DB}`
mongoose
  .connect(url, connectionObject)
  .then(() => console.log(`Connected to the ${DB} database`))
  .catch((err) =>
    console.log(`Issues connecting to the ${DB} database ${err}`)
  );

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use('/posts', postRoutes)

app.get('/', (req, res) => {
   res.redirect('/posts') 
})

const port = process.env.PORT || 3000
app.listen(port, () => {console.log(`message board app listening on port ${port}`)})
