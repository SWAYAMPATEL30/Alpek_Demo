const fs = require('fs');
const path = require('path');

console.log('--- Building Alpek Sourcing OS in exact REA design system ---');

// 1. Read clean views
const views = [
  'view-supplier-portal',
  'view-requester',
  'view-manager',
  'view-tech-eval',
  'view-comm-eval',
  'view-approver',
  'view-receiving',
  'view-order-closure',
  'view-excel-erp',
  'view-sap-erp',
  'view-cig-integration'
];

const viewHtmlMap = {};
views.forEach(v => {
  viewHtmlMap[v] = fs.readFileSync(path.join(__dirname, `clean_${v}.html`), 'utf8');
});

// 2. Construct Head using REA's assets and tokens
const headHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Alpek Sourcing OS: Clean Core S/4HANA Strategic Sourcing Platform</title>
  
  <!-- REA Design System & Fonts -->
  <link rel="stylesheet" href="/css/rea-styles.css" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
  
  <style>
    /* REA Custom Overrides for Procurement Workflows */
    :root {
      --brand-green: #059669;
      --brand-green-bg: #ecfdf5;
      --brand-green-line: #a7f3d0;
      --brand-red: #dc2626;
      --brand-red-bg: #fef2f2;
      --brand-red-line: #fca5a5;
    }
    
    [data-theme="dark"] {
      --brand-green: #34d399;
      --brand-green-bg: #064e3b;
      --brand-green-line: #047857;
      --brand-red: #f87171;
      --brand-red-bg: #7f1d1d;
      --brand-red-line: #991b1b;
    }

    body {
      background: var(--page);
      color: var(--ink);
      font-family: var(--font-sans);
      margin: 0;
      padding: 0;
    }

    /* Universal Hidden Utility */
    .hidden {
      display: none !important;
    }

    /* Specific Display Modes when not hidden */
    #cxml-drawer:not(.hidden) {
      display: flex !important;
    }
    #modalNewReq:not(.hidden) {
      display: flex !important;
    }
    #export-toast:not(.hidden) {
      display: block !important;
    }

    /* Workspace Views */
    .workspace-view {
      display: none !important;
    }
    .workspace-view.active {
      display: block !important;
    }

    /* REA Enhanced Layout Containers */
    .rea-container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* REA Cards */
    .rea-card {
      background: var(--page);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }
    
    /* REA Metric Strip */
    .rea-metric-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .rea-metric-card {
      background: var(--page);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .rea-metric-title {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .rea-metric-val {
      font-family: var(--font-mono);
      font-size: 2rem;
      font-weight: 700;
      color: var(--ink);
      margin: 0.5rem 0;
      line-height: 1;
    }
    .rea-metric-sub {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      display: inline-block;
      width: fit-content;
    }

    /* REA Clean Nav Pills */
    .rea-nav-pills {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: var(--soft);
      padding: 0.25rem;
      border-radius: 6px;
      border: 1px solid var(--line);
      overflow-x: auto;
    }
    .rea-nav-btn {
      background: transparent;
      border: none;
      color: var(--muted);
      font-weight: 500;
      font-size: 0.8rem;
      padding: 0.4rem 0.85rem;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.15s ease;
    }
    .rea-nav-btn:hover {
      color: var(--ink);
    }
    .rea-nav-btn.active {
      background: var(--page);
      color: var(--ink);
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
    }

    /* REA Step Pipeline */
    .rea-pipeline {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.75rem;
      margin: 1.5rem 0;
    }
    @media (max-width: 900px) {
      .rea-pipeline {
        grid-template-columns: 1fr;
      }
    }
    .rea-step-node {
      background: var(--page);
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 0.85rem 1rem;
      cursor: pointer;
      transition: all 0.15s ease;
      position: relative;
    }
    .rea-step-node:hover {
      border-color: var(--accent);
    }
    .rea-step-node.active {
      border-color: var(--accent);
      border-left: 3px solid var(--accent);
      background: var(--soft);
    }
    .rea-step-num {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .rea-step-title {
      font-weight: 650;
      font-size: 0.85rem;
      color: var(--ink);
      margin: 0.2rem 0;
    }
    .rea-step-sub {
      font-size: 0.75rem;
      color: var(--muted);
    }

    /* REA Modern Table */
    .rea-table-wrap {
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow-x: auto;
      background: var(--page);
    }
    .rea-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
      text-align: left;
    }
    .rea-table th {
      background: var(--soft);
      color: var(--muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--line);
    }
    .rea-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--line);
      color: var(--ink);
    }
    .rea-table tr:hover {
      background: var(--soft);
    }
    .rea-table tr.winner-highlight td {
      background: rgba(5, 150, 105, 0.04);
    }
    .rea-table tr.winner-highlight td:nth-child(3) {
      background: rgba(5, 150, 105, 0.08);
      font-weight: 600;
    }

    /* Buttons */
    .rea-btn {
      background: var(--ink);
      color: var(--page);
      border: 1px solid var(--ink);
      border-radius: 6px;
      padding: 0.45rem 1rem;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .rea-btn:hover {
      opacity: 0.9;
    }
    .rea-btn-secondary {
      background: var(--page);
      color: var(--ink);
      border: 1px solid var(--line);
    }
    .rea-btn-secondary:hover {
      background: var(--soft);
    }
    .rea-btn-success {
      background: var(--brand-green);
      color: #ffffff;
      border-color: var(--brand-green);
    }

    /* Matrix Hidden Rows */
    .matrix-hidden {
      display: none !important;
    }

    /* Modals Backdrop */
    .sap-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(2px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .sap-dialog {
      background: var(--page);
      border: 1px solid var(--line);
      border-radius: 8px;
      max-width: 560px;
      width: 100%;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    .sap-dialog-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid var(--line);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .sap-dialog-body {
      padding: 1.25rem;
      font-size: 0.85rem;
    }
    .sap-dialog-close {
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--muted);
    }
  </style>
</head>
<body id="top">
`;

// 3. REA Site Header with Brand, Navigation Tabs, and Quick Actions
const siteHeaderHtml = `
<!-- ========================================================================= -->
<!-- REA Site Header (Clean, Functional, Developer-Grade)                      -->
<!-- ========================================================================= -->
<header class="site-header" style="position: sticky; top: 0; z-index: 50; background: var(--page); border-bottom: 1px solid var(--line);">
  <div class="container header-inner" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem;">
    <!-- Shell Left: REA Brand Identity -->
    <a class="brand" href="javascript:void(0)" onclick="toggleBrandNavigation()" style="text-decoration: none; display: flex; align-items: center; gap: 0.75rem;" title="Toggle Platform Overview">
      <span class="brand-name" style="font-weight: 750; font-size: 1.2rem; color: var(--ink);">Alpek Sourcing OS</span>
      <span class="brand-caption" style="font-size: 0.75rem; color: var(--muted); padding: 0.1rem 0.5rem; background: var(--soft); border: 1px solid var(--line); border-radius: 4px;">
        Clean Core S/4HANA
      </span>
      <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--brand-green); display: inline-flex; align-items: center; gap: 0.3rem;">
        ● 14ms OData v4
      </span>
    </a>

    <!-- Shell Center: High-Speed Tabs -->
    <nav class="rea-nav-pills" aria-label="Workspaces">
      <button class="rea-nav-btn active" onclick="switchMainTab('sourcing')">Sourcing Events</button>
      <button class="rea-nav-btn" onclick="switchMainTab('requester')">Intake & PRs</button>
      <button class="rea-nav-btn" onclick="switchMainTab('orders')">Purchase Orders</button>
      <button class="rea-nav-btn" onclick="switchMainTab('supplier')">Supplier Cockpit</button>
      <button class="rea-nav-btn" onclick="switchMainTab('excel')">ERP Sheets</button>
      <button class="rea-nav-btn" onclick="switchMainTab('sap')">SAP GUI (ME53N)</button>
      <button class="rea-nav-btn" onclick="switchMainTab('integration')">CIG Integration</button>
    </nav>

    <!-- Shell Right: Profile & Theme Toggle & 1-Click Logout -->
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <button onclick="openNewReqModal()" class="rea-btn rea-btn-success" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">
        <span class="material-symbols-outlined" style="font-size: 14px;">add</span>
        <span>New PR</span>
      </button>

      <!-- User Profile Pill -->
      <div style="position: relative;">
        <div id="appUserProfileBtn" onclick="toggleUserDropdown(event)" style="display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0.75rem; background: var(--soft); border: 1px solid var(--line); border-radius: 6px; cursor: pointer; font-size: 0.8rem; user-select: none;">
          <span style="font-weight: 700; background: var(--ink); color: var(--page); width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.65rem;">VM</span>
          <span id="appUserName" style="font-weight: 600; color: var(--ink);">Valeria Martinez</span>
          <span class="material-symbols-outlined" style="font-size: 14px; color: var(--muted);">expand_more</span>
        </div>

        <!-- Profile Dropdown -->
        <div id="userDropdownMenu" class="hidden" style="position: absolute; right: 0; margin-top: 0.5rem; width: 260px; background: var(--page); border: 1px solid var(--line); border-radius: 6px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); padding: 1rem; z-index: 100; font-size: 0.8rem;">
          <div style="padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--line);">
            <div style="font-weight: 700; color: var(--ink);">Valeria Martinez</div>
            <div style="font-size: 0.7rem; color: var(--muted);">Procurement Buyer</div>
            <div style="font-family: var(--font-mono); font-size: 0.65rem; color: var(--muted);">valeria.martinez@abccompany.com</div>
          </div>
          <button type="button" onclick="signOutToLogin()" class="rea-btn" style="width: 100%; justify-content: center; background: var(--brand-red-bg); color: var(--brand-red); border: 1px solid var(--brand-red-line); font-size: 0.75rem;">
            <span class="material-symbols-outlined" style="font-size: 14px;">logout</span>
            <span>Sign Out to Portal</span>
          </button>
        </div>
      </div>

      <!-- 1-Click Logout Icon Button -->
      <button type="button" onclick="signOutToLogin()" title="Sign Out of Corporate Session" style="background: var(--page); border: 1px solid var(--line); border-radius: 6px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--muted);">
        <span class="material-symbols-outlined" style="font-size: 16px;">logout</span>
      </button>
    </div>
  </div>
</header>
`;

// 4. REA Executive Metrics Strip
const metricStripHtml = `
<section class="rea-container">
  <div class="rea-metric-grid">
    <div class="rea-metric-card">
      <div class="rea-metric-title">
        <span>Inbound Demand</span>
        <span class="material-symbols-outlined" style="font-size: 16px;">description</span>
      </div>
      <div class="rea-metric-val">71</div>
      <div>
        <span class="rea-metric-sub" style="background: var(--soft); color: var(--muted); border: 1px solid var(--line);">
          37 Pending Mgr Approval
        </span>
      </div>
    </div>

    <div class="rea-metric-card">
      <div class="rea-metric-title">
        <span>Active Sourcing RFQs</span>
        <span class="material-symbols-outlined" style="font-size: 16px; color: var(--brand-green);">schedule</span>
      </div>
      <div class="rea-metric-val">1</div>
      <div>
        <span class="rea-metric-sub" style="background: var(--brand-green-bg); color: var(--brand-green); border: 1px solid var(--brand-green-line);">
          Round 1 Bidding Active
        </span>
      </div>
    </div>

    <div class="rea-metric-card">
      <div class="rea-metric-title">
        <span>Supplier Quotations</span>
        <span class="material-symbols-outlined" style="font-size: 16px;">groups</span>
      </div>
      <div class="rea-metric-val">4</div>
      <div>
        <span class="rea-metric-sub" style="background: var(--brand-green-bg); color: var(--brand-green); border: 1px solid var(--brand-green-line);">
          14.3% Verified Savings
        </span>
      </div>
    </div>

    <div class="rea-metric-card">
      <div class="rea-metric-title">
        <span>Internal Approval</span>
        <span class="material-symbols-outlined" style="font-size: 16px;">verified</span>
      </div>
      <div class="rea-metric-val">0</div>
      <div>
        <span class="rea-metric-sub" style="background: var(--soft); color: var(--muted); border: 1px solid var(--line);">
          Award Approved
        </span>
      </div>
    </div>

    <div class="rea-metric-card">
      <div class="rea-metric-title">
        <span>S/4HANA Committed POs</span>
        <span class="material-symbols-outlined" style="font-size: 16px; color: var(--accent);">cloud_done</span>
      </div>
      <div class="rea-metric-val">3</div>
      <div>
        <span class="rea-metric-sub" style="background: var(--soft); color: var(--accent); border: 1px solid var(--line);">
          Clean Core OData Sync
        </span>
      </div>
    </div>
  </div>
</section>
`;

// 5. REA Multi-Step Interactive Workflow Pipeline
const pipelineHtml = `
<section class="rea-container">
  <div class="rea-card" style="margin-bottom: 1.5rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--line);">
      <div>
        <div style="font-weight: 700; font-size: 0.95rem; color: var(--ink);">Intake-to-Procure Lifecycle Orchestration</div>
        <div style="font-size: 0.75rem; color: var(--muted);">Autonomous routing from Requisition Intake to S/4HANA Clean Core PO creation</div>
      </div>
      <span style="font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; color: var(--brand-green); background: var(--brand-green-bg); padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--brand-green-line);">
        ● Doc2432956265 Active
      </span>
    </div>

    <div class="rea-pipeline">
      <div onclick="switchMainTab('requester')" class="rea-step-node" title="View Inbound Requisition">
        <div class="rea-step-num">01 / Intake PR</div>
        <div class="rea-step-title">PR-3000010443</div>
        <div class="rea-step-sub">7,125,000 units Refri</div>
        <div style="font-size: 0.7rem; color: var(--brand-green); font-weight: 600; margin-top: 0.35rem;">✓ Approved by Mgr</div>
      </div>

      <div onclick="switchMainTab('sourcing')" class="rea-step-node active" title="View Sourcing Tender">
        <div class="rea-step-num" style="color: var(--brand-red);">02 / Bidding RFQ</div>
        <div class="rea-step-title">Doc2432956265</div>
        <div class="rea-step-sub">3 Sealed Bids Evaluated</div>
        <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--brand-red); font-weight: 700; margin-top: 0.35rem;">● 00:54:02 Left</div>
      </div>

      <div onclick="switchMainTab('sourcing')" class="rea-step-node" title="Two-Envelope Evaluation">
        <div class="rea-step-num">03 / Adjudication</div>
        <div class="rea-step-title">Two-Envelope Matrix</div>
        <div class="rea-step-sub">Tech (95/100) & Commercial</div>
        <div style="font-size: 0.7rem; color: var(--muted); margin-top: 0.35rem;">SONDA Colombia (Rec #1)</div>
      </div>

      <div onclick="switchMainTab('approver')" class="rea-step-node" title="Committee Approval">
        <div class="rea-step-num">04 / Committee Sign-Off</div>
        <div class="rea-step-title">Carlos Fonseca</div>
        <div class="rea-step-sub">Head of Sourcing</div>
        <div style="font-size: 0.7rem; color: var(--brand-green); font-weight: 600; margin-top: 0.35rem;">✓ Ready to Commit</div>
      </div>

      <div onclick="switchMainTab('sap')" class="rea-step-node" title="S/4HANA PO Sync">
        <div class="rea-step-num" style="color: var(--accent);">05 / S/4HANA PO</div>
        <div class="rea-step-title">PO #450009180</div>
        <div class="rea-step-sub">Direct OData v4 Post</div>
        <div style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--accent); font-weight: 600; margin-top: 0.35rem;">14ms • Clean Core</div>
      </div>
    </div>
  </div>
