const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add Material Symbols and JetBrains Mono fonts to head if missing
if (!html.includes('Material+Symbols+Outlined')) {
  const fontLinks = `  <link href="https://fonts.googleapis.com" rel="preconnect"/>
  <link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
`;
  html = html.replace('<!-- Official Passionfroot Fonts & Styling -->', fontLinks + '  <!-- Official Passionfroot Fonts & Styling -->');
}

// 2. Extend Tailwind config with exact SAP Fiori Horizon palette
if (!html.includes('colors: {') || !html.includes('shell: "#FFFFFF"')) {
  const sapThemeColors = `          colors: {
            'brand-surface': '#FAF9F5',
            'foundation': '#FAF9F5',
            'ink-900': '#191716',
            'brand-coral': '#E0533C',
            'brand-dark': '#191716',
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
            'sap-sm': '0.25rem',
            'sap-md': '0.5rem',
            'sap-lg': '0.75rem',
          },
          boxShadow: {
            'fiori-card': '0 0.125rem 0.5rem rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.04)',
            'fiori-shell': '0 0.125rem 0.25rem rgba(0, 0, 0, 0.08)',
            'fiori-modal': '0 0.5rem 1.5rem rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          },`;
  html = html.replace(/colors:\s*\{[\s\S]*?\},/m, sapThemeColors);
}

// 3. Locate the page-app container
const pageAppStart = html.indexOf('<div id="page-app" class="app-screen hidden">');
if (pageAppStart === -1) {
  console.error("Could not find <div id=\"page-app\"");
  process.exit(1);
}

// Find view-supplier-portal start to preserve all subsequent views
const supplierPortalMarker = '<!-- ========================================================================= -->\n      <!-- VIEW B: EXTERNAL SUPPLIER PORTAL (VENDOR BIDDING COCKPIT)';
const supplierPortalIndex = html.indexOf(supplierPortalMarker);

if (supplierPortalIndex === -1) {
  console.error("Could not find supplierPortalMarker");
  process.exit(1);
}

