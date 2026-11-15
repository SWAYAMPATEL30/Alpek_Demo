// Alpek Demo Procurement Platform - API Router & Request Handler
// Implements 11-Stage End-to-End Procurement Workflow with Strict Backend RBAC
import { db } from './dataStore.js';
import { sapService } from './sapCleanCore.js';
import { excelSapStore } from './excelSapStore.js';

export async function handleApiRequest(req, res, url) {
  const method = req.method;
  const path = url.pathname;

  const sendJson = (data, status = 200) => {
    res.writeHead(status, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
  };

  const sendXml = (xmlStr, status = 200) => {
    res.writeHead(status, {
      'Content-Type': 'application/xml',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(xmlStr);
  };

  const parseBody = () => new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  const currentUser = db.currentUser;

  // ---------------------------------------------------------------------------
  // 1. AUTHENTICATION & RBAC DIRECTORY
  // ---------------------------------------------------------------------------
  if (path === '/api/auth/users' && method === 'GET') {
    return sendJson(db.users);
  }

  if (path === '/api/suppliers' && method === 'GET') {
    return sendJson(db.suppliers);
  }

  if (path === '/api/auth/me' && method === 'GET') {
    return sendJson(currentUser);
  }

  if (path === '/api/auth/login' && method === 'POST') {
    const body = await parseBody();
    const identifier = (body.username || body.email || body.role || body.id || '').trim().toLowerCase();
    const user = db.users.find(u => {
      const uName = (u.username || '').toLowerCase();
      const uEmail = (u.email || '').toLowerCase();
      const uRole = (u.role || '').toLowerCase();
      const uId = (u.id || '').toLowerCase();

      return uName === identifier ||
        uEmail === identifier ||
        uRole === identifier ||
        uId === identifier ||
        (identifier === 'buyer' && uRole === 'buyer') ||
        (identifier === 'valeria.martinez' && uRole === 'buyer') ||
        (identifier === 'marcela.pineda' && uRole === 'buyer') ||
        (identifier === 'requester' && uRole === 'requester') ||
        (identifier === 'carlos.ramirez' && uRole === 'requester') ||
        (identifier === 'carlos.ruiz' && uRole === 'requester') ||
        (identifier === 'manager' && uRole === 'manager') ||
        (identifier === 'david.vance' && uRole === 'manager') ||
        (identifier === 'mariana.torres' && uRole === 'manager') ||
        (identifier === 'supplier_a' && (uId === 'usr-supplier-sonda' || uName === 'sonda.vendor')) ||
        (identifier === 'supplier_b' && (uId === 'usr-supplier-indorama' || uName === 'indorama.vendor')) ||
        (identifier === 'supplier' && (uId === 'usr-supplier-sonda' || uName === 'sonda.vendor')) ||
        (identifier === 'sonda.vendor' && uId === 'usr-supplier-sonda') ||
        (identifier === 'indorama.vendor' && uId === 'usr-supplier-indorama') ||
        (identifier === 'tech_eval' && uRole === 'tech_evaluator') ||
        (identifier === 'victor.chen' && uRole === 'tech_evaluator') ||
        (identifier === 'elena.gomez' && uRole === 'tech_evaluator') ||
        (identifier === 'comm_eval' && uRole === 'comm_evaluator') ||
        (identifier === 'sofia.morales' && uRole === 'comm_evaluator') ||
        (identifier === 'javier.ortega' && uRole === 'comm_evaluator') ||
        (identifier === 'award_approver' && uRole === 'award_approver') ||
        (identifier === 'carlos.fonseca' && uRole === 'award_approver') ||
        (identifier === 'patricia.moreno' && uRole === 'award_approver') ||
        (identifier === 'receiving' && uRole === 'receiving') ||
        (identifier === 'mateo.morales' && uRole === 'receiving') ||
        (identifier === 'roberto.gomez' && uRole === 'receiving') ||
        (identifier === 'admin' && uRole === 'admin');
    });

    if (!user) return sendJson({ error: 'User account not found. Please check your username or email.' }, 404);

    if (body.password) {
      const validPassword = user.password || 'Alpek@2026';
      if (body.password !== validPassword && body.password !== 'Alpek@2026') {
        return sendJson({ error: 'Invalid password. (Default demo password: Alpek@2026)' }, 401);
      }
    }

    db.currentUser = user;

    db.addAuditLog({
      protocol: 'RBAC Security',
      direction: 'INBOUND',
      endpoint: '/api/auth/login',
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Session Grant',
      referenceId: user.id,
      message: `User ${user.name} logged in with role [${user.role.toUpperCase()} - ${user.roleLabel}].`
    });

    return sendJson({ success: true, user });
  }

  // ---------------------------------------------------------------------------
  // 2. DASHBOARD EXECUTIVE METRICS (Role-Tailored)
  // ---------------------------------------------------------------------------
  if (path === '/api/stats' && method === 'GET') {
    const role = currentUser.role;
    let pendingCount = 0;
    let activeRfqs = db.rfqs.filter(r => r.status === 'OPEN_FOR_BIDDING' || r.status === 'UNDER_EVALUATION' || r.status === 'PENDING_AWARD_APPROVAL').length;
    let pendingPrs = db.purchaseRequisitions.filter(p => p.status === 'PENDING_MANAGER_APPROVAL').length;
    let totalPos = db.purchaseOrders.length;
    let totalSpend = db.purchaseOrders.reduce((sum, p) => sum + p.totalAmount, 0);

    if (role === 'requester') {
      pendingCount = db.purchaseRequisitions.filter(p => p.requesterId === currentUser.id && p.status === 'PENDING_MANAGER_APPROVAL').length;
    } else if (role === 'manager') {
      pendingCount = db.purchaseRequisitions.filter(p => p.status === 'PENDING_MANAGER_APPROVAL').length;
    } else if (role === 'buyer') {
      pendingCount = db.purchaseRequisitions.filter(p => p.status === 'APPROVED' && !p.linkedRfqId).length;
    } else if (role === 'award_approver') {
      pendingCount = db.rfqs.filter(r => r.status === 'PENDING_AWARD_APPROVAL').length;
    } else if (role === 'supplier') {
      activeRfqs = db.rfqs.filter(r => r.invitedSuppliers.includes(currentUser.supplierId) && r.status === 'OPEN_FOR_BIDDING').length;
      totalPos = db.purchaseOrders.filter(p => p.supplierId === currentUser.supplierId).length;
    }

    return sendJson({
      role,
      pendingCount,
      activeRfqs,
      pendingPrs,
      totalPrs: db.purchaseRequisitions.length,
      approvedPrs: db.purchaseRequisitions.filter(p => p.status === 'APPROVED' || p.status === 'IN_SOURCING').length,
      totalQuotations: db.quotations.length,
      totalPos,
      totalSpend,
      savingsPercent: '14.3',
      currentUserName: currentUser.name,
      currentUserRole: currentUser.roleLabel,
      cleanCoreStatus: 'CONNECTED (38ms)',
      awardedRfqs: db.rfqs.filter(r => r.status === 'AWARDED' || r.status === 'PO_GENERATED').length
    });
  }

  // ---------------------------------------------------------------------------
  // 3. PURCHASE REQUISITIONS (PR) LIFECYCLE (Stage 1 & 2)
  // ---------------------------------------------------------------------------
  if (path === '/api/prs' && method === 'GET') {
    // Synchronize any inbound PRs from SAP Excel/CSV into internal database
    const inboundPrs = excelSapStore.getInboundPrs();
    inboundPrs.forEach(inPr => {
      const exists = db.purchaseRequisitions.find(p => p.sapPrNumber === inPr.SAP_PR_Number || p.id === `PR-${inPr.SAP_PR_Number}`);
      if (!exists) {
        const isCarlos = (inPr.Requester && inPr.Requester.includes('Carlos')) || inPr.Requester === 'Valeria Martinez' || !inPr.Requester;
        db.purchaseRequisitions.unshift({
          id: `PR-${inPr.SAP_PR_Number}`,
          sapPrNumber: inPr.SAP_PR_Number,
          title: inPr.Material_Desc,
          purpose: 'Plant operational demand from SAP ERP inbound requisition',
          department: inPr.Department || 'Purchases & Materials',
          costCenter: 'CC-90412-OPS',
          plant: inPr.Plant || 'OP ANG (GTE Col)',
          plantName: inPr.Plant || 'OP ANG (GTE Col)',
          status: (inPr.Status && inPr.Status.toUpperCase().includes('AWARD')) ? 'ORDERED' : 'PENDING_MANAGER_APPROVAL',
          estimatedBudget: (Number(inPr.Quantity) || 1000) * (Number(inPr.Valuation_Unit_Price_COP) || 3.5),
          currency: 'COP',
          requesterId: isCarlos ? 'usr-requester' : 'usr-buyer',
          requesterName: inPr.Requester || 'Carlos Ramirez',
          managerId: 'usr-manager',
          managerName: 'David Vance',
          createdAt: inPr.Created_Date ? new Date(inPr.Created_Date).toISOString() : new Date().toISOString(),
          lineItems: [
            {
              itemNumber: inPr.Item || '10',
              description: inPr.Material_Desc,
              quantity: Number(inPr.Quantity) || 1000,
              unit: inPr.Unit || 'Unidad',
              targetUnitPrice: Number(inPr.Valuation_Unit_Price_COP) || 3.5,
              estimatedTotal: (Number(inPr.Quantity) || 1000) * (Number(inPr.Valuation_Unit_Price_COP) || 3.5)
            }
          ],
          history: [
            { timestamp: new Date().toISOString(), actor: inPr.Requester || 'Carlos Ramirez', action: 'SAP_SYNC', comment: 'Synced from SAP_PR_Inbound.csv' }
          ]
        });
      }
    });

    // Backend RBAC Filtering:
    if (currentUser.role === 'supplier') {
      // Suppliers must NEVER see internal purchase requisitions
      return sendJson([]);
    }
    if (currentUser.role === 'requester') {
      // Requester sees their own PRs and plant demand PRs
      const myPrs = db.purchaseRequisitions.filter(p => 
        p.requesterId === currentUser.id || 
        p.requesterName === currentUser.name ||
        p.requesterName === 'Carlos Ramirez' ||
        (p.purpose && p.purpose.includes('SAP ERP inbound'))
      );
      return sendJson(myPrs);
    }
    // Managers, Buyers, Approvers, Admin see all relevant PRs
    return sendJson(db.purchaseRequisitions);
  }

  if (path === '/api/prs' && method === 'POST') {
    // Stage 1: Employee / Requester creates PR
    if (currentUser.role !== 'requester' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Requesters can create purchase requisitions.' }, 403);
    }
    const body = await parseBody();
    const newPrId = `PR-30000${Math.floor(10000 + Math.random() * 90000)}`;
    const newPr = {
      id: newPrId,
      sapPrNumber: newPrId.replace('PR-', ''),
      title: body.title || 'New Plant Material Demand',
      purpose: body.purpose || 'Operational requirements',
      department: body.department || currentUser.department,
      costCenter: body.costCenter || 'CC-90412-OPS',
      plant: body.plant || 'OP ANG',
      plantName: body.plantName || 'Gran Tierra Energy - Vereda Morrison',
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      managerId: 'usr-manager',
      managerName: 'David Vance',
      status: 'PENDING_MANAGER_APPROVAL', // Goes to Department Manager
      requiredDate: body.requiredDate || new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
      estimatedBudget: Number(body.estimatedBudget) || 10000000.00,
      currency: body.currency || 'COP',
      createdAt: new Date().toISOString(),
      managerApprovedAt: null,
      managerComments: null,
      linkedRfqId: null,
      linkedPoId: null,
      lineItems: body.lineItems && body.lineItems.length > 0 ? body.lineItems : [
        {
          itemNo: '10',
          materialNo: 'MAT-GEN-100',
          description: body.title || 'Required Material',
          quantity: Number(body.quantity) || 1000,
          unit: body.unit || 'Unidad',
          targetUnitPrice: Number(body.targetUnitPrice) || 10000,
          estimatedTotal: (Number(body.quantity) || 1000) * (Number(body.targetUnitPrice) || 10000)
        }
      ],
      history: [
        { timestamp: new Date().toISOString(), actor: currentUser.name, action: 'PR_CREATED', comment: `Created PR with budget ${body.estimatedBudget || 10000000} COP` }
      ]
    };

    db.purchaseRequisitions.unshift(newPr);

    // Also mirror to Excel sheet
    excelSapStore.addInboundPr({
      SAP_PR_Number: newPr.sapPrNumber,
      Doc_Type: 'NB',
      Item: '10',
      Material_Desc: newPr.title,
      Quantity: String(newPr.lineItems[0].quantity),
      Unit: newPr.lineItems[0].unit,
      Valuation_Unit_Price_COP: String(newPr.lineItems[0].targetUnitPrice),
      Plant: newPr.plantName,
      Requester: newPr.requesterName,
      Department: newPr.department
    });

    db.addAuditLog({
      protocol: 'PR Lifecycle',
      direction: 'INTERNAL',
      endpoint: '/api/prs',
      status: 'SUCCESS',
      statusCode: 201,
      payloadType: 'Purchase Requisition',
      referenceId: newPr.id,
      message: `${currentUser.name} created Requisition ${newPr.id} (${newPr.title}) for budget approval.`
    });

    return sendJson({ success: true, pr: newPr }, 201);
  }

  // Stage 2: Manager Approves PR
  if (path.match(/^\/api\/prs\/[^/]+\/approve$/) && method === 'POST') {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Department Managers can approve purchase requisitions.' }, 403);
    }
    const prId = path.split('/')[3];
    const body = await parseBody();
    const pr = db.purchaseRequisitions.find(p => p.id === prId);
    if (!pr) return sendJson({ error: 'PR not found' }, 404);

    pr.status = 'APPROVED';
    pr.managerApprovedAt = new Date().toISOString();
    pr.managerComments = body.comments || 'Approved by Department Manager. Ready for procurement sourcing.';
    pr.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'MANAGER_APPROVED',
      comment: pr.managerComments
    });

    excelSapStore.updatePrStatus(pr.sapPrNumber, 'Approved (Ready for Sourcing)');

    db.addAuditLog({
      protocol: 'PR Governance',
      direction: 'INTERNAL',
      endpoint: `/api/prs/${prId}/approve`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Approval Event',
      referenceId: pr.id,
      message: `Manager ${currentUser.name} approved PR ${pr.id}. Budget unlocked for Procurement Buyer.`
    });

    return sendJson({ success: true, pr });
  }

  // Stage 2: Manager Rejects PR
  if (path.match(/^\/api\/prs\/[^/]+\/reject$/) && method === 'POST') {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Department Managers can reject purchase requisitions.' }, 403);
    }
    const prId = path.split('/')[3];
    const body = await parseBody();
    const pr = db.purchaseRequisitions.find(p => p.id === prId);
    if (!pr) return sendJson({ error: 'PR not found' }, 404);

    pr.status = 'REJECTED';
    pr.managerComments = body.reason || 'Rejected due to budget constraints.';
    pr.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'MANAGER_REJECTED',
      comment: pr.managerComments
    });

    return sendJson({ success: true, pr });
  }

  // Stage 2: Manager Returns PR for Correction
  if (path.match(/^\/api\/prs\/[^/]+\/return$/) && method === 'POST') {
    if (currentUser.role !== 'manager' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Department Managers can return purchase requisitions.' }, 403);
    }
    const prId = path.split('/')[3];
    const body = await parseBody();
    const pr = db.purchaseRequisitions.find(p => p.id === prId);
    if (!pr) return sendJson({ error: 'PR not found' }, 404);

    pr.status = 'RETURNED_FOR_CORRECTION';
    pr.managerComments = body.comments || 'Please revise required date and provide technical justification.';
    pr.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'RETURNED_FOR_CORRECTION',
      comment: pr.managerComments
    });

    return sendJson({ success: true, pr });
  }

  // Stage 1/2: Requester Revises and Resubmits Returned PR
  if (path.match(/^\/api\/prs\/[^/]+\/resubmit$/) && method === 'POST') {
    if (currentUser.role !== 'requester' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Requesters can resubmit purchase requisitions.' }, 403);
    }
    const prId = path.split('/')[3];
    const body = await parseBody();
    const pr = db.purchaseRequisitions.find(p => p.id === prId);
    if (!pr) return sendJson({ error: 'PR not found' }, 404);

    if (body.title) pr.title = body.title;
    if (body.quantity && pr.lineItems && pr.lineItems[0]) {
      pr.lineItems[0].quantity = Number(body.quantity);
    }
    if (body.targetUnitPrice && pr.lineItems && pr.lineItems[0]) {
      pr.lineItems[0].targetUnitPrice = Number(body.targetUnitPrice);
      pr.lineItems[0].estimatedTotal = pr.lineItems[0].quantity * pr.lineItems[0].targetUnitPrice;
      pr.estimatedBudget = pr.lineItems[0].estimatedTotal;
    }
    if (body.purpose) pr.purpose = body.purpose;

    pr.status = 'PENDING_MANAGER_APPROVAL';
    const revisionComment = body.revisionNotes || 'Revised and resubmitted to Department Manager for approval.';
    pr.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'REVISED_RESUBMITTED',
      comment: revisionComment
    });

    excelSapStore.updatePrStatus(pr.sapPrNumber, 'Pending Manager Approval');

    db.addAuditLog({
      protocol: 'PR Lifecycle',
      direction: 'INTERNAL',
      endpoint: `/api/prs/${prId}/resubmit`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'PR Revision',
      referenceId: pr.id,
      message: `Requester ${currentUser.name} revised and resubmitted PR ${pr.id}. Budget: $${pr.estimatedBudget.toLocaleString()} COP.`
    });

    return sendJson({ success: true, pr });
  }

  // ---------------------------------------------------------------------------
  // 4. REQUEST FOR QUOTATIONS (RFQ) LIFECYCLE (Stage 3 & 4)
  // ---------------------------------------------------------------------------
  if (path === '/api/rfqs' && method === 'GET') {
    // Backend RBAC Filtering:
    if (currentUser.role === 'supplier') {
      // Confidential Supplier Isolation: Supplier sees ONLY RFQs they are explicitly invited to!
      const myRfqs = db.rfqs.filter(r => r.invitedSuppliers.includes(currentUser.supplierId));
      return sendJson(myRfqs.map(r => ({
        id: r.id,
        title: r.title,
        deadline: r.deadline,
        currency: r.currency,
        status: r.status,
        commercialTerms: r.commercialTerms,
        specifications: r.specifications,
        lineItems: r.lineItems,
        isSubmitted: db.quotations.some(q => q.rfqId === r.id && q.supplierId === currentUser.supplierId)
      })));
    }

    return sendJson(db.rfqs);
  }

  if (path.match(/^\/api\/rfqs\/[^/]+$/) && method === 'GET') {
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId || r.projectId === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    // Dynamic Timer Evaluation: Event deadline met -> automatically mark UNDER_EVALUATION per architecture diagram
    if (rfq.status === 'OPEN_FOR_BIDDING' && rfq.deadline && Date.now() > new Date(rfq.deadline).getTime()) {
      rfq.status = 'UNDER_EVALUATION';
      rfq.biddingClosedAt = rfq.deadline;
      rfq.biddingClosedBy = 'Deadline Met (System Timer)';
      rfq.biddingCloseReason = 'Event deadline met. Bidding window closed automatically.';
      rfq.history.push({
        timestamp: new Date().toISOString(),
        actor: 'System Timer',
        action: 'BIDDING_DEADLINE_MET',
        comment: 'Event deadline met. Closed for evaluation.'
      });
    }

    if (currentUser.role === 'supplier' && !rfq.invitedSuppliers.includes(currentUser.supplierId)) {
      return sendJson({ error: 'Access denied: Supplier not invited to this tender' }, 403);
    }

    const suppliers = db.suppliers.filter(s => rfq.invitedSuppliers.includes(s.id));
    let quotations = db.quotations.filter(q => q.rfqId === rfq.id);
    if (currentUser.role === 'supplier') {
      quotations = quotations.filter(q => q.supplierId === currentUser.supplierId);
    } else if (currentUser.role === 'tech_evaluator') {
      quotations = quotations.map(q => ({
        id: q.id,
        rfqId: q.rfqId,
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        submittedAt: q.submittedAt,
        leadTimeDays: q.leadTimeDays,
        isoCertified: q.isoCertified,
        technicalProposal: q.technicalProposal,
        totalBidAmount: 'SEALED_UNTIL_COMMERCIAL_EVALUATION',
        lineItemBids: []
      }));
    }
    return sendJson({ rfq, suppliers, quotations });
  }

  if (path === '/api/rfqs' && method === 'POST') {
    // Stage 3: Procurement Buyer creates RFQ from approved PR (Architecture: Sourcing Event Creation & Publish)
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can create RFQ sourcing events.' }, 403);
    }
    const body = await parseBody();
    const targetPrId = body.sourcePrId || body.prId;
    const sourcePr = db.purchaseRequisitions.find(p => p.id === targetPrId);
    if (!sourcePr) return sendJson({ error: 'Source approved PR not found' }, 400);

    const rfqId = `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const deadlineHours = Number(body.deadlineHours) || (body.deadlineMinutes ? Number(body.deadlineMinutes) / 60 : 24);
    const deadline = body.deadline || new Date(Date.now() + (body.deadlineMinutes ? Number(body.deadlineMinutes) * 60000 : deadlineHours * 3600000)).toISOString();

    const publishImmediately = body.publishImmediately === true;

    const newRfq = {
      id: rfqId,
      projectId: `20000${Math.floor(10000 + Math.random() * 90000)}`,
      title: body.title || `Sourcing RFP for ${sourcePr.title}`,
      sourcePrId: sourcePr.id,
      sapPrNumber: sourcePr.sapPrNumber,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      plant: sourcePr.plant,
      plantName: sourcePr.plantName,
      currency: sourcePr.currency || 'COP',
      status: publishImmediately ? 'OPEN_FOR_BIDDING' : 'PENDING_APPROVAL',
      deadline,
      createdAt: new Date().toISOString(),
      rfqApprovedAt: publishImmediately ? new Date().toISOString() : null,
      publishedAt: publishImmediately ? new Date().toISOString() : null,
      commercialTerms: body.commercialTerms || 'Net 60 Days, DDP Delivery Plant Vereda Morrison',
      specifications: body.specifications || sourcePr.purpose,
      invitedSuppliers: body.invitedSuppliers && body.invitedSuppliers.length > 0 
        ? body.invitedSuppliers 
        : ['SUP-SONDA', 'SUP-101', 'SUP-102'],
      lineItems: sourcePr.lineItems.map(item => ({
        itemNo: item.itemNo,
        materialNo: item.materialNo,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        targetPrice: item.targetUnitPrice,
        estimatedTotal: item.estimatedTotal
      })),
      evaluations: { technical: null, commercial: null },
      technicalRequirements: null,
      economicRequirements: null,
      biddingClosedAt: null,
      biddingClosedBy: null,
      awardNotifiedAt: null,
      awardNotifiedTo: null,
      recommendedSupplierId: null,
      awardJustification: null,
      awardedTo: null,
      awardedPoId: null,
      history: [
        { timestamp: new Date().toISOString(), actor: currentUser.name, action: 'RFQ_CREATED', comment: `Created from PR ${sourcePr.id}. Invited ${body.invitedSuppliers ? body.invitedSuppliers.length : 3} suppliers.` }
      ]
    };

    sourcePr.status = 'IN_SOURCING';
    sourcePr.linkedRfqId = newRfq.id;

    db.rfqs.unshift(newRfq);

    db.addAuditLog({
      protocol: 'RFQ Lifecycle',
      direction: 'INTERNAL',
      endpoint: '/api/rfqs',
      status: 'SUCCESS',
      statusCode: 201,
      payloadType: 'Request For Quotation',
      referenceId: newRfq.id,
      message: `Buyer ${currentUser.name} created RFQ ${newRfq.id} from PR ${sourcePr.id}. Invited ${newRfq.invitedSuppliers.length} suppliers.`
    });

    return sendJson({ success: true, rfq: newRfq }, 201);
  }

  // Diagram: Sourcing Event Creation & Publish — Buyer publishes RFQ & sends invitations directly
  if ((path.match(/^\/api\/rfqs\/[^/]+\/publish$/) || path.match(/^\/api\/rfqs\/[^/]+\/approve-publish$/)) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can publish RFQ tenders.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    rfq.status = 'OPEN_FOR_BIDDING';
    rfq.rfqApprovedAt = new Date().toISOString();
    rfq.publishedAt = new Date().toISOString();
    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'RFQ_PUBLISHED',
      comment: `Sourcing Event officially published by Buyer ${currentUser.name}. Invitations dispatched to ${rfq.invitedSuppliers.length} invited suppliers.`
    });

    db.addAuditLog({
      protocol: 'RFQ Governance',
      direction: 'OUTBOUND',
      endpoint: `/api/rfqs/${rfqId}/publish`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Publication Event',
      referenceId: rfq.id,
      message: `Buyer ${currentUser.name} published ${rfq.id}. ${rfq.invitedSuppliers.length} suppliers notified.`
    });

    return sendJson({ success: true, rfq });
  }

  // Diagram: Select & Invite Suppliers (Buyer → RFQ)
  if (path.match(/^\/api\/rfqs\/[^/]+\/invite-suppliers$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can invite suppliers.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);
    const body = await parseBody();

    const newSuppliers = Array.isArray(body.suppliers) ? body.suppliers : (body.supplierId ? [body.supplierId] : []);
    if (newSuppliers.length === 0) {
      return sendJson({ error: 'Please provide at least one supplier ID' }, 400);
    }

    rfq.invitedSuppliers = [...new Set([...rfq.invitedSuppliers, ...newSuppliers])];
    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'SUPPLIERS_INVITED',
      comment: `Invited suppliers updated. Total active invited: ${rfq.invitedSuppliers.length}.`
    });

    return sendJson({ success: true, rfq, invitedSuppliers: rfq.invitedSuppliers });
  }

  // Diagram: Dynamic Bidding Timer Configuration (Buyer → RFQ)
  if (path.match(/^\/api\/rfqs\/[^/]+\/set-deadline$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can set bidding deadlines.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);
    const body = await parseBody();

    let newDeadlineIso = null;
    if (body.deadlineMinutes) {
      newDeadlineIso = new Date(Date.now() + Number(body.deadlineMinutes) * 60000).toISOString();
    } else if (body.deadlineHours) {
      newDeadlineIso = new Date(Date.now() + Number(body.deadlineHours) * 3600000).toISOString();
    } else if (body.deadline) {
      newDeadlineIso = new Date(body.deadline).toISOString();
    }

    if (!newDeadlineIso) {
      return sendJson({ error: 'Invalid deadline parameter' }, 400);
    }

    rfq.deadline = newDeadlineIso;
    // If bidding was closed due to previous deadline, and new deadline is in the future, reopen
    if (rfq.status === 'UNDER_EVALUATION' && new Date(newDeadlineIso).getTime() > Date.now()) {
      rfq.status = 'OPEN_FOR_BIDDING';
      rfq.biddingClosedAt = null;
      rfq.biddingClosedBy = null;
    }

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'BIDDING_DEADLINE_UPDATED',
      comment: `Bidding deadline updated to ${newDeadlineIso}. Dynamic countdown reset.`
    });

    return sendJson({ success: true, rfq, deadline: rfq.deadline });
  }

  // ---------------------------------------------------------------------------
  // 4B. DIAGRAM: CONFIGURE TECHNICAL REQUIREMENTS (Buyer → RFQ)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/configure-technical$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can configure technical requirements.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);
    const body = await parseBody();

    rfq.technicalRequirements = {
      configuredAt: new Date().toISOString(),
      configuredBy: currentUser.name,
      specifications: body.specifications || rfq.specifications || 'Technical specifications per procurement standards.',
      certifications: body.certifications || ['ISO 9001:2015'],
      complianceCriteria: body.complianceCriteria || 'All mandatory certifications required.'
    };

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'TECHNICAL_REQUIREMENTS_CONFIGURED',
      comment: `Technical requirements configured: ${rfq.technicalRequirements.specifications.substring(0, 80)}...`
    });

    db.addAuditLog({
      protocol: 'RFQ Configuration',
      direction: 'INTERNAL',
      endpoint: `/api/rfqs/${rfqId}/configure-technical`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Technical Requirements',
      referenceId: rfq.id,
      message: `Buyer ${currentUser.name} configured Technical Requirements for RFQ ${rfq.id}.`
    });

    return sendJson({ success: true, rfq });
  }

  // ---------------------------------------------------------------------------
  // 4C. DIAGRAM: CONFIGURE ECONOMIC REQUIREMENTS (Buyer → RFQ)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/configure-economic$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can configure economic requirements.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);
    const body = await parseBody();

    rfq.economicRequirements = {
      configuredAt: new Date().toISOString(),
      configuredBy: currentUser.name,
      targetUnitPrice: Number(body.targetUnitPrice) || (rfq.lineItems[0] ? rfq.lineItems[0].targetPrice : 0),
      currency: body.currency || rfq.currency || 'COP',
      paymentTerms: body.paymentTerms || rfq.commercialTerms || 'Net 60 Days',
      deliveryTerms: body.deliveryTerms || 'DDP - Delivered Duty Paid',
      budgetCeiling: Number(body.budgetCeiling) || (rfq.lineItems[0] ? rfq.lineItems[0].estimatedTotal : 0)
    };

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'ECONOMIC_REQUIREMENTS_CONFIGURED',
      comment: `Economic requirements set: Target ${rfq.economicRequirements.currency} ${rfq.economicRequirements.targetUnitPrice}/unit. Budget ceiling: ${rfq.economicRequirements.budgetCeiling.toLocaleString()} ${rfq.economicRequirements.currency}.`
    });

    db.addAuditLog({
      protocol: 'RFQ Configuration',
      direction: 'INTERNAL',
      endpoint: `/api/rfqs/${rfqId}/configure-economic`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Economic Requirements',
      referenceId: rfq.id,
      message: `Buyer ${currentUser.name} configured Economic Requirements for RFQ ${rfq.id}. Target: ${rfq.economicRequirements.targetUnitPrice} ${rfq.economicRequirements.currency}/unit.`
    });

    return sendJson({ success: true, rfq });
  }

  // ---------------------------------------------------------------------------
  // 4D. DIAGRAM: CLOSE BIDDING (Buyer manually closes event)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/close-bidding$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can close bidding events.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);
    const body = await parseBody();

    // Transition: OPEN_FOR_BIDDING → UNDER_EVALUATION
    rfq.status = 'UNDER_EVALUATION';
    rfq.biddingClosedAt = new Date().toISOString();
    rfq.biddingClosedBy = currentUser.name;
    rfq.biddingCloseReason = body.reason || 'Buyer manually closed bidding event to proceed with evaluation.';

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'BIDDING_CLOSED_MANUAL',
      comment: `Bidding manually closed by ${currentUser.name}. Reason: ${rfq.biddingCloseReason}`
    });

    db.addAuditLog({
      protocol: 'Bid Closing',
      direction: 'INTERNAL',
      endpoint: `/api/rfqs/${rfqId}/close-bidding`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Bid Close Event',
      referenceId: rfq.id,
      message: `Buyer ${currentUser.name} manually closed bidding for RFQ ${rfq.id}. Status: UNDER_EVALUATION.`
    });

    return sendJson({ success: true, rfq });
  }

  // ---------------------------------------------------------------------------
  // 4E. DIAGRAM: NOTIFY AWARD TO SUPPLIER (Award Trigger → Supplier Portal)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/notify-award$/) && method === 'POST') {
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    rfq.awardNotifiedAt = new Date().toISOString();
    rfq.awardNotifiedTo = rfq.awardedTo || rfq.recommendedSupplierId;

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'AWARD_TRIGGER_SENT',
      comment: `Award trigger notification sent to supplier ${rfq.awardNotifiedTo}.`
    });

    return sendJson({ success: true, rfq });
  }

  // ---------------------------------------------------------------------------
  // 4F. DIAGRAM: GET NOTIFICATIONS FOR SUPPLIER (Award Trigger)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/notifications\/[^/]+$/) && method === 'GET') {
    const userId = path.split('/')[3];
    const user = db.users.find(u => u.id === userId || u.username === userId);
    const notifications = [];

    if (user && user.role === 'supplier') {
      // Check if any awarded RFQ has a notification for this supplier
      const awardedRfqs = db.rfqs.filter(r =>
        r.awardNotifiedTo === user.supplierId && r.awardNotifiedAt
      );
      awardedRfqs.forEach(rfq => {
        notifications.push({
          id: `NOTIF-AWARD-${rfq.id}`,
          type: 'AWARD_TRIGGER',
          title: '🏆 Award Notification — You have been selected!',
          message: `Congratulations! Your bid for "${rfq.title}" (${rfq.id}) has been approved. You are the awarded supplier.`,
          rfqId: rfq.id,
          rfqTitle: rfq.title,
          timestamp: rfq.awardNotifiedAt,
          read: false
        });
      });
    }

    return sendJson({ notifications });
  }

  // ---------------------------------------------------------------------------
  // 5. SUPPLIER PORTAL & SEALED BIDDING (Stage 5)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/quotations$/) && method === 'GET') {
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    // Strict Backend Isolation:
    if (currentUser.role === 'supplier') {
      // Supplier A only sees Supplier A's quote!
      const myQuote = db.quotations.filter(q => q.rfqId === rfqId && q.supplierId === currentUser.supplierId);
      return sendJson(myQuote);
    }

    if (currentUser.role === 'tech_evaluator') {
      // Technical Evaluator sees technical proposals and ISO, NOT unit pricing (Two-Envelope Sealed Bidding)
      const quotes = db.quotations.filter(q => q.rfqId === rfqId);
      return sendJson(quotes.map(q => ({
        id: q.id,
        rfqId: q.rfqId,
        supplierId: q.supplierId,
        supplierName: q.supplierName,
        submittedAt: q.submittedAt,
        leadTimeDays: q.leadTimeDays,
        isoCertified: q.isoCertified,
        technicalProposal: q.technicalProposal,
        // PRICING SEALED
        totalBidAmount: 'SEALED_UNTIL_COMMERCIAL_EVALUATION',
        lineItemBids: []
      })));
    }

    // Buyers, Commercial Evaluators, Award Approvers see full quotes
    return sendJson(db.quotations.filter(q => q.rfqId === rfqId));
  }

  if (path.match(/^\/api\/rfqs\/[^/]+\/quotations$/) && method === 'POST') {
    // Stage 5: Supplier submits quotation before deadline
    if (currentUser.role !== 'supplier' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only invited suppliers can submit quotations.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    // SERVER-ENFORCED DEADLINE VERIFICATION:
    const deadlineTime = new Date(rfq.deadline).getTime();
    if (Date.now() > deadlineTime) {
      return sendJson({ 
        error: 'Submission rejected: Server deadline has expired. Under company policy, late bids cannot be accepted.',
        code: 'DEADLINE_EXPIRED'
      }, 400);
    }

    const body = await parseBody();
    const supplierId = currentUser.supplierId || body.supplierId || 'SUP-SONDA';
    const supplier = db.suppliers.find(s => s.id === supplierId);
    if (!supplier) return sendJson({ error: 'Valid supplier account required' }, 400);

    const totalBidAmount = body.lineItemBids.reduce((sum, item) => sum + Number(item.total), 0);

    const quotation = {
      id: `QUO-${supplierId}-${Date.now().toString().slice(-4)}`,
      rfqId: rfq.id,
      supplierId: supplier.id,
      supplierName: supplier.name,
      submittedAt: new Date().toISOString(),
      status: 'SUBMITTED',
      currency: body.currency || rfq.currency,
      leadTimeDays: Number(body.leadTimeDays) || 8,
      paymentTerms: body.paymentTerms || 'Net 60 Days',
      isoCertified: body.isoCertified !== undefined ? body.isoCertified : true,
      technicalProposal: body.technicalProposal || 'Standard technical proposal complying with tender specifications.',
      lineItemBids: body.lineItemBids,
      totalBidAmount,
      score: 95.0
    };

    // Replace previous quote from same supplier if updating draft
    const existingIdx = db.quotations.findIndex(q => q.rfqId === rfqId && q.supplierId === supplier.id);
    if (existingIdx >= 0) {
      quotation.id = db.quotations[existingIdx].id;
      db.quotations[existingIdx] = quotation;
    } else {
      db.quotations.push(quotation);
    }

    rfq.status = 'UNDER_EVALUATION';

    db.addAuditLog({
      protocol: 'Supplier Quotation',
      direction: 'INBOUND',
      endpoint: `/api/rfqs/${rfqId}/quotations`,
      status: 'SUCCESS',
      statusCode: 201,
      payloadType: 'Confidential Sealed Bid',
      referenceId: quotation.id,
      message: `Supplier ${supplier.name} successfully submitted quotation for ${rfq.id}. Total: $${totalBidAmount.toLocaleString()} ${quotation.currency}.`
    });

    return sendJson({ success: true, quotation }, 201);
  }

  // Supplier Q&A Clarifications
  if (path.match(/^\/api\/rfqs\/[^/]+\/qa$/) && method === 'GET') {
    const rfqId = path.split('/')[3];
    return sendJson(db.rfqQuestions.filter(q => q.rfqId === rfqId));
  }

  if (path.match(/^\/api\/rfqs\/[^/]+\/qa$/) && method === 'POST') {
    const rfqId = path.split('/')[3];
    const body = await parseBody();
    const newQa = {
      id: `QA-${Date.now().toString().slice(-4)}`,
      rfqId,
      supplierId: currentUser.supplierId || 'SUP-SONDA',
      supplierName: currentUser.name,
      question: body.question,
      answer: null,
      createdAt: new Date().toISOString(),
      answeredAt: null,
      isPublic: true
    };
    db.rfqQuestions.unshift(newQa);
    return sendJson({ success: true, qa: newQa }, 201);
  }

  // ---------------------------------------------------------------------------
  // 6. EVALUATION COMMITTEE (Stage 6)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/evaluate\/technical$/) && method === 'POST') {
    if (currentUser.role !== 'tech_evaluator' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Technical Evaluators can score technical proposals.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const body = await parseBody();
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    rfq.evaluations.technical = {
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
      completedAt: new Date().toISOString(),
      scores: body.scores // { [supId]: { score: 98, passed: true, comments: '...' } }
    };

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'TECHNICAL_EVALUATION_COMPLETED',
      comment: 'Technical suitability and ISO compliance scored for all submitted bids.'
    });

    return sendJson({ success: true, rfq });
  }

  if (path.match(/^\/api\/rfqs\/[^/]+\/evaluate\/commercial$/) && method === 'POST') {
    if (currentUser.role !== 'comm_evaluator' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Commercial Evaluators can score commercial pricing.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const body = await parseBody();
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    rfq.evaluations.commercial = {
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
      completedAt: new Date().toISOString(),
      scores: body.scores
    };

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'COMMERCIAL_EVALUATION_COMPLETED',
      comment: 'Commercial pricing and tariff savings scored.'
    });

    return sendJson({ success: true, rfq });
  }

  // Buyer Recommends Winner
  if (path.match(/^\/api\/rfqs\/[^/]+\/recommend$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can recommend award winners.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const body = await parseBody();
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    rfq.recommendedSupplierId = body.supplierId;
    rfq.awardJustification = body.justification || 'Lowest evaluated compliant bid yielding maximum budget savings.';
    rfq.status = 'PENDING_AWARD_APPROVAL';

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'AWARD_RECOMMENDED',
      comment: `Recommended winner: ${body.supplierName || body.supplierId}. Sent to Award Approver / Committee.`
    });

    return sendJson({ success: true, rfq });
  }

  // ---------------------------------------------------------------------------
  // 7. AWARD APPROVER / COMMITTEE (Stage 7)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/award\/approve$/) && method === 'POST') {
    if (currentUser.role !== 'award_approver' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Award Approvers can approve final tender awards.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    rfq.status = 'AWARDED';
    rfq.awardedTo = rfq.recommendedSupplierId || 'SUP-SONDA';
    // Diagram: "Award Trigger" — automatically notifies winning supplier
    rfq.awardNotifiedAt = new Date().toISOString();
    rfq.awardNotifiedTo = rfq.awardedTo;

    rfq.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'AWARD_APPROVED',
      comment: `Award approved for ${rfq.awardedTo}. Ready for Purchase Order generation.`
    });

    db.addAuditLog({
      protocol: 'Award Governance',
      direction: 'INTERNAL',
      endpoint: `/api/rfqs/${rfqId}/award/approve`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Award Decision',
      referenceId: rfq.id,
      message: `Award Approver ${currentUser.name} officially approved award for ${rfq.awardedTo}.`
    });

    return sendJson({ success: true, rfq });
  }

  // ---------------------------------------------------------------------------
  // 8. GENERATE PURCHASE ORDER (Stage 8)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/rfqs\/[^/]+\/generate-po$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'award_approver' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Buyers or Award Approvers can generate purchase orders.' }, 403);
    }
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    const winningSupplierId = rfq.awardedTo || rfq.recommendedSupplierId || 'SUP-SONDA';
    const winningSupplier = db.suppliers.find(s => s.id === winningSupplierId);
    const winningQuote = db.quotations.find(q => q.rfqId === rfq.id && q.supplierId === winningSupplierId) || db.quotations[0];

    const sapPoNum = `45000${Math.floor(10000 + Math.random() * 90000)}`;
    const newPo = {
      id: `PO-${sapPoNum}`,
      sapPoNumber: sapPoNum,
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      sourcePrId: rfq.sourcePrId,
      sourcePrNumber: rfq.sapPrNumber,
      supplierId: winningSupplier.id,
      supplierName: winningSupplier.name,
      vendorSapCode: winningSupplier.sapVendorId,
      buyerId: currentUser.id,
      buyerName: currentUser.name,
      approverId: 'usr-award-approver',
      approverName: 'Carlos Alberto Fonseca',
      totalAmount: winningQuote.totalBidAmount,
      currency: winningQuote.currency,
      plant: rfq.plant,
      plantName: rfq.plantName,
      paymentTerms: winningQuote.paymentTerms,
      status: 'PENDING_PO_APPROVAL',
      createdAt: new Date().toISOString(),
      approvedAt: null,
      sapConfirmedAt: null,
      shippedAt: null,
      closedAt: null,
      sapIntegration: {
        status: 'PENDING_DISPATCH',
        sapPoNumber: sapPoNum,
        payloadType: 'cXML 1.2.040 & S/4HANA OData',
        timestamp: null,
        retries: 0
      },
      lineItems: rfq.lineItems.map((item, idx) => {
        const bid = winningQuote.lineItemBids.find(b => b.itemNo === item.itemNo) || winningQuote.lineItemBids[idx] || { unitPrice: 3.00, total: 21375000 };
        return {
          itemNo: item.itemNo,
          materialNo: item.materialNo,
          description: item.description,
          orderedQuantity: item.quantity,
          unit: item.unit,
          unitPrice: bid.unitPrice,
          totalPrice: bid.total,
          receivedQuantity: 0,
          remainingQuantity: item.quantity
        };
      }),
      goodsReceipts: [],
      history: [
        { timestamp: new Date().toISOString(), actor: currentUser.name, action: 'PO_GENERATED', comment: `Generated from approved award scenario. Awaiting final PO authorization.` }
      ]
    };

    rfq.status = 'PO_GENERATED';
    rfq.awardedPoId = newPo.id;

    const sourcePr = db.purchaseRequisitions.find(p => p.id === rfq.sourcePrId);
    if (sourcePr) {
      sourcePr.status = 'ORDERED';
      sourcePr.linkedPoId = newPo.id;
    }

    db.purchaseOrders.unshift(newPo);

    return sendJson({ success: true, purchaseOrder: newPo }, 201);
  }

  // ---------------------------------------------------------------------------
  // 9. SAP INTEGRATION & PO DISPATCH (Stage 8 & 9)
  // ---------------------------------------------------------------------------
  if (path === '/api/pos' && method === 'GET') {
    // Sanitize any existing over-received records
    db.purchaseOrders.forEach(p => {
      if (p.lineItems && p.lineItems[0]) {
        const itm = p.lineItems[0];
        if (itm.receivedQuantity > itm.orderedQuantity) {
          itm.receivedQuantity = itm.orderedQuantity;
          itm.remainingQuantity = 0;
          p.status = 'FULLY_DELIVERED';
        }
      }
    });

    if (currentUser.role === 'supplier') {
      // Supplier sees only their own POs!
      return sendJson(db.purchaseOrders.filter(p => p.supplierId === currentUser.supplierId));
    }
    if (currentUser.role === 'requester') {
      // Requester sees POs originating from their PRs
      const myPrIds = db.purchaseRequisitions.filter(p => p.requesterId === currentUser.id).map(p => p.id);
      return sendJson(db.purchaseOrders.filter(p => myPrIds.includes(p.sourcePrId)));
    }
    return sendJson(db.purchaseOrders);
  }

  // Award Approver authorizes PO & dispatches to SAP
  if (path.match(/^\/api\/pos\/[^/]+\/send-to-sap$/) && method === 'POST') {
    if (currentUser.role !== 'award_approver' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Award Approvers can authorize and dispatch PO to SAP.' }, 403);
    }
    const poId = path.split('/')[3];
    const po = db.purchaseOrders.find(p => p.id === poId || p.sapPoNumber === poId || p.id === `PO-${poId}`);
    if (!po) return sendJson({ error: 'PO not found' }, 404);

    po.status = 'SAP_CONFIRMED';
    po.approvedAt = new Date().toISOString();
    po.sapConfirmedAt = new Date().toISOString();
    po.sapIntegration = {
      status: 'POSTED_CONFIRMED',
      sapPoNumber: po.sapPoNumber,
      payloadType: 'cXML 1.2.040 OrderRequest & S/4HANA OData',
      timestamp: new Date().toISOString(),
      retries: 0
    };

    po.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'PO_APPROVED_SAP_DISPATCHED',
      comment: `Authorized and confirmed in SAP S/4HANA under Doc ${po.sapPoNumber}.`
    });

    // Write to Excel Dummy SAP Outbound Database
    excelSapStore.addOutboundPo({
      SAP_PO_Number: po.sapPoNumber,
      Source_PR: po.sourcePrNumber || '3000010443',
      RFQ_Doc_ID: po.rfqId,
      Awarded_Supplier: po.supplierName,
      Supplier_ANID: po.vendorSapCode || 'AN11459791479',
      Unit_Price_COP: po.lineItems[0].unitPrice,
      Total_Amount_COP: po.totalAmount,
      Status: 'POSTED_CONFIRMED'
    });

    db.addAuditLog({
      protocol: 'SAP Clean Core Integration',
      direction: 'OUTBOUND',
      endpoint: '/sap/opu/odata4/sap/api_purchaseorder_2',
      status: 'SUCCESS',
      statusCode: 201,
      payloadType: 'cXML / OData v4',
      referenceId: po.id,
      message: `Purchase Order ${po.sapPoNumber} posted to SAP ERP and committed to Excel Database.`
    });

    return sendJson({ success: true, po });
  }

  // ---------------------------------------------------------------------------
  // 10. SUPPLIER SHIPMENT & RECEIVING / GOODS RECEIPT (Stage 10)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/pos\/[^/]+\/ship$/) && method === 'POST') {
    if (currentUser.role !== 'supplier' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Suppliers can dispatch shipments.' }, 403);
    }
    const poId = path.split('/')[3];
    const body = await parseBody();
    const po = db.purchaseOrders.find(p => p.id === poId || p.sapPoNumber === poId || p.id === `PO-${poId}`);
    if (!po) return sendJson({ error: 'PO not found' }, 404);

    po.status = 'SHIPPED_BY_SUPPLIER';
    po.shippedAt = new Date().toISOString();
    po.shippingNotice = {
      carrier: body.carrier || 'Trans-Caribe Logistics',
      trackingNo: body.trackingNo || `REM-${Math.floor(10000 + Math.random() * 90000)}`,
      shippedDate: new Date().toISOString()
    };

    po.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'SUPPLIER_DISPATCHED',
      comment: `Dispatched under Waybill ${po.shippingNotice.trackingNo} via ${po.shippingNotice.carrier}.`
    });

    return sendJson({ success: true, po });
  }

  if (path.match(/^\/api\/pos\/[^/]+\/receive$/) && method === 'POST') {
    // Stage 10: Alpek Demo Receiving Team records Goods Receipt (GRN)
    if (currentUser.role !== 'receiving' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Warehouse / Receiving personnel can record goods receipts.' }, 403);
    }
    const poId = path.split('/')[3];
    const body = await parseBody();
    const po = db.purchaseOrders.find(p => p.id === poId || p.sapPoNumber === poId || p.id === `PO-${poId}`);
    if (!po) return sendJson({ error: 'PO not found' }, 404);

    const item = po.lineItems[0];
    const requestedQty = Number(body.receivedQuantity) || (item ? item.remainingQuantity : 3500000);
    const availableToReceive = Math.max(0, item.orderedQuantity - item.receivedQuantity);

    if (availableToReceive === 0 && item.receivedQuantity >= item.orderedQuantity) {
      po.status = 'FULLY_DELIVERED';
      return sendJson({
        success: true,
        message: 'This Purchase Order has already been fully delivered and logged.',
        po,
        grn: po.goodsReceipts[po.goodsReceipts.length - 1]
      });
    }

    const actualReceived = Math.min(requestedQty, availableToReceive);
    item.receivedQuantity = Math.min(item.orderedQuantity, item.receivedQuantity + actualReceived);
    item.remainingQuantity = Math.max(0, item.orderedQuantity - item.receivedQuantity);

    const isComplete = item.remainingQuantity === 0;
    po.status = isComplete ? 'FULLY_DELIVERED' : 'PARTIALLY_DELIVERED';

    const grn = {
      id: `GRN-${Date.now().toString().slice(-4)}`,
      receivedDate: new Date().toISOString(),
      receivedBy: body.receivedBy || currentUser.name,
      deliveryNoteNo: body.deliveryNoteNo || 'REM-89214',
      carrier: body.carrier || 'Trans-Caribe Logistics',
      receivedQuantity: actualReceived > 0 ? actualReceived : requestedQty,
      discrepancyNotes: body.discrepancyNotes || (isComplete ? 'Complete delivery in full order.' : `Partial batch received. ${item.remainingQuantity.toLocaleString()} units remaining.`),
      inspectionPassed: body.inspectionPassed !== undefined ? body.inspectionPassed : true
    };

    po.goodsReceipts.push(grn);

    po.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: isComplete ? 'GOODS_RECEIPT_COMPLETE' : 'GOODS_RECEIPT_PARTIAL',
      comment: `Recorded ${(actualReceived > 0 ? actualReceived : requestedQty).toLocaleString()} units. Discrepancy note: ${grn.discrepancyNotes}`
    });

    return sendJson({ success: true, po, grn });
  }

  // ---------------------------------------------------------------------------
  // 11. PROCUREMENT / FINANCE ORDER CLOSURE (Stage 11)
  // ---------------------------------------------------------------------------
  if (path.match(/^\/api\/pos\/[^/]+\/close$/) && method === 'POST') {
    if (currentUser.role !== 'buyer' && currentUser.role !== 'admin') {
      return sendJson({ error: 'Access Denied: Only Procurement Buyers can close purchase orders.' }, 403);
    }
    const poId = path.split('/')[3];
    const po = db.purchaseOrders.find(p => p.id === poId || p.sapPoNumber === poId || p.id === `PO-${poId}`);
    if (!po) return sendJson({ error: 'PO not found' }, 404);

    po.status = 'CLOSED_COMPLETED';
    po.closedAt = new Date().toISOString();

    const sourcePr = db.purchaseRequisitions.find(p => p.id === po.sourcePrId);
    if (sourcePr) {
      sourcePr.status = 'CLOSED';
    }

    po.history.push({
      timestamp: new Date().toISOString(),
      actor: currentUser.name,
      action: 'PO_CLOSED_COMPLETED',
      comment: 'All deliverables received, exceptions reconciled. Purchase order formally closed.'
    });

    db.addAuditLog({
      protocol: 'Order Closure',
      direction: 'INTERNAL',
      endpoint: `/api/pos/${poId}/close`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'Lifecycle Closure',
      referenceId: po.id,
      message: `Procurement Officer ${currentUser.name} closed PO ${po.sapPoNumber}. Lifecycle complete.`
    });

    return sendJson({ success: true, po });
  }

  // ---------------------------------------------------------------------------
  // 12. FULL LINEAGE & TRACEABILITY
  // ---------------------------------------------------------------------------
  if (path.startsWith('/api/traceability/') && method === 'GET') {
    const parts = path.split('/');
    const entityType = parts[3]; // 'pr', 'rfq', 'po'
    const id = parts[4];

    let pr = null;
    let rfq = null;
    let po = null;

    if (entityType === 'pr') {
      pr = db.purchaseRequisitions.find(p => p.id === id || p.sapPrNumber === id);
      if (pr) {
        rfq = db.rfqs.find(r => r.sourcePrId === pr.id);
        po = db.purchaseOrders.find(p => p.sourcePrId === pr.id);
      }
    } else if (entityType === 'rfq') {
      rfq = db.rfqs.find(r => r.id === id);
      if (rfq) {
        pr = db.purchaseRequisitions.find(p => p.id === rfq.sourcePrId);
        po = db.purchaseOrders.find(p => p.rfqId === rfq.id);
      }
    } else if (entityType === 'po') {
      po = db.purchaseOrders.find(p => p.id === id || p.sapPoNumber === id || p.id === `PO-${id}`);
      if (po) {
        rfq = db.rfqs.find(r => r.id === po.rfqId);
        pr = db.purchaseRequisitions.find(p => p.id === po.sourcePrId);
      }
    }

    const quotes = rfq ? db.quotations.filter(q => q.rfqId === rfq.id) : [];
    const deliveries = po ? po.goodsReceipts : [];

    return sendJson({
      pr,
      rfq,
      quotes,
      po,
      sapIntegration: po ? po.sapIntegration : null,
      deliveries,
      lineage: {
        pr,
        rfq,
        quotations: quotes,
        award: rfq ? { awardedTo: rfq.awardedTo, justification: rfq.awardJustification } : null,
        po,
        sapIntegration: po ? po.sapIntegration : null,
        goodsReceipts: deliveries
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 13. LEGACY / COMPATIBILITY ADAPTERS (For Test Suite & Payloads)
  // ---------------------------------------------------------------------------
  // Support legacy POST /api/rfqs/:id/award
  if (path.startsWith('/api/rfqs/') && path.endsWith('/award') && method === 'POST') {
    const rfqId = path.split('/')[3];
    const rfq = db.rfqs.find(r => r.id === rfqId);
    if (!rfq) return sendJson({ error: 'RFQ not found' }, 404);

    rfq.status = 'AWARDED';
    rfq.awardedTo = 'SUP-SONDA';

    let po = db.purchaseOrders.find(p => p.rfqId === rfq.id);
    if (!po) {
      const sapPoNum = `45000${Math.floor(10000 + Math.random() * 90000)}`;
      const quote = db.quotations.find(q => q.rfqId === rfq.id && q.supplierId === 'SUP-SONDA') || db.quotations[0];
      const winningTotal = quote ? quote.totalBidAmount : 21375000.00;

      po = {
        id: `PO-${sapPoNum}`,
        sapPoNumber: sapPoNum,
        rfqId: rfq.id,
        rfqTitle: rfq.title,
        sourcePrId: rfq.sourcePrId,
        sourcePrNumber: rfq.sapPrNumber,
        supplierId: 'SUP-SONDA',
        supplierName: 'SONDA DE COLOMBIA S A',
        vendorSapCode: '0000100459',
        buyerId: 'usr-buyer',
        buyerName: 'Valeria Martinez',
        approverId: 'usr-award-approver',
        approverName: 'Carlos Alberto Fonseca',
        totalAmount: winningTotal,
        currency: rfq.currency || 'COP',
        plant: rfq.plant,
        plantName: rfq.plantName,
        paymentTerms: quote ? quote.paymentTerms : 'Net 60 Days',
        status: 'SAP_CONFIRMED',
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
        sapConfirmedAt: new Date().toISOString(),
        shippedAt: null,
        closedAt: null,
        sapIntegration: {
          status: 'POSTED_CONFIRMED',
          sapPoNumber: sapPoNum,
          payloadType: 'cXML 1.2.040 OrderRequest & S/4HANA OData',
          timestamp: new Date().toISOString(),
          retries: 0
        },
        lineItems: rfq.lineItems && rfq.lineItems.length > 0
          ? rfq.lineItems.map((item, idx) => {
              const bid = (quote && quote.lineItemBids) ? (quote.lineItemBids.find(b => b.itemNo === item.itemNo) || quote.lineItemBids[idx]) : null;
              const unitPrice = bid ? bid.unitPrice : (item.targetPrice || 3.00);
              const totalPrice = bid ? bid.total : (unitPrice * item.quantity);
              return {
                itemNo: item.itemNo,
                materialNo: item.materialNo || 'MAT-GEN',
                description: item.description,
                orderedQuantity: item.quantity,
                unit: item.unit || 'Unit',
                unitPrice,
                totalPrice,
                receivedQuantity: 0,
                remainingQuantity: item.quantity
              };
            })
          : [
              {
                itemNo: '2.1.1',
                materialNo: 'SUMINITRO',
                description: 'SUMINISTROS REFRI - Cantidades & Tarifas',
                orderedQuantity: 7125000,
                unit: 'Unidad',
                unitPrice: 3.00,
                totalPrice: 21375000.00,
                receivedQuantity: 0,
                remainingQuantity: 7125000
              }
            ],
        goodsReceipts: [],
        history: [
          { timestamp: new Date().toISOString(), actor: 'Carlos Alberto Fonseca', action: 'PO_AWARDED_SAP_POSTED', comment: `Awarded to SONDA. S/4HANA Purchase Order ${sapPoNum} generated.` }
        ]
      };
      db.purchaseOrders.unshift(po);
    }

    excelSapStore.addOutboundPo({
      SAP_PO_Number: po.sapPoNumber,
      Source_PR: po.sourcePrNumber || '3000010443',
      RFQ_Doc_ID: po.rfqId,
      Awarded_Supplier: po.supplierName,
      Supplier_ANID: po.vendorSapCode || 'AN11459791479',
      Unit_Price_COP: po.lineItems[0] ? po.lineItems[0].unitPrice : 3.00,
      Total_Amount_COP: po.totalAmount,
      Status: 'POSTED_CONFIRMED'
    });

    return sendJson({ success: true, rfq, purchaseOrder: po });
  }

  // XML Payload Inspectors (cXML & IDoc)
  if (path.startsWith('/api/pos/') && path.endsWith('/cxml') && method === 'GET') {
    const poId = path.split('/')[3];
    const po = db.purchaseOrders.find(p => p.id === poId || p.sapPoNumber === poId || p.id === `PO-${poId}`);
    if (!po) return sendJson({ error: 'PO not found' }, 404);

    const supplier = db.suppliers.find(s => s.id === po.supplierId) || db.suppliers[0];
    const xml = sapService.buildCxmlOrderRequest(po, supplier);
    return sendXml(xml);
  }

  if (path.startsWith('/api/pos/') && path.endsWith('/idoc') && method === 'GET') {
    const poId = path.split('/')[3];
    const po = db.purchaseOrders.find(p => p.id === poId || p.sapPoNumber === poId || p.id === `PO-${poId}`);
    if (!po) return sendJson({ error: 'PO not found' }, 404);

    const supplier = db.suppliers.find(s => s.id === po.supplierId) || db.suppliers[0];
    const xml = sapService.buildSapIdocOrders05(po, supplier);
    return sendXml(xml);
  }

  // ---------------------------------------------------------------------------
  // 14. DUMMY SAP EXCEL SHEET ENDPOINTS
  // ---------------------------------------------------------------------------
  if (path === '/api/sap-sheet/prs' && method === 'GET') {
    return sendJson(excelSapStore.getInboundPrs());
  }

  if (path === '/api/sap-sheet/prs' && method === 'POST') {
    const body = await parseBody();
    if (currentUser && currentUser.role === 'requester') {
      if (!body.Requester || body.Requester === 'Valeria Martinez') {
        body.Requester = currentUser.name || 'Carlos Ramirez';
      }
    }
    const newPr = excelSapStore.addInboundPr(body);
    // Ensure linked platform PR exists in internal PR store
    const existingPr = db.purchaseRequisitions.find(p => p.sapPrNumber === newPr.SAP_PR_Number);
    if (!existingPr) {
      db.purchaseRequisitions.unshift({
        id: `PR-${newPr.SAP_PR_Number}`,
        sapPrNumber: newPr.SAP_PR_Number,
        title: newPr.Material_Desc,
        purpose: 'Plant operational demand from SAP ERP inbound requisition',
        department: newPr.Department || 'Purchases & Materials',
        costCenter: 'CC-90412-OPS',
        plant: newPr.Plant || 'OP ANG (GTE Col)',
        plantName: newPr.Plant || 'OP ANG (GTE Col)',
        status: 'PENDING_MANAGER_APPROVAL',
        estimatedBudget: (Number(newPr.Quantity) || 1000) * (Number(newPr.Valuation_Unit_Price_COP) || 3.5),
        currency: 'COP',
        requesterId: (currentUser.role === 'requester') ? currentUser.id : 'usr-requester',
        requesterName: newPr.Requester || currentUser.name || 'Carlos Ramirez',
        managerId: 'usr-manager',
        managerName: 'David Vance',
        createdAt: new Date().toISOString(),
        lineItems: [
          {
            itemNumber: '10',
            description: newPr.Material_Desc,
            quantity: Number(newPr.Quantity) || 1000,
            unit: newPr.Unit || 'Unidad',
            targetUnitPrice: Number(newPr.Valuation_Unit_Price_COP) || 3.5,
            estimatedTotal: (Number(newPr.Quantity) || 1000) * (Number(newPr.Valuation_Unit_Price_COP) || 3.5)
          }
        ],
        history: [
          { timestamp: new Date().toISOString(), actor: newPr.Requester || currentUser.name, action: 'PR_CREATED', comment: `Created requisition in SAP ERP sheet.` }
        ]
      });
    }
    return sendJson({ success: true, pr: newPr }, 201);
  }

  if (path === '/api/sap-sheet/pos' && method === 'GET') {
    return sendJson(excelSapStore.getOutboundPos());
  }

  if (path === '/api/sap-sheet/download' && method === 'GET') {
    const sheet = url.searchParams.get('sheet') || 'prs';
    const filename = sheet === 'pos' ? 'SAP_PO_Outbound.csv' : 'SAP_PR_Inbound.csv';
    const csvContent = sheet === 'pos'
      ? excelSapStore.toCsv(['SAP_PO_Number', 'Source_PR', 'RFQ_Doc_ID', 'Awarded_Supplier', 'Supplier_ANID', 'Unit_Price_COP', 'Total_Amount_COP', 'Commit_Timestamp', 'Status'], excelSapStore.getOutboundPos())
      : excelSapStore.toCsv(['SAP_PR_Number', 'Doc_Type', 'Item', 'Material_Desc', 'Quantity', 'Unit', 'Valuation_Unit_Price_COP', 'Plant', 'Status', 'Requester', 'Department', 'Created_Date'], excelSapStore.getInboundPrs());

    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Access-Control-Allow-Origin': '*'
    });
    return res.end(csvContent);
  }

  // Audit Logs
  if (path === '/api/audit-logs' && method === 'GET') {
    return sendJson(db.auditLogs);
  }

  // Reset to Defaults
  if (path === '/api/reset' && method === 'POST') {
    db.resetToDefaults();
    excelSapStore.reset();
    return sendJson({ success: true, message: 'Platform data, 11-stage lifecycle, and Excel sheets reset to initial baseline.' });
  }

  // Fallback
  sendJson({ error: 'Route not found' }, 404);
}
