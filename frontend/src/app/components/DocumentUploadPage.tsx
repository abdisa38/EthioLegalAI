import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { useMutation } from '@tanstack/react-query';
import {
  Upload, FileText, CheckCircle, AlertTriangle, Zap, Shield,
  Clock, FileSearch, X, Download, MessageSquare, ChevronDown,
  ChevronRight, Info, Calendar, TrendingDown, Eye, RefreshCw,
  FileX, Printer, SplitSquareHorizontal, List, BarChart3
} from 'lucide-react';
import { uploadDocumentRequest } from '../api/documents';
import { analyzeContractRequest } from '../api/contracts';
import type { DocumentRecord } from '../api/documents';
import type { ContractAnalysis } from '../api/contracts';

// ─── Types & constants ────────────────────────────────────────────────────────

type Stage = 'idle' | 'validating' | 'uploading' | 'scanning' | 'results';
type TabId = 'summary' | 'risks' | 'clauses' | 'timeline' | 'sidebyside';
type Risk = 'high' | 'medium' | 'low';

const SCAN_STEPS = [
  { label: 'Reading document content...', dur: 800 },
  { label: 'Identifying document type...', dur: 600 },
  { label: 'Extracting key clauses...', dur: 900 },
  { label: 'Running risk analysis...', dur: 1100 },
  { label: 'Checking Ethiopian law compliance...', dur: 1000 },
  { label: 'Generating AI summary...', dur: 800 },
];

const ACCEPTED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
const ACCEPTED_EXT = ['.pdf', '.docx', '.doc', '.jpg', '.jpeg', '.png'];

// ─── Mock analysis result ─────────────────────────────────────────────────────

