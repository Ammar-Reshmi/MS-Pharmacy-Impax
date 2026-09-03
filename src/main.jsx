import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams} from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ArrowRight, ChevronDown, Download, FileText, Filter, Menu, Minus, Package,
  Plus, Printer, Search, ShieldCheck, ShoppingCart, Trash2, Upload, X, CheckCircle2
} from "lucide-react";
import "./styles.css";
import demoProducts from "./data/products.json";

const BRAND = {
  name: "RoyalMed Pharmaceuticals",
  address: "Professional Pharmaceutical Supply Division",
  phone: "+91 00000 00000",
  email: "sales@royalmed.example",
  website: "www.royalmed.example"
};

const money = (v) => {
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : String(v || "Information not available");
};

const parsePrice = (v) => {
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("royalmed-products");
    return saved ? JSON.parse(saved) : demoProducts;
  });
  const [quote, setQuote] = useState(() => JSON.parse(localStorage.getItem("royalmed-quote") || "[]"));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => localStorage.setItem("royalmed-products", JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem("royalmed-quote", JSON.stringify(quote)), [quote]);

  const addToQuote = (product) => {
    setQuote(q => {
      const found = q.find(x => x.id === product.id);
      if (found) return q.map(x => x.id === product.id ? {...x, qty: x.qty + 1} : x);
      return [...q, {...product, qty: 1}];
    });
  };

  const updateQty = (id, delta) => setQuote(q => q.map(x => x.id === id ? {...x, qty: Math.max(1, x.qty + delta)} : x));
  const removeQuote = (id) => setQuote(q => q.filter(x => x.id !== id));
  const clearQuote = () => setQuote([]);

  const importProducts = (rows) => {
    const mapped = rows.map((r, i) => ({
      id: Number(r.id || r["Sr No"] || Date.now() + i),
      productName: r.productName || r["Product Name"] || "",
      genericName: r.genericName || r["Generic / Salt"] || "",
      strength: r.strength || r["Strength"] || "",
      dosageForm: r.dosageForm || r["Dosage Form"] || "",
      manufacturer: r.manufacturer || r["Manufacturer"] || "",
      category: r.category || r["Category"] || r["Dosage Form"] || "Other Pharmaceutical Products",
      description: r.description || r["Description"] || "",
      uses: r.uses || r["Uses"] || "Information not available",
      composition: r.composition || r["Composition"] || r["Generic / Salt"] || "",
      packSize: String(r.packSize || r["Pack Size"] || ""),
      mrp: r.mrp || r["MRP"] || r["Price"] || "",
      quotationPrice: r.quotationPrice || r["Quotation Price"] || r["Price"] || "",
      prescriptionRequired: String(r.prescriptionRequired || "").toLowerCase() === "true",
      image: r.image || r.imageUrl || r["Image URL"] || "",
      status: r.status || "Active"
    })).filter(x => x.productName);
    setProducts(mapped);
  };

  return (
    <div className="app-shell">
      <Navbar quoteCount={quote.length} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
      <Routes>
        <Route path="/" element={<Home products={products} addToQuote={addToQuote}/>}/>
        <Route path="/medicines" element={<Medicines products={products} addToQuote={addToQuote}/>}/>
        <Route path="/medicines/:id" element={<MedicineDetails products={products} addToQuote={addToQuote}/>}/>
        <Route path="/quotation" element={<Quotation quote={quote} updateQty={updateQty} removeQuote={removeQuote} clearQuote={clearQuote}/>}/>
        <Route path="/admin" element={<Admin products={products} setProducts={setProducts} importProducts={importProducts}/>}/>
        <Route path="/about" element={<About/>}/>
        <Route path="/contact" element={<Contact/>}/>
      </Routes>
      <Footer/>
    </div>
  );
}

