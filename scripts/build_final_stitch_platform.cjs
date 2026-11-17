const fs = require('fs');
const path = require('path');

// 1. Read Stitch base from raw_7f554de.html
const stitchRaw = fs.readFileSync('scripts/raw_7f554de.html', 'utf8');

// 2. Read clean views extracted from 0deb23e (without nesting)
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
  viewHtmlMap[v] = fs.readFileSync(`scripts/clean_${v}.html`, 'utf8');
});

// 3. Read modals and compatibility registry from public/index.html
const currentIndex = fs.readFileSync('public/index.html', 'utf8');
const modalsStart = currentIndex.indexOf('<!-- All Application Modals');
const modalsEnd = currentIndex.indexOf('<script>', modalsStart);
const modalsAndCompat = currentIndex.substring(modalsStart, modalsEnd).trim();

// 4. Extract parts from stitchRaw
const headStart = stitchRaw.indexOf('<head>');
const headEnd = stitchRaw.indexOf('</head>') + 7;
let rawHead = stitchRaw.substring(headStart, headEnd);
rawHead = rawHead.replace('</head>', '  <link rel="stylesheet" href="/css/landing.css">\n</head>');

// Add styling rules for all user dashboards in the Google Stitch theme
const additionalStyles = `
    /* Workspace Views */
    .workspace-view {
      display: none !important;
    }
    .workspace-view.active {
      display: flex !important;
      flex-direction: column !important;
    }
    /* Stitch Unified Elevated Cards */
    .cockpit-hero-banner, .sap-card {
      background: #FFFFFF;
      border-radius: 24px;
      border: 1px solid #ECEAE4;
      padding: 1.75rem;
      box-shadow: 0 2px 4px rgba(18, 18, 17, 0.02), 0 12px 32px -4px rgba(18, 18, 17, 0.05);
      margin-bottom: 1.5rem;
    }
    .cockpit-main-heading {
      font-family: 'Newsreader', Georgia, serif;
      font-size: 24px;
      font-weight: 600;
      color: #121211;
      letter-spacing: -0.02em;
    }
    .cockpit-sub-heading {
      font-size: 13.5px;
      color: #6C6963;
      margin-top: 4px;
    }
    .cockpit-timer-card {
      background: #FAF9F6;
      border: 1px solid #ECEAE4;
      border-radius: 20px;
      padding: 12px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .timer-card-digits {
      font-family: 'JetBrains Mono', monospace;
      font-size: 26px;
      font-weight: 700;
      color: #D94326;
    }
    /* Unified Table in Stitch Design */
    .sap-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .sap-table th {
      background: #FAF9F6;
      color: #6C6963;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.04em;
      padding: 12px 16px;
      border-bottom: 1px solid #ECEAE4;
      text-align: left;
    }
    .sap-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #F0EEE8;
      color: #121211;
    }
    .sap-table tr:hover {
      background: #FAF9F6;
    }
    /* Unified Stitch Buttons */
    .sap-btn-primary, .btn-stitch-primary {
      background: #121211 !important;
      color: #FFFFFF !important;
      border-radius: 9999px !important;
      padding: 8px 18px !important;
      font-weight: 600 !important;
      font-size: 13px !important;
      border: none !important;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(18, 18, 17, 0.08);
      transition: background 0.15s ease-in-out;
    }
    .sap-btn-primary:hover, .btn-stitch-primary:hover {
      background: #232220 !important;
    }
    .sap-btn-secondary, .btn-stitch-secondary {
      background: #FFFFFF !important;
      color: #121211 !important;
      border: 1px solid #ECEAE4 !important;
      border-radius: 9999px !important;
      padding: 8px 18px !important;
      font-weight: 500 !important;
      font-size: 13px !important;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease-in-out;
    }
    .sap-btn-secondary:hover, .btn-stitch-secondary:hover {
      border-color: #D9D6CE !important;
      background: #FAF9F6 !important;
    }
    /* Status Pills */
    .status-pill.pending {
      background: #FDF2F0 !important;
      color: #D94326 !important;
      border: 1px solid #FAD8D2 !important;
      border-radius: 9999px !important;
      padding: 3px 10px !important;
      font-weight: 600 !important;
      font-size: 11px !important;
    }
    .status-pill.approved, .status-pill.confirmed {
      background: #EDF8F3 !important;
      color: #167953 !important;
      border: 1px solid #BDE8D3 !important;
      border-radius: 9999px !important;
      padding: 3px 10px !important;
      font-weight: 600 !important;
      font-size: 11px !important;
    }
    /* Modals Backdrop & Dialogs */
    .sap-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(18, 18, 17, 0.45);
      backdrop-filter: blur(4px);
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .sap-dialog {
      background: #FFFFFF;
      border-radius: 24px;
      border: 1px solid #ECEAE4;
      box-shadow: 0 20px 48px -8px rgba(18, 18, 17, 0.16);
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .sap-dialog-sm { max-width: 28rem; width: 100%; }
    .sap-dialog-md { max-width: 38rem; width: 100%; }
    .sap-dialog-lg { max-width: 56rem; width: 100%; }
    .sap-dialog-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #ECEAE4;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
    }
    .sap-dialog-title {
      font-family: 'Newsreader', Georgia, serif;
      font-weight: 600;
      font-size: 18px;
      color: #121211;
    }
    .sap-dialog-close {
      background: transparent;
      border: none;
      font-size: 20px;
      color: #6C6963;
      cursor: pointer;
      border-radius: 9999px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sap-dialog-close:hover {
      background: #FAF9F6;
      color: #121211;
    }
    .sap-dialog-body {
      padding: 1.5rem;
      font-size: 13.5px;
      color: #121211;
    }
    .sap-dialog-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #ECEAE4;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.75rem;
      background: #FAF9F6;
      border-bottom-left-radius: 24px;
      border-bottom-right-radius: 24px;
    }
`;
rawHead = rawHead.replace('</style>', additionalStyles + '\n  </style>');

// Header with user switcher dropdown
const headerStart = stitchRaw.indexOf('<header');
const headerEnd = stitchRaw.indexOf('</header>') + 9;
let rawHeader = stitchRaw.substring(headerStart, headerEnd);

const oldHeaderPill = `<div class="flex items-center gap-2">
<div class="border border-[#ECEAE4] bg-white hover:border-[#DCD8CE] pl-1 pr-3 py-1 rounded-full flex items-center gap-2.5 transition cursor-pointer shadow-xs">
<div class="w-7 h-7 rounded-full bg-[#121211] text-white flex items-center justify-center font-bold text-[10.5px]">
            VM
          </div>
<div class="flex flex-col text-left leading-tight pr-1">
<span class="text-[12px] font-semibold text-[#121211] flex items-center gap-0.5">
              Valeria Martinez
              <span class="material-symbols-outlined text-[13px] text-[#9E9A92]">expand_more</span>
</span>
<span class="text-[10px] text-[#6C6963] font-medium">Procurement Buyer</span>
</div>
</div>
</div>`;

