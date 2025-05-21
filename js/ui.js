/**
 * ui.js - ملف واجهة المستخدم لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف واجهة المستخدم العامة المستخدمة في جميع صفحات المنصة
 * مثل التنقل، الإشعارات، والتفاعلات المشتركة
 */

// تهيئة واجهة المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة القائمة المتجاوبة
    initNavbar();
    
    // تهيئة القوائم المنسدلة
    initDropdowns();
    
    // تهيئة التبويبات
    initTabs();
    
    // تهيئة النوافذ المنبثقة
    initModals();
    
    // تهيئة أزرار إظهار/إخفاء كلمة المرور
    initPasswordToggles();
    
    // تهيئة الإشعارات
    initNotifications();
    
    // تهيئة زر تسجيل الخروج
    initLogout();
});

/**
 * تهيئة القائمة المتجاوبة
 */
function initNavbar() {
    const navbarToggler = document.getElementById('navbarToggler');
    const navbarNav = document.getElementById('navbarNav');
    
    if (navbarToggler && navbarNav) {
        navbarToggler.addEventListener('click', function() {
            navbarNav.classList.toggle('show');
        });
        
        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', function(event) {
            if (!navbarNav.contains(event.target) && !navbarToggler.contains(event.target)) {
                navbarNav.classList.remove('show');
            }
        });
    }
}

/**
 * تهيئة القوائم المنسدلة
 */
function initDropdowns() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            const menu = parent.querySelector('.dropdown-menu');
            
            // إغلاق جميع القوائم المنسدلة الأخرى
            document.querySelectorAll('.dropdown-menu').forEach(item => {
                if (item !== menu) {
                    item.classList.remove('show');
                }
            });
            
            // تبديل حالة القائمة الحالية
            menu.classList.toggle('show');
        });
    });
    
    // إغلاق القوائم المنسدلة عند النقر خارجها
    document.addEventListener('click', function(event) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(event.target)) {
                dropdown.querySelector('.dropdown-menu')?.classList.remove('show');
            }
        });
    });
}

/**
 * تهيئة التبويبات
 */
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabId = this.getAttribute('data-tab');
            const tabContainer = this.closest('.tabs');
            const tabContent = document.getElementById(tabId);
            
            if (!tabContainer || !tabContent) return;
            
            // إزالة الفئة النشطة من جميع التبويبات
            tabContainer.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // إزالة الفئة النشطة من جميع محتويات التبويبات
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // إضافة الفئة النشطة للتبويب المحدد ومحتواه
            this.classList.add('active');
            tabContent.classList.add('active');
            
            // تحديث عنوان URL مع معرف التبويب
            history.replaceState(null, null, `#${tabId}`);
        });
    });
    
    // التحقق من وجود تبويب في عنوان URL عند تحميل الصفحة
    if (location.hash) {
        const tabId = location.hash.substring(1);
        const tab = document.querySelector(`.tab[data-tab="${tabId}"]`);
        if (tab) {
            tab.click();
        }
    }
}

/**
 * تهيئة النوافذ المنبثقة
 */
function initModals() {
    // تهيئة أزرار فتح النوافذ المنبثقة
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    // تهيئة أزرار إغلاق النوافذ المنبثقة
    document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            closeModal(modal.id);
        });
    });
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // تهيئة نافذة تعديل الملف الشخصي
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const closeEditProfileModal = document.getElementById('closeEditProfileModal');
    const cancelEditProfile = document.getElementById('cancelEditProfile');
    
    if (editProfileBtn && editProfileModal) {
        editProfileBtn.addEventListener('click', function() {
            openModal('editProfileModal');
        });
    }
    
    if (closeEditProfileModal) {
        closeEditProfileModal.addEventListener('click', function() {
            closeModal('editProfileModal');
        });
    }
    
    if (cancelEditProfile) {
        cancelEditProfile.addEventListener('click', function() {
            closeModal('editProfileModal');
        });
    }
    
    // تهيئة نافذة تأكيد الحذف
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
    const closeDeleteConfirmModal = document.getElementById('closeDeleteConfirmModal');
    const cancelDelete = document.getElementById('cancelDelete');
    
    if (closeDeleteConfirmModal) {
        closeDeleteConfirmModal.addEventListener('click', function() {
            closeModal('deleteConfirmModal');
        });
    }
    
    if (cancelDelete) {
        cancelDelete.addEventListener('click', function() {
            closeModal('deleteConfirmModal');
        });
    }
}

/**
 * فتح نافذة منبثقة
 * @param {string} modalId - معرف النافذة المنبثقة
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.classList.add('overflow-hidden');
        
        // التركيز على أول عنصر قابل للتركيز في النافذة
        setTimeout(() => {
            const focusableElement = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElement) {
                focusableElement.focus();
            }
        }, 100);
    }
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} modalId - معرف النافذة المنبثقة
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.classList.remove('overflow-hidden');
    }
}

/**
 * تهيئة أزرار إظهار/إخفاء كلمة المرور
 */
function initPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

/**
 * تهيئة الإشعارات
 */
function initNotifications() {
    // لا شيء للتهيئة هنا، الإشعارات تُعرض عند استدعاء showNotification()
}

