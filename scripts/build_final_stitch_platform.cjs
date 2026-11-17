const fs = require('fs');
const path = require('path');

// 1. Read Stitch base from raw_7f554de.html
const stitchRaw = fs.readFileSync('apps/alpek-supplier-platform/scripts/raw_7f554de.html', 'utf8');

// 2. Read clean views extracted from scripts/clean_view-*.html (verified 0 diff, perfectly closed)
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
  viewHtmlMap[v] = fs.readFileSync(`apps/alpek-supplier-platform/scripts/clean_${v}.html`, 'utf8');
});

// 3. Extract Head from stitchRaw
const headStart = stitchRaw.indexOf('<head>');
const headEnd = stitchRaw.indexOf('</head>') + 7;
let rawHead = stitchRaw.substring(headStart, headEnd);

// Add custom workspace & table styling
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
      margin: 1.25rem 1.5rem 0 1.5rem;
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
if (!rawHead.includes('/css/landing.css')) {
  rawHead = rawHead.replace('</head>', '  <link rel="stylesheet" href="/css/landing.css">\n</head>');
}

// 4. Exact section extraction from stitchRaw
const kpiStart = stitchRaw.indexOf('<!-- 2. Executive Metric KPI Strip');
const kpiEnd = stitchRaw.indexOf('<!-- 3. Strategic Tender Hero Showcase');
const rawKpi = stitchRaw.substring(kpiStart, kpiEnd).trim();

const tenderStart = stitchRaw.indexOf('<!-- 3. Strategic Tender Hero Showcase');
const tenderEnd = stitchRaw.indexOf('<!-- 5. cXML Drawer Slide-over');
let rawTenderAndTable = stitchRaw.substring(tenderStart, tenderEnd).trim();

// Wire filter buttons
rawTenderAndTable = rawTenderAndTable.replace(
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition" title="Filter columns"`,
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition cursor-pointer" title="Cycle Filter View" onclick="cycleMatrixView()"`
);
rawTenderAndTable = rawTenderAndTable.replace(
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition" title="Toggle full matrix"`,
  `class="w-8 h-8 rounded-full border border-[#ECEAE4] hover:bg-[#FAF9F6] flex items-center justify-center text-[#6C6963] transition cursor-pointer" title="Reset to All Criteria" onclick="document.querySelector('.matrix-filter-btn[data-view=\\'all\\']')?.click()"`
);

const drawerStart = stitchRaw.indexOf('<!-- 5. cXML Drawer Slide-over');
const drawerEnd = stitchRaw.indexOf('<!-- 7. Footer');
const rawDrawer = stitchRaw.substring(drawerStart, drawerEnd).trim();

const footerStart = stitchRaw.indexOf('<!-- 7. Footer');
const footerEnd = stitchRaw.indexOf('</footer>', footerStart) + 9;
const rawFooter = stitchRaw.substring(footerStart, footerEnd).trim();

const scriptsStart = stitchRaw.indexOf('<script>', footerEnd);
const bodyEnd = stitchRaw.indexOf('</body>');
const rawStitchScripts = stitchRaw.substring(scriptsStart, bodyEnd).trim();

