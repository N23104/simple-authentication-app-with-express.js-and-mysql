const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// MySQL Connection
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    port:3307, // আপনার MySQL password
    database: 'first_app'
});

db.connect((err) => {
    if(err) throw err;
    console.log('MySQL Connected...');
});
app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(sql, [username, email, hashedPassword], (err, result) => {
        if(err) {
            console.log(err);
            return res.send('Error occurred');
        }
        res.redirect('/login');
    });
});
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if(err) throw err;
        if(results.length === 0) return res.send('User not found');

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if(match) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.send('Incorrect password');
        }
    });
});
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if(err) throw err;
        if(results.length === 0) return res.send('User not found');

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if(match) {
            req.session.user = user;
            res.redirect('/dashboard');
        } else {
            res.send('Incorrect password');
        }
    });
});
app.get('/dashboard', (req, res) => {
    if(!req.session.user) return res.redirect('/login');
    res.render('dashboard', { user: req.session.user });
});


app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


app.get('/', (req, res) => {
    res.redirect('/register');  // বা '/login'
});
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
