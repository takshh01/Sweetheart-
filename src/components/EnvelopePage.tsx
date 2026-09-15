import { motion } from 'motion/react';
import { ArrowRight, Check } from 'lucide-react';

interface EnvelopePageProps {
  onSelectCard: (card: 'memories' | 'why_love' | 'letter') => void;
  onNext: () => void;
  viewed: {
    memories: boolean;
    why_love: boolean;
    letter: boolean;
  };
}

interface EnvelopeCardItem {
  id: 'memories' | 'why_love' | 'letter';
  title: string;
  subtitle: string;
  badge: string;
  viewed: boolean;
}

export function EnvelopePage({ onSelectCard, onNext, viewed }: EnvelopePageProps) {
  const cards: EnvelopeCardItem[] = [
    {
      id: 'memories',
      title: 'Our Memories',
      subtitle: 'A photograph of us that I hold close',
      badge: '💌',
      viewed: viewed.memories,
    },
    {
      id: 'why_love',
      title: 'Why I Love You',
      subtitle: 'The little things that mean everything',
      badge: '💌',
      viewed: viewed.why_love,
    },
    {
      id: 'letter',
      title: 'My Letter',
      subtitle: 'Words from my heart to yours',
      badge: '💌',
      viewed: viewed.letter,
    },
  ];

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-2 mb-8"
      >
        <span className="text-2xl">💌</span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1C1917] font-normal tracking-tight">
          Choose an envelope
        </h1>
        <p className="text-[#78716C] text-sm sm:text-base font-light">
          Explore the little things I love about US.
        </p>
      </motion.div>

      {/* The 3 Interactive Envelope Cards */}
      <div className="w-full space-y-4">
        {cards.map((card, index) => (
          <motion.button
            key={card.id}
            id={`envelope-card-${card.id}`}
            onClick={() => onSelectCard(card.id)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.12 }}
            whileHover={{ scale: 1.015, y: -2 }}
            whileTap={{ scale: 0.985 }}
            className="w-full group text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8C1D30]/40 rounded-2xl"
            aria-label={`Open ${card.title}`}
          >
            <div className="relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-[#F3D8DC] p-5 sm:p-6 shadow-[0_8px_25px_rgba(107,29,47,0.06)] hover:shadow-[0_12px_32px_rgba(107,29,47,0.12)] transition-all duration-300 flex items-center justify-between">
              {/* Envelope flap aesthetic styling */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#FCE7EB]/50 to-transparent pointer-events-none rounded-tr-2xl" />

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#FFF5F6] border border-[#F3D8DC] flex items-center justify-center text-xl shadow-inner group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                  {card.badge}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl sm:text-2xl text-[#1C1917] group-hover:text-[#8C1D30] transition-colors">
                      {card.title}
                    </h3>
                    {card.viewed && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#8C1D30] bg-[#FCE7EB] px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" />
                        <span>Viewed</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#78716C] font-light mt-0.5">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              {/* Action Chevron / Indicator */}
              <div className="text-[#8C1D30]/40 group-hover:text-[#8C1D30] group-hover:translate-x-1 transition-all">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Next Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 w-full flex justify-center"
      >
        <button
          id="envelope-next-button"
          onClick={onNext}
          className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-base font-medium text-white bg-[#8C1D30] hover:bg-[#6B1D2F] shadow-[0_8px_25px_rgba(140,29,48,0.25)] hover:shadow-[0_12px_30px_rgba(140,29,48,0.35)] transition-all duration-200 active:scale-95 cursor-pointer"
        >
          <span>NEXT</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>
    </div>
  );
}
