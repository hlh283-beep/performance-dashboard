// Data Validation Helper for Performance Management Dashboard
// Use this to test your data connections and validate data formats

class DataValidator {
    constructor() {
        this.requiredFields = [
            'ic_name',
            'month', 
            'adh',
            'weighted_sph',
            'email_sph', 
            'phone_sph',
            'chat_sph',
            'tnps',
            'qa_score',
            'call_refusals'
        ];
    }
    
    // Test Google Sheets connection
    async testGoogleSheets(url) {
        console.log('🧪 Testing Google Sheets connection...');
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            console.log('✅ Google Sheets connection successful');
            console.log(`📊 Records found: ${data.length}`);
            
            if (data.length > 0) {
                this.validateDataStructure(data[0], 'Google Sheets');
                this.validateDataQuality(data);
            }
            
            return { success: true, data, recordCount: data.length };
            
        } catch (error) {
            console.error('❌ Google Sheets connection failed:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    // Validate data structure
    validateDataStructure(sample, sourceName) {
        console.log(`🔍 Validating ${sourceName} data structure...`);
        
        const sampleKeys = Object.keys(sample).map(key => key.toLowerCase().replace(/\s+/g, '_'));
        const missing = [];
        const extra = [];
        
        // Check for missing required fields
        this.requiredFields.forEach(field => {
            if (!sampleKeys.includes(field.toLowerCase())) {
                missing.push(field);
            }
        });
        
        // Check for extra fields
        sampleKeys.forEach(key => {
            if (!this.requiredFields.includes(key.toLowerCase())) {
                extra.push(key);
            }
        });
        
        if (missing.length === 0) {
            console.log('✅ All required fields present');
        } else {
            console.warn('⚠️  Missing required fields:', missing);
        }
        
        if (extra.length > 0) {
            console.log('ℹ️  Extra fields found:', extra);
        }
        
        console.log('📋 Sample record:', sample);
        
        return { missing, extra, valid: missing.length === 0 };
    }
    
    // Validate data quality
    validateDataQuality(data) {
        console.log('🔍 Validating data quality...');
        
        const issues = [];
        const stats = {
            totalRecords: data.length,
            nullValues: 0,
            invalidDates: 0,
            outOfRangeValues: 0
        };
        
        data.forEach((record, index) => {
            // Check for null/undefined values
            Object.entries(record).forEach(([key, value]) => {
                if (value === null || value === undefined || value === '') {
                    stats.nullValues++;
                    issues.push(`Record ${index + 1}: ${key} is empty`);
                }
            });
            
            // Validate month format
            if (record.month && !record.month.match(/^\d{4}-\d{2}$/)) {
                stats.invalidDates++;
                issues.push(`Record ${index + 1}: Invalid month format '${record.month}' (expected YYYY-MM)`);
            }
            
            // Validate numeric ranges
            const numericChecks = [
                { field: 'adh', min: 0, max: 100 },
                { field: 'qa_score', min: 0, max: 100 },
                { field: 'tnps', min: -100, max: 100 },
                { field: 'weighted_sph', min: 0, max: 1000 },
                { field: 'email_sph', min: 0, max: 50 },
                { field: 'phone_sph', min: 0, max: 50 },
                { field: 'chat_sph', min: 0, max: 50 },
                { field: 'call_refusals', min: 0, max: 100 }
            ];
            
            numericChecks.forEach(check => {
                const value = parseFloat(record[check.field]);
                if (!isNaN(value) && (value < check.min || value > check.max)) {
                    stats.outOfRangeValues++;
                    issues.push(`Record ${index + 1}: ${check.field} value ${value} is outside expected range ${check.min}-${check.max}`);
                }
            });
        });
        
        console.log('📊 Data Quality Stats:', stats);
        
        if (issues.length === 0) {
            console.log('✅ Data quality validation passed');
        } else {
            console.warn('⚠️  Data quality issues found:');
            issues.slice(0, 10).forEach(issue => console.warn(`   ${issue}`));
            if (issues.length > 10) {
                console.warn(`   ... and ${issues.length - 10} more issues`);
            }
        }
        
        return { stats, issues, valid: issues.length < data.length * 0.1 }; // Allow up to 10% issues
    }
    
    // Test API endpoint connectivity
    async testEndpoint(url, headers = {}) {
        console.log(`🧪 Testing endpoint: ${url}`);
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    ...headers
                }
            });
            
            console.log(`✅ Endpoint responded with status: ${response.status}`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const data = await response.json();
                console.log('📄 Response type: JSON');
                console.log('📊 Response sample:', JSON.stringify(data).substring(0, 200) + '...');
            } else {
                console.log('📄 Response type:', contentType || 'unknown');
            }
            
            return { success: true, status: response.status };
            
        } catch (error) {
            console.error('❌ Endpoint test failed:', error.message);
            return { success: false, error: error.message };
        }
    }
    
    // Generate sample data template
    generateSampleData() {
        const sampleData = [];
        const currentDate = new Date();
        const icNames = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emma Wilson', 'David Brown'];
        
        for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
            const month = date.toISOString().slice(0, 7);
            
            icNames.forEach(icName => {
                sampleData.push({
                    ic_name: icName,
                    month: month,
                    adh: 80 + Math.random() * 20,
                    weighted_sph: 90 + Math.random() * 30,
                    email_sph: 1.5 + Math.random() * 1.5,
                    phone_sph: 2.5 + Math.random() * 2.0,
                    chat_sph: 2.0 + Math.random() * 1.5,
                    tnps: 45 + Math.random() * 30,
                    qa_score: 85 + Math.random() * 15,
                    call_refusals: Math.floor(Math.random() * 15)
                });
            });
        }
        
        return sampleData;
    }
    
    // Export sample data as CSV
    exportSampleCSV() {
        const data = this.generateSampleData();
        const headers = Object.keys(data[0]);
        
        let csv = headers.join(',') + '\n';
        data.forEach(row => {
            csv += headers.map(header => row[header]).join(',') + '\n';
        });
        
        console.log('📋 Sample CSV data:');
        console.log(csv);
        
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'performance_data_sample.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        
        return csv;
    }
}

// Global validator instance
window.dataValidator = new DataValidator();

// Console helper functions
window.testGoogleSheets = async (url) => {
    return await window.dataValidator.testGoogleSheets(url || CONFIG.endpoints.googleSheets);
};

window.validateData = (data) => {
    if (data && data.length > 0) {
        return window.dataValidator.validateDataStructure(data[0], 'Manual');
    } else {
        console.error('No data provided for validation');
    }
};

window.generateSample = () => {
    return window.dataValidator.generateSampleData();
};

window.exportSample = () => {
    return window.dataValidator.exportSampleCSV();
};

console.log('🔧 Data Validator loaded. Available commands:');
console.log('   testGoogleSheets(url) - Test Google Sheets connection');
console.log('   validateData(data) - Validate data structure');
console.log('   generateSample() - Generate sample data');
console.log('   exportSample() - Export sample CSV');
console.log('   dataValidator - Access full validator instance');
