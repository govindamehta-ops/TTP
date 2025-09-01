// Time Tracker Pro - Main Application JavaScript

class TimeTrackerApp {
    constructor() {
        // Application state
        this.currentUser = null;
        this.currentTheme = 'light';
        this.isLoggedIn = false;
        this.clockedIn = false;
        this.workStartTime = null;
        
        // Sample data from JSON
        this.users = [
            {"id": 1, "name": "John Smith", "email": "john.smith@company.com", "role": "Admin", "department": "IT", "status": "active"},
            {"id": 2, "name": "Sarah Johnson", "email": "sarah.johnson@company.com", "role": "Manager", "department": "HR", "status": "active"},
            {"id": 3, "name": "Mike Davis", "email": "mike.davis@company.com", "role": "Employee", "department": "Engineering", "status": "active"},
            {"id": 4, "name": "Lisa Chen", "email": "lisa.chen@company.com", "role": "Employee", "department": "Sales", "status": "active"},
            {"id": 5, "name": "David Wilson", "email": "david.wilson@company.com", "role": "Manager", "department": "Engineering", "status": "active"}
        ];

        this.searchData = [
            {type: 'employee', name: 'John Smith', department: 'IT', id: 1},
            {type: 'employee', name: 'Sarah Johnson', department: 'HR', id: 2},
            {type: 'employee', name: 'Mike Davis', department: 'Engineering', id: 3},
            {type: 'employee', name: 'Lisa Chen', department: 'Sales', id: 4},
            {type: 'employee', name: 'David Wilson', department: 'Engineering', id: 5},
            {type: 'project', name: 'Mobile App Development', department: 'Engineering', id: 1},
            {type: 'project', name: 'Marketing Campaign Q3', department: 'Marketing', id: 2},
            {type: 'project', name: 'HR System Upgrade', department: 'HR', id: 3},
            {type: 'project', name: 'Sales Process Optimization', department: 'Sales', id: 4},
            {type: 'report', name: 'Attendance Summary', id: 'attendance'},
            {type: 'report', name: 'Timesheet Report', id: 'timesheet'},
            {type: 'report', name: 'Leave Summary', id: 'leave'}
        ];

        this.init();
    }

    init() {
        this.initTheme();
        this.bindEvents();
        this.initTime();
        this.checkLoginStatus();
        
        // Set initial clock status
        this.clockedIn = true;
        this.workStartTime = new Date();
        this.workStartTime.setHours(9, 15, 0, 0); // 9:15 AM start time
    }

