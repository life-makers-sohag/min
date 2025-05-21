/**
 * Google Apps Script لربط منصة Min Jadeed مع Google Sheets
 * 
 * هذا الملف يحتوي على كود Google Apps Script الذي يربط منصة Min Jadeed مع Google Sheets
 * ويوفر واجهة برمجة تطبيقات (API) للتعامل مع بيانات المستخدمين والاقتباسات
 * 
 * النسخة: 2.0.0
 * تاريخ التحديث: 21 مايو 2025
 */

// معرف جدول البيانات - يجب تحديثه بمعرف جدول البيانات الخاص بك
const SPREADSHEET_ID = '1gxuf_TWpglt5XnOz5ZKVF14bC7iZ0jrhWSO5cXcvxyg';

// أسماء أوراق البيانات
const SHEETS = {
  USERS: 'المستخدمين',
  QUOTES: 'الاقتباسات',
  LIKES: 'الإعجابات',
  SAVES: 'المحفوظات',
  COMMENTS: 'التعليقات'
};

// أعمدة جدول المستخدمين
const USER_COLUMNS = {
  ID: 0,
  EMAIL: 1,
  PASSWORD: 2,
  NAME: 3,
  BIO: 4,
  LINKEDIN: 5,
  AVATAR: 6,
  CREATED_AT: 7,
  UPDATED_AT: 8
};

// أعمدة جدول الاقتباسات
const QUOTE_COLUMNS = {
  ID: 0,
  USER_ID: 1,
  CONTENT: 2,
  SOURCE: 3,
  TAGS: 4,
  LIKES_COUNT: 5,
  SAVES_COUNT: 6,
  COMMENTS_COUNT: 7,
  CREATED_AT: 8,
  UPDATED_AT: 9
};

/**
 * نقطة الدخول الرئيسية للطلبات - تعالج جميع طلبات GET
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function doGet(e) {
  try {
    Logger.log("GET Request: " + JSON.stringify(e));
    
    // التحقق من وجود معلمات الطلب
    if (!e || !e.parameter) {
      return createJsonResponse({ success: false, error: "طلب غير صالح" });
    }
    
    // استخراج طريقة الطلب الأصلية من معلمة _method
    const method = e.parameter._method || 'GET';
    
    // توجيه الطلب بناءً على الإجراء المطلوب
    const action = e.parameter.action;
    
    if (!action) {
      return createJsonResponse({ success: false, error: "الإجراء مطلوب" });
    }
    
    // معالجة الطلب بناءً على الطريقة والإجراء
    switch (method.toUpperCase()) {
      case 'GET':
        return handleGetRequest(action, e.parameter);
      case 'POST':
        return handlePostRequest(action, e.parameter);
      case 'PUT':
        return handlePutRequest(action, e.parameter);
      case 'DELETE':
        return handleDeleteRequest(action, e.parameter);
      default:
        return createJsonResponse({ success: false, error: "طريقة غير مدعومة" });
    }
  } catch (error) {
    Logger.log("Error in doGet: " + error.toString());
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

/**
 * معالجة طلبات OPTIONS - مطلوبة لدعم CORS
 * @returns {Object} - استجابة فارغة مع رؤوس CORS
 */
function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * معالجة طلبات GET
 * @param {string} action - الإجراء المطلوب
 * @param {Object} params - معلمات الطلب
 * @returns {Object} - استجابة JSON
 */
function handleGetRequest(action, params) {
  Logger.log("Handling GET request: " + action);
  
  switch (action) {
    case 'getUser':
      return getUserById(params.id);
    case 'getUserByEmail':
      return getUserByEmail(params.email);
    case 'getQuotes':
      return getQuotes(params.limit, params.offset);
    case 'getUserQuotes':
      return getUserQuotes(params.userId);
    case 'getQuote':
      return getQuoteById(params.id);
    default:
      return createJsonResponse({ success: false, error: "إجراء غير معروف: " + action });
  }
}

/**
 * معالجة طلبات POST
 * @param {string} action - الإجراء المطلوب
 * @param {Object} params - معلمات الطلب
 * @returns {Object} - استجابة JSON
 */
function handlePostRequest(action, params) {
  Logger.log("Handling POST request: " + action);
  
  switch (action) {
    case 'createUser':
      return createUser(params);
    case 'login':
      return login(params.email, params.password);
    case 'createQuote':
      return createQuote(params);
    case 'likeQuote':
      return likeQuote(params.userId, params.quoteId);
    case 'saveQuote':
      return saveQuote(params.userId, params.quoteId);
    default:
      return createJsonResponse({ success: false, error: "إجراء غير معروف: " + action });
  }
}

/**
 * معالجة طلبات PUT
 * @param {string} action - الإجراء المطلوب
 * @param {Object} params - معلمات الطلب
 * @returns {Object} - استجابة JSON
 */
function handlePutRequest(action, params) {
  Logger.log("Handling PUT request: " + action);
  
  switch (action) {
    case 'updateUser':
      return updateUser(params);
    case 'updateQuote':
      return updateQuote(params);
    default:
      return createJsonResponse({ success: false, error: "إجراء غير معروف: " + action });
  }
}

/**
 * معالجة طلبات DELETE
 * @param {string} action - الإجراء المطلوب
 * @param {Object} params - معلمات الطلب
 * @returns {Object} - استجابة JSON
 */
function handleDeleteRequest(action, params) {
  Logger.log("Handling DELETE request: " + action);
  
  switch (action) {
    case 'deleteQuote':
      return deleteQuote(params.id, params.userId);
    case 'unlikeQuote':
      return unlikeQuote(params.userId, params.quoteId);
    case 'unsaveQuote':
      return unsaveQuote(params.userId, params.quoteId);
    default:
      return createJsonResponse({ success: false, error: "إجراء غير معروف: " + action });
  }
}

/**
 * إنشاء مستخدم جديد
 * @param {Object} userData - بيانات المستخدم
 * @returns {Object} - استجابة JSON
 */
