# Calculator Seed Script Instructions

## Overview
The complete calculator seed script includes **30+ conditional steps** covering all combinations:
- Website projects: ~8 steps
- Web applications: ~20-25 steps  
- Mobile applications: ~22-27 steps
- E-commerce projects: ~30+ steps
- Enterprise + Finance/Healthcare: ~30+ steps

## Running the Seed Script

### Option 1: Complete Calculator (Recommended)
```bash
cd liquidata-backend
node seed-complete-calculator.js
```

This will:
- ✅ Create/update admin user (username: `admin`, password: `admin123`)
- ✅ Seed calculator with 33 steps
- ✅ Configure all pricing rules in INR
- ✅ Set up conditional logic for all step combinations

### Option 2: Indian Pricing Only (Legacy)
```bash
node seed-indian-pricing.js
```

Basic 11-step calculator with Indian pricing.

### Option 3: Auto-seed on Server Start
The server automatically seeds the calculator on startup if none exists.

## Features Included

### Step Categories
1. **Core Steps** (Always shown):
   - Project Type
   - Industries  
   - Services
   - Scope
   - Timeline
   - Support
   - Budget Range

2. **Conditional Steps** (Based on selections):
   - Additional Services
   - Team Size
   - Tech Stack
   - Platforms
   - Core Features
   - Authentication Methods
   - Database Requirements
   - Design Requirements
   - UX Flow Complexity
   - Integrations

3. **Mobile-Specific Steps**:
   - Mobile Features (Push, Camera, AR, etc.)
   - App Store Requirements
   - Device Features

4. **Web App-Specific Steps**:
   - Web Technologies (PWA, WebSockets, SSR)
   - Performance Requirements
   - SEO Requirements

5. **E-commerce Steps** (If E-commerce selected):
   - Payment Methods
   - Inventory Management
   - Shipping & Logistics
   - Tax & Compliance

6. **Compliance Steps** (Finance/Healthcare/Insurance):
   - Compliance Requirements (HIPAA, PCI-DSS, GDPR)
   - Security Standards
   - Data Privacy
   - Audit Requirements

7. **AI/ML Steps** (If AI/ML features selected):
   - AI/ML Requirements
   - Data Analytics
   - Model Training
   - Recommendation Engines

8. **Infrastructure Steps**:
   - Hosting & Infrastructure
   - Scalability Requirements
   - DevOps & CI/CD
   - Quality Assurance

### Pricing Configuration

All prices are in **INR (Indian Rupees)**:
- Base Price: ₹75,000
- Min Price: ₹25,000
- Max Price: ₹50,00,000
- GST Rate: 18%
- Estimate Variance: ±25%

### Pricing Rules Included

1. **Project Type Multipliers**:
   - Website: 0.4x
   - Web App: 1.0x
   - Mobile App: 1.3x
   - Desktop App: 1.1x
   - API/Backend: 0.8x
   - Hardware: 1.8x

2. **Industry Multipliers**:
   - Healthcare: 1.4x
   - Finance: 1.5x
   - Government: 1.3x
   - E-commerce: 1.2x
   - Startup: 0.9x (discount)
   - etc.

3. **Feature Costs**:
   - User Management: ₹25,000
   - Authentication: ₹15,000
   - Payment Processing: ₹35,000
   - E-commerce: ₹60,000
   - AI/ML Features: ₹75,000
   - etc.

4. **Platform Costs**:
   - Web: ₹0 (base)
   - iOS: ₹40,000
   - Android: ₹35,000
   - Windows/macOS: ₹30,000
   - Linux: ₹25,000

5. **Service Costs**:
   - Mobile Development: +₹30,000
   - UI/UX Design: +₹25,000
   - Backend Development: +₹35,000
   - DevOps: +₹25,000
   - Hardware Design: +₹75,000

6. **Support Packages**:
   - Basic (3 months): ₹15,000
   - Standard (6 months): ₹35,000
   - Premium (12 months): ₹75,000
   - Enterprise (24/7): ₹1,50,000

## Realtime Calculations

The calculator performs **realtime INR price calculations** using:
- Multipliers (project type, industry, scope, team, timeline)
- Additive costs (features, services, platforms, integrations)
- GST calculation (18%)
- Estimate range (±25% variance)

All calculations are done client-side in real-time as users make selections.

## Contact Modal

The contact form is now a **modal** instead of a step:
- Appears when user clicks "Get Quote" on estimate step
- Beautiful gradient design with animations
- Success animation after submission
- Auto-redirects to home page after 5 seconds

## Dashboard API

Comprehensive dashboard API at `/api/admin/dashboard`:
- Real-time statistics
- Time range filtering (7d, 30d, 90d, 1y)
- Growth calculations
- Average project values
- Top project types, industries, features
- Daily trends
- Recent activity
- Performance metrics

## Testing

After seeding:
1. Start the backend: `npm start`
2. Visit calculator: http://localhost:3000/calculator
3. Try different project types to see conditional steps
4. Check estimate calculations in INR
5. Submit to see contact modal and success animation
6. Visit admin dashboard to see analytics

## Troubleshooting

If calculator doesn't load:
1. Check MongoDB connection
2. Run seed script again
3. Check console for errors
4. Verify backend is running on port 5001

## Notes

- The seed script is **idempotent** - safe to run multiple times
- Existing calculator data will be replaced
- Admin user will be created if doesn't exist
- All prices are configured for Indian market
- Conditional logic is JSON-based and stored in database

