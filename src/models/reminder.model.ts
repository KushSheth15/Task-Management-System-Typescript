import Sequelize,{CreationOptional,ForeignKey,Model } from 'sequelize';
import db from '../sequelize-client';
import Task from './task.model';

export interface ReminderModelCreationAttributes  {
  taskId: string;
  reminderDate:Date;
}

export interface ReminderModelAttributes  extends ReminderModelCreationAttributes  {
  id: string;
}

export default class Reminder  extends Model<ReminderModelAttributes , ReminderModelCreationAttributes > implements ReminderModelAttributes  {
  declare id: CreationOptional<string>;
  declare taskId: ForeignKey<Task['id']>;
  declare reminderDate: Date;
  
  declare task?: Task;
  static associate: (models: typeof db) => void;
}

// Initialize the Status model
export const reminder  = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  Reminder.init(
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
      reminderDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      modelName: 'Reminder',
      tableName: 'reminders',
      paranoid: true,
    }
  );

  // Define associations (if any)
  Reminder.associate = models => {
    Reminder.belongsTo(models.Task,{foreignKey:'taskId',as:'task'});
  };

  return Reminder ;
};
