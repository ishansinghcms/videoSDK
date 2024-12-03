import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import sessionRoutes from './routes/sessionRoutes.js';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/sessions', sessionRoutes);

// Database Connection
mongoose
  .connect('mongodb://localhost:27017/sessionManager')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