function createUser(userData) {
  try {
    Logger.log("Creating user: " + JSON.stringify(userData));
    
    // التحقق من البيانات المطلوبة
    if (!userData.email || !userData.password || !userData.name) {
      return createJsonResponse({ 
        success: false, 
        error: "البريد الإلكتروني وكلمة المرور والاسم مطلوبة" 
      });
    }
    
    // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
    const existingUser = findUserByEmail(userData.email);
    if (existingUser) {
      return createJsonResponse({ 
        success: false, 
        error: "البريد الإلكتروني مستخدم بالفعل" 
      });
    }
    
    // الحصول على جدول البيانات وورقة المستخدمين
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    if (!usersSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة المستخدمين غير موجودة" 
      });
    }
    
    // إنشاء معرف فريد للمستخدم
    const userId = Utilities.getUuid();
    
    // تحضير بيانات المستخدم للإدخال
    const now = new Date().toISOString();
    const userRow = [
      userId,
      userData.email,
      userData.password, // ملاحظة: في بيئة الإنتاج، يجب تشفير كلمة المرور
      userData.name,
      userData.bio || "",
      userData.linkedin || "",
      userData.avatar || "",
      now,
      now
    ];
    
    // إضافة المستخدم إلى جدول البيانات
    usersSheet.appendRow(userRow);
    
    // إعادة بيانات المستخدم (بدون كلمة المرور)
    const user = {
      id: userId,
      email: userData.email,
      name: userData.name,
      bio: userData.bio || "",
      linkedin: userData.linkedin || "",
      avatar: userData.avatar || "",
      createdAt: now,
      updatedAt: now
    };
    
    return createJsonResponse({ 
      success: true, 
      message: "تم إنشاء المستخدم بنجاح", 
      user: user 
    });
  } catch (error) {
    Logger.log("Error creating user: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء إنشاء المستخدم: " + error.toString() 
    });
  }
}

/**
 * تسجيل دخول المستخدم
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @returns {Object} - استجابة JSON
 */
function login(email, password) {
  try {
    Logger.log("Login attempt for: " + email);
    
    // التحقق من البيانات المطلوبة
    if (!email || !password) {
      return createJsonResponse({ 
        success: false, 
        error: "البريد الإلكتروني وكلمة المرور مطلوبة" 
      });
    }
    
    // البحث عن المستخدم بالبريد الإلكتروني
    const user = findUserByEmail(email);
    
    // التحقق من وجود المستخدم وصحة كلمة المرور
    if (!user || user[USER_COLUMNS.PASSWORD] !== password) {
      return createJsonResponse({ 
        success: false, 
        error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" 
      });
    }
    
    // إعداد بيانات المستخدم للإرجاع (بدون كلمة المرور)
    const userData = {
      id: user[USER_COLUMNS.ID],
      email: user[USER_COLUMNS.EMAIL],
      name: user[USER_COLUMNS.NAME],
      bio: user[USER_COLUMNS.BIO],
      linkedin: user[USER_COLUMNS.LINKEDIN],
      avatar: user[USER_COLUMNS.AVATAR],
      createdAt: user[USER_COLUMNS.CREATED_AT],
      updatedAt: user[USER_COLUMNS.UPDATED_AT]
    };
    
    return createJsonResponse({ 
      success: true, 
      message: "تم تسجيل الدخول بنجاح", 
      user: userData 
    });
  } catch (error) {
    Logger.log("Error during login: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء تسجيل الدخول: " + error.toString() 
    });
  }
}

/**
 * تحديث بيانات المستخدم
 * @param {Object} userData - بيانات المستخدم المحدثة
 * @returns {Object} - استجابة JSON
 */
function updateUser(userData) {
  try {
    Logger.log("Updating user: " + JSON.stringify(userData));
    
    // التحقق من البيانات المطلوبة
    if (!userData.id) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم مطلوب" 
      });
    }
    
    // الحصول على جدول البيانات وورقة المستخدمين
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    if (!usersSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة المستخدمين غير موجودة" 
      });
    }
    
    // البحث عن المستخدم
    const userRowIndex = findUserRowIndexById(userData.id);
    
    if (userRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "المستخدم غير موجود" 
      });
    }
    
    // الحصول على بيانات المستخدم الحالية
    const userRange = usersSheet.getRange(userRowIndex, 1, 1, 9);
    const userValues = userRange.getValues()[0];
    
    // إذا تم تغيير البريد الإلكتروني، تحقق من عدم وجود مستخدم آخر بنفس البريد
    if (userData.email && userData.email !== userValues[USER_COLUMNS.EMAIL]) {
      const existingUser = findUserByEmail(userData.email);
      if (existingUser && existingUser[USER_COLUMNS.ID] !== userData.id) {
        return createJsonResponse({ 
          success: false, 
          error: "البريد الإلكتروني مستخدم بالفعل" 
        });
      }
    }
    
    // تحديث بيانات المستخدم
    const now = new Date().toISOString();
    userValues[USER_COLUMNS.EMAIL] = userData.email || userValues[USER_COLUMNS.EMAIL];
    userValues[USER_COLUMNS.NAME] = userData.name || userValues[USER_COLUMNS.NAME];
    userValues[USER_COLUMNS.BIO] = userData.bio !== undefined ? userData.bio : userValues[USER_COLUMNS.BIO];
    userValues[USER_COLUMNS.LINKEDIN] = userData.linkedin !== undefined ? userData.linkedin : userValues[USER_COLUMNS.LINKEDIN];
    userValues[USER_COLUMNS.AVATAR] = userData.avatar || userValues[USER_COLUMNS.AVATAR];
    userValues[USER_COLUMNS.UPDATED_AT] = now;
    
    // إذا تم توفير كلمة مرور جديدة، قم بتحديثها
    if (userData.password) {
      userValues[USER_COLUMNS.PASSWORD] = userData.password;
    }
    
    // حفظ البيانات المحدثة
    userRange.setValues([userValues]);
    
    // إعداد بيانات المستخدم للإرجاع (بدون كلمة المرور)
    const updatedUser = {
      id: userValues[USER_COLUMNS.ID],
      email: userValues[USER_COLUMNS.EMAIL],
      name: userValues[USER_COLUMNS.NAME],
      bio: userValues[USER_COLUMNS.BIO],
      linkedin: userValues[USER_COLUMNS.LINKEDIN],
      avatar: userValues[USER_COLUMNS.AVATAR],
      createdAt: userValues[USER_COLUMNS.CREATED_AT],
      updatedAt: now
    };
    
    return createJsonResponse({ 
      success: true, 
      message: "تم تحديث بيانات المستخدم بنجاح", 
      user: updatedUser 
    });
  } catch (error) {
    Logger.log("Error updating user: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء تحديث بيانات المستخدم: " + error.toString() 
    });
  }
}