function Navbar({quoteCount, mobileOpen, setMobileOpen}) {
  const links = [["Home","/"],["Medicines","/medicines"],["Categories","/medicines"],["Quotation","/quotation"],["About","/about"],["Contact","/contact"]];
  return <header className="navbar">
    <div className="nav-inner">
      <Link className="brand" to="/">
        <span className="brand-mark"><ShieldCheck size={22}/></span>
        <span><b>RoyalMed</b><small>PHARMACEUTICALS</small></span>
      </Link>
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">{mobileOpen ? <X/> : <Menu/>}</button>
      <nav className={mobileOpen ? "nav-links open" : "nav-links"}>
        {links.map(([label,path]) => <NavLink key={label} to={path} onClick={() => setMobileOpen(false)}>{label}</NavLink>)}
      </nav>
      <div className="nav-actions">
        <Link className="icon-btn" to="/medicines" aria-label="Search"><Search size={19}/></Link>
        <Link className="quote-chip" to="/quotation"><ShoppingCart size={18}/><span>{quoteCount}</span></Link>
      </div>
    </div>
  </header>
}

function Home({products, addToQuote}) {
  return <>
    <section className="hero">
      <div className="hero-pattern"></div>
      <div className="container hero-grid">
        <div>
          <div className="eyebrow"><span></span> PROFESSIONAL PHARMACEUTICAL SUPPLY</div>
          <h1>Trusted Medicines.<br/><em>Professional Quotations.</em></h1>
          <p>Explore a structured pharmaceutical catalogue and create accurate, polished medicine quotations without the clutter of a conventional shopping site.</p>
          <div className="hero-actions">
            <Link className="btn primary" to="/medicines">Browse Medicines <ArrowRight size={17}/></Link>
            <Link className="btn outline" to="/quotation">Create Quotation <FileText size={17}/></Link>
          </div>
          <div className="trust-row"><span><CheckCircle2 size={16}/> Structured catalogue</span><span><CheckCircle2 size={16}/> Quotation-ready</span><span><CheckCircle2 size={16}/> Admin editable</span></div>
        </div>
        <div className="hero-visual">
          <div className="med-orbit orbit-one"></div><div className="med-orbit orbit-two"></div>
          <div className="bottle"><div className="bottle-cap"></div><div className="bottle-label"><span>ROYALMED</span><strong>Rx</strong><small>PHARMACEUTICAL<br/>SUPPLY</small></div></div>
          <div className="floating-card fc-top"><Package size={19}/><div><b>{products.length}</b><small>Catalogue items</small></div></div>
          <div className="floating-card fc-bottom"><FileText size={19}/><div><b>QUOTE</b><small>Professional output</small></div></div>
        </div>
      </div>
    </section>

    <section className="section">
      <div className="container">
        <div className="section-head"><div><span className="kicker">CURATED CATALOGUE</span><h2>Featured Medicines</h2></div><Link className="text-link" to="/medicines">View full catalogue <ArrowRight size={16}/></Link></div>
        <div className="product-grid">{products.slice(0,4).map(p => <MedicineCard key={p.id} product={p} addToQuote={addToQuote}/>)}</div>
      </div>
    </section>

    <section className="dark-panel">
      <div className="container dark-grid">
        <div><span className="kicker light">BUILT FOR PROFESSIONALS</span><h2>From product search to a polished quotation.</h2></div>
        <div className="process"><div><b>01</b><span>Search & filter</span></div><div><b>02</b><span>Add to quotation</span></div><div><b>03</b><span>Adjust quantities</span></div><div><b>04</b><span>Generate PDF</span></div></div>
      </div>
    </section>
  </>
}

