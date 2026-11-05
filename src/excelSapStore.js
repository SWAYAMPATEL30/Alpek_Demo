// ALPEK Platform - Excel/CSV Dummy SAP Database Engine
// Replaces complex SAP ERP connection with a transparent, spreadsheet-backed data layer
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export class ExcelSapStore {
  safeWrite(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (err) {}
  }
  constructor() {
    this.prFilePath = path.join(DATA_DIR, 'SAP_PR_Inbound.csv');
    this.poFilePath = path.join(DATA_DIR, 'SAP_PO_Outbound.csv');
    this.initDefaultSheets();
  }

  initDefaultSheets(force = false) {
    if (!fs.existsSync(this.prFilePath) || force) {
      const defaultPrCsv = [
        'SAP_PR_Number,Doc_Type,Item,Material_Desc,Quantity,Unit,Valuation_Unit_Price_COP,Plant,Status,Requester,Department,Created_Date',
        '3000010443,NB,10,SUMINISTROS REFRI,7125000,Unidad,3.50,OP ANG (GTE Col),In Sourcing (Doc2432956265),Valeria Martinez,Purchases & Materials,2026-10-08',
        '10009241,NB,10,Bulk Purified Terephthalic Acid (PTA),500,TON,850.00,1010 (Altamira),Sourcing Pending,Carlos Ramirez,Operations & Refining,2026-10-24',
        '10009242,NB,10,Specialty Polymer Stabilizers Compound,8000,KG,14.50,2020 (Columbia),Sourcing Pending,Sarah Jenkins,Polyester Production,2026-10-22',
        '10009243,NB,10,Conductive FIBC Big Bags 1000kg,12000,PC,18.20,3030 (Cosoleacaque),Sourcing Pending,Mateo Morales,Packaging & Warehouse,2026-10-25'
      ].join('\n');
      this.safeWrite(this.prFilePath, );
    }

    if (!fs.existsSync(this.poFilePath) || force) {
      const defaultPoCsv = [
        'SAP_PO_Number,Source_PR,RFQ_Doc_ID,Awarded_Supplier,Supplier_ANID,Unit_Price_COP,Total_Amount_COP,Commit_Timestamp,Status',
        '450009180,3000010443,Doc2432956265,SONDA DE COLOMBIA S A,AN11459791479,3.00,21375000.00,2026-10-10T14:30:00Z,POSTED_CONFIRMED'
      ].join('\n');
      this.safeWrite(this.poFilePath, );
    }
  }

  // Parse CSV into array of objects
  parseCsv(content) {
    const lines = content.trim().split('\n').filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      // Handles simple commas without quotes or quoted cells
      const values = [];
      let inQuote = false;
      let curr = '';
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
          inQuote = !inQuote;
        } else if (c === ',' && !inQuote) {
          values.push(curr.trim());
          curr = '';
        } else {
          curr += c;
        }
      }
      values.push(curr.trim());

      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      return obj;
    });
  }

  // Format array of objects to CSV
  toCsv(headers, rows) {
    const headerLine = headers.join(',');
    const dataLines = rows.map(row => {
      return headers.map(h => {
        let val = String(row[h] !== undefined ? row[h] : '');
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',');
    });
    return [headerLine, ...dataLines].join('\n');
  }

  getInboundPrs() {
    const raw = fs.readFileSync(this.prFilePath, 'utf-8');
    return this.parseCsv(raw);
  }

  getOutboundPos() {
    const raw = fs.readFileSync(this.poFilePath, 'utf-8');
    return this.parseCsv(raw);
  }

  addInboundPr(row) {
    const prs = this.getInboundPrs();
    if (row.SAP_PR_Number) {
      const existing = prs.find(p => p.SAP_PR_Number === String(row.SAP_PR_Number));
      if (existing) {
        if (row.Status) existing.Status = row.Status;
        return existing;
      }
    }
    const newPr = {
      SAP_PR_Number: row.SAP_PR_Number || `30000${Math.floor(10000 + Math.random() * 90000)}`,
      Doc_Type: row.Doc_Type || 'NB',
      Item: row.Item || '10',
      Material_Desc: row.Material_Desc || 'New Sourced Material',
      Quantity: String(row.Quantity || 1000),
      Unit: row.Unit || 'Unidad',
      Valuation_Unit_Price_COP: String(row.Valuation_Unit_Price_COP || '3.50'),
      Plant: row.Plant || 'OP ANG (GTE Col)',
      Status: 'Sourcing Pending',
      Requester: row.Requester || 'Valeria Martinez',
      Department: row.Department || 'Purchases & Materials',
      Created_Date: new Date().toISOString().split('T')[0]
    };
    prs.unshift(newPr);
    const headers = [
      'SAP_PR_Number', 'Doc_Type', 'Item', 'Material_Desc', 'Quantity', 'Unit',
      'Valuation_Unit_Price_COP', 'Plant', 'Status', 'Requester', 'Department', 'Created_Date'
    ];
    fs.writeFileSync(this.prFilePath, this.toCsv(headers, prs), 'utf-8');
    return newPr;
  }

  updatePrStatus(prNumber, newStatus) {
    const prs = this.getInboundPrs();
    const target = prs.find(p => p.SAP_PR_Number === prNumber);
    if (target) {
      target.Status = newStatus;
      const headers = [
        'SAP_PR_Number', 'Doc_Type', 'Item', 'Material_Desc', 'Quantity', 'Unit',
        'Valuation_Unit_Price_COP', 'Plant', 'Status', 'Requester', 'Department', 'Created_Date'
      ];
      fs.writeFileSync(this.prFilePath, this.toCsv(headers, prs), 'utf-8');
    }
  }

  addOutboundPo(poRow) {
    const pos = this.getOutboundPos();
    const newPo = {
      SAP_PO_Number: poRow.SAP_PO_Number || `45000${Math.floor(10000 + Math.random() * 90000)}`,
      Source_PR: poRow.Source_PR || '3000010443',
      RFQ_Doc_ID: poRow.RFQ_Doc_ID || 'Doc2432956265',
      Awarded_Supplier: poRow.Awarded_Supplier || 'SONDA DE COLOMBIA S A',
      Supplier_ANID: poRow.Supplier_ANID || 'AN11459791479',
      Unit_Price_COP: String(poRow.Unit_Price_COP || '3.00'),
      Total_Amount_COP: String(poRow.Total_Amount_COP || '21375000.00'),
      Commit_Timestamp: new Date().toISOString(),
      Status: 'POSTED_CONFIRMED'
    };
    // Prepend to show latest at top
    pos.unshift(newPo);
    const headers = [
      'SAP_PO_Number', 'Source_PR', 'RFQ_Doc_ID', 'Awarded_Supplier',
      'Supplier_ANID', 'Unit_Price_COP', 'Total_Amount_COP', 'Commit_Timestamp', 'Status'
    ];
    fs.writeFileSync(this.poFilePath, this.toCsv(headers, pos), 'utf-8');

    // Also update matching PR status in sheet
    this.updatePrStatus(newPo.Source_PR, `Awarded (PO ${newPo.SAP_PO_Number})`);
    return newPo;
  }

  savePrSheet(csvText) {
    fs.writeFileSync(this.prFilePath, csvText.trim(), 'utf-8');
  }

  savePoSheet(csvText) {
    fs.writeFileSync(this.poFilePath, csvText.trim(), 'utf-8');
  }

  reset() {
    this.initDefaultSheets(true);
  }
}

export const excelSapStore = new ExcelSapStore();
