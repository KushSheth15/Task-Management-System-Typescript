import Sequelize, { CreationOptional, ForeignKey, Model } from 'sequelize';

import db from '../sequelize-client';

import Task from './task.model';
import User from './user.model';

export interface TaskShareAttributes {
    id?: string;
    taskId: string;
    userId: string;
}

export default class TaskShare
  extends Model<TaskShareAttributes>
  implements TaskShareAttributes
{
  declare id: CreationOptional<string>;
  declare taskId: ForeignKey<Task['id']>;
  declare userId: ForeignKey<User['id']>;

  declare user?: User;

  // Static method for defining associations
  static associate: (models: typeof db) => void;
}

// Initialize the Task model
export const taskShare = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes,
) => {
  TaskShare.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      taskId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'task_id',
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      modelName: 'TaskShare',
      tableName: 'task_shares',
      paranoid: true,
    },
  );

  TaskShare.associate = models => {
    TaskShare.belongsTo(models.Task, { foreignKey: 'taskId', as: 'task' });
    TaskShare.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return TaskShare;
};
