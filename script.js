// Performance Management Dashboard
// Main application JavaScript

// Application Configuration - Load from config.js or use defaults
const CONFIG = window.DASHBOARD_CONFIG || {
    // Default/Fallback API Endpoints
    endpoints: {
        googleSheets: 'https://script.google.com/macros/s/YOUR_GOOGLE_SCRIPT_ID/exec',
        tableau: {
            server: 'https://your-tableau-server.com',
            apiVersion: '3.19',
            siteId: 'your-site-id'
        },
        redash: {
            baseUrl: 'https://your-redash.com/api',
            apiKey: 'YOUR_REDASH_API_KEY'
        },
        salesforce: {
            instanceUrl: 'https://your-instance.salesforce.com',
            apiVersion: 'v58.0'
        },
        aiCoaching: {
            provider: 'openai',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: 'YOUR_API_KEY',
            model: 'gpt-3.5-turbo'
        }
    },
    
    // Performance Goals
    goals: {
        adh: 85,
        weighted_sph: 100,
        email_sph: 2.1,
        phone_sph: 3.5,
        chat_sph: 2.9,
        tnps: 57,
        qa_score: 92,
        call_refusals: 10 // This is a "less than" goal
    },
    
    // Features
    features: {
        useMockData: true,
        aiCoaching: true,
        managerMode: true,
        realTimeSync: true,
        exportData: true
    },
    
    // Chart configurations
    charts: {
        trendChart: null
    },
    
    // Current user data - Initialize with defaults
    currentUser: {
        name: '',
        role: 'IC', // 'IC' or 'Manager'
        selectedIC: '',
        selectedMonth: new Date().toISOString().slice(0, 7) // Current month
    }
};

// Application State
let appState = {
    performanceData: [],
    trendData: [],
    developmentGoals: [],
    tnpsSurveys: [],
    coachingRecommendations: [],
    dataSourceStatuses: {
        googleSheets: 'connected',
        tableau: 'disconnected',
        redash: 'disconnected',
        salesforce: 'disconnected'
    }
};

// DOM Elements - Will be populated after DOM is loaded
let elements = {};

