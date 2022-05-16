const { DataTypes } = require('sequelize')
const { sequelize } = require('../config')

const Account = sequelize.define('Accounts', {
  shopDomain: DataTypes.STRING,
  shopifySession: DataTypes.JSONB,
  status: DataTypes.INTEGER
})

module.exports = Account
