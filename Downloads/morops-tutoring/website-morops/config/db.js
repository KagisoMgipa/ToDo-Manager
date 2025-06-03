// config/db.js
const { MongoClient } = require('mongodb');
const { mongoURI } = require('./config');

let db = null;

async function connectToDB() {
  if (db) return db;
  try {
    const client = await MongoClient.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    db = client.db();
    console.log('MongoDB connected');
    return db;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = connectToDB;
