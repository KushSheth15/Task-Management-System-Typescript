import Sequelize, { CreationOptional, Model } from 'sequelize';
import db from '../sequelize-client';

export type TaskStatus = 'TODO' | 'INPROGRESS' | 'INREVIEW' | 'COMPLETED';

export interface StatusModelCreationAttributes {
  status: TaskStatus;
}

export interface StatusModelAttributes extends StatusModelCreationAttributes {
  id: string;
}

export default class Status extends Model<StatusModelAttributes, StatusModelCreationAttributes> implements StatusModelAttributes {
  declare id: CreationOptional<string>;
  declare status: TaskStatus;

  // Static method for defining associations
  static associate: (models: typeof db) => void;
}

// Initialize the Status model
export const status = (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes) => {
  Status.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      status: {
        type: DataTypes.ENUM('TODO', 'INPROGRESS', 'INREVIEW', 'COMPLETED'),
        allowNull: false,
        defaultValue: 'TODO',
      },
    },
    {
      sequelize,
      underscored: true,
      timestamps: true,
      modelName: 'Status',
      tableName: 'statuses',
      paranoid: true,
    }
  );

  // Define associations (if any)
  Status.associate = models => {
    Status.hasMany(models.Task, { foreignKey: 'statusId' });
  };

  return Status;
};