// 5. Build ONE single application header for #page-app
const appHeaderHtml = `
<header class="w-full px-6 pt-5 pb-3">
  <div class="max-w-[1720px] mx-auto bg-white/95 backdrop-blur-md rounded-full border border-[#ECEAE4] shadow-subtle-ambient px-4 py-2 flex items-center justify-between gap-4">
    <!-- Shell Left: Monogram, Identity & Enterprise Badges (Clicking navigates to Landing Page / Dashboard) -->
    <div class="flex items-center gap-3 cursor-pointer select-none" onclick="toggleBrandNavigation()" title="Click to view Landing Page or Dashboard">
      <div class="w-9 h-9 rounded-full bg-[#121211] text-white flex items-center justify-center font-bold text-[12px] tracking-tight shrink-0 shadow-sm ring-2 ring-black/5">
        AD
      </div>
      <div class="flex items-center gap-2">
        <span class="font-bold text-[14.5px] tracking-tight text-[#121211] hover:underline">Alpek Sourcing OS</span>
        <span class="text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[#EDF8F3] text-[#167953] border border-[#BDE8D3]">
          Clean Core Certified
        </span>
        <span class="hidden sm:inline-flex items-center gap-1 text-[10.5px] font-medium font-mono px-2.5 py-0.5 rounded-full bg-[#FAF9F6] text-[#6C6963] border border-[#ECEAE4]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#167953] animate-pulse"></span>
          S/4HANA OData v4 • 14ms
        </span>
      </div>
    </div>

    <!-- Shell Center: High-Contrast Floating Nav Tabs (Dynamically rendered per Role) -->
    <nav id="appNavPills" class="hidden md:flex items-center gap-1.5 bg-[#FAF9F6] p-1 rounded-full border border-[#ECEAE4]/80">
      <button class="nav-pill-btn active bg-[#121211] text-white font-medium px-4 py-1.5 rounded-full text-[12.5px] transition shadow-pill-glow cursor-pointer border-none" onclick="switchMainTab('sourcing')">Sourcing Events</button>
      <button class="nav-pill-btn text-[#6C6963] hover:text-[#121211] hover:bg-white font-medium px-3.5 py-1.5 rounded-full text-[12.5px] transition cursor-pointer border-none bg-transparent" onclick="switchMainTab('order_closure')">Purchase Orders</button>
      <button class="nav-pill-btn text-[#6C6963] hover:text-[#121211] hover:bg-white font-medium px-3.5 py-1.5 rounded-full text-[12.5px] transition cursor-pointer border-none bg-transparent" onclick="switchMainTab('excel_erp')">ERP Requisitions &amp; POs</button>
      <button class="nav-pill-btn text-[#6C6963] hover:text-[#121211] hover:bg-white font-medium px-3.5 py-1.5 rounded-full text-[12.5px] transition cursor-pointer border-none bg-transparent" onclick="switchMainTab('sap_erp')">SAP GUI (ME53N)</button>
      <button class="nav-pill-btn text-[#6C6963] hover:text-[#121211] hover:bg-white font-medium px-3.5 py-1.5 rounded-full text-[12.5px] transition cursor-pointer border-none bg-transparent" onclick="switchMainTab('integration')">CIG Integration</button>
    </nav>

    <!-- Shell Right: Verified User Profile Pill & 1-Click Logout -->
    <div class="flex items-center gap-2">
      <div class="relative">
        <div id="appUserProfileBtn" onclick="toggleUserDropdown(event)" class="border border-[#ECEAE4] bg-white hover:border-[#DCD8CE] pl-1 pr-3 py-1 rounded-full flex items-center gap-2.5 transition cursor-pointer shadow-xs select-none">
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

        <!-- Professional Profile Menu (Clean enterprise production) -->
        <div id="userDropdownMenu" class="hidden absolute right-0 mt-2.5 w-72 bg-white rounded-3xl shadow-float-pop border border-[#ECEAE4] z-50 p-4 text-[12.5px] animate-in fade-in duration-150">
          <div class="pb-3 mb-2.5 border-b border-[#ECEAE4] flex items-center gap-3">
            <div id="dropdownAvatar" class="w-10 h-10 rounded-full bg-[#121211] text-white flex items-center justify-center font-bold text-[13px] shadow-sm">VM</div>
            <div class="flex-1 min-w-0">
              <div id="dropdownName" class="font-bold text-[#121211] text-[13.5px] truncate">Valeria Martinez</div>
              <div id="dropdownRole" class="text-[11px] text-[#6C6963] truncate">Procurement Buyer</div>
              <div id="dropdownEmail" class="text-[10.5px] font-mono text-[#9E9A92] truncate">valeria.martinez@abccompany.com</div>
            </div>
          </div>
          <div class="py-1 flex flex-col gap-1.5 text-[11.5px] text-[#6C6963]">
            <div class="flex items-center justify-between px-2 py-1 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4]">
              <span>Security Layer:</span>
              <span class="font-mono text-[#167953] font-semibold">S/4HANA OData v4</span>
            </div>
            <div class="flex items-center justify-between px-2 py-1 rounded-xl bg-[#FAF9F6] border border-[#ECEAE4]">
              <span>Compliance:</span>
              <span class="text-[#167953] font-semibold">Clean Core Certified</span>
            </div>
          </div>
          <div class="pt-3 mt-3 border-t border-[#ECEAE4]">
            <button type="button" onclick="signOutToLogin()" class="w-full py-2.5 px-4 rounded-full bg-[#FDF2F0] hover:bg-[#FAD8D2] text-[#D94326] font-semibold text-[12.5px] text-center flex items-center justify-center gap-2 transition cursor-pointer border border-[#FAD8D2] shadow-xs">
              <span class="material-symbols-outlined text-[16px]">logout</span>
              <span>Sign Out to Enterprise Portal</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Quick 1-Click Logout Button on Header Bar -->
      <button type="button" onclick="signOutToLogin()" title="Sign Out of Corporate Session" class="w-9 h-9 rounded-full bg-white hover:bg-[#FDF2F0] text-[#6C6963] hover:text-[#D94326] border border-[#ECEAE4] hover:border-[#FAD8D2] flex items-center justify-center transition cursor-pointer shadow-xs select-none">
        <span class="material-symbols-outlined text-[16px]">logout</span>
      </button>
    </div></div>
</header>
`;

