const { parsed: localEnv } = require('dotenv').config()

const webpack = require('webpack')
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY)
const host = JSON.stringify(process.env.HOST)

const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'NONE'
  }
]
module.exports = {
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  },
  webpack: (config) => {
    const env = { API_KEY: apiKey, HOST: host }
    config.plugins.push(new webpack.DefinePlugin(env))

    // Add ESM support for .mjs files in webpack 4
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto'
    })

    return config
  }
}
