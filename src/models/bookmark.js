"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Bookmark extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      Bookmark.belongsTo(db.Post, {
        foreignKey: "postId",
        targetKey: "postId",
        onDelete: "cascade",
      });
      Bookmark.belongsTo(db.User, {
        foreignKey: "userId",
        targetKey: "userId",
        onDelete: "cascade",
      });
    }
  }
  Bookmark.init(
    {
      bookmarkId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        unique: true,
      },
      date: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Bookmark",
      timestamps: false,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  return Bookmark;
};
