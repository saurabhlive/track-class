// Global variables - best practice would be to encapsulate, but maintaining original style
let currentUserId = null;
let selectedStudentId = null;
let currentChecklist = null; // Stores the checklist being viewed in detail modal
let editingChecklist = null; // Stores the checklist being edited in the edit modal
let editingItem = null; // Stores the item being edited in the edit item modal

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const dashboardScreen = document.getElementById('dashboardScreen');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const loginMessageEl = document.getElementById('loginMessage');
const loggedInUserEmailEl = document.getElementById('loggedInUserEmail');

const studentListEl = document.getElementById('studentList');
const addStudentBtn = document.getElementById('addStudentBtn');

const checklistsTabBtn = document.getElementById('checklistsTabBtn');
const analyticsTabBtn = document.getElementById('analyticsTabBtn');
const checklistsTab = document.getElementById('checklistsTab');
const analyticsTab = document.getElementById('analyticsTab');
const checklistsHeaderEl = document.getElementById('checklistsHeader');
const newChecklistBtn = document.getElementById('newChecklistBtn');
const checklistListEl = document.getElementById('checklistList');
const checklistsEmptyState = document.getElementById('checklistsEmptyState');
const emptyStateEl = document.getElementById('emptyState'); // For no student selected

const completionChartCanvas = document.getElementById('completionChart');
let completionChartInstance = null; // To store the Chart.js instance

// Modals
const checklistDetailModal = document.getElementById('checklistDetailModal');
const editChecklistModal = document.getElementById('editChecklistModal');
const editItemModal = document.getElementById('editItemModal');
const confirmModal = document.getElementById('confirmModal');

const checklistTitleEl = document.getElementById('checklistTitle');
const checklistDetailHeaderEl = document.getElementById('checklistDetailHeader');
const checklistItemsEl = document.getElementById('checklistItems');
const shareChecklistBtn = document.getElementById('shareChecklistBtn');

const editChecklistForm = document.getElementById('editChecklistForm');
const editItemForm = document.getElementById('editItemForm');

const confirmTitleEl = document.getElementById('confirmTitle');
const confirmMessageEl = document.getElementById('confirmMessage');
const confirmActionBtn = document.getElementById('confirmAction');

// --- Initial Load & Event Listeners ---
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();

    // Login Form Submission
    loginForm.addEventListener('submit', handleLogin);

    // Logout Button
    logoutBtn.addEventListener('click', handleLogout);

    // Tab Navigation
    checklistsTabBtn.addEventListener('click', () => showTab('checklists'));
    analyticsTabBtn.addEventListener('click', () => showTab('analytics'));

    // Add Student Button
    addStudentBtn.addEventListener('click', () => console.log("Add student functionality not implemented yet.")); // Placeholder

    // New Checklist Button
    newChecklistBtn.addEventListener('click', async () => await handleNewChecklist());

    // Modal Close Buttons
    document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modalId = e.target.dataset.modalId || e.target.closest('.modal').id;
            closeModal(modalId);
        });
    });

    // Edit Checklist Form Submission
    editChecklistForm.addEventListener('submit', handleEditChecklist);

    // Edit Item Form Submission
    editItemForm.addEventListener('submit', handleEditItem);

    // Share Report Button
    shareChecklistBtn.addEventListener('click', handleShareReport);
    document.getElementById('shareReportBtn').addEventListener('click', handleShareReport);
});

// --- UI Management ---
async function checkSession() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUserId = session.user.id;
            loggedInUserEmailEl.textContent = session.user.email;
            showDashboard();
            await loadStudents();
        } else {
            showLogin();
        }
    } catch (error) {
        console.error("Error checking session:", error);
        showLogin();
    }
}

function showLogin() {
    loginScreen.classList.remove('hidden');
    dashboardScreen.classList.add('hidden');
}

function showDashboard() {
    loginScreen.classList.add('hidden');
    dashboardScreen.classList.remove('hidden');
    // Default to showing checklists tab
    showTab('checklists');
}

function showTab(tabName) {
    if (tabName === 'checklists') {
        checklistsTab.classList.remove('hidden');
        analyticsTab.classList.add('hidden');
        checklistsTabBtn.classList.add('active');
        analyticsTabBtn.classList.remove('active');
    } else {
        checklistsTab.classList.add('hidden');
        analyticsTab.classList.remove('hidden');
        checklistsTabBtn.classList.remove('active');
        analyticsTabBtn.classList.add('active');
        if (selectedStudentId) {
            renderChart(selectedStudentId);
        }
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }

    // Reset specific modal states
    if (modalId === 'checklistDetailModal') {
        currentChecklist = null;
    } else if (modalId === 'editChecklistModal') {
        editingChecklist = null;
    } else if (modalId === 'editItemModal') {
        editingItem = null;
    } else if (modalId === 'confirmModal') {
        // No specific state to reset for confirm, just close
    }
}

