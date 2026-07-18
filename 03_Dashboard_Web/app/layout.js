import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Concurso Público de Méritos 2026 — Universidad del Quindío',
  description: 'Panel público de seguimiento al Concurso Público de Méritos Docente de Carrera 2026 de la Universidad del Quindío.',
  openGraph: {
    title: 'Concurso Público de Méritos 2026 — UQ',
    description: 'Estadísticas públicas del concurso de méritos docente.',
    locale: 'es_CO',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
