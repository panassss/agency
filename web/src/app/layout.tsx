import type { Metadata, Viewport } from 'next';
import { Onest, Roboto_Serif } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Providers from '@/components/layout/Providers';
import ScrollTop from '@/components/layout/ScrollTop';
import { THEME_KEY } from '@/lib/theme';
import './globals.css';

const robotoSerif = Roboto_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-roboto-serif',
  display: 'swap',
});

// DM Sans from the mockup has no Cyrillic glyphs; Onest is the closest geometric sans with full Ukrainian support.
const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-onest',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Canvix — агенція комплексного розвитку бізнесу',
    template: '%s | Canvix',
  },
  description:
    'Canvix — агенція комплексного розвитку бізнесу: стратегія, маркетинг, дизайн, веб-розробка та IT-консалтинг для зростання вашої компанії.',
  openGraph: { type: 'website', locale: 'uk_UA', siteName: 'Canvix' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0c0c0c',
};

// Applies the saved theme before the first paint to avoid a light/dark flash.
const themeScript = `try{var t=localStorage.getItem('${THEME_KEY}');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="uk"
      className={`${robotoSerif.variable} ${onest.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>
          <Header />
          {children}
          <Footer />
          <ScrollTop />
        </Providers>
      </body>
    </html>
  );
}
