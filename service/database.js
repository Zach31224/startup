const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);
const db = client.db('pythings');
const userCollection = db.collection('user');
const scoreCollection = db.collection('score');
const communityChallengeCollection = db.collection('communityChallenge');

// This will asynchronously test the connection and exit the process if it fails
(async function testConnection() {
  try {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('Connected to database');
  } catch (ex) {
    console.log(`Unable to connect to database with ${url} because ${ex.message}`);
    process.exit(1);
  }
})();

function getUser(email) {
  return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
  return userCollection.findOne({ token: token });
}

async function addUser(user) {
  await userCollection.insertOne(user);
}

async function updateUser(user) {
  await userCollection.updateOne({ email: user.email }, { $set: user });
}

async function addScore(score) {
  return scoreCollection.insertOne(score);
}

function getHighScores() {
  const options = {
    sort: { score: -1 },
    limit: 10,
  };
  const cursor = scoreCollection.find({}, options);
  return cursor.toArray();
}

async function addCommunityChallenge(challenge) {
  return communityChallengeCollection.insertOne(challenge);
}

function getCommunityChallenges() {
  const options = {
    sort: { createdAt: -1 },
  };
  const cursor = communityChallengeCollection.find({}, options);
  return cursor.toArray();
}

function getCommunityChallengeById(id) {
  const { ObjectId } = require('mongodb');
  return communityChallengeCollection.findOne({ _id: new ObjectId(id) });
}

async function clearAllScores() {
  return scoreCollection.deleteMany({});
}

module.exports = {
  getUser,
  getUserByToken,
  addUser,
  updateUser,
  addScore,
  getHighScores,
  addCommunityChallenge,
  getCommunityChallenges,
  getCommunityChallengeById,
  clearAllScores,
};
