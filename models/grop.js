module.exports = (sequelize, DataTypes) => {
const User2 = sequelize.define("User2", {
  name: {
    type: DataTypes.STRING,
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  firebase_Token:{
    type:DataTypes.STRING,
    defaultValue:""
  },
  Degree:{
    type:DataTypes.STRING,
    defaultValue:""
  }
});
  const Groups = sequelize.define("Groups", {
    GroupName: {
      type: DataTypes.STRING,
    },
  });
  Groups.belongsToMany(User2, { through: "UserGroup" });
  User2.belongsToMany(Groups, { through: "UserGroup" });
  return User2            
};