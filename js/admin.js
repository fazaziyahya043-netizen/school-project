// ============================================
// admin.js - لوحة التحكم (JavaScript فقط)
// ============================================

// ─── المصادقة ───
function showLoginForm() {
    document.getElementById('loginOverlay').style.display = 'flex';
}

function hideLoginForm() {
    document.getElementById('loginOverlay').style.display = 'none';
}

async function checkAuth() {
    if (!sbIsLoggedIn()) {
        showLoginForm();
    } else {
        hideLoginForm();
        const username = sessionStorage.getItem('admin_username') || 'المدير';
        const el = document.getElementById('adminUsername');
        if (el) el.textContent = username;
        loadAllData();
    }
}

async function doLogin() {
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value;
    const errEl   = document.getElementById('loginErr');

    if (errEl) errEl.style.display = 'none';

    if (!username || !password) {
        if (errEl) errEl.style.display = 'block';
        return;
    }

    try {
        const users = await sbSelect('users', `select=id,username,password&username=eq.${encodeURIComponent(username)}`);

        if (users.length === 0) {
            if (errEl) errEl.style.display = 'block';
            return;
        }

        const storedPass = users[0].password;
        const isValid = (password === storedPass) ||
                        (storedPass === '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' && password === 'admin123');

        if (isValid) {
            sbSetLoggedIn(username);
            hideLoginForm();
            const el = document.getElementById('adminUsername');
            if (el) el.textContent = username;
            loadAllData();
        } else {
            if (errEl) errEl.style.display = 'block';
        }
    } catch (e) {
        console.error(e);
        showToast('خطأ في الاتصال بقاعدة البيانات', 'error');
    }
}

function doLogout() {
    sbLogout();
    showLoginForm();
}

// ─── التنقل بين الأقسام ───
function showPanel(id) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.sb-item').forEach(b => b.classList.remove('active'));
    const panel = document.getElementById(id);
    if (panel) panel.classList.add('active');
    const btn = document.querySelector(`[onclick="showPanel('${id}')"]`);
    if (btn) btn.classList.add('active');
    const badge = document.getElementById('topbarBadge');
    if (badge && btn) badge.textContent = btn.textContent.trim().replace(/^[^\s]+\s/, '');
}

// ─── تحميل جميع البيانات ───
async function loadAllData() {
    await Promise.all([loadSettings(), loadGallery(), loadFaqs()]);
}

// ─── الإعدادات ───
async function loadSettings() {
    try {
        const s = await sbGetSettings();

        // كل الحقول: id_في_HTML → مفتاح_في_قاعدة_البيانات
        const fields = {
            f_school_name:   'school_name',
            f_hero_title:    'hero_title',
            f_hero_subtitle: 'hero_subtitle',
            f_stat_students: 'stat_students',
            f_stat_teachers: 'stat_teachers',
            f_stat_year:     'stat_year',
            f_stat_classes:  'stat_classes',
            f_info_hours:    'info_hours',
            f_info_phone:    'info_phone',
            f_info_email:    'info_email',
            f_info_principal:'info_principal',
            f_info_level:    'info_level',
            f_info_location: 'info_location',
            f_addr_street:   'addr_street',
            f_addr_postal:   'addr_postal',
            f_addr_phone:    'addr_phone',
            f_addr_fax:      'addr_fax',
            f_addr_hours:    'addr_hours',
            f_gmail_email:   'gmail_email',
            f_whatsapp_num:  'whatsapp_num',
            f_heroBgFrom:    'hero_bg_from',
            f_heroBgTo:      'hero_bg_to',
            f_pageBg:        'page_bg'
        };

        for (const [elId, key] of Object.entries(fields)) {
            const el = document.getElementById(elId);
            if (el && s[key] !== undefined) el.value = s[key];
        }

        // لوحة التحكم - الإحصائيات
        if (s.school_name)   setEl('dSchoolName', s.school_name);
        if (s.stat_students) setEl('dStudents', s.stat_students);
        if (s.stat_teachers) setEl('dTeachers', s.stat_teachers);

    } catch (e) {
        console.error('خطأ في تحميل الإعدادات:', e);
    }
}

