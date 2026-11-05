import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:4000';

describe('Custom Sourcing Portal: PR to Award Workflow (Architecture Diagram Conformance)', () => {

  it('Diagram Stage 1: Received PR automatically generates Sourcing Event (RFQ)', async () => {
    // Authenticate as Procurement Buyer (Marcela Pineda per diagram column 2)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'marcela.pineda' })
    });

    // Check approved PRs
    const prsRes = await fetch(`${BASE_URL}/api/prs`);
    const prs = await prsRes.json();
    const approvedPr = prs.find(p => p.status === 'APPROVED');
    assert.ok(approvedPr, 'An approved PR must exist in inbound queue');

    // Generate Sourcing Event from PR
    const createRes = await fetch(`${BASE_URL}/api/rfqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourcePrId: approvedPr.id,
        deadlineHours: 48,
        invitedSuppliers: ['SUP-SONDA', 'SUP-101', 'SUP-102']
      })
    });
    const createData = await createRes.json();
    assert.strictEqual(createData.success, true);
    assert.ok(createData.rfq.id, 'RFQ ID must be generated');
    assert.strictEqual(createData.rfq.sourcePrId, approvedPr.id);
  });

  it('Diagram Stage 1: Buyer configures Technical Requirements on Sourcing Event', async () => {
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/configure-technical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        specifications: 'ISO 9001:2015 and GTE Colombia environmental safety protocols.',
        certifications: ['ISO 9001:2015', 'F-Gas Certified'],
        complianceCriteria: 'Valid through 2028'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.rfq.technicalRequirements);
    assert.strictEqual(data.rfq.technicalRequirements.certifications.length, 2);
  });

  it('Diagram Stage 1: Buyer configures Economic Requirements on Sourcing Event', async () => {
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/configure-economic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetUnitPrice: 3.50,
        currency: 'COP',
        paymentTerms: 'Net 60 Days',
        deliveryTerms: 'DDP - Delivered Duty Paid',
        budgetCeiling: 24937500.00
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.rfq.economicRequirements);
    assert.strictEqual(data.rfq.economicRequirements.targetUnitPrice, 3.50);
  });

  it('Diagram Stage 1: Buyer selects and invites multiple suppliers to Sourcing Event', async () => {
    // Multi-supplier selection (SONDA, Indorama, BASF, Petroquímica)
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/invite-suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        suppliers: ['SUP-SONDA', 'SUP-101', 'SUP-102', 'SUP-103']
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.rfq.invitedSuppliers.length >= 4);
    assert.ok(data.rfq.invitedSuppliers.includes('SUP-103'));
  });

  it('Diagram Stage 2: Buyer sets dynamic bidding timer on Sourcing Event', async () => {
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/set-deadline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deadlineMinutes: 60 })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.deadline);
    const diffMs = new Date(data.deadline).getTime() - Date.now();
    assert.ok(diffMs > 50 * 60 * 1000, 'Deadline timer must be in future (> 50 mins)');
  });

  it('Diagram Stage 2: Event deadline met or Buyer manually closes event', async () => {
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/close-bidding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Manual closing for committee evaluation' })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.rfq.status, 'UNDER_EVALUATION');
    assert.ok(data.rfq.biddingClosedAt);
  });

  it('Diagram Column 3: Custom Supplier Portal receives Event Invitation & Submits Bid -> Status: Participated', async () => {
    // Authenticate as Invited Supplier (SONDA per diagram column 3)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sonda.vendor' })
    });

    // Supplier submits bid
    const bidRes = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        supplierId: 'SUP-SONDA',
        currency: 'COP',
        leadTimeDays: 8,
        paymentTerms: 'Net 60 Days',
        isoCertified: true,
        technicalProposal: 'Fully compliant with ISO 9001:2015 and Anexo 2 specifications.',
        lineItemBids: [{ itemNo: '2.1.1', unitPrice: 3.00, total: 21375000 }]
      })
    });
    const bidData = await bidRes.json();
    assert.strictEqual(bidData.success, true);
    assert.strictEqual(bidData.quotation.status, 'SUBMITTED');
  });

  it('Diagram Stage 3 & 4: Internal Approval Process triggers Award Trigger to Supplier Portal & Award Data Integration to External System', async () => {
    // Authenticate as Award Approver (Carlos Fonseca per diagram internal approval)
    await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'carlos.fonseca' })
    });

    // Internal approval
    const approveRes = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/award/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const approveData = await approveRes.json();
    assert.strictEqual(approveData.success, true);
    assert.strictEqual(approveData.rfq.status, 'AWARDED');
    assert.ok(approveData.rfq.awardNotifiedAt, 'Award notification trigger timestamp must be recorded');
    assert.strictEqual(approveData.rfq.awardNotifiedTo, 'SUP-SONDA');

    // Supplier receives Award Trigger notification
    const notifRes = await fetch(`${BASE_URL}/api/notifications/usr-supplier-sonda`);
    const notifData = await notifRes.json();
    assert.ok(notifData.notifications.length > 0, 'Supplier must receive award trigger notification');
    assert.strictEqual(notifData.notifications[0].type, 'AWARD_TRIGGER');

    // Award Data Integration -> Generate PO in external post-processing
    const poRes = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/generate-po`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const poData = await poRes.json();
    assert.strictEqual(poData.success, true);
    assert.ok(poData.purchaseOrder.sapPoNumber);
  });
});