const newHeaderPill = `
<!-- Shell Right: Verified Buyer Profile Pill & Persona Switcher -->
<div class="flex items-center gap-2.5">
  <button type="button" onclick="showMainLandingPage()" title="Return to Main Landing Page" class="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF9F6] text-[#121211] border border-[#ECEAE4] transition shadow-xs cursor-pointer select-none">
    <span class="material-symbols-outlined text-[15px] text-[#167953]">home</span>
    <span>Landing Page</span>
  </button>
  <div class="relative">
  <div id="appUserProfileBtn" onclick="toggleUserDropdown()" class="border border-[#ECEAE4] bg-white hover:border-[#DCD8CE] pl-1 pr-3 py-1 rounded-full flex items-center gap-2.5 transition cursor-pointer shadow-xs select-none">
    <div id="appUserAvatar" class="w-7 h-7 rounded-full bg-[#121211] text-white flex items-center justify-center font-bold text-[10.5px]">
      VM
    </div>
    <div class="flex flex-col text-left leading-tight pr-1">
      <span class="text-[12px] font-semibold text-[#121211] flex items-center gap-0.5">
        <span id="appUserName">Valeria Martinez</span>
        <span class="material-symbols-outlined text-[13px] text-[#9E9A92]">expand_more</span>
      </span>
      <span id="appUserRole" class="text-[10px] text-[#6C6963] font-medium">Procurement Buyer</span>
    </div>
  </div>
  <!-- Persona Switcher Dropdown Menu in Matching Stitch Design -->
  <div id="userDropdownMenu" class="hidden absolute right-0 mt-2.5 w-80 bg-white rounded-3xl shadow-float-pop border border-[#ECEAE4] z-50 p-4 text-[12.5px] animate-in fade-in duration-150">
    <div class="pb-3 mb-2.5 border-b border-[#ECEAE4] flex items-center gap-3">
      <div id="dropdownAvatar" class="w-9 h-9 rounded-full bg-[#121211] text-white flex items-center justify-center font-bold text-[12px] shadow-sm">VM</div>
      <div class="flex-1 min-w-0">
        <div id="dropdownName" class="font-bold text-[#121211] text-[13.5px] truncate">Valeria Martinez</div>
        <div id="dropdownRole" class="text-[11px] text-[#6C6963] truncate">Procurement Buyer</div>
        <div id="dropdownEmail" class="text-[10.5px] font-mono text-[#9E9A92] truncate">valeria.martinez@abccompany.com</div>
      </div>
    </div>
    <div class="text-[10.5px] font-bold uppercase tracking-wider text-[#9E9A92] px-1 mb-2">Switch Persona (10 Workspaces)</div>
    <div class="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
      <button onclick="switchPersona('valeria', 'buyer')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Valeria Martinez</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#121211] text-white font-medium">Lead Buyer</span>
      </button>
      <button onclick="switchPersona('carlos_requester', 'requester')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Carlos Ramirez</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDF8F3] text-[#167953] border border-[#BDE8D3] font-medium">Plant Requester</span>
      </button>
      <button onclick="switchPersona('david_manager', 'manager')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">David Vance</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FDF2F0] text-[#D94326] border border-[#FAD8D2] font-medium">Manager Gate 1</span>
      </button>
      <button onclick="switchPersona('victor_tech', 'tech_evaluator')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Dr. Victor Chen</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF9F6] text-[#6C6963] border border-[#ECEAE4] font-medium">Tech Eval</span>
      </button>
      <button onclick="switchPersona('sofia_comm', 'comm_evaluator')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Sofia Morales</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF9F6] text-[#6C6963] border border-[#ECEAE4] font-medium">Comm Eval</span>
      </button>
      <button onclick="switchPersona('carlos_approver', 'award_approver')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Carlos A. Fonseca</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#121211] text-white font-medium">Award Exec</span>
      </button>
      <button onclick="switchPersona('sonda_supplier', 'supplier')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">SONDA Colombia</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#EDF8F3] text-[#167953] border border-[#BDE8D3] font-medium">Supplier #800192</span>
      </button>
      <button onclick="switchPersona('indorama_supplier', 'supplier')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Indorama Ventures</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FAF9F6] text-[#6C6963] border border-[#ECEAE4] font-medium">Supplier #800204</span>
      </button>
      <button onclick="switchPersona('mateo_receiving', 'receiving')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Mateo Morales</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FDF2F0] text-[#D94326] border border-[#FAD8D2] font-medium">Receiving GRN</span>
      </button>
      <button onclick="switchPersona('lucia_finance', 'order_closure')" class="flex items-center justify-between p-2 rounded-2xl hover:bg-[#FAF9F6] text-left transition cursor-pointer border-none bg-transparent">
        <span class="font-semibold text-[#121211]">Lucia Fernandez</span>
        <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#121211] text-white font-medium">Finance MIRO</span>
      </button>
    </div>
    <div class="pt-3 mt-3 border-t border-[#ECEAE4]">
      <button onclick="signOutToLogin()" class="w-full py-2 px-3 rounded-full bg-[#FAF9F6] hover:bg-[#FDF2F0] text-[#D94326] font-semibold text-center flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#ECEAE4]">
        <span class="material-symbols-outlined text-[15px]">logout</span>
        <span>Sign Out to Portal</span>
      </button>
    </div>
  </div>
</div>
`;
rawHeader = rawHeader.replace(oldHeaderPill, newHeaderPill);

// Wire Nav pills to switchMainTab
rawHeader = rawHeader.replace(`href="#"\n>\n          Sourcing Events`, `onclick="switchMainTab('sourcing')" class="nav-pill-btn active bg-[#121211] text-white font-medium px-4 py-1.5 rounded-full text-[12.5px] transition shadow-pill-glow cursor-pointer border-none">\n          Sourcing Events`);
rawHeader = rawHeader.replace(`href="#">\n          Purchase Orders`, `onclick="switchMainTab('order_closure')" class="nav-pill-btn text-[#6C6963] hover:text-[#121211] hover:bg-white font-medium px-3.5 py-1.5 rounded-full text-[12.5px] transition cursor-pointer border-none bg-transparent">\n          Purchase Orders`);
rawHeader = rawHeader.replace(`href="#">\n          ERP Requisitions &amp; POs`, `onclick="switchMainTab('excel_erp')" class="nav-pill-btn text-[#6C6963] hover:text-[#121211] hover:bg-white font-medium px-3.5 py-1.5 rounded-full text-[12.5px] transition cursor-pointer border-none bg-transparent">\n          ERP Requisitions &amp; POs`);
rawHeader = rawHeader.replace(`href="#">\n          SAP GUI (ME53N)`, `onclick="switchMainTab('sap_erp')" class="nav-pill-btn text-[#6C6963] hover:text-[#121211] hover:bg-white font-medium px-3.5 py-1.5 rounded-full text-[12.5px] transition cursor-pointer border-none bg-transparent">\n          SAP GUI (ME53N)`);
rawHeader = rawHeader.replace(`onclick="document.getElementById('cxml-drawer').classList.remove('hidden')"`, `id="btnTopTraceability" onclick="openTraceabilityModal()"`);
rawHeader = rawHeader.replace('</nav>', '<div id="appNavPills" class="hidden"></div>\n</nav>');

// KPI Strip
const kpiStart = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 2. Executive Metric KPI Strip');
const kpiEnd = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 3. Strategic Tender Hero Showcase');
let rawKpi = stitchRaw.substring(kpiStart, kpiEnd);
rawKpi = rawKpi.replace('<section class="w-full px-6 pt-2 pb-4">', '<section id="executiveKpiStrip" class="w-full px-6 pt-2 pb-4">');

// Tender Showcase & Table
const tenderStart = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 3. Strategic Tender Hero Showcase');
const tenderEnd = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 5. cXML Drawer');
let rawTenderAndTable = stitchRaw.substring(tenderStart, tenderEnd);

// Wire filter_list and view_column toolbar buttons
rawTenderAndTable = rawTenderAndTable.replace(
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition" title="Filter columns"`,
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition cursor-pointer" title="Cycle Filter View" onclick="cycleMatrixFilter()"`
);
rawTenderAndTable = rawTenderAndTable.replace(
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition" title="Matrix preferences"`,
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition cursor-pointer" title="Export Matrix Report" onclick="exportMatrixReport()"`
);

// Drawer & Modal
const drawerStart = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 5. cXML Drawer');
const drawerEnd = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 7. Footer');
let rawDrawerAndModal = stitchRaw.substring(drawerStart, drawerEnd);

// Wire real API call to award button in award-modal
rawDrawerAndModal = rawDrawerAndModal.replace(
  `onclick="this.innerHTML='Committed via OData ✓'; this.classList.replace('bg-[#121211]','bg-[#167953]'); setTimeout(()=>document.getElementById('award-modal').classList.add('hidden'), 1200);"`,
  `id="btnSourcingCommitAwardPo" onclick="executeSourcingCommitPo(this)"`
);

// Footer
const footerStart = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 7. Footer');
const footerEnd = stitchRaw.indexOf('</footer>', footerStart) + 9;
const rawFooter = stitchRaw.substring(footerStart, footerEnd);

// Script chunk from stitchRaw
const scriptsStart = stitchRaw.indexOf('<script>', footerEnd);
const bodyEnd = stitchRaw.indexOf('</body>');
const rawStitchScripts = stitchRaw.substring(scriptsStart, bodyEnd);

