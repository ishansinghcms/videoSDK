import { Schema, model } from 'mongoose';

const EventSchema = new Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date },
    message: { type: String }, // For errors
  },
  { _id: false }
);

const TimelogSchema = new Schema(
  {
    start: { type: Date, required: true },
    end: { type: Date },
  },
  { _id: false }
);

const ParticipantSchema = new Schema(
  {
    participantId: { type: String, required: true },
    name: { type: String, required: true },
    events: {
      mic: [EventSchema],
      webcam: [EventSchema],
      screenShare: [EventSchema],
      screenShareAudio: [EventSchema],
      errors: [EventSchema],
    },
    timelog: [TimelogSchema],
  },
  { _id: false }
);

const SessionSchema = new Schema({
  meetingId: { type: String, unique: true, required: true },
  start: { type: Date, required: true },
  end: { type: Date },
  uniqueParticipantsCount: { type: Number, default: 0 },
  participantArray: [ParticipantSchema],
});

export default model('Session', SessionSchema);
