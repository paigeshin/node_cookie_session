# node_cookie_session

```
res.setHeader('Set-Cookie', 'loggedIn=true'); //set cookie
```

- Persisting Data across Requests

# Subjects to study

- What are Cookies?
- What are Sessions?
- Using Session & Cookies?

# 🔷 Cookie

# What's a Cookie?

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fdbcecb8-ba3b-4090-8f76-5b81c0a8e43d/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/fdbcecb8-ba3b-4090-8f76-5b81c0a8e43d/Untitled.png)

User → Frontend (Views) ⇒  Server (Node App)

ℹ️  Set via Response Header, Cookies are stored on the client-side! Store data in the browser of a single user

ℹ️  Request에 어떤 정보든 저장할 수 있다. 

ex) 

```jsx
exports.postLogin = (req, res, next) => {
    //request에 값을 저장
    req.isLoggedIn = true; //하지만 이 request만 사용된다. 모든 global하게 사용하고 싶으면 app.use를 이용해야 한다.
    res.redirect('/');
};
```

### 🔵 Set Cookie

```jsx
exports.postLogin = (req, res, next) => {
    res.setHeader('Set-Cookie', 'loggedIn=true'); //set cookie
    res.redirect('/');
};
```

### 🔵 Get Cookie

```jsx
exports.getLogin = (req, res, next) => {
    const isLoggedIn = req  //get Cookie
        .get('Cookie')
        .split('=')[1]
        .trim() === 'true';
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: isLoggedIn
    });
};
```

ℹ️  `req.get`   을 이용하면 온갖 정보를 가져올 수 있다.

### 🔵 Chrome Inspector에서 Cookie 확인하는 방법

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e54e3dfc-345b-4457-b4fc-66c2d0db0383/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e54e3dfc-345b-4457-b4fc-66c2d0db0383/Untitled.png)

- Application Tab에 들어가서 Storage Menu를 선택한다.

### 🔵 Configuring Cookies

```jsx
exports.postLogin = (req, res, next) => {
    res.setHeader('Set-Cookie', 'loggedIn=true; Max-Age=10; Secure'); //set cookie, Expires, Secure => https일 때만 Cookie를 사용 가능하게 함.
      //Secure or HttpOnly
        res.redirect('/');
};
```

⇒ 더 많은 setting 들을 찾을 수 있다. 모두 key-value 형태이다.

# 🔷 Session

# What's a Session

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/4c36e3b6-f2b4-4e16-b93f-c44963986d90/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/4c36e3b6-f2b4-4e16-b93f-c44963986d90/Untitled.png)

User → Frontend → server(Session)

- Sessions are stored on the server-side!
- Hashed id that only the server can confirm (Encrypted way)
- Session still needs cookie to identify user but it can never be modified from the client side

### 🔵 Implement Session

```bash
npm i --save express-session
```

- app.js

```jsx
const session = require('express-session');
```

```jsx
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false
}));

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
```

`secret` : in production, you should give a long string value to `secret`. Signing the hash.

`resave` : session will not be stored in every response or in every request. This improves the performance. => store the session only when it's modified.
Forces the session to be saved back to the session store, even if the session was never modified during the request.
Depending on your store this may be necessary,
but it can also create race conditions where a client makes two parallel requests to your server and changes made to the session in one request may get overwritten when the other request ends,
even if it made no changes (this behavior also depends on what store you're using).

`saveUninitialized` : No session gets saved for a request that doesn't need to be saved because nothing was changed about it.

### 🔵 Session & Cookie

[https://stackoverflow.com/questions/11142882/what-are-cookies-and-sessions-and-how-do-they-relate-to-each-other#:~:text=Sessions are slightly different.,the user closes the browser](https://stackoverflow.com/questions/11142882/what-are-cookies-and-sessions-and-how-do-they-relate-to-each-other#:~:text=Sessions%20are%20slightly%20different.,the%20user%20closes%20the%20browser).

### 🔵 Express Session Option explained

[https://www.npmjs.com/package/express-session](https://www.npmjs.com/package/express-session)

### 🔵 Using Session

```jsx
exports.postLogin = (req, res, next) => {
    User.findById('5ee593a163258648f41f351b')
        .then(user => {
            req.user = user;
            req.session.isLoggedIn = true;
            req.session.save((err) => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch(err => console.log(err));
};
```

⇒ 하지만 session은 모두 memory에 저장된다. 엄청나게 heavy한 작업이 된다.

⇒ 그렇기 때문에 production mode에서는 session을 db에다가 저장. 

### 🔵 How to store session in MongoDB ❗️

```bash
npm i --save connect-mongodb-session
```

- app.js

```jsx
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

//DB에 session을 저장
const store = new MongoDBStore({
    uri: `mongodb+srv://paigeshin:${password}@cluster0-zwpei.mongodb.net/shop`,
    collection: 'sessions'
});

app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
}));
```

⇒ Session이 expire되면 자동으로 db에서 지워진다.

⇒ 이렇게 설정 해준 다음에 req.session을 사용하면 된다.

- 사진 (mongo DB에 session 값이 저장된 모습)

![https://s3-us-west-2.amazonaws.com/secure.notion-static.com/56a0f392-a510-41e0-8c09-0540b7bf09db/Untitled.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/56a0f392-a510-41e0-8c09-0540b7bf09db/Untitled.png)

### 🔵 Deleting a Cookie

```jsx
exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};
```

⇒ Session은 제거됬지만 cookie 값은 남아 있음. 하지만 이 cookie로는 아무 것도 할 수 없다.

### 🔵 General Middleware

```jsx
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
```

⇒ `app.use` 를 사용하면, 모든 request에 값이 저장된다.

# 🔷 Summary

### Cookies

- Great for storing data on the client(browser)
- Do NOT store sensitive data here! it can be viewed + manipulated
- Cookies can be configured to expire when the browser is closed or when a certain age/ expiry date is reached
- Works well together with Sessions...

### Sessions

- Stored on the server, NOT on the client
- Great for storing sensitive data that should survive across requests
- You can store ANYTHING in sessions
- Often used for storing user data/authentication status
- Identified via Cookie (don't mistake this with the term "Session Cookie")
- You can use different storages for saving your sessions on the server
