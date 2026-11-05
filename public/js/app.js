// SAP Ariba Sourcing & Procurement Platform - Client Controller
// Authentic SAP Fiori / SAP Ariba Sourcing Flow Implementation
// Gran Tierra Energy Colombia RFP Doc2432956265 / PR 3000010443

const AppState = {
  activePersona: 'buyer', // 'buyer' or 'supplier'
  activeMainTab: 'sourcing', // 'dashboard', 'sourcing', 'excel_erp', 'sap_erp', 'contracts', 'integration'
  activeInnerTab: 'tab-awards', // 'tab-tasks', 'tab-awards', 'tab-allocations', 'tab-contracts', 'tab-specifications', 'tab-messages'
  activeExcelSheet: 'prs', // 'prs' or 'pos'
  currentRfqId: 'Doc2432956265',
  rfqData: null,
  quotations: [],
  suppliers: [],
  awardApproved: false,
  awarded: false,
  followOnPoId: '450009180',
  currentSupplier: {
    id: 'SUP-SONDA',
    name: 'SONDA DE COLOMBIA S A',
    anid: 'AN11459791479'
  }
};

let currentUser = {
  id: 'usr-buyer',
  username: 'valeria.buyer',
  name: 'Valeria Martinez',
  role: 'buyer',
  roleLabel: 'Category Buyer & Sourcing Manager',
  initials: 'VM',
  avatarColor: '#0854a0'
};

// Document Initializer
document.addEventListener('DOMContentLoaded', () => {
  initializePlatform();
});

async function initializePlatform() {
  const cachedUser = sessionStorage.getItem('abc_current_user');
  const loginPage = document.getElementById('page-login');
  const appPage = document.getElementById('page-app');

  if (cachedUser) {
    try {
      currentUser = JSON.parse(cachedUser);
      if (loginPage) loginPage.classList.add('hidden');
      if (appPage) appPage.classList.remove('hidden');
    } catch (_) {
      if (loginPage) loginPage.classList.remove('hidden');
      if (appPage) appPage.classList.add('hidden');
    }
  } else {
    // Show login page by default for proper production flow
    if (loginPage) loginPage.classList.remove('hidden');
    if (appPage) appPage.classList.add('hidden');
  }

  await loadSourcingData();
  await loadBuyerApprovedPrs();
  await loadRfqProjectsDropdown();
  await loadCigAuditLogs();
  calculateSupplierSubtotal();
  loadExcelSheetData();
  updateHeaderUserBadge();
  updateRoleNavigation();
  highlightActiveRibbonPersona();
  await updateLiveKpiBar();

  // Periodic real-time update of live KPI bar, audit logs & Sourcing Cockpit (Every 3 seconds)
  setInterval(() => {
    updateLiveKpiBar();
    if (AppState.activeMainTab === 'integration') {
      loadCigAuditLogs();
    }
    // Real-time synchronization: When Buyer or Evaluator is on Sourcing view, auto-poll for incoming supplier bids
    const sourcingView = document.getElementById('view-sourcing-project');
    if (sourcingView && sourcingView.classList.contains('active') && AppState.currentRfqId) {
      loadSourcingData();
    }
  }, 3000);
}

async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    if (res.ok) {
      currentUser = await res.json();
      updateHeaderUserBadge();
    }
  } catch (err) {
    console.error('Failed to fetch auth user:', err);
  }
}

function updateHeaderUserBadge() {
  const appAvatar = document.getElementById('appUserAvatar');
  const appName = document.getElementById('appUserName');
  const appRole = document.getElementById('appUserRole');
  const dropName = document.getElementById('dropdownName');
  const dropRole = document.getElementById('dropdownRole');
  const dropEmail = document.getElementById('dropdownEmail');

  const initials = currentUser.initials || 'MP';
  const color = currentUser.avatarColor || '#0854a0';
  const name = currentUser.name || 'User';
  const roleLabel = currentUser.roleLabel || currentUser.role;
  const email = currentUser.email || `${currentUser.username || 'user'}@abccompany.com`;

  if (appAvatar) {
    appAvatar.textContent = initials;
    appAvatar.style.backgroundColor = color;
  }
  if (appName) appName.textContent = name;
  if (appRole) appRole.textContent = roleLabel;

  if (dropName) dropName.textContent = name;
  if (dropRole) dropRole.textContent = roleLabel;
  if (dropEmail) dropEmail.textContent = email;

  // Also update legacy badge if present
  const oldAvatar = document.getElementById('activeUserAvatar');
  const oldName = document.getElementById('activeUserName');
  const oldRole = document.getElementById('activeUserRoleTag');
  if (oldAvatar) { oldAvatar.textContent = initials; oldAvatar.style.backgroundColor = color; }
  if (oldName) oldName.textContent = name;
  if (oldRole) oldRole.textContent = roleLabel;
}

// ============================================================================
// 1. RBAC LOGIN & ROLE SWITCHER CONTROLLER (10 Personas)
// ============================================================================

async function handleLoginFormSubmit(e) {
  if (e) e.preventDefault();
  const username = document.getElementById('loginUsername')?.value.trim();
  if (!username) return;
  await loginAsSpecificUser(username);
}

function quickLoginAs(username) {
  const usernameInput = document.getElementById('loginUsername');
  if (usernameInput) usernameInput.value = username;
  loginAsSpecificUser(username);
}

function logoutUser() {
  sessionStorage.removeItem('abc_current_user');
  const loginPage = document.getElementById('page-login');
  const appPage = document.getElementById('page-app');
  if (loginPage) loginPage.classList.remove('hidden');
  if (appPage) appPage.classList.add('hidden');
  closeProfileDropdown();
  showSapToast('Signed out successfully. Choose a persona to sign in.', 'info');
}

function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdownCard');
  if (dropdown) dropdown.classList.toggle('show');
}

function closeProfileDropdown() {
  const dropdown = document.getElementById('profileDropdownCard');
  if (dropdown) dropdown.classList.remove('show');
}

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
  const trigger = document.getElementById('userProfileTrigger');
  const card = document.getElementById('profileDropdownCard');
  if (trigger && card && !trigger.contains(e.target) && !card.contains(e.target)) {
    card.classList.remove('show');
  }
});

async function loginAsSpecificUser(userIdentifier) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: userIdentifier, id: userIdentifier })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      sessionStorage.setItem('abc_current_user', JSON.stringify(currentUser));

      // Transition to authenticated application shell
      const loginPage = document.getElementById('page-login');
      const appPage = document.getElementById('page-app');
      if (loginPage) loginPage.classList.add('hidden');
      if (appPage) appPage.classList.remove('hidden');

      updateHeaderUserBadge();
      updateRoleNavigation();
      highlightActiveRibbonPersona();
      updateLiveKpiBar();
      closeRbacModal();
      closeProfileDropdown();

      // Highlight active persona card in directory
      document.querySelectorAll('.persona-card').forEach(c => c.classList.remove('active-persona'));
      const activeCard = document.getElementById(`cardRole${currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}`);
      if (activeCard) activeCard.classList.add('active-persona');

      showSapToast(`Welcome back, ${currentUser.name} (${currentUser.roleLabel}).`, 'success');

      // Route directly to persona's dedicated cockpit
      routeUserToDefaultView();
    }
  } catch (err) {
    showSapToast('Login failed: ' + err.message, 'error');
  }
}

async function loginAsRole(roleKey) {
  return loginAsSpecificUser(roleKey);
}

function switchPersona(p) {
  AppState.activePersona = p;
  if (p === 'supplier') {
    switchMainTab('supplier');
  } else {
    switchMainTab('sourcing');
  }
}

function routeUserToDefaultView() {
  const role = currentUser.role;
  if (role === 'requester') {
    switchMainTab('requester');
    updateTrackerStage(1);
  } else if (role === 'manager') {
    switchMainTab('manager');
    updateTrackerStage(2);
  } else if (role === 'buyer') {
    switchPersona('buyer');
    switchMainTab('sourcing');
    updateTrackerStage(3);
  } else if (role === 'rfq_approver') {
    switchMainTab('rfq_approver');
    updateTrackerStage(4);
  } else if (role === 'supplier') {
    switchPersona('supplier');
    updateTrackerStage(5);
  } else if (role === 'tech_evaluator') {
    switchMainTab('tech_eval');
    updateTrackerStage(6);
  } else if (role === 'comm_evaluator') {
    switchMainTab('comm_eval');
    updateTrackerStage(6);
  } else if (role === 'award_approver') {
    switchMainTab('approver');
    updateTrackerStage(7);
  } else if (role === 'receiving') {
    switchMainTab('receiving');
    updateTrackerStage(10);
  } else {
    switchMainTab('integration');
  }
}

function updateTrackerStage(activeStage) {
  for (let i = 1; i <= 11; i++) {
    const el = document.getElementById(`pstep${i}`);
    if (!el) continue;
    el.classList.remove('active', 'done');
    if (i < activeStage) {
      el.classList.add('done');
    } else if (i === activeStage) {
      el.classList.add('active');
    }
  }
}

function navigateToStage(stageNum) {
  const stageMap = {
    1: { user: 'usr-requester', tab: 'requester' },
    2: { user: 'usr-manager', tab: 'manager' },
    3: { user: 'usr-buyer', tab: 'sourcing' },
    4: { user: 'usr-rfq-approver', tab: 'rfq_approver' },
    5: { user: 'usr-supplier-sonda', tab: 'supplier' },
    6: { user: 'usr-tech-eval', tab: 'tech_eval' },
    7: { user: 'usr-award-approver', tab: 'approver' },
    8: { user: 'usr-buyer', tab: 'sourcing' },
    9: { user: 'usr-award-approver', tab: 'approver' },
    10: { user: 'usr-receiving', tab: 'receiving' },
    11: { user: 'usr-buyer', tab: 'order_closure' }
  };

  const target = stageMap[stageNum];
  if (target) {
    loginAsSpecificUser(target.user).then(() => {
      updateTrackerStage(stageNum);
    });
  }
}

function updateRoleNavigation() {
  const navTabsContainer = document.getElementById('appNavPills') || document.getElementById('mainSubnavTabs');
  if (!navTabsContainer) return;

  const role = currentUser.role;
  let html = '';

  if (role === 'requester') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('requester')">My Requisitions (PR)</button>
      <button class="nav-pill-btn" onclick="openAddPrModal()">+ New Plant Demand</button>
      <button class="nav-pill-btn" onclick="switchMainTab('excel_erp')">ERP Requisitions</button>
    `;
    loadRequesterPrs();
  } else if (role === 'manager') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('manager')">Approval Inbox</button>
      <button class="nav-pill-btn" onclick="switchMainTab('excel_erp')">ERP Requisitions</button>
    `;
    loadManagerQueue();
  } else if (role === 'rfq_approver') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('rfq_approver')">RFQ Governance</button>
      <button class="nav-pill-btn" onclick="switchMainTab('sourcing')">Sourcing Cockpit</button>
    `;
    loadRfqApproverQueue();
  } else if (role === 'tech_evaluator') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('tech_eval')">Technical Envelope</button>
      <button class="nav-pill-btn" onclick="switchMainTab('sourcing')">Sourcing Cockpit</button>
    `;
    loadTechEvalQueue();
  } else if (role === 'comm_evaluator') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('comm_eval')">Commercial Envelope</button>
      <button class="nav-pill-btn" onclick="switchMainTab('sourcing')">Sourcing Cockpit</button>
    `;
    loadCommEvalQueue();
  } else if (role === 'award_approver') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('approver')">Award Sign-Off &amp; SAP Push</button>
      <button class="nav-pill-btn" onclick="switchMainTab('sourcing')">Sourcing Cockpit</button>
      <button class="nav-pill-btn" onclick="switchMainTab('excel_erp')">Committed POs</button>
    `;
  } else if (role === 'receiving') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('receiving')">Goods Receipt (GRN)</button>
      <button class="nav-pill-btn" onclick="openRecordGrnModal()">+ Record Receipt</button>
      <button class="nav-pill-btn" onclick="switchMainTab('excel_erp')">Outbound Orders</button>
    `;
    loadReceivingQueue();
  } else if (role === 'supplier') {
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('supplier')">Active RFQ Invitations &amp; Bidding</button>
    `;
    loadSupplierPortalData();
  } else {
    // Default Buyer (Valeria Martinez)
    html = `
      <button class="nav-pill-btn active" onclick="switchMainTab('sourcing')">Sourcing Events</button>
      <button class="nav-pill-btn" onclick="switchMainTab('order_closure')">Purchase Orders</button>
      <button class="nav-pill-btn" onclick="switchMainTab('excel_erp')">ERP Requisitions &amp; POs</button>
      <button class="nav-pill-btn" onclick="switchMainTab('sap_erp')">SAP GUI (ME53N)</button>
    `;
  }

  navTabsContainer.innerHTML = html;
}

function openRbacModal() {
  document.getElementById('modalRbacDirectory').classList.remove('hidden');
}

function closeRbacModal() {
  document.getElementById('modalRbacDirectory').classList.add('hidden');
}

function openRoleGuideModal() {
  document.getElementById('modalRoleGuide').classList.remove('hidden');
}

function closeRoleGuideModal() {
  document.getElementById('modalRoleGuide').classList.add('hidden');
}

// ============================================================================
// 2. MAIN NAVIGATION (SUB-NAV TABS) WITH STRICT RBAC ACCESS CONTROL
// ============================================================================

const ROLE_TAB_PERMISSIONS = {
  requester: ['requester', 'excel_erp'],
  manager: ['manager', 'excel_erp'],
  buyer: ['sourcing', 'order_closure', 'excel_erp', 'sap_erp', 'integration'],
  supplier: ['supplier'],
  tech_evaluator: ['tech_eval', 'sourcing'],
  comm_evaluator: ['comm_eval', 'sourcing'],
  award_approver: ['approver', 'sourcing', 'excel_erp', 'integration'],
  receiving: ['receiving', 'excel_erp'],
  admin: ['requester', 'manager', 'sourcing', 'supplier', 'tech_eval', 'comm_eval', 'approver', 'receiving', 'order_closure', 'excel_erp', 'sap_erp', 'integration']
};

function navigateIfAuthorized(tab) {
  const userRole = (currentUser && currentUser.role) || 'buyer';
  const allowed = ROLE_TAB_PERMISSIONS[userRole] || [];
  if (allowed.includes(tab) || userRole === 'admin') {
    switchMainTab(tab);
  } else {
    showSapToast(`Access Denied: Your role [${currentUser.roleLabel || userRole}] does not have permission to access the ${tab.replace(/_/g, ' ').toUpperCase()} workspace.`, 'warning');
  }
}

function switchMainTab(tab) {
  // Strict Frontend RBAC: Block unauthorized tab access
  const userRole = (currentUser && currentUser.role) || 'buyer';
  const normalizedTab = tab === 'dashboard' ? 'sourcing' : tab;
  const allowed = ROLE_TAB_PERMISSIONS[userRole] || [];

  if (userRole !== 'admin' && !allowed.includes(normalizedTab)) {
    showSapToast(`Access Restricted: Persona [${currentUser.name || userRole}] is not authorized to access this workspace.`, 'error');
    return;
  }

  AppState.activeMainTab = tab;

  // Update topbar nav pill buttons
  const pills = document.querySelectorAll('.topbar-nav-center .nav-pill-btn');
  pills.forEach(p => {
    p.classList.toggle('active', p.getAttribute('onclick')?.includes(`'${tab}'`));
  });

  // Update legacy tabs if any
  const tabs = document.querySelectorAll('.subnav-tabs .subnav-tab');
  tabs.forEach(t => t.classList.remove('active'));

  // Hide all main views
  document.querySelectorAll('.workspace-view').forEach(v => v.classList.remove('active'));

  if (tab === 'sourcing' || tab === 'dashboard') {
    const v = document.getElementById('view-sourcing-project');
    if (v) v.classList.add('active');
    loadBuyerApprovedPrs();
    loadRfqProjectsDropdown();
    loadSourcingData();
  } else if (tab === 'requester') {
    const v = document.getElementById('view-requester');
    if (v) v.classList.add('active');
    loadRequesterPrs();
  } else if (tab === 'manager') {
    const v = document.getElementById('view-manager');
    if (v) v.classList.add('active');
    loadManagerQueue();
  } else if (tab === 'rfq_approver') {
    const v = document.getElementById('view-rfq-approver');
    if (v) v.classList.add('active');
    loadRfqApproverQueue();
  } else if (tab === 'tech_eval') {
    const v = document.getElementById('view-tech-eval');
    if (v) v.classList.add('active');
    loadTechEvalQueue();
  } else if (tab === 'comm_eval') {
    const v = document.getElementById('view-comm-eval');
    if (v) v.classList.add('active');
    loadCommEvalQueue();
  } else if (tab === 'approver') {
    const v = document.getElementById('view-approver');
    if (v) v.classList.add('active');
    loadApproverReviewData();
  } else if (tab === 'receiving') {
    const v = document.getElementById('view-receiving');
    if (v) v.classList.add('active');
    loadReceivingQueue();
  } else if (tab === 'order_closure') {
    const v = document.getElementById('view-order-closure');
    if (v) v.classList.add('active');
    loadClosureQueue();
  } else if (tab === 'excel_erp') {
    const v = document.getElementById('view-excel-erp');
    if (v) v.classList.add('active');
    loadExcelSheetData();
  } else if (tab === 'sap_erp') {
    const v = document.getElementById('view-sap-erp');
    if (v) v.classList.add('active');
  } else if (tab === 'integration') {
    const v = document.getElementById('view-cig-integration');
    if (v) v.classList.add('active');
    loadCigAuditLogs();
  } else if (tab === 'supplier') {
    const v = document.getElementById('view-supplier-portal');
    if (v) v.classList.add('active');
    loadSupplierPortalData();
  }
}

// ============================================================================
// 3. INNER SOURCING PROJECT TABS (TASKS, AWARDS, ATTACHMENTS...)
// ============================================================================

function switchInnerTab(tabId) {
  AppState.activeInnerTab = tabId;

  // Toggle button active class
  document.querySelectorAll('.inner-tab').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-target') === tabId);
  });

  // Toggle pane visibility
  document.querySelectorAll('.inner-tab-content').forEach(p => {
    p.classList.toggle('active', p.id === tabId);
  });
}

// ============================================================================
// 4. DATA FETCHING & MATRIX RENDERING
// ============================================================================

