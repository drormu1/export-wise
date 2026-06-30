# ExportWise - הקשר API

## Quick Load References
- **כללים גלובליים:** `context.md`
- **בעלות על נתונים:** `sub-context/data-context.md`
- **אינדוקס/שליפה ב-Vector:** `sub-context/vector-context.md`
- **חוזה מול לקוח:** `sub-context/client-context.md`

## תחום אחריות (קשיח)
ל-API יש שתי אחריויות בלבד:
1. טעינה/העשרת נתונים.
2. חיפוש ושליפה לטובת AI.

אין אורקסטרציית workflow עסקית רחבה בשלב זה.

## מדיניות ספק בסיס נתונים
- ספק ברירת מחדל נוכחי: SQLite
- ספק אופציונלי/יעד: SQL Server
- חוזי ה-API חייבים להישאר ניטרליים לספק בסיס הנתונים.

## אזורים פונקציונליים
### 1) Data Load
- הפעלת תהליכי seed/enrichment.
- קבלת בקשות טעינה מבוססות `iteration`.
- החזרת מוני insert/skip/failure.
- החזרת סטטוס אינדוקס.

Endpoints מוצעים:
- `POST /data/load/seed` (אופציונלי)
- `POST /data/load/licenses?iteration={n}`
- `GET /data/load/status/{jobId}` (אופציונלי)

### 2) AI Search
- קבלת שאילתה + פילטרים אופציונליים.
- ביצוע hybrid retrieval (SQL + Vector).
- החזרת ראיות תומכות מדורגות ל-grounding של LLM.

Endpoints מוצעים:
- `POST /ai/search`
- `POST /ai/chat`

## חוזה חובה לאחר טעינה
לאחר כל טעינת iteration מוצלחת:
1. שמירת רשומות `licenses` חדשות ב-SQL (מפתחות מורכבים ללא התנגשות).
2. בנייה/רענון של מסמכי חיפוש.
3. יצירת embeddings.
4. Upsert ל-Vector DB.
5. חשיפת סטטוס הצלחה/כשל ברור.

אסור שהזרימה תיעצר בשקט אחרי insert ל-SQL.

## חוזים מינימליים
- **Load request:** `iteration`
- **Load response:** `insertedCount`, `skippedConflictsCount`, `indexedCount`, `indexingStatus`, `jobId` (אופציונלי)
- **Search request:** `query`, `filters` (אופציונלי), `topK` (אופציונלי)
- **Search response:** `answer`, `facts`, `analysis`, `recommendation`, `confidence`, `risks`, `limitationsOrConditions`, `similarCases`, `disclaimer`

## Guardrails
- אין להציג פלט AI כהחלטה רשמית.
- אין להחזיר טענות לא מבוססות כעובדות.
- יש לשמור traceability לרשומות שנשלפו.
