// ============================================================
// PAGES — Login, Admin (Dashboard, Nurses, Roster, Leave), Nurse
// ============================================================

const Pages = (() => {

    // ────────── LOGIN PAGE ──────────────────────────────────
    function Login() {
        return `
    <div class="login-bg">
      <div class="login-card">
        <div class="login-logo">🏥</div>
        <h1 class="login-title">NurseRoster</h1>
        <p class="login-subtitle">MedCore Hospital — Inpatient Rostering System</p>
        <form id="login-form" class="login-form" novalidate>
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="login-user" class="form-input" placeholder="Enter username" autocomplete="username" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-pw-wrap">
              <input type="password" id="login-pass" class="form-input" placeholder="Enter password" autocomplete="current-password" />
              <button type="button" class="pw-toggle" id="pw-toggle">👁</button>
            </div>
          </div>
          <div id="login-error" class="form-error"></div>
          <button type="submit" class="btn btn-primary btn-full" id="login-btn">
            <span>Sign In</span>
          </button>
        </form>
        <div class="login-hints">
          <div class="hint-label">Demo Accounts</div>
          <div class="hints-grid">
            <div class="hint-item" data-fill-user="admin" data-fill-pass="admin123">
              <div class="hint-role">Admin</div>
              <code>admin / admin123</code>
            </div>
            <div class="hint-item" data-fill-user="nurse001" data-fill-pass="nurse123">
              <div class="hint-role">Nurse</div>
              <code>nurse001 / nurse123</code>
            </div>
          </div>
        </div>
      </div>
    </div>`;
    }

    function LoginInit() {
        document.getElementById('login-form').addEventListener('submit', e => {
            e.preventDefault();
            const u = document.getElementById('login-user').value.trim();
            const p = document.getElementById('login-pass').value;
            const err = document.getElementById('login-error');
            if (!u || !p) { err.textContent = 'Please enter username and password.'; return; }
            const ok = App.login(u, p);
            if (!ok) err.textContent = 'Invalid username or password.';
        });
        document.getElementById('pw-toggle').addEventListener('click', () => {
            const inp = document.getElementById('login-pass');
            inp.type = inp.type === 'password' ? 'text' : 'password';
        });
        document.querySelectorAll('[data-fill-user]').forEach(el => {
            el.addEventListener('click', () => {
                document.getElementById('login-user').value = el.dataset.fillUser;
                document.getElementById('login-pass').value = el.dataset.fillPass;
            });
        });
    }

    // ────────── ADMIN DASHBOARD ──────────────────────────────
    function AdminDashboard() {
        const nurses = Storage.getUsers().filter(u => u.role === ROLES.NURSE);
        const leaves = Storage.getLeaves();
        const pending = leaves.filter(l => l.status === LEAVE_STATUS.PENDING.id);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const roster = Storage.getRoster();
        const todayRoster = roster[todayStr] || { day: [], night: [] };
        const todayCoverage = todayRoster.day.length + todayRoster.night.length;
        const activeNurses = nurses.filter(n => !n.deactivated).length;
        const monthRoster = Object.keys(roster).filter(d => d.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`));
        const understaffed = monthRoster.filter(d => {
            const r = roster[d] || {};
            return (r.day || []).length < MIN_NURSES_PER_SHIFT || (r.night || []).length < MIN_NURSES_PER_SHIFT;
        }).length;

        const recentLeaves = [...leaves].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 5);

        return `
    <div class="page-header">
      <div>
        <h2 class="page-h2">Overview</h2>
        <p class="page-sub">Hospital inpatient nursing operations at a glance</p>
      </div>
      <button class="btn btn-primary" onclick="App.navigate('roster')">📅 Manage Roster</button>
    </div>

    <div class="stats-grid">
      ${Components.StatsCard('👥', 'Active Nurses', activeNurses, `${nurses.length - activeNurses} deactivated`, '#00b4d8')}
      ${Components.StatsCard('⏳', 'Pending Leaves', pending.length, pending.length > 0 ? 'Requires review' : 'All clear', '#f59e0b')}
      ${Components.StatsCard('🕐', "Today's Coverage", todayCoverage, `${todayRoster.day.length} day • ${todayRoster.night.length} night`, '#10b981')}
      ${Components.StatsCard('⚠️', 'Understaffed Shifts', understaffed, 'This month', '#ef4444')}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Recent Leave Requests</h3>
          <button class="btn btn-sm" data-nav="leave-approval">View All</button>
        </div>
        ${recentLeaves.length === 0 ? '<p class="empty-msg">No leave requests yet.</p>' : `
        <div class="leave-list">
          ${recentLeaves.map(l => `
            <div class="leave-item">
              <div class="leave-item-left">
                <div class="nurse-avatar-xs">${getNurseAvatar(l.nurseId)}</div>
                <div>
                  <div class="leave-nurse-name">${l.nurseName}</div>
                  <div class="leave-dates">${formatDate(l.startDate)} ${l.startDate !== l.endDate ? `→ ${formatDate(l.endDate)}` : ''}</div>
                </div>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                ${Components.LeaveTypeBadge(l.type)}
                ${Components.StatusBadge(l.status)}
              </div>
            </div>`).join('')}
        </div>`}
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Today's Roster</h3>
          <span class="text-muted">${todayStr}</span>
        </div>
        ${todayCoverage === 0 ? `<p class="empty-msg">No roster for today. <a class="link" data-nav="roster">Generate roster →</a></p>` : `
        <div class="today-roster">
          <div class="shift-section">
            <div class="shift-header" style="color:${SHIFT_TYPES.DAY.color}">☀️ Day Shift</div>
            ${todayRoster.day.length === 0 ? '<p class="empty-msg">Understaffed!</p>' : todayRoster.day.map(id => {
            const n = Storage.getUserById(id);
            return n ? `<div class="shift-nurse"><div class="nurse-avatar-xs">${n.avatar}</div><span>${n.name}</span><span class="text-muted">${n.ward}</span></div>` : '';
        }).join('')}
          </div>
          <div class="shift-section">
            <div class="shift-header" style="color:${SHIFT_TYPES.NIGHT.color}">🌙 Night Shift</div>
            ${todayRoster.night.length === 0 ? '<p class="empty-msg">Understaffed!</p>' : todayRoster.night.map(id => {
            const n = Storage.getUserById(id);
            return n ? `<div class="shift-nurse"><div class="nurse-avatar-xs">${n.avatar}</div><span>${n.name}</span><span class="text-muted">${n.ward}</span></div>` : '';
        }).join('')}
          </div>
        </div>`}
      </div>
    </div>`;
    }

    // ────────── NURSE MANAGEMENT ──────────────────────────────
    function NurseManagement() {
        const nurses = Storage.getUsers().filter(u => u.role === ROLES.NURSE);
        return `
    <div class="page-header">
      <div>
        <h2 class="page-h2">Nurse Management</h2>
        <p class="page-sub">Manage nursing staff profiles, wards and preferences</p>
      </div>
      <button class="btn btn-primary" onclick="openAddNurseModal()">+ Add Nurse</button>
    </div>
    <div class="card">
      <div class="card-header">
        <input type="text" class="form-input search-input" id="nurse-search" placeholder="🔍 Search nurses by name or ward..." oninput="filterNurses(this.value)">
        <span class="text-muted">${nurses.length} nurses total</span>
      </div>
      <div class="table-wrap">
        <table class="table" id="nurses-table">
          <thead><tr>
            <th>Name</th><th>Username</th><th>Ward</th><th>Preference</th>
            <th>Annual Leave</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody id="nurses-tbody">
            ${nurses.map(n => nurseRow(n)).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
    }

    function nurseRow(n) {
        const used = n.annualLeaveUsed || 0;
        const remaining = ANNUAL_LEAVE_DAYS - used;
        return `
    <tr data-nurse-name="${n.name.toLowerCase()}" data-nurse-ward="${(n.ward || '').toLowerCase()}" ${n.deactivated ? 'class="row-deactivated"' : ''}>
      <td><div style="display:flex;align-items:center;gap:10px"><div class="nurse-avatar-xs">${n.avatar}</div><div><div>${n.name}</div><div class="text-muted text-sm">${n.email || ''}</div></div></div></td>
      <td><code>${n.username}</code></td>
      <td>${n.ward || '—'}</td>
      <td>${Components.PrefBadge(n.preference)}</td>
      <td>
        <div class="leave-bar"><div class="leave-bar-fill" style="width:${(used / ANNUAL_LEAVE_DAYS) * 100}%"></div></div>
        <span class="text-sm">${used}/${ANNUAL_LEAVE_DAYS} used (${remaining} left)</span>
      </td>
      <td><span class="badge ${n.deactivated ? 'badge-inactive' : 'badge-active'}">${n.deactivated ? 'Inactive' : 'Active'}</span></td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="btn btn-sm btn-ghost" onclick="openEditNurseModal('${n.id}')">✏️ Edit</button>
          <button class="btn btn-sm btn-ghost ${n.deactivated ? 'btn-success' : 'btn-danger'}" onclick="toggleNurseStatus('${n.id}', ${!n.deactivated})">
            ${n.deactivated ? '✅ Activate' : '🚫 Deactivate'}
          </button>
        </div>
      </td>
    </tr>`;
    }

    // ────────── ROSTER PAGE ──────────────────────────────────
    function Roster(params = {}) {
        const now = new Date();
        const year = parseInt(params.year || now.getFullYear());
        const month = parseInt(params.month ?? now.getMonth());
        const monthLabel = new Date(year, month, 1).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' });
        const dates = RosterGenerator.getDateRange(year, month);
        const roster = Storage.getRoster();
        const nurses = Storage.getUsers().filter(u => u.role === ROLES.NURSE && !u.deactivated);
        const leaves = Storage.getLeaves();

        function shiftCell(date, type) {
            const r = roster[date] || {};
            const assigned = (r[type] || []);
            const leaveNurses = leaves.filter(l =>
                l.status === LEAVE_STATUS.APPROVED.id &&
                l.startDate <= date && l.endDate >= date
            );
            const s = type === 'day' ? SHIFT_TYPES.DAY : SHIFT_TYPES.NIGHT;
            const short = assigned.map(id => {
                const n = Storage.getUserById(id);
                return n ? `<span class="roster-chip" title="${n.name}" style="background:${s.bg};color:${s.color}">${n.avatar}</span>` : '';
            }).join('');
            const isUnder = assigned.length < MIN_NURSES_PER_SHIFT;
            return `
      <td class="roster-cell ${isUnder && assigned.length > 0 ? 'cell-warn' : ''}" onclick="openShiftEditor('${date}','${type}')">
        <div class="cell-chips">${short}</div>
        ${assigned.length === 0 ? '<div class="cell-empty">+ Assign</div>' : ''}
        ${isUnder && assigned.length > 0 ? '<div class="cell-under">⚠ Low</div>' : ''}
      </td>`;
        }

        const prevMonth = month === 0 ? 11 : month - 1;
        const prevYear = month === 0 ? year - 1 : year;
        const nextMonth = month === 11 ? 0 : month + 1;
        const nextYear = month === 11 ? year + 1 : year;

        return `
    <div class="page-header">
      <div>
        <h2 class="page-h2">Roster Schedule</h2>
        <p class="page-sub">${monthLabel}</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <button class="btn btn-ghost" onclick="App.navigate('roster',{year:${prevYear},month:${prevMonth}})">‹ Prev</button>
        <button class="btn btn-ghost" onclick="App.navigate('roster',{year:${nextYear},month:${nextMonth}})">Next ›</button>
        <button class="btn btn-primary" onclick="generateRoster(${year},${month})">⚡ Auto-Generate</button>
        <button class="btn btn-ghost" onclick="clearRosterMonth(${year},${month})">🗑 Clear</button>
      </div>
    </div>

    <div class="card roster-legend-card">
      <div class="roster-legend">
        ${Object.values(SHIFT_TYPES).map(s => `<span style="display:inline-flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:3px;background:${s.bg};border:1px solid ${s.color};display:inline-block"></span><span style="color:${s.color}">${s.icon} ${s.label}</span></span>`).join('')}
        <span style="color:#f59e0b">⚠ = Understaffed</span>
      </div>
    </div>

    <div class="card roster-card">
      <div class="table-wrap roster-table-wrap">
        <table class="table roster-table">
          <thead>
            <tr>
              <th class="roster-th-date">Date</th>
              <th class="roster-th-day">☀️ Day Shift <span class="text-muted text-sm">(min ${MIN_NURSES_PER_SHIFT})</span></th>
              <th class="roster-th-night">🌙 Night Shift <span class="text-muted text-sm">(min ${MIN_NURSES_PER_SHIFT})</span></th>
              <th>On Leave</th>
            </tr>
          </thead>
          <tbody>
            ${dates.map(date => {
            const d = new Date(date);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;
            const isToday = date === now.toISOString().split('T')[0];
            const dayLeaves = leaves.filter(l =>
                l.status === LEAVE_STATUS.APPROVED.id &&
                l.startDate <= date && l.endDate >= date
            );
            return `
              <tr class="${isWeekend ? 'row-weekend' : ''} ${isToday ? 'row-today' : ''}">
                <td class="roster-date-cell">
                  <div class="roster-date-num ${isToday ? 'today-circle' : ''}">${d.getDate()}</div>
                  <div class="roster-day-name">${d.toLocaleDateString('en-SG', { weekday: 'short' })}</div>
                  ${isWeekend ? '<div class="weekend-tag">WE</div>' : ''}
                </td>
                ${shiftCell(date, 'day')}
                ${shiftCell(date, 'night')}
                <td>
                  ${dayLeaves.map(l => `<div class="leave-chip">${l.nurseName}</div>`).join('') || '<span class="text-muted">—</span>'}
                </td>
              </tr>`;
        }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
    }

    // ────────── LEAVE APPROVAL ──────────────────────────────
    function LeaveApproval() {
        const leaves = [...Storage.getLeaves()].sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));
        const filterTab = window._leaveFilter || 'pending';

        const filtered = leaves.filter(l => filterTab === 'all' ? true : l.status === filterTab);
        const tabs = ['pending', 'approved', 'rejected', 'all'];

        return `
    <div class="page-header">
      <div>
        <h2 class="page-h2">Leave Approval</h2>
        <p class="page-sub">Review and action nurse leave applications</p>
      </div>
    </div>
    <div class="card">
      <div class="tabs">
        ${tabs.map(t => `<button class="tab-btn ${filterTab === t ? 'active' : ''}" onclick="window._leaveFilter='${t}';App.navigate('leave-approval')">${t.charAt(0).toUpperCase() + t.slice(1)} ${t === 'pending' ? `(${leaves.filter(l => l.status === 'pending').length})` : ''}</button>`).join('')}
      </div>
      ${filtered.length === 0 ? '<p class="empty-msg">No leave requests found.</p>' : filtered.map(l => leaveApprovalCard(l)).join('')}
    </div>`;
    }

    function leaveApprovalCard(l) {
        const days = Math.round((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1;
        const isPending = l.status === LEAVE_STATUS.PENDING.id;
        return `
    <div class="leave-approval-card ${isPending ? 'card-pending' : ''}">
      <div class="lac-left">
        <div class="nurse-avatar-sm">${getNurseAvatar(l.nurseId)}</div>
        <div class="lac-info">
          <div class="lac-nurse">${l.nurseName}</div>
          <div class="lac-meta">
            ${Components.LeaveTypeBadge(l.type)}
            <span class="text-muted">${formatDate(l.startDate)} → ${formatDate(l.endDate)} <strong>(${days} day${days > 1 ? 's' : ''})</strong></span>
          </div>
          <div class="lac-reason">"${l.reason}"</div>
          <div class="lac-applied text-muted text-sm">Applied: ${new Date(l.appliedAt).toLocaleString('en-SG')}</div>
          ${l.adminNote ? `<div class="lac-admin-note">💬 ${l.adminNote}</div>` : ''}
        </div>
      </div>
      <div class="lac-right">
        ${Components.StatusBadge(l.status)}
        ${isPending ? `
          <div class="lac-actions">
            <input type="text" class="form-input" id="note-${l.id}" placeholder="Add note (optional)" />
            <div style="display:flex;gap:8px">
              <button class="btn btn-success btn-sm" onclick="approveLeave('${l.id}')">✅ Approve</button>
              <button class="btn btn-danger btn-sm" onclick="rejectLeave('${l.id}')">❌ Reject</button>
            </div>
          </div>` : ''}
      </div>
    </div>`;
    }

    // ────────── NURSE DASHBOARD ──────────────────────────────
    function NurseDashboard() {
        const user = App.getState().currentUser;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const roster = Storage.getRoster();
        const myLeaves = Storage.getLeaves().filter(l => l.nurseId === user.id);
        const pendingLeaves = myLeaves.filter(l => l.status === LEAVE_STATUS.PENDING.id);
        const approvedLeaves = myLeaves.filter(l => l.status === LEAVE_STATUS.APPROVED.id);
        const annualUsed = Storage.getUserById(user.id)?.annualLeaveUsed || 0;
        const remaining = ANNUAL_LEAVE_DAYS - annualUsed;

        // Find upcoming shifts in next 7 days
        const upcoming = [];
        for (let i = 0; i < 14; i++) {
            const d = new Date(now); d.setDate(d.getDate() + i);
            const ds = d.toISOString().split('T')[0];
            const r = roster[ds] || {};
            if ((r.day || []).includes(user.id)) upcoming.push({ date: ds, type: 'day' });
            if ((r.night || []).includes(user.id)) upcoming.push({ date: ds, type: 'night' });
        }

        return `
    <div class="page-header">
      <div>
        <h2 class="page-h2">My Dashboard</h2>
        <p class="page-sub">Welcome back, ${user.name.split(' ')[0]}! Here's your schedule overview.</p>
      </div>
      <button class="btn btn-primary" data-nav="leave-application">+ Apply for Leave</button>
    </div>

    <div class="stats-grid">
      ${Components.StatsCard('📅', 'Annual Leave', `${remaining} days`, `${annualUsed} used of ${ANNUAL_LEAVE_DAYS}`, '#06b6d4')}
      ${Components.StatsCard('⏳', 'Pending Leaves', pendingLeaves.length, 'Awaiting approval', '#f59e0b')}
      ${Components.StatsCard('✅', 'Approved Leaves', approvedLeaves.length, 'This year', '#10b981')}
      ${Components.StatsCard('🔄', 'My Preference', formatPref(user.preference), 'Shift preference', '#818cf8')}
    </div>

    <div class="dashboard-grid">
      <div class="card">
        <div class="card-header"><h3 class="card-title">Upcoming Shifts (next 14 days)</h3></div>
        ${upcoming.length === 0 ? '<p class="empty-msg">No shifts assigned in the next 14 days.</p>' : `
        <div class="shift-list">
          ${upcoming.map(s => {
            const d = new Date(s.date);
            const isToday = s.date === todayStr;
            const st = SHIFT_TYPES[s.type.toUpperCase()];
            return `
            <div class="shift-list-item ${isToday ? 'shift-item-today' : ''}">
              <div class="shift-date-block">
                <div class="shift-day-num">${d.getDate()}</div>
                <div class="shift-day-name">${d.toLocaleDateString('en-SG', { weekday: 'short' })}</div>
                <div class="shift-mon">${d.toLocaleDateString('en-SG', { month: 'short' })}</div>
              </div>
              <div class="shift-info">
                <div ${isToday ? 'class="today-tag"' : ''} style="color:${st.color};font-weight:600">${st.icon} ${st.label}</div>
                <div class="text-muted text-sm">${st.time}</div>
              </div>
              ${isToday ? '<span class="badge" style="background:#10b98122;color:#10b981">Today</span>' : ''}
            </div>`;
        }).join('')}
        </div>`}
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">My Leave History</h3>
          <button class="btn btn-sm" data-nav="leave-application">Apply →</button>
        </div>
        ${myLeaves.length === 0 ? '<p class="empty-msg">No leave applications yet.</p>' : `
        <div class="leave-list">
          ${myLeaves.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).slice(0, 6).map(l => `
            <div class="leave-item">
              <div class="leave-item-left">
                ${Components.LeaveTypeBadge(l.type)}
                <div>
                  <div class="leave-dates">${formatDate(l.startDate)} ${l.startDate !== l.endDate ? `→ ${formatDate(l.endDate)}` : ''}</div>
                  <div class="text-muted text-sm">${l.reason}</div>
                  ${l.adminNote ? `<div class="lac-admin-note">💬 ${l.adminNote}</div>` : ''}
                </div>
              </div>
              ${Components.StatusBadge(l.status)}
            </div>`).join('')}
        </div>`}
      </div>
    </div>`;
    }

    // ────────── LEAVE APPLICATION ────────────────────────────
    function LeaveApplication() {
        const user = App.getState().currentUser;
        const nu = Storage.getUserById(user.id);
        const annualUsed = nu?.annualLeaveUsed || 0;
        const remaining = ANNUAL_LEAVE_DAYS - annualUsed;
        const myLeaves = Storage.getLeaves().filter(l => l.nurseId === user.id);
        const now = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        return `
    <div class="page-header">
      <div>
        <h2 class="page-h2">Apply for Leave</h2>
        <p class="page-sub">Submit annual or urgent leave requests for approval</p>
      </div>
    </div>
    <div class="two-col">
      <div>
        <div class="card">
          <h3 class="card-title" style="margin-bottom:20px">New Leave Application</h3>
          <form id="leave-form" novalidate>
            <div class="form-group">
              <label class="form-label">Leave Type</label>
              <div class="radio-group" id="leave-type-group">
                <label class="radio-card active" data-val="annual">
                  <input type="radio" name="leave-type" value="annual" checked />
                  <div class="radio-icon">📅</div>
                  <div class="radio-label">Annual Leave</div>
                  <div class="radio-sub">${remaining} days remaining</div>
                </label>
                <label class="radio-card" data-val="urgent">
                  <input type="radio" name="leave-type" value="urgent" />
                  <div class="radio-icon">🚨</div>
                  <div class="radio-label">Urgent Leave</div>
                  <div class="radio-sub">Same/next-day</div>
                </label>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Start Date</label>
                <input type="date" id="leave-start" class="form-input" min="${now}" value="${tomorrowStr}" />
              </div>
              <div class="form-group">
                <label class="form-label">End Date</label>
                <input type="date" id="leave-end" class="form-input" min="${now}" value="${tomorrowStr}" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Reason <span class="text-danger">*</span></label>
              <textarea id="leave-reason" class="form-input" rows="3" placeholder="Please provide a reason for your leave request..."></textarea>
            </div>
            <div id="leave-form-error" class="form-error"></div>
            <div class="leave-balance-info">
              <div class="bal-icon">📊</div>
              <div>Annual leave balance: <strong>${remaining} / ${ANNUAL_LEAVE_DAYS} days remaining</strong></div>
            </div>
            <button type="submit" class="btn btn-primary btn-full" style="margin-top:16px">Submit Application</button>
          </form>
        </div>
      </div>
      <div class="card">
        <h3 class="card-title" style="margin-bottom:20px">My Applications</h3>
        ${myLeaves.length === 0 ? '<p class="empty-msg">No applications yet.</p>' : myLeaves.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt)).map(l => {
            const days = Math.round((new Date(l.endDate) - new Date(l.startDate)) / 86400000) + 1;
            return `
          <div class="leave-approval-card" style="flex-direction:column;gap:10px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>${Components.LeaveTypeBadge(l.type)} <strong>${days} day${days > 1 ? 's' : ''}</strong></div>
              ${Components.StatusBadge(l.status)}
            </div>
            <div class="text-sm">${formatDate(l.startDate)} → ${formatDate(l.endDate)}</div>
            <div class="text-muted text-sm">"${l.reason}"</div>
            ${l.adminNote ? `<div class="lac-admin-note">💬 ${l.adminNote}</div>` : ''}
            <div class="text-muted text-sm">Applied ${new Date(l.appliedAt).toLocaleString('en-SG')}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
    }

    // ────────── MY PROFILE ───────────────────────────────────
    function MyProfile() {
        const user = Storage.getUserById(App.getState().currentUser.id);
        return `
    <div class="page-header">
      <div>
        <h2 class="page-h2">My Profile</h2>
        <p class="page-sub">Update your personal information and shift preferences</p>
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="profile-header">
          <div class="profile-avatar">${user.avatar}</div>
          <div>
            <h3 class="profile-name">${user.name}</h3>
            <p class="text-muted">${user.ward || 'Unassigned'} • ${user.email || ''}</p>
          </div>
        </div>
        <form id="profile-form" novalidate style="margin-top:24px">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="pf-name" class="form-input" value="${user.name}" />
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input type="text" id="pf-phone" class="form-input" value="${user.phone || ''}" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" id="pf-email" class="form-input" value="${user.email || ''}" />
          </div>
          <div class="form-group">
            <label class="form-label">Shift Preference</label>
            <div class="radio-group" id="pf-pref-group">
              ${[
                { val: 'day', icon: '☀️', label: 'Day Shift', sub: '07:00 – 19:00' },
                { val: 'night', icon: '🌙', label: 'Night Shift', sub: '19:00 – 07:00' },
                { val: 'flexible', icon: '🔄', label: 'Flexible', sub: 'Any shift' },
            ].map(p => `
              <label class="radio-card ${user.preference === p.val ? 'active' : ''}" data-val="${p.val}">
                <input type="radio" name="pf-pref" value="${p.val}" ${user.preference === p.val ? 'checked' : ''} />
                <div class="radio-icon">${p.icon}</div>
                <div class="radio-label">${p.label}</div>
                <div class="radio-sub">${p.sub}</div>
              </label>`).join('')}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">New Password (leave blank to keep current)</label>
            <input type="password" id="pf-password" class="form-input" placeholder="••••••••" />
          </div>
          <button type="submit" class="btn btn-primary">💾 Save Changes</button>
        </form>
      </div>
      <div class="card">
        <h3 class="card-title" style="margin-bottom:20px">Leave Summary</h3>
        <div class="leave-summary">
          <div class="ls-row">
            <span>Annual Leave Entitlement</span><strong>${ANNUAL_LEAVE_DAYS} days</strong>
          </div>
          <div class="ls-row">
            <span>Used</span><strong style="color:#ef4444">${user.annualLeaveUsed || 0} days</strong>
          </div>
          <div class="ls-row">
            <span>Remaining</span><strong style="color:#10b981">${ANNUAL_LEAVE_DAYS - (user.annualLeaveUsed || 0)} days</strong>
          </div>
        </div>
        <div class="leave-bar big-bar" style="margin-top:14px">
          <div class="leave-bar-fill" style="width:${((user.annualLeaveUsed || 0) / ANNUAL_LEAVE_DAYS) * 100}%;background:#ef4444aa"></div>
        </div>
        <div class="text-muted text-sm" style="margin-top:8px">${Math.round(((user.annualLeaveUsed || 0) / ANNUAL_LEAVE_DAYS) * 100)}% of annual leave used</div>
        <div style="margin-top:24px">
          <h3 class="card-title" style="margin-bottom:10px">Account Details</h3>
          <div class="ls-row"><span>Username</span><code>${user.username}</code></div>
          <div class="ls-row"><span>Role</span><span class="badge" style="background:#00b4d822;color:#00b4d8">Nurse</span></div>
          <div class="ls-row"><span>Ward</span><strong>${user.ward || 'Unassigned'}</strong></div>
          <div class="ls-row"><span>Joined</span><strong>${user.joinDate ? new Date(user.joinDate).toLocaleDateString('en-SG') : 'N/A'}</strong></div>
        </div>
      </div>
    </div>`;
    }

    // ────────── HELPERS ──────────────────────────────────────
    function formatDate(str) {
        return new Date(str).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function formatPref(p) {
        return { day: '☀️ Day', night: '🌙 Night', flexible: '🔄 Flexible' }[p] || '—';
    }
    function getNurseAvatar(id) {
        return Storage.getUserById(id)?.avatar || '?';
    }

    return {
        Login, LoginInit,
        AdminDashboard, NurseManagement, Roster, LeaveApproval,
        NurseDashboard, LeaveApplication, MyProfile,
    };
})();