// 6. Build Landing Page (#page-login)
// Read from git show 2fec07e:public/index.html to ensure clean source
const { execSync } = require('child_process');
const raw2fec = execSync('git show 2fec07e:public/index.html', { cwd: 'apps/alpek-supplier-platform', maxBuffer: 10 * 1024 * 1024 }).toString('utf8');
const pStart = raw2fec.indexOf('<div id="page-login"');
const footerEndIdx = raw2fec.indexOf('</footer>', pStart);
const closeDivIdx = raw2fec.indexOf('</div>', footerEndIdx);
let cleanLanding = raw2fec.substring(pStart, closeDivIdx + 6).trim();

// Landing Page Header updates:
cleanLanding = cleanLanding.replace(
  /<a href="\/" style="display:flex; align-items:center; gap:10px; text-decoration:none;">[\s\S]*?<\/a>/,
  `<a href="javascript:void(0)" onclick="toggleBrandNavigation()" style="display:flex; align-items:center; gap:10px; text-decoration:none;">
              <span style="width:28px; height:28px; border-radius:50%; background:#121211; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; border:1px solid rgba(255,255,255,0.3);">AD</span>
              <span style="font-family:'Newsreader', Georgia, serif; font-weight:700; font-size:17px; color:#121211; letter-spacing:-0.02em;">Alpek Sourcing OS</span>
              <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#167953; background:#EDF8F3; padding:2px 8px; border-radius:9999px; border:1px solid #BDE8D3;">Clean Core</span>
            </a>`
);
cleanLanding = cleanLanding.replace(/<a href="#login-portal" class="btn-nav-role">[\s\S]*?<\/a>/, '');
cleanLanding = cleanLanding.replace(
  /<a href="#login-portal" class="btn-nav-signin">[\s\S]*?<\/a>/,
  `<a href="#login-portal" class="btn-nav-signin" style="background:#121211; color:#fff; font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:6px;"><span>Sign In</span> &rarr;</a>`
);

// Hero CTA buttons:
cleanLanding = cleanLanding.replace(
  /<div class="hero-cta-group">[\s\S]*?<\/div>/,
  `<div class="hero-cta-group">
          <a href="#login-portal" class="btn-hero-primary" style="text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
            <span>Sign In to Sourcing OS</span>
            <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
          <a href="#section-agent" class="btn-hero-secondary" style="text-decoration:none; display:inline-flex; align-items:center; gap:8px;">
            <span>Explore Capabilities</span>
            <span class="material-symbols-outlined text-[18px]">arrow_downward</span>
          </a>
        </div>`
);

