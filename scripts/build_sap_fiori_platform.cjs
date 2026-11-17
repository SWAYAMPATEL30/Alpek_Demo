const fs = require('fs');
const path = require('path');

// 1. Read clean_sap_fiori.html
const cleanSapHtml = fs.readFileSync('scripts/clean_sap_fiori.html', 'utf8');

// Extract parts
const headerStart = cleanSapHtml.indexOf('<header');
const headerEnd = cleanSapHtml.indexOf('</header>') + 9;
let rawShellBar = cleanSapHtml.substring(headerStart, headerEnd);

const navStart = cleanSapHtml.indexOf('<nav class="bg-sap-shell');
const navEnd = cleanSapHtml.indexOf('</nav>', navStart) + 6;
let rawTabNav = cleanSapHtml.substring(navStart, navEnd);

const sectionStart = cleanSapHtml.indexOf('<section class="bg-sap-shell');
const sectionEnd = cleanSapHtml.indexOf('</section>', sectionStart) + 10;
const rawObjectHeader = cleanSapHtml.substring(sectionStart, sectionEnd);

const mainStart = cleanSapHtml.indexOf('<main');
const mainEnd = cleanSapHtml.indexOf('</main>', mainStart) + 7;
const rawMainContent = cleanSapHtml.substring(mainStart, mainEnd);

const drawerStart = cleanSapHtml.indexOf('id="cxml-drawer"');
const drawerBoxStart = cleanSapHtml.lastIndexOf('<div', drawerStart);
const drawerEnd = cleanSapHtml.indexOf('<!-- ========================================================================= -->\n<!-- 6. SAP Horizon Dialog Modal', drawerBoxStart);
const rawDrawer = cleanSapHtml.substring(drawerBoxStart, drawerEnd).trim();

const modalStart = cleanSapHtml.indexOf('id="award-modal"');
const modalBoxStart = cleanSapHtml.lastIndexOf('<div', modalStart);
const modalEnd = cleanSapHtml.indexOf('<!-- ========================================================================= -->\n<!-- 7. Footer', modalBoxStart);
const rawAwardModal = cleanSapHtml.substring(modalBoxStart, modalEnd).trim();

const footerStart = cleanSapHtml.indexOf('<footer');
const footerEnd = cleanSapHtml.indexOf('</footer>', footerStart) + 9;
const rawFooter = cleanSapHtml.substring(footerStart, footerEnd);

// 2. Read other views
const supplierPortalHtml = fs.readFileSync('scripts/view_view-supplier-portal.html', 'utf8');
const requesterHtml = fs.readFileSync('scripts/view_view-requester.html', 'utf8');
const managerHtml = fs.readFileSync('scripts/view_view-manager.html', 'utf8');
const techEvalHtml = fs.readFileSync('scripts/view_view-tech-eval.html', 'utf8');
const commEvalHtml = fs.readFileSync('scripts/view_view-comm-eval.html', 'utf8');
const approverHtml = fs.readFileSync('scripts/view_view-approver.html', 'utf8');
const receivingHtml = fs.readFileSync('scripts/view_view-receiving.html', 'utf8');
const closureHtml = fs.readFileSync('scripts/view_view-order-closure.html', 'utf8');
const excelErpHtml = fs.readFileSync('scripts/view_view-excel-erp.html', 'utf8');
const sapErpHtml = fs.readFileSync('scripts/view_view-sap-erp.html', 'utf8');
const cigIntegrationHtml = fs.readFileSync('scripts/view_view-cig-integration.html', 'utf8');

// 3. Read modals and compat
const modalsAndCompat = fs.readFileSync('scripts/modals_and_compat.html', 'utf8');

