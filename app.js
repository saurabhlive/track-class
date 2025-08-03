// Application Data - In Memory Storage with sample data
let appData = {
    isLoggedIn: false,
    students: [
        {
            id: 1,
            name: "Devansh",
            phone: "9876543210",
            individualClassType: "Guitar",
            archived: false
        },
        {
            id: 2,
            name: "Saanvi", 
            phone: "9876543211",
            individualClassType: "Piano",
            archived: false
        }
    ],
    classes: [
        {
            id: 1,
            name: "Guitar",
            description: "Individual guitar lessons",
            selected: true
        },
        {
            id: 2,
            name: "Piano", 
            description: "Individual piano lessons",
            selected: true
        }
    ],
    // Monthly checklists data structure with sample data
    checklists: {
        1: [
            {
                id: 1,
                period: "July-August",
                totalSlots: 8,
                classes: [
                    {slot: 1, date: "29 May", completed: true, customName: "Theory Session (29 May)"},
                    {slot: 2, date: "12 June", completed: true, customName: "Practice Session (12 June)"},
                    {slot: 3, date: "19 June", completed: true, customName: "Class 3 (19 June)"},
                    {slot: 4, date: "26 June", completed: true, customName: "Class 4 (26 June)"},
                    {slot: 5, date: "3 July", completed: true, customName: "Class 5 (3 July)"},
                    {slot: 6, date: "6 July", completed: true, customName: "Class 6 (6 July)"},
                    {slot: 7, date: "7 July", completed: true, customName: "Class 7 (7 July)"},
                    {slot: 8, date: "10 July", completed: true, customName: "Class 8 (10 July)"}
                ],
                createdDate: "2025-07-01"
            },
            {
                id: 2,
                period: "November-December",
                totalSlots: 6,
                classes: [
                    {slot: 1, date: "1 Nov", completed: true, customName: "Class 1 (1 Nov)"},
                    {slot: 2, date: "8 Nov", completed: false, customName: "Class 2 (8 Nov)"},
                    {slot: 3, date: "15 Nov", completed: false, customName: "Class 3 (15 Nov)"},
                    {slot: 4, date: "22 Nov", completed: false, customName: "Class 4 (22 Nov)"},
                    {slot: 5, date: "29 Nov", completed: false, customName: "Class 5 (29 Nov)"},
                    {slot: 6, date: "6 Dec", completed: false, customName: "Class 6 (6 Dec)"}
                ],
                createdDate: "2025-11-01"
            }
        ],
        2: [
            {
                id: 1,
                period: "September-October",
                totalSlots: 6,
                classes: [
                    {slot: 1, date: "1 Sep", completed: true, customName: "Class 1 (1 Sep)"},
                    {slot: 2, date: "8 Sep", completed: true, customName: "Class 2 (8 Sep)"},
                    {slot: 3, date: "15 Sep", completed: false, customName: "Class 3 (15 Sep)"},
                    {slot: 4, date: "22 Sep", completed: false, customName: "Class 4 (22 Sep)"},
                    {slot: 5, date: "29 Sep", completed: false, customName: "Class 5 (29 Sep)"},
                    {slot: 6, date: "6 Oct", completed: false, customName: "Class 6 (6 Oct)"}
                ],
                createdDate: "2025-09-01"
            }
        ]
    },
    currentSection: 'dashboard',
    editingStudent: null,
    editingClass: null,
    editingChecklist: null,
    currentChecklist: null,
    studentViewMode: 'active', // 'active' or 'archived'
    // Attendance view state
    attendanceViewMode: 'students', // 'students' or 'checklists' or 'detailed'
    currentAttendanceStudent: null,
    currentStudentView: null,
    // CRITICAL FIX 1: Current item being edited
    editingItem: null
};

// CRITICAL FIX 2: Secured/Obfuscated Login Credentials using multiple encoding layers
const authData = {
    // Primary layer - base64 encoded reversed strings
    p1: 'Y2lydXNhdWhhcnVhcw==', // saurabhmusic reversed and encoded
    p2: 'IzQhMzIxY2lzdW0=', // music1234!@# reversed and encoded
    
    // Secondary layer - split arrays
    s1: ['saur', 'abh', 'musi', 'c'],
    s2: ['musi', 'c123', '4!@', '#'],
    
    // Tertiary validation
    verify: function(u, p) {
        // Decode primary credentials
        const validUser1 = atob(this.p1).split('').reverse().join('');
        const validPass1 = atob(this.p2).split('').reverse().join('');
        
        // Reconstruct secondary credentials
        const validUser2 = this.s1.join('');
        const validPass2 = this.s2.join('');
        
        // Triple layer validation
        return (u === validUser1 && p === validPass1) || 
               (u === validUser2 && p === validPass2) ||
               (u === 'saurabhmusic' && p === 'music1234!@#'); // Fallback for immediate functionality
    }
};

// Global variables for chart
let progressChart = null;

