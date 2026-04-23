import 'dotenv/config';
import express from 'express';

import recommendRouter from './routes/recommend';
import logger from './utils/logger';

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.json());

// Routes
app.use('/api/recommend', recommendRouter);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;
