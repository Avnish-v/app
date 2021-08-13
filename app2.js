const express = require('express');
const { RSA_NO_PADDING } = require('constants');
const app = express();
const port = 80;
const path = require('path')
const bcrypt = require("bcryptjs");
//mongo------>
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("we are connected")
    // we're connected!
});

//define sechma
var registerschema = new mongoose.Schema({
    first: String,
    last: String,
    phone: String,
    email: String,
    password: String,
    repass: String
});
// hashing
registerschema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log(`the current pass is ${this.password}`);
        this.password = await bcrypt.hash(this.password, 10);
        console.log(`${this.password}`)
        this.repass = undefined;
        this.repass = undefined;
    }
    next();
})
var register = mongoose.model('register', registerschema);
//this is use to ge data from the website--------
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// //static file as public -----
app.use('/public', express.static('public'));
// defining the view engine as the pug
// app.engine('pug',require('pug').__express)
// //defines the path of views 
// //endpoints ------------engine------------      
app.engine('pug', require('pug').__express) // imp to define  the engine to the express 
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));
app.get('/', (req, res) => {
    res.render('registration')
});
app.get('/services', (req, res) => {
    res.status(200).render('services')
});
app.get('/login', (req, res) => {
    res.status(200).render('login')
});
app.post('/login', async (req, res) => {
    try {
        const em = req.body.email;
        const password = req.body.password;
        const valid = await register.findOne({ email: em });
        const ismatch = bcrypt.compare(password, valid.password);

        if (ismatch) {

            res.render("home");
        } else {
            res.send("invalid passsword")
        }

    } catch (error) {
        res.status(400).send("invalid acount.....")
    }

});
app.get('/about', (req, res) => {
    res.status(200).render('about')
});
app.get('/registration', (req, res) => {
    res.render('registration')
});
app.post('/registration', async (req, res) => { //asy
    try {

        const me = req.body.email;
        const pass = req.body.password
        const repass = req.body.repass;

        const val = await register.findOne({ email: me });

        if (repass === pass) {

            var mydata = new register(req.body);
            mydata.save().then(() => {
                res.render("alert")
            });

        } else {

            res.status(201).send("please try again password not match...");

        }

    } catch (error) {
        res.send("something ..")
    }
});
//server is here ---------
app.listen(port, () => {
    console.log(`listen in the port -:http//localhost${port}`)
});
