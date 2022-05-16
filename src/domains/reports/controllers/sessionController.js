const { accountModel } = require('../models')

/**
 *
 * @param {} session
 * @returns {Promise}
 */
const storeCallback = async (session) => {
  const { shop } = session
  return accountModel.storeShopifySession(shop, session)
}

/**
 *
 * @param {string} sessionId
 * @returns {Promise}
 */
const loadCallback = async (sessionId) => {
  return accountModel.getShopifySession(sessionId)
}

/**
 *
 * @param {string} sessionId
 * @returns {Promise}
 */
const deleteCallback = async (sessionId) => {
  return accountModel.deleteShopifySession(sessionId)
}

module.exports = {
  storeCallback,
  loadCallback,
  deleteCallback
}
