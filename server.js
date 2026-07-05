import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(express.json({ limit: '10mb' })); // Support pdf data urls in JSON payloads

// Mock Initial Requests to reset back to
const MOCK_INITIAL_REQUESTS = [
  {
    id: "req-yamini-302",
    studentName: "Yamini N.",
    rollNumber: "22CSE0302",
    department: "CSE",
    block: "A",
    roomNumber: "302",
    destination: "Bengaluru, Karnataka (Home)",
    startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
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
    parentConsentStatus: "pending",
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
    endDate: new Date(Date.now() + 14400000).toISOString().slice(0, 16),
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
    parentConsentStatus: "approved",
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
    startDate: new Date(Date.now() - 7200000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7200000).toISOString().slice(0, 16),
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
    parentConsentStatus: "not_required",
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
    parentConsentStatus: "approved",
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
    parentConsentStatus: "rejected",
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

// Helper: Read DB
const readDatabase = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDatabase(MOCK_INITIAL_REQUESTS);
      return MOCK_INITIAL_REQUESTS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return [];
  }
};

// Helper: Write DB
const writeDatabase = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
};

// Log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// GET all requests
app.get('/api/requests', (req, res) => {
  const requests = readDatabase();
  res.json(requests);
});

// POST a new request
app.post('/api/requests', (req, res) => {
  const requestData = req.body;
  const requests = readDatabase();

  const newId = `req-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const newRequest = {
    ...requestData,
    id: newId,
    status: 'submitted',
    parentConsentStatus: requestData.emergencyStatus ? 'not_required' : 'pending',
    createdAt: now,
    updatedAt: now,
    checkoutTime: null,
    checkinTime: null,
    logs: [
      {
        action: 'Submitted',
        timestamp: now,
        user: requestData.studentName,
        message: 'Leave application submitted digitally for review.'
      }
    ]
  };

  requests.push(newRequest);
  writeDatabase(requests);
  res.status(201).json(newRequest);
});

// PATCH update a request
app.patch('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const requests = readDatabase();

  const index = requests.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Request with ID ${id} not found.` });
  }

  const updatedRequest = {
    ...requests[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  requests[index] = updatedRequest;
  writeDatabase(requests);
  res.json(updatedRequest);
});

// POST reset database
app.post('/api/reset', (req, res) => {
  // Regenerate relative dynamic dates to make the dashboard feel alive on reset
  const dynamicRequests = MOCK_INITIAL_REQUESTS.map(req => {
    // Keep IDs, student details, etc. but sync times relative to current moment
    let updatedReq = { ...req };
    if (req.id === "req-yamini-302") {
      updatedReq.startDate = new Date(Date.now() + 86400000).toISOString().slice(0, 16);
      updatedReq.endDate = new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16);
      updatedReq.createdAt = new Date(Date.now() - 7200000).toISOString();
      updatedReq.updatedAt = new Date(Date.now() - 7200000).toISOString();
      updatedReq.logs[0].timestamp = updatedReq.createdAt;
    } else if (req.id === "req-rohan-210") {
      updatedReq.startDate = new Date().toISOString().slice(0, 16);
      updatedReq.endDate = new Date(Date.now() + 14400000).toISOString().slice(0, 16);
      updatedReq.createdAt = new Date(Date.now() - 10800000).toISOString();
      updatedReq.updatedAt = new Date(Date.now() - 3600000).toISOString();
      updatedReq.logs[0].timestamp = updatedReq.createdAt;
      updatedReq.logs[1].timestamp = updatedReq.updatedAt;
    } else if (req.id === "req-ananya-405") {
      updatedReq.startDate = new Date(Date.now() - 7200000).toISOString().slice(0, 16);
      updatedReq.endDate = new Date(Date.now() + 7200000).toISOString().slice(0, 16);
      updatedReq.createdAt = new Date(Date.now() - 7200000).toISOString();
      updatedReq.updatedAt = new Date(Date.now() - 3600000).toISOString();
      updatedReq.checkoutTime = updatedReq.updatedAt;
      updatedReq.logs[0].timestamp = updatedReq.createdAt;
      updatedReq.logs[1].timestamp = updatedReq.createdAt;
      updatedReq.logs[2].timestamp = updatedReq.updatedAt;
    } else if (req.id === "req-vikram-104") {
      updatedReq.startDate = new Date(Date.now() - 172800000).toISOString().slice(0, 16);
      updatedReq.endDate = new Date(Date.now() - 14400000).toISOString().slice(0, 16);
      updatedReq.createdAt = new Date(Date.now() - 259200000).toISOString();
      updatedReq.updatedAt = new Date(Date.now() - 14400000).toISOString();
      updatedReq.checkoutTime = new Date(Date.now() - 172800000).toISOString();
      updatedReq.checkinTime = updatedReq.updatedAt;
      updatedReq.logs[0].timestamp = updatedReq.createdAt;
      updatedReq.logs[1].timestamp = updatedReq.createdAt;
      updatedReq.logs[2].timestamp = updatedReq.checkoutTime;
      updatedReq.logs[3].timestamp = updatedReq.checkinTime;
    } else if (req.id === "req-sneha-112") {
      updatedReq.startDate = new Date(Date.now() + 3600000).toISOString().slice(0, 16);
      updatedReq.endDate = new Date(Date.now() + 18000000).toISOString().slice(0, 16);
      updatedReq.createdAt = new Date(Date.now() - 7200000).toISOString();
      updatedReq.updatedAt = new Date(Date.now() - 3600000).toISOString();
      updatedReq.logs[0].timestamp = updatedReq.createdAt;
      updatedReq.logs[1].timestamp = updatedReq.updatedAt;
    }
    return updatedReq;
  });

  writeDatabase(dynamicRequests);
  res.json(dynamicRequests);
});

// Fallback error handlers
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Warden Backend API running at http://localhost:${PORT}`);
});
