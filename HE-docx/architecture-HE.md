# architecture.md

# ארכיטקטורה - פלטפורמת תמיכת החלטה רגולטורית לייצוא מזון מבוססת AI

## 1. מטרה

מסמך זה מתאר את ארכיטקטורת היעד של המערכת.
המטרה היא להכווין מימוש בלי לנעול החלטות low-level מוקדם מדי.

POC מקצה לקצה כולל:
- בסיס נתונים SQL Server
- Seed עם 1000 החלטות ועדה היסטוריות
- API ב-NestJS
- Frontend ב-Angular בסגנון ChatGPT
- שכבת חיפוש
- הכנה ל-Vector DB עתידי
- תמיכה אופציונלית ב-LLM / RAG

Authentication ו-Authorization מחוץ לסקופ בשלב זה.

---

## 2. פילוסופיית ארכיטקטורה

יש להתייחס לפרויקט כאל:

```text
מנוע חיפוש + אנליסט AI
```

מנוע החיפוש מאתר ראיות רלוונטיות.  
ה-AI מסביר מה משמעות הראיות.

ה-LLM אינו מקור אמת.  
מקור האמת הוא נתוני היישום:
- SQL Server
- החלטות ועדה היסטוריות
- נתוני מוצרים
- נתוני מדינות
- סיבות אישור/דחייה
- תנאים וסיכונים

---

## 3. דיאגרמת מערכת ברמת על

```text
Angular Frontend
      |
      v
NestJS API
      |
      v
Application Services
      |\
      | \--> Vector Search Abstraction --> Vector DB
      |
      +----> SQL Server (Source of Truth)
      |
      v
LLM Provider Layer (Claude/GPT/Gemma/Mock)
```

---

## 4. רכיבים עיקריים

### 4.1 Angular Frontend
- חוויית משתמש פשוטה בסגנון ChatGPT
- הצגת תשובות AI, מקרים דומים, סיכונים, תנאים, ורמת ביטחון
- סימון ברור שהתשובה מייעצת בלבד
- ללא לוגיקה עסקית בצד לקוח

### 4.2 NestJS Backend API
- שכבת אורקסטרציה מרכזית
- חשיפת REST endpoints
- Validation ל-DTOs
- שליפה מ-SQL
- חיפוש מובנה/סמנטי
- בניית הקשר ל-AI וקריאה ל-LLM
- החזרת תשובה מובנית

### 4.3 SQL Server
- מקור האמת הראשי
- מכיל נתוני POC + seed
- שלב ראשון עם ~1000 החלטות

### 4.4 Seed Data
- קריטי ל-POC בהיעדר דאטה אמיתי
- חייב לדמות היסטוריה ריאליסטית מגוונת
- לכלול Approved / Rejected / Approved with conditions

---

## 5. מודל נתונים קונספטואלי

ישויות ליבה:
- `Country`
- `Manufacturer`
- `Product`
- `CommitteeDecision`

ניתן לבצע נורמליזציה נוספת לפי צורך, בלי הנדסת יתר.

---

## 6. ארכיטקטורת חיפוש

### 6.1 Structured Search (SQL)
לשאילתות עם פילטרים מדויקים:
- מדינה
- קטגוריה
- סטטוס החלטה
- יצרן
- מרכיבים

### 6.2 Semantic Search (Vector)
איתור משמעות דומה גם בלי התאמה טקסטואלית מלאה.

### 6.3 Hybrid Search
יעד ארוך טווח:

```text
SQL filters + Vector similarity
```

זרימה מומלצת:
1. סינון מועמדים ב-SQL
2. דמיון סמנטי ב-Vector
3. דירוג מחדש
4. העברת top results ל-LLM

---

## 7. אסטרטגיית Vector DB

ספק ה-Vector DB עדיין לא נבחר.
יש לשים abstraction נקי ולא לקשור את הקוד לספק יחיד.

אפשרויות:
- Qdrant
- PostgreSQL + pgvector
- Azure AI Search
- Elasticsearch/OpenSearch
- Pinecone

ממשק קונספטואלי:

```typescript
interface VectorSearchPort {
  indexDocument(document: SearchDocument): Promise<void>;
  searchSimilar(query: string, limit: number): Promise<SearchResult[]>;
  rebuildIndex(): Promise<void>;
}
```

---

## 8. עיצוב Search Document

כל החלטת ועדה תומר למסמך טקסטואלי הכולל:
- מדינה
- מוצר וקטגוריה
- מרכיבים
- יצרן
- סטטוס החלטה
- סיבה
- תנאים
- סיכונים
- תאריך החלטה

שימושים:
- Embeddings
- Semantic Search
- RAG context
- דיבוג תוצאות חיפוש

---

## 9. ארכיטקטורת RAG

```text
שאלת משתמש
   |
   v
שליפת החלטות היסטוריות רלוונטיות
   |
   v
בניית prompt עם הקשר שנשלף
   |
   v
קריאה ל-LLM
   |
   v
תשובה מבוססת נתונים
```

ה-LLM לא אמור לענות מזיכרון בלבד.

---

## 10. אסטרטגיית ספק LLM

אין לקבע ספק יחיד.
יש abstraction לספקי LLM.

אפשרויות:
- Claude
- GPT
- Gemma
- Mock LLM לפיתוח מקומי

---

## 11. זרימת המלצה (`POST /recommendations`)

