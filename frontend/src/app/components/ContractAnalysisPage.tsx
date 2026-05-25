import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle, Shield, FileSearch, Upload, Info, TrendingDown, DollarSign, Clock } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getContractAnalysisRequest } from '../api/contracts';
import type { ContractAnalysis, RiskLevel } from '../api/contracts';


const riskConfig = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'High Risk', icon: AlertTriangle },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'Medium Risk', icon: Info },
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)', label: 'Low Risk', icon: CheckCircle },
};

export default function ContractAnalysisPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const documentId = params.get('documentId');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contract-analysis', documentId],
    queryFn: () => getContractAnalysisRequest(documentId as string),
    enabled: Boolean(documentId),
  });

  if (!documentId) {
    return (
      <div style={{ padding: '48px 28px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Select a document to analyze</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Choose a document from your library or upload a new contract to view its risk analysis.</p>
        <button onClick={() => navigate('/app/documents')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          View My Documents
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div style={{ color: '#94a3b8', padding: '48px', textAlign: 'center' }}>Loading contract analysis...</div>;
  }

  if (isError || !data?.analysis) {
    return (
      <div style={{ padding: '48px 28px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Analysis not available yet</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Run a fresh analysis by uploading the document again.</p>
        <button onClick={() => navigate('/app/upload')} style={{ padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          Analyze New Contract
        </button>
      </div>
    );
  }

  const analysis: ContractAnalysis = data.analysis;
  const clauses = analysis.risks?.length
    ? analysis.risks.map(risk => ({
        text: risk.clause,
        risk: risk.severity as RiskLevel,
        article: risk.article || 'General guidance',
        explanation: risk.explanation,
        safer: risk.safer || null,
      }))
    : [];

  const radarData = analysis.riskBreakdown?.length
    ? analysis.riskBreakdown.map(item => ({ subject: item.subject, A: item.score, fullMark: 100 }))
    : [];

  const financialRisks = analysis.financialRisks?.length ? analysis.financialRisks : [];
  const fileLabel = analysis.fileName || data.document?.filename || 'Contract';
  const riskScore = analysis.riskScore ?? 0;
  const aiConfidence = analysis.aiConfidence ?? 0;

  const highCount = clauses.filter(c => c.risk === 'high').length;
  const medCount = clauses.filter(c => c.risk === 'medium').length;
  const lowCount = clauses.filter(c => c.risk === 'low').length;

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Contract Risk Analysis</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>AI-powered analysis of rental_agreement_bole.pdf</p>
          </div>
          <button onClick={() => navigate('/app/upload')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <Upload size={14} /> Analyze New Contract
          </button>
        </div>
      </motion.div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Overall Risk', value: '68/100', color: '#f59e0b', icon: TrendingDown, desc: 'Medium Risk' },
          { label: 'High Risk Clauses', value: highCount, color: '#ef4444', icon: AlertTriangle, desc: 'Require action' },
          { label: 'Medium Risk', value: medCount, color: '#f59e0b', icon: Info, desc: 'Review needed' },
          { label: 'Safe Clauses', value: lowCount, color: '#10b981', icon: CheckCircle, desc: 'Compliant' },
          { label: 'AI Confidence', value: '96%', color: '#6366f1', icon: Shield, desc: 'Analysis accuracy' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <stat.icon size={16} color={stat.color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, marginBottom: 2 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{stat.desc}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Radar chart */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Clause Risk Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
              <Radar name="Risk Score" dataKey="A" stroke="#6366f1" fill="rgba(99,102,241,0.2)" strokeWidth={2} />
              <Tooltip contentStyle={{ background: '#0d1124', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 13 }} />
            </RadarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: 12, color: '#475569', textAlign: 'center', marginTop: 8 }}>Higher score = more favorable for tenant</p>
        </motion.div>

        {/* Financial risks */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <DollarSign size={16} color="#f59e0b" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Financial Risk Exposure</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Monthly Rent', value: '8,500 ETB', note: 'Standard market rate', risk: false },
              { label: 'Security Deposit', value: '17,000 ETB', note: '2 months — negotiate to 1', risk: true },
              { label: 'Potential Repair Liability', value: 'Unknown', note: 'High risk — no cap specified', risk: true },
              { label: 'Early Termination Fee', value: 'Not specified', note: 'Unclear — request clarification', risk: true },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: item.risk ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${item.risk ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{item.note}</div>
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: item.risk ? '#f87171' : '#e2e8f0' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detailed clause analysis */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <FileSearch size={18} color="#6366f1" />
          <h2 style={{ fontSize: 17, fontWeight: 700 }}>Detected Clauses ({clauses.length})</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {clauses.map((clause, i) => {
            const conf = riskConfig[clause.risk as keyof typeof riskConfig];
            const Icon = conf.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.06 }}
                style={{ background: conf.bg, border: `1px solid ${conf.border}`, borderRadius: 14, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${conf.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                    <Icon size={14} color={conf.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: conf.color, background: conf.bg, border: `1px solid ${conf.border}`, padding: '2px 9px', borderRadius: 100 }}>{conf.label}</span>
                      <span style={{ fontSize: 11, color: '#475569' }}>📚 {clause.article}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#e2e8f0', fontStyle: 'italic', marginBottom: 8 }}>"{clause.text}"</div>
                    <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: clause.safer ? 10 : 0 }}>{clause.explanation}</p>
                    {clause.safer && (
                      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ fontSize: 11, fontWeight: 600, color: '#10b981', marginBottom: 4 }}>✏️ SAFER ALTERNATIVE</div>
                        <p style={{ fontSize: 13, color: '#6ee7b7', lineHeight: 1.6, margin: 0 }}>"{clause.safer}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <div style={{ marginTop: 24, padding: 16, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 12 }}>
        <p style={{ fontSize: 12, color: '#fbbf24', lineHeight: 1.6, margin: 0 }}>
          ⚠️ This analysis is for educational purposes only and does not constitute legal advice. AI analysis may not capture all legal nuances. Consult a licensed Ethiopian attorney before signing any legal document.
        </p>
      </div>
    </div>
  );
}
