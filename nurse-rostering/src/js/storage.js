// ============================================================
// STORAGE — localStorage helpers
// ============================================================

// Seed leaves must be declared before Storage IIFE uses them in init()
// Note: LEAVE_TYPES and LEAVE_STATUS come from constants.js (loaded first)
const SEED_LEAVES = [
    {
        id: 'l001', nurseId: 'n001', nurseName: 'Alice Tan', type: 'annual',
        startDate: '2026-03-05', endDate: '2026-03-07', reason: 'Family vacation',
        status: 'pending', appliedAt: '2026-02-20T08:00:00Z', adminNote: '',
    },
    {
        id: 'l002', nurseId: 'n002', nurseName: 'Ben Lim', type: 'urgent',
        startDate: '2026-03-01', endDate: '2026-03-01', reason: 'Medical emergency for family member',
        status: 'approved', appliedAt: '2026-02-25T06:00:00Z', adminNote: 'Approved. Get well soon.',
    },
    {
        id: 'l003', nurseId: 'n004', nurseName: 'David Ng', type: 'annual',
        startDate: '2026-03-10', endDate: '2026-03-14', reason: 'Overseas trip',
        status: 'approved', appliedAt: '2026-02-18T10:00:00Z', adminNote: 'Approved.',
    },
];

const Storage = (() => {
    const KEYS = {
        USERS: 'nrs_users',
        SESSION: 'nrs_session',
        LEAVES: 'nrs_leaves',
        ROSTER: 'nrs_roster',
        NOTIFICATIONS: 'nrs_notifications',
    };

    function get(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    }
    function set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    function remove(key) { localStorage.removeItem(key); }

    // Seed initial data if first run
    function init() {
        if (!get(KEYS.USERS)) {
            const allUsers = [SEED_ADMIN, ...SEED_NURSES];
            set(KEYS.USERS, allUsers);
        }
        if (!get(KEYS.LEAVES)) { set(KEYS.LEAVES, SEED_LEAVES); }
        if (!get(KEYS.NOTIFICATIONS)) { set(KEYS.NOTIFICATIONS, []); }
    }

    return {
        KEYS,
        get,
        set,
        remove,

        // Session
        getSession: () => get(KEYS.SESSION),
        setSession: (user) => set(KEYS.SESSION, user),
        clearSession: () => remove(KEYS.SESSION),

        // Users
        getUsers: () => get(KEYS.USERS) || [],
        setUsers: (users) => set(KEYS.USERS, users),
        getUserById: (id) => (get(KEYS.USERS) || []).find(u => u.id === id),
        updateUser: (id, patch) => {
            const users = get(KEYS.USERS) || [];
            const idx = users.findIndex(u => u.id === id);
            if (idx !== -1) { users[idx] = { ...users[idx], ...patch }; set(KEYS.USERS, users); }
        },

        // Leaves
        getLeaves: () => get(KEYS.LEAVES) || [],
        setLeaves: (leaves) => set(KEYS.LEAVES, leaves),
        addLeave: (leave) => {
            const leaves = get(KEYS.LEAVES) || [];
            leaves.push(leave);
            set(KEYS.LEAVES, leaves);
        },
        updateLeave: (id, patch) => {
            const leaves = get(KEYS.LEAVES) || [];
            const idx = leaves.findIndex(l => l.id === id);
            if (idx !== -1) { leaves[idx] = { ...leaves[idx], ...patch }; set(KEYS.LEAVES, leaves); }
        },

        // Roster
        getRoster: () => get(KEYS.ROSTER) || {},
        setRoster: (roster) => set(KEYS.ROSTER, roster),

        // Notifications
        getNotifications: () => get(KEYS.NOTIFICATIONS) || [],
        addNotification: (notif) => {
            const notifs = get(KEYS.NOTIFICATIONS) || [];
            notifs.unshift(notif);
            if (notifs.length > 50) notifs.pop();
            set(KEYS.NOTIFICATIONS, notifs);
        },
        markNotificationsRead: (userId) => {
            const notifs = get(KEYS.NOTIFICATIONS) || [];
            notifs.filter(n => n.targetUserId === userId).forEach(n => n.read = true);
            set(KEYS.NOTIFICATIONS, notifs);
        },

        init,
    };
})();
