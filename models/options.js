'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Options extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.OrderOptions, {
        sourceKey: 'optionId',
        foreignKey: 'OptionId',
      });

      this.hasMany(models.OrderItems, {
        sourceKey: 'optionId',
        foreignKey: 'OptionId',
      });

      this.belongsTo(models.Products, {
        targetKey: 'productId',
        foreignKey: 'ProductId',
      });
    }
  }
  Options.init(
    {
      optionId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      ProductId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Products',
          key: 'productId',
        },
      },
      extraPrice: {
        type: DataTypes.INTEGER,
      },
      shotPrice: {
        type: DataTypes.INTEGER,
      },
      hot: {
        type: DataTypes.BOOLEAN,
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
      modelName: 'Options',
    }
  );
  return Options;
};
