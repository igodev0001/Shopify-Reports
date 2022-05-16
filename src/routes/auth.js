const { default: Shopify } = require('@shopify/shopify-api')
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth')
const { accountController } = require('../domains/reports/controllers')
const { webhookController } = require('../domains/shopify/controllers')

module.exports = createShopifyAuth({
  accessMode: 'offline',
  async afterAuth(ctx) {
    // Access token and shop available in ctx.state.shopify
    const { shop, accessToken, scope } = ctx.state.shopify
    const host = ctx.query.host

    const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res)
    const restClient = new Shopify.Clients.Rest(
      session.shop,
      session.accessToken
    )

    await accountController.saveShopInfo(ctx.state.shopify, restClient)

    const response = await Shopify.Webhooks.Registry.register({
      shop,
      accessToken,
      path: '/webhooks',
      topic: 'APP_UNINSTALLED',
      webhookHandler: webhookController.handleResponse
    })

    if (response.success) {
      console.log(`Webhook registered for shop ${shop}`)
    } else {
      console.log(
        `Failed to register APP_UNINSTALLED webhook: ${response.result}`
      )
    }

    // Redirect to app with shop parameter upon auth
    ctx.redirect(`/?shop=${shop}&host=${host}`)
  }
})