// 4. Update ShellBar to include user dropdown with persona switcher
const userProfileTarget = `<button class="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-sap-sm hover:bg-sap-hoverBg transition-colors" title="Valeria Martinez - Strategic Buyer">`;
const userProfileReplacement = `
<!-- User Profile & 10-Persona Quick Switcher -->
<div class="relative">
  <button id="appUserProfileBtn" onclick="toggleUserDropdown()" class="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-sap-sm hover:bg-sap-hoverBg transition-colors" title="Click to Switch Persona or Sign Out">
    <div id="appUserAvatar" class="w-7 h-7 rounded-full bg-[#0057B7] text-white flex items-center justify-center font-bold text-[12px] shadow-sm">
      VM
    </div>
    <div class="hidden xl:flex flex-col text-left leading-none">
      <span id="appUserName" class="text-[12px] font-semibold text-sap-text">Valeria Martinez</span>
      <span id="appUserRole" class="text-[10px] text-sap-textSub">Strategic Lead Buyer</span>
    </div>
    <span class="material-symbols-outlined text-[16px] text-sap-textSub">expand_more</span>
  </button>
  <!-- User Profile Dropdown Menu -->
  <div id="userDropdownMenu" class="hidden absolute right-0 mt-2 w-80 bg-white rounded-sap-md shadow-fiori-modal border border-sap-border z-50 p-3 text-[12px]">
    <div class="pb-2.5 mb-2 border-b border-sap-borderLight flex items-center gap-2.5">
      <div id="dropdownAvatar" class="w-8 h-8 rounded-full bg-[#0057B7] text-white flex items-center justify-center font-bold text-[12px]">VM</div>
      <div class="flex-1 min-w-0">
        <div id="dropdownName" class="font-bold text-sap-text text-[13px] truncate">Valeria Martinez</div>
        <div id="dropdownRole" class="text-[11px] text-sap-textSub truncate">Strategic Lead Buyer</div>
        <div id="dropdownEmail" class="text-[10px] font-mono text-sap-textMuted truncate">valeria.martinez@abccompany.com</div>
      </div>
    </div>
    <div class="text-[10px] font-bold uppercase tracking-wider text-sap-textMuted px-1 mb-1.5">Switch Persona (10 Roles)</div>
    <div class="flex flex-col gap-1 max-h-60 overflow-y-auto pr-1">
      <button onclick="switchPersona('valeria', 'buyer')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Valeria Martinez</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-primaryLight text-sap-primary font-medium">Buyer</span>
      </button>
      <button onclick="switchPersona('carlos_requester', 'requester')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Carlos Ramirez</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-positiveBg text-sap-positive font-medium">Requester</span>
      </button>
      <button onclick="switchPersona('david_manager', 'manager')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">David Vance</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-criticalBg text-sap-critical font-medium">Manager</span>
      </button>
      <button onclick="switchPersona('victor_tech', 'tech_evaluator')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Dr. Victor Chen</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-neutralBg text-sap-textSub font-medium">Tech Eval</span>
      </button>
      <button onclick="switchPersona('sofia_comm', 'comm_evaluator')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Sofia Morales</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-neutralBg text-sap-textSub font-medium">Comm Eval</span>
      </button>
      <button onclick="switchPersona('carlos_approver', 'award_approver')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Carlos A. Fonseca</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-primaryLight text-sap-primary font-medium">Award Exec</span>
      </button>
      <button onclick="switchPersona('sonda_supplier', 'supplier')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">SONDA Colombia S.A.</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-positiveBg text-sap-positive font-medium">Supplier A</span>
      </button>
      <button onclick="switchPersona('indorama_supplier', 'supplier')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Indorama Ventures</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-neutralBg text-sap-textSub font-medium">Supplier B</span>
      </button>
      <button onclick="switchPersona('mateo_receiving', 'receiving')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Mateo Morales</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-criticalBg text-sap-critical font-medium">Receiving</span>
      </button>
      <button onclick="switchPersona('lucia_finance', 'order_closure')" class="flex items-center justify-between p-1.5 rounded hover:bg-sap-hoverBg text-left transition">
        <span class="font-semibold text-sap-text">Lucia Fernandez</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded bg-sap-primaryLight text-sap-primary font-medium">Finance</span>
      </button>
    </div>
    <div class="pt-2 mt-2 border-t border-sap-borderLight flex items-center justify-between">
      <button onclick="signOutToLogin()" class="w-full py-1.5 px-3 rounded bg-sap-bg hover:bg-sap-hoverBg text-sap-negative font-medium text-center flex items-center justify-center gap-1.5 transition">
        <span class="material-symbols-outlined text-[15px]">logout</span>
        <span>Sign Out to Portal</span>
      </button>
    </div>
  </div>
</div>
`;
rawShellBar = rawShellBar.replace(userProfileTarget, userProfileReplacement);

