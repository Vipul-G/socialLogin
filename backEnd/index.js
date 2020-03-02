const mongoose = require('mongoose');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const {auth} = require('./routes/user');
const keys = require('./config/keys');
const passport = require('passport');


app.use(session({
    cookie: {maxAge: 24*60*60*1000},
    secret: keys.session.cookieKey,
    resave: false,
    saveUninitialized: false
}));

app.use(cors());

mongoose.connect('mongodb+srv://Hny:2S3H9yUCgYUlaJFT@cluster0-bvc4k.mongodb.net/fluperTask?retryWrites=true', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{
    console.log('Connected to Database');
    require('./config/passport.setup')
  })
.catch((reason)=>{
    console.error('Connection failed', '\n');
    console.log(reason);
});

//app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());



app.use('/auth', auth);



app.listen(3000, () => {
    console.log('Listening at 3000');
})


