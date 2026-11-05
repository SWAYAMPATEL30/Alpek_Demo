// ALPEK SAP Clean Core Integration Layer
// Implements Clean Core S/4HANA OData v4, cXML standard payloads, and SAP IDoc ORDERS05 translators

import { db } from './dataStore.js';

export class SapCleanCoreService {
  constructor() {
    this.cloudConnectorConnected = true;
  }

  /**
   * Sync Requisitions from SAP S/4HANA using standard OData v4
   * Endpoint: /sap/opu/odata4/sap/api_purchaserequisition_2/srvd_a2x/sap/purchaserequisition/0001/PurchaseRequisitionHeader
   */
  async syncPurchaseRequisitions() {
    if (!this.cloudConnectorConnected) {
      db.addAuditLog({
        protocol: 'OData v4',
        direction: 'INBOUND',
        endpoint: '/sap/opu/odata4/sap/api_purchaserequisition_2',
        status: 'FAILED',
        statusCode: 503,
        payloadType: 'JSON',
        referenceId: 'N/A',
        message: 'SAP Cloud Connector tunnel unreachable (SCC-ALTAMIRA-PROD-01).'
      });
      throw new Error('SAP Cloud Connector offline');
    }

    // Simulate standard SAP S/4HANA OData v4 JSON response
    const newPrNumber = `001000${Math.floor(1000 + Math.random() * 9000)}`;
    const newPr = {
      id: `PR-${newPrNumber}`,
      sapDocNumber: newPrNumber,
      sapDocType: 'NB',
      description: 'Catalytic Refining Agents & Filtration Membranes (Q4 Scheduled Run)',
      plant: '1010',
      plantName: 'Altamira PTA/PET Complex',
      porg: '1000',
      requester: 'Eduardo Garza (Operations Lead)',
      department: 'Process Chemistry',
      createdAt: new Date().toISOString(),
      status: 'Sourcing Pending',
      lineItems: [
        {
          itemNo: '00010',
          materialNo: 'MAT-CHEM-9801',
          description: 'High-Purity Palladium-Alumina Hydrogenation Catalyst',
          quantity: 120,
          unit: 'KG',
          targetUnitPrice: 1450.00,
          currency: 'USD',
          deliveryDate: '2026-11-28'
        },
        {
          itemNo: '00020',
          materialNo: 'MAT-FILT-4402',
          description: 'PTFE Microfiltration Membrane Filter Cartridges 0.2um',
          quantity: 350,
          unit: 'PC',
          targetUnitPrice: 75.00,
          currency: 'USD',
          deliveryDate: '2026-11-28'
        }
      ]
    };

    db.purchaseRequisitions.unshift(newPr);

    db.addAuditLog({
      protocol: 'OData v4',
      direction: 'INBOUND',
      endpoint: '/sap/opu/odata4/sap/api_purchaserequisition_2',
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'OData v4 EntitySet',
      referenceId: newPr.id,
      message: `Clean Core sync: Imported PR ${newPrNumber} from SAP S/4HANA (Plant 1010, 2 Line Items).`
    });

    return newPr;
  }

