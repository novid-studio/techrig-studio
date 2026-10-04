'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { ArrowRight, ArrowUpRight, ChevronDown, CircuitBoard, Cpu, Fan, HardDrive, Heart, MemoryStick, Monitor, Package, Search, ShieldCheck, SlidersHorizontal, Sparkles, X, Zap, type LucideIcon } from 'lucide-react'
import { getAmazonAffiliateUrl } from '@/lib/amazon-affiliate'
import { amazonComponentCatalog, amazonMonitorCatalog, catalogCategories, type CatalogCategory } from '@/lib/amazon-catalog'

type View = 'builder' | 'catalog' | 'monitors'
type Resolution = '1080p' | '1440p' | '4k'
type PanelType = 'Alle' | 'OLED' | 'IPS' | 'VA' | 'TN'
type BuildPart = { category: string; name: string; asin: string; imageUrl: string; amazonSiteStripeHtml?: string; detail: string; icon: LucideIcon }
type MonitorProduct = { name: string; asin: string; imageUrl: string; imageFallbackUrl?: string; amazonSiteStripeHtml?: string; brand: string; spec: string; resolution: Resolution; hz: number; panel: Exclude<PanelType, 'Alle'>; badge: string; color: string; featured: boolean }
type SearchProduct = { name: string; asin: string; imageUrl: string; imageFallbackUrl?: string; amazonSiteStripeHtml?: string; category: string; detail: string }
type GamingBuild = { id: string; title: string; tier: string; target: string; summary: string; color: string; budgetFrom: number; resolutions: Resolution[]; compatibility: string[]; parts: BuildPart[] }

const componentImageUrls: Record<string, string> = {
  B09VCHR1VH: 'https://m.media-amazon.com/images/I/51So7GoGvxL._AC_SX355_.jpg',
  B08BN8VD23: 'https://m.media-amazon.com/images/I/81QyMksmunL._AC_SX355_.jpg',
  B088KSRW4S: 'https://m.media-amazon.com/images/I/917jhv56PSL._AC_SX355_.jpg',
  B0CSFMYN1W: 'https://m.media-amazon.com/images/I/81naCU3eaAL._AC_SX355_.jpg',
  B0DLH776YJ: 'https://m.media-amazon.com/images/I/71-f9oX7bEL._AC_SX355_.jpg',
  B0BMQJWBDM: 'https://m.media-amazon.com/images/I/61h39mKsSBL._AC_SX355_.jpg',
  B0BKL4JJD8: 'https://m.media-amazon.com/images/I/61luaxUttML._AC_SY355_.jpg',
  B0CYM3WSHX: 'https://m.media-amazon.com/images/I/61QjHcl1ISL._AC_SX355_.jpg',
  B09QV5KJHV: 'https://m.media-amazon.com/images/I/71Sr1zjPhwL._AC_SY355_.jpg',
  B0F8KJKC9Y: 'https://m.media-amazon.com/images/I/81BUg0wr-CL._AC_SY355_.jpg',
  B0F9YYGDRZ: 'https://m.media-amazon.com/images/I/71agaXpqC7L._AC_SX355_.jpg',
  B08C7BGV3D: 'https://m.media-amazon.com/images/I/71s1rIQQK9L._AC_SY355_.jpg',
  B0D6NN6TM7: 'https://m.media-amazon.com/images/I/61RfWUr4kvL._AC_SY355_.jpg',
  B0DPKV94MX: 'https://m.media-amazon.com/images/I/81gwXriq5PL._AC_SY355_.jpg',
  B0DVGVZZYY: 'https://m.media-amazon.com/images/I/81PfcRFvKTL._AC_SY355_.jpg',
  B0B53B1BLS: 'https://m.media-amazon.com/images/I/71j6VKsz-fL._SX342_.jpg',
  B0DMTN5WLB: 'https://m.media-amazon.com/images/I/71UlVM3qc5L._AC_SX355_.jpg',
  B0DKFMSMYK: 'https://m.media-amazon.com/images/I/71NMFO0iUhL._AC_SY355_.jpg',
  B0DT6NZ9V9: 'https://m.media-amazon.com/images/I/71PJltF0IRL._AC_SX355_.jpg',
  B0F9YY3R57: 'https://m.media-amazon.com/images/I/71-aWYn5IqL._AC_SY355_.jpg',
  B0DTHVWZ7K: 'https://m.media-amazon.com/images/I/61AVKytXCyL._AC_SY355_.jpg',
  B08M49WW51: 'https://m.media-amazon.com/images/I/81XOpLgpw8L._AC_SY355_.jpg',
}

const sharedParts = {
  ssd: { category: 'SSD', name: 'WD_BLACK SN770 NVMe SSD 1TB', asin: 'B09QV5KJHV', imageUrl: componentImageUrls['B09QV5KJHV'], detail: 'M.2 2280 · PCIe 4.0 x4', icon: HardDrive },
  ddr5: { category: 'Arbeitsspeicher', name: 'Kingston FURY Beast RGB EXPO 32GB DDR5-6000 CL30', asin: 'B0CYM3WSHX', imageUrl: componentImageUrls['B0CYM3WSHX'], detail: '2× 16 GB · DDR5 · AMD EXPO', icon: MemoryStick },
  b850: { category: 'Mainboard', name: 'MSI B850 Gaming Plus WiFi AM5 ATX Motherboard', asin: 'B0DPKV94MX', imageUrl: componentImageUrls['B0DPKV94MX'], detail: 'ATX · AM5 · DDR5 · Wi-Fi 7', icon: CircuitBoard },
  x3d: { category: 'Prozessor', name: 'AMD Ryzen 7 9800X3D Desktop Processor', asin: 'B0DKFMSMYK', imageUrl: componentImageUrls['B0DKFMSMYK'], detail: '8 Kerne · 3D V-Cache · AM5 · kein Kühler enthalten', icon: Cpu },
  cooler: { category: 'CPU-Kühler', name: 'Thermalright Peerless Assassin 120 SE', asin: 'B0B53B1BLS', imageUrl: componentImageUrls['B0B53B1BLS'], detail: 'AM5-kompatibel · Doppelturm · 155 mm hoch', icon: Fan },
  rm850: { category: 'Netzteil', name: 'CORSAIR RM850e (2025) ATX 3.1 850W', asin: 'B0DMTN5WLB', imageUrl: componentImageUrls['B0DMTN5WLB'], detail: '850 W · vollmodular · 12V-2x6', icon: Zap },
  case4000: { category: 'Gehäuse', name: 'CORSAIR 4000D AIRFLOW ATX Mid-Tower', asin: 'B08C7BGV3D', imageUrl: componentImageUrls['B08C7BGV3D'], detail: 'ATX / Micro-ATX · CPU-Kühler bis 170 mm · GPU bis 360 mm', icon: Package },
} satisfies Record<string, BuildPart>