async function loadSourcingData() {
  try {
    const res = await fetch(`/api/rfqs/${AppState.currentRfqId}`);
    if (!res.ok) return;
    const data = await res.json();
    AppState.rfqData = data.rfq;
    AppState.quotations = data.quotations || [];
    AppState.suppliers = data.suppliers || [];

    // Update Project Header Title and details
    const projMainTitle = document.getElementById('projMainTitle');
    const projIdText = document.getElementById('projIdText');
    const projChipStatus = document.getElementById('projChipStatus');
    const chipDocId = document.querySelector('.chip-docid');

    if (projMainTitle && data.rfq) projMainTitle.textContent = data.rfq.title;
    if (projIdText && data.rfq) projIdText.textContent = data.rfq.projectId || data.rfq.id;
    if (projChipStatus && data.rfq) projChipStatus.textContent = data.rfq.status.replace(/_/g, ' ');
    if (chipDocId && data.rfq) chipDocId.textContent = `ID: ${data.rfq.id}`;

    // Update Sourcing Event Configuration & Publication Identity Banner
    const cfgTitle = document.getElementById('cfgEventTitle');
    const cfgIdBadge = document.getElementById('cfgEventIdBadge');
    const cfgPrEl = document.getElementById('cfgMetaPrNumber');
    const cfgMatEl = document.getElementById('cfgMetaMaterial');
    const cfgPlantEl = document.getElementById('cfgMetaPlant');
    const cfgPoEl = document.getElementById('cfgMetaPoNumber');
    const cfgPoBadge = document.getElementById('cfgMetaPoBadge');

    if (data.rfq) {
      if (cfgTitle) cfgTitle.textContent = data.rfq.title;
      if (cfgIdBadge) cfgIdBadge.textContent = `(ID: ${data.rfq.id})`;
      if (cfgPrEl) cfgPrEl.textContent = data.rfq.sourcePrId || data.rfq.sapPrNumber ? `${data.rfq.sourcePrId || ('PR-' + data.rfq.sapPrNumber)} (SAP: ${data.rfq.sapPrNumber || 'ME51N'})` : 'PR-3000010443';
      if (cfgMatEl) {
        const item = (data.rfq.lineItems && data.rfq.lineItems[0]) || (data.rfq.items && data.rfq.items[0]);
        if (item) {
          cfgMatEl.textContent = `${item.description || item.name || data.rfq.title} • ${(Number(item.quantity) || 1).toLocaleString()} ${item.unit || 'Unit'}`;
        } else {
          cfgMatEl.textContent = data.rfq.title;
        }
      }
      if (cfgPlantEl) {
        cfgPlantEl.textContent = `${data.rfq.plantName || data.rfq.plant || 'OP ANG (GTE Col)'} • ${data.rfq.department || 'Purchases & Materials'}`;
      }

      // Check linked PO status asynchronously
      fetch('/api/pos').then(r => r.json()).then(pos => {
        if (!Array.isArray(pos)) return;
        const linkedPo = pos.find(p => p.rfqId === data.rfq.id || p.id === data.rfq.linkedPoId || p.sourcePrNumber === data.rfq.sapPrNumber);
        if (cfgPoEl) {
          if (linkedPo) {
            cfgPoEl.innerHTML = `<span style="color:#047857; font-weight:700;">SAP PO ${escapeHtml(linkedPo.sapPoNumber || linkedPo.id)}</span> (${escapeHtml(linkedPo.supplierName)}) — <span style="font-weight:600;">${escapeHtml(linkedPo.status.replace(/_/g, ' '))}</span>`;
            if (cfgPoBadge) cfgPoBadge.style.background = '#ecfdf5';
          } else {
            cfgPoEl.innerHTML = '<span style="color:#64748b; font-style:italic;">Auto-generates upon Award (Step 5: System Award to SAP)</span>';
            if (cfgPoBadge) cfgPoBadge.style.background = '#f8fafc';
          }
        }
      }).catch(() => {});
    }

    renderComparisonMatrix();
    // Update requirements status badges based on whether buyer has configured them
    updateRequirementsStatusBadges(data.rfq);
    // Render invited suppliers list badges
    renderInvitedSuppliersBadges(data.rfq);
    // Dynamic 5-stage stepper progression (Create -> Publish -> Monitor -> Review -> Award)
    updateSourcingStepper(data.rfq.status);
    // Start dynamic live countdown timer
    if (data.rfq.deadline) {
      startLiveBiddingTimer(data.rfq.deadline);
    }
    // Show/hide Close Bidding button and publication controls based on RFQ status
    updateBuyerCockpitStatusControls(data.rfq);
  } catch (err) {
    console.error('Failed to load sourcing data:', err);
  }
}

function renderInvitedSuppliersBadges(rfq) {
  const container = document.getElementById('cfgInvitedSuppliersBadges');
  const countBadge = document.getElementById('invitedSupplierCountBadge');
  if (!container || !rfq) return;

  const invitedIds = rfq.invitedSuppliers || [];
  if (countBadge) countBadge.textContent = invitedIds.length;

  if (invitedIds.length === 0) {
    container.innerHTML = '<span style="font-size:11px; color:#94a3b8; font-style:italic;">No suppliers invited yet. Click below to select vendors.</span>';
    return;
  }

  const supplierNames = {
    'SUP-SONDA': 'SONDA DE COLOMBIA S A',
    'SUP-101': 'INDORAMA PETROCHEM S A S',
    'SUP-102': 'BASF QUÍMICA COLOMBIA S.A.',
    'SUP-103': 'PETROQUÍMICA DEL CARIBE S.A.',
    'SUP-104': 'DOW CHEMICAL COLOMBIA S.A.'
  };

  container.innerHTML = invitedIds.map(id => {
    const name = supplierNames[id] || id;
    const hasBid = (AppState.quotations || []).some(q => q.supplierId === id);
    return `
      <span class="status-pill ${hasBid ? 'confirmed' : 'approved'}" style="font-size:11px; padding:3px 8px;" title="${hasBid ? 'Quotation Submitted (Participated)' : 'Invited (Pending Response)'}">
        ${hasBid ? '✓' : '✉️'} ${escapeHtml(name.split(' ')[0])}
      </span>
    `;
  }).join('');
}

function updateBuyerCockpitStatusControls(rfq) {
  if (!rfq) return;
  const closeBtn = document.getElementById('btnCloseBidding');
  const evalReadyBadge = document.getElementById('biddingClosedBadge');
  const pubBanner = document.getElementById('rfqPublicationBanner');
  const pubBtn = document.getElementById('btnPublishRfqDirect');
  const pubTitle = document.getElementById('rfqPubStatusTitle');
  const pubSubtitle = document.getElementById('rfqPubStatusSubtitle');
  const pubIcon = document.getElementById('rfqPubStatusIcon');

  const isOpenForBidding = rfq.status === 'OPEN_FOR_BIDDING';
  const isDraftOrPending = rfq.status === 'PENDING_APPROVAL' || rfq.status === 'DRAFT';
  const isUnderEval = rfq.status === 'UNDER_EVALUATION' || (rfq.biddingClosedAt && rfq.status !== 'OPEN_FOR_BIDDING');

  if (closeBtn) {
    closeBtn.style.display = isOpenForBidding ? 'inline-flex' : 'none';
  }

  // Bidding Closed Badge only shown if actually under evaluation / closed!
  if (evalReadyBadge) {
    if (isUnderEval) {
      evalReadyBadge.innerHTML = '<span style="background:#dcfce7; color:#15803d; font-weight:700; padding:6px 14px; border-radius:20px; font-size:12px;">&#128275; Bidding Closed — Ready for Evaluation</span>';
      evalReadyBadge.style.display = 'block';
    } else {
      evalReadyBadge.style.display = 'none';
    }
  }

  // Publication Banner controls:
  if (pubBtn && pubTitle) {
    if (isDraftOrPending) {
      // ONLY show publish button when tender is a DRAFT that has NOT been published yet!
      pubBtn.style.display = 'inline-flex';
      pubBtn.innerHTML = '🚀 Publish Tender &amp; Send Invitations';
      pubTitle.textContent = 'Event Status: DRAFT / PENDING PUBLICATION';
      if (pubSubtitle) pubSubtitle.textContent = 'Configuration complete. Click to officially publish tender to market and invite suppliers.';
      if (pubIcon) pubIcon.textContent = '📝';
    } else if (isOpenForBidding) {
      // Event is ALREADY PUBLISHED and OPEN! NEVER show "Publish Event" button!
      pubBtn.style.display = 'none';
      pubTitle.textContent = 'Event Status: OPEN FOR BIDDING (Active Countdown Timer)';
      if (pubSubtitle) pubSubtitle.textContent = `${(rfq.invitedSuppliers || []).length} invited suppliers can submit sealed bids. Countdown running in real time.`;
      if (pubIcon) pubIcon.textContent = '📢';
    } else {
      pubBtn.style.display = 'none';
      pubTitle.textContent = `Event Status: ${rfq.status.replace(/_/g, ' ')}`;
      if (pubSubtitle) pubSubtitle.textContent = 'Bidding round closed. Technical and commercial envelope evaluation underway.';
      if (pubIcon) pubIcon.textContent = '⚖️';
    }
  }

  // Header "Open Envelope" Button state:
  // Under Two-Envelope protocol, envelopes remain SEALED while bidding is open!
  const envBtn = document.getElementById('btnOpenEnvelope');
  if (envBtn) {
    if (isOpenForBidding) {
      envBtn.innerHTML = '🔒 Envelope Sealed (Bidding Active)';
      envBtn.style.opacity = '0.7';
      envBtn.title = 'Two-Envelope Sealed Protocol: Bids are strictly sealed until bidding closes to ensure zero bias.';
    } else {
      envBtn.innerHTML = '📂 Open Commercial Envelope';
      envBtn.style.opacity = '1';
      envBtn.title = 'Unseal Commercial Envelope for evaluation & award';
    }
  }

  // Update Award Recommendation Button & Governance Callout based on RFQ status
  const btnAward = document.getElementById('btnAwardScenario');
  const callout = document.getElementById('approvalStrategyCallout');
  if (btnAward) {
    if (rfq.status === 'PENDING_AWARD_APPROVAL') {
      btnAward.disabled = true;
      btnAward.style.background = '#0284c7';
      btnAward.style.border = 'none';
      btnAward.style.cursor = 'default';
      btnAward.innerHTML = '&#9203; Recommendation Submitted — Awaiting Approval (Carlos Alberto Fonseca)';
      if (callout) {
        callout.innerHTML = `
          <div class="callout-icon">&#9432;</div>
          <div class="callout-body">
            <strong>Status: Submitted to Stage 3 Internal Approval Committee</strong>
            <p>Recommended winner: <strong>${escapeHtml(rfq.recommendedSupplierId || 'SONDA DE COLOMBIA S A')}</strong>. Awaiting final award sign-off from Carlos Alberto Fonseca. Once signed off, the SAP PO will be generated and dispatched automatically.</p>
          </div>
        `;
      }
    } else if (rfq.status === 'AWARDED' || rfq.status === 'PO_GENERATED' || rfq.status === 'CLOSED_COMPLETED') {
      btnAward.disabled = true;
      btnAward.style.background = '#15803d';
      btnAward.style.border = 'none';
      btnAward.style.cursor = 'default';
      btnAward.innerHTML = '&#10003; Award Approved &amp; PO Created';
      if (callout) {
        callout.innerHTML = `
          <div class="callout-icon" style="color:#15803d;">&#10003;</div>
          <div class="callout-body">
            <strong style="color:#15803d;">Award Decision Approved by Carlos Alberto Fonseca</strong>
            <p>The award decision has been formally approved and committed. Purchase Order is in S/4HANA and notified to the winning supplier.</p>
          </div>
        `;
      }
    } else {
      btnAward.disabled = false;
      btnAward.style.background = '';
      btnAward.style.border = '';
      btnAward.style.cursor = 'pointer';
      btnAward.innerHTML = '<span class="btn-icon">&#128228;</span> Submit Award Recommendation for Approval';
    }
  }
}

function updateSourcingStepper(status) {
  const s1 = document.getElementById('stepNode1');
  const l1 = document.getElementById('stepLine1');
  const s2 = document.getElementById('stepNode2');
  const l2 = document.getElementById('stepLine2');
  const s3 = document.getElementById('stepNode3');
  const l3 = document.getElementById('stepLine3');
  const s4 = document.getElementById('stepNode4');
  const l4 = document.getElementById('stepLine4');
  const s5 = document.getElementById('stepNode5');

  if (!s1 || !s2 || !s3 || !s4 || !s5) return;

  [s1, s2, s3, s4, s5].forEach(s => s.className = 'step-node');
  [l1, l2, l3, l4].forEach(l => { if (l) l.className = 'step-line'; });

  if (status === 'DRAFT' || status === 'PENDING_APPROVAL') {
    s1.className = 'step-node active';
    s1.innerHTML = '<div class="step-circle">1</div><span class="step-label">Create</span>';
    s2.innerHTML = '<div class="step-circle">2</div><span class="step-label">Publish</span>';
    s3.innerHTML = '<div class="step-circle">3</div><span class="step-label">Monitor</span>';
    s4.innerHTML = '<div class="step-circle">4</div><span class="step-label">Review responses</span>';
    s5.innerHTML = '<div class="step-circle">5</div><span class="step-label">Award</span>';
  } else if (status === 'OPEN_FOR_BIDDING') {
    s1.className = 'step-node completed';
    s1.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Create</span>';
    if (l1) l1.className = 'step-line completed';
    s2.className = 'step-node completed';
    s2.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Publish</span>';
    if (l2) l2.className = 'step-line completed';
    s3.className = 'step-node active';
    s3.innerHTML = '<div class="step-circle">⏱️</div><span class="step-label">Monitor (Active Bidding)</span>';
    s4.innerHTML = '<div class="step-circle">4</div><span class="step-label">Review responses</span>';
    s5.innerHTML = '<div class="step-circle">5</div><span class="step-label">Award</span>';
  } else if (status === 'UNDER_EVALUATION' || status === 'PENDING_AWARD_APPROVAL') {
    s1.className = 'step-node completed';
    s1.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Create</span>';
    if (l1) l1.className = 'step-line completed';
    s2.className = 'step-node completed';
    s2.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Publish</span>';
    if (l2) l2.className = 'step-line completed';
    s3.className = 'step-node completed';
    s3.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Monitor</span>';
    if (l3) l3.className = 'step-line completed';
    s4.className = 'step-node active';
    s4.innerHTML = '<div class="step-circle">4</div><span class="step-label">Review responses</span>';
    s5.innerHTML = '<div class="step-circle">5</div><span class="step-label">Award</span>';
  } else if (status === 'AWARDED' || status === 'PO_GENERATED' || status === 'CLOSED_COMPLETED') {
    [s1, s2, s3, s4, s5].forEach(s => s.className = 'step-node completed');
    [l1, l2, l3, l4].forEach(l => { if (l) l.className = 'step-line completed'; });
    s1.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Create</span>';
    s2.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Publish</span>';
    s3.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Monitor</span>';
    s4.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Review responses</span>';
    s5.innerHTML = '<div class="step-circle">&#10003;</div><span class="step-label">Awarded</span>';
  }
}

// ============================================================================
// DYNAMIC LIVE COUNTDOWN TIMER (Architecture: Bidding Deadline & Auto-Closure)
// ============================================================================
let liveBiddingTimerInterval = null;

