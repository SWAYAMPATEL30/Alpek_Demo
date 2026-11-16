const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Locate view-sourcing-project block from `<div class="workspace-view active" id="view-sourcing-project">`
// down to `<!-- VIEW B: EXTERNAL SUPPLIER PORTAL (VENDOR BIDDING COCKPIT) -->`
const viewStartTag = '<div class="workspace-view active" id="view-sourcing-project">';
const viewEndTag = '<!-- ========================================================================= -->\n      <!-- VIEW B: EXTERNAL SUPPLIER PORTAL (VENDOR BIDDING COCKPIT)';

const startIndex = html.indexOf(viewStartTag);
const endIndex = html.indexOf(viewEndTag);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find view-sourcing-project boundaries!", { startIndex, endIndex });
  process.exit(1);
}

const newSourcingProjectHtml = `<div class="workspace-view active" id="view-sourcing-project">

        <!-- ========================================================================= -->
        <!-- 3. OBJECT PAGE HEADER & MISSION CONTROL BANNER (Stitch Layout in Home Theme) -->
        <!-- ========================================================================= -->
        <div class="cockpit-hero-banner" id="rfqPublicationBanner" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:28px 32px; box-shadow:0 4px 20px rgba(25,23,22,0.03); margin-bottom:24px; position:relative;">
          <!-- Breadcrumbs -->
          <nav style="display:flex; align-items:center; gap:6px; font-size:12px; color:#8C867F; margin-bottom:12px;">
            <a href="#" onclick="switchMainTab('sourcing')" style="color:#8C867F; text-decoration:none;">Home</a>
            <span>/</span>
            <span>Strategic Sourcing</span>
            <span>/</span>
            <span style="color:#191716; font-weight:600;">Tender <span id="cfgEventIdBadge" class="cockpit-event-badge" style="background:#F5F2EB; color:#191716; padding:2px 8px; border-radius:6px; font-family:monospace; font-weight:700;">Doc2432956265</span></span>
          </nav>

          <!-- Title + Semantic Status + Action Bar -->
          <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px;">
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:12px;">
              <h1 id="rfqPubStatusTitle" class="cockpit-main-heading" style="font-family:var(--font-heading); font-size:24px; font-weight:600; color:#191716; margin:0; letter-spacing:-0.02em;">Refrigerant-134a Industrial Supply &amp; Quality Certification</h1>
              <div class="status-pill pending" id="buyerTimerStatusPill" style="background:#ECFDF5; color:#15803D; border:1px solid #A7F3D0; border-radius:9999px; padding:4px 12px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:6px;">
                <span style="width:7px; height:7px; border-radius:50%; background:#15803D;"></span>
                <span>Adjudication Active &bull; 3 Bids Sealed</span>
              </div>
            </div>

            <!-- Action Bar Buttons -->
            <div style="display:flex; flex-wrap:wrap; align-items:center; gap:8px;">
              <button class="pf-btn-secondary" style="height:34px; padding:0 14px; font-size:12px; border-radius:9999px;" onclick="exportMatrixCsv()">
                📥 Export CSV / PDF
              </button>
              <button class="pf-btn-secondary" style="height:34px; padding:0 14px; font-size:12px; border-radius:9999px;" onclick="openSetBiddingDeadlineModal()">
                ⏱ Adjust Window
              </button>
              <button class="pf-btn-secondary" style="height:34px; padding:0 14px; font-size:12px; border-radius:9999px;" onclick="document.getElementById('cxml-drawer').classList.remove('hidden')">
                📄 Inspect cXML 1.2
              </button>
              <button class="pf-btn-coral" id="btnCloseBidding" style="height:34px; padding:0 18px; font-size:12px; font-weight:700; border-radius:9999px;" onclick="document.getElementById('award-modal').classList.remove('hidden')">
                ✓ Committee Sign-off &amp; Commit PO &rarr;
              </button>
            </div>
          </div>
          <div id="rfqPubStatusSubtitle" class="cockpit-sub-heading" style="font-size:13.5px; color:#4B4643; margin-bottom:20px;">Two-envelope technical and commercial bidding open for verified suppliers.</div>

          <!-- 4 Horizon KPI Tiles in Warm Home Page Palette -->
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin-bottom:24px;">
            <!-- Tile 1: Target Budget Baseline -->
            <div style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:18px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#8C867F;">
                <span>Target Budget</span>
                <span style="font-size:16px;">💰</span>
              </div>
              <div style="margin:8px 0 4px 0; display:flex; align-items:baseline; gap:6px;">
                <span style="font-family:var(--font-heading); font-size:26px; font-weight:700; color:#191716;">$24,937,500</span>
                <span style="font-size:12px; font-weight:600; color:#8C867F;">COP</span>
              </div>
              <div style="font-size:11px; color:#8C867F;">
                <span style="font-weight:600; color:#191716;">Ceiling Tariff:</span> PR #109482 Baseline
              </div>
            </div>

            <!-- Tile 2: Lowest Evaluated Offer & Savings -->
            <div style="background:#FAF8F5; border:1px solid #EDEAE4; border-left:4px solid #15803D; border-radius:18px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#8C867F;">
                <span>Lowest Evaluated Offer</span>
                <span style="background:#ECFDF5; color:#15803D; border:1px solid #A7F3D0; font-size:11px; font-weight:800; padding:2px 8px; border-radius:9999px;">-14.3% Delta</span>
              </div>
              <div style="margin:8px 0 4px 0; display:flex; align-items:baseline; gap:6px;">
                <span style="font-family:var(--font-heading); font-size:26px; font-weight:700; color:#15803D;">$21,375,000</span>
                <span style="font-size:12px; font-weight:600; color:#8C867F;">COP</span>
              </div>
              <div style="font-size:11px; color:#15803D; font-weight:700; display:flex; align-items:center; gap:4px;">
                <span>↓</span>
                <span>$3,562,500 COP Total Cost Avoidance</span>
              </div>
            </div>

            <!-- Tile 3: Rank #1 Bidder -->
            <div style="background:#FAF8F5; border:1px solid #EDEAE4; border-left:4px solid #E0533C; border-radius:18px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between;">
              <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#8C867F;">
                <span>Rank #1 Recommended</span>
                <span style="background:#FDF1EE; color:#E0533C; border:1px solid #FECDD3; font-size:11px; font-weight:800; padding:2px 8px; border-radius:9999px;">Top Choice</span>
              </div>
              <div style="margin:8px 0 4px 0;">
                <span style="font-family:var(--font-heading); font-size:20px; font-weight:700; color:#191716; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">SONDA Colombia S.A.</span>
              </div>
              <div style="font-size:11px; color:#8C867F; display:flex; align-items:center; gap:6px;">
                <span style="font-weight:700; color:#E0533C;">Score: 95.8 / 100</span>
                <span>&bull; Full SLA Adherence</span>
              </div>
            </div>

            <!-- Tile 4: Adjudication Window Countdown -->
            <div class="cockpit-timer-card" style="background:#FAF8F5; border:1px solid #EDEAE4; border-left:4px solid #E0533C; border-radius:18px; padding:18px 20px; display:flex; flex-direction:column; justify-content:space-between; text-align:left;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span class="timer-card-label" id="buyerHeaderTimerText" style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.06em; color:#8C867F;">Adjudication Window</span>
                <span style="background:#FDF1EE; color:#E0533C; border:1px solid #FECDD3; font-size:10px; font-weight:800; padding:2px 8px; border-radius:9999px;">Lock Enforced</span>
              </div>
              <div style="margin:6px 0 2px 0; display:flex; align-items:baseline; gap:8px;">
                <span class="timer-card-digits" id="buyerBiddingCountdownDisplay" style="font-family:var(--font-heading); font-size:32px; font-weight:700; color:#E0533C; line-height:1.1;">00:57:08</span>
                <span style="font-size:11px; color:#8C867F; font-weight:600;">Remaining</span>
              </div>
              <div class="timer-card-sub" id="buyerDeadlineTimestamp" style="font-size:11px; color:#8C867F;">
                Automatic S/4HANA PO direct dispatch trigger
              </div>
            </div>
          </div>

          <!-- 5-Step Process Flow Indicator (Fiori/Passionfroot Style) -->
          <div style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:18px; padding:18px 24px; margin-bottom:24px;">
            <div style="display:flex; align-items:center; justify-content:space-between; max-width:880px; margin:0 auto; position:relative;">
              <!-- Background connector line -->
              <div style="position:absolute; left:30px; right:30px; top:16px; height:2px; background:#EDEAE4; z-index:0;"></div>
              <div style="position:absolute; left:30px; width:72%; top:16px; height:2px; background:#191716; z-index:0;"></div>

              <!-- Step 1 -->
              <div style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; text-align:center;">
                <div style="width:32px; height:32px; border-radius:50%; background:#191716; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; box-shadow:0 2px 6px rgba(25,23,22,0.15);">✓</div>
                <span style="font-size:11.5px; font-weight:700; color:#191716; margin-top:6px;">PR Ingested</span>
                <span style="font-size:10px; color:#8C867F; font-family:monospace;">100% OData</span>
              </div>

              <!-- Step 2 -->
              <div style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; text-align:center;">
                <div style="width:32px; height:32px; border-radius:50%; background:#191716; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; box-shadow:0 2px 6px rgba(25,23,22,0.15);">✓</div>
                <span style="font-size:11.5px; font-weight:700; color:#191716; margin-top:6px;">RFP Configured</span>
                <span style="font-size:10px; color:#8C867F; font-family:monospace;">Terms Set</span>
              </div>

              <!-- Step 3 -->
              <div style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; text-align:center;">
                <div style="width:32px; height:32px; border-radius:50%; background:#191716; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; box-shadow:0 2px 6px rgba(25,23,22,0.15);">✓</div>
                <span style="font-size:11.5px; font-weight:700; color:#191716; margin-top:6px;">Bids Sealed</span>
                <span style="font-size:10px; color:#8C867F; font-family:monospace;">3 Cryptographic</span>
              </div>

              <!-- Step 4 (Active Step) -->
              <div style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; text-align:center;">
                <div style="width:32px; height:32px; border-radius:50%; background:#E0533C; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; box-shadow:0 0 0 4px #FDF1EE, 0 4px 12px rgba(224,83,60,0.3);">4</div>
                <span style="font-size:11.5px; font-weight:800; color:#E0533C; margin-top:6px;">Two-Envelope Review</span>
                <span style="font-size:10px; color:#E0533C; font-weight:700;">Active Adjudication</span>
              </div>

              <!-- Step 5 (Upcoming) -->
              <div style="position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; text-align:center;">
                <div style="width:32px; height:32px; border-radius:50%; background:#FFFFFF; border:2px solid #EDEAE4; color:#8C867F; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:700;">5</div>
                <span style="font-size:11.5px; font-weight:600; color:#8C867F; margin-top:6px;">S/4HANA PO</span>
                <span style="font-size:10px; color:#8C867F;">Direct Dispatch</span>
              </div>
            </div>
          </div>

          <!-- Structured Telemetry Metadata Chips -->
          <div class="cockpit-chips-grid">
            <div class="cockpit-chip">
              <span class="chip-label">Source Demand</span>
              <span class="chip-val"><strong id="cfgMetaPrNumber" style="color:#191716;">PR-3000010443 (3000010443)</strong></span>
            </div>
            <div class="cockpit-chip">
              <span class="chip-label">Operational Material</span>
              <span class="chip-val"><strong id="cfgMetaMaterial" style="color:#191716;">SUMINISTROS REFRI • 7,125,000 Units</strong></span>
            </div>
            <div class="cockpit-chip">
              <span class="chip-label">Delivery Plant</span>
              <span class="chip-val"><strong id="cfgMetaPlant" style="color:#191716;">Gran Tierra Energy • Vereda Morrison</strong></span>
            </div>
            <div class="cockpit-chip highlight-green">
              <span class="chip-label">Clean Core Follow-on PO</span>
              <span class="chip-val"><strong id="cfgMetaPoNumber" style="color:#15803D;">SAP PO 450009180 (Committed)</strong></span>
            </div>
          </div>

          <!-- Bottom Tender Control Strip -->
          <div class="cockpit-control-bar">
            <div class="cockpit-selector-group">
              <span class="selector-label">Switch Tender:</span>
              <select id="cfgRfqSelector" onchange="switchSourcingProject(this.value)" class="cockpit-select">
                <option value="">Select Sourcing Project...</option>
              </select>
            </div>
            <div class="cockpit-btn-group">
              <button class="pf-btn-secondary" onclick="openSetBiddingDeadlineModal()">
                ⏱ Set Dynamic Timer
              </button>
              <button class="pf-btn-coral" onclick="closeBiddingNow()">
                Close Tender Now &rarr;
              </button>
            </div>
          </div>
        </div>

        <!-- ========================================================================= -->
        <!-- 4. MAIN CONTENT GRID (8 COLS LEFT MATRIX / 4 COLS RIGHT INTELLIGENCE)    -->
        <!-- ========================================================================= -->
        <div class="studio-layout" style="display:grid; grid-template-columns:68fr 32fr; gap:24px; align-items:start;">

          <!-- 68% Main Workspace (Left Column) -->
          <div class="studio-main" style="display:flex; flex-direction:column; gap:24px;">

            <!-- Studio Card 1: Multi-Vendor Sealed Bid Comparison Matrix (PRIMARY) -->
            <div class="sap-card" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:28px; box-shadow:0 4px 20px rgba(25,23,22,0.03);">
              <div class="card-toolbar" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px; margin-bottom:20px;">
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:20px;">📊</span>
                    <span class="card-title" style="font-family:var(--font-heading); font-size:20px; font-weight:600; color:#191716;">Bid Evaluation Matrix (3 Proposals Evaluated)</span>
                  </div>
                  <div class="card-subtitle" style="font-size:12.5px; color:#8C867F; margin-top:4px;">Commercial, SLA &amp; Quality Parameters evaluated against PR #109482 baseline</div>
                </div>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:8px; padding:4px 10px; font-size:11px; font-family:monospace; color:#8C867F;">
                    Formula: Lowest Evaluated Total Cost
                  </span>
                  <button class="sap-btn sap-btn-secondary sap-btn-sm" style="border-radius:9999px; font-weight:600; padding:6px 14px;" onclick="exportMatrixCsv()">Export CSV</button>
                </div>
              </div>

              <div style="overflow-x:auto;">
                <table class="sap-table matrix-table" style="width:100%;">
                  <thead id="matrixComparisonThead">
                    <!-- Dynamically populated -->
                  </thead>
                  <tbody id="matrixComparisonTbody">
                    <!-- Dynamically populated -->
                  </tbody>
                </table>
              </div>

              <!-- Table Footer / Clean Core Audit Note -->
              <div style="margin-top:18px; padding-top:14px; border-top:1px solid #EDEAE4; display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:10px; font-size:11.5px; color:#8C867F;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="color:#15803D;">🛡️</span>
                  <span>Cryptographic audit verification hash: <code style="font-family:monospace; color:#191716; background:#FAF8F5; padding:2px 6px; border-radius:4px; border:1px solid #EDEAE4;">SHA-256:d9e76fa9b881a7cf902</code> (Tamper-proof sealed)</span>
                </div>
                <div style="display:flex; align-items:center; gap:6px; color:#15803D; font-weight:700;">
                  <span style="width:6px; height:6px; border-radius:50%; background:#15803D;"></span>
                  <span>SAP Clean Core Certified &bull; Zero Custom ABAP Modifications</span>
                </div>
              </div>
            </div>

            <!-- Studio Card 2: Approved Requisitions Queue (Step 3: Create RFQ) -->
            <div class="sap-card" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:28px; box-shadow:0 4px 20px rgba(25,23,22,0.03);">
              <div class="card-toolbar" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px; margin-bottom:20px;">
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:20px;">📥</span>
                    <span class="card-title" style="font-family:var(--font-heading); font-size:20px; font-weight:600; color:#191716;">Approved Requisitions Queue (Step 3: Create RFQ)</span>
                  </div>
                  <div class="card-subtitle" style="font-size:12.5px; color:#8C867F; margin-top:4px;">Select pre-approved PRs from SAP ERP to launch competitive multi-vendor bidding events.</div>
                </div>
                <div style="display:flex; align-items:center; gap:10px;">
                  <span class="status-pill approved" id="buyerApprovedPrsCountBadge" style="font-size:11.5px; padding:4px 12px; border-radius:9999px;">0 Approved</span>
                  <button class="sap-btn sap-btn-primary sap-btn-sm" style="border-radius:9999px; font-weight:700; padding:6px 16px; background:#191716; color:#FFFFFF;" onclick="openAddPrModal()">+ New Plant Demand</button>
                </div>
              </div>

              <div style="overflow-x:auto;">
                <table class="sap-table" style="width:100%;">
                  <thead>
                    <tr>
                      <th style="width:130px;">PR Number</th>
                      <th style="min-width:240px;">Material Scope &amp; Purpose</th>
                      <th style="width:110px;">Quantity</th>
                      <th style="width:140px;">Est. Total</th>
                      <th style="width:170px;">Requester &amp; Dept</th>
                      <th style="width:160px;">Status</th>
                      <th style="width:150px; text-align:right;">Action</th>
                    </tr>
                  </thead>
                  <tbody id="buyerApprovedPrsBody">
                    <tr>
                      <td colspan="7" style="text-align:center; padding:24px; color:#8C867F;">Loading approved requisitions...</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Studio Card 3: Strategic Event Configuration Deck -->
            <div class="sap-card" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:28px; box-shadow:0 4px 20px rgba(25,23,22,0.03);">
              <div class="card-toolbar" style="display:flex; flex-wrap:wrap; justify-content:space-between; align-items:center; gap:12px; margin-bottom:20px;">
                <div>
                  <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:20px;">⚙️</span>
                    <span class="card-title" style="font-family:var(--font-heading); font-size:20px; font-weight:600; color:#191716;">Sourcing Event Configuration</span>
                  </div>
                  <div class="card-subtitle" style="font-size:12.5px; color:#8C867F; margin-top:4px;">Define technical specifications, economic ceiling tariffs, and invited supplier pool.</div>
                </div>
                <span class="status-pill confirmed" id="cfgActiveEventBadge" style="font-size:11.5px; padding:4px 12px; border-radius:9999px;">Multi-Vendor RFP</span>
              </div>

              <!-- 3-Pillar Micro Bento Strip -->
              <div class="cfg-deck-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px; margin-bottom:16px;">
                <div class="cfg-deck-card" style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:18px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s ease;">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="cfg-deck-icon" style="width:32px; height:32px; border-radius:10px; background:#FFFFFF; border:1px solid #EDEAE4; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 1px 3px rgba(25,23,22,0.03);">🔬</span>
                        <strong style="font-size:13.5px; color:#191716; font-weight:700;">Technical Specs</strong>
                      </div>
                      <span id="techReqStatusBadge"><span class="status-pill pending">Pending</span></span>
                    </div>
                    <p style="font-size:12px; color:#8C867F; line-height:1.4; margin-bottom:16px;">ISO 9001:2015, guaranteed delivery lead times, and engineering tolerances.</p>
                  </div>
                  <button class="sap-btn sap-btn-secondary sap-btn-sm" style="width:100%; border-radius:9999px; font-weight:600; padding:8px 16px;" onclick="openConfigureTechnicalModal()">Configure Specs</button>
                </div>

                <div class="cfg-deck-card" style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:18px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s ease;">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="cfg-deck-icon" style="width:32px; height:32px; border-radius:10px; background:#FFFFFF; border:1px solid #EDEAE4; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 1px 3px rgba(25,23,22,0.03);">💰</span>
                        <strong style="font-size:13.5px; color:#191716; font-weight:700;">Economic Target</strong>
                      </div>
                      <span id="econReqStatusBadge"><span class="status-pill pending">Pending</span></span>
                    </div>
                    <p style="font-size:12px; color:#8C867F; line-height:1.4; margin-bottom:16px;">Budget ceiling tariff, payment terms (Net 60), and Incoterms (DDP).</p>
                  </div>
                  <button class="sap-btn sap-btn-secondary sap-btn-sm" style="width:100%; border-radius:9999px; font-weight:600; padding:8px 16px;" onclick="openConfigureEconomicModal()">Set Target Price</button>
                </div>

                <div class="cfg-deck-card" style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:18px; padding:20px; display:flex; flex-direction:column; justify-content:space-between; transition:all 0.2s ease;">
                  <div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                      <div style="display:flex; align-items:center; gap:8px;">
                        <span class="cfg-deck-icon" style="width:32px; height:32px; border-radius:10px; background:#FFFFFF; border:1px solid #EDEAE4; display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 1px 3px rgba(25,23,22,0.03);">👥</span>
                        <strong style="font-size:13.5px; color:#191716; font-weight:700;">Invited Suppliers (<span id="invitedSupplierCountBadge">3</span>)</strong>
                      </div>
                      <span class="status-pill confirmed">Verified</span>
                    </div>
                    <p style="font-size:12px; color:#8C867F; line-height:1.4; margin-bottom:16px;">Authorized vendor invitations with secure sealed bidding access.</p>
                  </div>
                  <button class="sap-btn sap-btn-secondary sap-btn-sm" style="width:100%; border-radius:9999px; font-weight:600; padding:8px 16px;" onclick="openInviteSuppliersModal()">Manage Suppliers</button>
                </div>
              </div>

              <!-- Dedicated Authorized Vendor Roster Container -->
              <div class="authorized-vendor-roster-box" style="padding:14px 18px; background:#FAF8F5; border:1px solid #EDEAE4; border-radius:16px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:#8C867F;">Authorized Vendor Roster:</span>
                  <span class="status-pill confirmed" style="font-size:10.5px; padding:2px 8px; border-radius:9999px;">Clean Core Verified</span>
                </div>
                <div id="cfgInvitedSuppliersBadges" style="display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
                  <!-- Supplier chips injected dynamically -->
                </div>
              </div>
            </div>

          </div>

          <!-- 32% Intelligence Sidebar (Right Column) -->
          <div class="studio-sidebar" style="display:flex; flex-direction:column; gap:24px;">

            <!-- Sidebar Card 1: Award Summary & S/4HANA PO Direct Dispatch -->
            <div class="studio-sidebar-card" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:26px; box-shadow:0 4px 20px rgba(25,23,22,0.03);">
              <div class="studio-sidebar-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; padding-bottom:12px; border-bottom:1px solid #EDEAE4;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:20px;">⚡</span>
                  <div>
                    <h3 class="studio-sidebar-title" style="font-family:var(--font-heading); font-size:17px; font-weight:700; color:#191716; margin:0;">Award Summary</h3>
                    <div class="studio-sidebar-subtitle" style="font-size:11.5px; color:#8C867F; margin-top:2px;">Follow-on S/4HANA PO Dispatch</div>
                  </div>
                </div>
                <span class="status-pill approved" id="badgeAwardApproval" style="font-size:11px; padding:3px 10px; border-radius:9999px;">Ready</span>
              </div>

              <!-- Structured Form Container (Label-Value Pairs from Stitch) -->
              <div style="display:flex; flex-direction:column; gap:10px; font-size:12.5px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:8px; border-bottom:1px solid #EDEAE4;">
                  <span style="color:#8C867F;">Selected Vendor</span>
                  <div style="text-align:right;">
                    <div style="font-weight:700; color:#191716;" id="projMainTitle">SONDA Colombia S.A.</div>
                    <div style="font-family:monospace; font-size:11px; color:#8C867F;">SAP Vendor #800192</div>
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:8px; border-bottom:1px solid #EDEAE4;">
                  <span style="color:#8C867F;">Follow-on PO Doc</span>
                  <div style="text-align:right;">
                    <div style="font-family:monospace; font-weight:700; color:#191716;" id="projIdText">PO 450009180</div>
                    <div style="font-size:11px; color:#8C867F;">Document Type: NB Standard</div>
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:8px; border-bottom:1px solid #EDEAE4;">
                  <span style="color:#8C867F;">Total Commitment</span>
                  <div style="text-align:right;">
                    <div style="font-family:var(--font-heading); font-weight:700; font-size:17px; color:#E0533C;">$21,375,000 COP</div>
                    <div style="font-size:11px; font-weight:700; color:#15803D;">14.3% Under Baseline Budget</div>
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:8px; border-bottom:1px solid #EDEAE4;">
                  <span style="color:#8C867F;">Plant &amp; Storage</span>
                  <div style="text-align:right;">
                    <div style="font-weight:600; color:#191716;">Vereda Morrison #04</div>
                    <div style="font-family:monospace; font-size:11px; color:#8C867F;">Facility: CO-MOR-01</div>
                  </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <span style="color:#8C867F;">Target Release Mode</span>
                  <div style="text-align:right;">
                    <div style="font-weight:600; color:#15803D; display:flex; align-items:center; justify-content:flex-end; gap:4px;">
                      <span style="width:6px; height:6px; border-radius:50%; background:#15803D;"></span>
                      <span>Direct OData v4 Post</span>
                    </div>
                    <div style="font-size:10.5px; color:#8C867F;">Zero Staging Queue</div>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div style="display:flex; flex-direction:column; gap:8px;">
                <button class="pf-btn-coral" style="width:100%; height:38px; font-weight:700; font-size:13px; border-radius:9999px;" onclick="document.getElementById('award-modal').classList.remove('hidden')">
                  Commit Purchase Order &rarr;
                </button>
                <button class="pf-btn-secondary" style="width:100%; height:34px; font-weight:600; font-size:12px; border-radius:9999px;" onclick="document.getElementById('cxml-drawer').classList.remove('hidden')">
                  Inspect cXML 1.2 Payload
                </button>
              </div>

              <!-- Clean Core Notice Box -->
              <div style="margin-top:14px; padding:10px 14px; background:#FAF8F5; border:1px solid #EDEAE4; border-radius:12px; font-size:11px; color:#8C867F; line-height:1.4; display:flex; gap:8px;">
                <span style="color:#15803D; font-size:14px;">🛡️</span>
                <span>Zero modification to SAP core table logic. Native cXML/OData interface maintains full lifecycle clean-core compliance.</span>
              </div>
            </div>

            <!-- Sidebar Card 2: Supplier Evaluation Radar & Telemetry (Stitch Feature) -->
            <div class="studio-sidebar-card" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:26px; box-shadow:0 4px 20px rgba(25,23,22,0.03);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #EDEAE4;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:18px;">🎯</span>
                  <span style="font-family:var(--font-heading); font-size:16px; font-weight:700; color:#191716;">Supplier Evaluation Radar</span>
                </div>
                <span class="status-pill approved" style="font-size:11px; font-weight:800; padding:2px 8px; border-radius:9999px;">95.8% Overall</span>
              </div>

              <div style="display:flex; flex-direction:column; gap:12px;">
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:12px; color:#4B4643; margin-bottom:4px;">
                    <span>Technical Specs &amp; Quality</span>
                    <strong style="font-family:monospace; color:#191716;">95 / 100</strong>
                  </div>
                  <div style="width:100%; height:7px; background:#FAF8F5; border:1px solid #EDEAE4; border-radius:9999px; overflow:hidden;">
                    <div style="width:95%; height:100%; background:#191716; border-radius:9999px;"></div>
                  </div>
                </div>

                <div>
                  <div style="display:flex; justify-content:space-between; font-size:12px; color:#4B4643; margin-bottom:4px;">
                    <span>Financial Health &amp; Risk Rating</span>
                    <strong style="font-family:monospace; color:#15803D;">98 / 100</strong>
                  </div>
                  <div style="width:100%; height:7px; background:#FAF8F5; border:1px solid #EDEAE4; border-radius:9999px; overflow:hidden;">
                    <div style="width:98%; height:100%; background:#15803D; border-radius:9999px;"></div>
                  </div>
                </div>

                <div>
                  <div style="display:flex; justify-content:space-between; font-size:12px; color:#4B4643; margin-bottom:4px;">
                    <span>Historical Lead Time Fidelity</span>
                    <strong style="font-family:monospace; color:#E0533C;">94 / 100</strong>
                  </div>
                  <div style="width:100%; height:7px; background:#FAF8F5; border:1px solid #EDEAE4; border-radius:9999px; overflow:hidden;">
                    <div style="width:94%; height:100%; background:#E0533C; border-radius:9999px;"></div>
                  </div>
                </div>
              </div>

              <div style="margin-top:14px; pt-2; border-top:1px solid #EDEAE4; display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#8C867F;">
                <span>Lead Procurement Auditor:</span>
                <span style="font-weight:700; color:#191716;">Valeria Martinez (Certified)</span>
              </div>
            </div>

            <!-- Sidebar Card 3: Two-Envelope Evaluation Arena -->
            <div class="studio-sidebar-card" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:26px; box-shadow:0 4px 20px rgba(25,23,22,0.03);">
              <div class="studio-sidebar-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #EDEAE4;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:18px;">⚖️</span>
                  <div>
                    <h3 class="studio-sidebar-title" style="font-family:var(--font-heading); font-size:16px; font-weight:700; color:#191716; margin:0;">Sealed Evaluation Protocol</h3>
                    <div class="studio-sidebar-subtitle" style="font-size:11.5px; color:#8C867F; margin-top:2px;">Blind adjudication protocol guarantees integrity</div>
                  </div>
                </div>
              </div>

              <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:16px; padding:14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-weight:700; font-size:13px; color:#191716;">Envelope 1: Technical &amp; Quality</span>
                    <span class="status-pill approved" style="font-size:11px; padding:2px 8px; border-radius:9999px;">&#10003; Evaluated</span>
                  </div>
                  <p style="font-size:12px; color:#8C867F; margin:0;">ISO 9001 compliance &amp; delivery lead times rated by engineering.</p>
                </div>

                <div style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:16px; padding:14px;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <span style="font-weight:700; font-size:13px; color:#191716;">Envelope 2: Commercial Pricing</span>
                    <span class="status-pill pending" id="biddingClosedBadge" style="font-size:11px; padding:2px 8px; border-radius:9999px;">Sealed</span>
                  </div>
                  <p style="font-size:12px; color:#8C867F; margin:0;">Commercial unit tariffs remain locked until technical compliance passes.</p>
                  <button class="sap-btn sap-btn-primary sap-btn-sm" style="margin-top:10px; width:100%; border-radius:9999px; background:#191716; color:#FFFFFF; font-weight:700;" id="btnOpenEnvelope" onclick="openEnvelopeCommercial()">Unseal Commercial Envelope</button>
                </div>

                <button class="sap-btn sap-btn-secondary" style="width:100%; border-radius:9999px; font-weight:600;" id="btnAwardScenario" onclick="openAwardScenarioModal()">Compare Bids &amp; Generate Award</button>
              </div>
            </div>

            <!-- Sidebar Card 4: Governance & Clean Core Policy -->
            <div class="studio-sidebar-card" style="background:#FFFFFF; border:1px solid #EDEAE4; border-radius:24px; padding:26px; box-shadow:0 4px 20px rgba(25,23,22,0.03);">
              <div class="studio-sidebar-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; padding-bottom:10px; border-bottom:1px solid #EDEAE4;">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="font-size:18px;">🛡️</span>
                  <div>
                    <h3 class="studio-sidebar-title" style="font-family:var(--font-heading); font-size:16px; font-weight:700; color:#191716; margin:0;">Clean Core Audit Rules</h3>
                    <div class="studio-sidebar-subtitle" style="font-size:11.5px; color:#8C867F; margin-top:2px;">S/4HANA 2026 Procurement Guardrails</div>
                  </div>
                </div>
              </div>
              <ul class="studio-intel-list" style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px;">
                <li style="display:flex; align-items:flex-start; gap:10px; background:#FAF8F5; border:1px solid #EDEAE4; border-radius:14px; padding:12px 14px;">
                  <span style="font-size:16px;">🔒</span>
                  <div>
                    <strong style="display:block; font-size:12.5px; color:#191716;">Zero Modification Principle</strong>
                    <span style="font-size:11.5px; color:#8C867F;">All commits dispatch standard SAP BAPIs &amp; OData v4 APIs.</span>
                  </div>
                </li>
                <li style="display:flex; align-items:flex-start; gap:10px; background:#FAF8F5; border:1px solid #EDEAE4; border-radius:14px; padding:12px 14px;">
                  <span style="font-size:16px;">📜</span>
                  <div>
                    <strong style="display:block; font-size:12.5px; color:#191716;">Dual-Envelope Cryptographic Seal</strong>
                    <span style="font-size:11.5px; color:#8C867F;">Pricing decrypted solely upon committee quorum sign-off.</span>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </div>\n\n      `;