const gamingBuilds: GamingBuild[] = [
  {
    id: 'budget', title: '1080p Gaming-PC · Budget', tier: 'AM4 BUDGET · DDR4', target: '1080p · 1440p-fähig', summary: 'Günstiger Einstieg: AM4-Plattform mit DDR4-Speicher, weil DDR4-Kits bei Amazon deutlich günstiger als DDR5 sind – das freie Budget steckt in der Grafikkarte.', color: 'lime', budgetFrom: 1000, resolutions: ['1080p', '1440p'],
    compatibility: ['Ryzen 5 5600 und B550M: AM4-Sockel, Wraith-Stealth-Kühler liegt bei', 'DDR4-3600 statt DDR5: deutlich günstiger bei Amazon, volle Unterstützung durch B550', 'RTX 5060 mit 8 GB braucht nur einen 8-Pin-Anschluss – 650 W reichen', 'Micro-ATX-Board passt in das ATX-Gehäuse'],
    parts: [
      { category: 'Prozessor', name: 'AMD Ryzen 5 5600 Prozessor (6 Kerne/12 Threads, 65W, AM4 Sockel, Bis zu 4.4 Ghz max boost, wraith stealth Kühler)', asin: 'B09VCHR1VH', imageUrl: componentImageUrls['B09VCHR1VH'], detail: '6 Kerne · AM4 · Kühler enthalten', icon: Cpu },
      { category: 'Mainboard', name: 'GIGABYTE B550M AORUS Elite Mainboard – AMD Ryzen 5000 CPUs, Micro-ATX', asin: 'B08BN8VD23', imageUrl: componentImageUrls['B08BN8VD23'], detail: 'Micro-ATX · AM4 · DDR4 · PCIe 4.0 M.2', icon: CircuitBoard },
      { category: 'Arbeitsspeicher', name: 'Patriot Viper Steel DDR4 32GB (2 x 16GB) 3600MHz', asin: 'B088KSRW4S', imageUrl: componentImageUrls['B088KSRW4S'], detail: '2× 16 GB · DDR4-3600 · günstiger als DDR5', icon: MemoryStick },
      sharedParts.ssd,
      { category: 'Grafikkarte', name: 'ASUS Prime GeForce RTX 5060 8GB GDDR7 OC Edition Gaming Grafikkarte', asin: 'B0CSFMYN1W', imageUrl: componentImageUrls['B0CSFMYN1W'], detail: '8 GB GDDR7 · 1080p-Gaming · 1× 8-Pin', icon: CircuitBoard },
      { category: 'Netzteil', name: 'be quiet! Pure Power 12 650W PC Netzteil, 80 Plus Gold Effizienz, ATX 3.1', asin: 'B0DLH776YJ', imageUrl: componentImageUrls['B0DLH776YJ'], detail: '650 W · 80+ Gold · ATX 3.1', icon: Zap },
      sharedParts.case4000,
    ],
  },
  {
    id: 'balanced', title: '1440p Gaming-PC · Preis-Leistung', tier: 'AM5 STARTER', target: '1080p · 1440p', summary: 'Starker Einstieg mit aktueller AM5-Plattform und ausgewogener RTX-5070-Leistung.', color: 'cyan', budgetFrom: 1400, resolutions: ['1080p', '1440p'],
    compatibility: ['Ryzen 5 und B650M: AM5-Sockel', '32 GB DDR5-6000 mit AMD EXPO', 'ATX-Netzteil mit 750 W; mATX-Board passt ins ATX-Gehäuse'],
    parts: [
      { category: 'Prozessor', name: 'AMD Ryzen 5 7600 Processor', asin: 'B0BMQJWBDM', imageUrl: componentImageUrls['B0BMQJWBDM'], detail: '6 Kerne · AM5 · Wraith-Stealth-Kühler enthalten', icon: Cpu },
      { category: 'Mainboard', name: 'GIGABYTE B650M DS3H Motherboard', asin: 'B0BKL4JJD8', imageUrl: componentImageUrls['B0BKL4JJD8'], detail: 'Micro-ATX · AM5 · DDR5 · 2× M.2', icon: CircuitBoard },
      sharedParts.ddr5,
      sharedParts.ssd,
      { category: 'Grafikkarte', name: 'ASUS Dual GeForce RTX 5070 12GB GDDR7 OC Edition', asin: 'B0F8KJKC9Y', imageUrl: componentImageUrls['B0F8KJKC9Y'], detail: '12 GB GDDR7 · 1440p-Gaming · 249 mm Länge', icon: CircuitBoard },
      { category: 'Netzteil', name: 'be quiet! Pure Power 13 M 750W', asin: 'B0F9YYGDRZ', imageUrl: componentImageUrls['B0F9YYGDRZ'], detail: 'ATX 3.1 · 80+ Gold · 12V-2x6', icon: Zap },
      sharedParts.case4000,
    ],
  },
  {
    id: 'performance', title: '1440p Gaming-PC · Performance', tier: 'PERFORMANCE', target: '1440p · 4K-ready', summary: 'Mehr GPU-Reserven und ein aktueller Ryzen 5 für hohe Bildraten in WQHD.', color: 'violet', budgetFrom: 1900, resolutions: ['1080p', '1440p', '4k'],
    compatibility: ['Ryzen 5 9600X und B850: AM5-Sockel', '32 GB DDR5-6000 mit AMD EXPO', '850-W-ATX-3.1-Netzteil passend zur RTX 5070 Ti'],
    parts: [
      { category: 'Prozessor', name: 'AMD Ryzen 5 9600X Processor', asin: 'B0D6NN6TM7', imageUrl: componentImageUrls['B0D6NN6TM7'], detail: '6 Kerne · AM5 · kein Kühler enthalten', icon: Cpu },
      sharedParts.b850,
      sharedParts.ddr5,
      sharedParts.ssd,
      { category: 'Grafikkarte', name: 'ASUS Prime GeForce RTX 5070 Ti 16GB GDDR7 OC Edition', asin: 'B0DVGVZZYY', imageUrl: componentImageUrls['B0DVGVZZYY'], detail: '16 GB GDDR7 · 4K-ready · 2,5-Slot', icon: CircuitBoard },
      sharedParts.cooler,
      sharedParts.rm850,
      sharedParts.case4000,
    ],
  },
  {
    id: '4k', title: '4K Gaming-PC · Enthusiast', tier: '4K ENTHUSIAST', target: '4K · Ultra', summary: 'Ryzen 7 X3D und RTX 5080 für hohe Details und starke 4K-Leistung.', color: 'pink', budgetFrom: 2700, resolutions: ['1080p', '1440p', '4k'],
    compatibility: ['Ryzen 7 9800X3D und B850: AM5-Sockel', '32 GB DDR5-6000 mit AMD EXPO', '850-W-Netzteil erfüllt die RTX-5080-Empfehlung', 'ATX-Gehäuse bietet Platz für Karte und 155-mm-Kühler'],
    parts: [
      sharedParts.x3d,
      sharedParts.b850,
      sharedParts.ddr5,
      sharedParts.ssd,
      { category: 'Grafikkarte', name: 'MSI GeForce RTX 5080 16G Ventus 3X OC', asin: 'B0DT6NZ9V9', imageUrl: componentImageUrls['B0DT6NZ9V9'], detail: '16 GB GDDR7 · PCIe 5.0 · 4K-Gaming', icon: CircuitBoard },
      sharedParts.cooler,
      sharedParts.rm850,
      sharedParts.case4000,
    ],
  },
  {
    id: 'ultimate', title: '4K Gaming-PC · Maximum', tier: 'ULTIMATE', target: '4K · Maximum', summary: 'Das maximale Gaming-Setup mit Ryzen 7 X3D, RTX 5090, 1000-W-Netzteil und großem Airflow-Gehäuse.', color: 'violet', budgetFrom: 4200, resolutions: ['1080p', '1440p', '4k'],
    compatibility: ['Ryzen 7 9800X3D und B850: AM5-Sockel', '32 GB DDR5-6000 mit AMD EXPO', '1000-W-ATX-3.1-Netzteil für die RTX 5090', '5000D-Gehäuse mit bis zu 420 mm GPU-Freiraum'],
    parts: [
      sharedParts.x3d,
      sharedParts.b850,
      sharedParts.ddr5,
      sharedParts.ssd,
      { category: 'Grafikkarte', name: 'ASUS ROG Astral GeForce RTX 5090 32GB GDDR7', asin: 'B0DTHVWZ7K', imageUrl: componentImageUrls['B0DTHVWZ7K'], detail: '32 GB GDDR7 · 4K-Ultra · 3,8-Slot', icon: CircuitBoard },
      sharedParts.cooler,
      { category: 'Netzteil', name: 'be quiet! Pure Power 13 M 1000W', asin: 'B0F9YY3R57', imageUrl: componentImageUrls['B0F9YY3R57'], detail: '1000 W · ATX 3.1 · 12V-2x6', icon: Zap },
      { category: 'Gehäuse', name: 'CORSAIR 5000D AIRFLOW ATX Mid-Tower', asin: 'B08M49WW51', imageUrl: componentImageUrls['B08M49WW51'], detail: 'ATX · GPU bis 420 mm · großzügiger Airflow', icon: Package },
    ],
  },
]

