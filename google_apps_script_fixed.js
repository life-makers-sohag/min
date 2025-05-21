/**
 * Google Apps Script لربط منصة Min Jadeed بـ Google Sheets
 * 
 * هذا الملف يحتوي على كود Google Apps Script الذي يربط منصة Min Jadeed بـ Google Sheets
 * ويوفر واجهة برمجة تطبيقات (API) للتفاعل مع البيانات
 */

// معرف جدول البيانات - يجب تحديثه بمعرف جدول البيانات الخاص بك
const SHEET_ID = '1gxuf_TWpglt5XnOz5ZKVF14bC7iZ0jrhWSO5cXcvxyg';

// أسماء أوراق البيانات
const SHEETS = {
  USERS: 'Users',
  QUOTES: 'Quotes',
  LIKES: 'Likes',
  SAVES: 'Saves'
};

// عناوين أعمدة البيانات
const COLUMNS = {
  USERS: ['ID', 'Email', 'Password', 'FirstName', 'LastName', 'LinkedinUrl', 'JoinDate', 'Bio', 'Avatar'],
  QUOTES: ['ID', 'UserID', 'Text', 'Author', 'Source', 'Tags', 'CreatedAt', 'LikesCount', 'SavesCount', 'IsOriginal'],
  LIKES: ['ID', 'UserID', 'QuoteID', 'CreatedAt'],
  SAVES: ['ID', 'UserID', 'QuoteID', 'CreatedAt']
};

/**
 * معالجة طلبات GET
 * @param {Object} e - كائن الطلب
 * @returns {Object} - استجابة JSON
 */
function doGet(e) {
  try {
    Logger.log('GET Request: ' + JSON.stringify(e));
    
    // التحقق من وجود معلمات الطلب
    if (!e || !e.parameter) {
      throw new Error('No parameters provided');
    }
    
    const action = e.parameter.action;
    
    // التحقق من وجود إجراء
    if (!action) {
      throw new Error('No action specified');
    }
    
    // معالجة الإجراء المطلوب
    let result;
    
    switch (action) {
      case 'login':
        result = login(e.parameter.email, e.parameter.password);
        break;
      case 'signup':
        result = signup(e.parameter);
        break;
      case 'checkEmailExists':
        result = checkEmailExists(e.parameter.email);
        break;
      case 'getUser':
        result = getUser(e.parameter.id);
        break;
      case 'updateUser':
        result = updateUser(e.parameter);
        break;
      case 'getQuotes':
        result = getQuotes(e.parameter.page, e.parameter.limit);
        break;
      case 'getQuote':
        result = getQuote(e.parameter.id);
        break;
      case 'getUserQuotes':
        result = getUserQuotes(e.parameter.userId);
        break;
      case 'getLikedQuotes':
        result = getLikedQuotes(e.parameter.userId);
        break;
      case 'getSavedQuotes':
        result = getSavedQuotes(e.parameter.userId);
        break;
      case 'addQuote':
        result = addQuote(e.parameter);
        break;
      case 'updateQuote':
        result = updateQuote(e.parameter);
        break;
      case 'deleteQuote':
        result = deleteQuote(e.parameter.id, e.parameter.userId);
        break;
      case 'likeQuote':
        result = likeQuote(e.parameter.quoteId, e.parameter.userId);
        break;
      case 'unlikeQuote':
        result = unlikeQuote(e.parameter.quoteId, e.parameter.userId);
        break;
      case 'saveQuote':
        result = saveQuote(e.parameter.quoteId, e.parameter.userId);
        break;
      case 'unsaveQuote':
        result = unsaveQuote(e.parameter.quoteId, e.parameter.userId);
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }
    
    return createJsonResponse(result);
  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    return createJsonResponse({ error: error.message });
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
 * يجب تشغيل هذه الدالة مرة واحدة فقط عند إعداد المشروع
 */
function initializeSheets() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // إنشاء أوراق البيانات إذا لم تكن موجودة
    for (const sheetName in SHEETS) {
      if (!ss.getSheetByName(SHEETS[sheetName])) {
        const sheet = ss.insertSheet(SHEETS[sheetName]);
        
        // إضافة عناوين الأعمدة
        sheet.getRange(1, 1, 1, COLUMNS[sheetName].length).setValues([COLUMNS[sheetName]]);
        
        // تنسيق الورقة
        sheet.setFrozenRows(1);
        sheet.getRange(1, 1, 1, COLUMNS[sheetName].length).setBackground('#f3f3f3').setFontWeight('bold');
      }
    }
    
    Logger.log('Sheets initialized successfully');
    return { success: true, message: 'Sheets initialized successfully' };
  } catch (error) {
    Logger.log('Error initializing sheets: ' + error.message);
    return { error: error.message };
  }
}

