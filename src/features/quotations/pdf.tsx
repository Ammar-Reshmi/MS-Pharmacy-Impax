import { eq } from "drizzle-orm";
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { getDb } from "@/db";
import { customerAddresses, customers, quotationItems, quotations } from "@/db/schema";
import { formatInr } from "@/lib/money";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18, borderBottomWidth: 2, borderBottomColor: "#0f766e", paddingBottom: 12 },
  brand: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0f172a" },
  muted: { color: "#475569", marginTop: 3 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 12 },
  grid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  box: { width: "48%" },
  tableHeader: { flexDirection: "row", backgroundColor: "#0f172a", color: "#fff", padding: 6, fontFamily: "Helvetica-Bold" },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", padding: 6 },
  colName: { width: "38%" },
  colQty: { width: "10%", textAlign: "right" },
  colNum: { width: "17%", textAlign: "right" },
  totals: { marginTop: 12, alignItems: "flex-end" },
  totalLine: { flexDirection: "row", width: 220, justifyContent: "space-between", marginBottom: 4 },
  grand: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#0f766e" },
  terms: { marginTop: 18, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#cbd5e1", fontSize: 8, lineHeight: 1.4, color: "#475569" }
});

export type QuotationPdfRecord = {
  quoteNumber: string;
  status: string;
  validUntil: string;
  subtotal: string;
  taxTotal: string;
  grandTotal: string;
  termsSnapshot: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  gstin: string | null;
  legalName: string;
  displayName: string;
  companyGstin: string | null;
  legalAddress: string | null;
  companyEmail: string | null;
  companyPhone: string | null;
  authorizedSignatory: string | null;
  items: Array<{
    productNameSnapshot: string;
    skuSnapshot: string | null;
    strengthSnapshot: string | null;
    quantity: number;
    unitPrice: string;
    gstRate: string;
    lineTotal: string;
  }>;
  address?: { line1: string; city: string; state: string; postalCode: string } | null;
};

export async function loadQuotationPdfRecord(quotationId: string): Promise<QuotationPdfRecord | null> {
  const db = getDb();
  const quotation = (await db.select({
    id: quotations.id,
    quoteNumber: quotations.quoteNumber,
    status: quotations.status,
    validUntil: quotations.validUntil,
    subtotal: quotations.subtotal,
    taxTotal: quotations.taxTotal,
    grandTotal: quotations.grandTotal,
    termsSnapshot: quotations.termsSnapshot,
    businessName: customers.businessName,
    contactName: customers.contactName,
    email: customers.email,
    phone: customers.phone,
    gstin: customers.gstin,
    customerId: customers.id
  }).from(quotations).innerJoin(customers, eq(quotations.customerId, customers.id)).where(eq(quotations.id, quotationId)))[0];
  if (!quotation) return null;
  const [settings, items, address] = await Promise.all([
    db.query.businessSettings.findFirst(),
    db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotation.id)),
    db.query.customerAddresses.findFirst({ where: eq(customerAddresses.customerId, quotation.customerId) })
  ]);
  if (!settings) return null;
  return {
    quoteNumber: quotation.quoteNumber,
    status: quotation.status,
    validUntil: quotation.validUntil,
    subtotal: quotation.subtotal,
    taxTotal: quotation.taxTotal,
    grandTotal: quotation.grandTotal,
    termsSnapshot: quotation.termsSnapshot,
    businessName: quotation.businessName,
    contactName: quotation.contactName,
    email: quotation.email,
    phone: quotation.phone,
    gstin: quotation.gstin,
    legalName: settings.legalName,
    displayName: settings.displayName,
    companyGstin: settings.gstin,
    legalAddress: settings.legalAddress,
    companyEmail: settings.email,
    companyPhone: settings.phone,
    authorizedSignatory: settings.authorizedSignatory,
    items,
    address: address ? { line1: address.line1, city: address.city, state: address.state, postalCode: address.postalCode } : null
  };
}

function QuotationPdfDocument({ record }: { record: QuotationPdfRecord }) {
  return (
    <Document title={record.quoteNumber}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{record.displayName}</Text>
            <Text style={styles.muted}>{record.legalName}</Text>
            <Text style={styles.muted}>{record.legalAddress ?? ""}</Text>
            <Text style={styles.muted}>{[record.companyGstin ? `GSTIN ${record.companyGstin}` : null, record.companyEmail, record.companyPhone].filter(Boolean).join(" · ")}</Text>
          </View>
          <View>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>{record.quoteNumber}</Text>
            <Text style={styles.muted}>Status: {record.status.replaceAll("_", " ")}</Text>
            <Text style={styles.muted}>Valid until: {record.validUntil}</Text>
          </View>
        </View>
        <Text style={styles.title}>Commercial quotation</Text>
        <View style={styles.grid}>
          <View style={styles.box}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Bill to</Text>
            <Text>{record.businessName}</Text>
            <Text>{record.contactName}</Text>
            <Text>{record.email}</Text>
            <Text>{record.phone}</Text>
            {record.gstin ? <Text>GSTIN {record.gstin}</Text> : null}
          </View>
          <View style={styles.box}>
            <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 4 }}>Delivery</Text>
            <Text>{record.address ? `${record.address.line1}, ${record.address.city}, ${record.address.state} ${record.address.postalCode}` : "As provided with the enquiry"}</Text>
          </View>
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.colName}>Item</Text>
          <Text style={styles.colQty}>Qty</Text>
          <Text style={styles.colNum}>Unit</Text>
          <Text style={styles.colNum}>GST</Text>
          <Text style={styles.colNum}>Line</Text>
        </View>
        {record.items.map((item) => (
          <View style={styles.row} key={`${item.skuSnapshot}-${item.productNameSnapshot}`}>
            <Text style={styles.colName}>{item.productNameSnapshot}{item.strengthSnapshot ? ` (${item.strengthSnapshot})` : ""}{item.skuSnapshot ? `\nSKU ${item.skuSnapshot}` : ""}</Text>
            <Text style={styles.colQty}>{String(item.quantity)}</Text>
            <Text style={styles.colNum}>{formatInr(Number(item.unitPrice))}</Text>
            <Text style={styles.colNum}>{item.gstRate}%</Text>
            <Text style={styles.colNum}>{formatInr(Number(item.lineTotal))}</Text>
          </View>
        ))}
        <View style={styles.totals}>
          <View style={styles.totalLine}><Text>Subtotal</Text><Text>{formatInr(Number(record.subtotal))}</Text></View>
          <View style={styles.totalLine}><Text>GST</Text><Text>{formatInr(Number(record.taxTotal))}</Text></View>
          <View style={[styles.totalLine, styles.grand]}><Text>Grand total</Text><Text>{formatInr(Number(record.grandTotal))}</Text></View>
        </View>
        <Text style={styles.terms}>{record.termsSnapshot}{"\n\n"}Authorised signatory: {record.authorizedSignatory ?? "Commercial desk"}{"\n"}This quotation is generated after staff review. It is not a tax invoice.</Text>
      </Page>
    </Document>
  );
}

export async function renderQuotationPdf(record: QuotationPdfRecord) {
  return renderToBuffer(<QuotationPdfDocument record={record} />);
}

export function customerCanDownloadPricedPdf(status: string) {
  return status === "quoted" || status === "sent" || status === "accepted";
}
