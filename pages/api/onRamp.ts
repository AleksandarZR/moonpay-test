import type { NextApiRequest, NextApiResponse } from "next";
import crypto, { BinaryLike } from "crypto";

/**
 * Makes fiat on-ramp call
 * @param req NextApiRequest
 * @param res NextApiResponse
 * @returns status of the operation
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address, email, redirectUrl } = req.body;
  const moonPaySecretKey/*: BinaryLike*/ = process.env.MOONPAY_SECRET_KEY /*as BinaryLike*/;

  const onrampUrl = new URL(`https://buy-sandbox.moonpay.com?apiKey=${process.env.NEXT_PUBLIC_MOONPAY_API_KEY}`);
  onrampUrl.searchParams.set("walletAddress", address);
  onrampUrl.searchParams.set("redirectURL", redirectUrl);
  onrampUrl.searchParams.set("currencyCode", "USDC");
  onrampUrl.searchParams.set("quoteCurrencyAmount", "21");
  onrampUrl.searchParams.set("paymentMethod", "credit_debit_card");
  onrampUrl.searchParams.set("colorCode", "white");
  // onrampUrl.searchParams.set("email", email /*"pletl.aleksandar@gmail.com"*/);
  //onrampUrl.searchParams.set("externalCustomerId", "did%3Aprivy%3Aclsbol7aw02ebnwkpcfj9ocmd");
  //onrampUrl.searchParams.set("externalCustomerId", "did:privy:clsbol7aw02ebnwkpcfj9ocmd");
  //onrampUrl.searchParams.set("externalTransactionId", "EjntKbHwxQrYgSjO3jKcw4z6e0MJX6jXj5_meRFDbVM");
  //onrampUrl.searchParams.set("theme", "dark");

  // Produce signature on URL
  const urlSignature = crypto
    .createHmac("sha256", moonPaySecretKey)
    .update(onrampUrl.search)
    .digest("base64");

  // Set signature as URL query parameter
  onrampUrl.searchParams.set("signature", urlSignature);

  try {
    res.status(200).json({ url: onrampUrl.toString() });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({ error: "Error when making on-ramp call.", err: err });
  }
}
