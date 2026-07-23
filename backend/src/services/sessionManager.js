const { v4: uuidv4 } = require('uuid');
const Session = require('../models/session');

// In-memory fallback
const memorySessions = new Map();

// Helper to get from either Memory or Mongo
const getSession = async (sessionId) => {
  let session = memorySessions.get(sessionId);
  if (!session) {
    try {
      session = await Session.findById(sessionId);
    } catch (e) {
      console.error('Error fetching session from DB:', e);
    }
  }
  return session;
};

const createSession = async (userId) => {
  const sessionData = {
    _id: uuidv4(), // use custom ID for memory mapping or let mongo assign
    userId,
    status: 'active',
    symptomsCollected: [],
    questionsAsked: [],
    answersGiven: {},
    currentStage: 'symptom_collection',
    startedAt: new Date(),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000)
  };
  
  memorySessions.set(sessionData._id, sessionData);
  
  try {
    // Optionally save to DB right away
    const dbSession = new Session(sessionData);
    await dbSession.save();
    return dbSession;
  } catch (e) {
    console.error('Error creating session in DB:', e);
    return sessionData; // return memory version
  }
};

const updateSession = async (sessionId, updates) => {
  let session = await getSession(sessionId);
  if (session) {
    Object.assign(session, updates);
    memorySessions.set(sessionId, session);
    
    try {
      if (session.save) {
        await session.save();
      } else {
         await Session.findByIdAndUpdate(sessionId, updates);
      }
    } catch (e) {
      console.error('Error updating session in DB:', e);
    }
  }
  return session;
};

const addSymptom = async (sessionId, symptom) => {
  let session = await getSession(sessionId);
  if (session && !session.symptomsCollected.includes(symptom)) {
    session.symptomsCollected.push(symptom);
    await updateSession(sessionId, { symptomsCollected: session.symptomsCollected });
  }
  return session;
};

const addQuestion = async (sessionId, question) => {
  let session = await getSession(sessionId);
  if (session && !session.questionsAsked.includes(question)) {
    session.questionsAsked.push(question);
    await updateSession(sessionId, { questionsAsked: session.questionsAsked });
  }
  return session;
};

const endSession = async (sessionId) => {
  await updateSession(sessionId, { status: 'completed' });
  memorySessions.delete(sessionId);
};

module.exports = {
  createSession,
  getSession,
  updateSession,
  addSymptom,
  addQuestion,
  endSession
};