function showConfirmDialog(title, message, onConfirm) {
    confirmTitleEl.textContent = title;
    confirmMessageEl.textContent = message;

    // Remove existing listeners to prevent multiple executions
    const newConfirmActionBtn = confirmActionBtn.cloneNode(true);
    confirmActionBtn.parentNode.replaceChild(newConfirmActionBtn, confirmActionBtn);
    confirmActionBtn = newConfirmActionBtn; // Update the reference

    confirmActionBtn.addEventListener('click', () => {
        onConfirm();
        closeModal('confirmModal');
    });

    openModal('confirmModal');
}

// --- Authentication ---
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginMessageEl.textContent = ''; // Clear previous messages

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            console.error("Login error:", error.message);
            loginMessageEl.textContent = error.message;
        } else if (data.session) {
            currentUserId = data.session.user.id;
            loggedInUserEmailEl.textContent = data.user.email;
            showDashboard();
            await loadStudents();
        }
    } catch (error) {
        console.error("Unexpected login error:", error);
        loginMessageEl.textContent = "An unexpected error occurred.";
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Logout error:", error.message);
        } else {
            currentUserId = null;
            selectedStudentId = null;
            showLogin();
        }
    } catch (error) {
        console.error("Unexpected logout error:", error);
    }
}

// --- Student Management ---
async function loadStudents() {
    studentListEl.innerHTML = '<p class="loading-indicator">Loading students...</p>';
    try {
        const { data: students, error } = await supabase
            .from('students')
            .select('*')
            .eq('user_id', currentUserId)
            .order('name', { ascending: true });

        if (error) throw error;

        renderStudents(students);
        if (students.length > 0 && !selectedStudentId) {
            // Select the first student by default if none is selected
            selectStudent(students[0].id);
        } else if (selectedStudentId) {
            // Re-select the student if already selected (e.g., after a refresh)
            const studentExists = students.some(s => s.id === selectedStudentId);
            if (studentExists) {
                selectStudent(selectedStudentId);
            } else if (students.length > 0) {
                selectStudent(students[0].id); // Fallback to first student
            } else {
                renderEmptyStudentState();
            }
        } else {
            renderEmptyStudentState();
        }

    } catch (error) {
        console.error("Error loading students:", error.message);
        studentListEl.innerHTML = '<p class="error-message">Failed to load students.</p>';
    }
}

function renderStudents(students) {
    studentListEl.innerHTML = '';
    if (students.length === 0) {
        studentListEl.innerHTML = '<div class="empty-state">No students added yet.</div>';
        return;
    }
    students.forEach(student => {
        const studentCard = document.createElement('div');
        studentCard.className = `student-card ${selectedStudentId === student.id ? 'active' : ''}`;
        studentCard.dataset.studentId = student.id;
        studentCard.innerHTML = `
            <div class="student-card__details">
                <h4>${student.name}</h4>
                <p>${student.individual_class_type}</p>
            </div>
            <div class="student-card__actions">
                <button class="icon-btn edit-student-btn"><i class="fas fa-pen"></i></button>
                <button class="icon-btn archive-student-btn"><i class="fas fa-archive"></i></button>
            </div>
        `;
        studentCard.addEventListener('click', () => selectStudent(student.id));
        studentListEl.appendChild(studentCard);
    });
}

function renderEmptyStudentState() {
    emptyStateEl.classList.remove('hidden');
    checklistsTab.classList.add('hidden');
    analyticsTab.classList.add('hidden');
}

async function selectStudent(studentId) {
    if (selectedStudentId === studentId) return; // Prevent re-rendering if same student

    selectedStudentId = studentId;

    // Update active class on student cards
    document.querySelectorAll('.student-card').forEach(card => {
        if (card.dataset.studentId === studentId) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    });

    const selectedStudent = (await supabase.from('students').select('*').eq('id', studentId).single()).data;
    if (selectedStudent) {
        checklistsHeaderEl.textContent = `Checklists for ${selectedStudent.name}`;
        document.getElementById('analyticsHeader').textContent = `Analytics for ${selectedStudent.name}`;
        emptyStateEl.classList.add('hidden'); // Hide empty student state
        checklistsTab.classList.remove('hidden');
        analyticsTab.classList.add('hidden'); // Ensure analytics is hidden on student select
        checklistsTabBtn.classList.add('active');
        analyticsTabBtn.classList.remove('active');

        await loadChecklistsForStudent(studentId);
    }
}

