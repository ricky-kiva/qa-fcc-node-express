'use strict';
require('dotenv').config();
const express = require('express');
const myDB = require('./connection');
const session = require('express-session');
const passport = require('passport')
const fccTesting = require('./freeCodeCamp/fcctesting.js');
const { ObjectID } = require('mongodb')

const app = express();

fccTesting(app); //For FCC testing purposes
app.set('view engine', 'pug'); // set pug as view engine
app.set('views', './views/pug') // set the views location of pug
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
})) // using express-session
app.use(passport.initialize()); // use passport
app.use(passport.session());

myDB(async client => {
  const myDataBase = await client.db('database').collection('users'); // connecting to database after connected to cluster via './connection' (myDB)

  // Change HTML after database is connected
  app.route('/').get((req, res) => {
    // Change the response to render the Pug template
    res.render('index', {
      title: 'Connected to Database',
      message: 'Please login'
    });
  });

  // Serialization and deserialization
  passport.serializeUser((user, done) => {
    done(null, user._id);
  })

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({_id: new ObjectID(id)}, (err, doc) => {
      done(null, doc); // looking for one new generated class of ObjectID
    })
  })
})
  .catch(e => {
  app.route('/').get((req, res) => {
    res.render('index', { title: e, message: 'Unable to connect to database' });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT);
});
