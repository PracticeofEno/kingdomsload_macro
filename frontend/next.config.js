const rewrites = async () => {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.NEXT_PUBLIC_BACKEND}/:path*`,
    },
  ];
};

module.exports = {
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  rewrites,
};