/**
 * الحصول على بيانات المستخدم بواسطة المعرف
 * @param {string} id - معرف المستخدم
 * @returns {Object} - استجابة JSON
 */
function getUserById(id) {
  try {
    Logger.log("Getting user by ID: " + id);
    
    if (!id) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم مطلوب" 
      });
    }
    
    // البحث عن المستخدم
    const user = findUserById(id);
    
    if (!user) {
      return createJsonResponse({ 
        success: false, 
        error: "المستخدم غير موجود" 
      });
    }
    
    // إعداد بيانات المستخدم للإرجاع (بدون كلمة المرور)
    const userData = {
      id: user[USER_COLUMNS.ID],
      email: user[USER_COLUMNS.EMAIL],
      name: user[USER_COLUMNS.NAME],
      bio: user[USER_COLUMNS.BIO],
      linkedin: user[USER_COLUMNS.LINKEDIN],
      avatar: user[USER_COLUMNS.AVATAR],
      createdAt: user[USER_COLUMNS.CREATED_AT],
      updatedAt: user[USER_COLUMNS.UPDATED_AT]
    };
    
    return createJsonResponse({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    Logger.log("Error getting user by ID: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء الحصول على بيانات المستخدم: " + error.toString() 
    });
  }
}

/**
 * الحصول على بيانات المستخدم بواسطة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {Object} - استجابة JSON
 */
function getUserByEmail(email) {
  try {
    Logger.log("Getting user by email: " + email);
    
    if (!email) {
      return createJsonResponse({ 
        success: false, 
        error: "البريد الإلكتروني مطلوب" 
      });
    }
    
    // البحث عن المستخدم
    const user = findUserByEmail(email);
    
    if (!user) {
      return createJsonResponse({ 
        success: false, 
        error: "المستخدم غير موجود" 
      });
    }
    
    // إعداد بيانات المستخدم للإرجاع (بدون كلمة المرور)
    const userData = {
      id: user[USER_COLUMNS.ID],
      email: user[USER_COLUMNS.EMAIL],
      name: user[USER_COLUMNS.NAME],
      bio: user[USER_COLUMNS.BIO],
      linkedin: user[USER_COLUMNS.LINKEDIN],
      avatar: user[USER_COLUMNS.AVATAR],
      createdAt: user[USER_COLUMNS.CREATED_AT],
      updatedAt: user[USER_COLUMNS.UPDATED_AT]
    };
    
    return createJsonResponse({ 
      success: true, 
      user: userData 
    });
  } catch (error) {
    Logger.log("Error getting user by email: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء الحصول على بيانات المستخدم: " + error.toString() 
    });
  }
}

/**
 * إنشاء اقتباس جديد
 * @param {Object} quoteData - بيانات الاقتباس
 * @returns {Object} - استجابة JSON
 */
function createQuote(quoteData) {
  try {
    Logger.log("Creating quote: " + JSON.stringify(quoteData));
    
    // التحقق من البيانات المطلوبة
    if (!quoteData.userId || !quoteData.content) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم ومحتوى الاقتباس مطلوبان" 
      });
    }
    
    // التحقق من وجود المستخدم
    const user = findUserById(quoteData.userId);
    if (!user) {
      return createJsonResponse({ 
        success: false, 
        error: "المستخدم غير موجود" 
      });
    }
    
    // الحصول على جدول البيانات وورقة الاقتباسات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // إنشاء معرف فريد للاقتباس
    const quoteId = Utilities.getUuid();
    
    // تحضير بيانات الاقتباس للإدخال
    const now = new Date().toISOString();
    const quoteRow = [
      quoteId,
      quoteData.userId,
      quoteData.content,
      quoteData.source || "",
      quoteData.tags || "",
      0, // عدد الإعجابات
      0, // عدد المحفوظات
      0, // عدد التعليقات
      now,
      now
    ];
    
    // إضافة الاقتباس إلى جدول البيانات
    quotesSheet.appendRow(quoteRow);
    
    // إعداد بيانات الاقتباس للإرجاع
    const quote = {
      id: quoteId,
      userId: quoteData.userId,
      userName: user[USER_COLUMNS.NAME],
      userAvatar: user[USER_COLUMNS.AVATAR],
      content: quoteData.content,
      source: quoteData.source || "",
      tags: quoteData.tags || "",
      likesCount: 0,
      savesCount: 0,
      commentsCount: 0,
      createdAt: now,
      updatedAt: now
    };
    
    return createJsonResponse({ 
      success: true, 
      message: "تم إنشاء الاقتباس بنجاح", 
      quote: quote 
    });
  } catch (error) {
    Logger.log("Error creating quote: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء إنشاء الاقتباس: " + error.toString() 
    });
  }
}

/**
 * الحصول على الاقتباسات
 * @param {number} limit - عدد الاقتباسات المطلوبة
 * @param {number} offset - بداية الاقتباسات
 * @returns {Object} - استجابة JSON
 */