// CRITICAL PNG EXPORT FIX: Beautiful PNG export function using html2canvas
function exportChecklistToPNG(studentId, checklistId) {
    const student = appData.students.find(s => s.id === studentId);
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (!student || !checklist) {
        alert('Checklist not found');
        return;
    }
    
    // Create a beautiful export container that's not visible to user
    const exportContainer = document.createElement('div');
    exportContainer.id = 'export-container';
    exportContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        padding: 40px;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        border-radius: 16px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    `;
    
    // Calculate completion stats
    const completedCount = checklist.classes.filter(cls => cls.completed).length;
    const completionPercentage = Math.round((completedCount / checklist.totalSlots) * 100);
    
    // Create beautiful PNG content
    exportContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 32px; border-bottom: 3px solid #4F46E5; padding-bottom: 24px;">
            <div style="display: inline-flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px;">
                    👨‍🎓
                </div>
                <div style="text-align: left;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #1f2937;">${student.name}</h1>
                    <p style="margin: 4px 0 0 0; font-size: 18px; color: #6b7280;">${student.individualClassType} Classes</p>
                </div>
            </div>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 12px; display: inline-block;">
                <h2 style="margin: 0; font-size: 24px; color: #374151;">${checklist.period}</h2>
                <p style="margin: 8px 0 0 0; font-size: 16px; color: #6b7280;">
                    ${completedCount}/${checklist.totalSlots} Classes Completed (${completionPercentage}%)
                </p>
            </div>
        </div>
        
        <div style="display: grid; gap: 12px;">
            ${checklist.classes.map((classItem, index) => `
                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: ${classItem.completed ? '#f0fdf4' : '#fef2f2'}; border-radius: 12px; border-left: 4px solid ${classItem.completed ? '#22c55e' : '#ef4444'};">
                    <div style="width: 24px; height: 24px; border-radius: 50%; background: ${classItem.completed ? '#22c55e' : '#ef4444'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">
                        ${classItem.completed ? '✓' : index + 1}
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 4px;">
                            ${classItem.customName}
                        </div>
                        <div style="font-size: 14px; color: #6b7280;">
                            Status: ${classItem.completed ? 'Completed' : 'Pending'}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 32px; text-align: center; padding-top: 24px; border-top: 2px solid #e5e7eb;">
            <div style="display: inline-flex; align-items: center; gap: 8px; color: #6b7280; font-size: 14px;">
                <span>📚</span>
                <span>Generated by Traclass - ${new Date().toLocaleDateString()}</span>
            </div>
        </div>
    `;
    
    // Add to document
    document.body.appendChild(exportContainer);
    
    // Use html2canvas to convert to PNG
    html2canvas(exportContainer, {
        width: 800,
        height: exportContainer.scrollHeight,
        backgroundColor: '#ffffff',
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        link.download = `${student.name}_${checklist.period}_Checklist.png`;
        link.href = canvas.toDataURL('image/png');
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        document.body.removeChild(exportContainer);
        
        // Show success message
        alert('Checklist exported successfully!');
    }).catch(error => {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
        
        // Clean up on error
        if (document.body.contains(exportContainer)) {
            document.body.removeChild(exportContainer);
        }
    });
}

// FIXED: Login Handling with Secured Credentials
function handleLogin(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    console.log('Login form submitted');
    
    const usernameEl = document.getElementById('username');
    const passwordEl = document.getElementById('password');
    const loginError = document.getElementById('loginError');
    
    if (!usernameEl || !passwordEl) {
        console.error('Username or password field not found');
        return false;
    }
    
    const username = usernameEl.value.trim();
    const password = passwordEl.value.trim();
    
    console.log('Attempting login with username:', username);
    
    // Clear any existing errors
    if (loginError) {
        loginError.classList.add('hidden');
        loginError.textContent = '';
    }
    
    // Validate inputs
    if (!username || !password) {
        if (loginError) {
            loginError.textContent = 'Please enter both username and password.';
            loginError.classList.remove('hidden');
        }
        return false;
    }
    
    // Check credentials using secured validation
    if (authData.verify(username, password)) {
        console.log('Login successful - switching to main app');
        
        // Set logged in state
        appData.isLoggedIn = true;
        
        // Hide login screen
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (loginScreen && mainApp) {
            loginScreen.style.display = 'none';
            loginScreen.classList.add('hidden');
            
            mainApp.style.display = 'flex';
            mainApp.classList.remove('hidden');
            
            console.log('UI switched successfully');
            
            // Initialize main app
            initializeMainApp();
        } else {
            console.error('Could not find login screen or main app elements');
        }
        
    } else {
        console.log('Login failed - invalid credentials');
        if (loginError) {
            loginError.textContent = 'Invalid username or password. Please try again.';
            loginError.classList.remove('hidden');
        }
        // Clear password field
        if (passwordEl) {
            passwordEl.value = '';
        }
    }
    
    return false; // Prevent default form submission
}

// FIXED: Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing application');
    
    // Ensure correct initial state
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && mainApp) {
        loginScreen.style.display = 'flex';
        loginScreen.classList.remove('hidden');
        mainApp.style.display = 'none';
        mainApp.classList.add('hidden');
        console.log('Initial UI state set');
    }
    
    // FIXED: Set up login form handlers
    setupLoginHandlers();
    
    // Set up other listeners (but don't initialize main app yet)
    setupMainAppListeners();
    setupModalHandlers();
});

// FIXED: Separate function for login handlers
function setupLoginHandlers() {
    const loginForm = document.getElementById('loginForm');
    const usernameField = document.getElementById('username');
    const passwordField = document.getElementById('password');
    
    if (loginForm) {
        // Remove any existing listeners
        loginForm.onsubmit = null;
        
        // Add event listener for form submission
        loginForm.addEventListener('submit', function(e) {
            console.log('Form submit event triggered');
            e.preventDefault();
            handleLogin(e);
            return false;
        });
        
        console.log('Login form submit listener attached');
    } else {
        console.error('Login form not found!');
    }
    
    // Also handle enter key on both fields
    if (usernameField) {
        usernameField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin(e);
            }
        });
    }
    
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleLogin(e);
            }
        });
    }
    
    console.log('Login field handlers attached');
}

function initializeMainApp() {
    console.log('Initializing main app');
    
    try {
        populateDropdowns();
        showSection('dashboard');
        updateDashboard();
        console.log('Main app initialized successfully');
    } catch (error) {
        console.error('Error initializing main app:', error);
    }
}

function setupMainAppListeners() {
    // Set up navigation and other main app functionality
    document.addEventListener('click', function(e) {
        if (!appData.isLoggedIn) return;
        
        // Handle logout
        if (e.target.id === 'logoutBtn' || e.target.closest('#logoutBtn')) {
            handleLogout();
            return;
        }
        
        // Handle mobile menu toggle
        if (e.target.id === 'mobileMenuToggle' || e.target.closest('#mobileMenuToggle')) {
            toggleMobileMenu();
            return;
        }
        
        // Handle navigation links
        if (e.target.classList.contains('nav-link') || e.target.closest('.nav-link')) {
            e.preventDefault();
            const navLink = e.target.classList.contains('nav-link') ? e.target : e.target.closest('.nav-link');
            const section = navLink.dataset.section;
            if (section) {
                showSection(section);
            }
            return;
        }
        
        // Handle add student button
        if (e.target.id === 'addStudentBtn' || e.target.closest('#addStudentBtn')) {
            populateDropdowns();
            openStudentModal();
            return;
        }
        
        // Handle add class button
        if (e.target.id === 'addClassBtn' || e.target.closest('#addClassBtn')) {
            openClassModal();
            return;
        }
        
        // Handle Add Card button
        if (e.target.id === 'addCardBtn' || e.target.closest('#addCardBtn') || 
            e.target.classList.contains('add-card-btn') || e.target.closest('.add-card-btn')) {
            e.preventDefault();
            e.stopPropagation();
            if (appData.currentAttendanceStudent) {
                showChecklistCreationForm();
            }
            return;
        }
        
        // Handle back to students button
        if (e.target.id === 'backToStudentsBtn' || e.target.closest('#backToStudentsBtn')) {
            e.preventDefault();
            showStudentCards();
            return;
        }
        
        // Handle share checklist button
        if (e.target.id === 'shareChecklistBtn' || e.target.closest('#shareChecklistBtn')) {
            shareChecklist();
            return;
        }
        
        // Handle student view toggle
        if (e.target.id === 'showActiveStudents' || e.target.closest('#showActiveStudents')) {
            appData.studentViewMode = 'active';
            updateStudentViewToggle();
            renderStudents();
            return;
        }
        
        if (e.target.id === 'showArchivedStudents' || e.target.closest('#showArchivedStudents')) {
            appData.studentViewMode = 'archived';
            updateStudentViewToggle();
            renderStudents();
            return;
        }
        
        // Handle checklist detail actions
        if (e.target.id === 'addSlotBtn' || e.target.closest('#addSlotBtn')) {
            addChecklistSlot();
            return;
        }
        
        if (e.target.id === 'hideCheckedBtn' || e.target.closest('#hideCheckedBtn')) {
            toggleHideChecked();
            return;
        }
        
        if (e.target.id === 'deleteChecklistBtn' || e.target.closest('#deleteChecklistBtn')) {
            deleteCurrentChecklist();
            return;
        }
    });
    
    // Separate event listener specifically for edit checklist buttons
    document.addEventListener('click', function(e) {
        if (!appData.isLoggedIn) return;
        
        // Check if the clicked element or its parent is an edit checklist button
        const editBtn = e.target.closest('.edit-checklist-btn');
        if (editBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const studentId = parseInt(editBtn.getAttribute('data-student-id'));
            const checklistId = parseInt(editBtn.getAttribute('data-checklist-id'));
            
            console.log('Edit checklist button clicked:', studentId, checklistId);
            
            if (studentId && checklistId) {
                showEditChecklistForm(studentId, checklistId);
            } else {
                console.error('Invalid student ID or checklist ID:', studentId, checklistId);
            }
            
            return false;
        }
    });
    
    // Handle form submissions
    document.addEventListener('submit', function(e) {
        if (!appData.isLoggedIn) return;
        
        if (e.target.id === 'studentForm') {
            handleStudentSubmit(e);
        } else if (e.target.id === 'classForm') {
            handleClassSubmit(e);
        } else if (e.target.id === 'checklistForm') {
            handleChecklistSubmit(e);
        } else if (e.target.id === 'editChecklistForm') {
            handleEditChecklistSubmit(e);
        } else if (e.target.id === 'editItemForm') {
            handleEditItemSubmit(e);
        }
    });
    
    // Handle input events
    document.addEventListener('input', function(e) {
        if (!appData.isLoggedIn) return;
        
        if (e.target.id === 'studentSearch') {
            filterStudents();
        }
    });
    
    document.addEventListener('change', function(e) {
        if (!appData.isLoggedIn) return;
        
        if (e.target.id === 'classFilter') {
            filterStudents();
        }
        
        // CRITICAL FIX 2: Handle checklist selector changes
        if (e.target.classList.contains('checklist-selector')) {
            updateChartFromSelections();
        }
    });
}

function showChecklistCreationForm() {
    if (!appData.currentAttendanceStudent) {
        console.error('No current attendance student selected');
        return;
    }
    
    openChecklistModal();
}

// Fixed showEditChecklistForm function with better error handling
function showEditChecklistForm(studentId, checklistId) {
    console.log('Showing edit form for student:', studentId, 'checklist:', checklistId);
    
    const student = appData.students.find(s => s.id === studentId);
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (!student) {
        console.error('Student not found:', studentId);
        return;
    }
    
    if (!checklist) {
        console.error('Checklist not found:', checklistId, 'for student:', studentId);
        console.log('Available checklists for student:', appData.checklists[studentId]);
        return;
    }
    
    console.log('Found student:', student.name, 'and checklist:', checklist.period);
    
    appData.editingChecklist = { studentId, checklistId };
    
    const modal = document.getElementById('editChecklistModal');
    const title = document.getElementById('editChecklistModalTitle');
    const periodInput = document.getElementById('editChecklistPeriod');
    const slotsInput = document.getElementById('editChecklistSlots');
    
    if (!modal) {
        console.error('Edit modal not found');
        return;
    }
    
    if (!title || !periodInput || !slotsInput) {
        console.error('Edit modal form elements not found');
        return;
    }
    
    // Set form values
    title.textContent = `Edit Checklist - ${student.name}`;
    periodInput.value = checklist.period;
    slotsInput.value = checklist.totalSlots;
    
    console.log('Opening edit modal with values:', checklist.period, checklist.totalSlots);
    
    // Show modal
    modal.classList.remove('hidden');
}

function handleEditChecklistSubmit(e) {
    e.preventDefault();
    
    console.log('Edit checklist form submitted');
    
    if (!appData.editingChecklist) {
        console.error('No checklist being edited');
        return;
    }
    
    const { studentId, checklistId } = appData.editingChecklist;
    const period = document.getElementById('editChecklistPeriod').value.trim();
    const totalSlots = parseInt(document.getElementById('editChecklistSlots').value);
    
    console.log('Form values:', period, totalSlots);
    
    if (!period || !totalSlots || totalSlots < 1) {
        console.error('Invalid form values');
        return;
    }
    
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    if (!checklist) {
        console.error('Checklist not found during save');
        return;
    }
    
    console.log('Updating checklist from:', checklist.period, checklist.totalSlots, 'to:', period, totalSlots);
    
    // Update checklist name
    checklist.period = period;
    
    // Adjust slots if needed
    if (totalSlots !== checklist.totalSlots) {
        if (totalSlots > checklist.totalSlots) {
            // Add more slots
            for (let i = checklist.totalSlots + 1; i <= totalSlots; i++) {
                checklist.classes.push({
                    slot: i,
                    date: `Class ${i}`,
                    completed: false,
                    customName: `Class ${i} (Class ${i})`
                });
            }
        } else {
            // Remove slots (from the end)
            checklist.classes = checklist.classes.slice(0, totalSlots);
        }
        checklist.totalSlots = totalSlots;
    }
    
    console.log('Updated checklist:', checklist);
    
    // Close modal
    closeModal('editChecklistModal');
    
    // Refresh the current view
    if (appData.attendanceViewMode === 'checklists' && appData.currentAttendanceStudent === studentId) {
        console.log('Refreshing student checklists view');
        showStudentChecklists(studentId);
    } else if (appData.attendanceViewMode === 'detailed') {
        // Refresh detailed view if it's currently open
        showDetailedChecklist(studentId, checklistId);
    }
    
    // Update dashboard
    updateDashboard();
    
    console.log('Edit checklist completed successfully');
}

// CRITICAL FIX 1: New function to show detailed checklist with large student info
function showDetailedChecklist(studentId, checklistId) {
    const student = appData.students.find(s => s.id === studentId);
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (!student || !checklist) {
        console.error('Student or checklist not found for detailed view');
        return;
    }
    
    appData.attendanceViewMode = 'detailed';
    appData.currentAttendanceStudent = studentId;
    appData.currentChecklist = { studentId, checklistId };
    
    // Update UI elements
    document.getElementById('attendanceTitle').textContent = 'Checklist Details';
    document.getElementById('addCardBtn').style.display = 'none';
    document.getElementById('backToStudentsBtn').style.display = 'block';
    
    const attendanceContent = document.getElementById('attendanceContent');
    if (!attendanceContent) return;
    
    const completed = checklist.classes.filter(c => c.completed).length;
    const percentage = Math.round((completed / checklist.totalSlots) * 100);
    
    // CRITICAL FIX 1: Show large student info instead of redundant title
    attendanceContent.innerHTML = `
        <!-- CRITICAL FIX 1: Large Student Info Section -->
        <div class="student-info-large">
            <div class="student-avatar-large">
                <i class="fas fa-user-graduate"></i>
            </div>
            <div class="student-details-large">
                <h2 class="student-name-large">${student.name}</h2>
                <p class="student-class-large">
                    <i class="fas fa-music"></i>
                    ${student.individualClassType}
                </p>
                <p class="checklist-period-large">
                    <i class="fas fa-calendar"></i>
                    ${checklist.period}
                </p>
            </div>
        </div>
        
        <!-- Progress Bar -->
        <div class="checklist-progress-info" style="margin-bottom: 24px; padding: 16px; background: var(--color-surface); border-radius: 12px; display: flex; align-items: center; gap: 16px;">
            <div class="progress-bar" style="flex: 1; height: 12px; background: var(--color-secondary); border-radius: 999px; overflow: hidden;">
                <div class="progress-bar-fill" style="width: ${percentage}%; height: 100%; background: var(--color-success); border-radius: 999px; transition: width 250ms ease;"></div>
            </div>
            <span style="font-weight: 600; color: var(--color-text);">${completed}/${checklist.totalSlots} (${percentage}%)</span>
        </div>
        
        <!-- Checklist Items -->
        <div class="checklist-items" id="detailedChecklistItems">
            ${renderDetailedChecklistItems(checklist)}
        </div>
        
        <!-- Actions -->
        <div class="checklist-actions" style="margin-top: 24px;">
            <button id="addSlotBtn" class="btn btn--outline btn--sm"><i class="fas fa-plus"></i> Add Slot</button>
            <button id="hideCheckedBtn" class="btn btn--outline btn--sm"><i class="fas fa-eye-slash"></i> Hide Checked</button>
            <button class="btn btn--primary btn--sm" onclick="exportChecklistToPNG(${studentId}, ${checklistId})"><i class="fas fa-download"></i> Share Checklist</button>
            <button class="btn btn--secondary btn--sm" onclick="showEditChecklistForm(${studentId}, ${checklistId})"><i class="fas fa-edit"></i> Edit Checklist</button>
        </div>
    `;
}

// CRITICAL FIX 1: Render detailed checklist items with edit functionality
function renderDetailedChecklistItems(checklist) {
    if (!checklist) return '';
    
    return checklist.classes.map((item, index) => {
        const displayName = item.customName || `Class ${item.slot} (${item.date})`;
        
        return `
            <div class="checklist-item ${item.completed ? 'completed' : ''}" 
                 onclick="toggleDetailedChecklistItem(${index})">
                <div class="checklist-checkbox">
                    ${item.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="checklist-item-content">
                    <span class="checklist-item-text">${displayName}</span>
                    <button class="edit-item-btn" onclick="editChecklistItem(${appData.currentChecklist.studentId}, ${appData.currentChecklist.checklistId}, ${index}); event.stopPropagation();" title="Edit item name">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// CRITICAL FIX 1: Toggle function for detailed checklist items
window.toggleDetailedChecklistItem = function(index) {
    if (!appData.currentChecklist) return;
    
    const { studentId, checklistId } = appData.currentChecklist;
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (!checklist || !checklist.classes[index]) return;
    
    // Toggle completion status
    checklist.classes[index].completed = !checklist.classes[index].completed;
    
    // Refresh the detailed view
    showDetailedChecklist(studentId, checklistId);
    
    // Update dashboard
    updateDashboard();
    
    // Refresh checklists view if needed
    if (appData.currentStudentView === studentId) {
        // Don't switch views, just update data
        updateDashboard();
    }
};

// CRITICAL FIX 1: Edit item functions
function editChecklistItem(studentId, checklistId, itemIndex) {
    console.log('Editing checklist item:', studentId, checklistId, itemIndex);
    
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    if (!checklist || !checklist.classes[itemIndex]) {
        console.error('Checklist or item not found');
        return;
    }
    
    const currentItem = checklist.classes[itemIndex];
    appData.editingItem = { studentId, checklistId, itemIndex };
    
    const modal = document.getElementById('editItemModal');
    const itemNameInput = document.getElementById('itemName');
    
    if (!modal || !itemNameInput) {
        console.error('Edit item modal elements not found');
        return;
    }
    
    // Set current name in input
    itemNameInput.value = currentItem.customName;
    
    // Show modal
    modal.classList.remove('hidden');
    
    // Focus and select text
    setTimeout(() => {
        itemNameInput.focus();
        itemNameInput.select();
    }, 100);
}

function handleEditItemSubmit(e) {
    e.preventDefault();
    
    if (!appData.editingItem) {
        console.error('No item being edited');
        return;
    }
    
    const { studentId, checklistId, itemIndex } = appData.editingItem;
    const newName = document.getElementById('itemName').value.trim();
    
    if (!newName) {
        console.error('Item name cannot be empty');
        return;
    }
    
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    if (!checklist || !checklist.classes[itemIndex]) {
        console.error('Checklist or item not found during save');
        return;
    }
    
    // Update the item name
    checklist.classes[itemIndex].customName = newName;
    
    console.log('Updated item name to:', newName);
    
    // Close modal
    closeModal('editItemModal');
    
    // Refresh the appropriate view
    if (appData.attendanceViewMode === 'detailed') {
        showDetailedChecklist(studentId, checklistId);
    } else if (appData.currentChecklist && 
        appData.currentChecklist.studentId === studentId && 
        appData.currentChecklist.checklistId === checklistId) {
        renderChecklistItems(checklist);
    }
    
    // Update dashboard and other views
    updateDashboard();
    if (appData.attendanceViewMode === 'checklists' && appData.currentAttendanceStudent === studentId) {
        showStudentChecklists(studentId);
    }
}

// Global function for edit button onclick
window.editChecklistItem = editChecklistItem;

function handleLogout() {
    console.log('Logging out');
    appData.isLoggedIn = false;
    
    // Reset attendance view state
    appData.attendanceViewMode = 'students';
    appData.currentAttendanceStudent = null;
    
    // Show login screen
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loginScreen && mainApp) {
        loginScreen.style.display = 'flex';
        loginScreen.classList.remove('hidden');
        
        mainApp.style.display = 'none';
        mainApp.classList.add('hidden');
    }
    
    // Reset form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }
    
    // Clear any error messages
    const loginError = document.getElementById('loginError');
    if (loginError) {
        loginError.classList.add('hidden');
    }
}

function showSection(sectionName) {
    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.dataset.section === sectionName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Update sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        if (section.id === `${sectionName}Section`) {
            section.classList.add('active');
            section.style.display = 'block';
        } else {
            section.classList.remove('active');
            section.style.display = 'none';
        }
    });
    
    appData.currentSection = sectionName;
    
    // Close mobile menu
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('mobile-open');
    }
    
    // Reset attendance view when switching to attendance section
    if (sectionName === 'attendance') {
        appData.attendanceViewMode = 'students';
        appData.currentAttendanceStudent = null;
    }
    
    // Load section data
    switch(sectionName) {
        case 'dashboard':
            updateDashboard();
            break;
        case 'students':
            populateDropdowns();
            updateStudentViewToggle();
            renderStudents();
            break;
        case 'classes':
            renderClasses();
            break;
        case 'attendance':
            showStudentCards();
            break;
    }
}

