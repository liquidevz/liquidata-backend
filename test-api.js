/**
 * API Connection Test Script
 * Run this to verify all API endpoints are working correctly
 * 
 * Usage: node test-api.js
 */

const API_BASE = 'http://localhost:5001';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
};

// Test data
const testContactSubmission = {
  name: 'Test User',
  company: 'Test Company',
  goal: 'Build a test application',
  date: '2024-12-31',
  budget: '4l-8l',
  email: 'test@example.com',
  details: 'This is a test submission',
  privacyPolicy: true
};

const testCalculatorSubmission = {
  selections: {
    projectType: 'web-app',
    selectedIndustries: ['SaaS'],
    selectedServices: ['web-development'],
    selectedFeatures: ['User management'],
    scope: 'mvp',
    team: 'small',
    timeline: 'standard',
    support: 'basic'
  },
  result: {
    basePrice: 50000,
    finalPrice: 125000,
    lowEstimate: 100000,
    highEstimate: 150000,
    gstAmount: 22500,
    totalWithGST: 147500,
    currency: 'INR',
    estimateRange: '₹1,00,000 - ₹1,50,000',
    formattedPrice: '₹1,25,000',
    formattedTotal: '₹1,47,500'
  },
  contactInfo: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+91 9876543210',
    company: 'Test Company'
  }
};

// Test functions
async function testHealthCheck() {
  log.title('Testing Health Check Endpoint');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      log.success(`Health check passed - Server is running`);
      log.info(`Timestamp: ${data.timestamp}`);
      return true;
    } else {
      log.error('Health check failed');
      return false;
    }
  } catch (error) {
    log.error(`Cannot connect to server: ${error.message}`);
    log.warn('Make sure the backend server is running on port 5001');
    return false;
  }
}

async function testContactSubmission() {
  log.title('Testing Contact Form Submission');
  try {
    const response = await fetch(`${API_BASE}/api/contact-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testContactSubmission)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log.success('Contact submission created successfully');
      log.info(`Submission ID: ${data._id}`);
      return data._id;
    } else {
      log.error(`Failed to create contact submission: ${data.error}`);
      return null;
    }
  } catch (error) {
    log.error(`Contact submission test failed: ${error.message}`);
    return null;
  }
}

async function testGetContactSubmissions() {
  log.title('Testing Get Contact Submissions');
  try {
    const response = await fetch(`${API_BASE}/api/contact-submissions`);
    const data = await response.json();
    
    if (response.ok) {
      log.success(`Retrieved ${data.length} contact submission(s)`);
      return true;
    } else {
      log.error('Failed to get contact submissions');
      return false;
    }
  } catch (error) {
    log.error(`Get submissions test failed: ${error.message}`);
    return false;
  }
}

async function testCalculatorSubmission() {
  log.title('Testing Calculator Submission');
  try {
    const response = await fetch(`${API_BASE}/api/calculator-submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCalculatorSubmission)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      log.success('Calculator submission created successfully');
      log.info(`Submission ID: ${data._id}`);
      log.info(`Estimated Price: ${testCalculatorSubmission.result.formattedTotal}`);
      return data._id;
    } else {
      log.error(`Failed to create calculator submission: ${data.error}`);
      return null;
    }
  } catch (error) {
    log.error(`Calculator submission test failed: ${error.message}`);
    return null;
  }
}

async function testGetCalculatorSubmissions() {
  log.title('Testing Get Calculator Submissions');
  try {
    const response = await fetch(`${API_BASE}/api/calculator-submissions`);
    const data = await response.json();
    
    if (response.ok) {
      log.success(`Retrieved ${data.length} calculator submission(s)`);
      return true;
    } else {
      log.error('Failed to get calculator submissions');
      return false;
    }
  } catch (error) {
    log.error(`Get calculator submissions test failed: ${error.message}`);
    return false;
  }
}

async function testGetCalculator() {
  log.title('Testing Get Calculator Configuration');
  try {
    const response = await fetch(`${API_BASE}/api/calculator`);
    const data = await response.json();
    
    if (response.ok) {
      log.success('Calculator configuration retrieved');
      log.info(`Base Price: ₹${data.basePrice?.toLocaleString('en-IN') || 'N/A'}`);
      log.info(`Currency: ${data.currency || 'INR'}`);
      return true;
    } else {
      log.error('Failed to get calculator configuration');
      return false;
    }
  } catch (error) {
    log.error(`Get calculator test failed: ${error.message}`);
    return false;
  }
}

async function testSwaggerDocs() {
  log.title('Testing Swagger Documentation');
  try {
    const response = await fetch(`${API_BASE}/api-docs`);
    
    if (response.ok) {
      log.success('Swagger documentation is accessible');
      log.info(`Visit: ${API_BASE}/api-docs`);
      return true;
    } else {
      log.warn('Swagger documentation not found');
      return false;
    }
  } catch (error) {
    log.error(`Swagger test failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}API Connection Test Suite${colors.reset}`);
  console.log(`${colors.yellow}Testing API at: ${API_BASE}${colors.reset}`);
  console.log('='.repeat(60));
  
  const results = {
    passed: 0,
    failed: 0
  };
  
  // Test 1: Health Check (critical)
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    log.error('Cannot proceed with tests - server is not responding');
    process.exit(1);
  }
  results.passed++;
  
  // Test 2: Swagger Docs
  const swaggerOk = await testSwaggerDocs();
  if (swaggerOk) results.passed++;
  else results.failed++;
  
  // Test 3: Get Calculator Config
  const calcConfigOk = await testGetCalculator();
  if (calcConfigOk) results.passed++;
  else results.failed++;
  
  // Test 4: Contact Form Submission
  const contactId = await testContactSubmission();
  if (contactId) results.passed++;
  else results.failed++;
  
  // Test 5: Get Contact Submissions
  const getContactOk = await testGetContactSubmissions();
  if (getContactOk) results.passed++;
  else results.failed++;
  
  // Test 6: Calculator Submission
  const calculatorId = await testCalculatorSubmission();
  if (calculatorId) results.passed++;
  else results.failed++;
  
  // Test 7: Get Calculator Submissions
  const getCalcOk = await testGetCalculatorSubmissions();
  if (getCalcOk) results.passed++;
  else results.failed++;
  
  // Summary
  log.title('Test Results Summary');
  console.log('='.repeat(60));
  console.log(`${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.cyan}Total:  ${results.passed + results.failed}${colors.reset}`);
  console.log('='.repeat(60));
  
  if (results.failed === 0) {
    log.success('All tests passed! API is working correctly.');
    log.info('You can now use the frontend application.');
    log.info(`Frontend should use: NEXT_PUBLIC_API_URL=${API_BASE}`);
  } else {
    log.warn(`${results.failed} test(s) failed. Please check the errors above.`);
  }
  
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});

