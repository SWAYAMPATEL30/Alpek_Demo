# ALPEK SAP Supplier Linking Platform

> **SAP S/4HANA Clean Core Sourcing Platform** (Alternative to SAP Ariba Sourcing & Supplier Network)
> Engineered specifically for ALPEK chemical, polyester, and refining operations based on the [Client Discovery Questions](file:///c:/Users/ipate/OneDrive/Documents/REA/src/domain/ALPEK%20SAP%20Supplier%20Linking%20Platform%20Client%20Discovery%20Questions.docx).

---

## 🌟 Executive Summary

The **ALPEK SAP Supplier Linking Platform** connects internal buyers and approvers with external global suppliers through a clean, modern interface directly synchronized with **SAP S/4HANA**.

It eliminates manual spreadsheet tenders and phone negotiations while maintaining strict **Clean Core compliance**:
1. **Inbound S/4HANA Requisitions**: Seamlessly pulls Purchase Requisitions via standard OData v4 (`/API_PURCHASEREQ_PROCESS_SRV`).
2. **Multi-Supplier Bidding**: Invites qualified vendors to submit line-item pricing, lead times, and terms.
3. **Side-by-Side Comparison Matrix**: Analyzes bids, scores proposals, calculates savings vs target budget, and enforces approval thresholds.
4. **Automated SAP Award & cXML Dispatch**: Awarding a bid immediately commits the Purchase Order to S/4HANA via OData v4 and sends a standard **cXML 1.2.040 `OrderRequest`** to the winning vendor.

---

## 🏗️ Architecture & Alignment with Discovery Questions

| Discovery Question Section | How the Platform Solves It |
| :--- | :--- |
| **1. Architecture & System Landscape** | Standalone high-performance platform interfacing directly with S/4HANA via SAP Cloud Connector / BTP Destination. Supports plants Altamira (1010), Columbia (2020), and Cosoleacaque (3030). |
| **2. Network Security & Gateway** | Built for reverse proxy / SAP Cloud Connector (SCC) tunnel with encrypted HTTPS transport and IP whitelisting. |
| **3. Integration Approach** | **Dual capability**: Standard REST/OData v4 direct integration + Middleware payloads (**cXML OrderRequest** and **SAP IDoc ORDERS05**). |
| **4. Clean Core Strategy** | **Zero custom ABAP or Z-tables required**. Operates 100% on standard SAP Business Objects (`PurchaseRequisition` and `PurchaseOrder`). |
| **5. Authentication & Protocols** | Pre-configured for OAuth 2.0 / SAML 2.0 / BTP Principal Propagation for buyers, and secure vendor credential access for suppliers. |
| **6. Triggers & Error Handling** | Real-time event-driven sync + scheduled polling. Complete Integration Console with transaction audit logs and retry capabilities. |
| **7. Procurement Data Master** | Syncs SAP Vendor Master (Vendor IDs, Tax IDs/RFC, DUNS, category classifications) and material codes. |
| **8. Multi-Entity & Roles** | Multi-plant (1010, 2020, 3030), multi-currency (USD, MXN, EUR), and role-based views (Buyer / Approver vs External Supplier). |

---

## 🚀 Quick Start (Running Locally)

The platform runs on Node.js with zero database configuration required:

```powershell
# 1. Navigate to the platform directory
cd apps/alpek-supplier-platform

# 2. Start the server
node server.js
```

Then open your browser to:
👉 **`http://localhost:4000`**

---

## 🎯 Key Features to Try in the Demo

1. **Role Switcher (Top Header)**:
   - Toggle between **👔 Buyer Mode** and **🏭 Supplier Portal Mode**.
   - Select different supplier accounts (Indorama, BASF, Mexichem, Eastman) to experience the supplier-side bidding inbox.
2. **Side-by-Side Quotation Comparison Matrix**:
   - Click on tender `RFQ-2026-001`.
   - View the comparison matrix highlighting the lowest bids per item, overall lowest total, and supplier evaluation scores.
3. **Award & Push to SAP**:
   - In Buyer mode, click **"Award & Push to SAP"** on a winning quote.
   - Watch the platform commit the PO to S/4HANA in real-time, generate the cXML payload, and update the PR status.
4. **Download / Inspect cXML & SAP IDoc**:
   - Go to **Purchase Orders** and click the **"cXML"** or **"ORDERS05"** buttons to inspect the raw XML documents.
5. **Simulate Real-Time SAP Sync**:
   - Click **"🔄 Sync SAP PRs"** in the top bar to simulate an incoming requisition arriving through the SAP Cloud Connector.