/**
 * إنشاء بيانات تجريبية
 * يمكن استخدام هذه الدالة لإنشاء بيانات تجريبية للاختبار
 */
function createSampleData() {
  try {
    // إنشاء مستخدمين تجريبيين
    const user1 = signup({
      email: 'user1@example.com',
      password: 'password123',
      firstName: 'أحمد',
      lastName: 'محمد',
      linkedinUrl: 'https://linkedin.com/in/ahmed-mohamed'
    });
    
    const user2 = signup({
      email: 'user2@example.com',
      password: 'password123',
      firstName: 'سارة',
      lastName: 'أحمد',
      linkedinUrl: 'https://linkedin.com/in/sara-ahmed'
    });
    
    // إنشاء اقتباسات تجريبية
    if (user1.user && user1.user.id) {
      addQuote({
        userId: user1.user.id,
        text: 'الحياة ليست عن انتظار العاصفة لتمر، بل عن تعلم الرقص في المطر.',
        author: 'فيفيان غرين',
        source: 'كتاب الحياة',
        tags: 'حياة,إلهام,تفاؤل',
        isOriginal: 'false'
      });
      
      addQuote({
        userId: user1.user.id,
        text: 'النجاح ليس نهائيًا، والفشل ليس قاتلًا: إنها الشجاعة للاستمرار هي ما يهم.',
        author: 'ونستون تشرشل',
        source: 'خطاب',
        tags: 'نجاح,فشل,شجاعة',
        isOriginal: 'false'
      });
    }
    
    if (user2.user && user2.user.id) {
      addQuote({
        userId: user2.user.id,
        text: 'كن التغيير الذي تريد أن تراه في العالم.',
        author: 'مهاتما غاندي',
        source: 'مقولة شهيرة',
        tags: 'تغيير,إلهام,حكمة',
        isOriginal: 'false'
      });
    }
    
    Logger.log('Sample data created successfully');
    return { success: true, message: 'Sample data created successfully' };
  } catch (error) {
    Logger.log('Error creating sample data: ' + error.message);
    return { error: error.message };
  }
}

/**
 * التحقق من وجود بريد إلكتروني
 * @param {string} email - البريد الإلكتروني
 * @returns {Object} - نتيجة التحقق
 */
function checkEmailExists(email) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();
    
    // البحث عن البريد الإلكتروني
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === email) {
        return { exists: true };
      }
    }
    
    return { exists: false };
  } catch (error) {
    Logger.log('Error checking email: ' + error.message);
    return { error: error.message };
  }
}

/**
 * تسجيل الدخول
 * @param {string} email - البريد الإلكتروني
 * @param {string} password - كلمة المرور
 * @returns {Object} - بيانات المستخدم
 */
function login(email, password) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();
    
    // البحث عن المستخدم
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === email && data[i][2] === password) {
        const user = {
          id: data[i][0],
          email: data[i][1],
          firstName: data[i][3],
          lastName: data[i][4],
          linkedinUrl: data[i][5],
          joinDate: data[i][6],
          bio: data[i][7],
          avatar: data[i][8]
        };
        
        return { success: true, user: user };
      }
    }
    
    return { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
  } catch (error) {
    Logger.log('Error logging in: ' + error.message);
    return { error: error.message };
  }
}

/**
 * إنشاء حساب جديد
 * @param {Object} userData - بيانات المستخدم
 * @returns {Object} - بيانات المستخدم الجديد
 */
