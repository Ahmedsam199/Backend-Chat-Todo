module.exports = (sequelize, DataTypes) => {
    const Todo = sequelize.define("Todo", {
      task: {
        type: DataTypes.STRING,
      },UserID:{
        type:DataTypes.STRING
      },Body:{
        type:DataTypes.STRING
      }
    });
    return Todo;
  };