// 5. Update TabNav to wire click handlers and add Lineage Timeline button
rawTabNav = `
<!-- ========================================================================= -->
<!-- 2. SAP Horizon Tab Navigation Bar (ui5-tabcontainer)                     -->
<!-- ========================================================================= -->
<nav class="bg-sap-shell border-b border-sap-border px-4 overflow-x-auto flex items-center justify-between">
  <div class="flex items-center gap-1 min-w-max text-[13px] font-medium text-sap-textSub" id="mainSubnavTabs">
    <button onclick="switchMainTab('sourcing')" class="nav-pill-btn active px-3.5 py-2.5 border-b-[3px] border-sap-primary text-sap-primary font-semibold flex items-center gap-1.5">
      <span class="material-symbols-outlined text-[16px]">dashboard</span>
      <span>Sourcing Cockpit</span>
    </button>
    <button onclick="switchMainTab('requester')" class="nav-pill-btn px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors">
      <span class="material-symbols-outlined text-[16px]">receipt_long</span>
      <span>Requisitions (ME51N)</span>
    </button>
    <button onclick="switchMainTab('sourcing')" class="nav-pill-btn px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors">
      <span class="material-symbols-outlined text-[16px]">gavel</span>
      <span>Tenders &amp; RFQs</span>
    </button>
    <button onclick="switchMainTab('order_closure')" class="nav-pill-btn px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors">
      <span class="material-symbols-outlined text-[16px]">shopping_cart</span>
      <span>Purchase Orders</span>
    </button>
    <button onclick="switchMainTab('sourcing')" class="nav-pill-btn px-3.5 py-2.5 border-b-[3px] border-transparent text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors">
      <span class="material-symbols-outlined text-[16px]">table_chart</span>
      <span>Adjudication Matrix</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-sap-primaryLight text-sap-primary font-semibold">Active</span>
    </button>
    <button onclick="document.getElementById('cxml-drawer').classList.remove('hidden')" class="nav-pill-btn px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors">
      <span class="material-symbols-outlined text-[16px]">integration_instructions</span>
      <span>Audit Log &amp; cXML</span>
    </button>
  </div>
  <!-- Right Action: Lineage Timeline Button -->
  <div class="hidden sm:flex items-center gap-2 py-1 shrink-0">
    <button id="btnTopTraceability" onclick="openTraceabilityModal()" class="h-[30px] px-3 rounded-sap-sm bg-sap-primaryLight hover:bg-sap-primary hover:text-white border border-sap-informationBorder text-sap-primary text-[12px] font-semibold flex items-center gap-1.5 transition-colors sap-focus-ring">
      <span class="material-symbols-outlined text-[15px]">account_tree</span>
      <span>Lineage Timeline</span>
    </button>
    <!-- Hidden dynamic role tabs container for strict role updates -->
    <div id="appNavPills" class="hidden"></div>
  </div>
</nav>
`;

