/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/de",
        destination: "/",
        permanent: true,
      },
      {
        source: "/de/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/partner/dashboard",
        destination: "/portal/dashboard",
        permanent: false,
      },
      {
        source: "/partner/dashboard/:path*",
        destination: "/portal/dashboard/:path*",
        permanent: false,
      },
      {
        source: "/partner/conversions-list",
        destination: "/portal/conversions-list",
        permanent: false,
      },
      {
        source: "/partner/conversions-list/:path*",
        destination: "/portal/conversions-list/:path*",
        permanent: false,
      },
      {
        source: "/partner/partner-data",
        destination: "/portal/partner-data",
        permanent: false,
      },
      {
        source: "/partner/partner-data/:path*",
        destination: "/portal/partner-data/:path*",
        permanent: false,
      },
      {
        source: "/partner/marketing-assets",
        destination: "/portal/marketing-assets",
        permanent: false,
      },
      {
        source: "/partner/marketing-assets/:path*",
        destination: "/portal/marketing-assets/:path*",
        permanent: false,
      },
      {
        source: "/partner/documents",
        destination: "/portal/documents",
        permanent: false,
      },
      {
        source: "/partner/documents/:path*",
        destination: "/portal/documents/:path*",
        permanent: false,
      },
      {
        source: "/partner/faq-page",
        destination: "/portal/faq-page",
        permanent: false,
      },
      {
        source: "/partner/faq-page/:path*",
        destination: "/portal/faq-page/:path*",
        permanent: false,
      },
      {
        source: "/partner/contact",
        destination: "/portal/contact",
        permanent: false,
      },
      {
        source: "/partner/contact/:path*",
        destination: "/portal/contact/:path*",
        permanent: false,
      },
      {
        source: "/partner/study-eligibility",
        destination: "/portal/study-eligibility",
        permanent: false,
      },
      {
        source: "/partner/study-eligibility/:path*",
        destination: "/portal/study-eligibility/:path*",
        permanent: false,
      },
      {
        source: "/agent/dashboard",
        destination: "/portal/dashboard",
        permanent: false,
      },
      {
        source: "/agent/dashboard/:path*",
        destination: "/portal/dashboard/:path*",
        permanent: false,
      },
      {
        source: "/agent/profile",
        destination: "/portal/profile",
        permanent: false,
      },
      {
        source: "/agent/profile/:path*",
        destination: "/portal/profile/:path*",
        permanent: false,
      },
      {
        source: "/agent/verification",
        destination: "/portal/verification",
        permanent: false,
      },
      {
        source: "/agent/verification/:path*",
        destination: "/portal/verification/:path*",
        permanent: false,
      },
      {
        source: "/agent/clients",
        destination: "/portal/applications",
        permanent: false,
      },
      {
        source: "/agent/clients/:path*",
        destination: "/portal/applications/:path*",
        permanent: false,
      },
      {
        source: "/agent/applications",
        destination: "/portal/applications",
        permanent: false,
      },
      {
        source: "/agent/applications/:path*",
        destination: "/portal/applications/:path*",
        permanent: false,
      },
      {
        source: "/agent/commissions",
        destination: "/portal/commissions",
        permanent: false,
      },
      {
        source: "/agent/commissions/:path*",
        destination: "/portal/commissions/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
    ];
  },
};
module.exports = nextConfig;
