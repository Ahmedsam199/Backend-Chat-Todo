module.exports = (sequelize, DataTypes) => {
  const PrivateMsg = sequelize.define("PrivateMsg", {
    message: {
      type: DataTypes.STRING,
    },
    author: {
      type: DataTypes.STRING,
    },
    room: {
      type: DataTypes.STRING,
    },
    to: {
      type: DataTypes.STRING,
    },
    image:{
      type: DataTypes.STRING,
      defaultValue:""
    },
    video:{
      type: DataTypes.STRING,
      defaultValue:""
    },
    audio:{
      type: DataTypes.STRING,
      defaultValue:""
    },
    
    file:{
      type: DataTypes.STRING,
      defaultValue:""
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time: {
      type: DataTypes.STRING,
    },
  });
  return PrivateMsg;
};