// 6. Assemble complete index.html
const completeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
  <title>SAP S/4HANA Cloud - Alpek Sourcing OS</title>
  <!-- SAP Fiori Typography ('72' and system fallbacks) & SAP Icons via Material Symbols -->
  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ["'72'", "Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "Helvetica", "Arial", "sans-serif"],
            mono: ["'JetBrains Mono'", "monospace"],
          },
          colors: {
            sap: {
              shell: "#FFFFFF",
              shellBorder: "#E5E5E5",
              bg: "#F5F6F7",
              cardBg: "#FFFFFF",
              primary: "#0070F2",
              primaryHover: "#0064D9",
              primaryActive: "#0053B3",
              primaryLight: "#EBF3FC",
              text: "#1D2D3E",
              textSub: "#556B82",
              textMuted: "#6E7A89",
              border: "#D9D9D9",
              borderLight: "#EAECEE",
              hoverBg: "#F0F3F6",
              positive: "#107E3E",
              positiveBg: "#EBF6EE",
              positiveBorder: "#A6DCB6",
              critical: "#E9730C",
              criticalBg: "#FEF0E6",
              criticalBorder: "#F9B880",
              negative: "#BB0000",
              negativeBg: "#FDEAEA",
              negativeBorder: "#F4AAAA",
              information: "#0070F2",
              informationBg: "#EBF3FC",
              informationBorder: "#92C5F9",
              neutral: "#6A7D8F",
              neutralBg: "#F0F2F5",
            }
          },
          borderRadius: {
            'sap-sm': '0.25rem', // 4px
            'sap-md': '0.5rem',  // 8px
            'sap-lg': '0.75rem', // 12px
          },
          boxShadow: {
            'fiori-card': '0 0.125rem 0.5rem rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            'fiori-shell': '0 0.125rem 0.25rem rgba(0, 0, 0, 0.08)',
            'fiori-modal': '0 0.5rem 1.5rem rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          }
        }
      }
    };
  </script>
  <style>
    /* SAP UI5 Horizon specific styles */
    body {
      font-family: '72', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F5F6F7;
      color: #1D2D3E;
      -webkit-font-smoothing: antialiased;
    }
    .sap-focus-ring:focus-visible {
      outline: 2px solid #0070F2;
      outline-offset: 1px;
    }
    /* Workspace view visibility */
    .workspace-view {
      display: none !important;
    }
    .workspace-view.active {
      display: flex !important;
      flex-direction: column !important;
    }
    /* Universal SAP table styling */
    .sap-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .sap-table th {
      background: #F5F6F7;
      color: #556B82;
      font-weight: 600;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.04em;
      padding: 10px 14px;
      border-bottom: 1px solid #D9D9D9;
      text-align: left;
    }
    .sap-table td {
      padding: 10px 14px;
      border-bottom: 1px solid #EAECEE;
      color: #1D2D3E;
    }
    .sap-table tr:hover {
      background: #F0F3F6;
    }
    /* Universal SAP button styles */
    .sap-btn-primary {
      background: #0070F2;
      color: #FFFFFF;
      border-radius: 4px;
      padding: 6px 14px;
      font-weight: 600;
      font-size: 13px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease-in-out;
    }
    .sap-btn-primary:hover {
      background: #0064D9;
    }
    .sap-btn-secondary {
      background: #FFFFFF;
      color: #1D2D3E;
      border: 1px solid #D9D9D9;
      border-radius: 4px;
      padding: 6px 14px;
      font-weight: 500;
      font-size: 13px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease-in-out;
    }
    .sap-btn-secondary:hover {
      background: #F0F3F6;
    }
    /* Universal SAP Status Pills */
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
    }
    .status-pill.approved, .status-pill.confirmed {
      background: #EBF6EE;
      color: #107E3E;
      border: 1px solid #A6DCB6;
    }
    .status-pill.pending {
      background: #FEF0E6;
      color: #E9730C;
      border: 1px solid #F9B880;
    }
    .status-pill.rejected, .status-pill.disqualified {
      background: #FDEAEA;
      color: #BB0000;
      border: 1px solid #F4AAAA;
    }
    /* Unified Cockpit Hero Cards for all roles */
    .cockpit-hero-banner {
      background: #FFFFFF;
      border: 1px solid #E5E5E5;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.06);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .cockpit-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .cockpit-icon-badge {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 6px;
      background: #EBF3FC;
      color: #0070F2;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }
    /* Modal backdrop */
    .sap-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(2px);
      z-index: 50;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .sap-dialog {
      background: #FFFFFF;
      border-radius: 8px;
      border: 1px solid #D9D9D9;
      box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.18);
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .sap-dialog-sm { max-width: 28rem; width: 100%; }
    .sap-dialog-md { max-width: 36rem; width: 100%; }
    .sap-dialog-lg { max-width: 52rem; width: 100%; }
    .sap-dialog-header {
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #E5E5E5;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #FFFFFF;
    }
    .sap-dialog-title {
      font-weight: 700;
      font-size: 15px;
      color: #1D2D3E;
    }
    .sap-dialog-close {
      background: transparent;
      border: none;
      font-size: 18px;
      color: #556B82;
      cursor: pointer;
    }
    .sap-dialog-body {
      padding: 1.25rem;
      font-size: 13px;
      color: #1D2D3E;
    }
    .sap-dialog-footer {
      padding: 0.75rem 1.25rem;
      border-top: 1px solid #EAECEE;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      background: #F5F6F7;
    }
  </style>
</head>
<body class="min-h-screen flex flex-col bg-sap-bg text-sap-text text-[14px] leading-normal select-none">

  <!-- ========================================================================= -->
  <!-- PAGE: CORPORATE LOGIN PORTAL (#page-login)                                -->
  <!-- ========================================================================= -->
  <div id="page-login" class="hidden min-h-screen flex flex-col bg-sap-bg">
    <!-- Login Header -->
    <header class="w-full bg-sap-shell border-b border-sap-shellBorder shadow-fiori-shell h-[48px] px-6 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <svg class="h-6 w-auto" fill="none" viewBox="0 0 70 34" xmlns="http://www.w3.org/2000/svg">
          <rect fill="#0070F2" height="34" rx="3" width="70"></rect>
          <path d="M12.5 10H7V24H12.5C16.5 24 19.5 21 19.5 17C19.5 13 16.5 10 12.5 10ZM12.2 20.8H10.2V13.2H12.2C14.7 13.2 16.2 14.8 16.2 17C16.2 19.2 14.7 20.8 12.2 20.8Z" fill="#FFFFFF"></path>
          <path d="M28.5 10H22V24H25.2V19.2H28.5C31.8 19.2 34 17.2 34 14.6C34 12 31.8 10 28.5 10ZM28.2 16.5H25.2V12.7H28.2C29.6 12.7 30.6 13.4 30.6 14.6C30.6 15.8 29.6 16.5 28.2 16.5Z" fill="#FFFFFF"></path>
          <path d="M42.5 10H36.5V24H39.7V19.8H42.5C45.8 19.8 48 17.8 48 14.9C48 12 45.8 10 42.5 10ZM42.2 17.1H39.7V12.7H42.2C43.6 12.7 44.6 13.5 44.6 14.9C44.6 16.3 43.6 17.1 42.2 17.1Z" fill="#FFFFFF"></path>
          <path d="M50 10H63V13H53.5V15.5H61.5V18.5H53.5V21H63.5V24H50V10Z" fill="#FFFFFF"></path>
        </svg>
        <span class="h-4 w-[1px] bg-sap-border"></span>
        <span class="font-bold text-[14px] text-sap-text tracking-tight">Alpek Sourcing OS</span>
        <span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-sap-primaryLight text-sap-primary rounded border border-sap-informationBorder">Cloud</span>
      </div>
      <div class="flex items-center gap-2 text-[12px] text-sap-textSub">
        <span class="w-2 h-2 rounded-full bg-sap-positive"></span>
        <span>S/4HANA OData Core: Online</span>
      </div>
    </header>

    <!-- Login Main -->
    <main class="flex-1 max-w-5xl mx-auto w-full p-6 flex flex-col justify-center gap-6">
      <!-- Enterprise Mission Banner -->
      <div class="bg-white rounded-sap-md border border-sap-border p-6 shadow-fiori-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sap-positiveBg text-sap-positive border border-sap-positiveBorder">Clean Core Certified</span>
            <span class="text-[12px] text-sap-textSub font-mono">SAP S/4HANA Cloud • Enterprise Edition</span>
          </div>
          <h1 class="text-[24px] font-bold text-sap-text tracking-tight">Enterprise Strategic Sourcing OS</h1>
          <p class="text-[13px] text-sap-textSub max-w-xl mt-1">Select any of the 10 authenticated personas below to immediately enter their dedicated dashboard with real-time OData synchronization.</p>
        </div>
        <button onclick="switchPersona('valeria', 'buyer')" class="h-[40px] px-5 rounded-sap-sm bg-sap-primary hover:bg-sap-primaryHover text-white font-semibold text-[13px] flex items-center gap-2 shadow-sm shrink-0 transition-colors">
          <span>Launch Sourcing Cockpit</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>

      <!-- 10 Personas Direct Click Grid -->
      <div class="bg-white rounded-sap-md border border-sap-border p-6 shadow-fiori-card">
        <h2 class="text-[15px] font-bold text-sap-text mb-1 flex items-center gap-2">
          <span class="material-symbols-outlined text-sap-primary text-[20px]">badge</span>
          <span>10 Role-Based Workspaces (Click Any Persona to Enter)</span>
        </h2>
        <p class="text-[12px] text-sap-textSub mb-4">Each role has verified permissions for specific gates in the 11-stage Clean Core procurement lifecycle.</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <!-- 1. Valeria Martinez -->
          <div onclick="switchPersona('valeria', 'buyer')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#0057B7] text-white font-bold text-[11px] flex items-center justify-center mb-2">VM</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Valeria Martinez</div>
              <div class="text-[11px] text-sap-textSub">Strategic Lead Buyer</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-primary font-semibold">Sourcing Cockpit</span>
              <span class="material-symbols-outlined text-[14px] text-sap-primary">arrow_forward</span>
            </div>
          </div>

          <!-- 2. Carlos Ramirez -->
          <div onclick="switchPersona('carlos_requester', 'requester')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#107E3E] text-white font-bold text-[11px] flex items-center justify-center mb-2">CR</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Carlos Ramirez</div>
              <div class="text-[11px] text-sap-textSub">Plant Requester</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-positive font-semibold">ME51N Demand</span>
              <span class="material-symbols-outlined text-[14px] text-sap-positive">arrow_forward</span>
            </div>
          </div>

          <!-- 3. David Vance -->
          <div onclick="switchPersona('david_manager', 'manager')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#E9730C] text-white font-bold text-[11px] flex items-center justify-center mb-2">DV</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">David Vance</div>
              <div class="text-[11px] text-sap-textSub">Department Manager</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-critical font-semibold">Gate 1 Approval</span>
              <span class="material-symbols-outlined text-[14px] text-sap-critical">arrow_forward</span>
            </div>
          </div>

          <!-- 4. Dr. Victor Chen -->
          <div onclick="switchPersona('victor_tech', 'tech_evaluator')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#6A7D8F] text-white font-bold text-[11px] flex items-center justify-center mb-2">VC</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Dr. Victor Chen</div>
              <div class="text-[11px] text-sap-textSub">Technical Evaluator</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-text font-semibold">Lab Assay Scoring</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>

          <!-- 5. Sofia Morales -->
          <div onclick="switchPersona('sofia_comm', 'comm_evaluator')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#0070F2] text-white font-bold text-[11px] flex items-center justify-center mb-2">SM</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Sofia Morales</div>
              <div class="text-[11px] text-sap-textSub">Commercial Evaluator</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-primary font-semibold">TCO &amp; Price Delta</span>
              <span class="material-symbols-outlined text-[14px] text-sap-primary">arrow_forward</span>
            </div>
          </div>

          <!-- 6. Carlos A. Fonseca -->
          <div onclick="switchPersona('carlos_approver', 'award_approver')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#7B1FA2] text-white font-bold text-[11px] flex items-center justify-center mb-2">CF</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Carlos A. Fonseca</div>
              <div class="text-[11px] text-sap-textSub">Executive Approver</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-primary font-semibold">Award Sign-Off</span>
              <span class="material-symbols-outlined text-[14px] text-sap-primary">arrow_forward</span>
            </div>
          </div>

          <!-- 7. SONDA Colombia S.A. -->
          <div onclick="switchPersona('sonda_supplier', 'supplier')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#0070F2] text-white font-bold text-[11px] flex items-center justify-center mb-2">SC</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">SONDA Colombia</div>
              <div class="text-[11px] text-sap-textSub">SAP Vendor #800192</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-positive font-semibold">Submit Sealed Bid</span>
              <span class="material-symbols-outlined text-[14px] text-sap-positive">arrow_forward</span>
            </div>
          </div>

          <!-- 8. Indorama Ventures -->
          <div onclick="switchPersona('indorama_supplier', 'supplier')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#00897B] text-white font-bold text-[11px] flex items-center justify-center mb-2">IV</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Indorama Ventures</div>
              <div class="text-[11px] text-sap-textSub">SAP Vendor #800204</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-text font-semibold">Supplier Portal</span>
              <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
            </div>
          </div>

          <!-- 9. Mateo Morales -->
          <div onclick="switchPersona('mateo_receiving', 'receiving')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#E65100] text-white font-bold text-[11px] flex items-center justify-center mb-2">MM</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Mateo Morales</div>
              <div class="text-[11px] text-sap-textSub">Warehouse Specialist</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-critical font-semibold">MIGO Goods Receipt</span>
              <span class="material-symbols-outlined text-[14px] text-sap-critical">arrow_forward</span>
            </div>
          </div>

          <!-- 10. Lucia Fernandez -->
          <div onclick="switchPersona('lucia_finance', 'order_closure')" class="p-3 rounded-sap-sm border border-sap-border hover:border-sap-primary hover:bg-sap-hoverBg cursor-pointer transition flex flex-col justify-between">
            <div>
              <div class="w-8 h-8 rounded-full bg-[#303F9F] text-white font-bold text-[11px] flex items-center justify-center mb-2">LF</div>
              <div class="font-bold text-[13px] text-sap-text leading-snug">Lucia Fernandez</div>
              <div class="text-[11px] text-sap-textSub">Finance &amp; Audit Lead</div>
            </div>
            <div class="mt-3 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px]">
              <span class="text-sap-primary font-semibold">MIRO 3-Way Match</span>
              <span class="material-symbols-outlined text-[14px] text-sap-primary">arrow_forward</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Traditional Credentials Login Box -->
      <div class="bg-white rounded-sap-md border border-sap-border p-5 shadow-fiori-card max-w-md mx-auto w-full">
        <h3 class="font-bold text-[14px] text-sap-text mb-3">Single Sign-On / Credential Login</h3>
        <form onsubmit="event.preventDefault(); document.getElementById('btnSubmitLogin').click();" class="flex flex-col gap-3">
          <div>
            <label class="block text-[12px] font-medium text-sap-textSub mb-1">Username / Personnel ID</label>
            <input id="loginUsername" type="text" value="valeria" class="w-full h-[34px] px-3 bg-sap-bg text-[13px] text-sap-text border border-sap-border rounded-sap-sm sap-focus-ring" placeholder="e.g. valeria"/>
          </div>
          <div>
            <label class="block text-[12px] font-medium text-sap-textSub mb-1">Password</label>
            <input id="loginPassword" type="password" value="demo123" class="w-full h-[34px] px-3 bg-sap-bg text-[13px] text-sap-text border border-sap-border rounded-sap-sm sap-focus-ring"/>
          </div>
          <button id="btnSubmitLogin" type="button" class="w-full h-[36px] rounded-sap-sm bg-sap-primary hover:bg-sap-primaryHover text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-colors sap-focus-ring mt-1">
            <span>Sign In to S/4HANA</span>
          </button>
        </form>
      </div>
    </main>
  </div>

  <!-- ========================================================================= -->
  <!-- PAGE: AUTHENTICATED PLATFORM (#page-app)                                  -->
  <!-- ========================================================================= -->
  <div id="page-app" class="flex-1 flex flex-col min-h-screen">

    ${rawShellBar}

    ${rawTabNav}

    <!-- ========================================================================= -->
    <!-- VIEW 1: STRATEGIC SOURCING BUYER (view-sourcing-project) - EXACT IMAGE 1  -->
    <!-- ========================================================================= -->
    <div class="workspace-view active flex-1 flex flex-col" id="view-sourcing-project">
      <!-- Hidden banner for script compatibility -->
      <div id="rfqPublicationBanner" class="hidden"></div>

      ${rawObjectHeader}

      ${rawMainContent}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 2: SUPPLIER PORTAL (view-supplier-portal)                            -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-supplier-portal">
      ${supplierPortalHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 3: PLANT REQUESTER (view-requester)                                  -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-requester">
      ${requesterHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 4: DEPARTMENT MANAGER (view-manager)                                 -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-manager">
      ${managerHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 5: TECHNICAL EVALUATOR (view-tech-eval)                              -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-tech-eval">
      ${techEvalHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 6: COMMERCIAL EVALUATOR (view-comm-eval)                             -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-comm-eval">
      ${commEvalHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 7: EXECUTIVE AWARD APPROVER (view-approver)                          -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-approver">
      ${approverHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 8: WAREHOUSE RECEIVING / GRN (view-receiving)                        -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-receiving">
      ${receivingHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 9: FINANCE RECONCILIATION / ORDER CLOSURE (view-order-closure)       -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-order-closure">
      ${closureHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 10: DUMMY SAP EXCEL ERP SPREADSHEET (view-excel-erp)                 -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-excel-erp">
      ${excelErpHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 11: CLASSIC SAP GUI ME53N SIMULATION (view-sap-erp)                  -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-sap-erp">
      ${sapErpHtml}
    </div>

    <!-- ========================================================================= -->
    <!-- VIEW 12: MANAGED GATEWAY CIG INTEGRATION (view-cig-integration)           -->
    <!-- ========================================================================= -->
    <div class="workspace-view flex-1 flex flex-col p-6 max-w-[1680px] mx-auto w-full" id="view-cig-integration">
      ${cigIntegrationHtml}
    </div>

    ${rawFooter}
  </div>

  <!-- ========================================================================= -->
  <!-- MODALS & DRAWERS                                                          -->
  <!-- ========================================================================= -->
  ${rawDrawer}

  ${rawAwardModal}

  ${modalsAndCompat}

  <!-- ========================================================================= -->
  <!-- CORE SCRIPTS & REAL-TIME CONTROLS                                         -->
  <!-- ========================================================================= -->
  <script>
    // Global User Switching & Session Management
    const APP_PERSONAS = {
      'valeria': { username: 'valeria', name: 'Valeria Martinez', role: 'buyer', roleLabel: 'Strategic Lead Buyer', email: 'valeria.martinez@abccompany.com', avatarColor: '#0057B7', initials: 'VM' },
      'carlos_requester': { username: 'carlos_requester', name: 'Carlos Ramirez', role: 'requester', roleLabel: 'Plant Maintenance Requester', email: 'carlos.ramirez@abccompany.com', avatarColor: '#107E3E', initials: 'CR' },
      'david_manager': { username: 'david_manager', name: 'David Vance', role: 'manager', roleLabel: 'Department Manager (Gate 1)', email: 'david.vance@abccompany.com', avatarColor: '#E9730C', initials: 'DV' },
      'victor_tech': { username: 'victor_tech', name: 'Dr. Victor Chen', role: 'tech_evaluator', roleLabel: 'Technical Spec Evaluator', email: 'victor.chen@abccompany.com', avatarColor: '#6A7D8F', initials: 'VC' },
      'sofia_comm': { username: 'sofia_comm', name: 'Sofia Morales', role: 'comm_evaluator', roleLabel: 'Commercial Pricing Evaluator', email: 'sofia.morales@abccompany.com', avatarColor: '#0070F2', initials: 'SM' },
      'carlos_approver': { username: 'carlos_approver', name: 'Carlos A. Fonseca', role: 'award_approver', roleLabel: 'Executive VP / Award Approver', email: 'carlos.fonseca@abccompany.com', avatarColor: '#7B1FA2', initials: 'CF' },
      'sonda_supplier': { username: 'sonda_supplier', name: 'SONDA Colombia S.A.', role: 'supplier', roleLabel: 'Verified SAP Vendor #800192', email: 'bids@sondacolombia.com', avatarColor: '#0070F2', initials: 'SC' },
      'indorama_supplier': { username: 'indorama_supplier', name: 'Indorama Ventures', role: 'supplier', roleLabel: 'Verified SAP Vendor #800204', email: 'tenders@indorama.com', avatarColor: '#00897B', initials: 'IV' },
      'mateo_receiving': { username: 'mateo_receiving', name: 'Mateo Morales', role: 'receiving', roleLabel: 'Plant Warehouse Logistics Specialist', email: 'mateo.morales@abccompany.com', avatarColor: '#E65100', initials: 'MM' },
      'lucia_finance': { username: 'lucia_finance', name: 'Lucia Fernandez', role: 'order_closure', roleLabel: 'Corporate Finance & Reconciliation Lead', email: 'lucia.fernandez@abccompany.com', avatarColor: '#303F9F', initials: 'LF' },
    };

    function switchPersona(username, role) {
      const u = APP_PERSONAS[username] || { username, role, name: username, roleLabel: role, email: username + '@abccompany.com', avatarColor: '#0070F2', initials: username.substring(0, 2).toUpperCase() };
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

    // Default initialization: If no cached user, initialize as Valeria Martinez (Buyer) so Image 1 displays immediately!
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

    // Countdown Timer for Adjudication Window (Matches Image 1: 00:57:08)
    (function() {
      let seconds = 57 * 60 + 8;
      const timerElement = document.getElementById('adjudication-timer');
      if (!timerElement) return;
      setInterval(() => {
        if (seconds <= 0) return;
        seconds--;
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        timerElement.textContent = \`\${hrs}:\${mins}:\${secs}\`;
      }, 1000);
    })();
  </script>
  <!-- Load Main Application Logic -->
  <script src="/js/app.js?v=12.0"></script>
</body>
</html>
`;

fs.writeFileSync('public/index.html', completeHtml);
console.log('Successfully generated public/index.html! Length:', completeHtml.length);
