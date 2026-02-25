// ============================================================
// ROSTER GENERATOR — auto-schedule algorithm
// ============================================================

const RosterGenerator = (() => {

    function getDateRange(year, month) {
        const days = new Date(year, month + 1, 0).getDate();
        const dates = [];
        for (let d = 1; d <= days; d++) {
            dates.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
        }
        return dates;
    }

    function getDatesOnLeave(nurseId, leaves) {
        const onLeave = new Set();
        leaves
            .filter(l => l.nurseId === nurseId && l.status === LEAVE_STATUS.APPROVED.id)
            .forEach(l => {
                const start = new Date(l.startDate);
                const end = new Date(l.endDate);
                const cur = new Date(start);
                while (cur <= end) {
                    onLeave.add(cur.toISOString().split('T')[0]);
                    cur.setDate(cur.getDate() + 1);
                }
            });
        return onLeave;
    }

    function isWeekend(dateStr) {
        const d = new Date(dateStr);
        const day = d.getDay();
        return day === 0 || day === 6;
    }

    /**
     * core generator — produces a roster object keyed by date:
     * { '2026-03-01': { day: ['n001','n003'], night: ['n002','n005'] }, ... }
     */
    function generate(year, month, nurses, leaves) {
        const dates = getDateRange(year, month);
        const roster = {};
        const activeNurses = nurses.filter(n => n.role === ROLES.NURSE && !n.deactivated);

        // Track consecutive working days per nurse
        const consecutive = {};
        activeNurses.forEach(n => { consecutive[n.id] = 0; });

        // Track days already worked this month (to enforce constraints)
        const worked = {};
        activeNurses.forEach(n => { worked[n.id] = 0; });

        dates.forEach(date => {
            roster[date] = { day: [], night: [] };
            const leaveMap = {};
            activeNurses.forEach(n => {
                leaveMap[n.id] = getDatesOnLeave(n.id, leaves).has(date);
            });

            // Separate into preference pools
            const dayPool = activeNurses.filter(n =>
                !leaveMap[n.id] &&
                consecutive[n.id] < MAX_CONSECUTIVE_DAYS &&
                (n.preference === PREFERENCES.DAY || n.preference === PREFERENCES.FLEXIBLE)
            );
            const nightPool = activeNurses.filter(n =>
                !leaveMap[n.id] &&
                consecutive[n.id] < MAX_CONSECUTIVE_DAYS &&
                (n.preference === PREFERENCES.NIGHT || n.preference === PREFERENCES.FLEXIBLE)
            );

            // Sort by least worked first (fairness)
            dayPool.sort((a, b) => worked[a.id] - worked[b.id]);
            nightPool.sort((a, b) => worked[a.id] - worked[b.id]);

            const assignedToday = new Set();

            // Assign day shift (min 2 nurses)
            const dayCount = isWeekend(date) ? 2 : 3;
            let di = 0;
            while (roster[date].day.length < dayCount && di < dayPool.length) {
                const nurse = dayPool[di++];
                if (!assignedToday.has(nurse.id)) {
                    roster[date].day.push(nurse.id);
                    assignedToday.add(nurse.id);
                    worked[nurse.id]++;
                    consecutive[nurse.id]++;
                }
            }

            // Assign night shift (min 2 nurses)
            const nightCount = isWeekend(date) ? 2 : 2;
            let ni = 0;
            while (roster[date].night.length < nightCount && ni < nightPool.length) {
                const nurse = nightPool[ni++];
                if (!assignedToday.has(nurse.id)) {
                    roster[date].night.push(nurse.id);
                    assignedToday.add(nurse.id);
                    worked[nurse.id]++;
                    consecutive[nurse.id]++;
                }
            }

            // Reset consecutive for nurses who are off today
            activeNurses.forEach(n => {
                if (!assignedToday.has(n.id) && !leaveMap[n.id]) {
                    consecutive[n.id] = 0;
                }
            });
        });

        return roster;
    }

    return { generate, getDateRange };
})();