function startLiveBiddingTimer(deadlineIso) {
  if (liveBiddingTimerInterval) {
    clearInterval(liveBiddingTimerInterval);
    liveBiddingTimerInterval = null;
  }

  if (!deadlineIso) return;

  function tick() {
    const deadlineTime = new Date(deadlineIso).getTime();
    const now = Date.now();
    const diffMs = deadlineTime - now;

    const buyerTimerDisplay = document.getElementById('buyerBiddingCountdownDisplay');
    const buyerHeaderTimerText = document.getElementById('buyerHeaderTimerText');
    const supplierTimeRemainingText = document.getElementById('supplierTimeRemainingText');
    const buyerDeadlineTimestamp = document.getElementById('buyerDeadlineTimestamp');
    const buyerTimerStatusPill = document.getElementById('buyerTimerStatusPill');

    const formattedDeadline = new Date(deadlineIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', month: 'short', day: 'numeric' });
    if (buyerDeadlineTimestamp) {
      buyerDeadlineTimestamp.textContent = `Deadline: ${formattedDeadline}`;
    }

    if (diffMs <= 0) {
      const expiredStr = '00:00:00 (Deadline Met)';
      if (buyerTimerDisplay) {
        buyerTimerDisplay.textContent = '00:00:00';
        buyerTimerDisplay.style.color = '#dc2626';
      }
      if (buyerHeaderTimerText) buyerHeaderTimerText.textContent = expiredStr;
      if (supplierTimeRemainingText) supplierTimeRemainingText.textContent = expiredStr;
      if (buyerTimerStatusPill) {
        buyerTimerStatusPill.className = 'status-pill rejected';
        buyerTimerStatusPill.textContent = 'Deadline Met — Closed';
      }

      const closeBtn = document.getElementById('btnCloseBidding');
      if (closeBtn) closeBtn.style.display = 'none';

      const badge = document.getElementById('biddingClosedBadge');
      if (badge) {
        badge.innerHTML = '<span style="background:#fee2e2; color:#991b1b; font-weight:700; padding:6px 14px; border-radius:20px; font-size:12px;">🔒 Bidding Window Closed (Deadline Met)</span>';
        badge.style.display = 'block';
      }

      clearInterval(liveBiddingTimerInterval);
      liveBiddingTimerInterval = null;
      return;
    }

    // Active countdown calculation
    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = n => String(n).padStart(2, '0');
    const timeStr = days > 0
      ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    if (buyerTimerDisplay) {
      buyerTimerDisplay.textContent = timeStr;
      buyerTimerDisplay.style.color = diffMs < 300000 ? '#dc2626' : '#b45309';
    }
    if (buyerHeaderTimerText) buyerHeaderTimerText.textContent = timeStr;
    if (supplierTimeRemainingText) supplierTimeRemainingText.textContent = timeStr;
    if (buyerTimerStatusPill) {
      buyerTimerStatusPill.className = 'status-pill approved';
      buyerTimerStatusPill.textContent = 'Active Countdown';
    }
  }

  tick();
  liveBiddingTimerInterval = setInterval(tick, 1000);
}

// ============================================================================
// 3B. BUYER APPROVED REQUISITIONS QUEUE (STAGE 3 CONVERT PR TO RFQ)
// ============================================================================

async function loadBuyerApprovedPrs() {
  const container = document.getElementById('buyerApprovedPrsBody');
  const countBadge = document.getElementById('buyerApprovedPrsCountBadge');
  if (!container) return;

  try {
    const res = await fetch('/api/prs');
    const prs = await res.json();
    // Show PRs approved by Department Manager waiting for or currently in sourcing
    const approvedPrs = prs.filter(p => p.status === 'APPROVED' || p.status === 'IN_SOURCING');

    if (countBadge) countBadge.textContent = `${approvedPrs.length} Approved PRs`;

    if (approvedPrs.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:18px; color:#64748b;">No approved requisitions currently pending. Requisitions will appear here as soon as Department Managers approve them.</td></tr>`;
      return;
    }

    container.innerHTML = approvedPrs.map(pr => {
      const isToothbrush = pr.title.toLowerCase().includes('toothbrush');
      const hasRfq = !!pr.linkedRfqId;

      return `
        <tr style="${isToothbrush ? 'background:#f0f9ff; border-left:3px solid #0284c7;' : ''}">
          <td><strong>${escapeHtml(pr.id)}</strong><br><span style="font-size:10px; color:#64748b;">SAP: ${escapeHtml(pr.sapPrNumber || '-')}</span></td>
          <td>
            <strong style="color:#0284c7; font-size:13px;">${escapeHtml(pr.title)}</strong><br>
            <span style="font-size:11px; color:#475569;">${escapeHtml(pr.purpose)}</span>
          </td>
          <td><strong>${pr.lineItems[0] ? pr.lineItems[0].quantity.toLocaleString() : '1'}</strong> ${pr.lineItems[0] ? pr.lineItems[0].unit : 'Unit'}</td>
          <td><strong style="color:#0854a0;">$${(pr.estimatedBudget || 0).toLocaleString()} ${pr.currency || 'COP'}</strong></td>
          <td>${escapeHtml(pr.requesterName)}<br><span style="font-size:10px; color:#64748b;">${escapeHtml(pr.department)}</span></td>
          <td>
            <span class="status-pill ${hasRfq ? 'confirmed' : 'approved'}">
              ${hasRfq ? `In Sourcing (${pr.linkedRfqId})` : `✓ Approved by ${escapeHtml(pr.managerName || 'David Vance')}`}
            </span>
          </td>
          <td style="text-align:right;">
            ${hasRfq 
              ? `<button class="sap-btn sap-btn-secondary sap-btn-sm" onclick="switchSourcingProject('${pr.linkedRfqId}')">View Tender RFQ</button>`
              : `<button class="sap-btn sap-btn-primary sap-btn-sm" style="background:#0284c7; font-weight:700;" onclick="openCreateRfqModal('${pr.id}')">
                  ⚡ Create Sourcing RFQ
                </button>`
            }
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load buyer approved PRs:', err);
  }
}

// Global cached supplier list for multi-supplier selector
let cachedPlatformSuppliers = [];

async function fetchPlatformSuppliers() {
  try {
    const res = await fetch('/api/suppliers');
    if (res.ok) {
      cachedPlatformSuppliers = await res.json();
    }
  } catch (err) {
    console.error('Failed to fetch suppliers:', err);
  }
}

// ----------------------------------------------------------------------------
// MODAL: CREATE SOURCING RFQ (Multi-Supplier Selection & Timer Configuration)
// ----------------------------------------------------------------------------
async function openCreateRfqModal(prId) {
  if (cachedPlatformSuppliers.length === 0) {
    await fetchPlatformSuppliers();
  }

  let targetPr = null;
  try {
    const res = await fetch('/api/prs');
    const prs = await res.json();
    targetPr = prs.find(p => p.id === prId);
  } catch (_) {}

  const prTitle = targetPr ? targetPr.title : 'Plant Demand';
  const prBudget = targetPr ? `$${(targetPr.estimatedBudget || 0).toLocaleString()} ${targetPr.currency || 'COP'}` : '';

  const prIdInput = document.getElementById('createRfqSourcePrId');
  const prSummary = document.getElementById('createRfqPrSummary');
  const titleInput = document.getElementById('createRfqTitle');
  const list = document.getElementById('createRfqSuppliersList');

  if (prIdInput) prIdInput.value = prId;
  if (prSummary) prSummary.textContent = `${prId} — ${prTitle} (${prBudget})`;
  if (titleInput) titleInput.value = `Sourcing RFP for ${prTitle}`;

  // Populate supplier checkboxes (Select multiple suppliers)
  if (list) {
    list.innerHTML = cachedPlatformSuppliers.map((sup, idx) => `
      <label style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:6px; background:${idx % 2 === 0 ? '#f8fafc' : '#fff'}; cursor:pointer; font-size:12px; border:1px solid #e2e8f0;">
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" name="createRfqSupplierCheckbox" value="${sup.id}"  onchange="updateCreateRfqSelectedCount()">
          <div>
            <strong>${escapeHtml(sup.name)}</strong> <span style="font-size:11px; color:#64748b;">(${sup.id})</span>
            <div style="font-size:10px; color:#64748b;">${sup.categories ? sup.categories.join(' • ') : 'Approved Supplier'} | ANID: ${sup.anid || sup.sapVendorId}</div>
          </div>
        </div>
        <span class="status-pill approved" style="font-size:10px;">Rating: ${sup.rating || 4.9} ★</span>
      </label>
    `).join('');
  }
  updateCreateRfqSelectedCount();

  const modal = document.getElementById('modalCreateRfq');
  if (modal) modal.classList.remove('hidden');
}

function updateCreateRfqSelectedCount() {
  const checked = document.querySelectorAll('input[name="createRfqSupplierCheckbox"]:checked');
  const countEl = document.getElementById('createRfqSelectedCount');
  if (countEl) countEl.textContent = checked.length;
}

function toggleAllCreateSuppliers(check) {
  document.querySelectorAll('input[name="createRfqSupplierCheckbox"]').forEach(cb => {
    cb.checked = check;
  });
  updateCreateRfqSelectedCount();
}

function closeCreateRfqModal() {
  const modal = document.getElementById('modalCreateRfq');
  if (modal) modal.classList.add('hidden');
}

async function handleCreateRfqFormSubmit(event) {
  event.preventDefault();
  const prId = document.getElementById('createRfqSourcePrId').value;
  const title = document.getElementById('createRfqTitle').value;
  const durationMinutes = Number(document.getElementById('createRfqDurationSelect').value) || 1440;
  const commercialTerms = document.getElementById('createRfqCommercialTerms').value;

  const checkedBoxes = Array.from(document.querySelectorAll('input[name="createRfqSupplierCheckbox"]:checked'));
  const selectedSuppliers = checkedBoxes.map(cb => cb.value);

  if (selectedSuppliers.length === 0) {
    showSapToast('Please select at least one supplier to invite to this tender.', 'warning');
    return;
  }

  const submitter = event.submitter;
  const publishImmediately = !submitter || submitter.value !== 'draft';

  try {
    const res = await fetch('/api/rfqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourcePrId: prId,
        title,
        deadlineMinutes: durationMinutes,
        commercialTerms,
        invitedSuppliers: selectedSuppliers,
        publishImmediately
      })
    });
    const data = await res.json();
    if (data.success) {
      closeCreateRfqModal();
      showSapToast(
        publishImmediately
          ? `✓ Sourcing Event (${data.rfq.id}) published! Invitations dispatched to ${selectedSuppliers.length} suppliers. Live timer active.`
          : `✓ Sourcing Event (${data.rfq.id}) created as Draft.`,
        'success'
      );
      AppState.currentRfqId = data.rfq.id;
      await loadBuyerApprovedPrs();
      await loadRfqProjectsDropdown();
      await loadSourcingData();
    } else {
      showSapToast('Error creating RFQ: ' + (data.error || 'Failed'), 'error');
    }
  } catch (err) {
    showSapToast('Failed to create RFQ: ' + err.message, 'error');
  }
}

// Fallback programmatic creation function
async function createRfqFromApprovedPr(prId) {
  return openCreateRfqModal(prId);
}

// ----------------------------------------------------------------------------
// MODAL: MANAGE / INVITE MULTIPLE SUPPLIERS TO CURRENT RFQ
// ----------------------------------------------------------------------------
async function openInviteSuppliersModal(rfqId) {
  if (cachedPlatformSuppliers.length === 0) {
    await fetchPlatformSuppliers();
  }

  const activeRfq = AppState.rfqData;
  const currentlyInvited = (activeRfq && activeRfq.invitedSuppliers) || ['SUP-SONDA', 'SUP-101', 'SUP-102'];

  const rfqIdInput = document.getElementById('inviteSuppliersRfqId');
  const titleSpan = document.getElementById('inviteSuppliersRfqTitle');
  const list = document.getElementById('manageSuppliersCheckboxList');

  if (rfqIdInput) rfqIdInput.value = rfqId;
  if (titleSpan) titleSpan.textContent = activeRfq ? `${activeRfq.id} (${activeRfq.title})` : rfqId;

  if (list) {
    list.innerHTML = cachedPlatformSuppliers.map((sup, idx) => {
      const isChecked = currentlyInvited.includes(sup.id);
      return `
        <label style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; border-radius:6px; background:${idx % 2 === 0 ? '#f8fafc' : '#fff'}; cursor:pointer; font-size:12px; border:1px solid #e2e8f0;">
          <div style="display:flex; align-items:center; gap:8px;">
            <input type="checkbox" name="manageSupplierCheckbox" value="${sup.id}" ${isChecked ? 'checked' : ''}>
            <div>
              <strong>${escapeHtml(sup.name)}</strong> <span style="font-size:11px; color:#64748b;">(${sup.id})</span>
              <div style="font-size:10px; color:#64748b;">${sup.categories ? sup.categories.join(' • ') : 'Approved Supplier'} | ANID: ${sup.anid || sup.sapVendorId}</div>
            </div>
          </div>
          <span class="status-pill ${isChecked ? 'confirmed' : 'approved'}" style="font-size:10px;">
            ${isChecked ? 'Currently Invited' : 'Available'}
          </span>
        </label>
      `;
    }).join('');
  }

  const modal = document.getElementById('modalInviteSuppliers');
  if (modal) modal.classList.remove('hidden');
}

function toggleAllManageSuppliers(check) {
  document.querySelectorAll('input[name="manageSupplierCheckbox"]').forEach(cb => {
    cb.checked = check;
  });
}

function closeInviteSuppliersModal() {
  const modal = document.getElementById('modalInviteSuppliers');
  if (modal) modal.classList.add('hidden');
}

async function handleInviteSuppliersSubmit(event) {
  event.preventDefault();
  const rfqId = document.getElementById('inviteSuppliersRfqId').value || AppState.currentRfqId;
  const checkedBoxes = Array.from(document.querySelectorAll('input[name="manageSupplierCheckbox"]:checked'));
  const selectedSuppliers = checkedBoxes.map(cb => cb.value);

  if (selectedSuppliers.length === 0) {
    showSapToast('Please select at least one supplier to invite.', 'warning');
    return;
  }

  try {
    const res = await fetch(`/api/rfqs/${rfqId}/invite-suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ suppliers: selectedSuppliers })
    });
    const data = await res.json();
    if (data.success) {
      closeInviteSuppliersModal();
      showSapToast(`✓ Invited suppliers updated! Total active: ${selectedSuppliers.length} suppliers.`, 'success');
      await loadSourcingData();
    } else {
      showSapToast('Error: ' + (data.error || 'Failed to update suppliers'), 'error');
    }
  } catch (err) {
    showSapToast('Failed: ' + err.message, 'error');
  }
}

// ----------------------------------------------------------------------------
// MODAL: SET / EXTEND DYNAMIC BIDDING TIMER
// ----------------------------------------------------------------------------
function openSetBiddingDeadlineModal(rfqId) {
  const input = document.getElementById('setDeadlineRfqId');
  if (input) input.value = rfqId;
  const modal = document.getElementById('modalSetBiddingDeadline');
  if (modal) modal.classList.remove('hidden');
}

function closeSetBiddingDeadlineModal() {
  const modal = document.getElementById('modalSetBiddingDeadline');
  if (modal) modal.classList.add('hidden');
}

function toggleCustomDeadlineInput(show) {
  const customGroup = document.getElementById('customDeadlineInputGroup');
  if (customGroup) customGroup.classList.toggle('hidden', !show);
}

