import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale, MessageSquare, Upload, FolderOpen, Clock,
  FileSearch, Shield, TrendingUp, Settings, LogOut,
  Menu, X, Bot, User, Plus, Edit3
} from 'lucide-react';
import { useAuth } from '@/shared/hooks';
import { CommandDialog, CommandInput, CommandList, CommandGroup, CommandItem, CommandShortcut } from './ui/command';

const navItems = [
  { icon: MessageSquare, label: 'AI Chat', path: '/app/chat' },
  { icon: Upload, label: 'Upload Document', path: '/app/upload' },
  { icon: FolderOpen, label: 'My Documents', path: '/app/documents' },
  { icon: Clock, label: 'Chat History', path: '/app/history' },
  { icon: FileSearch, label: 'Contract Analysis', path: '/app/contract-analysis' },
  { icon: Shield, label: 'Tenant Rights', path: '/app/tenant-rights' },
  { icon: TrendingUp, label: 'Labor Law', path: '/app/labor-law' },
];

// Bottom nav only shows the most important 4 items on mobile
const mobileNavItems = [
  { icon: MessageSquare, label: 'Chat', path: '/app/chat' },
  { icon: Upload, label: 'Upload', path: '/app/upload' },
  { icon: FolderOpen, label: 'Documents', path: '/app/documents' },
  { icon: Clock, label: 'History', path: '/app/history' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  useGlobalShortcuts(setCommandOpen, navigate);

  const isActive = (path: string) => {
    const pathname = location?.pathname ?? '';
    if (!pathname || !path) return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={{
      width: mobile ? '100%' : 260,
      background: '#171717',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px' }} onClick={() => navigate('/app/chat')}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Scale size={16} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
              EthioLegal <span style={{ color: '#10b981' }}>AI</span>
            </div>
            <div style={{ fontSize: 10, color: '#a3a3a3' }}>Ethiopian Law</div>
          </div>
        </div>
        
        {/* New Chat Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/app/chat')}
          style={{ 
            width: '100%', 
            marginTop: 12,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 8, 
            padding: '10px', 
            borderRadius: 8, 
            border: '1px solid rgba(255,255,255,0.2)', 
            background: 'transparent',
            cursor: 'pointer', 
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          className="hover:bg-white/10">
          <Plus size={16} />
          New Chat
        </motion.button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <motion.button 
              key={item.label}
              whileHover={{ x: 2 }}
              onClick={() => { navigate(item.path); if (mobile) setMobileSidebarOpen(false); }}
              style={{
                width: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '10px 12px', 
                borderRadius: 8, 
                border: 'none', 
                cursor: 'pointer', 
                textAlign: 'left', 
                transition: 'all 0.2s',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: active ? '#ffffff' : '#d4d4d4',
                fontSize: 14,
                fontWeight: active ? 500 : 400,
              }}
              className={!active ? 'hover:bg-white/5' : ''}>
              <item.icon size={18} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '8px' }}>
        <button onClick={() => navigate('/app/settings')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', color: '#d4d4d4', fontSize: 14 }}
          className="hover:bg-white/5 transition-colors">
          <Settings size={18} style={{ flexShrink: 0 }} />
          <span>Settings</span>
        </button>
        
        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginTop: 4, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={14} color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: '#ffffff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: 11, color: '#a3a3a3' }}>Free Plan</div>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#d4d4d4', padding: 4 }}
            className="hover:text-red-400 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#000000', color: '#f1f5f9', overflow: 'hidden' }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 40 }} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, zIndex: 50 }}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <button onClick={() => setMobileSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#71717a' }}>
                    <X size={20} />
                  </button>
                </div>
                <Sidebar mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <div className="hidden lg:flex" style={{ height: '100%' }}>
          <Sidebar />
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#000000' }}>
          <Outlet />
        </main>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(10,10,10,0.98)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '8px 0', paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          {mobileNavItems.map(item => {
            const active = isActive(item.path);
            return (
              <button key={item.label} onClick={() => navigate(item.path)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 16px', borderRadius: 10, minWidth: 60 }}>
                <div style={{ position: 'relative' }}>
                  {active && (
                    <motion.div layoutId="activeTab"
                      style={{ position: 'absolute', inset: -6, borderRadius: 10, background: 'rgba(99,102,241,0.15)' }} />
                  )}
                  <item.icon size={20} color={active ? '#a5b4fc' : '#71717a'} style={{ position: 'relative', zIndex: 1 }} />
                </div>
                <span style={{ fontSize: 10, color: active ? '#a5b4fc' : '#71717a', fontWeight: active ? 600 : 400 }}>{item.label}</span>
              </button>
            );
          })}
          {/* More button */}
          <button onClick={() => setMobileSidebarOpen(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 16px', borderRadius: 10, minWidth: 60 }}>
            <Menu size={20} color="#71717a" />
            <span style={{ fontSize: 10, color: '#71717a' }}>More</span>
          </button>
        </div>
      </div>

      {/* Command palette (Ctrl/Cmd+K) */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen} title="Commands" description="Quick actions">
        <CommandInput placeholder="Type a command or search... (e.g. 'new chat')" />
        <CommandList>
          <CommandGroup heading="Navigate">
            <CommandItem onSelect={() => { navigate('/app/chat'); setCommandOpen(false); }}>Open AI Chat<CommandShortcut>C</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { navigate('/app/upload'); setCommandOpen(false); }}>Upload Document<CommandShortcut>U</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { navigate('/app/documents'); setCommandOpen(false); }}>My Documents<CommandShortcut>D</CommandShortcut></CommandItem>
            <CommandItem onSelect={() => { navigate('/app/history'); setCommandOpen(false); }}>Chat History<CommandShortcut>H</CommandShortcut></CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Keyboard shortcut hint */}
      <div className="hidden lg:block" style={{ position: 'fixed', bottom: 20, left: 20, zIndex: 10 }}>
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 1 }}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            background: 'rgba(10,10,10,0.9)', 
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.05)', 
            borderRadius: 8, 
            padding: '8px 12px',
            fontSize: 12,
            color: '#71717a'
          }}>
          <span>Press</span>
          <kbd style={{ 
            background: 'rgba(255,255,255,0.05)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            borderRadius: 4, 
            padding: '2px 6px',
            fontSize: 11,
            fontWeight: 600,
            color: '#a1a1aa'
          }}>⌘K</kbd>
          <span>for commands</span>
        </motion.div>
      </div>
    </div>
  );
}

// Global keyboard shortcuts: open command palette and quick chat focus
function useGlobalShortcuts(setCommandOpen: (v: boolean) => void, navigate: any) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd+K opens command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      // Quick focus / open chat when pressing '/'
      if (e.key === '/' && (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        navigate('/app/chat');
        setTimeout(() => (document.querySelector('textarea') as HTMLTextAreaElement | null)?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandOpen, navigate]);
}
