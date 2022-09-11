const express = require("express");
const uuid = require("uuid").v4;

const app = express();

app.use(express.json());

const session = {};
//store the session in the global object
//but in production app we use the redis server for the centralized state
//centralized state which maintains between the many server

app.post("/login", (req, res) => {
	const { username, password } = req.body;

	//check from the database that the username or password is correct or not
	//if correct then create the session and set the cookie in the browser also with the session id
	//if wrong return with the error message
	if (username != "admin" || password != "admin") {
		return res.status(401).send("invalid credentials");
	}
	const sessionId = uuidv4();
	//generate the random session id
	session[sessionId] = { username, userId: 1 };
	//you will get the userId from the database where you have store the user details
	res.set("Set-cookie", `session=${sessionId}`);
	//save this as a cookie to the browser
	res.send("successfully logged in ");
});

//this is a protected route which need the authentication from the user
//so we check the authentication from the browser cookie and server session if they match so the user is authorized for this fetch result
app.get("/todos", (req, res) => {
	const sessionId = req.headers.cookie?.split("=")[1];
	//get the sessionId from the cookie
	const userSession = session[sessionId];
	//and match the particular sessionId is valid is or not from the server session store
	if (!userSession) {
		return res.status(401).send("Invalid Session");
	}
	const userId = userSession.userId;
	res.send({
		id: 2,
		title: "Basic Autorization with the express",
		userId,
	});
});

//destroy the user session from the server and from the client side too
app.post("/logout", (req, res) => {
	//get the session id from the browser-cookie
	const sessionId = req.headers.cookie?.split("=")[1];
	delete session[sessionId];
	//delete the sessionId from the server

	res.set("Set-cookie", `session=;Expires=Thu 01 Jan 1970`);
	//gives the absurd date while setting the cookie so it will delete the cookie from the browser which have particular key as "session"
	res.send("successfully logout");
});