</section>
`;

// 6. REA Strategic Sourcing Workspace (Two-Envelope Matrix + Intelligence Cockpit)
const sourcingWorkspaceHtml = `
<div id="view-sourcing-events" class="workspace-view active">
  <div class="rea-container" style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 3rem;">
    
    <!-- Hero Tender Banner with Countdown -->
    <div class="rea-card" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem;">
      <div style="flex: 1; min-width: 300px;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--brand-red); background: var(--brand-red-bg); padding: 0.15rem 0.5rem; border-radius: 4px; border: 1px solid var(--brand-red-line);">
            ACTIVE COUNTDOWN
          </span>
          <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--muted);">
            ID: Doc2432956265
          </span>
        </div>
        <h1 style="font-size: 1.75rem; font-weight: 750; color: var(--ink); margin: 0 0 0.25rem 0; letter-spacing: -0.02em;">
          Strategic Sourcing Tender
        </h1>
        <p style="font-size: 0.85rem; color: var(--muted); margin: 0;">
          Two-envelope technical and commercial bidding adjudication for verified petrochemical & operational suppliers.
        </p>
      </div>

      <!-- Urgency Timer -->
      <div style="background: var(--soft); border: 1px solid var(--line); border-radius: 6px; padding: 0.75rem 1.25rem; text-align: center; min-width: 180px;">
        <div style="font-size: 0.7rem; font-weight: 700; color: var(--muted); text-transform: uppercase;">TIME REMAINING:</div>
        <div id="tender-countdown-display" style="font-family: var(--font-mono); font-size: 1.75rem; font-weight: 750; color: var(--brand-red); line-height: 1.2;">
          00:54:02
        </div>
        <div style="font-size: 0.7rem; color: var(--muted); display: flex; align-items: center; justify-content: center; gap: 0.25rem;">
          <span class="material-symbols-outlined" style="font-size: 12px;">schedule</span>
          <span>Deadline: 17 Nov, 05:52:02</span>
        </div>
      </div>
    </div>

    <!-- 2-Column Grid: 65% Matrix, 35% Intelligence -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; align-items: start;">
      
      <!-- Left Column: The Two-Envelope Matrix -->
      <div class="rea-card">
        <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--line);">
          <div>
            <h2 style="font-size: 1rem; font-weight: 700; color: var(--ink); margin: 0;">Bid Evaluation Matrix (3 Proposals Evaluated)</h2>
            <div style="font-size: 0.75rem; color: var(--muted);">Commercial, SLA & Quality Parameters evaluated against PR #109482 baseline</div>
          </div>
          <button id="export-report-btn" onclick="exportMatrixReport()" class="rea-btn rea-btn-secondary" style="font-size: 0.75rem; padding: 0.35rem 0.75rem;">
            <span class="material-symbols-outlined" style="font-size: 14px;">download</span>
            <span>Export Report</span>
          </button>
        </div>

        <!-- Filter Buttons -->
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
          <button class="rea-btn matrix-filter-btn" data-view="all" aria-selected="true" onclick="filterMatrixView('all', this)" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;">
            <span>All Criteria (8)</span>
          </button>
          <button class="rea-btn rea-btn-secondary matrix-filter-btn" data-view="commercial" aria-selected="false" onclick="filterMatrixView('commercial', this)" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;">
            <span>Commercial View (4)</span>
          </button>
          <button class="rea-btn rea-btn-secondary matrix-filter-btn" data-view="esg" aria-selected="false" onclick="filterMatrixView('esg', this)" style="font-size: 0.75rem; padding: 0.3rem 0.65rem;">
            <span>ESG & Sustainability (4)</span>
          </button>
        </div>

        <!-- Table -->
        <div class="rea-table-wrap">
          <table class="rea-table">
            <thead>
              <tr>
                <th style="width: 25%;">Evaluation Criteria</th>
                <th style="width: 20%;">Baseline Demand</th>
                <th style="width: 25%; background: var(--brand-green-bg); color: var(--brand-green);">
                  SONDA COLOMBIA (REC #1)
                </th>
                <th style="width: 15%;">Indorama Ventures</th>
                <th style="width: 15%;">BASF Chemicals</th>
              </tr>
            </thead>
            <tbody id="matrix-table-body">
              <tr data-category="technical">
                <td><strong>Technical Compliance</strong><br><small style="color:var(--muted)">Quality & Lab Assay</small></td>
                <td style="font-family:var(--font-mono)">ISO 9001:2015</td>
                <td style="color:var(--brand-green); font-weight:600;">Pass (95/100)</td>
                <td>Pass (91/100)</td>
                <td>Pass (88/100)</td>
              </tr>
              <tr data-category="commercial">
                <td><strong>Delivery SLA</strong><br><small style="color:var(--muted)">Lead time to Morrison</small></td>
                <td style="font-family:var(--font-mono)">≤ 15 days</td>
                <td style="color:var(--brand-green); font-weight:600;">10 days (-5d lead)</td>
                <td>14 days</td>
                <td style="color:var(--brand-red)">18 days (Exceeded)</td>
              </tr>
              <tr data-category="commercial">
                <td><strong>Unit Price</strong><br><small style="color:var(--muted)">Kg delivered (DDP)</small></td>
                <td style="font-family:var(--font-mono)">$3.50 COP</td>
                <td style="font-family:var(--font-mono); color:var(--brand-green); font-weight:700;">$3.00 COP (-14.3%)</td>
                <td style="font-family:var(--font-mono)">$3.35 COP</td>
                <td style="font-family:var(--font-mono)">$3.48 COP</td>
              </tr>
              <tr data-category="commercial">
                <td><strong>Payment Terms</strong><br><small style="color:var(--muted)">Early Pay Discount</small></td>
                <td style="font-family:var(--font-mono)">Net 60 Days</td>
                <td style="color:var(--brand-green); font-weight:600;">Net 90 (2/10 Net 90)</td>
                <td>Net 60 Days</td>
                <td>Net 45 Days</td>
              </tr>
              <tr data-category="esg">
                <td><strong>Scope 3 Carbon</strong><br><small style="color:var(--muted)">CO2e Intensity</small></td>
                <td style="font-family:var(--font-mono)">&lt; 0.55 kg</td>
                <td style="font-family:var(--font-mono); color:var(--brand-green); font-weight:600;">0.42 kg (-24%)</td>
                <td style="font-family:var(--font-mono)">0.51 kg</td>
                <td style="font-family:var(--font-mono); color:var(--brand-red)">0.56 kg (Exceeded)</td>
              </tr>
              <tr data-category="esg">
                <td><strong>EcoVadis Score</strong><br><small style="color:var(--muted)">Circularity Rating</small></td>
                <td>Silver / 65 min</td>
                <td style="color:var(--brand-green); font-weight:600;">Platinum (88/100)</td>
                <td>Gold (74/100)</td>
                <td>Silver (66/100)</td>
              </tr>
              <tr data-category="esg">
                <td><strong>Renewable Energy</strong><br><small style="color:var(--muted)">Plant Morrison Grid</small></td>
                <td>≥ 50% Renewable</td>
                <td style="color:var(--brand-green); font-weight:600;">85% Solar/Hydro</td>
                <td>62% Grid Mix</td>
                <td>45% Fossil Blend</td>
              </tr>
              <tr data-category="commercial" style="background:var(--soft); font-weight:700;">
                <td><strong>Total Commercial Bid</strong><br><small style="color:var(--muted)">7,125,000 Kg Volume</small></td>
                <td style="font-family:var(--font-mono)">$24.93M COP</td>
                <td style="font-family:var(--font-mono); color:var(--brand-green); font-size:1rem;">$21.37M COP (-14.3%)</td>
                <td style="font-family:var(--font-mono)">$23.86M COP</td>
                <td style="font-family:var(--font-mono)">$24.79M COP</td>
              </tr>
              <tr>
                <td><strong>Decision Action</strong></td>
                <td style="color:var(--muted)">PR Baseline</td>
                <td>
                  <button onclick="commitPoNow()" class="rea-btn rea-btn-success" style="width:100%; justify-content:center; font-size:0.75rem;">
                    <span class="material-symbols-outlined" style="font-size:14px;">check_circle</span>
                    <span>Select & Commit</span>
                  </button>
                </td>
                <td><span style="font-size:0.75rem; color:var(--muted)">Standby (Tier 2)</span></td>
                <td><span style="font-size:0.75rem; color:var(--brand-red)">Disqualified</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: var(--muted); margin-top: 0.75rem;">
          <span style="font-family: var(--font-mono);">Audit Verification Hash: SHA-256:d9e76fa9b881a7cf902</span>
          <span style="color: var(--brand-green); font-weight: 600;">Clean Core Certified • Zero Custom Tables</span>
        </div>
      </div>

      <!-- Right Column: REA Intelligence & Terminal Cockpit -->
      <div style="display: flex; flex-direction: column; gap: 1.5rem;">
        
        <!-- Award Summary Card -->
        <div class="rea-card">
          <div style="display: flex; align-items: center; justify-content: space-between; padding-bottom: 0.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid var(--line);">
            <div style="font-weight: 700; font-size: 0.9rem; color: var(--ink);">Award Summary</div>
            <span style="font-size: 0.7rem; font-weight: 600; color: var(--brand-green); background: var(--brand-green-bg); padding: 0.15rem 0.5rem; border-radius: 4px;">
              Final Approval Ready
            </span>
          </div>

          <div style="font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--muted);">Selected Vendor:</span>
              <strong>SONDA Colombia S.A.</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--muted);">SAP Vendor ID:</span>
              <span style="font-family: var(--font-mono);">#800192</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--muted);">Follow-on PO Doc:</span>
              <span style="font-family: var(--font-mono); color: var(--brand-green); font-weight: 700;">PO 450009180</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--muted);">Total Commitment:</span>
              <span style="font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--brand-green);">$21,375,000 COP</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--muted);">Verified Savings:</span>
              <span style="font-weight: 600; color: var(--brand-green);">14.3% Under Baseline</span>
            </div>
          </div>

          <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 0.5rem;">
            <button id="btnCommitOrder" onclick="commitPoNow()" class="rea-btn" style="width: 100%; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 16px;">task_alt</span>
              <span>Commit Purchase Order to S/4HANA</span>
            </button>
            <button onclick="document.getElementById('cxml-drawer').classList.remove('hidden')" class="rea-btn rea-btn-secondary" style="width: 100%; justify-content: center; font-size: 0.75rem;">
              <span class="material-symbols-outlined" style="font-size: 14px;">code</span>
              <span>Inspect cXML 1.2 Payload</span>
            </button>
          </div>
        </div>

        <!-- REA Agent Terminal (Live OData v4 / CLI Output) -->
        <div class="agent-terminal" style="margin: 0;">
          <div class="terminal-header">
            <span class="terminal-title">
              <span class="terminal-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              S/4HANA Clean Core OData v4
            </span>
            <button class="copy-button" type="button" onclick="navigator.clipboard.writeText('rea sap inspect-po 450009180')">Copy</button>
          </div>
          <p class="terminal-prompt" style="font-size: 0.75rem;">
            <span class="prompt-symbol">›</span>
            <span>POST /sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001/PurchaseOrder</span>
          </p>
          <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #a7f3d0; margin-top: 0.5rem; line-height: 1.4;">
            Payload: cXML 1.2 OrderRequest<br>
            Response: 201 Created (14ms)<br>
            Committed PO: 450009180
          </div>
        </div>

        <!-- Supplier Telemetry Radar -->
        <div class="rea-card">
          <div style="font-weight: 700; font-size: 0.85rem; color: var(--ink); margin-bottom: 0.75rem;">
            Supplier Telemetry Radar (95.8% Overall)
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.75rem;">
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                <span style="color: var(--muted);">Technical Specs & Quality</span>
                <strong>95 / 100</strong>
              </div>
              <div style="background: var(--soft); height: 4px; border-radius: 2px;">
                <div style="background: var(--brand-green); width: 95%; height: 100%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                <span style="color: var(--muted);">Financial Health</span>
                <strong>98 / 100</strong>
              </div>
              <div style="background: var(--soft); height: 4px; border-radius: 2px;">
                <div style="background: var(--brand-green); width: 98%; height: 100%;"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
                <span style="color: var(--muted);">Carbon Intensity</span>
                <strong style="color: var(--brand-green);">0.42 kg (-24%)</strong>
              </div>
              <div style="background: var(--soft); height: 4px; border-radius: 2px;">
                <div style="background: var(--brand-green); width: 92%; height: 100%;"></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>

  </div>
