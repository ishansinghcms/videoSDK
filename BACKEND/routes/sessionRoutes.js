import express from 'express';
import Session from '../models/session.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Start a session
router.post('/start', async (req, res) => {
  // Generate unique ID for session
  const meetingId = uuidv4();
  try {
    const session = new Session({
      meetingId,
      start: new Date(),
    });
    await session.save();
    return res.status(201).json(session);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Add a participant
router.post('/:meetingId/participants', async (req, res) => {
  const { meetingId } = req.params;
  const { name } = req.body;
  let { participantId } = req.body;
  try {
    // Check if session with given meetingId exists
    const session = await Session.findOne({ meetingId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    if (participantId) {
      // If participantId exists, find the participant
      const existingParticipant = session.participantArray.find(
        (p) => p.participantId === participantId
      );
      if (existingParticipant) {
        // If the participant already exists, update the timestamp
        existingParticipant.timelog.push({ start: new Date() });
        await session.save();
        return res.status(200).json(session);
      } else {
        return res.status(400).json({
          error:
            'Participant not found, please rejoin with valid participantId',
        });
      }
    }

    // Generate unique ID for a new participant
    participantId = uuidv4();
    session.participantArray.push({
      participantId,
      name,
      timelog: [{ start: new Date() }],
    });
    session.uniqueParticipantsCount = session.participantArray.length;
    await session.save();
    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// End a session
router.post('/:meetingId/end', async (req, res) => {
  const { meetingId } = req.params;
  try {
    // Check if session exists
    const session = await Session.findOne({ meetingId });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    session.end = new Date();
    await session.save();
    return res.status(200).json(session);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Fetch all sessions with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip = (page - 1) * limit;

    const sessions = await Session.find({}, 'meetingId start end')
      .skip(skip)
      .limit(limit)
      .lean();

    const sessionData = sessions.map((session) => {
      return {
        name: session.meetingId,
        start: session.start,
        end: session.end,
      };
    });

    res.status(200).json(sessionData);
  } catch (error) {
    console.error('Error fetching session data:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching sessions.' });
  }
});

// Fetch a particular session based on sessionId
router.get('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;

  try {
    // Fetch the session from the database using the sessionId
    const session = await Session.findOne({ meetingId: sessionId }).lean();
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session data:', error);
    res
      .status(500)
      .json({ error: 'An error occurred while fetching the session' });
  }
});

export default router;