// --- Checklist Management ---
async function loadChecklistsForStudent(studentId) {
    checklistListEl.innerHTML = '<p class="loading-indicator">Loading checklists...</p>';
    checklistsEmptyState.classList.add('hidden');

    try {
        const { data: checklists, error } = await supabase
            .from('checklists')
            .select('*')
            .eq('student_id', studentId)
            .order('period', { ascending: false }); // Order by period, e.g., 'July-August' first, not strictly chronological

        if (error) throw error;

        // Fetch items for each checklist
        const checklistsWithItems = await Promise.all(checklists.map(async (checklist) => {
            const { data: items, error: itemsError } = await supabase
                .from('checklist_items')
                .select('*')
                .eq('checklist_id', checklist.id)
                .order('slot', { ascending: true });
            if (itemsError) throw itemsError;
            return { ...checklist, classes: items }; // Renaming items to 'classes' to match original structure
        }));

        renderChecklists(checklistsWithItems);

    } catch (error) {
        console.error("Error loading checklists:", error.message);
        checklistListEl.innerHTML = '<p class="error-message">Failed to load checklists.</p>';
    }
}


function renderChecklists(checklists) {
    checklistListEl.innerHTML = '';
    if (checklists.length === 0) {
        checklistsEmptyState.classList.remove('hidden');
        return;
    }
    checklistsEmptyState.classList.add('hidden');

    checklists.forEach(checklist => {
        const percentage = getCompletionPercentage(checklist);
        const checklistCard = document.createElement('div');
        checklistCard.className = 'checklist-card';
        checklistCard.innerHTML = `
            <div class="checklist-card__header">
                <h4>${checklist.period}</h4>
                <div class="checklist-card__actions">
                    <button class="icon-btn edit-checklist-btn" data-checklist-id="${checklist.id}"><i class="fas fa-pen"></i></button>
                    <button class="icon-btn delete-checklist-btn" data-checklist-id="${checklist.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="checklist-card__stats">
                <span>Total Slots: ${checklist.total_slots}</span>
                <span>
                    Completed: <span class="completion-percentage ${getCompletionClass(percentage)}">${percentage.toFixed(0)}%</span>
                </span>
            </div>
        `;
        checklistCard.addEventListener('click', (e) => {
            // Prevent opening detail modal if edit/delete button was clicked
            if (e.target.closest('.edit-checklist-btn') || e.target.closest('.delete-checklist-btn')) {
                return;
            }
            openChecklistDetailModal(checklist);
        });

        checklistCard.querySelector('.edit-checklist-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            openEditChecklistModal(checklist);
        });
        checklistCard.querySelector('.delete-checklist-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            handleDeleteChecklist(checklist.id);
        });

        checklistListEl.appendChild(checklistCard);
    });
}

function getCompletionPercentage(checklist) {
    if (!checklist || !checklist.classes || checklist.classes.length === 0) return 0;
    const completedCount = checklist.classes.filter(item => item.completed).length;
    // Calculate percentage based on total_slots from checklist, not just actual items fetched
    // This assumes checklist.total_slots reflects the intended number of items
    return (completedCount / checklist.total_slots) * 100;
}

function getCompletionClass(percentage) {
    if (percentage >= 75) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
}

// --- Add New Checklist ---
async function handleNewChecklist() {
    if (!selectedStudentId) {
        alert("Please select a student first.");
        return;
    }

    const period = prompt("Enter new checklist period (e.g., 'October-November'):");
    if (!period) return;

    const totalSlots = parseInt(prompt("Enter total number of slots for this checklist:"), 10);
    if (isNaN(totalSlots) || totalSlots <= 0) {
        alert("Please enter a valid number for total slots.");
        return;
    }

    try {
        // Insert new checklist
        const { data: newChecklistData, error: checklistError } = await supabase
            .from('checklists')
            .insert({
                user_id: currentUserId,
                student_id: selectedStudentId,
                period: period,
                total_slots: totalSlots
            })
            .select()
            .single();

        if (checklistError) throw checklistError;

        // Prepare items for insertion
        const newItems = [];
        for (let i = 1; i <= totalSlots; i++) {
            newItems.push({
                checklist_id: newChecklistData.id,
                slot: i,
                date: `Class ${i} (Date TBD)`, // Placeholder date
                completed: false,
                custom_name: `Class ${i}`
            });
        }

        // Insert new checklist items
        const { error: itemsError } = await supabase
            .from('checklist_items')
            .insert(newItems);

        if (itemsError) throw itemsError;

        await loadChecklistsForStudent(selectedStudentId); // Reload checklists
        alert("New checklist created successfully!");

    } catch (error) {
        console.error("Error creating new checklist:", error.message);
        alert("Failed to create new checklist: " + error.message);
    }
}

