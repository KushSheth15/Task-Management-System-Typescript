import Sequelize, { CreationOptional, ForeignKey, Model } from 'sequelize';

import db from '../sequelize-client';

import Status from './status.model';
import Task from './task.model';

export interface SubTaskModelCreationAttributes {
    title: string;
    description?: string;
    statusId: string;
    taskId: string;
    dueDate?: Date;
}

export interface SubTaskModelAttributes extends SubTaskModelCreationAttributes {
    id: string;
}

export default class SubTask
  extends Model<SubTaskModelAttributes, SubTaskModelCreationAttributes>
  implements SubTaskModelAttributes
{
  declare id: CreationOptional<string>;
  declare title: string;
  declare description?: string;
  declare statusId: ForeignKey<Status['id']>;
  declare taskId: ForeignKey<Task['id']>;
  declare dueDate?: Date;

  // Static method for defining associations
  static associate: (models: typeof db) => void;
}

// Initialize the Task model
export const subtask = (
  sequelize: Sequelize.Sequelize,
  DataTypes: typeof Sequelize.DataTypes,
) => {
  SubTask.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      statusId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'status_id',
      },
      taskId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'task_id',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      modelName: 'SubTask',
      tableName: 'subtasks',
      paranoid: true,
    },
  );

  SubTask.associate = models => {
    SubTask.belongsTo(models.Task,{foreignKey:'taskId',as:'task'});
  };

  return SubTask;
};
