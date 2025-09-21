var jwt = require('jsonwebtoken');
const jwtPassword = 'secret';
const express = require('express');
const path = require('path');
const zod = require('zod');
/**
 * Generates a JWT for a given username and password.
 *
 * @param {string} username - The username to be included in the JWT payload.
 *                            Must be a valid email address.
 * @param {string} password - The password to be included in the JWT payload.
 *                            Should meet the defined length requirement (e.g., 6 characters).
 * @returns {string|null} A JWT string if the username and password are valid.
 *                        Returns null if the username is not a valid email or
 *                        the password does not meet the length requirement.
 */

/**
 * Verifies a JWT using a secret key.
 *
 * @param {string} token - The JWT string to verify.
 * @returns {boolean} Returns true if the token is valid and verified using the secret key.
 *                    Returns false if the token is invalid, expired, or not verified
 *                    using the secret key.
 */

/**
 * Decodes a JWT to reveal its payload without verifying its authenticity.
 *
 * @param {string} token - The JWT string to decode.
 * @returns {object|false} The decoded payload of the JWT if the token is a valid JWT format.
 *                         Returns false if the token is not a valid JWT format.
 */

const port = 3000
const app = express();
app.use(express.json());


let users = []   // username, password, token

// Zod schema for validation
const userSchema = zod.object({
  username: zod.string().email(),
  password: zod.string().min(6)
});

function decodeJwt(token) {
  try {
    const decoded = jwt.decode(token);
    return !!decoded;
  } catch (err) {
    return false;
  }
}

function verifyJwt(token) {
  try {
    const decoded = jwt.verify(token, jwtPassword);
    return !!decoded;
  } catch (err) {
    return false;
  }
}


function signJwt(username, password) {
  const {success} = userSchema.safeParse({username, password});
  if(!success) return null;
  return jwt.sign({username}, password);
}

// Can you try creating a middleware called auth that verifies 
// if a user is logged in and ends the request early if the user isn’t logged in?

function authMiddleWare(req, res, next) {
  try {
    const token = req.headers?.token
    if (token) {
      jwt.verify(token, password, (err, decoded) => {
        if(err) {
          return res.status(401).send({ message: 'Invalid or expired token' });
        } else {
          req.user = decoded;
          next();
        }
      })
    } else {
      return res.status(401).send({ message: 'Token missing' });
    }
  } catch(err) {
    console.log("Error", err);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
}

function signinHandler(req, res) {
  const {username, password} = req.body;
  const user = users.find(user => user.username === username && user.password === password)
  if(user) {
    const token = signJwt(username, password);
    user.token = token
    return res.status(200).send({token: token})
  }else {
    return res.status(404).send({message: 'Password or username is invalid'})
  }
}

function signupHandler(req, res) {
  const {username, password} = req.body;
  if(users.find(user => user.username === username && user.password === password)) {
    return res.status(400).send("User already exists")
  } else {
    if(z.string().min(6).safeParse(password).success === false) {
      return res.status(400).send({message: 'Password should be at least 6 characters'})
    }
    users.push({username, password})
    return res.status(200).send({message: 'Successfully signed up'})
  }
}


app.post('/signin', signinHandler)

app.post('/signup', signupHandler)
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'));
});

app.use(authMiddleWare);

app.get('/user', (req, res) => {
  const user = req.user;
  return res.status(200).send(user)
})

app.get('/todo', (req, res) => {
  res.status(200).send({ message: 'GET /todo route' });
});

app.post('/todo', (req, res) => {
  res.status(201).send({ message: 'POST /todo route' });
});

app.patch('/todo', (req, res) => {
  res.status(200).send({ message: 'PATCH /todo route' });
});

app.delete('/todo', (req, res) => {
  res.status(200).send({ message: 'DELETE /todo route' });
});

//  Write a function that takes in a username and password and returns a JWT token with the username encoded. 
//  Should return null if the username is not a valid email or if the password is less than 6 characters.
//  Try using the zod library here
//  Write a function that takes a jwt as input and returns true if the jwt can be DECODED (not verified). Return false otherwise
//  Write a function that takes a jwt as input and returns true if the jwt can be VERIFIED. Return false otherewise
//  To test, go to the 02-jwt folder and run `npx jest ./tests`

app.listen(port,  () => console.log(`App listen is ${port}`))

module.exports = {
  signJwt,
  verifyJwt,
  decodeJwt,
  jwtPassword,
};
