import * as dotenv from 'dotenv';
dotenv.config();

import app from './app';
import db from './sequelize-client';
import setupCronJobs from './services/reminder.services';

const PORT = process.env.PORT;

setupCronJobs();

const startServer = async () => {
  try {
    await db.sequelize.sync({ force: false });
    console.log('Database Connected Successfully ✌');

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT} 🚀 `);
    });
  } catch (error) {
    console.error('Unable to start server : ', error);
  }
};

startServer();
