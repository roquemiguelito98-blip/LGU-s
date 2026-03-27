// ==========================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyAvSK-i_0Tx4EJVEJyEbxiFJBkISW9zGt0",
    authDomain: "lgu-s-monitoring.firebaseapp.com",
    projectId: "lgu-s-monitoring",
    storageBucket: "lgu-s-monitoring.firebasestorage.app",
    messagingSenderId: "598733712206",
    appId: "1:598733712206:web:17d7ac76e46f43240b8c1f",
    measurementId: "G-15P3188BWM"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const alertSound = new Audio("https://www.soundjay.com/buttons/sounds/beep-01a.mp3");

// Global Chart Instance
let myChartInstance = null;

// ==========================================
// 2. MAIN INITIALIZATION (DOM CONTENT LOADED)
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 LGU Live Monitoring System Initializing...');

    // UI Components
    initNavigation();
    initSidebar();      
    initMobileMenu();
    initStatisticsPage(); 
    animateMetrics();
    initReportButtons();
    initEmergencyLogic(); 

    // 🔥 REAL-TIME FIREBASE LISTENERS
    listenToDashboardMetrics();
    listenToEmergencyReports();
    
    // Check if optional listeners exist
    if (typeof listenToTransactions === "function") listenToTransactions();

    console.log('✅ System Ready.');
});

// ==========================================
// 3. REAL-TIME CORE LOGIC (FIREBASE)
// ==========================================

function listenToDashboardMetrics() {
    const transRef = db.ref('dashboard/transactions');

    transRef.on('value', (snapshot) => {
        const data = snapshot.val();
        if (!data) return;

        let tourismTotal = 0, tourismCount = 0;
        let adminTotal = 0, adminCount = 0;
        let transparencyTotal = 0, transparencyCount = 0;

        const currentMonth = new Date().getMonth(); 

        Object.values(data).forEach(item => {
            if (!item.date) return;
            const itemMonth = new Date(item.date).getMonth();

            if (itemMonth !== currentMonth) return;

            if (item.category === "revenue") {
                tourismTotal += Number(item.efficiency || 0);
                tourismCount++;
            }
            if (item.category === "efficiency") {
                adminTotal += Number(item.efficiency || 0);
                adminCount++;
            }
            if (item.category === "transparency") {
                transparencyTotal += Number(item.efficiency || 0);
                transparencyCount++;
            }
        });

        const tourismAvg = tourismCount ? (tourismTotal / tourismCount).toFixed(1) : 0;
        const adminAvg = adminCount ? (adminTotal / adminCount).toFixed(1) : 0;
        const transparencyAvg = transparencyCount ? (transparencyTotal / transparencyCount).toFixed(1) : 0;

        // ✅ UPDATE TOP CARDS UI
        const tourismEl = document.getElementById('tourism-revenue-val');
        const adminEl = document.getElementById('admin-efficiency-val');
        const transEl = document.getElementById('transparency-score-val');

        if(tourismEl) tourismEl.innerText = tourismAvg + '%';
        if(adminEl) adminEl.innerText = adminAvg + '%';
        if(transEl) transEl.innerText = transparencyAvg + '%';

        updateActiveChart();
    });
}

function listenToEmergencyReports() {
    const ref = db.ref('emergencyReports');
    ref.on('value', snapshot => {
        const reports = snapshot.val();
        if (!reports) return;

        alertSound.play().catch(e => console.log("Audio play blocked by browser."));
        console.log("New Emergency Data Received:", reports);
    });
}

// ==========================================
// 4. STATISTICS & CHARTS SYSTEM
// ==========================================

function initStatisticsPage() {
    const monthSelect = document.getElementById('monthSelect');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (!monthSelect) return;

    monthSelect.addEventListener('change', updateActiveChart);

    filterButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            const charts = document.querySelectorAll('.stats-chart');
            charts.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            if(charts[index]) charts[index].classList.add('active');

            renderChart(index);
        });
    });

    renderChart(0);
}

function updateActiveChart() {
    const charts = document.querySelectorAll('.stats-chart');
    const activeIndex = [...charts].findIndex(c => c.classList.contains('active'));
    renderChart(activeIndex !== -1 ? activeIndex : 0);
}