// --- Checklist Detail Modal ---
async function openChecklistDetailModal(checklist) {
    currentChecklist = checklist;
    checklistTitleEl.textContent = `Checklist: ${currentChecklist.period}`;
    checklistDetailHeaderEl.textContent = `${(await supabase.from('students').select('name').eq('id', selectedStudentId).single()).data.name} - ${currentChecklist.period}`;
    shareChecklistBtn.classList.remove('hidden');

    await renderChecklistItems(currentChecklist);
    openModal('checklistDetailModal');
}

async function renderChecklistItems(checklist) {
    checklistItemsEl.innerHTML = '<p class="loading-indicator">Loading items...</p>';
    try {
        const { data: items, error } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('checklist_id', checklist.id)
            .order('slot', { ascending: true });

        if (error) throw error;

        checklistItemsEl.innerHTML = '';
        if (items.length === 0) {
             checklistItemsEl.innerHTML = '<li class="empty-state">No items in this checklist.</li>';
             return;
        }

        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = `checklist-item ${item.completed ? 'completed' : ''}`;
            listItem.dataset.itemId = item.id; // Use item ID for unique identification
            listItem.innerHTML = `
                <div class="flex items-center">
                    <div class="item-status-icon">
                        ${item.completed ? '<i class="fas fa-check"></i>' : ''}
                    </div>
                    <span class="item-name">${item.custom_name}</span>
                </div>
                <div class="item-actions">
                    <button class="icon-btn edit-item-btn" data-item-id="${item.id}" data-item-slot="${item.slot}"><i class="fas fa-pen"></i></button>
                </div>
            `;
            listItem.addEventListener('click', (e) => {
                // Toggle completion if not clicking edit button
                if (!e.target.closest('.edit-item-btn')) {
                    handleToggleItemCompletion(currentChecklist.id, item.id, item.completed);
                }
            });
            listItem.querySelector('.edit-item-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent parent click
                openEditItemModal(item);
            });
            checklistItemsEl.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error rendering checklist items:", error.message);
        checklistItemsEl.innerHTML = '<p class="error-message">Failed to load checklist items.</p>';
    }
}

async function handleToggleItemCompletion(checklistId, itemId, currentCompletionStatus) {
    try {
        const { error } = await supabase
            .from('checklist_items')
            .update({ completed: !currentCompletionStatus })
            .eq('id', itemId);

        if (error) throw error;

        // Re-render items in modal and reload checklists to update percentages
        await renderChecklistItems(currentChecklist);
        await loadChecklistsForStudent(selectedStudentId);

    } catch (error) {
        console.error("Error toggling item completion:", error.message);
        alert("Failed to update item status: " + error.message);
    }
}

// --- Edit Checklist Modal ---
function openEditChecklistModal(checklist) {
    editingChecklist = checklist;
    document.getElementById('period').value = checklist.period;
    document.getElementById('totalSlots').value = checklist.total_slots;
    openModal('editChecklistModal');
}

async function handleEditChecklist(event) {
    event.preventDefault();
    const newPeriod = document.getElementById('period').value;
    const newTotalSlots = parseInt(document.getElementById('totalSlots').value, 10);

    if (isNaN(newTotalSlots) || newTotalSlots <= 0) {
        alert("Please enter a valid number for total slots.");
        return;
    }

    try {
        // Update checklist details
        const { error: checklistError } = await supabase
            .from('checklists')
            .update({ period: newPeriod, total_slots: newTotalSlots })
            .eq('id', editingChecklist.id);

        if (checklistError) throw checklistError;

        // Handle changes in total_slots: Add or remove checklist_items
        const { data: existingItems, error: fetchItemsError } = await supabase
            .from('checklist_items')
            .select('*')
            .eq('checklist_id', editingChecklist.id)
            .order('slot', { ascending: true });

        if (fetchItemsError) throw fetchItemsError;

        const currentItemCount = existingItems.length;

        if (newTotalSlots > currentItemCount) {
            // Add new items
            const itemsToAdd = [];
            for (let i = currentItemCount + 1; i <= newTotalSlots; i++) {
                itemsToAdd.push({
                    checklist_id: editingChecklist.id,
                    slot: i,
                    date: `Class ${i} (Date TBD)`,
                    completed: false,
                    custom_name: `Class ${i}`
                });
            }
            const { error: insertError } = await supabase
                .from('checklist_items')
                .insert(itemsToAdd);
            if (insertError) throw insertError;
        } else if (newTotalSlots < currentItemCount) {
            // Delete excess items
            const itemsToDelete = existingItems.slice(newTotalSlots);
            const itemIdsToDelete = itemsToDelete.map(item => item.id);

            const { error: deleteError } = await supabase
                .from('checklist_items')
                .delete()
                .in('id', itemIdsToDelete);
            if (deleteError) throw deleteError;
        }

        closeModal('editChecklistModal');
        await loadChecklistsForStudent(selectedStudentId); // Reload all checklists

    } catch (error) {
        console.error("Error editing checklist:", error.message);
        alert("Failed to save checklist changes: " + error.message);
    }
}

