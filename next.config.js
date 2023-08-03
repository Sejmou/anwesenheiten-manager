module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/anwesenheiten',
        permanent: true,
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
