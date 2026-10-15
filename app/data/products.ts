import type { SiteLocale } from './site'

/**
 * The MiLabs product catalogue: the single source of truth for every product
 * shown on the site. Sections render from this list, so adding a product
 * means adding an entry here (plus its assets); no section component changes.
 *
 * Content rule: describe only verified capabilities. Do not add features,
 * integrations, numbers or claims the product team has not confirmed.
 * See CONTENT_ASSET_GUIDE.md.
 */

export type ProductStatus =
  /** Product website is public. */
  | 'live'
  /** Product is announced; its website may not be public yet. */
  | 'launching'
  /** Kept in data for preparation, not rendered anywhere. */
  | 'draft'

export interface ProductCapability {
  title: string
  text: string
}

export interface ProductCopy {
  /** Short category label, e.g. "Business management". */
  category: string
  /** One-sentence value proposition. */
  tagline: string
  /** Two to three sentences: what it does and which problem it addresses. */
  summary: string
  /** Who it helps. */
  audience: string
  /** Three or four verified capabilities, shown in this order. */
  capabilities: ProductCapability[]
  /** Accessible description of the product visual (alt text). */
  visualAlt: string
  /** Product SEO metadata (reserved for dedicated product pages on this site). */
  seo: { title: string; description: string }
}

/**
 * Product visual. Either a coded, localized interface illustration
 * (`illustration`) or a real screenshot (`image`). Both render inside the
 * same 16:10 frame, so swapping one for the other changes neither the layout
 * nor the animations.
 */
export type ProductVisual =
  | {
      kind: 'illustration'
      /** Component in components/products/placeholders/. */
      component: 'MiDeskPreview' | 'MiFinPreview'
      /** Illustrations are always provisional: a caption marks them as not being screenshots. */
      provisional: true
    }
  | {
      kind: 'image'
      /**
       * Base path under /public without size suffix or extension, e.g.
       * "/images/products/midesk/overview". Expects `-960.webp`, `-1600.webp`
       * and `-1600.png` variants (see CONTENT_ASSET_GUIDE.md).
       */
      src: string
      width: number
      height: number
      /** True while the image is a mockup rather than a real product screenshot. */
      provisional: boolean
    }

/**
 * Live demo shown inside the landing page (in an iframe dialog). Set it once
 * a product has a public demo; leave it undefined to hide the demo button.
 * The product site must allow being framed by milabs.ir
 * (`Content-Security-Policy: frame-ancestors https://milabs.ir`) and the
 * demo must work without a login. See CONTENT_ASSET_GUIDE.md.
 */
export interface ProductDemo {
  /** Demo URL per language (may be the same URL). Must be https. */
  url: Record<SiteLocale, string>
  /** Viewport the demo is designed for. 'desktop' frames it in a browser window, 'mobile' in a phone. */
  device: 'desktop' | 'mobile'
}

export interface Product {
  /** Stable identifier used for anchors and asset folders. */
  id: string
  /** Brand name. Always starts with "Mi" and is never translated. */
  name: string
  url: string
  status: ProductStatus
  /** Product accent colors (placeholder values until the product brand is final). */
  accent: {
    base: string
    soft: string
    deep: string
    contrast: string
  }
  /** Product mark. Until official logos exist, a typographic placeholder SVG is used. */
  logo: { src: string; provisional: boolean }
  visual: ProductVisual
  /** Live demo inside the landing page. Undefined until the product's demo is public. */
  demo?: ProductDemo
  copy: Record<SiteLocale, ProductCopy>
}