function Medicines({products, addToQuote}) {
  const [q,setQ]=useState(""); const [category,setCategory]=useState("All"); const [form,setForm]=useState("All"); const [sort,setSort]=useState("Name A-Z");
  const categories = ["All", ...new Set(products.map(p=>p.category).filter(Boolean))];
  const forms = ["All", ...new Set(products.map(p=>p.dosageForm).filter(Boolean))];
  const filtered = useMemo(() => {
    let list = products.filter(p => p.status !== "Inactive");
    const s=q.toLowerCase().trim();
    if(s) list=list.filter(p=>[p.productName,p.genericName,p.manufacturer,p.strength,p.category,p.dosageForm].join(" ").toLowerCase().includes(s));
    if(category!=="All") list=list.filter(p=>p.category===category);
    if(form!=="All") list=list.filter(p=>p.dosageForm===form);
    return [...list].sort((a,b)=>{
      if(sort==="Name Z-A") return b.productName.localeCompare(a.productName);
      if(sort==="Price Low to High") return parsePrice(a.quotationPrice)-parsePrice(b.quotationPrice);
      if(sort==="Price High to Low") return parsePrice(b.quotationPrice)-parsePrice(a.quotationPrice);
      return a.productName.localeCompare(b.productName);
    });
  },[products,q,category,form,sort]);

  return <main className="page"><div className="container">
    <div className="page-title"><div><span className="kicker">PRODUCT CATALOGUE</span><h1>Medicine Catalogue</h1><p>Search by product, generic name, manufacturer, strength, category or dosage form.</p></div></div>
    <div className="catalog-toolbar">
      <div className="search-box"><Search size={19}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search medicines by name, generic name, manufacturer, or strength..."/></div>
      <select value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.slice(1).map(x=><option key={x}>{x}</option>)}</select>
      <select value={form} onChange={e=>setForm(e.target.value)}><option>All</option>{forms.slice(1).map(x=><option key={x}>{x}</option>)}</select>
      <select value={sort} onChange={e=>setSort(e.target.value)}><option>Name A-Z</option><option>Name Z-A</option><option>Price Low to High</option><option>Price High to Low</option></select>
    </div>
    <div className="catalog-meta"><span>{filtered.length} products</span><span><Filter size={15}/> Filters update instantly</span></div>
    <div className="product-grid">{filtered.map(p=><MedicineCard key={p.id} product={p} addToQuote={addToQuote}/>)}</div>
    {!filtered.length && <div className="empty-state"><Search size={30}/><h3>No matching medicines</h3><p>Try a broader product or generic-name search.</p></div>}
  </div></main>
}

function ImageBox({product, large=false}) {
  const [failed,setFailed]=useState(false);
  return <div className={large ? "image-box large" : "image-box"}>{product.image && !failed ? <img src={product.image} alt={product.productName} onError={()=>setFailed(true)}/> : <div className="image-placeholder"><Package size={35}/><span>Image Not Available</span></div>}</div>
}

function MedicineCard({product, addToQuote}) {
  return <article className="medicine-card">
    <Link to={`/medicines/${product.id}`}><ImageBox product={product}/></Link>
    <div className="card-body">
      <div className="card-tags"><span>{product.dosageForm || "Product"}</span>{product.prescriptionRequired && <i>Rx</i>}</div>
      <Link to={`/medicines/${product.id}`}><h3>{product.productName}</h3></Link>
      <p className="generic">Generic: <b>{product.genericName || "Information not available"}</b></p>
      <dl><div><dt>Strength</dt><dd>{product.strength || "Information not available"}</dd></div><div><dt>Manufacturer</dt><dd>{product.manufacturer || "Information not available"}</dd></div><div><dt>Pack</dt><dd>{product.packSize || "Information not available"}</dd></div></dl>
      <div className="price-row"><div><small>Quotation</small><strong>{money(product.quotationPrice)}</strong></div><div className="mrp"><small>MRP</small><span>{money(product.mrp)}</span></div></div>
      <div className="card-actions"><Link className="btn small outline-dark" to={`/medicines/${product.id}`}>View Details</Link><button className="btn small primary" onClick={()=>addToQuote(product)}>Add Quote</button></div>
    </div>
  </article>
}