async function saveSettings() {
    const fields = {
        f_school_name:   'school_name',
        f_hero_title:    'hero_title',
        f_hero_subtitle: 'hero_subtitle',
        f_stat_students: 'stat_students',
        f_stat_teachers: 'stat_teachers',
        f_stat_year:     'stat_year',
        f_stat_classes:  'stat_classes',
        f_info_hours:    'info_hours',
        f_info_phone:    'info_phone',
        f_info_email:    'info_email',
        f_info_principal:'info_principal',
        f_info_level:    'info_level',
        f_info_location: 'info_location',
        f_addr_street:   'addr_street',
        f_addr_postal:   'addr_postal',
        f_addr_phone:    'addr_phone',
        f_addr_fax:      'addr_fax',
        f_addr_hours:    'addr_hours',
        f_gmail_email:   'gmail_email',
        f_whatsapp_num:  'whatsapp_num'
    };

    try {
        for (const [elId, key] of Object.entries(fields)) {
            const el = document.getElementById(elId);
            if (el) await sbSaveSetting(key, el.value);
        }
        showToast('تم حفظ الإعدادات بنجاح ✅');
    } catch (e) {
        console.error(e);
        showToast('خطأ في حفظ الإعدادات ❌', 'error');
    }
}

// ─── التصميم ───
function setHeroBg(from, to) {
    const f = document.getElementById('f_heroBgFrom');
    const t = document.getElementById('f_heroBgTo');
    if (f) f.value = from;
    if (t) t.value = to;
}

async function saveDesign() {
    try {
        const from = document.getElementById('f_heroBgFrom')?.value || '#0d2d5e';
        const to   = document.getElementById('f_heroBgTo')?.value   || '#3876c5';
        const bg   = document.getElementById('f_pageBg')?.value     || '#f0f4f9';
        await sbSaveSetting('hero_bg', `linear-gradient(135deg,${from},${to})`);
        await sbSaveSetting('hero_bg_from', from);
        await sbSaveSetting('hero_bg_to', to);
        await sbSaveSetting('page_bg', bg);
        showToast('تم حفظ التصميم ✅');
    } catch (e) {
        showToast('خطأ في حفظ التصميم ❌', 'error');
    }
}

