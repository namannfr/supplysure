/**
 * SupplySure demonstration dataset.
 *
 * One coherent, fictional story for Northstar Construction (buyer workspace). Every page reads from
 * this file through the store and the readiness engine — no figure on screen is typed in by hand.
 * All companies, people and documents are fictional demonstration records.
 */
import type {
  EvidenceRecord,
  Package,
  Requirement,
  RequirementSet,
  Supplier,
  TradeId,
} from '../types';

export const WORKSPACE = { name: 'Northstar Construction', kind: 'Buyer workspace' };

export const CURRENT_USER = {
  name: 'Dana Nolan',
  initials: 'DN',
  role: 'Procurement lead',
  email: 'dana.nolan@northstar.example',
};

export const REVIEWERS = ['Dana Nolan', 'Priya Shah', 'Tom Whitaker'];

/* ------------------------------------------------------------------ */
/* Requirements                                                        */
/* ------------------------------------------------------------------ */

const R = (r: Requirement) => r;

export const REQUIREMENTS: Requirement[] = [
  // Baseline — included in every trade set
  R({ id: 'REQ-PL', code: 'INS-01', evidenceType: 'pl', name: 'Public liability insurance (min. £5m)', shortName: 'Public liability insurance', description: 'Current public liability cover of at least £5m for the full package period.', critical: true, checksValidity: true, minCover: 5_000_000 }),
  R({ id: 'REQ-EL', code: 'INS-02', evidenceType: 'el', name: "Employer's liability insurance (min. £10m)", shortName: "Employer's liability insurance", description: "Statutory employer's liability cover of at least £10m.", critical: true, checksValidity: true, minCover: 10_000_000 }),
  R({ id: 'REQ-SSIP', code: 'HS-01', evidenceType: 'ssip', name: 'Health & safety accreditation (SSIP)', shortName: 'H&S accreditation', description: 'SSIP-recognised accreditation such as CHAS or SafeContractor, valid for the package.', critical: true, checksValidity: true }),
  R({ id: 'REQ-IR35', code: 'EMP-01', evidenceType: 'ir35', name: 'Employment status (IR35) determination', shortName: 'IR35 status', description: 'Status determination for labour engaged through the supplier. Always reviewed by a person.', critical: false, checksValidity: false, manualAssessment: true }),
  R({ id: 'REQ-ISO', code: 'QM-01', evidenceType: 'iso9001', name: 'Quality management (ISO 9001)', shortName: 'ISO 9001 certificate', description: 'Certified quality management system. Non-critical: an exception may be recorded.', critical: false, checksValidity: true }),

  // Electrical
  R({ id: 'REQ-NICEIC', code: 'EL-01', evidenceType: 'niceic', name: 'NICEIC / NAPIT registration (commercial)', shortName: 'NICEIC registration', description: 'Competent person registration covering commercial installations.', critical: true, checksValidity: true, requiredScope: 'Commercial' }),
  R({ id: 'REQ-ECS', code: 'EL-02', evidenceType: 'ecs', name: 'ECS / JIB cards for operatives', shortName: 'ECS operative cards', description: 'Card register for every operative named on the package.', critical: true, checksValidity: true }),

  // Fire protection
  R({ id: 'REQ-FIRE3P', code: 'FP-01', evidenceType: 'fire3p', name: 'Third-party certification (BAFE / FIRAS)', shortName: 'Third-party certification', description: 'Third-party certification scheme for passive fire protection installation.', critical: true, checksValidity: true }),
  R({ id: 'REQ-FIRECERT', code: 'FP-02', evidenceType: 'firecert', name: 'Fire-stopping product certification', shortName: 'Product certification', description: 'Product certification (UKCA / ETA classification) for every fire-stopping system specified.', critical: true, checksValidity: true }),

  // Mechanical
  R({ id: 'REQ-GAS', code: 'ME-01', evidenceType: 'gassafe', name: 'Gas Safe registration (commercial)', shortName: 'Gas Safe registration', description: 'Gas Safe business registration covering commercial work.', critical: true, checksValidity: true, requiredScope: 'Commercial' }),
  R({ id: 'REQ-FGAS', code: 'ME-02', evidenceType: 'fgas', name: 'F-Gas company certification', shortName: 'F-Gas certification', description: 'Company certification for work on refrigeration and heat pump systems.', critical: true, checksValidity: true }),

  // Renewables
  R({ id: 'REQ-MCS', code: 'RN-01', evidenceType: 'mcs', name: 'MCS installer certification', shortName: 'MCS certification', description: 'MCS certification for solar PV and heat pump installation.', critical: true, checksValidity: true }),
  R({ id: 'REQ-NICEIC-RN', code: 'RN-02', evidenceType: 'niceic', name: 'NICEIC registration (commercial)', shortName: 'NICEIC registration', description: 'Electrical competent person registration covering commercial installations.', critical: true, checksValidity: true, requiredScope: 'Commercial' }),

  // Groundworks
  R({ id: 'REQ-CPCS', code: 'GW-01', evidenceType: 'cpcs', name: 'CPCS / NPORS plant operator cards', shortName: 'Plant operator cards', description: 'Card register for every plant operator named on the package.', critical: true, checksValidity: true }),
  R({ id: 'REQ-TWC', code: 'GW-02', evidenceType: 'twc', name: 'Temporary works procedure', shortName: 'Temporary works procedure', description: 'Current temporary works procedure with a named coordinator.', critical: false, checksValidity: true }),

  // Scaffolding
  R({ id: 'REQ-CISRS', code: 'SC-01', evidenceType: 'cisrs', name: 'CISRS scaffolder cards', shortName: 'CISRS cards', description: 'Card register for every scaffolder named on the package.', critical: true, checksValidity: true }),
  R({ id: 'REQ-NASC', code: 'SC-02', evidenceType: 'nasc', name: 'NASC membership', shortName: 'NASC membership', description: 'Trade association membership. Non-critical.', critical: false, checksValidity: true }),

  // Roofing
  R({ id: 'REQ-WAH', code: 'RF-01', evidenceType: 'wah', name: 'Working at height training', shortName: 'Working at height training', description: 'Training records for every operative working at height.', critical: true, checksValidity: true }),
  R({ id: 'REQ-NFRC', code: 'RF-02', evidenceType: 'nfrc', name: 'NFRC competent person scheme', shortName: 'NFRC membership', description: 'Roofing competent person scheme. Non-critical.', critical: false, checksValidity: true }),

  // Structural steel
  R({ id: 'REQ-FPC', code: 'ST-01', evidenceType: 'fpc', name: 'Factory production control (Execution Class 2)', shortName: 'FPC certificate (EXC2)', description: 'UKCA / CE factory production control certificate covering at least Execution Class 2.', critical: true, checksValidity: true, requiredScope: 'EXC2' }),
  R({ id: 'REQ-WELD', code: 'ST-02', evidenceType: 'weld', name: 'Welder qualifications (BS EN ISO 9606)', shortName: 'Welder qualifications', description: 'Current qualification records for every welder named on the package.', critical: true, checksValidity: true }),

  // Package-specific overlays
  R({ id: 'REQ-BSA', code: 'PK-RV-01', evidenceType: 'bsa', name: 'Building Safety Act competence declaration', shortName: 'BSA competence declaration', description: 'Higher-risk building: signed declaration of organisational competence.', critical: true, checksValidity: false }),
  R({ id: 'REQ-CRP', code: 'PK-SB-01', evidenceType: 'crp', name: 'Carbon reduction plan (PPN 06/21)', shortName: 'Carbon reduction plan', description: 'Published carbon reduction plan, reviewed annually.', critical: false, checksValidity: true }),
  R({ id: 'REQ-DBS', code: 'PK-BS-01', evidenceType: 'dbs', name: 'Enhanced DBS checks for site operatives', shortName: 'Enhanced DBS checks', description: 'Education site: enhanced DBS register for every operative attending site.', critical: true, checksValidity: true }),
  R({ id: 'REQ-ASB', code: 'PK-KS-01', evidenceType: 'asb', name: 'Asbestos awareness training (UKATA)', shortName: 'Asbestos awareness training', description: 'Refurbishment of a pre-2000 building: awareness training for all operatives.', critical: true, checksValidity: true }),
  R({ id: 'REQ-CCS', code: 'PK-NF-01', evidenceType: 'ccs', name: 'Considerate Constructors registration', shortName: 'Considerate Constructors registration', description: 'Client requirement for the residential programme. Non-critical.', critical: false, checksValidity: true }),
];

