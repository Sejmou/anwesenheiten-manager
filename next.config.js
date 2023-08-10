module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/anwesenheiten',
        permanent: false,
      },
    ];
  },
  experimental: {
    swcPlugins: [
      [
        'next-superjson-plugin',
        {
          excluded: [],
        },
      ],
    ],
  },
};
