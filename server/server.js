require('@babel/polyfill')
require('isomorphic-fetch')
const dotenv = require('dotenv')
const Koa = require('koa')
const lusca = require('koa-lusca')
const next = require('next')
const { default: Shopify } = require('@shopify/shopify-api')
const { verifyRequest } = require('@shopify/koa-shopify-auth')
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth')

const { ApiVersion } = require('@shopify/shopify-api')
const Router = require('koa-router')
const {
  sessionController,
  accountController: domainAccountController,
  accountController
} = require('../src/domains/reports/controllers')
const { sleep } = require('../src/utils/server')

dotenv.config()
const port = parseInt(process.env.PORT, 10) || 8081
const dev = process.env.NODE_ENV !== 'production'
const app = next({
  dev
})
const handle = app.getRequestHandler()

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(','),
  HOST_NAME: process.env.HOST.replace(/https:\/\/|\/$/g, ''),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  // SESSION_STORAGE: new Shopify.Session.MemorySessionStorage()
  SESSION_STORAGE: new Shopify.Session.CustomSessionStorage(
    sessionController.storeCallback,
    sessionController.loadCallback,
    sessionController.deleteCallback
  )
})

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS = {}

app.prepare().then(async () => {
  const server = new Koa()

  const router = new Router()
  server.keys = [Shopify.Context.API_SECRET_KEY]
  server.use(
    createShopifyAuth({
      accessMode: 'offline',
      async afterAuth(ctx) {
        // Access token and shop available in ctx.state.shopify
        const { shop, accessToken, scope } = ctx.state.shopify
        const host = ctx.query.host
        ACTIVE_SHOPIFY_SHOPS[shop] = scope

        const session = await Shopify.Utils.loadCurrentSession(ctx.req, ctx.res)
        const restClient = new Shopify.Clients.Rest(
          session.shop,
          session.accessToken
        )
        await domainAccountController.saveShopInfo(
          ctx.state.shopify,
          restClient
        )

        const response = await Shopify.Webhooks.Registry.register({
          shop,
          accessToken,
          path: '/webhooks',
          topic: 'APP_UNINSTALLED',
          webhookHandler: async (topic, shop, body) =>
            delete ACTIVE_SHOPIFY_SHOPS[shop]
        })

        if (!response.success) {
          console.log(
            `Failed to register APP_UNINSTALLED webhook: ${response.result}`
          )
        }

        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}&host=${host}`)
      }
    })
  )

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
    ctx.res.statusCode = 200
  }

  router.post('/webhooks', async (ctx) => {
    try {
      await Shopify.Webhooks.Registry.process(ctx.req, ctx.res)
      console.log(`Webhook processed, returned status code 200`)
    } catch (error) {
      console.log(`Failed to process webhook: ${error}`)
    }
  })

  router.post(
    '/graphql',
    verifyRequest({ returnHeader: true }),
    async (ctx, next) => {
      await Shopify.Utils.graphqlProxy(ctx.req, ctx.res)
    }
  )

  router.get('/health', async (ctx) => {
    ctx.body = 'ok'
    ctx.res.statusCode = 200
  })

  router.get('/products', async (ctx) => {
    const accessToken = await accountController.getAccessToken(process.env.SHOP)
    const client = new Shopify.Clients.Rest(process.env.SHOP, accessToken.data)

    const productsResponse = await client.get({
      path: 'products'
    })
    const products = productsResponse.body.products

    ctx.body = products
    ctx.res.statusCode = 200
  })

  router.get('/products/:id', async (ctx) => {
    const accessToken = await accountController.getAccessToken(process.env.SHOP)
    const client = new Shopify.Clients.Rest(process.env.SHOP, accessToken.data)

    const productsResponse = await client.get({
      path: `products/${ctx.params.id}`
    })

    const product = productsResponse.body.product

    ctx.body = product
    ctx.res.statusCode = 200
  })

  router.get('/reports/products/:productId/orders', async (ctx) => {
    const accessToken = await accountController.getAccessToken(process.env.SHOP)
    const client = new Shopify.Clients.Rest(process.env.SHOP, accessToken.data)

    const productsResponse = await client.get({
      path: `products/${ctx.params.productId}`
    })

    await sleep()

    const findCustomer = (customers, customerId) => {
      if (customers.length === 0) {
        return null
      }

      return customers.find((c) => c.id === customerId)
    }

    const product = productsResponse.body.product

    const idsToCompare = [product.id]
    product.variants.forEach((variant) => {
      idsToCompare.push(variant.id)
    })

    // console.log('product:', product)
    // console.log('idsToCompare', idsToCompare)

    let mappedResult = {
      product,
      customers: []
    }

    const orderResponse = await client.get({
      path: 'orders',
      query: {
        query: product.title.toLowerCase(),
        processed_at_min: ctx.request.query.created_at_min,
        processed_at_max: ctx.request.query.created_at_max
      }
    })

    // console.log('-----------------------------------')

    orderResponse.body.orders.forEach((order) => {
      order.line_items.forEach((lineItem) => {
        const currentCustomer = findCustomer(
          mappedResult.customers,
          order.customer.id
        )

        // console.log('looking for:', [lineItem.product_id, lineItem.variant_id])

        if (
          idsToCompare.includes(lineItem.product_id) ||
          idsToCompare.includes(lineItem.variant_id)
        ) {
          const destination = order.shipping_address
            ? `"${order.shipping_address?.name}
              ${order.shipping_address?.address1} ${order.shipping_address?.address2}
              ${order.shipping_address?.city} ${order.shipping_address?.province_code} ${order.shipping_address?.zip}
              ${order.shipping_address?.country_code}"`
            : null
          const defaultAddress = order.customer.default_address
            ? `"${order.customer.default_address?.name}
              ${order.customer.default_address?.address1} ${order.customer.default_address?.address2}
              ${order.customer.default_address?.city} ${order.customer.default_address?.province_code} ${order.customer.default_address?.zip}
              ${order.customer.default_address?.country_code}"`
            : null
          const mappedLineItem = {
            orderId: order.id,
            lineItemId: lineItem.id,
            destination:
              destination || defaultAddress
                ? destination || defaultAddress
                : '(address not found)',
            financialStatus: order.financial_status,
            name: lineItem.name,
            customerName: `${order.customer?.first_name} ${order.customer?.last_name}`,
            date: order.updated_at,
            price: lineItem.price,
            orderStatusUrl: order.order_status_url
          }

          //if customer doesn't exist in the array, create a new one
          if (!currentCustomer) {
            mappedResult.customers.push({
              id: order.customer.id,
              name: `${order.customer.first_name} ${order.customer.last_name}`,
              email: order.customer.email,
              orders: [mappedLineItem]
            })
          } else {
            currentCustomer.orders.push(mappedLineItem)
          }
        }
      })
      // console.log('-----------------------------------')
    })

    ctx.body = mappedResult
    ctx.res.statusCode = 200
  })

  router.get('(/_next/static/.*)', handleRequest) // Static content is clear
  router.get('/_next/webpack-hmr', handleRequest) // Webpack content is clear
  router.get('(.*)', async (ctx) => {
    const shop = ctx.query.shop

    const accessToken = await accountController.getAccessToken(shop)
    const client = new Shopify.Clients.Rest(shop, accessToken.data)

    try {
      const productsResponse = await client.get({
        path: 'products'
      })

      await handleRequest(ctx)
    } catch (e) {
      return ctx.redirect(`/auth?shop=${shop}`)
    }

    // if (accessToken.status !== 200) {
    //   return ctx.redirect(`/auth?shop=${shop}`)
    // } else {
    //   await handleRequest(ctx)
    // }
  })

  server.use(router.allowedMethods())
  server.use(router.routes())
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`)
  })
})
