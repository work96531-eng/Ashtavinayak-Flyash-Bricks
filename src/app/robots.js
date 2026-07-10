export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/'], // Hide admin portal from Google
    },
    sitemap: 'https://ashtavinayak-flyash-bricks.vercel.app/sitemap.xml',
  }
}
