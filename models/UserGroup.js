module.exports = (sequelize, DataTypes) => {
  const UserGroup = sequelize.define("UserGroup", {
    GroupId: {
      type: DataTypes.STRING,
    },
    User2Id:{
        type: DataTypes.STRING
    }
  });

  return UserGroup;
};
