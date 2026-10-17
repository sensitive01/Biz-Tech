import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar as CalendarIcon, Clock, Bell, Plus, X, Pencil, 
  Trash2, CheckCircle2, ChevronLeft, ChevronRight, AlertTriangle, 
  Repeat, Search, Download, Filter, Check, List, CalendarDays, Eye, 
  Loader2, AlertCircle, Sparkles, Tag 
} from 'lucide-react';
import { exportToCSV } from '../utils/exportToCSV';
import { formatDate } from '../utils/formatDate';

const Reminders = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    repeatMonthly: false,
    notifyBeforeDays: 0
  });

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  // Format date helper: YYYY-MM-DD
  const formatDateKey = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Open modal to add reminder for a specific date
  const handleOpenAddModal = (dateToUse = selectedDate) => {
    setEditingItem(null);
    setFormData({
      title: '',
      date: formatDateKey(dateToUse),
      description: '',
      repeatMonthly: false,
      notifyBeforeDays: 2
    });
    setShowModal(true);
  };

  // Open modal to edit existing reminder
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    const itemDate = new Date(item.date);
    setFormData({
      title: item.title || '',
      date: formatDateKey(itemDate),
      description: item.description || '',
      repeatMonthly: Boolean(item.repeatMonthly),
      notifyBeforeDays: item.notifyBeforeDays !== undefined ? item.notifyBeforeDays : 2
    });
    setShowModal(true);
  };

  // Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingItem 
        ? `${import.meta.env.VITE_API_URL}/api/reminders/${editingItem._id}`
        : `${import.meta.env.VITE_API_URL}/api/reminders`;
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingItem(null);
        await fetchReminders();
        // Dispatch global notification update event for topbar
        window.dispatchEvent(new Event('remindersUpdated'));
      } else {
        alert('Failed to save reminder');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while saving reminder');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Complete Status
  const handleToggleComplete = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = item.status === 'Completed' ? 'Pending' : 'Completed';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/${item._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchReminders();
        window.dispatchEvent(new Event('remindersUpdated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reminders/${deleteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteId(null);
        fetchReminders();
        window.dispatchEvent(new Event('remindersUpdated'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Calendar Computation ---
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Preceding padding days from previous month
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true });
    }

    // Trailing padding days to fill 5 or 6 weeks (total 35 or 42)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  }, [currentDate]);

  // Check if a reminder falls on a particular calendar date
  const getRemindersForDate = (date) => {
    const targetDateStr = formatDateKey(date);
    const targetDayOfMonth = date.getDate();

    return items.filter(item => {
      if (!item.date) return false;
      const itemDate = new Date(item.date);
      const itemDateStr = formatDateKey(itemDate);

      // 1. Exact Date Match
      if (itemDateStr === targetDateStr) return true;

      // 2. Monthly Recurring Match (Same day of the month) - Applicable ONLY for the current year
      if (item.repeatMonthly && itemDate.getDate() === targetDayOfMonth) {
        const itemYear = itemDate.getFullYear();
        // Only recur in the same year as the event (current year) and on or after original start month
        if (date.getFullYear() === itemYear && date.getMonth() >= itemDate.getMonth()) {
          return true;
        }
      }

      return false;
    });
  };

  // Reminders for the currently selected date
  const selectedDayReminders = useMemo(() => {
    return getRemindersForDate(selectedDate);
  }, [items, selectedDate]);

  // Priority color helpers
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FEE2E2', dot: '#EF4444' };
      case 'Low':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7', dot: '#22C55E' };
      default:
        return { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7', dot: '#F59E0B' };
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  const isSelected = (d) => {
    return d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear();
  };

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Loader2 size={32} className="spin" style={{ margin: '0 auto 16px auto', color: 'var(--primary-blue)' }} />
        <p style={{ fontSize: '15px', fontWeight: '500' }}>Loading calendar & reminders...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
            <CalendarIcon size={26} color="var(--primary-blue)" /> Reminders & Event Calendar
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '4px 0 0 0' }}>
            Click on any date to schedule reminders, monthly repeating bills, and advance notification alerts.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
            <button
              onClick={() => setViewMode('calendar')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px',
                fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
                background: viewMode === 'calendar' ? 'white' : 'transparent',
                color: viewMode === 'calendar' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <CalendarDays size={16} /> Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '6px',
                fontSize: '13px', fontWeight: '600', border: 'none', cursor: 'pointer',
                background: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
            >
              <List size={16} /> Table View
            </button>
          </div>

          <button 
            onClick={() => handleOpenAddModal(selectedDate)}
            className="btn-primary"
            style={{ padding: '10px 18px', fontSize: '14px', borderRadius: '8px' }}
          >
            <Plus size={16} /> Add Reminder
          </button>
        </div>
      </div>



      {/* Mode 1: Calendar View */}
      {viewMode === 'calendar' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'start' }}>
          
          {/* Main Month Calendar Card */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
            
            {/* Calendar Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-title)', margin: 0 }}>
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={handleToday}
                  style={{
                    padding: '4px 10px', fontSize: '12px', fontWeight: '600',
                    background: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '6px',
                    color: 'var(--text-secondary)', cursor: 'pointer'
                  }}
                >
                  Today
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={handlePrevMonth}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '8px' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div key={i} style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '6px 0' }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {calendarDays.map((slot, index) => {
                const dayReminders = getRemindersForDate(slot.date);
                const isCurrent = isToday(slot.date);
                const isSel = isSelected(slot.date);

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(slot.date)}
                    style={{
                      minHeight: '84px',
                      borderRadius: '10px',
                      padding: '8px',
                      cursor: 'pointer',
                      border: isSel 
                        ? '2px solid var(--primary-blue)' 
                        : isCurrent 
                          ? '1px solid #93C5FD' 
                          : '1px solid #F1F5F9',
                      background: isSel 
                        ? '#EFF6FF' 
                        : slot.isCurrentMonth 
                          ? '#FFFFFF' 
                          : '#F8FAFC',
                      opacity: slot.isCurrentMonth ? 1 : 0.5,
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative'
                    }}
                    onMouseOver={e => { if (!isSel) e.currentTarget.style.borderColor = 'var(--primary-blue)'; }}
                    onMouseOut={e => { if (!isSel) e.currentTarget.style.borderColor = isCurrent ? '#93C5FD' : '#F1F5F9'; }}
                  >
                    {/* Top Row: Date Number & Add Icon */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '13px', fontWeight: isCurrent ? '700' : '500',
                        background: isCurrent ? 'var(--primary-blue)' : 'transparent',
                        color: isCurrent ? 'white' : 'var(--text-title)'
                      }}>
                        {slot.date.getDate()}
                      </span>

                      {dayReminders.length > 0 && (
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary-blue)', background: '#DBEAFE', borderRadius: '10px', padding: '1px 5px' }}>
                          {dayReminders.length}
                        </span>
                      )}
                    </div>

                    {/* Event Badges inside Cell */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '4px' }}>
                      {dayReminders.slice(0, 2).map((item, idx) => {
                        return (
                          <div
                            key={idx}
                            style={{
                              fontSize: '11px',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              background: '#EFF6FF',
                              color: '#1E40AF',
                              border: '1px solid #DBEAFE',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '500',
                              textDecoration: item.status === 'Completed' ? 'line-through' : 'none'
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--primary-blue)', flexShrink: 0 }}></span>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</span>
                            {item.repeatMonthly && <Repeat size={10} style={{ flexShrink: 0 }} />}
                          </div>
                        );
                      })}
                      {dayReminders.length > 2 && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', fontWeight: '600' }}>
                          +{dayReminders.length - 2} more
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* Side Panel: Selected Date Details */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Selected Date
                </p>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-title)' }}>
                  {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </h3>
              </div>
              <button
                onClick={() => handleOpenAddModal(selectedDate)}
                style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: '#EFF6FF', border: '1px solid #DBEAFE', color: 'var(--primary-blue)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
                title="Add event for this date"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* List of Reminders for this day */}
            {selectedDayReminders.length === 0 ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Bell size={32} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>No reminders scheduled</p>
                <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Click below to set an alert or recurring monthly event.
                </p>
                <button
                  onClick={() => handleOpenAddModal(selectedDate)}
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}
                >
                  <Plus size={14} /> Schedule for this day
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedDayReminders.map(item => {
                  return (
                    <div 
                      key={item._id}
                      style={{
                        padding: '14px',
                        borderRadius: '10px',
                        background: item.status === 'Completed' ? '#F8FAFC' : 'white',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {item.repeatMonthly && (
                              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: '#F5F3FF', color: '#6D28D9', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Repeat size={11} /> Monthly (Current Year)
                              </span>
                            )}
                            {item.notifyBeforeDays > 0 && (
                              <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', background: '#FEF3C7', color: '#B45309', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Bell size={11} /> {item.notifyBeforeDays}d Advance
                              </span>
                            )}
                          </div>
                          <h4 style={{ 
                            fontSize: '15px', fontWeight: '600', color: 'var(--text-title)', margin: '6px 0 0 0',
                            textDecoration: item.status === 'Completed' ? 'line-through' : 'none',
                            opacity: item.status === 'Completed' ? 0.6 : 1
                          }}>
                            {item.title}
                          </h4>
                        </div>

                        {/* Quick action buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleToggleComplete(item)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.status === 'Completed' ? '#16A34A' : 'var(--text-muted)', padding: '4px' }}
                            title={item.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteId(item._id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: '4px' }}
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {item.description && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Mode 2: Table / List View */
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div className="input-with-icon" style={{ maxWidth: '300px', width: '100%' }}>
              <Search className="input-icon" size={16} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search reminders..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ height: '38px', fontSize: '13px' }}
              />
            </div>
            <button
              onClick={() => exportToCSV(items.map(i => ({ ...i, date: formatDate(i.date) })), 'reminders.csv')}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '6px' }}
            >
              <Download size={15} /> Export CSV
            </button>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', width: '60px' }}>S.NO</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>TITLE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>EVENT DATE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>RECURRENCE</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>ADVANCE ALERT</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {items
                .filter(i => (i.title || '').toLowerCase().includes(search.toLowerCase()) || (i.description || '').toLowerCase().includes(search.toLowerCase()))
                .map((item, idx) => {
                  return (
                    <tr key={item._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>{idx + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: 'var(--text-title)' }}>
                        {item.title}
                        {item.description && <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '400' }}>{item.description}</p>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {formatDate(item.date)}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        {item.repeatMonthly ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#6D28D9', fontWeight: '600', background: '#F5F3FF', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            <Repeat size={12} /> Monthly (Current Year)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>One-time</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px' }}>
                        {item.notifyBeforeDays > 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#B45309', fontWeight: '600', background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            <Bell size={12} /> {item.notifyBeforeDays} days prior
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>On day only</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleToggleComplete(item)}
                          style={{
                            padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                            border: 'none', cursor: 'pointer',
                            background: item.status === 'Completed' ? '#ECFDF5' : '#F1F5F9',
                            color: item.status === 'Completed' ? '#059669' : '#475569'
                          }}
                        >
                          {item.status || 'Pending'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button onClick={() => handleOpenEditModal(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => setDeleteId(item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {items.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reminders registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Reminder Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={20} color="var(--primary-blue)" />
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-title)' }}>
                  {editingItem ? 'Edit Reminder' : 'Add New Reminder'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Title */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Event / Reminder Title *</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Shop Rent, GST Filing, Vendor Payment"
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  required 
                />
              </div>

              {/* Event Date */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Event Date *</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={formData.date} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })} 
                  required 
                />
              </div>

              {/* Recurring Feature: Repeat Every Month (Current Year Only) */}
              <div style={{ padding: '14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.repeatMonthly} 
                    onChange={e => setFormData({ ...formData, repeatMonthly: e.target.checked })} 
                    style={{ width: '18px', height: '18px', accentColor: 'var(--primary-blue)', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-title)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Repeat size={15} color="#7C3AED" /> Repeat Every Month (Current Year Only)
                    </span>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Automatically recurs on day {formData.date ? new Date(formData.date).getDate() : 'X'} of each month through December {formData.date ? new Date(formData.date).getFullYear() : new Date().getFullYear()}.
                    </p>
                  </div>
                </label>
              </div>

              {/* Advance Notification Days */}
              <div style={{ padding: '14px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Bell size={15} color="#D97706" /> Notify in Advance (Consecutive Days Before Event)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="number" 
                    min="0" 
                    max="30" 
                    className="input-field" 
                    style={{ maxWidth: '100px' }}
                    value={formData.notifyBeforeDays} 
                    onChange={e => setFormData({ ...formData, notifyBeforeDays: Math.max(0, parseInt(e.target.value, 10) || 0) })} 
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>days prior to the event date</span>
                </div>
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                  {formData.notifyBeforeDays > 0 
                    ? `Active alert triggers for the consecutive ${formData.notifyBeforeDays} days leading up to the event.`
                    : 'Alert triggers only on the day of the event.'}
                </p>
              </div>

              {/* Description */}
              <div className="input-group" style={{ margin: 0 }}>
                <label className="input-label">Notes / Description (Optional)</label>
                <textarea 
                  className="input-field" 
                  rows="2" 
                  placeholder="Additional details, bank account, reference info..."
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn-secondary" 
                  style={{ padding: '10px 18px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="btn-primary" 
                  style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? <><Loader2 size={16} className="spin" /> Saving...</> : (editingItem ? 'Update Reminder' : 'Add Reminder')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '24px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: 'var(--text-title)' }}>Delete Reminder?</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>
              Are you sure you want to remove this reminder? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} className="btn-secondary" style={{ padding: '10px 20px' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} style={{ padding: '10px 20px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Reminders;