function signup(userData) {
  try {
    // التحقق من وجود البريد الإلكتروني
    const emailCheck = checkEmailExists(userData.email);
    if (emailCheck.exists) {
      return { error: 'البريد الإلكتروني مستخدم بالفعل' };
    }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();
    
    // إنشاء معرف جديد
    const id = Utilities.getUuid();
    
    // تاريخ الانضمام
    const joinDate = new Date().toISOString();
    
    // إضافة المستخدم الجديد
    sheet.appendRow([
      id,
      userData.email,
      userData.password,
      userData.firstName,
      userData.lastName,
      userData.linkedinUrl || '',
      joinDate,
      userData.bio || '',
      userData.avatar || ''
    ]);
    
    const user = {
      id: id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      linkedinUrl: userData.linkedinUrl || '',
      joinDate: joinDate,
      bio: userData.bio || '',
      avatar: userData.avatar || ''
    };
    
    return { success: true, user: user };
  } catch (error) {
    Logger.log('Error signing up: ' + error.message);
    return { error: error.message };
  }
}

/**
 * الحصول على بيانات المستخدم
 * @param {string} id - معرف المستخدم
 * @returns {Object} - بيانات المستخدم
 */
function getUser(id) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();
    
    // البحث عن المستخدم
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        const user = {
          id: data[i][0],
          email: data[i][1],
          firstName: data[i][3],
          lastName: data[i][4],
          linkedinUrl: data[i][5],
          joinDate: data[i][6],
          bio: data[i][7],
          avatar: data[i][8]
        };
        
        return { success: true, user: user };
      }
    }
    
    return { error: 'المستخدم غير موجود' };
  } catch (error) {
    Logger.log('Error getting user: ' + error.message);
    return { error: error.message };
  }
}

/**
 * تحديث بيانات المستخدم
 * @param {Object} userData - بيانات المستخدم
 * @returns {Object} - بيانات المستخدم المحدثة
 */
function updateUser(userData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.USERS);
    const data = sheet.getDataRange().getValues();
    
    // البحث عن المستخدم
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === userData.id) {
        // تحديث بيانات المستخدم
        if (userData.firstName) sheet.getRange(i + 1, 4).setValue(userData.firstName);
        if (userData.lastName) sheet.getRange(i + 1, 5).setValue(userData.lastName);
        if (userData.linkedinUrl !== undefined) sheet.getRange(i + 1, 6).setValue(userData.linkedinUrl);
        if (userData.bio !== undefined) sheet.getRange(i + 1, 8).setValue(userData.bio);
        if (userData.avatar) sheet.getRange(i + 1, 9).setValue(userData.avatar);
        
        // الحصول على بيانات المستخدم المحدثة
        const updatedUser = {
          id: data[i][0],
          email: data[i][1],
          firstName: userData.firstName || data[i][3],
          lastName: userData.lastName || data[i][4],
          linkedinUrl: userData.linkedinUrl !== undefined ? userData.linkedinUrl : data[i][5],
          joinDate: data[i][6],
          bio: userData.bio !== undefined ? userData.bio : data[i][7],
          avatar: userData.avatar || data[i][8]
        };
        
        return { success: true, user: updatedUser };
      }
    }
    
    return { error: 'المستخدم غير موجود' };
  } catch (error) {
    Logger.log('Error updating user: ' + error.message);
    return { error: error.message };
  }
}

/**
 * الحصول على الاقتباسات
 * @param {number} page - رقم الصفحة
 * @param {number} limit - عدد الاقتباسات في الصفحة
 * @returns {Object} - قائمة الاقتباسات
 */
