interface HowItWorksSectionProps {
  gatewayNamesText?: string;
}

export function HowItWorksSection({
  gatewayNamesText = 'Easypaisa or Binance',
}: HowItWorksSectionProps) {
  const steps = [
    {
      num: '01.',
      title: 'Choose Pro Subscription & Click Buy Now',
      body: 'Select your Pro Subscription or any tool by category and click Buy Now to view payment options.',
    },
    {
      num: '02.',
      title: 'Pay & Upload Screenshot',
      body: `Send payment via ${gatewayNamesText}, then attach your payment screenshot to unlock the Submit button.`,
    },
    {
      num: '03.',
      title: 'Send Screenshot on WhatsApp (15 Min)',
      body: 'After submitting, send the payment screenshot to our WhatsApp number within 15 minutes for instant account activation.',
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-28 py-16 sm:py-20 bg-white border-t border-[#E5E8EE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[#059669]">
            How It Works
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-[-0.02em] text-[#0B0D11]">
            Simple Payment &amp; 15-Minute Activation
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-[#4B5563] leading-relaxed">
            Fast manual verification with {gatewayNamesText} screenshots on WhatsApp.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.num}
              className="group rounded-2xl bg-[#F8F9FB] border border-[#E5E8EE] p-6 sm:p-7 transition-all duration-200 hover:bg-white hover:border-[#C5CCD6] hover:shadow-[0_18px_36px_-22px_rgba(11,13,17,0.16)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono tabular-nums text-sm font-bold text-[#059669]">
                  {step.num}
                </span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-[#E5E8EE] group-hover:bg-[#A7F3D0] transition-colors"
                />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold tracking-[-0.01em] text-[#0B0D11] leading-snug">
                {step.title}
              </h3>
              <p className="mt-2.5 text-sm text-[#4B5563] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