async function handleSetBiddingDeadlineSubmit(event) {
  event.preventDefault();
  const rfqId = document.getElementById('setDeadlineRfqId').value || AppState.currentRfqId;
  const selectedRadio = document.querySelector('input[name="deadlineQuickOption"]:checked');
  const optionVal = selectedRadio ? selectedRadio.value : '1440';

  let payload = {};
  if (optionVal === 'custom') {
    const customVal = document.getElementById('customDeadlineValue').value;
    if (!customVal) {
      showSapToast('Please choose a valid expiration timestamp.', 'warning');
      return;
    }
    payload = { deadline: new Date(customVal).toISOString() };
  } else {
    payload = { deadlineMinutes: Number(optionVal) };
  }

  try {
    const res = await fetch(`/api/rfqs/${rfqId}/set-deadline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeSetBiddingDeadlineModal();
      showSapToast(`✓ Bidding deadline updated. Dynamic countdown timer active.`, 'success');
      startLiveBiddingTimer(data.deadline);
      await loadSourcingData();
    } else {
      showSapToast('Error setting deadline: ' + (data.error || 'Failed'), 'error');
    }
  } catch (err) {
    showSapToast('Failed: ' + err.message, 'error');
  }
}

// ----------------------------------------------------------------------------
// DIRECT EVENT PUBLICATION (Architecture: Sourcing Event Creation & Publish)
// ----------------------------------------------------------------------------
async function publishCurrentRfqDirect() {
  const rfqId = AppState.currentRfqId;
  try {
    const res = await fetch(`/api/rfqs/${rfqId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      showSapToast(`🚀 Sourcing Event ${rfqId} published! Invitations sent to all selected suppliers.`, 'success');
      await loadSourcingData();
      await loadRfqProjectsDropdown();
    } else {
      showSapToast('Error publishing: ' + (data.error || 'Failed'), 'error');
    }
  } catch (err) {
    showSapToast('Failed to publish: ' + err.message, 'error');
  }
}

async function switchSourcingProject(rfqId) {
  if (!rfqId) return;
  AppState.currentRfqId = rfqId;
  await loadSourcingData();
  await loadRfqProjectsDropdown();
}

async function loadRfqProjectsDropdown() {
  const select = document.getElementById('rfqProjectSelector');
  const cfgSelect = document.getElementById('cfgRfqSelector');

  try {
    const res = await fetch('/api/rfqs');
    const rfqs = await res.json();
    const optionsHtml = rfqs.map(r => `
      <option value="${escapeHtml(r.id)}" ${r.id === AppState.currentRfqId ? 'selected' : ''}>
        ${escapeHtml(r.id)} - ${escapeHtml(r.title)} (${escapeHtml(r.status.replace(/_/g, ' '))})
      </option>
    `).join('');

    if (select) select.innerHTML = optionsHtml;
    if (cfgSelect) cfgSelect.innerHTML = optionsHtml;
  } catch (err) {
    console.error('Failed to load RFQ dropdown:', err);
  }
}

function renderComparisonMatrix() {
  const thead = document.getElementById('matrixComparisonThead');
  const tbody = document.getElementById('matrixComparisonTbody');
  if (!thead || !tbody) return;

  const rfq = AppState.rfqData;
  if (!rfq) return;

  const quotations = AppState.quotations || [];
  const invitedSupplierIds = rfq.invitedSuppliers || ['SUP-SONDA', 'SUP-101', 'SUP-102'];
  const currency = rfq.currency || 'COP';

  const supplierNames = {
    'SUP-SONDA': 'SONDA DE COLOMBIA S A',
    'SUP-101': 'INDORAMA PETROCHEM S A S',
    'SUP-102': 'BASF QUÍMICA COLOMBIA S.A.',
    'SUP-103': 'PETROQUÍMICA DEL CARIBE S.A.',
    'SUP-104': 'DOW CHEMICAL COLOMBIA S.A.'
  };

  const item = (rfq.lineItems && rfq.lineItems[0]) || {
    itemNo: '10',
    description: rfq.title,
    quantity: 1000,
    unit: 'PC',
    targetPrice: 10.00,
    estimatedTotal: 10000.00
  };

  const quantity = Number(item.quantity) || 1;
  const targetUnitPrice = Number(item.targetPrice) || 10.00;
  const baselineTotal = Number(item.estimatedTotal) || (quantity * targetUnitPrice);

  // Find lowest submitted quote
  const submittedQuotes = quotations.filter(q => q.totalBidAmount && typeof q.totalBidAmount === 'number');
  const lowestTotal = submittedQuotes.length > 0 ? Math.min(...submittedQuotes.map(q => q.totalBidAmount)) : null;

  // Build thead dynamically
  thead.innerHTML = `
    <tr>
      <th class="col-criteria" style="min-width:240px;">Line Item / Evaluation Criteria</th>
      <th class="col-baseline" style="min-width:200px; background:#f1f5f9;">
        <div>Requisition Baseline</div>
        <div style="font-size:10px; color:#64748b; font-weight:normal;">(PR ${escapeHtml(rfq.sapPrNumber || rfq.sourcePrId || '-')})</div>
      </th>
      ${invitedSupplierIds.map(supId => {
        const quote = quotations.find(q => q.supplierId === supId);
        const name = (quote && quote.supplierName) || supplierNames[supId] || supId;
        const isLowest = quote && quote.totalBidAmount === lowestTotal;
        const score = quote ? (quote.score || 95.0) : null;

        return `
          <th class="col-supplier ${isLowest ? 'winner-header' : ''}" style="min-width:200px;">
            <div class="th-sup-name">${isLowest ? '🏆 ' : ''}${escapeHtml(name)}</div>
            <div class="th-sup-meta">${supId} ${score ? `| Score: <strong>${score}/100</strong>` : ''}</div>
            ${quote 
              ? (isLowest ? '<div class="th-badge-lowest">Most Competitive Bid</div>' : '<div style="font-size:10px; color:#15803d; font-weight:700;">✓ Bid Submitted</div>')
              : '<div style="font-size:10px; color:#b45309; font-weight:700;">⏳ Pending Response</div>'
            }
          </th>
        `;
      }).join('')}
    </tr>
  `;

  // Build tbody dynamically
  let bodyHtml = '';

  // Section 1: Prerequisites
  bodyHtml += `
    <tr class="section-row">
      <td colspan="${2 + invitedSupplierIds.length}"><strong>1.0 Prerequisites &amp; Quality Certifications</strong></td>
    </tr>
    <tr>
      <td class="indent-cell">1.1 ISO 9001:2015 Quality Certification</td>
      <td>Mandatory Compliance</td>
      ${invitedSupplierIds.map(supId => {
        const quote = quotations.find(q => q.supplierId === supId);
        if (!quote) return `<td class="text-center" style="color:#94a3b8; font-size:11px;">Awaiting response</td>`;
        return `<td class="text-center font-green" style="font-weight:700;">✓ Verified Valid</td>`;
      }).join('')}
    </tr>
  `;

  // Section 2: Quantities & Commercial Tariffs
  bodyHtml += `
    <tr class="section-row">
      <td colspan="${2 + invitedSupplierIds.length}"><strong>2.0 Scope Quantities &amp; Commercial Tariffs</strong></td>
    </tr>
    <tr>
      <td class="indent-cell">
        <strong>${item.itemNo || '1.0'} ${escapeHtml(item.description.toUpperCase())}</strong><br>
        <span class="sub-text">Material: ${escapeHtml(item.materialNo || 'MAT-GEN')} | Unit: ${escapeHtml(item.unit || 'Unit')}</span><br>
        <span class="sub-text">Delivery Plant: ${escapeHtml(rfq.plantName || rfq.plant || 'Plant')}</span>
      </td>
      <td style="background:#f8fafc;">
        <div>Quantity: <strong>${quantity.toLocaleString()} ${escapeHtml(item.unit || 'Unit')}</strong></div>
        <div>Target Unit: <strong>$${targetUnitPrice.toFixed(2)} ${currency}</strong></div>
        <div style="font-weight:700; color:#0854a0;">Est. Total: $${baselineTotal.toLocaleString()} ${currency}</div>
      </td>
      ${invitedSupplierIds.map(supId => {
        const quote = quotations.find(q => q.supplierId === supId);
        if (!quote) {
          return `
            <td class="text-center" style="background:#fafafa; color:#94a3b8; font-size:12px;">
              <div style="padding:14px 6px;">⏳ Quotation Pending</div>
            </td>
          `;
        }

        const bid = (quote.lineItemBids && quote.lineItemBids[0]) || { unitPrice: (quote.totalBidAmount / quantity) || targetUnitPrice, total: quote.totalBidAmount };
        const unitPrice = Number(bid.unitPrice);
        const totalAmount = Number(quote.totalBidAmount || (unitPrice * quantity));
        const savingsPct = baselineTotal > 0 ? (((baselineTotal - totalAmount) / baselineTotal) * 100).toFixed(1) : 0;
        const isLowest = totalAmount === lowestTotal;

        return `
          <td class="text-center ${isLowest ? 'winner-cell' : ''}">
            <div class="unit-price" style="font-size:15px; font-weight:800; color:#0f172a;">$${unitPrice.toFixed(2)} ${currency}</div>
            <div class="sub-price" style="font-size:12px; font-weight:700; color:#0284c7; margin:2px 0;">Total: $${totalAmount.toLocaleString()} ${currency}</div>
            ${savingsPct > 0 
              ? `<span class="savings-tag" style="background:#dcfce7; color:#15803d; font-size:10px; font-weight:700; padding:2px 8px; border-radius:10px;">${savingsPct}% Below Baseline</span>`
              : `<span style="font-size:10px; color:#64748b;">At Target Budget</span>`
            }
          </td>
        `;
      }).join('')}
    </tr>
  `;

  // Section 3: Commercial Terms
  bodyHtml += `
    <tr class="section-row">
      <td colspan="${2 + invitedSupplierIds.length}"><strong>3.0 Commercial Terms &amp; Operational Delivery</strong></td>
    </tr>
    <tr>
      <td class="indent-cell">Guaranteed Lead Time</td>
      <td>14 Days Standard Max</td>
      ${invitedSupplierIds.map(supId => {
        const quote = quotations.find(q => q.supplierId === supId);
        if (!quote) return `<td class="text-center" style="color:#94a3b8; font-size:11px;">--</td>`;
        return `<td class="text-center"><strong>${quote.leadTimeDays || 8} Business Days</strong></td>`;
      }).join('')}
    </tr>
    <tr>
      <td class="indent-cell">Payment Terms</td>
      <td>Net 60 Days</td>
      ${invitedSupplierIds.map(supId => {
        const quote = quotations.find(q => q.supplierId === supId);
        if (!quote) return `<td class="text-center" style="color:#94a3b8; font-size:11px;">--</td>`;
        return `<td class="text-center">${escapeHtml(quote.paymentTerms || 'Net 60 Days')}</td>`;
      }).join('')}
    </tr>
  `;

  // Total Proposal Row
  bodyHtml += `
    <tr class="total-row" style="background:#f8fafc; font-weight:800;">
      <td><strong>TOTAL EVALUATED PROPOSAL (${currency})</strong></td>
      <td style="color:#0854a0;"><strong>$${baselineTotal.toLocaleString()} ${currency}</strong></td>
      ${invitedSupplierIds.map(supId => {
        const quote = quotations.find(q => q.supplierId === supId);
        if (!quote) return `<td class="text-center" style="color:#94a3b8; font-size:11px;">--</td>`;
        const totalAmount = Number(quote.totalBidAmount || 0);
        const isLowest = totalAmount === lowestTotal;
        return `
          <td class="text-center ${isLowest ? 'winner-total' : ''}">
            <div class="total-amount" style="font-size:16px; font-weight:800; color:${isLowest ? '#15803d' : '#0f172a'};">
              $${totalAmount.toLocaleString()} ${currency}
            </div>
            ${isLowest ? '<div class="winner-note" style="font-size:10px; color:#15803d; font-weight:800; margin-top:2px;">🏆 Recommended Sourcing Award</div>' : ''}
          </td>
        `;
      }).join('')}
    </tr>
  `;

  tbody.innerHTML = bodyHtml;
}

// ============================================================================
// 5. SUPPLIER BIDDING INTERACTION (CHECKLIST & TARIFFS CONSOLE)
// ============================================================================

async function loadSupplierPortalData() {
  const container = document.getElementById('supplierInvitedTendersBody');
  const countBadge = document.getElementById('supplierInvitedTendersCountBadge');
  const selector = document.getElementById('supplierTenderSelector');

  try {
    const res = await fetch('/api/rfqs');
    const rfqs = await res.json();
    AppState.supplierRfqs = rfqs;

    if (countBadge) countBadge.textContent = `${rfqs.length} Active Invitations`;

    // Populate invited tenders table
    if (container) {
      if (rfqs.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:16px; color:#64748b;">No active tender invitations found for this vendor account.</td></tr>';
      } else {
        container.innerHTML = rfqs.map(r => {
          const isSelected = r.id === AppState.currentRfqId;
          const statusClass = r.status === 'OPEN_FOR_BIDDING' ? 'pending' : (r.status === 'AWARDED' ? 'approved' : 'confirmed');
          return `
            <tr style="${isSelected ? 'background:#eef2ff; border-left:4px solid #4f46e5; font-weight:600;' : ''}">
              <td>
                <strong>${escapeHtml(r.id)}</strong><br>
                <span style="font-size:10px; color:#64748b;">${escapeHtml(r.projectId ? `Project: ${r.projectId}` : '')}</span>
              </td>
              <td>
                <strong style="color:#1e293b; font-size:13px;">${escapeHtml(r.title)}</strong><br>
                <span style="font-size:11px; color:#64748b;">${escapeHtml(r.specifications || (r.lineItems && r.lineItems[0] ? r.lineItems[0].description : 'Plant operational demand'))}</span>
              </td>
              <td>
                <span class="status-pill ${statusClass}">${escapeHtml((r.status || '').replace(/_/g, ' '))}</span>
              </td>
              <td>
                <span class="status-pill ${r.isSubmitted ? 'approved' : 'returned'}" style="${r.isSubmitted ? 'background:#dcfce7; color:#15803d;' : 'background:#fef3c7; color:#b45309; font-weight:700;'}">
                  ${r.isSubmitted ? '✓ Bid Submitted' : '⚡ Action Required'}
                </span>
              </td>
              <td style="text-align:right;">
                <button class="sap-btn ${isSelected ? 'sap-btn-secondary' : 'sap-btn-primary'} sap-btn-sm" style="${!isSelected ? 'background:#4f46e5;' : ''}" onclick="switchSupplierTender('${r.id}')">
                  ${isSelected ? 'Currently Viewing' : '⚡ Open & Bid'}
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Populate dropdown selector
    if (selector) {
      selector.innerHTML = rfqs.map(r => `
        <option value="${escapeHtml(r.id)}" ${r.id === AppState.currentRfqId ? 'selected' : ''}>
          ${escapeHtml(r.id)} - ${escapeHtml(r.title)} (${r.isSubmitted ? '✓ Quoted' : '⚡ Pending Quote'})
        </option>
      `).join('');
    }

    // Default to current RFQ or first in list
    const targetRfqId = AppState.currentRfqId && rfqs.some(r => r.id === AppState.currentRfqId)
      ? AppState.currentRfqId
      : (rfqs[0] ? rfqs[0].id : null);

    if (targetRfqId && (!AppState.activeSupplierRfq || AppState.activeSupplierRfq.id !== targetRfqId)) {
      await switchSupplierTender(targetRfqId, false);
    }
    // Check for award trigger notifications (Diagram: Award Trigger → Supplier Portal)
    await checkSupplierAwardNotification();
  } catch (err) {
    console.error('Failed to load supplier portal data:', err);
  }
}

async function switchSupplierTender(rfqId, rerenderTable = true) {
  if (!rfqId) return;
  AppState.currentRfqId = rfqId;

  try {
    const res = await fetch(`/api/rfqs/${rfqId}`);
    const data = await res.json();
    const rfq = data.rfq || data;
    AppState.activeSupplierRfq = rfq;

    // Update Header
    const titleEl = document.getElementById('supEventTitle') || document.querySelector('.supplier-event-title');
    if (titleEl) {
      titleEl.innerHTML = `&#128196; ${escapeHtml(rfq.id)} - ${escapeHtml(rfq.title)}`;
    }

    const selector = document.getElementById('supplierTenderSelector');
    if (selector) selector.value = rfqId;

    // Start live dynamic timer for this tender
    if (rfq.deadline) {
      startLiveBiddingTimer(rfq.deadline);
    }

    // Line items data
    const item = (rfq.lineItems && rfq.lineItems[0]) || {
      itemNo: '10',
      description: rfq.title,
      quantity: 1,
      unit: 'Unit',
      targetPrice: 10.00
    };

    const parentTitle = document.getElementById('supParentItemTitle');
    if (parentTitle) parentTitle.innerHTML = `&#9662; 2.1 ${escapeHtml(rfq.title.toUpperCase())}`;

    const codeName = document.getElementById('supLineItemCodeName');
    if (codeName) codeName.innerHTML = `${item.itemNo || '2.1.1'} ${escapeHtml(item.description || rfq.title)}`;

    const descEl = document.getElementById('supLineItemDesc');
    if (descEl) descEl.innerHTML = escapeHtml(rfq.specifications || item.description || 'Commercial procurement demand');

    const qtyEl = document.getElementById('supItemQuantity');
    if (qtyEl) qtyEl.textContent = (item.quantity || 1).toLocaleString();

    const unitEl = document.getElementById('supItemUnit');
    if (unitEl) unitEl.textContent = item.unit || 'Units';

    const plantHeader = document.getElementById('supPlantNameHeader');
    if (plantHeader) plantHeader.textContent = rfq.plantName || `${rfq.plant || 'OP ANG'} Plant`;

    const plantLine = document.getElementById('supLineItemPlant');
    if (plantLine) plantLine.textContent = rfq.plantName || `${rfq.plant || 'OP ANG'} Plant`;

    const currLabel = document.getElementById('supCurrencyLabel');
    if (currLabel) currLabel.textContent = rfq.currency || 'COP';

    // Check if current supplier has submitted quotation
    const supId = currentUser.supplierId || 'SUP-SONDA';
    const quotesRes = await fetch(`/api/rfqs/${rfqId}/quotations`);
    const quotes = await quotesRes.json();
    const myQuote = quotes.find(q => q.supplierId === supId);

    const inputEl = document.getElementById('supInputUnitPrice');
    const checklistSteps = document.querySelectorAll('.checklist-steps .step-item');

    const partBadge = document.getElementById('supplierParticipationStatusBadge');

    if (myQuote && myQuote.lineItemBids && myQuote.lineItemBids[0]) {
      if (inputEl) inputEl.value = Number(myQuote.lineItemBids[0].unitPrice).toFixed(2);
      if (checklistSteps[2]) {
        checklistSteps[2].classList.add('done');
        checklistSteps[2].classList.remove('current');
      }
      if (checklistSteps[3]) {
        checklistSteps[3].classList.add('done');
        checklistSteps[3].classList.remove('pending');
        checklistSteps[3].innerHTML = '<span class="step-check">&#10003;</span> 4. Response Submitted';
      }
      if (partBadge) {
        partBadge.innerHTML = '<span style="background:#dcfce7; color:#15803d; font-weight:800; padding:6px 16px; border-radius:20px; font-size:13px; border:1px solid #86efac; box-shadow:0 1px 3px rgba(0,0,0,0.05);">&#10003; Status: Participated</span>';
      }
    } else {
      if (inputEl) inputEl.value = item.targetPrice ? Number(item.targetPrice).toFixed(2) : '3.00';
      if (checklistSteps[2]) {
        checklistSteps[2].classList.remove('done');
        checklistSteps[2].classList.add('current');
      }
      if (checklistSteps[3]) {
        checklistSteps[3].classList.remove('done');
        checklistSteps[3].classList.add('pending');
        checklistSteps[3].innerHTML = '<span class="step-num">4</span> 4. Submit response';
      }
      if (partBadge) {
        partBadge.innerHTML = '<span style="background:#fef3c7; color:#b45309; font-weight:700; padding:6px 14px; border-radius:20px; font-size:12px;">⚡ Status: Action Required (Invitation Received)</span>';
      }
    }

    calculateSupplierSubtotal();

    if (rerenderTable) {
      loadSupplierPortalData();
    }
  } catch (err) {
    console.error('Error switching supplier tender:', err);
  }
}

function parseSupplierUnitPrice(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).trim();
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    str = str.replace(',', '.');
  }
  return parseFloat(str) || 0;
}

function calculateSupplierSubtotal() {
  const inputEl = document.getElementById('supInputUnitPrice');
  const lineSubtotalEl = document.getElementById('supLineSubtotal');
  const groupSubtotalEl = document.getElementById('supGroupSubtotal');

  if (!inputEl) return;

  let unitPrice = parseSupplierUnitPrice(inputEl.value);

  const rfq = AppState.activeSupplierRfq;
  const item = (rfq && rfq.lineItems && rfq.lineItems[0]) || { quantity: 7125000 };
  const quantity = Number(item.quantity) || 1;
  const currency = (rfq && rfq.currency) || 'COP';
  const total = unitPrice * quantity;

  const formatted = `$${total.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;

  if (lineSubtotalEl) lineSubtotalEl.textContent = formatted;
  if (groupSubtotalEl) groupSubtotalEl.innerHTML = `<strong>${formatted}</strong>`;
}

function updateSupplierTotals() {
  calculateSupplierSubtotal();
  showSapToast('Totals recalculated based on entered unit tariffs.', 'success');
}

async function submitSupplierFullBid() {
  const inputEl = document.getElementById('supInputUnitPrice');
  const isoSelect = document.getElementById('supplierIsoAnswer');
  const leadTimeEl = document.getElementById('supplierLeadTimeInput');
  const remarksEl = document.getElementById('supplierTechnicalRemarks');

  let unitPrice = parseSupplierUnitPrice(inputEl ? inputEl.value : '3.00');
  if (unitPrice <= 0) unitPrice = 3.00;

  const rfq = AppState.activeSupplierRfq;
  const item = (rfq && rfq.lineItems && rfq.lineItems[0]) || { itemNo: '2.1.1', quantity: 7125000 };
  const quantity = Number(item.quantity) || 1;
  const total = unitPrice * quantity;
  const itemNo = item.itemNo || '10';

  const leadTimeDays = Number(leadTimeEl ? leadTimeEl.value : 8) || 8;
  const remarks = remarksEl ? remarksEl.value : 'Complete proposal complying with technical specifications and ISO 9001:2015 certification.';
  const isoAnswer = isoSelect ? isoSelect.value : 'Yes';

  const payload = {
    supplierId: currentUser.supplierId || 'SUP-SONDA',
    currency: (rfq && rfq.currency) || 'COP',
    leadTimeDays: leadTimeDays,
    paymentTerms: 'Net 60 Days',
    remarks: remarks,
    isoCertified: isoAnswer === 'Yes',
    lineItemBids: [
      { itemNo, unitPrice, total }
    ]
  };

  try {
    const res = await fetch(`/api/rfqs/${AppState.currentRfqId}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showSapToast('&#10003; Complete proposal submitted to Alpek Demo successfully.', 'success');

      // Update checklist step 4 to completed
      const checklistSteps = document.querySelectorAll('.checklist-steps .step-item');
      if (checklistSteps[2]) {
        checklistSteps[2].classList.remove('current');
        checklistSteps[2].classList.add('done');
        checklistSteps[2].innerHTML = '<span class="step-check">&#10003;</span> 3. Select line items / lots';
      }
      if (checklistSteps[3]) {
        checklistSteps[3].classList.remove('pending');
        checklistSteps[3].classList.add('done');
        checklistSteps[3].innerHTML = '<span class="step-check">&#10003;</span> 4. Response Submitted';
      }

      const partBadge = document.getElementById('supplierParticipationStatusBadge');
      if (partBadge) {
        partBadge.innerHTML = '<span style="background:#dcfce7; color:#15803d; font-weight:800; padding:6px 16px; border-radius:20px; font-size:13px; border:1px solid #86efac; box-shadow:0 1px 3px rgba(0,0,0,0.05);">&#10003; Status: Participated</span>';
      }

      await loadSupplierPortalData();
      await loadCigAuditLogs();
    } else {
      showSapToast('Error submitting bid: ' + (data.error || 'Please try again'), 'error');
    }
  } catch (err) {
    showSapToast('Communication error: ' + err.message, 'error');
  }
}

// ============================================================================
// 6. BUYER APPROVAL & AWARD EXECUTION
// ============================================================================

function triggerAwardApproval() {
  AppState.awardApproved = true;
  const badge = document.getElementById('badgeAwardApproval');
  if (badge) {
    badge.className = 'status-badge approved';
    badge.innerHTML = '&#10003; Approved';
  }

  showSapToast('Governance sign-off approved by Financial Controller', 'success');
}

