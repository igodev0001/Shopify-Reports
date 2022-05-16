const Account = require('../../../database/models/account')
const { Session } = require('@shopify/shopify-api/dist/auth/session')
const { decryptString, encryptString } = require('../../../utils/server')
const { INACTIVE_STATUS } = require('../../../constants/account')
/**
 * Create an account
 * @param {string} shopDomain
 * @param {string} shopifySession
 * @param {number} accountStatus
 * @returns {Promise}
 */
const createAccount = async (shopDomain, shopifySession, accountStatus) => {
  const shopifyToken = encryptString(shopifySession.accessToken)
  const session = { ...shopifySession, accessToken: shopifyToken }
  return await Account.create({
    shopDomain,
    shopifySession: session,
    status: Number(accountStatus)
  })
}

/**
 *
 * @param {string} sessionId
 * @returns {Promise}
 */
const deleteShopifySession = async (sessionId) => {
  return Account.update(
    {
      shopifySession: {}
    },
    {
      where: {
        shopifySession: {
          id: sessionId
        }
      }
    }
  )
    .then((response) => {
      return response[0] === 1
    })
    .catch((error) => {
      console.log(error)
      return false
    })
}

/**
 *
 * @param {} params
 * @returns {Promise<Account>}
 */
const get = async (params) => {
  return await Account.findOne({
    where: params
  })
}

/**
 * Get an account by shop domain
 * @param {*} shop
 * @returns {Promise<Account>}
 */
const getByShop = async (shop) => {
  return await get({
    shopDomain: shop
  })
}

/**
 *
 * @param {shopDomain} shopDomain
 * @returns {string}
 */
const getAccessToken = async (shopDomain) => {
  const account = await Account.findOne({
    where: {
      shopDomain
    },
    attributes: ['shopifySession']
  })

  if (!account) {
    const error = new Error('Account not found')
    error.status = 404
    throw error
  }

  return decryptString(account.shopifySession.accessToken)
}

/**
 *
 * @param {string} sessionId
 * @returns {Promise<Account>}
 */
const getShopifySession = async (sessionId) => {
  return Account.findOne({
    where: {
      shopifySession: {
        id: sessionId
      }
    }
  })
    .then((account) => {
      const { shopDomain, shopifySession } = account
      const session = new Session(sessionId)

      session.shop = shopDomain
      session.state = shopifySession.state
      session.scope = shopifySession.scope ? shopifySession.scope : undefined
      session.expires = shopifySession.expires
        ? new Date(shopifySession.expires)
        : undefined
      session.isOnline = shopifySession.isOnline
      session.accessToken = shopifySession.accessToken
        ? decryptString(shopifySession.accessToken)
        : undefined
      session.onlineAccessInfo = shopifySession.onlineAccessInfo
        ? shopifySession.onlineAccessInfo
        : undefined
      return session
    })
    .catch((error) => {
      console.log(error)
      return new Session(sessionId)
    })
}

/**
 *
 * @param {string} shopDomain
 * @param {} shopifySession
 * @returns {Promise}
 */
const storeShopifySession = async (shopDomain, shopifySession) => {
  const account = await getByShop(shopDomain)

  const session = {
    ...shopifySession,
    accessToken: shopifySession.accessToken
      ? encryptString(shopifySession.accessToken)
      : undefined
  }

  if (account) {
    return Account.update(
      { shopifySession: session },
      {
        where: { shopDomain }
      }
    )
      .then(() => {
        return true
      })
      .catch((error) => {
        console.log(error)
        return false
      })
  }

  return await Account.create({
    shopDomain,
    shopifySession: session,
    status: INACTIVE_STATUS
  })
    .then(() => {
      return true
    })
    .catch((error) => {
      console.log(error)
      return false
    })
}

/**
 * Updates an account
 * @param {} data
 * @param {number} id
 * @returns
 */
const update = async (data, id) => {
  return await Account.update(data, {
    where: { id }
  })
}

module.exports = {
  createAccount,
  deleteShopifySession,
  get,
  getAccessToken,
  getByShop,
  getShopifySession,
  storeShopifySession,
  update
}