async function renderChart(index = 0) {
    const charts = document.querySelectorAll('.stats-chart');
    const activeTab = charts[index];
    if (!activeTab) return;

    const canvas = activeTab.querySelector('canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const monthSelect = document.getElementById('monthSelect');
    const selectedMonth = monthSelect ? monthSelect.value : "Select";

    let dataValues = [0, 0, 0, 0, 0, 0]; 
    if (typeof getFilteredStats === "function") {
        dataValues = await getFilteredStats(selectedMonth, index);
    }

    const chartTypes = ['line', 'bar', 'doughnut', 'pie', 'line', 'bar', 'line'];

    if (myChartInstance) myChartInstance.destroy();

    myChartInstance = new Chart(ctx, {
        type: chartTypes[index] || 'bar',
        data: {
            labels: ['Week 1','Week 2','Week 3','Week 4','Week 5','Week 6'],
            datasets: [{
                label: activeTab.querySelector('h2').innerText,
                data: dataValues,
                backgroundColor: ['#8a38f5','#ff6384','#36a2eb','#ffce56','#4bc0c0','#9966ff'],
                borderColor: '#8a38f5',
                borderWidth: 2,
                fill: chartTypes[index] === 'line'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// ==========================================
// 5. EMERGENCY PAGE SYSTEM
// ==========================================

function initEmergencyLogic() {
    const dropdown = document.querySelector('.emergency-dropdown');
    const contentBox = document.getElementById('emergency-content-box');
    const reportBtn = document.querySelector('.report-btn');

    const emergencyHotlines = {
        "Natural Disasters": "911",
        "Fire Emergencies": "160",
        "Medical & Health Emergencies": "143",
        "Peace and Order / Security": "911",
        "Technological & Environmental": "89296626"
    };

    if (!dropdown) return;

    dropdown.addEventListener('change', function () {
        const selected = this.value;
        if (selected === "Select") {
            contentBox.innerHTML = `<h2>Select an Emergency Type</h2>`;
            return;
        }

        contentBox.innerHTML = `
            <h2>${selected}</h2>
            <div class="form-group"><label>Full Name:</label><input type="text" id="name"></div>
            <div class="form-group"><label>Location:</label><input type="text" id="location"></div>
            <div class="form-group"><label>Problem:</label><textarea id="problem"></textarea></div>
            <a href="tel:${emergencyHotlines[selected]}" class="call-btn">📞 Call Hotline</a>
        `;
    });

    if (reportBtn) {
        reportBtn.addEventListener('click', function () {
            const selected = dropdown.value;
            const name = document.getElementById('name')?.value;
            const location = document.getElementById('location')?.value;
            const problem = document.getElementById('problem')?.value;

            if (selected === "Select" || !name || !location || !problem) {
                return alert("Please fill out all fields!");
            }

            const reportData = { type: selected, name, location, problem, status: "Pending", timestamp: Date.now() };
            db.ref('emergencyReports').push().set(reportData);
            alert("✅ Report submitted!");
        });
    }
}

// ==========================================
// 6. UI & NAVIGATION UTILITIES (SIDEBAR FIXED)
// ==========================================

function initSidebar() {
    const menuIcons = document.querySelectorAll('.menu-icon');
    const sidebar = document.getElementById('sidebar');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    if (!sidebar) return;

    // Toggle sidebar on menu icon click
    menuIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
    });

    // Isara ang sidebar kapag may pinindot na link sa loob
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            sidebar.classList.remove('active');
        });
    });

    // Isara ang sidebar kapag nag-click kahit saan sa labas nito
    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target)) {
            let isClickOnMenuIcon = Array.from(menuIcons).some(icon => icon.contains(e.target));
            if (!isClickOnMenuIcon) {
                sidebar.classList.remove('active');
            }
        }
    });
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            if (targetPage) navigateToPage(targetPage);
        });
    });
}

function navigateToPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${pageName}`);
    if (target) {
        target.classList.add('active');
        updateSidebarActive(pageName);
        window.scrollTo(0, 0);
    }
}

function updateSidebarActive(pageName) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-page') === pageName);
    });
}

function initMobileMenu() {
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelectorAll('.nav-menu').forEach(m => m.classList.remove('active'));
        }
    });
}

function initReportButtons() {
    const genBtn = document.getElementById('btnGenerateReport');
    const delBtn = document.getElementById('btnDeleteReport');

    if (genBtn) genBtn.addEventListener('click', () => alert('Generating Report...'));
    if (delBtn) delBtn.addEventListener('click', () => {
        if(confirm('Are you sure?')) alert('Reports deleted.');
    });
}

function animateMetrics() {
    document.querySelectorAll('.metric-value').forEach((val, i) => {
        val.style.opacity = '0';
        setTimeout(() => {
            val.style.transition = 'all 0.6s ease-out';
            val.style.opacity = '1';
        }, i * 200);
    });
}

// Global Exports
window.lguMonitoring = { navigateToPage };