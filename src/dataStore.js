// Alpek Demo Procurement Platform - Complete Enterprise Data Store
// Comprehensive 11-Stage Procure-to-Pay Lifecycle with Strict RBAC
import { randomUUID } from 'node:crypto';

export class DataStore {
  constructor() {
    this.resetToDefaults();
  }

  resetToDefaults() {
    // -------------------------------------------------------------------------
    // 1. RBAC USER DIRECTORY (10 Dedicated Procurement Personas)
    // -------------------------------------------------------------------------
    this.users = [
      {
        id: 'usr-requester',
        username: 'carlos.ramirez',
        name: 'Carlos Ramirez',
        role: 'requester',
        roleLabel: 'Employee / Requester',
        department: 'Plant Operations (OP ANG)',
        email: 'carlos.ramirez@abccompany.com',
        initials: 'CR',
        avatarColor: '#d97706',
        description: 'Creates Purchase Requisitions (PR) for operational plant materials, consumables, and services.',
        permissions: ['create_pr', 'edit_own_pr', 'view_own_prs', 'view_own_deliveries']
      },
      {
        id: 'usr-manager',
        username: 'david.vance',
        name: 'David Vance',
        role: 'manager',
        roleLabel: 'Department Manager / Finance',
        department: 'Operations & Finance Management',
        email: 'david.vance@abccompany.com',
        initials: 'DV',
        avatarColor: '#2563eb',
        description: 'Checks business necessity, budget availability, and cost centers. Approves, rejects, or returns PRs.',
        permissions: ['view_dept_prs', 'approve_pr', 'reject_pr', 'return_pr', 'view_budgets']
      },
      {
        id: 'usr-buyer',
        username: 'valeria.martinez',
        name: 'Valeria Martinez',
        role: 'buyer',
        roleLabel: 'Procurement Buyer',
        department: 'Strategic Sourcing & Category Management',
        email: 'valeria.martinez@abccompany.com',
        initials: 'VM',
        avatarColor: '#0854a0',
        description: 'Converts approved PRs into RFQs, sets specifications, deadlines, invites suppliers, and manages bidding.',
        permissions: ['create_rfq', 'edit_rfq', 'invite_suppliers', 'view_rfq_workflow', 'recommend_award', 'generate_po']
      },
      {
        id: 'usr-supplier-sonda',
        username: 'sonda.vendor',
        name: 'SONDA DE COLOMBIA S A',
        role: 'supplier',
        roleLabel: 'Invited Vendor (Supplier A)',
        department: 'Supplier Network (AN11459791479)',
        supplierId: 'SUP-SONDA',
        email: 'licitaciones@sonda.com.co',
        initials: 'SA',
        avatarColor: '#4f46e5',
        description: 'Invited external vendor. Strictly sees only RFQs invited to Supplier A, submit confidential quotes and POs.',
        permissions: ['view_invited_rfqs', 'submit_quotation', 'view_own_pos', 'dispatch_shipment']
      },
      {
        id: 'usr-supplier-indorama',
        username: 'indorama.vendor',
        name: 'INDORAMA PETROCHEM S A S',
        role: 'supplier',
        roleLabel: 'Invited Vendor (Supplier B)',
        department: 'Supplier Network (AN10928371928)',
        supplierId: 'SUP-101',
        email: 'bids@indorama.com',
        initials: 'SB',
        avatarColor: '#059669',
        description: 'Invited external vendor. Strictly confidential isolation from other competing suppliers.',
        permissions: ['view_invited_rfqs', 'submit_quotation', 'view_own_pos', 'dispatch_shipment']
      },
      {
        id: 'usr-tech-eval',
        username: 'victor.chen',
        name: 'Dr. Victor Chen',
        role: 'tech_evaluator',
        roleLabel: 'Technical Evaluator',
        department: 'Engineering & Quality Assurance',
        email: 'victor.chen@abccompany.com',
        initials: 'VC',
        avatarColor: '#0d9488',
        description: 'Authorized evaluation committee member. Scores technical suitability, ISO compliance, and specs (pricing sealed).',
        permissions: ['view_technical_bids', 'submit_technical_score']
      },
      {
        id: 'usr-comm-eval',
        username: 'sofia.morales',
        name: 'Sofia Morales',
        role: 'comm_evaluator',
        roleLabel: 'Commercial Evaluator',
        department: 'Commercial Spend Analysis',
        email: 'sofia.morales@abccompany.com',
        initials: 'SM',
        avatarColor: '#0284c7',
        description: 'Authorized committee member. Evaluates commercial unit pricing, tariffs, lead time, and payment terms.',
        permissions: ['view_commercial_bids', 'submit_commercial_score']
      },
      {
        id: 'usr-award-approver',
        username: 'carlos.fonseca',
        name: 'Carlos Alberto Fonseca',
        role: 'award_approver',
        roleLabel: 'Award Approver / Committee',
        department: 'Executive Spend & Cost Control',
        email: 'carlos.fonseca@abccompany.com',
        initials: 'CF',
        avatarColor: '#107e3e',
        description: 'Reviews side-by-side comparison, recommendation, budget, and justification. Approves award and signs off PO.',
        permissions: ['view_award_recommendations', 'approve_award', 'return_award', 'approve_po', 'dispatch_sap']
      },
      {
        id: 'usr-receiving',
        username: 'mateo.morales',
        name: 'Mateo Morales',
        role: 'receiving',
        roleLabel: 'Receiving Team / Warehouse',
        department: 'Plant Logistics & Inward Warehouse',
        email: 'mateo.morales@abccompany.com',
        initials: 'MM',
        avatarColor: '#ea580c',
        description: 'Plant inward logistics. Records Goods Receipt (GRN), partial batch deliveries, and inspection discrepancies.',
        permissions: ['view_confirmed_pos', 'record_goods_receipt', 'view_grn_archive']
      },
      {
        id: 'usr-admin',
        username: 'admin',
        name: 'System Administrator',
        role: 'admin',
        roleLabel: 'System Administrator',
        department: 'IT & Platform Operations',
        email: 'admin@abccompany.com',
        initials: 'SA',
        avatarColor: '#475569',
        description: 'User management, configuration, audit trail and health. No automatic access to sealed quotations.',
        permissions: ['manage_users', 'view_audit_trail', 'system_config', 'reset_demo']
      }
    ];

    // Default system user (switched upon persona sign-in)
    this.currentUser = this.users.find(u => u.id === 'usr-admin') || this.users[0];

    // -------------------------------------------------------------------------
    // 2. MASTER DATA (Suppliers, Plants, Cost Centers)
    // -------------------------------------------------------------------------
    this.suppliers = [
      {
        id: 'SUP-SONDA',
        sapVendorId: '0000100459',
        name: 'SONDA DE COLOMBIA S A',
        anid: 'AN11459791479',
        taxId: 'CO-900182741',
        country: 'CO',
        contactEmail: 'licitaciones@sonda.com.co',
        rating: 4.95,
        categories: ['Operational Consumables', 'Industrial Refrigeration', 'IT Services'],
        status: 'Active'
      },
      {
        id: 'SUP-101',
        sapVendorId: '0000100450',
        name: 'INDORAMA PETROCHEM S A S',
        anid: 'AN10928371928',
        taxId: 'CO-829104821',
        country: 'CO',
        contactEmail: 'bids@indorama.com',
        rating: 4.8,
        categories: ['Raw Materials', 'PTA Chemical', 'Polymer Resins'],
        status: 'Active'
      },
      {
        id: 'SUP-102',
        sapVendorId: '0000100451',
        name: 'BASF QUÍMICA COLOMBIA S.A.',
        anid: 'AN98273618291',
        taxId: 'CO-139281902',
        country: 'CO',
        contactEmail: 'tenders@basf.com',
        rating: 4.9,
        categories: ['Catalysts', 'Specialty Chemicals', 'Glycols'],
        status: 'Active'
      },
      {
        id: 'SUP-103',
        sapVendorId: '0000100452',
        name: 'PETROQUÍMICA DEL CARIBE S.A.',
        anid: 'AN01140029411',
        taxId: 'CO-860002144',
        country: 'CO',
        contactEmail: 'ventas@petroquimica.com.co',
        rating: 4.85,
        categories: ['Solvents', 'Industrial Chemicals', 'Lubricants'],
        status: 'Active'
      },
      {
        id: 'SUP-104',
        sapVendorId: '0000100453',
        name: 'DOW CHEMICAL COLOMBIA S.A.',
        anid: 'AN01294811094',
        taxId: 'CO-800140221',
        country: 'CO',
        contactEmail: 'licitaciones@dow.com',
        rating: 4.88,
        categories: ['Polymers', 'Industrial Gases', 'Coatings'],
        status: 'Active'
      }
    ];

    this.plants = [
      { id: 'PLT-OPANG', code: 'OP ANG', name: 'Gran Tierra Energy - Vereda Morrison', country: 'CO' },
      { id: 'PLT-1010', code: '1010', name: 'Altamira Petrochemical Complex', country: 'MX' }
    ];

    // -------------------------------------------------------------------------
    // 3. PURCHASE REQUISITIONS (PR)
    // -------------------------------------------------------------------------
    this.purchaseRequisitions = [
      {
        id: 'PR-3000010443',
        sapPrNumber: '3000010443',
        title: 'Industrial Refrigeration Supplies & Plant Consumables',
        purpose: 'Q4 Preventive Maintenance and compressor glycol charging for Plant Cooling Loop A.',
        department: 'Plant Operations (OP ANG)',
        costCenter: 'CC-90412-OPS',
        plant: 'OP ANG',
        plantName: 'Gran Tierra Energy - Vereda Morrison',
        requesterId: 'usr-requester',
        requesterName: 'Carlos Ramirez',
        managerId: 'usr-manager',
        managerName: 'David Vance',
        status: 'APPROVED', // DRAFT, PENDING_MANAGER_APPROVAL, RETURNED_FOR_CORRECTION, REJECTED, APPROVED, IN_SOURCING, ORDERED, CLOSED
        requiredDate: '2026-11-20',
        estimatedBudget: 24937500.00,
        currency: 'COP',
        createdAt: '2026-10-15T09:00:00Z',
        managerApprovedAt: '2026-10-15T14:30:00Z',
        managerComments: 'Approved. Essential maintenance requirement aligned with Q4 operational budget CC-90412.',
        linkedRfqId: 'Doc2432956265',
        linkedPoId: null,
        lineItems: [
          {
            itemNo: '10',
            materialNo: '2.1.1 SUMINITRO',
            description: 'SUMINISTROS REFRI - Industrial Refrigerant & Consumables',
            quantity: 7125000,
            unit: 'Unit',
            targetUnitPrice: 3.50,
            estimatedTotal: 24937500.00
          }
        ],
        history: [
          { timestamp: '2026-10-15T09:00:00Z', actor: 'Carlos Ramirez', action: 'CREATED_SUBMITTED', comment: 'Initial requisition created with budget estimate $24.937.500 COP' },
          { timestamp: '2026-10-15T14:30:00Z', actor: 'David Vance', action: 'MANAGER_APPROVED', comment: 'Approved under Q4 plant operating budget' }
        ]
      },
      {
        id: 'PR-10009241',
        sapPrNumber: '10009241',
        title: 'Bulk Purified Terephthalic Acid (PTA) High Purity',
        purpose: 'Raw material procurement for Polymerization Reactor 2.',
        department: 'Plant Operations (OP ANG)',
        costCenter: 'CC-80120-CHEM',
        plant: '1010',
        plantName: 'Altamira Petrochemical Complex',
        requesterId: 'usr-requester',
        requesterName: 'Carlos Ramirez',
        managerId: 'usr-manager',
        managerName: 'David Vance',
        status: 'PENDING_MANAGER_APPROVAL',
        requiredDate: '2026-11-30',
        estimatedBudget: 425000.00,
        currency: 'USD',
        createdAt: '2026-10-25T11:00:00Z',
        managerApprovedAt: null,
        managerComments: null,
        linkedRfqId: null,
        linkedPoId: null,
        lineItems: [
          {
            itemNo: '10',
            materialNo: 'MAT-CHEM-1040',
            description: 'Purified Terephthalic Acid (PTA) High Purity 99.8%',
            quantity: 500,
            unit: 'TON',
            targetUnitPrice: 850.00,
            estimatedTotal: 425000.00
          }
        ],
        history: [
          { timestamp: '2026-10-25T11:00:00Z', actor: 'Carlos Ramirez', action: 'CREATED_SUBMITTED', comment: 'Submitted for Department Manager budget verification' }
        ]
      },
      {
        id: 'PR-3000073340',
        sapPrNumber: '3000073340',
        title: 'toothbrush',
        purpose: 'Plant operational hygiene demand requested via portal',
        department: 'Plant Operations (OP ANG)',
        costCenter: 'CC-90412-OPS',
        plant: 'OP ANG',
        plantName: 'Gran Tierra Energy - Vereda Morrison',
        requesterId: 'usr-requester',
        requesterName: 'Carlos Ramirez',
        managerId: 'usr-manager',
        managerName: 'David Vance',
        status: 'APPROVED',
        requiredDate: '2026-11-25',
        estimatedBudget: 500000.00,
        currency: 'COP',
        createdAt: '2026-10-29T13:15:26.958Z',
        managerApprovedAt: '2026-10-29T13:15:52.976Z',
        managerComments: 'Approved under Q4 operational budget by David Vance.',
        linkedRfqId: null,
        linkedPoId: null,
        lineItems: [
          {
            itemNo: '10',
            materialNo: 'MAT-GEN-100',
            description: 'toothbrush',
            quantity: 50000,
            unit: 'Unit',
            targetUnitPrice: 10.00,
            estimatedTotal: 500000.00
          }
        ],
        history: [
          { timestamp: '2026-10-29T13:15:26.958Z', actor: 'Carlos Ramirez', action: 'PR_CREATED', comment: 'Created PR with budget 500000 COP' },
          { timestamp: '2026-10-29T13:15:52.976Z', actor: 'David Vance', action: 'MANAGER_APPROVED', comment: 'Approved under Q4 operational budget by David Vance.' }
        ]
      }
    ];

    // -------------------------------------------------------------------------
    // 4. REQUEST FOR QUOTATIONS (RFQ)
    // -------------------------------------------------------------------------
    this.rfqs = [
      {
        id: 'Doc2432956265',
        projectId: '2000000892',
        title: 'Sourcing Project Test V2 (SUMINISTROS REFRI)',
        sourcePrId: 'PR-3000010443',
        sapPrNumber: '3000010443',
        buyerId: 'usr-buyer',
        buyerName: 'Valeria Martinez',
        plant: 'OP ANG',
        plantName: 'Gran Tierra Energy - Vereda Morrison',
        currency: 'COP',
        status: 'OPEN_FOR_BIDDING', // DRAFT, OPEN_FOR_BIDDING, UNDER_EVALUATION, PENDING_AWARD_APPROVAL, AWARDED, PO_GENERATED, CANCELLED
        deadline: new Date(Date.now() + 3600000 * 24).toISOString(), // 24 hours live countdown
        createdAt: '2026-10-16T10:00:00Z',
        publishedAt: '2026-10-16T12:00:00Z',
        commercialTerms: 'Payment Terms: Net 60 Days. Delivery: DDP Plant Vereda Morrison. Warranty: 12 months guarantee.',
        specifications: 'Consumables must comply with ISO 9001:2015 and GTE Colombia environmental safety protocols for Altamira & Vereda Morrison.',
        invitedSuppliers: ['SUP-SONDA', 'SUP-101', 'SUP-102'],
        lineItems: [
          {
            itemNo: '2.1.1',
            materialNo: 'SUMINITRO',
            description: 'SUMINISTROS REFRI - Quantities & Unit Tariffs',
            quantity: 7125000,
            unit: 'Unit',
            targetPrice: 3.50,
            estimatedTotal: 24937500.00
          }
        ],
        // Architecture diagram fields: Technical & Economic Requirements configured by Buyer
        technicalRequirements: {
          configuredAt: '2026-10-16T10:30:00Z',
          configuredBy: 'Valeria Martinez',
          specifications: 'ISO 9001:2015 Quality Management Certification (Valid). Comply with GTE Colombia environmental safety protocols for Altamira & Vereda Morrison operations. Refrigerants must meet F-Gas compliance standards.',
          certifications: ['ISO 9001:2015', 'F-Gas Certified', 'Environmental Safety Protocol GTE-COL'],
          complianceCriteria: 'Mandatory ISO certification. Lead time max 14 business days. DDP delivery to Plant Vereda Morrison.'
        },
        economicRequirements: {
          configuredAt: '2026-10-16T10:45:00Z',
          configuredBy: 'Valeria Martinez',
          targetUnitPrice: 3.50,
          currency: 'COP',
          paymentTerms: 'Net 60 Days',
          deliveryTerms: 'DDP - Delivered Duty Paid to Plant Vereda Morrison',
          budgetCeiling: 24937500.00
        },
        biddingClosedAt: null,
        biddingClosedBy: null,
        // Award notification sent to winning supplier after Internal Approval Process
        awardNotifiedAt: null,
        awardNotifiedTo: null,
        evaluations: {
          technical: {
            evaluatorId: 'usr-tech-eval',
            evaluatorName: 'Dr. Victor Chen',
            completedAt: '2026-10-20T14:00:00Z',
            scores: {
              'SUP-SONDA': { score: 98, passed: true, comments: 'ISO 9001 certified valid through 2028. Technical specs fully verified.' },
              'SUP-101': { score: 92, passed: true, comments: 'Certified, acceptable technical specs.' },
              'SUP-102': { score: 90, passed: true, comments: 'Compliant technical requirements.' }
            }
          },
          commercial: {
            evaluatorId: 'usr-comm-eval',
            evaluatorName: 'Sofia Morales',
            completedAt: '2026-10-20T16:00:00Z',
            scores: {
              'SUP-SONDA': { score: 95, unitPrice: 3.00, total: 21375000.00, savingsPct: 14.3, comments: 'Lowest total evaluated price ($3,00 COP). Fastest lead time (8 days).' },
              'SUP-101': { score: 88, unitPrice: 3.25, total: 23156250.00, savingsPct: 7.1, comments: 'Tariff $3,25 COP.' },
              'SUP-102': { score: 85, unitPrice: 3.40, total: 24225000.00, savingsPct: 2.8, comments: 'Tariff $3,40 COP.' }
            }
          }
        },
        recommendedSupplierId: 'SUP-SONDA',
        awardJustification: 'SONDA DE COLOMBIA S A submitted the lowest compliant bid ($21.375.000 COP), yielding $3.562.500 COP (14.3%) in verified budget savings with the fastest delivery lead time (8 days). Recommended by Buyer and Committee.',
        awardedTo: null,
        awardedPoId: null,
        history: [
          { timestamp: '2026-10-16T10:00:00Z', actor: 'Valeria Martinez', action: 'RFQ_CREATED', comment: 'Created RFQ from approved PR 3000010443' },
          { timestamp: '2026-10-16T11:30:00Z', actor: 'Elena Gomez', action: 'RFQ_APPROVED', comment: 'Approved RFQ specifications & terms' },
          { timestamp: '2026-10-16T12:00:00Z', actor: 'System', action: 'PUBLISHED', comment: 'Published to 3 invited vendors' },
          { timestamp: '2026-10-20T17:00:00Z', actor: 'Valeria Martinez', action: 'RECOMMENDED_AWARD', comment: 'Recommended SONDA DE COLOMBIA as winning scenario' }
        ]
      }
    ];

    // -------------------------------------------------------------------------
    // 5. SUPPLIER QUOTATIONS (Confidential / Sealed Bids)
    // -------------------------------------------------------------------------
    this.quotations = [
      {
        id: 'QUO-GTE-SONDA',
        rfqId: 'Doc2432956265',
        supplierId: 'SUP-SONDA',
        supplierName: 'SONDA DE COLOMBIA S A',
        submittedAt: '2026-10-18T14:22:00Z',
        status: 'SUBMITTED', // DRAFT, SUBMITTED, EVALUATED, AWARDED, REJECTED
        currency: 'COP',
        leadTimeDays: 8,
        paymentTerms: 'Net 60 Days',
        isoCertified: true,
        technicalProposal: 'Complete operational supply conforming to Anexo No 2. ISO 9001:2015 certification attached and active.',
        lineItemBids: [
          { itemNo: '2.1.1', unitPrice: 3.00, total: 21375000.00 }
        ],
        totalBidAmount: 21375000.00,
        score: 96.4
      },
      {
        id: 'QUO-GTE-INDORAMA',
        rfqId: 'Doc2432956265',
        supplierId: 'SUP-101',
        supplierName: 'INDORAMA PETROCHEM S A S',
        submittedAt: '2026-10-18T11:15:00Z',
        status: 'SUBMITTED',
        currency: 'COP',
        leadTimeDays: 12,
        paymentTerms: 'Net 45 Days',
        isoCertified: true,
        technicalProposal: 'Standard supply for refrigeration consumables.',
        lineItemBids: [
          { itemNo: '2.1.1', unitPrice: 3.25, total: 23156250.00 }
        ],
        totalBidAmount: 23156250.00,
        score: 91.2
      },
      {
        id: 'QUO-GTE-BASF',
        rfqId: 'Doc2432956265',
        supplierId: 'SUP-102',
        supplierName: 'BASF QUÍMICA COLOMBIA S.A.',
        submittedAt: '2026-10-17T09:40:00Z',
        status: 'SUBMITTED',
        currency: 'COP',
        leadTimeDays: 14,
        paymentTerms: 'Net 30 Days',
        isoCertified: true,
        technicalProposal: 'Supply with regional technical field support.',
        lineItemBids: [
          { itemNo: '2.1.1', unitPrice: 3.40, total: 24225000.00 }
        ],
        totalBidAmount: 24225000.00,
        score: 88.5
      }
    ];

    // -------------------------------------------------------------------------
    // 6. SUPPLIER QUESTIONS & ANSWERS (Q&A Clarifications)
    // -------------------------------------------------------------------------
    this.rfqQuestions = [
      {
        id: 'QA-01',
        rfqId: 'Doc2432956265',
        supplierId: 'SUP-SONDA',
        supplierName: 'SONDA DE COLOMBIA S A',
        question: 'Could Alpek Demo confirm if partial delivery in batches of 2.000.000 units is acceptable during week 1?',
        answer: 'Yes, batch delivery to Vereda Morrison receiving dock is permitted provided first batch arrives by Nov 10.',
        createdAt: '2026-10-17T10:15:00Z',
        answeredAt: '2026-10-17T14:00:00Z',
        isPublic: true
      }
    ];

    // -------------------------------------------------------------------------
    // 7. PURCHASE ORDERS & DELIVERIES (Traceable to PR & RFQ)
    // -------------------------------------------------------------------------
    this.purchaseOrders = [
      {
        id: 'PO-450009180',
        sapPoNumber: '450009180',
        rfqId: 'Doc2432956265',
        rfqTitle: 'Sourcing Project Test V2 (SUMINISTROS REFRI)',
        sourcePrId: 'PR-3000010443',
        sourcePrNumber: '3000010443',
        supplierId: 'SUP-SONDA',
        supplierName: 'SONDA DE COLOMBIA S A',
        vendorSapCode: '0000100459',
        buyerId: 'usr-buyer',
        buyerName: 'Valeria Martinez',
        approverId: 'usr-award-approver',
        approverName: 'Carlos Alberto Fonseca',
        totalAmount: 21375000.00,
        currency: 'COP',
        plant: 'OP ANG',
        plantName: 'Gran Tierra Energy - Vereda Morrison',
        paymentTerms: 'Net 60 Days',
        status: 'SHIPPED_BY_SUPPLIER', // PENDING_PO_APPROVAL, PO_APPROVED, SENT_TO_SAP, SAP_CONFIRMED, SHIPPED_BY_SUPPLIER, PARTIALLY_DELIVERED, FULLY_DELIVERED, CLOSED_COMPLETED
        createdAt: '2026-10-21T10:00:00Z',
        approvedAt: '2026-10-21T10:30:00Z',
        sapConfirmedAt: '2026-10-21T10:31:00Z',
        shippedAt: '2026-10-23T08:00:00Z',
        closedAt: null,
        sapIntegration: {
          status: 'POSTED_CONFIRMED',
          sapPoNumber: '450009180',
          payloadType: 'cXML 1.2.040 OrderRequest & S/4HANA OData',
          timestamp: '2026-10-21T10:31:00Z',
          retries: 0
        },
        lineItems: [
          {
            itemNo: '2.1.1',
            materialNo: 'SUMINITRO',
            description: 'SUMINISTROS REFRI - Quantities & Unit Tariffs',
            orderedQuantity: 7125000,
            unit: 'Unit',
            unitPrice: 3.00,
            totalPrice: 21375000.00,
            receivedQuantity: 3500000, // Partial delivery already recorded!
            remainingQuantity: 3625000
          }
        ],
        goodsReceipts: [
          {
            id: 'GRN-2026-001',
            receivedDate: '2026-10-25T14:30:00Z',
            receivedBy: 'Receiving Team Dock 4 (Mateo Morales)',
            deliveryNoteNo: 'REM-89214-SONDA',
            carrier: 'Trans-Caribe Logistics',
            receivedQuantity: 3500000,
            discrepancyNotes: 'Batch 1 of 2 delivered in good condition. COA certificate matched assay. 3.625.000 units pending batch 2.',
            inspectionPassed: true
          }
        ],
        history: [
          { timestamp: '2026-10-21T10:00:00Z', actor: 'Valeria Martinez', action: 'PO_GENERATED', comment: 'PO generated from approved award scenario' },
          { timestamp: '2026-10-21T10:30:00Z', actor: 'Carlos Alberto Fonseca', action: 'PO_APPROVED', comment: 'Final financial sign-off granted' },
          { timestamp: '2026-10-21T10:31:00Z', actor: 'Clean Core Gateway', action: 'SAP_COMMITTED', comment: 'Transmitted to SAP S/4HANA and written to Excel sheet' },
          { timestamp: '2026-10-23T08:00:00Z', actor: 'SONDA DE COLOMBIA S A', action: 'SHIPPED', comment: 'Supplier dispatched Batch 1 under Waybill REM-89214' },
          { timestamp: '2026-10-25T14:30:00Z', actor: 'Receiving Team Dock 4', action: 'GOODS_RECEIPT_PARTIAL', comment: 'Recorded partial receipt of 3.500.000 units' }
        ]
      }
    ];

    // -------------------------------------------------------------------------
    // 8. AUDIT LOGS & INTEGRATION
    // -------------------------------------------------------------------------
    this.auditLogs = [
      {
        id: 'LOG-001',
        timestamp: '2026-10-21T10:31:00Z',
        protocol: 'Clean Core OData v4',
        direction: 'OUTBOUND',
        endpoint: '/sap/opu/odata4/sap/api_purchaseorder_2',
        status: 'SUCCESS',
        statusCode: 201,
        payloadType: 'JSON',
        referenceId: 'PO-450009180',
        message: 'Purchase Order 450009180 created in SAP S/4HANA via BAPI_PO_CREATE1 / Clean Core OData.'
      },
      {
        id: 'LOG-002',
        timestamp: '2026-10-21T10:31:15Z',
        protocol: 'cXML 1.2.040',
        direction: 'OUTBOUND',
        endpoint: 'https://supplier.sonda.com/cxml/OrderRequest',
        status: 'SUCCESS',
        statusCode: 200,
        payloadType: 'cXML OrderRequest',
        referenceId: 'PO-450009180',
        message: 'Standard cXML OrderRequest dispatched to SONDA DE COLOMBIA S A endpoint.'
      }
    ];

    this.sapSettings = {
      systemId: 'S4P',
      client: '100',
      cleanCoreMode: true,
      status: 'ONLINE',
      latencyMs: 38
    };
  }

  // Session & User Switching
  setCurrentUser(usernameOrRole) {
    const user = this.users.find(u => u.username === usernameOrRole || u.role === usernameOrRole || u.id === usernameOrRole || (usernameOrRole === 'marcela.pineda' && u.role === 'buyer') || (usernameOrRole === 'valeria.martinez' && u.role === 'buyer'));
    if (user) {
      this.currentUser = user;
      return user;
    }
    return null;
  }

  addAuditLog(entry) {
    const log = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    return log;
  }
}

export const db = new DataStore();
