export type CatalogueFormImage = "tablet" | "cream" | "oral-paste" | "oral-jelly";

export type CatalogueMasterProduct = {
  sku: string;
  productName: string;
  genericName: string;
  categoryName: string;
  categorySlug: string;
  strength: string;
  dosageForm: string;
  manufacturer: string | null;
  packSize: string;
  composition: string;
  description: string;
  unitPrice: string | null;
  gstRate: string;
  imageKey: CatalogueFormImage;
  preserveSeedPrice: boolean;
};

const antiHelminthic = {
  name: "Anti-helminthic",
  slug: "anti-helminthic",
  description: "Oral and topical anthelmintic supply lines for B2B procurement."
};

const erectileDysfunction = {
  name: "Erectile dysfunction",
  slug: "erectile-dysfunction",
  description: "PDE5 inhibitor and combination products for authorised B2B supply."
};

function tabletCopy(productName: string, salt: string, use: string) {
  return `${productName} is listed for B2B catalogue supply. Each pack contains the labelled salt ${salt}. ${use} Specifications, pack size, and INR pricing are provided for commercial quotation only and are not medical advice.`;
}

export const catalogueCategories = [antiHelminthic, erectileDysfunction];

export const catalogueMaster: CatalogueMasterProduct[] = [
  {
    sku: "MED-IVM-003", productName: "Ivermectine 3 mg", genericName: "Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "3 mg", dosageForm: "Tablet", manufacturer: "Healing Pharma", packSize: "100 tablets", composition: "Ivermectin IP 3 mg",
    description: tabletCopy("Ivermectine 3 mg", "Ivermectin 3 mg", "This lower-strength oral tablet is used in anthelmintic supply programmes."),
    unitPrice: "150.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: true
  },
  {
    sku: "MED-IVM-006", productName: "Ivermectine 6 mg", genericName: "Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "6 mg", dosageForm: "Tablet", manufacturer: "Healing Pharma", packSize: "100 tablets", composition: "Ivermectin IP 6 mg",
    description: tabletCopy("Ivermectine 6 mg", "Ivermectin 6 mg", "A standard oral anthelmintic strength for wholesale enquiry."),
    unitPrice: "220.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: true
  },
  {
    sku: "MED-IVM-012", productName: "Ivermectine 12 mg", genericName: "Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "12 mg", dosageForm: "Tablet", manufacturer: "Healing Pharma", packSize: "100 tablets", composition: "Ivermectin IP 12 mg",
    description: tabletCopy("Ivermectine 12 mg", "Ivermectin 12 mg", "Higher-strength oral tablets for bulk anthelmintic requirements."),
    unitPrice: "350.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: true
  },
  {
    sku: "MED-IVM-020", productName: "Ivermectine 20 mg", genericName: "Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "20 mg", dosageForm: "Tablet", manufacturer: "Healing Pharma", packSize: "100 tablets", composition: "Ivermectin IP 20 mg",
    description: tabletCopy("Ivermectine 20 mg", "Ivermectin 20 mg", "Listed for institutional and distributor quotation requests."),
    unitPrice: "520.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: true
  },
  {
    sku: "MED-IVM-040", productName: "Ivermectine 40 mg", genericName: "Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "40 mg", dosageForm: "Tablet", manufacturer: "Healing Pharma", packSize: "100 tablets", composition: "Ivermectin IP 40 mg",
    description: tabletCopy("Ivermectine 40 mg", "Ivermectin 40 mg", "High-strength oral presentation for specialised B2B supply."),
    unitPrice: "850.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: true
  },
  {
    sku: "MED-IVM-080", productName: "Ivermectine 80 mg", genericName: "Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "80 mg", dosageForm: "Tablet", manufacturer: "Healing Pharma", packSize: "100 tablets", composition: "Ivermectin IP 80 mg",
    description: tabletCopy("Ivermectine 80 mg", "Ivermectin 80 mg", "Maximum listed oral strength in the Ivermectine range."),
    unitPrice: "1400.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: true
  },
  {
    sku: "MSPI-007", productName: "Fenbendazole 222", genericName: "Fenbendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "222 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Fenbendazole 222 mg",
    description: tabletCopy("Fenbendazole 222", "Fenbendazole 222 mg", "Benzimidazole anthelmintic tablet for veterinary and commercial supply lists."),
    unitPrice: "185.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-008", productName: "Fenbendazole 444", genericName: "Fenbendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "444 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Fenbendazole 444 mg",
    description: tabletCopy("Fenbendazole 444", "Fenbendazole 444 mg", "Mid-strength fenbendazole tablet for bulk purchase enquiries."),
    unitPrice: "275.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-009", productName: "Fenbendazole 500", genericName: "Fenbendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "500 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Fenbendazole 500 mg",
    description: tabletCopy("Fenbendazole 500", "Fenbendazole 500 mg", "500 mg oral tablet commonly requested in anthelmintic tenders."),
    unitPrice: "310.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-010", productName: "Fenbendazole 888", genericName: "Fenbendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "888 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Fenbendazole 888 mg",
    description: tabletCopy("Fenbendazole 888", "Fenbendazole 888 mg", "High-strength fenbendazole tablet for specialised procurement."),
    unitPrice: "465.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-011", productName: "Fenbendazole 1000", genericName: "Fenbendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "1000 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Fenbendazole 1000 mg",
    description: tabletCopy("Fenbendazole 1000", "Fenbendazole 1000 mg", "1 g oral tablet listed for high-dose anthelmintic supply."),
    unitPrice: "520.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-012", productName: "Fenbendazole 500 + Ivermectine 25", genericName: "Fenbendazole + Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "Fenbendazole 500 mg + Ivermectin 25 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets",
    composition: "Fenbendazole 500 mg + Ivermectin 25 mg",
    description: tabletCopy("Fenbendazole 500 + Ivermectine 25", "Fenbendazole 500 mg with Ivermectin 25 mg", "Combination anthelmintic tablet for dual-salt procurement."),
    unitPrice: "640.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-013", productName: "Fenbendazole veterinary oral paste BP 10% w/w", genericName: "Fenbendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "10% w/w", dosageForm: "Oral paste", manufacturer: null, packSize: "15 g", composition: "Fenbendazole BP 10% w/w",
    description: "Fenbendazole veterinary oral paste BP 10% w/w is listed as a 15 g oral paste for authorised B2B veterinary supply. Composition follows the labelled 10% w/w strength. Catalogue details support commercial quotation only.",
    unitPrice: "390.00", gstRate: "12.00", imageKey: "oral-paste", preserveSeedPrice: false
  },
  {
    sku: "MSPI-014", productName: "Mebendazole 100 mg", genericName: "Mebendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "100 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Mebendazole 100 mg",
    description: tabletCopy("Mebendazole 100 mg", "Mebendazole 100 mg", "Low-strength benzimidazole tablet for anthelmintic catalogues."),
    unitPrice: "95.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-015", productName: "Mebendazole 500 mg", genericName: "Mebendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "500 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Mebendazole 500 mg",
    description: tabletCopy("Mebendazole 500 mg", "Mebendazole 500 mg", "Standard 500 mg oral tablet for wholesale anthelmintic orders."),
    unitPrice: "175.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-016", productName: "Mebendazole 500 mg + Ivermectine 25 mg", genericName: "Mebendazole + Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "Mebendazole 500 mg + Ivermectin 25 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets",
    composition: "Mebendazole 500 mg + Ivermectin 25 mg",
    description: tabletCopy("Mebendazole 500 mg + Ivermectine 25 mg", "Mebendazole 500 mg with Ivermectin 25 mg", "Combination tablet for dual-action anthelmintic tenders."),
    unitPrice: "410.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-017", productName: "Metronidazole 400 mg", genericName: "Metronidazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "400 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Metronidazole 400 mg",
    description: tabletCopy("Metronidazole 400 mg", "Metronidazole 400 mg", "Nitroimidazole oral tablet listed for antimicrobial / antiprotozoal supply."),
    unitPrice: "48.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-018", productName: "Metronidazole 500 mg", genericName: "Metronidazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "500 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Metronidazole 500 mg",
    description: tabletCopy("Metronidazole 500 mg", "Metronidazole 500 mg", "500 mg oral tablet for institutional antimicrobial procurement."),
    unitPrice: "62.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-019", productName: "Metronidazole ER 600 mg", genericName: "Metronidazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "600 mg ER", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Metronidazole extended-release 600 mg",
    description: tabletCopy("Metronidazole ER 600 mg", "Metronidazole 600 mg extended-release", "Extended-release oral tablet for specialised supply lists."),
    unitPrice: "88.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-020", productName: "Albendazole 200 mg", genericName: "Albendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "200 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Albendazole 200 mg",
    description: tabletCopy("Albendazole 200 mg", "Albendazole 200 mg", "Benzimidazole anthelmintic tablet for paediatric and low-dose lists."),
    unitPrice: "55.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-021", productName: "Albendazole 400 mg", genericName: "Albendazole", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "400 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Albendazole 400 mg",
    description: tabletCopy("Albendazole 400 mg", "Albendazole 400 mg", "Widely requested 400 mg chewable / oral anthelmintic tablet."),
    unitPrice: "72.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-022", productName: "Albendazole 400 mg + Ivermectine 6 mg", genericName: "Albendazole + Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "Albendazole 400 mg + Ivermectin 6 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets",
    composition: "Albendazole 400 mg + Ivermectin 6 mg",
    description: tabletCopy("Albendazole 400 mg + Ivermectine 6 mg", "Albendazole 400 mg with Ivermectin 6 mg", "Combination anthelmintic tablet for dual-salt tenders."),
    unitPrice: "145.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-023", productName: "Albendazole 400 mg + Ivermectine 12 mg", genericName: "Albendazole + Ivermectin", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "Albendazole 400 mg + Ivermectin 12 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets",
    composition: "Albendazole 400 mg + Ivermectin 12 mg",
    description: tabletCopy("Albendazole 400 mg + Ivermectine 12 mg", "Albendazole 400 mg with Ivermectin 12 mg", "Higher ivermectin combination for specialised anthelmintic supply."),
    unitPrice: "168.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-024", productName: "Monobenzone 20% w/v", genericName: "Monobenzone", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "20% w/v", dosageForm: "Cream", manufacturer: null, packSize: "10 g", composition: "Monobenzone 20% w/v",
    description: "Monobenzone 20% w/v cream is listed as a 10 g topical pack for authorised B2B dermatology supply. Strength and pack size follow the master catalogue. This listing is for commercial quotation only.",
    unitPrice: "420.00", gstRate: "12.00", imageKey: "cream", preserveSeedPrice: false
  },
  {
    sku: "MSPI-025", productName: "Monobenzone 40% w/v", genericName: "Monobenzone", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "40% w/v", dosageForm: "Cream", manufacturer: null, packSize: "10 g", composition: "Monobenzone 40% w/v",
    description: "Monobenzone 40% w/v cream is a mid-strength topical presentation in a 10 g pack for B2B procurement. Catalogue information supports quotation, not clinical advice.",
    unitPrice: "560.00", gstRate: "12.00", imageKey: "cream", preserveSeedPrice: false
  },
  {
    sku: "MSPI-026", productName: "Monobenzone 60% w/v", genericName: "Monobenzone", categoryName: antiHelminthic.name, categorySlug: antiHelminthic.slug,
    strength: "60% w/v", dosageForm: "Cream", manufacturer: null, packSize: "10 g", composition: "Monobenzone 60% w/v",
    description: "Monobenzone 60% w/v cream is the highest listed topical strength in a 10 g pack for authorised wholesale supply.",
    unitPrice: "710.00", gstRate: "12.00", imageKey: "cream", preserveSeedPrice: false
  },
  {
    sku: "MSPI-027", productName: "Tadalafil 2.5 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "2.5 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Tadalafil 2.5 mg",
    description: tabletCopy("Tadalafil 2.5 mg", "Tadalafil 2.5 mg", "Low-dose PDE5 inhibitor tablet for authorised adult B2B supply."),
    unitPrice: "95.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-028", productName: "Tadalafil 5 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "5 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Tadalafil 5 mg",
    description: tabletCopy("Tadalafil 5 mg", "Tadalafil 5 mg", "Daily-dose strength commonly requested by distributors."),
    unitPrice: "125.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-029", productName: "Tadalafil 10 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "10 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Tadalafil 10 mg",
    description: tabletCopy("Tadalafil 10 mg", "Tadalafil 10 mg", "Standard on-demand oral tablet for wholesale catalogues."),
    unitPrice: "165.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-030", productName: "Tadalafil 20 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "20 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Tadalafil 20 mg",
    description: tabletCopy("Tadalafil 20 mg", "Tadalafil 20 mg", "Widely listed 20 mg oral tablet for B2B quotation."),
    unitPrice: "210.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-031", productName: "Tadalafil 40 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "40 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Tadalafil 40 mg",
    description: tabletCopy("Tadalafil 40 mg", "Tadalafil 40 mg", "High-strength tadalafil tablet for specialised supply lists."),
    unitPrice: "285.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-032", productName: "Tadalafil 60 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "60 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Tadalafil 60 mg",
    description: tabletCopy("Tadalafil 60 mg", "Tadalafil 60 mg", "Higher-dose oral tablet listed for authorised wholesale channels."),
    unitPrice: "355.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-033", productName: "Tadalafil 80 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "80 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Tadalafil 80 mg",
    description: tabletCopy("Tadalafil 80 mg", "Tadalafil 80 mg", "Maximum listed tadalafil tablet strength in this catalogue."),
    unitPrice: "430.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-034", productName: "Tadalafil 20 mg + Sildenafil 100 mg", genericName: "Tadalafil + Sildenafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "Tadalafil 20 mg + Sildenafil 100 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets",
    composition: "Tadalafil 20 mg + Sildenafil citrate 100 mg",
    description: tabletCopy("Tadalafil 20 mg + Sildenafil 100 mg", "Tadalafil 20 mg with Sildenafil 100 mg", "Dual PDE5 inhibitor combination tablet for authorised B2B supply."),
    unitPrice: "520.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-035", productName: "Tadalafil 10 mg + Dapoxetine 30 mg", genericName: "Tadalafil + Dapoxetine", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "Tadalafil 10 mg + Dapoxetine 30 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets",
    composition: "Tadalafil 10 mg + Dapoxetine 30 mg",
    description: tabletCopy("Tadalafil 10 mg + Dapoxetine 30 mg", "Tadalafil 10 mg with Dapoxetine 30 mg", "Combination tablet listed for specialised men's health procurement."),
    unitPrice: "480.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-036", productName: "Tadalafil 20 mg + Dapoxetine 60 mg", genericName: "Tadalafil + Dapoxetine", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "Tadalafil 20 mg + Dapoxetine 60 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets",
    composition: "Tadalafil 20 mg + Dapoxetine 60 mg",
    description: tabletCopy("Tadalafil 20 mg + Dapoxetine 60 mg", "Tadalafil 20 mg with Dapoxetine 60 mg", "Higher-strength combination tablet for authorised wholesale lists."),
    unitPrice: "610.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-037", productName: "Tadarise oral jelly 20 mg", genericName: "Tadalafil", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "20 mg", dosageForm: "Oral jelly", manufacturer: null, packSize: "15 g", composition: "Tadalafil 20 mg oral jelly",
    description: "Tadarise oral jelly 20 mg is a 15 g oral jelly presentation of tadalafil 20 mg for authorised B2B supply. Pack size and strength follow the master catalogue. Listing is commercial only.",
    unitPrice: "245.00", gstRate: "12.00", imageKey: "oral-jelly", preserveSeedPrice: false
  },
  {
    sku: "MSPI-038", productName: "Sildenafil Citrate 25 mg", genericName: "Sildenafil citrate", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "25 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Sildenafil citrate 25 mg",
    description: tabletCopy("Sildenafil Citrate 25 mg", "Sildenafil citrate 25 mg", "Low-dose PDE5 inhibitor tablet for authorised adult supply."),
    unitPrice: "78.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-039", productName: "Sildenafil Citrate 50 mg", genericName: "Sildenafil citrate", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "50 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Sildenafil citrate 50 mg",
    description: tabletCopy("Sildenafil Citrate 50 mg", "Sildenafil citrate 50 mg", "Standard 50 mg oral tablet for distributor catalogues."),
    unitPrice: "110.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-040", productName: "Sildenafil Citrate 100 mg", genericName: "Sildenafil citrate", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "100 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Sildenafil citrate 100 mg",
    description: tabletCopy("Sildenafil Citrate 100 mg", "Sildenafil citrate 100 mg", "Widely requested 100 mg tablet for B2B quotation."),
    unitPrice: "155.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-041", productName: "Sildenafil Citrate 150 mg", genericName: "Sildenafil citrate", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "150 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Sildenafil citrate 150 mg",
    description: tabletCopy("Sildenafil Citrate 150 mg", "Sildenafil citrate 150 mg", "High-strength oral tablet for specialised wholesale lists."),
    unitPrice: "198.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  },
  {
    sku: "MSPI-042", productName: "Sildenafil Citrate 200 mg", genericName: "Sildenafil citrate", categoryName: erectileDysfunction.name, categorySlug: erectileDysfunction.slug,
    strength: "200 mg", dosageForm: "Tablet", manufacturer: null, packSize: "100 tablets", composition: "Sildenafil citrate 200 mg",
    description: tabletCopy("Sildenafil Citrate 200 mg", "Sildenafil citrate 200 mg", "Maximum listed sildenafil tablet strength in this catalogue."),
    unitPrice: "245.00", gstRate: "12.00", imageKey: "tablet", preserveSeedPrice: false
  }
];

export function imagePathForForm(imageKey: CatalogueFormImage) {
  return `/medicines/form-${imageKey}.png`;
}
