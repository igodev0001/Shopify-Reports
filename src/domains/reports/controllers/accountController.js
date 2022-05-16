const { accountModel } = require('../models')
const { ACTIVE_STATUS, INACTIVE_STATUS } = require('../../../constants/account')
const { handleErrorStatus } = require('../../../utils')

/**
 *
 * @param {} shopData
 * @param {string} shopDomain
 * @param {} shopifySession
 * @param {number} accountStatus
 * @returns {data, status}
 */
const createOrUpdateAccount = async (
  shopData,
  shopDomain,
  shopifySession,
  accountStatus = ACTIVE_STATUS
) => {
  let status = 200
  let data = null
  let account = null

  try {
    account = await accountModel.get({
      shopDomain: shopDomain
    })

    if (account) {
      account.status = ACTIVE_STATUS
      account.save()
    } else {
      account = await accountModel.createAccount(
        shopDomain,
        shopifySession,
        accountStatus
      )
    }

    data = account
  } catch (error) {
    console.log(error)
    status = handleErrorStatus(error)
    data = {
      message: 'Error while trying to create an account'
    }
  }
  return { data, status }
}

/**
 *
 * @param {string} shopDomain
 * @returns  {data, status}
 */
const getAccessToken = async (shopDomain) => {
  let status = 200
  let data = null

  if (typeof shopDomain === 'undefined') {
    status = 422
    data = {
      message: 'Shop is empty.'
    }
    return { data, status }
  }

  try {
    data = await accountModel.getAccessToken(shopDomain)
  } catch (error) {
    console.log(error)
    status = handleErrorStatus(error)

    data = {
      message: `Error while fetching the account | getAccessToken | Shop: ${shopDomain}`
    }
  }
  return { data, status }
}

/**
 *
 * @param {string} shopDomain
 * @returns {data, status}
 */
const getByShop = async (shopDomain) => {
  let status = 200
  let data = null

  try {
    data = await accountModel.getByShop(shopDomain)
    if (!data) {
      status = 404
      return { data, status }
    }
  } catch (error) {
    console.log(error)
    status = handleErrorStatus(error)
    data = {
      message: `Error while fetching the account: getByShop. ShopDomain: ${shopDomain}`
    }
  }
  return { data, status }
}

/**
 *
 * @param {string} shopifySession
 * @param {string} shopifyClient
 */
const saveShopInfo = async (shopifySession, shopifyClient) => {
  let status = 200
  let data = null

  const shopifyShop = await shopifyClient.get({
    path: 'shop'
  })

  const { shop } = shopifySession
  if (!shopifyShop.body?.shop) {
    status = 404
    return { data, status }
  }
  const response = await createOrUpdateAccount(
    shopifyShop.body.shop,
    shop,
    shopifySession
  )
  data = response.data

  return { data, status }
}

/**
 *
 * @param {number} accountId
 * @returns
 */
const setToInactive = async (accountId) => {
  let status = 200
  let data = null

  try {
    data = await accountModel.update(
      {
        status: INACTIVE_STATUS
      },
      accountId
    )

    if (!data[0]) {
      status = 404
      return { data, status }
    }
  } catch (error) {
    console.log(error)
    status = handleErrorStatus(error)
    data = {
      message: 'Error while trying to update account status.'
    }
  }
  return { data, status }
}

module.exports = {
  createOrUpdateAccount,
  getAccessToken,
  getByShop,
  saveShopInfo,
  setToInactive
}
