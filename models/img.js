module.exports = (sequelize, DataTypes) => {
  const img = sequelize.define("img", {
    image: {
      type: DataTypes.STRING,
    },
  });

  return img;
};
