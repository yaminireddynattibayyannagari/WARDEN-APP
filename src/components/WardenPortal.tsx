import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  CheckSquare, 
  AlertTriangle,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Mail
} from 'lucide-react';
import type { LeaveRequest } from '../types';

interface WardenPortalProps {
  requests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onUpdateConsent?: (id: string, consent: 'approved' | 'rejected') => void;
}

export const WardenPortal: React.FC<WardenPortalProps> = ({ 
  requests, 
  onApprove, 
  onReject,
  onUpdateConsent
}) => {
  // Filters State
  const [blockFilter, setBlockFilter] = useState('All');
  const [emergencyFilter, setEmergencyFilter] = useState('All'); // 'All' | 'Emergency' | 'Normal'
  const [searchTerm, setSearchTerm] = useState('');
  const [roomFilter, setRoomFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_review'); // 'pending_review' | 'all' | 'approved' | 'checked_out' | 'returned' | 'rejected'

  // Rejection Reason input field mapping
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Simulated Email Notification Console logs state
  const [emailLogs, setEmailLogs] = useState<string[]>(() => {
    // Generate some initial historical log lines
    return [
      `[${new Date(Date.now() - 3600000 * 2).toLocaleTimeString()}] ✉️ Simulated Notification Engine initialized.`,
      `[${new Date(Date.now() - 3600000).toLocaleTimeString()}] ✉️ Historical email sync completed.`,
    ];
  });

  // Add a log to simulated notification logger
  const logSimulatedEmail = (recipient: string, type: 'Approved' | 'Rejected', request: LeaveRequest, detail?: string) => {
    const time = new Date().toLocaleTimeString();
    const studentLine = `[${time}] ✉️ EMAIL SENT to Student: ${recipient} | Subj: Leave Request ${type} - ${request.destination}`;
    const parentLine = `[${time}] ✉️ EMAIL SENT to Parent: ${request.parentEmail || 'guardian@family.com'} | Subj: Warden Notification: Leave Request for ${request.studentName} is ${type} ${detail ? `(${detail})` : ''}`;
    
    setEmailLogs(prev => [studentLine, parentLine, ...prev]);
  };

  // Approval handler
  const handleApproveClick = (req: LeaveRequest) => {
    onApprove(req.id);
    logSimulatedEmail(req.studentEmail || `${req.rollNumber}@student.edu`, 'Approved', req);
  };

  // Rejection handler
  const handleRejectClick = (id: string) => {
    setRejectingId(id);
    setRejectionReason('');
  };

  const submitRejection = (req: LeaveRequest) => {
    if (!rejectionReason.trim()) return;
    onReject(req.id, rejectionReason);
    logSimulatedEmail(req.studentEmail || `${req.rollNumber}@student.edu`, 'Rejected', req, rejectionReason);
    setRejectingId(null);
    setRejectionReason('');
  };

  // Compute Stats
  const totalPending = requests.filter(r => r.status === 'submitted').length;
  const totalCheckedOut = requests.filter(r => r.status === 'checked_out').length;
  const totalActivePasses = requests.filter(r => r.status === 'approved').length;
  const totalEmergencies = requests.filter(r => r.emergencyStatus && r.status === 'submitted').length;
  const totalOverdue = requests.filter(r => r.status === 'checked_out' && new Date(r.endDate) < new Date()).length;

  // Filter requests
  const filteredRequests = requests.filter(r => {
    // Status Filter
    if (statusFilter === 'pending_review' && r.status !== 'submitted') return false;
    if (statusFilter === 'approved' && r.status !== 'approved') return false;
    if (statusFilter === 'checked_out' && r.status !== 'checked_out') return false;
    if (statusFilter === 'returned' && r.status !== 'returned') return false;
    if (statusFilter === 'rejected' && r.status !== 'rejected') return false;
    if (statusFilter === 'overdue' && !(r.status === 'checked_out' && new Date(r.endDate) < new Date())) return false;

    // Block Filter
    if (blockFilter !== 'All' && r.block !== blockFilter) return false;

    // Emergency Filter
    if (emergencyFilter === 'Emergency' && !r.emergencyStatus) return false;
    if (emergencyFilter === 'Normal' && r.emergencyStatus) return false;

    // Search Term (Name/Roll)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = r.studentName.toLowerCase().includes(term);
      const matchesRoll = r.rollNumber.toLowerCase().includes(term);
      if (!matchesName && !matchesRoll) return false;
    }

    // Room Filter
    if (roomFilter && !r.roomNumber.includes(roomFilter)) return false;

    return true;
  });

  return (
    <div className="flex flex-column gap-2" style={{ width: '100%' }}>
      
      {/* STATISTICS GRID */}
      <div className="grid-3 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Pending Requests */}
        <div 
          className="stat-card glow-warning"
          onClick={() => setStatusFilter('pending_review')}
          style={{ cursor: 'pointer', background: statusFilter === 'pending_review' ? 'rgba(245, 158, 11, 0.08)' : '' }}
        >
          <div className="stat-info">
            <span className="stat-label">Pending Review</span>
            <span className="stat-value">{totalPending}</span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Clock size={24} />
          </div>
        </div>

        {/* Emergencies */}
        <div 
          className="stat-card" 
          onClick={() => { setStatusFilter('pending_review'); setEmergencyFilter('Emergency'); }}
          style={{ 
            cursor: 'pointer',
            borderColor: totalEmergencies > 0 ? 'var(--danger)' : 'var(--border-color)', 
            boxShadow: totalEmergencies > 0 ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none',
            background: statusFilter === 'pending_review' && emergencyFilter === 'Emergency' ? 'rgba(239, 68, 68, 0.08)' : ''
          }}
        >
          <div className="stat-info">
            <span className="stat-label" style={{ color: totalEmergencies > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>Emergencies</span>
            <span className="stat-value" style={{ color: totalEmergencies > 0 ? 'var(--danger)' : 'var(--text-main)' }}>{totalEmergencies}</span>
          </div>
          <div className="stat-icon" style={{ 
            background: totalEmergencies > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
            color: totalEmergencies > 0 ? '#f87171' : 'var(--text-muted)' 
          }}>
            <AlertTriangle size={24} className={totalEmergencies > 0 ? 'badge-emergency' : ''} />
          </div>
        </div>

        {/* Approved Out */}
        <div 
          className="stat-card glow-cyan"
          onClick={() => setStatusFilter('approved')}
          style={{ cursor: 'pointer', background: statusFilter === 'approved' ? 'rgba(6, 182, 212, 0.08)' : '' }}
        >
          <div className="stat-info">
            <span className="stat-label">Active (Approved)</span>
            <span className="stat-value">{totalActivePasses}</span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee' }}>
            <CheckSquare size={24} />
          </div>
        </div>

        {/* Checked Out */}
        <div 
          className="stat-card glow-purple"
          onClick={() => setStatusFilter('checked_out')}
          style={{ cursor: 'pointer', background: statusFilter === 'checked_out' ? 'rgba(168, 85, 247, 0.08)' : '' }}
        >
          <div className="stat-info">
            <span className="stat-label">Checked Out</span>
            <span className="stat-value">{totalCheckedOut}</span>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Users size={24} />
          </div>
        </div>

        {/* Overdue */}
        <div 
          className="stat-card glow-danger"
          onClick={() => setStatusFilter('overdue')}
          style={{ 
            cursor: 'pointer',
            borderColor: totalOverdue > 0 ? 'var(--danger)' : 'var(--border-color)', 
            boxShadow: totalOverdue > 0 ? '0 0 20px rgba(239, 68, 68, 0.2)' : 'none',
            background: statusFilter === 'overdue' ? 'rgba(239, 68, 68, 0.08)' : ''
          }}
          title="Click to view overdue returns"
        >
          <div className="stat-info">
            <span className="stat-label" style={{ color: totalOverdue > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>Overdue Returns</span>
            <span className="stat-value" style={{ color: totalOverdue > 0 ? 'var(--danger)' : 'var(--text-main)' }}>{totalOverdue}</span>
          </div>
          <div className="stat-icon" style={{ 
            background: totalOverdue > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)', 
            color: totalOverdue > 0 ? '#f87171' : 'var(--text-muted)' 
          }}>
            <AlertTriangle size={24} className={totalOverdue > 0 ? 'badge-emergency' : ''} />
          </div>
        </div>
      </div>

      <div className="grid-layout">
        {/* LEFT COLUMN: FILTERS & EMAIL LOGS */}
        <div className="flex flex-column gap-2">
          
          {/* FILTER PANEL */}
          <div className="glass-panel">
            <h3 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
              <Filter size={18} /> Search & Filters
            </h3>

            {/* Filter by Request Queue Status */}
            <div className="form-group">
              <label>Queue View</label>
              <select 
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="pending_review">📥 Pending Review ({totalPending})</option>
                <option value="approved">🟢 Approved Passes ({totalActivePasses})</option>
                <option value="checked_out">🟣 Checked Out ({totalCheckedOut})</option>
                <option value="overdue">🚨 Overdue Return ({totalOverdue})</option>
                <option value="returned">🔘 Returned Logs</option>
                <option value="rejected">🔴 Rejected Requests</option>
                <option value="all">📁 All History</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="form-group">
              <label htmlFor="searchName">Search Student / Roll No.</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  id="searchName"
                  className="form-control"
                  placeholder="e.g. Yamini / 22CSE" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Block Selector */}
            <div className="form-group">
              <label>Hostel Block</label>
              <select 
                className="form-control"
                value={blockFilter}
                onChange={(e) => setBlockFilter(e.target.value)}
              >
                <option value="All">All Blocks</option>
                <option value="A">Block A</option>
                <option value="B">Block B</option>
                <option value="C">Block C</option>
                <option value="D">Block D</option>
              </select>
            </div>

            {/* Room Filter */}
            <div className="form-group">
              <label htmlFor="searchRoom">Room Number</label>
              <input 
                type="text" 
                id="searchRoom"
                className="form-control"
                placeholder="e.g. 302"
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              />
            </div>

            {/* Emergency Status */}
            <div className="form-group">
              <label>Severity Level</label>
              <select 
                className="form-control"
                value={emergencyFilter}
                onChange={(e) => setEmergencyFilter(e.target.value)}
              >
                <option value="All">All Requests</option>
                <option value="Emergency">⚠️ Emergencies Only</option>
                <option value="Normal">📅 Standard Only</option>
              </select>
            </div>
          </div>

          {/* OUTING ANALYTICS CHARTS */}
          <div className="glass-panel" style={{ background: 'rgba(15, 23, 42, 0.25)' }}>
            <h3 className="mb-3" style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)' }}>
              Outing Analytics
            </h3>
            
            {/* Chart 1: Hostel Blocks */}
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Active Leave by Hostel Block
              </span>
              {['A', 'B', 'C', 'D'].map(blk => {
                const count = requests.filter(r => r.block === blk && (r.status === 'approved' || r.status === 'checked_out')).length;
                const totalActive = requests.filter(r => r.status === 'approved' || r.status === 'checked_out').length || 1;
                const percent = Math.round((count / totalActive) * 100);
                return (
                  <div key={blk} style={{ margin: '0.4rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                      <span>Block {blk}</span>
                      <strong>{count} ({percent}%)</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percent}%`, 
                        height: '100%', 
                        background: blk === 'A' ? 'var(--accent-cyan)' : blk === 'B' ? 'var(--accent-purple)' : blk === 'C' ? 'var(--success)' : 'var(--warning)', 
                        borderRadius: '3px',
                        transition: 'width 0.5s ease-in-out'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chart 2: Outing Category Breakdown */}
            <div>
              <span className="text-muted" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                Leave Purpose Breakdown
              </span>
              {['Medical', 'Home Travel', 'Local Outing'].map(cat => {
                const count = requests.filter(r => {
                  const reasonLower = (r.reason + ' ' + r.destination).toLowerCase();
                  if (cat === 'Medical') return reasonLower.includes('doctor') || reasonLower.includes('clinic') || reasonLower.includes('medical') || reasonLower.includes('dental') || r.emergencyStatus;
                  if (cat === 'Home Travel') return reasonLower.includes('home') || reasonLower.includes('wedding') || reasonLower.includes('festival') || reasonLower.includes('parent');
                  return !reasonLower.includes('doctor') && !reasonLower.includes('clinic') && !reasonLower.includes('medical') && !reasonLower.includes('dental') && !r.emergencyStatus && !reasonLower.includes('home') && !reasonLower.includes('parent');
                }).length;
                const total = requests.length || 1;
                const percent = Math.round((count / total) * 100);
                return (
                  <div key={cat} style={{ margin: '0.4rem 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                      <span>{cat}</span>
                      <strong>{count} ({percent}%)</strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${percent}%`, 
                        height: '100%', 
                        background: cat === 'Medical' ? 'var(--danger)' : cat === 'Home Travel' ? '#60a5fa' : '#a7f3d0', 
                        borderRadius: '3px',
                        transition: 'width 0.5s ease-in-out'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIMULATED EMAIL NOTIFICATIONS CONSOLE */}
          <div className="glass-panel" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              <Mail size={16} /> Notification Dispatcher
            </h3>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
              Simulates trigger notifications emailed to student and guardian endpoints.
            </p>
            <div className="logs-console">
              {emailLogs.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>Awaiting action...</div>
              ) : (
                emailLogs.map((log, i) => (
                  <div key={i} className="logs-line">
                    <span className="time">{log.split(' ')[0]}</span>
                    <span>{log.substring(log.indexOf(' ') + 1)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUEUE LIST */}
        <div className="glass-panel">
          <div className="flex items-center justify-between mb-4">
            <h2>
              {statusFilter === 'pending_review' && 'Pending Leave Requests'}
              {statusFilter === 'approved' && 'Approved Gate-Passes'}
              {statusFilter === 'checked_out' && 'Students Out of Campus'}
              {statusFilter === 'returned' && 'Returned Logs Archive'}
              {statusFilter === 'rejected' && 'Rejected Applications'}
              {statusFilter === 'all' && 'All Leave Logs'}
            </h2>
            <span className="badge badge-submitted" style={{ fontSize: '0.8rem' }}>
              Showing {filteredRequests.length} record(s)
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center" style={{ padding: '4rem 2rem' }}>
              <CheckCircle size={40} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
              <h3>No Requests Found</h3>
              <p className="text-muted" style={{ marginTop: '0.5rem' }}>
                All clear! No leave requests match your search criteria.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Info</th>
                    <th>Destination & Purpose</th>
                    <th>Date & Time Bounds</th>
                    <th>Review PDF</th>
                    <th>Status</th>
                    {statusFilter === 'pending_review' && <th style={{ textAlign: 'right' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req.id}>
                      {/* Student details */}
                      <td>
                        <div className="profile-card">
                          <div className="profile-avatar">
                            {req.studentName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                          </div>
                          <div className="profile-details">
                            <span className="profile-name">
                              {req.studentName}
                            </span>
                            <span className="profile-sub">
                              {req.rollNumber} | {req.department}
                            </span>
                            <span className="profile-sub" style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                              Block {req.block} - Room {req.roomNumber}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Destination details */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 500 }}>{req.destination}</span>
                          <span className="profile-sub" style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                            {req.reason}
                          </span>
                        </div>
                      </td>

                      {/* Time limits */}
                      <td>
                        {(() => {
                          const isOverdue = req.status === 'checked_out' && new Date(req.endDate) < new Date();
                          const getOverdueDuration = (endDateStr: string) => {
                            const diff = Date.now() - new Date(endDateStr).getTime();
                            if (diff <= 0) return '';
                            const hours = Math.floor(diff / 3600000);
                            const mins = Math.floor((diff % 3600000) / 60000);
                            if (hours === 0) return `${mins}m`;
                            return `${hours}h ${mins}m`;
                          };
                          return (
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
                              <span style={{ color: 'var(--text-muted)' }}>
                                <strong>Out:</strong> {new Date(req.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                              <span style={{ color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? 'bold' : 'normal' }}>
                                <strong>Ret:</strong> {new Date(req.endDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                              {isOverdue && (
                                <span style={{ 
                                  color: '#f87171', 
                                  fontSize: '0.7rem', 
                                  fontWeight: 'bold', 
                                  marginTop: '0.2rem', 
                                  background: 'rgba(239, 68, 68, 0.15)', 
                                  padding: '0.15rem 0.35rem', 
                                  borderRadius: '4px',
                                  display: 'inline-block'
                                }}>
                                  ⚠️ LATE BY {getOverdueDuration(req.endDate)}
                                </span>
                              )}
                            </div>
                          );
                        })()}
                      </td>

                      {/* PDF Letter */}
                      <td>
                        {req.pdfLetterUrl ? (
                          <button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = req.pdfLetterUrl!;
                              link.download = `Leave_Letter_${req.rollNumber}.pdf`;
                              link.click();
                            }}
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.75rem', width: 'auto', display: 'inline-flex', fontSize: '0.75rem', gap: '0.35rem' }}
                          >
                            <FileText size={14} /> Download PDF
                          </button>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '0.8rem' }}>Not Generated</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'start' }}>
                          <span className={`badge badge-${req.status}`}>
                            {req.status.replace('_', ' ')}
                          </span>
                          {req.emergencyStatus && <span className="badge badge-emergency">Emergency</span>}
                          
                          {/* Parent Consent status indicator and simulation trigger */}
                          {req.parentConsentStatus && req.parentConsentStatus !== 'not_required' && (
                            <div style={{ marginTop: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Parent Consent:</span>
                              {req.parentConsentStatus === 'pending' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                  <span className="badge badge-submitted" style={{ background: '#f59e0b', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>Awaiting Approval</span>
                                  {onUpdateConsent && (
                                    <button 
                                      onClick={() => onUpdateConsent(req.id, 'approved')}
                                      className="btn btn-secondary" 
                                      style={{ padding: '0.2rem 0.4rem', fontSize: '0.65rem', width: 'auto', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', marginTop: '0.15rem' }}
                                      title="Click to simulate guardian digital approval"
                                    >
                                      Simulate Parent Approve
                                    </button>
                                  )}
                                </div>
                              ) : req.parentConsentStatus === 'approved' ? (
                                <span className="badge badge-approved" style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>✅ Approved</span>
                              ) : (
                                <span className="badge badge-rejected" style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>❌ Denied</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      {statusFilter === 'pending_review' && (
                        <td>
                          {rejectingId === req.id ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '180px' }}>
                              <input 
                                type="text"
                                className="form-control"
                                style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                placeholder="Enter Rejection Reason..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                autoFocus
                              />
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button 
                                  onClick={() => submitRejection(req)} 
                                  className="btn btn-danger" 
                                  style={{ padding: '0.35rem', fontSize: '0.75rem' }}
                                  disabled={!rejectionReason.trim()}
                                >
                                  Submit Reject
                                </button>
                                <button 
                                  onClick={() => setRejectingId(null)} 
                                  className="btn btn-secondary" 
                                  style={{ padding: '0.35rem', fontSize: '0.75rem' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="btn-group" style={{ justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => handleApproveClick(req)} 
                                className="btn btn-success" 
                                style={{ 
                                  padding: '0.4rem 0.75rem', 
                                  width: 'auto', 
                                  borderRadius: 'var(--border-radius-md)',
                                  opacity: (req.parentConsentStatus === 'pending') ? 0.55 : 1
                                }}
                                title={req.parentConsentStatus === 'pending' ? "Parent Consent is Pending! Action permitted but caution advised." : "Approve Leave"}
                              >
                                <CheckCircle size={15} /> Approve
                              </button>
                              <button 
                                onClick={() => handleRejectClick(req.id)} 
                                className="btn btn-danger" 
                                style={{ padding: '0.4rem 0.75rem', width: 'auto', borderRadius: 'var(--border-radius-md)' }}
                                title="Reject Leave"
                              >
                                <XCircle size={15} /> Reject
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
