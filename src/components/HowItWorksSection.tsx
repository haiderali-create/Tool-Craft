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
    <section id="how-it-works" className="py-12 sm:py-14 bg-white border-t border-[#E2E5EA]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0F12]">
            Simple Payment &amp; 15-Minute Activation
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#525866]">
            Fast manual verification with {gatewayNamesText} screenshots on WhatsApp.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.num} className="pt-5 border-t border-[#E2E5EA]">
              <span className="font-mono tabular-nums text-xs font-semibold text-[#059669]">
                {step.num}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold text-[#0D0F12]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-[#525866] leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
