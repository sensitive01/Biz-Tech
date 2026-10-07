import React, { useState } from 'react';
import { Settings as SettingsIcon, Lock, Bell, Save, Eye, EyeOff } from 'lucide-react';

const Settings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Page Header */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--primary-blue)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <SettingsIcon size={14} /> SETTINGS
        </div>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Platform Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Manage basic platform preferences, security, and notification settings.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        
        {/* General Settings */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SettingsIcon size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>General Settings</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Basic details and configuration for your platform</p>
            </div>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Application Name <span style={{ color: '#EF4444' }}>*</span></label>
                <input placeholder="Enter value" type="text" className="input-field" defaultValue="BizTech Admin" style={{ background: '#F8FAFC' }} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Admin / Support Email <span style={{ color: '#EF4444' }}>*</span></label>
                <input placeholder="Enter value" type="email" className="input-field" defaultValue="support@biztech.com" style={{ background: '#F8FAFC' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Security & Password */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Security & Password</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Update administrative password and authentication preferences</p>
            </div>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="input-group" style={{ marginBottom: 0, maxWidth: '400px' }}>
              <label className="input-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input placeholder="Enter value" type={showCurrentPassword ? "text" : "password"} className="input-field" defaultValue="password123" style={{ background: '#F8FAFC', paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showNewPassword ? "text" : "password"} className="input-field" placeholder="Enter new password" style={{ background: '#F8FAFC', paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showConfirmPassword ? "text" : "password"} className="input-field" placeholder="Re-enter new password" style={{ background: '#F8FAFC', paddingRight: '40px' }} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '8px 0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '4px' }}>Two-Factor Authentication</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Require 2FA verification for Admin login</div>
              </div>
              {/* Toggle Switch */}
              <div style={{ width: '44px', height: '24px', background: 'var(--primary-blue)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', background: '#F8FAFC', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', margin: '0 0 4px 0' }}>Notification Preferences</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>Manage automatic alerts and update notifications</p>
            </div>
          </div>
          
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '4px' }}>Customer Registration Alerts</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Send email when a new customer is registered</div>
              </div>
              {/* Toggle Switch */}
              <div style={{ width: '44px', height: '24px', background: 'var(--primary-blue)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
              </div>
            </div>
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)', marginBottom: '4px' }}>Maintenance & Updates</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Receive platform notifications</div>
              </div>
              {/* Toggle Switch */}
              <div style={{ width: '44px', height: '24px', background: 'var(--primary-blue)', borderRadius: '12px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', right: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="card" style={{ 
        marginTop: '32px',
        background: 'white',
        padding: '16px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-blue)' }}></div>
          Last saved <strong>12 minutes ago</strong> by <span style={{ color: 'var(--primary-blue)', fontWeight: '500' }}>Admin User</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" style={{ background: '#F1F5F9', border: 'none' }}>Cancel</button>
          <button className="btn-primary" style={{ padding: '10px 24px' }}>
            <Save size={18} /> Save Changes
          </button>
        </div>
      </div>

    </div>
  );
};

export default Settings;
