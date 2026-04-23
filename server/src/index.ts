import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';

import analyzeRouter from './routes/analyze';
import recommendRouter from './routes/recommend';
import logger from './utils/logger';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());

// Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/recommend', recommendRouter);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fasalrakshak';

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
