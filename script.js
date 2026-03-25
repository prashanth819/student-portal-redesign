document.addEventListener('DOMContentLoaded', () => {
  // Navigation active state management
  const navItems = document.querySelectorAll('.nav-item');
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
  
  // Function to switch active tab visually
  function setActiveTab(tabId) {
    if (!tabId) return; // Skip if no data-tab attribute
    
    // Update sidebar navigation
    navItems.forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update mobile bottom navigation
    bottomNavItems.forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Toggle the visibility of different main content sections
    const tabs = {
      'dashboard': document.getElementById('dashboard-tab'),
      'attendance': document.getElementById('attendance-tab'),
      'performance': document.getElementById('performance-tab'),
      'schedule': document.getElementById('schedule-tab'),
      'profile': document.getElementById('profile-tab')
    };

    // Hide all tabs
    Object.values(tabs).forEach(tab => {
      if (tab) tab.style.display = 'none';
    });

    // Show active and handle callbacks
    if (tabs[tabId]) {
      const activeTab = tabs[tabId];
      activeTab.style.display = 'block';
      activeTab.classList.remove('page-enter');
      void activeTab.offsetWidth; // trigger reflow
      activeTab.classList.add('page-enter');
      
      // Inject Skeleton Loaders instantly for premium perceived performance
      const skeletons = activeTab.querySelectorAll('.card, .timeline-item, .flex-col > .flex, .stat-value, .badge, .subject-progress');
      skeletons.forEach(el => el.classList.add('skeleton'));
      
      setTimeout(() => {
        // Remove Skeletons & Trigger Staggered Entrance
        skeletons.forEach((el, i) => {
          el.classList.remove('skeleton');
          el.style.animation = 'none';
          void el.offsetHeight;
          el.style.opacity = '0';
          el.style.animation = `pageEnter 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 0.04}s forwards`;
        });
        
        // Execute heavy charting/rendering logic
        if (tabId === 'dashboard' && typeof renderAttendance === 'function') renderAttendance();
        else if (tabId === 'attendance' && typeof renderPageAttendance === 'function') renderPageAttendance();
        else if (tabId === 'performance' && typeof renderPagePerformance === 'function') renderPagePerformance();
        else if (tabId === 'schedule' && typeof renderPageSchedule === 'function') renderPageSchedule();
      }, 350); // Fluid 350ms loading duration
    } else {
      console.log(`Navigated to ${tabId}. Feature not built yet!`);
    }
  }

  // Bind click events for sidebar links
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Prevent actual page reload for the demo
      e.preventDefault(); 
      const tabId = item.dataset.tab;
      // In mobile, we might be clicking "Log Out" which has no tab, handle gracefully
      if (tabId) {
        setActiveTab(tabId);
      }
    });
  });

  // Bind click events for mobile bottom nav links
  bottomNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tabId = item.dataset.tab;
      setActiveTab(tabId);
    });
  });

  // Simple interactive features for buttons
  const notificationBtn = document.querySelector('.icon-btn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', () => {
      const badge = notificationBtn.querySelector('.notification-badge');
      if (badge && badge.style.display !== 'none') {
        badge.style.display = 'none'; // Clear notification badge on click
        alert('You have no new notifications!');
      } else {
        alert('Notifications menu would open here.');
      }
    });
  }
  
  // Interactive avatar
  const avatarBtn = document.querySelector('.profile-avatar');
  if (avatarBtn) {
    avatarBtn.addEventListener('click', () => {
      alert('User settings and profile menu would open here.');
    });
  }

  // --- REAL-TIME SCHEDULE LOGIC ---
  const scheduleData = [
    { id: 1, title: 'Data Structures & Algorithms', start: '09:00', end: '10:30', room: 'Room 302', prof: 'Prof. Smith' },
    { id: 2, title: 'Web Development Lab', start: '11:00', end: '12:30', room: 'Lab 14', prof: 'Prof. Johnson' },
    { id: 3, title: 'Computer Networks', start: '13:00', end: '14:30', room: 'Room 105', prof: 'Prof. Davis' },
    { id: 4, title: 'AI Ethics Workshop', start: '15:15', end: '16:45', room: 'Seminar Hall B', prof: 'Prof. Wilson' },
    { id: 5, title: 'Final Project Meeting', start: '17:00', end: '18:00', room: 'Library Pod C', prof: 'Study Group' }
  ];

  function updateSchedule() {
    const now = new Date();
    
    // Developer helper: uncomment and adjust to test real-time states
    // now.setHours(13); now.setMinutes(15); 
    
    const timeDisplay = document.getElementById('live-time');
    if(timeDisplay) {
      timeDisplay.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Convert current time to minutes from midnight
    const currentMins = now.getHours() * 60 + now.getMinutes();
    
    const timelineElement = document.getElementById('schedule-timeline');
    const subtitleElement = document.getElementById('schedule-subtitle');
    const nowBadge = document.getElementById('schedule-now-badge');
    
    if(!timelineElement) return;
    
    let html = '';
    let currentClass = null;
    let nextClass = null;
    
    scheduleData.forEach(item => {
      // Parse start and end times
      const [startH, startM] = item.start.split(':').map(Number);
      const [endH, endM] = item.end.split(':').map(Number);
      const startMins = startH * 60 + startM;
      const endMins = endH * 60 + endM;
      
      let state = 'upcoming';
      let stateClass = '';
      let markerClass = '';
      let statusHtml = '<span class="status-badge">Upcoming</span>';
      let titleClass = '';
      
      if (currentMins >= startMins && currentMins <= endMins) {
        state = 'ongoing';
        currentClass = item;
        stateClass = 'ongoing';
        markerClass = 'pulse-marker';
        statusHtml = '<span class="status-badge" style="background-color: var(--primary); color: white;">Ongoing</span>';
        titleClass = 'text-green';
      } else if (currentMins > endMins) {
        state = 'completed';
        stateClass = 'completed';
        statusHtml = '<span class="status-badge">Completed</span>';
      } else {
        if (!nextClass) nextClass = item;
        state = 'upcoming';
        stateClass = 'upcoming';
      }
      
      const formatTime = (h, m) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
      };
      
      html += `
        <li class="timeline-item ${stateClass}">
          <div class="timeline-marker ${markerClass}"></div>
          <div class="timeline-content card-inner">
            <div class="flex justify-between items-start mb-2">
              <h4 class="subject-name text-lg font-bold ${titleClass}">${item.title}</h4>
              ${statusHtml}
            </div>
            <div class="flex flex-col gap-1 text-sm font-medium ${state === 'ongoing' ? 'text-green' : 'text-muted'}" style="opacity: ${state === 'upcoming' ? '0.8' : '1'};">
              <span class="flex items-center"><i class="fa-regular fa-clock mr-2" style="width: 14px;"></i> ${formatTime(startH, startM)} - ${formatTime(endH, endM)}</span>
              <span class="flex items-center"><i class="fa-regular fa-building mr-2" style="width: 14px;"></i> ${item.room} • ${item.prof}</span>
            </div>
          </div>
        </li>
      `;
    });
    
    timelineElement.innerHTML = html;
    
    // Update Subtitle and badge
    if (currentClass) {
      subtitleElement.innerText = `Currently in ${currentClass.title}`;
      subtitleElement.className = 'text-sm font-medium mt-1 text-green flex items-center';
      
      nowBadge.style.display = 'inline-flex';
      nowBadge.innerHTML = `<i class="fa-solid fa-circle text-[10px] mr-1"></i> Now`;
      nowBadge.className = 'badge badge-green mt-1 pulse-animation';
    } else if (nextClass) {
      const [startH, startM] = nextClass.start.split(':').map(Number);
      const diffMins = (startH * 60 + startM) - currentMins;
      
      if (diffMins > 0 && diffMins <= 60) {
         subtitleElement.innerText = `Next class in ${diffMins} min${diffMins > 1 ? 's' : ''}`;
      } else {
         const h = Math.floor(diffMins / 60);
         const m = diffMins % 60;
         subtitleElement.innerText = `Next class in ${h}h ${m}m`;
      }
      subtitleElement.className = 'text-sm font-medium mt-1 text-blue';
      
      nowBadge.style.display = 'inline-flex';
      nowBadge.innerHTML = `<i class="fa-regular fa-clock text-[10px] mr-1"></i> Next`;
      nowBadge.className = 'badge badge-blue mt-1';
    } else {
      subtitleElement.innerText = 'No more classes today! 🎉';
      subtitleElement.className = 'text-sm font-medium mt-1 text-muted';
      nowBadge.style.display = 'none';
    }
  }
  
  // --- LOGOUT MODAL & DUMMY LINKS SYNCHRONIZATION ---
  const logoutBtnDesktop = document.getElementById('logout-btn');
  const logoutBtnMobile = document.getElementById('logout-btn-mobile');
  const logoutModal = document.getElementById('logout-modal');
  const confirmLogout = document.getElementById('confirm-logout');
  const cancelLogout = document.getElementById('cancel-logout');
  
  function showLogoutModal(e) {
    if(e) e.preventDefault();
    if(logoutModal) {
      logoutModal.style.display = 'flex';
      void logoutModal.offsetWidth; // Reflow
      logoutModal.style.opacity = '1';
      logoutModal.querySelector('.modal-content').style.transform = 'scale(1)';
    }
  }
  
  function hideLogoutModal() {
    if(logoutModal) {
      logoutModal.style.opacity = '0';
      logoutModal.querySelector('.modal-content').style.transform = 'scale(0.9)';
      setTimeout(() => logoutModal.style.display = 'none', 300);
    }
  }
  
  if (logoutBtnDesktop) logoutBtnDesktop.addEventListener('click', showLogoutModal);
  if (logoutBtnMobile) logoutBtnMobile.addEventListener('click', showLogoutModal);
  if (cancelLogout) cancelLogout.addEventListener('click', hideLogoutModal);
  
  if (confirmLogout) {
    confirmLogout.addEventListener('click', () => {
      confirmLogout.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Exiting...';
      confirmLogout.style.opacity = '0.8';
      confirmLogout.style.cursor = 'not-allowed';
      
      setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    });
  }

  // Set default action for all '#` anchor links not otherwise tracked
  document.querySelectorAll('a[href="#"]:not(.nav-item):not(.bottom-nav-item)').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      alert('TKREC Dashboard: External feature integration confirmed (dummy verification link).');
    });
  });

  // Initialize schedule tracking
  updateSchedule();
  
  // Real-time update every second for the clock 
  setInterval(updateSchedule, 1000);

  // --- ATTENDANCE OVERVIEW LOGIC ---
  const attendanceData = [
    { name: 'Data Structures', attended: 32, total: 40 }, // 80%
    { name: 'Web Dev Lab', attended: 24, total: 25 }, // 96%
    { name: 'Database Systems', attended: 15, total: 24 }, // 62.5%
    { name: 'Comp. Networks', attended: 21, total: 30 } // 70%
  ];

  function getColorClass(percentage) {
    if (percentage > 75) return { color: 'var(--primary)', badge: 'badge-green', icon: 'fa-check-circle' };
    if (percentage >= 65) return { color: 'var(--orange)', badge: 'badge-orange', icon: 'fa-triangle-exclamation' };
    return { color: 'var(--red)', badge: 'badge-red', icon: 'fa-circle-exclamation' };
  }

  function renderAttendance() {
    let totalAttended = 0;
    let totalClasses = 0;
    let lowestSubject = attendanceData[0];
    
    let subjectListHtml = '';
    
    attendanceData.forEach(subject => {
      totalAttended += subject.attended;
      totalClasses += subject.total;
      
      const percentage = (subject.attended / subject.total) * 100;
      if (percentage < (lowestSubject.attended / lowestSubject.total) * 100) {
        lowestSubject = subject;
      }
      
      const theme = getColorClass(percentage);
      
      subjectListHtml += `
        <div class="subject-progress">
          <div class="flex justify-between items-end mb-2">
            <h4 class="text-sm font-semibold text-main opacity-80">${subject.name}</h4>
            <span class="text-xs font-bold" style="color: ${theme.color}">${Math.round(percentage)}%</span>
          </div>
          <div class="progress-bar-bg w-full">
            <div class="progress-bar-fill" style="width: 0%; background-color: ${theme.color};" data-width="${percentage}%"></div>
          </div>
        </div>
      `;
    });
    
    const overallPercentage = Math.round((totalAttended / totalClasses) * 100);
    const overallTheme = getColorClass(overallPercentage);
    
    const ring = document.getElementById('overall-attendance-ring');
    const text = document.getElementById('overall-attendance-text');
    const insight = document.getElementById('attendance-insight');
    const listContainer = document.getElementById('subject-attendance-list');
    
    if(!ring || !text || !insight || !listContainer) return;
    
    listContainer.innerHTML = subjectListHtml;
    
    // Animate Circular Progress
    const circumference = 58 * 2 * Math.PI; // approx 364.42
    const offset = circumference - (overallPercentage / 100) * circumference;
    
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
      ring.style.stroke = overallTheme.color;
      
      // Animate Horizontal Bars
      document.querySelectorAll('.progress-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width');
      });
    }, 100);
    
    text.innerText = `${overallPercentage}%`;
    text.style.color = overallTheme.color;
    
    // Smart Insights
    let insightMessage = '';
    let insightStyle = overallTheme.badge;
    let insightIcon = overallTheme.icon;
    
    if (overallPercentage < 65) {
      insightMessage = `Critical: Improve attendance immediately.`;
    } else if (overallPercentage <= 75) {
      // Need 75 percent: (attended + x) / (total + x) = 0.75
      const needed = Math.ceil((0.75 * totalClasses - totalAttended) / 0.25);
      insightMessage = `Need ${needed > 0 ? needed : 1} straight classes to reach 75%.`;
    } else {
      const lowestPercent = (lowestSubject.attended / lowestSubject.total) * 100;
      if (lowestPercent < 75) {
        insightMessage = `Low attendance in ${lowestSubject.name.split(' ')[0]}`;
        insightStyle = 'badge-orange';
        insightIcon = 'fa-triangle-exclamation';
      } else {
        insightMessage = `Great! Good standing overall.`;
      }
    }
    
    insight.innerHTML = `
      <span class="badge ${insightStyle} text-xs flex items-center justify-center gap-2 mx-auto block" style="width: fit-content; padding: 6px 14px;">
        <i class="fa-solid ${insightIcon}"></i> ${insightMessage}
      </span>
    `;
  }
  
  // Render after a short delay to allow DOM transition setup
  setTimeout(renderAttendance, 150);

  // --- PERFORMANCE CHART LOGIC (Chart.js) ---
  const perfCanvas = document.getElementById('performanceChart');
  if (perfCanvas && typeof Chart !== 'undefined') {
    const ctx = perfCanvas.getContext('2d');
    
    // Create a very subtle soft green gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
    // Matches var(--primary) with opacity
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)'); 
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Midterms'],
        datasets: [{
          label: 'Overall CGPA',
          data: [7.2, 7.5, 7.8, 8.1, 8.5],
          borderColor: '#10b981', // green accent
          borderWidth: 3,
          backgroundColor: gradient,
          fill: true,
          tension: 0.4, // Smooth curved line (not sharp)
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            padding: 12,
            titleFont: { family: 'Inter', size: 13 },
            bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
            displayColors: false,
            callbacks: {
              label: function(context) { return context.parsed.y + ' CGPA'; }
            }
          }
        },
        scales: {
          x: {
            grid: { display: false, drawBorder: false },
            ticks: { font: { family: 'Inter', size: 12 }, color: '#64748b' }
          },
          y: {
            min: 6.5,
            max: 9.0,
            grid: { color: '#e2e8f0', drawBorder: false },
            ticks: { font: { family: 'Inter', size: 12 }, color: '#64748b', stepSize: 0.5 }
          }
        },
        interaction: { intersect: false, mode: 'index' }
      }
    });
  }

  // --- FULL ATTENDANCE PAGE LOGIC ---
  window.renderPageAttendance = function() {
    let totalAttended = 0;
    let totalClasses = 0;
    let lowestSubject = attendanceData[0];
    
    let subjectGridHtml = '';
    
    attendanceData.forEach(subject => {
      totalAttended += subject.attended;
      totalClasses += subject.total;
      
      const percentage = (subject.attended / subject.total) * 100;
      if (percentage < (lowestSubject.attended / lowestSubject.total) * 100) {
        lowestSubject = subject;
      }
      
      const theme = getColorClass(percentage);
      const isPositive = percentage >= 75;
      const trendIcon = isPositive ? 'fa-arrow-trend-up text-green' : 'fa-arrow-trend-down text-orange';
      const trendText = isPositive ? 'Improving' : 'Needs Focus';
      const badgeStatus = percentage >= 75 ? 'Safe' : percentage >= 65 ? 'Warning' : 'Low';
      
      subjectGridHtml += `
        <div class="card p-4 hover-lift bg-bg-main" style="border-left: 4px solid ${theme.color}; padding: 20px;">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h4 class="text-lg font-bold text-main mb-1">${subject.name}</h4>
              <p class="text-sm font-medium text-muted"><i class="fa-solid fa-list-check mr-1 opacity-80"></i> ${subject.attended} / ${subject.total} Classes</p>
            </div>
            <div class="text-right">
              <h3 class="text-2xl font-bold mb-1" style="color: ${theme.color}">${Math.round(percentage)}%</h3>
              <span class="badge ${theme.badge}"><i class="fa-solid ${theme.icon} mr-1"></i> ${badgeStatus}</span>
            </div>
          </div>
          
          <div class="progress-bar-bg w-full mb-3" style="height: 8px;">
            <div class="progress-bar-fill" style="width: 0%; background-color: ${theme.color}; transition: width 1s ease-out;" data-page-width="${percentage}%"></div>
          </div>
          
          <div class="flex justify-between items-center text-xs font-bold text-muted uppercase tracking-wide">
            <span><i class="fa-solid ${trendIcon} mr-1 text-sm"></i> ${trendText}</span>
            <span>Target: 75%</span>
          </div>
        </div>
      `;
    });
    
    const overallPercentage = Math.round((totalAttended / totalClasses) * 100);
    const overallTheme = getColorClass(overallPercentage);
    
    const ring = document.getElementById('page-overall-attendance-ring');
    const text = document.getElementById('page-overall-attendance-text');
    const insight = document.getElementById('page-attendance-insight');
    const gridContainer = document.getElementById('page-subject-grid');
    
    if(!ring || !text || !insight || !gridContainer) return;
    
    gridContainer.innerHTML = subjectGridHtml;
    
    const circumference = 66 * 2 * Math.PI; 
    const offset = circumference - (overallPercentage / 100) * circumference;
    
    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
      ring.style.stroke = overallTheme.color;
      
      document.querySelectorAll('#page-subject-grid .progress-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-page-width');
      });
    }, 50);
    
    text.innerText = `${overallPercentage}%`;
    text.style.color = overallTheme.color;
    
    let insightMessage = '';
    
    if (overallPercentage < 65) {
      insightMessage = `Critical: Need immediate attendance improvement.`;
    } else if (overallPercentage <= 75) {
      const needed = Math.ceil((0.75 * totalClasses - totalAttended) / 0.25);
      insightMessage = `You need ${needed > 0 ? needed : 1} more straight classes to reach 75%.`;
    } else {
      const lowestPercent = (lowestSubject.attended / lowestSubject.total) * 100;
      if (lowestPercent < 75) {
        insightMessage = `Watch out: Low attendance in ${lowestSubject.name}`;
      } else {
        insightMessage = `Excellent! Good standing overall. Keep it up!`;
      }
    }
    
    insight.innerHTML = `
      <span class="badge ${overallTheme.badge} text-sm flex items-center justify-center gap-2" style="display: inline-flex; padding: 8px 16px;">
        <i class="fa-solid ${overallTheme.icon} text-lg"></i> ${insightMessage}
      </span>
    `;
  };

  // --- FULL SCHEDULE PAGE LOGIC ---
  const weeklySchedule = {
    0: [], // Sunday
    1: [ // Monday
      { name: 'Data Structures', startH: 9, startM: 0, endH: 10, endM: 0, room: 'Room 302' },
      { name: 'Mathematics', startH: 10, startM: 15, endH: 11, endM: 15, room: 'Room 205' },
      { name: 'DBMS Lab', startH: 11, startM: 30, endH: 13, endM: 30, room: 'Lab 4' },
      { name: 'Operating Systems', startH: 14, startM: 30, endH: 15, endM: 30, room: 'Room 305' }
    ],
    2: [ // Tuesday
      { name: 'Algorithms', startH: 9, startM: 0, endH: 10, endM: 30, room: 'Room 302' },
      { name: 'Computer Networks', startH: 11, startM: 0, endH: 12, endM: 30, room: 'Room 210' },
      { name: 'Data Networks Lab', startH: 13, startM: 30, endH: 15, endM: 30, room: 'Lab 2' }
    ],
    3: [ // Wednesday
      { name: 'Software Eng', startH: 10, startM: 0, endH: 11, endM: 30, room: 'Room 301' },
      { name: 'Machine Learning', startH: 12, startM: 0, endH: 13, endM: 30, room: 'Room 205' },
      { name: 'DBMS', startH: 14, startM: 30, endH: 16, endM: 0, room: 'Room 305' }
    ],
    4: [ // Thursday
      { name: 'Web Dev Lab', startH: 9, startM: 0, endH: 11, endM: 0, room: 'Lab 1' },
      { name: 'Operating Systems', startH: 11, startM: 30, endH: 13, endM: 0, room: 'Room 305' },
      { name: 'Mathematics', startH: 14, startM: 0, endH: 15, endM: 30, room: 'Room 205' }
    ],
    5: [ // Friday
      { name: 'Algorithms Lab', startH: 9, startM: 30, endH: 11, endM: 30, room: 'Lab 3' },
      { name: 'Data Structures', startH: 12, startM: 30, endH: 14, endM: 0, room: 'Room 302' }
    ],
    6: [] // Saturday
  };

  let selectedDayIndex = new Date().getDay();

  window.renderPageSchedule = function() {
    renderDayTabs();
    renderDayTimeline();
  };

  function renderDayTabs() {
    const tabsContainer = document.getElementById('schedule-day-tabs');
    if (!tabsContainer) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = new Date().getDay();

    let html = '';
    days.forEach((day, index) => {
      if ((index === 0 || index === 6) && weeklySchedule[index].length === 0) return;
      
      const isSelected = index === selectedDayIndex;
      const isToday = index === currentDay;
      const activeClass = isSelected ? 'bg-primary text-primary-dark shadow-md border-transparent text-white' : 'bg-bg-main text-muted hover-lift border-light border';
      const todayBadge = isToday ? `<span class="w-1.5 h-1.5 rounded-full bg-orange absolute top-2 right-2"></span>` : '';
      
      html += `
        <button class="relative px-6 py-2.5 rounded-lg font-bold transition-all duration-200 outline-none text-sm ${activeClass}" style="${isSelected ? 'background-color: var(--primary); color: white;' : ''}" onclick="selectScheduleDay(${index})">
          ${day.substring(0, 3)}
          ${todayBadge}
        </button>
      `;
    });
    
    tabsContainer.innerHTML = html;
  }

  window.selectScheduleDay = function(index) {
    selectedDayIndex = index;
    renderPageSchedule();
  };

  function renderDayTimeline() {
    const timelineContainer = document.getElementById('page-schedule-timeline');
    const statusText = document.getElementById('schedule-page-status');
    const subStatusText = document.getElementById('schedule-page-substatus');
    if (!timelineContainer) return;

    const schedule = weeklySchedule[selectedDayIndex] || [];
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const nowMinutes = currentH * 60 + currentM;
    const isToday = selectedDayIndex === now.getDay();
    
    schedule.sort((a, b) => (a.startH * 60 + a.startM) - (b.startH * 60 + b.startM));

    let html = '';
    let nextClass = null;
    let ongoingClass = null;

    if (schedule.length === 0) {
      timelineContainer.innerHTML = `
        <div class="text-center py-10" style="padding-top: 60px; padding-bottom: 60px;">
          <i class="fa-regular fa-calendar-check text-5xl text-green mb-4 opacity-60"></i>
          <h3 class="text-2xl font-bold text-main">No Classes!</h3>
          <p class="text-muted font-medium mt-1">Enjoy your free time.</p>
        </div>
      `;
      if (statusText) statusText.innerText = "Free Day";
      if (subStatusText) subStatusText.innerText = "No classes scheduled.";
      return;
    }

    schedule.forEach((cls) => {
      const startMinutes = cls.startH * 60 + cls.startM;
      const endMinutes = cls.endH * 60 + cls.endM;
      
      let state = 'upcoming'; 
      if (isToday) {
        if (nowMinutes >= startMinutes && nowMinutes < endMinutes) {
          state = 'ongoing';
          ongoingClass = cls;
        } else if (nowMinutes >= endMinutes) {
          state = 'completed';
        } else {
          if (!nextClass && state === 'upcoming') {
            nextClass = cls;
          }
        }
      } else if (selectedDayIndex < now.getDay()) {
        state = 'completed';
      }

      const formatTime = (h, m) => {
        const period = h >= 12 ? 'PM' : 'AM';
        let hour = h % 12;
        if (hour === 0) hour = 12;
        const min = m < 10 ? '0' + m : m;
        return `${hour}:${min} ${period}`;
      };

      const timeString = `${formatTime(cls.startH, cls.startM)} - ${formatTime(cls.endH, cls.endM)}`;

      let badgeHtml = '';
      let itemClass = '';
      let markerClass = 'bg-border-light';
      let iconColor = 'text-muted opacity-80';

      if (state === 'ongoing') {
        itemClass = 'ongoing bg-primary-light';
        markerClass = 'bg-primary pulse-marker';
        iconColor = 'text-primary';
        badgeHtml = `<span class="badge badge-green text-xs absolute top-4 right-4 animate-pulse"><i class="fa-solid fa-bolt mr-1"></i> Ongoing</span>`;
      } else if (state === 'upcoming') {
        if (cls === nextClass) {
          itemClass = 'border-l-4 border-orange'; 
          badgeHtml = `<span class="badge badge-orange text-xs absolute top-4 right-4"><i class="fa-solid fa-hourglass-half mr-1"></i> Next</span>`;
          markerClass = 'bg-orange';
        } else {
          itemClass = 'opacity-90';
        }
      } else { 
        itemClass = 'opacity-60 grayscale';
      }

      html += `
        <div class="timeline-item ${itemClass} relative p-5 mb-6 rounded-lg ml-6 shadow-sm" style="border: 1px solid var(--border-light); ${state === 'upcoming' && cls === nextClass ? 'border-left-color: var(--orange);' : ''} ${state === 'ongoing' ? 'border-color: var(--primary); box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);' : ''}">
          <div class="timeline-marker ${markerClass}" style="width: 14px; height: 14px; left: -34px;"></div>
          ${badgeHtml}
          
          <h4 class="text-xl font-bold text-main mb-2">${cls.name}</h4>
          
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-3">
            <span class="text-sm font-bold text-muted flex items-center tracking-wide uppercase">
              <i class="fa-regular fa-clock text-lg ${iconColor} mr-2"></i> ${timeString}
            </span>
            <span class="text-sm font-bold text-muted flex items-center tracking-wide uppercase">
              <i class="fa-solid fa-location-dot text-lg ${iconColor} mr-2"></i> ${cls.room}
            </span>
          </div>
        </div>
      `;
    });

    timelineContainer.innerHTML = html;

    if (!isToday) {
      if (statusText) statusText.innerText = "Viewing Weekly Schedule";
      if (subStatusText) subStatusText.innerText = `Showing timetable for the selected day.`;
    } else {
      if (ongoingClass) {
        if (statusText) statusText.innerText = `Currently in ${ongoingClass.name}`;
        const endMins = ongoingClass.endH * 60 + ongoingClass.endM;
        const minsLeft = endMins - nowMinutes;
        if (subStatusText) subStatusText.innerText = `${minsLeft} mins left in this class.`;
      } else if (nextClass) {
        const startMins = nextClass.startH * 60 + nextClass.startM;
        const minsToNext = startMins - nowMinutes;
        if (statusText) statusText.innerText = `Free Time`;
        if (minsToNext < 60) {
          if (subStatusText) subStatusText.innerText = `Next class in ${minsToNext} mins (${nextClass.name}).`;
        } else {
          const hrs = Math.floor(minsToNext / 60);
          const m = minsToNext % 60;
          if (subStatusText) subStatusText.innerText = `Next class in ${hrs}h ${m}m (${nextClass.name}).`;
        }
      } else {
        if (statusText) statusText.innerText = `Classes Completed`;
        if (subStatusText) subStatusText.innerText = `You have no more classes today.`;
      }
    }
  }

  // Hook interval so that it re-renders the page timeline if active
  setInterval(() => {
    const scheduleTab = document.getElementById('schedule-tab');
    if (scheduleTab && scheduleTab.style.display === 'block') {
      renderDayTimeline();
    }
  }, 30000); // Check every 30 secs

  // --- FULL PERFORMANCE PAGE LOGIC ---
  window.renderPagePerformance = function() {
    // 1. Render Large Chart
    const pagePerfCanvas = document.getElementById('pagePerformanceChart');
    if (pagePerfCanvas && typeof Chart !== 'undefined') {
      let existingChart = Chart.getChart(pagePerfCanvas);
      if (existingChart) existingChart.destroy();
      
      const ctx = pagePerfCanvas.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, 'rgba(16, 185, 129, 0.25)'); // Light green start
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');    // Transparent end
      
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Midterms'],
          datasets: [{
            label: 'CGPA',
            data: [7.2, 7.5, 7.8, 8.1, 8.5],
            borderColor: '#10b981', 
            borderWidth: 4,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4, 
            pointBackgroundColor: '#ffffff',
            pointBorderColor: '#10b981',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 14,
              titleFont: { family: 'Inter', size: 14 },
              bodyFont: { family: 'Inter', size: 16, weight: 'bold' },
              displayColors: false,
              callbacks: {
                label: function(context) { return context.parsed.y + ' CGPA'; }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false, drawBorder: false },
              ticks: { font: { family: 'Inter', size: 13 }, color: '#64748b', padding: 10 }
            },
            y: {
              min: 6.5,
              max: 9.0,
              grid: { color: '#e2e8f0', drawBorder: false, borderDash: [5, 5] },
              ticks: { font: { family: 'Inter', size: 13 }, color: '#64748b', stepSize: 0.5, padding: 10 }
            }
          },
          interaction: { intersect: false, mode: 'index' }
        }
      });
    }

    // 2. Render Subject Breakdown Grid
    const performanceData = [
      { name: 'Mathematics', score: 92, trend: 4, isPositive: true },
      { name: 'Algorithms', score: 88, trend: 2, isPositive: true },
      { name: 'Operating Sys', score: 82, trend: -1, isPositive: false },
      { name: 'Data Networks', score: 79, trend: 3, isPositive: true },
      { name: 'DBMS', score: 72, trend: -5, isPositive: false }
    ];

    let gridHtml = '';
    performanceData.forEach(subj => {
      const theme = getColorClass(subj.score);
      const trendIcon = subj.isPositive ? 'fa-arrow-trend-up text-green' : 'fa-arrow-trend-down text-orange';
      
      gridHtml += `
        <div class="card p-4 hover-lift bg-bg-main" style="border: 1px solid var(--border-light);">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-bold text-main opacity-90">${subj.name}</h4>
            <h3 class="text-xl font-bold" style="color: ${theme.color}">${subj.score}%</h3>
          </div>
          <div class="progress-bar-bg w-full mb-3" style="height: 6px;">
            <div class="progress-bar-fill" style="width: 0%; background-color: ${theme.color}; transition: width 1s ease-out;" data-perf-width="${subj.score}%"></div>
          </div>
          <div class="flex justify-between items-center text-xs font-semibold">
            <span class="text-muted">Rank: ${Math.max(1, Math.round(100 - subj.score))}th Pctl</span>
            <span class="text-muted"><i class="fa-solid ${trendIcon} mr-1"></i> ${Math.abs(subj.trend)}% ${subj.isPositive ? 'up' : 'down'}</span>
          </div>
        </div>
      `;
    });

    const gridContainer = document.getElementById('performance-subject-grid');
    if (gridContainer) {
      gridContainer.innerHTML = gridHtml;
      setTimeout(() => {
        document.querySelectorAll('#performance-subject-grid .progress-bar-fill').forEach(bar => {
          bar.style.width = bar.getAttribute('data-perf-width');
        });
      }, 50);
    }

    // 3. Render Insights List
    const insightsContainer = document.getElementById('performance-insights-list');
    if (insightsContainer) {
      insightsContainer.innerHTML = `
        <div class="p-4 bg-green-light rounded-md flex items-start gap-3 hover-lift cursor-default" style="border: 1px solid rgba(16, 185, 129, 0.2);">
          <div class="bg-green text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <i class="fa-solid fa-arrow-trend-up text-sm"></i>
          </div>
          <div>
            <p class="font-bold text-green text-sm">Strong Growth</p>
            <p class="text-sm font-medium text-main opacity-90 mt-1 leading-snug">Overall CGPA improved by 5% this semester (8.1 to 8.5).</p>
          </div>
        </div>

        <div class="p-4 bg-orange-light rounded-md flex items-start gap-3 hover-lift cursor-default mt-2" style="border: 1px solid rgba(245, 158, 11, 0.2);">
          <div class="bg-orange text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <i class="fa-solid fa-triangle-exclamation text-sm"></i>
          </div>
          <div>
            <p class="font-bold text-orange text-sm">Needs Attention</p>
            <p class="text-sm font-medium text-main opacity-90 mt-1 leading-snug">DBMS scores dropped 5% compared to Midterms. Review required.</p>
          </div>
        </div>

        <div class="p-4 bg-bg-main rounded-md flex items-start gap-3 hover-lift cursor-default mt-2" style="border: 1px solid var(--border-light);">
          <div class="bg-blue text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">
            <i class="fa-solid fa-medal text-sm"></i>
          </div>
          <div>
            <p class="font-bold text-blue text-sm">Consistent Performer</p>
            <p class="text-sm font-medium text-main opacity-90 mt-1 leading-snug">Mathematics remains your strongest subject holding above 90%.</p>
          </div>
        </div>
      `;
    }
  };
});