async function submitAwardRecommendation() {
  const btnAward = document.getElementById('btnAwardScenario');
  if (btnAward) {
    btnAward.disabled = true;
    btnAward.innerHTML = '<span class="scc-dot pulsing"></span> Submitting recommendation to Approver (Carlos Fonseca)...';
  }

  // Find lowest / recommended quote
  const quotes = AppState.quotations || [];
  const recommendedQuote = quotes.find(q => q.supplierId === 'SUP-SONDA') || quotes[0] || {
    supplierId: 'SUP-SONDA',
    supplierName: 'SONDA DE COLOMBIA S A',
    totalBidAmount: 21375000
  };

  try {
    const res = await fetch(`/api/rfqs/${AppState.currentRfqId}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: recommendedQuote.supplierId,
        supplierName: recommendedQuote.supplierName || 'SONDA DE COLOMBIA S A',
        justification: `Lowest compliant proposal of $${(recommendedQuote.totalBidAmount || 21375000).toLocaleString()} COP with 14.3% verified budget savings. Submitted for Stage 3 executive award approval.`
      })
    });

    const data = await res.json();
    if (data.success) {
      if (AppState.rfqData) {
        AppState.rfqData.status = 'PENDING_AWARD_APPROVAL';
        AppState.rfqData.recommendedSupplierId = recommendedQuote.supplierId;
      }

      // Update project status chip
      const chipStatus = document.getElementById('projChipStatus');
      if (chipStatus) chipStatus.textContent = 'PENDING AWARD APPROVAL';

      // Update Stepper
      updateSourcingStepper('PENDING_AWARD_APPROVAL');

      // Update controls
      updateBuyerCockpitStatusControls(AppState.rfqData || data.rfq);

      showSapToast(`✓ Sourcing recommendation for ${recommendedQuote.supplierName || 'SONDA'} submitted to Carlos Alberto Fonseca (Award Approver) for governance sign-off!`, 'success');
      await loadSourcingData();
    } else {
      showSapToast('Recommendation error: ' + (data.error || 'Failed to submit recommendation'), 'error');
      if (btnAward) {
        btnAward.disabled = false;
        btnAward.innerHTML = '<span class="btn-icon">&#128228;</span> Submit Award Recommendation for Approval';
      }
    }
  } catch (err) {
    showSapToast('Network error: ' + err.message, 'error');
    if (btnAward) {
      btnAward.disabled = false;
      btnAward.innerHTML = '<span class="btn-icon">&#128228;</span> Submit Award Recommendation for Approval';
    }
  }
}

async function executeAribaAward() {
  // Gracefully forward legacy calls to the official recommendation workflow
  return submitAwardRecommendation();
}

function closeFollowOnModal() {
  const modal = document.getElementById('modalFollowOnSuccess');
  if (modal) modal.classList.add('hidden');
}

function goToSapErpView() {
  closeFollowOnModal();
  switchMainTab('sap_erp');
}

// ============================================================================
// 7. MANAGED GATEWAY (CIG) & AUDIT LOGS
// ============================================================================

async function loadCigAuditLogs() {
  const tbody = document.getElementById('cigAuditTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) return;
    const logs = await res.json();

    tbody.innerHTML = logs.map(log => {
      const timeStr = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const statusBadge = log.status === 'SUCCESS' 
        ? '<span class="status-badge approved">&#10003; Success (200)</span>' 
        : '<span class="status-badge reviewed">Processed</span>';

      const payloadBtn = log.protocol.includes('cXML') || log.payloadType.includes('cXML')
        ? `<button class="sap-btn sap-btn-ghost sap-btn-sm" onclick="openXmlInspector('${AppState.followOnPoId}', 'cxml')">View cXML</button>`
        : (log.protocol.includes('IDoc') 
          ? `<button class="sap-btn sap-btn-ghost sap-btn-sm" onclick="openXmlInspector('${AppState.followOnPoId}', 'idoc')">View IDoc</button>`
          : `<span class="sub-text">OData v4 JSON</span>`);

      return `
        <tr>
          <td><span class="font-mono">${timeStr}</span></td>
          <td><strong>${escapeHtml(log.protocol)}</strong></td>
          <td><span class="direction-tag ${log.direction === 'INBOUND' ? 'inbound' : 'outbound'}">${log.direction}</span></td>
          <td>${escapeHtml(log.endpoint || '/api/sap')}</td>
          <td><code>${escapeHtml(log.referenceId || '-')}</code></td>
          <td><span class="status-pill status-200">${log.statusCode || 200}</span></td>
          <td>${statusBadge}</td>
          <td>${payloadBtn}</td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load CIG audit logs:', err);
  }
}

async function openXmlInspector(poNumber, format) {
  const modal = document.getElementById('modalXmlInspector');
  const title = document.getElementById('xmlModalTitle');
  const pre = document.getElementById('xmlModalPre');

  const endpoint = format === 'cxml' 
    ? `/api/pos/PO-${poNumber}/cxml` 
    : `/api/pos/PO-${poNumber}/idoc`;

  title.textContent = format === 'cxml' 
    ? `SAP Ariba cXML 1.2.040 OrderRequest Payload [PO-${poNumber}]` 
    : `SAP IDoc ORDERS05 Structure [PO-${poNumber}]`;

  pre.textContent = 'Loading integration payload...';
  modal.classList.remove('hidden');

  try {
    const res = await fetch(endpoint);
    if (!res.ok) {
      pre.textContent = `No payload found for PO-${poNumber}. Please award the tender first.`;
      return;
    }
    const text = await res.text();
    pre.textContent = text;
  } catch (err) {
    pre.textContent = 'Error loading payload: ' + err.message;
  }
}

function closeXmlModal() {
  const modal = document.getElementById('modalXmlInspector');
  if (modal) modal.classList.add('hidden');
}

async function syncSapRequisitions() {
  showSapToast('Connecting to SAP S/4HANA via SAP Cloud Connector...', 'info');
  try {
    const res = await fetch('/api/prs/sync', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      showSapToast(`&#10003; Purchase Requisition ${data.pr.sapDocNumber} synchronized successfully.`, 'success');
      await loadCigAuditLogs();
    }
  } catch (err) {
    showSapToast('Error synchronizing with S/4HANA: ' + err.message, 'error');
  }
}

async function resetToInitialState() {
  try {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      showSapToast('Simulation reset to baseline values.', 'info');
      setTimeout(() => window.location.reload(), 600);
    }
  } catch (err) {
    console.error('Reset error:', err);
  }
}

// ============================================================================
// 8. UTILITIES & TOAST NOTIFICATIONS
// ============================================================================

function showSapToast(message, type = 'info') {
  const stack = document.getElementById('sapToastStack');
  if (!stack) return;

  const toast = document.createElement('div');
  toast.className = `sap-toast ${type}`;
  toast.innerHTML = `
    <span class="toast-body">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  stack.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) toast.remove();
  }, 4500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function recalculateSavings() {
  showSapToast('Comparative Analysis: SONDA\'s proposal delivers 14.3% in budget savings against baseline.', 'success');
}

function openEnvelopeDetails() {
  const rfq = AppState.rfqData;
  if (rfq && rfq.status === 'OPEN_FOR_BIDDING') {
    showSapToast('🔒 Two-Envelope Protocol: Bids remain sealed while bidding is active to ensure zero bias. Envelopes unlock automatically when bidding closes.', 'warning');
    return;
  }
  showSapToast('📂 Commercial Envelope unsealed. Committee evaluation scores and side-by-side quotation comparison are unlocked for Valeria Martinez.', 'success');
}

function exportExcel() {
  showSapToast('Generating evaluation matrix report Doc2432956265.xlsx...', 'info');
}

function showApprovalDetails() {
  showSapToast('Approval Workflow: Alpek Demo Procurement Manager &gt; Finance Director', 'info');
}

function openCreateSourcingModal() {
  showSapToast('Guided RFQ Creation: Importing from Approved Requisition...', 'info');
}

// ============================================================================
// 9. DUMMY SAP EXCEL SHEET CONTROLLER (INBOUND & OUTBOUND SPREADSHEET)
// ============================================================================

function switchExcelSheet(sheet) {
  AppState.activeExcelSheet = sheet;
  const btnPr = document.getElementById('btnTabPrSheet');
  const btnPo = document.getElementById('btnTabPoSheet');
  const badge = document.getElementById('excelActiveBadge');

  if (sheet === 'prs') {
    btnPr.classList.add('active');
    btnPo.classList.remove('active');
    badge.textContent = 'SAP_PR_Inbound.csv';
  } else {
    btnPo.classList.add('active');
    btnPr.classList.remove('active');
    badge.textContent = 'SAP_PO_Outbound.csv';
  }
  loadExcelSheetData();
}

async function loadExcelSheetData() {
  const headEl = document.getElementById('excelSheetHead');
  const bodyEl = document.getElementById('excelSheetBody');
  if (!headEl || !bodyEl) return;

  const endpoint = AppState.activeExcelSheet === 'pos' ? '/api/sap-sheet/pos' : '/api/sap-sheet/prs';
  try {
    const res = await fetch(endpoint);
    const rows = await res.json();

    if (!rows || rows.length === 0) {
      headEl.innerHTML = '<tr><th>No Data</th></tr>';
      bodyEl.innerHTML = '<tr><td style="padding:20px; text-align:center;">Sheet is currently empty.</td></tr>';
      return;
    }

    const headers = Object.keys(rows[0]);
    headEl.innerHTML = `<tr><th class="excel-row-num">#</th>${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>`;

    bodyEl.innerHTML = rows.map((row, idx) => `
      <tr>
        <td class="excel-row-num">${idx + 1}</td>
        ${headers.map(h => {
          let val = row[h];
          if (h.includes('Price') || h.includes('Amount')) {
            val = `$${Number(val).toLocaleString()} COP`;
          }
          return `<td>${escapeHtml(val)}</td>`;
        }).join('')}
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load excel sheet data:', err);
  }
}

function downloadCurrentExcelSheet() {
  const sheet = AppState.activeExcelSheet || 'prs';
  window.open(`/api/sap-sheet/download?sheet=${sheet}`, '_blank');
}

function openAddPrModal() {
  const modal = document.getElementById('modalAddPrToSheet');
  const user = (typeof currentUser !== 'undefined' && currentUser) || (typeof AppState !== 'undefined' && AppState.currentUser);
  if (user) {
    const reqInput = document.getElementById('newPrRequester');
    const deptInput = document.getElementById('newPrDept');
    if (reqInput && user.name) reqInput.value = user.name;
    if (deptInput && user.department) deptInput.value = user.department;
  }
  const descInput = document.getElementById('newPrDesc');
  if (descInput) descInput.value = '';
  modal.classList.remove('hidden');
}

function closeAddPrModal() {
  document.getElementById('modalAddPrToSheet').classList.add('hidden');
}

async function handleAddPrToSheetSubmit(e) {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]') || e.target.querySelector('.btn-primary');
  if (submitBtn) submitBtn.disabled = true;

  const desc = document.getElementById('newPrDesc').value.trim();
  const qty = document.getElementById('newPrQty').value;
  const unit = document.getElementById('newPrUnit').value;
  const price = document.getElementById('newPrPrice').value;
  const plant = document.getElementById('newPrPlant').value;
  const requester = document.getElementById('newPrRequester').value;
  const dept = document.getElementById('newPrDept').value;

  try {
    const res = await fetch('/api/sap-sheet/prs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Material_Desc: desc,
        Quantity: qty,
        Unit: unit,
        Valuation_Unit_Price_COP: price,
        Plant: plant,
        Requester: requester,
        Department: dept
      })
    });
    const data = await res.json();
    if (data.success) {
      closeAddPrModal();
      showSapToast(`✓ Created Requisition & row synced to SAP_PR_Inbound.csv (PR ${data.pr.SAP_PR_Number})`, 'success');
      loadExcelSheetData();
      loadRequesterPrs();
      loadCigAuditLogs();
    } else {
      showSapToast('Error: ' + (data.error || 'Failed to create requisition'), 'error');
    }
  } catch (err) {
    showSapToast('Error creating requisition: ' + err.message, 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function openComparisonModal() {
  document.getElementById('modalComparison').classList.remove('hidden');
}

function closeComparisonModal() {
  document.getElementById('modalComparison').classList.add('hidden');
}

function startQuickTour() {
  showSapToast('Step 1: Observe inbound Purchase Requisition from SAP Excel spreadsheet.', 'info');
  switchMainTab('excel_erp');
  setTimeout(() => {
    showSapToast('Step 2: Review Sourcing RFQ and compare supplier bid proposals.', 'info');
    switchMainTab('sourcing');
    switchInnerTab('tab-awards');
    setTimeout(() => {
      showSapToast('Step 3: Switch to Supplier (SONDA) to simulate submitting competitive tariffs.', 'info');
      switchPersona('supplier');
      setTimeout(() => {
        showSapToast('Step 4: Return to Buyer and click Award to generate Purchase Order in SAP Excel.', 'info');
        switchPersona('buyer');
        switchInnerTab('tab-awards');
      }, 4000);
    }, 4000);
  }, 4000);
}

// ============================================================================
// 10. REQUESTER WORKSPACE FUNCTIONS (Stage 1)
// ============================================================================

async function loadRequesterPrs() {
  const tbody = document.getElementById('requesterPrTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/prs');
    const prs = await res.json();

    let total = prs.length;
    let pending = 0;
    let returned = 0;
    let approved = 0;

    prs.forEach(p => {
      if (p.status === 'PENDING_MANAGER_APPROVAL') pending++;
      if (p.status === 'RETURNED_FOR_CORRECTION') returned++;
      if (p.status === 'APPROVED' || p.status === 'IN_SOURCING' || p.status === 'ORDERED') approved++;
    });

    const kpiTotal = document.getElementById('kpiReqTotalPrs');
    const kpiPending = document.getElementById('kpiReqPendingPrs');
    const kpiReturned = document.getElementById('kpiReqReturnedPrs');
    const kpiApproved = document.getElementById('kpiReqApprovedPrs');
    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiPending) kpiPending.textContent = pending;
    if (kpiReturned) kpiReturned.textContent = returned;
    if (kpiApproved) kpiApproved.textContent = approved;

    // Show alert banner if any PR is returned for correction
    const alertBox = document.getElementById('requesterReturnedAlert');
    const reasonText = document.getElementById('returnedReasonText');
    const returnedPr = prs.find(p => p.status === 'RETURNED_FOR_CORRECTION');
    if (returnedPr && alertBox) {
      AppState.activeReturnedPr = returnedPr;
      alertBox.classList.remove('hidden');
      if (reasonText) reasonText.textContent = `Manager notes on ${returnedPr.id}: "${returnedPr.managerComments || 'Please revise specifications.'}"`;
    } else if (alertBox) {
      AppState.activeReturnedPr = null;
      alertBox.classList.add('hidden');
    }

    if (!prs || prs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">No requisitions found. Click "Create New Purchase Requisition" to begin.</td></tr>';
      return;
    }

    tbody.innerHTML = prs.map(pr => {
      let statusClass = 'pending';
      if (pr.status === 'RETURNED_FOR_CORRECTION') statusClass = 'returned';
      if (pr.status === 'APPROVED') statusClass = 'approved';
      if (pr.status === 'IN_SOURCING') statusClass = 'sourcing';
      if (pr.status === 'ORDERED') statusClass = 'confirmed';

      const isReturned = pr.status === 'RETURNED_FOR_CORRECTION';

      return `
        <tr>
          <td><strong>${escapeHtml(pr.id)}</strong><br><span style="font-size:10px; color:#64748b;">SAP: ${escapeHtml(pr.sapPrNumber || 'N/A')}</span></td>
          <td>
            <strong>${escapeHtml(pr.title)}</strong><br>
            <span style="font-size:11px; color:#475569;">${escapeHtml(pr.purpose || 'Plant operational demand')}</span>
          </td>
          <td>${pr.lineItems && pr.lineItems[0] ? pr.lineItems[0].quantity.toLocaleString() : '1'} ${pr.lineItems && pr.lineItems[0] ? pr.lineItems[0].unit : 'Unit'}</td>
          <td><strong>$${(pr.estimatedBudget || 0).toLocaleString()} ${pr.currency || 'COP'}</strong></td>
          <td>${escapeHtml(pr.plant || pr.plantName || 'OP ANG (GTE Col)')}<br><span style="font-size:10px; color:#64748b;">${escapeHtml(pr.costCenter || 'CC-90412')}</span></td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(pr.status.replace(/_/g, ' '))}</span></td>
          <td style="white-space:nowrap;">
            <button class="sap-btn sap-btn-secondary sap-btn-sm" onclick="openTraceabilityModal('pr', '${pr.id}')">&#128065; Trace Lineage</button>
            ${isReturned ? `<button class="sap-btn sap-btn-primary sap-btn-sm" style="background:#2563eb; margin-left:4px;" onclick="openResubmitPrModal('${pr.id}')">✏️ Revise</button>` : ''}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load requester PRs:', err);
  }
}

// ============================================================================
// 11. DEPARTMENT MANAGER WORKSPACE FUNCTIONS (Stage 2)
// ============================================================================

async function loadManagerQueue() {
  const tbody = document.getElementById('managerPrTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/prs');
    const prs = await res.json();
    const pendingPrs = prs.filter(p => p.status === 'PENDING_MANAGER_APPROVAL');

    const countBadge = document.getElementById('kpiMgrPendingCount');
    if (countBadge) countBadge.textContent = pendingPrs.length;

    if (pendingPrs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#15803d; font-weight:600;">✓ All requisitions have been verified and approved. No pending approval tasks.</td></tr>';
      return;
    }

    tbody.innerHTML = pendingPrs.map(pr => `
      <tr>
        <td><strong>${escapeHtml(pr.id)}</strong></td>
        <td>${escapeHtml(pr.requesterName)}<br><span style="font-size:10px; color:#64748b;">${escapeHtml(pr.department)}</span></td>
        <td>
          <strong>${escapeHtml(pr.title)}</strong><br>
          <span style="font-size:11px; color:#475569;">${escapeHtml(pr.purpose)}</span>
        </td>
        <td>${escapeHtml(pr.costCenter)}</td>
        <td><strong style="color:#0854a0;">$${pr.estimatedBudget.toLocaleString()} ${pr.currency}</strong></td>
        <td>${escapeHtml(pr.requiredDate || '2026-11-30')}</td>
        <td style="text-align:right; white-space:nowrap;">
          <button class="sap-btn sap-btn-primary sap-btn-sm" style="background:#15803d;" onclick="approvePrAsManager('${pr.id}')">&#10003; Approve</button>
          <button class="sap-btn sap-btn-secondary sap-btn-sm" style="color:#b45309;" onclick="openReturnPrModal('${pr.id}')">&#9888; Return</button>
          <button class="sap-btn sap-btn-ghost sap-btn-sm" style="color:#b91c1c;" onclick="rejectPrAsManager('${pr.id}')">&#10007; Reject</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load manager queue:', err);
  }
}

async function approvePrAsManager(prId) {
  try {
    const res = await fetch(`/api/prs/${prId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: 'Approved under Q4 operational budget by David Vance.' })
    });
    const data = await res.json();
    if (data.success) {
      showSapToast(`✓ Requisition ${prId} APPROVED. Sent to Procurement Buyer (Valeria Martinez) for RFQ creation.`, 'success');
      loadManagerQueue();
    }
  } catch (err) {
    showSapToast('Approval error: ' + err.message, 'error');
  }
}