function getQuotes(limit, offset) {
  try {
    // تحويل المعلمات إلى أرقام
    limit = limit ? parseInt(limit) : 10;
    offset = offset ? parseInt(offset) : 0;
    
    Logger.log("Getting quotes with limit: " + limit + ", offset: " + offset);
    
    // الحصول على جدول البيانات وورقة الاقتباسات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // الحصول على جميع بيانات الاقتباسات
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // إزالة الصف الأول (العناوين)
    quotesData.shift();
    
    // ترتيب الاقتباسات حسب تاريخ الإنشاء (من الأحدث إلى الأقدم)
    quotesData.sort((a, b) => new Date(b[QUOTE_COLUMNS.CREATED_AT]) - new Date(a[QUOTE_COLUMNS.CREATED_AT]));
    
    // تطبيق الحد والإزاحة
    const paginatedQuotes = quotesData.slice(offset, offset + limit);
    
    // تحويل بيانات الاقتباسات إلى تنسيق JSON
    const quotes = paginatedQuotes.map(quote => {
      // الحصول على بيانات المستخدم
      const user = findUserById(quote[QUOTE_COLUMNS.USER_ID]);
      
      return {
        id: quote[QUOTE_COLUMNS.ID],
        userId: quote[QUOTE_COLUMNS.USER_ID],
        userName: user ? user[USER_COLUMNS.NAME] : "مستخدم غير معروف",
        userAvatar: user ? user[USER_COLUMNS.AVATAR] : "",
        content: quote[QUOTE_COLUMNS.CONTENT],
        source: quote[QUOTE_COLUMNS.SOURCE],
        tags: quote[QUOTE_COLUMNS.TAGS],
        likesCount: quote[QUOTE_COLUMNS.LIKES_COUNT],
        savesCount: quote[QUOTE_COLUMNS.SAVES_COUNT],
        commentsCount: quote[QUOTE_COLUMNS.COMMENTS_COUNT],
        createdAt: quote[QUOTE_COLUMNS.CREATED_AT],
        updatedAt: quote[QUOTE_COLUMNS.UPDATED_AT]
      };
    });
    
    return createJsonResponse({ 
      success: true, 
      quotes: quotes,
      total: quotesData.length,
      limit: limit,
      offset: offset
    });
  } catch (error) {
    Logger.log("Error getting quotes: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء الحصول على الاقتباسات: " + error.toString() 
    });
  }
}

/**
 * الحصول على اقتباسات المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - استجابة JSON
 */
function getUserQuotes(userId) {
  try {
    Logger.log("Getting quotes for user: " + userId);
    
    if (!userId) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم مطلوب" 
      });
    }
    
    // التحقق من وجود المستخدم
    const user = findUserById(userId);
    if (!user) {
      return createJsonResponse({ 
        success: false, 
        error: "المستخدم غير موجود" 
      });
    }
    
    // الحصول على جدول البيانات وورقة الاقتباسات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // الحصول على جميع بيانات الاقتباسات
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // إزالة الصف الأول (العناوين)
    quotesData.shift();
    
    // تصفية الاقتباسات حسب معرف المستخدم
    const userQuotes = quotesData.filter(quote => quote[QUOTE_COLUMNS.USER_ID] === userId);
    
    // ترتيب الاقتباسات حسب تاريخ الإنشاء (من الأحدث إلى الأقدم)
    userQuotes.sort((a, b) => new Date(b[QUOTE_COLUMNS.CREATED_AT]) - new Date(a[QUOTE_COLUMNS.CREATED_AT]));
    
    // تحويل بيانات الاقتباسات إلى تنسيق JSON
    const quotes = userQuotes.map(quote => {
      return {
        id: quote[QUOTE_COLUMNS.ID],
        userId: quote[QUOTE_COLUMNS.USER_ID],
        userName: user[USER_COLUMNS.NAME],
        userAvatar: user[USER_COLUMNS.AVATAR],
        content: quote[QUOTE_COLUMNS.CONTENT],
        source: quote[QUOTE_COLUMNS.SOURCE],
        tags: quote[QUOTE_COLUMNS.TAGS],
        likesCount: quote[QUOTE_COLUMNS.LIKES_COUNT],
        savesCount: quote[QUOTE_COLUMNS.SAVES_COUNT],
        commentsCount: quote[QUOTE_COLUMNS.COMMENTS_COUNT],
        createdAt: quote[QUOTE_COLUMNS.CREATED_AT],
        updatedAt: quote[QUOTE_COLUMNS.UPDATED_AT]
      };
    });
    
    return createJsonResponse({ 
      success: true, 
      quotes: quotes
    });
  } catch (error) {
    Logger.log("Error getting user quotes: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء الحصول على اقتباسات المستخدم: " + error.toString() 
    });
  }
}

/**
 * الحصول على اقتباس بواسطة المعرف
 * @param {string} id - معرف الاقتباس
 * @returns {Object} - استجابة JSON
 */
function getQuoteById(id) {
  try {
    Logger.log("Getting quote by ID: " + id);
    
    if (!id) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف الاقتباس مطلوب" 
      });
    }
    
    // البحث عن الاقتباس
    const quote = findQuoteById(id);
    
    if (!quote) {
      return createJsonResponse({ 
        success: false, 
        error: "الاقتباس غير موجود" 
      });
    }
    
    // الحصول على بيانات المستخدم
    const user = findUserById(quote[QUOTE_COLUMNS.USER_ID]);
    
    // إعداد بيانات الاقتباس للإرجاع
    const quoteData = {
      id: quote[QUOTE_COLUMNS.ID],
      userId: quote[QUOTE_COLUMNS.USER_ID],
      userName: user ? user[USER_COLUMNS.NAME] : "مستخدم غير معروف",
      userAvatar: user ? user[USER_COLUMNS.AVATAR] : "",
      content: quote[QUOTE_COLUMNS.CONTENT],
      source: quote[QUOTE_COLUMNS.SOURCE],
      tags: quote[QUOTE_COLUMNS.TAGS],
      likesCount: quote[QUOTE_COLUMNS.LIKES_COUNT],
      savesCount: quote[QUOTE_COLUMNS.SAVES_COUNT],
      commentsCount: quote[QUOTE_COLUMNS.COMMENTS_COUNT],
      createdAt: quote[QUOTE_COLUMNS.CREATED_AT],
      updatedAt: quote[QUOTE_COLUMNS.UPDATED_AT]
    };
    
    return createJsonResponse({ 
      success: true, 
      quote: quoteData 
    });
  } catch (error) {
    Logger.log("Error getting quote by ID: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء الحصول على الاقتباس: " + error.toString() 
    });
  }
}

