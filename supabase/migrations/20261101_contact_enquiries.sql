-- ============================================================================
-- BHARAT YATRA — CONTACT ENQUIRIES & CUSTOMER DISPATCH SUBSYSTEM
-- Production Database Migration for BharatYatra Customer Inquiries
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contact Enquiries Table
CREATE TABLE IF NOT EXISTS public.contact_enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_reference VARCHAR(64) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  inquiry_type VARCHAR(100) NOT NULL DEFAULT 'GENERAL_INQUIRY',
  message TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'NEW', -- NEW, IN_PROGRESS, RESOLVED, CLOSED
  priority VARCHAR(50) NOT NULL DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  source VARCHAR(50) NOT NULL DEFAULT 'WEBSITE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  email_notification_status VARCHAR(50) NOT NULL DEFAULT 'NOT_CONFIGURED', -- PENDING, SENT, FAILED, NOT_CONFIGURED
  whatsapp_notification_status VARCHAR(50) NOT NULL DEFAULT 'NOT_CONFIGURED', -- PENDING, SENT, FAILED, NOT_CONFIGURED
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by VARCHAR(255),
  ip_address VARCHAR(100),
  user_agent TEXT
);

-- Indexing for High-Performance Queries
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_status ON public.contact_enquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_created_at ON public.contact_enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_email ON public.contact_enquiries(email);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_phone ON public.contact_enquiries(phone);
CREATE INDEX IF NOT EXISTS idx_contact_enquiries_reference ON public.contact_enquiries(enquiry_reference);

-- Row Level Security (RLS)
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;

-- Allow public / anon users to INSERT enquiries (Website Contact Form)
DROP POLICY IF EXISTS "Public can submit contact enquiries" ON public.contact_enquiries;
CREATE POLICY "Public can submit contact enquiries"
  ON public.contact_enquiries
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Restrict SELECT / UPDATE / DELETE exclusively to service_role and authenticated admins
DROP POLICY IF EXISTS "Only service role and admins can view enquiries" ON public.contact_enquiries;
CREATE POLICY "Only service role and admins can view enquiries"
  ON public.contact_enquiries
  FOR SELECT
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Only service role can update enquiries" ON public.contact_enquiries;
CREATE POLICY "Only service role can update enquiries"
  ON public.contact_enquiries
  FOR UPDATE
  TO service_role
  USING (true);

DROP POLICY IF EXISTS "Only service role can delete enquiries" ON public.contact_enquiries;
CREATE POLICY "Only service role can delete enquiries"
  ON public.contact_enquiries
  FOR DELETE
  TO service_role
  USING (true);

COMMENT ON TABLE public.contact_enquiries IS 'Stores verified customer inquiries submitted via BharatYatra contact portals.';

