import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  MessageSquare,
  Upload,
  FileText,
  Settings,
  LogOut,
  Command,
  ArrowRight,
  Clock,
  Star,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/shared/hooks';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: any;
  action: () => void;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Command Palette - Keyboard-first navigation
 * Similar to Notion's command menu
 */
export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const commands: CommandItem[] = [
    {
      id: 'new-chat',
      title: 'New Chat',
      description: 'Start a new AI conversation',
      icon: MessageSquare,
      action: () => navigate('/app/chat'),
      category: 'Actions',
      keywords: ['chat', 'new', 'conversation', 'ai'],
    },
    {
      id: 'upload',
      title: 'Upload Document',
      description: 'Upload and analyze a legal document',
      icon: Upload,
      action: () => navigate('/app/upload'),
      category: 'Actions',
      keywords: ['upload', 'document', 'file', 'analyze'],
    },
    {
      id: 'documents',
      title: 'My Documents',
      description: 'View all your documents',
      icon: FileText,
      action: () => navigate('/app/documents'),
      category: 'Navigation',
      keywords: ['documents', 'files', 'library'],
    },
    {
      id: 'history',
      title: 'Chat History',
      description: 'View past conversations',
      icon: Clock,
      action: () => navigate('/app/history'),
      category: 'Navigation',
      keywords: ['history', 'past', 'conversations'],
    },
    {
      id: 'tenant',
      title: 'Tenant Rights Assistant',
      description: 'Get help with tenant rights',
      icon: Star,
      action: () => navigate('/app/tenant-rights'),
      category: 'Assistants',
      keywords: ['tenant', 'rights', 'rental', 'landlord'],
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Manage your account',
      icon: Settings,
      action: () => navigate('/app/settings'),
      category: 'Navigation',
      keywords: ['settings', 'preferences', 'account'],
    },
    {
      id: 'logout',
      title: 'Log Out',
      description: 'Sign out of your account',
      icon: LogOut,
      action: () => {
        logout();
        navigate('/login');
      },
      category: 'Account',
      keywords: ['logout', 'signout', 'exit'],
    },
  ];

  const filteredCommands = commands.filter((cmd) => {
    const searchLower = search.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(searchLower) ||
      cmd.description?.toLowerCase().includes(searchLower) ||
      cmd.keywords.some((k) => k.includes(searchLower))
    );
  });

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[20vh]"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#0d1124] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search input */}
          <div className="flex items-center gap-3 p-4 border-b border-white/10">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search commands..."
              autoFocus
              className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 outline-none text-lg"
            />
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Command size={12} />
              <span>K</span>
            </div>
          </div>

          {/* Commands list */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {Object.entries(groupedCommands).map(([category, items]) => (
              <div key={category} className="mb-4">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {category}
                </div>
                <div className="space-y-1">
                  {items.map((cmd, index) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <motion.button
                        key={cmd.id}
                        onClick={() => {
                          cmd.action();
                          onClose();
                        }}
                        whileHover={{ scale: 1.01 }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-indigo-500/20 border border-indigo-500/30'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-indigo-500/20'
                              : 'bg-white/5'
                          }`}
                        >
                          <cmd.icon
                            size={18}
                            className={
                              isSelected ? 'text-indigo-400' : 'text-slate-400'
                            }
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium text-slate-100">
                            {cmd.title}
                          </div>
                          {cmd.description && (
                            <div className="text-xs text-slate-500">
                              {cmd.description}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <ArrowRight size={16} className="text-indigo-400" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}

            {filteredCommands.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Search size={48} className="mx-auto mb-3 opacity-30" />
                <p>No commands found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/5 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Esc</kbd>
                Close
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