/**
 * تحديث اقتباس
 * @param {Object} quoteData - بيانات الاقتباس المحدثة
 * @returns {Object} - استجابة JSON
 */
function updateQuote(quoteData) {
  try {
    Logger.log("Updating quote: " + JSON.stringify(quoteData));
    
    // التحقق من البيانات المطلوبة
    if (!quoteData.id || !quoteData.userId) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف الاقتباس ومعرف المستخدم مطلوبان" 
      });
    }
    
    // الحصول على جدول البيانات وورقة الاقتباسات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // البحث عن الاقتباس
    const quoteRowIndex = findQuoteRowIndexById(quoteData.id);
    
    if (quoteRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "الاقتباس غير موجود" 
      });
    }
    
    // الحصول على بيانات الاقتباس الحالية
    const quoteRange = quotesSheet.getRange(quoteRowIndex, 1, 1, 10);
    const quoteValues = quoteRange.getValues()[0];
    
    // التحقق من أن المستخدم هو صاحب الاقتباس
    if (quoteValues[QUOTE_COLUMNS.USER_ID] !== quoteData.userId) {
      return createJsonResponse({ 
        success: false, 
        error: "غير مسموح لك بتحديث هذا الاقتباس" 
      });
    }
    
    // تحديث بيانات الاقتباس
    const now = new Date().toISOString();
    quoteValues[QUOTE_COLUMNS.CONTENT] = quoteData.content || quoteValues[QUOTE_COLUMNS.CONTENT];
    quoteValues[QUOTE_COLUMNS.SOURCE] = quoteData.source !== undefined ? quoteData.source : quoteValues[QUOTE_COLUMNS.SOURCE];
    quoteValues[QUOTE_COLUMNS.TAGS] = quoteData.tags !== undefined ? quoteData.tags : quoteValues[QUOTE_COLUMNS.TAGS];
    quoteValues[QUOTE_COLUMNS.UPDATED_AT] = now;
    
    // حفظ البيانات المحدثة
    quoteRange.setValues([quoteValues]);
    
    // الحصول على بيانات المستخدم
    const user = findUserById(quoteData.userId);
    
    // إعداد بيانات الاقتباس للإرجاع
    const updatedQuote = {
      id: quoteValues[QUOTE_COLUMNS.ID],
      userId: quoteValues[QUOTE_COLUMNS.USER_ID],
      userName: user ? user[USER_COLUMNS.NAME] : "مستخدم غير معروف",
      userAvatar: user ? user[USER_COLUMNS.AVATAR] : "",
      content: quoteValues[QUOTE_COLUMNS.CONTENT],
      source: quoteValues[QUOTE_COLUMNS.SOURCE],
      tags: quoteValues[QUOTE_COLUMNS.TAGS],
      likesCount: quoteValues[QUOTE_COLUMNS.LIKES_COUNT],
      savesCount: quoteValues[QUOTE_COLUMNS.SAVES_COUNT],
      commentsCount: quoteValues[QUOTE_COLUMNS.COMMENTS_COUNT],
      createdAt: quoteValues[QUOTE_COLUMNS.CREATED_AT],
      updatedAt: now
    };
    
    return createJsonResponse({ 
      success: true, 
      message: "تم تحديث الاقتباس بنجاح", 
      quote: updatedQuote 
    });
  } catch (error) {
    Logger.log("Error updating quote: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء تحديث الاقتباس: " + error.toString() 
    });
  }
}

/**
 * حذف اقتباس
 * @param {string} id - معرف الاقتباس
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - استجابة JSON
 */
function deleteQuote(id, userId) {
  try {
    Logger.log("Deleting quote: " + id + " by user: " + userId);
    
    // التحقق من البيانات المطلوبة
    if (!id || !userId) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف الاقتباس ومعرف المستخدم مطلوبان" 
      });
    }
    
    // الحصول على جدول البيانات وورقة الاقتباسات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // البحث عن الاقتباس
    const quoteRowIndex = findQuoteRowIndexById(id);
    
    if (quoteRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "الاقتباس غير موجود" 
      });
    }
    
    // الحصول على بيانات الاقتباس
    const quoteRange = quotesSheet.getRange(quoteRowIndex, 1, 1, 10);
    const quoteValues = quoteRange.getValues()[0];
    
    // التحقق من أن المستخدم هو صاحب الاقتباس
    if (quoteValues[QUOTE_COLUMNS.USER_ID] !== userId) {
      return createJsonResponse({ 
        success: false, 
        error: "غير مسموح لك بحذف هذا الاقتباس" 
      });
    }
    
    // حذف الاقتباس
    quotesSheet.deleteRow(quoteRowIndex);
    
    return createJsonResponse({ 
      success: true, 
      message: "تم حذف الاقتباس بنجاح" 
    });
  } catch (error) {
    Logger.log("Error deleting quote: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء حذف الاقتباس: " + error.toString() 
    });
  }
}

/**
 * إضافة إعجاب لاقتباس
 * @param {string} userId - معرف المستخدم
 * @param {string} quoteId - معرف الاقتباس
 * @returns {Object} - استجابة JSON
 */
