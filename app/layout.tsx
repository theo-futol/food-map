import { Fraunces, Instrument_Sans } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';

const serif = Fraunces({ subsets: ['latin'], style: ['normal', 'italic'], axes: ['opsz', 'SOFT'], variable: '--serif' });
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--sans' });

export const metadata = { title: 'MoumouneFood' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
