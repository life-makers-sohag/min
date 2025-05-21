/**
 * Google Apps Script لربط منصة Min Jadeed مع Google Sheets
 * 
 * هذا الملف يحتوي على كود Google Apps Script الذي يربط بين الواجهة الأمامية للمنصة وجداول بيانات Google
 * ويوفر واجهة برمجية تطبيقات RESTful للتعامل مع البيانات
 */

// معرف جدول البيانات
const SHEET_ID = '1gxuf_TWpglt5XnOz5ZKVF14bC7iZ0jrhWSO5cXcvxyg';

// أسماء أوراق البيانات
const SHEETS = {
  USERS: 'Users',
  QUOTES: 'Quotes',
  LIKES: 'Likes',
  SAVES: 'Saves'
};

// أعمدة جدول المستخدمين
const USER_COLUMNS = {
  ID: 0,
  EMAIL: 1,
  PASSWORD: 2,
  FIRST_NAME: 3,
  LAST_NAME: 4,
  LINKEDIN_URL: 5,
  JOIN_DATE: 6,
  BIO: 7,
  AVATAR: 8
};

// أعمدة جدول الاقتباسات
const QUOTE_COLUMNS = {
  ID: 0,
  USER_ID: 1,
  TEXT: 2,
  AUTHOR: 3,
  SOURCE: 4,
  TAGS: 5,
  CREATED_AT: 6,
  LIKES_COUNT: 7,
  SAVES_COUNT: 8,
  IS_ORIGINAL: 9
};

// أعمدة جدول الإعجابات
const LIKE_COLUMNS = {
  ID: 0,
  USER_ID: 1,
  QUOTE_ID: 2,
  CREATED_AT: 3
};

// أعمدة جدول المحفوظات
const SAVE_COLUMNS = {
  ID: 0,
  USER_ID: 1,
  QUOTE_ID: 2,
  CREATED_AT: 3
};

/**
 * نقطة الدخول لطلبات GET
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function doGet(e) {
  try {
    // تسجيل معلومات الطلب
    Logger.log('GET Request: ' + JSON.stringify(e));
    
    // التحقق من وجود معلمة الإجراء
    if (!e.parameter.action) {
      return createJsonResponse({ error: 'معلمة الإجراء مطلوبة' });
    }
    
    // التحقق من وجود معلمة معرف جدول البيانات
    if (!e.parameter.sheetId) {
      return createJsonResponse({ error: 'معلمة معرف جدول البيانات مطلوبة' });
    }
    
    // التحقق من طريقة الطلب الحقيقية (للتعامل مع قيود CORS)
    const method = e.parameter._method || 'GET';
    
    // توجيه الطلب إلى الوظيفة المناسبة بناءً على الإجراء والطريقة
    switch (method) {
      case 'GET':
        return handleGetRequest(e);
      case 'POST':
        return handlePostRequest(e);
      case 'PUT':
        return handlePutRequest(e);
      case 'DELETE':
        return handleDeleteRequest(e);
      default:
        return createJsonResponse({ error: 'طريقة الطلب غير مدعومة' });
    }
  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * نقطة الدخول لطلبات POST (غير مستخدمة بسبب قيود CORS)
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function doPost(e) {
  try {
    // تسجيل معلومات الطلب
    Logger.log('POST Request: ' + JSON.stringify(e));
    
    // توجيه الطلب إلى handlePostRequest
    return handlePostRequest(e);
  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * معالجة طلبات OPTIONS (للتعامل مع قيود CORS)
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة مع رؤوس CORS
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '3600');
}

/**
 * إنشاء استجابة JSON مع رؤوس CORS
 * @param {Object} data - البيانات المراد إرجاعها
 * @returns {Object} - كائن ContentService
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * معالجة طلبات GET
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function handleGetRequest(e) {
  const action = e.parameter.action;
  
  switch (action) {
    case 'checkEmail':
      return checkEmailExists(e);
    case 'getUser':
      return getUser(e);
    case 'getQuotes':
      return getQuotes(e);
    case 'getQuote':
      return getQuote(e);
    case 'getUserQuotes':
      return getUserQuotes(e);
    case 'getLikedQuotes':
      return getLikedQuotes(e);
    case 'getSavedQuotes':
      return getSavedQuotes(e);
    default:
      return createJsonResponse({ error: 'إجراء GET غير معروف: ' + action });
  }
}

/**
 * معالجة طلبات POST
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function handlePostRequest(e) {
  const action = e.parameter.action;
  
  switch (action) {
    case 'login':
      return login(e);
    case 'signup':
      return signup(e);
    case 'addQuote':
      return addQuote(e);
    case 'likeQuote':
      return likeQuote(e);
    case 'unlikeQuote':
      return unlikeQuote(e);
    case 'saveQuote':
      return saveQuote(e);
    case 'unsaveQuote':
      return unsaveQuote(e);
    default:
      return createJsonResponse({ error: 'إجراء POST غير معروف: ' + action });
  }
}

/**
 * معالجة طلبات PUT
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function handlePutRequest(e) {
  const action = e.parameter.action;
  
  switch (action) {
    case 'updateUser':
      return updateUser(e);
    case 'updateQuote':
      return updateQuote(e);
    default:
      return createJsonResponse({ error: 'إجراء PUT غير معروف: ' + action });
  }
}

/**
 * معالجة طلبات DELETE
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function handleDeleteRequest(e) {
  const action = e.parameter.action;
  
  switch (action) {
    case 'deleteQuote':
      return deleteQuote(e);
    default:
      return createJsonResponse({ error: 'إجراء DELETE غير معروف: ' + action });
  }
}

/**
 * تهيئة أوراق البيانات
 * يجب تشغيل هذه الوظيفة مرة واحدة عند إعداد المشروع
 */
