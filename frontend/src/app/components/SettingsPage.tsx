import { useState } from 'react';
import { motion } from 'motion/react';
import { Globe, Moon, Bell, Shield, User, Bot, Save, ChevronRight, Check } from 'lucide-react';

const sections = [
  { id: 'language', icon: Globe, label: 'Language & Region', color: '#10b981' },
  { id: 'appearance', icon: Moon, label: 'Appearance', color: '#6366f1' },
  { id: 'account', icon: User, label: 'Account', color: '#8b5cf6' },
  { id: 'ai', icon: Bot, label: 'AI Preferences', color: '#f59e0b' },
  { id: 'notifications', icon: Bell, label: 'Notifications', color: '#06b6d4' },
  { id: 'privacy', icon: Shield, label: 'Privacy & Security', color: '#ec4899' },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('language');
  const [lang, setLang] = useState('English');
  const [theme, setTheme] = useState('dark');
  const [aiLang, setAiLang] = useState('match');
  const [aiStyle, setAiStyle] = useState('simple');
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    riskAlerts: true,
    newFeatures: true,
    weeklyReport: false,
    legalUpdates: true,
  });
  const [privacy, setPrivacy] = useState({
    saveHistory: true,
    analytics: false,
    dataSharing: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)}
      style={{ width: 44, height: 24, borderRadius: 12, background: value ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s', flexShrink: 0 }}>
      <motion.div animate={{ x: value ? 22 : 2 }} style={{ width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </button>
  );

  const SectionContent = () => {
    switch (activeSection) {
      case 'language':
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Language & Region</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Choose the interface and AI response language.</p>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Interface Language</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 'English', label: 'English', native: 'English', flag: '🇬🇧' },
                  { value: 'Amharic', label: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
                  { value: 'Oromo', label: 'Afaan Oromo', native: 'Afaan Oromo', flag: '🟢' },
                ].map(option => (
                  <button key={option.value} onClick={() => setLang(option.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: `1px solid ${lang === option.value ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`, background: lang === option.value ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontSize: 22 }}>{option.flag}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0' }}>{option.label}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{option.native}</div>
                    </div>
                    {lang === option.value && <Check size={16} color="#6366f1" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Region</label>
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 500, color: '#e2e8f0', fontSize: 14 }}>Ethiopia (ETH)</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Time Zone: EAT (UTC+3)</div>
                </div>
                <ChevronRight size={16} color="#475569" />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Appearance</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Customize how EthioLegal AI looks.</p>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Theme</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { value: 'dark', label: 'Dark', preview: '#080b18', text: '#f1f5f9' },
                  { value: 'light', label: 'Light', preview: '#f8fafc', text: '#0f172a' },
                  { value: 'system', label: 'System', preview: 'linear-gradient(135deg, #080b18, #f8fafc)', text: '#94a3b8' },
                ].map(option => (
                  <button key={option.value} onClick={() => setTheme(option.value)}
                    style={{ borderRadius: 12, border: `2px solid ${theme === option.value ? '#6366f1' : 'rgba(255,255,255,0.08)'}`, overflow: 'hidden', cursor: 'pointer', background: 'transparent', padding: 0 }}>
                    <div style={{ height: 60, background: option.preview }} />
                    <div style={{ padding: '8px', background: theme === option.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{option.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'account':
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Account Settings</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Manage your profile and account information.</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, padding: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white' }}>T</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, color: '#f1f5f9', marginBottom: 3 }}>Tigist Bekele</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>tigist.bekele@example.com</div>
                <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>Free Plan · 3/5 monthly queries used</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Full Name', value: 'Tigist Bekele' },
                { label: 'Email', value: 'tigist.bekele@example.com' },
                { label: 'Phone', value: '+251 91 234 5678' },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>{field.label}</label>
                  <input defaultValue={field.value}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 14px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    className="focus:border-indigo-500/40 transition-colors" />
                </div>
              ))}
            </div>

            <div style={{ marginTop: 20, padding: '16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10 }}>
              <div style={{ fontSize: 13, color: '#fbbf24', fontWeight: 600, marginBottom: 8 }}>Upgrade to Premium</div>
              <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>Unlock unlimited AI queries, advanced contract analysis, and priority support for 299 ETB/month.</div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>AI Preferences</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Customize how the AI responds to your questions.</p>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>AI Response Language</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { value: 'match', label: 'Match my input language', desc: 'AI responds in the same language you use' },
                  { value: 'english', label: 'Always English', desc: 'AI always responds in English' },
                  { value: 'amharic', label: 'Always Amharic', desc: 'AI always responds in Amharic (አማርኛ)' },
                ].map(option => (
                  <button key={option.value} onClick={() => setAiLang(option.value)}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10, border: `1px solid ${aiLang === option.value ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`, background: aiLang === option.value ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: '#e2e8f0' }}>{option.label}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{option.desc}</div>
                    </div>
                    {aiLang === option.value && <Check size={15} color="#6366f1" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Response Style</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { value: 'simple', label: 'Simple', desc: 'Plain language, easy to understand' },
                  { value: 'detailed', label: 'Detailed', desc: 'Thorough with legal citations' },
                ].map(option => (
                  <button key={option.value} onClick={() => setAiStyle(option.value)}
                    style={{ padding: '14px', borderRadius: 10, border: `1px solid ${aiStyle === option.value ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`, background: aiStyle === option.value ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0', marginBottom: 4 }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Notifications</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Control what notifications you receive.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { key: 'riskAlerts', label: 'Risk Alerts', desc: 'Notify me when AI detects high-risk clauses in my documents' },
                { key: 'newFeatures', label: 'New Features', desc: 'Updates about new EthioLegal AI capabilities' },
                { key: 'weeklyReport', label: 'Weekly Legal Summary', desc: 'Weekly email summary of your legal activity' },
                { key: 'legalUpdates', label: 'Ethiopian Law Updates', desc: 'Important changes to Ethiopian laws relevant to your queries' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{item.desc}</div>
                  </div>
                  <Toggle value={notifications[item.key as keyof typeof notifications]} onChange={v => setNotifications(prev => ({ ...prev, [item.key]: v }))} />
                </div>
              ))}
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>Privacy & Security</h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>Control how your data is handled.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              {[
                { key: 'saveHistory', label: 'Save Chat History', desc: 'Store your AI conversations for later review' },
                { key: 'analytics', label: 'Usage Analytics', desc: 'Share anonymous usage data to improve EthioLegal AI' },
                { key: 'dataSharing', label: 'Data Sharing', desc: 'Allow anonymized data to improve AI training' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, gap: 16 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: '#e2e8f0', marginBottom: 3 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{item.desc}</div>
                  </div>
                  <Toggle value={privacy[item.key as keyof typeof privacy]} onChange={v => setPrivacy(prev => ({ ...prev, [item.key]: v }))} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>Download My Data</button>
              <button style={{ padding: '10px 18px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', fontSize: 14 }}>Delete All Data</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '32px 28px', maxWidth: 1000, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>Manage your account, preferences, and privacy.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }} className="max-sm:grid-cols-1">
        {/* Sidebar */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sections.map(section => (
            <button key={section.id} onClick={() => setActiveSection(section.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', background: activeSection === section.id ? 'rgba(99,102,241,0.12)' : 'transparent', color: activeSection === section.id ? '#818cf8' : '#64748b', transition: 'all 0.2s' }}
              className={activeSection !== section.id ? 'hover:bg-white/5 hover:text-slate-300' : ''}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${section.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <section.icon size={15} color={activeSection === section.id ? '#818cf8' : section.color} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{section.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
          <SectionContent />

          <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', borderRadius: 10, background: saved ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: saved ? '1px solid rgba(16,185,129,0.4)' : 'none', color: saved ? '#10b981' : 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.2s' }}>
              {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