/**
 * عرض إشعار للمستخدم
 * @param {string} message - نص الإشعار
 * @param {string} type - نوع الإشعار (success, error, warning, info)
 * @param {number} duration - مدة ظهور الإشعار بالمللي ثانية
 */
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    
    if (!notification || !notificationText) return;
    
    // إزالة جميع فئات الأنواع السابقة
    notification.classList.remove('notification-success', 'notification-error', 'notification-warning', 'notification-info');
    
    // إضافة فئة النوع الجديد
    notification.classList.add(`notification-${type}`);
    
    // تعيين نص الإشعار
    notificationText.textContent = message;
    
    // عرض الإشعار
    notification.classList.add('show');
    
    // إخفاء الإشعار بعد المدة المحددة
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

/**
 * تهيئة زر تسجيل الخروج
 */
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

/**
 * تسجيل الخروج من المنصة
 */
function logout() {
    // حذف بيانات المستخدم من التخزين المحلي
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // عرض إشعار بنجاح تسجيل الخروج
    showNotification('تم تسجيل الخروج بنجاح', 'success');
    
    // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول بعد ثانية واحدة
    setTimeout(() => {
        window.location.href = '../pages/login.html';
    }, 1000);
}

/**
 * التحقق من حالة تسجيل الدخول
 * @returns {boolean} - ما إذا كان المستخدم مسجل الدخول أم لا
 */
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

/**
 * الحصول على بيانات المستخدم الحالي
 * @returns {Object|null} - بيانات المستخدم أو null إذا لم يكن مسجل الدخول
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * تحديث بيانات المستخدم في واجهة المستخدم
 */
function updateUserUI() {
    const user = getCurrentUser();
    
    if (user) {
        // تحديث اسم المستخدم في القائمة
        const userNameDisplays = document.querySelectorAll('#userNameDisplay');
        userNameDisplays.forEach(element => {
            element.textContent = `${user.firstName} ${user.lastName}`;
        });
        
        // تحديث الصورة الشخصية إذا كانت متوفرة
        if (user.avatar) {
            const avatars = document.querySelectorAll('.avatar-sm');
            avatars.forEach(avatar => {
                avatar.src = user.avatar;
            });
        }
    }
}

/**
 * التحقق من حالة تسجيل الدخول وإعادة التوجيه إذا لزم الأمر
 * @param {boolean} requireAuth - ما إذا كانت الصفحة تتطلب تسجيل الدخول
 * @param {string} redirectUrl - عنوان URL للتوجيه إليه إذا لم يكن المستخدم مسجل الدخول
 */
function checkAuth(requireAuth = true, redirectUrl = '../pages/login.html') {
    const loggedIn = isLoggedIn();
    
    if (requireAuth && !loggedIn) {
        // إذا كانت الصفحة تتطلب تسجيل الدخول والمستخدم غير مسجل
        window.location.href = redirectUrl;
    } else if (!requireAuth && loggedIn) {
        // إذا كانت الصفحة لا تتطلب تسجيل الدخول (مثل صفحة تسجيل الدخول) والمستخدم مسجل بالفعل
        window.location.href = '../index.html';
    } else if (loggedIn) {
        // إذا كان المستخدم مسجل الدخول، تحديث واجهة المستخدم
        updateUserUI();
    }
}

/**
 * تنسيق التاريخ بتنسيق مناسب للعرض
 * @param {string|Date} date - التاريخ المراد تنسيقه
 * @returns {string} - التاريخ المنسق
 */
function formatDate(date) {
    if (!date) return '';
    
    const dateObj = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'اليوم';
    } else if (diffDays === 1) {
        return 'الأمس';
    } else if (diffDays < 7) {
        return `منذ ${diffDays} أيام`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `منذ ${weeks} ${weeks === 1 ? 'أسبوع' : 'أسابيع'}`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `منذ ${months} ${months === 1 ? 'شهر' : 'أشهر'}`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `منذ ${years} ${years === 1 ? 'سنة' : 'سنوات'}`;
    }
}

/**
 * اختصار النص إذا كان طويلاً
 * @param {string} text - النص المراد اختصاره
 * @param {number} maxLength - الحد الأقصى لطول النص
 * @returns {string} - النص المختصر
 */
function truncateText(text, maxLength = 100) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * تحويل النص العادي إلى HTML آمن
 * @param {string} text - النص المراد تحويله
 * @returns {string} - النص المحول
 */
function escapeHTML(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * تحويل النص إلى HTML مع دعم الروابط
 * @param {string} text - النص المراد تحويله
 * @returns {string} - النص المحول مع روابط قابلة للنقر
 */
function linkifyText(text) {
    if (!text) return '';
    
    // تحويل النص إلى HTML آمن أولاً
    const safeText = escapeHTML(text);
    
    // تحويل الروابط إلى عناصر <a>
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return safeText.replace(urlRegex, '<a href="$1" class="clickable-link" target="_blank" rel="noopener noreferrer">$1</a>');
}

// تصدير الوظائف للاستخدام في ملفات أخرى
window.UI = {
    showNotification,
    openModal,
    closeModal,
    isLoggedIn,
    getCurrentUser,
    checkAuth,
    formatDate,
    truncateText,
    escapeHTML,
    linkifyText
};