  /**
   * Post confirmed Purchase Order back to SAP S/4HANA via OData v4 and generate cXML for vendor
   * Endpoint: /sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001/PurchaseOrder
   */
  async postPurchaseOrderToSap(rfqId, quotationId) {
    const rfq = db.rfqs.find(r => r.id === rfqId);
    let quotation = db.quotations.find(q => q.id === quotationId);
    if (!quotation) {
      quotation = db.quotations.find(q => q.rfqId === rfqId && (q.supplierId === 'SUP-SONDA' || q.id === 'QUO-GTE-SONDA'));
    }
    if (!quotation) {
      quotation = db.quotations.find(q => q.rfqId === rfqId);
    }
    const supplier = quotation ? db.suppliers.find(s => s.id === quotation.supplierId) : null;

    if (!rfq || !quotation || !supplier) {
      throw new Error('Invalid RFQ, Quotation or Supplier ID');
    }

    const sapPoNumber = `45000${Math.floor(10000 + Math.random() * 90000)}`;
    const newPo = {
      id: `PO-${sapPoNumber}`,
      sapPoNumber,
      rfqId: rfq.id,
      rfqTitle: rfq.title,
      supplierId: supplier.id,
      supplierName: supplier.name,
      vendorSapCode: supplier.sapVendorId,
      porg: rfq.porg,
      plant: rfq.plant,
      currency: quotation.currency,
      totalAmount: quotation.totalBidAmount,
      lineItems: rfq.lineItems.map((item, idx) => {
        const bid = quotation.lineItemBids.find(b => b.itemNo === item.itemNo) || quotation.lineItemBids[idx];
        return {
          itemNo: item.itemNo,
          materialNo: item.materialNo,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: bid.unitPrice,
          totalPrice: bid.total
        };
      }),
      sapStatus: 'POSTED_CONFIRMED',
      sapMessage: `Clean Core OData POST: PO ${sapPoNumber} committed into S/4HANA (BAPI_PO_CREATE1 / OData v4).`,
      createdAt: new Date().toISOString(),
      acknowledgedBySupplier: false,
      acknowledgedAt: null
    };

    // Update RFQ status
    rfq.status = 'Awarded';
    rfq.awardedTo = supplier.id;
    rfq.awardedPoId = newPo.id;

    // Update PR status
    const sourcePr = db.purchaseRequisitions.find(p => p.id === rfq.sourcePrId);
    if (sourcePr) {
      sourcePr.status = `Awarded (PO ${sapPoNumber})`;
    }

    db.purchaseOrders.unshift(newPo);

    // 1. Audit Log: OData v4 to S/4HANA
    db.addAuditLog({
      protocol: 'OData v4',
      direction: 'OUTBOUND',
      endpoint: '/sap/opu/odata4/sap/api_purchaseorder_2/srvd_a2x/sap/purchaseorder/0001',
      status: 'SUCCESS',
      statusCode: 201,
      payloadType: 'OData v4 Deep Insert',
      referenceId: newPo.id,
      message: `Clean Core PO ${sapPoNumber} posted to S/4HANA. Supplier ${supplier.sapVendorId} awarded.`
    });

    // 2. Generate and dispatch cXML OrderRequest to Supplier
    const cxmlPayload = this.buildCxmlOrderRequest(newPo, supplier);
    db.addAuditLog({
      protocol: 'cXML',
      direction: 'OUTBOUND',
      endpoint: `https://edi.alpek.com/cxml/suppliers/${supplier.sapVendorId}`,
      status: 'SUCCESS',
      statusCode: 200,
      payloadType: 'cXML 1.2.040 OrderRequest',
      referenceId: newPo.id,
      message: `Dispatched cXML OrderRequest to ${supplier.name} (${cxmlPayload.length} bytes).`
    });

    return newPo;
  }

