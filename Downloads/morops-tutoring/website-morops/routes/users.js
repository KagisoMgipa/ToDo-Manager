// routes/users.js
const express = require('express');
const connectToDB = require('../config/db');

const router = express.Router();

router.post('/', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).send('All fields are required');
  }

  try {
    const db = await connectToDB();
    const usersCollection = db.collection('users');
    const result = await usersCollection.insertOne({ name, email, password });
    res.status(201).send({ message: 'User created', userId: result.insertedId });
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
