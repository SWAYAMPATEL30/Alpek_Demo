// Complete 11-Stage Procure-to-Pay End-to-End Test for ABC Company
import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:4000';

test('Comprehensive 11-Stage Procurement Lifecycle Validation', async (t) => {
  let createdPrId = null;
  let createdRfqId = null;
  let createdPoId = null;

  // 1. Stage 1: Employee / Requester creates PR
  await t.test('Stage 1: Employee / Requester creates PR', async () => {
    // Login as Carlos Ramirez
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'carlos.ramirez' })
    });
    const loginData = await loginRes.json();
    assert.equal(loginData.user.role, 'requester');

    // Create PR
    const prRes = await fetch(`${BASE_URL}/api/prs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Emergency Replacement Cooling Compressors',
        purpose: 'Backup compressors for Altamira polymerization unit',
        plant: '1010',
        plantName: 'Altamira Petrochemical Complex',
        costCenter: 'CC-80120-CHEM',
        estimatedBudget: 35000000,
        currency: 'COP',
        quantity: 2,
        unit: 'Units',
        targetUnitPrice: 17500000
      })
    });
    const prData = await prRes.json();
    assert.equal(prRes.status, 201);
    assert.ok(prData.success);
    assert.equal(prData.pr.status, 'PENDING_MANAGER_APPROVAL');
    createdPrId = prData.pr.id;
  });

  // 2. Stage 2: Department Manager returns PR for correction, then approves it
  await t.test('Stage 2: Department Manager returns PR for correction, then approves', async () => {
    // Login as David Vance
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'david.vance' })
    });

    // Return for correction
    const retRes = await fetch(`${BASE_URL}/api/prs/${createdPrId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: 'Please attach manufacturer technical datasheet.' })
    });
    const retData = await retRes.json();
    assert.equal(retData.pr.status, 'RETURNED_FOR_CORRECTION');

    // Approve PR
    const appRes = await fetch(`${BASE_URL}/api/prs/${createdPrId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comments: 'Datasheet reviewed. Approved under Q4 emergency budget.' })
    });
    const appData = await appRes.json();
    assert.equal(appData.pr.status, 'APPROVED');
  });

  // 3. Stage 3: Procurement Buyer creates RFQ from approved PR
  await t.test('Stage 3: Procurement Buyer creates RFQ from approved PR', async () => {
    // Login as Marcela Pineda
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marcela.pineda' })
    });

    const rfqRes = await fetch(`${BASE_URL}/api/rfqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourcePrId: createdPrId,
        title: 'Tender for Emergency Replacement Cooling Compressors',
        commercialTerms: 'Net 60 Days, DDP Altamira Plant. 24-month warranty.',
        deadlineHours: 48,
        invitedSuppliers: ['SUP-SONDA', 'SUP-101']
      })
    });
    const rfqData = await rfqRes.json();
    assert.equal(rfqRes.status, 201);
    assert.equal(rfqData.rfq.status, 'PENDING_APPROVAL');
    createdRfqId = rfqData.rfq.id;
  });

  // 4. Stage 4: Procurement Buyer publishes RFQ & dispatches invitations to suppliers
  await t.test('Stage 4: Procurement Buyer publishes RFQ & dispatches invitations to suppliers', async () => {
    // Login as Marcela Pineda (Buyer per architecture diagram)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marcela.pineda' })
    });

    const pubRes = await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const pubData = await pubRes.json();
    assert.equal(pubData.rfq.status, 'OPEN_FOR_BIDDING');
  });

  // 5. Stage 5: Supplier Portal - Supplier A submits quotation & Q&A
  await t.test('Stage 5: Supplier A submits quotation and clarification question', async () => {
    // Login as SONDA DE COLOMBIA
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sonda.vendor' })
    });

    // Ask clarification
    const qaRes = await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: 'Is standard ASME explosion-proof certificate acceptable?' })
    });
    const qaData = await qaRes.json();
    assert.ok(qaData.success);

    // Submit Bid
    const bidRes = await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currency: 'COP',
        leadTimeDays: 7,
        paymentTerms: 'Net 60 Days',
        remarks: 'Direct factory certified compressors with ISO 9001:2015.',
        lineItemBids: [
          { itemNo: '10', unitPrice: 15000000, total: 30000000 }
        ]
      })
    });
    const bidData = await bidRes.json();
    assert.equal(bidRes.status, 201);
    assert.equal(bidData.quotation.totalBidAmount, 30000000);
  });

  // 6. Stage 6: Technical and Commercial Evaluation Committees
  await t.test('Stage 6: Two-Envelope Evaluation (Technical & Commercial)', async () => {
    // Login as Dr. Victor Chen (Technical)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'victor.chen' })
    });

    const techRes = await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/evaluate/technical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scores: {
          'SUP-SONDA': { score: 96, passed: true, comments: 'Complies with ASME standards.' }
        }
      })
    });
    const techData = await techRes.json();
    assert.ok(techData.success);

    // Login as Sofia Morales (Commercial)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sofia.morales' })
    });

    const commRes = await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/evaluate/commercial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scores: {
          'SUP-SONDA': { score: 94, unitPrice: 15000000, total: 30000000, savingsPct: 14.3 }
        }
      })
    });
    const commData = await commRes.json();
    assert.ok(commData.success);
  });

  // 7. Stage 7: Award Recommendation & Approval
  await t.test('Stage 7: Award Recommendation & Committee Approval', async () => {
    // Login as Marcela Pineda (Buyer) to recommend
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marcela.pineda' })
    });

    await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: 'SUP-SONDA',
        justification: 'SONDA submitted lowest compliant bid yielding $5M COP savings.'
      })
    });

    // Login as Carlos Alberto Fonseca (Award Approver)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'carlos.fonseca' })
    });

    const awardRes = await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/award/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const awardData = await awardRes.json();
    assert.equal(awardData.rfq.status, 'AWARDED');
  });

  // 8. Stage 8: PO Generation
  await t.test('Stage 8: Follow-on PO Generation', async () => {
    // Login as Buyer
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marcela.pineda' })
    });

    const poRes = await fetch(`${BASE_URL}/api/rfqs/${createdRfqId}/generate-po`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const poData = await poRes.json();
    assert.equal(poRes.status, 201);
    assert.ok(poData.purchaseOrder.id);
    createdPoId = poData.purchaseOrder.id;
  });

  // 9. Stage 9: Outbound SAP Dispatch & Excel Outbound
  await t.test('Stage 9: Outbound PO Dispatch to SAP ERP & Excel Sheet', async () => {
    // Login as Award Approver
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'carlos.fonseca' })
    });

    const sapRes = await fetch(`${BASE_URL}/api/pos/${createdPoId}/send-to-sap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const sapData = await sapRes.json();
    assert.equal(sapData.po.status, 'SAP_CONFIRMED');
    assert.equal(sapData.po.sapIntegration.status, 'POSTED_CONFIRMED');
  });

  // 10. Stage 10: Supplier Shipment & Warehouse Goods Receipt (GRN)
  await t.test('Stage 10: Supplier Shipment & Inward Goods Receipt (GRN)', async () => {
    // Login as Supplier to ship
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sonda.vendor' })
    });

    const shipRes = await fetch(`${BASE_URL}/api/pos/${createdPoId}/ship`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrier: 'Trans-Caribe Logistics', trackingNo: 'REM-77291' })
    });
    const shipData = await shipRes.json();
    assert.equal(shipData.po.status, 'SHIPPED_BY_SUPPLIER');

    // Login as Receiving Team (Mateo Morales)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'mateo.morales' })
    });

    // Record Partial Delivery (1 unit)
    const grn1Res = await fetch(`${BASE_URL}/api/pos/${createdPoId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receivedQuantity: 1,
        deliveryNoteNo: 'REM-77291',
        carrier: 'Trans-Caribe Logistics',
        discrepancyNotes: 'Batch 1 of 2 compressors received.',
        inspectionPassed: true
      })
    });
    const grn1Data = await grn1Res.json();
    assert.equal(grn1Data.po.status, 'PARTIALLY_DELIVERED');
    assert.equal(grn1Data.po.lineItems[0].remainingQuantity, 1);

    // Record Remaining Delivery (1 unit)
    const grn2Res = await fetch(`${BASE_URL}/api/pos/${createdPoId}/receive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receivedQuantity: 1,
        deliveryNoteNo: 'REM-77292',
        carrier: 'Trans-Caribe Logistics',
        discrepancyNotes: 'Batch 2 received. Complete delivery in full.',
        inspectionPassed: true
      })
    });
    const grn2Data = await grn2Res.json();
    assert.equal(grn2Data.po.status, 'FULLY_DELIVERED');
    assert.equal(grn2Data.po.lineItems[0].remainingQuantity, 0);
  });

  // 11. Stage 11: Order Reconciliation & Close
  await t.test('Stage 11: Procurement & Finance Order Closure', async () => {
    // Login as Buyer
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marcela.pineda' })
    });

    const closeRes = await fetch(`${BASE_URL}/api/pos/${createdPoId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reconciliationNotes: 'All 2 compressors received, tested, and accepted.' })
    });
    const closeData = await closeRes.json();
    assert.equal(closeData.po.status, 'CLOSED_COMPLETED');
    assert.ok(closeData.po.closedAt);
  });

  // 12. Full End-to-End Traceability Verification
  await t.test('Traceability: Verify PR -> RFQ -> Quote -> Award -> PO -> SAP -> GRN -> Close', async () => {
    const traceRes = await fetch(`${BASE_URL}/api/traceability/po/${createdPoId}`);
    const traceData = await traceRes.json();
    assert.ok(traceData.lineage);
    assert.equal(traceData.lineage.pr.id, createdPrId);
    assert.equal(traceData.lineage.rfq.id, createdRfqId);
    assert.equal(traceData.lineage.po.id, createdPoId);
    assert.equal(traceData.lineage.po.status, 'CLOSED_COMPLETED');
    assert.equal(traceData.lineage.goodsReceipts.length, 2);
  });
});
