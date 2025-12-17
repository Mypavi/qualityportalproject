# Quality Management Portal

A comprehensive SAP UI5 application for Quality Management processes, including inspection lots management, result recording, and usage decisions.

## Overview

This Quality Management Portal is designed based on the Functional Requirements Specification (FRS) for SAP ERP Portal Assessment. It provides Quality Engineers with a complete interface to manage:

- **Quality Engineer Authentication** - Secure login using SAP credentials
- **Inspection Lots Management** - View and manage inspection lots with detailed information
- **Result Records** - Track inspection results and decisions
- **Usage Decisions** - Monitor usage decisions and their status

## Architecture

The application follows SAP UI5 best practices and integrates with multiple OData services:

### OData Services
1. **Login Service** (`ZQM_LOG_PR_CDS`) - User authentication
2. **Inspection Service** (`ZQM_INSPECT_PR_CDS`) - Inspection lots data
3. **Result Service** (`ZQM_RESULT_PR_CDS`) - Result records
4. **Usage Service** (`ZQM_US_PR_CDS`) - Usage decisions

### Key Features

#### 🔐 Authentication System
- Secure login with User ID and Password validation
- Session management with user context
- Automatic redirection for unauthorized access

#### 📊 Quality Metrics Dashboard
- Real-time quality metrics display
- Total lots, pending, approved, and rejected counts
- Visual status indicators

#### 🔍 Inspection Lots Management
- Comprehensive inspection lots listing
- Detailed lot information with drill-down capability
- Status-based filtering and sorting
- Interactive lot selection with detailed views

#### 📋 Result Records Tracking
- Complete result records with inspector information
- Date-based tracking and filtering
- Stock categorization (Unrestricted, Block, Production)
- Recording status monitoring

#### ⚖️ Usage Decision Management
- Usage decision tracking and monitoring
- Decision status validation (Allowed/Blocked)
- Quantity matching verification
- Decision message display

## Technical Implementation

### Frontend Architecture
- **Framework**: SAP UI5 (v1.143.2)
- **Design**: SAP Fiori design principles
- **Routing**: Single Page Application with multiple views
- **Data Binding**: Two-way data binding with JSON models
- **Responsive Design**: Mobile-first approach

### Key Components

#### Controllers
- `Login.controller.js` - Handles authentication logic
- `Dashboard.controller.js` - Main dashboard functionality
- `App.controller.js` - Application-level controller

#### Views
- `Login.view.xml` - Login interface
- `Dashboard.view.xml` - Main dashboard with tabbed interface
- `App.view.xml` - Application shell

#### Utilities
- `ServiceHelper.js` - OData service integration helper
- `models.js` - Model initialization and configuration

#### Fragments
- `InspectionDetails.fragment.xml` - Detailed inspection lot dialog

## Business Logic Implementation

### Quality Process Workflow

1. **Login Validation**
   - User credentials verified against SAP system via `ZQM_LOG_PR_CDS`
   - Custom login table (Z-table) validation
   - Session management for authenticated users

2. **Inspection Lot Processing**
   - Display inspection lots based on user authorization
   - Show lot details including quantities and materials
   - Track inspection status and decisions

3. **Result Recording**
   - Record inspection results with proper categorization
   - Validate quantity matching between lot and inspected quantities
   - Ensure proper stock categorization

4. **Usage Decision Logic**
   - Implement business rules for usage decisions
   - Validate decision codes (A=Approved, R=Rejected, R2=Rework)
   - Ensure quantity consistency checks

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- SAP system with configured OData services

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure OData Services**:
   The application is pre-configured with the following services:
   - Login: `/sap/opu/odata/sap/ZQM_LOG_PR_CDS/`
   - Inspection: `/sap/opu/odata/sap/ZQM_INSPECT_PR_CDS/`
   - Results: `/sap/opu/odata/sap/ZQM_RESULT_PR_CDS/`
   - Usage: `/sap/opu/odata/sap/ZQM_US_PR_CDS/`

3. **Start the application**:
   ```bash
   npm start
   ```

4. **Start with mock data** (for development):
   ```bash
   npm run start-mock
   ```

## Usage Guide

### For Quality Engineers