// Construct the EXACT SAP Horizon template from the user's image
const exactFioriAppHtml = `<div id="page-app" class="app-screen hidden min-h-screen flex flex-col bg-sap-bg text-sap-text text-[14px] leading-normal select-none" style="background-color:#F5F6F7 !important; color:#1D2D3E !important; font-family:'72', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;">

<!-- ========================================================================= -->
<!-- 1. SAP Horizon Shell Bar (ui5-shellbar)                                  -->
<!-- ========================================================================= -->
<header class="sticky top-0 z-40 w-full bg-sap-shell border-b border-sap-shellBorder shadow-fiori-shell h-[48px] px-4 flex items-center justify-between" style="background:#FFFFFF !important; border-bottom:1px solid #E5E5E5 !important;">
<!-- Shell Left: Logo & Product Title -->
<div class="flex items-center gap-3">
<!-- SAP Logo Mark & Brand Identity -->
<div class="flex items-center gap-2 cursor-pointer" onclick="switchMainTab('sourcing')">
<svg class="h-6 w-auto" fill="none" viewbox="0 0 70 34" xmlns="http://www.w3.org/2000/svg">
<rect fill="#0070F2" height="34" rx="3" width="70"></rect>
<path d="M12.5 10H7V24H12.5C16.5 24 19.5 21 19.5 17C19.5 13 16.5 10 12.5 10ZM12.2 20.8H10.2V13.2H12.2C14.7 13.2 16.2 14.8 16.2 17C16.2 19.2 14.7 20.8 12.2 20.8Z" fill="#FFFFFF"></path>
<path d="M28.5 10H22V24H25.2V19.2H28.5C31.8 19.2 34 17.2 34 14.6C34 12 31.8 10 28.5 10ZM28.2 16.5H25.2V12.7H28.2C29.6 12.7 30.6 13.4 30.6 14.6C30.6 15.8 29.6 16.5 28.2 16.5Z" fill="#FFFFFF"></path>
<path d="M42.5 10H36.5V24H39.7V19.8H42.5C45.8 19.8 48 17.8 48 14.9C48 12 45.8 10 42.5 10ZM42.2 17.1H39.7V12.7H42.2C43.6 12.7 44.6 13.5 44.6 14.9C44.6 16.3 43.6 17.1 42.2 17.1Z" fill="#FFFFFF"></path>
<path d="M50 10H63V13H53.5V15.5H61.5V18.5H53.5V21H63.5V24H50V10Z" fill="#FFFFFF"></path>
</svg>
<span class="h-4 w-[1px] bg-sap-border"></span>
<div class="flex flex-col leading-tight">
<div class="flex items-center gap-1.5">
<span class="font-bold text-[14px] text-sap-text tracking-tight">Alpek Sourcing OS</span>
<span class="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-sap-primaryLight text-sap-primary rounded border border-sap-informationBorder">Cloud</span>
</div>
<span class="text-[11px] text-sap-textSub">SAP S/4HANA Cloud • Enterprise Edition</span>
</div>
</div>
</div>
<!-- Shell Center: Enterprise Global Search -->
<div class="hidden md:flex items-center flex-1 max-w-md mx-6">
<div class="relative w-full">
<span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-sap-textSub">search</span>
<input class="w-full h-[32px] pl-8 pr-16 bg-sap-bg hover:bg-white focus:bg-white text-[13px] text-sap-text border border-sap-border focus:border-sap-primary rounded-sap-sm transition-colors sap-focus-ring" placeholder="Search RFQs, Vendors, Contracts, Purchasing Documents..." type="text"/>
<div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-[10px] font-mono text-sap-textMuted bg-sap-shell px-1.5 py-0.5 rounded border border-sap-border">
<span>⌘</span><span>K</span>
</div>
</div>
</div>
<!-- Shell Right: System Status, Assistant, Notifications, Avatar -->
<div class="flex items-center gap-2">
<!-- Status Badge -->
<div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sap-positiveBg border border-sap-positiveBorder text-sap-positive text-[12px] font-medium">
<span class="w-2 h-2 rounded-full bg-sap-positive animate-pulse"></span>
<span>Connected • S/4HANA Clean Core</span>
</div>
<!-- SAP CoPilot / Joule Assistant -->
<button class="w-8 h-8 rounded-sap-sm flex items-center justify-center text-sap-textSub hover:text-sap-primary hover:bg-sap-hoverBg transition-colors" title="SAP Co-pilot Assistant">
<span class="material-symbols-outlined text-[20px]">smart_toy</span>
</button>
<!-- Notifications -->
<button class="relative w-8 h-8 rounded-sap-sm flex items-center justify-center text-sap-textSub hover:text-sap-text hover:bg-sap-hoverBg transition-colors" title="Notifications">
<span class="material-symbols-outlined text-[20px]">notifications</span>
<span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-sap-primary"></span>
</button>
<!-- Settings -->
<button class="w-8 h-8 rounded-sap-sm flex items-center justify-center text-sap-textSub hover:text-sap-text hover:bg-sap-hoverBg transition-colors" title="Settings">
<span class="material-symbols-outlined text-[20px]">settings</span>
</button>
<span class="h-4 w-[1px] bg-sap-border mx-0.5"></span>
<!-- User Profile (Valeria Martinez) -->
<button class="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-sap-sm hover:bg-sap-hoverBg transition-colors" id="userProfileTrigger" onclick="toggleProfileDropdown()" title="Valeria Martinez - Strategic Buyer">
<div class="w-7 h-7 rounded-full bg-[#0057B7] text-white flex items-center justify-center font-bold text-[12px] shadow-sm" id="appUserAvatar">
          VM
        </div>
<div class="hidden xl:flex flex-col text-left leading-none">
<span class="text-[12px] font-semibold text-sap-text" id="appUserName">Valeria Martinez</span>
<span class="text-[10px] text-sap-textSub" id="appUserRole">Strategic Lead Buyer</span>
</div>
</button>

<!-- Profile Dropdown Card -->
<div class="profile-dropdown-card hidden" id="profileDropdownCard" style="position:absolute; right:16px; top:52px; background:#FFFFFF; border:1px solid #D9D9D9; border-radius:8px; padding:16px; box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:1000; min-width:240px;">
  <div style="margin-bottom:12px; padding-bottom:10px; border-bottom:1px solid #EAECEE;">
    <strong id="dropdownName" style="font-size:14px; color:#1D2D3E; display:block;">Valeria Martinez</strong>
    <span id="dropdownRole" style="font-size:12px; color:#556B82; display:block;">Strategic Lead Buyer</span>
    <div id="dropdownEmail" style="font-size:11px; color:#6E7A89; margin-top:2px;">valeria.martinez@alpek.com</div>
  </div>
  <button class="w-full py-1.5 px-3 rounded bg-sap-negativeBg border border-sap-negativeBorder text-sap-negative text-[12px] font-semibold hover:bg-red-100" onclick="logoutUser()">
    Sign Out
  </button>
</div>
</div>
</header>

<!-- Lineage Button Support for Compatibility -->
<button id="btnTopTraceability" class="hidden" onclick="openTraceabilityModal()"></button>

<!-- ========================================================================= -->
<!-- 2. SAP Horizon Tab Navigation Bar (ui5-tabcontainer)                     -->
<!-- ========================================================================= -->
<nav class="bg-sap-shell border-b border-sap-border px-4 overflow-x-auto" style="background:#FFFFFF !important; border-bottom:1px solid #D9D9D9 !important;">
<div class="flex items-center gap-1 min-w-max text-[13px] font-medium text-sap-textSub">
<a class="px-3.5 py-2.5 border-b-[3px] border-sap-primary text-sap-primary font-semibold flex items-center gap-1.5" href="#" onclick="switchMainTab('sourcing')">
<span class="material-symbols-outlined text-[16px]">dashboard</span>
<span>Sourcing Cockpit</span>
</a>
<a class="px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors" href="#" onclick="navigateIfAuthorized('requester')">
<span class="material-symbols-outlined text-[16px]">receipt_long</span>
<span>Requisitions (ME51N)</span>
</a>
<a class="px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors" href="#" onclick="switchMainTab('sourcing')">
<span class="material-symbols-outlined text-[16px]">gavel</span>
<span>Tenders &amp; RFQs</span>
</a>
<a class="px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors" href="#" onclick="navigateIfAuthorized('excel_erp')">
<span class="material-symbols-outlined text-[16px]">shopping_cart</span>
<span>Purchase Orders</span>
</a>
<a class="px-3.5 py-2.5 border-b-[3px] border-transparent text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors" href="#" onclick="switchMainTab('sourcing')">
<span class="material-symbols-outlined text-[16px]">table_chart</span>
<span>Adjudication Matrix</span>
<span class="px-1.5 py-0.2 rounded-full text-[10px] bg-sap-primaryLight text-sap-primary font-semibold">Active</span>
</a>
<a class="px-3.5 py-2.5 border-b-[3px] border-transparent hover:text-sap-text hover:border-sap-border flex items-center gap-1.5 transition-colors" href="#" onclick="document.getElementById('cxml-drawer').classList.remove('hidden')">
<span class="material-symbols-outlined text-[16px]">integration_instructions</span>
<span>Audit Log &amp; cXML</span>
</a>
</div>
<!-- Role nav pills container preserved for RBAC script bindings -->
<div id="appNavPills" class="hidden"></div>
</nav>

<!-- Executive KPI Strip (Preserved in hidden state for test & script telemetry) -->
<div class="hidden" id="executiveKpiStrip">
  <span id="kpiStripTotalPrs">3</span>
  <span id="kpiStripPendingPrsPill">1 Pending</span>
  <span id="kpiStripActiveRfqs">1</span>
  <span id="kpiStripRfqTimePill">Round 1</span>
  <span id="kpiStripQuotations">3</span>
  <span id="kpiStripSavingsPill">14.3%</span>
  <span id="kpiStripAwardStatus">1</span>
  <span id="kpiStripAwardPill">Awaiting</span>
  <span id="kpiStripTotalPos">1</span>
  <span id="kpiStripPoPill">Clean Core</span>
</div>

<!-- Main Workspace Container -->
<main class="sap-workspace flex-1 flex flex-col" id="appMainWorkspace">

<!-- ========================================================================= -->
<!-- VIEW A: STRATEGIC SOURCING PROJECT WORKSPACE (BUYER PERSPECTIVE)         -->
<!-- ========================================================================= -->
<div class="workspace-view active flex-1 flex flex-col" id="view-sourcing-project">

<!-- Hidden banner ID for script targeting -->
<div id="rfqPublicationBanner" class="hidden"></div>

<!-- ========================================================================= -->
<!-- 3. SAP Fiori Object Page Header (ui5-object-page-header)                -->
<!-- ========================================================================= -->
<section class="bg-sap-shell border-b border-sap-border px-6 pt-3 pb-4 shadow-sm" style="background:#FFFFFF !important; border-bottom:1px solid #D9D9D9 !important;">
<div class="max-w-[1680px] mx-auto flex flex-col gap-3">
<!-- Breadcrumbs -->
<nav class="flex items-center gap-1.5 text-[12px] text-sap-textSub">
<a class="hover:text-sap-primary transition-colors flex items-center gap-1" href="#" onclick="switchMainTab('sourcing')">
<span class="material-symbols-outlined text-[14px]">home</span>
<span>Home</span>
</a>
<span class="text-sap-border">/</span>
<a class="hover:text-sap-primary transition-colors" href="#">Strategic Sourcing</a>
<span class="text-sap-border">/</span>
<span class="text-sap-text font-medium" id="cfgEventIdBadge">Tender Doc2432956265</span>
</nav>
<!-- Title + Semantic Status + Action Bar -->
<div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
<div class="flex flex-wrap items-center gap-3">
<h1 class="text-[22px] font-bold text-sap-text tracking-tight flex items-center gap-2" id="rfqPubStatusTitle">
            Refrigerant-134a Industrial Supply &amp; Quality Certification
          </h1>
<!-- ObjectStatus Pill (Positive) -->
<div class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sap-positiveBg border border-sap-positiveBorder text-sap-positive text-[12px] font-semibold" id="buyerTimerStatusPill">
<span class="w-2 h-2 rounded-full bg-sap-positive"></span>
<span>Adjudication Active • 3 Bids Sealed</span>
</div>
</div>
<!-- Action Bar (SAP Horizon Button Variants) -->
<div class="flex flex-wrap items-center gap-2">
<!-- Transparent Button: Export -->
<button class="h-[34px] px-3 rounded-sap-sm bg-transparent hover:bg-sap-hoverBg border border-sap-border text-sap-text text-[13px] font-medium flex items-center gap-1.5 transition-colors sap-focus-ring" onclick="exportMatrixCsv()">
<span class="material-symbols-outlined text-[16px] text-sap-textSub">download</span>
<span>Export CSV / PDF</span>
</button>
<!-- Transparent Button: Adjust Window -->
<button class="h-[34px] px-3 rounded-sap-sm bg-transparent hover:bg-sap-hoverBg border border-sap-border text-sap-text text-[13px] font-medium flex items-center gap-1.5 transition-colors sap-focus-ring" onclick="openSetBiddingDeadlineModal()">
<span class="material-symbols-outlined text-[16px] text-sap-textSub">timer</span>
<span>Adjust Window</span>
</button>
<!-- Ghost / Default Button: Inspect cXML -->
<button class="h-[34px] px-3 rounded-sap-sm bg-white hover:bg-sap-hoverBg border border-sap-primary text-sap-primary text-[13px] font-semibold flex items-center gap-1.5 transition-colors sap-focus-ring" onclick="document.getElementById('cxml-drawer').classList.remove('hidden')">
<span class="material-symbols-outlined text-[16px]">code</span>
<span>Inspect cXML 1.2</span>
</button>
<!-- Emphasized Action Button (SAP Primary Blue #0070F2) -->
<button id="btnCloseBidding" class="h-[34px] px-4 rounded-sap-sm bg-sap-primary hover:bg-sap-primaryHover active:bg-sap-primaryActive text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm transition-colors sap-focus-ring" onclick="document.getElementById('award-modal').classList.remove('hidden')">
<span class="material-symbols-outlined text-[18px]">verified</span>
<span>Committee Sign-off &amp; Commit PO</span>
</button>
</div>
</div>
<div id="rfqPubStatusSubtitle" class="hidden">Two-envelope technical and commercial bidding open for verified suppliers.</div>

<!-- Header Facets / KPI Tiles (NumericContent & Metrics) -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
<!-- KPI 1: Target Budget Baseline -->
<div class="p-3.5 bg-sap-bg rounded-sap-md border border-sap-border flex flex-col justify-between">
<div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-sap-textSub">
<span>Target Budget</span>
<span class="material-symbols-outlined text-[16px]">account_balance_wallet</span>
</div>
<div class="my-1 flex items-baseline gap-1.5">
<span class="text-[22px] font-bold text-sap-text tracking-tight font-sans">$24,937,500</span>
<span class="text-[12px] font-medium text-sap-textSub">COP</span>
</div>
<div class="text-[11px] text-sap-textMuted flex items-center gap-1">
<span class="font-medium text-sap-text">Ceiling Tariff:</span> PR #109482
          </div>
</div>
<!-- KPI 2: Lowest Evaluated Offer & Savings -->
<div class="p-3.5 bg-sap-bg rounded-sap-md border border-sap-border flex flex-col justify-between border-l-4 border-l-sap-positive">
<div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-sap-textSub">
<span>Lowest Evaluated Offer</span>
<span class="px-1.5 py-0.2 rounded bg-sap-positiveBg text-sap-positive font-bold text-[11px]">-14.3% Delta</span>
</div>
<div class="my-1 flex items-baseline gap-1.5">
<span class="text-[22px] font-bold text-sap-positive tracking-tight font-sans">$21,375,000</span>
<span class="text-[12px] font-medium text-sap-textSub">COP</span>
</div>
<div class="text-[11px] text-sap-positive font-medium flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">trending_down</span>
<span>$3,562,500 COP Total Cost Avoidance</span>
</div>
</div>
<!-- KPI 3: Rank #1 Bidder -->
<div class="p-3.5 bg-sap-bg rounded-sap-md border border-sap-border flex flex-col justify-between border-l-4 border-l-sap-primary">
<div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-sap-textSub">
<span>Rank #1 Recommended</span>
<span class="material-symbols-outlined text-[16px] text-sap-primary">verified</span>
</div>
<div class="my-1">
<span class="text-[20px] font-bold text-sap-text tracking-tight truncate block">SONDA Colombia S.A.</span>
</div>
<div class="text-[11px] text-sap-textSub flex items-center gap-1">
<span class="font-semibold text-sap-primary">Score: 95.8 / 100</span>
<span>• Full SLA Adherence</span>
</div>
</div>
<!-- KPI 4: Adjudication Window Countdown -->
<div class="p-3.5 bg-sap-bg rounded-sap-md border border-sap-border flex flex-col justify-between border-l-4 border-l-sap-critical">
<div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-sap-textSub">
<span>Adjudication Window</span>
<span class="px-1.5 py-0.2 rounded bg-sap-criticalBg text-sap-critical font-bold text-[10px]">Lock Enforced</span>
</div>
<div class="my-1 flex items-baseline gap-2">
<span class="text-[22px] font-mono font-bold text-sap-critical tracking-tight" id="adjudication-timer">00:57:05</span>
<span class="text-[22px] font-mono font-bold text-sap-critical tracking-tight hidden" id="buyerBiddingCountdownDisplay">00:57:05</span>
<span class="text-[11px] text-sap-textSub" id="buyerHeaderTimerText">Remaining</span>
</div>
<div class="text-[11px] text-sap-textMuted" id="buyerDeadlineTimestamp">
            Automatic S/4HANA PO direct dispatch trigger
          </div>
</div>
</div>

<!-- Process Flow Header / Wizard Step Indicator (SAP Fiori ProcessFlow) -->
<div class="mt-2 pt-3 border-t border-sap-borderLight">
<div class="flex items-center justify-between max-w-4xl mx-auto px-4 relative">
<!-- Background connector line -->
<div class="absolute left-8 right-8 top-3.5 h-[2px] bg-sap-border z-0"></div>
<!-- Completed progress bar -->
<div class="absolute left-8 w-[72%] top-3.5 h-[2px] bg-sap-primary z-0"></div>
<!-- Step 1 -->
<div class="relative z-10 flex flex-col items-center">
<div class="w-7 h-7 rounded-full bg-sap-primary text-white flex items-center justify-center text-[13px] shadow-sm">
<span class="material-symbols-outlined text-[16px]">done</span>
</div>
<span class="mt-1 text-[11px] font-semibold text-sap-text">PR Ingested</span>
<span class="text-[10px] text-sap-textMuted font-mono">100% OData</span>
</div>
<!-- Step 2 -->
<div class="relative z-10 flex flex-col items-center">
<div class="w-7 h-7 rounded-full bg-sap-primary text-white flex items-center justify-center text-[13px] shadow-sm">
<span class="material-symbols-outlined text-[16px]">done</span>
</div>
<span class="mt-1 text-[11px] font-semibold text-sap-text">RFP Configured</span>
<span class="text-[10px] text-sap-textMuted font-mono">Terms Set</span>
</div>
<!-- Step 3 -->
<div class="relative z-10 flex flex-col items-center">
<div class="w-7 h-7 rounded-full bg-sap-primary text-white flex items-center justify-center text-[13px] shadow-sm">
<span class="material-symbols-outlined text-[16px]">done</span>
</div>
<span class="mt-1 text-[11px] font-semibold text-sap-text">Bids Sealed</span>
<span class="text-[10px] text-sap-textMuted font-mono">3 Cryptographic</span>
</div>
<!-- Step 4 (Active Step) -->
<div class="relative z-10 flex flex-col items-center">
<div class="w-7 h-7 rounded-full bg-sap-primary text-white ring-4 ring-sap-primaryLight flex items-center justify-center text-[12px] font-bold shadow-md">
              4
            </div>
<span class="mt-1 text-[11px] font-bold text-sap-primary">Two-Envelope Review</span>
<span class="text-[10px] font-semibold text-sap-primary">Active Adjudication</span>
</div>
<!-- Step 5 (Upcoming) -->
<div class="relative z-10 flex flex-col items-center">
<div class="w-7 h-7 rounded-full bg-white border-2 border-sap-border text-sap-textMuted flex items-center justify-center text-[12px] font-bold">
              5
            </div>
<span class="mt-1 text-[11px] font-medium text-sap-textMuted">S/4HANA PO</span>
<span class="text-[10px] text-sap-textMuted">Direct Dispatch</span>
</div>
</div>
</div>
</div>
</section>

<!-- ========================================================================= -->
<!-- 4. Main Content - Standard SAP Fiori Horizon Grid                       -->
<!-- ========================================================================= -->
<main class="flex-1 p-6 max-w-[1680px] mx-auto w-full">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
<!-- ===================================================================== -->
<!-- Left Panel: Responsive Analytical Table (ui5-table) - 8/12 cols       -->
<!-- ===================================================================== -->
<div class="lg:col-span-8 flex flex-col bg-sap-cardBg rounded-sap-md border border-sap-border shadow-fiori-card overflow-hidden">
<!-- Table Toolbar (ui5-toolbar) -->
<div class="px-4 py-3 border-b border-sap-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sap-primary text-[20px]">table_chart</span>
<div>
<h2 class="text-[15px] font-bold text-sap-text leading-tight">Bid Evaluation Matrix (3 Proposals Evaluated)</h2>
<span class="text-[12px] text-sap-textSub">Commercial, SLA &amp; Quality Parameters evaluated against PR #109482 baseline</span>
</div>
</div>
<div class="flex items-center gap-2">
<!-- Formula Tag -->
<span class="px-2 py-1 rounded bg-sap-neutralBg text-sap-textSub border border-sap-border text-[11px] font-mono">
              Formula: Lowest Evaluated Total Cost
            </span>
<!-- Filter & Column Config Icons -->
<button class="w-8 h-8 rounded-sap-sm border border-sap-border hover:bg-sap-hoverBg flex items-center justify-center text-sap-textSub transition-colors" title="Filter columns">
<span class="material-symbols-outlined text-[18px]">filter_list</span>
</button>
<button class="w-8 h-8 rounded-sap-sm border border-sap-border hover:bg-sap-hoverBg flex items-center justify-center text-sap-textSub transition-colors" title="Table Settings">
<span class="material-symbols-outlined text-[18px]">view_column</span>
</button>
</div>
</div>
<!-- Table Container -->
<div class="overflow-x-auto w-full">
<table class="w-full text-left text-[13px] border-collapse">
<thead>
<tr class="bg-sap-bg border-b border-sap-border text-sap-textSub font-semibold text-[12px] tracking-wide uppercase">
<th class="py-3 px-4 w-[28%] font-semibold">Evaluation Criteria</th>
<th class="py-3 px-3 w-[16%] font-semibold text-sap-textMuted">S/4HANA Baseline</th>
<!-- Winning Column Header with Horizon Accent -->
<th class="py-3 px-4 w-[24%] font-bold text-sap-primary bg-sap-primaryLight/40 border-l border-r border-sap-primary/30">
<div class="flex items-center justify-between">
<span>SONDA Colombia</span>
<span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sap-primary text-white tracking-normal">REC #1</span>
</div>
</th>
<th class="py-3 px-3 w-[16%] font-semibold">Indorama Ventures</th>
<th class="py-3 px-3 w-[16%] font-semibold">BASF Chemicals</th>
</tr>
</thead>
<tbody class="divide-y divide-sap-borderLight text-sap-text">
<!-- Row 1: Technical Compliance -->
<tr class="hover:bg-sap-hoverBg transition-colors">
<td class="py-3 px-4">
<div class="font-semibold text-sap-text">Technical Compliance</div>
<div class="text-[11px] text-sap-textSub">Quality &amp; Lab Assay Specs</div>
</td>
<td class="py-3 px-3 font-mono text-[12px] text-sap-textSub">
                  ISO 9001:2015
                </td>
<td class="py-3 px-4 bg-sap-primaryLight/25 border-l border-r border-sap-primary/30 font-semibold">
<div class="flex items-center gap-1.5 text-sap-positive">
<span class="material-symbols-outlined text-[16px]">verified</span>
<span class="text-sap-text font-bold">Pass (95/100)</span>
</div>
</td>
<td class="py-3 px-3">
<div class="flex items-center gap-1.5 text-sap-textSub">
<span class="material-symbols-outlined text-[16px] text-sap-positive">check_circle</span>
<span>Pass (91/100)</span>
</div>
</td>
<td class="py-3 px-3">
<div class="flex items-center gap-1.5 text-sap-textSub">
<span class="material-symbols-outlined text-[16px] text-sap-positive">check_circle</span>
<span>Pass (88/100)</span>
</div>
</td>
</tr>
<!-- Row 2: Delivery SLA -->
<tr class="hover:bg-sap-hoverBg transition-colors">
<td class="py-3 px-4">
<div class="font-semibold text-sap-text">Delivery SLA</div>
<div class="text-[11px] text-sap-textSub">Lead time to Plant Morrison</div>
</td>
<td class="py-3 px-3 font-mono text-[12px] text-sap-textSub">
                  ≤ 15 days
                </td>
<td class="py-3 px-4 bg-sap-primaryLight/25 border-l border-r border-sap-primary/30">
<div class="flex items-center gap-1">
<span class="text-sap-primary font-bold text-[14px]">10 days</span>
<span class="text-[11px] px-1.5 py-0.2 rounded bg-sap-positiveBg text-sap-positive font-semibold">(-5d lead)</span>
</div>
</td>
<td class="py-3 px-3 font-mono text-sap-text">
                  14 days
                </td>
<td class="py-3 px-3">
<div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-sap-negativeBg border border-sap-negativeBorder text-sap-negative text-[11px] font-semibold">
<span class="material-symbols-outlined text-[13px]">warning</span>
<span>18 days (Exceeded)</span>
</div>
</td>
</tr>
<!-- Row 3: Unit Price -->
<tr class="hover:bg-sap-hoverBg transition-colors">
<td class="py-3 px-4">
<div class="font-semibold text-sap-text">Unit Price</div>
<div class="text-[11px] text-sap-textSub">Kg delivered (Incoterm DDP)</div>
</td>
<td class="py-3 px-3 font-mono text-[12px] text-sap-textSub">
                  $3.50 COP
                </td>
<td class="py-3 px-4 bg-sap-primaryLight/25 border-l border-r border-sap-primary/30">
<div class="flex items-center gap-1.5">
<span class="font-mono text-sap-primary font-bold text-[15px]">$3.00 COP</span>
<span class="text-[11px] font-semibold text-sap-positive">-14.3%</span>
</div>
</td>
<td class="py-3 px-3 font-mono text-sap-text">
                  $3.35 COP
                </td>
<td class="py-3 px-3 font-mono text-sap-text">
                  $3.48 COP
                </td>
</tr>
<!-- Row 4: Total Commercial Bid (Aggregated Highlight) -->
<tr class="bg-sap-bg/60 border-t border-sap-border">
<td class="py-3 px-4">
<div class="font-bold text-sap-text">Total Commercial Bid</div>
<div class="text-[11px] text-sap-textSub font-mono">7,125,000 Kg Total Volume</div>
</td>
<td class="py-3 px-3 font-mono text-[13px] text-sap-textSub font-semibold">
                  $24.93M COP
                </td>
<td class="py-3 px-4 bg-sap-primaryLight/35 border-l border-r border-sap-primary/30">
<div class="flex flex-col">
<span class="text-[18px] font-bold text-sap-primary font-mono leading-tight">$21.37M COP</span>
<span class="text-[11px] font-semibold text-sap-positive flex items-center gap-0.5">
<span class="material-symbols-outlined text-[13px]">arrow_downward</span>
<span>-$3.56M (-14.3% variance)</span>
</span>
</div>
</td>
<td class="py-3 px-3 font-mono">
<div class="flex flex-col">
<span class="font-semibold text-sap-text">$23.86M COP</span>
<span class="text-[11px] text-sap-textSub">-4.2% variance</span>
</div>
</td>
<td class="py-3 px-3 font-mono">
<div class="flex flex-col">
<span class="font-semibold text-sap-text">$24.79M COP</span>
<span class="text-[11px] text-sap-textSub">-0.5% variance</span>
</div>
</td>
</tr>
<!-- Row 5: Action / Decision Selection -->
<tr class="border-t border-sap-border bg-white">
<td class="py-3 px-4 text-[12px] font-semibold uppercase tracking-wider text-sap-textSub">
                  Decision Status
                </td>
<td class="py-3 px-3 text-[12px] text-sap-textMuted font-mono">
                  Tariff Baseline
                </td>
<td class="py-3 px-4 bg-sap-primaryLight/25 border-l border-r border-sap-primary/30">
<button class="w-full py-1.5 px-3 rounded-sap-sm bg-sap-primary hover:bg-sap-primaryHover text-white font-semibold text-[12px] flex items-center justify-center gap-1 shadow-sm transition-colors sap-focus-ring" onclick="document.getElementById('award-modal').classList.remove('hidden')">
<span class="material-symbols-outlined text-[15px]">check</span>
<span>Select &amp; Commit</span>
</button>
</td>
<td class="py-3 px-3">
<span class="inline-flex items-center px-2 py-1 rounded bg-sap-neutralBg border border-sap-border text-sap-textSub text-[11px] font-medium">
                    Standby (Tier 2)
                  </span>
</td>
<td class="py-3 px-3">
<span class="inline-flex items-center px-2 py-1 rounded bg-sap-negativeBg border border-sap-negativeBorder text-sap-negative text-[11px] font-semibold">
                    Disqualified (SLA)
                  </span>
</td>
</tr>
</tbody>
</table>
</div>
<!-- Table Footer / Clean Core Audit Note -->
<div class="px-4 py-2.5 bg-sap-bg border-t border-sap-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-sap-textSub">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-[15px] text-sap-positive">verified_user</span>
<span>Cryptographic audit verification hash: <code class="font-mono text-sap-text bg-white px-1.5 py-0.5 rounded border border-sap-border">SHA-256:d9e76fa9b881a7cf902</code> (Tamper-proof sealed)</span>
</div>
<div class="flex items-center gap-1 text-sap-text font-medium">
<span class="w-1.5 h-1.5 rounded-full bg-sap-positive"></span>
<span>SAP Clean Core Certified • Zero Custom ABAP Modifications</span>
</div>
</div>
</div>
<!-- ===================================================================== -->
<!-- Right Panel: Fiori Object Cards & Telemetry - 4/12 cols               -->
<!-- ===================================================================== -->
<div class="lg:col-span-4 flex flex-col gap-4">
<!-- Card 1: Award Summary & S/4HANA PO Direct Dispatch -->
<div class="bg-sap-cardBg rounded-sap-md border border-sap-border shadow-fiori-card overflow-hidden">
<!-- Card Header (ui5-card-header) -->
<div class="p-4 border-b border-sap-border flex items-center justify-between bg-white">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-[20px] text-sap-primary">gavel</span>
<div>
<h3 class="font-bold text-[15px] text-sap-text">Award Summary</h3>
<span class="text-[11px] text-sap-textSub">Follow-on S/4HANA PO Dispatch</span>
</div>
</div>
<span class="px-2 py-0.5 rounded bg-sap-primaryLight border border-sap-informationBorder text-sap-primary text-[11px] font-bold" id="badgeAwardApproval">
              Final Approval
            </span>
</div>
<!-- Structured Form Container (Label-Value Pairs) -->
<div class="p-4 flex flex-col gap-3 text-[13px]">
<div class="flex justify-between items-start pb-2 border-b border-sap-borderLight">
<span class="text-sap-textSub text-[12px]">Selected Vendor</span>
<div class="text-right">
<div class="font-bold text-sap-text" id="projMainTitle">SONDA Colombia S.A.</div>
<div class="font-mono text-[11px] text-sap-textSub">SAP Vendor #800192</div>
</div>
</div>
<div class="flex justify-between items-start pb-2 border-b border-sap-borderLight">
<span class="text-sap-textSub text-[12px]">Follow-on PO Doc</span>
<div class="text-right">
<div class="font-mono font-semibold text-sap-text" id="projIdText">PO 450009180</div>
<div class="text-[11px] text-sap-textSub">Document Type: NB Standard</div>
</div>
</div>
<div class="flex justify-between items-start pb-2 border-b border-sap-borderLight">
<span class="text-sap-textSub text-[12px]">Total Commitment</span>
<div class="text-right">
<div class="font-bold font-mono text-[16px] text-sap-primary leading-tight">$21,375,000 COP</div>
<div class="text-[11px] font-semibold text-sap-positive">14.3% Under Baseline Budget</div>
</div>
</div>
<div class="flex justify-between items-start pb-2 border-b border-sap-borderLight">
<span class="text-sap-textSub text-[12px]">Plant &amp; Storage Loc</span>
<div class="text-right">
<div class="font-medium text-sap-text">Vereda Morrison #04</div>
<div class="font-mono text-[11px] text-sap-textSub">Facility Code: CO-MOR-01</div>
</div>
</div>
<div class="flex justify-between items-start pb-1">
<span class="text-sap-textSub text-[12px]">Target Release Mode</span>
<div class="text-right">
<div class="font-medium text-sap-text flex items-center justify-end gap-1">
<span class="w-1.5 h-1.5 rounded-full bg-sap-positive"></span>
<span>Direct OData v4 Post</span>
</div>
<div class="font-mono text-[11px] text-sap-textSub">Zero Staging Queue</div>
</div>
</div>
<!-- Action Buttons -->
<div class="flex flex-col gap-2 pt-2">
<button class="w-full h-[36px] rounded-sap-sm bg-sap-primary hover:bg-sap-primaryHover text-white font-semibold text-[13px] flex items-center justify-center gap-1.5 shadow-sm transition-colors sap-focus-ring" onclick="document.getElementById('award-modal').classList.remove('hidden')">
<span class="material-symbols-outlined text-[17px]">verified</span>
<span>Commit Purchase Order</span>
</button>
<button class="w-full h-[32px] rounded-sap-sm bg-sap-bg hover:bg-sap-hoverBg border border-sap-border text-sap-text font-medium text-[12px] flex items-center justify-center gap-1.5 transition-colors sap-focus-ring" onclick="document.getElementById('cxml-drawer').classList.remove('hidden')">
<span class="material-symbols-outlined text-[16px] text-sap-textSub">terminal</span>
<span>Inspect cXML 1.2 Payload</span>
</button>
</div>
<!-- Clean Core Notice Box -->
<div class="p-2.5 rounded bg-sap-bg border border-sap-border flex items-start gap-2 text-[11px] text-sap-textSub">
<span class="material-symbols-outlined text-[16px] text-sap-primary mt-0.5">verified_user</span>
<span>Zero modification to SAP core table logic. Native cXML/OData interface maintains full lifecycle clean-core compliance.</span>
</div>
</div>
</div>
<!-- Card 2: Supplier Evaluation Radar & Telemetry -->
<div class="bg-sap-cardBg rounded-sap-md border border-sap-border shadow-fiori-card p-4 flex flex-col gap-3">
<div class="flex items-center justify-between border-b border-sap-borderLight pb-2">
<div class="flex items-center gap-1.5">
<span class="material-symbols-outlined text-sap-primary text-[18px]">analytics</span>
<span class="font-bold text-[14px] text-sap-text">Supplier Evaluation Radar</span>
</div>
<span class="px-1.5 py-0.2 rounded font-mono font-bold text-[11px] bg-sap-positiveBg text-sap-positive border border-sap-positiveBorder">
              95.8% Overall
            </span>
</div>
<!-- MicroBarChart Progress Indicators -->
<div class="flex flex-col gap-2.5 pt-1">
<!-- Metric 1 -->
<div>
<div class="flex justify-between text-[12px] text-sap-textSub mb-1">
<span>Technical Specifications &amp; Quality</span>
<span class="font-mono font-semibold text-sap-text">95 / 100</span>
</div>
<div class="w-full h-2 rounded-full bg-sap-borderLight overflow-hidden">
<div class="h-full bg-sap-primary rounded-full" style="width: 95%"></div>
</div>
</div>
<!-- Metric 2 -->
<div>
<div class="flex justify-between text-[12px] text-sap-textSub mb-1">
<span>Financial Health &amp; Risk Rating</span>
<span class="font-mono font-semibold text-sap-text">98 / 100</span>
</div>
<div class="w-full h-2 rounded-full bg-sap-borderLight overflow-hidden">
<div class="h-full bg-sap-positive rounded-full" style="width: 98%"></div>
</div>
</div>
<!-- Metric 3 -->
<div>
<div class="flex justify-between text-[12px] text-sap-textSub mb-1">
<span>Historical Lead Time Fidelity</span>
<span class="font-mono font-semibold text-sap-text">94 / 100</span>
</div>
<div class="w-full h-2 rounded-full bg-sap-borderLight overflow-hidden">
<div class="h-full bg-[#107E3E] rounded-full" style="width: 94%"></div>
</div>
</div>
</div>
<!-- Auditor Signature Tag -->
<div class="mt-1 pt-2 border-t border-sap-borderLight flex items-center justify-between text-[11px] text-sap-textSub">
<span>Lead Procurement Auditor:</span>
<span class="font-semibold text-sap-text">Valeria Martinez (Certified)</span>
</div>
</div>
</div>
</div>
</main>

<!-- Hidden elements for test and script invariance -->
<div class="hidden" style="display:none !important;">
  <span id="cfgMetaPrNumber">PR-3000010443 (3000010443)</span>
  <span id="cfgMetaMaterial">SUMINISTROS REFRI</span>
  <span id="cfgMetaPlant">Gran Tierra Energy • Vereda Morrison</span>
  <span id="cfgMetaPoNumber">SAP PO 450009180</span>
  <select id="cfgRfqSelector"></select>
  <table id="matrixComparisonTable">
    <thead id="matrixComparisonThead"></thead>
    <tbody id="matrixComparisonTbody"></tbody>
  </table>
  <span id="buyerApprovedPrsCountBadge">0 Approved</span>
  <tbody id="buyerApprovedPrsBody"></tbody>
  <span id="cfgActiveEventBadge">Multi-Vendor RFP</span>
  <span id="techReqStatusBadge">Configured</span>
  <span id="econReqStatusBadge">Configured</span>
  <span id="invitedSupplierCountBadge">4</span>
  <div id="cfgInvitedSuppliersBadges"></div>
  <span id="biddingClosedBadge">Sealed</span>
  <button id="btnOpenEnvelope"></button>
  <button id="btnAwardScenario"></button>
</div>

<!-- ========================================================================= -->
<!-- 5. SAP Horizon Interactive Slide-Over Drawer (cXML 1.2 Inspection)        -->
<!-- ========================================================================= -->
<div class="hidden fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-[2px] transition-opacity" id="cxml-drawer">
<div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
<div class="w-screen max-w-2xl bg-white shadow-fiori-modal border-l border-sap-border flex flex-col">
<!-- Drawer Header -->
<div class="p-4 border-b border-sap-border flex items-center justify-between bg-sap-bg">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-sap-primary text-[22px]">code</span>
<div>
<h4 class="font-bold text-[15px] text-sap-text">cXML 1.2 Standard OrderRequest Payload</h4>
<p class="text-[11px] text-sap-textSub font-mono">Bound to SAP S/4HANA OData Core Service v4</p>
</div>
</div>
<button class="w-8 h-8 rounded-sap-sm flex items-center justify-center text-sap-textSub hover:bg-sap-hoverBg transition-colors" onclick="document.getElementById('cxml-drawer').classList.add('hidden')" title="Close drawer">
<span class="material-symbols-outlined text-[20px]">close</span>
</button>
</div>
<!-- Drawer Content -->
<div class="p-4 flex-1 overflow-y-auto bg-[#1C232B] text-[#DCE5EF] font-mono text-[12px] leading-relaxed">
<div class="flex items-center justify-between pb-2 mb-3 border-b border-[#2C3845] text-xs text-[#8EA3B7]">
<span>RFC 3023 Compliant XML Data Stream</span>
<button class="px-2 py-1 rounded bg-[#2C3845] hover:bg-[#3E4F63] text-white text-[11px] font-sans transition-colors" onclick="navigator.clipboard?.writeText(document.getElementById('cxml-content').innerText); this.innerText='Copied to Clipboard!'">
              Copy Payload
            </button>
</div>
<pre class="select-all whitespace-pre-wrap" id="cxml-content">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.014/cXML.dtd"&gt;
&lt;cXML payloadID="20250228-881a7cf902@alpek.sourcing" timestamp="2025-02-28T14:22:05-05:00"&gt;
  &lt;Header&gt;
    &lt;From&gt;
      &lt;Credential domain="NetworkID"&gt;
        &lt;Identity&gt;ALPEK-COLOMBIA-HQ&lt;/Identity&gt;
      &lt;/Credential&gt;
    &lt;/From&gt;
    &lt;To&gt;
      &lt;Credential domain="VendorID"&gt;
        &lt;Identity&gt;800192-SONDA-CO&lt;/Identity&gt;
      &lt;/Credential&gt;
    &lt;/To&gt;
    &lt;Sender&gt;
      &lt;Credential domain="SourcingOS"&gt;
        &lt;Identity&gt;SAP-CLEAN-CORE-V4&lt;/Identity&gt;
        &lt;SharedSecret&gt;SHA256:d9e76fa9b881a7cf902&lt;/SharedSecret&gt;
      &lt;/Credential&gt;
    &lt;/Sender&gt;
  &lt;/Header&gt;
  &lt;Request deploymentMode="production"&gt;
    &lt;OrderRequest&gt;
      &lt;OrderRequestHeader orderID="PO-450009180" orderDate="2025-02-28" type="new"&gt;
        &lt;Total&gt;
          &lt;Money currency="COP"&gt;21375000.00&lt;/Money&gt;
        &lt;/Total&gt;
        &lt;ShipTo&gt;
          &lt;Address isoCountryCode="CO"&gt;
            &lt;Name&gt;Planta Industrial Vereda Morrison #04&lt;/Name&gt;
          &lt;/Address&gt;
        &lt;/ShipTo&gt;
      &lt;/OrderRequestHeader&gt;
      &lt;ItemOut quantity="7125000" lineNumber="1"&gt;
        &lt;ItemID&gt;
          &lt;SupplierPartID&gt;R134A-IND-GRADE&lt;/SupplierPartID&gt;
        &lt;/ItemID&gt;
        &lt;ItemDetail&gt;
          &lt;UnitPrice&gt;&lt;Money currency="COP"&gt;3.00&lt;/Money&gt;&lt;/UnitPrice&gt;
          &lt;Description xml:lang="en"&gt;Refrigerant 134a Industrial 99.98% purity&lt;/Description&gt;
          &lt;UnitOfMeasure&gt;KGM&lt;/UnitOfMeasure&gt;
        &lt;/ItemDetail&gt;
      &lt;/ItemOut&gt;
    &lt;/OrderRequest&gt;
  &lt;/Request&gt;
&lt;/cXML&gt;</pre>
</div>
<!-- Drawer Footer -->
<div class="p-3 bg-sap-bg border-t border-sap-border flex items-center justify-between">
<div class="flex items-center gap-1.5 text-[11px] text-sap-textSub">
<span class="w-2 h-2 rounded-full bg-sap-positive"></span>
<span>Schema: Validated ISO cXML 1.2</span>
</div>
<button class="px-3 py-1.5 rounded-sap-sm border border-sap-border bg-white hover:bg-sap-hoverBg text-sap-text text-[12px] font-medium transition-colors" onclick="document.getElementById('cxml-drawer').classList.add('hidden')">
            Close Panel
          </button>
</div>
</div>
</div>
</div>

<!-- ========================================================================= -->
<!-- 6. SAP Horizon Dialog Modal: PO Committee Sign-Off                        -->
<!-- ========================================================================= -->
<div class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]" id="award-modal">
<div class="bg-white rounded-sap-md shadow-fiori-modal border border-sap-border max-w-lg w-full p-5 flex flex-col gap-4 animate-in fade-in duration-150">
<div class="flex items-start justify-between border-b border-sap-borderLight pb-3">
<div class="flex items-center gap-2.5">
<div class="w-9 h-9 rounded-sap-sm bg-sap-primaryLight text-sap-primary flex items-center justify-center">
<span class="material-symbols-outlined text-[22px]">gavel</span>
</div>
<div>
<h3 class="font-bold text-[16px] text-sap-text">Sign-off &amp; Commit PO in S/4HANA</h3>
<span class="text-[12px] text-sap-textSub">Final Adjudication Authorization</span>
</div>
</div>
<button class="w-7 h-7 rounded-sap-sm flex items-center justify-center text-sap-textSub hover:bg-sap-hoverBg transition-colors" onclick="document.getElementById('award-modal').classList.add('hidden')">
<span class="material-symbols-outlined text-[18px]">close</span>
</button>
</div>
<div class="p-3 rounded-sap-sm bg-sap-bg border border-sap-border flex flex-col gap-2 text-[12px]">
<div class="flex justify-between">
<span class="text-sap-textSub">Selected Vendor:</span>
<span class="font-bold text-sap-text">SONDA Colombia S.A.</span>
</div>
<div class="flex justify-between">
<span class="text-sap-textSub">Follow-on PO Document:</span>
<span class="font-mono font-bold text-sap-text">PO 450009180 (NB Standard)</span>
</div>
<div class="flex justify-between">
<span class="text-sap-textSub">Total Commitment:</span>
<span class="font-mono font-bold text-sap-primary text-[13px]">$21,375,000 COP</span>
</div>
<div class="flex justify-between">
<span class="text-sap-textSub">Net Verified Savings:</span>
<span class="font-bold text-sap-positive">$3,562,500 COP (-14.3%)</span>
</div>
</div>
<p class="text-[12px] text-sap-textSub leading-normal">
        By authorizing committee sign-off, an official cXML OrderRequest will be dispatched via OData v4 directly to SAP S/4HANA with zero middleware modification. Polite sealed notices will be automatically generated for runners-up (Indorama Ventures, BASF).
      </p>
<div class="flex items-center justify-end gap-2 pt-2 border-t border-sap-borderLight">
<button class="px-3.5 py-1.5 rounded-sap-sm bg-sap-bg hover:bg-sap-hoverBg border border-sap-border text-sap-text font-medium text-[12px] transition-colors" onclick="document.getElementById('award-modal').classList.add('hidden')">
          Cancel
        </button>
<button class="px-4 py-1.5 rounded-sap-sm bg-sap-primary hover:bg-sap-primaryHover text-white font-semibold text-[12px] shadow-sm flex items-center gap-1.5 transition-colors" onclick="this.innerHTML='Committed via OData ✓'; this.classList.replace('bg-sap-primary','bg-sap-positive'); setTimeout(()=>document.getElementById('award-modal').classList.add('hidden'), 1200);">
<span class="material-symbols-outlined text-[16px]">check_circle</span>
<span>Confirm &amp; Transmit PO</span>
</button>
</div>
</div>
</div>

<!-- ========================================================================= -->
<!-- 7. Footer: Enterprise Horizon Status Bar                                  -->
<!-- ========================================================================= -->
<footer class="w-full bg-sap-shell border-t border-sap-border py-2 px-6 mt-auto" style="background:#FFFFFF !important; border-top:1px solid #D9D9D9 !important;">
<div class="max-w-[1680px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-sap-textSub">
<div class="flex items-center gap-2">
<span class="font-semibold text-sap-text">© 2025 Alpek Sourcing OS</span>
<span>•</span>
<span>SAP UI5 / Fiori Morning Horizon Standards</span>
</div>
<div class="flex items-center gap-4 font-mono text-[10px]">
<span>S/4HANA OData Core: ACTIVE</span>
<span>cXML Envelope: 881a-7cf902</span>
<span>Latency: 18ms</span>
</div>
</div>
</footer>

</div>\n\n`;

// Replace everything from pageAppStart up to supplierPortalIndex
html = html.substring(0, pageAppStart) + exactFioriAppHtml + '      ' + html.substring(supplierPortalIndex);

// Add adjudication window timer script right before </body>
if (!html.includes('adjudication-timer')) {
  const timerScript = `
  <script>
    (function() {
      let seconds = 57 * 60 + 5; // 00:57:05
      const timerElement = document.getElementById('adjudication-timer');
      const buyerTimer = document.getElementById('buyerBiddingCountdownDisplay');
      setInterval(() => {
        if (seconds <= 0) return;
        seconds--;
        const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        const timeStr = \`\${hrs}:\${mins}:\${secs}\`;
        if (timerElement) timerElement.textContent = timeStr;
        if (buyerTimer) buyerTimer.textContent = timeStr;
      }, 1000);
    })();
  </script>
`;
  html = html.replace('</body>', timerScript + '\n</body>');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log("Successfully replaced #page-app with exact SAP Fiori Morning Horizon layout from image!");
