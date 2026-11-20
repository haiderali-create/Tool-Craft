import { motion } from 'motion/react';
import { buildWhatsappSupportUrl, sanitizeWhatsappPhone } from '../utils/storeLogic';

interface FloatingWhatsAppButtonProps {
  whatsappNumber: string;
  storeName?: string;
}

export function FloatingWhatsAppButton({
  whatsappNumber,
  storeName = 'ToolCraft',
}: FloatingWhatsAppButtonProps) {
  const cleanWa = sanitizeWhatsappPhone(whatsappNumber);
  if (!cleanWa) return null;

  const href = buildWhatsappSupportUrl(
    whatsappNumber,
    `Assalam o Alaikum! I need quick help regarding ${storeName} Pro Subscriptions.`
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.82, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-10 right-4 sm:bottom-14 sm:right-6 z-40 flex items-center gap-3"
    >
      <div className="relative tc-wa-float">
        {/* Soft expanding green radar ripple behind the button */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366]/45 tc-wa-ripple"
        />

        <motion.a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="floating-whatsapp-button"
          aria-label="Chat on WhatsApp"
          title="Chat on WhatsApp"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 420, damping: 22 }}
          className="group relative inline-flex items-center justify-center w-14 h-14 sm:w-[58px] sm:h-[58px] rounded-full bg-[#25D366] text-white shadow-[0_16px_34px_-8px_rgba(37,211,102,0.75)] ring-[9px] ring-[#25D366]/20 hover:bg-[#1EBE5D] hover:ring-[#25D366]/30 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#059669]"
        >
          {/* Subtle desktop hover tooltip */}
          <span
            aria-hidden="true"
            className="pointer-events-none hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-[#0B0D11] text-white text-xs font-semibold shadow-lg whitespace-nowrap absolute right-[calc(100%+16px)] opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 border border-white/10"
          >
            Chat on WhatsApp
          </span>

          {/* Official WhatsApp Logo SVG */}
          <svg
            viewBox="0 0 32 32"
            fill="currentColor"
            aria-hidden="true"
            className="w-7 h-7 sm:w-[30px] sm:h-[30px] transition-transform duration-200 group-hover:rotate-[-8deg] group-hover:scale-105"
          >
            <path d="M16.004 3.2c-7.058 0-12.8 5.742-12.8 12.8 0 2.256.59 4.458 1.71 6.398L3.1 29.02l6.814-1.786a12.74 12.74 0 0 0 6.09 1.552h.006c7.056 0 12.796-5.742 12.796-12.8 0-3.42-1.332-6.634-3.75-9.052A12.716 12.716 0 0 0 16.004 3.2Zm0 23.424h-.004a10.6 10.6 0 0 1-5.406-1.48l-.388-.23-4.044 1.06 1.08-3.942-.252-.404a10.562 10.562 0 0 1-1.622-5.628c0-5.862 4.772-10.632 10.64-10.632 2.842 0 5.512 1.108 7.52 3.118a10.564 10.564 0 0 1 3.112 7.52c-.002 5.864-4.774 10.618-10.636 10.618Zm5.834-7.96c-.32-.16-1.89-.934-2.184-1.04-.292-.106-.506-.16-.72.16-.214.32-.826 1.04-1.012 1.254-.186.214-.374.24-.694.08-.32-.16-1.35-.498-2.572-1.586-.95-.848-1.592-1.894-1.78-2.214-.186-.32-.02-.494.14-.654.144-.144.32-.374.48-.56.16-.186.214-.32.32-.534.106-.214.054-.4-.026-.56-.08-.16-.72-1.734-.986-2.374-.26-.624-.524-.54-.72-.55l-.614-.01c-.214 0-.56.08-.854.4-.294.32-1.12 1.094-1.12 2.668s1.146 3.094 1.306 3.308c.16.214 2.256 3.444 5.466 4.83.764.33 1.36.526 1.824.674.766.244 1.464.21 2.016.126.614-.092 1.89-.774 2.156-1.52.266-.748.266-1.388.186-1.52-.08-.134-.294-.214-.614-.374Z" />
          </svg>
        </motion.a>
      </div>
    </motion.div>
  );
}