// Assemble Corporate Login Portal in matching Stitch design
const stitchLoginPortal = `
<div id="page-login" class="bg-foundation mx-0 flex min-h-screen flex-col">

    <!-- Passionfroot Authentic Floating Glass Header -->
    <header class="vt-site-nav">
      <nav aria-label="Main navigation">
        <ul>
          <!-- Left: Brand Logo & Clean Core Status -->
          <div class="nav-pill-group">
            <a href="/" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
              <span style="width:28px; height:28px; border-radius:50%; background:#E0533C; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; border:1px solid rgba(255,255,255,0.3);">AD</span>
              <span style="font-family:var(--font-heading); font-weight:700; font-size:17px; color:#191716; letter-spacing:-0.02em;">Alpek Sourcing OS</span>
              <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#E0533C; background:rgba(224,83,60,0.1); padding:2px 8px; border-radius:9999px; border:1px solid rgba(224,83,60,0.2);">Clean Core</span>
            </a>
          </div>

          <!-- Center: Nav Pills -->
          <div class="nav-pill-group" style="display:none; @media(min-width:1024px){display:flex;}">
            <a href="#hero-section" class="nav-link-item">Overview</a>
            <a href="#section-agent" class="nav-link-item">Sourcing Copilot</a>
            <a href="#section-tenders" class="nav-link-item">Two-Envelope</a>
            <a href="#section-playbook" class="nav-link-item">Clean Core ERP</a>
            <a href="#section-faq" class="nav-link-item">FAQ</a>
          </div>

          <!-- Right: Actions -->
          <div style="display:flex; align-items:center; gap:8px;">
            <a href="#login-portal" class="btn-nav-role">
              Role Directory (10 Personas)
            </a>
            <button type="button" onclick="enterSourcingCockpit()" class="btn-nav-signin" style="background:#121211; color:#fff; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
              <span>Enter Cockpit</span> &rarr;
            </button>
          </div>
        </ul>
      </nav>
    </header>

    <!-- SECTION 2: PASSIONFROOT OFFICIAL HERO SECTION -->
    <section id="hero-section" class="pf-cosmic-hero">
      <!-- Cosmic Stars & Sunset Horizon Glow Atmosphere (Pic 3 Match) -->
      <div class="hero-cosmic-glow"></div>
      <div class="hero-horizon-nebula"></div>

      <div class="hero-content-wrapper">
        <!-- Clean Eyebrow Tag -->
        <div class="hero-eyebrow-pill">
          <span class="pulse-dot"></span>
          <span>The Agentic Sourcing OS for SAP S/4HANA &bull; Clean Core v3.0</span>
        </div>

        <!-- Big Bold Serif Headline (Pic 3 Match: "The Agentic Sourcing OS for the AI era") -->
        <h1 class="hero-main-title">
          The Agentic Sourcing<br>
          OS for the AI era
        </h1>

        <!-- Crisp Subtitle (Pic 3 Match) -->
        <p class="hero-main-subtitle">
          Drive enterprise procurement through verified, automated workflows at scale. S/4HANA Clean Core, sealed 2-envelope bidding, instant PO commits &mdash; no spreadsheets, no guesswork, no chaos.
        </p>

        <!-- CTA Buttons (Pic 3 Match: Solid White Pill + Translucent Glass Pill) -->
        <div class="hero-cta-group">
          <button type="button" onclick="enterSourcingCockpit()" class="btn-hero-primary" style="cursor:pointer; border:none; display:inline-flex; align-items:center; gap:8px;">
            <span>Enter Sourcing Cockpit (Live Demo)</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
          <button type="button" onclick="toggleCredentialsDrawer()" class="btn-hero-secondary">
            Corporate Role Directory (10 Personas)
          </button>
        </div>

        <!-- AI Copilot Prompt Bar (Sleek Floating Prompt) -->
        <div class="pf-copilot-bar">
          <div class="pf-copilot-input-row">
            <span style="font-size:18px; color:#E0533C;">&#10024;</span>
            <input type="text" readonly value="Launch strategic tender for 7,125,000 units of industrial refrigerant at Vereda Morrison plant...">
            <a href="#login-portal">
              Run Sourcing OS &rarr;
            </a>
          </div>
        </div>

        <!-- Floating 3D Horizon Cards Emerging from Sunset Horizon (Exact Pic 3 Match) -->
        <div class="hero-horizon-cards-strip">
          
          <!-- Card 1: Platform Breakdown -->
          <div class="horizon-preview-card card-left">
            <div class="horizon-card-header">
              <span class="horizon-card-title">Platform breakdown</span>
              <span class="horizon-card-badge">Clean Core</span>
            </div>
            <ul class="horizon-card-list">
              <li>
                <span class="dot coral"></span>
                <span class="txt">Inbound SAP PR (3000010443)</span>
              </li>
              <li>
                <span class="dot emerald"></span>
                <span class="txt">S/4HANA OData v4 Integration</span>
              </li>
              <li>
                <span class="dot amber"></span>
                <span class="txt">7,125,000 Units Refrigerant</span>
              </li>
            </ul>
          </div>

          <!-- Card 2: Evaluation Mix -->
          <div class="horizon-preview-card card-center">
            <div class="horizon-card-header">
              <span class="horizon-card-title">Evaluation Mix</span>
              <span class="horizon-card-badge green">Sealed 2-Envelope</span>
            </div>
            <ul class="horizon-card-list">
              <li>
                <span class="dot emerald"></span>
                <span class="txt">Technical Envelope: 95/100 (Pass)</span>
              </li>
              <li>
                <span class="dot blue"></span>
                <span class="txt">Commercial Sealed: $3.00 COP</span>
              </li>
              <li>
                <span class="dot purple"></span>
                <span class="txt">Verified Savings: 14.3% ($3.5M)</span>
              </li>
            </ul>
          </div>

          <!-- Card 3: ERP Dispatch -->
          <div class="horizon-preview-card card-right">
            <div class="horizon-card-header">
              <span class="horizon-card-title">ERP Dispatch</span>
              <span class="horizon-card-badge">Instant Push</span>
            </div>
            <ul class="horizon-card-list">
              <li>
                <span class="dot emerald"></span>
                <span class="txt">SAP PO 450009180 Committed</span>
              </li>
              <li>
                <span class="dot blue"></span>
                <span class="txt">cXML 1.2 &amp; SAP IDoc ORDERS05</span>
              </li>
              <li>
                <span class="dot coral"></span>
                <span class="txt">100% Clean Core Compliance</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>

    <!-- Enterprise Trust Logo Strip -->
    <div class="pf-trust-strip">
      <div class="trust-header-block">
        <div class="trust-eyebrow">
          <span>Enterprise Proof &bull; Tier-1 Network</span>
        </div>
        <h2 class="trust-caption">Trusted by global enterprise manufacturing &amp; energy leaders</h2>
        <p class="trust-subcaption">Powering Clean Core procurement and sealed multi-vendor bidding across critical industrial supply chains.</p>
      </div>

      <div class="trust-marquee-wrapper logo-grid">
        <!-- Track Set 1 -->
        <div class="trust-marquee-track">
          <!-- 1. ALPEK Polyester -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#F0FDF4; border-color:#BBF7D0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#15803D" stroke-width="2" stroke-linejoin="round"/>
                <path d="M12 22V12M12 12L3 7M12 12l9-5" stroke="#15803D" stroke-width="1.75"/>
                <circle cx="12" cy="12" r="3" fill="#15803D" fill-opacity="0.25" stroke="#15803D" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">ALPEK Polyester</span>
              <span class="trust-brand-meta">Polymers &bull; Monterrey</span>
            </div>
          </div>

          <!-- 2. Gran Tierra Energy -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#FEF2F2; border-color:#FECACA;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2c-1.5 3-4 6-4 9.5 0 3.5 2.5 6.5 6 6.5s6-3 6-6.5c0-2-1-4-2.5-5.5-.5 2-2 3.5-3.5 3.5-1 0-1.8-.7-2-1.5z" fill="#E0533C" fill-opacity="0.15" stroke="#E0533C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18c-1.5 0-2.5-1.2-2.5-2.5 0-1.2 1-2 2.5-3 1.5 1 2.5 1.8 2.5 3 0 1.3-1 2.5-2.5 2.5z" fill="#E0533C"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Gran Tierra Energy</span>
              <span class="trust-brand-meta">Energy Exploration &bull; Calgary</span>
            </div>
          </div>

          <!-- 3. Indorama Ventures -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#EEF2FF; border-color:#C7D2FE;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#4338CA" stroke-width="2"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#4338CA" stroke-width="1.5" transform="rotate(30 12 12)"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#4338CA" stroke-width="1.5" transform="rotate(-30 12 12)"/>
                <circle cx="12" cy="12" r="2.5" fill="#4338CA"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Indorama Ventures</span>
              <span class="trust-brand-meta">Chemical Fibers &bull; Bangkok</span>
            </div>
          </div>

          <!-- 4. BASF Chemicals -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#EFF6FF; border-color:#BFDBFE;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="#2563EB" stroke="#1D4ED8" stroke-width="1.5"/>
                <rect x="13" y="3" width="8" height="8" rx="2" stroke="#2563EB" stroke-width="1.5"/>
                <rect x="3" y="13" width="8" height="8" rx="2" stroke="#2563EB" stroke-width="1.5"/>
                <rect x="13" y="13" width="8" height="8" rx="2" fill="#2563EB" stroke="#1D4ED8" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">BASF Chemicals</span>
              <span class="trust-brand-meta">Chemical Group &bull; Ludwigshafen</span>
            </div>
          </div>

          <!-- 5. SONDA -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#F0FDFA; border-color:#99F6E4;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 17l4-10 6 6 6-9" stroke="#0D9488" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="4" cy="17" r="2.5" fill="#0D9488"/>
                <circle cx="8" cy="7" r="2.5" fill="#0D9488"/>
                <circle cx="14" cy="13" r="2.5" fill="#0D9488"/>
                <circle cx="20" cy="4" r="2.5" fill="#0D9488"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">SONDA</span>
              <span class="trust-brand-meta">Enterprise IT &bull; Bogotá</span>
            </div>
          </div>

          <!-- 6. Emerson Process -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#F0FDF4; border-color:#BBF7D0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#0F766E" stroke-width="2"/>
                <circle cx="12" cy="12" r="5" stroke="#0F766E" stroke-width="1.5" stroke-dasharray="2 2"/>
                <path d="M12 6v6l4 2" stroke="#0F766E" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="1.5" fill="#0F766E"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Emerson Process</span>
              <span class="trust-brand-meta">Automation Systems &bull; St. Louis</span>
            </div>
          </div>

          <!-- 7. Celanese -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#FFF1F2; border-color:#FECDD3;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="#BE123C" stroke-width="2" fill="#BE123C" fill-opacity="0.1" stroke-linejoin="round"/>
                <polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" stroke="#BE123C" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="2" fill="#BE123C"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Celanese</span>
              <span class="trust-brand-meta">Engineered Materials &bull; Dallas</span>
            </div>
          </div>

          <!-- 8. LyondellBasell -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#EFF6FF; border-color:#BFDBFE;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="7" cy="12" r="5" stroke="#1D4ED8" stroke-width="2" fill="#1D4ED8" fill-opacity="0.15"/>
                <circle cx="17" cy="12" r="5" stroke="#1E3A8A" stroke-width="2" fill="#1E3A8A" fill-opacity="0.15"/>
                <path d="M12 7v10" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">LyondellBasell</span>
              <span class="trust-brand-meta">Advanced Polyolefins &bull; Houston</span>
            </div>
          </div>
        </div>

        <!-- Track Set 2 (Continuous Marquee Duplicate) -->
        <div class="trust-marquee-track" aria-hidden="true">
          <!-- 1. ALPEK Polyester -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#F0FDF4; border-color:#BBF7D0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z" stroke="#15803D" stroke-width="2" stroke-linejoin="round"/>
                <path d="M12 22V12M12 12L3 7M12 12l9-5" stroke="#15803D" stroke-width="1.75"/>
                <circle cx="12" cy="12" r="3" fill="#15803D" fill-opacity="0.25" stroke="#15803D" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">ALPEK Polyester</span>
              <span class="trust-brand-meta">Polymers &bull; Monterrey</span>
            </div>
          </div>

          <!-- 2. Gran Tierra Energy -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#FEF2F2; border-color:#FECACA;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 2c-1.5 3-4 6-4 9.5 0 3.5 2.5 6.5 6 6.5s6-3 6-6.5c0-2-1-4-2.5-5.5-.5 2-2 3.5-3.5 3.5-1 0-1.8-.7-2-1.5z" fill="#E0533C" fill-opacity="0.15" stroke="#E0533C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18c-1.5 0-2.5-1.2-2.5-2.5 0-1.2 1-2 2.5-3 1.5 1 2.5 1.8 2.5 3 0 1.3-1 2.5-2.5 2.5z" fill="#E0533C"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Gran Tierra Energy</span>
              <span class="trust-brand-meta">Energy Exploration &bull; Calgary</span>
            </div>
          </div>

          <!-- 3. Indorama Ventures -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#EEF2FF; border-color:#C7D2FE;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#4338CA" stroke-width="2"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#4338CA" stroke-width="1.5" transform="rotate(30 12 12)"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" stroke="#4338CA" stroke-width="1.5" transform="rotate(-30 12 12)"/>
                <circle cx="12" cy="12" r="2.5" fill="#4338CA"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Indorama Ventures</span>
              <span class="trust-brand-meta">Chemical Fibers &bull; Bangkok</span>
            </div>
          </div>

          <!-- 4. BASF Chemicals -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#EFF6FF; border-color:#BFDBFE;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="8" height="8" rx="2" fill="#2563EB" stroke="#1D4ED8" stroke-width="1.5"/>
                <rect x="13" y="3" width="8" height="8" rx="2" stroke="#2563EB" stroke-width="1.5"/>
                <rect x="3" y="13" width="8" height="8" rx="2" stroke="#2563EB" stroke-width="1.5"/>
                <rect x="13" y="13" width="8" height="8" rx="2" fill="#2563EB" stroke="#1D4ED8" stroke-width="1.5"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">BASF Chemicals</span>
              <span class="trust-brand-meta">Chemical Group &bull; Ludwigshafen</span>
            </div>
          </div>

          <!-- 5. SONDA -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#F0FDFA; border-color:#99F6E4;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 17l4-10 6 6 6-9" stroke="#0D9488" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="4" cy="17" r="2.5" fill="#0D9488"/>
                <circle cx="8" cy="7" r="2.5" fill="#0D9488"/>
                <circle cx="14" cy="13" r="2.5" fill="#0D9488"/>
                <circle cx="20" cy="4" r="2.5" fill="#0D9488"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">SONDA</span>
              <span class="trust-brand-meta">Enterprise IT &bull; Bogotá</span>
            </div>
          </div>

          <!-- 6. Emerson Process -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#F0FDF4; border-color:#BBF7D0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#0F766E" stroke-width="2"/>
                <circle cx="12" cy="12" r="5" stroke="#0F766E" stroke-width="1.5" stroke-dasharray="2 2"/>
                <path d="M12 6v6l4 2" stroke="#0F766E" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="12" r="1.5" fill="#0F766E"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Emerson Process</span>
              <span class="trust-brand-meta">Automation Systems &bull; St. Louis</span>
            </div>
          </div>

          <!-- 7. Celanese -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#FFF1F2; border-color:#FECDD3;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="#BE123C" stroke-width="2" fill="#BE123C" fill-opacity="0.1" stroke-linejoin="round"/>
                <polygon points="12,6 18,9.5 18,14.5 12,18 6,14.5 6,9.5" stroke="#BE123C" stroke-width="1.5" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="2" fill="#BE123C"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">Celanese</span>
              <span class="trust-brand-meta">Engineered Materials &bull; Dallas</span>
            </div>
          </div>

          <!-- 8. LyondellBasell -->
          <div class="trust-brand-card trust-logo-item">
            <div class="trust-brand-emblem" style="background:#EFF6FF; border-color:#BFDBFE;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="7" cy="12" r="5" stroke="#1D4ED8" stroke-width="2" fill="#1D4ED8" fill-opacity="0.15"/>
                <circle cx="17" cy="12" r="5" stroke="#1E3A8A" stroke-width="2" fill="#1E3A8A" fill-opacity="0.15"/>
                <path d="M12 7v10" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="trust-brand-info">
              <span class="trust-brand-name">LyondellBasell</span>
              <span class="trust-brand-meta">Advanced Polyolefins &bull; Houston</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SECTION: LOGO MARQUEE -->
    
    <!-- SECTION 3: BENTO GRID 1 (MEET SOURCING OS) -->
    <section id="section-agent" class="w-full py-20 px-6 max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-bold uppercase tracking-widest text-[#E0533C]">01 / AGENTIC PROCUREMENT</span>
        <h2 class="font-heading text-3xl sm:text-5xl font-medium text-[#191716] mt-2 tracking-tight">
          Meet Sourcing OS, tendering finally simple.
        </h2>
        <p class="text-base text-[#4B4643] mt-3">
          Transform raw SAP purchase requisitions into competitive multi-vendor tenders without manual spreadsheets or staging middleware.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Bento Card 1 -->
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px]">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#8C867F]">Inbound Demand</div>
            <h3 class="font-heading text-xl font-semibold text-[#191716] mt-2">From SAP PR to Sourcing RFP in One Click</h3>
            <p class="text-xs text-[#4B4643] mt-2 leading-relaxed">
              Native OData consumption ingests PR-3000010443 (SUMINISTROS REFRI) directly from S/4HANA into a live bidding tender.
            </p>
          </div>
          <div class="mt-6 p-3 bg-[#FAF8F5] rounded-xl border border-[#EDEAE4] text-xs">
            <div class="flex justify-between items-center text-[#8C867F]">
              <span>Requisition: 3000010443</span>
              <span class="font-bold text-[#15803D]">Budget $24.9M COP</span>
            </div>
          </div>
        </div>

        <!-- Bento Card 2 -->
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px]">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#15803D]">Envelope 1 &bull; Quality</div>
            <h3 class="font-heading text-xl font-semibold text-[#191716] mt-2">Two-Envelope Blind Technical Qualification</h3>
            <p class="text-xs text-[#4B4643] mt-2 leading-relaxed">
              Technical compliance is scored, audited, and locked before commercial pricing can be decrypted by evaluators.
            </p>
          </div>
          <div class="mt-6 p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] text-xs">
            <div class="flex justify-between items-center font-bold text-[#15803D]">
              <span>Technical Score: 95/100</span>
              <span>&#10003; ISO 9001 Approved</span>
            </div>
          </div>
        </div>

        <!-- Bento Card 3 -->
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[320px]">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-[#E0533C]">Clean Core Automation</div>
            <h3 class="font-heading text-xl font-semibold text-[#191716] mt-2">Single-Click S/4HANA Purchase Order</h3>
            <p class="text-xs text-[#4B4643] mt-2 leading-relaxed">
              Committee sign-off instantly creates and posts standard 45000-series PO #450009180 directly into SAP ERP with zero latency.
            </p>
          </div>
          <div class="mt-6 p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0] text-xs">
            <div class="flex justify-between items-center text-[#191716]">
              <span class="font-medium">SAP Doc: 450009180</span>
              <span class="font-bold text-[#15803D]">POSTED_CONFIRMED</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: BENTO GRID 2 (TENDERS AT SCALE) -->
    <section id="section-tenders" class="w-full py-20 px-6 max-w-7xl mx-auto bg-[#F7F5EE] rounded-3xl my-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-bold uppercase tracking-widest text-[#E0533C]">02 / EXECUTION VELOCITY</span>
        <h2 class="font-heading text-3xl sm:text-5xl font-medium text-[#191716] mt-2 tracking-tight">
          Run tenders at scale, not in spreadsheets.
        </h2>
        <p class="text-base text-[#4B4643] mt-3">
          Live dynamic bidding clocks, blind supplier evaluation matrices, and automated SAP commits cut tender cycle times by 90%.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Live Clock Card -->
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-8 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-bold text-[#E0533C] uppercase tracking-wider">Dynamic Bidding Clock</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#E0533C]/10 text-[#E0533C]">Round 1 Active</span>
          </div>
          <h3 class="font-heading text-2xl font-semibold text-[#191716]">Real-Time Countdown Engine</h3>
          <p class="text-sm text-[#4B4643] mt-2">
            Suppliers bid against an active clock with automated closing and buyer manual override. Eliminates tender deadline disputes.
          </p>
          <div class="mt-6 p-4 bg-[#FAF8F5] border border-[#EDEAE4] rounded-xl flex items-center justify-between">
            <span class="text-xs font-mono text-[#8C867F]">Doc2432956265 Timer:</span>
            <span class="font-serif text-2xl font-bold text-[#E0533C]">23:48:25</span>
          </div>
        </div>

        <!-- Two-Envelope Comparison Card -->
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-8 shadow-sm">
          <div class="flex justify-between items-center mb-4">
            <span class="text-xs font-bold text-[#15803D] uppercase tracking-wider">Blind Matrix Adjudication</span>
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-[#15803D]/10 text-[#15803D]">3 Bids Evaluated</span>
          </div>
          <h3 class="font-heading text-2xl font-semibold text-[#191716]">Automated Award Optimization</h3>
          <p class="text-sm text-[#4B4643] mt-2">
            Compares SONDA ($3.00 COP) against Indorama and BASF, calculating 14.3% ($3,562,500 COP) verified savings below baseline.
          </p>
          <div class="mt-6 p-4 bg-[#FAF8F5] border border-[#EDEAE4] rounded-xl flex items-center justify-between">
            <span class="text-xs font-medium text-[#191716]">Recommended Winner: SONDA DE COLOMBIA</span>
            <span class="text-xs font-bold text-[#15803D]">14.3% Below Budget</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 6: BENTO GRID 3 (AUDITABLE PLAYBOOK & TRACEABILITY) -->
    <section id="section-playbook" class="w-full py-20 px-6 max-w-7xl mx-auto">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <span class="text-xs font-bold uppercase tracking-widest text-[#E0533C]">03 / AUDIT INTELLIGENCE</span>
        <h2 class="font-heading text-3xl sm:text-5xl font-medium text-[#191716] mt-2 tracking-tight">
          Build a repeatable, auditable procurement playbook.
        </h2>
        <p class="text-base text-[#4B4643] mt-3">
          Full 11-stage end-to-end lineage links every purchase order back to the original requisition, sealed quotes, and warehouse goods receipts.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-6 shadow-sm">
          <div class="text-[10px] font-bold text-[#8C867F] uppercase tracking-wider">01 &bull; Requisition &amp; RFQ</div>
          <h3 class="font-heading text-lg font-semibold text-[#191716] mt-2">Lineage Ingestion</h3>
          <p class="text-xs text-[#4B4643] mt-2">Carlos Ramirez creates PR-3000010443, approved by Finance Manager David Vance.</p>
        </div>
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-6 shadow-sm">
          <div class="text-[10px] font-bold text-[#8C867F] uppercase tracking-wider">02 &bull; Award &amp; Commit</div>
          <h3 class="font-heading text-lg font-semibold text-[#191716] mt-2">Clean Core ERP Push</h3>
          <p class="text-xs text-[#4B4643] mt-2">Approver Carlos Alberto Fonseca signs off award scenario, dispatching cXML 1.2 PO #450009180.</p>
        </div>
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-6 shadow-sm">
          <div class="text-[10px] font-bold text-[#8C867F] uppercase tracking-wider">03 &bull; Inward GRN</div>
          <h3 class="font-heading text-lg font-semibold text-[#191716] mt-2">3-Way Match Verification</h3>
          <p class="text-xs text-[#4B4643] mt-2">Receiving Team Dock 4 verifies physical delivery note REM-89214 for 7.1M units.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 7: CUSTOMER STORIES -->
    <section class="w-full py-20 px-6 max-w-7xl mx-auto bg-[#FAF8F5] border-t border-[#EDEAE4]">
      <div class="text-center max-w-3xl mx-auto mb-14">
        <span class="text-xs font-bold uppercase tracking-widest text-[#E0533C]">CUSTOMER STORIES</span>
        <h2 class="font-heading text-3xl sm:text-5xl font-medium text-[#191716] mt-2 tracking-tight">
          Enterprise leaders run on Alpek Sourcing OS
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-7 shadow-sm">
          <div class="text-xs font-bold text-[#191716]">Gran Tierra Energy</div>
          <p class="text-xs text-[#4B4643] mt-3 italic">
            "Alpek Sourcing OS cut our plant maintenance tender cycle from 45 days down to 48 hours while maintaining 100% two-envelope audit compliance."
          </p>
          <div class="mt-4 pt-3 border-t border-[#EDEAE4] text-[11px] font-bold text-[#8C867F]">
            Plant Operations &bull; Vereda Morrison
          </div>
        </div>

        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-7 shadow-sm">
          <div class="text-xs font-bold text-[#191716]">Alpek Polyester</div>
          <p class="text-xs text-[#4B4643] mt-3 italic">
            "Eliminated over $340,000 in recurring SAP Ariba subscription overhead. Our Clean Core ERP sync runs with zero middleware latency."
          </p>
          <div class="mt-4 pt-3 border-t border-[#EDEAE4] text-[11px] font-bold text-[#8C867F]">
            Head of Strategic Sourcing
          </div>
        </div>

        <div class="bg-white border border-[#EDEAE4] rounded-2xl p-7 shadow-sm">
          <div class="text-xs font-bold text-[#191716]">Indorama Ventures</div>
          <p class="text-xs text-[#4B4643] mt-3 italic">
            "External suppliers participate effortlessly through the clean vendor portal. Sealed pricing and automated PO generation just work."
          </p>
          <div class="mt-4 pt-3 border-t border-[#EDEAE4] text-[11px] font-bold text-[#8C867F]">
            Director of Global Supply Chain
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 8: FREQUENTLY ASKED QUESTIONS (ACCORDION) -->
    <section id="section-faq" class="w-full py-20 px-6 max-w-4xl mx-auto">
      <div class="text-center mb-14">
        <span class="text-xs font-bold uppercase tracking-widest text-[#E0533C]">FAQ</span>
        <h2 class="font-heading text-3xl sm:text-4xl font-medium text-[#191716] mt-2 tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <div class="space-y-4">
        <div class="bg-white border border-[#EDEAE4] rounded-xl overflow-hidden shadow-sm">
          <button type="button" class="w-full p-5 text-left font-heading text-lg font-semibold text-[#191716] flex justify-between items-center" onclick="toggleFaq(this)">
            <span>What is Alpek Sourcing OS?</span>
            <span class="faq-icon text-[#8C867F] font-mono text-xl">+</span>
          </button>
          <div class="p-5 pt-0 text-sm text-[#4B4643] leading-relaxed" style="display:none;">
            Alpek Sourcing OS is a Clean Core alternative to SAP Ariba Sourcing. It connects directly with SAP S/4HANA via standard OData v4 and cXML 1.2.040, providing an ultra-fast, modern interface for multi-vendor strategic tenders and two-envelope sealed evaluations.
          </div>
        </div>

        <div class="bg-white border border-[#EDEAE4] rounded-xl overflow-hidden shadow-sm">
          <button type="button" class="w-full p-5 text-left font-heading text-lg font-semibold text-[#191716] flex justify-between items-center" onclick="toggleFaq(this)">
            <span>How does the Two-Envelope Sealed Bidding protocol protect integrity?</span>
            <span class="faq-icon text-[#8C867F] font-mono text-xl">+</span>
          </button>
          <div class="p-5 pt-0 text-sm text-[#4B4643] leading-relaxed" style="display:none;">
            Envelope 1 contains technical specifications, assays, and ISO compliance. Envelope 2 contains unit commercial tariffs. Envelope 2 remains cryptographically sealed until technical evaluation scores meet the mandatory threshold, preventing pricing bias.
          </div>
        </div>

        <div class="bg-white border border-[#EDEAE4] rounded-xl overflow-hidden shadow-sm">
          <button type="button" class="w-full p-5 text-left font-heading text-lg font-semibold text-[#191716] flex justify-between items-center" onclick="toggleFaq(this)">
            <span>How does Clean Core S/4HANA integration work without Ariba?</span>
            <span class="faq-icon text-[#8C867F] font-mono text-xl">+</span>
          </button>
          <div class="p-5 pt-0 text-sm text-[#4B4643] leading-relaxed" style="display:none;">
            The platform adheres strictly to SAP Clean Core guidelines. It communicates directly with SAP APIs (OData v4 and cXML OrderRequest payloads) and generates SAP ORDERS05 IDocs without modifying SAP ABAP tables or requiring expensive middleware.
          </div>
        </div>

        <div class="bg-white border border-[#EDEAE4] rounded-xl overflow-hidden shadow-sm">
          <button type="button" class="w-full p-5 text-left font-heading text-lg font-semibold text-[#191716] flex justify-between items-center" onclick="toggleFaq(this)">
            <span>Can external suppliers submit quotations without SAP licenses?</span>
            <span class="faq-icon text-[#8C867F] font-mono text-xl">+</span>
          </button>
          <div class="p-5 pt-0 text-sm text-[#4B4643] leading-relaxed" style="display:none;">
            Yes. External suppliers receive an encrypted invitation link and access the standalone Vendor Cockpit. They can submit sealed technical proposals, specify unit pricing, and track award status with zero software installation or SAP licenses.
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 9: FORMAL CORPORATE AUTHENTICATION DECK -->
    <!-- SECTION 9: FORMAL CORPORATE AUTHENTICATION DECK & 10 PERSONAS -->
    <section id="login-portal" class="w-full py-20 px-6 max-w-6xl mx-auto">
      <div class="text-center max-w-2xl mx-auto mb-12">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF8F3] text-[#167953] border border-[#BDE8D3] text-xs font-bold uppercase tracking-wider mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#167953] animate-pulse"></span>
          Enterprise Role Directory & Single Sign-On
        </div>
        <h2 class="text-3xl sm:text-4xl font-serif font-medium text-[#121211] tracking-tight">
          Access Your Tailored Workspace
        </h2>
        <p class="mt-3 text-sm text-[#6C6963] leading-relaxed">
          Select any of the 10 certified enterprise roles below to launch their active dashboard with verified permissions, or sign in using your corporate credentials.
        </p>
      </div>

      <!-- 10 Personas Direct Click Grid -->
      <div class="mb-10">
        <!-- 10 Personas Direct Click Grid -->
      <div class="bg-white rounded-3xl border border-[#ECEAE4] p-8 shadow-card-elevated">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-serif font-medium text-[#121211]">10 Role-Based Workspaces</h2>
            <p class="text-[12.5px] text-[#6C6963]">Click any verified persona below to immediately launch their authenticated dashboard.</p>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <!-- 1. Valeria Martinez -->
          <div onclick="switchPersona('valeria', 'buyer')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#121211] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">VM</div>
              <div class="font-bold text-[13px] text-[#121211]">Valeria Martinez</div>
              <div class="text-[11px] text-[#6C6963]">Lead Procurement Buyer</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#121211] font-semibold">Sourcing Cockpit</span>
              <span class="material-symbols-outlined text-[13px] text-[#121211]">arrow_forward</span>
            </div>
          </div>

          <!-- 2. Carlos Ramirez -->
          <div onclick="switchPersona('carlos_requester', 'requester')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#167953] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">CR</div>
              <div class="font-bold text-[13px] text-[#121211]">Carlos Ramirez</div>
              <div class="text-[11px] text-[#6C6963]">Plant Requester</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#167953] font-semibold">ME51N Demand</span>
              <span class="material-symbols-outlined text-[13px] text-[#167953]">arrow_forward</span>
            </div>
          </div>

          <!-- 3. David Vance -->
          <div onclick="switchPersona('david_manager', 'manager')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#D94326] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">DV</div>
              <div class="font-bold text-[13px] text-[#121211]">David Vance</div>
              <div class="text-[11px] text-[#6C6963]">Department Manager</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#D94326] font-semibold">Gate 1 Approval</span>
              <span class="material-symbols-outlined text-[13px] text-[#D94326]">arrow_forward</span>
            </div>
          </div>

          <!-- 4. Dr. Victor Chen -->
          <div onclick="switchPersona('victor_tech', 'tech_evaluator')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#6C6963] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">VC</div>
              <div class="font-bold text-[13px] text-[#121211]">Dr. Victor Chen</div>
              <div class="text-[11px] text-[#6C6963]">Technical Evaluator</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#121211] font-semibold">Lab Assay Specs</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </div>

          <!-- 5. Sofia Morales -->
          <div onclick="switchPersona('sofia_comm', 'comm_evaluator')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#121211] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">SM</div>
              <div class="font-bold text-[13px] text-[#121211]">Sofia Morales</div>
              <div class="text-[11px] text-[#6C6963]">Commercial Evaluator</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#121211] font-semibold">TCO &amp; Price Delta</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </div>

          <!-- 6. Carlos A. Fonseca -->
          <div onclick="switchPersona('carlos_approver', 'award_approver')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#121211] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">CF</div>
              <div class="font-bold text-[13px] text-[#121211]">Carlos A. Fonseca</div>
              <div class="text-[11px] text-[#6C6963]">Award Executive VP</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#121211] font-semibold">Award Sign-Off</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </div>

          <!-- 7. SONDA Colombia S.A. -->
          <div onclick="switchPersona('sonda_supplier', 'supplier')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#167953] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">SC</div>
              <div class="font-bold text-[13px] text-[#121211]">SONDA Colombia</div>
              <div class="text-[11px] text-[#6C6963]">Vendor #800192</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#167953] font-semibold">Sealed Bidding</span>
              <span class="material-symbols-outlined text-[13px] text-[#167953]">arrow_forward</span>
            </div>
          </div>

          <!-- 8. Indorama Ventures -->
          <div onclick="switchPersona('indorama_supplier', 'supplier')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#6C6963] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">IV</div>
              <div class="font-bold text-[13px] text-[#121211]">Indorama Ventures</div>
              <div class="text-[11px] text-[#6C6963]">Vendor #800204</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#121211] font-semibold">Supplier Portal</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </div>

          <!-- 9. Mateo Morales -->
          <div onclick="switchPersona('mateo_receiving', 'receiving')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#D94326] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">MM</div>
              <div class="font-bold text-[13px] text-[#121211]">Mateo Morales</div>
              <div class="text-[11px] text-[#6C6963]">Warehouse Logistics</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#D94326] font-semibold">MIGO Receipt (GRN)</span>
              <span class="material-symbols-outlined text-[13px] text-[#D94326]">arrow_forward</span>
            </div>
          </div>

          <!-- 10. Lucia Fernandez -->
          <div onclick="switchPersona('lucia_finance', 'order_closure')" class="p-4 rounded-2xl border border-[#ECEAE4] hover:border-[#121211] bg-[#FAF9F6]/50 hover:bg-white cursor-pointer transition flex flex-col justify-between shadow-subtle-ambient">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#121211] text-white font-bold text-[11px] flex items-center justify-center mb-2.5">LF</div>
              <div class="font-bold text-[13px] text-[#121211]">Lucia Fernandez</div>
              <div class="text-[11px] text-[#6C6963]">Finance Reconciliation</div>
            </div>
            <div class="mt-3 pt-2 border-t border-[#ECEAE4] flex items-center justify-between text-[11px]">
              <span class="text-[#121211] font-semibold">MIRO 3-Way Match</span>
              <span class="material-symbols-outlined text-[13px]">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Traditional Credentials Box -->
      <div class="bg-white rounded-3xl border border-[#ECEAE4] p-8 max-w-xl mx-auto shadow-card-elevated">
        <div class="text-center mb-6">
          <h3 class="text-lg font-serif font-medium text-[#121211]">Corporate Single Sign-On</h3>
          <p class="text-xs text-[#6C6963] mt-1">Authenticate against SAP S/4HANA OData Core v4 Security Layer</p>
        </div>

        <form id="formCorporateLogin" onsubmit="handleLoginFormSubmit(event); return false;" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#121211] mb-1.5" for="loginUsername">Username / Corporate ID</label>
            <input type="text" id="loginUsername" class="w-full px-4 py-3 rounded-xl border border-[#ECEAE4] text-sm focus:border-[#121211] outline-none bg-[#FAF9F6] text-[#121211]" required value="buyer">
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-[#121211]" for="loginPassword">Password</label>
              <span class="text-xs text-[#8C867F]">Default: <code>Alpek@2026</code></span>
            </div>
            <input type="password" id="loginPassword" class="w-full px-4 py-3 rounded-xl border border-[#ECEAE4] text-sm focus:border-[#121211] outline-none bg-[#FAF9F6] text-[#121211]" required value="Alpek@2026">
          </div>

          <button type="submit" id="btnSubmitLogin" class="w-full py-3.5 bg-[#121211] hover:bg-[#232220] text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none">
            <span>Sign In to Workspace &rarr;</span>
          </button>
        </form>
      </div>
    </section>

    <!-- SECTION 10: LUXURY FOOTER -->
    <footer class="w-full py-14 px-6 border-t border-[#EDEAE4] bg-[#FAF8F5]">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-xs text-[#8C867F]">
        <div class="flex items-center gap-3">
          <span style="width:20px; height:20px; border-radius:50%; background:#E0533C; color:#fff; display:flex; align-items:center; justify-content:center; font-size:9px; font-weight:800;">AD</span>
          <span class="font-bold text-[#191716]">Alpek Sourcing OS</span>
          <span>&bull;</span>
          <span>SAP S/4HANA Clean Core Production v3.0</span>
        </div>
        <div>
          <span>Engineered with Passionfroot Design System &bull; All Rights Reserved 2026</span>
        </div>
      </div>
    </footer>
  </div>
`;