1. קבלת בקשה מובנית
2. Validation
3. בניית שאילתת חיפוש
4. שליפת החלטות היסטוריות
5. בחירת מקרים דומים
6. בניית הקשר ל-AI
7. קריאה ל-LLM/Mock
8. החזרת תשובה מובנית

שדות תשובה צפויים:
- Recommendation
- Confidence
- Risks
- Suggested conditions
- Similar cases
- Explanation
- Advisory disclaimer

---

## 12. זרימת צ'אט (`POST /chat`)

1. קבלת הודעה בשפה טבעית
2. זיהוי intent (אם נדרש)
3. שליפת מידע היסטורי רלוונטי
4. בניית RAG context
5. קריאה ל-LLM/Mock
6. החזרת תשובה + מקרים תומכים

---

## 13. גבולות API

Endpoints מוצעים:
- `GET /health`
- `POST /chat`
- `POST /recommendations`
- `GET /decisions/search`
- `POST /index/rebuild`

יש לשמור API פשוט לשלב ה-POC.

---

## 14. ארכיטקטורת UI ב-Angular

מסכים עיקריים:
- מסך צ'אט
- פנל פרטי החלטה (אופציונלי)
- פנל מקרים דומים (אופציונלי)

התנהגות עיקרית:
- שליחת שאלה
- הצגת loading
- הצגת תשובת עוזר
- הצגת סיכונים ותנאים בצורה קריאה

---

## 15. הפרדת אחריויות

### Frontend
אחראי על UX ותצוגה בלבד.

### Backend
אחראי על API, אורקסטרציה, חיפוש, RAG ואינטגרציית LLM.

### SQL Server
מקור אמת לנתונים מובנים והיסטוריה עסקית.

### Vector DB
אחראי על שליפה סמנטית.

### LLM
אחראי על ניסוח, סיכום, נימוק והמלצה מייעצת.
לא אחראי על קבלת החלטה רשמית או אחסון נתונים.

---

## 16. חוזה תגובת AI

תשובת AI צריכה להיות מובנית ולכלול:
- `answer`
- `facts`
- `analysis`
- `recommendation`
- `confidence`
- `risks`
- `suggestedConditions`
- `similarCases`
- `disclaimer`

---

## 17. Guardrails ל-AI

- ה-AI לא מציג החלטה רשמית.
- אין המצאת החלטות היסטוריות.
- אם חסר מידע, אומרים זאת במפורש.
- הפרדה בין עובדות לניתוח.
- צירוף מקרים תומכים ככל האפשר.

---

## 18. שלבי פיתוח

### Phase 1 - Foundation
- יצירת NestJS API
- יצירת Angular app
- יצירת סכימת SQL
- יצירת seed data
- endpoint בריאות

### Phase 2 - Data and Search
- טעינת 1000 רשומות היסטוריות
- חיפוש SQL
- המרת החלטות למסמכי חיפוש
- endpoint לבניית אינדקס

### Phase 3 - Mock Semantic Search
- abstraction ל-vector search
- מימוש mock/local search
- החזרת similar cases

### Phase 4 - AI Recommendation
- abstraction ל-LLM
- מימוש Mock LLM
- מבנה prompt ל-RAG
- תגובה AI מובנית

### Phase 5 - Chat UI
- מסך צ'אט
- חיבור ל-`/chat`
- תצוגת תשובה מובנית

### Phase 6 - Real Vector DB
- בחירת ספק
- יצירת embeddings
- אחסון vectors
- מימוש semantic search אמיתי

### Phase 7 - Real LLM
- חיבור ספק אמיתי
- שיפור prompts
- אימות תגובה
- ציטוטים טובים יותר למקרים דומים

---

## 19. החלטות ארכיטקטוניות מרכזיות

1. SQL Server הוא מקור האמת.
2. Vector DB מאחורי abstraction.
3. LLM מאחורי abstraction.
4. RAG הוא תבנית ה-AI היעד.
5. Angular תלוי בחוזי API בלבד.
6. ללא Authentication בגרסה ראשונה.

---

## 20. מה לא לעשות

- לא לבנות Authentication עכשיו.
- לא לבצע הנדסת יתר לסכמה.
- לא לקבע ספק Vector DB יחיד.
- לא לקבע ספק LLM יחיד.
- לא להמציא עובדות.
- לא לרכז את כל הלוגיקה ב-controllers.
- לא להעביר אחריות החלטה עסקית ל-frontend.
- לא להתייחס ל-LLM כאל בסיס נתונים.

---

## 21. קריטריוני הצלחה

הארכיטקטורה מצליחה כאשר:
1. משתמש פותח את אפליקציית Angular.
2. המשתמש שואל שאלה במסך צ'אט.
3. ה-API מקבל את השאלה.
4. ה-API מחפש החלטות היסטוריות.
5. המערכת שולפת מקרים דומים.
6. נוצרת תשובה מייעצת.
7. התשובה כוללת סיכונים, תנאים, רמת ביטחון ומקרים תומכים.
8. הארכיטקטורה מוכנה לספק Vector DB ו-LLM אמיתיים בהמשך.

---

## 22. נקודות הרחבה ארוכות טווח

אפשרויות הרחבה עתידיות:
- Authentication
- הרשאות לפי תפקיד
- Audit logs
- מסמכי רגולציה אמיתיים
- העלאת מסמכים
- משוב ועדה
- Workflow החלטות
- Knowledge graph
- תמיכה רב-לשונית
- אנליטיקה מתקדמת
- אינטגרציה ל-APIs רגולטוריים
- פריסת ייצור
