import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale,
  MessageSquare,
  Upload,
  Shield,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Check,
  X,
} from 'lucide-react';

interface WelcomeOnboardingProps {
  onComplete: () => void;
  userName?: string;
}

/**
 * Welcome onboarding flow
 * Beautiful multi-step introduction like modern SaaS apps
 */
export const WelcomeOnboarding = ({
  onComplete,
  userName = 'there',
}: WelcomeOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Welcome to EthioLegal AI, ${userName}! 👋`,
      description:
        'Your AI-powered legal assistant for Ethiopian law. Let me show you around.',
      icon: Scale,
      gradient: 'from-blue-500 to-sky-500',
    },
    {
      title: 'Chat with AI Legal Assistant',
      description:
        'Ask questions about Ethiopian laws in plain language. Get instant answers in Amharic, Oromo, or English.',
      icon: MessageSquare,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Upload & Analyze Documents',
      description:
        'Upload contracts and legal documents. Our AI will analyze them and highlight risky clauses.',
      icon: Upload,
      gradient: 'from-sky-500 to-blue-300',
    },
    {
      title: 'Know Your Rights',
      description:
        'Get specialized help with tenant rights, labor laws, and contract reviews.',
      icon: Shield,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'You\'re All Set! 🎉',
      description:
        'Start exploring EthioLegal AI. Remember, this is educational information, not official legal advice.',
      icon: Sparkles,
      gradient: 'from-yellow-500 to-orange-500',
    },
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-[#0d1124] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
        >
          <X size={18} className="text-slate-400" />
        </button>

        {/* Content */}
        <div className="p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="mb-8"
              >
                <div
                  className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-lg`}
                >
                  <currentStepData.icon size={48} className="text-white" />
                </div>
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-slate-100 mb-4"
              >
                {currentStepData.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-slate-400 leading-relaxed max-w-lg mx-auto"
              >
                {currentStepData.description}
              </motion.p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-12 pb-12">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                animate={{
                  width: index === currentStep ? 32 : 8,
                  backgroundColor:
                    index === currentStep
                      ? 'rgb(37, 99, 235)'
                      : index < currentStep
                      ? 'rgb(34, 197, 94)'
                      : 'rgba(255, 255, 255, 0.1)',
                }}
                className="h-2 rounded-full transition-all"
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-slate-400 hover:text-slate-300 transition-colors"
            >
              Skip
            </button>

            <motion.button
              onClick={handleNext}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
              {isLastStep ? (
                <>
                  <Check size={20} />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
