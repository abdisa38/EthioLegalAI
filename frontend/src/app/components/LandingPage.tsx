import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale, Upload, Globe, Shield, FileText, Zap, MessageSquare,
  AlertTriangle, ChevronDown, ArrowRight, Check, Star, Menu, X,
  Bot, Lock, TrendingUp, Users, Mic, Paperclip, Send
} from 'lucide-react';

const features = [
  { icon: Bot, title: 'AI Legal Explanations', desc: 'Get complex Ethiopian laws explained in plain language you can understand instantly.', color: '#2563eb' },
  { icon: Upload, title: 'Upload PDF Contracts', desc: 'Drag and drop any legal document — rental agreements, employment contracts, and more.', color: '#60a5fa' },
  { icon: Globe, title: 'Amharic & Oromo Support', desc: 'Ask legal questions in English, Amharic, or Afaan Oromo. Get answers in your language.', color: '#93c5fd' },
  { icon: Shield, title: 'Tenant Rights Assistant', desc: 'Know your rights as a renter. Get guidance on evictions, deposits, and disputes.', color: '#2563eb' },
  { icon: FileText, title: 'Labor Law Helper', desc: 'Understand worker rights, salary disputes, termination rules, and overtime laws.', color: '#60a5fa' },
  { icon: AlertTriangle, title: 'Contract Risk Detection', desc: 'AI highlights dangerous clauses, financial risks, and legal red flags in seconds.', color: '#ef4444' },
];

const testimonials = [
  { name: 'Tigist Bekele', role: 'Tenant, Addis Ababa', text: 'My landlord tried to evict me illegally. EthioLegal AI helped me understand my rights in Amharic and I was able to stay in my home.', stars: 5 },
  { name: 'Dawit Haile', role: 'Factory Worker, Hawassa', text: 'My employer was not paying overtime correctly. The AI explained Ethiopian labor law clearly and helped me draft a complaint letter.', stars: 5 },
  { name: 'Meron Tadesse', role: 'Small Business Owner', text: 'Before signing a supplier contract, I uploaded it to EthioLegal AI. It found 3 risky clauses I would have missed. Incredible tool!', stars: 5 },
];

