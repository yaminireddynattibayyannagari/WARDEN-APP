import { useState, useEffect } from 'react';
import { User, Shield, Key, RefreshCw, Layers } from 'lucide-react';
import type { LeaveRequest, UserRole } from './types';
import { api } from './services/api';

import { StudentDashboard } from './components/StudentDashboard';
import { WardenPortal } from './components/WardenPortal';
import { SecurityGate } from './components/SecurityGate';

// Mock Initial Leave Requests to seed the system with different states
const MOCK_INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: "req-yamini-302",
    studentName: "Yamini N.",
    rollNumber: "22CSE0302",
    department: "CSE",
    block: "A",
    roomNumber: "302",
    destination: "Bengaluru, Karnataka (Home)",
    startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16), // 3 days from now
    reason: "Attending sister's wedding ceremony and family get-together.",
    emergencyStatus: false,
    status: "submitted",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    pdfLetterUrl: null,
    checkoutTime: null,
    checkinTime: null,
    studentEmail: "yamini@student.edu",
    parentEmail: "parent.yamini@gmail.com",
    logs: [
      {
        action: "Submitted",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        user: "Yamini N.",
        message: "Leave application submitted to Warden queue."
      }
    ]
  },
  {
    id: "req-rohan-210",
    studentName: "Rohan S.",
    rollNumber: "23ECE0114",
    department: "ECE",
    block: "B",
    roomNumber: "210",
    destination: "Local Book Market, Sector-4",
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 14400000).toISOString().slice(0, 16), // +4 hours
    reason: "Purchasing reference textbooks and laboratory manuals for ECE semester course.",
    emergencyStatus: false,
    status: "approved",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    pdfLetterUrl: null,
    checkoutTime: null,
    checkinTime: null,
    studentEmail: "rohan.s@student.edu",
    parentEmail: "guardian.rohan@gmail.com",
    logs: [
      {
        action: "Submitted",
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        user: "Rohan S.",
        message: "Leave application submitted to Warden queue."
      },
      {
        action: "Approved",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        user: "Warden Block B",
        message: "Request approved. Security pass generated."
      }
    ]
  },
  {
    id: "req-ananya-405",
    studentName: "Ananya K.",
    rollNumber: "22EEE0405",
    department: "EEE",
    block: "C",
    roomNumber: "405",
    destination: "City Specialty Clinic, Cross Road",
    startDate: new Date(Date.now() - 7200000).toISOString().slice(0, 16), // 2 hours ago
    endDate: new Date(Date.now() + 7200000).toISOString().slice(0, 16), // 2 hours from now
    reason: "Urgent dental checkup for acute toothache emergency.",
    emergencyStatus: true,
    status: "checked_out",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    pdfLetterUrl: null,
    checkoutTime: new Date(Date.now() - 3600000).toISOString(),
    checkinTime: null,
    studentEmail: "ananya.k@student.edu",
    parentEmail: "parent.ananya@gmail.com",
    logs: [
      {
        action: "Submitted",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: "Ananya K.",
        message: "Leave application submitted as Emergency."
      },
      {
        action: "Approved",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: "Warden Block C",
        message: "Emergency leave auto-approved by warden console."
      },
      {
        action: "Checked Out",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: "Security Guard",
        message: "Student checked out through Gate 1."
      }
    ]
  },
  {
    id: "req-vikram-104",
    studentName: "Vikram M.",
    rollNumber: "24MCH0054",
    department: "MECH",
    block: "D",
    roomNumber: "104",
    destination: "Chennai, Tamil Nadu (Home)",
    startDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 16),
    endDate: new Date(Date.now() - 3600000 * 4).toISOString().slice(0, 16),
    reason: "Leaving to attend local traditional harvesting festival.",
    emergencyStatus: false,
    status: "returned",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    pdfLetterUrl: null,
    checkoutTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    checkinTime: new Date(Date.now() - 3600000 * 4).toISOString(),
    studentEmail: "vikram@student.edu",
    parentEmail: "guardian.vikram@gmail.com",
    logs: [
      {
        action: "Submitted",
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        user: "Vikram M.",
        message: "Leave request logged."
      },
      {
        action: "Approved",
        timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
        user: "Warden Block D",
        message: "Leave approved by Warden."
      },
      {
        action: "Checked Out",
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        user: "Security Guard",
        message: "Student exited building."
      },
      {
        action: "Returned",
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        user: "Security Guard",
        message: "Student returned to hostel campus safely."
      }
    ]
  },
  {
    id: "req-sneha-112",
    studentName: "Sneha P.",
    rollNumber: "22CSE0112",
    department: "CSE",
    block: "A",
    roomNumber: "112",
    destination: "Nexus Mall, Outer Ring Road",
    startDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 18000000).toISOString().slice(0, 16),
    reason: "Weekend recreational shopping and movies with classmates.",
    emergencyStatus: false,
    status: "rejected",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    pdfLetterUrl: null,
    checkoutTime: null,
    checkinTime: null,
    studentEmail: "sneha.p@student.edu",
    parentEmail: "parent.sneha@gmail.com",
    logs: [
      {
        action: "Submitted",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        user: "Sneha P.",
        message: "Leave request logged."
      },
      {
        action: "Rejected",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        user: "Warden Block A",
        message: "Recreation outings are suspended during ongoing semester exam week."
      }
    ]
  }
];