function MedicineDetails({products,addToQuote}) {
  const {id}=useParams(); const p=products.find(x=>String(x.id)===String(id));
  if(!p) return <main className="page"><div className="container empty-state"><h2>Product not found</h2><Link className="btn primary" to="/medicines">Back to catalogue</Link></div></main>;
  return <main className="page"><div className="container">
    <div className="breadcrumbs"><Link to="/medicines">Medicines</Link> / {p.productName}</div>
    <div className="detail-grid"><ImageBox product={p} large/><div className="detail-info">
      <span className="kicker">{p.category || "PHARMACEUTICAL PRODUCT"}</span><h1>{p.productName}</h1>
      <p className="lead">{p.description || "Information not available"}</p>
      <div className="spec-table">
        {[["Generic / Salt",p.genericName],["Strength",p.strength],["Dosage Form",p.dosageForm],["Manufacturer",p.manufacturer],["Pack Size",p.packSize],["Prescription",p.prescriptionRequired ? "Required" : "Not specified"]].map(([k,v])=><div key={k}><span>{k}</span><b>{v || "Information not available"}</b></div>)}
      </div>
      <div className="detail-price"><div><small>Quotation Price</small><strong>{money(p.quotationPrice)}</strong></div><div><small>MRP</small><span>{money(p.mrp)}</span></div></div>
      <button className="btn primary wide" onClick={()=>addToQuote(p)}><Plus size={18}/> Add to Quotation</button>
      {p.prescriptionRequired && <div className="alert"><strong>Prescription indicator</strong><span>Verify prescription requirements before supply.</span></div>}
    </div></div>
    <div className="info-sections"><InfoBlock title="Description" text={p.description}/><InfoBlock title="Uses" text={p.uses}/><InfoBlock title="Composition" text={p.composition}/><InfoBlock title="Manufacturer Information" text={p.manufacturer}/></div>
    <div className="disclaimer"><ShieldCheck size={20}/><p>Medicine information is provided for catalogue and quotation purposes. Always verify the product packaging and consult a qualified healthcare professional for medical advice.</p></div>
  </div></main>
}
function InfoBlock({title,text}){return <section><h3>{title}</h3><p>{text || "Information not available"}</p></section>}

function Quotation({quote,updateQty,removeQuote,clearQuote}) {
  const [customer,setCustomer]=useState({name:"",company:"",address:"",phone:"",email:""});
  const [discount,setDiscount]=useState(0); const [gst,setGst]=useState(0);
  const subtotal=quote.reduce((s,x)=>s+parsePrice(x.quotationPrice)*x.qty,0);
  const discountAmt=Math.min(subtotal,Number(discount)||0); const taxable=Math.max(0,subtotal-discountAmt); const tax=taxable*(Number(gst)||0)/100; const total=taxable+tax;
  const quoteNo=`QT-${new Date().getFullYear()}-${String(Math.max(1,Date.now()%10000)).padStart(4,"0")}`;

  const makePDF=()=>{
    const doc=new jsPDF();
    doc.setFillColor(11,107,80); doc.rect(0,0,210,30,"F");
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.text(BRAND.name,14,13); doc.setFontSize(8); doc.text(`${BRAND.address} | ${BRAND.phone} | ${BRAND.email}`,14,21);
    doc.setTextColor(17,17,17); doc.setFontSize(20); doc.text("MEDICINE QUOTATION",14,45);
    doc.setFontSize(9); doc.text(`Quotation Number: ${quoteNo}`,14,53); doc.text(`Date: ${new Date().toLocaleDateString("en-GB")}`,140,53);
    doc.setFontSize(10); doc.text(`Customer: ${customer.name || "Information not available"}`,14,64); doc.text(`Company: ${customer.company || "Information not available"}`,14,71);
    doc.text(`Phone: ${customer.phone || "Information not available"}`,14,78); doc.text(`Email: ${customer.email || "Information not available"}`,110,78);
    autoTable(doc,{startY:88,head:[["No.","Medicine","Strength","Pack","Qty","Unit Price","Total"]],body:quote.map((x,i)=>[i+1,x.productName,x.strength,x.packSize,x.qty,money(x.quotationPrice),money(parsePrice(x.quotationPrice)*x.qty)]),headStyles:{fillColor:[18,59,109]},styles:{fontSize:8}});
    let y=doc.lastAutoTable.finalY+12; doc.setFontSize(10);
    doc.text(`Subtotal: ${money(subtotal)}`,145,y); doc.text(`Discount: ${money(discountAmt)}`,145,y+7); doc.text(`GST: ${money(tax)}`,145,y+14); doc.setFontSize(13); doc.text(`Grand Total: ${money(total)}`,145,y+25);
    doc.setFontSize(9); doc.text("Terms & Conditions",14,y+42); doc.text("Prices and product information should be verified against the final supplied packaging.",14,y+49);
    doc.text("Authorized Signature",150,y+68);
    doc.save(`${quoteNo}.pdf`);
  };

  const print=()=>window.print();
  return <main className="page quotation-page"><div className="container">
    <div className="page-title"><div><span className="kicker">DOCUMENT WORKSPACE</span><h1>Medicine Quotation</h1><p>Prepare a professional quotation from the selected catalogue items.</p></div></div>
    <div className="quote-layout">
      <section className="quote-main">
        {!quote.length ? <div className="empty-state"><FileText size={34}/><h3>Your quotation is empty</h3><p>Add medicines from the catalogue to start building a quotation.</p><Link className="btn primary" to="/medicines">Browse Medicines</Link></div> :
        <div className="quote-table-wrap"><table className="quote-table"><thead><tr><th>No.</th><th>Medicine</th><th>Strength</th><th>Pack</th><th>Qty</th><th>Unit</th><th>Total</th><th></th></tr></thead><tbody>
          {quote.map((x,i)=><tr key={x.id}><td>{i+1}</td><td><b>{x.productName}</b><small>{x.genericName}</small></td><td>{x.strength}</td><td>{x.packSize}</td><td><div className="qty"><button onClick={()=>updateQty(x.id,-1)}><Minus size={14}/></button><b>{x.qty}</b><button onClick={()=>updateQty(x.id,1)}><Plus size={14}/></button></div></td><td>{money(x.quotationPrice)}</td><td><b>{money(parsePrice(x.quotationPrice)*x.qty)}</b></td><td><button className="icon-danger" onClick={()=>removeQuote(x.id)}><Trash2 size={16}/></button></td></tr>)}
        </tbody></table><button className="text-danger" onClick={clearQuote}>Clear Quotation</button></div>}
      </section>
      <aside className="quote-side">
        <h3>Customer Details</h3>
        {Object.entries({name:"Customer Name",company:"Company",address:"Address",phone:"Phone",email:"Email"}).map(([k,l])=><input key={k} value={customer[k]} onChange={e=>setCustomer({...customer,[k]:e.target.value})} placeholder={l}/>)}
        <div className="split-inputs"><label>Discount ($)<input type="number" min="0" value={discount} onChange={e=>setDiscount(e.target.value)}/></label><label>GST (%)<input type="number" min="0" value={gst} onChange={e=>setGst(e.target.value)}/></label></div>
        <div className="summary"><div><span>Subtotal</span><b>{money(subtotal)}</b></div><div><span>Discount</span><b>- {money(discountAmt)}</b></div><div><span>GST</span><b>{money(tax)}</b></div><div className="grand"><span>Grand Total</span><strong>{money(total)}</strong></div></div>
        <button className="btn primary wide" disabled={!quote.length} onClick={makePDF}><Download size={17}/> Download PDF</button>
        <button className="btn outline-dark wide" disabled={!quote.length} onClick={print}><Printer size={17}/> Print Quotation</button>
        <small className="quote-note">Quotation No. {quoteNo}</small>
      </aside>
    </div>
  </div></main>
}

