import type { NextConfig } from "next";
import withTM from "next-transpile-modules";

const withTranspile = withTM([
  "@uiw/react-md-editor",
  "@uiw/react-markdown-preview",
]);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "orangehats.s3.amazonaws.com",
      "orangehats.s3.us-east-2.amazonaws.com",
    ],
  },
};

export default withTranspile(nextConfig);