const faqs = [
  { q: 'Is EthioLegal AI a substitute for a lawyer?', a: 'No. EthioLegal AI provides educational legal information only. It does not constitute official legal advice. For complex legal matters, always consult a licensed Ethiopian attorney.' },
  { q: 'What languages are supported?', a: 'EthioLegal AI supports English, Amharic (አማርኛ), and Afaan Oromo. You can switch languages at any time in your dashboard settings.' },
  { q: 'What types of documents can I upload?', a: 'You can upload rental agreements, employment contracts, legal notices, government forms, and other legal PDFs up to 25MB.' },
  { q: 'How does the contract risk detection work?', a: 'Our AI analyzes your document for potentially harmful clauses, unusual terms, financial risks, and legal red flags based on Ethiopian law.' },
  { q: 'Is my data private and secure?', a: 'Yes. All documents are encrypted at rest and in transit. We never share your data with third parties. You can delete your documents at any time.' },
  { q: 'Is there a free plan?', a: 'Yes. The free plan includes 5 AI chats per month and 2 document uploads. Premium plans unlock unlimited access and advanced analysis features.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: 'var(--background)', minHeight: '100vh', color: 'var(--foreground)' }}>
      {/* Navbar */}
      <nav style={{ background: 'rgba(8,11,24,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={20} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              <span style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EthioLegal</span>
              <span style={{ color: '#2563eb', marginLeft: 2 }}>AI</span>
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { name: 'Features', href: '#features' },
              { name: 'About', href: '#about' },
              { name: 'Pricing', href: '#pricing' }
            ].map(item => (
              <a key={item.name} href={item.href} 
                style={{ 
                  color: '#e2e8f0', 
                  cursor: 'pointer', 
                  fontSize: 15, 
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                className="hover:text-white hover:scale-105 transition-all"
                onMouseEnter={(e) => e.target.style.color = '#ffffff'}
                onMouseLeave={(e) => e.target.style.color = '#e2e8f0'}
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => navigate('/login')} 
              style={{ 
                color: '#f1f5f9', 
                padding: '10px 24px', 
                borderRadius: 10, 
                fontSize: 15, 
                fontWeight: 600, 
                border: '2px solid rgba(241, 245, 249, 0.3)', 
                background: 'rgba(241, 245, 249, 0.05)', 
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="hover:border-white hover:text-white hover:bg-white/10 transition-all"
            >
              Log in
            </button>
            <button onClick={() => navigate('/register')} 
              style={{ 
                background: 'linear-gradient(135deg, #2563eb, #60a5fa)', 
                color: 'white', 
                padding: '10px 24px', 
                borderRadius: 10, 
                fontSize: 15, 
                fontWeight: 700, 
                border: 'none', 
                cursor: 'pointer', 
                boxShadow: '0 0 25px rgba(37,99,235,0.5)',
                transition: 'all 0.2s ease'
              }}
              className="hover:opacity-90 hover:scale-105 transition-all"
            >
              Get Started
            </button>
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: '#0d1124', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { name: 'Features', href: '#features' },
                { name: 'About', href: '#about' },
                { name: 'Pricing', href: '#pricing' }
              ].map(item => (
                <a key={item.name} href={item.href} 
                  style={{ 
                    color: '#e2e8f0', 
                    fontSize: 16, 
                    padding: '8px 0', 
                    cursor: 'pointer',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <button onClick={() => navigate('/login')} 
                style={{ 
                  color: '#f1f5f9', 
                  padding: '12px', 
                  borderRadius: 10, 
                  border: '2px solid rgba(241, 245, 249, 0.3)', 
                  background: 'rgba(241, 245, 249, 0.05)', 
                  cursor: 'pointer',
                  fontWeight: 600,
                  marginTop: '8px'
                }}
              >
                Log in
              </button>
              <button onClick={() => navigate('/register')} 
                style={{ 
                  background: 'linear-gradient(135deg, #2563eb, #60a5fa)', 
                  color: 'white', 
                  padding: '12px', 
                  borderRadius: 10, 
                  border: 'none', 
                  cursor: 'pointer',
                  fontWeight: 700
                }}
              >
                Get Started Free
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '100px 24px 80px' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: -200, left: -200, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left content */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 24 }}>
              <Zap size={14} color="#2563eb" />
              <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 500 }}>AI-Powered Ethiopian Legal Assistant</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: -1 }}>
              Understand{' '}
              <span style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Ethiopian Laws
              </span>{' '}
              with AI
            </h1>

            <p style={{ fontSize: 18, color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: 36, maxWidth: 520 }}>
              Upload contracts, ask legal questions in Amharic, Oromo, or English — and get instant AI-powered explanations of your rights under Ethiopian law.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: 'white', padding: '14px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 0 30px rgba(37,99,235,0.4)' }}>
                Try Free <ArrowRight size={18} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/upload')}
                style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '14px 28px', borderRadius: 12, border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={18} /> Upload Legal Document
              </motion.button>
            </div>

            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { icon: Check, text: 'No signup required' },
                { icon: Shield, text: 'Secure & private' },
                { icon: Globe, text: 'Amharic support' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={16} color="#2563eb" />
                  <span style={{ fontSize: 14, color: 'var(--muted-foreground)' }}>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Chat mockup */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} style={{ position: 'relative' }}>
            {/* Floating feature pills */}
            <motion.div animate={{ y: [-6, 6, -6] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', top: -20, left: -20, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
              <Globe size={14} color="#34d399" />
              <span style={{ fontSize: 13, color: '#34d399', fontWeight: 500 }}>Amharic Ready</span>
            </motion.div>

            <motion.div animate={{ y: [6, -6, 6] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', bottom: 40, right: -30, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 100, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}>
              <AlertTriangle size={14} color="#f87171" />
              <span style={{ fontSize: 13, color: '#f87171', fontWeight: 500 }}>Risk Detected</span>
            </motion.div>

            {/* Chat card */}
            <div style={{ background: 'rgba(13,17,36,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)' }}>
              {/* Chat header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>EthioLegal AI</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2563eb' }} />
                    <span style={{ fontSize: 12, color: 'var(--muted-foreground)' }}>Active</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                <div style={{ background: 'var(--muted)', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', maxWidth: '85%', fontSize: 14, lineHeight: 1.6, color: 'var(--foreground)' }}>
                  Can my landlord evict me without notice in Ethiopia?
                </div>
                <div style={{ alignSelf: 'flex-end', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px 12px 4px 12px', padding: '10px 14px', maxWidth: '90%', fontSize: 14, lineHeight: 1.6, color: '#c7d2fe' }}>
                  Under Ethiopian law (Civil Code), a landlord must provide a minimum of 30 days written notice before eviction, except in cases of serious lease violations. You have the right to contest wrongful eviction in court. 🏛️
                </div>
                <div style={{ background: 'var(--muted)', borderRadius: '12px 12px 12px 4px', padding: '10px 14px', maxWidth: '85%', fontSize: 14, lineHeight: 1.6, color: 'var(--foreground)' }}>
                  ምን ማድረግ አለብኝ? (What should I do?)
                </div>
                {/* Typing indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={12} color="white" />
                  </div>
                  <div style={{ display: 'flex', gap: 4, background: 'var(--muted)', borderRadius: 10, padding: '8px 14px' }}>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} animate={{ y: [-3, 3, -3] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                        style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--muted)', borderRadius: 12, padding: '10px 14px', border: '1px solid var(--color-border)' }}>
                <Paperclip size={16} color={'var(--muted-foreground)'} />
                <span style={{ flex: 1, fontSize: 14, color: 'var(--muted-foreground)' }}>Ask a legal question in any language...</span>
                <Mic size={16} color={'var(--muted-foreground)'} />
                <div style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Send size={13} color="white" />
                </div>
              </div>

              <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
                <p style={{ fontSize: 11, color: '#fbbf24', margin: 0 }}>⚠️ Educational legal information only — not official legal advice.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '32px 24px', background: 'rgba(13,17,36,0.5)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 32, textAlign: 'center' }}>
          {[
            { label: 'Ethiopian Citizens Helped', value: '12,000+' },
            { label: 'Legal Questions Answered', value: '85,000+' },
            { label: 'Documents Analyzed', value: '4,200+' },
            { label: 'Risk Alerts Detected', value: '9,800+' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ fontSize: 32, fontWeight: 800, background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 16 }}>
              <Zap size={13} color="#2563eb" />
              <span style={{ fontSize: 13, color: '#2563eb', fontWeight: 600 }}>Powered by Advanced AI</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>
              Everything You Need to{' '}
              <span style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Know Your Rights</span>
            </h2>
            <p style={{ color: '#475569', fontSize: 18, maxWidth: 560, margin: '0 auto', fontWeight: 500, lineHeight: 1.6 }}>
              EthioLegal AI gives every Ethiopian citizen access to powerful legal knowledge — in their own language.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{ background: 'var(--card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28, cursor: 'pointer', transition: 'border-color 0.3s' }}
                className="hover:border-blue-500/30">
                <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, background: `${feature.color}20`, border: `1px solid ${feature.color}30` }}>
                  <feature.icon size={22} color={feature.color} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, fontWeight: 500 }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" style={{ padding: '100px 24px', background: 'rgba(37,99,235,0.02)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>
              About{' '}
              <span style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>EthioLegal AI</span>
            </h2>
            <p style={{ color: '#475569', fontSize: 18, maxWidth: 700, margin: '0 auto', fontWeight: 500, lineHeight: 1.7 }}>
              We believe every Ethiopian citizen deserves access to legal knowledge. Our AI-powered platform breaks down complex legal concepts into plain language, making Ethiopian law accessible to everyone.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40, alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 20, color: '#1e293b' }}>Our Mission</h3>
              <p style={{ color: '#475569', fontSize: 16, lineHeight: 1.7, marginBottom: 24, fontWeight: 500 }}>
                To democratize legal knowledge in Ethiopia by providing AI-powered assistance that helps citizens understand their rights, analyze contracts, and navigate legal challenges with confidence.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Empowering Ethiopian citizens with legal knowledge',
                  'Supporting multiple Ethiopian languages',
                  'Providing accessible, educational legal information',
                  'Building trust through transparency and accuracy'
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} color="#2563eb" />
                    </div>
                    <span style={{ color: '#475569', fontSize: 15, fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div style={{ background: 'white', borderRadius: 20, padding: 40, boxShadow: '0 20px 60px rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.1)' }}>
                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: '#1e293b' }}>Why Choose EthioLegal AI?</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[
                    { title: 'Ethiopian Law Expertise', desc: 'Trained specifically on Ethiopian legal codes and regulations' },
                    { title: 'Multilingual Support', desc: 'Available in English, Amharic, and Afaan Oromo' },
                    { title: 'Privacy First', desc: 'Your documents and conversations are encrypted and secure' },
                    { title: 'Always Learning', desc: 'Continuously updated with latest legal developments' }
                  ].map((item, i) => (
                    <div key={i}>
                      <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: '#1e293b' }}>{item.title}</h4>
                      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,36,0.5)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 16, color: '#f1f5f9' }}>How EthioLegal AI Works</h2>
            <p style={{ color: '#cbd5e1', fontSize: 17, fontWeight: 500 }}>Three simple steps to understanding your legal rights</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 32 }}>
            {[
              { step: '01', title: 'Ask or Upload', desc: 'Type your legal question in any language, or upload a contract/document PDF for analysis.', icon: MessageSquare, color: '#2563eb' },
              { step: '02', title: 'AI Analyzes', desc: 'Our AI trained on Ethiopian law instantly processes your question or document and identifies key legal points.', icon: Zap, color: '#60a5fa' },
              { step: '03', title: 'Get Clear Answers', desc: 'Receive plain-language explanations, risk alerts, and recommended actions you can act on immediately.', icon: Check, color: '#93c5fd' },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${item.color}15`, border: `2px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', position: 'relative' }}>
                  <item.icon size={32} color={item.color} />
                  <div style={{ position: 'absolute', top: -8, right: -8, background: item.color, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'white' }}>{item.step.slice(1)}</div>
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#f1f5f9' }}>{item.title}</h3>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontWeight: 500 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Multilingual section */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 60, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 100, padding: '6px 16px', marginBottom: 20 }}>
              <Globe size={13} color="#34d399" />
              <span style={{ fontSize: 13, color: '#34d399' }}>Multilingual AI</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 16 }}>Legal Help in Your Own Language</h2>
            <p style={{ color: '#64748b', fontSize: 17, lineHeight: 1.7, marginBottom: 32 }}>
              Ethiopia is a diverse nation. EthioLegal AI breaks language barriers so every citizen can access legal knowledge — whether you speak English, Amharic, or Afaan Oromo.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { lang: 'English', example: '"What are my rights as a tenant?"', flag: '🇬🇧' },
                { lang: 'Amharic', example: '"እንደ ተከራይ ምን መብቶች አሉኝ?"', flag: '🇪🇹' },
                { lang: 'Afaan Oromo', example: '"Mirga ijaarraa koo maal?"', flag: '🟢' },
              ].map(item => (
                <div key={item.lang} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--card)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '12px 16px' }}>
                  <span style={{ fontSize: 24 }}>{item.flag}</span>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--muted-foreground)', marginBottom: 2 }}>{item.lang}</div>
                    <div style={{ fontSize: 15, color: 'var(--foreground)' }}>{item.example}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div style={{ background: 'rgba(13,17,36,0.9)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                {['English', 'አማርኛ', 'Oromo'].map((lang, i) => (
                  <button key={lang} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer', background: i === 1 ? 'linear-gradient(135deg, #2563eb, #60a5fa)' : 'var(--muted)', color: i === 1 ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>{lang}</button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: 'var(--muted)', borderRadius: '12px 12px 12px 4px', padding: '12px 16px', fontSize: 14, color: 'var(--foreground)' }}>ቤቴን ያለ ማስጠንቀቂያ ለቀቅ ብለው ነው?</div>
                <div style={{ alignSelf: 'flex-end', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px 12px 4px 12px', padding: '12px 16px', fontSize: 14, color: '#c7d2fe', lineHeight: 1.6 }}>
                  በኢትዮጵያ ሕግ መሰረት, ቤት አከራይ ቢያንስ 30 ቀን የጽሑፍ ማስጠንቀቂያ ሳይሰጥ ሊያስወጣዎ አይችልም። ይህ መብትዎ ነው። 🏛️
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tenant & Labor sections */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,36,0.5)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {[
            { title: 'Tenant Rights Assistant', desc: 'Know your rights against unlawful eviction, unfair deposits, and illegal rent hikes. Get instant guidance on Ethiopian housing law.', icon: Shield, color: '#2563eb', items: ['Eviction rights', 'Deposit disputes', 'Rent increase limits', 'Repair obligations'], path: '/app/tenant-rights' },
            { title: 'Labor Law Assistant', desc: 'Understand your workplace rights including salary disputes, wrongful termination, overtime pay, and employee protections under Ethiopian labor law.', icon: TrendingUp, color: '#60a5fa', items: ['Overtime rights', 'Termination guidelines', 'Salary dispute help', 'Worker protections'], path: '/app/labor-law' },
          ].map(section => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ background: 'var(--card)', border: '1px solid var(--color-border)', borderRadius: 20, padding: 32 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${section.color}15`, border: `1px solid ${section.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                <section.icon size={26} color={section.color} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{section.title}</h3>
              <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.7, marginBottom: 20 }}>{section.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {section.items.map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--muted-foreground)' }}>
                    <Check size={14} color={section.color} />{item}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate(section.path)} style={{ background: `${section.color}15`, border: `1px solid ${section.color}30`, color: section.color, padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                Explore <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={{ padding: '100px 24px', background: 'rgba(37,99,235,0.02)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16, color: '#1e293b' }}>
              Simple, Transparent{' '}
              <span style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Pricing</span>
            </h2>
            <p style={{ color: '#475569', fontSize: 18, maxWidth: 600, margin: '0 auto', fontWeight: 500, lineHeight: 1.6 }}>
              Choose the plan that works best for you. Start free and upgrade as your legal needs grow.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 900, margin: '0 auto' }}>
            {[
              {
                name: 'Free',
                price: '0',
                period: 'Forever',
                description: 'Perfect for occasional legal questions',
                features: [
                  '5 AI chats per month',
                  '2 document uploads',
                  'Basic contract analysis',
                  'Amharic & Oromo support',
                  'Email support'
                ],
                buttonText: 'Get Started Free',
                popular: false
              },
              {
                name: 'Pro',
                price: '299',
                period: 'per month',
                description: 'Ideal for individuals and small businesses',
                features: [
                  'Unlimited AI chats',
                  'Unlimited document uploads',
                  'Advanced risk detection',
                  'Priority support',
                  'Document templates',
                  'Legal form generator'
                ],
                buttonText: 'Start Pro Trial',
                popular: true
              },
              {
                name: 'Business',
                price: '999',
                period: 'per month',
                description: 'For teams and growing businesses',
                features: [
                  'Everything in Pro',
                  'Team collaboration',
                  'Custom legal templates',
                  'API access',
                  'Dedicated support',
                  'Training sessions'
                ],
                buttonText: 'Contact Sales',
                popular: false
              }
            ].map((plan, i) => (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ 
                  background: 'white', 
                  border: plan.popular ? '2px solid #2563eb' : '1px solid rgba(37,99,235,0.1)', 
                  borderRadius: 20, 
                  padding: 32, 
                  position: 'relative',
                  boxShadow: plan.popular ? '0 20px 60px rgba(37,99,235,0.15)' : '0 10px 40px rgba(37,99,235,0.05)'
                }}>
                {plan.popular && (
                  <div style={{ 
                    position: 'absolute', 
                    top: -12, 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    background: 'linear-gradient(135deg, #2563eb, #60a5fa)', 
                    color: 'white', 
                    padding: '6px 20px', 
                    borderRadius: 100, 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    Most Popular
                  </div>
                )}
                
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#1e293b' }}>{plan.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#64748b' }}>ETB</span>
                    <span style={{ fontSize: 40, fontWeight: 800, color: '#1e293b' }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: '#64748b' }}>/{plan.period}</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500 }}>{plan.description}</p>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {plan.features.map((feature, j) => (
                    <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(37,99,235,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={12} color="#2563eb" />
                      </div>
                      <span style={{ color: '#475569', fontSize: 14, fontWeight: 500 }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => navigate(plan.name === 'Free' ? '/register' : '/contact')}
                  style={{ 
                    width: '100%',
                    background: plan.popular ? 'linear-gradient(135deg, #2563eb, #60a5fa)' : 'rgba(37,99,235,0.08)', 
                    color: plan.popular ? 'white' : '#2563eb', 
                    border: plan.popular ? 'none' : '1px solid rgba(37,99,235,0.2)', 
                    padding: '14px 24px', 
                    borderRadius: 12, 
                    fontSize: 15, 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:opacity-90 hover:scale-105 transition-all"
                >
                  {plan.buttonText}
                </button>
              </motion.div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <p style={{ color: '#64748b', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
              All plans include our core AI legal assistant and multilingual support
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
              {[
                '30-day money-back guarantee',
                'Cancel anytime',
                'No setup fees'
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Check size={14} color="#2563eb" />
                  <span style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 12, color: '#1e293b' }}>Trusted by Ethiopian Citizens</h2>
            <p style={{ color: '#475569', fontSize: 17, fontWeight: 500 }}>Real stories from people who understood their rights</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                style={{ background: 'var(--card)', border: '1px solid var(--color-border)', borderRadius: 16, padding: 28 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={14} fill="#2563eb" color="#2563eb" />)}
                </div>
                <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: 20, fontSize: 15, fontWeight: 500 }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'white' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>{t.name}</div>
                    <div style={{ color: '#64748b', fontSize: 13, fontWeight: 500 }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '80px 24px', background: 'rgba(13,17,36,0.5)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, marginBottom: 12, color: '#f1f5f9' }}>Frequently Asked Questions</h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                style={{ background: 'var(--card)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#f1f5f9', textAlign: 'left', fontSize: 15, fontWeight: 600 }}>
                  {faq.q}
                  <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} color={'#cbd5e1'} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <div style={{ padding: '0 20px 18px', color: '#cbd5e1', fontSize: 14, lineHeight: 1.7, fontWeight: 500 }}>{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 24, padding: '64px 40px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, marginBottom: 16 }}>
              Know Your Rights.<br />
              <span style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Start Free Today.</span>
            </h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 18, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
              Join thousands of Ethiopian citizens who use EthioLegal AI to understand their legal rights and protect themselves.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/register')}
                style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: 'var(--primary-foreground)', padding: '16px 36px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 17, fontWeight: 700, boxShadow: '0 0 40px rgba(37,99,235,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                Get Started Free <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px 32px', background: 'rgba(8,11,24,0.9)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={16} color="white" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 17 }}>EthioLegal <span style={{ color: '#2563eb' }}>AI</span></span>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.7 }}>AI-powered Ethiopian legal assistant for citizens, students, workers, and small businesses.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'AI Chat', 'Document Upload', 'Contract Analysis'] },
              { title: 'Assistants', links: ['Tenant Rights', 'Labor Law', 'Contract Review', 'Legal Explain'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>{col.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(link => <li key={link} style={{ color: 'var(--muted-foreground)', fontSize: 14, cursor: 'pointer' }} className="hover:text-slate-300 transition-colors">{link}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>© 2026 EthioLegal AI. All rights reserved.</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, maxWidth: 500, textAlign: 'right' }}>
              This platform provides educational legal information and not official legal advice. Always consult a licensed Ethiopian attorney for legal matters.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
