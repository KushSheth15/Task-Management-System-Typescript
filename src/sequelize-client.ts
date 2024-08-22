import * as dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';

dotenv.config();

import config from './models/config'; 
import { user } from './models/user.model';
import { accessToken } from './models/access-token.model';
import { status } from './models/status.model';
import { task } from './models/task.model';
import { subtask } from './models/subtask.model';
import { reminder } from './models/reminder.model';

const env = process.env.NODE_ENV || 'development';

type Model = (typeof db)[keyof typeof db]

type ModelWithAssociate = Model & { associate: (model: typeof db) => void }

const checkAssociation = (model: Model): model is ModelWithAssociate => {
  return 'associate' in model;
};

const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

const db = {
  sequelize: sequelize,
  User: user(sequelize, DataTypes),
  AccessToken:accessToken(sequelize,DataTypes),
  Status:status(sequelize,DataTypes),
  Task:task(sequelize, DataTypes),
  SubTask:subtask(sequelize, DataTypes),
  Reminder:reminder(sequelize,DataTypes),
  models: sequelize.models
};

Object.entries(db).forEach(([, model]: [string, Model]) => {
  if (checkAssociation(model)) {
    model.associate(db);
  }
});

export default db;
