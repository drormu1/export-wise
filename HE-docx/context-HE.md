# ExportWise - הקשר גלובלי של הפרויקט

## מטרה
ExportWise היא מערכת תמיכת החלטה לייצוא מזון בסיוע AI.
ה-AI הוא מייעץ בלבד; ההחלטה הסופית תמיד שייכת לוועדה האנושית.

## Quick Load References
- **לטעון תמיד ראשון:** `context.md`
- **התנהגות API:** `sub-context/api-context.md`
- **מודל נתונים עסקי:** `sub-context/data-context.md`
- **כללי Vector/Indexing:** `sub-context/vector-context.md`
- **גבולות Frontend:** `sub-context/client-context.md`
- **ארכיטקטורה עמוקה:** `architecture.md`
- **רפרנס פרויקט:** `PROJECT.md`

## כללים מחייבים
- בסיס הנתונים ה-SQL הוא מקור האמת לנתונים עסקיים.
- SQLite הוא בסיס הנתונים ברירת המחדל ל-POC הנוכחי.
- יש לשמור תאימות ל-SQL Server לצורך מעבר/הרצה עתידית.
- Vector DB שומר ארטיפקטים של שליפה/אינדוקס שמופקים מ-SQL.
- LLM משמש לניתוח והסבר, לא לאחסון נתונים.
- תשובות AI חייבות להפריד בין עובדות לניתוח ולכלול הסתייגות מייעצת.
- אין להמציא החלטות היסטוריות.

## פרופיל בסיס נתונים (נוכחי)
- ספק ברירת מחדל: SQLite
- ספק אופציונלי/יעד: SQL Server
- כלל תכנון: שכבת נתונים אגנוסטית לספק (`sqlite | sqlserver`)

## תשתית נתונים לשלב 1
Seed בסיסי נדרש:
- `manufacturers` (200 רשומות)
- `countries` (200 רשומות)
- `products` (200 רשומות)

טבלה מיוצרת:
- `licenses` עם מפתח מורכב (`manufacturer_code`, `product_code`, `country_code`)
- שדות מינימום: `manufacturer_code`, `product_code`, `country_code`, `decision_status`, `limitations`

## חוזה כלי Iteration
כלי צדדי מקבל `iteration` ומעשיר את `licenses` באמצעות קודים תקפים מטבלאות הבסיס.
הוא מכניס רק מפתחות מורכבים ללא התנגשות וניתן להרצה חוזרת.

## סנכרון חובה SQL -> Vector
כל איטרציית העשרה מוצלחת חייבת להפעיל אינדוקס:
1. שמירת רשומות `licenses` חדשות ב-SQL.
2. בנייה/רענון של מסמכי שליפה מנתוני SQL.
3. יצירת embeddings.
4. Upsert ל-Vector DB.
5. חשיפת סטטוס אינדוקס ופרטי כשל שניתנים ל-retry.

כשל אינדוקס שקט אינו מותר.

## זרימת Retrieval בזמן ריצה
1. Angular שולח בקשה ל-API.
2. ה-API שולף ראיות (SQL + Vector).
3. ה-API בונה הקשר LLM מבוסס נתונים.
4. ה-LLM מחזיר פלט מייעץ מובנה.
5. ה-API מחזיר המלצה, רמת ביטחון, סיכונים, תנאים ומקרים דומים תומכים.

## מחוץ לסקופ (POC נוכחי)
- Authentication/authorization
- ניהול workflow מלא
- הקשחת production
