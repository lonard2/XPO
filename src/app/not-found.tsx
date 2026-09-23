import Link from "next/link";
import "./globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 font-sans antialiased">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 ring-1 ring-blue-500/20">
            <span className="font-mono font-bold text-xl">404</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The requested resource could not be found within the XPO MICE ecosystem.
            </p>
          </div>
          <div>
            <Link
              href="/en"
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Return to Discovery
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