function getQuotes(page = 1, limit = 10) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.QUOTES);
    const data = sheet.getDataRange().getValues();
    
    // تحويل المعلمات إلى أرقام
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    // حساب الصفحات
    const totalQuotes = data.length - 1; // استبعاد صف العناوين
    const totalPages = Math.ceil(totalQuotes / limit);
    
    // التحقق من صحة رقم الصفحة
    if (page < 1) page = 1;
    if (page > totalPages && totalPages > 0) page = totalPages;
    
    // حساب نطاق الاقتباسات
    const startIndex = (page - 1) * limit + 1; // +1 لاستبعاد صف العناوين
    const endIndex = Math.min(startIndex + limit, data.length);
    
    // جمع الاقتباسات
    const quotes = [];
    for (let i = startIndex; i < endIndex; i++) {
      const quote = {
        id: data[i][0],
        userId: data[i][1],
        text: data[i][2],
        author: data[i][3],
        source: data[i][4],
        tags: data[i][5] ? data[i][5].split(',') : [],
        createdAt: data[i][6],
        likesCount: data[i][7],
        savesCount: data[i][8],
        isOriginal: data[i][9] === 'true'
      };
      
      // الحصول على بيانات المستخدم
      const user = getUser(quote.userId);
      if (user.success) {
        quote.user = {
          id: user.user.id,
          firstName: user.user.firstName,
          lastName: user.user.lastName,
          avatar: user.user.avatar
        };
      }
      
      quotes.push(quote);
    }
    
    return {
      success: true,
      quotes: quotes,
      pagination: {
        page: page,
        limit: limit,
        totalQuotes: totalQuotes,
        totalPages: totalPages
      }
    };
  } catch (error) {
    Logger.log('Error getting quotes: ' + error.message);
    return { error: error.message };
  }
}

/**
 * الحصول على اقتباس محدد
 * @param {string} id - معرف الاقتباس
 * @returns {Object} - بيانات الاقتباس
 */
function getQuote(id) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.QUOTES);
    const data = sheet.getDataRange().getValues();
    
    // البحث عن الاقتباس
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        const quote = {
          id: data[i][0],
          userId: data[i][1],
          text: data[i][2],
          author: data[i][3],
          source: data[i][4],
          tags: data[i][5] ? data[i][5].split(',') : [],
          createdAt: data[i][6],
          likesCount: data[i][7],
          savesCount: data[i][8],
          isOriginal: data[i][9] === 'true'
        };
        
        // الحصول على بيانات المستخدم
        const user = getUser(quote.userId);
        if (user.success) {
          quote.user = {
            id: user.user.id,
            firstName: user.user.firstName,
            lastName: user.user.lastName,
            avatar: user.user.avatar
          };
        }
        
        return { success: true, quote: quote };
      }
    }
    
    return { error: 'الاقتباس غير موجود' };
  } catch (error) {
    Logger.log('Error getting quote: ' + error.message);
    return { error: error.message };
  }
}

/**
 * الحصول على اقتباسات المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - قائمة الاقتباسات
 */
function getUserQuotes(userId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.QUOTES);
    const data = sheet.getDataRange().getValues();
    
    // جمع اقتباسات المستخدم
    const quotes = [];
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === userId) {
        const quote = {
          id: data[i][0],
          userId: data[i][1],
          text: data[i][2],
          author: data[i][3],
          source: data[i][4],
          tags: data[i][5] ? data[i][5].split(',') : [],
          createdAt: data[i][6],
          likesCount: data[i][7],
          savesCount: data[i][8],
          isOriginal: data[i][9] === 'true'
        };
        
        quotes.push(quote);
      }
    }
    
    return { success: true, quotes: quotes };
  } catch (error) {
    Logger.log('Error getting user quotes: ' + error.message);
    return { error: error.message };
  }
}

/**
 * الحصول على الاقتباسات التي أعجب بها المستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - قائمة الاقتباسات
 */
function getLikedQuotes(userId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const likesSheet = ss.getSheetByName(SHEETS.LIKES);
    const likesData = likesSheet.getDataRange().getValues();
    
    // جمع معرفات الاقتباسات التي أعجب بها المستخدم
    const likedQuoteIds = [];
    for (let i = 1; i < likesData.length; i++) {
      if (likesData[i][1] === userId) {
        likedQuoteIds.push(likesData[i][2]);
      }
    }
    
    // الحصول على بيانات الاقتباسات
    const quotes = [];
    for (const quoteId of likedQuoteIds) {
      const quoteResult = getQuote(quoteId);
      if (quoteResult.success) {
        quotes.push(quoteResult.quote);
      }
    }
    
    return { success: true, quotes: quotes };
  } catch (error) {
    Logger.log('Error getting liked quotes: ' + error.message);
    return { error: error.message };
  }
}

