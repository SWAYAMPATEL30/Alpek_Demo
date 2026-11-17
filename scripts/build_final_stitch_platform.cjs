const fs = require('fs');
const path = require('path');

// 1. Read Stitch base from raw_7f554de.html
const stitchRaw = fs.readFileSync('scripts/raw_7f554de.html', 'utf8');

// 2. Read public/index.html to extract other views and modals
const currentIndex = fs.readFileSync('public/index.html', 'utf8');

function extractView(id, nextId) {
  const start = currentIndex.indexOf(`id="${id}"`);
  if (start === -1) throw new Error(`View ${id} not found`);
  const tagStart = currentIndex.lastIndexOf('<div', start);
  const nextStart = currentIndex.indexOf(`id="${nextId}"`);
  if (nextStart === -1) throw new Error(`Next view ${nextId} not found`);
  const end = currentIndex.lastIndexOf('</div>', nextStart);
  return currentIndex.substring(tagStart, end).trim();
}

const supplierPortalHtml = extractView('view-supplier-portal', 'view-requester');
const requesterHtml = extractView('view-requester', 'view-manager');
const managerHtml = extractView('view-manager', 'view-tech-eval');
const techEvalHtml = extractView('view-tech-eval', 'view-comm-eval');
const commEvalHtml = extractView('view-comm-eval', 'view-approver');
const approverHtml = extractView('view-approver', 'view-receiving');
const receivingHtml = extractView('view-receiving', 'view-order-closure');
const closureHtml = extractView('view-order-closure', 'view-excel-erp');
const excelErpHtml = extractView('view-excel-erp', 'view-sap-erp');
const sapErpHtml = extractView('view-sap-erp', 'view-cig-integration');
const cigIntegrationHtml = extractView('view-cig-integration', 'modalFollowOnSuccess');

const modalsStart = currentIndex.indexOf('<!-- All Application Modals');
const modalsEnd = currentIndex.indexOf('<script>', modalsStart);
const modalsAndCompat = currentIndex.substring(modalsStart, modalsEnd).trim();

// 3. Extract parts from stitchRaw
const headStart = stitchRaw.indexOf('<head>');
const headEnd = stitchRaw.indexOf('</head>') + 7;
let rawHead = stitchRaw.substring(headStart, headEnd);

