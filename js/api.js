/**
 * api.js - ملف واجهة برمجة التطبيقات لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف الاتصال بواجهة برمجة التطبيقات (Google Sheets)
 * ويوفر طبقة تجريد للتعامل مع البيانات بين الواجهة الأمامية والخلفية
 */

// عنوان URL لواجهة برمجة التطبيقات (Google Apps Script)
const API_URL = 'https://script.google.com/macros/s/AKfycbzvF0Ya3T-KZpwa5-qAbC9symwGtVSYOTCY3stru9N0fudNgJQ5h4XRL7-q5nfQHXCV7w/exec';

// معرف جدول البيانات
const SHEET_ID = '1gxuf_TWpglt5XnOz5ZKVF14bC7iZ0jrhWSO5cXcvxyg';

/**
 * كائن API الرئيسي
 */
const API = {
    /**
     * إرسال طلب إلى واجهة برمجة التطبيقات
     * @param {string} endpoint - نقطة النهاية للطلب
     * @param {string} method - طريقة الطلب (GET, POST, PUT, DELETE)
     * @param {Object} data - البيانات المرسلة مع الطلب
     * @returns {Promise<Object>} - وعد بالاستجابة
     */
    async request(endpoint, method = 'GET', data = null) {
        try {
            // تحضير عنوان URL للطلب
            let url = new URL(API_URL);
            
            // إضافة معلمات URL الأساسية
            url.searchParams.append('action', endpoint);
            url.searchParams.append('sheetId', SHEET_ID);
            
            // إضافة معلمة الطريقة لتجاوز قيود CORS
            url.searchParams.append('_method', method);
            
            // إضافة رمز المصادقة إذا كان متوفرًا
            const token = localStorage.getItem('token');
            if (token) {
                url.searchParams.append('token', token);
            }
            
            // إضافة البيانات كمعلمات URL للطلبات غير GET
            if (data && method !== 'GET') {
                Object.keys(data).forEach(key => {
                    url.searchParams.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
                });
            }
            
            // إضافة البيانات كمعلمات URL للطلبات GET
            if (data && method === 'GET') {
                Object.keys(data).forEach(key => {
                    url.searchParams.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
                });
            }
            
            console.log(`Sending ${method} request to ${url}`);
            
            // إرسال الطلب
            const response = await fetch(url, {
                method: 'GET', // استخدام GET دائمًا لتجاوز قيود CORS
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors', // استخدام وضع CORS
                cache: 'no-cache'
            });
            
            // التحقق من نجاح الطلب
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // تحليل الاستجابة
            const result = await response.json();
            
            // التحقق من وجود خطأ في الاستجابة
            if (result.error) {
                throw new Error(result.error);
            }
            
            return result;
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            
            // إعادة رمي الخطأ ليتم معالجته في المستدعي
            throw error;
        }
    },
    
    /**
     * تسجيل الدخول
     * @param {string} email - البريد الإلكتروني
     * @param {string} password - كلمة المرور
     * @returns {Promise<Object>} - وعد ببيانات المستخدم
     */
    async login(email, password) {
        try {
            const response = await this.request('login', 'POST', { email, password });
            
            // حفظ بيانات المستخدم ورمز المصادقة في التخزين المحلي
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            
            return response;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    },
    
    /**
     * إنشاء حساب جديد
     * @param {Object} userData - بيانات المستخدم
     * @returns {Promise<Object>} - وعد ببيانات المستخدم
     */
    async signup(userData) {
        try {
            // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
            const emailExists = await this.checkEmailExists(userData.email);
            if (emailExists) {
                throw new Error('البريد الإلكتروني مستخدم بالفعل');
            }
            
            const response = await this.request('signup', 'POST', userData);
            
            // حفظ بيانات المستخدم ورمز المصادقة في التخزين المحلي
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            
            return response;
        } catch (error) {
            console.error('Signup Error:', error);
            throw error;
        }
    },
    
    /**
     * التحقق من وجود بريد إلكتروني
     * @param {string} email - البريد الإلكتروني
     * @returns {Promise<boolean>} - وعد بنتيجة التحقق
     */
    async checkEmailExists(email) {
        try {
            const response = await this.request('checkEmail', 'GET', { email });
            return response.exists;
        } catch (error) {
            console.error('Check Email Error:', error);
            throw error;
        }
    },
    
    /**
     * الحصول على بيانات المستخدم
     * @param {string} userId - معرف المستخدم
     * @returns {Promise<Object>} - وعد ببيانات المستخدم
     */
    async getUser(userId) {
        try {
            return await this.request('getUser', 'GET', { userId });
        } catch (error) {
            console.error('Get User Error:', error);
            throw error;
        }
    },
    
    /**
     * تحديث بيانات المستخدم
     * @param {Object} userData - بيانات المستخدم المحدثة
     * @returns {Promise<Object>} - وعد ببيانات المستخدم المحدثة
     */
    async updateUser(userData) {
        try {
            const response = await this.request('updateUser', 'PUT', userData);
            
            // تحديث بيانات المستخدم في التخزين المحلي
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
            
            return response;
        } catch (error) {
            console.error('Update User Error:', error);
            throw error;
        }
    },
    
    /**
     * الحصول على الاقتباسات
     * @param {Object} filters - مرشحات البحث
     * @param {number} page - رقم الصفحة
     * @param {number} limit - عدد العناصر في الصفحة
     * @returns {Promise<Object>} - وعد بالاقتباسات
     */
    async getQuotes(filters = {}, page = 1, limit = 10) {
        try {
            return await this.request('getQuotes', 'GET', { filters, page, limit });
        } catch (error) {
            console.error('Get Quotes Error:', error);
            throw error;
        }
    },
    
    /**
     * الحصول على اقتباس محدد
     * @param {string} quoteId - معرف الاقتباس
     * @returns {Promise<Object>} - وعد ببيانات الاقتباس
     */
    async getQuote(quoteId) {
        try {
            return await this.request('getQuote', 'GET', { quoteId });
        } catch (error) {
            console.error('Get Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * إضافة اقتباس جديد
     * @param {Object} quoteData - بيانات الاقتباس
     * @returns {Promise<Object>} - وعد ببيانات الاقتباس المضاف
     */
    async addQuote(quoteData) {
        try {
            return await this.request('addQuote', 'POST', quoteData);
        } catch (error) {
            console.error('Add Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * تحديث اقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @param {Object} quoteData - بيانات الاقتباس المحدثة
     * @returns {Promise<Object>} - وعد ببيانات الاقتباس المحدثة
     */
    async updateQuote(quoteId, quoteData) {
        try {
            return await this.request('updateQuote', 'PUT', { quoteId, ...quoteData });
        } catch (error) {
            console.error('Update Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * حذف اقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @returns {Promise<Object>} - وعد بنتيجة الحذف
     */
    async deleteQuote(quoteId) {
        try {
            return await this.request('deleteQuote', 'DELETE', { quoteId });
        } catch (error) {
            console.error('Delete Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * الإعجاب باقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @returns {Promise<Object>} - وعد بنتيجة الإعجاب
     */
    async likeQuote(quoteId) {
        try {
            return await this.request('likeQuote', 'POST', { quoteId });
        } catch (error) {
            console.error('Like Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * إلغاء الإعجاب باقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @returns {Promise<Object>} - وعد بنتيجة إلغاء الإعجاب
     */
    async unlikeQuote(quoteId) {
        try {
            return await this.request('unlikeQuote', 'POST', { quoteId });
        } catch (error) {
            console.error('Unlike Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * حفظ اقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @returns {Promise<Object>} - وعد بنتيجة الحفظ
     */
    async saveQuote(quoteId) {
        try {
            return await this.request('saveQuote', 'POST', { quoteId });
        } catch (error) {
            console.error('Save Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * إلغاء حفظ اقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @returns {Promise<Object>} - وعد بنتيجة إلغاء الحفظ
     */
    async unsaveQuote(quoteId) {
        try {
            return await this.request('unsaveQuote', 'POST', { quoteId });
        } catch (error) {
            console.error('Unsave Quote Error:', error);
            throw error;
        }
    },
    
    /**
     * الحصول على اقتباسات المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {number} page - رقم الصفحة
     * @param {number} limit - عدد العناصر في الصفحة
     * @returns {Promise<Object>} - وعد بالاقتباسات
     */
    async getUserQuotes(userId, page = 1, limit = 10) {
        try {
            return await this.request('getUserQuotes', 'GET', { userId, page, limit });
        } catch (error) {
            console.error('Get User Quotes Error:', error);
            throw error;
        }
    },
    
    /**
     * الحصول على الاقتباسات التي أعجب بها المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {number} page - رقم الصفحة
     * @param {number} limit - عدد العناصر في الصفحة
     * @returns {Promise<Object>} - وعد بالاقتباسات
     */
    async getLikedQuotes(userId, page = 1, limit = 10) {
        try {
            return await this.request('getLikedQuotes', 'GET', { userId, page, limit });
        } catch (error) {
            console.error('Get Liked Quotes Error:', error);
            throw error;
        }
    },
    
    /**
     * الحصول على الاقتباسات المحفوظة للمستخدم
     * @param {string} userId - معرف المستخدم
     * @param {number} page - رقم الصفحة
     * @param {number} limit - عدد العناصر في الصفحة
     * @returns {Promise<Object>} - وعد بالاقتباسات
     */
    async getSavedQuotes(userId, page = 1, limit = 10) {
        try {
            return await this.request('getSavedQuotes', 'GET', { userId, page, limit });
        } catch (error) {
            console.error('Get Saved Quotes Error:', error);
            throw error;
        }
    }
};

// تصدير كائن API للاستخدام في ملفات أخرى
window.API = API;
