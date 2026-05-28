import { buildGoogleShoppingFeedXml, GOOGLE_SHOPPING_FEED_HEADERS } from '@/lib/feeds/google-shopping'

/** Feed XML para Google Merchant Center (URL histórica). */
export async function GET() {
  const xml = await buildGoogleShoppingFeedXml()
  return new Response(xml, { headers: GOOGLE_SHOPPING_FEED_HEADERS })
}
