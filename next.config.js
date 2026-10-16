module.exports = {
  // Pages rendered on request in draft mode read these at runtime, so the server functions need them
  outputFileTracingIncludes: {
    "/[filename]": ["./content/pages/*.md", "./public/amazon-products.json"],
    "/": ["./public/amazon-products.json"],
    "/api/amazon-product": ["./public/amazon-products.json"],
  },
  async rewrites() {
    return [
      {
        source: "/admin",
        destination: "/admin/index.html",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};
