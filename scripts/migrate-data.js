/**
 * Data Migration Script - Excel to Supabase
 * 
 * This script reads your Brands_List.xlsx and imports it into Supabase
 * 
 * USAGE:
 * 1. Place Brands_List.xlsx in the project root
 * 2. Set your Supabase credentials in .env
 * 3. Run: node scripts/migrate-data.js
 */

const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Mapping functions
function mapStatus(brandName) {
  if (!brandName) return 'prospect';
  const name = brandName.toLowerCase();
  if (name.includes('connected')) return 'active';
  if (name.includes('not relevant')) return 'not_relevant';
  return 'prospect';
}

function mapDealStage(status) {
  if (status === 'active') return 'won';
  if (status === 'not_relevant') return 'lost';
  return 'lead';
}

function parseContact(contactString) {
  if (!contactString) return { name: null, email: null };
  
  // Try to extract email
  const emailMatch = contactString.match(/\(([^)]+@[^)]+)\)/);
  const email = emailMatch ? emailMatch[1].trim() : null;
  
  // Extract name (everything before the email or the whole string)
  let name = contactString.split('(')[0].trim();
  
  // Remove common prefixes
  name = name.replace(/^(Info|Contact form|Contact):?\s*/i, '');
  
  return { name: name || null, email };
}

function normalizePaymentTerms(terms) {
  if (!terms) return null;
  const t = terms.toString().toLowerCase().trim();
  if (t.includes('prepay')) return 'Prepayment';
  if (t.includes('net') && t.includes('30')) return 'Net 30';
  if (t.includes('net') && t.includes('14')) return 'Net 14';
  if (t.includes('ex works')) return 'EX WORKS';
  return terms;
}

function normalizeShippingTerms(terms) {
  if (!terms) return null;
  const t = terms.toString().toLowerCase().trim();
  if (t.includes('exw') || t.includes('ex works')) return 'EXW';
  if (t.includes('dap')) return 'DAP';
  return terms;
}

async function migrateData() {
  console.log('🚀 Starting data migration...\n');
  
  // Read Excel file
  const workbook = XLSX.readFile('Brands_List.xlsx');
  const sheet = workbook.Sheets['Brands'];
  const data = XLSX.utils.sheet_to_json(sheet);
  
  // Skip header rows (first 3 rows are keys/labels)
  const brands = data.slice(3).filter(row => row.Brand && row.Brand.trim());
  
  console.log(`📊 Found ${brands.length} brands to migrate\n`);
  
  let imported = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const row of brands) {
    try {
      // Skip if brand name is a status indicator
      if (['Connected', 'Not relevant at all/now', 'KEY'].includes(row.Brand)) {
        skipped++;
        continue;
      }
      
      const status = mapStatus(row.Brand);
      
      // 1. Insert Brand
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .insert({
          name: row.Brand,
          type: row.Type || null,
          website: row.Website || null,
          status: status,
          deal_stage: mapDealStage(status),
          priority: row['Priority (1: Highest)'] || null,
          excluded_categories: row['Excluded categories'] || null,
          comments: row.Comments || null,
          hide: row.Hide ? true : false,
        })
        .select()
        .single();
      
      if (brandError) {
        console.error(`❌ Error inserting brand ${row.Brand}:`, brandError.message);
        errors++;
        continue;
      }
      
      // 2. Insert Contact (if exists)
      if (row['Contact person'] || row['Contact Email']) {
        const contact = parseContact(row['Contact person']);
        
        await supabase.from('contacts').insert({
          brand_id: brand.id,
          name: contact.name,
          email: row['Contact Email'] || contact.email,
          is_primary: true,
        });
      }
      
      // 3. Insert Deal (if has deal data)
      if (row.Discount || row['Payment Terms'] || row['Shipping terms']) {
        await supabase.from('deals').insert({
          brand_id: brand.id,
          discount: row.Discount || null,
          payment_terms: normalizePaymentTerms(row['Payment Terms']),
          shipping_terms: normalizeShippingTerms(row['Shipping terms']),
          freight_free_limit: row['Freight free limit'] || null,
          rrp_inc_vat: row['rrp inc VAT'] || null,
          rrp_exc_vat: row['rrp exc VAT'] || null,
          dealer_access: row['Dealer Access'] || null,
          first_purchase_date: row['1st purchase made'] || null,
        });
      }
      
      // 4. Insert Documents (Master Data, Price List, Images)
      const documents = [];
      
      if (row['Master data'] && row['Master data'] !== 'no' && row['Master data'] !== 'No') {
        documents.push({
          brand_id: brand.id,
          document_type: 'master_data',
          name: 'Master Data',
          url: row['Master data'].toString(),
        });
      }
      
      if (row['Price list'] && row['Price list'] !== 'Yes') {
        documents.push({
          brand_id: brand.id,
          document_type: 'price_list',
          name: 'Price List',
          url: row['Price list'].toString(),
        });
      }
      
      if (row['Images']) {
        documents.push({
          brand_id: brand.id,
          document_type: 'images',
          name: 'Images',
          url: row['Images'].toString(),
        });
      }
      
      if (documents.length > 0) {
        await supabase.from('documents').insert(documents);
      }
      
      // 5. Insert Task (if action exists)
      if (row.Action) {
        await supabase.from('tasks').insert({
          brand_id: brand.id,
          title: row.Action,
          status: 'pending',
          priority: 'medium',
        });
      }
      
      imported++;
      
      if (imported % 50 === 0) {
        console.log(`✅ Imported ${imported} brands...`);
      }
      
    } catch (err) {
      console.error(`❌ Error processing ${row.Brand}:`, err.message);
      errors++;
    }
  }
  
  console.log('\n📈 Migration Summary:');
  console.log(`   ✅ Imported: ${imported}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  console.log('\n🎉 Migration complete!\n');
}

// Run migration
migrateData().catch(console.error);
