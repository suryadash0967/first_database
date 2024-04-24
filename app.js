const mysql = require('mysql2');
const { faker } = require('@faker-js/faker');
const express = require('express')
const app = express();
const path = require("path");
const ejs = require('ejs');
const { v4: uuidv4 } = require('uuid');

const bodyParser = require("body-parser");
app.use(express.urlencoded({ extended: true }));

const methodOverride = require('method-override')
app.use(methodOverride('_method'));

app.set("view engine", ejs);
app.set("views", path.join(__dirname, "/views"))


const port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})


const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    database: 'users',
    password: 'Dashsurya@0967'
});

const createRandomUser = () => {
    return [
        userId = faker.string.uuid(),
        username = faker.internet.userName(),
        email = faker.internet.email(),
        password = faker.internet.password(),
    ];
}


// let data = [];

// for(let i = 1; i <= 100; i++){
//     data.push(createRandomUser());
// }

let q1 = "INSERT INTO user (userId, username, email, password) VALUES ?"
let q3 = "SELECT * FROM user"


function insertData(info) {
    connection.query(
        q1,
        [info],
        function (err, result) {
            if (err) console.log(err);
            console.log(result)
        }
    );


    connection.end();
}



function displayName() {
    connection.query(
        q3,
        function (err, result) {
            if (err) console.log(err);
            result.forEach((res) => {
                console.log(res.name)
            })
        }
    );

    connection.end();
}


// displayName();


// GET / -> TO SHOW TOTAL COUNT OF USERS
app.get('/', function (req, res) {
    let q = `SELECT COUNT(*) FROM user`;
    connection.query(
        q,
        function (err, result) {
            if (err) console.log(err);
            // result PRINTS: [{"COUNT(*)":100}],     result[0] PRINTS: {"COUNT(*)":100},     result[0]."COUNT(*)" OR result[0]["COUNT(*)"] PRINTS: 100
            let count = result[0]["COUNT(*)"];
            res.render("home.ejs", { count })
        }
    )
})

function renderUserPage(res) {
    let q = `SELECT * FROM user;`
    connection.query(q, function (err, result) {
        if (err) {
            console.error("Error retrieving user data:", err);
            return res.status(500).send('Internal Server Error');
        }
        res.render("allUsers.ejs", { result });
    });
}

app.get("/user", (req, res) => {
    renderUserPage(res);
})

let noPass = true;

app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE userId='${id}';`
    connection.query(
        q,
        function (err, result) {
            if (err) console.log(err);
            let user = result[0];
            noPass = false;
            res.render("editDets.ejs", { user, noPass })
        }
    )

})


//UPDATE ROUTE - PATCH
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formPass, username: newUsername, email: newEmail } = req.body;
    let q = `SELECT * FROM user WHERE userId='${id}';`
    connection.query(
        q,
        function (err, result) {
            if (err) console.log(err);
            let user = result[0];
            if (formPass != user.password) {
                noPass = true;
                res.render("editDets.ejs", { user, noPass });
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE userId='${id}'`;
                let q3 = `UPDATE user SET email='${newEmail}' WHERE userId='${id}'`;

                // FOR USERNAME: CONNECTION.QUERY() NESTING.
                connection.query(
                    q2,
                    function (err, result2) {
                        if (err) console.log(err);
                        console.log(result2)
                        noPass = false;
                        connection.query(
                            `SELECT * FROM user WHERE userId='${id}'`,
                            function () {
                            }
                        )

                    }
                )
                connection.query(
                    q3,
                    function (err, result) {
                        if (err) console.log(err);
                        console.log(result)
                        noPass = false;
                        res.redirect("/user")
                    }
                )
            }
        }
    )
})