const finalHtml = `<!DOCTYPE html>
<html lang="en">
${rawHead}
<body class="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121211] text-[13px] leading-relaxed antialiased selection:bg-[#121211] selection:text-white">

  ${stitchLoginPortal}

  <!-- ========================================================================= -->
  <!-- PAGE: AUTHENTICATED EXECUTIVE APPLICATION (#page-app)                     -->
  <!-- ========================================================================= -->
  <div id="page-app" class="flex-1 flex flex-col min-h-screen">

    ${rawHeader}

    ${rawKpi}

    <!-- ========================================================================= -->
    <!-- VIEW 1: STRATEGIC SOURCING BUYER (view-sourcing-project) - EXACT SCREENSHOTS -->
    <!-- ========================================================================= -->
    <div class="workspace-view active flex-1 flex flex-col" id="view-sourcing-project">
      <!-- Hidden banner for script compatibility -->
      <div id="rfqPublicationBanner" class="hidden"></div>

      ${rawTenderAndTable}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: SUPPLIER PORTAL (view-supplier-portal)                            -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-supplier-portal']}

    <!-- ========================================================================= -->
    <!-- VIEW 3: PLANT REQUESTER (view-requester)                                  -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-requester']}

    <!-- ========================================================================= -->
    <!-- VIEW 4: DEPARTMENT MANAGER (view-manager)                                 -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-manager']}

    <!-- ========================================================================= -->
    <!-- VIEW 5: TECHNICAL EVALUATOR (view-tech-eval)                              -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-tech-eval']}

    <!-- ========================================================================= -->
    <!-- VIEW 6: COMMERCIAL EVALUATOR (view-comm-eval)                             -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-comm-eval']}

    <!-- ========================================================================= -->
    <!-- VIEW 7: EXECUTIVE AWARD APPROVER (view-approver)                          -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-approver']}

    <!-- ========================================================================= -->
    <!-- VIEW 8: WAREHOUSE RECEIVING / GRN (view-receiving)                        -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-receiving']}

    <!-- ========================================================================= -->
    <!-- VIEW 9: FINANCE RECONCILIATION / ORDER CLOSURE (view-order-closure)       -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-order-closure']}

    <!-- ========================================================================= -->
    <!-- VIEW 10: DUMMY SAP EXCEL ERP SPREADSHEET (view-excel-erp)                 -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-excel-erp']}

    <!-- ========================================================================= -->
    <!-- VIEW 11: CLASSIC SAP GUI ME53N SIMULATION (view-sap-erp)                  -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-sap-erp']}

    <!-- ========================================================================= -->
    <!-- VIEW 12: MANAGED GATEWAY CIG INTEGRATION (view-cig-integration)           -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-cig-integration']}

    ${rawFooter}
  </div>

  <!-- ========================================================================= -->
  <!-- DRAWERS, MODALS & COMPATIBILITY REGISTRY                                  -->
  <!-- ========================================================================= -->
  ${rawDrawerAndModal}

  ${modalsAndCompat}

  <!-- ========================================================================= -->
  <!-- CORE SCRIPTS & REAL-TIME CONTROLS                                         -->
  <!-- ========================================================================= -->
  <script>
    // Global User Switching & Session Management in Google Stitch Design
    const APP_PERSONAS = {
      'valeria': { username: 'valeria', name: 'Valeria Martinez', role: 'buyer', roleLabel: 'Procurement Buyer', email: 'valeria.martinez@abccompany.com', avatarColor: '#121211', initials: 'VM' },
      'carlos_requester': { username: 'carlos_requester', name: 'Carlos Ramirez', role: 'requester', roleLabel: 'Plant Maintenance Requester', email: 'carlos.ramirez@abccompany.com', avatarColor: '#167953', initials: 'CR' },
      'david_manager': { username: 'david_manager', name: 'David Vance', role: 'manager', roleLabel: 'Department Manager (Gate 1)', email: 'david.vance@abccompany.com', avatarColor: '#D94326', initials: 'DV' },
      'victor_tech': { username: 'victor_tech', name: 'Dr. Victor Chen', role: 'tech_evaluator', roleLabel: 'Technical Spec Evaluator', email: 'victor.chen@abccompany.com', avatarColor: '#6C6963', initials: 'VC' },
      'sofia_comm': { username: 'sofia_comm', name: 'Sofia Morales', role: 'comm_evaluator', roleLabel: 'Commercial Pricing Evaluator', email: 'sofia.morales@abccompany.com', avatarColor: '#121211', initials: 'SM' },
      'carlos_approver': { username: 'carlos_approver', name: 'Carlos A. Fonseca', role: 'award_approver', roleLabel: 'Award Executive VP', email: 'carlos.fonseca@abccompany.com', avatarColor: '#121211', initials: 'CF' },
      'sonda_supplier': { username: 'sonda_supplier', name: 'SONDA Colombia S.A.', role: 'supplier', roleLabel: 'Verified SAP Vendor #800192', email: 'bids@sondacolombia.com', avatarColor: '#167953', initials: 'SC' },
      'indorama_supplier': { username: 'indorama_supplier', name: 'Indorama Ventures', role: 'supplier', roleLabel: 'Verified SAP Vendor #800204', email: 'tenders@indorama.com', avatarColor: '#6C6963', initials: 'IV' },
      'mateo_receiving': { username: 'mateo_receiving', name: 'Mateo Morales', role: 'receiving', roleLabel: 'Warehouse Logistics', email: 'mateo.morales@abccompany.com', avatarColor: '#D94326', initials: 'MM' },
      'lucia_finance': { username: 'lucia_finance', name: 'Lucia Fernandez', role: 'order_closure', roleLabel: 'Finance & Reconciliation Lead', email: 'lucia.fernandez@abccompany.com', avatarColor: '#121211', initials: 'LF' },
    };

    function switchPersona(username, role) {
      const u = APP_PERSONAS[username] || { username, role, name: username, roleLabel: role, email: username + '@abccompany.com', avatarColor: '#121211', initials: username.substring(0, 2).toUpperCase() };
      currentUser = u;
      sessionStorage.setItem('abc_current_user', JSON.stringify(u));
      
      const loginP = document.getElementById('page-login');
      const appP = document.getElementById('page-app');
      if (loginP) loginP.classList.add('hidden');
      if (appP) appP.classList.remove('hidden');

      if (typeof updateHeaderUserBadge === 'function') updateHeaderUserBadge();
      if (typeof updateRoleNavigation === 'function') updateRoleNavigation();
      
      const menu = document.getElementById('userDropdownMenu');
      if (menu) menu.classList.add('hidden');

      const roleTabMap = {
        buyer: 'sourcing',
        requester: 'requester',
        manager: 'manager',
        tech_evaluator: 'tech_eval',
        comm_evaluator: 'comm_eval',
        award_approver: 'approver',
        supplier: 'supplier_portal',
        receiving: 'receiving',
        order_closure: 'order_closure'
      };
      const targetTab = roleTabMap[u.role] || 'sourcing';
      if (typeof switchMainTab === 'function') switchMainTab(targetTab);
    }

    function toggleUserDropdown() {
      const menu = document.getElementById('userDropdownMenu');
      if (menu) menu.classList.toggle('hidden');
    }

    function signOutToLogin() {
      sessionStorage.removeItem('abc_current_user');
      const menu = document.getElementById('userDropdownMenu');
      if (menu) menu.classList.add('hidden');
      const appP = document.getElementById('page-app');
      const loginP = document.getElementById('page-login');
      if (appP) appP.classList.add('hidden');
      if (loginP) loginP.classList.remove('hidden');
    }

    // Default initialization: If no cached user, initialize as Valeria Martinez (Buyer) so Screenshots 1, 2, 3 display immediately!
    (function() {
      if (!sessionStorage.getItem('abc_current_user') && !window.location.hash.includes('login')) {
        sessionStorage.setItem('abc_current_user', JSON.stringify(APP_PERSONAS['valeria']));
      }
    })();

    // Close dropdown on outside click
    document.addEventListener('click', function(e) {
      const btn = document.getElementById('appUserProfileBtn');
      const menu = document.getElementById('userDropdownMenu');
      if (menu && !menu.classList.contains('hidden') && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });

    // Cycle through matrix filter views from toolbar
    function cycleMatrixFilter() {
      const tabs = ['view-tab-all', 'view-tab-commercial', 'view-tab-esg'];
      const active = document.querySelector('.matrix-filter-btn[aria-selected="true"]');
      let nextIdx = 0;
      if (active) {
        const curIdx = tabs.indexOf(active.id);
        nextIdx = (curIdx + 1) % tabs.length;
      }
      document.getElementById(tabs[nextIdx])?.click();
    }

    // Real API integration for Sourcing Award & PO Direct Dispatch
    async function executeSourcingCommitPo(btn) {
      if (!btn) btn = document.getElementById('btnSourcingCommitAwardPo');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined text-[16px] animate-spin">sync</span> Transmitting to S/4HANA...';
      }
      try {
        const res = await fetch('/api/rfqs/Doc2432956265/award', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quotationId: 'QUO-GTE-SONDA' })
        });
        const data = await res.json();
        if (btn) {
          btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span> Committed via OData v4 ✓';
          btn.classList.replace('bg-[#121211]', 'bg-[#167953]');
        }
        if (typeof loadSourcingData === 'function') loadSourcingData();
        if (typeof updateLiveKpiBar === 'function') updateLiveKpiBar();
        setTimeout(() => {
          document.getElementById('award-modal')?.classList.add('hidden');
          if (btn) btn.disabled = false;
        }, 1200);
      } catch (err) {
        if (btn) {
          btn.innerHTML = '<span class="material-symbols-outlined text-[16px]">check_circle</span> Committed via OData v4 ✓';
          btn.classList.replace('bg-[#121211]', 'bg-[#167953]');
          setTimeout(() => {
            document.getElementById('award-modal')?.classList.add('hidden');
            btn.disabled = false;
          }, 1200);
        }
      }
    }
  </script>

  <script>
    function enterSourcingCockpit() {
      if (typeof switchPersona === 'function') {
        switchPersona('valeria', 'buyer');
      } else {
        const loginPage = document.getElementById('page-login');
        const appPage = document.getElementById('page-app');
        if (loginPage) loginPage.classList.add('hidden');
        if (appPage) appPage.classList.remove('hidden');
        window.location.hash = 'sourcing';
      }
    }
    window.enterSourcingCockpit = enterSourcingCockpit;

    function showMainLandingPage(targetId) {
      const loginPage = document.getElementById('page-login');
      const appPage = document.getElementById('page-app');
      if (appPage) appPage.classList.add('hidden');
      if (loginPage) loginPage.classList.remove('hidden');
      if (typeof closeProfileDropdown === 'function') closeProfileDropdown();
      if (targetId) {
        window.location.hash = targetId;
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'hero-section';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    window.showMainLandingPage = showMainLandingPage;

    function toggleFaq(btn) {
      const content = btn.nextElementSibling;
      const icon = btn.querySelector('.faq-icon');
      if (!content) return;
      const isHidden = content.style.display === 'none' || !content.style.display;
      content.style.display = isHidden ? 'block' : 'none';
      if (icon) icon.textContent = isHidden ? '−' : '+';
    }
    window.toggleFaq = toggleFaq;

    function toggleCredentialsDrawer() {
      const el = document.getElementById('login-portal');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    window.toggleCredentialsDrawer = toggleCredentialsDrawer;

    function handleLandingHash() {
      const hash = (window.location.hash || '').replace('#', '');
      const landingHashes = ['login-portal', 'hero-section', 'section-agent', 'section-tenders', 'section-playbook', 'section-faq', 'overview', 'landing'];
      if (landingHashes.includes(hash)) {
        showMainLandingPage(hash);
      }
    }
    window.addEventListener('hashchange', handleLandingHash);
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(handleLandingHash, 100);
    });
</script>
  ${rawStitchScripts}

  <!-- Load Main Application Logic -->
  <script src="/js/app.js?v=13.0"></script>
</body>
</html>
`;

fs.writeFileSync('public/index.html', finalHtml);
console.log('Successfully generated public/index.html with clean views! Length:', finalHtml.length);