const featuredMonitors: MonitorProduct[] = [
  { name: 'AOC Q27G4XF 27 Inch WQHD Gaming Monitor, 180Hz, Fast IPS Panel, 1ms GtG, HDR10, G-Sync Compatible, Height Adjustment, Black', asin: 'B0DCZF5X4P', imageUrl: 'https://cdn.sanity.io/images/hf5b3axp/production/c8378ffcb3084ec9feaedbb4a4d11eec14aed260-2000x2000.png?w=1200&fit=max&auto=format', brand: 'AOC · GAMING DISPLAY', spec: '27” · 2560 × 1440 · 180 Hz', resolution: '1440p', hz: 180, panel: 'IPS', badge: 'WQHD · 180 Hz', color: 'cyan', featured: true },
  { name: 'LG UltraGear™ 27GX790A-B.AEU QHD OLED Gaming-Monitor, 480Hz, AMD FreeSync™, DisplayHDR™ True Black 400, 2X HDMI 2.1, DisplayPort 2.1, Schwarz', asin: 'B0DYVNZR13', imageUrl: 'https://www.lg.com/content/dam/channel/wcms/de/monitor/27gx790a-b/gallery/ultragear-gaming-27gx790a-2025-gallery-basic-large.jpg', imageFallbackUrl: 'https://m.media-amazon.com/images/I/61Cz6Ga1g0L._AC_SX355_.jpg', brand: 'LG · ULTRAGEAR OLED', spec: '27” · QHD · OLED · 480 Hz', resolution: '1440p', hz: 480, panel: 'OLED', badge: 'OLED · 480 Hz', color: 'violet', featured: true },
  { name: 'ASUS ROG Swift 32 Inch 4K Mini LED Gaming Monitor (PG32UQXR) -UHD (3840 x 2160), 160Hz, 1ms, Fast IPS, Local Dimming, FreeSync Premium Pro, HDMI 2.1, DisplayPort 2.1 with DSC, Quantum Dot', asin: 'B0BZR6Z85K', imageUrl: 'https://dlcdnwebimgs.asus.com/files/media/B43D5AC4-7D8F-4843-920D-A8B1EC379965/v1/img/1x/kv/kv-pd.png', brand: 'ASUS · ROG SWIFT', spec: '32” · 3840 × 2160 · 160 Hz · Mini LED', resolution: '4k', hz: 160, panel: 'IPS', badge: '4K · Mini LED', color: 'pink', featured: true },
  { name: 'BenQ MOBIUZ EX240 Gaming Monitor (23.8 Inch IPS 165 Hz 1 ms HDR Compatible with 144 Hz)', asin: 'B0B79DGN71', imageUrl: 'https://image.benq.com/is/image/benqco/ex240-right45?$ResponsivePreset$', brand: 'BENQ · MOBIUZ', spec: '23,8” · 1920 × 1080 · 165 Hz · IPS', resolution: '1080p', hz: 165, panel: 'IPS', badge: 'Full HD · 165 Hz', color: 'lime', featured: true },
]