// --- Edit Item Modal ---
function openEditItemModal(item) {
    editingItem = item;
    document.getElementById('itemName').value = item.custom_name;
    openModal('editItemModal');
}

async function handleEditItem(event) {
    event.preventDefault();
    const newName = document.getElementById('itemName').value;

    try {
        const { error } = await supabase
            .from('checklist_items')
            .update({ custom_name: newName })
            .eq('id', editingItem.id);

        if (error) throw error;

        closeModal('editItemModal');
        await renderChecklistItems(currentChecklist); // Re-render items in current detail modal

    } catch (error) {
        console.error("Error editing item:", error.message);
        alert("Failed to save item changes: " + error.message);
    }
}

// --- Delete Checklist ---
async function handleDeleteChecklist(checklistId) {
    showConfirmDialog(
        "Delete Checklist",
        "Are you sure you want to delete this checklist and all its items? This action cannot be undone.",
        async () => {
            try {
                // Delete associated checklist_items first (due to foreign key constraints)
                const { error: itemsError } = await supabase
                    .from('checklist_items')
                    .delete()
                    .eq('checklist_id', checklistId);
                if (itemsError) throw itemsError;

                // Then delete the checklist itself
                const { error: checklistError } = await supabase
                    .from('checklists')
                    .delete()
                    .eq('id', checklistId);
                if (checklistError) throw checklistError;

                // If the deleted checklist was the one open in detail modal, close it
                if (currentChecklist && currentChecklist.id === checklistId) {
                    closeModal('checklistDetailModal');
                }
                await loadChecklistsForStudent(selectedStudentId); // Reload checklists
            } catch (error) {
                console.error("Error deleting checklist:", error.message);
                alert("Failed to delete checklist: " + error.message);
            }
        }
    );
}

// --- Analytics & Report Generation ---
function renderChart(studentId) {
    if (completionChartInstance) {
        completionChartInstance.destroy();
    }
    const studentChecklistsPromise = supabase
        .from('checklists')
        .select('*')
        .eq('student_id', studentId)
        .order('period', { ascending: false }) // Example ordering
        .then(async ({ data: checklists, error }) => {
            if (error) throw error;
            // Fetch items for each checklist to calculate completion
            const checklistsWithItems = await Promise.all(checklists.map(async (checklist) => {
                const { data: items, error: itemsError } = await supabase
                    .from('checklist_items')
                    .select('*')
                    .eq('checklist_id', checklist.id);
                if (itemsError) throw itemsError;
                return { ...checklist, classes: items };
            }));
            return checklistsWithItems;
        });

    studentChecklistsPromise.then(checklists => {
        const labels = checklists.map(cl => cl.period);
        const data = checklists.map(cl => getCompletionPercentage(cl));

        completionChartInstance = new Chart(completionChartCanvas, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Completion Percentage',
                    data: data,
                    backgroundColor: 'rgba(94, 82, 64, 0.7)',
                    borderColor: 'rgba(94, 82, 64, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }).catch(error => {
        console.error("Error rendering chart:", error.message);
        completionChartCanvas.innerHTML = '<p class="error-message">Failed to load chart data.</p>';
    });
}

async function handleShareReport() {
    const reportElement = document.getElementById('reportCard');
    if (!reportElement) return;

    try {
        const canvas = await html2canvas(reportElement);
        const imgData = canvas.toDataURL('image/png');
        const newWindow = window.open();
        newWindow.document.write('<html><head><title>Student Report</title></head><body><img src="' + imgData + '" style="max-width:100%; height:auto;" /></body></html>');
    } catch (error) {
        console.error('Error generating report:', error);
    }
}