function Admin({products,setProducts,importProducts}) {
  const [authed,setAuthed]=useState(()=>sessionStorage.getItem("royalmed-admin")==="1");
  const [editing,setEditing]=useState(null);
  const [password,setPassword]=useState("");
  const login=(e)=>{e.preventDefault(); if(password==="admin123"){sessionStorage.setItem("royalmed-admin","1");setAuthed(true)}};
  if(!authed) return <main className="page"><div className="container admin-login"><ShieldCheck size={36}/><span className="kicker">AUTHORIZED ACCESS</span><h1>Admin Portal</h1><p>Demo authentication is enabled for this prototype.</p><form onSubmit={login}><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Demo password: admin123"/><button className="btn primary wide">Sign In</button></form></div></main>;
  const save=(p)=>{setProducts(xs=>{const found=xs.some(x=>x.id===p.id);return found?xs.map(x=>x.id===p.id?p:x):[...xs,p]});setEditing(null)};
  const remove=(id)=>setProducts(xs=>xs.filter(x=>x.id!==id));
  const importFile=(e)=>{const f=e.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=ev=>{const wb=XLSX.read(ev.target.result,{type:"array"});const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);importProducts(rows)};reader.readAsArrayBuffer(f)};
  return <main className="page"><div className="container">
    <div className="admin-head"><div><span className="kicker">CATALOGUE CONTROL</span><h1>Admin Dashboard</h1><p>Manage the structured medicine catalogue stored in local browser storage for this demo.</p></div><label className="btn outline-dark upload-btn"><Upload size={17}/> Import Excel/CSV<input type="file" accept=".xlsx,.xls,.csv" onChange={importFile}/></label></div>
    <div className="admin-stats"><div><b>{products.length}</b><span>Total products</span></div><div><b>{products.filter(p=>p.status!=="Inactive").length}</b><span>Active</span></div><div><b>{new Set(products.map(p=>p.manufacturer)).size}</b><span>Manufacturers</span></div></div>
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Generic</th><th>Strength</th><th>Manufacturer</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><b>{p.productName}</b></td><td>{p.genericName}</td><td>{p.strength}</td><td>{p.manufacturer}</td><td>{money(p.quotationPrice)}</td><td>{p.status}</td><td><button className="btn tiny outline-dark" onClick={()=>setEditing(p)}>Edit</button> <button className="icon-danger" onClick={()=>remove(p.id)}><Trash2 size={15}/></button></td></tr>)}</tbody></table></div>
    {editing && <ProductModal product={editing} onSave={save} onClose={()=>setEditing(null)}/>}
  </div></main>
}
function ProductModal({product,onSave,onClose}){
  const [p,setP]=useState(product); const fields=[["productName","Product Name"],["genericName","Generic / Salt"],["strength","Strength"],["dosageForm","Dosage Form"],["manufacturer","Manufacturer"],["category","Category"],["packSize","Pack Size"],["mrp","MRP"],["quotationPrice","Quotation Price"],["image","Image URL"],["description","Description"],["uses","Uses"],["composition","Composition"]];
  return <div className="modal-backdrop"><div className="modal"><button className="modal-close" onClick={onClose}><X/></button><span className="kicker">EDIT PRODUCT</span><h2>{p.productName}</h2><div className="form-grid">{fields.map(([k,l])=><label key={k}>{l}<input value={p[k] ?? ""} onChange={e=>setP({...p,[k]:e.target.value})}/></label>)}</div><div className="modal-actions"><button className="btn outline-dark" onClick={onClose}>Cancel</button><button className="btn primary" onClick={()=>onSave(p)}>Save Changes</button></div></div></div>
}

