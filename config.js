// Production Configuration for Performance Management Dashboard
// Replace the mock data with your actual API endpoints

window.DASHBOARD_CONFIG = {
    // ===========================================
    // DATA SOURCE ENDPOINTS
    // ===========================================
    
    endpoints: {
        // GOOGLE SHEETS CONFIGURATION  
        // Direct Google Apps Script URL - Replace with YOUR script URL
        googleSheets: 'https://script.google.com/a/macros/gusto.com/s/AKfycbxC2QYsyDnu7m__DvEXV36jDyJiZ07Gh6FL59X2QS8z8zoDYnpWvclhCK4HqV7n-1-X/exec',
        
        // TABLEAU CONFIGURATION
        tableau: {
            server: 'https://your-tableau-server.com',  // Your Tableau Server URL
            apiVersion: '3.19',                         // API version
            siteId: 'your-site-id',                    // Your site ID (or leave empty for default)
            username: 'your-username',                  // Your Tableau username
            // Note: Use personal access tokens for production
        },
        
        // REDASH CONFIGURATION
        redash: {
            baseUrl: 'https://your-redash-instance.com/api',  // Your Redash instance URL
            apiKey: 'YOUR_REDASH_API_KEY_HERE',               // Your Redash API key
            queryIds: {
                performanceMetrics: 123,  // Query ID for performance metrics
                trendData: 124,          // Query ID for trend analysis
                tnpsSurveys: 125         // Query ID for tNPS surveys
            }
        },
        
        // SALESFORCE CONFIGURATION
        salesforce: {
            instanceUrl: 'https://your-instance.salesforce.com',  // Your Salesforce instance
            apiVersion: 'v58.0',                                   // API version
            // OAuth configuration for Connected App
            clientId: 'YOUR_SALESFORCE_CLIENT_ID',
            clientSecret: 'YOUR_SALESFORCE_CLIENT_SECRET',
            username: 'your-salesforce-username',
            password: 'your-password-plus-security-token'
        },
        
        // AI COACHING CONFIGURATION
        aiCoaching: {
            provider: 'openai',  // Options: 'openai', 'anthropic', 'azure', 'google'
            endpoint: 'https://api.openai.com/v1/chat/completions',
            apiKey: 'YOUR_OPENAI_API_KEY_HERE',  // Replace with your actual API key
            model: 'gpt-3.5-turbo',  // or 'gpt-4' for better results
            maxTokens: 500,
            temperature: 0.7
        }
    },
    
    // ===========================================
    // PERFORMANCE GOALS (CUSTOMIZABLE)
    // ===========================================
    
    goals: {
        adh: 85,                // ADH Goal: >85%
        weighted_sph: 100,      // Weighted SPH Goal: 100%
        email_sph: 2.1,         // Email SPH Goal: >2.1
        phone_sph: 3.5,         // Phone SPH Goal: >3.5
        chat_sph: 2.9,          // Chat SPH Goal: >2.9
        tnps: 57,               // tNPS Goal: >57
        qa_score: 92,           // QA Score Goal: >92%
        call_refusals: 10       // Call Refusals Goal: <10
    },
    
    // ===========================================
    // FEATURE CONFIGURATION
    // ===========================================
    
    features: {
        useMockData: false,     // Set to false for production data
        aiCoaching: true,       // Enable AI coaching
        managerMode: true,      // Enable manager controls
        realTimeSync: true,     // Enable real-time data sync
        exportData: true        // Enable data export features
    },
    
    // ===========================================
    // REFRESH INTERVALS (in milliseconds)
    // ===========================================
    
    refreshIntervals: {
        metrics: 300000,        // 5 minutes
        coaching: 600000,       // 10 minutes
        trends: 900000,         // 15 minutes
        tnps: 1800000          // 30 minutes
    },
    
    // ===========================================
    // CURRENT USER DATA (INITIALIZED BY SYSTEM)
    // ===========================================
    
    currentUser: {
        name: '',
        role: 'IC',             // 'IC' or 'Manager'
        selectedIC: '',
        selectedMonth: new Date().toISOString().slice(0, 7) // Current month
    },
    
    // ===========================================
    // CHART CONFIGURATIONS
    // ===========================================
    
    charts: {
        trendChart: null
    }
};

// ===========================================
// REQUIRED DATA FORMATS
// ===========================================

/* 
GOOGLE SHEETS EXPECTED DATA FORMAT:
Your Google Sheet should have columns:
- IC Name
- Month (YYYY-MM format)
- ADH
- Weighted_SPH
- Email_SPH
- Phone_SPH
- Chat_SPH
- tNPS
- QA_Score
- Call_Refusals

EXAMPLE GOOGLE APPS SCRIPT:
function doGet() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
*/