/**
 * الحصول على الاقتباسات المحفوظة للمستخدم
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - قائمة الاقتباسات
 */
function getSavedQuotes(userId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const savesSheet = ss.getSheetByName(SHEETS.SAVES);
    const savesData = savesSheet.getDataRange().getValues();
    
    // جمع معرفات الاقتباسات المحفوظة للمستخدم
    const savedQuoteIds = [];
    for (let i = 1; i < savesData.length; i++) {
      if (savesData[i][1] === userId) {
        savedQuoteIds.push(savesData[i][2]);
      }
    }
    
    // الحصول على بيانات الاقتباسات
    const quotes = [];
    for (const quoteId of savedQuoteIds) {
      const quoteResult = getQuote(quoteId);
      if (quoteResult.success) {
        quotes.push(quoteResult.quote);
      }
    }
    
    return { success: true, quotes: quotes };
  } catch (error) {
    Logger.log('Error getting saved quotes: ' + error.message);
    return { error: error.message };
  }
}

/**
 * إضافة اقتباس جديد
 * @param {Object} quoteData - بيانات الاقتباس
 * @returns {Object} - بيانات الاقتباس الجديد
 */
function addQuote(quoteData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.QUOTES);
    
    // إنشاء معرف جديد
    const id = Utilities.getUuid();
    
    // تاريخ الإنشاء
    const createdAt = new Date().toISOString();
    
    // إضافة الاقتباس الجديد
    sheet.appendRow([
      id,
      quoteData.userId,
      quoteData.text,
      quoteData.author || '',
      quoteData.source || '',
      quoteData.tags || '',
      createdAt,
      0, // عدد الإعجابات
      0, // عدد المحفوظات
      quoteData.isOriginal === 'true' ? 'true' : 'false'
    ]);
    
    const quote = {
      id: id,
      userId: quoteData.userId,
      text: quoteData.text,
      author: quoteData.author || '',
      source: quoteData.source || '',
      tags: quoteData.tags ? quoteData.tags.split(',') : [],
      createdAt: createdAt,
      likesCount: 0,
      savesCount: 0,
      isOriginal: quoteData.isOriginal === 'true'
    };
    
    return { success: true, quote: quote };
  } catch (error) {
    Logger.log('Error adding quote: ' + error.message);
    return { error: error.message };
  }
}

/**
 * تحديث اقتباس
 * @param {Object} quoteData - بيانات الاقتباس
 * @returns {Object} - بيانات الاقتباس المحدثة
 */
function updateQuote(quoteData) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.QUOTES);
    const data = sheet.getDataRange().getValues();
    
    // البحث عن الاقتباس
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === quoteData.id) {
        // التحقق من ملكية الاقتباس
        if (data[i][1] !== quoteData.userId) {
          return { error: 'غير مصرح لك بتعديل هذا الاقتباس' };
        }
        
        // تحديث بيانات الاقتباس
        if (quoteData.text) sheet.getRange(i + 1, 3).setValue(quoteData.text);
        if (quoteData.author !== undefined) sheet.getRange(i + 1, 4).setValue(quoteData.author);
        if (quoteData.source !== undefined) sheet.getRange(i + 1, 5).setValue(quoteData.source);
        if (quoteData.tags !== undefined) sheet.getRange(i + 1, 6).setValue(quoteData.tags);
        if (quoteData.isOriginal !== undefined) sheet.getRange(i + 1, 10).setValue(quoteData.isOriginal === 'true' ? 'true' : 'false');
        
        // الحصول على بيانات الاقتباس المحدثة
        const updatedQuote = {
          id: data[i][0],
          userId: data[i][1],
          text: quoteData.text || data[i][2],
          author: quoteData.author !== undefined ? quoteData.author : data[i][3],
          source: quoteData.source !== undefined ? quoteData.source : data[i][4],
          tags: quoteData.tags !== undefined ? quoteData.tags.split(',') : (data[i][5] ? data[i][5].split(',') : []),
          createdAt: data[i][6],
          likesCount: data[i][7],
          savesCount: data[i][8],
          isOriginal: quoteData.isOriginal !== undefined ? quoteData.isOriginal === 'true' : data[i][9] === 'true'
        };
        
        return { success: true, quote: updatedQuote };
      }
    }
    
    return { error: 'الاقتباس غير موجود' };
  } catch (error) {
    Logger.log('Error updating quote: ' + error.message);
    return { error: error.message };
  }
}