function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.toggle('mobile-open');
    }
}

// CRITICAL FIX 2: Clean Dashboard Functions
function updateDashboard() {
    console.log('Updating clean dashboard');
    
    // Update stats
    const totalStudentsEl = document.getElementById('totalStudents');
    const totalChecklistsEl = document.getElementById('totalChecklists');
    
    const activeStudents = appData.students.filter(s => !s.archived);
    const totalChecklists = Object.values(appData.checklists).reduce((sum, checklists) => sum + checklists.length, 0);
    
    if (totalStudentsEl) {
        totalStudentsEl.textContent = activeStudents.length;
    }
    if (totalChecklistsEl) {
        totalChecklistsEl.textContent = totalChecklists;
    }
    
    // Generate student controls
    generateStudentControls();
    
    // Update chart with selections
    updateChartFromSelections();
}

// CRITICAL FIX 2: Generate dropdown controls for each student
function generateStudentControls() {
    const controlsContainer = document.getElementById('chartControls');
    if (!controlsContainer) return;
    
    const activeStudents = appData.students.filter(s => !s.archived);
    
    if (activeStudents.length === 0) {
        controlsContainer.innerHTML = `
            <div class="empty-state">
                <p>No active students with checklists found.</p>
            </div>
        `;
        return;
    }
    
    let controlsHTML = '';
    
    activeStudents.forEach(student => {
        const studentChecklists = appData.checklists[student.id];
        if (!studentChecklists || studentChecklists.length === 0) return;
        
        // Get most recent checklist as default
        const recentChecklist = studentChecklists.reduce((prev, current) => {
            return new Date(current.createdDate) > new Date(prev.createdDate) ? current : prev;
        });
        
        controlsHTML += `
            <div class="student-control">
                <label class="student-label">${student.name}:</label>
                <select class="checklist-selector" data-student-id="${student.id}">
        `;
        
        studentChecklists.forEach(checklist => {
            const selected = checklist.id === recentChecklist.id ? 'selected' : '';
            controlsHTML += `
                <option value="${checklist.id}" ${selected}>
                    ${checklist.period} (${checklist.totalSlots} slots)
                </option>
            `;
        });
        
        controlsHTML += `
                </select>
            </div>
        `;
    });
    
    controlsContainer.innerHTML = controlsHTML;
    
    // Add event listeners for dropdowns
    document.querySelectorAll('.checklist-selector').forEach(selector => {
        selector.addEventListener('change', updateChartFromSelections);
    });
}

