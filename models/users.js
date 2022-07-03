module.exports = (sequelize, DataTypes) => {
  const Users = sequelize.define("Users", {
    User: {
      type: DataTypes.STRING,
    },
  });
  return Users;
};
