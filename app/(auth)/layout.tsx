import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center font-serif text-2xl font-bold text-neutral-900"
        >
          Faire-part<span className="text-brand-600">.</span>
        </Link>
        <div className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
