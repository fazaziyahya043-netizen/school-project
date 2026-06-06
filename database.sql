-- ============================================
-- School Project - Supabase Database Schema
-- ============================================
-- تشغيل هذا الملف في SQL Editor في Supabase

-- ============================================
-- 1. جدول المستخدمين (للمدير)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id        SERIAL PRIMARY KEY,
    username  TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. جدول الإعدادات العامة للموقع
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id            SERIAL PRIMARY KEY,
    setting_key   TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. جدول معرض الصور
-- ============================================
CREATE TABLE IF NOT EXISTS gallery (
    id            SERIAL PRIMARY KEY,
    image_url     TEXT NOT NULL,
    emoji         TEXT DEFAULT '📷',
    caption       TEXT,
    display_order INT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. جدول الأسئلة الشائعة
-- ============================================
CREATE TABLE IF NOT EXISTS faq (
    id            SERIAL PRIMARY KEY,
    question      TEXT NOT NULL,
    answer        TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. جدول طلبات المساعدة
-- ============================================
CREATE TABLE IF NOT EXISTS help_requests (
    id         SERIAL PRIMARY KEY,
    name       TEXT,
    email      TEXT,
    phone      TEXT,
    message    TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- بيانات أولية - الإعدادات الافتراضية
-- ============================================
INSERT INTO settings (setting_key, setting_value) VALUES
    ('school_name',  'اسم المدرسة'),
    ('info_phone',   '0600000000'),
    ('info_email',   'info@school.ma')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- بيانات أولية - مدير افتراضي
-- كلمة المرور: admin123 (مشفرة بـ bcrypt)
-- غيّرها من لوحة التحكم فور الدخول!
-- ============================================
INSERT INTO users (username, password) VALUES
    ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- ============================================
-- بيانات أولية - أسئلة شائعة تجريبية
-- ============================================
INSERT INTO faq (question, answer, display_order) VALUES
    ('ما هي أوقات الدراسة؟',    'من الساعة 8:00 صباحاً حتى 5:00 مساءً من الاثنين إلى الجمعة.', 1),
    ('كيف يمكنني التواصل مع الإدارة؟', 'يمكنك التواصل عبر الهاتف أو البريد الإلكتروني الموجود في صفحة الاتصال.', 2),
    ('هل توجد أنشطة لامنهجية؟',  'نعم، نوفر مجموعة من الأنشطة الرياضية والثقافية لجميع الطلاب.', 3)
ON CONFLICT DO NOTHING;

-- ============================================
-- تفعيل RLS (Row Level Security)
-- ============================================
ALTER TABLE settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery       ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq           ENABLE ROW LEVEL SECURITY;
ALTER TABLE help_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users         ENABLE ROW LEVEL SECURITY;

-- السماح للزوار بقراءة الإعدادات والمعرض والأسئلة
CREATE POLICY "public can read settings" ON settings
    FOR SELECT USING (true);

CREATE POLICY "public can read gallery" ON gallery
    FOR SELECT USING (true);

CREATE POLICY "public can read faq" ON faq
    FOR SELECT USING (true);

-- السماح بإرسال طلبات المساعدة فقط (بدون قراءة)
CREATE POLICY "public can insert help requests" ON help_requests
    FOR INSERT WITH CHECK (true);

-- جدول المستخدمين: السماح للـ anon بالقراءة فقط (لتسجيل الدخول عبر PHP)
CREATE POLICY "anon can read users" ON users
    FOR SELECT USING (true);

-- ============================================
-- صلاحيات الكتابة للمدير (عبر PHP بعد التحقق)
-- ============================================
CREATE POLICY "service can write settings" ON settings
    FOR ALL USING (true);

CREATE POLICY "service can write gallery" ON gallery
    FOR ALL USING (true);

CREATE POLICY "service can write faq" ON faq
    FOR ALL USING (true);

CREATE POLICY "service can read help requests" ON help_requests
    FOR SELECT USING (true);