function openReturnPrModal(prId) {
  document.getElementById('returnPrId').value = prId;
  document.getElementById('modalReturnPr').classList.remove('hidden');
}

function closeReturnPrModal() {
  document.getElementById('modalReturnPr').classList.add('hidden');
}

async function submitPrReturnForCorrection() {
  const prId = document.getElementById('returnPrId').value;
  const comments = document.getElementById('returnPrComments').value.trim() || 'Please revise specifications and attach quotation.';

  try {
    const res = await fetch(`/api/prs/${prId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments })
    });
    const data = await res.json();
    if (data.success) {
      closeReturnPrModal();
      showSapToast(`Requisition ${prId} returned to Requester for correction.`, 'info');
      loadManagerQueue();
    }
  } catch (err) {
    showSapToast('Return error: ' + err.message, 'error');
  }
}

async function rejectPrAsManager(prId) {
  if (!confirm(`Are you sure you want to reject requisition ${prId}?`)) return;
  try {
    const res = await fetch(`/api/prs/${prId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Budget limits exceeded or business necessity unverified.' })
    });
    const data = await res.json();
    if (data.success) {
      showSapToast(`Requisition ${prId} rejected.`, 'info');
      loadManagerQueue();
    }
  } catch (err) {
    showSapToast('Reject error: ' + err.message, 'error');
  }
}

// ============================================================================
// 12. RFQ GOVERNANCE APPROVER FUNCTIONS (Stage 4)
// ============================================================================

async function loadRfqApproverQueue() {
  const tbody = document.getElementById('rfqApproverTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/rfqs');
    const rfqs = await res.json();
    const pendingRfqs = rfqs.filter(r => r.status === 'PENDING_APPROVAL');

    if (pendingRfqs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:24px; color:#15803d; font-weight:600;">✓ All RFQs have been approved for publication. No pending governance tasks.</td></tr>';
      return;
    }

    tbody.innerHTML = pendingRfqs.map(rfq => `
      <tr>
        <td><strong>${escapeHtml(rfq.id)}</strong><br><span style="font-size:10px; color:#64748b;">${escapeHtml(rfq.title)}</span></td>
        <td>${escapeHtml(rfq.sourcePrId)}</td>
        <td>${escapeHtml(rfq.buyerName)}</td>
        <td><span style="font-size:11px;">${escapeHtml(rfq.commercialTerms)}</span></td>
        <td><span class="status-pill pending">${rfq.invitedSuppliers.length} Invited Vendors</span></td>
        <td>${escapeHtml(rfq.deadline.split('T')[0])}</td>
        <td><span class="status-pill pending">Pending Approval</span></td>
        <td style="text-align:right;">
          <button class="sap-btn sap-btn-primary sap-btn-sm" style="background:#7c3aed;" onclick="approveAndPublishRfq('${rfq.id}')">
            &#10003; Approve & Publish
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load RFQ Approver queue:', err);
  }
}

async function approveAndPublishRfq(rfqId) {
  try {
    const res = await fetch(`/api/rfqs/${rfqId}/approve-publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success) {
      showSapToast(`✓ RFQ ${rfqId} officially APPROVED & PUBLISHED! Invited suppliers notified.`, 'success');
      loadRfqApproverQueue();
    }
  } catch (err) {
    showSapToast('RFQ Approval error: ' + err.message, 'error');
  }
}

// ============================================================================
// 13. TWO-ENVELOPE EVALUATION COMMITTEE (Stage 6)
// ============================================================================

let techEvalActiveRfqId = null;
let commEvalActiveRfqId = null;

async function switchTechEvalRfq(rfqId) {
  if (!rfqId) return;
  techEvalActiveRfqId = rfqId;
  await loadTechEvalQueue();
}

async function loadTechEvalQueue() {
  const tbody = document.getElementById('techEvalTableBody');
  const selector = document.getElementById('techEvalRfqSelector');
  const infoEl = document.getElementById('techEvalPrDemandInfo');
  if (!tbody) return;

  try {
    const rfqsRes = await fetch('/api/rfqs');
    if (!rfqsRes.ok) return;
    const rfqs = await rfqsRes.json();

    if (selector && rfqs.length > 0) {
      if (!techEvalActiveRfqId || !rfqs.some(r => r.id === techEvalActiveRfqId)) {
        techEvalActiveRfqId = AppState.currentRfqId || rfqs[0].id;
      }
      selector.innerHTML = rfqs.map(r => `
        <option value="${escapeHtml(r.id)}" ${r.id === techEvalActiveRfqId ? 'selected' : ''}>
          ${escapeHtml(r.id)} - ${escapeHtml(r.title)} (${escapeHtml(r.status.replace(/_/g, ' '))})
        </option>
      `).join('');
    }

    const targetRfqId = techEvalActiveRfqId || 'Doc2432956265';

    // Fetch active RFQ details to show PR Demand info
    const rfqRes = await fetch(`/api/rfqs/${targetRfqId}`);
    if (rfqRes.ok) {
      const rfqPayload = await rfqRes.json();
      const r = rfqPayload.rfq;
      const item = (r.lineItems && r.lineItems[0]) || { description: r.title, quantity: 1, unit: 'Unit' };
      if (infoEl) {
        infoEl.innerHTML = `
          <span><strong>Source PR:</strong> ${escapeHtml(r.sapPrNumber || r.sourcePrId || '-')}</span>
          <span style="margin-left:12px;"><strong>Material:</strong> ${escapeHtml(item.description)} (${Number(item.quantity).toLocaleString()} ${escapeHtml(item.unit)})</span>
          <span style="margin-left:12px;"><strong>Plant:</strong> ${escapeHtml(r.plantName || r.plant || 'Plant')}</span>
        `;
      }
    }

    // Fetch quotations for active RFQ
    const res = await fetch(`/api/rfqs/${targetRfqId}/quotations`);
    const quotes = await res.json();

    if (!Array.isArray(quotes) || quotes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding:24px; color:#64748b;">
            ⏳ No supplier quotations submitted for tender <strong>${escapeHtml(targetRfqId)}</strong> yet. Awaiting supplier bid submission.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = quotes.map((q, idx) => `
      <tr>
        <td><strong>${escapeHtml(q.supplierName || q.supplierId)}</strong></td>
        <td><code>${escapeHtml(q.supplierId)}</code></td>
        <td><span style="color:#15803d; font-weight:700;">✓ ISO 9001:2015 Verified</span></td>
        <td>${escapeHtml(String(q.leadTimeDays || 8))} Business Days</td>
        <td><span style="font-size:11px; color:#334155;">${escapeHtml(q.technicalProposal || 'Compliant with plant technical specifications & ISO safety norms.')}</span></td>
        <td>
          <input type="number" id="techScore_${q.supplierId}" class="sap-field-input" min="0" max="100" value="${q.technicalScore !== undefined && q.technicalScore !== null ? q.technicalScore : ''}" placeholder="Enter score" style="width:70px; text-align:center;">
        </td>
        <td>
          <label style="font-size:12px; font-weight:600; color:#15803d; cursor:pointer;">
            <input type="checkbox" checked id="techPass_${q.supplierId}"> Compliant
          </label>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error('Failed to load technical evaluation queue:', err);
  }
}

async function submitTechnicalEvaluation() {
  const targetRfqId = techEvalActiveRfqId || AppState.currentRfqId || 'Doc2432956265';
  const inputs = document.querySelectorAll('[id^="techScore_"]');
  if (inputs.length === 0) {
    showSapToast('No supplier quotations available to evaluate.', 'warning');
    return;
  }

  const scores = {};
  inputs.forEach(input => {
    const supId = input.id.replace('techScore_', '');
    const scoreVal = input.value === "" ? NaN : Number(input.value); if (isNaN(scoreVal)) { showSapToast("Please enter a technical score for all evaluated suppliers.", "warning"); return; }
    const passCheck = document.getElementById(`techPass_${supId}`);
    const passed = passCheck ? passCheck.checked : true;
    scores[supId] = {
      score: scoreVal,
      passed,
      comments: `Technical Evaluation Score: ${scoreVal}/100. Specifications & ISO compliance verified.`
    };
  });

  try {
    const res = await fetch(`/api/rfqs/${targetRfqId}/evaluate/technical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores })
    });
    const data = await res.json();
    if (data.success) {
      showSapToast(`✓ Technical Evaluation Envelope submitted and sealed for ${targetRfqId} by Dr. Victor Chen.`, 'success');
      await loadTechEvalQueue();
    } else {
      showSapToast('Evaluation error: ' + (data.error || 'Failed'), 'error');
    }
  } catch (err) {
    showSapToast('Evaluation error: ' + err.message, 'error');
  }
}

async function switchCommEvalRfq(rfqId) {
  if (!rfqId) return;
  commEvalActiveRfqId = rfqId;
  await loadCommEvalQueue();
}

async function loadCommEvalQueue() {
  const tbody = document.getElementById('commEvalTableBody');
  const selector = document.getElementById('commEvalRfqSelector');
  const infoEl = document.getElementById('commEvalPrDemandInfo');
  const baselineCallout = document.getElementById('commEvalBaselineCallout');
  if (!tbody) return;

  try {
    const rfqsRes = await fetch('/api/rfqs');
    if (!rfqsRes.ok) return;
    const rfqs = await rfqsRes.json();

    if (selector && rfqs.length > 0) {
      if (!commEvalActiveRfqId || !rfqs.some(r => r.id === commEvalActiveRfqId)) {
        commEvalActiveRfqId = AppState.currentRfqId || rfqs[0].id;
      }
      selector.innerHTML = rfqs.map(r => `
        <option value="${escapeHtml(r.id)}" ${r.id === commEvalActiveRfqId ? 'selected' : ''}>
          ${escapeHtml(r.id)} - ${escapeHtml(r.title)} (${escapeHtml(r.status.replace(/_/g, ' '))})
        </option>
      `).join('');
    }

    const targetRfqId = commEvalActiveRfqId || 'Doc2432956265';

    // Fetch RFQ details for baseline calculations
    let baselineTotal = 10000;
    let targetUnitPrice = 10.0;
    let rfqCurrency = 'COP';

    const rfqRes = await fetch(`/api/rfqs/${targetRfqId}`);
    if (rfqRes.ok) {
      const rfqPayload = await rfqRes.json();
      const r = rfqPayload.rfq;
      rfqCurrency = r.currency || 'COP';
      const item = (r.lineItems && r.lineItems[0]) || { description: r.title, quantity: 1000, targetPrice: 10, estimatedTotal: 10000 };
      const qty = Number(item.quantity) || 1;
      targetUnitPrice = Number(item.targetPrice) || 10.0;
      baselineTotal = Number(item.estimatedTotal) || (qty * targetUnitPrice);

      if (infoEl) {
        infoEl.innerHTML = `
          <span><strong>Source PR:</strong> ${escapeHtml(r.sapPrNumber || r.sourcePrId || '-')}</span>
          <span style="margin-left:12px;"><strong>Material:</strong> ${escapeHtml(item.description)} (${qty.toLocaleString()} ${escapeHtml(item.unit || 'Unit')})</span>
        `;
      }
      if (baselineCallout) {
        baselineCallout.innerHTML = `
          <strong>Target Budget Baseline:</strong> $${targetUnitPrice.toFixed(2)} ${rfqCurrency}/unit ($${baselineTotal.toLocaleString()} ${rfqCurrency} total). Commercial evaluators score prices based on verified savings and payment terms.
        `;
      }
    }

    const res = await fetch(`/api/rfqs/${targetRfqId}/quotations`);
    const quotes = await res.json();

    if (!Array.isArray(quotes) || quotes.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center" style="padding:24px; color:#64748b;">
            ⏳ No supplier quotations submitted for tender <strong>${escapeHtml(targetRfqId)}</strong> yet. Awaiting supplier bid submission.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = quotes.map((q, idx) => {
      const bid = (q.lineItemBids && q.lineItemBids[0]) || null;
      const unitPrice = bid ? Number(bid.unitPrice) : (typeof q.totalBidAmount === 'number' ? q.totalBidAmount : targetUnitPrice);
      const total = typeof q.totalBidAmount === 'number' ? q.totalBidAmount : (unitPrice * (Number(q.quantity) || 1));
      const savingsPct = baselineTotal > 0 ? (((baselineTotal - total) / baselineTotal) * 100).toFixed(1) : 0;
      const defaultScore = idx === 0 ? 95 : 88;

      return `
        <tr>
          <td><strong>${escapeHtml(q.supplierName || q.supplierId)}</strong></td>
          <td><strong style="color:#0854a0;">$${unitPrice.toFixed(2)} ${rfqCurrency}</strong></td>
          <td><strong>$${total.toLocaleString()} ${rfqCurrency}</strong></td>
          <td>${escapeHtml(q.paymentTerms || 'Net 60 Days')}</td>
          <td>
            ${savingsPct > 0 
              ? `<span style="color:#15803d; font-weight:700;">${savingsPct}% Below Baseline</span>` 
              : `<span style="color:#64748b;">At Target Budget</span>`}
          </td>
          <td>
            <input type="number" id="commScore_${q.supplierId}" class="sap-field-input" min="0" max="100" value="${q.commercialScore !== undefined && q.commercialScore !== null ? q.commercialScore : ''}" placeholder="Enter score" style="width:70px; text-align:center;">
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load commercial evaluation queue:', err);
  }
}

async function submitCommercialEvaluation() {
  const targetRfqId = commEvalActiveRfqId || AppState.currentRfqId || 'Doc2432956265';
  const inputs = document.querySelectorAll('[id^="commScore_"]');
  if (inputs.length === 0) {
    showSapToast('No supplier quotations available to evaluate.', 'warning');
    return;
  }

  const scores = {};
  inputs.forEach(input => {
    const supId = input.id.replace('commScore_', '');
    const scoreVal = input.value === "" ? NaN : Number(input.value); if (isNaN(scoreVal)) { showSapToast("Please enter a commercial score for all evaluated suppliers.", "warning"); return; }
    scores[supId] = {
      score: scoreVal,
      comments: `Commercial tariff & savings evaluation score: ${scoreVal}/100.`
    };
  });

  try {
    const res = await fetch(`/api/rfqs/${targetRfqId}/evaluate/commercial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scores })
    });
    const data = await res.json();
    if (data.success) {
      showSapToast(`✓ Commercial Price Evaluation submitted for ${targetRfqId} by Sofia Morales. Sent to Award Approver.`, 'success');
      await loadCommEvalQueue();
    } else {
      showSapToast('Evaluation error: ' + (data.error || 'Failed'), 'error');
    }
  } catch (err) {
    showSapToast('Evaluation error: ' + err.message, 'error');
  }
}

// ============================================================================
// 14. RECEIVING TEAM / WAREHOUSE FUNCTIONS (Stage 10)
// ============================================================================

async function loadReceivingQueue() {
  const tbody = document.getElementById('receivingPoTableBody');
  const grnTbody = document.getElementById('grnArchiveTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/pos');
    const pos = await res.json();

    tbody.innerHTML = pos.map(p => {
      const item = p.lineItems[0] || { description: 'SUMINISTROS REFRI', orderedQuantity: 7125000, receivedQuantity: 0, remainingQuantity: 7125000 };
      let statusClass = 'pending';
      if (p.status === 'FULLY_DELIVERED') statusClass = 'delivered';
      if (p.status === 'PARTIALLY_DELIVERED') statusClass = 'partial';
      if (p.status === 'SHIPPED_BY_SUPPLIER') statusClass = 'shipped';

      return `
        <tr>
          <td><strong>${escapeHtml(p.id)}</strong></td>
          <td><code>${escapeHtml(p.sapPoNumber)}</code></td>
          <td>${escapeHtml(p.supplierName)}</td>
          <td>${escapeHtml(item.description)}</td>
          <td>${item.orderedQuantity.toLocaleString()}</td>
          <td><strong style="color:#15803d;">${item.receivedQuantity.toLocaleString()}</strong></td>
          <td><strong style="color:#c0392b;">${item.remainingQuantity.toLocaleString()}</strong></td>
          <td><span class="status-pill ${statusClass}">${escapeHtml(p.status.replace(/_/g, ' '))}</span></td>
          <td style="text-align:right;">
            <button class="sap-btn sap-btn-primary sap-btn-sm" onclick="openRecordGrnModal('${p.id}')">&#128221; Log Receipt (GRN)</button>
          </td>
        </tr>
      `;
    }).join('');

    // Populate GRN Archive
    if (grnTbody) {
      let grnRows = '';
      pos.forEach(p => {
        if (p.goodsReceipts && p.goodsReceipts.length > 0) {
          p.goodsReceipts.forEach(g => {
            grnRows += `
              <tr>
                <td><strong>${escapeHtml(g.id)}</strong></td>
                <td>${escapeHtml(g.receivedDate.split('T')[0])}</td>
                <td>${escapeHtml(g.receivedBy)}</td>
                <td><strong>${escapeHtml(g.deliveryNoteNo)}</strong></td>
                <td>${escapeHtml(g.carrier)}</td>
                <td><strong style="color:#15803d;">${g.receivedQuantity.toLocaleString()} Units</strong></td>
                <td><span style="color:#15803d; font-weight:700;">✓ Inspected & Passed</span></td>
                <td><span style="font-size:11px;">${escapeHtml(g.discrepancyNotes || 'None')}</span></td>
              </tr>
            `;
          });
        }
      });
      grnTbody.innerHTML = grnRows || '<tr><td colspan="8" style="text-align:center; padding:16px;">No Goods Receipts logged yet.</td></tr>';
    }
  } catch (err) {
    console.error('Failed to load receiving queue:', err);
  }
}

function openRecordGrnModal(poId) {
  if (poId) {
    document.getElementById('grnPoId').value = poId;
    document.getElementById('grnPoDisplay').value = poId;
  }
  document.getElementById('modalRecordGrn').classList.remove('hidden');
}

