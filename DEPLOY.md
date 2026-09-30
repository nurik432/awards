# Деплой: Supabase + Vercel

Код уже подготовлен: Prisma переведена на PostgreSQL, загрузка файлов — на Supabase Storage
(через прокси-роут `/uploads/[...path]`, так что все существующие `/uploads/...` пути в БД
и проверки в `src/lib/safe-url.ts` работают без изменений). Ниже — что нужно сделать руками.

## 1. Supabase — база данных

1. [supabase.com/dashboard](https://supabase.com/dashboard/projects) → **New project**.
2. Дождаться инициализации проекта (1–2 минуты).
3. **Settings → Database → Connection string**:
   - Скопировать **Transaction pooler** (порт 6543, `?pgbouncer=true`) → это `DATABASE_URL`.
   - Скопировать **Session/Direct connection** (порт 5432) → это `DIRECT_URL`.
   - Вставить свой пароль от базы в оба URL вместо `[YOUR-PASSWORD]`.

## 2. Supabase — хранилище файлов

1. **Storage** (в левом меню) → **New bucket**.
2. Имя бакета: `uploads`. **Public bucket — оставить выключенным** (приватный).
   Файлы отдаются через собственный роут приложения (`/uploads/...`) с сервисным ключом,
   публичный доступ к бакету не нужен и не должен включаться.
3. **Settings → API**:
   - `Project URL` → это `SUPABASE_URL`.
   - `Project API keys → service_role` (секретный, не anon!) → это `SUPABASE_SERVICE_ROLE_KEY`.

## 3. GitHub

Репозиторий уже подключён и код запушен в `https://github.com/nurik432/awards`.

## 4. Vercel

1. [vercel.com/new](https://vercel.com/new) → импортировать репозиторий `nurik432/awards`.
2. Framework Preset определится автоматически как Next.js — ничего менять не нужно.
3. **Environment Variables** — добавить все переменные (для Production, Preview и Development):

   | Переменная | Значение |
   |---|---|
   | `DATABASE_URL` | из шага 1 (pooler, порт 6543) |
   | `DIRECT_URL` | из шага 1 (direct, порт 5432) |
   | `SUPABASE_URL` | из шага 2 |
   | `SUPABASE_SERVICE_ROLE_KEY` | из шага 2 |
   | `SUPABASE_UPLOADS_BUCKET` | `uploads` |
   | `AUTH_SECRET` | сгенерировать: `openssl rand -base64 32` |
   | `ADMIN_USERNAME` | свой логин админа |
   | `ADMIN_PASSWORD` | свой надёжный пароль |
   | `NEXT_PUBLIC_APP_URL` | будет вида `https://awards-xxxx.vercel.app` (можно поставить после первого деплоя и передеплоить) |

4. **Deploy**. Первая сборка снимет схему через `postinstall: prisma generate` (не требует
   подключения к БД) и соберёт Next.js.

## 5. Применить схему и засеять базу

Таблиц в новой Supabase-базе ещё нет — их нужно создать один раз. Проще всего локально,
указав `.env` на продовую базу:

```powershell
cd C:\Users\Nurik\awards-main
# .env уже в .gitignore — создаём его только локально, в GitHub не попадёт
Copy-Item .env.example .env
# открыть .env и вставить туда те же значения DATABASE_URL / DIRECT_URL / SUPABASE_*,
# что и в Vercel

npm install
npx prisma db push        # создаёт таблицы по schema.prisma
npx tsx prisma/seed.ts    # (опционально) начальные номинации/победители/галерея
```

После этого на сайте должны появиться данные.

Затем применить SQL из `supabase/migrations/` (SQL Editor в дашборде или
`supabase db push`): он включает RLS на всех таблицах, отзывает права ролей
`anon`/`authenticated` (иначе через публичный REST API Supabase можно читать и
менять любые таблицы, включая `User`) и создаёт приватный бакет `uploads`.
Приложению это не мешает: Prisma ходит под `postgres`, хранилище — под
`service_role`, обе роли обходят RLS. Если бакета всё же нет, `src/lib/storage.ts`
создаст его сам при первой загрузке.

## 6. Проверка

- Открыть `https://<project>.vercel.app` — должна загрузиться главная страница с номинациями.
- `/admin/login` — войти под `ADMIN_USERNAME` / `ADMIN_PASSWORD`.
- В админке загрузить тестовое фото (галерея или заявка) — проверить, что оно открывается
  по ссылке `/uploads/...` (значит Supabase Storage подключён верно).
- Проверить, что после **редеплоя** (Vercel → Redeploy) загруженный файл никуда не пропал —
  это подтверждает, что хранение теперь постоянное, а не на диске инстанса.

## Что изменилось в коде ради этого деплоя

- `prisma/schema.prisma` — `provider: postgresql` вместо `sqlite`, добавлен `directUrl`.
- `src/lib/storage.ts` — новый: клиент Supabase Storage.
- `src/app/api/upload/route.ts`, `src/app/api/upload/presentation/route.ts` — пишут в Storage
  вместо `fs.writeFile`.
- `src/app/uploads/[...path]/route.ts` — новый: отдаёт файлы из Storage по тем же
  `/uploads/...` путям, что и раньше.
- `src/app/admin/actions.ts` — удаление файла теперь идёт через Storage API.
- `src/lib/upload-guard.ts` — общий лимит хранилища (2 ГБ) теперь считается по Storage,
  а не по локальному диску.
- `.env.example` — добавлены переменные Supabase.
