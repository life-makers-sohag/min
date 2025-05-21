/**
 * profile.js - ملف إدارة الملف الشخصي لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف إدارة الملف الشخصي للمستخدم
 * مثل عرض وتعديل بيانات المستخدم
 */

// تهيئة وظائف إدارة الملف الشخصي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة وظائف إدارة الملف الشخصي
    Profile.init();
});

/**
 * كائن Profile الرئيسي
 */
const Profile = {
    /**
     * تهيئة وظائف إدارة الملف الشخصي
     */
    init() {
        // التحقق من نوع الصفحة الحالية
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'profile.html') {
            // صفحة الملف الشخصي
            this.initProfilePage();
        }
    },
    
    /**
     * تهيئة صفحة الملف الشخصي
     */
    initProfilePage() {
        // التحقق من حالة تسجيل الدخول
        UI.checkAuth(true);
        
        // الحصول على معرف المستخدم من عنوان URL أو من المستخدم الحالي
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id') || UI.getCurrentUser()?.id;
        
        if (!userId) {
            UI.showNotification('لم يتم العثور على معرف المستخدم', 'error');
            return;
        }
        
        // تحميل بيانات المستخدم
        this.loadUserProfile(userId);
        
        // تهيئة التبويبات
        this.initTabs();
        
        // تهيئة نموذج تعديل الملف الشخصي
        this.initEditProfileForm(userId);
    },
    
    /**
     * تحميل بيانات المستخدم
     * @param {string} userId - معرف المستخدم
     */
    async loadUserProfile(userId) {
        try {
            // الحصول على بيانات المستخدم
            const response = await API.getUser(userId);
            const user = response.user;
            
            if (!user) {
                throw new Error('لم يتم العثور على المستخدم');
            }
            
            // تحديث بيانات المستخدم في الصفحة
            document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
            
            if (user.bio) {
                document.getElementById('profileBio').textContent = user.bio;
            } else {
                document.getElementById('profileBio').textContent = 'لا يوجد نبذة شخصية';
            }
            
            if (user.linkedinUrl) {
                const linkedinLink = document.getElementById('profileLinkedin');
                linkedinLink.href = user.linkedinUrl;
                linkedinLink.classList.remove('hidden');
            }
            
            // تنسيق تاريخ الانضمام
            const joinDate = document.getElementById('joinDate');
            if (joinDate && user.joinDate) {
                const date = new Date(user.joinDate);
                const options = { year: 'numeric', month: 'long' };
                joinDate.textContent = date.toLocaleDateString('ar-EG', options);
            }
            
            // التحقق مما إذا كان المستخدم الحالي هو صاحب الملف الشخصي
            const currentUser = UI.getCurrentUser();
            const isOwner = currentUser && currentUser.id === userId;
            
            // إظهار أو إخفاء زر تعديل الملف الشخصي
            const editProfileBtn = document.getElementById('editProfileBtn');
            if (editProfileBtn) {
                if (isOwner) {
                    editProfileBtn.classList.remove('hidden');
                } else {
                    editProfileBtn.classList.add('hidden');
                }
            }
            
            // تحديث حقول نموذج تعديل الملف الشخصي
            if (isOwner) {
                const editFirstName = document.getElementById('editFirstName');
                const editLastName = document.getElementById('editLastName');
                const editBio = document.getElementById('editBio');
                const editLinkedin = document.getElementById('editLinkedin');
                
                if (editFirstName) editFirstName.value = user.firstName;
                if (editLastName) editLastName.value = user.lastName;
                if (editBio) editBio.value = user.bio || '';
                if (editLinkedin) editLinkedin.value = user.linkedinUrl || '';
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
            UI.showNotification(error.message || 'فشل تحميل بيانات المستخدم', 'error');
        }
    },
    
    /**
     * تهيئة التبويبات
     */
    initTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (tabButtons.length > 0 && tabContents.length > 0) {
            // تهيئة التبويب الأول كنشط افتراضيًا
            tabButtons[0].classList.add('active');
            tabContents[0].classList.add('active');
            
            // إضافة مستمع أحداث لكل زر تبويب
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    // إزالة الفئة النشطة من جميع الأزرار والمحتويات
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    
                    // إضافة الفئة النشطة للزر المحدد
                    button.classList.add('active');
                    
                    // الحصول على معرف التبويب المستهدف
                    const targetId = button.getAttribute('data-tab');
                    
                    // إضافة الفئة النشطة للمحتوى المستهدف
                    document.getElementById(targetId).classList.add('active');
                });
            });
        }
    },
    
    /**
     * تهيئة نموذج تعديل الملف الشخصي
     * @param {string} userId - معرف المستخدم
     */
    initEditProfileForm(userId) {
        const editProfileBtn = document.getElementById('editProfileBtn');
        const editProfileForm = document.getElementById('editProfileForm');
        const saveProfileChanges = document.getElementById('saveProfileChanges');
        
        if (editProfileBtn && editProfileForm && saveProfileChanges) {
            // فتح النافذة المنبثقة عند النقر على زر التعديل
            editProfileBtn.addEventListener('click', () => {
                UI.openModal('editProfileModal');
            });
            
            // معالجة إرسال النموذج
            saveProfileChanges.addEventListener('click', async () => {
                // الحصول على البيانات المحدثة
                const firstName = document.getElementById('editFirstName').value.trim();
                const lastName = document.getElementById('editLastName').value.trim();
                const bio = document.getElementById('editBio').value.trim();
                const linkedinUrl = document.getElementById('editLinkedin').value.trim();
                
                // التحقق من صحة البيانات
                if (!firstName || !lastName) {
                    UI.showNotification('الاسم الأول والأخير مطلوبان', 'error');
                    return;
                }
                
                // التحقق من صحة رابط LinkedIn
                if (linkedinUrl && !this.isValidLinkedinUrl(linkedinUrl)) {
                    UI.showNotification('رابط LinkedIn غير صالح', 'error');
                    return;
                }
                
                // إظهار حالة التحميل
                const btnText = saveProfileChanges.querySelector('.btn-text');
                const loading = saveProfileChanges.querySelector('.loading');
                
                btnText.classList.add('hidden');
                loading.classList.remove('hidden');
                
                try {
                    // تحديث بيانات المستخدم
                    const updatedUserData = {
                        id: userId,
                        firstName,
                        lastName,
                        bio,
                        linkedinUrl
                    };
                    
                    const response = await API.updateUser(updatedUserData);
                    
                    // تحديث بيانات المستخدم المخزنة محليًا
                    const currentUser = UI.getCurrentUser();
                    if (currentUser && currentUser.id === userId) {
                        currentUser.firstName = firstName;
                        currentUser.lastName = lastName;
                        currentUser.bio = bio;
                        currentUser.linkedinUrl = linkedinUrl;
                        
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    }
                    
                    // عرض رسالة نجاح
                    UI.showNotification('تم تحديث الملف الشخصي بنجاح', 'success');
                    
                    // إغلاق النافذة المنبثقة
                    UI.closeModal('editProfileModal');
                    
                    // تحديث الصفحة لعرض البيانات المحدثة
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } catch (error) {
                    // عرض رسالة الخطأ
                    UI.showNotification(error.message || 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.', 'error');
                    
                    // إظهار رسالة الخطأ في النموذج
                    const errorElement = document.getElementById('editProfileError');
                    if (errorElement) {
                        errorElement.textContent = error.message || 'فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.';
                        errorElement.classList.remove('hidden');
                    }
                } finally {
                    // إخفاء حالة التحميل
                    btnText.classList.remove('hidden');
                    loading.classList.add('hidden');
                }
            });
        }
    },
    
    /**
     * التحقق من صحة رابط LinkedIn
     * @param {string} url - رابط LinkedIn
     * @returns {boolean} - ما إذا كان الرابط صالحًا
     */
    isValidLinkedinUrl(url) {
        // التعبير النمطي للتحقق من صحة رابط LinkedIn
        const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i;
        return linkedinRegex.test(url);
    }
};

// تصدير كائن Profile للاستخدام في ملفات أخرى
window.Profile = Profile;
