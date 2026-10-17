import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Home, LayoutGrid } from 'lucide-react';

const NotFound = ({ isNested = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(token ? '/tenant/dashboard' : '/');
    }
  };

  const mainCard = (
    <div style={{
      maxWidth: '480px',
      width: '100%',
      margin: '0 auto',
      textAlign: 'center',
      padding: '24px'
    }}>
      {/* Subtle Error Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 14px',
        backgroundColor: '#EFF6FF',
        borderRadius: '9999px',
        color: '#2563EB',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '20px'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#2563EB',
          display: 'inline-block'
        }}></span>
        404 Error
      </div>

      {/* Large Clean 404 */}
      <h1 style={{
        fontSize: '88px',
        fontWeight: '800',
        lineHeight: '1',
        letterSpacing: '-0.04em',
        color: '#0F172A',
        margin: '0 0 16px 0',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        404
      </h1>

      {/* Title */}
      <h2 style={{
        fontSize: '22px',
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: '10px',
        letterSpacing: '-0.02em',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        Page not found
      </h2>

      {/* Short, crisp description */}
      <p style={{
        fontSize: '15px',
        color: '#64748B',
        lineHeight: '1.6',
        margin: '0 auto 32px auto'
      }}>
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={handleGoBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            color: '#334155',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F8FAFC';
            e.currentTarget.style.borderColor = '#CBD5E1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FFFFFF';
            e.currentTarget.style.borderColor = '#E2E8F0';
          }}
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        {token ? (
          <button
            onClick={() => navigate('/tenant/dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            <LayoutGrid size={16} />
            Back to Dashboard
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            <Home size={16} />
            Back to Home
          </button>
        )}
      </div>
    </div>
  );

  // If inside TenantLayout
  if (isNested) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}>
        {mainCard}
      </div>
    );
  }

  // Full Page Clean Mode
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#F8F9FF'
    }}>
      {/* Top Header */}
      <header style={{
        height: '68px',
        padding: '0 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/logo.jpg" alt="BizTech Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#0F172A',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            BizTech
          </span>
        </Link>

        <div>
          {token ? (
            <Link
              to="/tenant/dashboard"
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#2563EB',
                textDecoration: 'none'
              }}
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#2563EB',
                textDecoration: 'none'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Clean Centered Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}>
        {mainCard}
      </main>
    </div>
  );
};

export default NotFound;
