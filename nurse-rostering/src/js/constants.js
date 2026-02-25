// ============================================================
// CONSTANTS
// ============================================================

const ROLES = { ADMIN: 'admin', NURSE: 'nurse' };

const SHIFT_TYPES = {
    DAY: { id: 'day', label: 'Day Shift', time: '07:00 – 19:00', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: '☀️' },
    NIGHT: { id: 'night', label: 'Night Shift', time: '19:00 – 07:00', color: '#818cf8', bg: 'rgba(129,140,248,0.15)', icon: '🌙' },
    OFF: { id: 'off', label: 'Day Off', time: '', color: '#6b7280', bg: 'rgba(107,114,128,0.10)', icon: '—' },
    LEAVE: { id: 'leave', label: 'On Leave', time: '', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: '🏖️' },
};

const PREFERENCES = {
    DAY: 'day',
    NIGHT: 'night',
    FLEXIBLE: 'flexible',
};

const LEAVE_TYPES = {
    ANNUAL: { id: 'annual', label: 'Annual Leave', color: '#06b6d4', icon: '📅' },
    URGENT: { id: 'urgent', label: 'Urgent Leave', color: '#f97316', icon: '🚨' },
};

const LEAVE_STATUS = {
    PENDING: { id: 'pending', label: 'Pending', color: '#f59e0b' },
    APPROVED: { id: 'approved', label: 'Approved', color: '#10b981' },
    REJECTED: { id: 'rejected', label: 'Rejected', color: '#ef4444' },
};

const ANNUAL_LEAVE_DAYS = 14;
const MIN_NURSES_PER_SHIFT = 2;
const MAX_CONSECUTIVE_DAYS = 5;

// Seed data
const SEED_ADMIN = {
    id: 'admin-001',
    username: 'admin',
    password: 'admin123',
    role: ROLES.ADMIN,
    name: 'Dr. Sarah Chen',
    department: 'Nursing Administration',
    avatar: 'SA',
};

const SEED_NURSES = [
    { id: 'n001', username: 'nurse001', password: 'nurse123', role: ROLES.NURSE, name: 'Alice Tan', ward: 'Ward A', avatar: 'AT', preference: PREFERENCES.DAY, phone: '+65 9001 0001', email: 'alice.tan@hospital.sg', annualLeaveUsed: 3, joinDate: '2022-03-15' },
    { id: 'n002', username: 'nurse002', password: 'nurse123', role: ROLES.NURSE, name: 'Ben Lim', ward: 'Ward B', avatar: 'BL', preference: PREFERENCES.NIGHT, phone: '+65 9001 0002', email: 'ben.lim@hospital.sg', annualLeaveUsed: 5, joinDate: '2021-07-01' },
    { id: 'n003', username: 'nurse003', password: 'nurse123', role: ROLES.NURSE, name: 'Clara Wong', ward: 'Ward A', avatar: 'CW', preference: PREFERENCES.FLEXIBLE, phone: '+65 9001 0003', email: 'clara.wong@hospital.sg', annualLeaveUsed: 0, joinDate: '2023-01-10' },
    { id: 'n004', username: 'nurse004', password: 'nurse123', role: ROLES.NURSE, name: 'David Ng', ward: 'Ward C', avatar: 'DN', preference: PREFERENCES.DAY, phone: '+65 9001 0004', email: 'david.ng@hospital.sg', annualLeaveUsed: 7, joinDate: '2020-09-20' },
    { id: 'n005', username: 'nurse005', password: 'nurse123', role: ROLES.NURSE, name: 'Emma Koh', ward: 'Ward B', avatar: 'EK', preference: PREFERENCES.NIGHT, phone: '+65 9001 0005', email: 'emma.koh@hospital.sg', annualLeaveUsed: 2, joinDate: '2023-06-01' },
];