function App() {
  const [role, setRole] = useState<UserRole>(() => {
    // Read url hash or query parameter for easy multi-tab role configuration!
    const hash = window.location.hash.substring(1);
    if (hash === 'student' || hash === 'warden' || hash === 'guard') {
      return hash as UserRole;
    }
    return 'student'; // Default role
  });

  // Main Requests State
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  // Fetch initial requests from database (or local storage fallback)
  useEffect(() => {
    const fetchRequests = async () => {
      const res = await api.getRequests();
      setRequests(res.data);
      setIsOffline(res.isOffline);
    };
    fetchRequests();
  }, []);

  // Real-time synchronization across browser tabs!
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'warden_app_requests' && e.newValue) {
        try {
          setRequests(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Error syncing storage across tabs", err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Update role hash in URL to allow bookmarking individual roles in tabs!
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    window.location.hash = newRole;
  };

  // Reset database function
  const handleResetDatabase = async () => {
    if (window.confirm("Reset application state to default mock database?")) {
      const res = await api.resetRequests();
      setRequests(res.data);
      setIsOffline(res.isOffline);
    }
  };

  // ACTION HANDLERS

  // Submit leave request from student dashboard
  const handleSubmitRequest = async (requestData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'logs' | 'checkoutTime' | 'checkinTime'>) => {
    const res = await api.createRequest(requestData);
    setIsOffline(res.isOffline);
    // Refresh to sync complete details (including generated ID / logs / dates) from backend
    const refreshed = await api.getRequests();
    setRequests(refreshed.data);
    setIsOffline(refreshed.isOffline);
  };

  // Approve leave request (Warden Action)
  const handleApprove = async (id: string) => {
    const now = new Date().toISOString();
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const updates = {
      status: 'approved' as const,
      updatedAt: now,
      logs: [
        ...req.logs,
        {
          action: 'Approved' as const,
          timestamp: now,
          user: `Warden Block ${req.block}`,
          message: 'Request approved. Gate pass generated.'
        }
      ]
    };

    const res = await api.updateRequest(id, updates);
    setIsOffline(res.isOffline);
    setRequests(prev => prev.map(r => r.id === id ? res.data : r));
  };

  // Reject leave request (Warden Action)
  const handleReject = async (id: string, reason: string) => {
    const now = new Date().toISOString();
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const updates = {
      status: 'rejected' as const,
      updatedAt: now,
      logs: [
        ...req.logs,
        {
          action: 'Rejected' as const,
          timestamp: now,
          user: `Warden Block ${req.block}`,
          message: reason
        }
      ]
    };

    const res = await api.updateRequest(id, updates);
    setIsOffline(res.isOffline);
    setRequests(prev => prev.map(r => r.id === id ? res.data : r));
  };

  // Update parent consent status from Warden Portal simulator
  const handleUpdateConsent = async (id: string, consent: 'approved' | 'rejected') => {
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const updates = {
      parentConsentStatus: consent,
      logs: [
        ...req.logs,
        {
          action: consent === 'approved' ? 'Approved' as const : 'Rejected' as const,
          timestamp: new Date().toISOString(),
          user: 'System Parent Simulator',
          message: consent === 'approved' ? 'Parent submitted digital approval confirmation.' : 'Parent denied leave request.'
        }
      ]
    };

    const res = await api.updateRequest(id, updates);
    setIsOffline(res.isOffline);
    setRequests(prev => prev.map(r => r.id === id ? res.data : r));
  };

  // Confirm student stepped OUT (Security Action)
  const handleConfirmCheckout = async (id: string) => {
    const now = new Date().toISOString();
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const updates = {
      status: 'checked_out' as const,
      checkoutTime: now,
      updatedAt: now,
      logs: [
        ...req.logs,
        {
          action: 'Checked Out' as const,
          timestamp: now,
          user: 'Gate Officer',
          message: `Student verified and checked out of campus.`
        }
      ]
    };

    const res = await api.updateRequest(id, updates);
    setIsOffline(res.isOffline);
    setRequests(prev => prev.map(r => r.id === id ? res.data : r));
  };

  // Confirm student checked IN (Security Action)
  const handleConfirmCheckin = async (id: string) => {
    const now = new Date().toISOString();
    const req = requests.find(r => r.id === id);
    if (!req) return;

    const updates = {
      status: 'returned' as const,
      checkinTime: now,
      updatedAt: now,
      logs: [
        ...req.logs,
        {
          action: 'Returned' as const,
          timestamp: now,
          user: 'Gate Officer',
          message: 'Student checked back into campus premises safely.'
        }
      ]
    };

    const res = await api.updateRequest(id, updates);
    setIsOffline(res.isOffline);
    setRequests(prev => prev.map(r => r.id === id ? res.data : r));
  };

  return (
    <div className="container">
      
      {/* HEADER SECTION */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">W</div>
          <div>
            <h1 className="logo-text">WARDEN</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '-4px' }}>
              Hostel Leave Tracking System
            </span>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="header-actions">
          {/* DB Indicator */}
          <div 
            className="badge-indicator" 
            onClick={handleResetDatabase} 
            style={{ 
              cursor: 'pointer',
              borderColor: isOffline ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)',
              background: isOffline ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              color: isOffline ? '#f59e0b' : '#10b981'
            }} 
            title="Click to reset database"
          >
            <span 
              className="dot" 
              style={{ 
                background: isOffline ? '#f59e0b' : '#10b981',
                boxShadow: isOffline ? '0 0 8px #f59e0b' : '0 0 8px #10b981'
              }}
            ></span>
            <span>{isOffline ? 'Offline Mode (Local Storage)' : 'Backend Connected (JSON DB)'}</span>
            <RefreshCw size={12} style={{ marginLeft: '4px', opacity: 0.7 }} />
          </div>

          {/* Navigation dock */}
          <nav className="role-nav">
            <button 
              className={`role-btn ${role === 'student' ? 'active' : ''}`}
              onClick={() => handleRoleChange('student')}
            >
              <User size={15} /> Student
            </button>
            <button 
              className={`role-btn ${role === 'warden' ? 'active' : ''}`}
              onClick={() => handleRoleChange('warden')}
            >
              <Shield size={15} /> Warden
            </button>
            <button 
              className={`role-btn ${role === 'guard' ? 'active' : ''}`}
              onClick={() => handleRoleChange('guard')}
            >
              <Key size={15} /> Security Gate
            </button>
          </nav>
        </div>
      </header>

      {/* DETAILED WORKSPACE ROUTING */}
      <main style={{ minHeight: 'calc(100vh - 160px)' }}>
        {role === 'student' && (
          <StudentDashboard 
            requests={requests} 
            onSubmitRequest={handleSubmitRequest} 
          />
        )}
        {role === 'warden' && (
          <WardenPortal 
            requests={requests} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            onUpdateConsent={handleUpdateConsent}
          />
        )}
        {role === 'guard' && (
          <SecurityGate 
            requests={requests} 
            onConfirmCheckout={handleConfirmCheckout} 
            onConfirmCheckin={handleConfirmCheckin} 
          />
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ marginTop: '3rem', padding: '1.5rem 0', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <p>© 2026 WARDEN system. Built for premium digital campus governance.</p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={12} /> Real-time state synchronized across open tabs
        </p>
      </footer>
    </div>
  );
}

export default App;