// Replace #login-portal with clean corporate SSO card (no preview cards)
const portalStart = cleanLanding.indexOf('<section id="login-portal"');
const footerStartIdx = cleanLanding.lastIndexOf('<!-- SECTION 10: LUXURY FOOTER -->');

const corporateLoginPortalSection = `
    <!-- SECTION 9: FORMAL CORPORATE AUTHENTICATION DECK -->
    <section id="login-portal" class="w-full py-20 px-6 max-w-4xl mx-auto">
      <div class="text-center max-w-xl mx-auto mb-10">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF8F3] text-[#167953] border border-[#BDE8D3] text-xs font-bold uppercase tracking-wider mb-4">
          <span class="w-1.5 h-1.5 rounded-full bg-[#167953] animate-pulse"></span>
          Enterprise Single Sign-On • S/4HANA Clean Core
        </div>
        <h2 class="text-3xl sm:text-4xl font-serif font-medium text-[#121211] tracking-tight">
          Sign In to Enterprise Workspace
        </h2>
        <p class="mt-3 text-sm text-[#6C6963] leading-relaxed">
          Enter your authorized corporate credentials to access your dedicated procurement workspace (Buyer, Approver, Supplier, Evaluator, Logistics).
        </p>
      </div>

      <div class="bg-white rounded-3xl border border-[#ECEAE4] p-8 max-w-md mx-auto shadow-card-elevated">
        <form id="formCorporateLogin" onsubmit="handleLoginFormSubmit(event); return false;" class="space-y-4">
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-[#121211] mb-1.5" for="loginUsername">Corporate ID or Work Email</label>
            <input type="text" id="loginUsername" class="w-full px-4 py-3 rounded-xl border border-[#ECEAE4] text-sm focus:border-[#121211] outline-none bg-[#FAF9F6] text-[#121211]" placeholder="e.g. buyer, supplier_a, manager" required value="buyer">
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="block text-xs font-bold uppercase tracking-wider text-[#121211]" for="loginPassword">Password</label>
              <span class="text-xs text-[#8C867F]">Default: <code>Alpek@2026</code></span>
            </div>
            <input type="password" id="loginPassword" class="w-full px-4 py-3 rounded-xl border border-[#ECEAE4] text-sm focus:border-[#121211] outline-none bg-[#FAF9F6] text-[#121211]" placeholder="••••••••••••" required value="Alpek@2026">
          </div>

          <button type="submit" id="btnSubmitLogin" class="w-full py-3.5 bg-[#121211] hover:bg-[#232220] text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border-none mt-2">
            <span>Sign In to Workspace &rarr;</span>
          </button>
        </form>

        <details class="mt-6 pt-4 border-t border-[#ECEAE4] text-xs text-[#6C6963]">
          <summary class="hover:underline font-semibold text-[#121211] cursor-pointer select-none">Authorized Enterprise Test Accounts</summary>
          <div class="mt-2.5 p-3 bg-[#FAF9F6] rounded-xl border border-[#ECEAE4] font-mono text-[11px] space-y-1 text-[#555]">
            <div><strong>Buyer:</strong> <code>buyer</code> / <code>valeria.martinez</code></div>
            <div><strong>Suppliers:</strong> <code>supplier_a</code> (SONDA), <code>supplier_b</code> (Indorama)</div>
            <div><strong>Requester:</strong> <code>requester</code> / <code>carlos.ramirez</code></div>
            <div><strong>Manager:</strong> <code>manager</code> / <code>david.vance</code></div>
            <div><strong>Technical Evaluator:</strong> <code>tech_eval</code> / <code>victor.chen</code></div>
            <div><strong>Commercial Evaluator:</strong> <code>comm_eval</code> / <code>sofia.morales</code></div>
            <div><strong>Award Approver:</strong> <code>award_approver</code> / <code>carlos.fonseca</code></div>
            <div><strong>Warehouse Receiving:</strong> <code>receiving</code> / <code>mateo.morales</code></div>
            <div><strong>Finance &amp; Admin:</strong> <code>admin</code></div>
            <div class="pt-1 text-[#888]">Standard Password: <code>Alpek@2026</code></div>
          </div>
        </details>
      </div>
    </section>
`;

