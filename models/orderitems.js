'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItems extends Model {
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

      this.belongsTo(models.Products, {
        targetKey: 'productId',
        foreignKey: 'ProductId',
      });
    }
  }
  OrderItems.init(
    {
      orderItemId: {
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
      ProductId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Products',
          key: 'productId',
        },
        onUpdate: 'CASCADE',
      },
      quantity: {
        type: DataTypes.INTEGER,
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
      modelName: 'OrderItems',
    }
  );
  return OrderItems;
};
