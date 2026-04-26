-- ════════════════════════════════════════════════════════════════
-- WealthHub: Chat + Profile Setup
-- รันใน Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ════════════════════════════════════════════════════════════════

-- ─── 1) USER PROFILES TABLE ─────────────────────────────────────
-- เก็บชื่อที่แสดง + รูปโปรไฟล์ของผู้ใช้
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- ทุกคนอ่านได้ (เพื่อให้ chat แสดงชื่อ/รูปคนอื่นได้)
DROP POLICY IF EXISTS "profiles_select_all" ON public.user_profiles;
CREATE POLICY "profiles_select_all"
  ON public.user_profiles FOR SELECT
  USING (true);

-- เขียนได้เฉพาะของตัวเอง
DROP POLICY IF EXISTS "profiles_upsert_own" ON public.user_profiles;
CREATE POLICY "profiles_upsert_own"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.user_profiles;
CREATE POLICY "profiles_update_own"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);


-- ─── 2) CHAT MESSAGES TABLE ─────────────────────────────────────
-- ห้องแชทรวมกลาง (ทุกคนเห็น stream เดียวกัน)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 1 AND 500),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx
  ON public.chat_messages (created_at DESC);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- ทุกคนที่ login อ่านได้
DROP POLICY IF EXISTS "chat_select_authenticated" ON public.chat_messages;
CREATE POLICY "chat_select_authenticated"
  ON public.chat_messages FOR SELECT
  TO authenticated
  USING (true);

-- ส่งข้อความได้เฉพาะของตัวเอง
DROP POLICY IF EXISTS "chat_insert_own" ON public.chat_messages;
CREATE POLICY "chat_insert_own"
  ON public.chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- เปิด realtime broadcast (ตารางจะส่ง INSERT event ไปยัง subscriber)
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;


-- ─── 3) AVATAR STORAGE BUCKET ───────────────────────────────────
-- รูปโปรไฟล์เก็บใน Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- อัปโหลดได้เฉพาะลงโฟลเดอร์ตัวเอง: <user_id>/avatar.xxx
DROP POLICY IF EXISTS "avatar_upload_own" ON storage.objects;
CREATE POLICY "avatar_upload_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatar_update_own" ON storage.objects;
CREATE POLICY "avatar_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "avatar_delete_own" ON storage.objects;
CREATE POLICY "avatar_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ทุกคนดาวน์โหลดได้ (bucket public)
DROP POLICY IF EXISTS "avatar_select_public" ON storage.objects;
CREATE POLICY "avatar_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');


-- ════════════════════════════════════════════════════════════════
-- เสร็จแล้ว! Refresh แอพในมือถือเพื่อใช้งาน Chat + Profile
-- ════════════════════════════════════════════════════════════════