export const REQUIREMENTS_BY_ID: Record<string, Requirement> = Object.fromEntries(
  REQUIREMENTS.map((r) => [r.id, r]),
);

const BASE = ['REQ-PL', 'REQ-EL', 'REQ-SSIP', 'REQ-IR35', 'REQ-ISO'];

export const REQUIREMENT_SETS: RequirementSet[] = [
  { id: 'RS-ELEC', kind: 'trade', trade: 'electrical', name: 'Electrical installation', version: '3.2', updated: '2026-09-14', owner: 'Priya Shah', description: 'Commercial electrical installation and containment packages.', requirementIds: [...BASE, 'REQ-NICEIC', 'REQ-ECS'] },
  { id: 'RS-FIRE', kind: 'trade', trade: 'fire', name: 'Passive fire protection', version: '2.4', updated: '2026-10-02', owner: 'Priya Shah', description: 'Fire stopping, compartmentation and fire-rated boarding.', requirementIds: [...BASE, 'REQ-FIRE3P', 'REQ-FIRECERT'] },
  { id: 'RS-MECH', kind: 'trade', trade: 'mechanical', name: 'Mechanical services', version: '2.1', updated: '2026-08-21', owner: 'Tom Whitaker', description: 'Heating, ventilation, plumbing and heat pump installation.', requirementIds: [...BASE, 'REQ-GAS', 'REQ-FGAS'] },
  { id: 'RS-RENEW', kind: 'trade', trade: 'renewables', name: 'Renewables & solar PV', version: '1.3', updated: '2026-07-30', owner: 'Tom Whitaker', description: 'Roof-mounted PV, battery storage and air-source heat pumps.', requirementIds: [...BASE, 'REQ-MCS', 'REQ-NICEIC-RN'] },
  { id: 'RS-GROUND', kind: 'trade', trade: 'groundworks', name: 'Groundworks & civils', version: '2.0', updated: '2026-06-18', owner: 'Dana Nolan', description: 'Excavation, drainage, foundations and external works.', requirementIds: [...BASE, 'REQ-CPCS', 'REQ-TWC'] },
  { id: 'RS-SCAFF', kind: 'trade', trade: 'scaffolding', name: 'Scaffolding & access', version: '1.8', updated: '2026-05-27', owner: 'Dana Nolan', description: 'Independent and system scaffolds, temporary roofs and edge protection.', requirementIds: [...BASE, 'REQ-CISRS', 'REQ-NASC'] },
  { id: 'RS-ROOF', kind: 'trade', trade: 'roofing', name: 'Roofing & cladding', version: '1.5', updated: '2026-09-03', owner: 'Tom Whitaker', description: 'Flat and pitched roofing, rainscreen and cladding.', requirementIds: [...BASE, 'REQ-WAH', 'REQ-NFRC'] },
  { id: 'RS-STEEL', kind: 'trade', trade: 'steel', name: 'Structural steel', version: '1.2', updated: '2026-04-15', owner: 'Priya Shah', description: 'Fabrication and erection of structural steelwork.', requirementIds: [...BASE, 'REQ-FPC', 'REQ-WELD'] },
  { id: 'RS-PK-RV', kind: 'package', packageId: 'P01', name: 'Riverside Apartments — higher-risk building', version: '1.1', updated: '2026-10-08', owner: 'Dana Nolan', description: 'Additional duty-holder requirements for an 18-storey residential building.', requirementIds: ['REQ-BSA'] },
  { id: 'RS-PK-SB', kind: 'package', packageId: 'P02', name: 'Southbank Offices — public sector tenant', version: '1.0', updated: '2026-09-22', owner: 'Priya Shah', description: 'Tenant procurement policy requirements.', requirementIds: ['REQ-CRP'] },
  { id: 'RS-PK-BS', kind: 'package', packageId: 'P03', name: 'Beacon School — education site', version: '1.2', updated: '2026-10-12', owner: 'Dana Nolan', description: 'Safeguarding requirements for work on a live school site.', requirementIds: ['REQ-DBS'] },
  { id: 'RS-PK-KS', kind: 'package', packageId: 'P04', name: 'King Street Renewal — refurbishment', version: '1.0', updated: '2026-08-30', owner: 'Tom Whitaker', description: 'Requirements for intrusive work in a 1920s listed building.', requirementIds: ['REQ-ASB'] },
  { id: 'RS-PK-NF', kind: 'package', packageId: 'P05', name: 'Northfield Housing — client charter', version: '1.0', updated: '2026-09-09', owner: 'Tom Whitaker', description: 'Housing association client charter requirements.', requirementIds: ['REQ-CCS'] },
];

