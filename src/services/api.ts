import type { LeaveRequest } from '../types';

const API_BASE = '/api';

// Initial Mock requests in case server is offline and localStorage is empty
const MOCK_INITIAL_REQUESTS: LeaveRequest[] = [
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

const getLocalRequests = (): LeaveRequest[] => {
  const saved = localStorage.getItem('warden_app_requests');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse local requests", e);
    }
  }
  localStorage.setItem('warden_app_requests', JSON.stringify(MOCK_INITIAL_REQUESTS));
  return MOCK_INITIAL_REQUESTS;
};

const saveLocalRequests = (requests: LeaveRequest[]) => {
  localStorage.setItem('warden_app_requests', JSON.stringify(requests));
};

export interface APIResult<T> {
  data: T;
  isOffline: boolean;
}

export const api = {
  async getRequests(): Promise<APIResult<LeaveRequest[]>> {
    try {
      const response = await fetch(`${API_BASE}/requests`);
      if (!response.ok) throw new Error('API response not ok');
      const data = await response.json();
      saveLocalRequests(data);
      return { data, isOffline: false };
    } catch (err) {
      console.warn("API server offline. Falling back to local storage.", err);
      const data = getLocalRequests();
      return { data, isOffline: true };
    }
  },

  async createRequest(
    requestData: Omit<LeaveRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'logs' | 'checkoutTime' | 'checkinTime'>
  ): Promise<APIResult<LeaveRequest>> {
    try {
      const response = await fetch(`${API_BASE}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      if (!response.ok) throw new Error('API response not ok');
      const newRequest = await response.json();
      
      const current = getLocalRequests();
      saveLocalRequests([...current, newRequest]);
      return { data: newRequest, isOffline: false };
    } catch (err) {
      console.warn("API server offline. Creating request locally.", err);
      const newId = `req-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6)}`;
      const now = new Date().toISOString();
      
      const newRequest: LeaveRequest = {
        ...requestData,
        id: newId,
        status: 'submitted',
        createdAt: now,
        updatedAt: now,
        checkoutTime: null,
        checkinTime: null,
        logs: [
          {
            action: 'Submitted',
            timestamp: now,
            user: requestData.studentName,
            message: 'Leave application submitted digitally (Local Storage).'
          }
        ]
      };

      const current = getLocalRequests();
      saveLocalRequests([...current, newRequest]);
      return { data: newRequest, isOffline: true };
    }
  },

  async updateRequest(id: string, updates: Partial<LeaveRequest>): Promise<APIResult<LeaveRequest>> {
    try {
      const response = await fetch(`${API_BASE}/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('API response not ok');
      const updated = await response.json();

      const current = getLocalRequests();
      const next = current.map(r => r.id === id ? updated : r);
      saveLocalRequests(next);
      return { data: updated, isOffline: false };
    } catch (err) {
      console.warn(`API server offline. Updating request ${id} locally.`, err);
      const current = getLocalRequests();
      let updated: LeaveRequest | null = null;
      
      const next = current.map(r => {
        if (r.id === id) {
          updated = {
            ...r,
            ...updates,
            updatedAt: new Date().toISOString()
          };
          return updated;
        }
        return r;
      });

      if (!updated) throw new Error(`Request ${id} not found locally.`);
      saveLocalRequests(next);
      return { data: updated, isOffline: true };
    }
  },

  async resetRequests(): Promise<APIResult<LeaveRequest[]>> {
    try {
      const response = await fetch(`${API_BASE}/reset`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('API response not ok');
      const data = await response.json();
      saveLocalRequests(data);
      return { data, isOffline: false };
    } catch (err) {
      console.warn("API server offline. Resetting local requests.", err);
      
      const dynamicRequests = MOCK_INITIAL_REQUESTS.map(req => {
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

      saveLocalRequests(dynamicRequests);
      return { data: dynamicRequests, isOffline: true };
    }
  }
};
