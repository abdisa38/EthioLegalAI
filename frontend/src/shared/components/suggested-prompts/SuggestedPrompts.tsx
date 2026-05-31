import { motion } from 'motion/react';
import { Sparkles, FileText, Shield, TrendingUp, Scale } from 'lucide-react';

interface Prompt {
  id: string;
  title: string;
  description: string;
  icon: any;
  prompt: string;
  category: string;
}

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  category?: 'general' | 'contract' | 'tenant' | 'labor' | 'all';
}

/**
 * Suggested prompts component
 * Beautiful prompt suggestions like ChatGPT
 */
export const SuggestedPrompts = ({
  onSelectPrompt,
  category = 'all',
}: SuggestedPromptsProps) => {
  const prompts: Prompt[] = [
    {
      id: '1',
      title: 'Explain Employment Contract',
      description: 'Understand your employment agreement',
      icon: FileText,
      prompt: 'Can you explain the key terms in my employment contract?',
      category: 'contract',
    },
    {
      id: '2',
      title: 'Tenant Rights',
      description: 'Know your rights as a tenant',
      icon: Shield,
      prompt: 'What are my rights as a tenant in Ethiopia?',
      category: 'tenant',
    },
    {
      id: '3',
      title: 'Labor Law Question',
      description: 'Ask about Ethiopian labor laws',
      icon: TrendingUp,
      prompt: 'What are the working hour regulations in Ethiopian labor law?',
      category: 'labor',
    },
    {
      id: '4',
      title: 'Contract Review',
      description: 'Get help reviewing a contract',
      icon: Scale,
      prompt: 'Can you help me review this contract for any risky clauses?',
      category: 'contract',
    },
    {
      id: '5',
      title: 'Legal Advice',
      description: 'General legal guidance',
      icon: Sparkles,
      prompt: 'I need legal advice about a dispute with my landlord',
      category: 'general',
    },
    {
      id: '6',
      title: 'Document Analysis',
      description: 'Analyze a legal document',
      icon: FileText,
      prompt: 'Can you analyze this document and highlight important points?',
      category: 'general',
    },
  ];

  const filteredPrompts =
    category === 'all'
      ? prompts
      : prompts.filter((p) => p.category === category);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Sparkles size={16} />
        <span className="text-sm font-medium">Suggested prompts</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredPrompts.map((prompt, index) => (
          <motion.button
            key={prompt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectPrompt(prompt.prompt)}
            className="group relative p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-xl text-left transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-sky-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-blue-500/30 group-hover:to-sky-500/30 transition-colors">
                <prompt.icon size={18} className="text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-slate-100 mb-1 group-hover:text-blue-300 transition-colors">
                  {prompt.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {prompt.description}
                </p>
              </div>
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-sky-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};