function closeRecordGrnModal() {
  document.getElementById('modalRecordGrn').classList.add('hidden');
}

async function submitGoodsReceipt(e) {
  e.preventDefault();
  const poId = document.getElementById('grnPoId').value || 'PO-450009180';
  const qty = document.getElementById('grnReceivedQty').value;
  const remision = document.getElementById('grnDeliveryNote').value;
  const carrier = document.getElementById('grnCarrier').value;
  const notes = document.getElementById('grnDiscrepancyNotes').value;

  try {
    const res = await fetch(`/api/pos/${poId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receivedQuantity: Number(qty),
        deliveryNoteNo: remision,
        carrier,
        discrepancyNotes: notes,
        inspectionPassed: true
      })
    });
    const data = await res.json();
    if (data.success) {
      closeRecordGrnModal();
      showSapToast(`✓ Goods Receipt (GRN) successfully recorded for ${poId}! Inspection passed.`, 'success');
      loadReceivingQueue();
    }
  } catch (err) {
    showSapToast('Receipt logging error: ' + err.message, 'error');
  }
}

// ============================================================================
// 15. ORDER RECONCILIATION & CLOSURE FUNCTIONS (Stage 11)
// ============================================================================

async function loadClosureQueue() {
  const tbody = document.getElementById('closurePoTableBody');
  if (!tbody) return;

  try {
    const res = await fetch('/api/pos');
    const pos = await res.json();

    tbody.innerHTML = pos.map(p => {
      const item = p.lineItems[0] || { orderedQuantity: 7125000, receivedQuantity: 7125000 };
      const isReconciled = item.receivedQuantity >= item.orderedQuantity;

      return `
        <tr>
          <td><strong>${escapeHtml(p.id)}</strong></td>
          <td><code>${escapeHtml(p.sapPoNumber)}</code></td>
          <td>${escapeHtml(p.supplierName)}</td>
          <td>$${p.totalAmount.toLocaleString()} ${p.currency}</td>
          <td>${item.receivedQuantity.toLocaleString()} / ${item.orderedQuantity.toLocaleString()}</td>
          <td>
            <span class="status-pill ${isReconciled ? 'delivered' : 'partial'}">
              ${isReconciled ? '100% Reconciled' : 'Pending Delivery'}
            </span>
          </td>
          <td style="text-align:right;">
            <button class="sap-btn sap-btn-primary sap-btn-sm" style="background:#334155;" onclick="closePurchaseOrder('${p.id}')">
              &#128274; Formal Close Order
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Failed to load closure queue:', err);
  }
}

async function closePurchaseOrder(poId) {
  try {
    const res = await fetch(`/api/pos/${poId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reconciliationNotes: 'All ordered quantities verified, invoiced and delivered in full.' })
    });
    const data = await res.json();
    if (data.success) {
      showSapToast(`✓ Purchase Order ${poId} formally closed and archived. Procure-to-pay lifecycle complete!`, 'success');
      loadClosureQueue();
    }
  } catch (err) {
    showSapToast('Closure error: ' + err.message, 'error');
  }
}

// ============================================================================
// 16. END-TO-END AUDIT TRACEABILITY DRAWER
// ============================================================================

async function openTraceabilityModal(type, id) {
  const container = document.getElementById('traceabilityTimelineContainer');
  document.getElementById('modalTraceability').classList.remove('hidden');
  if (container) container.innerHTML = '<p style="text-align:center; padding:20px;">Tracing end-to-end lineage across all 11 stages...</p>';

  try {
    const res = await fetch(`/api/traceability/${type}/${id}`);
    const data = await res.json();
    renderTraceability(data);
  } catch (err) {
    if (container) container.innerHTML = `<p style="color:#c0392b; padding:20px;">Error loading traceability: ${err.message}</p>`;
  }
}

function closeTraceabilityModal() {
  document.getElementById('modalTraceability').classList.add('hidden');
}

function renderTraceability(data) {
  const container = document.getElementById('traceabilityTimelineContainer');
  if (!container || !data.lineage) return;

  const pr = data.lineage.pr;
  const rfq = data.lineage.rfq;
  const quotes = data.lineage.quotations || [];
  const award = data.lineage.award;
  const po = data.lineage.po;
  const sap = data.lineage.sapIntegration;
  const grns = data.lineage.goodsReceipts || [];

  container.innerHTML = `
    <!-- Stage 1: Purchase Requisition -->
    <div class="trace-item">
      <div class="trace-dot completed">1</div>
      <div class="trace-content">
        <div class="trace-title-row">
          <span class="trace-stage-title">Stage 1: Purchase Requisition (${pr ? pr.id : 'PR-3000010443'})</span>
          <span class="trace-time">Carlos Ramirez (Employee)</span>
        </div>
        <p style="font-size:12px; margin:0; color:#334155;">
          <strong>Title:</strong> ${pr ? escapeHtml(pr.title) : 'SUMINISTROS REFRI'}<br>
          <strong>Plant:</strong> ${pr ? escapeHtml(pr.plant) : 'OP ANG (GTE Col)'} &bull; <strong>Budget:</strong> $${pr ? pr.estimatedBudget.toLocaleString() : '24,937,500'} COP
        </p>
      </div>
    </div>

    <!-- Stage 2: Manager Review -->
    <div class="trace-item">
      <div class="trace-dot completed">2</div>
      <div class="trace-content">
        <div class="trace-title-row">
          <span class="trace-stage-title">Stage 2: Department Manager Budget Approval</span>
          <span class="trace-time">David Vance (Finance)</span>
        </div>
        <p style="font-size:12px; margin:0; color:#334155;">
          Status: <span class="status-pill approved">Approved</span> &bull; Verified against plant operating cost center budget.
        </p>
      </div>
    </div>

    <!-- Stage 3 & 4: RFQ Sourcing & Governance -->
    <div class="trace-item">
      <div class="trace-dot completed">3</div>
      <div class="trace-content">
        <div class="trace-title-row">
          <span class="trace-stage-title">Stage 3 & 4: Sourcing RFP (${rfq ? rfq.id : 'Doc2432956265'})</span>
          <span class="trace-time">Valeria Martinez (Buyer) & Elena Gomez (Approver)</span>
        </div>
        <p style="font-size:12px; margin:0; color:#334155;">
          <strong>Terms:</strong> Net 60 Days, DDP Vereda Morrison &bull; <strong>Invited:</strong> SONDA, Indorama, BASF (Confidential Sealed Bidding).
        </p>
      </div>
    </div>

    <!-- Stage 5 & 6: Supplier Quotations & Evaluation -->
    <div class="trace-item">
      <div class="trace-dot completed">5</div>
      <div class="trace-content">
        <div class="trace-title-row">
          <span class="trace-stage-title">Stage 5 & 6: Confidential Quotations & Two-Envelope Evaluation</span>
          <span class="trace-time">Dr. Victor Chen & Sofia Morales</span>
        </div>
        <p style="font-size:12px; margin:0; color:#334155;">
          ${quotes.length > 0 ? quotes.map(q => `&bull; <strong>${escapeHtml(q.supplierName)}</strong>: $${q.totalBidAmount.toLocaleString()} COP (Score: ${q.score}/100)`).join('<br>') : '&bull; SONDA DE COLOMBIA S A: $21.375.000 COP ($3,00 COP/unit)'}
        </p>
      </div>
    </div>

    <!-- Stage 7: Award Approval -->
    <div class="trace-item">
      <div class="trace-dot completed">7</div>
      <div class="trace-content">
        <div class="trace-title-row">
          <span class="trace-stage-title">Stage 7: Award Decision & Governance Sign-Off</span>
          <span class="trace-time">Carlos Alberto Fonseca</span>
        </div>
        <p style="font-size:12px; margin:0; color:#334155;">
          <strong>Winner:</strong> SONDA DE COLOMBIA S A &bull; <strong>Verified Savings:</strong> $3.562.500 COP (14.3% Below Baseline Budget).
        </p>
      </div>
    </div>

    <!-- Stage 8 & 9: Purchase Order & SAP Confirmation -->
    <div class="trace-item">
      <div class="trace-dot completed">8</div>
      <div class="trace-content">
        <div class="trace-title-row">
          <span class="trace-stage-title">Stage 8 & 9: Confirmed SAP Purchase Order (${po ? po.id : 'PO-450009180'})</span>
          <span class="trace-time">SAP S/4HANA ERP & Outbound Excel</span>
        </div>
        <p style="font-size:12px; margin:0; color:#334155;">
          <strong>SAP Doc Number:</strong> <code>${po ? po.sapPoNumber : '450009180'}</code> &bull; <strong>Status:</strong> <span class="status-pill confirmed">POSTED_CONFIRMED</span><br>
          Committed via cXML 1.2.040 and written to <code>SAP_PO_Outbound.csv</code> database.
        </p>
      </div>
    </div>

    <!-- Stage 10: Inward Goods Receipt -->
    <div class="trace-item">
      <div class="trace-dot active">10</div>
      <div class="trace-content">
        <div class="trace-title-row">
          <span class="trace-stage-title">Stage 10: Physical Delivery & Goods Receipt (GRN)</span>
          <span class="trace-time">Mateo Morales (Receiving Team)</span>
        </div>
        <p style="font-size:12px; margin:0; color:#334155;">
          Carrier: Trans-Caribe Logistics (REM-89214) &bull; Received: 7.125.000 Units (100% In Full). Quality inspection verified.
        </p>
      </div>
    </div>
  `;
}

// ============================================================================
// 18. APPROVER WORKSPACE FUNCTIONS (SINGLE BOUNDARY PUSH TO SAP)
// ============================================================================

let approverSelectedSupplierId = 'SUP-SONDA';

async function loadApproverReviewData(rfqId) {
  const targetId = rfqId || AppState.currentRfqId || 'Doc2432956265';
  AppState.currentRfqId = targetId;

  // 1. Populate dropdown of available tenders
  const selector = document.getElementById('approverRfqSelector');
  try {
    const rfqsRes = await fetch('/api/rfqs');
    if (rfqsRes.ok) {
      const rfqs = await rfqsRes.json();
      if (selector) {
        selector.innerHTML = rfqs.map(r => `
          <option value="${escapeHtml(r.id)}" ${r.id === targetId ? 'selected' : ''}>
            ${escapeHtml(r.id)} - ${escapeHtml(r.title)} (${escapeHtml(r.status.replace(/_/g, ' '))})
          </option>
        `).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load RFQs for approver:', err);
  }

  // 2. Fetch tender details and quotations
  try {
    const res = await fetch(`/api/rfqs/${targetId}`);
    if (!res.ok) return;
    const data = await res.json();
    const rfq = data.rfq;
    const quotations = data.quotations || [];

    // Header and product details
    const item = (rfq.lineItems && rfq.lineItems[0]) || { description: rfq.title, quantity: 7125000, unit: 'Unit', targetPrice: 3.50, estimatedTotal: 24937500.00 };
    const quantity = Number(item.quantity) || 1;
    const targetPrice = Number(item.targetPrice) || 3.50;
    const baselineTotal = Number(item.estimatedTotal) || (quantity * targetPrice);
    const currency = rfq.currency || 'COP';

    const titleEl = document.getElementById('apprEventTitle');
    const prEl = document.getElementById('apprMetaPr');
    const matEl = document.getElementById('apprMetaMaterial');
    const plantEl = document.getElementById('apprMetaPlant');
    const budgetEl = document.getElementById('apprMetaBudget');

    if (titleEl) titleEl.textContent = `${rfq.id} — ${rfq.title}`;
    if (prEl) prEl.textContent = rfq.sourcePrId || rfq.sapPrNumber ? `${rfq.sourcePrId || ('PR-' + rfq.sapPrNumber)} (SAP: ${rfq.sapPrNumber || 'ME51N'})` : 'PR-3000010443';
    if (matEl) matEl.textContent = `${item.description} (${quantity.toLocaleString()} ${item.unit || 'Unit'})`;
    if (plantEl) plantEl.textContent = `${rfq.plantName || rfq.plant || 'OP ANG (GTE Col)'}`;
    if (budgetEl) budgetEl.textContent = `$${baselineTotal.toLocaleString()} ${currency} ($${targetPrice.toFixed(2)}/unit)`;

    // Sort quotations by lowest total bid amount
    const sortedQuotes = [...quotations].sort((a, b) => {
      const aTotal = typeof a.totalBidAmount === 'number' ? a.totalBidAmount : 999999999;
      const bTotal = typeof b.totalBidAmount === 'number' ? b.totalBidAmount : 999999999;
      return aTotal - bTotal;
    });

    const tbody = document.getElementById('approverSupplierTableBody');
    if (tbody) {
      if (sortedQuotes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#64748b;">No supplier quotations submitted for tender <strong>${escapeHtml(targetId)}</strong> yet. Awaiting bid submissions.</td></tr>`;
      } else {
        if (!approverSelectedSupplierId && sortedQuotes[0]) {
          approverSelectedSupplierId = sortedQuotes[0].supplierId;
        }

        tbody.innerHTML = sortedQuotes.map((q, idx) => {
          const isWinner = idx === 0;
          const unitPrice = q.lineItemBids && q.lineItemBids[0] ? Number(q.lineItemBids[0].unitPrice) : (q.totalBidAmount / quantity);
          const totalAmount = Number(q.totalBidAmount);
          const savingsAmount = baselineTotal - totalAmount;
          const savingsPct = baselineTotal > 0 ? ((savingsAmount / baselineTotal) * 100).toFixed(1) : 0;
          const techScore = q.technicalScore !== undefined && q.technicalScore !== null ? q.technicalScore : null;
          const commScore = q.commercialScore !== undefined && q.commercialScore !== null ? q.commercialScore : null;
          const overallScore = (techScore !== null && commScore !== null) ? (((techScore * 0.4) + (commScore * 0.6)).toFixed(1)) : (q.score || 'Pending');

          const rankBadges = [
            '<span style="background:#fef08a; color:#854d0e; font-weight:800; padding:4px 10px; border-radius:12px; font-size:11px; border:1px solid #facc15; display:inline-block;">🥇 Rank 1 (Winner)</span>',
            '<span style="background:#f1f5f9; color:#475569; font-weight:700; padding:4px 10px; border-radius:12px; font-size:11px; border:1px solid #cbd5e1; display:inline-block;">🥈 Rank 2</span>',
            '<span style="background:#f1f5f9; color:#475569; font-weight:700; padding:4px 10px; border-radius:12px; font-size:11px; border:1px solid #cbd5e1; display:inline-block;">🥉 Rank 3</span>'
          ];
          const rankBadge = rankBadges[idx] || `<span style="font-size:11px; color:#64748b;">Rank ${idx + 1}</span>`;

          return `
            <tr style="${isWinner ? 'background:#f0fdf4; border-left:4px solid #16a34a;' : ''}">
              <td style="vertical-align:middle; text-align:center;">
                ${rankBadge}
              </td>
              <td style="vertical-align:middle;">
                <strong style="color:#0f172a; font-size:13px;">${escapeHtml(q.supplierName || q.supplierId)}</strong>
                <div style="font-size:11px; color:#64748b; font-family:monospace;">ID: ${escapeHtml(q.supplierId)}</div>
              </td>
              <td style="vertical-align:middle;">
                <div style="color:#15803d; font-weight:700; font-size:11px;">✓ ISO 9001:2015 Verified</div>
                <div style="font-size:11px; color:#475569;">Lead Time: <strong>${escapeHtml(String(q.leadTimeDays || 8))} Business Days</strong></div>
              </td>
              <td style="vertical-align:middle; font-weight:800; color:#0854a0; font-size:13px;">
                $${unitPrice.toFixed(2)} ${currency}
              </td>
              <td style="vertical-align:middle;">
                <strong style="font-size:14px; color:${isWinner ? '#15803d' : '#0f172a'};">$${totalAmount.toLocaleString()} ${currency}</strong>
                <div style="font-size:10px; color:#64748b;">${escapeHtml(q.paymentTerms || 'Net 60 Days')}</div>
              </td>
              <td style="vertical-align:middle;">
                ${savingsAmount > 0 
                  ? `<span style="background:#dcfce7; color:#15803d; font-weight:800; font-size:11px; padding:4px 8px; border-radius:12px; display:inline-block;">
                      $${savingsAmount.toLocaleString()} COP (${savingsPct}% below target)
                    </span>`
                  : `<span style="color:#64748b; font-size:11px;">At Baseline Budget</span>`
                }
              </td>
              <td style="vertical-align:middle;">
                <div style="font-weight:800; font-size:13px; color:#6b21a8;">${overallScore} / 100</div>
                <div style="font-size:10px; color:#64748b;">Tech: ${techScore !== null ? techScore : '--'} | Comm: ${commScore !== null ? commScore : '--'}</div>
              </td>
              <td style="vertical-align:middle; text-align:center;">
                ${isWinner 
                  ? `<span class="status-pill confirmed" style="font-size:11px; padding:4px 10px; font-weight:700; background:#dcfce7; color:#15803d; border:1px solid #86efac;">🏆 Proposed Awardee</span>`
                  : `<span class="status-pill" style="font-size:11px; color:#64748b; background:#f1f5f9;">Compliant Bid</span>`
                }
              </td>
            </tr>
          `;
        }).join('');

        // Update Decision Banner with Winner Details
        const winner = sortedQuotes[0];
        const winnerSavings = baselineTotal - winner.totalBidAmount;
        const winnerSavingsPct = baselineTotal > 0 ? ((winnerSavings / baselineTotal) * 100).toFixed(1) : 0;
        
        const decWinner = document.getElementById('apprDecWinner');
        const decAmount = document.getElementById('apprDecAmount');
        const decSavings = document.getElementById('apprDecSavings');
        const decProduct = document.getElementById('apprDecProduct');

        if (decWinner) decWinner.textContent = winner.supplierName || winner.supplierId;
        if (decAmount) decAmount.textContent = `$${Number(winner.totalBidAmount).toLocaleString()} ${currency}`;
        if (decSavings) decSavings.textContent = `$${winnerSavings.toLocaleString()} ${currency} (${winnerSavingsPct}%)`;
        if (decProduct) decProduct.textContent = `${item.description} (${quantity.toLocaleString()} ${item.unit || 'Unit'})`;
      }
    }
  } catch (err) {
    console.error('Failed to load approver review data:', err);
  }
}