1. **Login Process**:
   - Enter your SAP User ID and Password (e.g., K901900 / 12345)
   - Click "Login" to authenticate
   - Upon successful login, you'll be redirected to the dashboard

2. **Dashboard Navigation**:
   - **Inspection Lots Tab**: View all inspection lots with quality metrics
   - **Result Records Tab**: Review recorded inspection results
   - **Usage Decision Tab**: Monitor usage decisions and their status

3. **Inspection Lot Management**:
   - Click on any inspection lot to view detailed information
   - Use the "View Results" button to see related result records
   - Use "View Usage Decision" to check decision status

4. **Data Operations**:
   - Use the "Refresh" button in each tab to reload latest data
   - Filter and sort data using table controls
   - Export data if needed

## API Integration

### Service Endpoints

#### Authentication Service
```
GET /sap/opu/odata/sap/ZQM_LOG_PR_CDS/ZQM_LOG_PR(bname='USER',password='PASS')
```

#### Inspection Lots Service
```
GET /sap/opu/odata/sap/ZQM_INSPECT_PR_CDS/ZQM_INSPECT_PR
```

#### Result Records Service
```
GET /sap/opu/odata/sap/ZQM_RESULT_PR_CDS/ZQM_RESULT_PR
```

#### Usage Decisions Service
```
GET /sap/opu/odata/sap/ZQM_US_PR_CDS/ZQM_US_PR
```

## Development

### Project Structure
```
webapp/
├── controller/          # Application controllers
├── view/               # XML views
├── fragment/           # Reusable fragments
├── model/              # Data models
├── utils/              # Utility classes
├── css/                # Custom styles
├── i18n/               # Internationalization
└── manifest.json       # App configuration
```

### Build Commands

- **Development**: `npm start`
- **Mock Development**: `npm run start-mock`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Deploy**: `npm run deploy`

## Application Details

|               |
| ------------- |
|**Generation Date and Time**<br>Tue Dec 16 2025 12:57:44 GMT+0000 (Coordinated Universal Time)|
|**App Generator**<br>SAP Fiori Application Generator|
|**App Generator Version**<br>1.20.0|
|**Generation Platform**<br>SAP Business Application Studio|
|**Template Used**<br>Basic V2|
|**Service Type**<br>SAP System (ABAP On-Premise)|
|**Service URL**<br>http://ecc.virtual:8000/sap/opu/odata/sap/ZQM_LOG_PR_CDS|
|**Module Name**<br>qualityportal|
|**Application Title**<br>Quality Management Portal|
|**UI5 Theme**<br>sap_horizon|
|**UI5 Version**<br>1.143.2|

## Features Implemented Based on FRS

### ✅ Quality Engineer Login (Section 8.2.1)
- User authentication with SAP credentials
- Custom login table validation
- Session management
- Error handling for invalid credentials

### ✅ Quality Engineer Dashboard (Section 8.2.2)
- Three main tiles: Inspection Lots, Result Records, Usage Decision
- Quality metrics display
- Real-time data loading
- Responsive design

### ✅ Inspection Lot Management
- Display inspection lots with all required fields
- Usage decision status tracking
- Lot origin categorization (01-08)
- Quantity tracking (Actual vs Inspected)

### ✅ Result Records
- Inspector name tracking
- Recorded date display
- Usage decision code mapping
- Stock categorization (Unrestricted, Block, Production)
- Recording status management

### ✅ Usage Decision Processing
- Decision status validation (Allowed/Blocked)
- Quantity matching verification
- Decision message display
- Business rule implementation

## Troubleshooting

### Common Issues

1. **Login Issues**:
   - Verify SAP system connectivity
   - Check user credentials (try K901900/12345 for testing)
   - Review OData service configuration

2. **Data Loading Issues**:
   - Check network connectivity
   - Verify OData service availability
   - Review browser console for errors

3. **CORS Issues**:
   - Configure SAP system for cross-origin requests
   - Use SAP Web IDE or BAS for development

## License

This project is licensed under the Apache Software License, version 2.0.

## Support

For issues and questions:
1. Check the browser console for errors
2. Verify OData service responses
3. Review SAP system logs
4. Contact the development team