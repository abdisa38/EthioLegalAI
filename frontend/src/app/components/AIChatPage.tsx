import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale, Send, Paperclip, Mic, MicOff, Copy, Bookmark,
  Share2, AlertTriangle, ThumbsUp, ThumbsDown, RefreshCw,
  ChevronDown, BookOpen, ExternalLink, Check, Zap, Plus,
  Hash, User, X, RotateCcw
} from 'lucide-react';
import { chatRequest, toggleStarChatRequest } from '../api/ai';

// ─── Types ───────────────────────────────────────────────────────────────────

type Feedback = 'up' | 'down' | null;

type Citation = {
  law: string;
  article: string;
  year: string;
  relevance: string;
};

type Message = {
  id: string;
  chatId?: string;
  role: 'user' | 'ai';
  text: string;
  time: string;
  streaming?: boolean;
  error?: boolean;
  starred?: boolean;
  citations?: Citation[];
  confidence?: number;
  category?: string;
  followups?: string[];
  feedback?: Feedback;
};

const getLanguageLabel = (code: string) => {
  if (code === 'አማ') return 'Amharic';
  if (code === 'ORM') return 'Afaan Oromo';
  return 'English';
};

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|==[^=]+==[^\s]*)/g);
  return parts.filter(p => p !== undefined && p !== '').map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4)
      return <strong key={i} style={{ color: '#e2e8f0', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2 && !part.startsWith('**'))
      return <em key={i} style={{ color: '#cbd5e1' }}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ background: 'rgba(99,102,241,0.18)', color: '#a5b4fc', padding: '1px 7px', borderRadius: 5, fontSize: '0.87em', fontFamily: 'ui-monospace,monospace' }}>{part.slice(1, -1)}</code>;
    if (part.startsWith('==') && part.endsWith('=='))
      return <mark key={i} style={{ background: 'rgba(245,158,11,0.25)', color: '#fbbf24', padding: '0 4px', borderRadius: 3, fontWeight: 600 }}>{part.slice(2, -2)}</mark>;
    return part;
  });
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let li: React.ReactNode[] = [];
  let k = 0;

  const flush = () => {
    if (!li.length) return;
    out.push(<ul key={`ul${k++}`} style={{ listStyle: 'none', padding: 0, margin: '10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>{li}</ul>);
    li = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('```')) {
      flush();
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++; }
      const isLegal = lang === 'ethiopian-law' || lang === 'risk-analysis';
      out.push(
        <div key={k++} style={{ background: isLegal ? 'rgba(37,99,235,0.07)' : 'rgba(0,0,0,0.35)', border: `1px solid ${isLegal ? 'rgba(37,99,235,0.22)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '14px 18px', margin: '12px 0', fontFamily: 'ui-monospace,monospace', fontSize: 13, lineHeight: 1.75, color: isLegal ? '#dbeafe' : '#94a3b8', whiteSpace: 'pre', overflowX: 'auto' }}>
          {isLegal && <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 800, letterSpacing: 1.2, marginBottom: 10 }}>📚 LEGAL REFERENCE</div>}
          {code.join('\n')}
        </div>
          <p key={k++} style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 10, fontStyle: 'italic' }}>{parseInline(line.replace(/^\*/, '').replace(/\*$/, ''))}</p>
        }
        out.push(<p key={k++} style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.7, margin: '3px 0' }}>{parseInline(line)}</p>);
      );
      i++; continue;
    }

    if (line.startsWith('## ')) {
      flush();
      out.push(<h2 key={k++} style={{ fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', margin: '18px 0 10px', lineHeight: 1.3 }}>{parseInline(line.slice(3))}</h2>);
    } else if (line.startsWith('### ')) {
      flush();
      out.push(<h3 key={k++} style={{ fontSize: 14, fontWeight: 700, color: '#c7d2fe', margin: '14px 0 7px' }}>{parseInline(line.slice(4))}</h3>);
    } else if (line.startsWith('> ')) {
      flush();
      const inner = line.slice(2);
      const warn = inner.startsWith('⚠️') || inner.includes('Warning') || inner.includes('Legal');
      const tip = inner.startsWith('💡') || inner.startsWith('📋') || inner.startsWith('Pro');
      const c = warn ? '#f59e0b' : tip ? '#10b981' : '#2563eb';
      out.push(
        <div key={k++} style={{ borderLeft: `3px solid ${c}`, padding: '8px 14px', margin: '10px 0', background: `${c}0d`, borderRadius: '0 10px 10px 0' }}>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: 13.5, lineHeight: 1.65 }}>{parseInline(inner)}</p>
        </div>
      );
    } else if (line === '---') {
      flush();
      out.push(<hr key={k++} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.07)', margin: '14px 0' }} />);
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      li.push(
        <li key={k++} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', color: '#cbd5e1', fontSize: 14, lineHeight: 1.65 }}>
          <span style={{ color: '#2563eb', flexShrink: 0, marginTop: 3, fontSize: 10 }}>▸</span>
          <span>{parseInline(line.slice(2))}</span>
        </li>
      );
    } else if (/^\d+\. /.test(line)) {
      const num = line.match(/^(\d+)/)?.[1];
      li.push(
        <li key={k++} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', color: '#cbd5e1', fontSize: 14, lineHeight: 1.65 }}>
          <span style={{ color: '#2563eb', fontWeight: 700, flexShrink: 0, fontSize: 13, marginTop: 1, minWidth: 16 }}>{num}.</span>
          <span>{parseInline(line.replace(/^\d+\. /, ''))}</span>
        </li>
      );
    } else if (line.startsWith('*Sources')) {
      flush();
      out.push(<p key={k++} style={{ fontSize: 12, color: '#475569', marginTop: 10, fontStyle: 'italic' }}>{parseInline(line.replace(/^\*/, '').replace(/\*$/, ''))}</p>);
    } else if (line === '') {
      flush();
      out.push(<div key={k++} style={{ height: 5 }} />);
    } else {
      flush();
      out.push(<p key={k++} style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, margin: '3px 0' }}>{parseInline(line)}</p>);
        out.push(<p key={k++} style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.7, margin: '3px 0' }}>{parseInline(line)}</p>);
    }
    i++;
  }
  flush();
  return <div>{out}</div>;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center', padding: '2px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.span key={i}
          animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ display: 'block', width: 7, height: 7, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#60a5fa)' }}
        />
      ))}
    </div>
  );
}

function ConfidenceMeter({ score }: { score: number }) {
  const color = score >= 90 ? '#10b981' : score >= 75 ? '#2563eb' : '#f59e0b';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Zap size={10} color={color} />
      <div style={{ width: 48, height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 100, overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 100 }} />
      </div>
      <span style={{ fontSize: 11, color: '#64748b' }}>{score}% confidence</span>
    </div>
  );
}

function CitationCard({ c }: { c: Citation }) {
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 9, background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.18)', borderRadius: 10, padding: '9px 13px', marginRight: 7, marginBottom: 7, cursor: 'pointer', verticalAlign: 'top' }}
      className="hover:border-blue-500/35 transition-colors">
      <BookOpen size={12} color="#2563eb" style={{ flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa', marginBottom: 1 }}>{c.law} · {c.article}</div>
        <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.4 }}>{c.relevance}</div>
      </div>
      <ExternalLink size={10} color="#334155" style={{ flexShrink: 0, marginTop: 2 }} />
    </motion.div>
  );
}

function ActionBar({
  msg, onCopy, onSave, onFeedback,
}: {
  msg: Message;
  onCopy: () => void;
  onSave: () => void;
  onFeedback: (v: Feedback) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);

  const copy = () => { onCopy(); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const save = () => { onSave(); setSavedPulse(true); setTimeout(() => setSavedPulse(false), 2000); };
  const saved = Boolean(msg.starred);

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 10, flexWrap: 'wrap' }}>
      <button onClick={copy}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: copied ? '#10b981' : '#64748b', fontSize: 12, transition: 'all 0.2s' }}>
        {copied ? <Check size={11} /> : <Copy size={11} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <button onClick={save}
        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, background: saved ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${saved ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer', color: saved ? '#f59e0b' : '#64748b', fontSize: 12, transition: 'all 0.2s' }}>
        <Bookmark size={11} fill={saved ? '#f59e0b' : 'none'} />
        {saved ? 'Saved' : savedPulse ? 'Saving...' : 'Save'}
      </button>
      <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 7, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#64748b', fontSize: 12 }}>
        <Share2 size={11} /> Share
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
        <span style={{ fontSize: 11, color: '#334155' }}>Helpful?</span>
        <button onClick={() => onFeedback(msg.feedback === 'up' ? null : 'up')}
          style={{ padding: '5px 8px', borderRadius: 7, background: msg.feedback === 'up' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.feedback === 'up' ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', color: msg.feedback === 'up' ? '#10b981' : '#64748b', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
          <ThumbsUp size={11} />
        </button>
        <button onClick={() => onFeedback(msg.feedback === 'down' ? null : 'down')}
          style={{ padding: '5px 8px', borderRadius: 7, background: msg.feedback === 'down' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${msg.feedback === 'down' ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)'}`, cursor: 'pointer', color: msg.feedback === 'down' ? '#ef4444' : '#64748b', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
          <ThumbsDown size={11} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Quick Prompt Cards ───────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  { icon: '🏠', text: 'Can a landlord evict me without notice?', cat: 'Tenant' },
  { icon: '⏰', text: 'What are my overtime pay rights?', cat: 'Labor' },
  { icon: '📄', text: 'How do I spot risky contract clauses?', cat: 'Contract' },
  { icon: '💰', text: 'My employer hasn\'t paid my salary', cat: 'Labor' },
  { icon: '🇪🇹', text: 'ቤት አከራዩ ሊያስወጣኝ ቢፈልጉ?', cat: 'Amharic' },
  { icon: '🔍', text: 'What makes a contract legally void?', cat: 'Contract' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

let uid = 200;
const nextId = () => `m${++uid}`;

const WELCOME: Message = {
  id: 'm1',
  role: 'ai',
  text: `## Welcome to EthioLegal AI 🏛️

I'm your AI-powered Ethiopian legal assistant. I can help you:

- Understand **tenant rights** and rental agreements
- Navigate **Ethiopian labor law** and worker protections
- **Review contracts** and detect risky or illegal clauses
- Answer questions in **English, Amharic, or Afaan Oromo**

> ⚠️ This is educational legal information only — not official legal advice. Consult a licensed Ethiopian attorney for legal representation.

What legal question can I help you with today?`,
  time: 'Now',
  citations: [],
  confidence: 96,
  category: 'General',
  followups: ['Can a landlord evict me without notice?', 'What are my overtime rights?', 'How do I review a contract?'],
};

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [streamText, setStreamText] = useState('');
  const [awaitingStream, setAwaitingStream] = useState(false);
  const [input, setInput] = useState('');
  const [lang, setLang] = useState('EN');
  const [recording, setRecording] = useState(false);
  const [atBottom, setAtBottom] = useState(true);
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow textarea
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  }, [input]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamText, awaitingStream, atBottom]);

  const handleScroll = () => {
    const el = scrollAreaRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100);
  };

  const startStream = (id: string, fullText: string, meta: Omit<Message, 'id' | 'role' | 'text' | 'time' | 'streaming'>) => {
    setStreamingId(id);
    setStreamText('');
    let pos = 0;
    streamRef.current = setInterval(() => {
      pos = Math.min(pos + 5, fullText.length);
      setStreamText(fullText.slice(0, pos));
      if (pos >= fullText.length) {
        clearInterval(streamRef.current!);
        setStreamingId(null);
        setStreamText('');
        setMessages(prev => prev.map(m =>
          m.id === id ? { ...m, streaming: false, text: fullText, ...meta } : m
        ));
      }
    }, 13);
  };

  const send = useCallback(async (text: string) => {
    if (!text.trim() || streamingId || awaitingStream) return;
    const userMsg: Message = {
      id: nextId(), role: 'user', text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const aiId = nextId();
    const aiPlaceholder: Message = {
      id: aiId, role: 'ai', text: '', streaming: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    setInput('');
    setAtBottom(true);
    setAwaitingStream(true);

    try {
      const response = await chatRequest({
        message: text.trim(),
        language: getLanguageLabel(lang),
      });

      setAwaitingStream(false);
      startStream(aiId, response.answer, {
        chatId: response.id,
        starred: false,
        confidence: response.confidence,
        category: 'General',
        followups: response.suggestedPrompts,
      });
    } catch (error) {
      console.error('Chat request failed:', error);
      setAwaitingStream(false);
      setStreamingId(null);
      setStreamText('');
      setMessages(prev => prev.map(m =>
        m.id === aiId ? { ...m, streaming: false, error: true, text: '' } : m
      ));
    }
  }, [streamingId, awaitingStream, lang]);

  const retry = () => {
    const last = [...messages].reverse().find(m => m.role === 'user');
    if (!last) return;
    setMessages(prev => {
      const idx = prev.findLastIndex(m => m.role === 'ai');
      return idx >= 0 ? prev.slice(0, idx) : prev;
    });
    send(last.text);
  };

  const setFeedback = (id: string, fb: Feedback) =>
    setMessages(prev => prev.map(m => m.id === id ? { ...m, feedback: fb } : m));

  const toggleSaved = async (message: Message) => {
    if (!message.chatId) {
      console.warn('No chatId available to save this message.');
      return;
    }

    try {
      const updated = await toggleStarChatRequest(message.chatId);
      setMessages(prev => prev.map(m => m.id === message.id ? { ...m, starred: updated.starred } : m));
    } catch (error) {
      console.error('Failed to toggle saved chat:', error);
    }
  };

  const isIdle = !streamingId && !awaitingStream;
  const showQuickPrompts = messages.length <= 1;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f8fbff', overflow: 'hidden' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(37,99,235,0.08)', background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 18px rgba(37,99,235,0.3)' }}>
              <Scale size={18} color="white" />
            </div>
            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 9, height: 9, borderRadius: '50%', background: '#10b981', border: '2px solid #080b18' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#ffffff', lineHeight: 1.2 }}>EthioLegal AI</div>
            <div style={{ fontSize: 11, color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Zap size={9} color="#2563eb" />
              {awaitingStream ? 'Thinking...' : streamingId ? 'Responding...' : 'Ready · Ethiopian Law'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Language picker */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, overflow: 'hidden' }}>
            {[['EN','🇬🇧'],['አማ','🇪🇹'],['ORM','🟢']].map(([l, flag]) => (
              <button key={l} onClick={() => setLang(l)}
                style={{ padding: '5px 10px', fontSize: 11, fontWeight: 500, border: 'none', cursor: 'pointer', background: lang === l ? 'rgba(37,99,235,0.18)' : 'transparent', color: lang === l ? '#2563eb' : '#64748b', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {flag} {l}
              </button>
            ))}
          </div>
          <button onClick={() => setMessages([WELCOME])}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer', fontSize: 12 }}
            className="hover:text-slate-300 transition-colors">
            <Plus size={13} /> New
          </button>
        </div>
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <div style={{ padding: '7px 20px', background: 'rgba(37,99,235,0.06)', borderBottom: '1px solid rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
        <AlertTriangle size={11} color="#60a5fa" />
        <span style={{ fontSize: 11.5, color: '#60a5fa', lineHeight: 1.3 }}>Educational legal information only — not official legal advice. Consult a licensed Ethiopian attorney for representation.</span>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div ref={scrollAreaRef} onScroll={handleScroll}
        style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 8px', display: 'flex', flexDirection: 'column', gap: 26 }}>

        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isStreaming = msg.id === streamingId;
            const displayText = isStreaming ? streamText : msg.text;

            if (msg.role === 'user') {
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ maxWidth: '72%' }}>
                    <div style={{ background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '16px 16px 4px 16px', padding: '11px 16px', fontSize: 14, color: '#c7d2fe', lineHeight: 1.6 }}>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 11, color: '#1e293b', textAlign: 'right', marginTop: 4 }}>{msg.time}</div>
                  </div>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                    <User size={13} color="#64748b" />
                  </div>
                </motion.div>
              );
            }

            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, boxShadow: '0 0 14px rgba(37,99,235,0.35)' }}>
                  <Scale size={13} color="white" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Category + confidence */}
                  {msg.category && !isStreaming && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#2563eb', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', padding: '2px 9px', borderRadius: 100, fontWeight: 600 }}>{msg.category}</span>
                      {msg.confidence && <ConfidenceMeter score={msg.confidence} />}
                    </div>
                  )}

                  {/* Bubble */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '4px 16px 16px 16px', padding: '15px 18px', position: 'relative' }}>
                    {/* Awaiting stream — show typing dots */}
                    {msg.streaming && !isStreaming && awaitingStream ? (
                      <TypingIndicator />
                    ) : (
                      <>
                        <MarkdownRenderer text={displayText || ''} />
                        {/* Streaming cursor */}
                        {isStreaming && (
                          <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }}
                            style={{ display: 'inline-block', width: 2, height: 15, background: '#2563eb', marginLeft: 2, verticalAlign: 'text-bottom', borderRadius: 1 }} />
                        )}
                      </>
                    )}
                  </div>

                  {/* Citations */}
                  {!isStreaming && msg.citations && msg.citations.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                      style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, color: '#334155', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Hash size={9} color="#475569" /> Legal Sources
                      </div>
                      <div>{msg.citations.map((c, i) => <CitationCard key={i} c={c} />)}</div>
                    </motion.div>
                  )}

                  {/* Actions */}
                  {!isStreaming && msg.text && (
                    <ActionBar
                      msg={msg}
                      onCopy={() => navigator.clipboard?.writeText(msg.text)}
                      onSave={() => toggleSaved(msg)}
                      onFeedback={(v) => setFeedback(msg.id, v)}
                    />
                  )}

                  {/* Error retry */}
                  {msg.error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10, padding: '10px 14px' }}>
                      <AlertTriangle size={13} color="#ef4444" />
                      <span style={{ color: '#fca5a5', fontSize: 13 }}>Response failed.</span>
                      <button onClick={retry}
                        style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 7, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
                        <RotateCcw size={11} /> Retry
                      </button>
                    </motion.div>
                  )}

                  {/* Follow-ups */}
                  {!isStreaming && msg.followups && msg.followups.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                      style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, color: '#334155', marginBottom: 7 }}>Related questions:</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {msg.followups.map(f => (
                          <motion.button key={f} whileHover={{ y: -2 }} onClick={() => send(f)}
                            style={{ padding: '5px 12px', borderRadius: 20, fontSize: 12, background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.17)', color: '#a5b4fc', cursor: 'pointer' }}
                            className="hover:bg-blue-500/15 transition-colors">
                            {f}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div style={{ fontSize: 11, color: '#1e293b', marginTop: 7 }}>{msg.time}</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Quick prompt grid — only before first message */}
        {showQuickPrompts && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{ marginTop: 8 }}>
            <div style={{ fontSize: 12, color: '#475569', marginBottom: 12, fontWeight: 500 }}>Quick start — choose a topic:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 8 }}>
              {QUICK_PROMPTS.map(p => (
                <motion.button key={p.text} whileHover={{ y: -2, borderColor: 'rgba(99,102,241,0.35)' }} whileTap={{ scale: 0.97 }}
                  onClick={() => send(p.text)}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 13, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>{p.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 3 }}>{p.text}</div>
                    <span style={{ fontSize: 11, color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: 100 }}>{p.cat}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* Scroll-to-bottom pill */}
      <AnimatePresence>
        {!atBottom && (
          <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
            onClick={() => { setAtBottom(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
            style={{ position: 'absolute', bottom: 110, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 6, padding: '7px 16px', borderRadius: 100, background: 'rgba(13,17,36,0.95)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', cursor: 'pointer', fontSize: 13, backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.45)', zIndex: 20 }}>
            <ChevronDown size={13} /> Latest message
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 16px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,11,24,0.97)', backdropFilter: 'blur(20px)', flexShrink: 0 }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 16, padding: '10px 12px', display: 'flex', alignItems: 'flex-end', gap: 8, transition: 'border-color 0.2s' }}
          className="focus-within:border-blue-500/40">
          {/* Attach */}
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#334155', padding: '4px', flexShrink: 0 }}
            className="hover:text-slate-500 transition-colors">
            <Paperclip size={17} />
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
            placeholder={lang === 'EN' ? 'Ask any legal question... (Enter to send)' : lang === 'አማ' ? 'ሕጋዊ ጥያቄዎን ይጻፉ...' : 'Gaaffii seeraa barreessaa...'}
            rows={1}
            disabled={!isIdle}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: isIdle ? '#f1f5f9' : '#64748b', fontSize: 14, resize: 'none', lineHeight: 1.5, maxHeight: 140, overflowY: 'auto', padding: '3px 0' }}
          />

          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
            {/* Token hint */}
            {input.length > 10 && (
              <span style={{ fontSize: 10, color: '#334155' }}>{Math.floor(input.length / 4)}t</span>
            )}
            {/* Voice */}
            <motion.button whileTap={{ scale: 0.88 }} onClick={() => setRecording(r => !r)}
              style={{ background: recording ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${recording ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              {recording
                ? <motion.div animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 0.8, repeat: Infinity }}><MicOff size={14} color="#ef4444" /></motion.div>
                : <Mic size={14} color="#64748b" />}
            </motion.button>
            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.92 }}
              onClick={() => send(input)}
              disabled={!input.trim() || !isIdle}
              style={{ background: input.trim() && isIdle ? 'linear-gradient(135deg,#2563eb,#60a5fa)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 10, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && isIdle ? 'pointer' : 'not-allowed', boxShadow: input.trim() && isIdle ? '0 0 18px rgba(37,99,235,0.45)' : 'none', transition: 'all 0.2s' }}>
              <Send size={14} color={input.trim() && isIdle ? 'white' : '#334155'} />
            </motion.button>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7, flexWrap: 'wrap', gap: 6 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Tenant', 'Labor', 'Contract'].map(tag => (
              <button key={tag} onClick={() => send(`Explain my ${tag} rights in Ethiopia`)}
                style={{ padding: '3px 10px', borderRadius: 100, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#334155', fontSize: 11, cursor: 'pointer' }}
                className="hover:text-slate-500 hover:border-white/12 transition-all">
                {tag}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 10.5, color: '#1e293b' }}>AI may make mistakes — verify with a licensed attorney</span>
        </div>
      </div>
    </div>
  );
}
