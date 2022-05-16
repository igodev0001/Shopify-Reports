const _ = require("lodash");
const { parseGid } = require("@shopify/admin-graphql-api-utilities");

/**
 *
 * @param {} order
 * @param {} shopInfo
 * @param {string} ipAddress
 * @returns {string}
 */
module.exports = (order, shopInfo, ipAddress) => {
  const { id, billingAddress, customer, shippingAddress } = order;

  const orderId = parseGid(id);

  const mappedFields = [
    {
      name: "domain",
      value: shopInfo.myshopifyDomain,
    },
    {
      name: "customer_email",
      value: shopInfo.email,
    },
    {
      name: "ip_address",
      value: ipAddress,
    },
    {
      name: "billing_address_city",
      value: _.get(billingAddress, "city"),
    },
    {
      name: "billing_address_country_code",
      value: _.get(billingAddress, "countryCodeV2"),
    },
    {
      name: "billing_address_postal_code",
      value: _.get(billingAddress, "zip"),
    },
    {
      name: "billing_address_state_code",
      value: _.get(billingAddress, "provinceCode"),
    },
    {
      name: "billing_address_street_line_1",
      value: _.get(billingAddress, "address1"),
    },
    {
      name: "billing_address_street_line_2",
      value: _.get(billingAddress, "address2"),
    },
    {
      name: "billing_name",
      value: _.get(billingAddress, "name"),
    },
    {
      name: "billing_phone",
      value: _.get(billingAddress, "phone"),
    },
    {
      name: "email_address",
      value: _.get(customer, "email"),
    },
    {
      name: "shipping_address_city",
      value: _.get(shippingAddress, "city"),
    },
    {
      name: "shipping_address_country_code",
      value: _.get(shippingAddress, "countryCodeV2"),
    },
    {
      name: "shipping_address_postal_code",
      value: _.get(shippingAddress, "zip"),
    },
    {
      name: "shipping_address_state_code",
      value: _.get(shippingAddress, "provinceCode"),
    },
    {
      name: "shipping_address_street_line_1",
      value: _.get(shippingAddress, "address1"),
    },
    {
      name: "shipping_address_street_line_2",
      value: _.get(shippingAddress, "address2"),
    },
    {
      name: "shipping_name",
      value: _.get(shippingAddress, "name"),
    },
    {
      name: "shipping_phone",
      value: _.get(shippingAddress, "phone"),
    },
    {
      name: "transaction_id",
      value: orderId,
    },
  ];

  const url = new URL(`${process.env.EKATA_REVIEWS_URI}`);
  url.search = new URLSearchParams();
  mappedFields.forEach((field) => {
    if (field.value) {
      url.searchParams.append(field.name, field.value);
    }
  });

  return url.toString();
};