const RESULT = {
  fileName: '',
  riskScore: 68,
  docType: 'Residential Rental Agreement',
  aiConfidence: 96,
  summary: 'This is a 12-month residential rental agreement for a property in Bole Sub-City, Addis Ababa. The tenant agrees to pay 8,500 ETB per month with a 2-month security deposit. The agreement contains standard maintenance and payment clauses, but includes two provisions that conflict with Ethiopian tenant protection law.',
  keyFacts: [
    { label: 'Monthly Rent', value: '8,500 ETB', risk: false },
    { label: 'Lease Duration', value: '12 months', risk: false },
    { label: 'Security Deposit', value: '17,000 ETB (2 months)', risk: true },
    { label: 'Notice Period', value: '7 days (ILLEGAL)', risk: true },
    { label: 'Property', value: 'Bole Sub-City, Addis Ababa', risk: false },
  ],
  risks: [
    {
      id: 1, severity: 'high' as Risk,
      clause: 'Landlord may terminate the rental agreement with 7 days written notice for any reason.',
      explanation: 'Ethiopian Civil Code Art. 2975 mandates a minimum of 30 days written notice before eviction. This clause is legally unenforceable and violates mandatory tenant protection law.',
      article: 'Civil Code Art. 2975',
      safer: 'Landlord may terminate this agreement by providing Tenant with a minimum of thirty (30) days advance written notice, as required by Ethiopian Civil Code Art. 2975.',
      confidence: 98,
    },
    {
      id: 2, severity: 'high' as Risk,
      clause: 'Tenant assumes full and sole responsibility for all property maintenance, repairs, and structural upkeep.',
      explanation: 'Under Housing Proclamation 35/1998, structural and major repairs are the landlord\'s legal obligation. A tenant can only be held responsible for damage caused by proven negligence.',
      article: 'Housing Proc. 35/1998',
      safer: 'Tenant shall maintain the property in good condition and promptly report defects. Structural repairs and major maintenance shall remain the Landlord\'s responsibility per Housing Proclamation 35/1998.',
      confidence: 95,
    },
    {
      id: 3, severity: 'medium' as Risk,
      clause: 'Security deposit of two (2) months rent payable in full prior to tenancy commencement.',
      explanation: 'While not illegal, a 2-month deposit is above the common 1-month standard in Addis Ababa. The agreement also does not specify the return timeline.',
      article: 'Civil Code Art. 2955',
      safer: 'A security deposit of one (1) month rent shall be paid prior to occupancy and returned within thirty (30) days of lease termination, minus documented deductions.',
      confidence: 82,
    },
    {
      id: 4, severity: 'medium' as Risk,
      clause: 'Landlord reserves the right to enter the rental property at any time without prior notice.',
      explanation: 'Civil Code Art. 2910 requires landlords to provide at least 24 hours advance notice before entry, except in genuine emergencies.',
      article: 'Civil Code Art. 2910',
      safer: 'Landlord may enter the premises upon providing at least twenty-four (24) hours advance written or verbal notice, except in cases of emergency.',
      confidence: 89,
    },
    {
      id: 5, severity: 'low' as Risk,
      clause: 'Subletting the property without prior written landlord consent is strictly prohibited.',
      explanation: 'This is a standard and legally compliant restriction under Ethiopian rental law.',
      article: 'Civil Code Art. 2920',
      safer: null,
      confidence: 99,
    },
    {
      id: 6, severity: 'low' as Risk,
      clause: 'Rent shall be paid on the 1st day of each calendar month via bank transfer.',
      explanation: 'Clear and standard payment terms. Fully compliant with Ethiopian law.',
      article: 'Standard',
      safer: null,
      confidence: 99,
    },
  ],
  timeline: [
    { date: 'June 1, 2026', label: 'Lease Begins', type: 'start', urgent: false },
    { date: 'June 1, 2026', label: 'First Rent Payment Due — 8,500 ETB', type: 'payment', urgent: true },
    { date: 'July 1, 2026', label: 'Monthly Rent Due', type: 'payment', urgent: false },
    { date: 'November 1, 2026', label: 'Mid-Lease Review Point (6 months)', type: 'milestone', urgent: false },
    { date: 'May 1, 2027', label: 'Give 30-Day Notice If Not Renewing', type: 'deadline', urgent: true },
    { date: 'May 31, 2027', label: 'Lease Ends — Request Deposit Return', type: 'end', urgent: true },
  ],
  sideBySide: [
    {
      original: 'The Landlord may terminate this agreement upon giving the Tenant seven (7) days written notice.',
      simplified: 'Your landlord can kick you out with only 7 days notice — this is ILLEGAL. Ethiopian law requires at least 30 days notice.',
      risk: 'high' as Risk,
    },
    {
      original: 'Tenant assumes all responsibility for maintenance and structural repairs of the premises.',
      simplified: 'You would be responsible for fixing the roof, plumbing, walls — that\'s the landlord\'s job by law. This clause is unfair and likely unenforceable.',
      risk: 'high' as Risk,
    },
    {
      original: 'A security deposit equivalent to two (2) months rent is payable prior to occupancy.',
      simplified: 'You must pay 17,000 ETB upfront as a deposit. This is double the usual amount. Try to negotiate it down to 1 month (8,500 ETB).',
      risk: 'medium' as Risk,
    },
    {
      original: 'Subletting or assignment of this agreement is prohibited without prior written consent of the Landlord.',
      simplified: 'You cannot sublet the apartment without asking your landlord first. This is normal and standard in Ethiopian rental agreements.',
      risk: 'low' as Risk,
    },
  ],
  suggestedActions: [
    'Negotiate the 7-day termination notice to 30 days (legally required)',
    'Remove or rewrite the blanket repair responsibility clause',
    'Negotiate security deposit down to 1 month (8,500 ETB)',
    'Add a 24-hour notice-of-entry clause for landlord visits',
  ],
};

// ─── Config maps ──────────────────────────────────────────────────────────────

const RC: Record<Risk, { color: string; bg: string; border: string; label: string; icon: React.ElementType }> = {
  high:   { color: '#ef4444', bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.2)',  label: 'High Risk',   icon: AlertTriangle },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.07)', border: 'rgba(245,158,11,0.2)', label: 'Medium Risk', icon: Info },
  low:    { color: '#10b981', bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.2)', label: 'Low Risk',    icon: CheckCircle },
};

const TL_ICONS: Record<string, { color: string; icon: React.ElementType }> = {
  start:     { color: '#10b981', icon: CheckCircle },
  payment:   { color: '#6366f1', icon: Clock },
  milestone: { color: '#8b5cf6', icon: Zap },
  deadline:  { color: '#f59e0b', icon: AlertTriangle },
  end:       { color: '#ef4444', icon: X },
};

// ─── Small sub-components ─────────────────────────────────────────────────────