    initTheme() {
        // Check for saved theme preference or default to system preference
        const savedTheme = localStorage.getItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        
        this.currentTheme = savedTheme || systemTheme;
        this.applyTheme(this.currentTheme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this.applyTheme(this.currentTheme);
            }
        });
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        this.currentTheme = theme;
        
        const themeToggle = document.getElementById('theme-toggle');
        const sunIcon = themeToggle?.querySelector('.sun-icon');
        const moonIcon = themeToggle?.querySelector('.moon-icon');
        
        if (theme === 'dark') {
            sunIcon?.classList.add('hidden');
            moonIcon?.classList.remove('hidden');
            themeToggle?.setAttribute('aria-label', 'Switch to light mode');
        } else {
            sunIcon?.classList.remove('hidden');
            moonIcon?.classList.add('hidden');
            themeToggle?.setAttribute('aria-label', 'Switch to dark mode');
        }
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        loginForm?.addEventListener('submit', this.handleLogin.bind(this));

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle?.addEventListener('click', this.toggleTheme.bind(this));

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        mobileMenuToggle?.addEventListener('click', this.toggleMobileMenu.bind(this));

        // Navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });

        // Global search
        const searchInput = document.getElementById('global-search');
        searchInput?.addEventListener('input', this.handleSearch.bind(this));
        searchInput?.addEventListener('focus', this.showSearchResults.bind(this));
        
        // Clock in/out
        const clockToggle = document.getElementById('clock-toggle');
        clockToggle?.addEventListener('click', this.toggleClock.bind(this));

        // User menu
        const userMenuToggle = document.getElementById('user-menu-toggle');
        const userDropdown = document.getElementById('user-dropdown');
        userMenuToggle?.addEventListener('click', this.toggleUserMenu.bind(this));

        // User menu items
        const userMenuItems = document.querySelectorAll('#user-dropdown a');
        userMenuItems.forEach(item => {
            item.addEventListener('click', this.handleUserMenuClick.bind(this));
        });

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        logoutBtn?.addEventListener('click', this.handleLogout.bind(this));

        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', this.handleTabClick.bind(this));
        });

        // Leave request modal
        const newLeaveRequestBtn = document.getElementById('new-leave-request');
        newLeaveRequestBtn?.addEventListener('click', this.showLeaveModal.bind(this));

        const cancelLeaveBtn = document.getElementById('cancel-leave');
        const submitLeaveBtn = document.getElementById('submit-leave');
        const leaveModalClose = document.querySelector('#leave-modal .modal-close');

        cancelLeaveBtn?.addEventListener('click', this.hideLeaveModal.bind(this));
        submitLeaveBtn?.addEventListener('click', this.handleLeaveSubmit.bind(this));
        leaveModalClose?.addEventListener('click', this.hideLeaveModal.bind(this));

        // Modal overlay click to close
        const modalOverlay = document.querySelector('#leave-modal .modal-overlay');
        modalOverlay?.addEventListener('click', this.hideLeaveModal.bind(this));

        // Toast notification close
        const toastClose = document.querySelector('.toast-close');
        toastClose?.addEventListener('click', this.hideToast.bind(this));

        // Report generation
        const generateReportBtn = document.getElementById('generate-report');
        const exportReportBtn = document.getElementById('export-report');
        
        generateReportBtn?.addEventListener('click', this.generateReport.bind(this));
        exportReportBtn?.addEventListener('click', this.exportReport.bind(this));

        // Close dropdowns when clicking outside
        document.addEventListener('click', this.handleOutsideClick.bind(this));

        // Keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    checkLoginStatus() {
        // For demo purposes, show login screen initially
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (this.isLoggedIn) {
            if (loginScreen) {
                loginScreen.style.display = 'none';
                loginScreen.classList.add('hidden');
            }
            if (mainApp) {
                mainApp.style.display = 'grid';
                mainApp.classList.remove('hidden');
            }
        } else {
            if (loginScreen) {
                loginScreen.style.display = 'flex';
                loginScreen.classList.remove('hidden');
            }
            if (mainApp) {
                mainApp.style.display = 'none';
                mainApp.classList.add('hidden');
            }
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const rememberMeInput = document.getElementById('remember-me');
        
        if (!emailInput || !passwordInput) {
            console.error('Login form inputs not found');
            return;
        }
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const rememberMe = rememberMeInput?.checked || false;

        // Clear all previous errors first
        this.clearAllErrors();

        // Validate inputs
        let isValid = true;
        
        if (!email) {
            this.showError('email', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!password) {
            this.showError('password', 'Password is required');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }

        // Simulate authentication
        const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (user && password === 'password') { // Demo password
            this.currentUser = user;
            this.isLoggedIn = true;
            
            // Update UI with user info
            this.updateUserInterface(user);
            
            // Switch to main application
            this.switchToMainApp();
            
            this.showToast('Login successful! Welcome back.', 'success');
            
        } else {
            this.showError('email', 'Invalid email or password. Use password "password" for demo.');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    updateUserInterface(user) {
        const currentUserName = document.getElementById('current-user-name');
        const userAvatar = document.querySelector('.user-avatar');
        
        if (currentUserName) {
            currentUserName.textContent = user.name;
        }
        if (userAvatar) {
            userAvatar.textContent = this.getInitials(user.name);
        }
    }

    switchToMainApp() {
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.style.display = 'none';
            loginScreen.classList.add('hidden');
        }
        
        if (mainApp) {
            mainApp.style.display = 'grid';
            mainApp.classList.remove('hidden');
        }
        
        // Set focus to main content for accessibility
        setTimeout(() => {
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.setAttribute('tabindex', '-1');
                mainContent.focus();
            }
        }, 100);
    }

    showError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
        }
        
        if (inputElement) {
            inputElement.setAttribute('aria-invalid', 'true');
            inputElement.classList.add('error');
        }
    }

    clearError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        const inputElement = document.getElementById(fieldName);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
        
        if (inputElement) {
            inputElement.removeAttribute('aria-invalid');
            inputElement.classList.remove('error');
        }
    }

    clearAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.remove('show');
        });
        
        const inputElements = document.querySelectorAll('.form-control');
        inputElements.forEach(element => {
            element.removeAttribute('aria-invalid');
            element.classList.remove('error');
        });
    }

    handleLogout(e) {
        e.preventDefault();
        
        this.currentUser = null;
        this.isLoggedIn = false;
        this.clockedIn = false;
        this.workStartTime = null;
        
        // Reset form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.reset();
        }
        
        // Clear any errors
        this.clearAllErrors();
        
        // Show login screen and hide main app
        const loginScreen = document.getElementById('login-screen');
        const mainApp = document.getElementById('main-app');
        
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            loginScreen.classList.remove('hidden');
        }
        if (mainApp) {
            mainApp.style.display = 'none';
            mainApp.classList.add('hidden');
        }
        
        this.showToast('You have been logged out successfully.', 'info');
        
        // Focus on email input
        setTimeout(() => {
            const emailInput = document.getElementById('email');
            if (emailInput) {
                emailInput.focus();
            }
        }, 100);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.showToast(`Switched to ${newTheme} mode`, 'info');
    }

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        
        if (sidebar) {
            sidebar.classList.toggle('open');
            
            const isOpen = sidebar.classList.contains('open');
            if (mobileMenuToggle) {
                mobileMenuToggle.setAttribute('aria-expanded', isOpen);
            }
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetView = e.target.closest('.nav-link')?.dataset.view;
        
        if (targetView) {
            this.showView(targetView);
            
            // Update active navigation
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            });
            
            e.target.closest('.nav-link').classList.add('active');
            e.target.closest('.nav-link').setAttribute('aria-current', 'page');
            
            // Close mobile menu
            const sidebar = document.querySelector('.sidebar');
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            
            if (sidebar) {
                sidebar.classList.remove('open');
            }
            if (mobileMenuToggle) {
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    }

    showView(viewName) {
        // Hide all views
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.classList.remove('active');
            view.classList.add('hidden');
        });
        
        // Show target view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
            targetView.classList.remove('hidden');
        }
        
        // Update page title
        this.updatePageTitle(viewName);
        
        // Set focus for accessibility
        const pageHeader = targetView?.querySelector('h2');
        if (pageHeader) {
            pageHeader.setAttribute('tabindex', '-1');
            pageHeader.focus();
        }
    }

    updatePageTitle(viewName) {
        const titles = {
            'dashboard': 'Dashboard - TimeTracker Pro',
            'time-tracking': 'Time Tracking - TimeTracker Pro',
            'attendance': 'Attendance - TimeTracker Pro',
            'reports': 'Reports - TimeTracker Pro',
            'team': 'Team Overview - TimeTracker Pro'
        };
        
        document.title = titles[viewName] || 'TimeTracker Pro';
    }

    handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const resultsContainer = document.getElementById('search-results');
        
        if (!resultsContainer) return;
        
        if (query.length < 2) {
            resultsContainer.classList.add('hidden');
            return;
        }
        
        const results = this.searchData.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.department?.toLowerCase().includes(query) ||
            item.type.toLowerCase().includes(query)
        );
        
        this.displaySearchResults(results, resultsContainer);
        resultsContainer.classList.remove('hidden');
    }

    showSearchResults() {
        const searchInput = document.getElementById('global-search');
        const resultsContainer = document.getElementById('search-results');
        
        if (searchInput && resultsContainer && searchInput.value.length >= 2) {
            resultsContainer.classList.remove('hidden');
        }
    }

    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item">No results found</div>';
            return;
        }
        
        const resultHtml = results.map(item => {
            const typeIcon = this.getTypeIcon(item.type);
            return `
                <div class="search-result-item" tabindex="0" role="option" data-type="${item.type}" data-id="${item.id}">
                    ${typeIcon} <strong>${item.name}</strong>
                    ${item.department ? `<span style="color: var(--color-text-secondary); font-size: var(--font-size-sm);"> - ${item.department}</span>` : ''}
                </div>
            `;
        }).join('');
        
        container.innerHTML = resultHtml;
        
        // Add click handlers to results
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', this.handleSearchResultClick.bind(this));
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.handleSearchResultClick(e);
                }
            });
        });
    }

    getTypeIcon(type) {
        const icons = {
            'employee': '👤',
            'project': '📁',
            'report': '📊'
        };
        return icons[type] || '📄';
    }

    handleSearchResultClick(e) {
        const type = e.currentTarget.dataset.type;
        const id = e.currentTarget.dataset.id;
        
        // Close search results
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('global-search');
        
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Navigate based on type
        switch(type) {
            case 'employee':
                this.showView('team');
                break;
            case 'project':
                this.showView('time-tracking');
                break;
            case 'report':
                this.showView('reports');
                break;
        }
        
        const itemName = e.currentTarget.querySelector('strong')?.textContent || 'item';
        this.showToast(`Navigated to ${type}: ${itemName}`, 'info');
    }

    toggleClock() {
        const clockBtn = document.getElementById('clock-toggle');
        const statusElement = document.getElementById('current-status');
        const helpText = document.getElementById('clock-help');
        
        if (!clockBtn || !statusElement) return;
        
        if (this.clockedIn) {
            // Clock out
            this.clockedIn = false;
            clockBtn.textContent = 'Clock In';
            statusElement.textContent = 'Clocked Out';
            statusElement.className = 'status status--error';
            if (helpText) {
                helpText.textContent = 'Click to clock in for the day.';
            }
            
            const workedHours = this.calculateWorkedHours();
            this.showToast(`Clocked out successfully. Total hours: ${workedHours}h`, 'success');
            
        } else {
            // Clock in
            this.clockedIn = true;
            this.workStartTime = new Date();
            clockBtn.textContent = 'Clock Out';
            statusElement.textContent = 'Clocked In';
            statusElement.className = 'status status--success';
            if (helpText) {
                helpText.textContent = 'Click to clock out. You are now tracking time.';
            }
            
            this.showToast('Clocked in successfully. Have a great day!', 'success');
        }
    }

    calculateWorkedHours() {
        if (!this.workStartTime) return '0.00';
        
        const now = new Date();
        const diffMs = now - this.workStartTime;
        const diffHours = diffMs / (1000 * 60 * 60);
        
        return diffHours.toFixed(2);
    }

    initTime() {
        this.updateCurrentTime();
        setInterval(this.updateCurrentTime.bind(this), 60000); // Update every minute
    }

    updateCurrentTime() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    }

    toggleUserMenu() {
        const dropdown = document.getElementById('user-dropdown');
        const toggle = document.getElementById('user-menu-toggle');
        
        if (dropdown) {
            dropdown.classList.toggle('hidden');
            const isOpen = !dropdown.classList.contains('hidden');
            if (toggle) {
                toggle.setAttribute('aria-expanded', isOpen);
            }
        }
    }

    handleUserMenuClick(e) {
        e.preventDefault();
        const view = e.target.dataset.view;
        
        if (view) {
            this.showView(view);
        }
        
        // Close user menu
        const userDropdown = document.getElementById('user-dropdown');
        const userMenuToggle = document.getElementById('user-menu-toggle');
        
        if (userDropdown) {
            userDropdown.classList.add('hidden');
        }
        if (userMenuToggle) {
            userMenuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    handleTabClick(e) {
        e.preventDefault();
        const tabId = e.target.dataset.tab;
        
        if (!tabId) return;
        
        // Update tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        // Update tab panels
        const tabPanels = document.querySelectorAll('.tab-panel');
        tabPanels.forEach(panel => {
            panel.classList.remove('active');
            panel.classList.add('hidden');
        });
        
        const targetPanel = document.getElementById(tabId);
        if (targetPanel) {
            targetPanel.classList.add('active');
            targetPanel.classList.remove('hidden');
        }
    }

    showLeaveModal() {
        const modal = document.getElementById('leave-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            
            // Set focus to first form input
            const firstInput = modal.querySelector('.form-control');
            if (firstInput) {
                firstInput.focus();
            }
            
            // Trap focus in modal
            this.trapFocus(modal);
        }
    }

    hideLeaveModal() {
        const modal = document.getElementById('leave-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            
            // Reset form
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
            }
            
            // Return focus to trigger button
            const newLeaveBtn = document.getElementById('new-leave-request');
            if (newLeaveBtn) {
                newLeaveBtn.focus();
            }
        }
    }

    handleLeaveSubmit() {
        const leaveType = document.getElementById('leave-type')?.value;
        const startDate = document.getElementById('start-date')?.value;
        const endDate = document.getElementById('end-date')?.value;
        
        if (!leaveType || !startDate || !endDate) {
            this.showToast('Please fill in all required fields.', 'error');
            return;
        }
        
        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
        
        // Simulate API call
        setTimeout(() => {
            this.hideLeaveModal();
            this.showToast(`Leave request submitted successfully for ${days} days.`, 'success');
        }, 500);
    }

    generateReport() {
        const reportType = document.getElementById('report-type')?.value || 'attendance';
        const dateRange = document.getElementById('date-range')?.value || 'this-week';
        
        this.showToast(`Generating ${reportType} report for ${dateRange}...`, 'info');
        
        // Simulate report generation
        setTimeout(() => {
            this.showToast('Report generated successfully!', 'success');
        }, 2000);
    }

    exportReport() {
        this.showToast('Exporting report to PDF...', 'info');
        
        // Simulate PDF export
        setTimeout(() => {
            this.showToast('Report exported successfully!', 'success');
        }, 1500);
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const messageElement = toast?.querySelector('.toast-message');
        
        if (toast && messageElement) {
            messageElement.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideToast();
            }, 5000);
        }
    }

    hideToast() {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.classList.add('hidden');
        }
    }

    handleOutsideClick(e) {
        // Close search results if clicking outside
        const searchContainer = document.querySelector('.search-container');
        const searchResults = document.getElementById('search-results');
        
        if (searchContainer && searchResults && !searchContainer.contains(e.target)) {
            searchResults.classList.add('hidden');
        }
        
        // Close user menu if clicking outside
        const userMenu = document.querySelector('.user-menu');
        const userDropdown = document.getElementById('user-dropdown');
        const userMenuToggle = document.getElementById('user-menu-toggle');
        
        if (userMenu && userDropdown && !userMenu.contains(e.target)) {
            userDropdown.classList.add('hidden');
            if (userMenuToggle) {
                userMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }
    }

    handleKeyboardNavigation(e) {
        // Escape key to close modals and dropdowns
        if (e.key === 'Escape') {
            // Close search results
            const searchResults = document.getElementById('search-results');
            if (searchResults && !searchResults.classList.contains('hidden')) {
                searchResults.classList.add('hidden');
                const searchInput = document.getElementById('global-search');
                if (searchInput) {
                    searchInput.focus();
                }
            }
            
            // Close user menu
            const userDropdown = document.getElementById('user-dropdown');
            const userMenuToggle = document.getElementById('user-menu-toggle');
            if (userDropdown && !userDropdown.classList.contains('hidden')) {
                userDropdown.classList.add('hidden');
                if (userMenuToggle) {
                    userMenuToggle.setAttribute('aria-expanded', 'false');
                    userMenuToggle.focus();
                }
            }
            
            // Close leave modal
            const leaveModal = document.getElementById('leave-modal');
            if (leaveModal && !leaveModal.classList.contains('hidden')) {
                this.hideLeaveModal();
            }
            
            // Close mobile menu
            const sidebar = document.querySelector('.sidebar');
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            if (sidebar && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                if (mobileMenuToggle) {
                    mobileMenuToggle.setAttribute('aria-expanded', 'false');
                    mobileMenuToggle.focus();
                }
            }
        }
        
        // Arrow key navigation in search results
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const searchResults = document.getElementById('search-results');
            const activeElement = document.activeElement;
            
            if (searchResults && !searchResults.classList.contains('hidden')) {
                const items = searchResults.querySelectorAll('.search-result-item');
                const currentIndex = Array.from(items).indexOf(activeElement);
                
                if (e.key === 'ArrowDown') {
                    const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
                    items[nextIndex]?.focus();
                } else {
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
                    items[prevIndex]?.focus();
                }
                
                e.preventDefault();
            }
        }
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement?.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement?.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    getInitials(name) {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }
}

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.timeTrackerApp = new TimeTrackerApp();
});

// Export for potential testing or external access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeTrackerApp;
}