  /**
   * Generates standard cXML OrderRequest 1.2.040 payload
   */
  buildCxmlOrderRequest(po, supplier) {
    const timestamp = new Date().toISOString();
    return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE cXML SYSTEM "http://xml.cxml.org/schemas/cXML/1.2.040/cXML.dtd">
<cXML version="1.2.040" payloadID="${po.id}-${Date.now()}@alpek.com" timestamp="${timestamp}">
  <Header>
    <From>
      <Credential domain="NetworkID">
        <Identity>ALPEK-S4HANA-BUYER</Identity>
      </Credential>
    </From>
    <To>
      <Credential domain="VendorID">
        <Identity>${supplier.sapVendorId}</Identity>
      </Credential>
    </To>
    <Sender>
      <Credential domain="NetworkID">
        <Identity>ALPEK-PLATFORM-GATEWAY</Identity>
      </Credential>
      <UserAgent>ALPEK Clean Core Linking Platform 1.0</UserAgent>
    </Sender>
  </Header>
  <Request deploymentMode="production">
    <OrderRequest>
      <OrderRequestHeader orderID="${po.sapPoNumber}" orderDate="${timestamp.split('T')[0]}" type="new">
        <Total>
          <Money currency="${po.currency}">${po.totalAmount.toFixed(2)}</Money>
        </Total>
        <ShipTo>
          <Address addressID="${po.plant}">
            <Name xml:lang="en">Alpek Polyester Altamira Plant</Name>
            <PostalAddress>
              <DeliverTo>Receiving Dock 4</DeliverTo>
              <Street>Carretera Altamira-Tampico Km 14.5</Street>
              <City>Altamira</City>
              <State>TAM</State>
              <PostalCode>89600</PostalCode>
              <Country isoCountryCode="MX">Mexico</Country>
            </PostalAddress>
          </Address>
        </ShipTo>
      </OrderRequestHeader>
      ${po.lineItems.map(item => `
      <ItemOut quantity="${item.quantity}" lineNumber="${item.itemNo}">
        <ItemID>
          <SupplierPartID>${item.materialNo}</SupplierPartID>
        </ItemID>
        <ItemDetail>
          <UnitPrice>
            <Money currency="${po.currency}">${item.unitPrice.toFixed(2)}</Money>
          </UnitPrice>
          <Description xml:lang="en">${item.description}</Description>
          <UnitOfMeasure>${item.unit}</UnitOfMeasure>
        </ItemDetail>
      </ItemOut>`).join('')}
    </OrderRequest>
  </Request>
</cXML>`;
  }

  /**
   * Generates standard SAP IDoc ORDERS05 representation
   */
  buildSapIdocOrders05(po, supplier) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ORDERS05>
  <IDOC BEGIN="1">
    <EDI_DC40 SEGMENT="1">
      <TABNAM>EDI_DC40</TABNAM>
      <MANDT>${db.sapSettings.client}</MANDT>
      <DOCNUM>${po.sapPoNumber}</DOCNUM>
      <MESTYP>ORDERS</MESTYP>
      <IDOCTYP>ORDERS05</IDOCTYP>
      <SNDPRT>LS</SNDPRT>
      <SNDPRN>S4P_CLNT${db.sapSettings.client}</SNDPRN>
      <RCVPRT>LI</RCVPRT>
      <RCVPRN>${supplier.sapVendorId}</RCVPRN>
      <CREDAT>${new Date().toISOString().slice(0, 10).replace(/-/g, '')}</CREDAT>
    </EDI_DC40>
    <E1EDK01 SEGMENT="1">
      <CURCY>${po.currency}</CURCY>
      <HNAME>ALPEK PROCUREMENT</HNAME>
      <BSART>NB</BSART>
      <BELNR>${po.sapPoNumber}</BELNR>
    </E1EDK01>
    <E1EDKA1 SEGMENT="1">
      <PARVW>AG</PARVW>
      <PARTN>${po.porg}</PARTN>
      <NAME1>Alpek Direct Sourcing</NAME1>
    </E1EDKA1>
    <E1EDKA1 SEGMENT="1">
      <PARVW>LF</PARVW>
      <PARTN>${supplier.sapVendorId}</PARTN>
      <NAME1>${supplier.name}</NAME1>
    </E1EDKA1>
    ${po.lineItems.map(item => `
    <E1EDP01 SEGMENT="1">
      <POSEX>${item.itemNo}</POSEX>
      <MENGE>${item.quantity}</MENGE>
      <MENEE>${item.unit}</MENEE>
      <NETPR>${item.unitPrice}</NETPR>
      <E1EDP19 SEGMENT="1">
        <QUALF>002</QUALF>
        <KTEXT>${item.description}</KTEXT>
        <IDTNR>${item.materialNo}</IDTNR>
      </E1EDP19>
    </E1EDP01>`).join('')}
  </IDOC>
</ORDERS05>`;
  }
}

export const sapService = new SapCleanCoreService();
