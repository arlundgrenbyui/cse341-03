var PORT = process.env.PORT || 3000;
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')

const errorController = require('./controllers/error');
// const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    User.findById("609c60b915824a59000f9c2a")
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

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

const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://lundgren:LysbSZeSgHnOfLFV@cse341cluster-3dwlw.mongodb.net/shop?retryWrites=true&w=majority";


mongoose
    .connect(
        MONGODB_URL, options
    // 'mongodb+srv://lundgren:LysbSZeSgHnOfLFV@cluster0.7jx5i.mongodb.net/shop?retryWrites=true&w=majority'
    )
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: "lundgren",
                    email: "gladerex@gmail.com",
                    cart: {
                        items: []
                    }
                });
                user.save();  
            }
        });
        app.listen(PORT)
    })
    .catch(err => console.log(err));