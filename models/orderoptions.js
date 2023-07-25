'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderOptions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.Orders, {
        targetKey: 'orderId',
        foreignKey: 'OrderId',
      });

      this.belongsTo(models.Options, {
        targetKey: 'optionId',
        foreignKey: 'OptionId',
      });
    }
  }
  OrderOptions.init(
    {
      orderOptionId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      OrderId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Orders',
          key: 'orderId',
        },
        onUpdate: 'CASCADE',
      },
      OptionId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Options',
          key: 'optionId',
        },
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'OrderOptions',
    }
  );
  return OrderOptions;
};