function RiskGauge({ score }: { score: number }) {
  const color = score >= 70 ? '#ef4444' : score >= 40 ? '#f59e0b' : '#10b981';
  const label = score >= 70 ? 'High Risk' : score >= 40 ? 'Medium Risk' : 'Low Risk';
  const r = 42, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
        <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <motion.circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 1.2, ease: 'easeOut' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, color: '#475569' }}>/100</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, maxWidth: 200 }}>
          {score >= 70 ? 'This document has significant legal issues requiring immediate attention before signing.' : score >= 40 ? 'Review flagged clauses carefully. Some terms may need negotiation.' : 'Document appears compliant. Standard review recommended.'}
        </div>
      </div>
    </div>
  );
}

function ExpandableClause({ risk }: { risk: typeof RESULT.risks[0] }) {
  const [open, setOpen] = useState(risk.severity === 'high');
  const c = RC[risk.severity];
  const Icon = c.icon;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={c.color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, border: `1px solid ${c.border}`, padding: '1px 8px', borderRadius: 100 }}>{c.label}</span>
            <span style={{ fontSize: 11, color: '#475569' }}>📚 {risk.article}</span>
            <span style={{ fontSize: 11, color: '#334155', marginLeft: 'auto' }}>AI confidence: {risk.confidence}%</span>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: open ? 'normal' : 'nowrap' }}>"{risk.clause}"</div>
        </div>
        <motion.div animate={{ rotate: open ? 90 : 0 }} style={{ flexShrink: 0 }}>
          <ChevronRight size={16} color="#64748b" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div style={{ padding: '0 20px 20px 62px' }}>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7, marginBottom: 12 }}>{risk.explanation}</div>
              {risk.safer && (
                <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CheckCircle size={11} /> SAFER ALTERNATIVE
                  </div>
                  <p style={{ fontSize: 13, color: '#6ee7b7', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>"{risk.safer}"</p>
                </div>
              )}
              {!risk.safer && (
                <div style={{ fontSize: 12, color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '8px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle size={12} /> This clause is compliant with Ethiopian law.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Processing screen ────────────────────────────────────────────────────────

function ProcessingScreen({ step, progress, fileName }: { step: number; progress: number; fileName: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', textAlign: 'center' }}>
      {/* Animated scanner */}
      <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 32 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          style={{ width: 120, height: 120, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.15)', borderTopColor: '#6366f1', position: 'absolute' }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          style={{ width: 90, height: 90, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.1)', borderTopColor: '#8b5cf6', position: 'absolute', top: 15, left: 15 }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <Zap size={32} color="#6366f1" />
          </motion.div>
        </div>
      </div>

      <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>AI Analyzing Document</h3>
      <p style={{ color: '#64748b', marginBottom: 4, fontSize: 14 }}>{fileName}</p>
      <p style={{ color: '#475569', marginBottom: 28, fontSize: 12 }}>Checking against Ethiopian legal database...</p>

      {/* Progress bar */}
      <div style={{ width: '100%', maxWidth: 340, marginBottom: 28 }}>
        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
          <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 100 }} transition={{ duration: 0.4 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
          <span>Processing...</span><span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 340, textAlign: 'left' }}>
        {SCAN_STEPS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: i <= step ? 1 : 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, background: i === step ? 'rgba(99,102,241,0.08)' : 'transparent', border: i === step ? '1px solid rgba(99,102,241,0.18)' : '1px solid transparent' }}>
            {i < step ? (
              <CheckCircle size={14} color="#10b981" style={{ flexShrink: 0 }} />
            ) : i === step ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                <Zap size={14} color="#6366f1" style={{ flexShrink: 0 }} />
              </motion.div>
            ) : (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 13, color: i <= step ? '#94a3b8' : '#475569' }}>{s.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DocumentUploadPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>('idle');
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const [progress, setProgress] = useState(0);
  const [scanStep, setScanStep] = useState(0);
  const [tab, setTab] = useState<TabId>('summary');
  const [uploadedDoc, setUploadedDoc] = useState<DocumentRecord | null>(null);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [scanDone, setScanDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = useMutation({
    mutationFn: analyzeContractRequest,
    onSuccess: ({ analysis: data, document }) => {
      setAnalysis(data);
      setUploadedDoc(document);
      setAnalysisError('');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
      setAnalysisError(message);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) =>
      uploadDocumentRequest(file, (uploadProgress) => {
        setProgress(uploadProgress);
      }),
    onSuccess: (document) => {
      setUploadedDoc(document);
      setAnalysis(null);
      setAnalysisError('');
      setScanDone(false);
      setStage('scanning');
      runScan();
      analyzeMutation.mutate({ documentId: document._id });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      setFileError(message);
      setStage('idle');
    },
  });

  const validateFile = (file: File): string => {
    if (file.size > 25 * 1024 * 1024) return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 25MB.`;
    if (!ACCEPTED.includes(file.type) && !ACCEPTED_EXT.some(e => file.name.toLowerCase().endsWith(e))) return `Unsupported file type. Please upload: ${ACCEPTED_EXT.join(', ')}`;
    return '';
  };

  const startAnalysis = (name: string) => {
    setFileName(name);
    setFileError('');
    setStage('uploading');
    setProgress(0);
    setScanStep(0);

    // Simulate upload progress
    let p = 0;
    const uploadInterval = setInterval(() => {
      p += 8 + Math.random() * 12;
      if (p >= 100) {
        clearInterval(uploadInterval);
        setProgress(100);
        setTimeout(() => { setStage('scanning'); runScan(); }, 400);
      } else { setProgress(p); }
    }, 120);
  };

  const startUpload = (file: File) => {
    setFileName(file.name);
    setFileError('');
    setStage('uploading');
    setProgress(0);
    setScanStep(0);
    setUploadedDoc(null);
    uploadMutation.mutate(file);
  };

  const runScan = () => {
    let step = 0;
    const advance = () => {
      if (step >= SCAN_STEPS.length) {
        setTimeout(() => setStage('results'), 500);
        return;
      }
      setScanStep(step);
      setTimeout(() => { step++; advance(); }, SCAN_STEPS[step]?.dur ?? 800);
    };
    advance();
  };

  const handleFile = (file: File) => {
    const err = validateFile(file);
    if (err) { setFileError(err); return; }
    startUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setStage('idle');
    setProgress(0);
    setScanStep(0);
    setFileError('');
    setFileName('');
    setUploadedDoc(null);
  };

  const safeRiskScore = uploadedDoc?.riskScore ? Number(uploadedDoc.riskScore) : RESULT.riskScore;
  const result = {
    ...RESULT,
    fileName: uploadedDoc?.filename || fileName,
    summary: uploadedDoc?.summary || RESULT.summary,
    riskScore: Number.isNaN(safeRiskScore) ? RESULT.riskScore : safeRiskScore,
  };
  const high = result.risks.filter(r => r.severity === 'high').length;
  const med  = result.risks.filter(r => r.severity === 'medium').length;
  const low  = result.risks.filter(r => r.severity === 'low').length;

  const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'summary',    label: 'Summary',    icon: FileText },
    { id: 'risks',      label: `Risks (${high + med + low})`, icon: AlertTriangle },
    { id: 'clauses',    label: 'Clauses',    icon: List },
    { id: 'timeline',   label: 'Timeline',   icon: Calendar },
    { id: 'sidebyside', label: 'Side-by-Side', icon: SplitSquareHorizontal },
  ];

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1060, margin: '0 auto' }}>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 5 }}>Document Intelligence</h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Upload any Ethiopian legal document for instant AI-powered analysis, risk detection, and plain-language explanation.</p>
      </motion.div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept={ACCEPTED_EXT.join(',')} style={{ display: 'none' }} onChange={handleInputChange} />

      <AnimatePresence mode="wait">

        {/* ── IDLE / UPLOAD ZONE ─────────────────────────────────────────── */}
        {stage === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}>
            {/* Doc type chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {[
                { label: '🏠 Rental Agreement', color: '#6366f1' },
                { label: '💼 Employment Contract', color: '#8b5cf6' },
                { label: '📋 Legal Notice', color: '#f59e0b' },
                { label: '🏛️ Government Form', color: '#10b981' },
              ].map(t => (
                <span key={t.label} style={{ padding: '5px 13px', borderRadius: 100, fontSize: 12, background: `${t.color}12`, border: `1px solid ${t.color}25`, color: t.color, cursor: 'pointer' }}>{t.label}</span>
              ))}
            </div>

            {/* Drop zone */}
            <motion.div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              animate={{ borderColor: dragging ? 'rgba(99,102,241,0.65)' : 'rgba(255,255,255,0.09)', background: dragging ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.01)' }}
              style={{ border: '2px dashed', borderRadius: 20, padding: '72px 32px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s' }}
              onClick={() => fileRef.current?.click()}>
              <motion.div animate={dragging ? { scale: 1.12 } : { scale: 1, y: [0, -6, 0] }} transition={dragging ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
                <Upload size={34} color="#6366f1" />
              </motion.div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>
                {dragging ? 'Release to upload' : 'Drag & Drop or Click to Upload'}
              </h3>
              <p style={{ color: '#64748b', fontSize: 14, marginBottom: 18 }}>Supports PDF, DOCX, JPG, PNG — up to 25 MB</p>
              <div style={{ display: 'flex', gap: 7, justifyContent: 'center', flexWrap: 'wrap' }}>
                {ACCEPTED_EXT.map(ext => (
                  <span key={ext} style={{ padding: '3px 11px', borderRadius: 100, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', fontSize: 11, color: '#64748b' }}>{ext.toUpperCase()}</span>
                ))}
              </div>

              {/* Demo button */}
              <div onClick={e => { e.stopPropagation(); startAnalysis('rental_agreement_bole.pdf'); }}
                style={{ marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 13, cursor: 'pointer' }}>
                <Eye size={14} /> Try with demo document
              </div>
            </motion.div>

            {/* File error */}
            {fileError && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '12px 16px' }}>
                <FileX size={16} color="#ef4444" />
                <span style={{ flex: 1, color: '#fca5a5', fontSize: 13 }}>{fileError}</span>
                <button onClick={() => setFileError('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
              </motion.div>
            )}

            {/* Security note */}
            <div style={{ marginTop: 20, display: 'flex', gap: 8, padding: '14px 16px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 12 }}>
              <Shield size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12.5, color: '#6ee7b7', lineHeight: 1.55, margin: 0 }}>Your documents are encrypted with AES-256, never shared with third parties, and can be deleted at any time. Analysis runs securely in isolated AI sandboxes.</p>
            </div>
          </motion.div>
        )}

        {/* ── UPLOADING ─────────────────────────────────────────────────── */}
        {stage === 'uploading' && (
          <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 32px', textAlign: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: 18, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
                <Upload size={32} color="#6366f1" />
              </motion.div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Uploading Document</h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>{fileName}</p>
            <div style={{ width: '100%', maxWidth: 320 }}>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden', marginBottom: 8 }}>
                <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 100 }} transition={{ duration: 0.3 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#475569' }}>
                <span>Uploading securely...</span><span>{Math.round(progress)}%</span>
              </div>
            </div>
            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ marginTop: 20, fontSize: 12, color: '#334155', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={11} color="#10b981" /> End-to-end encrypted
            </motion.div>
          </motion.div>
        )}

        {/* ── SCANNING ──────────────────────────────────────────────────── */}
        {stage === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProcessingScreen step={scanStep} progress={Math.round((scanStep / SCAN_STEPS.length) * 100)} fileName={fileName} />
          </motion.div>
        )}

        {/* ── RESULTS ───────────────────────────────────────────────────── */}
        {stage === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ background: 'rgba(239,68,68,0.1)', borderRadius: 10, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={20} color="#ef4444" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#f1f5f9', marginBottom: 2 }}>{result.fileName || 'rental_agreement_bole.pdf'}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{result.docType} · Analyzed just now</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
                  <Printer size={13} /> Print
                </button>
                <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
                  <Download size={13} /> Export Report
                </button>
                <button onClick={() => navigate('/app/chat')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', cursor: 'pointer', fontSize: 13 }}>
                  <MessageSquare size={13} /> Ask AI
                </button>
                <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.09)', color: '#64748b', cursor: 'pointer', fontSize: 13 }}>
                  <RefreshCw size={13} /> New Upload
                </button>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 22 }}>
              {[
                { label: 'Risk Score', value: `${result.riskScore}/100`, color: '#f59e0b', icon: TrendingDown },
                { label: 'High Risk', value: String(high), color: '#ef4444', icon: AlertTriangle },
                { label: 'Medium Risk', value: String(med), color: '#f59e0b', icon: Info },
                { label: 'Compliant', value: String(low), color: '#10b981', icon: CheckCircle },
                { label: 'AI Accuracy', value: '96%', color: '#6366f1', icon: Zap },
              ].map(s => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                    <s.icon size={15} color={s.color} />
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginBottom: 2 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: tab === t.id ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === t.id ? '#a5b4fc' : '#64748b', transition: 'all 0.15s' }}>
                  <t.icon size={13} />{t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

                {/* SUMMARY */}
                {tab === 'summary' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20 }}>Overall Risk Assessment</h3>
                      <RiskGauge score={result.riskScore} />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>AI Document Summary</h3>
                      <p style={{ color: '#94a3b8', fontSize: 13.5, lineHeight: 1.75 }}>{result.summary}</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, gridColumn: 'span 2' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Key Contract Facts</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                        {result.keyFacts.map(f => (
                          <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: f.risk ? 'rgba(239,68,68,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${f.risk ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.05)'}`, borderRadius: 10, gap: 12 }}>
                            <span style={{ color: '#64748b', fontSize: 13 }}>{f.label}</span>
                            <span style={{ fontWeight: 700, fontSize: 14, color: f.risk ? '#f87171' : '#e2e8f0' }}>{f.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 16, padding: 24, gridColumn: 'span 2' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <CheckCircle size={16} color="#10b981" />
                        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Recommended Actions</h3>
                      </div>
                      {['Negotiate the 7-day termination notice to 30 days (legally required)', 'Remove or rewrite the blanket repair responsibility clause', 'Negotiate security deposit down to 1 month (8,500 ETB)', 'Add a 24-hour notice-of-entry clause for landlord visits'].map((a, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 9 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#10b981', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                          <span style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.55 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* RISKS */}
                {tab === 'risks' && (
                  <div>
                    {(['high', 'medium', 'low'] as Risk[]).map(level => {
                      const grouped = result.risks.filter(r => r.severity === level);
                      if (!grouped.length) return null;
                      const c = RC[level];
                      return (
                        <div key={level} style={{ marginBottom: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <c.icon size={14} color={c.color} />
                            <span style={{ fontSize: 14, fontWeight: 700, color: c.color }}>{c.label} ({grouped.length})</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {grouped.map(r => <ExpandableClause key={r.id} risk={r} />)}
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ padding: '14px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10 }}>
                      <p style={{ fontSize: 12, color: '#fbbf24', margin: 0 }}>⚠️ Educational analysis only. Always consult a licensed Ethiopian attorney before signing.</p>
                    </div>
                  </div>
                )}

                {/* CLAUSES */}
                {tab === 'clauses' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.risks.map(r => <ExpandableClause key={r.id} risk={r} />)}
                  </div>
                )}

                {/* TIMELINE */}
                {tab === 'timeline' && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Calendar size={16} color="#6366f1" /> Legal Deadline Timeline
                    </h3>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: 19, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom,rgba(99,102,241,0.4),rgba(99,102,241,0.05))', borderRadius: 100 }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {result.timeline.map((ev, i) => {
                          const cfg = TL_ICONS[ev.type] ?? { color: '#64748b', icon: Clock };
                          return (
                            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                              style={{ display: 'flex', gap: 16, paddingBottom: i < result.timeline.length - 1 ? 20 : 0 }}>
                              <div style={{ position: 'relative', flexShrink: 0 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${cfg.color}15`, border: `2px solid ${cfg.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' }}>
                                  <cfg.icon size={16} color={cfg.color} />
                                </div>
                              </div>
                              <div style={{ paddingTop: 8, flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{ev.label}</span>
                                  {ev.urgent && <span style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', padding: '1px 8px', borderRadius: 100, fontWeight: 600 }}>⚡ Action Required</span>}
                                </div>
                                <span style={{ fontSize: 12, color: '#64748b' }}>{ev.date}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* SIDE BY SIDE */}
                {tab === 'sidebyside' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 18px', borderRight: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <FileText size={13} /> Original Legal Text
                      </div>
                      <div style={{ padding: '12px 18px', fontSize: 13, fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Zap size={13} color="#6366f1" /> AI Plain-Language Explanation
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {result.sideBySide.map((item, i) => {
                        const c = RC[item.risk];
                        return (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.02)', border: `1px solid ${c.border}`, borderRadius: 14, overflow: 'hidden' }}>
                            <div style={{ padding: '16px 18px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: c.color, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <c.icon size={11} /> {c.label}
                              </div>
                              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>"{item.original}"</p>
                            </div>
                            <div style={{ padding: '16px 18px', background: c.bg }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Zap size={11} color="#6366f1" /> AI Explanation
                              </div>
                              <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.65, margin: 0 }}>{item.simplified}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
