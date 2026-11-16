import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X, HelpCircle } from 'lucide-react';

let alertListener = null;
let confirmListener = null;

/**
 * Programmatically trigger the in-app alert popup:
 * showAlert("This email address is already assigned to an Employee account.");
 * showAlert({ title: "Email Conflict", message: "...", type: "error" });
 */
export const showAlert = (content, options = {}) => {
  if (alertListener) {
    alertListener(content, options);
  } else if (typeof window !== 'undefined' && window.__showAppAlert) {
    window.__showAppAlert(content, options);
  }
};

export const showConfirm = (content, options = {}) => {
  return new Promise((resolve) => {
    if (confirmListener) {
      confirmListener(content, { ...options, onResolve: resolve });
    } else if (typeof window !== 'undefined' && window.__showAppConfirm) {
      window.__showAppConfirm(content, { ...options, onResolve: resolve });
    } else {
      resolve(false);
    }
  });
};

export const AlertModal = () => {
  const [modalState, setModalState] = useState(null);

  useEffect(() => {
    const handleTrigger = (content, opts = {}) => {
      let message = '';
      let title = opts.title || '';
      let type = opts.type || 'notice';

      if (typeof content === 'string') {
        message = content;
      } else if (content && typeof content === 'object') {
        message = content.message || content.text || JSON.stringify(content);
        title = content.title || title;
        type = content.type || type;
      }

      // Automatically determine title and tone based on content keywords if not specified
      const lower = (message || '').toLowerCase();
      if (!title) {
        if (lower.includes('already assigned') || lower.includes('already exist') || lower.includes('duplicate')) {
          title = 'Account Conflict';
          type = 'error';
        } else if (lower.includes('limit reached') || lower.includes('upgrade your plan') || lower.includes('upgrade your limit')) {
          title = 'Plan Limit Reached';
          type = 'warning';
        } else if (lower.includes('failed') || lower.includes('error') || lower.includes('must be') || lower.includes('invalid') || lower.includes('enter a valid')) {
          title = 'Attention Required';
          type = 'error';
        } else if (lower.includes('success') || lower.includes('created') || lower.includes('saved') || lower.includes('updated')) {
          title = 'Success';
          type = 'success';
        } else {
          title = 'Notice';
          type = 'notice';
        }
      }

      setModalState({
        isConfirm: false,
        title,
        message,
        type,
        confirmText: opts.confirmText || 'OK',
        onConfirm: opts.onConfirm || null
      });
    };

    const handleConfirmTrigger = (content, opts = {}) => {
      let message = '';
      let title = opts.title || 'Please Confirm';
      let type = opts.type || 'warning';

      if (typeof content === 'string') {
        message = content;
      } else if (content && typeof content === 'object') {
        message = content.message || content.text || JSON.stringify(content);
        title = content.title || title;
        type = content.type || type;
      }

      setModalState({
        isConfirm: true,
        title,
        message,
        type,
        confirmText: opts.confirmText || 'Confirm',
        cancelText: opts.cancelText || 'Cancel',
        onResolve: opts.onResolve || null
      });
    };

    alertListener = handleTrigger;
    confirmListener = handleConfirmTrigger;
    window.__showAppAlert = handleTrigger;
    window.__showAppConfirm = handleConfirmTrigger;

    // Intercept native window.alert so all calls across the app show this popup
    const originalAlert = window.alert;
    window.alert = (msg) => {
      handleTrigger(msg);
    };

    // Intercept native window.confirm to eliminate native browser confirm dialogs
    const originalConfirm = window.confirm;
    window.confirm = (msg) => {
      handleTrigger(msg, { title: 'Confirmation Required', type: 'warning' });
      return false;
    };

    const handleCustomEvent = (e) => {
      if (e.detail) {
        handleTrigger(e.detail.message || e.detail, e.detail);
      }
    };
    window.addEventListener('app-alert-popup', handleCustomEvent);

    return () => {
      alertListener = null;
      confirmListener = null;
      window.alert = originalAlert;
      window.confirm = originalConfirm;
      window.removeEventListener('app-alert-popup', handleCustomEvent);
    };
  }, []);

  const handleClose = () => {
    if (modalState?.onConfirm) {
      try { modalState.onConfirm(); } catch (err) { console.error(err); }
    }
    setModalState(null);
  };

  const handleConfirmAction = () => {
    if (modalState?.onResolve) {
      modalState.onResolve(true);
    }
    if (modalState?.onConfirm) {
      try { modalState.onConfirm(); } catch (err) { console.error(err); }
    }
    setModalState(null);
  };

  const handleCancelAction = () => {
    if (modalState?.onResolve) {
      modalState.onResolve(false);
    }
    setModalState(null);
  };

  // Keyboard shortcut: Escape cancels/closes, Enter confirms
  useEffect(() => {
    if (!modalState) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (modalState.isConfirm) handleCancelAction();
        else handleClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (modalState.isConfirm) handleConfirmAction();
        else handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState]);

  if (!modalState) return null;

  const isError = modalState.type === 'error';
  const isWarning = modalState.type === 'warning';
  const isSuccess = modalState.type === 'success';

  const iconBg = isError ? '#FEF2F2' : isWarning ? '#FFFBEB' : isSuccess ? '#F0FDF4' : '#EFF6FF';
  const iconColor = isError ? '#DC2626' : isWarning ? '#D97706' : isSuccess ? '#16A34A' : '#2563EB';
  const IconComponent = modalState.isConfirm ? HelpCircle : isError ? AlertCircle : isWarning ? AlertTriangle : isSuccess ? CheckCircle2 : Info;

  return createPortal(
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999999,
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (modalState.isConfirm) handleCancelAction();
          else handleClose();
        }
      }}
    >
      <div 
        style={{
          background: 'white',
          borderRadius: '20px',
          maxWidth: '430px',
          width: '100%',
          padding: '28px 24px 22px 24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (X) button */}
        <button
          onClick={modalState.isConfirm ? handleCancelAction : handleClose}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#64748B'; }}
          title="Close"
        >
          <X size={16} />
        </button>

        {/* Icon Badge */}
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          boxShadow: `0 0 0 6px ${iconBg}`
        }}>
          <IconComponent size={28} />
        </div>

        {/* Title */}
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '18px',
          fontWeight: '700',
          color: '#0F172A',
          letterSpacing: '-0.01em'
        }}>
          {modalState.title}
        </h3>

        {/* Message */}
        <p style={{
          margin: '0 0 24px 0',
          fontSize: '14px',
          color: '#475569',
          lineHeight: '1.55',
          wordBreak: 'break-word',
          maxWidth: '360px'
        }}>
          {modalState.message}
        </p>

        {/* Action Buttons */}
        {modalState.isConfirm ? (
          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button
              type="button"
              onClick={handleCancelAction}
              style={{
                flex: 1,
                padding: '11px 16px',
                background: 'white',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#475569',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              {modalState.cancelText || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              autoFocus
              style={{
                flex: 1,
                padding: '11px 16px',
                background: isError ? '#DC2626' : '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: isError 
                  ? '0 4px 12px rgba(220, 38, 38, 0.25)' 
                  : '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'transform 0.1s, opacity 0.15s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {modalState.confirmText || 'Confirm'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClose}
            autoFocus
            style={{
              width: '100%',
              padding: '11px 20px',
              background: isError ? '#DC2626' : '#2563EB',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: isError 
                ? '0 4px 12px rgba(220, 38, 38, 0.25)' 
                : '0 4px 12px rgba(37, 99, 235, 0.25)',
              transition: 'transform 0.1s, opacity 0.15s'
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {modalState.confirmText}
          </button>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AlertModal;
