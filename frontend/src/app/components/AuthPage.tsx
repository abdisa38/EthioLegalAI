import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { Scale, Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { useAuth } from '@/shared/hooks';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isForgot = location.pathname === '/forgot-password';
  const isRegister = location.pathname === '/register';

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgot) {
      setSubmitted(true);
    } else {
      try {
        setIsSubmitting(true);
        setError('');

        if (isRegister) {
          await register({
            name,
            email,
            password,
            languagePreference: 'en',
          });
        } else {
          await login({ email, password });
        }

        navigate('/app');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to sign in. Please try again.';
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fbff', display: 'flex' }}>
      {/* Left panel */}
      <div className="hidden lg:flex" style={{ width: '50%', background: 'linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(96,165,250,0.08) 50%, rgba(219,234,254,0.85) 100%)', position: 'relative', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 60, overflow: 'hidden', borderRight: '1px solid rgba(37,99,235,0.08)' }}>
        {/* Background orbs */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.18), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.16), transparent 70%)' }} />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 48 }}>
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderRadius: 14, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(37,99,235,0.3)' }}>
              <Scale size={24} color="white" />
            </div>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9' }}>
              EthioLegal <span style={{ color: '#2563eb' }}>AI</span>
            </span>
          </div>

          <h2 style={{ fontSize: 36, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.25, marginBottom: 16 }}>
            Your AI-Powered<br />
            <span style={{ background: 'linear-gradient(135deg, #2563eb, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Legal Assistant</span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.7, maxWidth: 380 }}>
            Understand Ethiopian laws, upload contracts, and know your rights — in Amharic, Oromo, or English.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 48, textAlign: 'left' }}>
            {[
              { text: 'AI-powered legal explanations in plain language' },
              { text: 'Upload and analyze contracts in seconds' },
              { text: 'Supports Amharic and Afaan Oromo' },
              { text: 'Detect risky clauses before you sign' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.64)', border: '1px solid rgba(37,99,235,0.08)', borderRadius: 12, padding: '12px 16px' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb' }} />
                </div>
                <span style={{ color: '#94a3b8', fontSize: 14 }}>{item.text}</span>
              </motion.div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: '16px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10 }}>
            <p style={{ color: '#fbbf24', fontSize: 12, lineHeight: 1.5 }}>
              ⚠️ This platform provides educational legal information and not official legal advice.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#0f172a' }}>EthioLegal <span style={{ color: '#2563eb' }}>AI</span></span>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>
              {isForgot ? 'Reset Password' : isRegister ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>
              {isForgot ? "Enter your email and we'll send reset instructions." : isRegister ? 'Join thousands of Ethiopians who know their rights.' : 'Sign in to your EthioLegal AI account.'}
            </p>
          </div>

          {!submitted ? (
            <>
              {/* Social buttons */}
              {!isForgot && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: 10, padding: '11px', color: '#334155', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    <Chrome size={16} /> Google
                  </button>
                  <button style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(37,99,235,0.1)', borderRadius: 10, padding: '11px', color: '#334155', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                    <Github size={16} /> GitHub
                  </button>
                </div>
              )}

              {!isForgot && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: '#475569', fontSize: 13 }}>or continue with email</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {isRegister && (
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Tigist Bekele"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px 12px 42px', color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                        className="focus:border-indigo-500/50 transition-colors" />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px 12px 42px', color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                      className="focus:border-indigo-500/50 transition-colors" />
                  </div>
                </div>

                {!isForgot && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Password</label>
                      {!isRegister && <span onClick={() => navigate('/forgot-password')} style={{ color: '#2563eb', fontSize: 13, cursor: 'pointer' }}>Forgot password?</span>}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 42px 12px 42px', color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                        className="focus:border-indigo-500/50 transition-colors" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569' }}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                )}

                {isRegister && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <input type="checkbox" id="terms" style={{ marginTop: 3, accentColor: '#2563eb' }} />
                    <label htmlFor="terms" style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
                      I agree to the <span style={{ color: '#2563eb', cursor: 'pointer' }}>Terms of Service</span> and understand this is educational information, not legal advice.
                    </label>
                  </div>
                )}

                {error && (
                  <div style={{ color: '#f87171', fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', padding: '10px 12px', borderRadius: 10 }}>
                    {error}
                  </div>
                )}

                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  disabled={isSubmitting}
                  style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: 'white', padding: '14px', borderRadius: 10, border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: 16, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 0 20px rgba(37,99,235,0.35)', marginTop: 4, opacity: isSubmitting ? 0.8 : 1 }}>
                  {isForgot ? 'Send Reset Link' : isRegister ? 'Create Account' : 'Sign In'}
                  <ArrowRight size={16} />
                </motion.button>
              </form>

              <div style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 }}>
                {isRegister ? (
                  <>Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#2563eb', cursor: 'pointer' }}>Sign in</span></>
                ) : isForgot ? (
                  <span onClick={() => navigate('/login')} style={{ color: '#2563eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <ArrowLeft size={14} /> Back to Sign In
                  </span>
                ) : (
                  <>Don't have an account? <span onClick={() => navigate('/register')} style={{ color: '#2563eb', cursor: 'pointer' }}>Sign up free</span></>
                )}
              </div>
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 40 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <Mail size={28} color="#2563eb" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: '#f1f5f9' }}>Check Your Email</h3>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 24 }}>We've sent reset instructions to <strong style={{ color: '#94a3b8' }}>{email}</strong></p>
              <button onClick={() => navigate('/login')} style={{ color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
