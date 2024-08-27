/* eslint-disable @typescript-eslint/no-explicit-any */
import * as dotenv from 'dotenv';
import express from 'express';

dotenv.config();
import { REST_API_PREFIX } from './constants/api.constant';
import { ERROR_MESSAGES } from './constants/messages.constant';
import router from './routes/index.route';

const app = express();

app.use(express.json());

app.use(REST_API_PREFIX.API_V1, router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: any, res: any, next: any) => {
  if (err.statusCode) {
    res.status(err.statusCode).json({
      message: err.message,
      code: err.code,
    });
  } else {
    res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
  }
});

export default app;
