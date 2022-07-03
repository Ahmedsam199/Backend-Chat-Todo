const Sequelize = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  const Ctask = sequelize.define("Ctask", {
    task: {
      type: DataTypes.STRING,
    },
    UserID: {
      type: DataTypes.STRING,
    },
  });

  
  return Ctask;
};
