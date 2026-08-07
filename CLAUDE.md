@AGENTS.md

# Farovon Awards — правила и карта проекта

Корпоративный портал премии Farovon Group. Next.js 16 (App Router) + React 19 +
Prisma 5 + PostgreSQL (Supabase) + NextAuth v5 (beta, Credentials). Подробное
описание фич и стека — в [README.md](README.md), процесс деплоя — в
[DEPLOY.md](DEPLOY.md). **Важно:** раздел «Архитектура проекта» в README.md
устарел — он не упоминает `jury/`, `cabinet/`, `login/`, `register/` и
`admin/(dash)/sync|users|results`. Не доверяй README при поиске файлов —
смотри реальную структуру в `src/app`.

## Next.js 16: не middleware.ts, а proxy.ts

В этой версии Next.js `middleware.ts` заменён на **`src/proxy.ts`**
(экспорт `proxy`, не `middleware`). Именно там лежит вся защита маршрутов и
рейт-лимитинг — не создавай `middleware.ts` по привычке из тренировочных
данных, файл с таким именем в этом проекте не подключится.

## Роли и разделы

Три роли (`User.role`: `ADMIN`, `JUDGE`, `EMPLOYEE`) + анонимные посетители.
Админ — не строка в `User`, а `ADMIN_USERNAME`/`ADMIN_PASSWORD` из env
(см. `src/auth.ts`).

| Раздел | Кто | Защита |
|---|---|---|
| `/`, `/apply` | Аноним | публично; `/api/apply` — анонимная подача заявки |
| `/admin/*` | `ADMIN` | `src/proxy.ts` (edge) + повторная проверка в `admin/(dash)/layout.tsx` |
| `/jury/*` | `JUDGE` | то же самое, `jury/layout.tsx` |
| `/cabinet/*` | `EMPLOYEE` | то же самое, `cabinet/layout.tsx` |
| `/login`, `/register` | Аноним | `/register` **отключена** — редиректит на `/login`; аккаунты JUDGE/EMPLOYEE создаёт только админ |

Защита трёхслойная (defense in depth): `src/proxy.ts` — первичная (matcher
покрывает `/admin`, `/jury`, `/cabinet`, `/login`, `/register`, `/api/apply`,
`/api/upload`), layout-компоненты — вторичная, `auth.ts` `jwt` callback раз в
60 сек перечитывает `role`/`isActive` из БД, чтобы деактивация аккаунта
применялась к уже открытым сессиям без релогина.

## Модели Prisma (`prisma/schema.prisma`)

`Nomination`, `Application` (+ `JuryScore` — по одной оценке на пару
заявка×судья, `@@unique([applicationId, judgeId])`), `Winner`, `Gallery`,
`HeroSlide`, `SiteContent` (key-value для текстов), `User`.

JSON хранится как `String` в текстовых колонках (`criteria`, `steps`, `tags`,
`employeeData`, `formData`) — не парсить напрямую через `JSON.parse`, а через
`src/lib/safe-json.ts` (`safeParseObject`/`safeParseArray`): одна битая
запись не должна ронять весь список в админке/у жюри.

## Файлы: только через Supabase Storage

На Vercel файловая система эфемерна (и read-only вне `/tmp`) — **никогда не
писать** в `public/uploads` или `fs.writeFile` во время выполнения. Всё
загруженное идёт через `src/lib/storage.ts` (сервисный ключ Supabase) и
отдаётся обратно через прокси-роут `src/app/uploads/[...path]/route.ts`, так
что пути в БД остаются вида `/uploads/...`. Общий лимит хранилища — 2 ГБ,
считается в `src/lib/upload-guard.ts` (`wouldExceedBudget`/`noteWritten`/
`noteDeleted`) — обновлять счётчик при каждой записи/удалении файла.

## Непроверенные URL — только через safe-url.ts

`Application.photoUrl` / `presentationUrl` заполняются через анонимный
`POST /api/apply`, то есть контролируются атакующим. Перед рендером в
`href`/`src`/`iframe` — обязательно через `src/lib/safe-url.ts`
(`isLocalUpload`, `isLocalPdf`, `isHttpLink`), иначе это открытый вектор для
инъекции в доверенный интерфейс админки/жюри.

## Прочие правила из кода

- Самостоятельная регистрация выключена намеренно (см. `src/proxy.ts`) —
  не предлагать её включать без явного запроса.
- Рейт-лимит и лок аккаунта (`src/proxy.ts`, `src/auth.ts`) — in-memory
  `Map`, рассчитан на один процесс. При переходе на кластер/несколько
  инстансов это нужно вынести в Redis/Postgres — учитывай это, если проект
  когда-нибудь перейдёт на несколько инстансов вместо одного PM2-процесса.
- CRUD для админки — server actions в `src/app/admin/actions.ts`, не
  отдельные route handlers (кроме `sync-winners`, `apply`, `jury/*`, `upload*`,
  у которых есть конкретная причина быть route handler'ом — стрим/внешний
  вызов/анонимный доступ).
- Синхронизация победителей из Google Таблиц — `src/lib/sheets.ts` (CSV-парсер
  + извлечение ID таблицы) + `src/app/admin/(dash)/sync/`.
- Секреты: `.env*`, `*.ppk`, `*.pem`, `*.key` и т.п. в `.gitignore` — не
  предлагать коммитить их даже по просьбе «сохранить для истории».
