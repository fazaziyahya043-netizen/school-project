// ============================================
// Supabase Client - اتصال مباشر بدون PHP
// ============================================

const SUPABASE_URL = 'https://kqyogtldthmeclqpiwqf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxeW9ndGxkdGhtZWNscXBpd3FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODE3MDQsImV4cCI6MjA5NjI1NzcwNH0.3TgMzmV_VlfhWC88xEp22IufUstX6Z--DYTV8Q4djWo';

async function sb(endpoint, method = 'GET', body = null, extra = '') {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}${extra}`;
    const opts = {
        method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Supabase ${res.status}: ${err}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : [];
}

// ─── قراءة ───
async function sbSelect(table, query = '') {
    return sb(`${table}?${query}`);
}

// ─── إضافة ───
async function sbInsert(table, data) {
    return sb(table, 'POST', data);
}

// ─── تحديث ───
async function sbUpdate(table, filter, data) {
    return sb(`${table}?${filter}`, 'PATCH', data);
}

// ─── حذف ───
async function sbDelete(table, filter) {
    return sb(`${table}?${filter}`, 'DELETE');
}

// ─── جلب الإعدادات كـ object ───
async function sbGetSettings() {
    const rows = await sbSelect('settings', 'select=setting_key,setting_value');
    const obj = {};
    rows.forEach(r => obj[r.setting_key] = r.setting_value);
    return obj;
}

// ─── حفظ إعداد واحد ───
async function sbSaveSetting(key, value) {
    const existing = await sbSelect('settings', `select=id&setting_key=eq.${encodeURIComponent(key)}`);
    if (existing.length > 0) {
        await sbUpdate('settings', `setting_key=eq.${encodeURIComponent(key)}`, { setting_value: value });
    } else {
        await sbInsert('settings', { setting_key: key, setting_value: value });
    }
}

// ─── رفع صورة إلى Supabase Storage ───
async function sbUploadImage(file) {
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const url = `${SUPABASE_URL}/storage/v1/object/gallery/${filename}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': file.type,
            'x-upsert': 'true'
        },
        body: file
    });
    if (!res.ok) throw new Error('فشل رفع الصورة');
    return `${SUPABASE_URL}/storage/v1/object/public/gallery/${filename}`;
}

// ─── تسجيل الدخول (localStorage) ───
function sbLogin(username, password) {
    // كلمة المرور مخزنة في localStorage بعد أول تحقق ناجح
    const stored = localStorage.getItem('admin_pass');
    return username === 'admin' && password === (stored || 'admin123');
}

function sbIsLoggedIn() {
    return sessionStorage.getItem('admin_logged_in') === 'true';
}

function sbSetLoggedIn(username) {
    sessionStorage.setItem('admin_logged_in', 'true');
    sessionStorage.setItem('admin_username', username);
}

function sbLogout() {
    sessionStorage.clear();
}
