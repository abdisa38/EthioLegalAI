import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Shield, MessageSquare, AlertTriangle, Home, DollarSign, Clock, Wrench, FileText, Phone, ChevronRight, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { askTenantAssistantRequest } from '../api/tenantAssistant';

const emergencyCards = [
  { icon: AlertTriangle, title: 'Illegal Eviction Threatened', color: '#ef4444', desc: 'If your landlord threatens immediate eviction without notice, you have the right to stay. Contact local Woreda office immediately.', action: 'Get Emergency Help' },
  { icon: DollarSign, title: 'Deposit Not Returned', color: '#2563eb', desc: 'Landlord must return your security deposit within 30 days of lease end. You can file a civil claim if withheld unfairly.', action: 'Know Your Options' },
  { icon: Phone, title: 'Harassment by Landlord', color: '#60a5fa', desc: 'Repeated unlawful entry or harassment is illegal. Document incidents and report to local police or housing authority.', action: 'Report Harassment' },
];

const rights = [
  { icon: Home, title: 'Right to Proper Notice', law: 'Civil Code Art. 2975', desc: 'Your landlord must give you a minimum of 30 days written notice before eviction, except for serious lease violations. Verbal notice is not legally sufficient.', color: '#2563eb' },
  { icon: DollarSign, title: 'Security Deposit Rights', law: 'Civil Code Art. 2955', desc: 'Your security deposit must be returned within 30 days of lease termination. Deductions must be itemized in writing. You can contest unfair deductions in court.', color: '#60a5fa' },
  { icon: Wrench, title: 'Repair & Maintenance Rights', law: 'Housing Proc. 35/1998', desc: 'Major structural repairs — roof, plumbing, electrical — are the landlord\'s responsibility. You cannot be evicted for requesting legally required repairs.', color: '#93c5fd' },
  { icon: Clock, title: 'Right Against Rent Hikes', law: 'Civil Code Art. 2950', desc: 'Rent increases during an active lease term are generally not allowed unless your contract specifically allows it. Month-to-month tenants have stronger protections.', color: '#2563eb' },
  { icon: Shield, title: 'Privacy Rights', law: 'Civil Code Art. 2910', desc: 'Your landlord must give at least 24 hours notice before entering your home, except in genuine emergencies. Unauthorized entry is trespass.', color: '#60a5fa' },
  { icon: FileText, title: 'Written Contract Rights', law: 'Civil Code Art. 2940', desc: 'You have the right to a written rental agreement. Verbal-only agreements give you fewer protections. Always insist on a written contract before moving in.', color: '#93c5fd' },
];

const faqs = [
  { q: 'Can my landlord evict me during winter or holiday seasons?', a: 'Ethiopian law does not have seasonal eviction protections, but proper notice must still be given. Contact local Woreda housing office if eviction seems unlawful.' },
  { q: 'What if my landlord changes the locks?', a: 'Changing locks without notice is illegal forced eviction. You can report this to police and seek emergency court relief. Document everything with photos and witnesses.' },
  { q: 'Can I withhold rent if my landlord won\'t make repairs?', a: 'Withholding rent is legally risky. Instead, send a written repair request, keep copies, and contact the Woreda housing office. Courts may order the landlord to make repairs.' },
  { q: 'How do I dispute unfair deposit deductions?', a: 'Request an itemized deduction list in writing. If deductions are unreasonable, you can file a claim at the local first-instance court. Keep all receipts and photos of the property.' },
];

export default function TenantRightsPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [assistantError, setAssistantError] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Eviction notice',
    'Deposit dispute',
    'Rent increase',
    'Illegal entry',
  ]);

  const tenantMutation = useMutation({
    mutationFn: askTenantAssistantRequest,
    onSuccess: data => {
      setAnswer(data.answer);
      setSuggestedPrompts(data.suggestedPrompts);
      setAssistantError('');
    },
    onError: error => {
      const message = error instanceof Error ? error.message : 'Unable to get an answer right now.';
      setAssistantError(message);
    },
  });

  const submitQuestion = (value?: string) => {
    const payload = (value ?? question).trim();
    if (!payload) return;
    setAnswer('');
    setAssistantError('');
    tenantMutation.mutate({ message: payload });
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={24} color="#2563eb" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--foreground)', marginBottom: 2 }}>Tenant Rights Assistant</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 15 }}>Know your rights as a renter under Ethiopian housing law.</p>
          </div>
        </div>

        {/* Emergency banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '14px 18px' }}>
          <AlertTriangle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: '#fca5a5', lineHeight: 1.5 }}>
            <strong>Emergency?</strong> If you're being illegally evicted right now, call the <strong>Ethiopian Legal Aid hotline: 0115-570-299</strong> or visit your local Woreda housing office immediately.
          </span>
        </div>
      </motion.div>

      {/* Emergency cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 36 }}>
        {emergencyCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            style={{ background: `${card.color}08`, border: `1px solid ${card.color}20`, borderRadius: 14, padding: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <card.icon size={20} color={card.color} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>{card.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--muted-foreground)', lineHeight: 1.6, marginBottom: 14 }}>{card.desc}</p>
            <button onClick={() => navigate('/app/chat')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: card.color, background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              {card.action} <ChevronRight size={14} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Your rights */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 20 }}>Your Rights Under Ethiopian Law</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {rights.map((right, i) => (
            <motion.div key={right.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.08 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 22 }}
              className="hover:border-white/10 transition-colors">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${right.color}15`, border: `1px solid ${right.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <right.icon size={18} color={right.color} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{right.title}</h3>
                    <span style={{ fontSize: 11, color: right.color, background: `${right.color}10`, padding: '2px 8px', borderRadius: 100, border: `1px solid ${right.color}20` }}>{right.law}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6 }}>{right.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 20 }}>Common Tenant Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#e2e8f0', textAlign: 'left', fontSize: 14, fontWeight: 600 }}>
                {faq.q}
                <motion.div animate={{ rotate: openFaq === i ? 90 : 0 }} style={{ flexShrink: 0 }}>
                  <ChevronRight size={16} color="#64748b" />
                </motion.div>
              </button>
              {openFaq === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                  <div style={{ padding: '0 20px 16px', color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>{faq.a}</div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI chat CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.08))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Have a Specific Tenant Question?</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>Ask our AI about your exact situation. Get answers in English, Amharic, or Afaan Oromo.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {suggestedPrompts.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setQuestion(tag);
                  submitQuestion(tag);
                }}
                style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: 12, color: '#34d399', cursor: 'pointer' }}
              >
                {tag}
              </button>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                value={question}
                onChange={event => setQuestion(event.target.value)}
                placeholder="Describe your tenant issue..."
                style={{ flex: 1, minWidth: 240, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, padding: '10px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={() => submitQuestion()}
                disabled={tenantMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #60a5fa)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: tenantMutation.isPending ? 0.7 : 1 }}
              >
                {tenantMutation.isPending ? 'Asking...' : 'Ask Tenant AI'}
              </button>
            </div>
            {assistantError && (
              <div style={{ marginTop: 10, color: '#fca5a5', fontSize: 12 }}>{assistantError}</div>
            )}
            {answer && (
              <div style={{ marginTop: 12, background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 12, padding: '12px 14px', color: '#cbd5e1', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {answer}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => navigate('/app/chat')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #2563eb, #60a5fa)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          <MessageSquare size={18} /> Chat with AI
        </button>
      </motion.div>

      <div style={{ marginTop: 24, padding: 14, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10 }}>
        <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>⚠️ Educational information only — not official legal advice. Consult a licensed Ethiopian attorney for legal representation in disputes.</p>
      </div>
    </div>
  );
}
