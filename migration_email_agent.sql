-- 1. New table: email_messages (stores individual email messages per thread)
CREATE TABLE IF NOT EXISTS email_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
  gmail_message_id TEXT NOT NULL UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT,
  sent_by_bot BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Extend email_threads with qualification tracking
ALTER TABLE email_threads
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'active', 'qualified', 'closed')),
  ADD COLUMN IF NOT EXISTS bot_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS qualification_step INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qualification_complete BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS collected_address TEXT,
  ADD COLUMN IF NOT EXISTS collected_wishes TEXT,
  ADD COLUMN IF NOT EXISTS collected_dimensions TEXT,
  ADD COLUMN IF NOT EXISTS collected_phone TEXT,
  ADD COLUMN IF NOT EXISTS body_preview TEXT,
  ADD COLUMN IF NOT EXISTS last_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pending_reply BOOLEAN DEFAULT false;

-- 3. Extend conversations with cross-channel link  
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'whatsapp' CHECK (source IN ('whatsapp', 'email'));

-- 4. Enable realtime for email_messages
-- Check if publication exists before altering
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'email_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE email_messages;
  END IF;
END $$;