function likeQuote(userId, quoteId) {
  try {
    Logger.log("Liking quote: " + quoteId + " by user: " + userId);
    
    // التحقق من البيانات المطلوبة
    if (!userId || !quoteId) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم ومعرف الاقتباس مطلوبان" 
      });
    }
    
    // الحصول على جدول البيانات وورقة الإعجابات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const likesSheet = ss.getSheetByName(SHEETS.LIKES);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!likesSheet || !quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة الإعجابات أو ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // التحقق من وجود الاقتباس
    const quoteRowIndex = findQuoteRowIndexById(quoteId);
    
    if (quoteRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "الاقتباس غير موجود" 
      });
    }
    
    // التحقق من عدم وجود إعجاب سابق
    const likesData = likesSheet.getDataRange().getValues();
    const existingLike = likesData.find(like => like[0] === userId && like[1] === quoteId);
    
    if (existingLike) {
      return createJsonResponse({ 
        success: false, 
        error: "لقد قمت بالإعجاب بهذا الاقتباس بالفعل" 
      });
    }
    
    // إضافة الإعجاب
    const now = new Date().toISOString();
    likesSheet.appendRow([userId, quoteId, now]);
    
    // تحديث عدد الإعجابات في الاقتباس
    const quoteRange = quotesSheet.getRange(quoteRowIndex, 1, 1, 10);
    const quoteValues = quoteRange.getValues()[0];
    quoteValues[QUOTE_COLUMNS.LIKES_COUNT] = quoteValues[QUOTE_COLUMNS.LIKES_COUNT] + 1;
    quoteRange.setValues([quoteValues]);
    
    return createJsonResponse({ 
      success: true, 
      message: "تم الإعجاب بالاقتباس بنجاح",
      likesCount: quoteValues[QUOTE_COLUMNS.LIKES_COUNT]
    });
  } catch (error) {
    Logger.log("Error liking quote: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء الإعجاب بالاقتباس: " + error.toString() 
    });
  }
}

/**
 * إزالة إعجاب من اقتباس
 * @param {string} userId - معرف المستخدم
 * @param {string} quoteId - معرف الاقتباس
 * @returns {Object} - استجابة JSON
 */
function unlikeQuote(userId, quoteId) {
  try {
    Logger.log("Unliking quote: " + quoteId + " by user: " + userId);
    
    // التحقق من البيانات المطلوبة
    if (!userId || !quoteId) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم ومعرف الاقتباس مطلوبان" 
      });
    }
    
    // الحصول على جدول البيانات وورقة الإعجابات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const likesSheet = ss.getSheetByName(SHEETS.LIKES);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!likesSheet || !quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة الإعجابات أو ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // التحقق من وجود الاقتباس
    const quoteRowIndex = findQuoteRowIndexById(quoteId);
    
    if (quoteRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "الاقتباس غير موجود" 
      });
    }
    
    // البحث عن الإعجاب
    const likesData = likesSheet.getDataRange().getValues();
    let likeRowIndex = -1;
    
    for (let i = 0; i < likesData.length; i++) {
      if (likesData[i][0] === userId && likesData[i][1] === quoteId) {
        likeRowIndex = i + 1; // +1 لأن الصفوف تبدأ من 1
        break;
      }
    }
    
    if (likeRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "لم تقم بالإعجاب بهذا الاقتباس" 
      });
    }
    
    // حذف الإعجاب
    likesSheet.deleteRow(likeRowIndex);
    
    // تحديث عدد الإعجابات في الاقتباس
    const quoteRange = quotesSheet.getRange(quoteRowIndex, 1, 1, 10);
    const quoteValues = quoteRange.getValues()[0];
    quoteValues[QUOTE_COLUMNS.LIKES_COUNT] = Math.max(0, quoteValues[QUOTE_COLUMNS.LIKES_COUNT] - 1);
    quoteRange.setValues([quoteValues]);
    
    return createJsonResponse({ 
      success: true, 
      message: "تم إلغاء الإعجاب بالاقتباس بنجاح",
      likesCount: quoteValues[QUOTE_COLUMNS.LIKES_COUNT]
    });
  } catch (error) {
    Logger.log("Error unliking quote: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء إلغاء الإعجاب بالاقتباس: " + error.toString() 
    });
  }
}

/**
 * حفظ اقتباس
 * @param {string} userId - معرف المستخدم
 * @param {string} quoteId - معرف الاقتباس
 * @returns {Object} - استجابة JSON
 */
function saveQuote(userId, quoteId) {
  try {
    Logger.log("Saving quote: " + quoteId + " by user: " + userId);
    
    // التحقق من البيانات المطلوبة
    if (!userId || !quoteId) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم ومعرف الاقتباس مطلوبان" 
      });
    }
    
    // الحصول على جدول البيانات وورقة المحفوظات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const savesSheet = ss.getSheetByName(SHEETS.SAVES);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!savesSheet || !quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة المحفوظات أو ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // التحقق من وجود الاقتباس
    const quoteRowIndex = findQuoteRowIndexById(quoteId);
    
    if (quoteRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "الاقتباس غير موجود" 
      });
    }
    
    // التحقق من عدم وجود حفظ سابق
    const savesData = savesSheet.getDataRange().getValues();
    const existingSave = savesData.find(save => save[0] === userId && save[1] === quoteId);
    
    if (existingSave) {
      return createJsonResponse({ 
        success: false, 
        error: "لقد قمت بحفظ هذا الاقتباس بالفعل" 
      });
    }
    
    // إضافة الحفظ
    const now = new Date().toISOString();
    savesSheet.appendRow([userId, quoteId, now]);
    
    // تحديث عدد المحفوظات في الاقتباس
    const quoteRange = quotesSheet.getRange(quoteRowIndex, 1, 1, 10);
    const quoteValues = quoteRange.getValues()[0];
    quoteValues[QUOTE_COLUMNS.SAVES_COUNT] = quoteValues[QUOTE_COLUMNS.SAVES_COUNT] + 1;
    quoteRange.setValues([quoteValues]);
    
    return createJsonResponse({ 
      success: true, 
      message: "تم حفظ الاقتباس بنجاح",
      savesCount: quoteValues[QUOTE_COLUMNS.SAVES_COUNT]
    });
  } catch (error) {
    Logger.log("Error saving quote: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء حفظ الاقتباس: " + error.toString() 
    });
  }
}

