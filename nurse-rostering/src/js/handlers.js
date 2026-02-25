// ============================================================
// EVENT HANDLERS — forms, modals, roster, leave actions
// ============================================================

// ── NURSE MANAGEMENT ────────────────────────────────────────

function filterNurses(q) {
    const rows = document.querySelectorAll('#nurses-tbody tr');
    rows.forEach(r => {
        const name = r.dataset.nurseName || '';
        const ward = r.dataset.nurseWard || '';
        r.style.display = (name.includes(q.toLowerCase()) || ward.includes(q.toLowerCase())) ? '' : 'none';
    });
}

function openAddNurseModal() {
    const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'ICU', 'A&E'];
    Components.openModal('add-nurse', '➕ Add New Nurse', `
    <form id="add-nurse-form" novalidate>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name *</label>
          <input type="text" id="an-name" class="form-input" placeholder="e.g. Jane Doe" /></div>
        <div class="form-group"><label class="form-label">Username *</label>
          <input type="text" id="an-user" class="form-input" placeholder="e.g. nurse006" /></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Password *</label>
          <input type="text" id="an-pass" class="form-input" value="nurse123" /></div>
        <div class="form-group"><label class="form-label">Ward</label>
          <select id="an-ward" class="form-input">
            ${wards.map(w => `<option>${w}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label>
          <input type="email" id="an-email" class="form-input" /></div>
        <div class="form-group"><label class="form-label">Phone</label>
          <input type="text" id="an-phone" class="form-input" /></div>
      </div>
      <div class="form-group"><label class="form-label">Shift Preference</label>
        <div class="radio-group" id="an-pref-group">
          ${[{ v: 'day', l: '☀️ Day' }, { v: 'night', l: '🌙 Night' }, { v: 'flexible', l: '🔄 Flexible' }].map((p, i) => `
          <label class="radio-card ${i === 0 ? 'active' : ''}" data-val="${p.v}">
            <input type="radio" name="an-pref" value="${p.v}" ${i === 0 ? 'checked' : ''}/>
            <div class="radio-label">${p.l}</div>
          </label>`).join('')}
        </div>
      </div>
      <div id="an-error" class="form-error"></div>
    </form>`,
        `<button class="btn btn-ghost" onclick="document.getElementById('add-nurse-overlay').remove()">Cancel</button>
     <button class="btn btn-primary" onclick="submitAddNurse()">Add Nurse</button>`
    );
    initRadioCards('an-pref-group');
}

function submitAddNurse() {
    const name = document.getElementById('an-name').value.trim();
    const username = document.getElementById('an-user').value.trim();
    const password = document.getElementById('an-pass').value.trim();
    const ward = document.getElementById('an-ward').value;
    const email = document.getElementById('an-email').value.trim();
    const phone = document.getElementById('an-phone').value.trim();
    const pref = document.querySelector('input[name="an-pref"]:checked')?.value || 'flexible';
    const err = document.getElementById('an-error');

    if (!name || !username || !password) { err.textContent = 'Name, username and password are required.'; return; }
    const users = Storage.getUsers();
    if (users.find(u => u.username === username)) { err.textContent = 'Username already exists.'; return; }

    const id = 'n' + Date.now();
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newNurse = {
        id, username, password, role: ROLES.NURSE,
        name, ward, email, phone, avatar: initials,
        preference: pref, annualLeaveUsed: 0,
        joinDate: new Date().toISOString().split('T')[0],
    };
    users.push(newNurse);
    Storage.setUsers(users);
    document.getElementById('add-nurse-overlay').remove();
    App.showToast(`Nurse ${name} added successfully!`, 'success');
    App.navigate('nurse-management');
}

function openEditNurseModal(nurseId) {
    const n = Storage.getUserById(nurseId);
    if (!n) return;
    const wards = ['Ward A', 'Ward B', 'Ward C', 'Ward D', 'ICU', 'A&E'];
    Components.openModal('edit-nurse', '✏️ Edit Nurse', `
    <form id="edit-nurse-form" novalidate>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Full Name</label>
          <input type="text" id="en-name" class="form-input" value="${n.name}" /></div>
        <div class="form-group"><label class="form-label">Ward</label>
          <select id="en-ward" class="form-input">
            ${wards.map(w => `<option ${w === n.ward ? 'selected' : ''}>${w}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Email</label>
          <input type="email" id="en-email" class="form-input" value="${n.email || ''}" /></div>
        <div class="form-group"><label class="form-label">Phone</label>
          <input type="text" id="en-phone" class="form-input" value="${n.phone || ''}" /></div>
      </div>
      <div class="form-group"><label class="form-label">Shift Preference</label>
        <div class="radio-group" id="en-pref-group">
          ${[{ v: 'day', l: '☀️ Day' }, { v: 'night', l: '🌙 Night' }, { v: 'flexible', l: '🔄 Flexible' }].map(p => `
          <label class="radio-card ${n.preference === p.v ? 'active' : ''}" data-val="${p.v}">
            <input type="radio" name="en-pref" value="${p.v}" ${n.preference === p.v ? 'checked' : ''}/>
            <div class="radio-label">${p.l}</div>
          </label>`).join('')}
        </div>
      </div>
      <div class="form-group"><label class="form-label">Annual Leave Used (days)</label>
        <input type="number" id="en-alused" class="form-input" value="${n.annualLeaveUsed || 0}" min="0" max="${ANNUAL_LEAVE_DAYS}" /></div>
      <div class="form-group"><label class="form-label">New Password (leave blank to keep)</label>
        <input type="password" id="en-pass" class="form-input" placeholder="••••••••" /></div>
    </form>`,
        `<button class="btn btn-ghost" onclick="document.getElementById('edit-nurse-overlay').remove()">Cancel</button>
     <button class="btn btn-primary" onclick="submitEditNurse('${nurseId}')">Save Changes</button>`
    );
    initRadioCards('en-pref-group');
}

function submitEditNurse(nurseId) {
    const name = document.getElementById('en-name').value.trim();
    const ward = document.getElementById('en-ward').value;
    const email = document.getElementById('en-email').value.trim();
    const phone = document.getElementById('en-phone').value.trim();
    const pref = document.querySelector('input[name="en-pref"]:checked')?.value || 'flexible';
    const alUsed = parseInt(document.getElementById('en-alused').value) || 0;
    const pass = document.getElementById('en-pass').value;
    const patch = { name, ward, email, phone, preference: pref, annualLeaveUsed: alUsed };
    if (pass) patch.password = pass;
    Storage.updateUser(nurseId, patch);
    document.getElementById('edit-nurse-overlay').remove();
    App.showToast('Nurse profile updated!', 'success');
    App.navigate('nurse-management');
}

function toggleNurseStatus(nurseId, deactivate) {
    Storage.updateUser(nurseId, { deactivated: deactivate });
    App.showToast(deactivate ? 'Nurse deactivated.' : 'Nurse activated!', deactivate ? 'warning' : 'success');
    App.navigate('nurse-management');
}

// ── ROSTER ──────────────────────────────────────────────────

function generateRoster(year, month) {
    const nurses = Storage.getUsers();
    const leaves = Storage.getLeaves();
    const newRoster = RosterGenerator.generate(year, month, nurses, leaves);
    const current = Storage.getRoster();
    const dates = RosterGenerator.getDateRange(year, month);
    dates.forEach(d => { current[d] = newRoster[d]; });
    Storage.setRoster(current);
    App.showToast('Roster generated successfully!', 'success');
    App.navigate('roster', { year, month });
}

function clearRosterMonth(year, month) {
    if (!confirm(`Clear all roster entries for ${new Date(year, month, 1).toLocaleDateString('en-SG', { month: 'long', year: 'numeric' })}?`)) return;
    const current = Storage.getRoster();
    const dates = RosterGenerator.getDateRange(year, month);
    dates.forEach(d => { delete current[d]; });
    Storage.setRoster(current);
    App.showToast('Roster cleared.', 'warning');
    App.navigate('roster', { year, month });
}

function openShiftEditor(date, type) {
    const nurses = Storage.getUsers().filter(u => u.role === ROLES.NURSE && !u.deactivated);
    const leaves = Storage.getLeaves();
    const roster = Storage.getRoster();
    const currentAssigned = (roster[date] || {})[type] || [];
    const s = SHIFT_TYPES[type.toUpperCase()];
    const d = new Date(date);
    const dateLabel = d.toLocaleDateString('en-SG', { weekday: 'long', day: 'numeric', month: 'long' });

    const onLeaveIds = new Set(
        leaves.filter(l => l.status === LEAVE_STATUS.APPROVED.id && l.startDate <= date && l.endDate >= date).map(l => l.nurseId)
    );

    Components.openModal('shift-editor', `${s.icon} ${s.label} — ${dateLabel}`, `
    <p class="text-muted text-sm" style="margin-bottom:16px">Select nurses for this shift. Green = preferred. Strikethrough = on approved leave.</p>
    <div class="nurse-selector" id="nurse-selector">
      ${nurses.map(n => {
        const isSelected = currentAssigned.includes(n.id);
        const isOnLeave = onLeaveIds.has(n.id);
        const isPrefMatch = n.preference === type || n.preference === 'flexible';
        return `
        <div class="nurse-select-chip ${isSelected ? 'selected' : ''} ${isOnLeave ? 'on-leave' : ''} ${isPrefMatch ? 'pref-match' : ''}"
             data-nurse-id="${n.id}" onclick="toggleNurseShift(this)">
          <div class="nurse-avatar-xs">${n.avatar}</div>
          <div>
            <div class="text-sm" ${isOnLeave ? 'style="text-decoration:line-through;opacity:0.5"' : ''}>${n.name}</div>
            <div class="text-muted" style="font-size:11px">${n.ward} ${isPrefMatch ? '★' : ''} ${isOnLeave ? '🏖 Leave' : ''}</div>
          </div>
        </div>`;
    }).join('')}
    </div>`,
        `<button class="btn btn-ghost" onclick="document.getElementById('shift-editor-overlay').remove()">Cancel</button>
     <button class="btn btn-primary" onclick="saveShiftEdit('${date}','${type}')">Save Shift</button>`
    );
}

function toggleNurseShift(el) {
    el.classList.toggle('selected');
}

function saveShiftEdit(date, type) {
    const selected = [...document.querySelectorAll('#nurse-selector .nurse-select-chip.selected')].map(el => el.dataset.nurseId);
    const roster = Storage.getRoster();
    if (!roster[date]) roster[date] = { day: [], night: [] };
    roster[date][type] = selected;
    Storage.setRoster(roster);
    document.getElementById('shift-editor-overlay').remove();
    App.showToast('Shift updated!', 'success');
    const now = new Date();
    App.navigate('roster', { year: new Date(date).getFullYear(), month: new Date(date).getMonth() });
}

// ── LEAVE APPROVAL ──────────────────────────────────────────

function approveLeave(leaveId) {
    const note = document.getElementById(`note-${leaveId}`)?.value.trim() || '';
    const leave = Storage.getLeaves().find(l => l.id === leaveId);
    if (!leave) return;
    Storage.updateLeave(leaveId, { status: LEAVE_STATUS.APPROVED.id, adminNote: note });
    // Deduct annual leave days if annual type
    if (leave.type === LEAVE_TYPES.ANNUAL.id) {
        const days = Math.round((new Date(leave.endDate) - new Date(leave.startDate)) / 86400000) + 1;
        const nurse = Storage.getUserById(leave.nurseId);
        Storage.updateUser(leave.nurseId, { annualLeaveUsed: (nurse.annualLeaveUsed || 0) + days });
    }
    App.showToast(`Leave approved for ${leave.nurseName}!`, 'success');
    App.navigate('leave-approval');
}

function rejectLeave(leaveId) {
    const note = document.getElementById(`note-${leaveId}`)?.value.trim() || '';
    const leave = Storage.getLeaves().find(l => l.id === leaveId);
    if (!leave) return;
    Storage.updateLeave(leaveId, { status: LEAVE_STATUS.REJECTED.id, adminNote: note });
    App.showToast(`Leave rejected for ${leave.nurseName}.`, 'warning');
    App.navigate('leave-approval');
}

// ── LEAVE APPLICATION ────────────────────────────────────────

(function initLeaveForm() {
    document.addEventListener('submit', function (e) {
        if (e.target.id !== 'leave-form') return;
        e.preventDefault();
        const user = App.getState().currentUser;
        const nu = Storage.getUserById(user.id);
        const type = document.querySelector('input[name="leave-type"]:checked')?.value || 'annual';
        const start = document.getElementById('leave-start')?.value;
        const end = document.getElementById('leave-end')?.value;
        const reason = document.getElementById('leave-reason')?.value.trim();
        const err = document.getElementById('leave-form-error');
        if (!start || !end) { err.textContent = 'Please select start and end dates.'; return; }
        if (end < start) { err.textContent = 'End date must be after start date.'; return; }
        if (!reason) { err.textContent = 'Please provide a reason for your leave.'; return; }
        const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
        const annualLeft = ANNUAL_LEAVE_DAYS - (nu?.annualLeaveUsed || 0);
        if (type === 'annual' && days > annualLeft) { err.textContent = `Insufficient annual leave balance. You have ${annualLeft} days left.`; return; }
        // Check for overlapping leaves
        const myLeaves = Storage.getLeaves().filter(l => l.nurseId === user.id && l.status !== LEAVE_STATUS.REJECTED.id);
        const overlap = myLeaves.some(l => !(end < l.startDate || start > l.endDate));
        if (overlap) { err.textContent = 'You already have a leave request overlapping these dates.'; return; }

        const leave = {
            id: 'l' + Date.now(),
            nurseId: user.id, nurseName: user.name, type,
            startDate: start, endDate: end, reason,
            status: LEAVE_STATUS.PENDING.id,
            appliedAt: new Date().toISOString(), adminNote: '',
        };
        Storage.addLeave(leave);
        App.showToast('Leave application submitted!', 'success');
        App.navigate('leave-application');
    });
})();

// ── MY PROFILE ──────────────────────────────────────────────

(function initProfileForm() {
    document.addEventListener('submit', function (e) {
        if (e.target.id !== 'profile-form') return;
        e.preventDefault();
        const user = App.getState().currentUser;
        const name = document.getElementById('pf-name')?.value.trim();
        const phone = document.getElementById('pf-phone')?.value.trim();
        const email = document.getElementById('pf-email')?.value.trim();
        const pref = document.querySelector('input[name="pf-pref"]:checked')?.value || user.preference;
        const pass = document.getElementById('pf-password')?.value;
        const patch = { name, phone, email, preference: pref };
        if (pass) patch.password = pass;
        const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
        patch.avatar = initials;
        Storage.updateUser(user.id, patch);
        // Update session
        const updated = Storage.getUserById(user.id);
        Storage.setSession(updated);
        App.setState({ currentUser: updated });
        App.showToast('Profile updated successfully!', 'success');
        App.navigate('my-profile');
    });
})();

// ── UTILS ────────────────────────────────────────────────────

function initRadioCards(groupId) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.querySelectorAll('.radio-card').forEach(card => {
        card.addEventListener('click', () => {
            group.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            card.querySelector('input[type="radio"]').checked = true;
        });
    });
}

// Global delegation for radio cards and nav links
document.addEventListener('click', function (e) {
    // Radio card
    const radioCard = e.target.closest('.radio-card');
    if (radioCard && radioCard.closest('.radio-group')) {
        const group = radioCard.closest('.radio-group');
        group.querySelectorAll('.radio-card').forEach(c => c.classList.remove('active'));
        radioCard.classList.add('active');
        const radio = radioCard.querySelector('input[type="radio"]');
        if (radio) radio.checked = true;
    }
    // Nav links
    const navLink = e.target.closest('[data-nav]');
    if (navLink) App.navigate(navLink.dataset.nav);
});
