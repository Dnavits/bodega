// Forzar renderizado dinámico en todas las páginas de admin
// porque requieren cookies/sesión en tiempo real.
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-bottle-dark text-white px-6 py-4">
        <p className="font-display font-bold">Bodega Dnavits · Admin</p>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
