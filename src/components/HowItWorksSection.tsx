import { ArrowUpRight, Copy, Layers, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { buildWhatsappSupportUrl, sanitizeWhatsappPhone } from '../utils/storeLogic';

interface HowItWorksSectionProps {
  gatewayNamesText?: string;
  whatsappNumber?: string;
  whatsappDisplay?: string;
  supportHours?: string;
}

const REVEAL_EASE = [0.22, 1, 0.36, 1] as const;

export function HowItWorksSection({
  gatewayNamesText = 'Easypaisa or Binance',
  whatsappNumber,
  whatsappDisplay,
  supportHours = 'Support 24/7',
}: HowItWorksSectionProps) {
  const steps = [
    {
      num: '01',
      icon: Layers,
      title: 'Choose Pro Subscription & Click Buy Now',
      body: 'Select your Pro Subscription or any tool by category and click Buy Now to view payment options.',
    },
    {
      num: '02',
      icon: Copy,
      title: 'Copy Account & Send Payment',
      body: `Copy our ${gatewayNamesText} account details inside the popup and transfer your payment — no form filling required.`,
    },
    {
      num: '03',
      icon: MessageCircle,
      title: 'Send Screenshot Directly on WhatsApp',
      body: 'Tap the direct WhatsApp button to send your payment screenshot within 15 minutes for instant account activation.',
    },
  ];

  const hasWa = Boolean(whatsappNumber && sanitizeWhatsappPhone(whatsappNumber));
  const supportWaUrl = hasWa && whatsappNumber
    ? buildWhatsappSupportUrl(
        whatsappNumber,
        'Assalam o Alaikum! I need help choosing a Pro Subscription or requesting a custom tool on ToolCraft.'
      )
    : '';

  return (
    <section
      id="how-it-works"
      className="scroll-mt-28 py-16 sm:py-20 bg-white border-t border-[#E5E8EE]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, ease: REVEAL_EASE }}
          className="max-w-2xl"
        >
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#059669]">
            How It Works
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#0B0D11]">
            Simple Payment &amp; 15-Minute Activation
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#4B5563] leading-relaxed">
            Fast manual verification with {gatewayNamesText} screenshots directly on WhatsApp.
          </p>
        </motion.div>

        <div className="relative mt-10">
          <div
            aria-hidden="true"
            className="hidden md:block pointer-events-none absolute top-11 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#E5E8EE] via-[#A7F3D0] to-[#E5E8EE]"
          />
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: idx * 0.09, ease: REVEAL_EASE }}
                whileHover={{ y: -4 }}
                className="group relative rounded-2xl bg-[#F8F9FB] border border-[#E5E8EE] p-6 sm:p-7 transition-colors duration-200 hover:bg-white hover:border-[#B8C2CE] hover:shadow-[0_20px_40px_-22px_rgba(11,13,17,0.18)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E5E8EE] shadow-[0_2px_6px_-2px_rgba(11,13,17,0.06)] inline-flex items-center justify-center text-[#059669] group-hover:bg-[#0B0D11] group-hover:text-white group-hover:border-[#0B0D11] transition-colors duration-200">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono tabular-nums text-xs font-bold tracking-wider text-[#9CA3AF] group-hover:text-[#059669] transition-colors">
                    STEP {step.num}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-lg font-bold tracking-[-0.015em] text-[#0B0D11] leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-sm text-[#4B5563] leading-relaxed">{step.body}</p>
              </motion.div>
            );
          })}
          </div>
        </div>

        {hasWa && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.48, delay: 0.12, ease: REVEAL_EASE }}
            className="mt-8 rounded-2xl bg-[#F6F7F9] border border-[#E5E8EE] px-6 py-5 sm:px-7 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <p className="font-display text-base sm:text-lg font-bold tracking-[-0.01em] text-[#0B0D11]">
                Need a custom tool or help before paying?
              </p>
              <p className="mt-1 text-xs sm:text-sm text-[#4B5563]">
                Message our direct desk on WhatsApp{whatsappDisplay ? ` (${whatsappDisplay})` : ''} ·{' '}
                <span className="font-semibold text-[#059669]">{supportHours}</span>
              </p>
            </div>

            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={supportWaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-semibold text-white bg-[#059669] rounded-xl shadow-[0_10px_22px_-8px_rgba(5,150,105,0.55)] hover:bg-[#047857] transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
              <ArrowUpRight className="w-4 h-4" />
            </motion.a>
          </motion.div>
        )}
      </div>
    </section>
  );
}
