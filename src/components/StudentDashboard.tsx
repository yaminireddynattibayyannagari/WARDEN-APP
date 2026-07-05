import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FileText, 
  FileCheck, 
  Download, 
  ArrowLeft, 
  ArrowRight, 
  Send,
  AlertTriangle,
  QrCode,
  CheckCircle,
  Clock,
  LogOut,
  Home
} from 'lucide-react';
import type { LeaveRequest } from '../types';

interface StudentDashboardProps {
  requests: LeaveRequest[];
  onSubmitRequest: (requestData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'logs' | 'checkoutTime' | 'checkinTime'>) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ requests, onSubmitRequest }) => {
  // Find current active request (not returned and not rejected, or the latest request)
  const activeRequest = requests.length > 0 ? requests[requests.length - 1] : null;
  const hasActiveRequest = activeRequest && activeRequest.status !== 'returned' && activeRequest.status !== 'rejected';

  // Wizard state: 1 = Form, 2 = Letter Preview, 3 = Timeline (if has active request, default to 3)
  const [step, setStep] = useState<number>(hasActiveRequest ? 3 : 1);

  // Form Fields
  const [studentName, setStudentName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('CSE');
  const [block, setBlock] = useState('A');
  const [roomNumber, setRoomNumber] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [emergencyStatus, setEmergencyStatus] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  const [formError, setFormError] = useState('');

  // Handle Form submission to step 2 (Preview)
  const handleNextToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !rollNumber || !roomNumber || !destination || !startDate || !endDate || !reason) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setFormError('');
    setStep(2);
  };

  // Generate jsPDF Letter
  const generatePDF = (download: boolean = true): string | null => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Page dimensions & margins
      const margin = 20;
      
      // Header
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text('HOSTEL LEAVE REQUEST LETTER', 105, 25, { align: 'center' });
      
      // Horizontal Line
      doc.setDrawColor(148, 163, 184); // slate-400
      doc.setLineWidth(0.5);
      doc.line(margin, 28, 210 - margin, 28);
      
      // Date
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105); // slate-600
      doc.text(`Date: ${today}`, 210 - margin, 36, { align: 'right' });
      
      // Address Block
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('To,', margin, 45);
      doc.text('The Warden,', margin, 50);
      doc.text(`Hostel Block ${block || 'A'},`, margin, 55);
      doc.text('National Institute Hostel Campus.', margin, 60);
      
      // Subject
      doc.setFont('Helvetica', 'bold');
      doc.text(`Subject: Application for Leave of Absence - ${emergencyStatus ? 'EMERGENCY' : 'PERSONAL'}`, margin, 72);
      
      // Body text
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(51, 65, 85); // slate-700
      
      const bodyText = `Respected Sir/Madam,\n\nI am writing to formally request leave of absence from the hostel premises. I need to travel to ${destination} from ${new Date(startDate).toLocaleString()} to ${new Date(endDate).toLocaleString()}.\n\nThe reason for this leave request is: "${reason}". ${emergencyStatus ? 'This is an emergency request requiring immediate travel.' : ''}\n\nI assure you that I will adhere to the safety guidelines, remain contactable throughout my travel, and return to the hostel room by the scheduled date and time. In case of any changes or delay, I will immediately inform the hostel authorities.`;
      
      const splitText = doc.splitTextToSize(bodyText, 210 - (margin * 2));
      doc.text(splitText, margin, 82);
      
      // Student details
      const detailsStart = 160;
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Student Details:', margin, detailsStart);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${studentName}`, margin, detailsStart + 6);
      doc.text(`Roll Number: ${rollNumber}`, margin, detailsStart + 12);
      doc.text(`Department: ${department}`, margin, detailsStart + 18);
      doc.text(`Room No: ${roomNumber} (Block ${block})`, margin, detailsStart + 24);
      
      // Signatures
      const sigStart = 220;
      doc.setFont('Helvetica', 'bold');
      doc.text('_______________________', margin, sigStart);
      doc.text('Student Signature', margin, sigStart + 5);
      
      doc.text('_______________________', 210 - margin - 50, sigStart);
      doc.text('Warden Signature / Stamp', 210 - margin - 50, sigStart + 5);
      
      if (download) {
        doc.save(`Leave_Letter_${rollNumber || 'Student'}.pdf`);
        return null;
      } else {
        return doc.output('datauristring');
      }
    } catch (err) {
      console.error('Failed to generate PDF', err);
      return null;
    }
  };

  // Submit letter
  const handleSubmit = () => {
    // Generate PDF data url to save in the state
    const pdfUrl = generatePDF(false);
    
    onSubmitRequest({
      studentName,
      rollNumber,
      department,
      block,
      roomNumber,
      destination,
      startDate,
      endDate,
      reason,
      emergencyStatus,
      studentEmail: studentEmail || `${rollNumber}@student.edu`,
      parentEmail: parentEmail || `parent.${rollNumber}@gmail.com`,
      pdfLetterUrl: pdfUrl
    });

    setStep(3);
  };

  // Switch to a new request form if rejected/returned
  const handleStartNewRequest = () => {
    setStudentName(activeRequest?.studentName || '');
    setRollNumber(activeRequest?.rollNumber || '');
    setDepartment(activeRequest?.department || 'CSE');
    setBlock(activeRequest?.block || 'A');
    setRoomNumber(activeRequest?.roomNumber || '');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setEmergencyStatus(false);
    setStudentEmail(activeRequest?.studentEmail || '');
    setParentEmail(activeRequest?.parentEmail || '');
    setStep(1);
  };

  return (
    <div className="grid-layout">
      {/* LEFT COLUMN: NAVIGATION / GUIDES */}
      <div className="glass-panel">
        <h3 className="mb-4 text-center" style={{ color: 'var(--accent-cyan)' }}>Student Desk</h3>
        <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          Follow the 3-step digital process to apply for and track your gate-pass permissions.
        </p>

        {/* Wizard Steps indicator */}
        <div className="flex flex-column gap-2" style={{ borderLeft: '2px solid var(--border-color)', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', 
              background: step === 1 ? 'var(--primary)' : step > 1 ? 'var(--success)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', 
              color: 'white', fontSize: '0.8rem', fontWeight: 'bold' 
            }}>1</div>
            <span style={{ fontSize: '0.9rem', fontWeight: step === 1 ? 600 : 400, color: step === 1 ? 'white' : 'var(--text-muted)' }}>
              Fill Request Form
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', 
              background: step === 2 ? 'var(--primary)' : step > 2 ? 'var(--success)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', 
              color: 'white', fontSize: '0.8rem', fontWeight: 'bold' 
            }}>2</div>
            <span style={{ fontSize: '0.9rem', fontWeight: step === 2 ? 600 : 400, color: step === 2 ? 'white' : 'var(--text-muted)' }}>
              Review Auto-Letter
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.5rem 0' }}>
            <div style={{ 
              width: '28px', height: '28px', borderRadius: '50%', 
              background: step === 3 ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', 
              color: 'white', fontSize: '0.8rem', fontWeight: 'bold' 
            }}>3</div>
            <span style={{ fontSize: '0.9rem', fontWeight: step === 3 ? 600 : 400, color: step === 3 ? 'white' : 'var(--text-muted)' }}>
              Gate-Pass Timeline
            </span>
          </div>
        </div>

        {/* Active request state message on the sidebar */}
        {activeRequest && (
          <div className="glass-panel" style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Current Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <span className={`badge badge-${activeRequest.status}`}>
                {activeRequest.status.replace('_', ' ')}
              </span>
              {activeRequest.emergencyStatus && <span className="badge badge-emergency">Emergency</span>}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <p><strong>To:</strong> {activeRequest.destination}</p>
              <p><strong>Out:</strong> {new Date(activeRequest.startDate).toLocaleString()}</p>
              <p><strong>Return:</strong> {new Date(activeRequest.endDate).toLocaleString()}</p>
            </div>
            
            {/* Download floating button if they have a PDF letter */}
            {activeRequest.pdfLetterUrl && (
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = activeRequest.pdfLetterUrl!;
                  link.download = `Leave_Letter_${activeRequest.rollNumber}.pdf`;
                  link.click();
                }}
                className="btn btn-secondary" 
                style={{ marginTop: '1rem', padding: '0.5rem', fontSize: '0.8rem' }}
              >
                <Download size={14} /> Download Letter PDF
              </button>
            )}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: WORKSPACE */}
      <div className="glass-panel glow-cyan">
        
        {/* STEP 1: FORM */}
        {step === 1 && (
          <div>
            <h2 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText style={{ color: 'var(--accent-cyan)' }} /> Leave Request Form
            </h2>

            {formError && (
              <div style={{ padding: '0.75rem', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertTriangle size={18} /> {formError}
              </div>
            )}

            <form onSubmit={handleNextToPreview}>
              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="studentName">Student Name *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      id="studentName"
                      className="form-control" 
                      placeholder="Yamini N." 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="rollNumber">Roll / Register Number *</label>
                  <input 
                    type="text" 
                    id="rollNumber"
                    className="form-control" 
                    placeholder="22CSE0302" 
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <select 
                    id="department"
                    className="form-control"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="EEE">Electrical</option>
                    <option value="MECH">Mechanical</option>
                    <option value="CIVIL">Civil</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="block">Hostel Block</label>
                  <select 
                    id="block"
                    className="form-control"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  >
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                    <option value="C">Block C</option>
                    <option value="D">Block D</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="roomNumber">Room Number *</label>
                  <input 
                    type="text" 
                    id="roomNumber"
                    className="form-control" 
                    placeholder="302" 
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="studentEmail">Your Email (for notifications)</label>
                  <input 
                    type="email" 
                    id="studentEmail"
                    className="form-control" 
                    placeholder="yamini@student.edu" 
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="parentEmail">Parent / Guardian Email</label>
                  <input 
                    type="email" 
                    id="parentEmail"
                    className="form-control" 
                    placeholder="parent.yamini@gmail.com" 
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="destination">Destination *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    id="destination"
                    className="form-control" 
                    placeholder="Home Address, City (e.g. Bangalore)" 
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label htmlFor="startDate">Departure Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    id="startDate"
                    className="form-control" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Expected Return Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    id="endDate"
                    className="form-control" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Leave *</label>
                <textarea 
                  id="reason"
                  className="form-control" 
                  placeholder="Explain why you require leave..." 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="form-group" style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                <label className="form-checkbox">
                  <input 
                    type="checkbox" 
                    checked={emergencyStatus} 
                    onChange={(e) => setEmergencyStatus(e.target.checked)} 
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: emergencyStatus ? 'var(--danger)' : 'var(--text-muted)', fontWeight: emergencyStatus ? 'bold' : 'normal' }}>
                    <AlertTriangle size={16} /> Mark as EMERGENCY Leave (e.g. Medical / Critical Family Issue)
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary">
                Preview Request Letter <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: LETTER PREVIEW */}
        {step === 2 && (
          <div>
            <h2 className="mb-4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileCheck style={{ color: 'var(--accent-purple)' }} /> Review Auto-Generated Letter
            </h2>
            <p className="text-muted mb-4" style={{ fontSize: '0.9rem' }}>
              Our system has automatically formatted an official request letter based on your entries. Review it, download the PDF if desired, then submit to the Warden.
            </p>

            {/* Letter simulation container */}
            <div className="pdf-preview mb-4">
              <div className="pdf-header">
                <div className="pdf-title">HOSTEL LEAVE REQUEST LETTER</div>
              </div>
              <div className="pdf-date">
                Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="pdf-body">
                <p className="pdf-salutation">To,</p>
                <p style={{ fontWeight: 'bold' }}>The Warden,</p>
                <p style={{ fontWeight: 'bold' }}>Hostel Block {block},</p>
                <p style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>National Institute Hostel Campus.</p>

                <p style={{ fontWeight: 'bold', marginBottom: '1.25rem' }}>
                  Subject: Application for Leave of Absence - {emergencyStatus ? 'EMERGENCY' : 'PERSONAL'}
                </p>

                <p className="pdf-salutation">Respected Sir/Madam,</p>
                <p style={{ textIndent: '30px', marginBottom: '1rem' }}>
                  I am writing to formally request leave of absence from the hostel premises. I need to travel to <strong>{destination}</strong> from <strong>{new Date(startDate).toLocaleString()}</strong> to <strong>{new Date(endDate).toLocaleString()}</strong>.
                </p>
                <p style={{ textIndent: '30px', marginBottom: '1.5rem' }}>
                  The reason for this leave request is: <em>"{reason}"</em>. {emergencyStatus && <strong>This is an emergency request requiring immediate travel.</strong>}
                </p>
                <p style={{ textIndent: '30px' }}>
                  I assure you that I will adhere to the safety guidelines, remain contactable throughout my travel, and return to the hostel room by the scheduled date and time. In case of any changes or delay, I will immediately inform the hostel authorities.
                </p>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <p style={{ fontWeight: 'bold' }}>Student Details:</p>
                <p>Name: {studentName}</p>
                <p>Roll Number: {rollNumber}</p>
                <p>Department: {department}</p>
                <p>Room: {roomNumber} (Block {block})</p>
              </div>

              <div className="pdf-signature">
                <div>
                  <p>_______________________</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Student Signature</p>
                </div>
                <div>
                  <p>_______________________</p>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Warden Signature / Stamp</p>
                </div>
              </div>
            </div>

            <div className="wizard-actions">
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                <ArrowLeft size={16} /> Edit Form
              </button>

              <button onClick={() => generatePDF(true)} className="btn btn-secondary" style={{ flex: '1', margin: '0 0.5rem' }}>
                <Download size={16} /> Download PDF
              </button>

              <button onClick={handleSubmit} className="btn btn-primary" style={{ flex: '1.5' }}>
                Submit to Warden <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TRACKING TIMELINE & QR PASS */}
        {step === 3 && (
          <div>
            {!activeRequest ? (
              <div className="text-center" style={{ padding: '3rem 1.5rem' }}>
                <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                <h3>No Leave Requests Found</h3>
                <p className="text-muted" style={{ margin: '0.5rem 0 1.5rem' }}>
                  You don't have any pending or active leave requests right now.
                </p>
                <button onClick={() => setStep(1)} className="btn btn-primary" style={{ maxWidth: '250px', margin: '0 auto' }}>
                  Apply For Leave
                </button>
              </div>
            ) : (
              <div>
                <h2 className="mb-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode style={{ color: 'var(--accent-cyan)' }} /> Leave Status & Gate-Pass
                  </span>
                  
                  {/* Status Badges */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className={`badge badge-${activeRequest.status}`}>
                      {activeRequest.status.replace('_', ' ')}
                    </span>
                    {activeRequest.emergencyStatus && <span className="badge badge-emergency">Emergency</span>}
                  </div>
                </h2>

                <div className="grid-2" style={{ alignItems: 'start' }}>
                  {/* Timeline Stepper */}
                  <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.1)' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Status Tracker</h3>
                    
                    <div className="timeline">
                      {/* Step 1: Submitted */}
                      <div className={`timeline-item ${
                        activeRequest.status === 'submitted' || 
                        activeRequest.status === 'pending' || 
                        activeRequest.status === 'approved' || 
                        activeRequest.status === 'checked_out' || 
                        activeRequest.status === 'returned' ? 'completed' : ''
                      }`}>
                        <div className="timeline-icon">
                          <CheckCircle size={14} />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-title">Submitted for Approval</div>
                          <div className="timeline-time">
                            {new Date(activeRequest.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Parent Consent Step */}
                      {activeRequest.parentConsentStatus && activeRequest.parentConsentStatus !== 'not_required' && (
                        <div className={`timeline-item ${
                          activeRequest.parentConsentStatus === 'approved' ? 'completed' : 
                          activeRequest.parentConsentStatus === 'rejected' ? 'rejected' : 'active'
                        }`}>
                          <div className="timeline-icon">
                            {activeRequest.parentConsentStatus === 'approved' ? <CheckCircle size={14} /> :
                             activeRequest.parentConsentStatus === 'rejected' ? <AlertTriangle size={14} /> :
                             <Clock size={14} />}
                          </div>
                          <div className="timeline-content">
                            <div className="timeline-title">
                              {activeRequest.parentConsentStatus === 'approved' ? 'Parent Consent: Received' :
                               activeRequest.parentConsentStatus === 'rejected' ? 'Parent Consent: Declined' :
                               'Parent Consent: Awaiting Approval'}
                            </div>
                            <div className="timeline-time" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                              {activeRequest.parentConsentStatus === 'approved' ? 'Verified via parent portal' :
                               activeRequest.parentConsentStatus === 'rejected' ? 'Guardian denied request' :
                               `Consent link sent to ${activeRequest.parentEmail || 'guardian'}`}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Warden Decision */}
                      <div className={`timeline-item ${
                        activeRequest.status === 'approved' || 
                        activeRequest.status === 'checked_out' || 
                        activeRequest.status === 'returned' ? 'completed' : 
                        activeRequest.status === 'rejected' ? 'rejected' : 
                        activeRequest.status === 'pending' || activeRequest.status === 'submitted' ? 'active' : ''
                      }`}>
                        <div className="timeline-icon">
                          {activeRequest.status === 'rejected' ? <AlertTriangle size={14} /> : <Clock size={14} />}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-title">
                            {activeRequest.status === 'rejected' ? 'Request Rejected' : 
                             activeRequest.status === 'approved' || activeRequest.status === 'checked_out' || activeRequest.status === 'returned' ? 
                             'Approved by Warden' : 'Pending Warden Review'}
                          </div>
                          <div className="timeline-time">
                            {activeRequest.logs.find(l => l.action === 'Approved' || l.action === 'Rejected') ? 
                              new Date(activeRequest.logs.find(l => l.action === 'Approved' || l.action === 'Rejected')!.timestamp).toLocaleString() : 
                              'Awaiting action'}
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Checked Out */}
                      <div className={`timeline-item ${
                        activeRequest.status === 'checked_out' || 
                        activeRequest.status === 'returned' ? 'completed' : 
                        activeRequest.status === 'approved' ? 'active' : ''
                      }`}>
                        <div className="timeline-icon">
                          <LogOut size={14} />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-title">Checked Out of Hostel</div>
                          <div className="timeline-time">
                            {activeRequest.checkoutTime ? 
                              new Date(activeRequest.checkoutTime).toLocaleString() : 
                              activeRequest.status === 'approved' ? 'Awaiting Security QR Scan' : 'Awaiting approval'}
                          </div>
                        </div>
                      </div>

                      {/* Step 4: Returned */}
                      <div className={`timeline-item ${
                        activeRequest.status === 'returned' ? 'completed' : 
                        activeRequest.status === 'checked_out' ? 'active' : ''
                      }`}>
                        <div className="timeline-icon">
                          <Home size={14} />
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-title">Returned & Checked In</div>
                          <div className="timeline-time">
                            {activeRequest.checkinTime ? 
                              new Date(activeRequest.checkinTime).toLocaleString() : 
                              activeRequest.status === 'checked_out' ? 'Awaiting return scan' : 'Awaiting checkout'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Return or Rejected start new flow */}
                    {(activeRequest.status === 'returned' || activeRequest.status === 'rejected') && (
                      <button onClick={handleStartNewRequest} className="btn btn-primary" style={{ marginTop: '2rem' }}>
                        Apply for New Leave
                      </button>
                    )}
                  </div>

                  {/* QR Pass rendering */}
                  <div>
                    {activeRequest.status === 'approved' && (
                      <div className="qr-container glow-success">
                        <div className="badge badge-approved" style={{ margin: '0.25rem 0' }}>Digital Gate-Pass Active</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          Present this time-sensitive QR code to the Security Guard at the gate checkout.
                        </p>
                        
                        <div className="qr-box">
                          <div className="qr-scanning-line"></div>
                          {/* We wrap the SVG in standard size */}
                          <QRCodeSVG 
                            value={activeRequest.id} 
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#0f172a"
                            level="M"
                            includeMargin={false}
                          />
                        </div>

                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          ID: {activeRequest.id.substring(0, 8)}...
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', fontWeight: 'bold' }}>
                          Valid until: {new Date(activeRequest.startDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    {activeRequest.status === 'checked_out' && (
                      <div className="qr-container glow-purple">
                        <div className="badge badge-checkout" style={{ margin: '0.25rem 0' }}>Student Checked Out</div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                          You have checked out of the hostel. Scan QR pass again when you return to mark entry.
                        </p>

                        <div className="qr-box" style={{ opacity: 0.85 }}>
                          <QRCodeSVG 
                            value={activeRequest.id} 
                            size={180}
                            bgColor="#ffffff"
                            fgColor="#3b82f6"
                            level="M"
                            includeMargin={false}
                          />
                        </div>

                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Checked Out: {new Date(activeRequest.checkoutTime || '').toLocaleTimeString()}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>
                          Expected Return: {new Date(activeRequest.endDate).toLocaleString()}
                        </div>
                      </div>
                    )}

                    {activeRequest.status === 'submitted' && (
                      <div className="qr-container text-center" style={{ borderStyle: 'solid' }}>
                        <Clock size={40} className="text-warning mb-2" style={{ animation: 'spin 4s linear infinite' }} />
                        <h4 className="text-warning">Review in Progress</h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                          Your leave letter has been submitted to the Warden. Once they review and approve, your QR gate-pass will be generated here.
                        </p>
                      </div>
                    )}

                    {activeRequest.status === 'rejected' && (
                      <div className="qr-container text-center glow-warning" style={{ borderColor: 'var(--danger)' }}>
                        <AlertTriangle size={40} className="text-danger mb-2" />
                        <h4 className="text-danger">Request Rejected</h4>
                        <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          Reason for rejection: <strong>"{activeRequest.logs.find(l => l.action === 'Rejected')?.message || 'Not specified'}"</strong>
                        </p>
                        <p className="text-muted" style={{ fontSize: '0.8rem' }}>
                          Please contact the warden for details or re-apply with corrected information.
                        </p>
                      </div>
                    )}

                    {activeRequest.status === 'returned' && (
                      <div className="qr-container text-center glow-success">
                        <CheckCircle size={40} className="text-success mb-2" />
                        <h4 className="text-success">Leave Cycle Completed</h4>
                        <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                          You have successfully checked back in. Thank you for returning on time.
                        </p>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left', marginTop: '1rem', width: '100%' }}>
                          <p>⏰ <strong>Out:</strong> {new Date(activeRequest.checkoutTime || '').toLocaleString()}</p>
                          <p>⏰ <strong>In:</strong> {new Date(activeRequest.checkinTime || '').toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
