import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';

const inputStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  padding: '8px 12px',
  fontSize: '13px',
  color: '#0f172a',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#374151',
  display: 'block',
  marginBottom: '4px',
};

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError('');
    setLoading(true);
    try {
      await registerUser(email, password, fullName);
      navigate('/login');
    } catch (error) {
      const message = (error as any)?.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f9fafb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '32px',
          width: '100%',
          maxWidth: '380px',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontSize: '18px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px' }}>ApexFit</p>
          <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>Fitness tracker</p>
        </div>

        <p style={{ fontSize: '16px', fontWeight: 500, color: '#0f172a', margin: '0 0 20px' }}>Create account</p>

        {error && (
          <p style={{ fontSize: '13px', color: '#ef4444', margin: '0 0 16px' }}>{error}</p>
        )}

        <form onSubmit={(e) => { e.preventDefault(); void submit(); }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoFocus
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
              style={inputStyle}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              onFocus={(e) => { e.currentTarget.style.borderColor = '#1d4ed8'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#0f172a',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={{ fontSize: '13px', textAlign: 'center', color: '#64748b', marginTop: '20px', marginBottom: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1d4ed8', fontWeight: 500, textDecoration: 'none' }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
