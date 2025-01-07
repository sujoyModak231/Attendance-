
let attendees = [], events = [];
let currentView = 'attendance';


const $ = selector => document.querySelector(selector);
const navButtons = document.querySelectorAll('nav button');
const views = document.querySelectorAll('.view');


navButtons.forEach(button => button.addEventListener('click', () => switchView(button.dataset.view)));
$('#add-attendee').addEventListener('click', addAttendee);
$('#save-attendance').addEventListener('click', saveAttendance);
$('.attendee-form').addEventListener('submit', e => e.preventDefault());
$('#search-records').addEventListener('input', loadRecords);
$('#filter-date').addEventListener('change', loadRecords);


function switchView(viewName) {
    currentView = viewName;
    navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
    views.forEach(view => view.classList.toggle('active', view.id === `${viewName}-view`));
    if (viewName === 'records') loadRecords();
}


function addAttendee() {
    const name = $('#attendee-name').value.trim(), email = $('#attendee-email').value.trim();
    if (!name || !email) return notify('Please fill in all fields', 'error');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify('Invalid email', 'error');

    attendees.push({ id: Date.now(), name, email });
    renderAttendees();
    clearForm();
    notify('Attendee added', 'success');
}

function renderAttendees() {
    $('#attendees-container').innerHTML = attendees.map(a => `
        <div class="attendee-card">
            <div class="attendee-info">
                <span>${a.name}</span>
                <span>${a.email}</span>
            </div>
            <button onclick="removeAttendee(${a.id})">✖</button>
        </div>
    `).join('');
}

function removeAttendee(id) {
    attendees = attendees.filter(a => a.id !== id);
    renderAttendees();
    notify('Attendee removed', 'success');
}

function clearForm() {
    $('#attendee-name').value = '';
    $('#attendee-email').value = '';
    $('#attendee-name').focus();
}


function saveAttendance() {
    const name = $('#event-name').value.trim(), dateTime = $('#event-datetime').value;
    if (!name || !dateTime || attendees.length === 0) return notify('Event details required', 'error');

    const event = { id: Date.now(), name, dateTime, attendees: [...attendees] };
    events = [...getEvents(), event];
    localStorage.setItem('events', JSON.stringify(events));
    clearEventForm();
    notify('Event saved', 'success');
}

function clearEventForm() {
    $('#event-name').value = '';
    $('#event-datetime').value = '';
    attendees = [];
    renderAttendees();
}


function loadRecords() {
    const term = $('#search-records').value.toLowerCase(), filter = $('#filter-date').value;
    let filtered = getEvents().filter(e => e.name.toLowerCase().includes(term) || e.attendees.some(a => a.name.toLowerCase().includes(term)));

    if (filter === 'today') {
        const today = new Date().toDateString();
        filtered = filtered.filter(e => new Date(e.dateTime).toDateString() === today);
    } else if (filter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 86400000);
        filtered = filtered.filter(e => new Date(e.dateTime) >= weekAgo);
    }
    renderRecords(filtered);
}

function renderRecords(events) {
    $('#records-container').innerHTML = events.length ? events.map(e => `
        <div class="record-card">
            <h3>${e.name}</h3>
            <p>${new Date(e.dateTime).toLocaleString()}</p>
            <p>${e.attendees.length} attendees</p>
            <button onclick="deleteEvent(${e.id})">Delete</button>
        </div>
    `).join('') : '<p>No events found</p>';
}

function deleteEvent(id) {
    if (confirm('Delete this event?')) {
        events = getEvents().filter(e => e.id !== id);
        localStorage.setItem('events', JSON.stringify(events));
        loadRecords();
        notify('Event deleted', 'success');
    }
}

function getEvents() {
    return JSON.parse(localStorage.getItem('events')) || [];
}

function notify(msg, type) {
    const n = $('#notification');
    n.textContent = msg;
    n.className = type;
    setTimeout(() => n.textContent = '', 3000);
}
