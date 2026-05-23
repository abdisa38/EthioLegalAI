import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { MessageSquare, Search, Star, Trash2, Download, ArrowRight, Clock, Filter, Shield, TrendingUp, FileText } from 'lucide-react';

type Chat = {
  id: number;
  title: string;
  preview: string;
  date: string;
  category: string;
  starred: boolean;
  messages: number;
  lang: string;
};

const chats: Chat[] = [
  { id: 1, title: 'Landlord eviction notice rights', preview: 'Ethiopian law requires 30 days written notice. Your landlord must provide...', date: 'May 23, 2026', category: 'Tenant Rights', starred: true, messages: 8, lang: 'English' },
  { id: 2, title: 'Overtime pay calculation help', preview: 'Under Labor Proclamation 1156/2019, overtime must be paid at 125% of...', date: 'May 22, 2026', category: 'Labor Law', starred: false, messages: 12, lang: 'English' },
  { id: 3, title: 'ውል ሰነድ ትንታኔ (Contract analysis)', preview: 'ይህ ውል ሰነድ ሦስት አደጋ ያለባቸው አንቀጾች አሉ። አንደኛው...', date: 'May 21, 2026', category: 'Contract', starred: true, messages: 6, lang: 'Amharic' },
  { id: 4, title: 'Security deposit dispute help', preview: 'If your landlord has not returned your deposit within 30 days of lease...', date: 'May 19, 2026', category: 'Tenant Rights', starred: false, messages: 15, lang: 'English' },
  { id: 5, title: 'Wrongful termination inquiry', preview: 'Your employer must have valid cause for termination. Dismissal without...', date: 'May 17, 2026', category: 'Labor Law', starred: false, messages: 9, lang: 'English' },
  { id: 6, title: 'Miira Oromo fi mirga hojjataa', preview: 'Seerri hojii Itoophiyaa Labsii 1156/2019 hojjattoota mirga...', date: 'May 15, 2026', category: 'Labor Law', starred: true, messages: 7, lang: 'Oromo' },
  { id: 7, title: 'Employment contract review', preview: 'The employment contract you shared has 2 concerning clauses regarding...', date: 'May 12, 2026', category: 'Contract', starred: false, messages: 11, lang: 'English' },
  { id: 8, title: 'Rent increase legality', preview: 'During an active fixed-term lease, your landlord generally cannot increase...', date: 'May 10, 2026', category: 'Tenant Rights', starred: false, messages: 5, lang: 'English' },
];

const categoryConfig: Record<string, { color: string; icon: React.ElementType }> = {
  'Tenant Rights': { color: '#10b981', icon: Shield },
  'Labor Law': { color: '#f59e0b', icon: TrendingUp },
  'Contract': { color: '#6366f1', icon: FileText },
};

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [starred, setStarred] = useState<Record<number, boolean>>(
    Object.fromEntries(chats.map(c => [c.id, c.starred]))
  );
  const [deleted, setDeleted] = useState<number[]>([]);

  const categories = ['All', 'Tenant Rights', 'Labor Law', 'Contract'];

  const filtered = chats.filter(c => {
    if (deleted.includes(c.id)) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'All' && c.category !== filterCat) return false;
    return true;
  });

  const starredChats = filtered.filter(c => starred[c.id]);
  const recentChats = filtered.filter(c => !starred[c.id]);

  const ChatCard = ({ chat }: { chat: Chat }) => {
    const cat = categoryConfig[chat.category] || { color: '#64748b', icon: MessageSquare };
    const CatIcon = cat.icon;
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}
        className="hover:border-white/10 transition-colors">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CatIcon size={18} color={cat.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button onClick={() => setStarred(prev => ({ ...prev, [chat.id]: !prev[chat.id] }))}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: starred[chat.id] ? '#f59e0b' : '#475569' }}>
                <Star size={15} fill={starred[chat.id] ? '#f59e0b' : 'none'} />
              </button>
              <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }}>
                <Download size={14} />
              </button>
              <button onClick={() => setDeleted(prev => [...prev, chat.id])} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }}
                className="hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{chat.preview}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: cat.color, background: `${cat.color}10`, padding: '2px 8px', borderRadius: 100 }}>{chat.category}</span>
            <span style={{ fontSize: 11, color: '#475569' }}>🌐 {chat.lang}</span>
            <span style={{ fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', gap: 3 }}><MessageSquare size={10} /> {chat.messages} messages</span>
            <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {chat.date}</span>
          </div>
        </div>
        <button onClick={() => navigate('/app/chat')}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', cursor: 'pointer', fontSize: 12, flexShrink: 0, alignSelf: 'flex-start' }}>
          Continue <ArrowRight size={12} />
        </button>
      </motion.div>
    );
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Chat History</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>{chats.length - deleted.length} saved conversations · {Object.values(starred).filter(Boolean).length} starred</p>
          </div>
          <button onClick={() => navigate('/app/chat')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <MessageSquare size={14} /> New Chat
          </button>
        </div>
      </motion.div>

      {/* Search & filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px 11px 42px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            className="focus:border-indigo-500/40 transition-colors" />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={13} color="#475569" />
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: filterCat === cat ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: filterCat === cat ? '#818cf8' : '#64748b' }}>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Starred */}
      {starredChats.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={14} color="#f59e0b" fill="#f59e0b" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8' }}>Starred</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {starredChats.map(chat => <ChatCard key={chat.id} chat={chat} />)}
          </div>
        </div>
      )}

      {/* Recent */}
      {recentChats.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={14} color="#64748b" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8' }}>Recent</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentChats.map(chat => <ChatCard key={chat.id} chat={chat} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <MessageSquare size={32} color="#475569" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>No conversations found</h3>
          <p style={{ color: '#475569', fontSize: 14 }}>Start a new AI chat to ask your legal question.</p>
        </motion.div>
      )}
    </div>
  );
}
