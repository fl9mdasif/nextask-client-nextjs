'use client';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-6">
      <p className="text-center text-xs text-[#71717a]">
        Built by{' '}
        <a
          href="https://dev-mdasif-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors duration-200 hover:text-[#8b5cf6] hover:underline underline-offset-2"
        >
          Md Asif Al Azad
        </a>
      </p>
    </footer>
  );
}
