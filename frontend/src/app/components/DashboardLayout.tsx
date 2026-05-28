import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale, LayoutDashboard, MessageSquare, Upload, FolderOpen, Clock,
  FileSearch, Shield, TrendingUp, Bookmark, Settings, LogOut,
  Bell, Globe, ChevronDown, Menu, X, Bot, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: MessageSquare, label: 'AI Chat', path: '/app/chat' },
  { icon: Upload, label: 'Upload Document', path: '/app/upload' },
  { icon: FolderOpen, label: 'My Documents', path: '/app/documents' },
  { icon: Clock, label: 'Chat History', path: '/app/history' },
  { icon: FileSearch, label: 'Contract Analysis', path: '/app/contract-analysis' },
  { icon: Shield, label: 'Tenant Rights', path: '/app/tenant-rights' },
  { icon: TrendingUp, label: 'Labor Law', path: '/app/labor-law' },
  { icon: Bookmark, label: 'Saved Explanations', path: '/app/history' },
];

// Bottom nav only shows the most important 4 items on mobile
const mobileNavItems = [
  { icon: LayoutDashboard, label: 'Home', path: '/app' },
  { icon: MessageSquare, label: 'AI Chat', path: '/app/chat' },
  { icon: Upload, label: 'Upload', path: '/app/upload' },
  { icon: FolderOpen, label: 'Documents', path: '/app/documents' },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [lang, setLang] = useState('EN');
  const [aiFloatOpen, setAiFloatOpen] = useState(false);
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    const pathname = location?.pathname ?? '';
    if (!pathname || !path) return false;
    if (path === '/app') return pathname === '/app';
    return pathname.startsWith(path);
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div style={{
      width: mobile ? '100%' : sidebarOpen ? 240 : 64,
      background: '#0d1124',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 68 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}>
            <Scale size={18} color="white" />
          </div>
          {(sidebarOpen || mobile) && (
            <span style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap' }}>
              EthioLegal <span style={{ color: '#10b981' }}>AI</span>
            </span>
          )}
        </div>
        {!mobile && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}>
            <Menu size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <button key={item.label}
              onClick={() => { navigate(item.path); if (mobile) setMobileSidebarOpen(false); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen || mobile ? '10px 12px' : '10px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: active ? '#818cf8' : '#64748b',
                justifyContent: sidebarOpen || mobile ? 'flex-start' : 'center',
              }}
              className={!active ? 'hover:bg-white/5 hover:text-slate-300' : ''}>
              <item.icon size={18} style={{ flexShrink: 0 }} />
              {(sidebarOpen || mobile) && <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, whiteSpace: 'nowrap' }}>{item.label}</span>}
              {active && (sidebarOpen || mobile) && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', marginLeft: 'auto' }} />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button onClick={() => navigate('/app/settings')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen || mobile ? '10px 12px' : '10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#64748b', justifyContent: sidebarOpen || mobile ? 'flex-start' : 'center' }}
          className="hover:bg-white/5 hover:text-slate-300">
          <Settings size={18} style={{ flexShrink: 0 }} />
          {(sidebarOpen || mobile) && <span style={{ fontSize: 14 }}>Settings</span>}
        </button>
        <button onClick={() => { logout(); navigate('/login'); }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: sidebarOpen || mobile ? '10px 12px' : '10px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent', color: '#64748b', justifyContent: sidebarOpen || mobile ? 'flex-start' : 'center' }}
          className="hover:bg-white/5 hover:text-slate-300">
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {(sidebarOpen || mobile) && <span style={{ fontSize: 14 }}>Log out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#080b18', color: '#f1f5f9', overflow: 'hidden' }}>
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'spring', damping: 25 }}
              style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 260, zIndex: 50 }}>
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0d1124' }}>
                <div style={{ padding: '16px', display: 'flex', justifyContent: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={() => setMobileSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={20} />
                  </button>
                </div>
                <Sidebar mobile />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Top navbar */}
      <header style={{ background: 'rgba(13,17,36,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="lg:hidden" onClick={() => setMobileSidebarOpen(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <Menu size={22} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 14px' }}>
            <Bot size={14} color="#6366f1" />
            <span style={{ fontSize: 13, color: '#64748b' }}>AI Legal Assistant</span>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Language switcher */}
          <button onClick={() => setLang(lang === 'EN' ? 'አማ' : lang === 'አማ' ? 'ORM' : 'EN')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', cursor: 'pointer', color: '#94a3b8', fontSize: 13 }}>
            <Globe size={14} />{lang}<ChevronDown size={12} />
          </button>

          {/* Notifications */}
          <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
            <Bell size={16} color="#64748b" />
            <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#6366f1', border: '2px solid #0d1124' }} />
          </button>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '6px 12px', cursor: 'pointer' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} color="white" />
            </div>
            <span className="hidden sm:block" style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{user?.name || 'User'}</span>
            <ChevronDown size={12} color="#475569" />
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Desktop sidebar */}
        <div className="hidden lg:flex" style={{ height: '100%' }}>
          <Sidebar />
        </div>

        {/* Main content */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#080b18' }}>
          <Outlet />
        </main>
      </div>

      {/* ── Floating AI Button (all screens) ── */}
      <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 60 }} className="lg:bottom-6">
        <AnimatePresence>
          {aiFloatOpen && (
            <motion.div initial={{ opacity: 0, y: 12, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.92 }}
              style={{ position: 'absolute', bottom: 64, right: 0, width: 240, background: '#0d1124', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
              <div style={{ padding: '14px 16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={14} color="white" />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>EthioLegal AI</div>
                    <div style={{ fontSize: 10, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} /> Online · Ready
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { icon: MessageSquare, label: 'Ask a Legal Question', path: '/app/chat', color: '#6366f1' },
                  { icon: Upload, label: 'Analyze a Document', path: '/app/upload', color: '#8b5cf6' },
                  { icon: Shield, label: 'Know Tenant Rights', path: '/app/tenant-rights', color: '#10b981' },
                  { icon: TrendingUp, label: 'Check Labor Rights', path: '/app/labor-law', color: '#06b6d4' },
                ].map(item => (
                  <button key={item.label} onClick={() => { navigate(item.path); setAiFloatOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 8, background: 'transparent', border: 'none', cursor: 'pointer', width: '100%' }}
                    className="hover:bg-white/5 transition-colors">
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: `${item.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <item.icon size={12} color={item.color} />
                    </div>
                    <span style={{ fontSize: 13, color: '#cbd5e1', textAlign: 'left' }}>{item.label}</span>
                  </button>
                ))}
              </div>
              <div style={{ padding: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button onClick={() => { navigate('/app/chat'); setAiFloatOpen(false); }}
                  style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Bot size={14} /> Open AI Chat
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating button itself */}
        <motion.button
          onClick={() => setAiFloatOpen(!aiFloatOpen)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          animate={aiFloatOpen ? {} : {
            boxShadow: ['0 0 0 0 rgba(99,102,241,0.4)', '0 0 0 12px rgba(99,102,241,0)', '0 0 0 0 rgba(99,102,241,0)'],
          }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
          <AnimatePresence mode="wait">
            {aiFloatOpen
              ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={20} color="white" /></motion.div>
              : <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><Bot size={20} color="white" /></motion.div>
            }
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <div className="lg:hidden" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(13,17,36,0.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '8px 0', paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
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
                  <item.icon size={20} color={active ? '#818cf8' : '#475569'} style={{ position: 'relative', zIndex: 1 }} />
                </div>
                <span style={{ fontSize: 10, color: active ? '#818cf8' : '#475569', fontWeight: active ? 600 : 400 }}>{item.label}</span>
              </button>
            );
          })}
          {/* More button */}
          <button onClick={() => setMobileSidebarOpen(true)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 16px', borderRadius: 10, minWidth: 60 }}>
            <Menu size={20} color="#475569" />
            <span style={{ fontSize: 10, color: '#475569' }}>More</span>
          </button>
        </div>
      </div>
    </div>
  );
}