</div>
`;

// 7. Modals & Drawers
const modalsHtml = `
<!-- cXML Drawer -->
<div id="cxml-drawer" class="hidden" style="position: fixed; inset: 0; z-index: 100; justify-content: flex-end; background: rgba(0,0,0,0.5);">
  <div style="background: var(--page); width: 100%; max-width: 500px; height: 100%; display: flex; flex-direction: column; box-shadow: -10px 0 25px rgba(0,0,0,0.15);">
    <div style="padding: 1rem 1.25rem; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: space-between; background: var(--ink); color: var(--page);">
      <div style="font-weight: 700; font-size: 0.9rem;">cXML 1.2.040 OrderRequest</div>
      <button onclick="document.getElementById('cxml-drawer').classList.add('hidden')" style="background: transparent; border: none; color: var(--page); cursor: pointer; font-size: 1.2rem;">&times;</button>
    </div>
    <div style="flex: 1; padding: 1rem; overflow-y: auto; background: #0b0f14; color: #a7f3d0; font-family: var(--font-mono); font-size: 0.75rem; line-height: 1.5;">
      <pre>&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;cXML payloadID="1794932242472-881a7cf902@alpek.com"&gt;
  &lt;Header&gt;
    &lt;From&gt;&lt;Credential domain="NetworkID"&gt;&lt;Identity&gt;ALPEK-CORP-PRD&lt;/Identity&gt;&lt;/Credential&gt;&lt;/From&gt;
    &lt;To&gt;&lt;Credential domain="VendorID"&gt;&lt;Identity&gt;SONDA-COLOMBIA-800192&lt;/Identity&gt;&lt;/Credential&gt;&lt;/To&gt;
  &lt;/Header&gt;
  &lt;Request&gt;
    &lt;OrderRequest&gt;
      &lt;OrderRequestHeader orderID="450009180"&gt;
        &lt;Total&gt;&lt;Money currency="COP"&gt;21375000.00&lt;/Money&gt;&lt;/Total&gt;
      &lt;/OrderRequestHeader&gt;
      &lt;ItemOut quantity="7125000"&gt;
        &lt;UnitPrice&gt;&lt;Money currency="COP"&gt;3.00&lt;/Money&gt;&lt;/UnitPrice&gt;
        &lt;UnitOfMeasure&gt;KGM&lt;/UnitOfMeasure&gt;
      &lt;/ItemOut&gt;
    &lt;/OrderRequest&gt;
  &lt;/Request&gt;
