import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Camera, 
  Search, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  LogIn, 
  Calendar, 
  RefreshCw,
  Clock
} from 'lucide-react';
import type { LeaveRequest } from '../types';

interface SecurityGateProps {
  requests: LeaveRequest[];
  onConfirmCheckout: (id: string) => void;
  onConfirmCheckin: (id: string) => void;
}

export const SecurityGate: React.FC<SecurityGateProps> = ({ 
  requests, 
  onConfirmCheckout, 
  onConfirmCheckin 
}) => {
  // Scanned request state
  const [scannedId, setScannedId] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [manualInputId, setManualInputId] = useState('');
  const [scanError, setScanError] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // When scannedId changes, find the request
  useEffect(() => {
    if (scannedId) {
      const found = requests.find(r => r.id === scannedId);
      if (found) {
        setSelectedRequest(found);
        setScanError('');
      } else {
        setSelectedRequest(null);
        setScanError(`Invalid Gate-Pass. Request ID "${scannedId.substring(0, 8)}..." not found.`);
      }
    }
  }, [scannedId, requests]);

  // Start HTML5 QR Code Scanner
  const startScanner = () => {
    setScannerActive(true);
    setScanError('');
    setSelectedRequest(null);
    
    // Defer initialization to allow the DOM element to mount
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader-container', 
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        );
        
        scanner.render(
          (decodedText) => {
            setScannedId(decodedText);
            // Stop scanner after successful scan to avoid duplicate calls
            scanner.clear().then(() => {
              setScannerActive(false);
            }).catch(err => console.error("Error clearing scanner", err));
          },
          () => {
            // Silence scanning errors, they are triggered continuously when no QR code is in sight
          }
        );
        scannerRef.current = scanner;
      } catch (err) {
        console.error("Camera error", err);
        setScanError("Could not access camera. Please use the Mock Simulator below.");
        setScannerActive(false);
      }
    }, 100);
  };

  // Stop Scanner
  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        setScannerActive(false);
        scannerRef.current = null;
      }).catch(err => {
        console.error("Error stopping scanner", err);
        setScannerActive(false);
      });
    } else {
      setScannerActive(false);
    }
  };

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Unmount clear error", err));
      }
    };
  }, []);

  // Handle Manual checkout confirmation
  const handleCheckout = () => {
    if (selectedRequest) {
      onConfirmCheckout(selectedRequest.id);
      // Re-fetch updated request
      const updated = requests.find(r => r.id === selectedRequest.id);
      if (updated) setSelectedRequest(updated);
    }
  };

  // Handle Manual checkin confirmation
  const handleCheckin = () => {
    if (selectedRequest) {
      onConfirmCheckin(selectedRequest.id);
      // Re-fetch updated request
      const updated = requests.find(r => r.id === selectedRequest.id);
      if (updated) setSelectedRequest(updated);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInputId.trim()) {
      setScannedId(manualInputId.trim());
      setManualInputId('');
    }
  };

  // Helper to format dates
  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' });
  };

  const getOverdueDuration = (endDateStr: string) => {
    const diff = Date.now() - new Date(endDateStr).getTime();
    if (diff <= 0) return '';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours === 0) return `${mins} mins`;
    return `${hours} hrs ${mins} mins`;
  };

  const isOverdue = selectedRequest && selectedRequest.status === 'checked_out' && new Date(selectedRequest.endDate) < new Date();

  return (
    <div className="grid-layout">
      {/* LEFT COLUMN: SCANNER PANEL */}
      <div className="glass-panel">
        <h3 className="mb-4 text-center" style={{ color: 'var(--accent-purple)' }}>Security Terminal</h3>
        
        {/* Toggle Camera button */}
        {!scannerActive ? (
          <button onClick={startScanner} className="btn btn-primary mb-4">
            <Camera size={18} /> Open QR Scanner Camera
          </button>
        ) : (
          <button onClick={stopScanner} className="btn btn-danger mb-4">
            <Camera size={18} /> Close Camera
          </button>
        )}

        {/* QR Scanner DOM Element */}
        {scannerActive && (
          <div className="mb-4">
            <div id="qr-reader-container" style={{ width: '100%', borderRadius: 'var(--border-radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}></div>
            <p className="text-muted text-center" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Position the student's phone QR pass in front of your camera.
            </p>
          </div>
        )}

        {/* Manual search form */}
        <form onSubmit={handleManualSearch} className="mb-4" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <div className="form-group">
            <label htmlFor="gatePassId">Enter Pass Code Manually</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                id="gatePassId"
                className="form-control" 
                placeholder="Paste Request ID..." 
                value={manualInputId}
                onChange={(e) => setManualInputId(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary" style={{ width: 'auto', padding: '0.8rem' }}>
                <Search size={18} />
              </button>
            </div>
          </div>
        </form>

        {/* SIMULATOR QUICK ACTIONS: Super helpful for demonstration! */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>Scanner Simulator</h4>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            No webcam? Select a student from the active list to simulate a camera scan:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {requests.filter(r => r.status === 'approved' || r.status === 'checked_out').length === 0 ? (
              <span className="text-muted" style={{ fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                No active or approved passes found.
              </span>
            ) : (
              requests
                .filter(r => r.status === 'approved' || r.status === 'checked_out')
                .map(r => (
                  <button 
                    key={r.id}
                    onClick={() => setScannedId(r.id)}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      fontSize: '0.8rem', 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left'
                    }}
                  >
                    <div>
                      <strong>{r.studentName}</strong>
                      <span className="text-muted" style={{ marginLeft: '0.4rem', fontSize: '0.75rem' }}>
                        Room {r.roomNumber}
                      </span>
                    </div>
                    <span className={`badge badge-${r.status}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                      {r.status === 'approved' ? 'Approved' : 'Checked Out'}
                    </span>
                  </button>
                ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SCAN RESULTS & TIMESTAMPING */}
      <div className="glass-panel glow-purple">
        <h2>Gate Pass Verification</h2>
        <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
          Verify the authenticity of student leave credentials and log check-out/check-in events.
        </p>

        {/* Scan Errors */}
        {scanError && (
          <div style={{ padding: '1rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--border-radius-md)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <XCircle size={28} />
            <div>
              <h4 style={{ fontWeight: 'bold' }}>SCAN FAILED</h4>
              <p style={{ fontSize: '0.85rem' }}>{scanError}</p>
            </div>
          </div>
        )}

        {/* Initial Prompt */}
        {!selectedRequest && !scanError && (
          <div className="text-center" style={{ padding: '4rem 2rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
            <Camera size={44} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>Awaiting Gate-Pass scan</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
              Scan a student's QR code using the camera, or enter the ID code manually to load details.
            </p>
          </div>
        )}

        {/* Verification Result Card */}
        {selectedRequest && (
          <div className="flex flex-column gap-2">
            
            {/* Status Header */}
            <div style={{ 
              padding: '1.25rem', 
              borderRadius: 'var(--border-radius-md)',
              background: 
                selectedRequest.status === 'approved' ? 'rgba(16, 185, 129, 0.12)' :
                selectedRequest.status === 'checked_out' ? 'rgba(168, 85, 247, 0.12)' :
                selectedRequest.status === 'returned' ? 'rgba(100, 116, 139, 0.15)' :
                'rgba(244, 63, 94, 0.12)',
              border: '1px solid',
              borderColor:
                selectedRequest.status === 'approved' ? 'var(--success)' :
                selectedRequest.status === 'checked_out' ? 'var(--accent-purple)' :
                selectedRequest.status === 'returned' ? 'var(--text-muted)' :
                'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              {selectedRequest.status === 'approved' && <CheckCircle size={36} className="text-success" />}
              {selectedRequest.status === 'checked_out' && <Clock size={36} style={{ color: 'var(--accent-purple)' }} />}
              {selectedRequest.status === 'returned' && <CheckCircle size={36} className="text-muted" />}
              {(selectedRequest.status === 'submitted' || selectedRequest.status === 'rejected') && <XCircle size={36} className="text-danger" />}

              <div>
                <h3 style={{ 
                  color: 
                    selectedRequest.status === 'approved' ? 'var(--success)' :
                    selectedRequest.status === 'checked_out' ? '#c084fc' :
                    selectedRequest.status === 'returned' ? 'var(--text-main)' :
                    'var(--danger)',
                  fontSize: '1.25rem',
                  fontWeight: 800
                }}>
                  {selectedRequest.status === 'approved' && '✅ LEAVE APPROVED'}
                  {selectedRequest.status === 'checked_out' && '⚠️ CURRENTLY CHECKED OUT'}
                  {selectedRequest.status === 'returned' && '🔘 ALREADY COMPLETED & RETURNED'}
                  {selectedRequest.status === 'submitted' && '❌ UNAPPROVED PASS'}
                  {selectedRequest.status === 'rejected' && '❌ REJECTED PASS'}
                </h3>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {selectedRequest.status === 'approved' && 'Student is authorized to check out of campus.'}
                  {selectedRequest.status === 'checked_out' && 'Student is currently off campus.'}
                  {selectedRequest.status === 'returned' && 'This pass has completed its full lifecycle.'}
                  {selectedRequest.status === 'submitted' && 'This pass has not been reviewed by the Warden.'}
                  {selectedRequest.status === 'rejected' && 'This pass was declined by the Warden.'}
                </p>
              </div>
            </div>

            {/* Student Profile Card details */}
            <div className="glass-panel" style={{ background: 'rgba(255, 255, 255, 0.01)', padding: '1.5rem', marginTop: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{selectedRequest.studentName}</h3>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {selectedRequest.rollNumber} | {selectedRequest.department}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-submitted" style={{ fontWeight: 'bold' }}>
                    Block {selectedRequest.block}
                  </span>
                  <p style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '0.25rem' }}>Room {selectedRequest.roomNumber}</p>
                </div>
              </div>

              {/* Leave details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                <div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Destination</span>
                  <strong>{selectedRequest.destination}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Reason</span>
                  <strong>{selectedRequest.reason}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Scheduled Out Date</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} /> {new Date(selectedRequest.startDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                <div>
                  <span className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', display: 'block' }}>Scheduled Return Date</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={14} /> {new Date(selectedRequest.endDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {/* Timestamp details */}
              <div style={{ background: 'rgba(0,0,0,0.15)', padding: '0.85rem', borderRadius: 'var(--border-radius-md)', fontSize: '0.8rem' }}>
                <p style={{ marginBottom: '0.25rem' }}>
                  <strong>Checkout Time:</strong>{' '}
                  <span style={{ color: selectedRequest.checkoutTime ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {formatTime(selectedRequest.checkoutTime)}
                  </span>
                </p>
                <p>
                  <strong>Check-in Time:</strong>{' '}
                  <span style={{ color: selectedRequest.checkinTime ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {formatTime(selectedRequest.checkinTime)}
                  </span>
                </p>
              </div>

              {/* Action Buttons for Guard Checkout / Checkin */}
              <div style={{ marginTop: '1.5rem' }}>
                {isOverdue && (
                  <div style={{ 
                    padding: '0.75rem 1rem', 
                    background: 'rgba(239, 68, 68, 0.15)', 
                    border: '1px solid var(--danger)', 
                    borderRadius: '8px', 
                    color: '#f87171', 
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}>
                    🚨 OVERDUE WARNING: Check-in is late by {getOverdueDuration(selectedRequest.endDate)}!
                  </div>
                )}

                {selectedRequest.status === 'approved' && (
                  <button onClick={handleCheckout} className="btn btn-success" style={{ gap: '0.75rem', fontSize: '1.05rem', padding: '1rem' }}>
                    <LogOut size={20} /> CONFIRM STUDENT OUT (CHECKOUT)
                  </button>
                )}

                {selectedRequest.status === 'checked_out' && (
                  <button onClick={handleCheckin} className="btn btn-primary" style={{ gap: '0.75rem', fontSize: '1.05rem', padding: '1rem' }}>
                    <LogIn size={20} /> CONFIRM STUDENT RETURN (CHECK IN)
                  </button>
                )}

                {selectedRequest.status === 'returned' && (
                  <div className="text-center text-muted" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    Leave request cycle completed. No further action needed.
                  </div>
                )}

                {(selectedRequest.status === 'submitted' || selectedRequest.status === 'rejected') && (
                  <div className="text-center text-danger" style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px dashed var(--danger)', borderRadius: '8px', fontWeight: 'bold' }}>
                    🚨 ACCESS DENIED: Student is not authorized to leave!
                  </div>
                )}
              </div>
            </div>

            {/* Clear selection button */}
            <button 
              onClick={() => {
                setSelectedRequest(null);
                setScannedId('');
              }} 
              className="btn btn-secondary mt-4"
              style={{ width: 'auto', alignSelf: 'center' }}
            >
              <RefreshCw size={14} /> Clear Selection / Scan Again
            </button>

          </div>
        )}
      </div>
    </div>
  );
};
