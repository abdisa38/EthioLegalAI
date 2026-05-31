import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  MessageSquare, Upload, Shield, TrendingUp,
  Sparkles, ArrowRight, Scale
} from 'lucide-react';

const quickActions = [
  { 
    icon: MessageSquare, 
    label: 'Ask Legal Question', 
    desc: 'Get instant answers about Ethiopian law', 
    color: '#2563eb', 
    path: '/app/chat' 
  },
  { 
    icon: Upload, 
    label: 'Analyze Document', 
    desc: 'Upload and review contracts or agreements', 
    color: '#3b82f6', 
    path: '/app/upload' 
  },
  { 
    icon: Shield, 
    label: 'Tenant Rights', 
    desc: 'Understand your rights as a renter', 
    color: '#10b981', 
    path: '/app/tenant-rights' 
  },
  { 
    icon: TrendingUp, 
    label: 'Labor Law', 
    desc: 'Learn about worker protections', 
    color: '#06b6d4', 
    path: '/app/labor-law' 
  },
];

const examplePrompts = [
  "Can a landlord evict me without notice?",
  "What are my overtime pay rights in Ethiopia?",
  "How do I review an employment contract?",
  "What is the minimum notice period for termination?",
  "Explain security deposit laws in Ethiopia",
  "What are my rights if salary is delayed?",
];

export default function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'linear-gradient(180deg, #f8fbff 0%, #eaf3ff 100%)'
    }}>
      <div style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
        
        {/* Logo & Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 80, 
            height: 80, 
            borderRadius: 20, 
            background: 'linear-gradient(135deg, #2563eb, #60a5fa)',
            marginBottom: 24,
            boxShadow: '0 20px 60px rgba(37,99,235,0.22)'
          }}>
            <Scale size={40} color="white" />
          </div>
          
          <h1 style={{ 
            fontSize: 48, 
            fontWeight: 800, 
            color: '#0f172a', 
            marginBottom: 16,
            lineHeight: 1.2
          }}>
            EthioLegal <span style={{ color: '#10b981' }}>AI</span>
          </h1>
          
          <p style={{ 
            fontSize: 20, 
            color: '#334155', 
            marginBottom: 8,
            lineHeight: 1.6
          }}>
            Your AI-powered Ethiopian legal assistant
          </p>
          
          <p style={{ 
            fontSize: 14, 
            color: '#737373',
            lineHeight: 1.6
          }}>
            Get instant answers about tenant rights, labor law, and contract analysis
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 48 }}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: 16,
            marginBottom: 32
          }}>
            {quickActions.map((action, i) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                  padding: 20,
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                className="hover:bg-white/5"
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${action.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <action.icon size={24} color={action.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: 16, 
                    fontWeight: 600, 
                    color: '#ffffff', 
                    marginBottom: 4 
                  }}>
                    {action.label}
                      EthioLegal <span style={{ color: '#2563eb' }}>AI</span>
                  <div style={{ 
                    fontSize: 14, 
                    color: '#a3a3a3',
                    lineHeight: 1.5
                  }}>
                    {action.desc}
                  </div>
                </div>
                <ArrowRight size={20} color="#737373" style={{ flexShrink: 0, marginTop: 4 }} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Example Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 8,
            marginBottom: 20
          }}>
            <Sparkles size={16} color="#6366f1" />
            <h3 style={{ 
              fontSize: 14, 
              fontWeight: 600, 
              color: '#d4d4d4',
              margin: 0
            }}>
              Try asking
            </h3>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: 12
          }}>
            {examplePrompts.map((prompt, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/app/chat')}
                style={{
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 13,
                  color: '#d4d4d4',
                  transition: 'all 0.2s',
                  lineHeight: 1.5
                }}
                className="hover:bg-white/5 hover:border-white/15"
              >
                "{prompt}"
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ 
            marginTop: 48,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(245,158,11,0.05)',
            border: '1px solid rgba(245,158,11,0.1)'
          }}
        >
          <p style={{ 
            fontSize: 12, 
            color: '#a3a3a3',
            margin: 0,
            lineHeight: 1.6
          }}>
            ⚠️ Educational legal information only — not official legal advice. 
            Consult a licensed Ethiopian attorney for legal representation.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