// Replace view-sourcing-project
html = html.substring(0, startIndex) + newSourcingProjectHtml + html.substring(endIndex);

// Add the cXML slide-over drawer and Award Modal before </body> if not present
if (!html.includes('id="cxml-drawer"')) {
  const modalsCode = `
  <!-- ========================================================================= -->
  <!-- 5. INTERACTIVE SLIDE-OVER DRAWER (cXML 1.2 Inspection in Home Theme)     -->
  <!-- ========================================================================= -->
  <div class="hidden fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-[2px] transition-opacity" id="cxml-drawer">
    <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-2xl bg-white shadow-2xl border-l border-[#EDEAE4] flex flex-col" style="background:#FFFFFF;">
        <!-- Drawer Header -->
        <div class="p-5 border-b border-[#EDEAE4] flex items-center justify-between" style="background:#FAF8F5;">
          <div class="flex items-center gap-3">
            <span style="font-size:22px;">📄</span>
            <div>
              <h4 style="font-family:var(--font-heading); font-size:16px; font-weight:700; color:#191716; margin:0;">cXML 1.2 Standard OrderRequest Payload</h4>
              <p style="font-size:11.5px; color:#8C867F; font-family:monospace; margin:2px 0 0 0;">Bound to SAP S/4HANA OData Core Service v4</p>
            </div>
          </div>
          <button class="pf-btn-pill pf-btn-outline" style="width:32px; height:32px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" onclick="document.getElementById('cxml-drawer').classList.add('hidden')" title="Close drawer">
            ✕
          </button>
        </div>
        <!-- Drawer Content -->
        <div class="p-5 flex-1 overflow-y-auto" style="background:#191716; color:#FAF8F5; font-family:monospace; font-size:12px; line-height:1.6;">
          <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:10px; margin-bottom:14px; border-bottom:1px solid #332E2C; font-size:12px; color:#8C867F;">
            <span>RFC 3023 Compliant XML Data Stream</span>
            <button class="pf-btn-pill pf-btn-secondary" style="font-size:11px; padding:3px 10px; border-radius:9999px; background:#2C2826; color:#FFFFFF; border:none;" onclick="navigator.clipboard?.writeText(document.getElementById('cxml-drawer-content').innerText); this.innerText='Copied!'; setTimeout(()=>this.innerText='Copy Payload', 1500);">
              Copy Payload
            </button>
          </div>
          <pre class="select-all whitespace-pre-wrap" id="cxml-drawer-content">&lt;?xml version="1.0" encoding="UTF-8"?&gt;
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
        <div class="p-4 border-t border-[#EDEAE4] flex items-center justify-between" style="background:#FAF8F5;">
          <div style="display:flex; align-items:center; gap:6px; font-size:11.5px; color:#15803D; font-weight:700;">
            <span style="width:7px; height:7px; border-radius:50%; background:#15803D;"></span>
            <span>Schema: Validated ISO cXML 1.2 Standards</span>
          </div>
          <button class="pf-btn-pill pf-btn-secondary" style="font-size:12px; padding:6px 16px; border-radius:9999px;" onclick="document.getElementById('cxml-drawer').classList.add('hidden')">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ========================================================================= -->
  <!-- 6. DIALOG MODAL: PO COMMITTEE SIGN-OFF (In Home Theme)                   -->
  <!-- ========================================================================= -->
  <div class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]" id="award-modal">
    <div class="bg-white rounded-3xl shadow-2xl border border-[#EDEAE4] max-w-lg w-full p-6 flex flex-col gap-4 animate-in fade-in duration-150" style="background:#FFFFFF; border-radius:24px;">
      <div class="flex items-start justify-between border-b border-[#EDEAE4] pb-3">
        <div class="flex items-center gap-3">
          <div style="width:38px; height:38px; border-radius:12px; background:#FDF1EE; color:#E0533C; display:flex; align-items:center; justify-content:center; font-size:20px;">
            ⚖️
          </div>
          <div>
            <h3 style="font-family:var(--font-heading); font-size:17px; font-weight:700; color:#191716; margin:0;">Sign-off &amp; Commit PO in S/4HANA</h3>
            <span style="font-size:12px; color:#8C867F;">Final Adjudication Authorization</span>
          </div>
        </div>
        <button class="pf-btn-pill pf-btn-outline" style="width:30px; height:30px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:50%;" onclick="document.getElementById('award-modal').classList.add('hidden')">
          ✕
        </button>
      </div>

      <div style="background:#FAF8F5; border:1px solid #EDEAE4; border-radius:16px; padding:14px; display:flex; flex-direction:column; gap:8px; font-size:12.5px;">
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#8C867F;">Selected Vendor:</span>
          <strong style="color:#191716;">SONDA Colombia S.A.</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#8C867F;">Follow-on PO Document:</span>
          <strong style="font-family:monospace; color:#191716;">PO 450009180 (NB Standard)</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#8C867F;">Total Commitment:</span>
          <strong style="font-family:var(--font-heading); color:#E0533C; font-size:14px;">$21,375,000 COP</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span style="color:#8C867F;">Net Verified Savings:</span>
          <strong style="color:#15803D;">$3,562,500 COP (-14.3%)</strong>
        </div>
      </div>

      <p style="font-size:12px; color:#4B4643; line-height:1.5; margin:0;">
        By authorizing committee sign-off, an official cXML OrderRequest will be dispatched via OData v4 directly to SAP S/4HANA with zero middleware modification. Polite sealed notices will be automatically generated for runners-up (Indorama Ventures, BASF).
      </p>

      <div class="flex items-center justify-end gap-3 pt-3 border-t border-[#EDEAE4]">
        <button class="pf-btn-secondary" style="font-size:12px; padding:8px 16px; border-radius:9999px;" onclick="document.getElementById('award-modal').classList.add('hidden')">
          Cancel
        </button>
        <button class="pf-btn-coral" style="font-size:12px; font-weight:700; padding:8px 20px; border-radius:9999px;" onclick="this.innerHTML='Committed via OData ✓'; this.style.background='#15803D'; setTimeout(()=>{ document.getElementById('award-modal').classList.add('hidden'); if(typeof approveAndDispatchPoToSap === 'function') approveAndDispatchPoToSap(); }, 1000);">
          Confirm &amp; Transmit PO &rarr;
        </button>
      </div>
    </div>
  </div>
`;

  html = html.replace('<!-- Toast Container -->', modalsCode + '\n  <!-- Toast Container -->');
}

// Bump version in index.html
html = html.replace(/pf-overrides\.css\?v=[0-9.]+/g, 'pf-overrides.css?v=11.0');

fs.writeFileSync(indexPath, html, 'utf8');
console.log("Successfully applied Stitch layout in Home Page theme to index.html!");
