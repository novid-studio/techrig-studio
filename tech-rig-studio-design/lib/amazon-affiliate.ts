const AMAZON_PARTNER_TAG = 'techrigstudio-21'
const ASIN_PATTERN = /^[A-Z0-9]{10}$/i

type AmazonProduct = {
  name: string
  asin?: unknown
}

export function getAmazonAffiliateUrl(product: AmazonProduct): string {
  const asin = typeof product.asin === 'string' ? product.asin.trim() : ''

  if (ASIN_PATTERN.test(asin)) {
    return `https://www.amazon.de/dp/${asin}?tag=${AMAZON_PARTNER_TAG}`
  }

  return `https://www.amazon.de/s?k=${encodeURIComponent(product.name)}&tag=${AMAZON_PARTNER_TAG}`
}