const stitchLoginPortal = cleanLanding.substring(0, portalStart) + corporateLoginPortalSection.trim() + '\n\n    ' + cleanLanding.substring(footerStartIdx);

// 7. Modals
const modalsAndCompat = `
  <!-- All Application Modals (Clean Core Sourcing & Procurement) -->
  <div id="modalAddPr" class="sap-modal-backdrop hidden">
    <div class="sap-dialog sap-dialog-md">
      <div class="sap-dialog-header">
        <div class="sap-dialog-title">Create Purchase Requisition (ME51N)</div>
        <button class="sap-dialog-close" onclick="closeModal('modalAddPr')">&times;</button>
      </div>
      <div class="sap-dialog-body">
        <form id="formAddPr" onsubmit="submitAddPr(event); return false;" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-[#121211] mb-1">Material Scope / Description</label>
            <input type="text" id="newPrTitle" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required placeholder="e.g. Refrigerant-134a Industrial Supply">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#121211] mb-1">Requested Quantity</label>
              <input type="number" id="newPrQuantity" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required value="7125000">
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#121211] mb-1">Unit of Measure</label>
              <input type="text" id="newPrUom" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required value="KG">
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#121211] mb-1">Estimated Unit Price (COP)</label>
              <input type="number" step="0.01" id="newPrPrice" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required value="3.50">
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#121211] mb-1">Receiving Plant</label>
              <input type="text" id="newPrPlant" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required value="CO-MOR-01">
            </div>
          </div>
          <div class="pt-2 flex justify-end gap-2">
            <button type="button" class="sap-btn-secondary" onclick="closeModal('modalAddPr')">Cancel</button>
            <button type="submit" class="sap-btn-primary">Submit to Manager Gate 1 &rarr;</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div id="modalRecordGrn" class="sap-modal-backdrop hidden">
    <div class="sap-dialog sap-dialog-md">
      <div class="sap-dialog-header">
        <div class="sap-dialog-title">Post Inward Goods Receipt (MIGO / GRN)</div>
        <button class="sap-dialog-close" onclick="closeModal('modalRecordGrn')">&times;</button>
      </div>
      <div class="sap-dialog-body">
        <form id="formRecordGrn" onsubmit="submitRecordGrn(event); return false;" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-[#121211] mb-1">Target Purchase Order</label>
            <select id="grnPoSelect" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required>
              <option value="PO-4500078416">PO 4500078416 - SONDA Colombia S.A. (7,125,000 KG)</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-[#121211] mb-1">Delivery Waybill / Remisión</label>
              <input type="text" id="grnWaybill" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required value="REM-2026-9812">
            </div>
            <div>
              <label class="block text-xs font-semibold text-[#121211] mb-1">Accepted Quantity</label>
              <input type="number" id="grnQuantity" class="w-full px-3 py-2 rounded-xl border border-[#ECEAE4] text-xs" required value="7125000">
            </div>
          </div>
          <div class="pt-2 flex justify-end gap-2">
            <button type="button" class="sap-btn-secondary" onclick="closeModal('modalRecordGrn')">Cancel</button>
            <button type="submit" class="sap-btn-primary">Post GRN to S/4HANA &rarr;</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <div id="modalTraceability" class="sap-modal-backdrop hidden">
    <div class="sap-dialog sap-dialog-lg">
      <div class="sap-dialog-header">
        <div class="sap-dialog-title">Clean Core Sourcing Audit &amp; Lineage Trail</div>
        <button class="sap-dialog-close" onclick="closeModal('modalTraceability')">&times;</button>
      </div>
      <div class="sap-dialog-body">
        <div id="traceabilityContent" class="space-y-3 font-mono text-xs">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>
  </div>
`;