// ─── المعرض ───
async function loadGallery() {
    try {
        const items = await sbSelect('gallery', 'select=*&order=display_order.asc');
        const container = document.getElementById('galleryAdminGrid');
        if (!container) return;

        setEl('dGallery', items.length);

        if (items.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1">لا توجد صور بعد</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="gal-item">
                ${item.image_url
                    ? `<img src="${item.image_url}" alt="${esc(item.caption)}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`
                    : `<div class="gal-icon">${item.emoji || '🏫'}</div>`
                }
                <div class="gal-actions">
                    <button onclick="deleteGallery(${item.id})" style="background:rgba(220,38,38,0.9);color:white;border:none;border-radius:8px;padding:6px 10px;cursor:pointer">🗑️</button>
                </div>
                <div style="font-size:0.75rem;text-align:center;padding:4px 0;color:var(--text-muted)">${esc(item.caption || '')}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error('خطأ في تحميل المعرض:', e);
    }
}

async function addGalleryItem() {
    const url     = document.getElementById('gNewUrl')?.value.trim()    || '';
    const caption = document.getElementById('gNewCaption')?.value.trim() || '';
    const emoji   = document.getElementById('gNewEmoji')?.value.trim()   || '🏫';

    if (!caption && !url) {
        showToast('أدخل وصف الصورة على الأقل', 'error');
        return;
    }

    try {
        await sbInsert('gallery', { image_url: url, emoji, caption, display_order: 0 });
        showToast('تمت إضافة الصورة ✅');
        document.getElementById('gNewUrl').value     = '';
        document.getElementById('gNewCaption').value = '';
        document.getElementById('gNewEmoji').value   = '';
        loadGallery();
    } catch (e) {
        showToast('خطأ في إضافة الصورة ❌', 'error');
    }
}

async function deleteGallery(id) {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
    try {
        await sbDelete('gallery', `id=eq.${id}`);
        showToast('تم الحذف ✅');
        loadGallery();
    } catch (e) {
        showToast('خطأ في الحذف ❌', 'error');
    }
}

// ─── رفع الصور إلى Supabase Storage ───
async function uploadAndFill(inputId) {
    const fileInput = document.getElementById(inputId);
    const file = fileInput?.files[0];
    if (!file) { showToast('اختر صورة أولاً', 'error'); return; }
    try {
        showToast('جاري الرفع...');
        const url = await sbUploadImage(file);
        const urlInput = document.getElementById('gNewUrl');
        if (urlInput) urlInput.value = url;
        showToast('تم رفع الصورة ✅');
    } catch (e) {
        showToast('فشل رفع الصورة — تأكد من إنشاء bucket باسم gallery في Supabase Storage ❌', 'error');
    }
}

// ─── الأسئلة الشائعة ───
async function loadFaqs() {
    try {
        const items = await sbSelect('faq', 'select=*&order=display_order.asc');
        const container = document.getElementById('faqAdminList');
        if (!container) return;

        setEl('dFaqs', items.length);

        if (items.length === 0) {
            container.innerHTML = '<p style="color:var(--text-muted)">لا توجد أسئلة بعد</p>';
            return;
        }

        container.innerHTML = items.map(item => `
            <div style="background:var(--card-bg);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:0.8rem">
                <div class="faq-row-head">
                    <input type="text" id="fq_q_${item.id}" value="${esc(item.question)}" style="flex:1;margin-left:8px">
                    <button onclick="deleteFaq(${item.id})" class="btn btn-danger" style="flex-shrink:0">🗑️</button>
                </div>
                <textarea id="fq_a_${item.id}" style="width:100%;margin-top:8px;min-height:80px">${item.answer}</textarea>
                <button onclick="updateFaq(${item.id})" class="btn btn-primary" style="margin-top:8px">💾 حفظ</button>
            </div>
        `).join('');
    } catch (e) {
        console.error('خطأ في تحميل الأسئلة:', e);
    }
}

async function addFaqItem() {
    const question = document.querySelector('#pFaq input[type=text]')?.value.trim()   || '';
    const answer   = document.querySelector('#pFaq textarea:last-of-type')?.value.trim() || '';

    if (!question || !answer) {
        showToast('أدخل السؤال والإجابة', 'error');
        return;
    }

    try {
        await sbInsert('faq', { question, answer, display_order: 0 });
        showToast('تمت إضافة السؤال ✅');
        loadFaqs();
    } catch (e) {
        showToast('خطأ في الإضافة ❌', 'error');
    }
}

async function updateFaq(id) {
    const question = document.getElementById(`fq_q_${id}`)?.value || '';
    const answer   = document.getElementById(`fq_a_${id}`)?.value || '';
    try {
        await sbUpdate('faq', `id=eq.${id}`, { question, answer });
        showToast('تم الحفظ ✅');
    } catch (e) {
        showToast('خطأ في الحفظ ❌', 'error');
    }
}

async function deleteFaq(id) {
    if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) return;
    try {
        await sbDelete('faq', `id=eq.${id}`);
        showToast('تم الحذف ✅');
        loadFaqs();
    } catch (e) {
        showToast('خطأ في الحذف ❌', 'error');
    }
}

// ─── تغيير كلمة المرور ───
async function changePassword() {
    const oldPass     = document.getElementById('oldPass')?.value     || '';
    const newPass     = document.getElementById('newPass')?.value     || '';
    const confirmPass = document.getElementById('confirmPass')?.value || '';

    if (!oldPass || !newPass || !confirmPass) {
        showToast('أدخل جميع الحقول', 'error'); return;
    }
    if (newPass !== confirmPass) {
        showToast('كلمة المرور الجديدة غير متطابقة', 'error'); return;
    }

    try {
        const username = sessionStorage.getItem('admin_username') || 'admin';
        const users = await sbSelect('users', `select=id,password&username=eq.${encodeURIComponent(username)}`);
        if (users.length === 0) { showToast('المستخدم غير موجود', 'error'); return; }

        const stored = users[0].password;
        const valid  = (oldPass === stored) ||
                       (stored === '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' && oldPass === 'admin123');

        if (!valid) { showToast('كلمة المرور الحالية غير صحيحة', 'error'); return; }

        await sbUpdate('users', `username=eq.${encodeURIComponent(username)}`, { password: newPass });
        showToast('تم تغيير كلمة المرور بنجاح ✅');
        document.getElementById('oldPass').value     = '';
        document.getElementById('newPass').value     = '';
        document.getElementById('confirmPass').value = '';
    } catch (e) {
        showToast('خطأ في تغيير كلمة المرور ❌', 'error');
    }
}

// ─── مساعد ───
function setEl(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function esc(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className   = type === 'error' ? 'toast-error' : '';
    toast.style.display = 'block';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.style.display = 'none', 3000);
}

// ─── بدء ───
checkAuth();
