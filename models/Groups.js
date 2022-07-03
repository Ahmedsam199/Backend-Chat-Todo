module.exports = (sequelize, DataTypes) => {
  const Groups = sequelize.define("Groups", {
    GroupName: {
      type: DataTypes.STRING,
    },
  });
  
  
  return Groups;
};
