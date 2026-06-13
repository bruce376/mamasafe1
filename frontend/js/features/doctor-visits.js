(function () {
    'use strict';

    const APPOINTMENTS_KEY = 'mamasafe_doctor_appointments';
    const VACCINES_KEY = 'mamasafe_doctor_vaccines';
    const GROWTH_KEY = 'mamasafe_doctor_growth';
    const ACTIVE_TAB_KEY = 'mamasafe_doctor_active_tab';
    const tabs = ['appointments', 'vaccines', 'growth', 'schedule'];
    const activeBackground = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

    function pageRoot() {
        return document.getElementById('doctor-visits');
    }

    function scoped(selector) {
        return pageRoot()?.querySelector(selector) || null;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function readList(key) {
        try {
            const parsed = JSON.parse(localStorage.getItem(key) || '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch (_) {
            return [];
        }
    }

    function saveList(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        if (!window.DB_SYNC || !Array.isArray(value) || !value[0]) return;
        const latest = value[0];
        if (key === APPOINTMENTS_KEY) window.DB_SYNC.saveAppointment({ type: 'doctor-visit', ...latest });
        if (key === VACCINES_KEY) window.DB_SYNC.saveMilestone({ type: 'doctor-vaccine', ...latest });
        if (key === GROWTH_KEY) window.DB_SYNC.saveBaby({ type: 'doctor-growth', ...latest });
    }

    function notify(message, type = 'info') {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        }
    }

    function todayIso() {
        return new Date().toISOString().slice(0, 10);
    }

    function formatDate(date) {
        if (!date) return '--';
        const parsed = new Date(`${date}T00:00:00`);
        if (Number.isNaN(parsed.getTime())) return date;
        return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatTime(time) {
        if (!time || !time.includes(':')) return time || '--';
        const [hours, minutes] = time.split(':').map(Number);
        const suffix = hours >= 12 ? 'PM' : 'AM';
        const hour = hours % 12 || 12;
        return `${hour}:${String(minutes).padStart(2, '0')} ${suffix}`;
    }

    function emptyState(title, detail) {
        return `
            <div class="doctor-empty-state">
                <strong>${escapeHtml(title)}</strong>
                <span>${escapeHtml(detail)}</span>
            </div>
        `;
    }

    function recordCard(title, meta, detail, actions = '') {
        return `
            <article class="doctor-record-card">
                <div>
                    <strong>${escapeHtml(title)}</strong>
                    <span>${escapeHtml(meta)}</span>
                    ${detail ? `<p>${escapeHtml(detail)}</p>` : ''}
                </div>
                ${actions ? `<div class="doctor-card-actions">${actions}</div>` : ''}
            </article>
        `;
    }

    window.showDoctorTab = function showDoctorTab(tabName = 'appointments') {
        const selected = tabs.includes(tabName) ? tabName : 'appointments';
        localStorage.setItem(ACTIVE_TAB_KEY, selected);

        tabs.forEach(tab => {
            const section = scoped(`#${tab}Section`);
            const button = scoped(`#${tab}Tab`);
            const isActive = tab === selected;

            if (section) section.style.display = isActive ? 'block' : 'none';
            if (button) {
                button.classList.toggle('active', isActive);
                button.style.background = isActive ? activeBackground : 'transparent';
                button.style.color = isActive ? '#ffffff' : '#666666';
            }
        });
    };

    window.initializeDoctorVisitsPage = function initializeDoctorVisitsPage() {
        const root = pageRoot();
        if (!root) return;

        if (root.dataset.doctorVisitsBound !== 'true') {
            scoped('#liveAppointmentForm')?.addEventListener('submit', handleAppointmentSubmit);
            scoped('#vaccineForm')?.addEventListener('submit', handleVaccineSubmit);
            scoped('#growthForm')?.addEventListener('submit', handleGrowthSubmit);
            root.dataset.doctorVisitsBound = 'true';
        }

        if (scoped('#vaccineDate') && !scoped('#vaccineDate').value) scoped('#vaccineDate').value = todayIso();
        if (scoped('#growthDate') && !scoped('#growthDate').value) scoped('#growthDate').value = todayIso();

        renderDoctorVisitsPage();
        window.showDoctorTab(localStorage.getItem(ACTIVE_TAB_KEY) || 'appointments');
    };

    function renderDoctorVisitsPage() {
        renderAppointments();
        renderVaccines();
        renderGrowth();
    }

    function handleAppointmentSubmit(event) {
        event.preventDefault();

        const date = scoped('#liveAppointmentDate')?.value;
        const time = scoped('#liveAppointmentTime')?.value;
        const type = scoped('#liveAppointmentType')?.value;
        const doctor = scoped('#liveAppointmentDoctor')?.value?.trim();
        const notes = scoped('#liveAppointmentNotes')?.value?.trim();

        if (!date || !time || !type || !doctor) {
            notify('Please fill in appointment date, time, type, and doctor name', 'error');
            return;
        }

        const appointments = readList(APPOINTMENTS_KEY);
        appointments.unshift({
            id: `appt_${Date.now()}`,
            date,
            time,
            type,
            doctor,
            notes,
            status: 'scheduled',
            createdAt: Date.now()
        });
        saveList(APPOINTMENTS_KEY, appointments);

        window.clearAppointmentForm();
        renderDoctorVisitsPage();
        window.showDoctorTab('appointments');
        notify('Appointment scheduled', 'success');
    }

    function renderAppointments() {
        const appointments = readList(APPOINTMENTS_KEY)
            .sort((a, b) => `${a.date || ''}${a.time || ''}`.localeCompare(`${b.date || ''}${b.time || ''}`));
        const today = todayIso();
        const upcoming = appointments.filter(item => item.status !== 'completed' && (!item.date || item.date >= today));
        const past = appointments.filter(item => item.status === 'completed' || (item.date && item.date < today));

        const upcomingEl = scoped('#liveAppointmentsList');
        const pastEl = scoped('#livePastAppointmentsList');
        const countEl = scoped('#liveUpcomingCount');

        if (countEl) countEl.textContent = String(upcoming.length);

        if (upcomingEl) {
            upcomingEl.innerHTML = upcoming.length
                ? upcoming.map(renderAppointmentCard).join('')
                : emptyState('No upcoming appointments', 'Use the Schedule tab to add the next pediatric visit.');
        }

        if (pastEl) {
            pastEl.innerHTML = past.length
                ? past.map(renderAppointmentCard).join('')
                : emptyState('No completed visits yet', 'Completed and past appointments will appear here.');
        }
    }

    function renderAppointmentCard(item) {
        const typeLabel = String(item.type || 'visit').replace(/^\w/, c => c.toUpperCase());
        return recordCard(
            `${typeLabel} with ${item.doctor || 'doctor'}`,
            `${formatDate(item.date)} at ${formatTime(item.time)}`,
            item.notes || 'No notes added',
            `
                <button type="button" onclick="markAppointmentDone('${item.id}')">Done</button>
                <button type="button" onclick="deleteAppointment('${item.id}')">Delete</button>
            `
        );
    }

    window.markAppointmentDone = function markAppointmentDone(id) {
        const appointments = readList(APPOINTMENTS_KEY).map(item => (
            item.id === id ? { ...item, status: 'completed' } : item
        ));
        saveList(APPOINTMENTS_KEY, appointments);
        renderDoctorVisitsPage();
        notify('Appointment marked completed', 'success');
    };

    window.deleteAppointment = function deleteAppointment(id) {
        saveList(APPOINTMENTS_KEY, readList(APPOINTMENTS_KEY).filter(item => item.id !== id));
        renderDoctorVisitsPage();
        notify('Appointment deleted', 'info');
    };

    function handleVaccineSubmit(event) {
        event.preventDefault();

        const name = scoped('#vaccineName')?.value;
        const date = scoped('#vaccineDate')?.value;
        const status = scoped('#vaccineStatus')?.value;
        const dose = scoped('#vaccineDose')?.value || 'Dose';
        const notes = scoped('#vaccineNotes')?.value?.trim();

        if (!name || !date || !status) {
            notify('Please select vaccine name, date, and status', 'error');
            return;
        }

        const vaccines = readList(VACCINES_KEY);
        vaccines.unshift({
            id: `vax_${Date.now()}`,
            name,
            date,
            status,
            dose,
            notes,
            createdAt: Date.now()
        });
        saveList(VACCINES_KEY, vaccines);

        window.clearVaccineForm();
        renderDoctorVisitsPage();
        notify('Vaccine record saved', 'success');
    }

    function renderVaccines() {
        const vaccines = readList(VACCINES_KEY)
            .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
        const completed = vaccines.filter(item => item.status === 'completed').length;
        const scheduled = vaccines.filter(item => item.status === 'scheduled' || item.status === 'upcoming').length;
        const progress = vaccines.length ? Math.round((completed / vaccines.length) * 100) : 0;
        const next = vaccines.find(item => item.status !== 'completed' && item.date >= todayIso());

        setText('#vaccinesCompletedCount', completed);
        setText('#vaccinesScheduledCount', scheduled);
        setText('#vaccinesProgressPercent', `${progress}%`);
        setText('#liveVaccineProgress', `${progress}%`);
        setText('#vaccinesTotalCount', `${vaccines.length} vaccine${vaccines.length === 1 ? '' : 's'} recorded`);
        setText('#nextVaccineDate', next ? formatDate(next.date) : '--');
        setText('#vaccineProgressBadge', vaccines.length ? `${progress}% complete` : 'Add Vaccines');

        const bar = scoped('#vaccineProgressBar');
        if (bar) bar.style.width = `${progress}%`;

        const timeline = scoped('#vaccinationTimeline');
        if (timeline) {
            timeline.innerHTML = vaccines.length
                ? vaccines.map(item => recordCard(item.name, `${formatDate(item.date)} - ${item.status}`, `${item.dose}${item.notes ? `: ${item.notes}` : ''}`)).join('')
                : emptyState('No vaccine records yet', 'Add completed or scheduled vaccines above.');
        }

        const list = scoped('#liveVaccinationSchedule');
        if (list) {
            list.innerHTML = vaccines.length
                ? vaccines.map(item => recordCard(
                    item.name,
                    `${item.dose} - ${item.status}`,
                    `${formatDate(item.date)}${item.notes ? ` - ${item.notes}` : ''}`,
                    `<button type="button" onclick="deleteVaccine('${item.id}')">Delete</button>`
                )).join('')
                : emptyState('Start vaccine tracking', 'Your saved vaccine records will appear here.');
        }
    }

    window.deleteVaccine = function deleteVaccine(id) {
        saveList(VACCINES_KEY, readList(VACCINES_KEY).filter(item => item.id !== id));
        renderDoctorVisitsPage();
        notify('Vaccine record deleted', 'info');
    };

    function handleGrowthSubmit(event) {
        event.preventDefault();

        const date = scoped('#growthDate')?.value;
        const weight = scoped('#growthWeight')?.value;
        const height = scoped('#growthHeight')?.value;
        const head = scoped('#growthHead')?.value;

        if (!date || !weight || !height) {
            notify('Please enter date, weight, and height', 'error');
            return;
        }

        const records = readList(GROWTH_KEY);
        records.unshift({
            id: `growth_${Date.now()}`,
            date,
            weight,
            height,
            head,
            createdAt: Date.now()
        });
        saveList(GROWTH_KEY, records);

        window.clearGrowthForm();
        renderDoctorVisitsPage();
        notify('Growth record saved', 'success');
    }

    function renderGrowth() {
        const records = readList(GROWTH_KEY)
            .sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));
        const latest = records[0];
        setText('#liveGrowthStatus', latest ? 'Updated' : 'No data');

        const list = scoped('#liveGrowthRecords');
        if (!list) return;

        list.innerHTML = records.length
            ? records.map(item => recordCard(
                `Growth check - ${formatDate(item.date)}`,
                `${item.weight} kg, ${item.height} cm${item.head ? `, head ${item.head} cm` : ''}`,
                'Keep records consistent so your pediatrician can review trends.',
                `<button type="button" onclick="deleteGrowthRecord('${item.id}')">Delete</button>`
            )).join('')
            : emptyState('No growth records yet', 'Add weight and height after pediatric visits.');
    }

    window.deleteGrowthRecord = function deleteGrowthRecord(id) {
        saveList(GROWTH_KEY, readList(GROWTH_KEY).filter(item => item.id !== id));
        renderDoctorVisitsPage();
        notify('Growth record deleted', 'info');
    };

    function setText(selector, value) {
        const el = scoped(selector);
        if (el) el.textContent = String(value);
    }

    window.clearAppointmentForm = function clearAppointmentForm() {
        scoped('#liveAppointmentForm')?.reset();
    };

    window.clearVaccineForm = function clearVaccineForm() {
        scoped('#vaccineForm')?.reset();
        const date = scoped('#vaccineDate');
        if (date) date.value = todayIso();
    };

    window.clearGrowthForm = function clearGrowthForm() {
        scoped('#growthForm')?.reset();
        const date = scoped('#growthDate');
        if (date) date.value = todayIso();
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (pageRoot()?.classList.contains('active')) {
            window.initializeDoctorVisitsPage();
        }
    });
})();