/**
 * إلغاء حفظ اقتباس
 * @param {string} userId - معرف المستخدم
 * @param {string} quoteId - معرف الاقتباس
 * @returns {Object} - استجابة JSON
 */
function unsaveQuote(userId, quoteId) {
  try {
    Logger.log("Unsaving quote: " + quoteId + " by user: " + userId);
    
    // التحقق من البيانات المطلوبة
    if (!userId || !quoteId) {
      return createJsonResponse({ 
        success: false, 
        error: "معرف المستخدم ومعرف الاقتباس مطلوبان" 
      });
    }
    
    // الحصول على جدول البيانات وورقة المحفوظات
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const savesSheet = ss.getSheetByName(SHEETS.SAVES);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!savesSheet || !quotesSheet) {
      return createJsonResponse({ 
        success: false, 
        error: "ورقة المحفوظات أو ورقة الاقتباسات غير موجودة" 
      });
    }
    
    // التحقق من وجود الاقتباس
    const quoteRowIndex = findQuoteRowIndexById(quoteId);
    
    if (quoteRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "الاقتباس غير موجود" 
      });
    }
    
    // البحث عن الحفظ
    const savesData = savesSheet.getDataRange().getValues();
    let saveRowIndex = -1;
    
    for (let i = 0; i < savesData.length; i++) {
      if (savesData[i][0] === userId && savesData[i][1] === quoteId) {
        saveRowIndex = i + 1; // +1 لأن الصفوف تبدأ من 1
        break;
      }
    }
    
    if (saveRowIndex === -1) {
      return createJsonResponse({ 
        success: false, 
        error: "لم تقم بحفظ هذا الاقتباس" 
      });
    }
    
    // حذف الحفظ
    savesSheet.deleteRow(saveRowIndex);
    
    // تحديث عدد المحفوظات في الاقتباس
    const quoteRange = quotesSheet.getRange(quoteRowIndex, 1, 1, 10);
    const quoteValues = quoteRange.getValues()[0];
    quoteValues[QUOTE_COLUMNS.SAVES_COUNT] = Math.max(0, quoteValues[QUOTE_COLUMNS.SAVES_COUNT] - 1);
    quoteRange.setValues([quoteValues]);
    
    return createJsonResponse({ 
      success: true, 
      message: "تم إلغاء حفظ الاقتباس بنجاح",
      savesCount: quoteValues[QUOTE_COLUMNS.SAVES_COUNT]
    });
  } catch (error) {
    Logger.log("Error unsaving quote: " + error.toString());
    return createJsonResponse({ 
      success: false, 
      error: "حدث خطأ أثناء إلغاء حفظ الاقتباس: " + error.toString() 
    });
  }
}

/**
 * البحث عن مستخدم بواسطة البريد الإلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {Array|null} - بيانات المستخدم أو null إذا لم يتم العثور عليه
 */
function findUserByEmail(email) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    if (!usersSheet) {
      return null;
    }
    
    const usersData = usersSheet.getDataRange().getValues();
    
    // إزالة الصف الأول (العناوين)
    usersData.shift();
    
    // البحث عن المستخدم بالبريد الإلكتروني
    const user = usersData.find(user => user[USER_COLUMNS.EMAIL] === email);
    
    return user || null;
  } catch (error) {
    Logger.log("Error finding user by email: " + error.toString());
    return null;
  }
}

/**
 * البحث عن مستخدم بواسطة المعرف
 * @param {string} id - معرف المستخدم
 * @returns {Array|null} - بيانات المستخدم أو null إذا لم يتم العثور عليه
 */
function findUserById(id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    if (!usersSheet) {
      return null;
    }
    
    const usersData = usersSheet.getDataRange().getValues();
    
    // إزالة الصف الأول (العناوين)
    usersData.shift();
    
    // البحث عن المستخدم بالمعرف
    const user = usersData.find(user => user[USER_COLUMNS.ID] === id);
    
    return user || null;
  } catch (error) {
    Logger.log("Error finding user by ID: " + error.toString());
    return null;
  }
}

/**
 * البحث عن رقم صف المستخدم بواسطة المعرف
 * @param {string} id - معرف المستخدم
 * @returns {number} - رقم الصف أو -1 إذا لم يتم العثور عليه
 */
function findUserRowIndexById(id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const usersSheet = ss.getSheetByName(SHEETS.USERS);
    
    if (!usersSheet) {
      return -1;
    }
    
    const usersData = usersSheet.getDataRange().getValues();
    
    // البحث عن المستخدم بالمعرف
    for (let i = 1; i < usersData.length; i++) { // نبدأ من 1 لتجاوز صف العناوين
      if (usersData[i][USER_COLUMNS.ID] === id) {
        return i + 1; // +1 لأن الصفوف تبدأ من 1
      }
    }
    
    return -1;
  } catch (error) {
    Logger.log("Error finding user row index by ID: " + error.toString());
    return -1;
  }
}

/**
 * البحث عن اقتباس بواسطة المعرف
 * @param {string} id - معرف الاقتباس
 * @returns {Array|null} - بيانات الاقتباس أو null إذا لم يتم العثور عليه
 */
function findQuoteById(id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!quotesSheet) {
      return null;
    }
    
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // إزالة الصف الأول (العناوين)
    quotesData.shift();
    
    // البحث عن الاقتباس بالمعرف
    const quote = quotesData.find(quote => quote[QUOTE_COLUMNS.ID] === id);
    
    return quote || null;
  } catch (error) {
    Logger.log("Error finding quote by ID: " + error.toString());
    return null;
  }
}

/**
 * البحث عن رقم صف الاقتباس بواسطة المعرف
 * @param {string} id - معرف الاقتباس
 * @returns {number} - رقم الصف أو -1 إذا لم يتم العثور عليه
 */
