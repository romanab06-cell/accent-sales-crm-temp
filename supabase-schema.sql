-- ACCENT CRM Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BRANDS TABLE (Main Partner Entity)
-- ============================================
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(255), -- Furniture, Lighting, etc.
  website VARCHAR(500),
  country VARCHAR(100),
  status VARCHAR(50) DEFAULT 'prospect', -- prospect, negotiation, contract, active, inactive, not_relevant
  deal_stage VARCHAR(50) DEFAULT 'lead', -- lead, qualified, proposal, negotiation, won, lost
  priority INTEGER CHECK (priority IN (1, 2, 3)), -- 1: Highest, 2: Medium, 3: Low
  annual_contract_value DECIMAL(12, 2),
  sales_owner VARCHAR(255), -- Team member responsible
  date_added TIMESTAMP DEFAULT NOW(),
  last_contact_date TIMESTAMP,
  next_followup_date TIMESTAMP,
  excluded_categories TEXT,
  comments TEXT,
  hide BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CONTACTS TABLE
-- ============================================
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DEALS TABLE (Commercial Terms)
-- ============================================
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  discount DECIMAL(5, 4), -- e.g., 0.35 for 35%
  payment_terms VARCHAR(100), -- Prepayment, Net30, etc.
  shipping_terms VARCHAR(100), -- EXW, DAP, etc.
  freight_free_limit DECIMAL(10, 2),
  rrp_inc_vat DECIMAL(10, 2),
  rrp_exc_vat DECIMAL(10, 2),
  dealer_access VARCHAR(100), -- Yes, No, Through Partner, etc.
  contract_start_date DATE,
  contract_end_date DATE,
  renewal_date DATE,
  first_purchase_date DATE,
  minimum_order_value DECIMAL(10, 2),
  commission_structure TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id) -- One deal per brand
);

-- ============================================
-- COMMUNICATIONS TABLE
-- ============================================
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- email, phone, meeting
  date TIMESTAMP NOT NULL DEFAULT NOW(),
  subject VARCHAR(500),
  summary TEXT,
  participants TEXT, -- JSON array or comma-separated
  follow_up_required BOOLEAN DEFAULT FALSE,
  next_action TEXT,
  created_by VARCHAR(255), -- Team member who logged it
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS TABLE
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- master_data, price_list, images, contract, other
  name VARCHAR(255) NOT NULL,
  url VARCHAR(1000) NOT NULL,
  file_size BIGINT,
  version VARCHAR(50),
  upload_date TIMESTAMP DEFAULT NOW(),
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  assigned_to VARCHAR(255), -- Team member
  status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high, urgent
  created_by VARCHAR(255),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_brands_status ON brands(status);
CREATE INDEX idx_brands_deal_stage ON brands(deal_stage);
CREATE INDEX idx_brands_priority ON brands(priority);
CREATE INDEX idx_brands_sales_owner ON brands(sales_owner);
CREATE INDEX idx_brands_next_followup ON brands(next_followup_date);

CREATE INDEX idx_contacts_brand_id ON contacts(brand_id);
CREATE INDEX idx_contacts_email ON contacts(email);

CREATE INDEX idx_deals_brand_id ON deals(brand_id);

CREATE INDEX idx_communications_brand_id ON communications(brand_id);
CREATE INDEX idx_communications_date ON communications(date);
CREATE INDEX idx_communications_type ON communications(type);

CREATE INDEX idx_documents_brand_id ON documents(brand_id);
CREATE INDEX idx_documents_type ON documents(document_type);

CREATE INDEX idx_tasks_brand_id ON tasks(brand_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Optional - disable for now)
-- ============================================
-- ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE communications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies here if you want authentication
