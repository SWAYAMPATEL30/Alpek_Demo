// Automated Functional Test Suite for SAP Sourcing & Excel Dummy Integration Platform
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:4000';

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING COMPREHENSIVE PLATFORM FUNCTIONAL TESTS');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error('     Error:', err.message);
      failed++;
    }
  }

  // 1. Reset state
  await test('1. System Reset & Clean Baseline', async () => {
    const res = await fetch(`${BASE_URL}/api/reset`, { method: 'POST' });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.success, true);
  });

  // 2. Executive Stats
  await test('2. Executive Dashboard Stats API', async () => {
    const res = await fetch(`${BASE_URL}/api/stats`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.activeRfqs >= 1);
    assert.ok(data.savingsPercent !== undefined);
  });

  // 3. Dummy SAP Excel Sheet (Inbound PRs)
  await test('3. Inbound PRs from Dummy SAP Excel Sheet', async () => {
    const res = await fetch(`${BASE_URL}/api/sap-sheet/prs`);
    const prs = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(prs));
    assert.ok(prs.length >= 3);
    const gtePr = prs.find(p => p.SAP_PR_Number === '3000010443');
    assert.ok(gtePr, 'PR 3000010443 must exist in Excel sheet');
    assert.equal(gtePr.Material_Desc, 'SUMINISTROS REFRI');
  });

  // 4. Add New Requisition Row to Excel Sheet
  let createdPrNumber = '';
  await test('4. Push New Requisition into Dummy SAP Excel Sheet', async () => {
    const payload = {
      Doc_Type: 'NB',
      Item: '10',
      Material_Desc: 'Industrial Refrigerant R-134a Cylinders',
      Quantity: '500',
      Unit: 'Cylinder',
      Valuation_Unit_Price_COP: '250000',
      Plant: 'OP ANG (GTE Col)',
      Requester: 'Carlos Fonseca (Field Engineer)',
      Department: 'Operations'
    };
    const res = await fetch(`${BASE_URL}/api/sap-sheet/prs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.ok(data.success);
    assert.ok(data.pr.SAP_PR_Number);
    createdPrNumber = data.pr.SAP_PR_Number;

    // Verify it now appears in Excel Sheet PR list
    const checkRes = await fetch(`${BASE_URL}/api/sap-sheet/prs`);
    const prs = await checkRes.json();
    assert.ok(prs.some(p => p.SAP_PR_Number === createdPrNumber));
  });

  // 5. RFP Detail & Invited Suppliers
  await test('5. Sourcing Project & RFP Doc2432956265 Retrieval', async () => {
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265`);
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.equal(data.rfq.id, 'Doc2432956265');
    assert.equal(data.rfq.projectId, '2000000892');
    assert.ok(data.suppliers.some(s => s.id === 'SUP-SONDA'));
  });

  // 6. Supplier Bid Submission
  await test('6. Supplier Portal Bid Submission (SONDA @ 3.00 COP)', async () => {
    const bidPayload = {
      supplierId: 'SUP-SONDA',
      currency: 'COP',
      leadTimeDays: 8,
      paymentTerms: 'Net 60 Days',
      remarks: 'Propuesta completa según Anexo No 2 con certificado ISO 9001:2015.',
      lineItemBids: [
        { itemNo: '2.1.1', unitPrice: 3.00, total: 21375000 }
      ]
    };
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/quotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bidPayload)
    });
    const data = await res.json();
    assert.equal(res.status, 201);
    assert.ok(data.success);
    assert.equal(data.quotation.totalBidAmount, 21375000);
    assert.ok(data.quotation.score >= 90);
  });

  // 7. Sourcing Award & PO Generation
  let awardedPoNumber = '';
  await test('7. Sourcing Project Award Execution & S/4HANA PO Creation', async () => {
    const res = await fetch(`${BASE_URL}/api/rfqs/Doc2432956265/award`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotationId: 'QUO-GTE-SONDA' })
    });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.ok(data.success);
    assert.ok(data.purchaseOrder.sapPoNumber);
    awardedPoNumber = data.purchaseOrder.sapPoNumber;
    assert.equal(data.purchaseOrder.supplierName, 'SONDA DE COLOMBIA S A');
    assert.equal(data.purchaseOrder.totalAmount, 21375000);
  });

  // 8. Verify Awarded PO Written to Dummy SAP Excel Sheet
  await test('8. Verify Awarded PO Committed to Dummy SAP Excel Outbound Sheet', async () => {
    const res = await fetch(`${BASE_URL}/api/sap-sheet/pos`);
    const pos = await res.json();
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(pos));
    const matched = pos.find(p => p.SAP_PO_Number === awardedPoNumber);
    assert.ok(matched, `PO ${awardedPoNumber} must exist in SAP_PO_Outbound sheet`);
    assert.equal(matched.Awarded_Supplier, 'SONDA DE COLOMBIA S A');
    assert.equal(matched.Status, 'POSTED_CONFIRMED');
  });

  // 9. Download CSV Endpoint
  await test('9. Download Excel / CSV Files Endpoint', async () => {
    const resPr = await fetch(`${BASE_URL}/api/sap-sheet/download?sheet=prs`);
    assert.equal(resPr.status, 200);
    const prCsv = await resPr.text();
    assert.ok(prCsv.includes('SAP_PR_Number,Doc_Type'));

    const resPo = await fetch(`${BASE_URL}/api/sap-sheet/download?sheet=pos`);
    assert.equal(resPo.status, 200);
    const poCsv = await resPo.text();
    assert.ok(poCsv.includes('SAP_PO_Number,Source_PR'));
  });

  // 10. cXML 1.2.040 OrderRequest
  await test('10. cXML 1.2.040 Standard Payload Generation', async () => {
    const res = await fetch(`${BASE_URL}/api/pos/PO-${awardedPoNumber}/cxml`);
    assert.equal(res.status, 200);
    const xml = await res.text();
    assert.ok(xml.includes('cXML version="1.2.040"'));
    assert.ok(xml.includes('<OrderRequest>'));
    assert.ok(xml.includes('21375000.00'));
  });

  // 11. SAP IDoc ORDERS05
  await test('11. SAP IDoc ORDERS05 Payload Generation', async () => {
    const res = await fetch(`${BASE_URL}/api/pos/PO-${awardedPoNumber}/idoc`);
    assert.equal(res.status, 200);
    const xml = await res.text();
    assert.ok(xml.includes('EDI_DC40'));
    assert.ok(xml.includes('<IDOCTYP>ORDERS05</IDOCTYP>'));
    assert.ok(xml.includes('E1EDK01'));
  });

  // 12. Integration Audit Trail
  await test('12. Managed Gateway (CIG) Audit Trail Logging', async () => {
    const res = await fetch(`${BASE_URL}/api/audit-logs`);
    const logs = await res.json();
    assert.equal(res.status, 200);
    assert.ok(logs.length >= 3);
    assert.ok(logs.some(l => l.protocol.includes('Excel SAP Sheet Sync') || l.protocol.includes('cXML')));
  });

  console.log('\n------------------------------------------------------');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
