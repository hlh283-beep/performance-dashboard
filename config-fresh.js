// FRESH Configuration - No Caching Issues
window.DASHBOARD_CONFIG = {
    endpoints: {
        googleSheets: 'https://script.google.com/a/macros/gusto.com/s/AKfycbxcRym6pZX4k9dXY5XTjHAUB5oLHYN50QdyAOUpMtzkFaq8YIjPCQcO1nOYW8Bho1Y7/exec',
        tableau: {
            server: 'https://your-tableau-server.com',
            apiVersion: '3.19',
            siteId: 'your-site-id',
            username: 'your-username'
        },
        redash: {
            baseUrl: 'https://your-redash-instance.com/api',
            apiKey: 'YOUR_REDASH_API_KEY_HERE',
            queryIds: {
                performanceMetrics: 123,
                trendData: 124,
                tnpsSurveys: 125
            }
        },
        salesforce: {
            instanceUrl: 'https://your-company.salesforce.com',
            apiVersion: 'v57.0',
            clientId: 'YOUR_SALESFORCE_CLIENT_ID',
            clientSecret: 'YOUR_SALESFORCE_CLIENT_SECRET'
        },
        aiCoaching: {
            provider: 'openai',
            endpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: 'YOUR_OPENAI_API_KEY_HERE',
            model: 'gpt-3.5-turbo',
            maxTokens: 500,
            temperature: 0.7
        }
    },
    
    goals: {
        adh: 85,
        weightedSph: 100,
        emailSph: 2.1,
        phoneSph: 3.5,
        chatSph: 2.9,
        tnps: 57,
        qaScore: 92,
        callRefusals: 10
    },
    
    features: {
        useMockData: true,       // ENABLED FOR IMMEDIATE TESTING
        aiCoaching: true,
        managerMode: true,
        realTimeSync: true,
        exportData: true
    },
    
    refreshIntervals: {
        dashboard: 300000,
        realTime: 60000,
        charts: 180000
    },
    
    charts: {
        trendChart: null
    },
    
    currentUser: {
        name: '',
        role: 'IC',
        selectedIC: '',
        selectedMonth: new Date().toISOString().slice(0, 7)
    }
};

console.log('🚀 FRESH CONFIG LOADED - Mock Data Enabled');