export const TRADE_SET: Record<TradeId, string> = {
  electrical: 'RS-ELEC',
  fire: 'RS-FIRE',
  mechanical: 'RS-MECH',
  renewables: 'RS-RENEW',
  groundworks: 'RS-GROUND',
  scaffolding: 'RS-SCAFF',
  roofing: 'RS-ROOF',
  steel: 'RS-STEEL',
};

/* ------------------------------------------------------------------ */
/* Suppliers                                                           */
/* ------------------------------------------------------------------ */

const S = (id: string, name: string, trade: TradeId, location: string, contactName: string, joined: string): Supplier => ({
  id,
  name,
  trade,
  location,
  contactName,
  email: `${contactName.split(' ')[0].toLowerCase()}@${name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}.example`,
  status: 'active',
  joined,
});

export const SUPPLIERS: Supplier[] = [
  S('S01', 'Apex Electrical Services', 'electrical', 'Leeds', 'Gareth Mills', '2025-03-11'),
  S('S02', 'BrightSpark M&E', 'mechanical', 'Wakefield', 'Leanne Carter', '2025-05-02'),
  S('S03', 'Solaris Renewables', 'renewables', 'Bristol', 'Owen Pryce', '2025-01-20'),
  S('S04', 'Nova Fire Protection', 'fire', 'Sheffield', 'Hannah Booth', '2026-02-16'),
  S('S05', 'Horizon Building Services', 'mechanical', 'London', 'Marcus Reid', '2025-09-08'),
  S('S06', 'Ember Safety Systems', 'fire', 'Manchester', 'Sophie Lam', '2024-11-04'),
  S('S07', 'Calder Fire Stopping', 'fire', 'Halifax', 'Ian Sutcliffe', '2026-04-27'),
  S('S08', 'Pennine Steel Fabrications', 'steel', 'Huddersfield', 'Ravi Patel', '2026-05-19'),
  S('S09', 'Aire Valley Scaffolding', 'scaffolding', 'Bradford', 'Kelly Firth', '2024-09-30'),
  S('S10', 'Kirkstall Groundworks', 'groundworks', 'Leeds', 'Dean Hollins', '2025-02-14'),
  S('S11', 'Thameside Electrical', 'electrical', 'London', 'Amara Osei', '2025-06-23'),
  S('S12', 'Capital Access Scaffolding', 'scaffolding', 'London', 'Liam Doherty', '2025-04-07'),
  S('S13', 'Don Valley Electrical', 'electrical', 'Sheffield', 'Carl Ibbotson', '2026-03-09'),
  S('S14', 'Sheaf Mechanical', 'mechanical', 'Sheffield', 'Nadia Rahman', '2025-10-13'),
  S('S15', 'Brunswick Roofing', 'roofing', 'Rotherham', 'Paul Greaves', '2025-07-01'),
  S('S16', 'Avon Heritage Roofing', 'roofing', 'Bath', 'Felicity Hart', '2026-01-26'),
  S('S17', 'Bristol Scaffold Services', 'scaffolding', 'Bristol', 'Jamie Cole', '2024-12-02'),
  S('S18', 'Severn Groundworks', 'groundworks', 'Gloucester', 'Rhys Evans', '2025-03-31'),
  S('S19', 'Clifton Mechanical', 'mechanical', 'Bristol', 'Emma Talbot', '2025-08-18'),
  S('S20', 'Westway Fire Protection', 'fire', 'Swindon', 'Mark Bishop', '2025-02-03'),
  S('S21', 'Temple Steel', 'steel', 'Bristol', 'Alan Fry', '2024-10-21'),
  S('S22', 'Midland Electrical Contractors', 'electrical', 'Birmingham', 'Sandeep Gill', '2025-11-17'),
  S('S23', 'Tame Valley Roofing', 'roofing', 'Tamworth', 'Gemma Hughes', '2025-06-09'),
  S('S24', 'Brindley Groundworks', 'groundworks', 'Birmingham', 'Kevin Walsh', '2025-01-13'),
  S('S25', 'Kings Norton Scaffolding', 'scaffolding', 'Birmingham', 'Tariq Hussain', '2025-04-28'),
  S('S26', 'Selly Oak Steel', 'steel', 'Birmingham', 'Joanne Price', '2025-09-29'),
  S('S27', 'Rea Valley Mechanical', 'mechanical', 'Birmingham', 'Chris Bennett', '2025-05-26'),
  S('S28', 'Bournville Electrical', 'electrical', 'Birmingham', 'Lucy Adams', '2025-12-08'),
  S('S29', 'Portway Electrical', 'electrical', 'Bristol', 'Sam Kingdon', '2026-01-12'),
  S('S30', 'Gordano Roofing', 'roofing', 'Portishead', 'Neil Harris', '2025-10-27'),
  S('S31', 'Wharfe Valley Electrical', 'electrical', 'Ilkley', 'Rachel Dunn', '2026-06-15'),
  S('S32', 'Ouse Bridge Mechanical', 'mechanical', 'York', 'Ben Atkinson', '2026-07-06'),
  S('S33', 'Lune Fire Engineering', 'fire', 'Lancaster', 'Claire Whitehead', '2026-08-03'),
  S('S34', 'Hallam Groundworks', 'groundworks', 'Sheffield', 'Steve Marsden', '2026-05-11'),
  S('S35', 'Peak Access Scaffolding', 'scaffolding', 'Buxton', 'Holly Barker', '2026-07-20'),
  S('S36', 'Trent Roofing Systems', 'roofing', 'Nottingham', 'Matt Ellis', '2026-03-23'),
  S('S37', 'Mersey Steel Erectors', 'steel', 'Liverpool', 'John Byrne', '2026-08-17'),
  S('S38', 'Greenlight Solar', 'renewables', 'Leicester', 'Priyanka Mistry', '2026-09-07'),
  S('S39', 'Castlegate Electrical', 'electrical', 'York', 'Tom Precious', '2026-04-06'),
  S('S40', 'Fenland Mechanical', 'mechanical', 'Peterborough', 'Alice Sharp', '2026-06-01'),
  S('S41', 'Ridgeway Fire Systems', 'fire', 'Reading', 'Daniel Okafor', '2026-09-21'),
  S('S42', 'Marsh Lane Groundworks', 'groundworks', 'Leeds', 'Wayne Pickles', '2026-02-02'),
];