&lt;/cXML&gt;</pre>
    </div>
    <div style="padding: 0.75rem 1rem; border-top: 1px solid var(--line); display: flex; justify-content: flex-end;">
      <button onclick="document.getElementById('cxml-drawer').classList.add('hidden')" class="rea-btn">Close Payload</button>
    </div>
  </div>
</div>

<!-- Fast Intake Requisition Modal -->
<div id="modalNewReq" class="hidden sap-modal-backdrop">
  <div class="sap-dialog">
    <div class="sap-dialog-header">
      <div style="font-weight: 700; font-size: 1rem; color: var(--ink);">Submit Purchase Requisition</div>
      <button class="sap-dialog-close" onclick="closeNewReqModal()">&times;</button>
    </div>
    <div class="sap-dialog-body">
      <form id="formNewRequisition" onsubmit="handleNewRequisitionSubmit(event); return false;" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div>
          <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Description</label>
          <input type="text" id="reqDesc" style="width:100%; padding:0.4rem 0.6rem; border:1px solid var(--line); border-radius:4px; font-size:0.8rem; background:var(--page); color:var(--ink);" placeholder="e.g. Industrial Coolants" required>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Quantity</label>
            <input type="number" id="reqQty" style="width:100%; padding:0.4rem 0.6rem; border:1px solid var(--line); border-radius:4px; font-size:0.8rem; background:var(--page); color:var(--ink);" value="5000" required>
          </div>
          <div>
            <label style="display:block; font-size:0.75rem; font-weight:700; margin-bottom:0.25rem;">Estimated Budget (COP)</label>
            <input type="text" id="reqBudget" style="width:100%; padding:0.4rem 0.6rem; border:1px solid var(--line); border-radius:4px; font-size:0.8rem; background:var(--page); color:var(--ink);" value="15,000,000" required>
          </div>
        </div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:0.5rem;">
          <button type="button" onclick="closeNewReqModal()" class="rea-btn rea-btn-secondary">Cancel</button>
          <button type="submit" class="rea-btn">Submit Requisition &rarr;</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Export Toast -->
