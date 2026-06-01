import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { MessageSquare, Search, Star, Trash2, Download, ArrowRight, Clock, Filter, Shield, TrendingUp, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getChatsRequest, toggleStarChatRequest, deleteChatRequest } from '../api/ai';
import { ChatSkeleton } from '@/shared/components';

const categoryConfig: Record<string, { color: string; icon: React.ElementType }> = {
  'Tenant Rights': { color: '#2563eb', icon: Shield },
  'Labor Law': { color: '#3b82f6', icon: TrendingUp },
  'Contract': { color: '#60a5fa', icon: FileText },
  'General': { color: '#93c5fd', icon: MessageSquare }
};

export default function ChatHistoryPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');

  const { data: chats, isLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: getChatsRequest,
  });

  const toggleStarMutation = useMutation({
    mutationFn: toggleStarChatRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const deleteChatMutation = useMutation({
    mutationFn: deleteChatRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const categories = ['All', 'Tenant Rights', 'Labor Law', 'Contract', 'General'];

  const filtered = (chats || []).filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.question.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'All' && c.category !== filterCat) return false;
    return true;
  });

  const starredChats = filtered.filter(c => c.starred);
  const recentChats = filtered.filter(c => !c.starred);

  const groupByDate = (items: any[]) => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const older: any[] = [];
    const now = new Date();
    items.forEach(i => {
      const d = new Date(i.createdAt);
      const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 0) today.push(i);
      else if (diff === 1) yesterday.push(i);
      else older.push(i);
    });
    return { today, yesterday, older };
  };

  const grouped = groupByDate(filtered);

  const ChatCard = ({ chat }: { chat: any }) => {
    const cat = categoryConfig[chat.category] || { color: '#64748b', icon: MessageSquare };
    const CatIcon = cat.icon;
    return (
      <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/app/chat?chatId=${chat._id}`)}
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}
      className="hover:border-blue-200 transition-colors">
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${cat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CatIcon size={18} color={cat.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.title}</div>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStarMutation.mutate(chat._id);
                }}
                disabled={toggleStarMutation.isPending}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: chat.starred ? '#2563eb' : '#475569' }}>
                <Star size={15} fill={chat.starred ? '#2563eb' : 'none'} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this chat?')) {
                    deleteChatMutation.mutate(chat._id);
                  }
                }}
                disabled={deleteChatMutation.isPending}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }}
                className="hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 10, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{chat.question}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: cat.color, background: `${cat.color}10`, padding: '2px 8px', borderRadius: 100 }}>{chat.category}</span>
            <span style={{ fontSize: 11, color: '#475569' }}>🌐 {chat.language}</span>
            <span style={{ fontSize: 11, color: '#475569', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={10} /> {new Date(chat.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); navigate(`/app/chat?chatId=${chat._id}`); }}
          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 8, background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', color: '#2563eb', cursor: 'pointer', fontSize: 12, flexShrink: 0, alignSelf: 'flex-start' }}>
          View <ArrowRight size={12} />
        </button>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
        <ChatSkeleton />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--foreground)', marginBottom: 6 }}>Chat History</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 15 }}>{chats?.length || 0} saved conversations · {starredChats.length} starred</p>
          </div>
          <button onClick={() => navigate('/app/chat')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #60a5fa)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <MessageSquare size={14} /> New Chat
          </button>
        </div>
      </motion.div>

      {/* Search & filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 28 }}>
        <div style={{ position: 'relative', marginBottom: 14 }}>
          <Search size={16} color="var(--muted-foreground)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search conversations..."
            style={{ width: '100%', background: 'var(--muted)', border: '1px solid var(--color-border)', borderRadius: 10, padding: '11px 14px 11px 42px', color: 'var(--foreground)', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            className="focus:border-blue-500/40 transition-colors" />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={13} color="#475569" />
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)}
              style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: filterCat === cat ? 'rgba(37,99,235,0.14)' : 'rgba(255,255,255,0.04)', color: filterCat === cat ? '#2563eb' : '#64748b' }}>
              {cat}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Starred */}
      {starredChats.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star size={14} color="#2563eb" fill="#2563eb" />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted-foreground)' }}>Starred</h2>
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
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--muted-foreground)' }}>Recent</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {grouped.today.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 8, fontWeight: 700 }}>Today</div>
                {grouped.today.map((chat: any) => <ChatCard key={chat.id} chat={chat} />)}
              </div>
            )}
            {grouped.yesterday.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 8, fontWeight: 700 }}>Yesterday</div>
                {grouped.yesterday.map((chat: any) => <ChatCard key={chat.id} chat={chat} />)}
              </div>
            )}
            {grouped.older.length > 0 && (
              <div>
                <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginBottom: 8, fontWeight: 700 }}>Older</div>
                {grouped.older.map((chat: any) => <ChatCard key={chat.id} chat={chat} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <MessageSquare size={32} color="#475569" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--muted-foreground)', marginBottom: 8 }}>No conversations found</h3>
          <p style={{ color: '#475569', fontSize: 14 }}>Start a new AI chat to ask your legal question.</p>
        </motion.div>
      )}
    </div>
  );
}