export const products: Product[] = [
  {
    id: 'midesk',
    name: 'MiDesk',
    url: 'https://midesk.ir/',
    status: 'launching',
    accent: { base: '#2f54eb', soft: '#e4e9fd', deep: '#1c3197', contrast: '#ffffff' },
    logo: { src: '/images/products/placeholders/midesk-logo-placeholder.svg', provisional: true },
    visual: { kind: 'illustration', component: 'MiDeskPreview', provisional: true },
    copy: {
      en: {
        category: 'Business management',
        tagline: 'The day-to-day running of a company, on one desk.',
        summary:
          'MiDesk brings projects and tasks, company finances and HR into one workspace. The people running a business spend less time chasing information across spreadsheets, chats and folders, and more time acting on it.',
        audience: 'Founders, managers and operations teams: the people who keep a company running.',
        capabilities: [
          { title: 'Projects and tasks', text: 'Plan projects, assign work, and see what is moving and what is stuck.' },
          { title: 'Company finances', text: 'Keep track of the money coming into and going out of the business.' },
          { title: 'People and HR', text: 'Keep team and HR records in the same place as the work itself.' },
          { title: 'Organized operations', text: 'Turn everyday routines into a structure the whole team can follow.' },
        ],
        visualAlt:
          'Illustration of a business workspace: a task board grouped by status, a finance summary and a team list.',
        seo: {
          title: 'MiDesk: projects, finances and HR in one place',
          description:
            'MiDesk is a business management platform for projects and tasks, company finances and human resources.',
        },
      },
      fa: {
        category: 'مدیریت کسب‌وکار',
        tagline: 'کارهای روزمره‌ی شرکت، روی یک میز.',
        summary:
          'MiDesk پروژه‌ها و وظایف، امور مالی شرکت و منابع انسانی را در یک فضای کاری کنار هم می‌آورد. گردانندگان کسب‌وکار وقت کمتری را صرف پیدا کردن اطلاعات در فایل‌ها، گفت‌وگوها و پوشه‌های پراکنده می‌کنند و زودتر سراغ تصمیم و اقدام می‌روند.',
        audience: 'بنیان‌گذاران، مدیران و تیم‌های عملیات؛ کسانی که چرخ شرکت را می‌چرخانند.',
        capabilities: [
          {
            title: 'پروژه‌ها و وظایف',
            text: 'پروژه‌ها را برنامه‌ریزی کنید، کارها را تقسیم کنید و ببینید چه چیزی پیش می‌رود و کجا کار گیر کرده است.',
          },
          { title: 'امور مالی شرکت', text: 'ورود و خروج پول کسب‌وکار را همیشه زیر نظر داشته باشید.' },
          { title: 'منابع انسانی', text: 'اطلاعات تیم و امور پرسنلی را کنار خودِ کارها نگه دارید.' },
          {
            title: 'نظم در عملیات',
            text: 'روال‌های روزمره را به ساختاری روشن تبدیل کنید که همه‌ی تیم بتوانند دنبالش کنند.',
          },
        ],
        visualAlt:
          'تصویری نمایشی از یک فضای کاری سازمانی: تخته‌ی وظایف بر اساس وضعیت، خلاصه‌ی مالی و فهرست اعضای تیم.',
        seo: {
          title: 'MiDesk؛ پروژه، امور مالی و منابع انسانی در یک‌جا',
          description: 'MiDesk پلتفرم مدیریت کسب‌وکار برای پروژه و وظایف، امور مالی شرکت و منابع انسانی است.',
        },
      },
    },
  },
  {
    id: 'mifin',
    name: 'MiFin',
    url: 'https://mifin.ir/',
    status: 'launching',
    accent: { base: '#0b8a5a', soft: '#dcf1e6', deep: '#065a3b', contrast: '#ffffff' },
    logo: { src: '/images/products/placeholders/mifin-logo-placeholder.svg', provisional: true },
    visual: { kind: 'illustration', component: 'MiFinPreview', provisional: true },
    copy: {
      en: {
        category: 'Personal and shared finance',
        tagline: 'Know where your money goes, and who owes whom.',
        summary:
          'MiFin keeps track of your income and expenses, lets you split costs with friends, family or flatmates in shared groups, and offers suggestions that help you understand your spending habits.',
        audience: 'Anyone managing their own money, or sharing costs with other people.',
        capabilities: [
          { title: 'Income and expenses', text: 'Record what comes in and what goes out, and see the month at a glance.' },
          {
            title: 'Shared groups',
            text: 'Create a group for a trip, a home or an event, and add shared costs as they happen.',
          },
          { title: 'Clear settlements', text: 'See who paid what and settle up without awkward arithmetic.' },
          {
            title: 'Financial suggestions',
            text: 'Get suggestions that help you understand your habits and spend more deliberately.',
          },
        ],
        visualAlt:
          'Illustration of a personal finance view: a monthly income and expense summary, a shared group with balances and a suggestion card.',
        seo: {
          title: 'MiFin: personal finances and shared expenses',
          description:
            'MiFin helps you track income and expenses, split costs in shared groups and understand your financial habits.',
        },
      },
      fa: {
        category: 'مالی شخصی و هزینه‌های مشترک',
        tagline: 'حساب خرج‌هایتان دستتان باشد، حساب دُنگ‌ها هم.',
        summary:
          'MiFin دخل و خرجتان را ثبت می‌کند، امکان می‌دهد با دوستان، خانواده یا هم‌خانه‌ها گروه بسازید و هزینه‌های مشترک را تقسیم کنید، و با پیشنهادهایی کمک می‌کند عادت‌های مالی‌تان را بهتر بشناسید.',
        audience: 'هر کسی که پول خودش را مدیریت می‌کند یا هزینه‌هایی را با دیگران شریک است.',
        capabilities: [
          { title: 'درآمد و هزینه', text: 'دخل و خرجتان را ثبت کنید و تصویر کلی ماه را یک‌جا ببینید.' },
          {
            title: 'گروه‌های مشترک',
            text: 'برای سفر، خانه یا یک مراسم گروه بسازید و خرج‌های مشترک را همان لحظه ثبت کنید.',
          },
          {
            title: 'تسویه‌حساب روشن',
            text: 'ببینید چه کسی چقدر پرداخته و بدون حساب‌وکتاب‌های دردسرساز تسویه کنید.',
          },
          {
            title: 'پیشنهادهای مالی',
            text: 'پیشنهادهایی بگیرید که کمک می‌کنند عادت‌هایتان را بشناسید و آگاهانه‌تر خرج کنید.',
          },
        ],
        visualAlt:
          'تصویری نمایشی از یک داشبورد مالی شخصی: خلاصه‌ی درآمد و هزینه‌ی ماه، یک گروه مشترک با سهم اعضا و یک کارت پیشنهاد.',
        seo: {
          title: 'MiFin؛ مدیریت مالی شخصی و تقسیم هزینه‌های مشترک',
          description:
            'MiFin کمک می‌کند درآمد و هزینه را ثبت کنید، خرج‌های گروهی را تقسیم کنید و عادت‌های مالی‌تان را بشناسید.',
        },
      },
    },
  },
]

/** Products rendered on the site, in display order. */
export const visibleProducts = products.filter((p) => p.status !== 'draft')

/** Host name without protocol, e.g. "midesk.ir". */
export function productHost(p: Product) {
  return new URL(p.url).host
}