// Utility Functions
const utils = {
    // Format numbers for display
    formatNumber: (value, decimals = 1) => {
        if (value === null || value === undefined) return '--';
        return Number(value).toFixed(decimals);
    },
    
    // Format percentage
    formatPercentage: (value) => {
        if (value === null || value === undefined) return '--';
        return `${Number(value).toFixed(1)}%`;
    },
    
    // Calculate percentage change
    calculateChange: (current, previous) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    },
    
    // Determine metric status
    getMetricStatus: (current, goal, isLessThanGoal = false) => {
        if (current === null || current === undefined) return 'unknown';
        
        if (isLessThanGoal) {
            // For metrics like call refusals where lower is better
            if (current <= goal) return 'success';
            if (current <= goal * 1.2) return 'warning';
            return 'danger';
        } else {
            // For metrics where higher is better
            if (current >= goal) return 'success';
            if (current >= goal * 0.8) return 'warning';
            return 'danger';
        }
    },
    
    // Generate unique ID
    generateId: () => Math.random().toString(36).substr(2, 9),
    
    // Show/hide loading
    showLoading: () => elements.loadingOverlay?.classList.remove('hidden'),
    hideLoading: () => elements.loadingOverlay?.classList.add('hidden'),
    
    // Show toast notification
    showToast: (message, type = 'info') => {
        // Create toast element if it doesn't exist
        let toast = document.querySelector('.toast-container');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast-container';
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
            `;
            document.body.appendChild(toast);
        }
        
        const toastElement = document.createElement('div');
        toastElement.className = `toast toast-${type}`;
        toastElement.style.cssText = `
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            margin-bottom: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            animation: slideInRight 0.3s ease;
        `;
        toastElement.textContent = message;
        
        toast.appendChild(toastElement);
        
        setTimeout(() => {
            toastElement.remove();
        }, 5000);
    }
};

// Data Connector Classes
class DataConnector {
    constructor(name, endpoint) {
        this.name = name;
        this.endpoint = endpoint;
        this.isConnected = false;
    }
    
    async connect() {
        try {
            // Simulate connection attempt
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.isConnected = true;
            this.updateStatus('connected');
            return true;
        } catch (error) {
            this.isConnected = false;
            this.updateStatus('disconnected');
            console.error(`Failed to connect to ${this.name}:`, error);
            return false;
        }
    }
    
    updateStatus(status) {
        const statusElement = document.getElementById(`${this.name.toLowerCase()}-status`);
        if (statusElement) {
            statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
            statusElement.className = `status-indicator status-${status}`;
        }
    }
    
    async fetchData(query = {}) {
        if (!this.isConnected) {
            throw new Error(`${this.name} is not connected`);
        }
        
        // This would be implemented differently for each data source
        // For now, return mock data
        return this.getMockData();
    }
    
    getMockData() {
        return [];
    }
}

class GoogleSheetsConnector extends DataConnector {
    constructor() {
        super('google', CONFIG.endpoints.googleSheets);
    }
    
    async fetchData(query = {}) {
        if (!this.isConnected && !CONFIG.features?.useMockData) {
            throw new Error('Google Sheets connector is not connected');
        }
        
        // Use mock data if configured or in fallback mode
        if (CONFIG.features?.useMockData !== false || this.endpoint.includes('YOUR_GOOGLE_SCRIPT_ID')) {
            return this.getMockData();
        }
        
        try {
            const response = await fetch(this.endpoint, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            return data;
        } catch (error) {
            console.error('Google Sheets fetch error:', error);
            // Fallback to mock data on error
            utils.showToast('Using demo data - check Google Sheets connection', 'warning');
            return this.getMockData();
        }
    }
    
    getMockData() {
        // Generate mock performance data for the last 6 months
        const months = [];
        const currentDate = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push({
                month: date.toISOString().slice(0, 7),
                monthName: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                adh: 82 + Math.random() * 15,
                weighted_sph: 95 + Math.random() * 20,
                email_sph: 1.8 + Math.random() * 1.0,
                phone_sph: 3.0 + Math.random() * 1.5,
                chat_sph: 2.5 + Math.random() * 1.0,
                tnps: 50 + Math.random() * 20,
                qa_score: 88 + Math.random() * 10,
                call_refusals: Math.floor(Math.random() * 15)
            });
        }
        
        return months;
    }
}

class TableauConnector extends DataConnector {
    constructor() {
        super('tableau', CONFIG.endpoints.tableau);
    }
}

class RedashConnector extends DataConnector {
    constructor() {
        super('redash', CONFIG.endpoints.redash);
    }
}

class SalesforceConnector extends DataConnector {
    constructor() {
        super('salesforce', CONFIG.endpoints.salesforce);
    }
}

// AI Coaching Service
class AICoachingService {
    constructor() {
        this.apiKey = 'your-openai-api-key'; // Replace with your actual API key
    }
    
    async generateCoaching(metric, currentValue, goalValue, historicalData = []) {
        // In a real implementation, this would call an LLM API
        return this.getMockCoaching(metric, currentValue, goalValue);
    }
    
    getMockCoaching(metric, currentValue, goalValue) {
        const coachingTips = {
            adh: [
                "Focus on staying logged in during your scheduled hours",
                "Review your break patterns - are you taking breaks at optimal times?",
                "Consider using productivity techniques like the Pomodoro method"
            ],
            weighted_sph: [
                "Analyze your call distribution across different contact types",
                "Practice handling common inquiries more efficiently",
                "Review successful colleagues' techniques for faster resolution"
            ],
            email_sph: [
                "Use email templates for common responses",
                "Batch similar emails together for efficiency",
                "Set up keyboard shortcuts for frequently used phrases"
            ],
            phone_sph: [
                "Practice active listening to reduce call duration",
                "Prepare standard responses for common questions",
                "Use hold time effectively to research customer issues"
            ],
            chat_sph: [
                "Master keyboard shortcuts and quick responses",
                "Handle multiple chats by prioritizing urgent issues",
                "Use saved responses for common questions"
            ],
            tnps: [
                "Focus on empathy and understanding customer pain points",
                "Follow up proactively on customer issues",
                "Ask for feedback and act on customer suggestions"
            ],
            qa_score: [
                "Review your recent call recordings for improvement areas",
                "Practice compliance requirements regularly",
                "Ask your supervisor for specific feedback on QA criteria"
            ],
            call_refusals: [
                "Review refusal reasons and address common patterns",
                "Improve your rapport-building skills at call start",
                "Practice handling objections with empathy"
            ]
        };
        
        const tips = coachingTips[metric] || ["Continue monitoring this metric and maintain consistency"];
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        
        const gap = goalValue - currentValue;
        const priority = Math.abs(gap) > goalValue * 0.2 ? 'high' : 
                        Math.abs(gap) > goalValue * 0.1 ? 'medium' : 'low';
        
        return {
            metric,
            priority,
            recommendation: randomTip,
            actions: this.getActionItems(metric),
            confidence: 0.85
        };
    }
    
    getActionItems(metric) {
        const actions = {
            adh: ["Track login/logout times", "Set calendar reminders", "Review schedule adherence"],
            weighted_sph: ["Analyze call data", "Practice common scenarios", "Shadow top performers"],
            email_sph: ["Create templates", "Use shortcuts", "Batch processing"],
            phone_sph: ["Review call recordings", "Practice scripts", "Improve note-taking"],
            chat_sph: ["Use quick responses", "Multi-chat management", "Keyboard shortcuts"],
            tnps: ["Customer follow-up", "Empathy training", "Feedback collection"],
            qa_score: ["Review QA rubric", "Practice compliance", "Supervisor coaching"],
            call_refusals: ["Rapport building", "Objection handling", "Call opening scripts"]
        };
        
        return actions[metric] || ["Monitor and maintain"];
    }
}

// Main Application Class
class PerformanceDashboard {
    constructor() {
        this.dataConnectors = {
            googleSheets: new GoogleSheetsConnector(),
            tableau: new TableauConnector(),
            redash: new RedashConnector(),
            salesforce: new SalesforceConnector()
        };
        
        this.aiCoaching = new AICoachingService();
        this.init();
    }
    
    async init() {
        utils.showLoading();
        
        try {
            // Initialize DOM elements first
            this.initializeDOMElements();
            
            // Initialize user data
            await this.initializeUser();
            
            // Connect to data sources
            await this.connectDataSources();
            
            // Load initial data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Render initial dashboard
            await this.renderDashboard();
            
            utils.hideLoading();
            utils.showToast('Dashboard loaded successfully!', 'success');
        } catch (error) {
            console.error('Dashboard initialization failed:', error);
            utils.hideLoading();
            utils.showToast('Failed to load dashboard', 'error');
        }
    }
    
    initializeDOMElements() {
        // Initialize all DOM element references
        elements = {
            loadingOverlay: document.getElementById('loading-overlay'),
            icSelect: document.getElementById('ic-select'),
            monthSelect: document.getElementById('month-select'),
            refreshButton: document.getElementById('refresh-data'),
            managerControls: document.getElementById('manager-controls'),
            userName: document.getElementById('user-name'),
            userRole: document.getElementById('user-role'),
            mtdMetrics: document.getElementById('mtd-metrics'),
            trendChart: document.getElementById('trend-chart'),
            coachingContent: document.getElementById('coaching-content'),
            developmentGoals: document.getElementById('development-goals'),
            tnpsContent: document.getElementById('tnps-content'),
            currentTnps: document.getElementById('current-tnps')
        };
        
        // Log any missing elements for debugging
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                console.warn(`DOM element '${key}' not found`);
            }
        });
    }
    
    async initializeUser() {
        // Ensure currentUser object exists and has default values
        if (!CONFIG.currentUser) {
            CONFIG.currentUser = {
                name: '',
                role: 'IC',
                selectedIC: '',
                selectedMonth: new Date().toISOString().slice(0, 7)
            };
        }
        
        // In a real app, this would fetch user data from authentication service
        CONFIG.currentUser.name = 'John Smith'; // Mock user
        CONFIG.currentUser.role = 'IC'; // Could be 'Manager'
        
        console.log('Initializing user:', CONFIG.currentUser); // Debug log
        
        // Safely update user display elements
        if (elements.userName) {
            elements.userName.textContent = CONFIG.currentUser.name;
        } else {
            console.warn('userName element not found');
        }
        
        if (elements.userRole) {
            elements.userRole.textContent = CONFIG.currentUser.role;
        } else {
            console.warn('userRole element not found');
        }
        
        // Show manager controls if user is a manager
        if (CONFIG.currentUser.role === 'Manager' && elements.managerControls) {
            elements.managerControls.style.display = 'flex';
        }
        
        // For demo, add some mock ICs
        const mockICs = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson'];
        if (elements.icSelect) {
            mockICs.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
                elements.icSelect.appendChild(option);
            });
            
            // Set default selection
            elements.icSelect.value = CONFIG.currentUser.name;
        }
        
        // Populate months
        this.populateMonthOptions();
    }
    
    populateMonthOptions() {
        if (!elements.monthSelect) {
            console.warn('monthSelect element not found');
            return;
        }
        
        const currentDate = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const option = document.createElement('option');
            option.value = date.toISOString().slice(0, 7);
            option.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            elements.monthSelect.appendChild(option);
        }
    }
    
    async connectDataSources() {
        const connections = Object.values(this.dataConnectors).map(connector => 
            connector.connect().catch(error => {
                console.warn(`Failed to connect to ${connector.name}:`, error);
                return false;
            })
        );
        
        await Promise.all(connections);
    }
    
    async loadData() {
        try {
            // Load performance data
            appState.performanceData = await this.dataConnectors.googleSheets.fetchData();
            
            // Generate mock development goals
            appState.developmentGoals = this.generateMockDevelopmentGoals();
            
            // Generate mock tNPS surveys
            appState.tnpsSurveys = this.generateMockTnpsSurveys();
            
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }
    
    generateMockDevelopmentGoals() {
        return [
            {
                id: utils.generateId(),
                title: 'Improve Email Response Time',
                description: 'Increase email SPH to meet goal of 2.1 by end of quarter',
                targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                priority: 'high',
                progress: 65,
                status: 'in-progress'
            },
            {
                id: utils.generateId(),
                title: 'Customer Satisfaction Focus',
                description: 'Improve tNPS score through better customer engagement',
                targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                priority: 'medium',
                progress: 30,
                status: 'in-progress'
            },
            {
                id: utils.generateId(),
                title: 'Quality Assurance Excellence',
                description: 'Achieve consistent QA scores above 95%',
                targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                priority: 'medium',
                progress: 80,
                status: 'in-progress'
            }
        ];
    }
    
    generateMockTnpsSurveys() {
        return [
            {
                id: utils.generateId(),
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                score: 8,
                feedback: "Agent was very helpful and resolved my issue quickly. Great experience!",
                customerType: "Premium"
            },
            {
                id: utils.generateId(),
                date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                score: 6,
                feedback: "The solution worked but it took longer than expected to get help.",
                customerType: "Standard"
            },
            {
                id: utils.generateId(),
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
                score: 9,
                feedback: "Excellent service! The agent went above and beyond to help me.",
                customerType: "Enterprise"
            }
        ];
    }
    
    setupEventListeners() {
        // Filter change listeners
        if (elements.icSelect) {
            elements.icSelect.addEventListener('change', () => this.renderDashboard());
        }
        if (elements.monthSelect) {
            elements.monthSelect.addEventListener('change', () => this.renderDashboard());
        }
        
        // Refresh button
        if (elements.refreshButton) {
            elements.refreshButton.addEventListener('click', () => this.refreshData());
        }
        
        // Manager controls
        const editGoalsBtn = document.getElementById('edit-goals-btn');
        if (editGoalsBtn) {
            editGoalsBtn.addEventListener('click', () => this.showGoalEditor());
        }
        
        const addDevGoalBtn = document.getElementById('add-development-goal');
        if (addDevGoalBtn) {
            addDevGoalBtn.addEventListener('click', () => this.showDevelopmentGoalModal());
        }
        
        // Modal close listeners
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });
        
        // Data source sync
        const syncBtn = document.getElementById('sync-all-sources');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncAllDataSources());
        }
    }
    
    async renderDashboard() {
        const selectedIC = elements.icSelect?.value || CONFIG.currentUser.name;
        const selectedMonth = elements.monthSelect?.value || CONFIG.currentUser.selectedMonth;
        
        // Update current selections
        CONFIG.currentUser.selectedIC = selectedIC;
        CONFIG.currentUser.selectedMonth = selectedMonth;
        
        // Find current month data
        const currentData = appState.performanceData.find(data => 
            data.month === selectedMonth
        ) || appState.performanceData[appState.performanceData.length - 1] || {};
        
        // Render all sections
        await Promise.all([
            this.renderMTDMetrics(currentData),
            this.renderTrendChart(),
            this.renderCoachingRecommendations(currentData),
            this.renderDevelopmentGoals(),
            this.renderTnpsSurveys()
        ]);
    }
    
    async renderMTDMetrics(data) {
        if (!elements.mtdMetrics) return;
        
        const metrics = [
            { key: 'adh', name: 'ADH', unit: '%', goal: CONFIG.goals.adh },
            { key: 'weighted_sph', name: 'Weighted SPH', unit: '', goal: CONFIG.goals.weighted_sph },
            { key: 'email_sph', name: 'Email SPH', unit: '', goal: CONFIG.goals.email_sph },
            { key: 'phone_sph', name: 'Phone SPH', unit: '', goal: CONFIG.goals.phone_sph },
            { key: 'chat_sph', name: 'Chat SPH', unit: '', goal: CONFIG.goals.chat_sph },
            { key: 'tnps', name: 'tNPS', unit: '', goal: CONFIG.goals.tnps },
            { key: 'qa_score', name: 'QA Score', unit: '%', goal: CONFIG.goals.qa_score },
            { key: 'call_refusals', name: 'Call Refusals', unit: '', goal: CONFIG.goals.call_refusals, isLessThan: true }
        ];
        
        elements.mtdMetrics.innerHTML = '';
        
        metrics.forEach(metric => {
            const current = data[metric.key] || 0;
            const status = utils.getMetricStatus(current, metric.goal, metric.isLessThan);
            const progress = metric.isLessThan ? 
                Math.max(0, Math.min(100, ((metric.goal - current) / metric.goal) * 100)) :
                Math.max(0, Math.min(100, (current / metric.goal) * 100));
            
            const card = document.createElement('div');
            card.className = `metric-card metric-${status} slide-up`;
            
            card.innerHTML = `
                <div class="metric-header">
                    <div class="metric-title">${metric.name}</div>
                    <div class="metric-status status-${status}">
                        <i class="fas fa-${status === 'success' ? 'check' : status === 'warning' ? 'exclamation-triangle' : 'times'}"></i>
                        ${status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                </div>
                <div class="metric-values">
                    <div class="metric-current">${utils.formatNumber(current)}${metric.unit}</div>
                    <div class="metric-goal">Goal: ${metric.isLessThan ? '<' : '>'}${metric.goal}${metric.unit}</div>
                </div>
                <div class="metric-progress">
                    <div class="metric-progress-bar progress-${status}" style="width: ${progress}%"></div>
                </div>
                <div class="metric-change ${Math.random() > 0.5 ? 'change-positive' : 'change-negative'}">
                    <i class="fas fa-arrow-${Math.random() > 0.5 ? 'up' : 'down'}"></i>
                    ${utils.formatNumber(Math.random() * 10, 1)}% vs last month
                </div>
            `;
            
            elements.mtdMetrics.appendChild(card);
        });
    }
    
    async renderTrendChart() {
        if (!elements.trendChart) return;
        
        const ctx = elements.trendChart.getContext('2d');
        
        // Destroy existing chart
        if (CONFIG.charts.trendChart) {
            CONFIG.charts.trendChart.destroy();
        }
        
        const labels = appState.performanceData.map(data => data.monthName);
        const datasets = [
            {
                label: 'ADH %',
                data: appState.performanceData.map(data => data.adh),
                borderColor: '#007bff',
                backgroundColor: 'rgba(0, 123, 255, 0.1)',
                tension: 0.4
            },
            {
                label: 'tNPS',
                data: appState.performanceData.map(data => data.tnps),
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.1)',
                tension: 0.4
            },
            {
                label: 'QA Score %',
                data: appState.performanceData.map(data => data.qa_score),
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                tension: 0.4
            }
        ];
        
        CONFIG.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance Trends (Last 6 Months)'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }
    
    async renderCoachingRecommendations(data) {
        if (!elements.coachingContent) return;
        
        // Generate coaching for underperforming metrics
        const recommendations = [];
        
        const metrics = [
            { key: 'adh', name: 'ADH', goal: CONFIG.goals.adh },
            { key: 'weighted_sph', name: 'Weighted SPH', goal: CONFIG.goals.weighted_sph },
            { key: 'email_sph', name: 'Email SPH', goal: CONFIG.goals.email_sph },
            { key: 'phone_sph', name: 'Phone SPH', goal: CONFIG.goals.phone_sph },
            { key: 'chat_sph', name: 'Chat SPH', goal: CONFIG.goals.chat_sph },
            { key: 'tnps', name: 'tNPS', goal: CONFIG.goals.tnps },
            { key: 'qa_score', name: 'QA Score', goal: CONFIG.goals.qa_score },
            { key: 'call_refusals', name: 'Call Refusals', goal: CONFIG.goals.call_refusals, isLessThan: true }
        ];
        
        for (const metric of metrics) {
            const current = data[metric.key] || 0;
            const isUnderperforming = metric.isLessThan ? 
                current > metric.goal : 
                current < metric.goal;
            
            if (isUnderperforming) {
                const coaching = await this.aiCoaching.generateCoaching(
                    metric.key, 
                    current, 
                    metric.goal, 
                    appState.performanceData.map(d => d[metric.key])
                );
                recommendations.push({ ...coaching, name: metric.name });
            }
        }
        
        if (recommendations.length === 0) {
            elements.coachingContent.innerHTML = `
                <div class="coaching-placeholder">
                    <i class="fas fa-trophy"></i>
                    <p>Great job! All metrics are meeting their goals.</p>
                    <p>Keep up the excellent work!</p>
                </div>
            `;
            return;
        }
        
        const coachingHTML = recommendations.map(rec => `
            <div class="coaching-card priority-${rec.priority} fade-in">
                <div class="coaching-header">
                    <div class="coaching-metric">${rec.name}</div>
                    <div class="coaching-priority priority-${rec.priority}">${rec.priority.toUpperCase()}</div>
                </div>
                <div class="coaching-text">${rec.recommendation}</div>
                <div class="coaching-actions">
                    ${rec.actions.map(action => `<span class="action-item">${action}</span>`).join('')}
                </div>
            </div>
        `).join('');
        
        elements.coachingContent.innerHTML = `<div class="coaching-recommendations">${coachingHTML}</div>`;
    }
    
    async renderDevelopmentGoals() {
        if (!elements.developmentGoals) return;
        
        if (appState.developmentGoals.length === 0) {
            elements.developmentGoals.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-target" style="font-size: 2rem; opacity: 0.5;"></i>
                    <p style="margin-top: 1rem;">No development goals set.</p>
                </div>
            `;
            return;
        }
        
        const goalsHTML = appState.developmentGoals.map(goal => `
            <div class="goal-item fade-in">
                <div class="goal-header">
                    <div class="goal-title">${goal.title}</div>
                    <div class="goal-priority priority-${goal.priority}">${goal.priority.toUpperCase()}</div>
                </div>
                <div class="goal-description">${goal.description}</div>
                <div class="goal-footer">
                    <div class="goal-target-date">
                        <i class="fas fa-calendar"></i>
                        Target: ${new Date(goal.targetDate).toLocaleDateString()}
                    </div>
                    <div class="goal-progress">
                        <i class="fas fa-chart-line"></i>
                        ${goal.progress}% Complete
                    </div>
                </div>
            </div>
        `).join('');
        
        elements.developmentGoals.innerHTML = goalsHTML;
    }
    
    async renderTnpsSurveys() {
        if (!elements.tnpsContent || !elements.currentTnps) return;
        
        // Calculate current tNPS
        const scores = appState.tnpsSurveys.map(survey => survey.score);
        const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        elements.currentTnps.textContent = utils.formatNumber(avgScore * 10, 0); // Convert to tNPS scale
        
        if (appState.tnpsSurveys.length === 0) {
            elements.tnpsContent.innerHTML = `
                <div class="text-center text-muted">
                    <i class="fas fa-comments" style="font-size: 2rem; opacity: 0.5;"></i>
                    <p style="margin-top: 1rem;">No recent surveys available.</p>
                </div>
            `;
            return;
        }
        
        const surveysHTML = appState.tnpsSurveys.map(survey => {
            const scoreColor = survey.score >= 8 ? 'success' : survey.score >= 6 ? 'warning' : 'danger';
            
            return `
                <div class="tnps-survey fade-in">
                    <div class="survey-header">
                        <div class="survey-score text-${scoreColor}">${survey.score}/10</div>
                        <div class="survey-date">${new Date(survey.date).toLocaleDateString()}</div>
                    </div>
                    <div class="survey-feedback">"${survey.feedback}"</div>
                    <div class="survey-actions">
                        <h4>Suggested Actions:</h4>
                        <ul class="action-list">
                            ${this.getTnpsActions(survey.score).map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        }).join('');
        
        elements.tnpsContent.innerHTML = `<div class="tnps-surveys">${surveysHTML}</div>`;
    }
    
    getTnpsActions(score) {
        if (score >= 8) {
            return [
                "Ask for referrals or testimonials",
                "Document what went well for training",
                "Continue the same approach"
            ];
        } else if (score >= 6) {
            return [
                "Follow up to ensure issue is resolved",
                "Ask for specific improvement feedback",
                "Review interaction for learning opportunities"
            ];
        } else {
            return [
                "Immediate supervisor review required",
                "Customer recovery process needed",
                "Additional training may be beneficial"
            ];
        }
    }
    
    async refreshData() {
        utils.showLoading();
        
        try {
            await this.loadData();
            await this.renderDashboard();
            utils.hideLoading();
            utils.showToast('Data refreshed successfully!', 'success');
        } catch (error) {
            console.error('Failed to refresh data:', error);
            utils.hideLoading();
            utils.showToast('Failed to refresh data', 'error');
        }
    }
    
    async syncAllDataSources() {
        utils.showLoading();
        
        try {
            await this.connectDataSources();
            await this.refreshData();
            utils.showToast('All data sources synced!', 'success');
        } catch (error) {
            console.error('Failed to sync data sources:', error);
            utils.hideLoading();
            utils.showToast('Failed to sync data sources', 'error');
        }
    }
    
    showGoalEditor() {
        const modal = document.getElementById('goal-editor-modal');
        if (modal) {
            // Populate current goals
            Object.keys(CONFIG.goals).forEach(key => {
                const input = document.getElementById(`${key.replace('_', '-')}-goal`);
                if (input) {
                    input.value = CONFIG.goals[key];
                }
            });
            
            modal.classList.add('show');
        }
    }
    
    showDevelopmentGoalModal() {
        const modal = document.getElementById('dev-goal-modal');
        if (modal) {
            modal.classList.add('show');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
        }
    }
}

// Modal Functions (Global)
function closeModal(modalId) {
    dashboard.closeModal(modalId);
}

function saveGoals() {
    const form = document.getElementById('goals-form');
    const formData = new FormData(form);
    
    // Update goals
    for (const [key, value] of formData.entries()) {
        CONFIG.goals[key] = parseFloat(value);
    }
    
    dashboard.closeModal('goal-editor-modal');
    dashboard.renderDashboard();
    utils.showToast('Goals updated successfully!', 'success');
}

function saveDevelopmentGoal() {
    const form = document.getElementById('dev-goal-form');
    const formData = new FormData(form);
    
    const newGoal = {
        id: utils.generateId(),
        title: formData.get('title'),
        description: formData.get('description'),
        targetDate: formData.get('target_date'),
        priority: formData.get('priority'),
        progress: 0,
        status: 'pending'
    };
    
    appState.developmentGoals.push(newGoal);
    
    // Clear form
    form.reset();
    
    dashboard.closeModal('dev-goal-modal');
    dashboard.renderDevelopmentGoals();
    utils.showToast('Development goal added!', 'success');
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    }
}

// Initialize Dashboard
let dashboard;

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dashboard...');
    console.log('CONFIG available:', !!CONFIG);
    console.log('CONFIG.currentUser:', CONFIG.currentUser);
    
    try {
        dashboard = new PerformanceDashboard();
    } catch (error) {
        console.error('Failed to create dashboard:', error);
        
        // Show error message to user
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                <h1 style="color: #dc3545;">Dashboard Error</h1>
                <p>There was an error initializing the dashboard.</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <p>Please check the console for more details.</p>
                <button onclick="window.location.reload()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Reload Page
                </button>
            </div>
        `;
    }
});

// Handle authentication (mock)
document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        window.location.reload();
    }
});

// Export for use in other modules
window.PerformanceDashboard = PerformanceDashboard;
window.CONFIG = CONFIG;