const resolutionLabel: Record<Resolution, string> = { '1080p': 'Full HD', '1440p': 'WQHD', '4k': '4K UHD' }
const monitorColors = ['cyan', 'violet', 'pink', 'lime']
const monitors: MonitorProduct[] = [
  ...featuredMonitors,
  ...amazonMonitorCatalog.filter((item) => !featuredMonitors.some((featured) => featured.asin === item.asin)).map((item, index) => ({
    name: item.name, asin: item.asin, imageUrl: item.imageUrl, brand: `${item.name.split(/\s+/)[0].toUpperCase()} · AMAZON`, spec: [item.size ? `${item.size}”` : null, resolutionLabel[item.resolution], `${item.hz} Hz`, item.panel].filter(Boolean).join(' · '), resolution: item.resolution, hz: item.hz, panel: item.panel, badge: `${resolutionLabel[item.resolution]} · ${item.hz} Hz`, color: monitorColors[index % monitorColors.length], featured: false,
  })),
]

const categoryIcons: Record<CatalogCategory, LucideIcon> = { Prozessor: Cpu, Grafikkarte: CircuitBoard, Arbeitsspeicher: MemoryStick, Mainboard: CircuitBoard, SSD: HardDrive, Netzteil: Zap, Gehäuse: Package, 'CPU-Kühler': Fan, Monitor: Monitor }
const categoryPlural: Record<CatalogCategory, string> = { Prozessor: 'Prozessoren', Grafikkarte: 'Grafikkarten', Arbeitsspeicher: 'RAM-Kits', Mainboard: 'Mainboards', SSD: 'SSDs', Netzteil: 'Netzteile', Gehäuse: 'Gehäuse', 'CPU-Kühler': 'CPU-Kühler', Monitor: 'Monitore' }
const componentCategories = catalogCategories.filter((category) => category !== 'Monitor')

const searchableProducts: SearchProduct[] = [
  ...gamingBuilds.flatMap((build) => build.parts.map((part) => ({ name: part.name, asin: part.asin, imageUrl: part.imageUrl, amazonSiteStripeHtml: part.amazonSiteStripeHtml, category: part.category, detail: part.detail }))),
  ...monitors.map((monitor) => ({ name: monitor.name, asin: monitor.asin, imageUrl: monitor.imageUrl, imageFallbackUrl: monitor.imageFallbackUrl, amazonSiteStripeHtml: monitor.amazonSiteStripeHtml, category: 'Monitor', detail: monitor.spec })),
  ...amazonComponentCatalog.map((item) => ({ name: item.name, asin: item.asin, imageUrl: item.imageUrl, category: item.category, detail: `${item.category} · Amazon-Katalog` })),
].filter((product, index, products) => products.findIndex((candidate) => candidate.asin === product.asin) === index)

const euro = (value: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
const normalize = (value: string) => value.toLocaleLowerCase('de-DE').replace(/[\s\-_]+/g, '')
const matchesQuery = (haystack: string, query: string) => {
  const target = normalize(haystack)
  return query.toLocaleLowerCase('de-DE').split(/\s+/).filter(Boolean).every((term) => target.includes(normalize(term)))
}
const PAGE_SIZE = 24

function ProductImage({ src, fallbackSrc, alt, className }: { src: string; fallbackSrc?: string; alt: string; className?: string }) {
  return <img className={className} src={src} alt={alt} loading="lazy" onError={(event) => { if (fallbackSrc && event.currentTarget.src !== fallbackSrc) event.currentTarget.src = fallbackSrc }} />
}

function AmazonPrice() {
  return <span className="amazon-price"><strong>Preis ansehen</strong><small>live auf Amazon.de</small></span>
}

function ShopLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="sponsored noopener noreferrer">{children}<ArrowUpRight aria-hidden="true" /></a>
}

function getSiteStripeIframeSrc(siteStripeHtml?: string) {
  const iframe = siteStripeHtml?.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/i)
  if (!iframe) return null

  try {
    const url = new URL(iframe[1].replaceAll('&amp;', '&'))
    return url.protocol === 'https:' && (url.hostname === 'amazon-adsystem.com' || url.hostname.endsWith('.amazon-adsystem.com') || url.hostname === 'www.amazon.de') ? url.toString() : null
  } catch {
    return null
  }
}

