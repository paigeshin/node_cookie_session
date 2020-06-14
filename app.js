const password = "Y2wdkB4znFPPyx3o";
const url = `mongodb+srv://paigeshin:${password}@cluster0-zwpei.mongodb.net/shop?retryWrites=true&w=majority`;

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

//DB에 session을 저장
const store = new MongoDBStore({
    uri: `mongodb+srv://paigeshin:${password}@cluster0-zwpei.mongodb.net/shop`,
    collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

//General Middleware `app.use`
app.use((req, res, next) => {
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => console.log(err));
});

/*
Options

secret: in production, you should give a long string value to `secret`. Signing the hash.

resave: session will not be stored in every response or in every request. This improves the performance. => store the session only when it's modified.
Forces the session to be saved back to the session store, even if the session was never modified during the request.
Depending on your store this may be necessary,
but it can also create race conditions where a client makes two parallel requests to your server and changes made to the session in one request may get overwritten when the other request ends,
even if it made no changes (this behavior also depends on what store you're using).

saveUninitialized: No session gets saved for a request that doesn't need to be saved because nothing was changed about it.

*/

// app.use((req, res, next) => {
//
//     User.findById('5bab316ce0a7c75f783cb8a8')
//         .then(user => {
//             req.user = user;
//             next();
//         })
//         .catch(err => console.log(err));
// });

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);


mongoose
    .connect(
        url
    )
    .then(result => {
        User.findOne().then(user => {
            if (!user) {
                const user = new User({
                    name: 'Paige',
                    email: 'paige@test.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            }
        });
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    });