function findQuoteRowIndexById(id) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    
    if (!quotesSheet) {
      return -1;
    }
    
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // البحث عن الاقتباس بالمعرف
    for (let i = 1; i < quotesData.length; i++) { // نبدأ من 1 لتجاوز صف العناوين
      if (quotesData[i][QUOTE_COLUMNS.ID] === id) {
        return i + 1; // +1 لأن الصفوف تبدأ من 1
      }
    }
    
    return -1;
  } catch (error) {
    Logger.log("Error finding quote row index by ID: " + error.toString());
    return -1;
  }
}

/**
 * إنشاء استجابة JSON
 * @param {Object} data - البيانات المراد إرجاعها
 * @returns {Object} - كائن ContentService
 */
function createJsonResponse(data) {
  // تم تعديل هذه الدالة لتجنب استخدام setHeader غير المدعومة
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * تهيئة أوراق البيانات
 * يجب تشغيل هذه الدالة مرة واحدة عند إعداد المشروع
 */
function initializeSheets() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // إنشاء ورقة المستخدمين إذا لم تكن موجودة
    let usersSheet = ss.getSheetByName(SHEETS.USERS);
    if (!usersSheet) {
      usersSheet = ss.insertSheet(SHEETS.USERS);
      usersSheet.appendRow([
        "المعرف", 
        "البريد الإلكتروني", 
        "كلمة المرور", 
        "الاسم", 
        "نبذة", 
        "لينكد إن", 
        "الصورة الرمزية", 
        "تاريخ الإنشاء", 
        "تاريخ التحديث"
      ]);
    }
    
    // إنشاء ورقة الاقتباسات إذا لم تكن موجودة
    let quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    if (!quotesSheet) {
      quotesSheet = ss.insertSheet(SHEETS.QUOTES);
      quotesSheet.appendRow([
        "المعرف", 
        "معرف المستخدم", 
        "المحتوى", 
        "المصدر", 
        "الوسوم", 
        "عدد الإعجابات", 
        "عدد المحفوظات", 
        "عدد التعليقات", 
        "تاريخ الإنشاء", 
        "تاريخ التحديث"
      ]);
    }
    
    // إنشاء ورقة الإعجابات إذا لم تكن موجودة
    let likesSheet = ss.getSheetByName(SHEETS.LIKES);
    if (!likesSheet) {
      likesSheet = ss.insertSheet(SHEETS.LIKES);
      likesSheet.appendRow([
        "معرف المستخدم", 
        "معرف الاقتباس", 
        "تاريخ الإعجاب"
      ]);
    }
    
    // إنشاء ورقة المحفوظات إذا لم تكن موجودة
    let savesSheet = ss.getSheetByName(SHEETS.SAVES);
    if (!savesSheet) {
      savesSheet = ss.insertSheet(SHEETS.SAVES);
      savesSheet.appendRow([
        "معرف المستخدم", 
        "معرف الاقتباس", 
        "تاريخ الحفظ"
      ]);
    }
    
    // إنشاء ورقة التعليقات إذا لم تكن موجودة
    let commentsSheet = ss.getSheetByName(SHEETS.COMMENTS);
    if (!commentsSheet) {
      commentsSheet = ss.insertSheet(SHEETS.COMMENTS);
      commentsSheet.appendRow([
        "المعرف", 
        "معرف المستخدم", 
        "معرف الاقتباس", 
        "المحتوى", 
        "تاريخ الإنشاء", 
        "تاريخ التحديث"
      ]);
    }
    
    return "تم تهيئة أوراق البيانات بنجاح";
  } catch (error) {
    Logger.log("Error initializing sheets: " + error.toString());
    return "حدث خطأ أثناء تهيئة أوراق البيانات: " + error.toString();
  }
}

/**
 * إنشاء بيانات تجريبية
 * يمكن استخدام هذه الدالة لإنشاء بيانات تجريبية للاختبار
 */
function createSampleData() {
  try {
    // إنشاء مستخدمين تجريبيين
    const user1 = {
      email: "user1@example.com",
      password: "password123",
      name: "أحمد محمود",
      bio: "مهتم بالأدب والفلسفة",
      linkedin: "https://linkedin.com/in/ahmed-mahmoud"
    };
    
    const user2 = {
      email: "user2@example.com",
      password: "password123",
      name: "سارة أحمد",
      bio: "كاتبة ومترجمة",
      linkedin: "https://linkedin.com/in/sara-ahmed"
    };
    
    // إنشاء المستخدمين
    const user1Response = JSON.parse(createUser(user1).getContent());
    const user2Response = JSON.parse(createUser(user2).getContent());
    
    if (!user1Response.success || !user2Response.success) {
      return "فشل في إنشاء المستخدمين التجريبيين";
    }
    
    // إنشاء اقتباسات تجريبية
    const quote1 = {
      userId: user1Response.user.id,
      content: "الحياة ليست عن انتظار العاصفة لتمر، بل عن تعلم الرقص في المطر.",
      source: "فيفيان غرين",
      tags: "حياة,تحفيز,إلهام"
    };
    
    const quote2 = {
      userId: user2Response.user.id,
      content: "النجاح ليس نهائيًا، والفشل ليس قاتلًا، الشجاعة للاستمرار هي ما يهم.",
      source: "ونستون تشرشل",
      tags: "نجاح,فشل,شجاعة"
    };
    
    const quote3 = {
      userId: user1Response.user.id,
      content: "لا تقارن نفسك بالآخرين، قارن نفسك بالشخص الذي كنته بالأمس.",
      source: "مجهول",
      tags: "تطوير الذات,تحفيز"
    };
    
    // إنشاء الاقتباسات
    createQuote(quote1);
    createQuote(quote2);
    createQuote(quote3);
    
    return "تم إنشاء البيانات التجريبية بنجاح";
  } catch (error) {
    Logger.log("Error creating sample data: " + error.toString());
    return "حدث خطأ أثناء إنشاء البيانات التجريبية: " + error.toString();
  }
}