// 8. Helper scripts
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
      showMainLandingPage();
    } else {
      if (window.currentUser) {
        if (loginPage) loginPage.classList.add('hidden');
        if (appPage) appPage.classList.remove('hidden');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }
  window.toggleBrandNavigation = toggleBrandNavigation;

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

  function signOutToLogin() {
    sessionStorage.removeItem('abc_current_user');
    window.currentUser = null;
    const loginPage = document.getElementById('page-login');
    const appPage = document.getElementById('page-app');
    if (appPage) appPage.classList.add('hidden');
    if (loginPage) loginPage.classList.remove('hidden');
    if (typeof closeProfileDropdown === 'function') closeProfileDropdown();
    window.location.hash = 'login-portal';
    const el = document.getElementById('login-portal');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (typeof showSapToast === 'function') {
      showSapToast('Signed out of corporate session.', 'info');
    }
  }
  window.signOutToLogin = signOutToLogin;

  function toggleFaq(btn) {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('.faq-icon');
    if (!content) return;
    const isHidden = content.style.display === 'none' || !content.style.display;
    content.style.display = isHidden ? 'block' : 'none';
    if (icon) icon.textContent = isHidden ? '−' : '+';
  }
  window.toggleFaq = toggleFaq;

  function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
  }
  window.closeModal = closeModal;

  function openAddPrModal() {
    const m = document.getElementById('modalAddPr');
    if (m) m.classList.remove('hidden');
  }
  window.openAddPrModal = openAddPrModal;

  function openRecordGrnModal() {
    const m = document.getElementById('modalRecordGrn');
    if (m) m.classList.remove('hidden');
  }
  window.openRecordGrnModal = openRecordGrnModal;
</script>
`;

// 9. Assemble the final index.html
const finalHtml = `<!DOCTYPE html>
<html lang="en">
${rawHead}
<body class="min-h-screen flex flex-col bg-[#FAF9F6] text-[#121211] text-[13px] leading-relaxed antialiased selection:bg-[#121211] selection:text-white">

  ${stitchLoginPortal}

  <!-- ========================================================================= -->
  <!-- PAGE: AUTHENTICATED EXECUTIVE APPLICATION (#page-app)                     -->
  <!-- ========================================================================= -->
  <div id="page-app" class="flex-1 flex flex-col min-h-screen">

    ${appHeaderHtml}

    ${rawKpi}

    <!-- ========================================================================= -->
    <!-- VIEW 1: STRATEGIC SOURCING BUYER (view-sourcing-project) - EXACT SCREENSHOTS -->
    <!-- ========================================================================= -->
    <div class="workspace-view active flex-1 flex flex-col" id="view-sourcing-project">
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
    <!-- VIEW 7: AWARD APPROVER (view-approver)                                    -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-approver']}

    <!-- ========================================================================= -->
    <!-- VIEW 8: WAREHOUSE RECEIVING (view-receiving)                              -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-receiving']}

    <!-- ========================================================================= -->
    <!-- VIEW 9: FINANCE & ORDER CLOSURE (view-order-closure)                      -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-order-closure']}

    <!-- ========================================================================= -->
    <!-- VIEW 10: ERP REQUISITIONS & PO EXCEL (view-excel-erp)                     -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-excel-erp']}

    <!-- ========================================================================= -->
    <!-- VIEW 11: SAP GUI ME53N SIMULATION (view-sap-erp)                          -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-sap-erp']}

    <!-- ========================================================================= -->
    <!-- VIEW 12: MANAGED GATEWAY CIG (view-cig-integration)                       -->
    <!-- ========================================================================= -->
    ${viewHtmlMap['view-cig-integration']}

    ${rawDrawer}

    ${rawFooter}

  </div>

  ${modalsAndCompat}

  ${helperScripts}

  ${rawStitchScripts}

  <!-- Load Main Application Logic -->
  <script src="/js/app.js?v=15.0"></script>
</body>
</html>
`;

fs.writeFileSync('apps/alpek-supplier-platform/public/index.html', finalHtml);
fs.writeFileSync('apps/alpek-supplier-platform/scripts/build_final_stitch_platform.cjs', fs.readFileSync(__filename, 'utf8'));
console.log('Successfully generated public/index.html! Length:', finalHtml.length);
