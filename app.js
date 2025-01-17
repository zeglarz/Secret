//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_IP}`, {useNewUrlParser: true});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema)

app.listen(3000, () => {
console.log('Server started on port 3000');
});

app.get('/',(req,res) => {
res.render('home');
});

app.get('/login',(req,res) => {
res.render('login');
});

app.get('/register',(req,res) => {
res.render('register');
});

app.post('/register', (req, res) => {
  const newUser = new User(
    {
      email: req.body.username,
      password: req.body.password
    });
    newUser.save(err => {
      if (err) {
        console.log(err)
      } else {
        res.render('secrets');
      }
    });
});

app.post('/login', (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, (err, foundUser) => {
    if (err) {
      console.log(err)
    } else {
      if (foundUser) {
      if (foundUser.password === password) {
        res.render('secrets')
      } else {
        res.send('You typed a wrong password');
      }
    } else {
      res.send('Such user does not exist! Check if your email is correct or register if you had not!')
    }
  }
});
});
