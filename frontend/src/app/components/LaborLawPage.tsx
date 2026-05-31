import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { TrendingUp, MessageSquare, AlertTriangle, DollarSign, Clock, Shield, FileText, Users, ChevronRight, Briefcase, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { askLaborAssistantRequest } from '../api/laborAssistant';

const rights = [
  { icon: Clock, title: 'Working Hours & Overtime', law: 'Labor Proc. 1156/2019 Art. 61', desc: 'Maximum 8 hours/day, 48 hours/week. Overtime must be paid at 125% of regular rate. Weekend work: 150%. Night shift (10pm–6am): 175%.', color: '#2563eb', highlight: ['8 hrs/day max', 'OT: 125%', 'Weekend: 150%'] },
  { icon: DollarSign, title: 'Wage & Salary Rights', law: 'Labor Proc. 1156/2019 Art. 62', desc: 'Wages must be paid on time as per contract. Employers cannot make unauthorized deductions. Workers have the right to a detailed payslip showing all deductions.', color: '#60a5fa', highlight: ['On-time payment', 'No unauthorized cuts', 'Payslip required'] },
  { icon: Shield, title: 'Termination Rights', law: 'Labor Proc. 1156/2019 Art. 28', desc: 'Termination requires a valid cause. Minimum 30 days notice required. Wrongful termination entitles you to severance pay and legal remedies.', color: '#93c5fd', highlight: ['Valid cause needed', '30 days notice', 'Severance pay'] },
  { icon: Users, title: 'Maternity & Leave Rights', law: 'Labor Proc. 1156/2019 Art. 87', desc: 'Female employees get 90 days paid maternity leave. All employees get 16 days annual leave after 1 year. Sick leave: 6 months (with pay for 3 months).', color: '#2563eb', highlight: ['90 days maternity', '16 days annual leave', '6 months sick leave'] },
  { icon: Briefcase, title: 'Workplace Safety', law: 'Labor Proc. 1156/2019 Art. 93', desc: 'Employers must provide a safe work environment. Workers can refuse dangerous work. Workplace injuries are covered by employer liability.', color: '#60a5fa', highlight: ['Safe environment', 'Refuse danger', 'Injury coverage'] },
  { icon: FileText, title: 'Employment Contract Rights', law: 'Labor Proc. 1156/2019 Art. 10', desc: 'All employment must be based on a written contract. Contract must include job title, salary, working hours, leave entitlement, and termination conditions.', color: '#93c5fd', highlight: ['Written contract', 'Clear terms', 'Transparent salary'] },
];

const severanceCalc = [
  { years: '< 1 year', amount: '15 days salary' },
  { years: '1-3 years', amount: '30 days salary' },
  { years: '3-5 years', amount: '45 days salary' },
  { years: '5-10 years', amount: '60 days salary' },
  { years: '10+ years', amount: '90 days salary' },
];

const faqs = [
  { q: 'My employer hasn\'t paid me for 2 months. What can I do?', a: 'You can file a formal complaint with the Ethiopian Ministry of Labor and Social Affairs (MoLSA). Gather payslips, bank records, and your employment contract. You may also file a civil claim at the labor court. Keep detailed records of all unpaid wages.' },
  { q: 'Can I be fired for joining a labor union?', a: 'No. Anti-union discrimination is illegal under Ethiopian labor law. Dismissal for union activities is wrongful termination and entitles you to full severance pay and possible reinstatement.' },
  { q: 'What constitutes wrongful termination?', a: 'Termination without valid cause, without proper notice, for discriminatory reasons (union, gender, religion), or during maternity leave are all wrongful. You can claim reinstatement or severance compensation at the labor court.' },
  { q: 'Am I entitled to overtime if I\'m a manager?', a: 'Managerial staff may be exempt from overtime requirements if their job classification falls under executive/managerial roles. However, this must be clearly stated in your employment contract. If unclear, you may be entitled to overtime.' },
];

export default function LaborLawPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [assistantError, setAssistantError] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Unpaid salary',
    'Overtime pay',
    'Termination notice',
    'Severance entitlement',
  ]);

  const laborMutation = useMutation({
    mutationFn: askLaborAssistantRequest,
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
    laborMutation.mutate({ message: payload });
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(249,115,22,0.15))', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={24} color="#2563eb" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 2 }}>Labor Law Assistant</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>Understand your worker rights under Ethiopian Labour Proclamation 1156/2019.</p>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
          {[
            { label: 'Min. Notice Period', value: '30 Days', color: '#2563eb' },
            { label: 'Annual Leave', value: '16 Days', color: '#60a5fa' },
            { label: 'Overtime Rate', value: '125%+', color: '#93c5fd' },
            { label: 'Maternity Leave', value: '90 Days', color: '#2563eb' },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, marginBottom: 3 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rights grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 20 }}>Your Worker Rights</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
          {rights.map((right, i) => (
            <motion.div key={right.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${right.color}15`, border: `1px solid ${right.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <right.icon size={18} color={right.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{right.title}</h3>
                  <span style={{ fontSize: 11, color: right.color, background: `${right.color}10`, padding: '2px 8px', borderRadius: 100 }}>{right.law}</span>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 12 }}>{right.desc}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {right.highlight.map(h => (
                  <span key={h} style={{ padding: '3px 10px', borderRadius: 100, background: `${right.color}10`, border: `1px solid ${right.color}20`, fontSize: 11, color: right.color, fontWeight: 600 }}>{h}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Severance calculator */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <DollarSign size={18} color="#2563eb" />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Severance Pay Guide</h2>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>Labor Proc. 1156/2019 Art. 44</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Years of Service</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Severance Entitlement</th>
                <th style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontSize: 13, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {severanceCalc.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '12px 16px', color: '#e2e8f0', fontSize: 14, fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.years}</td>
                  <td style={{ padding: '12px 16px', color: '#2563eb', fontSize: 14, fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{row.amount}</td>
                  <td style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle size={13} color="#2563eb" /><span style={{ fontSize: 12, color: '#2563eb' }}>Legally guaranteed</span></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10 }}>
          <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>Note: Severance entitlement applies to termination by employer without valid cause. Voluntary resignation may not qualify. Consult an attorney for your specific situation.</p>
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 20 }}>Common Worker Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: '#e2e8f0', textAlign: 'left', fontSize: 14, fontWeight: 600, gap: 12 }}>
                <span>{faq.q}</span>
                <motion.div animate={{ rotate: openFaq === i ? 90 : 0 }} style={{ flexShrink: 0 }}>
                  <ChevronRight size={16} color="#64748b" />
                </motion.div>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 16px', color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(99,102,241,0.08))', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Have a Workplace Dispute?</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>Describe your situation and get personalized guidance from our AI legal assistant.</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {suggestedPrompts.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  setQuestion(tag);
                  submitQuestion(tag);
                }}
                style={{ padding: '4px 12px', borderRadius: 100, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', fontSize: 12, color: '#2563eb', cursor: 'pointer' }}
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
                placeholder="Describe your labor issue..."
                style={{ flex: 1, minWidth: 240, background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(148,163,184,0.2)', borderRadius: 10, padding: '10px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none' }}
              />
              <button
                onClick={() => submitQuestion()}
                disabled={laborMutation.isPending}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #2563eb, #60a5fa)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700, opacity: laborMutation.isPending ? 0.7 : 1 }}
              >
                {laborMutation.isPending ? 'Asking...' : 'Ask Labor AI'}
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
          <MessageSquare size={18} /> Ask Labor AI
        </button>
      </motion.div>

      <div style={{ marginTop: 24, padding: 14, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10 }}>
        <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>⚠️ Educational information only — not official legal advice. Consult a licensed Ethiopian labor attorney for legal representation.</p>
      </div>
    </div>
  );
}