function AffiliateAction({ product, href, children, className = '' }: { product: { name: string; amazonSiteStripeHtml?: string }; href: string; children: ReactNode; className?: string }) {
  const iframeSrc = getSiteStripeIframeSrc(product.amazonSiteStripeHtml)
  if (iframeSrc) return <iframe className={`amazon-sitestripe-frame ${className}`} src={iframeSrc} title={`Amazon-Angebot: ${product.name}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation" />
  return <ShopLink className={className} href={href}>{children}</ShopLink>
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <div className="section-eyebrow"><span className="eyebrow-line" />{children}</div>
}

function ProductTile({ product, badge }: { product: SearchProduct; badge?: string }) {
  return <article className="product-card search-result-card"><div className="search-result-image"><ProductImage src={product.imageUrl} fallbackSrc={product.imageFallbackUrl} alt={product.name} />{badge && <span className="product-badge"><Sparkles /> {badge}</span>}</div><div className="search-result-copy"><span className="product-brand">{product.category}</span><h3>{product.name}</h3><p>{product.detail}</p><div className="search-result-footer"><AmazonPrice /><AffiliateAction className="shop-button amazon-shop-button" product={product} href={getAmazonAffiliateUrl(product)}>Bei Amazon ansehen</AffiliateAction></div></div></article>
}

export function TechRigStudio() {
  const [view, setView] = useState<View>('builder')
  const [budget, setBudget] = useState(5000)
  const [refreshRate, setRefreshRate] = useState(60)
  const [pcResolution, setPcResolution] = useState<Resolution | 'all'>('all')
  const [monitorResolution, setMonitorResolution] = useState<Resolution | 'all'>('all')
  const [panelType, setPanelType] = useState<PanelType>('Alle')
  const [sort, setSort] = useState<'value' | 'hz'>('value')
  const [catalogCategory, setCatalogCategory] = useState<CatalogCategory>('Prozessor')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [search, setSearch] = useState('')
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)
  const [saved, setSaved] = useState<string[]>([])
  useEffect(() => {
    if (!mobileSearchOpen) return
    mobileSearchInputRef.current?.focus({ preventScroll: true })
    if (search.trim() && window.matchMedia('(max-width: 620px)').matches) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [mobileSearchOpen, search])
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [search, catalogCategory, view, monitorResolution, panelType, refreshRate, sort])
  const searchResults = useMemo(() => {
    const query = search.trim()
    if (!query) return []
    return searchableProducts.filter((product) => matchesQuery(`${product.name} ${product.category} ${product.detail}`, query))
  }, [search])
  const catalogItems = useMemo(() => amazonComponentCatalog.filter((item) => item.category === catalogCategory), [catalogCategory])
  const eligibleBuilds = useMemo(() => gamingBuilds.filter((build) => build.budgetFrom <= budget && (pcResolution === 'all' || build.resolutions.includes(pcResolution))), [budget, pcResolution])
  const selectedBuild = eligibleBuilds[eligibleBuilds.length - 1]
  const shownMonitors = useMemo(() => {
    const items = monitors.filter((item) => item.hz >= refreshRate && (panelType === 'Alle' || item.panel === panelType) && (monitorResolution === 'all' || item.resolution === monitorResolution))
    return sort === 'hz' ? [...items].sort((a, b) => b.hz - a.hz) : items
  }, [monitorResolution, panelType, refreshRate, sort])
  const switchView = (next: View) => { setView(next); setSearch(''); setMobileSearchOpen(false) }
  const toggleSaved = (name: string) => setSaved((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name])
  const resetFilters = () => {
    setBudget(5000)
    setRefreshRate(60)
    setPcResolution('all')
    setMonitorResolution('all')
    setPanelType('Alle')
    setSort('value')
    setSearch('')
  }
  const resolutionOptions: { value: Resolution; label: string }[] = [{ value: '1080p', label: '1080p' }, { value: '1440p', label: '1440p' }, { value: '4k', label: '4K' }]
  const viewCopy: Record<View, { eyebrow: string; title: string; text: string }> = {
    builder: { eyebrow: 'KOMPATIBLE AMAZON-KOMPONENTEN', title: 'Dein Gaming-PC-Build.', text: 'Wähle Budget und Auflösung – die Empfehlung enthält nur zusammenpassende Bauteile. Bei kleinem Budget setzen wir auf DDR4, weil DDR5-Kits bei Amazon spürbar teurer sind.' },
    catalog: { eyebrow: 'AMAZON-KOMPONENTEN-KATALOG', title: 'Alle Komponenten bei Amazon.', text: `${amazonComponentCatalog.length} Prozessoren, Grafikkarten, RAM-Kits, Mainboards, SSDs, Netzteile, Gehäuse und Kühler mit Originaltitel und Produktbild.` },
    monitors: { eyebrow: 'AMAZON-MONITORE', title: 'Monitore bei Amazon.', text: `${monitors.length} Gaming-Monitore – gefiltert nach Bildrate, Panel und Auflösung. Highlights mit offiziellen Herstellerbildern.` },
  }
  const showMore = (total: number) => visibleCount < total && <div className="load-more-row"><span>{Math.min(visibleCount, total)} von {total} angezeigt</span><button className="load-more-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>Weitere anzeigen <ChevronDown /></button></div>

  return <main className={`techrig-shell${mobileSearchOpen && search.trim() ? ' mobile-search-active' : ''}`}>
    <header className={`site-header${mobileSearchOpen ? ' mobile-searching' : ''}`}>
      <a className="brand-lockup" href="#top" aria-label="TechRig Studio Startseite" onClick={() => switchView('builder')}><span className="brand-mark"><CircuitBoard /></span><span className="brand-wordmark">TECHRIG<span>STUDIO</span></span></a>
      <nav className="desktop-nav" aria-label="Hauptnavigation"><button className={view === 'builder' ? 'nav-link active' : 'nav-link'} onClick={() => switchView('builder')}>Gaming-PCs</button><button className={view === 'catalog' ? 'nav-link active' : 'nav-link'} onClick={() => switchView('catalog')}>Komponenten</button><button className={view === 'monitors' ? 'nav-link active' : 'nav-link'} onClick={() => switchView('monitors')}>Monitore</button></nav>
      <label className={`header-search${mobileSearchOpen ? ' mobile-search-open' : ''}`}><Search /><input ref={mobileSearchInputRef} aria-label="Produkte suchen" placeholder="Monitore & PC-Komponenten suchen …" value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label>
      <button className="mobile-search-button" aria-label={mobileSearchOpen ? 'Suche schließen' : 'Produkte suchen'} aria-expanded={mobileSearchOpen} onClick={() => setMobileSearchOpen((open) => !open)}>{mobileSearchOpen ? <X /> : <Search />}</button>
    </header>

    <section className="hero" id="top"><div className="hero-art" aria-hidden="true"><img src="/images/techrig-pc-hero.png" alt="" /></div><div className="hero-shade" /><div className="hero-content"><div className="hero-kicker"><span className="live-dot" /> DEIN SETUP. DEINE REGELN.</div><h1>Dein perfektes<br />Setup. <span>Dein Budget.</span></h1><p>Kompatible Gaming-PC-Komponenten, automatisch auf dein Budget abgestimmt – plus {searchableProducts.length} Komponenten und Monitore aus dem Amazon-Katalog, einzeln direkt verlinkt.</p><div className="hero-actions"><button className="button-primary" onClick={() => { switchView('builder'); document.getElementById('explorer')?.scrollIntoView({ behavior: 'smooth' }) }}>Amazon-Produkte ansehen <ArrowRight /></button><div className="hero-proof"><span className="proof-stars"><ShieldCheck /></span><span>Direkt zu Amazon verlinkt</span></div></div></div><div className="hero-note"><span className="hero-note-icon"><Sparkles /></span><span><strong>Originaltitel.</strong><br />Direkt bei Amazon.</span></div><div className="hero-index"><span>01</span><span className="index-rule" />03</div></section>

    <section className="explorer" id="explorer">
      <div className="mode-row"><div><Eyebrow>AMAZON-GAMING-PC BUILDER</Eyebrow><h2>{view === 'builder' ? 'Gaming-PCs, passend zu deinem Budget' : view === 'catalog' ? 'PC-Komponenten aus dem Amazon-Katalog' : 'Gaming-Monitore aus dem Amazon-Katalog'}</h2></div><span className="builder-mode-note">{view === 'builder' ? 'Komplette Builds · kompatible Einzelteile' : view === 'catalog' ? `${amazonComponentCatalog.length} Komponenten · ${componentCategories.length} Kategorien` : `${monitors.length} Monitore · live bei Amazon`}</span></div>
      {view !== 'catalog' && <div className="filter-panel" id="filters"><div className="filter-panel-heading"><div className="filter-icon"><SlidersHorizontal /></div><div><h3>{view === 'builder' ? 'Gaming-PC nach Budget konfigurieren' : 'Monitore filtern'}</h3><p>{view === 'builder' ? 'Der Regler wählt automatisch den stärksten vollständigen Komponenten-Build für deine Budgetklasse.' : 'Bildrate, Panel-Typ und Auflösung eingrenzen – die Liste aktualisiert sich sofort.'}</p></div><span className="filter-live"><span className="live-dot" /> {view === 'builder' ? 'BUILD-FINDER' : 'MONITOR-FINDER'}</span></div>
        <div className={`filter-grid ${view === 'monitors' ? 'monitor-filters' : 'pc-filters'}`}>
          {view === 'monitors' ? <>
            <div className="filter-control"><span className="field-label">Panel-Typ</span><div className="resolution-pills panel-pills" role="group" aria-label="Monitor-Paneltyp">{(['Alle', 'OLED', 'IPS', 'VA', 'TN'] as PanelType[]).map((panel) => <button key={panel} className={panelType === panel ? 'resolution-pill chosen' : 'resolution-pill'} aria-pressed={panelType === panel} onClick={() => setPanelType(panel)}>{panel}</button>)}</div></div>
            <div className="filter-control refresh-control"><div className="control-label-row"><label htmlFor="refresh-slider">Monitor Bildrate</label><span className="control-value">{refreshRate === 360 ? '360 Hz+' : `${refreshRate} Hz+`}</span></div><input id="refresh-slider" className="range-input cyan-range" type="range" min="60" max="360" step="30" value={refreshRate} onChange={(event) => setRefreshRate(Number(event.target.value))} style={{ '--range-progress': `${((refreshRate - 60) / 300) * 100}%` } as CSSProperties} /><div className="range-limits"><span>60 Hz</span><span>360 Hz+</span></div></div>
            <div className="filter-control resolution-control"><span className="field-label">Monitor-Auflösung</span><div className="resolution-pills" role="group" aria-label="Monitorauflösung"><button className={monitorResolution === 'all' ? 'resolution-pill chosen' : 'resolution-pill'} aria-pressed={monitorResolution === 'all'} onClick={() => setMonitorResolution('all')}>Alle</button>{resolutionOptions.map((option) => <button key={option.value} className={monitorResolution === option.value ? 'resolution-pill chosen' : 'resolution-pill'} aria-pressed={monitorResolution === option.value} onClick={() => setMonitorResolution(monitorResolution === option.value ? 'all' : option.value)}>{option.label}</button>)}</div></div>
          </> : <>
            <div className="filter-control budget-control"><div className="control-label-row"><label htmlFor="budget-slider">Budgetklasse</label><span className="budget-value">{euro(budget)}</span></div><input id="budget-slider" className="range-input" type="range" min="1000" max="5000" step="100" value={budget} onChange={(event) => setBudget(Number(event.target.value))} style={{ '--range-progress': `${((budget - 1000) / 4000) * 100}%` } as CSSProperties} /><div className="range-limits"><span>1.000 €</span><span>5.000 €</span></div></div>
            <div className="filter-control resolution-control"><span className="field-label">Auflösung</span><div className="resolution-pills" role="group" aria-label="Gewünschte PC-Auflösung"><button className={pcResolution === 'all' ? 'resolution-pill chosen' : 'resolution-pill'} aria-pressed={pcResolution === 'all'} onClick={() => setPcResolution('all')}>Alle</button>{resolutionOptions.map((option) => <button key={option.value} className={pcResolution === option.value ? 'resolution-pill chosen' : 'resolution-pill'} aria-pressed={pcResolution === option.value} onClick={() => setPcResolution(pcResolution === option.value ? 'all' : option.value)}>{option.label}</button>)}</div><span className="resolution-hint">4K zeigt passende Produkte</span></div>
          </>}
        </div>
        <div className="filter-footer"><span><ShieldCheck /> Unabhängig recherchiert · Preise live bei Amazon</span><button className="reset-filters" onClick={resetFilters}>Filter zurücksetzen <ArrowRight /></button></div>
      </div>}
      <div className="results-header"><div><Eyebrow>{viewCopy[view].eyebrow}</Eyebrow><h2>{viewCopy[view].title}</h2><p>{viewCopy[view].text}</p></div><div className="results-tools"><label className="results-search"><Search /><input aria-label="Monitore und PC-Komponenten durchsuchen" placeholder="Monitore & Komponenten suchen" value={search} onChange={(event) => setSearch(event.target.value)} /></label>{view === 'monitors' && <div className="sort-switch" role="group" aria-label="Sortierung"><button aria-pressed={sort === 'value'} className={sort === 'value' ? 'sort-active' : ''} onClick={() => setSort('value')}>Top Picks</button><button aria-pressed={sort === 'hz'} className={sort === 'hz' ? 'sort-active' : ''} onClick={() => setSort('hz')}>Bildrate <ChevronDown /></button></div>}</div></div>

      {search.trim() ? <section className="global-search-results" aria-live="polite"><div className="global-search-summary"><div><Eyebrow>PRODUKTSUCHE</Eyebrow><h3>{searchResults.length} Treffer für „{search}“</h3><p>Komponenten und Monitore aus unserem Amazon-Katalog. Die Amazon-Suche zeigt zusätzlich alle weiteren aktuellen Angebote.</p></div><div className="global-search-actions"><ShopLink className="global-search-shop-link" href={getAmazonAffiliateUrl({ name: search })}>Amazon-Suche: {search}</ShopLink><ShopLink className="global-search-shop-link" href={getAmazonAffiliateUrl({ name: `PC-Komponenten ${search}` })}>PC-Komponenten</ShopLink><ShopLink className="global-search-shop-link" href={getAmazonAffiliateUrl({ name: `Gaming-Monitore ${search}` })}>Monitore</ShopLink></div></div>{searchResults.length > 0 ? <><div className="product-grid search-result-grid">{searchResults.slice(0, visibleCount).map((product) => <ProductTile key={product.asin} product={product} />)}</div>{showMore(searchResults.length)}</> : <div className="empty-results"><Search /><h3>Keine Treffer im Katalog</h3><p>Die Amazon-Suche oben zeigt passende Angebote aus dem Live-Katalog.</p></div>}</section> : <>
      {view === 'builder' && (selectedBuild ? <section className="builder-layout" aria-label="Kompatibler Gaming-PC-Build">
        <article className="build-card">
          <div className="build-card-top"><div><span className="build-overline">{selectedBuild.tier} · BUDGET-EMPFEHLUNG</span><h3>{selectedBuild.title}</h3></div><span className="badge badge-cyan"><Sparkles /> {selectedBuild.target}</span></div>
          <div className="build-summary"><div className="build-total"><span>Budgetklasse</span><strong>ab {euro(selectedBuild.budgetFrom)}</strong><small>{selectedBuild.parts.length} Komponenten · aktuelle Preise direkt bei Amazon</small></div><div className="build-fit"><div className="fit-graphic"><span>{selectedBuild.parts.length}</span><small>TEILE</small></div><p>{selectedBuild.summary}</p></div></div>
          <div className="component-list">{selectedBuild.parts.map((part) => { const PartIcon = part.icon; return <div className="component-row" key={part.asin}><span className={`component-image ${part.category === 'Grafikkarte' ? 'gpu-image' : ''}`}><ProductImage src={part.imageUrl} alt={part.name} /></span><span className="component-copy"><span><PartIcon aria-hidden="true" /> {part.category}</span><strong title={part.name}>{part.name}</strong><small title={part.detail}>{part.detail}</small></span><span className="component-price"><AmazonPrice /></span><AffiliateAction className="amazon-link" product={part} href={getAmazonAffiliateUrl(part)}>Amazon ansehen</AffiliateAction></div> })}</div>
          <div className="build-card-bottom"><span><ShieldCheck /> Kompatibilität geprüft: Sockel, Speicher, Formfaktor und Netzteil</span><span>Einzelne Amazon-Links · Affiliate</span></div>
        </article>
        <aside className="builder-aside" aria-label="Build-Details"><section className="aside-card"><div className="aside-heading"><span className="aside-icon"><CircuitBoard /></span><div><span>TEILE PASSEN ZUSAMMEN</span><h3>Kompatibilitäts-Check</h3></div></div><ul className="compatibility-list">{selectedBuild.compatibility.map((note) => <li key={note}><ShieldCheck aria-hidden="true" />{note}</li>)}</ul><p className="aside-disclaimer"><ShieldCheck /> Wir zeigen keine geschätzten Preise – der aktuelle Preis und die Verfügbarkeit stehen beim jeweiligen Amazon-Angebot.</p></section><section className="aside-card build-picker"><div className="aside-heading"><span className="aside-icon"><Sparkles /></span><div><span>AUTOMATISCH AUSGEWÄHLT</span><h3>Leistungsstufen nach Budgetklasse</h3></div></div><div className="build-levels">{gamingBuilds.map((build) => <div className={selectedBuild.id === build.id ? 'build-level active' : 'build-level'} key={build.id} aria-current={selectedBuild.id === build.id ? 'step' : undefined}><span>ab {euro(build.budgetFrom)}</span><strong>{build.tier}</strong></div>)}</div></section></aside>
      </section> : <div className="empty-results build-empty"><Package /><h3>Für diesen Filter passt noch kein vollständiger Build</h3><p>Erhöhe die Budgetklasse oder ändere die Auflösung.</p><button onClick={() => { setBudget(5000); setPcResolution('all') }}>Kompletten Build anzeigen <ArrowRight /></button></div>)}

      {view === 'catalog' && <section className="catalog-section" aria-label="Komponenten-Katalog"><div className="catalog-categories" role="tablist" aria-label="Komponenten-Kategorie">{componentCategories.map((category) => { const Icon = categoryIcons[category]; const count = amazonComponentCatalog.filter((item) => item.category === category).length; return <button key={category} role="tab" aria-selected={catalogCategory === category} className={catalogCategory === category ? 'catalog-tab active' : 'catalog-tab'} onClick={() => setCatalogCategory(category)}><Icon aria-hidden="true" />{category}<span>{count}</span></button> })}</div><div className="product-grid search-result-grid">{catalogItems.slice(0, visibleCount).map((item) => <ProductTile key={item.asin} product={{ name: item.name, asin: item.asin, imageUrl: item.imageUrl, category: item.category, detail: 'Originaltitel · Amazon.de' }} />)}</div>{showMore(catalogItems.length)}<div className="all-monitors-cta"><span>Noch mehr {categoryPlural[catalogCategory]} gesucht?</span><ShopLink href={getAmazonAffiliateUrl({ name: `${catalogCategory} PC` })}>Alle {categoryPlural[catalogCategory]} bei Amazon durchsuchen</ShopLink></div></section>}

      {view === 'monitors' && <><section className="product-grid monitor-grid" aria-label="Monitor Empfehlungen">{shownMonitors.slice(0, visibleCount).map((item) => <article className={`product-card monitor-card product-${item.color}`} key={item.asin}><div className="monitor-art"><ProductImage className="monitor-photo" src={item.imageUrl} fallbackSrc={item.imageFallbackUrl} alt={item.name} /><span className="product-badge"><Sparkles /> {item.badge}</span><button className={saved.includes(item.name) ? 'save-button saved' : 'save-button'} aria-label={`${saved.includes(item.name) ? 'Aus Merkliste entfernen' : 'Zur Merkliste hinzufügen'}: ${item.name}`} aria-pressed={saved.includes(item.name)} onClick={() => toggleSaved(item.name)}><Heart fill={saved.includes(item.name) ? 'currentColor' : 'none'} /></button><span className="screen-resolution">{resolutionLabel[item.resolution].toUpperCase()} · {item.hz} HZ</span></div><div className="product-info"><span className="product-brand">{item.brand} · {item.panel}</span><h3>{item.name}</h3><p className="product-spec">{item.spec}</p><div className="product-listing-note">{item.featured ? 'Herstellerbild · Originaltitel aus dem Amazon-Angebot' : 'Amazon-Produkt · Originaltitel aus dem Angebot'}</div><div className="product-card-footer"><AmazonPrice /><AffiliateAction className="shop-button amazon-shop-button" product={item} href={getAmazonAffiliateUrl(item)}>Bei Amazon ansehen / kaufen</AffiliateAction></div></div></article>)}{shownMonitors.length === 0 && <div className="empty-results"><Monitor /><h3>Kein Monitor passt zu den Filtern</h3><p>Wähle eine andere Auflösung, Panel-Art oder Bildrate.</p><button onClick={() => { setMonitorResolution('all'); setPanelType('Alle'); setRefreshRate(60); setSearch('') }}>Filter zurücksetzen <ArrowRight /></button></div>}</section>{showMore(shownMonitors.length)}<div className="all-monitors-cta"><span>Weitere Modelle gesucht?</span><ShopLink href={getAmazonAffiliateUrl({ name: 'Gaming Monitor' })}>Alle Monitore bei Amazon durchsuchen</ShopLink></div></>}
      </>}

    </section>

    <section className="trust-strip" aria-label="Unsere Werte"><div><span className="trust-icon"><ShieldCheck /></span><span><strong>Unabhängig gedacht</strong><small>Unsere Picks, deine Entscheidung.</small></span></div><span className="trust-divider" /><div><span className="trust-icon"><Zap /></span><span><strong>Originalnamen</strong><small>Wie im Amazon-Angebot gelistet.</small></span></div><span className="trust-divider" /><div><span className="trust-icon"><Heart /></span><span><strong>Von Hardware-Fans</strong><small>Mit Liebe zum Detail ausgewählt.</small></span></div></section>
    <footer className="site-footer"><a className="brand-lockup footer-brand" href="#top"><span className="brand-mark"><CircuitBoard /></span><span className="brand-wordmark">TECHRIG<span>STUDIO</span></span></a><div className="footer-disclosure"><p className="affiliate-note">*Es gilt der aktuelle Preis auf Amazon.de zum Zeitpunkt des Kaufs, inkl. MwSt., zzgl. Versand. Angaben ohne Gewähr.</p><small>Diese Website zeigt bewusst keine geschätzten Preise: Preis und Verfügbarkeit werden ausschließlich beim jeweiligen Amazon-Angebot angezeigt. Die Budgetklasse ist eine Einordnung des Builds, kein Preisversprechen. Jeder Produkt-Link führt mit der Partner-ID techrigstudio-21 direkt zur hinterlegten ASIN. Für Käufe über Affiliate-Links können wir eine Provision erhalten.</small></div><div className="footer-links"><a href="mailto:kontakt@techrig.studio?subject=Impressum">Impressum</a><a href="mailto:datenschutz@techrig.studio?subject=Datenschutz">Datenschutz</a><span>© 2026 TechRig Studio</span></div></footer>
  </main>
}

export default TechRigStudio
