module.exports = (sequelize, DataTypes) => {
  const msgs = sequelize.define("msgs", {
    message: {
      type: DataTypes.STRING,
    },
    author: {
      type: DataTypes.STRING,
    },
    room: {
      type: DataTypes.STRING,
    },
    time:{
        type:DataTypes.STRING
    }
  });
  return msgs;
};
