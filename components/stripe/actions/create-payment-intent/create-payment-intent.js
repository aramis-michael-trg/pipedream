const pick = require("lodash.pick");
const stripe = require("../../stripe.app.js");

module.exports = {
  key: "stripe-create-payment-intent",
  name: "Create a Payment Intent",
  type: "action",
  version: "0.0.1",
  description: "Create a [payment intent](https://stripe.com/docs/payments/payment-intents)",
  props: {
    stripe,
    amount: {
      propDefinition: [
        stripe,
        "amount",
      ],
      optional: false,
    },
    country: {
      propDefinition: [
        stripe,
        "country",
      ],
      optional: false,
    },
    currency: {
      propDefinition: [
        stripe,
        "currency",
      ],
      optional: false,
    },
    payment_method_types: {
      propDefinition: [
        stripe,
        "payment_method_types",
      ],
      default: [
        "card",
      ],
    },
    statement_descriptor: {
      propDefinition: [
        stripe,
        "statement_descriptor",
      ],
    },
    metadata: {
      propDefinition: [
        stripe,
        "metadata",
      ],
    },
    advanced: {
      propDefinition: [
        stripe,
        "advanced",
      ],
      description: "Specify less-common options that you require. See [Create a PaymentIntent]" +
        "(https://stripe.com/docs/api/payment_intents/create) for a list of supported options.",
    },
  },
  async run() {
    const params = pick(this, [
      "amount",
      "currency",
      "payment_method_types",
      "statement_descriptor",
      "metadata",
    ]);
    const advanced = this.advanced;

    // Don't fail if the statement descriptor was too long
    if (params.statement_descriptor) {
      params.statement_descriptor = String(params.statement_descriptor).slice(0, 21);
    }
    if (advanced.statement_descriptor_suffix) {
      advanced.statement_descriptor_suffix = String(advanced.statement_descriptor_suffix)
        .slice(0, 21);
    }
    return await this.stripe.sdk().paymentIntents.create({
      ...params,
      ...advanced,
    });
  },
};