<div id="export-toast" class="hidden" style="position: fixed; bottom: 1.5rem; right: 1.5rem; background: var(--ink); color: var(--page); padding: 0.75rem 1.25rem; border-radius: 6px; box-shadow: 0 10px 15px rgba(0,0,0,0.1); z-index: 100; font-size: 0.8rem;">
  <div style="font-weight: 700;">Report Exported</div>
  <div style="font-size: 0.7rem; color: var(--muted);">Clean Core Dossier Generated • Doc2432956265</div>
</div>
`;

// 8. REA Style Landing & Login Page
const landingHtml = `
<div id="page-login" style="min-height: 100vh; display: flex; flex-direction: column; background: var(--page);">
  <header class="site-header" style="border-bottom: 1px solid var(--line);">
    <div class="container header-inner" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem;">
      <a class="brand" href="./" style="text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
        <span class="brand-name" style="font-weight: 750; font-size: 1.2rem; color: var(--ink);">Alpek Sourcing OS</span>
        <span class="brand-caption" style="font-size: 0.75rem; color: var(--muted); padding: 0.1rem 0.5rem; background: var(--soft); border: 1px solid var(--line); border-radius: 4px;">
          Clean Core S/4HANA Engine
        </span>
      </a>
      <a href="#login-portal" class="rea-btn" style="font-size: 0.75rem;">
        <span>Enterprise Sign In</span> &rarr;
      </a>
    </div>
  </header>

  <main class="container hero home-hero" style="max-width: 1000px; margin: 3rem auto; padding: 0 1.5rem; text-align: center;">
    <p class="eyebrow" style="color: var(--brand-green); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em;">
      S/4HANA Clean Core • Direct OData v4 Integration
    </p>
    <h1 style="font-size: 2.75rem; font-weight: 800; color: var(--ink); margin: 0.5rem 0 1rem 0; letter-spacing: -0.03em;">
      Autonomous Strategic Sourcing & Procurement
    </h1>
    <p class="lede" style="font-size: 1.1rem; color: var(--muted); max-width: 700px; margin: 0 auto 2rem auto;">
      Ingest SAP requisitions, execute two-envelope sealed supplier bidding, and commit 45000-series POs with 14ms latency and zero ABAP modifications.
    </p>

    <!-- REA Agent Terminal Showcase -->
    <div class="agent-terminal" style="max-width: 600px; margin: 0 auto 3rem auto; text-align: left;">
      <div class="terminal-header">
        <span class="terminal-title">
          <span class="terminal-dots"><i></i><i></i><i></i></span>
          Clean Core S/4HANA Pipeline
        </span>
        <button class="copy-button" type="button">Copy</button>
      </div>
      <p class="terminal-prompt" style="font-size: 0.8rem;">
        <span class="prompt-symbol">›</span>
        <span>rea sap link --pr PR-3000010443 --sourcing-event Doc2432956265 --award SONDA</span>
      </p>
      <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #a7f3d0; margin-top: 0.5rem;">
        ✓ Ingested PR-3000010443 (7,125,000 units)<br>
        ✓ Bidding Active (00:54:02 remaining)<br>
        ✓ Generated S/4HANA PO 450009180 (14.3% savings)
      </div>
    </div>

    <!-- Login Portal -->
    <section id="login-portal" class="rea-card" style="max-width: 480px; margin: 0 auto 4rem auto; text-align: left;">
      <div style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--line);">
        <h2 style="font-size: 1.25rem; font-weight: 750; margin: 0; color: var(--ink);">Enterprise Single Sign-On</h2>
        <p style="font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem;">Enter credentials or select an authorized corporate role</p>
      </div>

      <!-- Quick Role Selector -->
      <div style="margin-bottom: 1.25rem;">
        <span style="font-size: 0.7rem; font-weight: 700; color: var(--muted); text-transform: uppercase;">1-Click Role Switcher</span>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem; margin-top: 0.4rem;">
          <button type="button" onclick="quickLoginRole('buyer')" class="rea-btn rea-btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.25rem; justify-content: center;">Buyer</button>
          <button type="button" onclick="quickLoginRole('approver')" class="rea-btn rea-btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.25rem; justify-content: center;">Approver</button>
          <button type="button" onclick="quickLoginRole('supplier_a')" class="rea-btn rea-btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.25rem; justify-content: center; color: var(--brand-green);">Supplier</button>
          <button type="button" onclick="quickLoginRole('requester')" class="rea-btn rea-btn-secondary" style="font-size: 0.7rem; padding: 0.35rem 0.25rem; justify-content: center;">Requester</button>
        </div>
      </div>

      <form id="formCorporateLogin" onsubmit="handleLoginFormSubmit(event); return false;" style="display: flex; flex-direction: column; gap: 0.75rem;">
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem;">Username or Email</label>
          <input type="text" id="loginUsername" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 4px; font-size: 0.8rem; background: var(--soft); color: var(--ink);" value="buyer" required>
        </div>
        <div>
          <label style="display: block; font-size: 0.75rem; font-weight: 700; margin-bottom: 0.25rem;">Password</label>
          <input type="password" id="loginPassword" style="width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--line); border-radius: 4px; font-size: 0.8rem; background: var(--soft); color: var(--ink);" value="Alpek@2026" required>
        </div>
        <button type="submit" class="rea-btn" style="width: 100%; justify-content: center; margin-top: 0.5rem;">
          <span>Authenticate Session</span> &rarr;
        </button>
      </form>
    </section>
  </main>
