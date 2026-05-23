import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Upload, FileSearch, Globe, Shield, TrendingUp,
  FileText, Clock, ArrowRight, Zap, AlertTriangle, CheckCircle,
  Bell, Search, X, Star, BarChart2, Activity, Brain, Sparkles,
  ChevronUp, ChevronRight, BookOpen, Users, Award, Lightbulb,
  Calendar, Target, Eye
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis } from 'recharts';

const usageData = [
  { day: 'Mon', queries: 4, docs: 1 }, { day: 'Tue', queries: 7, docs: 2 },
  { day: 'Wed', queries: 5, docs: 0 }, { day: 'Thu', queries: 12, docs: 3 },
  { day: 'Fri', queries: 9, docs: 2 }, { day: 'Sat', queries: 6, docs: 1 },
  { day: 'Sun', queries: 10, docs: 2 },
];

const categoryData = [
  { name: 'Labor', value: 31 }, { name: 'Tenant', value: 24 },
  { name: 'Contract', value: 18 }, { name: 'Civil', value: 12 }, { name: 'Other', value: 15 },
];

const quickActions = [
  { icon: MessageSquare, label: 'Ask Legal Question', desc: 'Chat in your language', color: '#6366f1', path: '/app/chat', hot: true },
  { icon: Upload, label: 'Upload Contract', desc: 'Analyze any PDF', color: '#8b5cf6', path: '/app/upload' },
  { icon: FileSearch, label: 'Contract Analysis', desc: 'Detect risks & clauses', color: '#10b981', path: '/app/contract-analysis' },
  { icon: Globe, label: 'Translate Legal Text', desc: 'Amharic, Oromo, English', color: '#f59e0b', path: '/app/chat' },
  { icon: Shield, label: 'Tenant Help', desc: 'Know your renter rights', color: '#ec4899', path: '/app/tenant-rights' },
  { icon: TrendingUp, label: 'Labor Rights', desc: 'Worker protections', color: '#06b6d4', path: '/app/labor-law' },
];

const recentChats = [
  { q: 'Can landlord evict without notice?', time: '2h ago', category: 'Tenant Rights', confidence: 94 },
  { q: 'What is overtime pay rate in Ethiopia?', time: '5h ago', category: 'Labor Law', confidence: 91 },
  { q: 'Explain this termination clause', time: 'Yesterday', category: 'Contract', confidence: 87 },
  { q: 'My employer owes me 3 months salary', time: '2d ago', category: 'Labor Law', confidence: 89 },
];

const recentDocs = [
  { name: 'Rental Agreement - Bole.pdf', type: 'Rental', risk: 'medium', date: 'May 20', score: 68, pages: 12 },
  { name: 'Employment Contract.pdf', type: 'Employment', risk: 'high', date: 'May 18', score: 81, pages: 8 },
  { name: 'Lease Renewal Notice.pdf', type: 'Legal Notice', risk: 'low', date: 'May 15', score: 24, pages: 3 },
];

const aiInsights = [
  { icon: AlertTriangle, text: 'Your rental agreement has an unusual early termination clause. Consider negotiating.', color: '#f59e0b', action: 'Review Clause', link: '/app/upload' },
  { icon: Lightbulb, text: 'Ethiopian labor law mandates 14 days annual leave. Your contract shows only 10.', color: '#6366f1', action: 'Learn More', link: '/app/labor-law' },
  { icon: CheckCircle, text: 'Deposit receipt saved. You\'re protected for up to 3 months of rent under Civil Code Art. 2955.', color: '#10b981', action: 'View Rights', link: '/app/tenant-rights' },
];

const activityFeed = [
  { icon: MessageSquare, text: 'Asked about overtime pay regulations', time: '2h ago', color: '#6366f1' },
  { icon: FileText, text: 'Uploaded Employment Contract.pdf', time: '5h ago', color: '#8b5cf6' },
  { icon: CheckCircle, text: 'Risk analysis completed — 3 high-risk clauses flagged', time: '5h ago', color: '#ef4444' },
  { icon: BookOpen, text: 'Viewed Tenant Rights — Security Deposit section', time: '1d ago', color: '#10b981' },
  { icon: MessageSquare, text: 'Asked about eviction notice requirements', time: '1d ago', color: '#6366f1' },
  { icon: Star, text: 'Saved explanation on overtime pay', time: '2d ago', color: '#f59e0b' },
];

