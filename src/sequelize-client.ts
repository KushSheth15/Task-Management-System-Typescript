import * as dotenv from 'dotenv';
import { DataTypes, Sequelize } from 'sequelize';

dotenv.config();

import { accessToken } from './models/access-token.model';
import config from './models/config';
import { reminder } from './models/reminder.model';
import { taskShare } from './models/share-task.model';
import { status } from './models/status.model';
import { subtask } from './models/subtask.model';
import { task } from './models/task.model';
import { user } from './models/user.model';

const env = process.env.NODE_ENV || 'development';

type Model = (typeof db)[keyof typeof db];

type ModelWithAssociate = Model & { associate: (model: typeof db) => void };

const checkAssociation = (model: Model): model is ModelWithAssociate => {
  return 'associate' in model;
};

// eslint-disable-next-line security/detect-object-injection
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);

const db = {
  sequelize: sequelize,
  User: user(sequelize, DataTypes),
  AccessToken: accessToken(sequelize, DataTypes),
  Status: status(sequelize, DataTypes),
  Task: task(sequelize, DataTypes),
  SubTask: subtask(sequelize, DataTypes),
  Reminder: reminder(sequelize, DataTypes),
  TaskShare: taskShare(sequelize, DataTypes),
  models: sequelize.models,
};

Object.entries(db).forEach(([, model]: [string, Model]) => {
  if (checkAssociation(model)) {
    model.associate(db);
  }
});

export default db;