</div>
`;

// 9. Application Shell (#page-app)
const appShellHtml = `
<div id="page-app" class="hidden" style="min-height: 100vh; display: flex; flex-direction: column;">
  ${siteHeaderHtml}
  ${metricStripHtml}
  ${pipelineHtml}
  <main style="flex: 1;">
    ${sourcingWorkspaceHtml}
    ${viewHtmlMap['view-requester']}
    ${viewHtmlMap['view-manager']}
    ${viewHtmlMap['view-tech-eval']}
    ${viewHtmlMap['view-comm-eval']}
    ${viewHtmlMap['view-approver']}
    ${viewHtmlMap['view-receiving']}
    ${viewHtmlMap['view-order-closure']}
    ${viewHtmlMap['view-excel-erp']}
    ${viewHtmlMap['view-sap-erp']}
    ${viewHtmlMap['view-cig-integration']}
    ${viewHtmlMap['view-supplier-portal']}
  </main>
  ${modalsHtml}
</div>
`;

// 10. Runtime scripts (wiring up dropdown, logout, tabs, router, and timers)
const helperScripts = `
<script>
  function toggleUserDropdown(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const menu = document.getElementById('userDropdownMenu');
    if (!menu) return;
    menu.classList.toggle('hidden');
  }
  window.toggleUserDropdown = toggleUserDropdown;

  function closeUserDropdown() {
    const menu = document.getElementById('userDropdownMenu');
    if (menu) menu.classList.add('hidden');
  }
  window.closeUserDropdown = closeUserDropdown;
  window.closeProfileDropdown = closeUserDropdown;

  document.addEventListener('click', (e) => {
    const btn = document.getElementById('appUserProfileBtn');
    const menu = document.getElementById('userDropdownMenu');
    if (menu && !menu.classList.contains('hidden')) {
      if (btn && !btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
      }
    }
  });

  function toggleBrandNavigation() {
    const loginPage = document.getElementById('page-login');
    const appPage = document.getElementById('page-app');
    if (appPage && !appPage.classList.contains('hidden')) {
      appPage.classList.add('hidden');
      if (loginPage) loginPage.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (loginPage) loginPage.classList.add('hidden');
      if (appPage) appPage.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
  window.toggleBrandNavigation = toggleBrandNavigation;

  function signOutToLogin() {
    sessionStorage.removeItem('abc_current_user');
    sessionStorage.clear();
    window.currentUser = null;
    const loginPage = document.getElementById('page-login');
    const appPage = document.getElementById('page-app');
    if (appPage) appPage.classList.add('hidden');
    if (loginPage) loginPage.classList.remove('hidden');
    closeUserDropdown();
    window.location.hash = 'login-portal';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const portal = document.getElementById('login-portal');
    if (portal) {
      setTimeout(() => portal.scrollIntoView({ behavior: 'smooth' }), 50);
    }
    if (typeof showSapToast === 'function') {
      showSapToast('Signed out of corporate session.', 'info');
    }
  }
  window.signOutToLogin = signOutToLogin;
  window.logoutUser = signOutToLogin;

  function switchMainTab(tabKey) {
    const views = {
      'sourcing': 'view-sourcing-events',
      'requester': 'view-requester',
      'orders': 'view-receiving',
      'excel': 'view-excel-erp',
      'sap': 'view-sap-erp',
      'integration': 'view-cig-integration',
      'supplier': 'view-supplier-portal',
      'manager': 'view-manager',
      'tech_eval': 'view-tech-eval',
      'comm_eval': 'view-comm-eval',
      'approver': 'view-approver',
      'receiving': 'view-receiving',
      'finance': 'view-order-closure'
    };

    document.querySelectorAll('.workspace-view').forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });

    const targetId = views[tabKey] || 'view-sourcing-events';
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.classList.add('active');
      targetEl.style.display = 'block';
    }

    document.querySelectorAll('.rea-nav-btn').forEach(btn => btn.classList.remove('active'));
    if (window.event && window.event.currentTarget && window.event.currentTarget.classList.contains('rea-nav-btn')) {
      window.event.currentTarget.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.switchMainTab = switchMainTab;

  function navigateIfAuthorized(roleKey) {
    switchMainTab(roleKey);
  }
  window.navigateIfAuthorized = navigateIfAuthorized;

  function filterMatrixView(category, btn) {
    const buttons = document.querySelectorAll('.matrix-filter-btn');
    buttons.forEach(b => {
      b.classList.remove('rea-btn');
      b.classList.add('rea-btn-secondary');
      b.setAttribute('aria-selected', 'false');
    });

    if (btn) {
      btn.classList.remove('rea-btn-secondary');
      btn.classList.add('rea-btn');
      btn.setAttribute('aria-selected', 'true');
    }

    const rows = document.querySelectorAll('#matrix-table-body tr[data-category]');
    rows.forEach(row => {
      if (category === 'all' || row.getAttribute('data-category') === category) {
        row.classList.remove('matrix-hidden');
      } else {
        row.classList.add('matrix-hidden');
      }
    });
  }
  window.filterMatrixView = filterMatrixView;

  function exportMatrixReport() {
    const toast = document.getElementById('export-toast');
    if (toast) {
      toast.classList.remove('hidden');
      setTimeout(() => toast.classList.add('hidden'), 3500);
    }
  }
  window.exportMatrixReport = exportMatrixReport;

  function commitPoNow() {
    if (typeof approveAndDispatchPoToSap === 'function') {
      approveAndDispatchPoToSap();
    } else {
      const btn = document.getElementById('btnCommitOrder');
      if (btn) {
        btn.innerHTML = 'PO 450009180 Dispatched to S/4HANA ✓';
        btn.classList.add('rea-btn-success');
      }
      if (typeof showSapToast === 'function') {
        showSapToast('Clean Core PO #450009180 committed via OData v4.', 'success');
      }
    }
  }
  window.commitPoNow = commitPoNow;

  function openNewReqModal() {
    const m = document.getElementById('modalNewReq');
    if (m) m.classList.remove('hidden');
  }
  function closeNewReqModal() {
    const m = document.getElementById('modalNewReq');
    if (m) m.classList.add('hidden');
  }
  window.openNewReqModal = openNewReqModal;
  window.closeNewReqModal = closeNewReqModal;
</script>
<script src="/js/app.js"></script>
</body>
</html>
`;

// 11. Assemble final document
const finalHtml = `${headHtml}
${landingHtml}
${appShellHtml}
${helperScripts}
`;

fs.writeFileSync(path.join(__dirname, '../public/index.html'), finalHtml, 'utf8');
console.log('Successfully written REA Design System public/index.html! Length:', finalHtml.length);