const RC = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'High Risk' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Med Risk' },
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Low Risk' },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return <>{val}</>;
}

export default function DashboardHome() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [insightIdx, setInsightIdx] = useState(0);
  const [showAllActivity, setShowAllActivity] = useState(false);

  // Cycle AI insights
  useEffect(() => {
    const t = setInterval(() => setInsightIdx(i => (i + 1) % aiInsights.length), 5000);
    return () => clearInterval(t);
  }, []);

  const insight = aiInsights[insightIdx];
  const visibleActivity = showAllActivity ? activityFeed : activityFeed.slice(0, 4);

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1440, margin: '0 auto', paddingBottom: 100 }}>

      {/* ── Header Row ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>
                {getGreeting()}, Tigist 👋
              </h1>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 100, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>Pro Plan</span>
            </div>
            <p style={{ color: '#64748b', fontSize: 14 }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · Your AI legal assistant is ready.
            </p>
          </div>

          {/* Search + Notif */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div key="input" initial={{ width: 40, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 40, opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '8px 12px' }}>
                  <Search size={14} color="#64748b" />
                  <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search legal topics..."
                    style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', fontSize: 13 }} />
                  <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={13} />
                  </button>
                </motion.div>
              ) : (
                <motion.button key="icon" onClick={() => setSearchOpen(true)}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Search size={16} color="#64748b" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Notification bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <Bell size={16} color="#64748b" />
                <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: '50%', background: '#6366f1', border: '2px solid #080b18' }} />
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    style={{ position: 'absolute', right: 0, top: 46, width: 300, background: '#0d1124', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, zIndex: 100, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Notifications</span>
                      <span style={{ fontSize: 11, color: '#6366f1', cursor: 'pointer' }}>Mark all read</span>
                    </div>
                    {[
                      { icon: AlertTriangle, text: 'High-risk clause found in Employment Contract', time: '5h ago', color: '#ef4444', unread: true },
                      { icon: CheckCircle, text: 'Document analysis complete — 3 risks identified', time: '5h ago', color: '#10b981', unread: true },
                      { icon: Brain, text: 'New AI model update — improved Amharic support', time: '1d ago', color: '#6366f1', unread: false },
                    ].map((n, i) => (
                      <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 12, alignItems: 'flex-start', background: n.unread ? 'rgba(99,102,241,0.04)' : 'transparent', cursor: 'pointer' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${n.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <n.icon size={14} color={n.color} />
                        </div>
                        <div>
                          <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5, margin: 0, marginBottom: 2 }}>{n.text}</p>
                          <span style={{ fontSize: 11, color: '#475569' }}>{n.time}</span>
                        </div>
                        {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 4 }} />}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'AI Queries', sub: 'This week', value: 53, change: '+12%', up: true, icon: MessageSquare, color: '#6366f1' },
          { label: 'Docs Analyzed', sub: 'This month', value: 8, change: '+3 new', up: true, icon: FileText, color: '#8b5cf6' },
          { label: 'Risk Alerts', sub: 'Active', value: 5, change: '2 critical', up: false, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Rights Clarified', sub: 'All time', value: 21, change: '+5 this week', up: true, icon: CheckCircle, color: '#10b981' },
          { label: 'Avg Confidence', sub: 'AI accuracy', value: 91, change: '91%', up: true, icon: Target, color: '#06b6d4' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 16px', cursor: 'default' }}
            className="hover:border-white/10 transition-colors">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${stat.color}15`, border: `1px solid ${stat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={16} color={stat.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: stat.up ? '#10b981' : '#ef4444', background: stat.up ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: 100 }}>
                {stat.up ? <ChevronUp size={10} /> : <AlertTriangle size={10} />}
                {stat.change}
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', marginBottom: 2, lineHeight: 1 }}>
              <AnimatedCounter target={stat.value} />
              {stat.label === 'Avg Confidence' && <span style={{ fontSize: 18 }}>%</span>}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#475569' }}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── AI Insight Banner ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ marginBottom: 28 }}>
        <AnimatePresence mode="wait">
          <motion.div key={insightIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            style={{ background: `${insight.color}08`, border: `1px solid ${insight.color}20`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${insight.color}15`, border: `1px solid ${insight.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <insight.icon size={18} color={insight.color} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Sparkles size={12} color={insight.color} />
                <span style={{ fontSize: 11, color: insight.color, fontWeight: 600 }}>AI INSIGHT</span>
                <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
                  {aiInsights.map((_, i) => (
                    <div key={i} onClick={() => setInsightIdx(i)} style={{ width: i === insightIdx ? 16 : 6, height: 6, borderRadius: 3, background: i === insightIdx ? insight.color : 'rgba(255,255,255,0.1)', cursor: 'pointer', transition: 'all 0.3s' }} />
                  ))}
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>{insight.text}</p>
            </div>
            <button onClick={() => navigate(insight.link)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: insight.color, background: `${insight.color}10`, border: `1px solid ${insight.color}20`, borderRadius: 8, padding: '8px 14px', cursor: 'pointer', flexShrink: 0 }}>
              {insight.action} <ChevronRight size={13} />
            </button>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Main 3-Column Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Quick Actions</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#6366f1' }}>
              <Zap size={12} /> Most used
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {quickActions.map((action, i) => (
              <motion.button key={action.label} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(action.path)}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 10px', textAlign: 'left', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                className="hover:border-white/10 transition-all">
                {action.hot && (
                  <div style={{ position: 'absolute', top: 6, right: 6, fontSize: 9, color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>HOT</div>
                )}
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${action.color}15`, border: `1px solid ${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <action.icon size={14} color={action.color} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{action.label}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{action.desc}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Usage Chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>AI Usage This Week</h2>
            <span style={{ fontSize: 11, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 2, background: '#6366f1', borderRadius: 1 }} />Queries / day
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>53</span>
              <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>queries</span>
            </div>
            <div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#8b5cf6' }}>11</span>
              <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>docs</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={usageData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="dashGradQ" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="queries" stroke="#6366f1" strokeWidth={2} fill="url(#dashGradQ)" dot={false} isAnimationActive={false} />
              <Tooltip contentStyle={{ background: '#0d1124', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {usageData.map(d => <span key={d.day} style={{ fontSize: 10, color: '#475569' }}>{d.day}</span>)}
          </div>

          {/* Category breakdown */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>By Category</p>
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey="value" fill="#6366f1" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0d1124', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Status + System */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>System Status</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
              <span style={{ fontSize: 11, color: '#10b981' }}>All systems operational</span>
            </div>
          </div>
          {[
            { label: 'AI Legal Model', status: 'Online', value: 99.9, color: '#10b981' },
            { label: 'Document Analysis', status: 'Online', value: 99.7, color: '#10b981' },
            { label: 'Translation Engine', status: 'Online', value: 98.1, color: '#10b981' },
            { label: 'Amharic NLP', status: 'Beta', value: 94.5, color: '#f59e0b' },
          ].map((sys, i) => (
            <div key={sys.label} style={{ marginBottom: i < 3 ? 12 : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: sys.color }} />
                  <span style={{ fontSize: 13, color: '#cbd5e1' }}>{sys.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: sys.color, background: `${sys.color}10`, padding: '1px 6px', borderRadius: 4 }}>{sys.status}</span>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{sys.value}%</span>
                </div>
              </div>
              <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${sys.value}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  style={{ height: '100%', background: sys.color, borderRadius: 2 }} />
              </div>
            </div>
          ))}

          {/* AI model info */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <Brain size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#818cf8', marginBottom: 2 }}>EthioLegal AI v2.4</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>Trained on Ethiopian Civil Code, Labor Proclamation No. 1156/2019, and Housing Proclamation 35/1998</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

        {/* Recent Chats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Recent AI Chats</h2>
            <button onClick={() => navigate('/app/history')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentChats.map((chat, i) => (
              <motion.div key={i} whileHover={{ x: 3 }} onClick={() => navigate('/app/chat')}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '11px 12px', cursor: 'pointer' }}
                className="hover:border-white/10 transition-colors">
                <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={13} color="#6366f1" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.q}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.1)', color: '#818cf8', padding: '1px 6px', borderRadius: 100 }}>{chat.category}</span>
                    <span style={{ fontSize: 10, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: 100 }}>{chat.confidence}% conf</span>
                    <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={9} />{chat.time}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.button whileHover={{ y: -1 }} onClick={() => navigate('/app/chat')}
            style={{ width: '100%', marginTop: 12, background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: '11px', cursor: 'pointer', color: '#818cf8', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MessageSquare size={14} /> Start New Conversation
          </motion.button>
        </motion.div>

        {/* Recent Documents */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Recent Documents</h2>
            <button onClick={() => navigate('/app/documents')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentDocs.map((doc, i) => {
              const r = RC[doc.risk as keyof typeof RC];
              return (
                <motion.div key={i} whileHover={{ x: 3 }} onClick={() => navigate('/app/documents')}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '11px 12px', cursor: 'pointer' }}
                  className="hover:border-white/10 transition-colors">
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${r.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={13} color={r.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: '#475569' }}>{doc.type} · {doc.pages}p</span>
                      <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 100, background: r.bg, color: r.color }}>{r.label}</span>
                      <span style={{ fontSize: 10, color: '#475569', marginLeft: 'auto' }}>{doc.date}</span>
                    </div>
                  </div>
                  {/* Mini risk gauge */}
                  <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
                    <svg width="28" height="28" viewBox="0 0 28 28">
                      <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                      <motion.circle cx="14" cy="14" r="11" fill="none" stroke={r.color} strokeWidth="3"
                        strokeDasharray={`${(doc.score / 100) * 69.1} 69.1`} strokeLinecap="round"
                        transform="rotate(-90 14 14)"
                        initial={{ strokeDasharray: '0 69.1' }}
                        animate={{ strokeDasharray: `${(doc.score / 100) * 69.1} 69.1` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.7 }}
                      />
                    </svg>
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 700, color: r.color }}>{doc.score}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <motion.button whileHover={{ y: -1 }} onClick={() => navigate('/app/upload')}
            style={{ width: '100%', marginTop: 12, background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.25)', borderRadius: 10, padding: '11px', cursor: 'pointer', color: '#818cf8', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Upload size={14} /> Upload New Document
          </motion.button>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Activity Timeline</h2>
            <Activity size={14} color="#64748b" />
          </div>
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 14, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visibleActivity.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.07 }}
                  style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingLeft: 4 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: `${item.color}15`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                    <item.icon size={10} color={item.color} />
                  </div>
                  <div style={{ flex: 1, paddingTop: 2 }}>
                    <p style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.4, margin: 0, marginBottom: 2 }}>{item.text}</p>
                    <span style={{ fontSize: 10, color: '#475569' }}>{item.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <button onClick={() => setShowAllActivity(!showAllActivity)}
            style={{ width: '100%', marginTop: 14, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px', cursor: 'pointer', color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {showAllActivity ? 'Show less' : 'View all activity'} <ArrowRight size={12} />
          </button>
        </motion.div>
      </div>

      {/* ── Saved Insights Row ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>Saved Legal Insights</h2>
          <button onClick={() => navigate('/app/history')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6366f1', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            View saved <ArrowRight size={13} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
          {[
            { title: 'Overtime Pay Calculation', excerpt: 'In Ethiopia, overtime is paid at 125% on weekdays, 150% on weekends, and 200% on holidays per Labor Proc. 1156/2019.', category: 'Labor Law', color: '#10b981', icon: TrendingUp, date: '2d ago' },
            { title: 'Eviction Notice Requirements', excerpt: '30 days written notice required under Civil Code Art. 2975 before eviction proceedings. Verbal notices have no legal force.', category: 'Tenant Rights', color: '#6366f1', icon: Shield, date: '3d ago' },
            { title: 'Contract Termination Clause', excerpt: 'If a termination clause lacks notice period, 14 days minimum applies under standard contract law interpretations.', category: 'Contract Law', color: '#8b5cf6', icon: FileText, date: '5d ago' },
          ].map((insight, i) => (
            <motion.div key={insight.title} whileHover={{ y: -3 }}
              onClick={() => navigate('/app/chat')}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '16px', cursor: 'pointer' }}
              className="hover:border-white/10 transition-colors">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: `${insight.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <insight.icon size={13} color={insight.color} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{insight.title}</div>
                  <div style={{ fontSize: 10, color: insight.color, marginTop: 1 }}>{insight.category}</div>
                </div>
                <Star size={12} color="#f59e0b" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </div>
              <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{insight.excerpt}</p>
              <div style={{ marginTop: 10, fontSize: 10, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Eye size={9} /> Saved {insight.date}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Footer disclaimer ── */}
      <div style={{ marginTop: 28, padding: 12, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.1)', borderRadius: 10 }}>
        <p style={{ fontSize: 11, color: '#92400e', margin: 0, opacity: 0.8 }}>⚠️ Educational AI-generated legal guidance only — not a substitute for professional legal advice. Consult a licensed Ethiopian attorney for representation.</p>
      </div>
    </div>
  );
}
