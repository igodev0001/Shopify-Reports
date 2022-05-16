const { default: Shopify } = require("@shopify/shopify-api");

let graphQlClient = null;

const shopApi = {
  setApi: (shop, accessToken) => {
    graphQlClient = new Shopify.Clients.Graphql(shop, accessToken);
    return graphQlClient;
  },
  graphQlClient: () => graphQlClient,
  getOrder: async (orderId) => {
    return await graphQlClient.query({
      data: `{
          order(id: "gid://shopify/Order/${orderId}") {
            id          
            name
            customer {
              email
            }
            shippingAddress {
              name
              address1
              address2
              city
              zip
              provinceCode
              countryCodeV2
              phone
            }
            billingAddress {
              name
              address1
              address2
              city
              zip
              provinceCode
              countryCodeV2
              phone
            }
          }
        }`,
    });
  },
  getShopInfo: async () => {
    return await graphQlClient.query({
      data: `{
        shop {
          name
          email
          myshopifyDomain
          billingAddress {
            address1
            city
            company
            country
            name
          }
          plan {
            displayName
          }
        }
      }`,
    });
  },
};

module.exports = shopApi;
