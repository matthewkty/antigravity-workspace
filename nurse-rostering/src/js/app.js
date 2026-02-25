// ============================================================
// APP CONTROLLER — SPA router and state
// ============================================================

const App = (() => {
    let state = {
        currentUser: null,
        currentPage: 'login',
        params: {},
        toast: null,
        toastTimer: null,
        modals: [],
    };

    // ── Helpers ─────────────────────────────────────────────
    function setState(patch) {
        state = { ...state, ...patch };
    }

    function getState() { return state; }

    function navigate(page, params = {}) {
        setState({ currentPage: page, params });
        render();
    }

    function showToast(message, type = 'success') {
        if (state.toastTimer) clearTimeout(state.toastTimer);
        setState({ toast: { message, type } });
        const timer = setTimeout(() => {
            setState({ toast: null });
            const el = document.getElementById('toast');
            if (el) el.classList.remove('show');
        }, 3200);
        setState({ toastTimer: timer });
        renderToast();
    }

    function renderToast() {
        let el = document.getElementById('toast');
        if (!el) {
            el = document.createElement('div');
            el.id = 'toast';
            document.body.appendChild(el);
        }
        if (!state.toast) { el.classList.remove('show'); return; }
        el.className = `toast toast-${state.toast.type} show`;
        el.textContent = state.toast.message;
    }

    // ── Auth ─────────────────────────────────────────────────
    function login(username, password) {
        const users = Storage.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        if (!user) return false;
        if (user.deactivated) { showToast('Your account has been deactivated.', 'error'); return false; }
        Storage.setSession(user);
        setState({ currentUser: user });
        navigate(user.role === ROLES.ADMIN ? 'admin-dashboard' : 'nurse-dashboard');
        return true;
    }

    function logout() {
        Storage.clearSession();
        setState({ currentUser: null });
        navigate('login');
    }

    function requireAuth() {
        const session = Storage.getSession();
        if (!session) { navigate('login'); return null; }
        if (!state.currentUser) setState({ currentUser: session });
        return state.currentUser;
    }

    // ── Main render ──────────────────────────────────────────
    function render() {
        const root = document.getElementById('root');
        const user = state.currentUser;

        if (state.currentPage === 'login') {
            root.innerHTML = Pages.Login();
            Pages.LoginInit();
            return;
        }

        // Auth guard
        if (!requireAuth()) return;

        if (user.role === ROLES.ADMIN) {
            root.innerHTML = `
        <div class="app-layout">
          ${Components.Sidebar(state.currentPage, user)}
          <div class="main-content">
            ${Components.TopBar(user, state.currentPage)}
            <div class="page-body" id="page-body">
              ${renderAdminPage()}
            </div>
          </div>
        </div>`;
        } else {
            root.innerHTML = `
        <div class="app-layout">
          ${Components.Sidebar(state.currentPage, user)}
          <div class="main-content">
            ${Components.TopBar(user, state.currentPage)}
            <div class="page-body" id="page-body">
              ${renderNursePage()}
            </div>
          </div>
        </div>`;
        }

        bindGlobalEvents();
        renderToast();
    }

    function renderAdminPage() {
        switch (state.currentPage) {
            case 'admin-dashboard': return Pages.AdminDashboard();
            case 'nurse-management': return Pages.NurseManagement();
            case 'roster': return Pages.Roster(state.params);
            case 'leave-approval': return Pages.LeaveApproval();
            default: return Pages.AdminDashboard();
        }
    }

    function renderNursePage() {
        switch (state.currentPage) {
            case 'nurse-dashboard': return Pages.NurseDashboard();
            case 'leave-application': return Pages.LeaveApplication();
            case 'my-profile': return Pages.MyProfile();
            default: return Pages.NurseDashboard();
        }
    }

    function bindGlobalEvents() {
        // Sidebar nav
        document.querySelectorAll('[data-nav]').forEach(el => {
            el.addEventListener('click', () => navigate(el.dataset.nav));
        });
        // Logout
        document.querySelectorAll('[data-logout]').forEach(el => {
            el.addEventListener('click', logout);
        });
    }

    // ── Init ─────────────────────────────────────────────────
    function init() {
        Storage.init();
        const session = Storage.getSession();
        if (session) {
            setState({ currentUser: session });
            navigate(session.role === ROLES.ADMIN ? 'admin-dashboard' : 'nurse-dashboard');
        } else {
            navigate('login');
        }
    }

    return { init, navigate, showToast, getState, login, logout, render, setState };
})();