/* ------------------------------------------------------------------ */
/* Packages                                                            */
/* ------------------------------------------------------------------ */

export const PACKAGES: Package[] = [
  {
    id: 'P01', name: 'Riverside Apartments', site: 'Riverside Quarter, Leeds', scope: 'Building services & envelope',
    value: '£4.8m', manager: 'Tom Whitaker', mobilisation: '2026-11-23', finish: '2027-07-30', reviewDate: '2026-11-13',
    overlaySetId: 'RS-PK-RV',
    assignments: [
      { supplierId: 'S01', scopeOfWorks: 'Electrical installation, levels 1–18', evidenceDue: '2026-10-26' },
      { supplierId: 'S08', scopeOfWorks: 'Podium and roof plant steelwork' },
      { supplierId: 'S07', scopeOfWorks: 'Compartmentation fire stopping' },
      { supplierId: 'S06', scopeOfWorks: 'Fire-rated boarding to risers' },
      { supplierId: 'S02', scopeOfWorks: 'Mechanical services and ventilation' },
      { supplierId: 'S09', scopeOfWorks: 'Façade access scaffold' },
      { supplierId: 'S10', scopeOfWorks: 'External drainage and landscaping' },
    ],
  },
  {
    id: 'P02', name: 'Southbank Offices', site: 'Southbank Place, London SE1', scope: 'Cat A office fit-out',
    value: '£2.1m', manager: 'Priya Shah', mobilisation: '2026-11-12', finish: '2027-05-28', reviewDate: '2026-11-02',
    overlaySetId: 'RS-PK-SB',
    assignments: [
      { supplierId: 'S05', scopeOfWorks: 'HVAC and plumbing', evidenceDue: '2026-10-27' },
      { supplierId: 'S03', scopeOfWorks: 'Roof-mounted solar PV' },
      { supplierId: 'S06', scopeOfWorks: 'Fire stopping to services penetrations' },
      { supplierId: 'S11', scopeOfWorks: 'Small power and lighting' },
      { supplierId: 'S12', scopeOfWorks: 'Internal access towers and roof edge protection' },
    ],
  },
  {
    id: 'P03', name: 'Beacon School', site: 'Beacon Primary School, Sheffield', scope: 'Education new-build',
    value: '£3.6m', manager: 'Dana Nolan', mobilisation: '2026-11-16', finish: '2027-08-20', reviewDate: '2026-11-06',
    overlaySetId: 'RS-PK-BS',
    assignments: [
      { supplierId: 'S04', scopeOfWorks: 'Fire stopping and fire-rated doors', evidenceDue: '2026-10-24' },
      { supplierId: 'S13', scopeOfWorks: 'Electrical installation and fire alarm' },
      { supplierId: 'S14', scopeOfWorks: 'Heating and heat pump installation' },
      { supplierId: 'S15', scopeOfWorks: 'Flat roofing and rooflights' },
    ],
  },
  {
    id: 'P04', name: 'King Street Renewal', site: '42 King Street, Bristol', scope: 'Heritage refurbishment',
    value: '£5.3m', manager: 'Tom Whitaker', mobilisation: '2026-12-07', finish: '2027-09-24', reviewDate: '2026-11-27',
    overlaySetId: 'RS-PK-KS',
    assignments: [
      { supplierId: 'S01', scopeOfWorks: 'Rewire and new distribution' },
      { supplierId: 'S16', scopeOfWorks: 'Slate roof and leadwork repairs' },
      { supplierId: 'S17', scopeOfWorks: 'Full-height façade scaffold with temporary roof' },
      { supplierId: 'S18', scopeOfWorks: 'Basement underpinning and drainage' },
      { supplierId: 'S19', scopeOfWorks: 'Low-temperature heating replacement' },
      { supplierId: 'S03', scopeOfWorks: 'Concealed PV array to rear roof' },
      { supplierId: 'S20', scopeOfWorks: 'Fire stopping and upgrades to historic floors' },
      { supplierId: 'S21', scopeOfWorks: 'New steel frame to rear extension' },
    ],
  },
  {
    id: 'P05', name: 'Northfield Housing', site: 'Northfield Gardens, Birmingham', scope: 'Residential, 146 homes',
    value: '£7.9m', manager: 'Priya Shah', mobilisation: '2027-01-11', finish: '2027-10-29', reviewDate: '2026-12-18',
    overlaySetId: 'RS-PK-NF',
    assignments: [
      { supplierId: 'S22', scopeOfWorks: 'Electrical installation, phase 1 plots' },
      { supplierId: 'S02', scopeOfWorks: 'Heating and plumbing, phase 1 plots' },
      { supplierId: 'S23', scopeOfWorks: 'Pitched roofing, phase 1 plots' },
      { supplierId: 'S03', scopeOfWorks: 'Solar PV to all plots' },
      { supplierId: 'S06', scopeOfWorks: 'Fire stopping to apartment blocks' },
      { supplierId: 'S24', scopeOfWorks: 'Roads, sewers and plot foundations' },
      { supplierId: 'S25', scopeOfWorks: 'Plot scaffolding' },
      { supplierId: 'S26', scopeOfWorks: 'Apartment block steel frame' },
      { supplierId: 'S27', scopeOfWorks: 'Apartment block mechanical services' },
      { supplierId: 'S28', scopeOfWorks: 'Electrical installation, apartment blocks' },
    ],
  },
  {
    id: 'P06', name: 'Harbour Road Depot', site: 'Harbour Road, Portishead', scope: 'Logistics shell & core',
    value: '£3.2m', manager: 'Dana Nolan', mobilisation: '2027-02-01', finish: '2027-08-27', reviewDate: '2027-01-15',
    assignments: [
      { supplierId: 'S21', scopeOfWorks: 'Portal frame' },
      { supplierId: 'S17', scopeOfWorks: 'Edge protection and access' },
      { supplierId: 'S18', scopeOfWorks: 'Yard slab and drainage' },
      { supplierId: 'S20', scopeOfWorks: 'Compartment wall fire stopping' },
      { supplierId: 'S19', scopeOfWorks: 'Office block mechanical services' },
      { supplierId: 'S29', scopeOfWorks: 'Warehouse lighting and power' },
      { supplierId: 'S30', scopeOfWorks: 'Roof cladding' },
      { supplierId: 'S03', scopeOfWorks: 'Roof-mounted solar PV' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Evidence                                                            */
/* ------------------------------------------------------------------ */

interface EvidenceTemplate {
  label: string;
  title: string;
  issuers: string[];
  prefix: string;
  /** Typical validity in years; null for evidence that does not expire. */
  years: number | null;
  scope?: string;
  cover?: number;
}

const TEMPLATES: Record<string, EvidenceTemplate> = {
  pl: { label: 'Public liability', title: 'Public liability insurance certificate', issuers: ['Aviva', 'Zurich', 'AXA Insurance', 'Allianz', 'QBE'], prefix: 'PL', years: 1, cover: 10_000_000 },
  el: { label: "Employer's liability", title: "Employer's liability insurance certificate", issuers: ['Aviva', 'Zurich', 'AXA Insurance', 'Allianz', 'QBE'], prefix: 'EL', years: 1, cover: 10_000_000 },
  ssip: { label: 'CHAS', title: 'CHAS Premium Plus accreditation', issuers: ['CHAS'], prefix: 'CHAS', years: 1 },
  ir35: { label: 'IR35 status', title: 'Status determination statement', issuers: ['Supplier declaration'], prefix: 'SDS', years: null },
  iso9001: { label: 'ISO 9001', title: 'ISO 9001:2015 certificate', issuers: ['BSI', 'NQA', 'LRQA'], prefix: 'QMS', years: 3 },
  niceic: { label: 'NICEIC', title: 'NICEIC Approved Contractor certificate', issuers: ['NICEIC'], prefix: 'NIC', years: 1, scope: 'Commercial' },
  ecs: { label: 'ECS cards', title: 'ECS card register (operatives)', issuers: ['JIB'], prefix: 'ECS', years: 3 },
  fire3p: { label: 'BAFE SP203-1', title: 'BAFE SP203-1 certificate', issuers: ['BAFE'], prefix: 'TPC', years: 1 },
  firecert: { label: 'Product certification', title: 'Fire-stopping product certification schedule', issuers: ['Certification body (UKCA)'], prefix: 'FPC-P', years: 2 },
  gassafe: { label: 'Gas Safe', title: 'Gas Safe business registration', issuers: ['Gas Safe Register'], prefix: 'GS', years: 1, scope: 'Commercial' },
  fgas: { label: 'F-Gas', title: 'F-Gas company certificate', issuers: ['REFCOM'], prefix: 'FG', years: 1 },
  mcs: { label: 'MCS', title: 'MCS installer certificate', issuers: ['MCS'], prefix: 'MCS', years: 1 },
  cpcs: { label: 'CPCS cards', title: 'Plant operator card register', issuers: ['CPCS'], prefix: 'CPCS', years: 5 },
  twc: { label: 'Temporary works', title: 'Temporary works procedure', issuers: ['Supplier document'], prefix: 'TWP', years: 2 },
  cisrs: { label: 'CISRS cards', title: 'CISRS scaffolder card register', issuers: ['CISRS'], prefix: 'CIS', years: 5 },
  nasc: { label: 'NASC', title: 'NASC membership certificate', issuers: ['NASC'], prefix: 'NASC', years: 1 },
  wah: { label: 'Working at height', title: 'Working at height training records', issuers: ['CITB'], prefix: 'WAH', years: 3 },
  nfrc: { label: 'NFRC', title: 'NFRC competent person certificate', issuers: ['NFRC'], prefix: 'NFRC', years: 1 },
  fpc: { label: 'FPC EXC2', title: 'Factory production control certificate (EXC2)', issuers: ['SCCS'], prefix: 'FPC', years: 3, scope: 'EXC2' },
  weld: { label: 'Welder qualifications', title: 'Welder qualification records (ISO 9606)', issuers: ['TWI'], prefix: 'WQ', years: 2 },
  bsa: { label: 'BSA competence', title: 'Building Safety Act competence declaration', issuers: ['Supplier declaration'], prefix: 'BSA', years: null },
  crp: { label: 'Carbon reduction plan', title: 'Carbon reduction plan (PPN 06/21)', issuers: ['Supplier document'], prefix: 'CRP', years: 1 },
  dbs: { label: 'Enhanced DBS', title: 'Enhanced DBS register (site operatives)', issuers: ['Disclosure and Barring Service'], prefix: 'DBS', years: 3 },
  asb: { label: 'Asbestos awareness', title: 'UKATA asbestos awareness records', issuers: ['UKATA'], prefix: 'ASB', years: 1 },
  ccs: { label: 'CCS registration', title: 'Considerate Constructors registration', issuers: ['Considerate Constructors Scheme'], prefix: 'CCS', years: 1 },
};

type Override = Partial<EvidenceRecord> | 'missing';

/**
 * The exceptions that make up the demonstration story. Everything not listed here is a valid,
 * verified record whose expiry falls safely after every live package.
 */
const OVERRIDES: Record<string, Record<string, Override>> = {
  S01: { ssip: { expires: '2027-01-14' } },
  S02: { pl: { expires: '2027-08-15' } },
  S04: {
    fire3p: { label: 'FIRAS', title: 'FIRAS installer certificate', issuer: 'Warringtonfire' },
    firecert: 'missing',
    dbs: 'missing',
    iso9001: 'missing',
    ir35: { verification: 'pending', submitted: '2026-10-19', reviewReason: 'Mixed labour-only and supply contracts — reviewer to confirm determination' },
  },
  S05: { ir35: { verification: 'pending', submitted: '2026-10-21', reviewReason: 'Operatives engaged through an intermediary — manual assessment required' } },
  S07: {
    firecert: { verification: 'pending', submitted: '2026-10-20', reviewReason: 'Data sheet cites a different test standard — confirm classification matches specification' },
    iso9001: 'missing',
  },
  S08: {
    fpc: { label: 'FPC EXC1', title: 'Factory production control certificate (EXC1)', scope: 'EXC1' },
    bsa: 'missing',
    weld: { expires: '2027-05-14' },
  },
  S13: { dbs: 'missing', ecs: { expires: '2027-02-26' } },
  S14: { gassafe: { expires: '2027-03-31' }, fgas: { expires: '2027-06-30' } },
  S16: { iso9001: 'missing' },
  S22: { pl: { expires: '2026-12-18' }, el: { expires: '2026-12-18' }, ccs: 'missing' },
  S23: { pl: { expires: '2027-06-30' }, ccs: 'missing' },
  S31: { iso9001: 'missing', niceic: { expires: '2026-11-05' } },
  S32: { gassafe: { verification: 'pending', submitted: '2026-10-16', reviewReason: 'Registration card image unclear — confirm engineer numbers' }, el: { expires: '2026-11-12' } },
  S33: { ir35: 'missing', fire3p: { label: 'FIRAS', title: 'FIRAS installer certificate', issuer: 'Warringtonfire', verification: 'pending', submitted: '2026-10-22', reviewReason: 'New certificate uploaded — confirm scope covers passive fire' } },
  S34: { cpcs: { verification: 'pending', submitted: '2026-10-14', reviewReason: 'Three operators added — cards to be matched to names' }, pl: { expires: '2026-11-18' }, ir35: 'missing' },
  S35: { cisrs: { verification: 'pending', submitted: '2026-10-18', reviewReason: 'Card register updated — confirm advanced scaffolder cards' }, iso9001: 'missing' },
  S36: {
    wah: { verification: 'pending', submitted: '2026-10-12', reviewReason: 'Training provider not on approved list — reviewer decision needed' },
    ssip: { expires: '2026-11-02' },
    iso9001: { verification: 'pending', submitted: '2026-10-23', reviewReason: 'Renewed certificate uploaded — confirm issue date' },
  },
  S37: { ir35: 'missing', weld: { verification: 'pending', submitted: '2026-10-17', reviewReason: 'Qualification range unclear for site welding position' }, fpc: { expires: '2026-11-21' } },
  S38: {
    mcs: { verification: 'pending', submitted: '2026-10-09', reviewReason: 'New supplier — first-time verification' },
    niceic: { verification: 'pending', submitted: '2026-10-09', reviewReason: 'New supplier — first-time verification' },
    pl: { expires: '2026-10-31' },
  },
  S39: { ecs: { verification: 'pending', submitted: '2026-10-15', reviewReason: 'Two operatives listed without card numbers' }, iso9001: 'missing', ssip: { expires: '2026-12-10' } },
  S40: {
    fgas: { verification: 'pending', submitted: '2026-10-13', reviewReason: 'Certificate name differs from trading name' },
    ir35: { verification: 'pending', submitted: '2026-10-13', reviewReason: 'Manual IR35 assessment required' },
    el: { expires: '2026-11-09' },
  },
  S41: {
    firecert: { verification: 'pending', submitted: '2026-10-21', reviewReason: 'Product schedule incomplete — two systems listed without certificates' },
    fire3p: { verification: 'pending', submitted: '2026-10-21', reviewReason: 'New supplier — first-time verification' },
    iso9001: 'missing',
  },
  S42: { twc: { verification: 'pending', submitted: '2026-10-20', reviewReason: 'Named coordinator has changed — confirm competence' }, el: { expires: '2026-12-20' }, pl: { expires: '2026-11-15' } },
};

/** Small deterministic hash so generated values are stable across reloads. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function isoFromOffset(base: string, days: number): string {
  const [y, m, d] = base.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function yearsBefore(iso: string, years: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y - years, m - 1, d + 1)).toISOString().slice(0, 10);
}

function evidenceTypesFor(supplier: Supplier): string[] {
  const set = REQUIREMENT_SETS.find((s) => s.id === TRADE_SET[supplier.trade])!;
  const types = set.requirementIds.map((id) => REQUIREMENTS_BY_ID[id].evidenceType);
  for (const pkg of PACKAGES) {
    if (!pkg.overlaySetId || !pkg.assignments.some((a) => a.supplierId === supplier.id)) continue;
    const overlay = REQUIREMENT_SETS.find((s) => s.id === pkg.overlaySetId)!;
    for (const id of overlay.requirementIds) types.push(REQUIREMENTS_BY_ID[id].evidenceType);
  }
  return [...new Set(types)];
}

function buildEvidence(): EvidenceRecord[] {
  const records: EvidenceRecord[] = [];
  let seq = 1001;
  for (const supplier of SUPPLIERS) {
    for (const type of evidenceTypesFor(supplier)) {
      const override = OVERRIDES[supplier.id]?.[type];
      if (override === 'missing') continue;
      const t = TEMPLATES[type];
      const h = hash(supplier.id + type);
      // Default expiry: Nov 2027 – Oct 2028, after every live package finishes.
      const expires = t.years === null ? null : isoFromOffset('2027-11-08', h % 340);
      const effectiveExpiry = override?.expires !== undefined ? override.expires : expires;
      const issued = effectiveExpiry ? yearsBefore(effectiveExpiry, t.years ?? 1) : isoFromOffset('2026-01-12', h % 200);
      const verification = override?.verification ?? 'verified';
      const submitted = override?.submitted ?? isoFromOffset(issued, 3 + (h % 9));
      const record: EvidenceRecord = {
        id: `EV-${seq++}`,
        supplierId: supplier.id,
        type,
        label: t.label,
        title: t.title,
        issuer: t.issuers[h % t.issuers.length],
        reference: `${t.prefix}-${String(100000 + (h % 899999)).slice(0, 6)}`,
        issued,
        expires: effectiveExpiry ?? null,
        scope: t.scope,
        cover: t.cover,
        verification,
        submitted,
        fileName: `${supplier.name.split(' ')[0].toLowerCase()}-${type}-${submitted.slice(0, 4)}.pdf`,
        ...(verification === 'verified'
          ? { reviewedBy: REVIEWERS[h % REVIEWERS.length], reviewedAt: isoFromOffset(submitted, 1 + (h % 4)) }
          : {}),
        ...(override ?? {}),
      };
      records.push(record);
    }
  }
  return records;
}

export const SEED_EVIDENCE: EvidenceRecord[] = buildEvidence();

/** Historical audit packs — recomputed from the seed evidence so they match the engine exactly. */
export const SEED_AUDIT_SPECS = [
  { id: 'SS-2026-101', supplierId: 'S03', packageId: 'P04', generatedAt: '2026-10-14T10:24', reviewer: 'Tom Whitaker', note: 'All requirements satisfied at mobilisation and through finish. Released for pre-start.' },
  { id: 'SS-2026-102', supplierId: 'S06', packageId: 'P02', generatedAt: '2026-10-19T15:02', reviewer: 'Priya Shah', note: 'Ready. Fire stopping scope confirmed against tenant specification.' },
  { id: 'SS-2026-103', supplierId: 'S01', packageId: 'P01', generatedAt: '2026-10-22T09:41', reviewer: 'Dana Nolan', note: 'CHAS renewal requested from supplier; mobilisation not blocked.' },
  { id: 'SS-2026-104', supplierId: 'S04', packageId: 'P03', generatedAt: '2026-10-23T16:18', reviewer: 'Priya Shah', note: 'Not ready. Product certification and DBS register outstanding; escalated to package manager.' },
];