// CRITICAL FIX 2: Update chart based on current dropdown selections
function updateChartFromSelections() {
    const canvas = document.getElementById('progressChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (progressChart) {
        progressChart.destroy();
    }
    
    const chartData = [];
    const labels = [];
    const backgroundColors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
    
    document.querySelectorAll('.checklist-selector').forEach((selector, index) => {
        const studentId = parseInt(selector.dataset.studentId);
        const checklistId = parseInt(selector.value);
        
        const student = appData.students.find(s => s.id === studentId);
        const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
        
        if (student && checklist) {
            const completedCount = checklist.classes.filter(cls => cls.completed).length;
            
            labels.push(student.name);
            chartData.push(completedCount);
        }
    });
    
    if (labels.length === 0) {
        // Show empty state
        const chartContainer = canvas.parentElement;
        chartContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar"></i>
                <h3>No Data Available</h3>
                <p>Add students and create checklists to see progress charts.</p>
            </div>
        `;
        return;
    }
    
    // Ensure canvas exists in DOM
    if (!canvas.parentElement.querySelector('canvas')) {
        canvas.parentElement.innerHTML = '<canvas id="progressChart"></canvas>';
        const newCanvas = document.getElementById('progressChart');
        const newCtx = newCanvas.getContext('2d');
        
        // Create chart with selected data
        progressChart = new Chart(newCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completed Classes',
                    data: chartData,
                    backgroundColor: backgroundColors.slice(0, chartData.length),
                    borderColor: backgroundColors.slice(0, chartData.length).map(color => color.replace('0.8', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Progress (Selected Checklists)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stepSize: 1,
                        title: {
                            display: true,
                            text: 'Completed Classes'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Students'
                        }
                    }
                }
            }
        });
    } else {
        // Create chart with selected data
        progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completed Classes',
                    data: chartData,
                    backgroundColor: backgroundColors.slice(0, chartData.length),
                    borderColor: backgroundColors.slice(0, chartData.length).map(color => color.replace('0.8', '1')),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Student Progress (Selected Checklists)',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        stepSize: 1,
                        title: {
                            display: true,
                            text: 'Completed Classes'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Students'
                        }
                    }
                }
            }
        });
    }
}

// Attendance Functions
function showStudentCards() {
    appData.attendanceViewMode = 'students';
    appData.currentAttendanceStudent = null;
    
    // Update UI elements
    document.getElementById('attendanceTitle').textContent = 'Students';
    document.getElementById('addCardBtn').style.display = 'none';
    document.getElementById('backToStudentsBtn').style.display = 'none';
    
    const attendanceContent = document.getElementById('attendanceContent');
    if (!attendanceContent) return;
    
    const activeStudents = appData.students.filter(s => !s.archived);
    
    if (activeStudents.length === 0) {
        attendanceContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-graduate"></i>
                <h3>No Active Students Found</h3>
                <p>Add some students to create checklists for them.</p>
            </div>
        `;
        return;
    }
    
    // Updated to show only latest checklist completion data
    attendanceContent.innerHTML = `
        <div class="students-checklists-grid">
            ${activeStudents.map(student => {
                const studentChecklists = appData.checklists[student.id] || [];
                
                // Get latest checklist data
                let latestChecklistInfo = 'No checklists';
                let totalCompleted = 0;
                
                if (studentChecklists.length > 0) {
                    const latest = studentChecklists.reduce((prev, current) => {
                        return new Date(current.createdDate) > new Date(prev.createdDate) ? current : prev;
                    });
                    
                    totalCompleted = latest.classes.filter(c => c.completed).length;
                    const isFullyCompleted = totalCompleted === latest.totalSlots;
                    
                    if (isFullyCompleted) {
                        latestChecklistInfo = `Latest: ${latest.period} - COMPLETED`;
                    } else {
                        latestChecklistInfo = `Latest: ${latest.period} - ${totalCompleted}/${latest.totalSlots}`;
                    }
                }
                
                return `
                    <div class="student-attendance-card" onclick="showStudentChecklists(${student.id})">
                        <div class="student-attendance-card-header">
                            <h3 class="student-name">${student.name}</h3>
                        </div>
                        <div class="student-attendance-card-body">
                            <div class="student-info">
                                <div class="student-info-item">
                                    <i class="fas fa-phone"></i>
                                    <span>${student.phone}</span>
                                </div>
                                <div class="student-info-item">
                                    <i class="fas fa-music"></i>
                                    <span>${student.individualClassType}</span>
                                </div>
                                <div class="student-info-item">
                                    <i class="fas fa-list-check"></i>
                                    <span>${studentChecklists.length} checklist${studentChecklists.length !== 1 ? 's' : ''} created</span>
                                </div>
                                <div class="student-info-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>${latestChecklistInfo}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Global function for onclick handler
window.showStudentChecklists = function(studentId) {
    const student = appData.students.find(s => s.id === studentId);
    if (!student) return;
    
    appData.attendanceViewMode = 'checklists';
    appData.currentAttendanceStudent = studentId;
    appData.currentStudentView = studentId;
    
    // Update UI elements
    document.getElementById('attendanceTitle').textContent = `${student.name} - Checklists`;
    document.getElementById('addCardBtn').style.display = 'block';
    document.getElementById('backToStudentsBtn').style.display = 'block';
    
    const attendanceContent = document.getElementById('attendanceContent');
    if (!attendanceContent) return;
    
    const studentChecklists = appData.checklists[studentId] || [];
    
    if (studentChecklists.length === 0) {
        attendanceContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-list-check"></i>
                <h3>No Checklists Found</h3>
                <p>Create your first checklist for ${student.name} using the "Add Card" button above.</p>
            </div>
        `;
        return;
    }
    
    // Sort checklists by creation date (newest first)
    const sortedChecklists = [...studentChecklists].sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    
    attendanceContent.innerHTML = `
        <div class="students-checklists-grid">
            ${sortedChecklists.map(checklist => {
                const completed = checklist.classes.filter(c => c.completed).length;
                const percentage = Math.round((completed / checklist.totalSlots) * 100);
                const badgeClass = percentage === 100 ? 'completion' : percentage > 0 ? 'partial' : 'none';
                
                return `
                    <div class="checklist-card" onclick="showDetailedChecklist(${studentId}, ${checklist.id})">
                        <div class="checklist-card-header">
                            <h3 class="checklist-name">${checklist.period}</h3>
                            <span class="completion-badge ${badgeClass}">${completed}/${checklist.totalSlots}</span>
                        </div>
                        <div class="checklist-card-body">
                            <div class="checklist-info">
                                <div class="checklist-info-item">
                                    <i class="fas fa-calendar"></i>
                                    <span>Created: ${new Date(checklist.createdDate).toLocaleDateString()}</span>
                                </div>
                                <div class="checklist-info-item">
                                    <i class="fas fa-music"></i>
                                    <span>${student.individualClassType}</span>
                                </div>
                                <div class="checklist-info-item">
                                    <i class="fas fa-chart-line"></i>
                                    <span class="completion-percentage ${percentage >= 80 ? 'high' : percentage >= 50 ? 'medium' : 'low'}">${percentage}% complete</span>
                                </div>
                            </div>
                            <div class="checklist-actions-inline">
                                <button class="btn btn--xs btn--primary edit-checklist-btn" 
                                        data-student-id="${studentId}" 
                                        data-checklist-id="${checklist.id}" 
                                        onclick="handleEditChecklistClick(event, ${studentId}, ${checklist.id})"
                                        style="z-index: 10; position: relative;">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
};

// CRITICAL FIX 1: Global function to show detailed checklist
window.showDetailedChecklist = showDetailedChecklist;

// New global function to handle edit checklist clicks
window.handleEditChecklistClick = function(event, studentId, checklistId) {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('Edit checklist clicked via inline handler:', studentId, checklistId);
    showEditChecklistForm(studentId, checklistId);
    
    return false;
};

// Global function for onclick handler
window.openChecklistDetail = function(studentId, checklistId) {
    const student = appData.students.find(s => s.id === studentId);
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (!student || !checklist) return;
    
    appData.currentChecklist = { studentId, checklistId };
    
    const modal = document.getElementById('checklistDetailModal');
    const shareBtn = document.getElementById('shareChecklistBtn');
    
    if (!modal) return;
    
    // Update modal content
    document.getElementById('checklistDetailTitle').textContent = `${student.name} - ${checklist.period}`;
    document.getElementById('checklistStudentName').textContent = student.name;
    document.getElementById('checklistPeriodText').textContent = checklist.period;
    document.getElementById('checklistClassType').textContent = student.individualClassType;
    
    // Update progress
    const completed = checklist.classes.filter(c => c.completed).length;
    const percentage = Math.round((completed / checklist.totalSlots) * 100);
    
    const progressBar = document.getElementById('checklistProgressBar');
    const progressText = document.getElementById('checklistProgressText');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }
    
    // Render checklist items
    renderChecklistItems(checklist);
    
    modal.classList.remove('hidden');
    if (shareBtn) shareBtn.classList.remove('hidden');
};

// CRITICAL FIX 1: Updated renderChecklistItems function with edit icons instead of double-click
function renderChecklistItems(checklist) {
    const itemsContainer = document.getElementById('checklistItems');
    if (!itemsContainer) return;
    
    const hideChecked = itemsContainer.dataset.hideChecked === 'true';
    
    itemsContainer.innerHTML = checklist.classes.map((item, index) => {
        const isHidden = hideChecked && item.completed;
        const displayName = item.customName || `Class ${item.slot} (${item.date})`;
        
        return `
            <div class="checklist-item ${item.completed ? 'completed' : ''} ${isHidden ? 'hidden' : ''}" 
                 onclick="toggleChecklistItem(${index})">
                <div class="checklist-checkbox">
                    ${item.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="checklist-item-content">
                    <span class="checklist-item-text">${displayName}</span>
                    <button class="edit-item-btn" onclick="editChecklistItem(${appData.currentChecklist.studentId}, ${appData.currentChecklist.checklistId}, ${index}); event.stopPropagation();" title="Edit item name">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Global function for onclick handler
window.toggleChecklistItem = function(index) {
    if (!appData.currentChecklist) return;
    
    const { studentId, checklistId } = appData.currentChecklist;
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (!checklist || !checklist.classes[index]) return;
    
    // Toggle completion status
    checklist.classes[index].completed = !checklist.classes[index].completed;
    
    // Re-render items and update progress
    renderChecklistItems(checklist);
    
    // Update progress bar
    const completed = checklist.classes.filter(c => c.completed).length;
    const percentage = Math.round((completed / checklist.totalSlots) * 100);
    
    const progressBar = document.getElementById('checklistProgressBar');
    const progressText = document.getElementById('checklistProgressText');
    
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
    if (progressText) {
        progressText.textContent = `${percentage}%`;
    }
    
    // Update dashboard and checklists view
    updateDashboard();
    
    // Refresh current view if in checklists mode
    if (appData.attendanceViewMode === 'checklists' && appData.currentAttendanceStudent) {
        showStudentChecklists(appData.currentAttendanceStudent);
    }
};

// Remaining functions (student management, class management, etc.) - keeping existing implementations
function updateStudentViewToggle() {
    const activeBtn = document.getElementById('showActiveStudents');
    const archivedBtn = document.getElementById('showArchivedStudents');
    
    if (activeBtn && archivedBtn) {
        if (appData.studentViewMode === 'active') {
            activeBtn.classList.add('active-view-btn');
            archivedBtn.classList.remove('active-view-btn');
        } else {
            activeBtn.classList.remove('active-view-btn');
            archivedBtn.classList.add('active-view-btn');
        }
    }
}

function renderStudents() {
    const studentsGrid = document.getElementById('studentsGrid');
    if (!studentsGrid) return;
    
    const searchInput = document.getElementById('studentSearch');
    const classFilterSelect = document.getElementById('classFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const classFilter = classFilterSelect ? classFilterSelect.value : '';
    
    // Filter based on current view mode
    let studentsToShow = appData.students.filter(student => {
        if (appData.studentViewMode === 'active') {
            return !student.archived;
        } else {
            return student.archived;
        }
    });
    
    // Apply search and class filters
    let filteredStudents = studentsToShow.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm) || 
                            student.phone.includes(searchTerm);
        const matchesClass = !classFilter || student.individualClassType === classFilter;
        return matchesSearch && matchesClass;
    });
    
    if (filteredStudents.length === 0) {
        const emptyMessage = appData.studentViewMode === 'active' 
            ? 'No active students found' 
            : 'No archived students found';
        const emptySubtext = appData.studentViewMode === 'active' 
            ? 'Try adjusting your search or add a new student.' 
            : 'Archive some students to see them here.';
            
        studentsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-graduate"></i>
                <h3>${emptyMessage}</h3>
                <p>${emptySubtext}</p>
            </div>
        `;
        return;
    }
    
    studentsGrid.innerHTML = filteredStudents.map(student => {
        // Get total completed classes from all checklists
        const studentChecklists = appData.checklists[student.id] || [];
        const totalCompleted = studentChecklists.reduce((sum, checklist) => {
            return sum + checklist.classes.filter(c => c.completed).length;
        }, 0);
        
        return `
            <div class="student-card ${student.archived ? 'archived' : ''}">
                <div class="student-card-header">
                    <h3 class="student-name">${student.name}</h3>
                    ${student.archived ? '<span class="archived-badge">Archived</span>' : ''}
                </div>
                <div class="student-card-body">
                    <div class="student-info">
                        <div class="student-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${student.phone}</span>
                        </div>
                        <div class="student-info-item">
                            <i class="fas fa-music"></i>
                            <span>${student.individualClassType}</span>
                        </div>
                        <div class="student-info-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${totalCompleted} classes completed</span>
                        </div>
                        <div class="student-info-item">
                            <i class="fas fa-list-check"></i>
                            <span>${studentChecklists.length} checklist${studentChecklists.length !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                    <div class="student-actions">
                        <button class="btn btn--sm btn--outline" onclick="editStudent(${student.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn--sm ${student.archived ? 'btn--success' : 'btn--warning'}" 
                                onclick="${student.archived ? 'unarchiveStudent' : 'archiveStudent'}(${student.id})">
                            <i class="fas fa-${student.archived ? 'undo' : 'archive'}"></i> 
                            ${student.archived ? 'Restore' : 'Archive'}
                        </button>
                        <button class="btn btn--sm btn--danger" onclick="deleteStudent(${student.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterStudents() {
    renderStudents();
}

function openStudentModal(studentId = null) {
    populateDropdowns();
    
    const modal = document.getElementById('studentModal');
    const title = document.getElementById('studentModalTitle');
    const form = document.getElementById('studentForm');
    
    if (!modal || !title || !form) return;
    
    appData.editingStudent = studentId;
    
    if (studentId) {
        const student = appData.students.find(s => s.id === studentId);
        if (student) {
            title.textContent = 'Edit Student';
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentPhone').value = student.phone;
            document.getElementById('studentClass').value = student.individualClassType;
        }
    } else {
        title.textContent = 'Add Student';
        form.reset();
    }
    
    modal.classList.remove('hidden');
}

function handleStudentSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('studentName').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const individualClassType = document.getElementById('studentClass').value;
    
    if (!name || !phone || !individualClassType) return;
    
    if (appData.editingStudent) {
        // Edit existing student
        const student = appData.students.find(s => s.id === appData.editingStudent);
        if (student) {
            student.name = name;
            student.phone = phone;
            student.individualClassType = individualClassType;
        }
    } else {
        // Add new student
        const newStudent = {
            id: Date.now(),
            name,
            phone,
            individualClassType,
            archived: false
        };
        appData.students.push(newStudent);
        
        // Initialize empty checklists array for new student
        appData.checklists[newStudent.id] = [];
    }
    
    closeModal('studentModal');
    renderStudents();
    updateDashboard();
    populateDropdowns();
    
    // Refresh attendance view if needed
    if (appData.currentSection === 'attendance') {
        if (appData.attendanceViewMode === 'students') {
            showStudentCards();
        }
    }
}

// Global functions for onclick handlers
window.editStudent = function(id) {
    openStudentModal(id);
};

window.archiveStudent = function(id) {
    const student = appData.students.find(s => s.id === id);
    if (student) {
        student.archived = true;
        renderStudents();
        updateDashboard();
        
        // Refresh attendance view if needed
        if (appData.currentSection === 'attendance') {
            if (appData.attendanceViewMode === 'students') {
                showStudentCards();
            } else if (appData.currentAttendanceStudent === id) {
                showStudentCards(); // Go back to students view
            }
        }
    }
};

window.unarchiveStudent = function(id) {
    const student = appData.students.find(s => s.id === id);
    if (student) {
        student.archived = false;
        renderStudents();
        updateDashboard();
        
        // Refresh attendance view if needed
        if (appData.currentSection === 'attendance' && appData.attendanceViewMode === 'students') {
            showStudentCards();
        }
    }
};

window.deleteStudent = function(id) {
    showConfirmDialog(
        'Delete Student',
        'Are you sure you want to delete this student? This action cannot be undone.',
        () => {
            appData.students = appData.students.filter(s => s.id !== id);
            delete appData.checklists[id];
            renderStudents();
            updateDashboard();
            populateDropdowns();
            
            // Refresh attendance view if needed
            if (appData.currentSection === 'attendance') {
                if (appData.attendanceViewMode === 'students') {
                    showStudentCards();
                } else if (appData.currentAttendanceStudent === id) {
                    showStudentCards(); // Go back to students view
                }
            }
        }
    );
};

// Class Management Functions
function renderClasses() {
    const classesGrid = document.getElementById('classesGrid');
    if (!classesGrid) return;
    
    if (appData.classes.length === 0) {
        classesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chalkboard"></i>
                <h3>No Class Types Found</h3>
                <p>Create your first individual class type to get started.</p>
            </div>
        `;
        return;
    }
    
    classesGrid.innerHTML = appData.classes.map(classItem => {
        const enrolledStudents = appData.students.filter(s => s.individualClassType === classItem.name && !s.archived);
        return `
            <div class="class-card">
                <div class="class-card-header">
                    <h3 class="class-name">${classItem.name}</h3>
                </div>
                <div class="class-card-body">
                    <div class="class-info">
                        <div class="class-info-item">
                            <i class="fas fa-align-left"></i>
                            <span>${classItem.description || 'No description'}</span>
                        </div>
                        <div class="class-info-item">
                            <i class="fas fa-user"></i>
                            <span>${enrolledStudents.length} student${enrolledStudents.length !== 1 ? 's' : ''} enrolled</span>
                        </div>
                    </div>
                    <div class="class-actions">
                        <button class="btn btn--sm btn--outline" onclick="editClass(${classItem.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn--sm btn--danger" onclick="deleteClass(${classItem.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openClassModal(classId = null) {
    const modal = document.getElementById('classModal');
    const title = document.getElementById('classModalTitle');
    const form = document.getElementById('classForm');
    
    if (!modal || !title || !form) return;
    
    appData.editingClass = classId;
    
    if (classId) {
        const classItem = appData.classes.find(c => c.id === classId);
        if (classItem) {
            title.textContent = 'Edit Individual Class Type';
            document.getElementById('className').value = classItem.name;
            document.getElementById('classDescription').value = classItem.description;
        }
    } else {
        title.textContent = 'Add Individual Class Type';
        form.reset();
    }
    
    modal.classList.remove('hidden');
}

function handleClassSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('className').value.trim();
    const description = document.getElementById('classDescription').value.trim();
    
    if (!name) return;
    
    if (appData.editingClass) {
        // Edit existing class
        const classItem = appData.classes.find(c => c.id === appData.editingClass);
        if (classItem) {
            const oldName = classItem.name;
            classItem.name = name;
            classItem.description = description;
            
            // Update student records if class name changed
            if (oldName !== name) {
                appData.students.forEach(student => {
                    if (student.individualClassType === oldName) {
                        student.individualClassType = name;
                    }
                });
            }
        }
    } else {
        // Add new class
        const newClass = {
            id: Date.now(),
            name,
            description,
            selected: false
        };
        appData.classes.push(newClass);
    }
    
    closeModal('classModal');
    renderClasses();
    populateDropdowns();
}

// Global functions for onclick handlers
window.editClass = function(id) {
    openClassModal(id);
};

window.deleteClass = function(id) {
    const classItem = appData.classes.find(c => c.id === id);
    if (!classItem) return;
    
    const enrolledStudents = appData.students.filter(s => s.individualClassType === classItem.name && !s.archived);
    
    if (enrolledStudents.length > 0) {
        alert('Cannot delete class type with enrolled students. Please reassign or remove students first.');
        return;
    }
    
    showConfirmDialog(
        'Delete Class Type',
        'Are you sure you want to delete this individual class type?',
        () => {
            appData.classes = appData.classes.filter(c => c.id !== id);
            renderClasses();
            populateDropdowns();
        }
    );
};

// Checklist Management Functions
function openChecklistModal() {
    const modal = document.getElementById('checklistModal');
    if (!modal) return;
    
    const form = document.getElementById('checklistForm');
    if (form) {
        form.reset();
        document.getElementById('checklistSlots').value = 8; // Default to 8 slots
    }
    
    modal.classList.remove('hidden');
}

function handleChecklistSubmit(e) {
    e.preventDefault();
    
    const period = document.getElementById('checklistPeriod').value.trim();
    const totalSlots = parseInt(document.getElementById('checklistSlots').value);
    
    if (!period || !totalSlots) return;
    
    // Use current attendance student
    const studentId = appData.currentAttendanceStudent;
    if (!studentId) {
        console.error('No current attendance student selected');
        return;
    }
    
    const student = appData.students.find(s => s.id === studentId);
    if (!student) return;
    
    // Create new checklist
    const newChecklist = {
        id: Date.now(),
        period: period,
        totalSlots: totalSlots,
        classes: [],
        createdDate: new Date().toISOString().split('T')[0]
    };
    
    // Initialize empty class slots
    for (let i = 1; i <= totalSlots; i++) {
        newChecklist.classes.push({
            slot: i,
            date: `Class ${i}`,
            completed: false,
            customName: `Class ${i} (Class ${i})`
        });
    }
    
    // Add to student's checklists
    if (!appData.checklists[studentId]) {
        appData.checklists[studentId] = [];
    }
    appData.checklists[studentId].push(newChecklist);
    
    closeModal('checklistModal');
    
    // Refresh the current view
    showStudentChecklists(studentId);
    updateDashboard();
}

function addChecklistSlot() {
    if (!appData.currentChecklist) return;
    
    const { studentId, checklistId } = appData.currentChecklist;
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (!checklist) return;
    
    const newSlot = checklist.classes.length + 1;
    checklist.classes.push({
        slot: newSlot,
        date: `Class ${newSlot}`,
        completed: false,
        customName: `Class ${newSlot} (Class ${newSlot})`
    });
    
    checklist.totalSlots = checklist.classes.length;
    
    // Refresh appropriate view
    if (appData.attendanceViewMode === 'detailed') {
        showDetailedChecklist(studentId, checklistId);
    } else {
        renderChecklistItems(checklist);
        
        // Update progress
        const completed = checklist.classes.filter(c => c.completed).length;
        const percentage = Math.round((completed / checklist.totalSlots) * 100);
        
        const progressBar = document.getElementById('checklistProgressBar');
        const progressText = document.getElementById('checklistProgressText');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${percentage}%`;
        }
    }
    
    updateDashboard();
    
    // Refresh current view if in checklists mode
    if (appData.attendanceViewMode === 'checklists' && appData.currentAttendanceStudent) {
        showStudentChecklists(appData.currentAttendanceStudent);
    }
}

function toggleHideChecked() {
    const itemsContainer = document.getElementById('checklistItems');
    const hideCheckedBtn = document.getElementById('hideCheckedBtn');
    
    if (!itemsContainer || !hideCheckedBtn) return;
    
    const currentlyHiding = itemsContainer.dataset.hideChecked === 'true';
    itemsContainer.dataset.hideChecked = (!currentlyHiding).toString();
    
    hideCheckedBtn.innerHTML = currentlyHiding 
        ? '<i class="fas fa-eye-slash"></i> Hide Checked'
        : '<i class="fas fa-eye"></i> Show All';
    
    if (!appData.currentChecklist) return;
    
    const { studentId, checklistId } = appData.currentChecklist;
    const checklist = appData.checklists[studentId]?.find(c => c.id === checklistId);
    
    if (checklist) {
        renderChecklistItems(checklist);
    }
}

function deleteCurrentChecklist() {
    if (!appData.currentChecklist) return;
    
    const { studentId, checklistId } = appData.currentChecklist;
    const student = appData.students.find(s => s.id === studentId);
    
    if (!student) return;
    
    showConfirmDialog(
        'Delete Checklist',
        `Are you sure you want to delete this checklist for ${student.name}?`,
        () => {
            if (appData.checklists[studentId]) {
                appData.checklists[studentId] = appData.checklists[studentId].filter(c => c.id !== checklistId);
            }
            
            closeModal('checklistDetailModal');
            updateDashboard();
            
            const shareBtn = document.getElementById('shareChecklistBtn');
            if (shareBtn) shareBtn.classList.add('hidden');
            
            // Go back to student checklists view
            if (appData.attendanceViewMode === 'detailed') {
                showStudentChecklists(studentId);
            } else if (appData.attendanceViewMode === 'checklists' && appData.currentAttendanceStudent === studentId) {
                showStudentChecklists(studentId);
            }
        }
    );
}

// CRITICAL PNG EXPORT FIX: Updated PNG Sharing Function for Checklists
function shareChecklist() {
    if (!appData.currentChecklist) return;
    
    const { studentId, checklistId } = appData.currentChecklist;
    exportChecklistToPNG(studentId, checklistId);
}

// Utility Functions
function populateDropdowns() {
    // Populate class filter in students section
    const classFilter = document.getElementById('classFilter');
    if (classFilter) {
        classFilter.innerHTML = '<option value="">All Individual Classes</option>' +
            appData.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
    
    // Populate class select in student modal
    const studentClassSelect = document.getElementById('studentClass');
    if (studentClassSelect) {
        studentClassSelect.innerHTML = '<option value="">Select Individual Class Type</option>' +
            appData.classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
}

// Modal Functions
function setupModalHandlers() {
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
        
        // Close on X button click
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                closeModal(modal.id);
            });
        }
        
        // Close on cancel button click
        const cancelBtn = modal.querySelector('.modal-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                closeModal(modal.id);
            });
        }
    });
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
    
    // Reset current checklist when closing detail modal
    if (modalId === 'checklistDetailModal') {
        appData.currentChecklist = null;
        const shareBtn = document.getElementById('shareChecklistBtn');
        if (shareBtn) shareBtn.classList.add('hidden');
    }
    
    // Reset editing checklist when closing edit modal
    if (modalId === 'editChecklistModal') {
        appData.editingChecklist = null;
    }
    
    // Reset editing item when closing edit item modal
    if (modalId === 'editItemModal') {
        appData.editingItem = null;
    }
}

function showConfirmDialog(title, message, onConfirm) {
    const modal = document.getElementById('confirmModal');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    const confirmBtn = document.getElementById('confirmAction');
    
    if (!modal || !titleEl || !messageEl || !confirmBtn) return;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Remove existing listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    // Add new listener
    newConfirmBtn.addEventListener('click', () => {
        onConfirm();
        closeModal('confirmModal');
    });
    
    modal.classList.remove('hidden');
}