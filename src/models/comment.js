"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      Comment.belongsTo(db.User, {
        foreignKey: "userId",
        targetKey: "id",
      });
      Comment.belongsTo(db.Post, {
        foreignKey: "postId",
        targetKey: "postId",
      });
    }
  }
  Comment.init(
    {
      userId: DataTypes.INTEGER,
      postId: DataTypes.INTEGER,
      textContent: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