function initializeSheets() {
  try {
    // فتح جدول البيانات
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    
    // إنشاء ورقة المستخدمين إذا لم تكن موجودة
    let usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    if (!usersSheet) {
      usersSheet = spreadsheet.insertSheet(SHEETS.USERS);
      usersSheet.appendRow([
        'ID', 'Email', 'Password', 'FirstName', 'LastName', 
        'LinkedinUrl', 'JoinDate', 'Bio', 'Avatar'
      ]);
    }
    
    // إنشاء ورقة الاقتباسات إذا لم تكن موجودة
    let quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    if (!quotesSheet) {
      quotesSheet = spreadsheet.insertSheet(SHEETS.QUOTES);
      quotesSheet.appendRow([
        'ID', 'UserID', 'Text', 'Author', 'Source', 
        'Tags', 'CreatedAt', 'LikesCount', 'SavesCount', 'IsOriginal'
      ]);
    }
    
    // إنشاء ورقة الإعجابات إذا لم تكن موجودة
    let likesSheet = spreadsheet.getSheetByName(SHEETS.LIKES);
    if (!likesSheet) {
      likesSheet = spreadsheet.insertSheet(SHEETS.LIKES);
      likesSheet.appendRow(['ID', 'UserID', 'QuoteID', 'CreatedAt']);
    }
    
    // إنشاء ورقة المحفوظات إذا لم تكن موجودة
    let savesSheet = spreadsheet.getSheetByName(SHEETS.SAVES);
    if (!savesSheet) {
      savesSheet = spreadsheet.insertSheet(SHEETS.SAVES);
      savesSheet.appendRow(['ID', 'UserID', 'QuoteID', 'CreatedAt']);
    }
    
    return createJsonResponse({ success: true, message: 'تم تهيئة أوراق البيانات بنجاح' });
  } catch (error) {
    Logger.log('Error in initializeSheets: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * إنشاء بيانات تجريبية
 * يمكن استخدام هذه الوظيفة لإنشاء بيانات تجريبية للاختبار
 */
function createSampleData() {
  try {
    // إنشاء مستخدمين تجريبيين
    const user1 = {
      email: 'user1@example.com',
      password: 'password123',
      firstName: 'أحمد',
      lastName: 'محمود',
      linkedinUrl: 'https://linkedin.com/in/ahmed-mahmoud',
      joinDate: new Date().toISOString(),
      bio: 'مهتم بالأدب والفلسفة، أحب مشاركة الاقتباسات الملهمة التي تثري الفكر وتحفز على التأمل.'
    };
    
    const user2 = {
      email: 'user2@example.com',
      password: 'password123',
      firstName: 'سارة',
      lastName: 'أحمد',
      linkedinUrl: 'https://linkedin.com/in/sara-ahmed',
      joinDate: new Date().toISOString(),
      bio: 'كاتبة ومترجمة، أهتم بالأدب العالمي والفلسفة.'
    };
    
    // إضافة المستخدمين
    const user1Id = addUserToSheet(user1);
    const user2Id = addUserToSheet(user2);
    
    // إنشاء اقتباسات تجريبية
    const quotes = [
      {
        userId: user1Id,
        text: 'الحياة ليست عن انتظار العاصفة لتمر، بل عن تعلم الرقص في المطر.',
        author: 'فيفيان غرين',
        source: '',
        tags: 'حياة,إلهام,تفاؤل',
        isOriginal: false
      },
      {
        userId: user1Id,
        text: 'النجاح ليس نهائيًا، والفشل ليس قاتلًا، الشجاعة للاستمرار هي ما يهم.',
        author: 'ونستون تشرشل',
        source: '',
        tags: 'نجاح,فشل,شجاعة',
        isOriginal: false
      },
      {
        userId: user2Id,
        text: 'لا تقارن نفسك بالآخرين، قارن نفسك بالشخص الذي كنته بالأمس.',
        author: '',
        source: '',
        tags: 'تطوير الذات,إلهام',
        isOriginal: true
      },
      {
        userId: user2Id,
        text: 'الصبر مفتاح الفرج، والعمل مفتاح النجاح، والإيمان مفتاح الاثنين.',
        author: '',
        source: '',
        tags: 'صبر,نجاح,إيمان',
        isOriginal: true
      }
    ];
    
    // إضافة الاقتباسات
    quotes.forEach(quote => {
      addQuoteToSheet(quote);
    });
    
    return createJsonResponse({ success: true, message: 'تم إنشاء البيانات التجريبية بنجاح' });
  } catch (error) {
    Logger.log('Error in createSampleData: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * التحقق من وجود بريد إلكتروني
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function checkEmailExists(e) {
  try {
    const email = e.parameter.email;
    
    if (!email) {
      return createJsonResponse({ error: 'البريد الإلكتروني مطلوب' });
    }
    
    // البحث عن المستخدم بالبريد الإلكتروني
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][USER_COLUMNS.EMAIL].toLowerCase() === email.toLowerCase()) {
        return createJsonResponse({ exists: true });
      }
    }
    
    return createJsonResponse({ exists: false });
  } catch (error) {
    Logger.log('Error in checkEmailExists: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * تسجيل الدخول
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function login(e) {
  try {
    const email = e.parameter.email;
    const password = e.parameter.password;
    
    if (!email || !password) {
      return createJsonResponse({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }
    
    // البحث عن المستخدم بالبريد الإلكتروني وكلمة المرور
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][USER_COLUMNS.EMAIL].toLowerCase() === email.toLowerCase() && 
          usersData[i][USER_COLUMNS.PASSWORD] === password) {
        
        // إنشاء كائن المستخدم (بدون كلمة المرور)
        const user = {
          id: usersData[i][USER_COLUMNS.ID],
          email: usersData[i][USER_COLUMNS.EMAIL],
          firstName: usersData[i][USER_COLUMNS.FIRST_NAME],
          lastName: usersData[i][USER_COLUMNS.LAST_NAME],
          linkedinUrl: usersData[i][USER_COLUMNS.LINKEDIN_URL],
          joinDate: usersData[i][USER_COLUMNS.JOIN_DATE],
          bio: usersData[i][USER_COLUMNS.BIO],
          avatar: usersData[i][USER_COLUMNS.AVATAR]
        };
        
        // إنشاء رمز مصادقة بسيط (في تطبيق حقيقي، يجب استخدام JWT أو طريقة أكثر أمانًا)
        const token = Utilities.base64Encode(email + ':' + new Date().getTime());
        
        return createJsonResponse({ success: true, user, token });
      }
    }
    
    return createJsonResponse({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
  } catch (error) {
    Logger.log('Error in login: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * إنشاء حساب جديد
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function signup(e) {
  try {
    // استخراج بيانات المستخدم من الطلب
    const userData = {
      email: e.parameter.email,
      password: e.parameter.password,
      firstName: e.parameter.firstName,
      lastName: e.parameter.lastName,
      linkedinUrl: e.parameter.linkedinUrl,
      joinDate: e.parameter.joinDate || new Date().toISOString(),
      bio: e.parameter.bio || ''
    };
    
    // التحقق من وجود البيانات المطلوبة
    if (!userData.email || !userData.password || !userData.firstName || !userData.lastName || !userData.linkedinUrl) {
      return createJsonResponse({ error: 'جميع الحقول المطلوبة يجب ملؤها' });
    }
    
    // التحقق من عدم وجود حساب بنفس البريد الإلكتروني
    const emailExists = JSON.parse(checkEmailExists({ parameter: { email: userData.email } }).getContent()).exists;
    if (emailExists) {
      return createJsonResponse({ error: 'البريد الإلكتروني مستخدم بالفعل' });
    }
    
    // إضافة المستخدم إلى جدول البيانات
    const userId = addUserToSheet(userData);
    
    // إنشاء كائن المستخدم (بدون كلمة المرور)
    const user = {
      id: userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      linkedinUrl: userData.linkedinUrl,
      joinDate: userData.joinDate,
      bio: userData.bio
    };
    
    // إنشاء رمز مصادقة بسيط
    const token = Utilities.base64Encode(userData.email + ':' + new Date().getTime());
    
    return createJsonResponse({ success: true, user, token });
  } catch (error) {
    Logger.log('Error in signup: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * إضافة مستخدم إلى جدول البيانات
 * @param {Object} userData - بيانات المستخدم
 * @returns {string} - معرف المستخدم
 */
function addUserToSheet(userData) {
  // فتح جدول البيانات
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
  
  // إنشاء معرف فريد للمستخدم
  const userId = Utilities.getUuid();
  
  // إضافة المستخدم إلى جدول البيانات
  usersSheet.appendRow([
    userId,
    userData.email,
    userData.password,
    userData.firstName,
    userData.lastName,
    userData.linkedinUrl,
    userData.joinDate,
    userData.bio || '',
    userData.avatar || ''
  ]);
  
  return userId;
}

/**
 * الحصول على بيانات المستخدم
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function getUser(e) {
  try {
    const userId = e.parameter.userId;
    
    if (!userId) {
      return createJsonResponse({ error: 'معرف المستخدم مطلوب' });
    }
    
    // البحث عن المستخدم بالمعرف
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][USER_COLUMNS.ID] === userId) {
        // إنشاء كائن المستخدم (بدون كلمة المرور)
        const user = {
          id: usersData[i][USER_COLUMNS.ID],
          email: usersData[i][USER_COLUMNS.EMAIL],
          firstName: usersData[i][USER_COLUMNS.FIRST_NAME],
          lastName: usersData[i][USER_COLUMNS.LAST_NAME],
          linkedinUrl: usersData[i][USER_COLUMNS.LINKEDIN_URL],
          joinDate: usersData[i][USER_COLUMNS.JOIN_DATE],
          bio: usersData[i][USER_COLUMNS.BIO],
          avatar: usersData[i][USER_COLUMNS.AVATAR]
        };
        
        return createJsonResponse({ user });
      }
    }
    
    return createJsonResponse({ error: 'المستخدم غير موجود' });
  } catch (error) {
    Logger.log('Error in getUser: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * تحديث بيانات المستخدم
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function updateUser(e) {
  try {
    // استخراج بيانات المستخدم من الطلب
    const userId = e.parameter.id;
    const userData = {
      firstName: e.parameter.firstName,
      lastName: e.parameter.lastName,
      linkedinUrl: e.parameter.linkedinUrl,
      bio: e.parameter.bio
    };
    
    if (!userId) {
      return createJsonResponse({ error: 'معرف المستخدم مطلوب' });
    }
    
    // البحث عن المستخدم بالمعرف
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < usersData.length; i++) {
      if (usersData[i][USER_COLUMNS.ID] === userId) {
        // تحديث بيانات المستخدم
        if (userData.firstName) usersSheet.getRange(i + 1, USER_COLUMNS.FIRST_NAME + 1).setValue(userData.firstName);
        if (userData.lastName) usersSheet.getRange(i + 1, USER_COLUMNS.LAST_NAME + 1).setValue(userData.lastName);
        if (userData.linkedinUrl) usersSheet.getRange(i + 1, USER_COLUMNS.LINKEDIN_URL + 1).setValue(userData.linkedinUrl);
        if (userData.bio !== undefined) usersSheet.getRange(i + 1, USER_COLUMNS.BIO + 1).setValue(userData.bio);
        
        // إنشاء كائن المستخدم المحدث
        const user = {
          id: usersData[i][USER_COLUMNS.ID],
          email: usersData[i][USER_COLUMNS.EMAIL],
          firstName: userData.firstName || usersData[i][USER_COLUMNS.FIRST_NAME],
          lastName: userData.lastName || usersData[i][USER_COLUMNS.LAST_NAME],
          linkedinUrl: userData.linkedinUrl || usersData[i][USER_COLUMNS.LINKEDIN_URL],
          joinDate: usersData[i][USER_COLUMNS.JOIN_DATE],
          bio: userData.bio !== undefined ? userData.bio : usersData[i][USER_COLUMNS.BIO],
          avatar: usersData[i][USER_COLUMNS.AVATAR]
        };
        
        return createJsonResponse({ success: true, user });
      }
    }
    
    return createJsonResponse({ error: 'المستخدم غير موجود' });
  } catch (error) {
    Logger.log('Error in updateUser: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * الحصول على الاقتباسات
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function getQuotes(e) {
  try {
    // استخراج معلمات الطلب
    const page = parseInt(e.parameter.page) || 1;
    const limit = parseInt(e.parameter.limit) || 10;
    const filtersJson = e.parameter.filters;
    const filters = filtersJson ? JSON.parse(filtersJson) : {};
    
    // حساب الإزاحة
    const offset = (page - 1) * limit;
    
    // الحصول على جميع الاقتباسات
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // تصفية الاقتباسات
    let filteredQuotes = [];
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      // تطبيق المرشحات
      let includeQuote = true;
      
      if (filters.userId && quotesData[i][QUOTE_COLUMNS.USER_ID] !== filters.userId) {
        includeQuote = false;
      }
      
      if (filters.tags && includeQuote) {
        const quoteTags = quotesData[i][QUOTE_COLUMNS.TAGS].split(',');
        const filterTags = filters.tags.split(',');
        
        // التحقق من وجود تطابق بين الوسوم
        const hasMatchingTag = filterTags.some(tag => quoteTags.includes(tag.trim()));
        if (!hasMatchingTag) {
          includeQuote = false;
        }
      }
      
      if (filters.search && includeQuote) {
        const searchTerm = filters.search.toLowerCase();
        const quoteText = quotesData[i][QUOTE_COLUMNS.TEXT].toLowerCase();
        const quoteAuthor = quotesData[i][QUOTE_COLUMNS.AUTHOR].toLowerCase();
        const quoteSource = quotesData[i][QUOTE_COLUMNS.SOURCE].toLowerCase();
        
        if (!quoteText.includes(searchTerm) && !quoteAuthor.includes(searchTerm) && !quoteSource.includes(searchTerm)) {
          includeQuote = false;
        }
      }
      
      if (includeQuote) {
        // إضافة الاقتباس إلى القائمة المصفاة
        filteredQuotes.push({
          id: quotesData[i][QUOTE_COLUMNS.ID],
          userId: quotesData[i][QUOTE_COLUMNS.USER_ID],
          text: quotesData[i][QUOTE_COLUMNS.TEXT],
          author: quotesData[i][QUOTE_COLUMNS.AUTHOR],
          source: quotesData[i][QUOTE_COLUMNS.SOURCE],
          tags: quotesData[i][QUOTE_COLUMNS.TAGS],
          createdAt: quotesData[i][QUOTE_COLUMNS.CREATED_AT],
          likesCount: quotesData[i][QUOTE_COLUMNS.LIKES_COUNT],
          savesCount: quotesData[i][QUOTE_COLUMNS.SAVES_COUNT],
          isOriginal: quotesData[i][QUOTE_COLUMNS.IS_ORIGINAL]
        });
      }
    }
    
    // ترتيب الاقتباسات حسب تاريخ الإنشاء (الأحدث أولاً)
    filteredQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // تقسيم الاقتباسات إلى صفحات
    const paginatedQuotes = filteredQuotes.slice(offset, offset + limit);
    
    // إضافة معلومات المستخدم لكل اقتباس
    const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    
    const quotesWithUserInfo = paginatedQuotes.map(quote => {
      // البحث عن معلومات المستخدم
      let userInfo = null;
      
      for (let i = 1; i < usersData.length; i++) {
        if (usersData[i][USER_COLUMNS.ID] === quote.userId) {
          userInfo = {
            id: usersData[i][USER_COLUMNS.ID],
            firstName: usersData[i][USER_COLUMNS.FIRST_NAME],
            lastName: usersData[i][USER_COLUMNS.LAST_NAME],
            avatar: usersData[i][USER_COLUMNS.AVATAR]
          };
          break;
        }
      }
      
      return {
        ...quote,
        user: userInfo
      };
    });
    
    return createJsonResponse({
      quotes: quotesWithUserInfo,
      pagination: {
        page,
        limit,
        total: filteredQuotes.length,
        totalPages: Math.ceil(filteredQuotes.length / limit)
      }
    });
  } catch (error) {
    Logger.log('Error in getQuotes: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * الحصول على اقتباس محدد
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function getQuote(e) {
  try {
    const quoteId = e.parameter.quoteId;
    
    if (!quoteId) {
      return createJsonResponse({ error: 'معرف الاقتباس مطلوب' });
    }
    
    // البحث عن الاقتباس بالمعرف
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][QUOTE_COLUMNS.ID] === quoteId) {
        // إنشاء كائن الاقتباس
        const quote = {
          id: quotesData[i][QUOTE_COLUMNS.ID],
          userId: quotesData[i][QUOTE_COLUMNS.USER_ID],
          text: quotesData[i][QUOTE_COLUMNS.TEXT],
          author: quotesData[i][QUOTE_COLUMNS.AUTHOR],
          source: quotesData[i][QUOTE_COLUMNS.SOURCE],
          tags: quotesData[i][QUOTE_COLUMNS.TAGS],
          createdAt: quotesData[i][QUOTE_COLUMNS.CREATED_AT],
          likesCount: quotesData[i][QUOTE_COLUMNS.LIKES_COUNT],
          savesCount: quotesData[i][QUOTE_COLUMNS.SAVES_COUNT],
          isOriginal: quotesData[i][QUOTE_COLUMNS.IS_ORIGINAL]
        };
        
        // البحث عن معلومات المستخدم
        const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
        const usersData = usersSheet.getDataRange().getValues();
        
        let userInfo = null;
        for (let j = 1; j < usersData.length; j++) {
          if (usersData[j][USER_COLUMNS.ID] === quote.userId) {
            userInfo = {
              id: usersData[j][USER_COLUMNS.ID],
              firstName: usersData[j][USER_COLUMNS.FIRST_NAME],
              lastName: usersData[j][USER_COLUMNS.LAST_NAME],
              avatar: usersData[j][USER_COLUMNS.AVATAR]
            };
            break;
          }
        }
        
        return createJsonResponse({ quote: { ...quote, user: userInfo } });
      }
    }
    
    return createJsonResponse({ error: 'الاقتباس غير موجود' });
  } catch (error) {
    Logger.log('Error in getQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * إضافة اقتباس جديد
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function addQuote(e) {
  try {
    // استخراج بيانات الاقتباس من الطلب
    const quoteData = {
      userId: e.parameter.userId,
      text: e.parameter.quoteText,
      author: e.parameter.quoteAuthor || '',
      source: e.parameter.quoteSource || '',
      tags: e.parameter.quoteTags || '',
      isOriginal: e.parameter.originalContent === 'true'
    };
    
    // التحقق من وجود البيانات المطلوبة
    if (!quoteData.userId || !quoteData.text) {
      return createJsonResponse({ error: 'معرف المستخدم ونص الاقتباس مطلوبان' });
    }
    
    // إضافة الاقتباس إلى جدول البيانات
    const quoteId = addQuoteToSheet(quoteData);
    
    // الحصول على الاقتباس المضاف
    return getQuote({ parameter: { quoteId } });
  } catch (error) {
    Logger.log('Error in addQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * إضافة اقتباس إلى جدول البيانات
 * @param {Object} quoteData - بيانات الاقتباس
 * @returns {string} - معرف الاقتباس
 */
function addQuoteToSheet(quoteData) {
  // فتح جدول البيانات
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
  
  // إنشاء معرف فريد للاقتباس
  const quoteId = Utilities.getUuid();
  
  // إضافة الاقتباس إلى جدول البيانات
  quotesSheet.appendRow([
    quoteId,
    quoteData.userId,
    quoteData.text,
    quoteData.author,
    quoteData.source,
    quoteData.tags,
    new Date().toISOString(),
    0, // likesCount
    0, // savesCount
    quoteData.isOriginal
  ]);
  
  return quoteId;
}

/**
 * تحديث اقتباس
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function updateQuote(e) {
  try {
    // استخراج بيانات الاقتباس من الطلب
    const quoteId = e.parameter.quoteId;
    const quoteData = {
      text: e.parameter.quoteText,
      author: e.parameter.quoteAuthor,
      source: e.parameter.quoteSource,
      tags: e.parameter.quoteTags,
      isOriginal: e.parameter.originalContent === 'true'
    };
    
    if (!quoteId) {
      return createJsonResponse({ error: 'معرف الاقتباس مطلوب' });
    }
    
    // البحث عن الاقتباس بالمعرف
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][QUOTE_COLUMNS.ID] === quoteId) {
        // تحديث بيانات الاقتباس
        if (quoteData.text) quotesSheet.getRange(i + 1, QUOTE_COLUMNS.TEXT + 1).setValue(quoteData.text);
        if (quoteData.author !== undefined) quotesSheet.getRange(i + 1, QUOTE_COLUMNS.AUTHOR + 1).setValue(quoteData.author);
        if (quoteData.source !== undefined) quotesSheet.getRange(i + 1, QUOTE_COLUMNS.SOURCE + 1).setValue(quoteData.source);
        if (quoteData.tags !== undefined) quotesSheet.getRange(i + 1, QUOTE_COLUMNS.TAGS + 1).setValue(quoteData.tags);
        if (quoteData.isOriginal !== undefined) quotesSheet.getRange(i + 1, QUOTE_COLUMNS.IS_ORIGINAL + 1).setValue(quoteData.isOriginal);
        
        // الحصول على الاقتباس المحدث
        return getQuote({ parameter: { quoteId } });
      }
    }
    
    return createJsonResponse({ error: 'الاقتباس غير موجود' });
  } catch (error) {
    Logger.log('Error in updateQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * حذف اقتباس
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function deleteQuote(e) {
  try {
    const quoteId = e.parameter.quoteId;
    
    if (!quoteId) {
      return createJsonResponse({ error: 'معرف الاقتباس مطلوب' });
    }
    
    // البحث عن الاقتباس بالمعرف
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][QUOTE_COLUMNS.ID] === quoteId) {
        // حذف الاقتباس
        quotesSheet.deleteRow(i + 1);
        
        // حذف الإعجابات والمحفوظات المرتبطة بالاقتباس
        deleteRelatedLikesAndSaves(quoteId);
        
        return createJsonResponse({ success: true, message: 'تم حذف الاقتباس بنجاح' });
      }
    }
    
    return createJsonResponse({ error: 'الاقتباس غير موجود' });
  } catch (error) {
    Logger.log('Error in deleteQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * حذف الإعجابات والمحفوظات المرتبطة باقتباس
 * @param {string} quoteId - معرف الاقتباس
 */
function deleteRelatedLikesAndSaves(quoteId) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  
  // حذف الإعجابات المرتبطة
  const likesSheet = spreadsheet.getSheetByName(SHEETS.LIKES);
  const likesData = likesSheet.getDataRange().getValues();
  
  for (let i = likesData.length - 1; i > 0; i--) {
    if (likesData[i][LIKE_COLUMNS.QUOTE_ID] === quoteId) {
      likesSheet.deleteRow(i + 1);
    }
  }
  
  // حذف المحفوظات المرتبطة
  const savesSheet = spreadsheet.getSheetByName(SHEETS.SAVES);
  const savesData = savesSheet.getDataRange().getValues();
  
  for (let i = savesData.length - 1; i > 0; i--) {
    if (savesData[i][SAVE_COLUMNS.QUOTE_ID] === quoteId) {
      savesSheet.deleteRow(i + 1);
    }
  }
}

/**
 * الإعجاب باقتباس
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function likeQuote(e) {
  try {
    const quoteId = e.parameter.quoteId;
    const userId = e.parameter.userId;
    
    if (!quoteId || !userId) {
      return createJsonResponse({ error: 'معرف الاقتباس ومعرف المستخدم مطلوبان' });
    }
    
    // التحقق من وجود الاقتباس
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    let quoteIndex = -1;
    let likesCount = 0;
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][QUOTE_COLUMNS.ID] === quoteId) {
        quoteIndex = i;
        likesCount = quotesData[i][QUOTE_COLUMNS.LIKES_COUNT];
        break;
      }
    }
    
    if (quoteIndex === -1) {
      return createJsonResponse({ error: 'الاقتباس غير موجود' });
    }
    
    // التحقق من عدم وجود إعجاب سابق
    const likesSheet = spreadsheet.getSheetByName(SHEETS.LIKES);
    const likesData = likesSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < likesData.length; i++) {
      if (likesData[i][LIKE_COLUMNS.USER_ID] === userId && likesData[i][LIKE_COLUMNS.QUOTE_ID] === quoteId) {
        return createJsonResponse({ error: 'المستخدم معجب بالاقتباس بالفعل' });
      }
    }
    
    // إضافة الإعجاب
    const likeId = Utilities.getUuid();
    likesSheet.appendRow([
      likeId,
      userId,
      quoteId,
      new Date().toISOString()
    ]);
    
    // تحديث عدد الإعجابات
    quotesSheet.getRange(quoteIndex + 1, QUOTE_COLUMNS.LIKES_COUNT + 1).setValue(likesCount + 1);
    
    return createJsonResponse({ success: true, message: 'تم الإعجاب بالاقتباس بنجاح' });
  } catch (error) {
    Logger.log('Error in likeQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * إلغاء الإعجاب باقتباس
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function unlikeQuote(e) {
  try {
    const quoteId = e.parameter.quoteId;
    const userId = e.parameter.userId;
    
    if (!quoteId || !userId) {
      return createJsonResponse({ error: 'معرف الاقتباس ومعرف المستخدم مطلوبان' });
    }
    
    // التحقق من وجود الاقتباس
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    let quoteIndex = -1;
    let likesCount = 0;
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][QUOTE_COLUMNS.ID] === quoteId) {
        quoteIndex = i;
        likesCount = quotesData[i][QUOTE_COLUMNS.LIKES_COUNT];
        break;
      }
    }
    
    if (quoteIndex === -1) {
      return createJsonResponse({ error: 'الاقتباس غير موجود' });
    }
    
    // البحث عن الإعجاب
    const likesSheet = spreadsheet.getSheetByName(SHEETS.LIKES);
    const likesData = likesSheet.getDataRange().getValues();
    
    let likeIndex = -1;
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < likesData.length; i++) {
      if (likesData[i][LIKE_COLUMNS.USER_ID] === userId && likesData[i][LIKE_COLUMNS.QUOTE_ID] === quoteId) {
        likeIndex = i;
        break;
      }
    }
    
    if (likeIndex === -1) {
      return createJsonResponse({ error: 'المستخدم غير معجب بالاقتباس' });
    }
    
    // حذف الإعجاب
    likesSheet.deleteRow(likeIndex + 1);
    
    // تحديث عدد الإعجابات
    quotesSheet.getRange(quoteIndex + 1, QUOTE_COLUMNS.LIKES_COUNT + 1).setValue(Math.max(0, likesCount - 1));
    
    return createJsonResponse({ success: true, message: 'تم إلغاء الإعجاب بالاقتباس بنجاح' });
  } catch (error) {
    Logger.log('Error in unlikeQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * حفظ اقتباس
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function saveQuote(e) {
  try {
    const quoteId = e.parameter.quoteId;
    const userId = e.parameter.userId;
    
    if (!quoteId || !userId) {
      return createJsonResponse({ error: 'معرف الاقتباس ومعرف المستخدم مطلوبان' });
    }
    
    // التحقق من وجود الاقتباس
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    let quoteIndex = -1;
    let savesCount = 0;
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][QUOTE_COLUMNS.ID] === quoteId) {
        quoteIndex = i;
        savesCount = quotesData[i][QUOTE_COLUMNS.SAVES_COUNT];
        break;
      }
    }
    
    if (quoteIndex === -1) {
      return createJsonResponse({ error: 'الاقتباس غير موجود' });
    }
    
    // التحقق من عدم وجود حفظ سابق
    const savesSheet = spreadsheet.getSheetByName(SHEETS.SAVES);
    const savesData = savesSheet.getDataRange().getValues();
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < savesData.length; i++) {
      if (savesData[i][SAVE_COLUMNS.USER_ID] === userId && savesData[i][SAVE_COLUMNS.QUOTE_ID] === quoteId) {
        return createJsonResponse({ error: 'المستخدم حفظ الاقتباس بالفعل' });
      }
    }
    
    // إضافة الحفظ
    const saveId = Utilities.getUuid();
    savesSheet.appendRow([
      saveId,
      userId,
      quoteId,
      new Date().toISOString()
    ]);
    
    // تحديث عدد المحفوظات
    quotesSheet.getRange(quoteIndex + 1, QUOTE_COLUMNS.SAVES_COUNT + 1).setValue(savesCount + 1);
    
    return createJsonResponse({ success: true, message: 'تم حفظ الاقتباس بنجاح' });
  } catch (error) {
    Logger.log('Error in saveQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * إلغاء حفظ اقتباس
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function unsaveQuote(e) {
  try {
    const quoteId = e.parameter.quoteId;
    const userId = e.parameter.userId;
    
    if (!quoteId || !userId) {
      return createJsonResponse({ error: 'معرف الاقتباس ومعرف المستخدم مطلوبان' });
    }
    
    // التحقق من وجود الاقتباس
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    let quoteIndex = -1;
    let savesCount = 0;
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][QUOTE_COLUMNS.ID] === quoteId) {
        quoteIndex = i;
        savesCount = quotesData[i][QUOTE_COLUMNS.SAVES_COUNT];
        break;
      }
    }
    
    if (quoteIndex === -1) {
      return createJsonResponse({ error: 'الاقتباس غير موجود' });
    }
    
    // البحث عن الحفظ
    const savesSheet = spreadsheet.getSheetByName(SHEETS.SAVES);
    const savesData = savesSheet.getDataRange().getValues();
    
    let saveIndex = -1;
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < savesData.length; i++) {
      if (savesData[i][SAVE_COLUMNS.USER_ID] === userId && savesData[i][SAVE_COLUMNS.QUOTE_ID] === quoteId) {
        saveIndex = i;
        break;
      }
    }
    
    if (saveIndex === -1) {
      return createJsonResponse({ error: 'المستخدم لم يحفظ الاقتباس' });
    }
    
    // حذف الحفظ
    savesSheet.deleteRow(saveIndex + 1);
    
    // تحديث عدد المحفوظات
    quotesSheet.getRange(quoteIndex + 1, QUOTE_COLUMNS.SAVES_COUNT + 1).setValue(Math.max(0, savesCount - 1));
    
    return createJsonResponse({ success: true, message: 'تم إلغاء حفظ الاقتباس بنجاح' });
  } catch (error) {
    Logger.log('Error in unsaveQuote: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * الحصول على اقتباسات المستخدم
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function getUserQuotes(e) {
  try {
    const userId = e.parameter.userId;
    const page = parseInt(e.parameter.page) || 1;
    const limit = parseInt(e.parameter.limit) || 10;
    
    if (!userId) {
      return createJsonResponse({ error: 'معرف المستخدم مطلوب' });
    }
    
    // إضافة معلمة المرشح لاستخدام وظيفة getQuotes
    e.parameter.filters = JSON.stringify({ userId });
    
    return getQuotes(e);
  } catch (error) {
    Logger.log('Error in getUserQuotes: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * الحصول على الاقتباسات التي أعجب بها المستخدم
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function getLikedQuotes(e) {
  try {
    const userId = e.parameter.userId;
    const page = parseInt(e.parameter.page) || 1;
    const limit = parseInt(e.parameter.limit) || 10;
    
    if (!userId) {
      return createJsonResponse({ error: 'معرف المستخدم مطلوب' });
    }
    
    // الحصول على معرفات الاقتباسات التي أعجب بها المستخدم
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const likesSheet = spreadsheet.getSheetByName(SHEETS.LIKES);
    const likesData = likesSheet.getDataRange().getValues();
    
    const likedQuoteIds = [];
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < likesData.length; i++) {
      if (likesData[i][LIKE_COLUMNS.USER_ID] === userId) {
        likedQuoteIds.push(likesData[i][LIKE_COLUMNS.QUOTE_ID]);
      }
    }
    
    // الحصول على الاقتباسات
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    const likedQuotes = [];
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (likedQuoteIds.includes(quotesData[i][QUOTE_COLUMNS.ID])) {
        likedQuotes.push({
          id: quotesData[i][QUOTE_COLUMNS.ID],
          userId: quotesData[i][QUOTE_COLUMNS.USER_ID],
          text: quotesData[i][QUOTE_COLUMNS.TEXT],
          author: quotesData[i][QUOTE_COLUMNS.AUTHOR],
          source: quotesData[i][QUOTE_COLUMNS.SOURCE],
          tags: quotesData[i][QUOTE_COLUMNS.TAGS],
          createdAt: quotesData[i][QUOTE_COLUMNS.CREATED_AT],
          likesCount: quotesData[i][QUOTE_COLUMNS.LIKES_COUNT],
          savesCount: quotesData[i][QUOTE_COLUMNS.SAVES_COUNT],
          isOriginal: quotesData[i][QUOTE_COLUMNS.IS_ORIGINAL]
        });
      }
    }
    
    // ترتيب الاقتباسات حسب تاريخ الإنشاء (الأحدث أولاً)
    likedQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // تقسيم الاقتباسات إلى صفحات
    const offset = (page - 1) * limit;
    const paginatedQuotes = likedQuotes.slice(offset, offset + limit);
    
    // إضافة معلومات المستخدم لكل اقتباس
    const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    
    const quotesWithUserInfo = paginatedQuotes.map(quote => {
      // البحث عن معلومات المستخدم
      let userInfo = null;
      
      for (let i = 1; i < usersData.length; i++) {
        if (usersData[i][USER_COLUMNS.ID] === quote.userId) {
          userInfo = {
            id: usersData[i][USER_COLUMNS.ID],
            firstName: usersData[i][USER_COLUMNS.FIRST_NAME],
            lastName: usersData[i][USER_COLUMNS.LAST_NAME],
            avatar: usersData[i][USER_COLUMNS.AVATAR]
          };
          break;
        }
      }
      
      return {
        ...quote,
        user: userInfo
      };
    });
    
    return createJsonResponse({
      quotes: quotesWithUserInfo,
      pagination: {
        page,
        limit,
        total: likedQuotes.length,
        totalPages: Math.ceil(likedQuotes.length / limit)
      }
    });
  } catch (error) {
    Logger.log('Error in getLikedQuotes: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}

/**
 * الحصول على الاقتباسات المحفوظة للمستخدم
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function getSavedQuotes(e) {
  try {
    const userId = e.parameter.userId;
    const page = parseInt(e.parameter.page) || 1;
    const limit = parseInt(e.parameter.limit) || 10;
    
    if (!userId) {
      return createJsonResponse({ error: 'معرف المستخدم مطلوب' });
    }
    
    // الحصول على معرفات الاقتباسات المحفوظة للمستخدم
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const savesSheet = spreadsheet.getSheetByName(SHEETS.SAVES);
    const savesData = savesSheet.getDataRange().getValues();
    
    const savedQuoteIds = [];
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < savesData.length; i++) {
      if (savesData[i][SAVE_COLUMNS.USER_ID] === userId) {
        savedQuoteIds.push(savesData[i][SAVE_COLUMNS.QUOTE_ID]);
      }
    }
    
    // الحصول على الاقتباسات
    const quotesSheet = spreadsheet.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    const savedQuotes = [];
    
    // تخطي الصف الأول (رؤوس الأعمدة)
    for (let i = 1; i < quotesData.length; i++) {
      if (savedQuoteIds.includes(quotesData[i][QUOTE_COLUMNS.ID])) {
        savedQuotes.push({
          id: quotesData[i][QUOTE_COLUMNS.ID],
          userId: quotesData[i][QUOTE_COLUMNS.USER_ID],
          text: quotesData[i][QUOTE_COLUMNS.TEXT],
          author: quotesData[i][QUOTE_COLUMNS.AUTHOR],
          source: quotesData[i][QUOTE_COLUMNS.SOURCE],
          tags: quotesData[i][QUOTE_COLUMNS.TAGS],
          createdAt: quotesData[i][QUOTE_COLUMNS.CREATED_AT],
          likesCount: quotesData[i][QUOTE_COLUMNS.LIKES_COUNT],
          savesCount: quotesData[i][QUOTE_COLUMNS.SAVES_COUNT],
          isOriginal: quotesData[i][QUOTE_COLUMNS.IS_ORIGINAL]
        });
      }
    }
    
    // ترتيب الاقتباسات حسب تاريخ الإنشاء (الأحدث أولاً)
    savedQuotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // تقسيم الاقتباسات إلى صفحات
    const offset = (page - 1) * limit;
    const paginatedQuotes = savedQuotes.slice(offset, offset + limit);
    
    // إضافة معلومات المستخدم لكل اقتباس
    const usersSheet = spreadsheet.getSheetByName(SHEETS.USERS);
    const usersData = usersSheet.getDataRange().getValues();
    
    const quotesWithUserInfo = paginatedQuotes.map(quote => {
      // البحث عن معلومات المستخدم
      let userInfo = null;
      
      for (let i = 1; i < usersData.length; i++) {
        if (usersData[i][USER_COLUMNS.ID] === quote.userId) {
          userInfo = {
            id: usersData[i][USER_COLUMNS.ID],
            firstName: usersData[i][USER_COLUMNS.FIRST_NAME],
            lastName: usersData[i][USER_COLUMNS.LAST_NAME],
            avatar: usersData[i][USER_COLUMNS.AVATAR]
          };
          break;
        }
      }
      
      return {
        ...quote,
        user: userInfo
      };
    });
    
    return createJsonResponse({
      quotes: quotesWithUserInfo,
      pagination: {
        page,
        limit,
        total: savedQuotes.length,
        totalPages: Math.ceil(savedQuotes.length / limit)
      }
    });
  } catch (error) {
    Logger.log('Error in getSavedQuotes: ' + error.message);
    return createJsonResponse({ error: error.message });
  }
}