function About(){return <main className="page"><div className="container narrow"><span className="kicker">ABOUT ROYALMED</span><h1>A catalogue-first approach to pharmaceutical supply.</h1><p className="lead">This demo is designed around professional product discovery and quotation preparation rather than consumer checkout. Product records remain structured, editable and ready for a future database-backed deployment.</p><div className="about-cards"><div><ShieldCheck/><h3>Trust</h3><p>Clear product fields and deliberate handling of unavailable information.</p></div><div><FileText/><h3>Quotations</h3><p>Build, revise, print and export professional quotation documents.</p></div><div><Package/><h3>Maintainable</h3><p>Product data is separated from the interface for easier future imports.</p></div></div></div></main>}
function Contact(){return <main className="page"><div className="container contact-grid"><div><span className="kicker">CONTACT</span><h1>Professional supply enquiries.</h1><p className="lead">Use this section for your verified company contact details before publishing the site.</p></div><div className="contact-card"><b>{BRAND.name}</b><span>{BRAND.address}</span><span>{BRAND.phone}</span><span>{BRAND.email}</span><span>{BRAND.website}</span></div></div></main>}

function Footer(){return <footer><div className="container footer-grid"><div><div className="brand footer-brand"><span className="brand-mark"><ShieldCheck size={20}/></span><span><b>RoyalMed</b><small>PHARMACEUTICALS</small></span></div><p>Professional medicine catalogue and quotation workflow.</p></div><div><b>Navigation</b><Link to="/medicines">Medicines</Link><Link to="/quotation">Quotation</Link><Link to="/admin">Admin</Link></div><div><b>Important</b><span>Catalogue data must be verified before commercial use.</span><span>Not a substitute for medical advice.</span></div></div><div className="container footer-bottom">© {new Date().getFullYear()} RoyalMed Pharmaceuticals. Demo interface.</div></footer>}

createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);
