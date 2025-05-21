/**
 * quotes.js - ملف إدارة الاقتباسات لمنصة Min Jadeed
 * 
 * هذا الملف يحتوي على وظائف إدارة الاقتباسات
 * مثل عرض الاقتباسات، إضافة اقتباس جديد، تعديل وحذف الاقتباسات
 */

// تهيئة وظائف إدارة الاقتباسات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة وظائف إدارة الاقتباسات
    Quotes.init();
});

/**
 * كائن Quotes الرئيسي
 */
const Quotes = {
    /**
     * تهيئة وظائف إدارة الاقتباسات
     */
    init() {
        // التحقق من نوع الصفحة الحالية
        const currentPage = window.location.pathname.split('/').pop();
        
        if (currentPage === 'new-post.html') {
            // صفحة إضافة اقتباس جديد
            this.initNewPostPage();
        } else if (currentPage === 'profile.html') {
            // صفحة الملف الشخصي (تعرض اقتباسات المستخدم)
            this.initProfilePage();
        } else if (currentPage === 'quote-detail.html') {
            // صفحة تفاصيل الاقتباس
            this.initQuoteDetailPage();
        } else if (currentPage === '' || currentPage === 'index.html') {
            // الصفحة الرئيسية (تعرض أحدث الاقتباسات)
            this.initHomePage();
        }
        
        // تهيئة أزرار الإعجاب والحفظ والمشاركة
        this.initQuoteActions();
    },
    
    /**
     * تهيئة صفحة إضافة اقتباس جديد
     */
    initNewPostPage() {
        const newQuoteForm = document.getElementById('newQuoteForm');
        const quoteTextArea = document.getElementById('quoteText');
        const charCount = document.getElementById('charCount');
        const quotePreview = document.getElementById('quotePreview');
        const previewQuoteText = document.getElementById('previewQuoteText');
        const previewAttribution = document.getElementById('previewAttribution');
        const previewTags = document.getElementById('previewTags');
        const previewUserName = document.getElementById('previewUserName');
        
        // التحقق من حالة تسجيل الدخول
        UI.checkAuth(true);
        
        if (newQuoteForm && quoteTextArea) {
            // تحديث عداد الأحرف عند الكتابة
            quoteTextArea.addEventListener('input', function() {
                const textLength = this.value.length;
                charCount.textContent = textLength;
                
                // تحديث المعاينة
                if (textLength > 0) {
                    quotePreview.classList.remove('hidden');
                    previewQuoteText.textContent = this.value;
                } else {
                    quotePreview.classList.add('hidden');
                }
            });
            
            // تحديث معاينة المؤلف والمصدر
            const quoteAuthorInput = document.getElementById('quoteAuthor');
            const quoteSourceInput = document.getElementById('quoteSource');
            
            if (quoteAuthorInput && quoteSourceInput) {
                const updateAttribution = function() {
                    const author = quoteAuthorInput.value.trim();
                    const source = quoteSourceInput.value.trim();
                    
                    if (author || source) {
                        let attribution = '';
                        
                        if (author) {
                            attribution += author;
                        }
                        
                        if (source) {
                            if (author) {
                                attribution += ` - ${source}`;
                            } else {
                                attribution += source;
                            }
                        }
                        
                        previewAttribution.textContent = attribution;
                        previewAttribution.classList.remove('hidden');
                    } else {
                        previewAttribution.classList.add('hidden');
                    }
                };
                
                quoteAuthorInput.addEventListener('input', updateAttribution);
                quoteSourceInput.addEventListener('input', updateAttribution);
            }
            
            // تحديث معاينة الوسوم
            const quoteTagsInput = document.getElementById('quoteTags');
            
            if (quoteTagsInput) {
                quoteTagsInput.addEventListener('input', function() {
                    const tags = this.value.trim();
                    
                    if (tags) {
                        const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
                        
                        if (tagsArray.length > 0) {
                            previewTags.innerHTML = tagsArray.map(tag => `<span class="tag">${tag}</span>`).join('');
                            previewTags.classList.remove('hidden');
                        } else {
                            previewTags.classList.add('hidden');
                        }
                    } else {
                        previewTags.classList.add('hidden');
                    }
                });
            }
            
            // تحديث اسم المستخدم في المعاينة
            const currentUser = UI.getCurrentUser();
            if (currentUser && previewUserName) {
                previewUserName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
            }
            
            // معالجة إرسال النموذج
            newQuoteForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                // الحصول على بيانات النموذج
                const quoteText = quoteTextArea.value.trim();
                const quoteAuthor = quoteAuthorInput.value.trim();
                const quoteSource = quoteSourceInput.value.trim();
                const quoteTags = quoteTagsInput.value.trim();
                const isOriginal = document.getElementById('originalContent').checked;
                
                // التحقق من صحة البيانات
                if (!quoteText) {
                    UI.showNotification('يرجى إدخال نص الاقتباس', 'error');
                    return;
                }
                
                if (quoteText.length > 500) {
                    UI.showNotification('نص الاقتباس يجب أن لا يتجاوز 500 حرف', 'error');
                    return;
                }
                
                // إظهار حالة التحميل
                const submitBtn = newQuoteForm.querySelector('button[type="submit"]');
                const btnText = submitBtn.querySelector('.btn-text');
                const loading = submitBtn.querySelector('.loading');
                
                btnText.classList.add('hidden');
                loading.classList.remove('hidden');
                
                try {
                    // الحصول على معرف المستخدم الحالي
                    const currentUser = UI.getCurrentUser();
                    
                    if (!currentUser || !currentUser.id) {
                        throw new Error('يجب تسجيل الدخول لإضافة اقتباس');
                    }
                    
                    // إنشاء كائن بيانات الاقتباس
                    const quoteData = {
                        userId: currentUser.id,
                        quoteText,
                        quoteAuthor,
                        quoteSource,
                        quoteTags,
                        originalContent: isOriginal
                    };
                    
                    // إرسال الاقتباس إلى الخادم
                    const response = await API.addQuote(quoteData);
                    
                    // عرض رسالة نجاح
                    UI.showNotification('تم إضافة الاقتباس بنجاح', 'success');
                    
                    // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد ثانية واحدة
                    setTimeout(() => {
                        window.location.href = '../index.html';
                    }, 1000);
                } catch (error) {
                    // عرض رسالة الخطأ
                    UI.showNotification(error.message || 'فشل إضافة الاقتباس. يرجى المحاولة مرة أخرى.', 'error');
                    
                    // إظهار رسالة الخطأ في النموذج
                    const errorElement = document.getElementById('quoteError');
                    if (errorElement) {
                        errorElement.textContent = error.message || 'فشل إضافة الاقتباس. يرجى المحاولة مرة أخرى.';
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
        
        // تحميل اقتباسات المستخدم
        this.loadUserQuotes(userId);
        
        // تحميل الاقتباسات التي أعجب بها المستخدم
        this.loadLikedQuotes(userId);
        
        // تحميل الاقتباسات المحفوظة للمستخدم
        this.loadSavedQuotes(userId);
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
            
            // تحديث حقول نموذج تعديل الملف الشخصي
            const editFirstName = document.getElementById('editFirstName');
            const editLastName = document.getElementById('editLastName');
            const editBio = document.getElementById('editBio');
            const editLinkedin = document.getElementById('editLinkedin');
            
            if (editFirstName) editFirstName.value = user.firstName;
            if (editLastName) editLastName.value = user.lastName;
            if (editBio) editBio.value = user.bio || '';
            if (editLinkedin) editLinkedin.value = user.linkedinUrl || '';
            
            // تهيئة زر تعديل الملف الشخصي
            const saveProfileChanges = document.getElementById('saveProfileChanges');
            
            if (saveProfileChanges) {
                saveProfileChanges.addEventListener('click', async function() {
                    // الحصول على البيانات المحدثة
                    const updatedUserData = {
                        id: userId,
                        firstName: editFirstName.value.trim(),
                        lastName: editLastName.value.trim(),
                        bio: editBio.value.trim(),
                        linkedinUrl: editLinkedin.value.trim()
                    };
                    
                    // التحقق من صحة البيانات
                    if (!updatedUserData.firstName || !updatedUserData.lastName) {
                        UI.showNotification('الاسم الأول والأخير مطلوبان', 'error');
                        return;
                    }
                    
                    // إظهار حالة التحميل
                    const btnText = saveProfileChanges.querySelector('.btn-text');
                    const loading = saveProfileChanges.querySelector('.loading');
                    
                    btnText.classList.add('hidden');
                    loading.classList.remove('hidden');
                    
                    try {
                        // تحديث بيانات المستخدم
                        const response = await API.updateUser(updatedUserData);
                        
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
        } catch (error) {
            console.error('Error loading user profile:', error);
            UI.showNotification(error.message || 'فشل تحميل بيانات المستخدم', 'error');
        }
    },
    
    /**
     * تحميل اقتباسات المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {number} page - رقم الصفحة
     */
    async loadUserQuotes(userId, page = 1) {
        try {
            // الحصول على اقتباسات المستخدم
            const response = await API.getUserQuotes(userId, page);
            
            // تحديث عدد الاقتباسات
            const quotesCount = document.getElementById('quotesCount');
            if (quotesCount) {
                quotesCount.textContent = response.pagination.total;
            }
            
            // عرض الاقتباسات
            const userQuotesContainer = document.getElementById('userQuotes');
            
            if (userQuotesContainer) {
                // مسح المحتوى الحالي
                userQuotesContainer.innerHTML = '';
                
                if (response.quotes.length === 0) {
                    // عرض رسالة إذا لم تكن هناك اقتباسات
                    userQuotesContainer.innerHTML = '<div class="empty-state"><p>لا توجد اقتباسات حتى الآن</p></div>';
                } else {
                    // عرض الاقتباسات
                    response.quotes.forEach(quote => {
                        userQuotesContainer.appendChild(this.createQuoteCard(quote, true));
                    });
                    
                    // تحديث أزرار التنقل بين الصفحات
                    this.updatePagination('quotes', response.pagination);
                }
            }
        } catch (error) {
            console.error('Error loading user quotes:', error);
            UI.showNotification(error.message || 'فشل تحميل اقتباسات المستخدم', 'error');
        }
    },
    
    /**
     * تحميل الاقتباسات التي أعجب بها المستخدم
     * @param {string} userId - معرف المستخدم
     * @param {number} page - رقم الصفحة
     */
    async loadLikedQuotes(userId, page = 1) {
        try {
            // الحصول على الاقتباسات التي أعجب بها المستخدم
            const response = await API.getLikedQuotes(userId, page);
            
            // تحديث عدد الإعجابات
            const likesCount = document.getElementById('likesCount');
            if (likesCount) {
                likesCount.textContent = response.pagination.total;
            }
            
            // عرض الاقتباسات
            const likedQuotesContainer = document.getElementById('likedQuotes');
            
            if (likedQuotesContainer) {
                // مسح المحتوى الحالي
                likedQuotesContainer.innerHTML = '';
                
                if (response.quotes.length === 0) {
                    // عرض رسالة إذا لم تكن هناك اقتباسات
                    likedQuotesContainer.innerHTML = '<div class="empty-state"><p>لا توجد اقتباسات معجب بها حتى الآن</p></div>';
                } else {
                    // عرض الاقتباسات
                    response.quotes.forEach(quote => {
                        likedQuotesContainer.appendChild(this.createQuoteCard(quote, false));
                    });
                    
                    // تحديث أزرار التنقل بين الصفحات
                    this.updatePagination('liked', response.pagination);
                }
            }
        } catch (error) {
            console.error('Error loading liked quotes:', error);
            UI.showNotification(error.message || 'فشل تحميل الاقتباسات المعجب بها', 'error');
        }
    },
    
    /**
     * تحميل الاقتباسات المحفوظة للمستخدم
     * @param {string} userId - معرف المستخدم
     * @param {number} page - رقم الصفحة
     */
    async loadSavedQuotes(userId, page = 1) {
        try {
            // الحصول على الاقتباسات المحفوظة للمستخدم
            const response = await API.getSavedQuotes(userId, page);
            
            // تحديث عدد المحفوظات
            const sharesCount = document.getElementById('sharesCount');
            if (sharesCount) {
                sharesCount.textContent = response.pagination.total;
            }
            
            // عرض الاقتباسات
            const savedQuotesContainer = document.getElementById('savedQuotes');
            
            if (savedQuotesContainer) {
                // مسح المحتوى الحالي
                savedQuotesContainer.innerHTML = '';
                
                if (response.quotes.length === 0) {
                    // عرض رسالة إذا لم تكن هناك اقتباسات
                    savedQuotesContainer.innerHTML = '<div class="empty-state"><p>لا توجد اقتباسات محفوظة حتى الآن</p></div>';
                } else {
                    // عرض الاقتباسات
                    response.quotes.forEach(quote => {
                        savedQuotesContainer.appendChild(this.createQuoteCard(quote, false));
                    });
                    
                    // تحديث أزرار التنقل بين الصفحات
                    this.updatePagination('saved', response.pagination);
                }
            }
        } catch (error) {
            console.error('Error loading saved quotes:', error);
            UI.showNotification(error.message || 'فشل تحميل الاقتباسات المحفوظة', 'error');
        }
    },
    
    /**
     * تحديث أزرار التنقل بين الصفحات
     * @param {string} tabId - معرف التبويب
     * @param {Object} pagination - معلومات التنقل بين الصفحات
     */
    updatePagination(tabId, pagination) {
        const paginationContainer = document.querySelector(`#${tabId} .pagination`);
        
        if (paginationContainer) {
            const prevButton = paginationContainer.querySelector('button:first-child');
            const nextButton = paginationContainer.querySelector('button:last-child');
            const paginationInfo = paginationContainer.querySelector('.pagination-info');
            
            // تحديث معلومات الصفحة
            if (paginationInfo) {
                paginationInfo.textContent = `صفحة ${pagination.page} من ${pagination.totalPages}`;
            }
            
            // تحديث حالة زر الصفحة السابقة
            if (prevButton) {
                if (pagination.page <= 1) {
                    prevButton.disabled = true;
                } else {
                    prevButton.disabled = false;
                    prevButton.onclick = () => {
                        const userId = new URLSearchParams(window.location.search).get('id') || UI.getCurrentUser()?.id;
                        
                        if (tabId === 'quotes') {
                            this.loadUserQuotes(userId, pagination.page - 1);
                        } else if (tabId === 'liked') {
                            this.loadLikedQuotes(userId, pagination.page - 1);
                        } else if (tabId === 'saved') {
                            this.loadSavedQuotes(userId, pagination.page - 1);
                        }
                    };
                }
            }
            
            // تحديث حالة زر الصفحة التالية
            if (nextButton) {
                if (pagination.page >= pagination.totalPages) {
                    nextButton.disabled = true;
                } else {
                    nextButton.disabled = false;
                    nextButton.onclick = () => {
                        const userId = new URLSearchParams(window.location.search).get('id') || UI.getCurrentUser()?.id;
                        
                        if (tabId === 'quotes') {
                            this.loadUserQuotes(userId, pagination.page + 1);
                        } else if (tabId === 'liked') {
                            this.loadLikedQuotes(userId, pagination.page + 1);
                        } else if (tabId === 'saved') {
                            this.loadSavedQuotes(userId, pagination.page + 1);
                        }
                    };
                }
            }
        }
    },
    
    /**
     * تهيئة صفحة تفاصيل الاقتباس
     */
    initQuoteDetailPage() {
        // الحصول على معرف الاقتباس من عنوان URL
        const urlParams = new URLSearchParams(window.location.search);
        const quoteId = urlParams.get('id');
        
        if (!quoteId) {
            UI.showNotification('لم يتم العثور على معرف الاقتباس', 'error');
            return;
        }
        
        // تحميل تفاصيل الاقتباس
        this.loadQuoteDetails(quoteId);
    },
    
    /**
     * تحميل تفاصيل الاقتباس
     * @param {string} quoteId - معرف الاقتباس
     */
    async loadQuoteDetails(quoteId) {
        try {
            // الحصول على تفاصيل الاقتباس
            const response = await API.getQuote(quoteId);
            const quote = response.quote;
            
            if (!quote) {
                throw new Error('لم يتم العثور على الاقتباس');
            }
            
            // تحديث عنوان الصفحة
            document.title = `من جديد - ${quote.text.substring(0, 50)}${quote.text.length > 50 ? '...' : ''}`;
            
            // عرض تفاصيل الاقتباس
            const quoteDetailContainer = document.querySelector('.quote-detail');
            
            if (quoteDetailContainer) {
                // إنشاء عنصر الاقتباس
                const quoteElement = this.createQuoteDetail(quote);
                
                // مسح المحتوى الحالي وإضافة الاقتباس
                quoteDetailContainer.innerHTML = '';
                quoteDetailContainer.appendChild(quoteElement);
            }
        } catch (error) {
            console.error('Error loading quote details:', error);
            UI.showNotification(error.message || 'فشل تحميل تفاصيل الاقتباس', 'error');
        }
    },
    
    /**
     * تهيئة الصفحة الرئيسية
     */
    initHomePage() {
        // تحميل أحدث الاقتباسات
        this.loadLatestQuotes();
    },
    
    /**
     * تحميل أحدث الاقتباسات
     * @param {number} page - رقم الصفحة
     */
    async loadLatestQuotes(page = 1) {
        try {
            // الحصول على أحدث الاقتباسات
            const response = await API.getQuotes({}, page);
            
            // عرض الاقتباسات
            const latestQuotesContainer = document.getElementById('latestQuotes');
            
            if (latestQuotesContainer) {
                // مسح المحتوى الحالي
                latestQuotesContainer.innerHTML = '';
                
                if (response.quotes.length === 0) {
                    // عرض رسالة إذا لم تكن هناك اقتباسات
                    latestQuotesContainer.innerHTML = '<div class="empty-state"><p>لا توجد اقتباسات حتى الآن</p></div>';
                } else {
                    // عرض الاقتباسات
                    response.quotes.forEach(quote => {
                        latestQuotesContainer.appendChild(this.createQuoteCard(quote, false));
                    });
                    
                    // تحديث أزرار التنقل بين الصفحات
                    const paginationContainer = document.querySelector('.pagination');
                    
                    if (paginationContainer) {
                        const prevButton = paginationContainer.querySelector('button:first-child');
                        const nextButton = paginationContainer.querySelector('button:last-child');
                        const paginationInfo = paginationContainer.querySelector('.pagination-info');
                        
                        // تحديث معلومات الصفحة
                        if (paginationInfo) {
                            paginationInfo.textContent = `صفحة ${response.pagination.page} من ${response.pagination.totalPages}`;
                        }
                        
                        // تحديث حالة زر الصفحة السابقة
                        if (prevButton) {
                            if (response.pagination.page <= 1) {
                                prevButton.disabled = true;
                            } else {
                                prevButton.disabled = false;
                                prevButton.onclick = () => {
                                    this.loadLatestQuotes(response.pagination.page - 1);
                                };
                            }
                        }
                        
                        // تحديث حالة زر الصفحة التالية
                        if (nextButton) {
                            if (response.pagination.page >= response.pagination.totalPages) {
                                nextButton.disabled = true;
                            } else {
                                nextButton.disabled = false;
                                nextButton.onclick = () => {
                                    this.loadLatestQuotes(response.pagination.page + 1);
                                };
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading latest quotes:', error);
            UI.showNotification(error.message || 'فشل تحميل أحدث الاقتباسات', 'error');
        }
    },
    
    /**
     * إنشاء بطاقة اقتباس
     * @param {Object} quote - بيانات الاقتباس
     * @param {boolean} isOwner - ما إذا كان المستخدم الحالي هو صاحب الاقتباس
     * @returns {HTMLElement} - عنصر بطاقة الاقتباس
     */
    createQuoteCard(quote, isOwner = false) {
        // إنشاء عنصر البطاقة
        const card = document.createElement('div');
        card.className = 'card quote-card';
        card.dataset.id = quote.id;
        
        // إضافة أزرار التعديل والحذف إذا كان المستخدم هو صاحب الاقتباس
        if (isOwner) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'quote-card-actions';
            
            // زر التعديل
            const editButton = document.createElement('button');
            editButton.className = 'btn-icon';
            editButton.setAttribute('aria-label', 'تعديل');
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', () => {
                this.editQuote(quote.id);
            });
            
            // زر الحذف
            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn-icon';
            deleteButton.setAttribute('aria-label', 'حذف');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => {
                this.confirmDeleteQuote(quote.id);
            });
            
            actionsDiv.appendChild(editButton);
            actionsDiv.appendChild(deleteButton);
            card.appendChild(actionsDiv);
        }
        
        // إضافة رأس البطاقة (معلومات المستخدم)
        const header = document.createElement('div');
        header.className = 'quote-card-header';
        
        // صورة المستخدم
        const avatar = document.createElement('img');
        avatar.className = 'quote-card-avatar';
        avatar.src = quote.user?.avatar || '../img/avatar-default.jpg';
        avatar.alt = 'صورة المستخدم';
        
        // معلومات المستخدم
        const userInfo = document.createElement('div');
        
        // اسم المستخدم
        const authorName = document.createElement('h4');
        authorName.className = 'quote-card-author';
        authorName.textContent = quote.user ? `${quote.user.firstName} ${quote.user.lastName}` : 'مستخدم غير معروف';
        
        // تاريخ النشر
        const date = document.createElement('p');
        date.className = 'text-medium font-sm';
        date.textContent = UI.formatDate(quote.createdAt);
        
        userInfo.appendChild(authorName);
        userInfo.appendChild(date);
        
        header.appendChild(avatar);
        header.appendChild(userInfo);
        
        // إضافة نص الاقتباس
        const text = document.createElement('p');
        text.className = 'card-text';
        text.textContent = quote.text;
        
        // إضافة المؤلف والمصدر إذا كانا موجودين
        if (quote.author || quote.source) {
            const attribution = document.createElement('p');
            attribution.className = 'quote-attribution';
            
            if (quote.author) {
                attribution.textContent = quote.author;
            }
            
            if (quote.source) {
                if (quote.author) {
                    attribution.textContent += ` - ${quote.source}`;
                } else {
                    attribution.textContent = quote.source;
                }
            }
            
            card.appendChild(header);
            card.appendChild(text);
            card.appendChild(attribution);
        } else {
            card.appendChild(header);
            card.appendChild(text);
        }
        
        // إضافة الوسوم إذا كانت موجودة
        if (quote.tags) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'quote-tags';
            
            const tagsArray = quote.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            tagsArray.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsDiv.appendChild(tagSpan);
            });
            
            card.appendChild(tagsDiv);
        }
        
        // إضافة أزرار التفاعل
        const meta = document.createElement('div');
        meta.className = 'quote-card-meta';
        
        // زر الإعجاب
        const likeDiv = document.createElement('div');
        likeDiv.className = 'flex gap-sm items-center';
        
        const likeButton = document.createElement('button');
        likeButton.className = 'btn-icon';
        likeButton.setAttribute('aria-label', 'إعجاب');
        likeButton.innerHTML = `<i class="fa${quote.isLiked ? 's' : 'r'} fa-heart${quote.isLiked ? ' text-primary' : ''}"></i>`;
        likeButton.addEventListener('click', () => {
            this.toggleLike(quote.id, likeButton);
        });
        
        const likesCount = document.createElement('span');
        likesCount.textContent = quote.likesCount || 0;
        
        likeDiv.appendChild(likeButton);
        likeDiv.appendChild(likesCount);
        
        // زر المشاركة
        const shareDiv = document.createElement('div');
        shareDiv.className = 'flex gap-sm items-center';
        
        const shareButton = document.createElement('button');
        shareButton.className = 'btn-icon';
        shareButton.setAttribute('aria-label', 'مشاركة');
        shareButton.innerHTML = `<i class="fa${quote.isSaved ? 's' : 'r'} fa-bookmark${quote.isSaved ? ' text-primary' : ''}"></i>`;
        shareButton.addEventListener('click', () => {
            this.toggleSave(quote.id, shareButton);
        });
        
        const sharesCount = document.createElement('span');
        sharesCount.textContent = quote.savesCount || 0;
        
        shareDiv.appendChild(shareButton);
        shareDiv.appendChild(sharesCount);
        
        meta.appendChild(likeDiv);
        meta.appendChild(shareDiv);
        
        card.appendChild(meta);
        
        // إضافة رابط لصفحة تفاصيل الاقتباس
        card.addEventListener('click', (e) => {
            // تجاهل النقر على الأزرار
            if (e.target.closest('button')) {
                return;
            }
            
            window.location.href = `quote-detail.html?id=${quote.id}`;
        });
        
        return card;
    },
    
    /**
     * إنشاء تفاصيل اقتباس
     * @param {Object} quote - بيانات الاقتباس
     * @returns {HTMLElement} - عنصر تفاصيل الاقتباس
     */
    createQuoteDetail(quote) {
        // إنشاء عنصر التفاصيل
        const detail = document.createElement('div');
        detail.className = 'quote-detail-content';
        
        // إضافة رأس التفاصيل (معلومات المستخدم)
        const header = document.createElement('div');
        header.className = 'quote-detail-header';
        
        // صورة المستخدم
        const avatar = document.createElement('img');
        avatar.className = 'quote-detail-avatar';
        avatar.src = quote.user?.avatar || '../img/avatar-default.jpg';
        avatar.alt = 'صورة المستخدم';
        
        // معلومات المستخدم
        const userInfo = document.createElement('div');
        
        // اسم المستخدم
        const authorName = document.createElement('h3');
        authorName.className = 'quote-detail-author';
        authorName.textContent = quote.user ? `${quote.user.firstName} ${quote.user.lastName}` : 'مستخدم غير معروف';
        
        // تاريخ النشر
        const date = document.createElement('p');
        date.className = 'text-medium';
        date.textContent = UI.formatDate(quote.createdAt);
        
        userInfo.appendChild(authorName);
        userInfo.appendChild(date);
        
        header.appendChild(avatar);
        header.appendChild(userInfo);
        
        // إضافة نص الاقتباس
        const text = document.createElement('p');
        text.className = 'quote-detail-text';
        text.textContent = quote.text;
        
        // إضافة المؤلف والمصدر إذا كانا موجودين
        if (quote.author || quote.source) {
            const attribution = document.createElement('p');
            attribution.className = 'quote-detail-attribution';
            
            if (quote.author) {
                attribution.textContent = quote.author;
            }
            
            if (quote.source) {
                if (quote.author) {
                    attribution.textContent += ` - ${quote.source}`;
                } else {
                    attribution.textContent = quote.source;
                }
            }
            
            detail.appendChild(header);
            detail.appendChild(text);
            detail.appendChild(attribution);
        } else {
            detail.appendChild(header);
            detail.appendChild(text);
        }
        
        // إضافة الوسوم إذا كانت موجودة
        if (quote.tags) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'quote-detail-tags';
            
            const tagsArray = quote.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            
            tagsArray.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsDiv.appendChild(tagSpan);
            });
            
            detail.appendChild(tagsDiv);
        }
        
        // إضافة أزرار التفاعل
        const actions = document.createElement('div');
        actions.className = 'quote-detail-actions';
        
        // زر الإعجاب
        const likeButton = document.createElement('button');
        likeButton.className = 'btn btn-light';
        likeButton.innerHTML = `<i class="fa${quote.isLiked ? 's' : 'r'} fa-heart${quote.isLiked ? ' text-primary' : ''}"></i> <span>${quote.likesCount || 0}</span> إعجاب`;
        likeButton.addEventListener('click', () => {
            this.toggleLike(quote.id, likeButton);
        });
        
        // زر الحفظ
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-light';
        saveButton.innerHTML = `<i class="fa${quote.isSaved ? 's' : 'r'} fa-bookmark${quote.isSaved ? ' text-primary' : ''}"></i> <span>${quote.savesCount || 0}</span> حفظ`;
        saveButton.addEventListener('click', () => {
            this.toggleSave(quote.id, saveButton);
        });
        
        // زر المشاركة
        const shareButton = document.createElement('button');
        shareButton.className = 'btn btn-light';
        shareButton.innerHTML = '<i class="fas fa-share-alt"></i> مشاركة';
        shareButton.addEventListener('click', () => {
            this.shareQuote(quote.id);
        });
        
        actions.appendChild(likeButton);
        actions.appendChild(saveButton);
        actions.appendChild(shareButton);
        
        detail.appendChild(actions);
        
        return detail;
    },
    
    /**
     * تهيئة أزرار الإعجاب والحفظ والمشاركة
     */
    initQuoteActions() {
        // تهيئة نافذة تأكيد الحذف
        const confirmDeleteModal = document.getElementById('deleteConfirmModal');
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        
        if (confirmDeleteModal && confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', async () => {
                const quoteId = confirmDeleteBtn.dataset.quoteId;
                
                if (!quoteId) {
                    UI.showNotification('لم يتم العثور على معرف الاقتباس', 'error');
                    return;
                }
                
                // إظهار حالة التحميل
                const btnText = confirmDeleteBtn.querySelector('.btn-text');
                const loading = confirmDeleteBtn.querySelector('.loading');
                
                btnText.classList.add('hidden');
                loading.classList.remove('hidden');
                
                try {
                    // حذف الاقتباس
                    await API.deleteQuote(quoteId);
                    
                    // عرض رسالة نجاح
                    UI.showNotification('تم حذف الاقتباس بنجاح', 'success');
                    
                    // إغلاق النافذة المنبثقة
                    UI.closeModal('deleteConfirmModal');
                    
                    // إزالة الاقتباس من الصفحة
                    const quoteCard = document.querySelector(`.quote-card[data-id="${quoteId}"]`);
                    if (quoteCard) {
                        quoteCard.remove();
                    }
                    
                    // تحديث عدد الاقتباسات
                    const quotesCount = document.getElementById('quotesCount');
                    if (quotesCount) {
                        const count = parseInt(quotesCount.textContent) - 1;
                        quotesCount.textContent = Math.max(0, count);
                    }
                } catch (error) {
                    // عرض رسالة الخطأ
                    UI.showNotification(error.message || 'فشل حذف الاقتباس. يرجى المحاولة مرة أخرى.', 'error');
                } finally {
                    // إخفاء حالة التحميل
                    btnText.classList.remove('hidden');
                    loading.classList.add('hidden');
                }
            });
        }
    },
    
    /**
     * تبديل حالة الإعجاب باقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @param {HTMLElement} button - زر الإعجاب
     */
    async toggleLike(quoteId, button) {
        try {
            // التحقق من حالة تسجيل الدخول
            if (!UI.isLoggedIn()) {
                UI.showNotification('يجب تسجيل الدخول للإعجاب بالاقتباسات', 'warning');
                setTimeout(() => {
                    window.location.href = '../pages/login.html';
                }, 1000);
                return;
            }
            
            const currentUser = UI.getCurrentUser();
            
            // التحقق من حالة الإعجاب الحالية
            const isLiked = button.querySelector('i').classList.contains('fas');
            
            if (isLiked) {
                // إلغاء الإعجاب
                await API.unlikeQuote(quoteId, currentUser.id);
                
                // تحديث الزر
                button.querySelector('i').classList.remove('fas', 'text-primary');
                button.querySelector('i').classList.add('far');
                
                // تحديث العداد
                const countElement = button.nextElementSibling;
                if (countElement) {
                    const count = parseInt(countElement.textContent) - 1;
                    countElement.textContent = Math.max(0, count);
                }
            } else {
                // إضافة إعجاب
                await API.likeQuote(quoteId, currentUser.id);
                
                // تحديث الزر
                button.querySelector('i').classList.remove('far');
                button.querySelector('i').classList.add('fas', 'text-primary');
                
                // تحديث العداد
                const countElement = button.nextElementSibling;
                if (countElement) {
                    const count = parseInt(countElement.textContent) + 1;
                    countElement.textContent = count;
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            UI.showNotification(error.message || 'فشل تغيير حالة الإعجاب. يرجى المحاولة مرة أخرى.', 'error');
        }
    },
    
    /**
     * تبديل حالة حفظ اقتباس
     * @param {string} quoteId - معرف الاقتباس
     * @param {HTMLElement} button - زر الحفظ
     */
    async toggleSave(quoteId, button) {
        try {
            // التحقق من حالة تسجيل الدخول
            if (!UI.isLoggedIn()) {
                UI.showNotification('يجب تسجيل الدخول لحفظ الاقتباسات', 'warning');
                setTimeout(() => {
                    window.location.href = '../pages/login.html';
                }, 1000);
                return;
            }
            
            const currentUser = UI.getCurrentUser();
            
            // التحقق من حالة الحفظ الحالية
            const isSaved = button.querySelector('i').classList.contains('fas');
            
            if (isSaved) {
                // إلغاء الحفظ
                await API.unsaveQuote(quoteId, currentUser.id);
                
                // تحديث الزر
                button.querySelector('i').classList.remove('fas', 'text-primary');
                button.querySelector('i').classList.add('far');
                
                // تحديث العداد
                const countElement = button.nextElementSibling;
                if (countElement) {
                    const count = parseInt(countElement.textContent) - 1;
                    countElement.textContent = Math.max(0, count);
                }
            } else {
                // إضافة حفظ
                await API.saveQuote(quoteId, currentUser.id);
                
                // تحديث الزر
                button.querySelector('i').classList.remove('far');
                button.querySelector('i').classList.add('fas', 'text-primary');
                
                // تحديث العداد
                const countElement = button.nextElementSibling;
                if (countElement) {
                    const count = parseInt(countElement.textContent) + 1;
                    countElement.textContent = count;
                }
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            UI.showNotification(error.message || 'فشل تغيير حالة الحفظ. يرجى المحاولة مرة أخرى.', 'error');
        }
    },
    
    /**
     * مشاركة اقتباس
     * @param {string} quoteId - معرف الاقتباس
     */
    shareQuote(quoteId) {
        // إنشاء رابط المشاركة
        const shareUrl = `${window.location.origin}/pages/quote-detail.html?id=${quoteId}`;
        
        // التحقق من دعم واجهة برمجة المشاركة
        if (navigator.share) {
            navigator.share({
                title: 'مشاركة اقتباس من منصة من جديد',
                url: shareUrl
            }).catch(error => {
                console.error('Error sharing:', error);
            });
        } else {
            // نسخ الرابط إلى الحافظة
            navigator.clipboard.writeText(shareUrl).then(() => {
                UI.showNotification('تم نسخ رابط الاقتباس إلى الحافظة', 'success');
            }).catch(error => {
                console.error('Error copying to clipboard:', error);
                UI.showNotification('فشل نسخ الرابط. يرجى المحاولة مرة أخرى.', 'error');
            });
        }
    },
    
    /**
     * تعديل اقتباس
     * @param {string} quoteId - معرف الاقتباس
     */
    async editQuote(quoteId) {
        try {
            // الحصول على تفاصيل الاقتباس
            const response = await API.getQuote(quoteId);
            const quote = response.quote;
            
            if (!quote) {
                throw new Error('لم يتم العثور على الاقتباس');
            }
            
            // إنشاء نافذة تعديل الاقتباس
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'editQuoteModal';
            
            modal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h3 class="modal-title">تعديل الاقتباس</h3>
                        <button class="modal-close" id="closeEditQuoteModal" aria-label="إغلاق">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form id="editQuoteForm">
                            <div class="form-group">
                                <label for="editQuoteText" class="form-label">نص الاقتباس</label>
                                <textarea id="editQuoteText" name="quoteText" class="form-control" rows="5" placeholder="اكتب اقتباسك هنا..." required>${quote.text}</textarea>
                                <div class="character-counter">
                                    <span id="editCharCount">${quote.text.length}</span> / 500 حرف
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="editQuoteAuthor" class="form-label">المؤلف (اختياري)</label>
                                <input type="text" id="editQuoteAuthor" name="quoteAuthor" class="form-control" placeholder="اسم مؤلف الاقتباس (إذا كان معروفًا)" value="${quote.author || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="editQuoteSource" class="form-label">المصدر (اختياري)</label>
                                <input type="text" id="editQuoteSource" name="quoteSource" class="form-control" placeholder="مصدر الاقتباس (كتاب، مقال، فيلم، إلخ)" value="${quote.source || ''}">
                            </div>
                            
                            <div class="form-group">
                                <label for="editQuoteTags" class="form-label">الوسوم (اختياري)</label>
                                <input type="text" id="editQuoteTags" name="quoteTags" class="form-control" placeholder="أضف وسومًا مفصولة بفواصل (مثال: حكمة، نجاح، إلهام)" value="${quote.tags || ''}">
                                <div class="form-text">أضف وسومًا لمساعدة الآخرين في العثور على اقتباسك</div>
                            </div>
                            
                            <div class="form-group">
                                <div class="form-check">
                                    <input type="checkbox" id="editOriginalContent" name="originalContent" class="form-check-input" ${quote.isOriginal ? 'checked' : ''}>
                                    <label for="editOriginalContent" class="form-check-label">هذا محتوى أصلي من تأليفي</label>
                                </div>
                            </div>
                            
                            <div id="editQuoteError" class="alert alert-error hidden"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-light" id="cancelEditQuote">إلغاء</button>
                        <button class="btn btn-primary" id="saveQuoteChanges">
                            <span class="btn-text">حفظ التغييرات</span>
                            <span class="loading hidden"></span>
                        </button>
                    </div>
                </div>
            `;
            
            // إضافة النافذة إلى الصفحة
            document.body.appendChild(modal);
            
            // تهيئة عداد الأحرف
            const editQuoteText = document.getElementById('editQuoteText');
            const editCharCount = document.getElementById('editCharCount');
            
            if (editQuoteText && editCharCount) {
                editQuoteText.addEventListener('input', function() {
                    const textLength = this.value.length;
                    editCharCount.textContent = textLength;
                });
            }
            
            // تهيئة أزرار النافذة
            const closeEditQuoteModal = document.getElementById('closeEditQuoteModal');
            const cancelEditQuote = document.getElementById('cancelEditQuote');
            const saveQuoteChanges = document.getElementById('saveQuoteChanges');
            
            // إغلاق النافذة
            const closeModal = () => {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.remove();
                }, 300);
            };
            
            if (closeEditQuoteModal) {
                closeEditQuoteModal.addEventListener('click', closeModal);
            }
            
            if (cancelEditQuote) {
                cancelEditQuote.addEventListener('click', closeModal);
            }
            
            // حفظ التغييرات
            if (saveQuoteChanges) {
                saveQuoteChanges.addEventListener('click', async () => {
                    // الحصول على البيانات المحدثة
                    const updatedQuoteData = {
                        quoteId,
                        quoteText: editQuoteText.value.trim(),
                        quoteAuthor: document.getElementById('editQuoteAuthor').value.trim(),
                        quoteSource: document.getElementById('editQuoteSource').value.trim(),
                        quoteTags: document.getElementById('editQuoteTags').value.trim(),
                        originalContent: document.getElementById('editOriginalContent').checked
                    };
                    
                    // التحقق من صحة البيانات
                    if (!updatedQuoteData.quoteText) {
                        UI.showNotification('نص الاقتباس مطلوب', 'error');
                        return;
                    }
                    
                    if (updatedQuoteData.quoteText.length > 500) {
                        UI.showNotification('نص الاقتباس يجب أن لا يتجاوز 500 حرف', 'error');
                        return;
                    }
                    
                    // إظهار حالة التحميل
                    const btnText = saveQuoteChanges.querySelector('.btn-text');
                    const loading = saveQuoteChanges.querySelector('.loading');
                    
                    btnText.classList.add('hidden');
                    loading.classList.remove('hidden');
                    
                    try {
                        // تحديث الاقتباس
                        await API.updateQuote(quoteId, updatedQuoteData);
                        
                        // عرض رسالة نجاح
                        UI.showNotification('تم تحديث الاقتباس بنجاح', 'success');
                        
                        // إغلاق النافذة المنبثقة
                        closeModal();
                        
                        // تحديث الصفحة لعرض البيانات المحدثة
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } catch (error) {
                        // عرض رسالة الخطأ
                        UI.showNotification(error.message || 'فشل تحديث الاقتباس. يرجى المحاولة مرة أخرى.', 'error');
                        
                        // إظهار رسالة الخطأ في النموذج
                        const errorElement = document.getElementById('editQuoteError');
                        if (errorElement) {
                            errorElement.textContent = error.message || 'فشل تحديث الاقتباس. يرجى المحاولة مرة أخرى.';
                            errorElement.classList.remove('hidden');
                        }
                    } finally {
                        // إخفاء حالة التحميل
                        btnText.classList.remove('hidden');
                        loading.classList.add('hidden');
                    }
                });
            }
            
            // عرض النافذة
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        } catch (error) {
            console.error('Error editing quote:', error);
            UI.showNotification(error.message || 'فشل تحميل بيانات الاقتباس للتعديل', 'error');
        }
    },
    
    /**
     * تأكيد حذف اقتباس
     * @param {string} quoteId - معرف الاقتباس
     */
    confirmDeleteQuote(quoteId) {
        // تهيئة نافذة تأكيد الحذف
        const confirmDeleteModal = document.getElementById('deleteConfirmModal');
        const confirmDeleteBtn = document.getElementById('confirmDelete');
        
        if (confirmDeleteModal && confirmDeleteBtn) {
            // تعيين معرف الاقتباس للزر
            confirmDeleteBtn.dataset.quoteId = quoteId;
            
            // عرض النافذة
            UI.openModal('deleteConfirmModal');
        }
    }
};

// تصدير كائن Quotes للاستخدام في ملفات أخرى
window.Quotes = Quotes;
