// ============================================================
// SHARED COMPONENTS — Sidebar, TopBar, Modals
// ============================================================

const Components = (() => {

    function Sidebar(currentPage, user) {
        const adminLinks = [
            { page: 'admin-dashboard', icon: '⊞', label: 'Dashboard' },
            { page: 'nurse-management', icon: '👥', label: 'Nurse Management' },
            { page: 'roster', icon: '📅', label: 'Roster' },
            { page: 'leave-approval', icon: '✅', label: 'Leave Approval' },
        ];
        const nurseLinks = [
            { page: 'nurse-dashboard', icon: '⊞', label: 'My Dashboard' },
            { page: 'leave-application', icon: '📋', label: 'Apply for Leave' },
            { page: 'my-profile', icon: '👤', label: 'My Profile' },
        ];
        const links = user.role === ROLES.ADMIN ? adminLinks : nurseLinks;
        const pendingLeaves = user.role === ROLES.ADMIN
            ? Storage.getLeaves().filter(l => l.status === LEAVE_STATUS.PENDING.id).length : 0;

        return `
    <aside class="sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">🏥</div>
        <div class="brand-text">
          <div class="brand-name">NurseRoster</div>
          <div class="brand-sub">MedCore Hospital</div>
        </div>
      </div>
      <nav class="sidebar-nav">
        ${links.map(l => `
          <a class="nav-item ${currentPage === l.page ? 'active' : ''}" data-nav="${l.page}">
            <span class="nav-icon">${l.icon}</span>
            <span class="nav-label">${l.label}</span>
            ${l.page === 'leave-approval' && pendingLeaves > 0 ? `<span class="nav-badge">${pendingLeaves}</span>` : ''}
          </a>
        `).join('')}
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="user-avatar-sm">${user.avatar}</div>
          <div class="user-info-sm">
            <div class="user-name-sm">${user.name}</div>
            <div class="user-role-sm">${user.role === ROLES.ADMIN ? 'Administrator' : user.ward || 'Nurse'}</div>
          </div>
        </div>
        <button class="btn-logout" data-logout>
          <span>⎋</span> Logout
        </button>
      </div>
    </aside>`;
    }

    function TopBar(user, currentPage) {
        const pageNames = {
            'admin-dashboard': 'Dashboard',
            'nurse-management': 'Nurse Management',
            'roster': 'Roster Schedule',
            'leave-approval': 'Leave Approval',
            'nurse-dashboard': 'My Dashboard',
            'leave-application': 'Apply for Leave',
            'my-profile': 'My Profile',
        };
        const now = new Date();
        const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
        const pending = Storage.getLeaves().filter(l => l.nurseId === user.id && l.status === LEAVE_STATUS.PENDING.id).length;

        return `
    <header class="topbar">
      <div class="topbar-left">
        <div class="page-title">${pageNames[currentPage] || 'Dashboard'}</div>
        <div class="page-date">${now.toLocaleDateString('en-SG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
      <div class="topbar-right">
        ${user.role === ROLES.NURSE && pending > 0 ? `<div class="topbar-badge"><span>📋</span> ${pending} pending</div>` : ''}
        <div class="topbar-greeting">${greeting}, ${user.name.split(' ')[0]}</div>
        <div class="topbar-avatar">${user.avatar}</div>
      </div>
    </header>`;
    }

    function Modal(id, title, body, footer) {
        return `
    <div class="modal-overlay" id="${id}-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="document.getElementById('${id}-overlay').remove()">✕</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>`;
    }

    function openModal(id, title, body, footer) {
        document.getElementById(`${id}-overlay`)?.remove();
        document.body.insertAdjacentHTML('beforeend', Modal(id, title, body, footer));
    }

    function StatusBadge(status) {
        const s = LEAVE_STATUS[status.toUpperCase()] || LEAVE_STATUS.PENDING;
        return `<span class="badge" style="background:${s.color}22;color:${s.color};border:1px solid ${s.color}44">${s.label}</span>`;
    }

    function ShiftBadge(type) {
        const s = SHIFT_TYPES[type?.toUpperCase()] || SHIFT_TYPES.OFF;
        return `<span class="badge" style="background:${s.bg};color:${s.color}">${s.icon} ${s.label}</span>`;
    }

    function LeaveTypeBadge(type) {
        const t = LEAVE_TYPES[type?.toUpperCase()] || LEAVE_TYPES.ANNUAL;
        return `<span class="badge" style="background:${t.color}22;color:${t.color};border:1px solid ${t.color}44">${t.icon} ${t.label}</span>`;
    }

    function PrefBadge(pref) {
        const map = {
            day: { color: '#f59e0b', label: '☀️ Day' },
            night: { color: '#818cf8', label: '🌙 Night' },
            flexible: { color: '#10b981', label: '🔄 Flexible' },
        };
        const p = map[pref] || map.flexible;
        return `<span class="badge" style="background:${p.color}22;color:${p.color}">${p.label}</span>`;
    }

    function StatsCard(icon, label, value, sub, color) {
        return `
    <div class="stats-card" style="--accent:${color || '#00b4d8'}">
      <div class="stats-icon">${icon}</div>
      <div class="stats-body">
        <div class="stats-value">${value}</div>
        <div class="stats-label">${label}</div>
        ${sub ? `<div class="stats-sub">${sub}</div>` : ''}
      </div>
    </div>`;
    }

    return { Sidebar, TopBar, Modal, openModal, StatusBadge, ShiftBadge, LeaveTypeBadge, PrefBadge, StatsCard };
})();
