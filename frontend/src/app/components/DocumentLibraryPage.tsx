import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { FileText, Search, Upload, Trash2, Download, Eye, Filter, Clock, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type RiskLevel = 'high' | 'medium' | 'low';

const documents = [
  { id: 1, name: 'Rental Agreement - Bole.pdf', type: 'Rental', date: 'May 20, 2026', size: '1.2 MB', risk: 'medium' as RiskLevel, summary: 'A 12-month residential rental in Bole, Addis Ababa. Contains 1 high-risk eviction clause and 1 medium-risk repair clause.', pages: 8 },
  { id: 2, name: 'Employment Contract - Techno.pdf', type: 'Employment', date: 'May 18, 2026', size: '845 KB', risk: 'high' as RiskLevel, summary: 'Employment contract with unusual termination terms. Missing mandatory leave entitlements. Overtime compensation unclear.', pages: 12 },
  { id: 3, name: 'Lease Renewal Notice.pdf', type: 'Legal Notice', date: 'May 15, 2026', size: '230 KB', risk: 'low' as RiskLevel, summary: 'Standard 3-month lease renewal notice from landlord. All terms comply with Ethiopian housing law.', pages: 2 },
  { id: 4, name: 'Supplier Agreement - Merkato.pdf', type: 'Business', date: 'May 10, 2026', size: '2.1 MB', risk: 'medium' as RiskLevel, summary: 'Business supply agreement with moderate payment risk. Dispute resolution clause favors supplier.', pages: 15 },
  { id: 5, name: 'Government Tax Form 2025.pdf', type: 'Government', date: 'April 30, 2026', size: '560 KB', risk: 'low' as RiskLevel, summary: 'Standard annual tax declaration form. No risk flags detected.', pages: 4 },
  { id: 6, name: 'Termination Letter.pdf', type: 'Legal Notice', date: 'April 22, 2026', size: '180 KB', risk: 'high' as RiskLevel, summary: 'Termination letter without proper notice period. Missing severance calculation. May be wrongful termination.', pages: 1 },
];

const riskConfig = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: 'High Risk', icon: AlertTriangle },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Medium Risk', icon: Info },
  low: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Low Risk', icon: CheckCircle },
};

const typeColors: Record<string, string> = {
  Rental: '#6366f1', Employment: '#8b5cf6', 'Legal Notice': '#f59e0b', Business: '#06b6d4', Government: '#10b981',
};

export default function DocumentLibraryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<RiskLevel | 'all'>('all');
  const [filterType, setFilterType] = useState('All');
  const [deleted, setDeleted] = useState<number[]>([]);

  const docTypes = ['All', 'Rental', 'Employment', 'Legal Notice', 'Business', 'Government'];

  const filtered = documents.filter(doc => {
    if (deleted.includes(doc.id)) return false;
    if (search && !doc.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRisk !== 'all' && doc.risk !== filterRisk) return false;
    if (filterType !== 'All' && doc.type !== filterType) return false;
    return true;
  });

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>My Documents</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>{documents.length - deleted.length} documents · {documents.filter(d => !deleted.includes(d.id) && d.risk === 'high').length} high-risk alerts</p>
          </div>
          <button onClick={() => navigate('/app/upload')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            <Upload size={14} /> Upload Document
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ marginBottom: 24 }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..."
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px 11px 42px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
            className="focus:border-indigo-500/40 transition-colors" />
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Risk filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            <Filter size={14} color="#475569" style={{ alignSelf: 'center' }} />
            {(['all', 'high', 'medium', 'low'] as const).map(r => (
              <button key={r} onClick={() => setFilterRisk(r)}
                style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: filterRisk === r ? (r === 'all' ? 'rgba(99,102,241,0.2)' : riskConfig[r]?.bg) : 'rgba(255,255,255,0.05)', color: filterRisk === r ? (r === 'all' ? '#818cf8' : riskConfig[r]?.color) : '#64748b' }}>
                {r === 'all' ? 'All Risk' : riskConfig[r].label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />

          {/* Type filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {docTypes.map(type => (
              <button key={type} onClick={() => setFilterType(type)}
                style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', background: filterType === type ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', color: filterType === type ? '#818cf8' : '#64748b' }}>
                {type}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Document list */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <FileText size={32} color="#475569" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>No documents found</h3>
          <p style={{ color: '#475569', fontSize: 14 }}>Try adjusting your filters or upload a new document.</p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((doc, i) => {
            const rConf = riskConfig[doc.risk];
            const RiskIcon = rConf.icon;
            return (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'flex-start', gap: 16 }}
                className="hover:border-white/10 transition-colors">
                {/* File icon */}
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={22} color="#ef4444" />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 6, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>{doc.name}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: typeColors[doc.type] || '#64748b', background: `${typeColors[doc.type] || '#64748b'}15`, padding: '2px 8px', borderRadius: 100 }}>{doc.type}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: rConf.color, background: rConf.bg, padding: '2px 8px', borderRadius: 100 }}>
                          <RiskIcon size={10} /> {rConf.label}
                        </span>
                        <span style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={10} /> {doc.date}</span>
                        <span style={{ fontSize: 12, color: '#475569' }}>{doc.size} · {doc.pages}p</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => navigate('/app/contract-analysis')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', cursor: 'pointer', fontSize: 12 }}>
                        <Eye size={12} /> View
                      </button>
                      <button style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', cursor: 'pointer', fontSize: 12 }}>
                        <Download size={12} />
                      </button>
                      <button onClick={() => setDeleted(prev => [...prev, doc.id])} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#f87171', cursor: 'pointer', fontSize: 12 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginTop: 8 }}>{doc.summary}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Upload area */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        onClick={() => navigate('/app/upload')}
        style={{ marginTop: 20, border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 14, padding: '32px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.01)' }}
        className="hover:border-indigo-500/30 hover:bg-indigo-500/3 transition-all">
        <Upload size={28} color="#475569" style={{ margin: '0 auto 12px' }} />
        <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Drop a legal document here or click to upload</div>
        <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>PDF, DOCX, JPG · Up to 25MB</div>
      </motion.div>
    </div>
  );
}
