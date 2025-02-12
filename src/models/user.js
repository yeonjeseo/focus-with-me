"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(db) {
      User.hasMany(db.Post, {
        foreignKey: "userId",
        sourceKey: "userId",
      });
      User.hasMany(db.Comment, {
        foreignKey: "userId",
        sourceKey: "userId",
      });
      User.hasMany(db.ChildComment, {
        foreignKey: "userId",
        sourceKey: "userId",
      });
      User.hasMany(db.Like, {
        foreignKey: "userId",
        sourceKey: "userId",
      });
      User.hasMany(db.Bookmark, {
        foreignKey: "userId",
        sourceKey: "userId",
      });
      User.hasMany(db.CommentLike, {
        foreignKey: "userId",
        sourceKey: "userId",
      });
      User.belongsToMany(db.User, {
        foreignKey: "followingId",
        as: "Followers",
        through: "Follow",
        onDelete: "cascade",
      });
      User.belongsToMany(db.User, {
        foreignKey: "followerId",
        as: "Followings",
        through: "Follow",
        onDelete: "cascade",
      });
    }
  }
  User.init(
    {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
      },
      nickname: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      password: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      avatarUrl: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      provider: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "local",
      },
      snsId: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      date: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "User",
      timestamps: false,
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  return User;
};
