/**
 * auth.js - ملف المصادقة لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف المصادقة وإدارة المستخدمين
 * مثل تسجيل الدخول، إنشاء حساب، والتحقق من حالة المصادقة
 */

// تهيئة وظائف المصادقة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة وظائف المصادقة
    Auth.init();
});

/**
 * كائن Auth الرئيسي
 */
const Auth = {
    /**
     * تهيئة وظائف المصادقة
     */
    init() {
        // التحقق من نوع الصفحة الحالية
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'login.html') {
            // صفحة تسجيل الدخول
            this.initLoginPage();
            // التحقق من حالة المصادقة (إعادة التوجيه إذا كان المستخدم مسجل الدخول بالفعل)
            UI.checkAuth(false);
        } else if (currentPage === 'signup.html') {
            // صفحة إنشاء حساب
            this.initSignupPage();
            // التحقق من حالة المصادقة (إعادة التوجيه إذا كان المستخدم مسجل الدخول بالفعل)
            UI.checkAuth(false);
        } else {
            // الصفحات الأخرى التي تتطلب تسجيل الدخول
            this.checkAuthState();
        }
    },
    
    /**
     * التحقق من حالة المصادقة
     */
    checkAuthState() {
        // التحقق من وجود رمز المصادقة في التخزين المحلي
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        
        if (!token || !user) {
            // إذا لم يكن المستخدم مسجل الدخول، إعادة التوجيه إلى صفحة تسجيل الدخول
            UI.checkAuth(true);
        } else {
            // إذا كان المستخدم مسجل الدخول، تحديث واجهة المستخدم
            UI.updateUserUI();
        }
    },
    
    /**
     * تهيئة صفحة تسجيل الدخول
     */
    initLoginPage() {
        const loginForm = document.getElementById('loginForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // الحصول على بيانات النموذج
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const rememberMe = document.getElementById('rememberMe')?.checked || false;
                
                // التحقق من صحة البيانات
                if (!email || !password) {
                    UI.showNotification('يرجى إدخال البريد الإلكتروني وكلمة المرور', 'error');
                    return;
                }
                
                // إظهار حالة التحميل
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                const btnText = submitBtn.querySelector('.btn-text');
                const loading = submitBtn.querySelector('.loading');
                
                btnText.classList.add('hidden');
                loading.classList.remove('hidden');
                
                try {
                    // محاولة تسجيل الدخول
                    const response = await API.login(email, password);
                    
                    // عرض رسالة نجاح
                    UI.showNotification('تم تسجيل الدخول بنجاح', 'success');
                    
                    // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد ثانية واحدة
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                } catch (error) {
                    // عرض رسالة الخطأ
                    UI.showNotification(error.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مرة أخرى.', 'error');
                    
                    // إظهار رسالة الخطأ في النموذج
                    const errorElement = document.getElementById('loginError');
                    if (errorElement) {
                        errorElement.textContent = error.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مرة أخرى.';
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
     * تهيئة صفحة إنشاء حساب
     */
    initSignupPage() {
        const signupForm = document.getElementById('signupForm');
        
        if (signupForm) {
            // تهيئة التحقق من قوة كلمة المرور
            this.initPasswordStrength();
            
            // تهيئة التحقق من تطابق كلمات المرور
            this.initPasswordMatch();
            
            // تهيئة التحقق من البريد الإلكتروني
            this.initEmailCheck();
            
            signupForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // الحصول على بيانات النموذج
                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const linkedinUrl = document.getElementById('linkedinUrl').value.trim();
                const termsAgreement = document.getElementById('termsAgreement').checked;
                
                // التحقق من صحة البيانات
                if (!firstName || !lastName || !email || !password || !confirmPassword || !linkedinUrl) {
                    UI.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
                    return;
                }
                
                if (password !== confirmPassword) {
                    UI.showNotification('كلمات المرور غير متطابقة', 'error');
                    document.getElementById('passwordMatchError').classList.remove('hidden');
                    return;
                }
                
                if (!termsAgreement) {
                    UI.showNotification('يرجى الموافقة على شروط الاستخدام وسياسة الخصوصية', 'error');
                    return;
                }
                
                // إظهار حالة التحميل
                const submitBtn = signupForm.querySelector('button[type="submit"]');
                const btnText = submitBtn.querySelector('.btn-text');
                const loading = submitBtn.querySelector('.loading');
                
                btnText.classList.add('hidden');
                loading.classList.remove('hidden');
                
                try {
                    // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
                    const emailExists = await API.checkEmailExists(email);
                    if (emailExists) {
                        throw new Error('البريد الإلكتروني مستخدم بالفعل');
                    }
                    
                    // إنشاء كائن بيانات المستخدم
                    const userData = {
                        firstName,
                        lastName,
                        email,
                        password,
                        linkedinUrl,
                        joinDate: new Date().toISOString()
                    };
                    
                    // محاولة إنشاء حساب
                    const response = await API.signup(userData);
                    
                    // عرض رسالة نجاح
                    UI.showNotification('تم إنشاء الحساب بنجاح', 'success');
                    
                    // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد ثانية واحدة
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                } catch (error) {
                    // عرض رسالة الخطأ
                    UI.showNotification(error.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.', 'error');
                    
                    // إظهار رسالة الخطأ في النموذج
                    const errorElement = document.getElementById('signupError');
                    if (errorElement) {
                        errorElement.textContent = error.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.';
                        errorElement.classList.remove('hidden');
                    }
                    
                    // إظهار خطأ البريد الإلكتروني إذا كان موجودًا بالفعل
                    if (error.message === 'البريد الإلكتروني مستخدم بالفعل') {
                        const emailError = document.getElementById('emailError');
                        if (emailError) {
                            emailError.classList.remove('hidden');
                        }
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
     * تهيئة التحقق من قوة كلمة المرور
     */
    initPasswordStrength() {
        const passwordInput = document.getElementById('password');
        const strengthIndicator = document.querySelector('.password-strength');
        const progressBar = document.querySelector('.password-strength .progress-bar');
        const strengthText = document.querySelector('.password-strength .strength-text');
        
        if (passwordInput && strengthIndicator && progressBar && strengthText) {
            passwordInput.addEventListener('input', function() {
                const password = this.value;
                
                if (password.length === 0) {
                    strengthIndicator.classList.add('hidden');
                    return;
                }
                
                strengthIndicator.classList.remove('hidden');
                
                // حساب قوة كلمة المرور
                const strength = Auth.calculatePasswordStrength(password);
                
                // تحديث شريط التقدم
                progressBar.style.width = `${strength}%`;
                
                // تحديث لون شريط التقدم
                progressBar.className = 'progress-bar';
                if (strength < 30) {
                    progressBar.classList.add('bg-error');
                    strengthText.textContent = 'ضعيفة';
                } else if (strength < 60) {
                    progressBar.classList.add('bg-warning');
                    strengthText.textContent = 'متوسطة';
                } else {
                    progressBar.classList.add('bg-success');
                    strengthText.textContent = 'قوية';
                }
            });
        }
    },
    
    /**
     * حساب قوة كلمة المرور
     * @param {string} password - كلمة المرور
     * @returns {number} - قوة كلمة المرور (0-100)
     */
    calculatePasswordStrength(password) {
        let strength = 0;
        
        // طول كلمة المرور
        if (password.length >= 8) {
            strength += 25;
        } else {
            strength += (password.length / 8) * 25;
        }
        
        // وجود أحرف كبيرة
        if (/[A-Z]/.test(password)) {
            strength += 25;
        }
        
        // وجود أرقام
        if (/[0-9]/.test(password)) {
            strength += 25;
        }
        
        // وجود رموز خاصة
        if (/[^A-Za-z0-9]/.test(password)) {
            strength += 25;
        }
        
        return Math.min(100, strength);
    },
    
    /**
     * تهيئة التحقق من تطابق كلمات المرور
     */
    initPasswordMatch() {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordMatchError = document.getElementById('passwordMatchError');
        
        if (passwordInput && confirmPasswordInput && passwordMatchError) {
            confirmPasswordInput.addEventListener('input', function() {
                if (this.value !== passwordInput.value) {
                    passwordMatchError.classList.remove('hidden');
                } else {
                    passwordMatchError.classList.add('hidden');
                }
            });
            
            passwordInput.addEventListener('input', function() {
                if (confirmPasswordInput.value && this.value !== confirmPasswordInput.value) {
                    passwordMatchError.classList.remove('hidden');
                } else if (confirmPasswordInput.value) {
                    passwordMatchError.classList.add('hidden');
                }
            });
        }
    },
    
    /**
     * تهيئة التحقق من البريد الإلكتروني
     */
    initEmailCheck() {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('emailError');
        
        if (emailInput && emailError) {
            let debounceTimer;
            
            emailInput.addEventListener('input', function() {
                // إخفاء رسالة الخطأ عند الكتابة
                emailError.classList.add('hidden');
                
                // استخدام debounce للتحقق من البريد الإلكتروني بعد توقف المستخدم عن الكتابة
                clearTimeout(debounceTimer);
                
                const email = this.value.trim();
                if (email && this.validity.valid) {
                    debounceTimer = setTimeout(async () => {
                        try {
                            const exists = await API.checkEmailExists(email);
                            if (exists) {
                                emailError.classList.remove('hidden');
                            }
                        } catch (error) {
                            console.error('Email check error:', error);
                        }
                    }, 500);
                }
            });
        }
    }
};

// تصدير كائن Auth للاستخدام في ملفات أخرى
window.Auth = Auth;