async function executeApproverFinalPoCommit() {
  const btn = document.getElementById('btnApproverDispatchPo');
  btn.disabled = true;
  btn.innerHTML = '<span class="scc-dot pulsing"></span> Transmitting confirmed Purchase Order to SAP ERP...';

  try {
    // Step 1: Approve award (Internal Approval Process → Award Trigger)
    const approveRes = await fetch(`/api/rfqs/${AppState.currentRfqId}/award/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const approveData = await approveRes.json();

    // Step 2: Generate Purchase Order
    const poRes = await fetch(`/api/rfqs/${AppState.currentRfqId}/generate-po`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const poData = await poRes.json();

    if (poData.success) {
      const poNum = poData.purchaseOrder.sapPoNumber;

      // Step 3: Send to SAP (Award Data Integration → External System Post-Processing)
      await fetch(`/api/pos/${poData.purchaseOrder.id}/send-to-sap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      // Update Pipeline Tracker chip 7 & 9
      const step7 = document.getElementById('pstep7');
      const step9 = document.getElementById('pstep9');
      if (step7) step7.className = 'pipe-step-chip done';
      if (step9) step9.className = 'pipe-step-chip active';

      // Update Approver card
      const badge = document.getElementById('approverPendingBadge');
      if (badge) {
        badge.className = 'status-badge approved';
        badge.textContent = '✓ Award Trigger Sent — PO Transmitted to SAP';
      }
      btn.innerHTML = '&#9989; Award Approved & Transmitted to SAP S/4HANA (Committed)';
      btn.style.background = '#15803d';

      // Update the Award Trigger status display
      const triggerStatus = document.getElementById('awardTriggerStatus');
      if (triggerStatus) {
        triggerStatus.innerHTML = `
          <div style="background:#dcfce7; border:1px solid #86efac; border-radius:8px; padding:14px; margin-top:12px;">
            <div style="font-weight:700; color:#15803d; font-size:14px;">&#9989; AWARD TRIGGER ACTIVATED</div>
            <div style="font-size:12px; color:#166534; margin-top:4px;">
              Winning supplier notified &bull; Award Data Integration payload sent &bull; PO-${poNum} created in External System
            </div>
          </div>
        `;
      }

      // Open Success Follow-on Modal
      const modal = document.getElementById('modalFollowOnSuccess');
      const modalDoc = document.getElementById('modalFollowOnDocNumber');
      if (modalDoc) modalDoc.textContent = `PO ${poNum}`;
      if (modal) modal.classList.remove('hidden');

      showSapToast(`✓ Internal Approval → Award Trigger → PO ${poNum} committed in SAP S/4HANA!`, 'success');
      loadExcelSheetData();
      loadCigAuditLogs();
    } else {
      showSapToast('Approval failed: ' + (poData.error || approveData.error), 'error');
      btn.disabled = false;
      btn.innerHTML = '&#9989; Approve Award & Transmit Final PO to SAP ERP';
    }
  } catch (err) {
    showSapToast('Transmission error: ' + err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '&#9989; Approve Award & Transmit Final PO to SAP ERP';
  }
}

// ============================================================================
// 19. DIAGRAM: CONFIGURE TECHNICAL REQUIREMENTS (Buyer Cockpit)
// ============================================================================

function openConfigureTechnicalModal(rfqId) {
  const modal = document.getElementById('modalConfigureTechnical');
  if (!modal) return;
  const rfqIdField = document.getElementById('techReqRfqId');
  if (rfqIdField) rfqIdField.value = rfqId || AppState.currentRfqId;

  // Pre-fill with existing data if available
  const rfq = AppState.rfqData;
  if (rfq && rfq.technicalRequirements) {
    const specField = document.getElementById('techReqSpecifications');
    const certField = document.getElementById('techReqCertifications');
    const criteriaField = document.getElementById('techReqCriteria');
    if (specField) specField.value = rfq.technicalRequirements.specifications || '';
    if (certField) certField.value = (rfq.technicalRequirements.certifications || []).join(', ');
    if (criteriaField) criteriaField.value = rfq.technicalRequirements.complianceCriteria || '';
  }
  modal.classList.remove('hidden');
}

function closeConfigureTechnicalModal() {
  const modal = document.getElementById('modalConfigureTechnical');
  if (modal) modal.classList.add('hidden');
}

async function submitTechnicalRequirements(e) {
  if (e) e.preventDefault();
  const rfqId = document.getElementById('techReqRfqId')?.value || AppState.currentRfqId;
  const specifications = document.getElementById('techReqSpecifications')?.value.trim() || '';
  const certsRaw = document.getElementById('techReqCertifications')?.value.trim() || '';
  const certifications = certsRaw.split(',').map(c => c.trim()).filter(Boolean);
  const complianceCriteria = document.getElementById('techReqCriteria')?.value.trim() || '';

  try {
    const res = await fetch(`/api/rfqs/${rfqId}/configure-technical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ specifications, certifications, complianceCriteria })
    });
    const data = await res.json();
    if (data.success) {
      closeConfigureTechnicalModal();
      showSapToast('✓ Technical Requirements configured and saved to RFQ.', 'success');
      await loadSourcingData();
      // Update the tech req status badge in buyer cockpit
      updateRequirementsStatusBadges(data.rfq);
    } else {
      showSapToast('Error: ' + (data.error || 'Failed to save'), 'error');
    }
  } catch (err) {
    showSapToast('Error: ' + err.message, 'error');
  }
}

// ============================================================================
// 20. DIAGRAM: CONFIGURE ECONOMIC REQUIREMENTS (Buyer Cockpit)
// ============================================================================

function openConfigureEconomicModal(rfqId) {
  const modal = document.getElementById('modalConfigureEconomic');
  if (!modal) return;
  const rfqIdField = document.getElementById('econReqRfqId');
  if (rfqIdField) rfqIdField.value = rfqId || AppState.currentRfqId;

  // Pre-fill with existing data if available
  const rfq = AppState.rfqData;
  if (rfq) {
    const targetPriceField = document.getElementById('econReqTargetPrice');
    const paymentField = document.getElementById('econReqPaymentTerms');
    const deliveryField = document.getElementById('econReqDeliveryTerms');
    const budgetField = document.getElementById('econReqBudgetCeiling');
    if (rfq.economicRequirements) {
      if (targetPriceField) targetPriceField.value = rfq.economicRequirements.targetUnitPrice || '';
      if (paymentField) paymentField.value = rfq.economicRequirements.paymentTerms || 'Net 60 Days';
      if (deliveryField) deliveryField.value = rfq.economicRequirements.deliveryTerms || 'DDP';
      if (budgetField) budgetField.value = rfq.economicRequirements.budgetCeiling || '';
    } else if (rfq.lineItems && rfq.lineItems[0]) {
      if (targetPriceField) targetPriceField.value = rfq.lineItems[0].targetPrice || '';
      if (budgetField) budgetField.value = rfq.lineItems[0].estimatedTotal || '';
    }
  }
  modal.classList.remove('hidden');
}

function closeConfigureEconomicModal() {
  const modal = document.getElementById('modalConfigureEconomic');
  if (modal) modal.classList.add('hidden');
}

async function submitEconomicRequirements(e) {
  if (e) e.preventDefault();
  const rfqId = document.getElementById('econReqRfqId')?.value || AppState.currentRfqId;
  const targetUnitPrice = Number(document.getElementById('econReqTargetPrice')?.value || 0);
  const paymentTerms = document.getElementById('econReqPaymentTerms')?.value.trim() || 'Net 60 Days';
  const deliveryTerms = document.getElementById('econReqDeliveryTerms')?.value.trim() || 'DDP';
  const budgetCeiling = Number(document.getElementById('econReqBudgetCeiling')?.value || 0);
  const currency = 'COP';

  try {
    const res = await fetch(`/api/rfqs/${rfqId}/configure-economic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUnitPrice, paymentTerms, deliveryTerms, budgetCeiling, currency })
    });
    const data = await res.json();
    if (data.success) {
      closeConfigureEconomicModal();
      showSapToast('✓ Economic Requirements configured and saved to RFQ.', 'success');
      await loadSourcingData();
      updateRequirementsStatusBadges(data.rfq);
    } else {
      showSapToast('Error: ' + (data.error || 'Failed to save'), 'error');
    }
  } catch (err) {
    showSapToast('Error: ' + err.message, 'error');
  }
}

function updateRequirementsStatusBadges(rfq) {
  const techBadge = document.getElementById('techReqStatusBadge');
  const econBadge = document.getElementById('econReqStatusBadge');
  if (techBadge) {
    if (rfq && rfq.technicalRequirements) {
      techBadge.innerHTML = '<span style="color:#15803d; font-weight:700;">&#10003; Configured</span>';
    } else {
      techBadge.innerHTML = '<span style="color:#b45309; font-weight:600;">Pending Configuration</span>';
    }
  }
  if (econBadge) {
    if (rfq && rfq.economicRequirements) {
      econBadge.innerHTML = '<span style="color:#15803d; font-weight:700;">&#10003; Configured</span>';
    } else {
      econBadge.innerHTML = '<span style="color:#b45309; font-weight:600;">Pending Configuration</span>';
    }
  }
}

// ============================================================================
// 21. DIAGRAM: CLOSE BIDDING — Buyer manually closes event
// ============================================================================

async function closeBiddingManually(rfqId) {
  if (!confirm(`Close bidding for RFQ ${rfqId || AppState.currentRfqId}? No more supplier bids will be accepted.`)) return;
  const targetId = rfqId || AppState.currentRfqId;

  try {
    const res = await fetch(`/api/rfqs/${targetId}/close-bidding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Bidding window closed by Buyer — proceeding to evaluation phase.' })
    });
    const data = await res.json();
    if (data.success) {
      showSapToast('✓ Bidding closed. RFQ is now UNDER EVALUATION — proceed to Technical & Economic comparison.', 'success');
      await loadSourcingData();
      // Update status chip in buyer view
      const chipStatus = document.getElementById('projChipStatus');
      if (chipStatus) chipStatus.textContent = 'UNDER EVALUATION';
      // Hide the close button, show evaluation ready badge
      const closeBtn = document.getElementById('btnCloseBidding');
      if (closeBtn) closeBtn.style.display = 'none';
      const evalReadyBadge = document.getElementById('biddingClosedBadge');
      if (evalReadyBadge) {
        evalReadyBadge.innerHTML = '<span style="background:#dcfce7; color:#15803d; font-weight:700; padding:6px 14px; border-radius:20px; font-size:12px;">&#128275; Bidding Closed — Ready for Evaluation</span>';
        evalReadyBadge.style.display = 'block';
      }
    } else {
      showSapToast('Error: ' + (data.error || 'Failed to close bidding'), 'error');
    }
  } catch (err) {
    showSapToast('Error: ' + err.message, 'error');
  }
}

// ============================================================================
// 22. DIAGRAM: AWARD TRIGGER — Check supplier notification status
// ============================================================================

async function checkSupplierAwardNotification() {
  const userId = currentUser.id;
  try {
    const res = await fetch(`/api/notifications/${userId}`);
    const data = await res.json();
    const notifications = data.notifications || [];

    const awardNotifContainer = document.getElementById('supplierAwardNotificationPanel');
    if (!awardNotifContainer) return;

    if (notifications.length === 0) {
      awardNotifContainer.innerHTML = '';
      awardNotifContainer.style.display = 'none';
      return;
    }

    awardNotifContainer.style.display = 'block';
    awardNotifContainer.innerHTML = notifications.map(n => `
      <div style="background:linear-gradient(135deg,#dcfce7,#bbf7d0); border:2px solid #22c55e; border-radius:12px; padding:20px; margin-bottom:12px; position:relative;">
        <div style="font-size:22px; margin-bottom:8px;">&#127942;</div>
        <div style="font-weight:800; font-size:16px; color:#14532d;">${escapeHtml(n.title)}</div>
        <div style="font-size:13px; color:#166534; margin-top:6px; line-height:1.5;">${escapeHtml(n.message)}</div>
        <div style="margin-top:10px;">
          <span style="background:#15803d; color:#fff; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700;">STATUS: PARTICIPATED &#10003;</span>
          <span style="background:#14532d; color:#fff; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:700; margin-left:6px;">AWARD TRIGGER RECEIVED &#128276;</span>
        </div>
        <div style="font-size:10px; color:#166534; margin-top:8px;">Notified: ${new Date(n.timestamp).toLocaleString()}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to check award notifications:', err);
  }
}



// ============================================================================
// 23. REAL-TIME EXECUTIVE COMMAND CENTER & 1-CLICK STREAMLINED WORKFLOWS
// ============================================================================

async function updateLiveKpiBar() {
  // Role-based display isolation: only executive procurement roles see overall executive KPI strip
  const strip = document.getElementById('executiveKpiStrip');
  const isExecutiveRole = currentUser && ['buyer', 'manager', 'admin', 'award_approver'].includes(currentUser.role);
  if (strip) {
    strip.style.display = isExecutiveRole ? 'grid' : 'none';
  }

  if (!isExecutiveRole) return;

  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const stats = await res.json();

    const elPrs = document.getElementById('kpiStripTotalPrs');
    const elPrsPill = document.getElementById('kpiStripPendingPrsPill');
    const elRfqs = document.getElementById('kpiStripActiveRfqs');
    const elQuotes = document.getElementById('kpiStripQuotations');
    const elSavings = document.getElementById('kpiStripSavingsPill');
    const elAward = document.getElementById('kpiStripAwardStatus');
    const elPos = document.getElementById('kpiStripTotalPos');

    if (elPrs) elPrs.textContent = stats.totalPrs || '3';
    if (elPrsPill) elPrsPill.textContent = `${stats.pendingPrs || 0} Pending Mgr Approval`;
    if (elRfqs) elRfqs.textContent = stats.activeRfqs || '1';
    if (elQuotes) elQuotes.textContent = stats.totalQuotations || '3';
    if (elSavings) elSavings.textContent = `${stats.savingsPercent || '14.3'}% Verified Savings`;
    if (elAward) elAward.textContent = stats.awardedRfqs ? '✓ Awarded' : '1 Pending';
    if (elPos) elPos.textContent = stats.totalPos || '1';
  } catch (err) {
    console.debug('Failed to update live KPI bar:', err);
  }
}

function highlightActiveRibbonPersona() {
  const chips = document.querySelectorAll('.ribbon-persona-chip');
  chips.forEach(c => c.classList.remove('active'));

  const role = currentUser.role;
  const username = currentUser.username || '';
  let targetId = '';

  if (role === 'requester') targetId = 'ribbonRoleRequester';
  else if (role === 'manager') targetId = 'ribbonRoleManager';
  else if (role === 'buyer') targetId = 'ribbonRoleBuyer';
  else if (role === 'rfq_approver') targetId = 'ribbonRoleRfqApprover';
  else if (role === 'supplier') {
    targetId = (currentUser.supplierId === 'SUP-101' || username.includes('indorama')) ? 'ribbonRoleSupplierIndorama' : 'ribbonRoleSupplierSonda';
  }
  else if (role === 'tech_evaluator') targetId = 'ribbonRoleTechEval';
  else if (role === 'comm_evaluator') targetId = 'ribbonRoleCommEval';
  else if (role === 'award_approver') targetId = 'ribbonRoleAwardApprover';
  else if (role === 'receiving') targetId = 'ribbonRoleReceiving';

  const el = document.getElementById(targetId);
  if (el) el.classList.add('active');
}

// ============================================================================
// 24. REVISE & RESUBMIT RETURNED PURCHASE REQUISITIONS (Carlos Ramirez)
// ============================================================================

async function openResubmitPrModal(prId) {
  let targetPr = null;
  try {
    const res = await fetch('/api/prs');
    const prs = await res.json();
    if (prId) {
      targetPr = prs.find(p => p.id === prId);
    } else if (AppState.activeReturnedPr) {
      targetPr = AppState.activeReturnedPr;
    } else {
      targetPr = prs.find(p => p.status === 'RETURNED_FOR_CORRECTION') || prs[0];
    }
  } catch (_) {}

  if (!targetPr) {
    showSapToast('No returned requisition found to revise.', 'info');
    return;
  }

  AppState.activeReturnedPr = targetPr;
  const modal = document.getElementById('modalResubmitPr');
  const idField = document.getElementById('resubmitPrId');
  const notesField = document.getElementById('resubmitManagerNotes');
  const titleField = document.getElementById('resubmitPrTitle');
  const qtyField = document.getElementById('resubmitPrQty');
  const priceField = document.getElementById('resubmitPrPrice');
  const revNotesField = document.getElementById('resubmitPrNotes');

  if (idField) idField.value = targetPr.id;
  if (notesField) notesField.textContent = targetPr.managerComments || 'Please revise specifications.';
  if (titleField) titleField.value = targetPr.title || '';

  const item = (targetPr.lineItems && targetPr.lineItems[0]) || { quantity: 1, targetUnitPrice: 10 };
  if (qtyField) qtyField.value = item.quantity || 1;
  if (priceField) priceField.value = item.targetUnitPrice || 10;
  if (revNotesField) revNotesField.value = 'Updated unit price and specifications per manager instructions.';

  calculateResubmitBudget();

  if (modal) modal.classList.remove('hidden');
}

function closeResubmitPrModal() {
  const modal = document.getElementById('modalResubmitPr');
  if (modal) modal.classList.add('hidden');
}

function calculateResubmitBudget() {
  const qtyField = document.getElementById('resubmitPrQty');
  const priceField = document.getElementById('resubmitPrPrice');
  const totalField = document.getElementById('resubmitPrTotalDisplay');
  if (!qtyField || !priceField || !totalField) return;

  const qty = Number(qtyField.value) || 0;
  const price = Number(priceField.value) || 0;
  const total = qty * price;
  totalField.value = `$${total.toLocaleString()} COP`;
}

async function submitPrRevision(e) {
  if (e) e.preventDefault();
  const prId = document.getElementById('resubmitPrId')?.value;
  const title = document.getElementById('resubmitPrTitle')?.value;
  const quantity = Number(document.getElementById('resubmitPrQty')?.value);
  const targetUnitPrice = Number(document.getElementById('resubmitPrPrice')?.value);
  const revisionNotes = document.getElementById('resubmitPrNotes')?.value;

  try {
    const res = await fetch(`/api/prs/${prId}/resubmit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, quantity, targetUnitPrice, revisionNotes })
    });
    const data = await res.json();
    if (data.success) {
      closeResubmitPrModal();
      showSapToast(`✓ Requisition ${prId} revised and resubmitted to Department Manager David Vance!`, 'success');
      await loadRequesterPrs();
      await updateLiveKpiBar();
    } else {
      showSapToast('Error resubmitting PR: ' + (data.error || 'Failed'), 'error');
    }
  } catch (err) {
    showSapToast('Communication error: ' + err.message, 'error');
  }
}
