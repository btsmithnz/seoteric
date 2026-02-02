import { Polar } from "@convex-dev/polar";
import { api, components } from "./_generated/api";

const productStandardMonthly = process.env.POLAR_PRODUCT_STANDARD_MONTHLY;
if (!productStandardMonthly) {
  throw new Error("POLAR_PRODUCT_STANDARD_MONTHLY is not set");
}

export const polar = new Polar(components.polar, {
  products: {
    standardMonthly: productStandardMonthly,
  },
  getUserInfo: async (ctx) => {
    const user: {
      _id: string;
      name: string;
      email: string;
    } = await ctx.runQuery(api.auth.getCurrentUser);
    return {
      userId: user._id,
      name: user.name,
      email: user.email,
    };
  },
});

export const {
  // If you configure your products by key in the Polar constructor,
  // this query provides a keyed object of the products.
  getConfiguredProducts,

  // Lists all non-archived products, useful if you don't configure products by key.
  listAllProducts,

  // Generates a checkout link for the given product IDs.
  generateCheckoutLink,

  // Generates a customer portal URL for the current user.
  generateCustomerPortalUrl,

  // Changes the current subscription to the given product ID.
  changeCurrentSubscription,

  // Cancels the current subscription.
  cancelCurrentSubscription,
} = polar.api();
