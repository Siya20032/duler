const { Sequelize } = require("sequelize");
const config = require("./config");

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  logging: false,
  pool: { max: 10, min: 0, idle: 10000 },
  define: { underscored: true, timestamps: true }
});

module.exports = sequelize;
