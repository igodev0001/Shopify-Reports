const { accountController } = require("../../reports/controllers");

/**
 *
 * @param {string} _topic
 * @param {string} shop
 * @param {} _body
 */
const handleResponse = async (_topic, shop, _body) => {
  try {
    if (_topic === "APP_UNINSTALLED") {
      const { data: account } = await accountController.getByShop(shop);
      await accountController.setToInactive(account.id);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleResponse,
};
