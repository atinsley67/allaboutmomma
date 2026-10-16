// Looks up a product on Amazon for the visual editor, when it was added since the last build and
// so isn't in public/amazon-products.json. Only in draft mode, so it can't be used to run up our
// Amazon API calls. /api/amazon-product?asin=B00R6XEN98
import type { NextApiHandler } from "next";
import { getProduct, lookUpNewProducts } from "../../lib/amazon";

const handler: NextApiHandler = async (req, res) => {
  if (!req.draftMode) return res.status(403).json({ message: "Draft mode only" });
  const asin = String(req.query.asin || "");
  await lookUpNewProducts([asin]);
  res.setHeader("Cache-Control", "private, no-store");
  return res.json(getProduct(asin));
};

export default handler;
