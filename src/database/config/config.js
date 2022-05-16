const Sequelize = require('sequelize')
require('dotenv').config()
/**
 * Sets up Sequelize connection
 */
module.exports = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT
  }
)