/**
 * حذف اقتباس
 * @param {string} id - معرف الاقتباس
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - نتيجة الحذف
 */
function deleteQuote(id, userId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEETS.QUOTES);
    const data = sheet.getDataRange().getValues();
    
    // البحث عن الاقتباس
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === id) {
        // التحقق من ملكية الاقتباس
        if (data[i][1] !== userId) {
          return { error: 'غير مصرح لك بحذف هذا الاقتباس' };
        }
        
        // حذف الاقتباس
        sheet.deleteRow(i + 1);
        
        // حذف الإعجابات والمحفوظات المرتبطة بالاقتباس
        deleteLikesAndSaves(id);
        
        return { success: true, message: 'تم حذف الاقتباس بنجاح' };
      }
    }
    
    return { error: 'الاقتباس غير موجود' };
  } catch (error) {
    Logger.log('Error deleting quote: ' + error.message);
    return { error: error.message };
  }
}

/**
 * حذف الإعجابات والمحفوظات المرتبطة باقتباس
 * @param {string} quoteId - معرف الاقتباس
 */
function deleteLikesAndSaves(quoteId) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    
    // حذف الإعجابات
    const likesSheet = ss.getSheetByName(SHEETS.LIKES);
    const likesData = likesSheet.getDataRange().getValues();
    
    for (let i = likesData.length - 1; i >= 1; i--) {
      if (likesData[i][2] === quoteId) {
        likesSheet.deleteRow(i + 1);
      }
    }
    
    // حذف المحفوظات
    const savesSheet = ss.getSheetByName(SHEETS.SAVES);
    const savesData = savesSheet.getDataRange().getValues();
    
    for (let i = savesData.length - 1; i >= 1; i--) {
      if (savesData[i][2] === quoteId) {
        savesSheet.deleteRow(i + 1);
      }
    }
  } catch (error) {
    Logger.log('Error deleting likes and saves: ' + error.message);
  }
}

/**
 * الإعجاب باقتباس
 * @param {string} quoteId - معرف الاقتباس
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - نتيجة الإعجاب
 */
function likeQuote(quoteId, userId) {
  try {
    // التحقق من وجود الاقتباس
    const quoteResult = getQuote(quoteId);
    if (!quoteResult.success) {
      return { error: 'الاقتباس غير موجود' };
    }
    
    // التحقق من وجود الإعجاب
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const likesSheet = ss.getSheetByName(SHEETS.LIKES);
    const likesData = likesSheet.getDataRange().getValues();
    
    for (let i = 1; i < likesData.length; i++) {
      if (likesData[i][1] === userId && likesData[i][2] === quoteId) {
        return { error: 'أنت معجب بهذا الاقتباس بالفعل' };
      }
    }
    
    // إضافة الإعجاب
    const id = Utilities.getUuid();
    const createdAt = new Date().toISOString();
    
    likesSheet.appendRow([id, userId, quoteId, createdAt]);
    
    // تحديث عدد الإعجابات
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][0] === quoteId) {
        const likesCount = quotesData[i][7] + 1;
        quotesSheet.getRange(i + 1, 8).setValue(likesCount);
        
        return { success: true, likesCount: likesCount };
      }
    }
    
    return { error: 'حدث خطأ أثناء تحديث عدد الإعجابات' };
  } catch (error) {
    Logger.log('Error liking quote: ' + error.message);
    return { error: error.message };
  }
}

/**
 * إلغاء الإعجاب باقتباس
 * @param {string} quoteId - معرف الاقتباس
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - نتيجة إلغاء الإعجاب
 */
