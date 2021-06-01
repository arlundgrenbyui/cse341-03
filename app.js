var PORT = process.env.PORT || 3000;
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors') // Place this with other requires (like 'path' and 'express')
const csrf = require('csurf');
const flash = require('connect-flash')

const errorController = require('./controllers/error');
const User = require('./models/user');

// const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://lundgren:LysbSZeSgHnOfLFV@cluster0.7jx5i.mongodb.net/shop';
const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://lundgren:LysbSZeSgHnOfLFV@cse341cluster-3dwlw.mongodb.net/shop"; // FOR HEROKU

const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
});
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'a secret that will make the session secret', 
        resave: false, 
        saveUninitialized: false, 
        store: store})
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedin;
    res.locals.csrfToken = req.csrfToken();
    next();
});

app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            if (!user) {
                return next();
            }
            req.user = user;
            next();
        })
        .catch(err => {
            next(new Error(err));
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
    res.redirect('/500');
});


const corsOptions = {
    origin: "https://cse-341-prove-03-lundgren.herokuapp.com/",
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    family: 4
};

// UNCOMMENT WHEN PUSHING TO HEROKU
// const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://lundgren:LysbSZeSgHnOfLFV@cse341cluster-3dwlw.mongodb.net/shop?retryWrites=true&w=majority";

// COMMENT OUT WHEN PUSHING TO HERKOU
// const MONGODB_URL = process.env.MONGODB_URL || 'mongodb+srv://lundgren:LysbSZeSgHnOfLFV@cluster0.7jx5i.mongodb.net/shop?retryWrites=true&w=majority';
mongoose
    .connect(
        MONGODB_URL, options
    // 'mongodb+srv://lundgren:LysbSZeSgHnOfLFV@cluster0.7jx5i.mongodb.net/shop?retryWrites=true&w=majority'
    )
    .then(result => {
        // User.findOne().then(user => {
        //     if (!user) {
        //         const user = new User({
        //             name: "lundgren",
        //             email: "gladerex@gmail.com",
        //             cart: {
        //                 items: []
        //             }
        //         });
        //         user.save();  
        //     }
        // });
        app.listen(PORT)
    })
    .catch(err => console.log(err));