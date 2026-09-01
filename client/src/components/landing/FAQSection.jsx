import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import GlassCard from '../common/GlassCard';

const faqs = [
  {
    q: 'How does Worklyn match me with nearby workers?',
    a: 'Worklyn uses a smart score-based system taking into account your GPS location, worker distance, skills, rating, completed jobs, and real-time availability to provide instant recommendations.',
  },
  {
    q: 'Are workers on Worklyn background-verified?',
    a: 'Yes! Every worker submits identity proof (Aadhaar/PAN/Govt ID), address proof, and skill certificates during registration. Admin approval is mandatory before any worker can accept bookings.',
  },
  {
    q: 'How do payments work for booked services?',
    a: 'Payment is settled directly between you and the worker after service completion. Transparent pricing and hourly rates are displayed upfront on every worker profile.',
  },
  {
    q: 'Can I cancel or reschedule a service booking?',
    a: 'Yes, you can manage or cancel your bookings anytime directly from your Customer Dashboard. Cancellation details and timelines are recorded transparently.',
  },
  {
    q: 'How do I register as a worker on Worklyn?',
    a: 'Click "Become a Worker" on the navbar, complete the registration form with your profession, experience, portfolio, and identity documents. Once admin verifies your application, your profile becomes active.',
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-20 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-semibold text-accent-gold uppercase tracking-widest font-outfit">
            Help Center
          </span>
          <h2 className="text-3xl font-sora font-bold text-text-primary mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <GlassCard
                key={faq.q}
                goldBorder={isOpen}
                className="cursor-pointer transition-all"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-sora font-semibold text-sm text-text-primary">
                    {faq.q}
                  </h3>
                  <ChevronDown
                    className={`w-4 h-4 text-accent-gold transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {isOpen && (
                  <p className="text-xs text-text-secondary leading-relaxed mt-3 pt-3 border-t border-gray-100 animate-fade-in">
                    {faq.a}
                  </p>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