// Ensure workspace-view and Stitch modal styles are in <style>
const additionalStyles = `
    /* Workspace Views */
    .workspace-view {
      display: none !important;
    }
    .workspace-view.active {
      display: flex !important;
      flex-direction: column !important;
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
    .btn-stitch-primary {
      background: #121211;
      color: #FFFFFF;
      border-radius: 9999px;
      padding: 8px 18px;
      font-weight: 600;
      font-size: 13px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 8px rgba(18, 18, 17, 0.08);
      transition: background 0.15s ease-in-out;
    }
    .btn-stitch-primary:hover {
      background: #232220;
    }
    .btn-stitch-secondary {
      background: #FFFFFF;
      color: #121211;
      border: 1px solid #ECEAE4;
      border-radius: 9999px;
      padding: 8px 18px;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease-in-out;
    }
    .btn-stitch-secondary:hover {
      border-color: #D9D6CE;
      background: #FAF9F6;
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

// Ensure Lineage timeline has proper ID and action
rawHeader = rawHeader.replace(`onclick="document.getElementById('cxml-drawer').classList.remove('hidden')"`, `id="btnTopTraceability" onclick="openTraceabilityModal()"`);

// Add hidden appNavPills to nav container
rawHeader = rawHeader.replace('</nav>', '<div id="appNavPills" class="hidden"></div>\n</nav>');

// KPI Strip
const kpiStart = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 2. Executive Metric KPI Strip');
const kpiEnd = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 3. Strategic Tender Hero Showcase');
let rawKpi = stitchRaw.substring(kpiStart, kpiEnd);
rawKpi = rawKpi.replace('<section class="w-full px-6 pt-2 pb-4">', '<section id="executiveKpiStrip" class="w-full px-6 pt-2 pb-4">');

// Tender Showcase & Table
const tenderStart = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 3. Strategic Tender Hero Showcase');
const tenderEnd = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 5. cXML Drawer');
const rawTenderAndTable = stitchRaw.substring(tenderStart, tenderEnd);

// Drawer & Modal
const drawerStart = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 5. cXML Drawer');
const drawerEnd = stitchRaw.indexOf('<!-- ========================================================================= -->\n<!-- 7. Footer');
const rawDrawerAndModal = stitchRaw.substring(drawerStart, drawerEnd);

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
  <!-- ========================================================================= -->
  <!-- PAGE: CORPORATE AUTHENTICATION PORTAL (#page-login)                       -->
  <!-- ========================================================================= -->
  <div id="page-login" class="hidden min-h-screen flex flex-col bg-[#FAF9F6]">
    <!-- Floating Header -->
    <header class="w-full px-6 pt-5 pb-3">
      <div class="max-w-[1720px] mx-auto bg-white/95 backdrop-blur-md rounded-full border border-[#ECEAE4] shadow-subtle-ambient px-4 py-2 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-[#121211] text-white flex items-center justify-center font-bold text-[12px] tracking-tight shrink-0 shadow-sm ring-2 ring-black/5">
            AD
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-[14.5px] tracking-tight text-[#121211]">Alpek Sourcing OS</span>
            <span class="text-[10.5px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full bg-[#EDF8F3] text-[#167953] border border-[#BDE8D3]">
              Clean Core Certified
            </span>
          </div>
        </div>
        <div class="flex items-center gap-2 text-[11.5px] font-mono text-[#6C6963]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#167953] animate-pulse"></span>
          <span>S/4HANA OData Core v4: Online (14ms)</span>
        </div>
      </div>
    </header>

    <!-- Main Login Container -->
    <main class="flex-1 max-w-5xl mx-auto w-full p-6 flex flex-col justify-center gap-6">
      <!-- Mission Hero Showcase -->
      <div class="bg-white rounded-3xl border border-[#ECEAE4] p-8 shadow-card-elevated flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="max-w-xl">
          <div class="flex items-center gap-2 mb-2">
            <span class="px-3 py-0.5 rounded-full bg-[#EDF8F3] text-[#167953] border border-[#BDE8D3] text-[10.5px] font-bold uppercase tracking-wider">Enterprise Single Sign-On</span>
            <span class="text-[11px] font-mono text-[#6C6963]">SAP S/4HANA Cloud</span>
          </div>
          <h1 class="text-3xl md:text-4xl font-serif font-medium text-[#121211] tracking-tight leading-tight">Enterprise Strategic Sourcing OS</h1>
          <p class="text-[#6C6963] text-[13.5px] mt-2 leading-relaxed">Clean Core Certified platform covering demand ingestion, two-envelope evaluation, sealed cryptographic bidding, and zero-modification S/4HANA PO commitment.</p>
        </div>
        <button onclick="switchPersona('valeria', 'buyer')" class="h-11 px-6 rounded-full bg-[#121211] hover:bg-[#232220] text-white font-medium text-[13px] flex items-center gap-2 shadow-pill-glow shrink-0 transition-colors cursor-pointer border-none">
          <span>Enter Sourcing Cockpit</span>
          <span class="material-symbols-outlined text-[17px]">arrow_forward</span>
        </button>
      </div>

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

      <!-- Traditional Credentials Box -->
      <div class="bg-white rounded-3xl border border-[#ECEAE4] p-6 shadow-card-elevated max-w-md mx-auto w-full">
        <h3 class="font-serif font-medium text-lg text-[#121211] mb-3">Enterprise Single Sign-On</h3>
        <form onsubmit="event.preventDefault(); document.getElementById('btnSubmitLogin').click();" class="flex flex-col gap-3">
          <div>
            <label class="block text-[12px] font-medium text-[#6C6963] mb-1">Username / Personnel ID</label>
            <input id="loginUsername" type="text" value="valeria" class="w-full h-10 px-3.5 bg-[#FAF9F6] text-[13px] text-[#121211] border border-[#ECEAE4] rounded-full focus:outline-none focus:border-[#121211]" placeholder="e.g. valeria"/>
          </div>
          <div>
            <label class="block text-[12px] font-medium text-[#6C6963] mb-1">Password</label>
            <input id="loginPassword" type="password" value="demo123" class="w-full h-10 px-3.5 bg-[#FAF9F6] text-[13px] text-[#121211] border border-[#ECEAE4] rounded-full focus:outline-none focus:border-[#121211]"/>
          </div>
          <button id="btnSubmitLogin" type="button" class="w-full h-10 rounded-full bg-[#121211] hover:bg-[#232220] text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-pill-glow transition-colors cursor-pointer border-none mt-1">
            <span>Sign In with S/4HANA OData</span>
          </button>
        </form>
      </div>
    </main>
  </div>
`;

// Assemble the final document
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
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-supplier-portal">
      ${supplierPortalHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 3: PLANT REQUESTER (view-requester)                                  -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-requester">
      ${requesterHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 4: DEPARTMENT MANAGER (view-manager)                                 -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-manager">
      ${managerHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 5: TECHNICAL EVALUATOR (view-tech-eval)                              -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-tech-eval">
      ${techEvalHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 6: COMMERCIAL EVALUATOR (view-comm-eval)                             -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-comm-eval">
      ${commEvalHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 7: EXECUTIVE AWARD APPROVER (view-approver)                          -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-approver">
      ${approverHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 8: WAREHOUSE RECEIVING / GRN (view-receiving)                        -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-receiving">
      ${receivingHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 9: FINANCE RECONCILIATION / ORDER CLOSURE (view-order-closure)       -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-order-closure">
      ${closureHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 10: DUMMY SAP EXCEL ERP SPREADSHEET (view-excel-erp)                 -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-excel-erp">
      ${excelErpHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 11: CLASSIC SAP GUI ME53N SIMULATION (view-sap-erp)                  -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-sap-erp">
      ${sapErpHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 12: MANAGED GATEWAY CIG INTEGRATION (view-cig-integration)           -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1720px] mx-auto w-full" id="view-cig-integration">
      ${cigIntegrationHtml}
    </div>

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
  </script>

  ${rawStitchScripts}

  <!-- Load Main Application Logic -->
  <script src="/js/app.js?v=13.0"></script>
</body>
</html>
`;

fs.writeFileSync('public/index.html', finalHtml);
console.log('Successfully generated final unified Google Stitch platform in public/index.html! Length:', finalHtml.length);