function unlikeQuote(quoteId, userId) {
  try {
    // التحقق من وجود الاقتباس
    const quoteResult = getQuote(quoteId);
    if (!quoteResult.success) {
      return { error: 'الاقتباس غير موجود' };
    }
    
    // البحث عن الإعجاب وحذفه
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const likesSheet = ss.getSheetByName(SHEETS.LIKES);
    const likesData = likesSheet.getDataRange().getValues();
    
    let likeFound = false;
    
    for (let i = 1; i < likesData.length; i++) {
      if (likesData[i][1] === userId && likesData[i][2] === quoteId) {
        likesSheet.deleteRow(i + 1);
        likeFound = true;
        break;
      }
    }
    
    if (!likeFound) {
      return { error: 'أنت غير معجب بهذا الاقتباس' };
    }
    
    // تحديث عدد الإعجابات
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][0] === quoteId) {
        const likesCount = Math.max(0, quotesData[i][7] - 1);
        quotesSheet.getRange(i + 1, 8).setValue(likesCount);
        
        return { success: true, likesCount: likesCount };
      }
    }
    
    return { error: 'حدث خطأ أثناء تحديث عدد الإعجابات' };
  } catch (error) {
    Logger.log('Error unliking quote: ' + error.message);
    return { error: error.message };
  }
}

/**
 * حفظ اقتباس
 * @param {string} quoteId - معرف الاقتباس
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - نتيجة الحفظ
 */
function saveQuote(quoteId, userId) {
  try {
    // التحقق من وجود الاقتباس
    const quoteResult = getQuote(quoteId);
    if (!quoteResult.success) {
      return { error: 'الاقتباس غير موجود' };
    }
    
    // التحقق من وجود الحفظ
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const savesSheet = ss.getSheetByName(SHEETS.SAVES);
    const savesData = savesSheet.getDataRange().getValues();
    
    for (let i = 1; i < savesData.length; i++) {
      if (savesData[i][1] === userId && savesData[i][2] === quoteId) {
        return { error: 'أنت حافظ لهذا الاقتباس بالفعل' };
      }
    }
    
    // إضافة الحفظ
    const id = Utilities.getUuid();
    const createdAt = new Date().toISOString();
    
    savesSheet.appendRow([id, userId, quoteId, createdAt]);
    
    // تحديث عدد المحفوظات
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][0] === quoteId) {
        const savesCount = quotesData[i][8] + 1;
        quotesSheet.getRange(i + 1, 9).setValue(savesCount);
        
        return { success: true, savesCount: savesCount };
      }
    }
    
    return { error: 'حدث خطأ أثناء تحديث عدد المحفوظات' };
  } catch (error) {
    Logger.log('Error saving quote: ' + error.message);
    return { error: error.message };
  }
}

/**
 * إلغاء حفظ اقتباس
 * @param {string} quoteId - معرف الاقتباس
 * @param {string} userId - معرف المستخدم
 * @returns {Object} - نتيجة إلغاء الحفظ
 */
function unsaveQuote(quoteId, userId) {
  try {
    // التحقق من وجود الاقتباس
    const quoteResult = getQuote(quoteId);
    if (!quoteResult.success) {
      return { error: 'الاقتباس غير موجود' };
    }
    
    // البحث عن الحفظ وحذفه
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const savesSheet = ss.getSheetByName(SHEETS.SAVES);
    const savesData = savesSheet.getDataRange().getValues();
    
    let saveFound = false;
    
    for (let i = 1; i < savesData.length; i++) {
      if (savesData[i][1] === userId && savesData[i][2] === quoteId) {
        savesSheet.deleteRow(i + 1);
        saveFound = true;
        break;
      }
    }
    
    if (!saveFound) {
      return { error: 'أنت غير حافظ لهذا الاقتباس' };
    }
    
    // تحديث عدد المحفوظات
    const quotesSheet = ss.getSheetByName(SHEETS.QUOTES);
    const quotesData = quotesSheet.getDataRange().getValues();
    
    for (let i = 1; i < quotesData.length; i++) {
      if (quotesData[i][0] === quoteId) {
        const savesCount = Math.max(0, quotesData[i][8] - 1);
        quotesSheet.getRange(i + 1, 9).setValue(savesCount);
        
        return { success: true, savesCount: savesCount };
      }
    }
    
    return { error: 'حدث خطأ أثناء تحديث عدد المحفوظات' };
  } catch (error) {
    Logger.log('Error unsaving quote: ' + error.message);
    return { error: error.message };
  }
}
