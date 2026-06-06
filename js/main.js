// ============================================
// main.js - الصفحة الرئيسية (JavaScript فقط)
// ============================================

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

function showToast(message) {
    const toast = document.getElementById('updateToast');
    if (!toast) return;
    toast.textContent = message || '🔄 تم تحديث المحتوى!';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

async function loadSchoolData() {
    console.log('🔄 جاري تحميل البيانات من Supabase...');
    try {
        // جلب الإعدادات والمعرض والأسئلة في نفس الوقت
        const [s, gallery, faqs] = await Promise.all([
            sbGetSettings(),
            sbSelect('gallery', 'select=*&order=display_order.asc'),
            sbSelect('faq', 'select=*&order=display_order.asc')
        ]);

        console.log('✅ تم تحميل البيانات بنجاح');

        // خلفيات التصميم
        const heroBanner = document.querySelector('.hero-banner');
        if (s.hero_bg && heroBanner) heroBanner.style.background = s.hero_bg;
        if (s.page_bg) document.body.style.background = s.page_bg;

        // اسم المدرسة
        if (s.school_name) {
            ['sbName','heroTitle'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = s.school_name;
            });
            ['sbLogo','heroLogoText'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = s.school_name.charAt(0);
            });
            document.title = s.school_name;
        }

        if (s.hero_subtitle) {
            const el = document.getElementById('heroSubtitle');
            if (el) el.textContent = s.hero_subtitle;
        }

        // الإحصائيات
        const statsMap = { stat_students:'statStudents', stat_teachers:'statTeachers', stat_year:'statYear', stat_classes:'statClasses' };
        for (const [key, id] of Object.entries(statsMap)) {
            if (s[key]) { const el = document.getElementById(id); if (el) el.textContent = s[key]; }
        }

        // معلومات المدرسة
        const infoFields = { info_hours:'infoHours', info_phone:'infoPhone', info_email:'infoEmail', info_principal:'infoPrincipal', info_level:'infoLevel', info_location:'infoLocation' };
        for (const [key, id] of Object.entries(infoFields)) {
            if (s[key]) { const el = document.getElementById(id); if (el) el.textContent = s[key]; }
        }

        // العنوان
        const addrFields = { addr_street:'addrStreet', addr_postal:'addrPostal', addr_phone:'addrPhone', addr_fax:'addrFax', addr_hours:'addrHours' };
        for (const [key, id] of Object.entries(addrFields)) {
            if (s[key]) { const el = document.getElementById(id); if (el) el.textContent = s[key]; }
        }

        // التواصل
        if (s.gmail_email) {
            ['gmailCard','modalGmail'].forEach(id => { const el = document.getElementById(id); if (el) el.href = 'mailto:' + s.gmail_email; });
            const gmailText = document.getElementById('gmailText');
            if (gmailText) gmailText.textContent = s.gmail_email;
        }
        if (s.whatsapp_num) {
            const clean = s.whatsapp_num.replace(/\D/g, '');
            ['whatsappCard','modalWhatsApp'].forEach(id => { const el = document.getElementById(id); if (el) el.href = 'https://wa.me/' + clean; });
            const whatsappText = document.getElementById('whatsappText');
            if (whatsappText) whatsappText.textContent = s.whatsapp_num;
        }

        // المعرض
        const grid = document.getElementById('galleryGrid');
        if (grid && gallery.length > 0) {
            grid.innerHTML = '';
            gallery.forEach(item => {
                const div = document.createElement('div');
                div.className = 'gallery-item';
                if (item.image_url && item.image_url.trim()) {
                    div.innerHTML = `<img src="${item.image_url}" alt="${escapeHtml(item.caption || '')}"><div class="gallery-caption">${escapeHtml(item.caption || '')}</div>`;
                } else {
                    div.innerHTML = `<div class="gallery-placeholder">${item.emoji || '🏫'}</div><div class="gallery-caption">${escapeHtml(item.caption || '')}</div>`;
                }
                grid.appendChild(div);
            });
        }

        // الأسئلة الشائعة
        const faqList = document.getElementById('faqList');
        if (faqList && faqs.length > 0) {
            faqList.innerHTML = '';
            faqs.forEach(f => {
                const div = document.createElement('div');
                div.className = 'faq-item';
                div.innerHTML = `<div class="faq-q">${escapeHtml(f.question)} <span class="faq-arrow">▾</span></div><div class="faq-a">${escapeHtml(f.answer)}</div>`;
                faqList.appendChild(div);
            });
        }

        initFaqAccordion();
        console.log('✅ تم تحديث الصفحة بالكامل');

    } catch(e) {
        console.error('❌ خطأ في جلب البيانات:', e);
        showToast('⚠️ خطأ في الاتصال بقاعدة البيانات');
    }
}

function manualRefresh() {
    loadSchoolData();
    showToast('✅ تم تحديث الصفحة بنجاح!');
}

function loadDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = 'غير معروف';
    if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Google Chrome';
    else if (ua.includes('Firefox')) browser = 'Mozilla Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Apple Safari';
    else if (ua.includes('Edg')) browser = 'Microsoft Edge';

    let os = 'غير معروف';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS')) os = 'macOS';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS / iPadOS';
    else if (ua.includes('Linux')) os = 'Linux';

    const isMobile = /Mobi|Android/i.test(ua);
    const fields = {
        devBrowser: browser,
        devOS: os,
        devType: isMobile ? '📱 جهاز محمول' : '💻 حاسوب مكتبي / محمول',
        devResolution: `${screen.width} × ${screen.height} بكسل`,
        devLang: navigator.language || 'غير معروف',
        devTZ: Intl.DateTimeFormat().resolvedOptions().timeZone || 'غير معروف',
        devDateTime: new Date().toLocaleString('ar-SA', {dateStyle:'full', timeStyle:'short'})
    };
    for (const [id, val] of Object.entries(fields)) {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    }
}

let autoRefreshInterval;
function startAutoRefresh() {
    if (autoRefreshInterval) clearInterval(autoRefreshInterval);
    autoRefreshInterval = setInterval(loadSchoolData, 10000);
}

loadSchoolData();
loadDeviceInfo();
startAutoRefresh();

console.log('🚀 الصفحة جاهزة - يتم التحديث تلقائياً كل 10 ثواني');
