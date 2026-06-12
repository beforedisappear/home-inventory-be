# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Local infra (Mongo + Redis + MinIO + Mailpit)
docker compose up -d

# Dev
npm run start:dev       # nest start --watch
npm run start:debug     # with --inspect

# Build / verify
npm run build           # nest build (TypeScript check + emit)
npm run start:prod      # node dist/main

# Quality
npm run lint            # eslint --fix on src+test
npm run format          # prettier --write (uses @ianvs sort-imports plugin)
npm test                # jest, src/**/*.spec.ts
npm test -- path/to/file.spec.ts   # single file
npm run test:e2e        # test/jest-e2e.json
```

Pre-commit hook runs `lint-staged` (prettier + eslint --fix on staged files) via Husky.

## Architecture

NestJS 11 + MongoDB modular monolith. Layers, top-down:

```
src/
├── api/          # feature modules — per-domain HTTP and business logic
├── config/       # forRootAsync factories for ConfigService-driven setup
├── infra/        # self-hosted infrastructure modules
├── libs/         # third-party service adapters
├── shared/       # cross-cutting primitives accessible from anywhere
├── app.module.ts # root module — wires ConfigModule + infra + libs + api
└── main.ts       # app entry point
```

Path alias: `@/*` → `src/*` (tsconfig + nest-cli).

### Feature module convention

Every `src/api/<feature>/` follows the same shape:

```
<feature>/
├── controllers/       # HTTP layer, @Authorized() + @UserId() from src/shared/decorators
├── services/          # business logic
├── processors/        # BullMQ workers (@Processor + WorkerHost) — queue-side entry points
├── interceptors/      # NestJS interceptors specific to the feature (e.g. file upload)
├── repositories/      # Mongoose access — only layer touching `model`
├── dto/               # request/response shapes with class-validator
├── interfaces/        # internal data types passed service → repo (see below)
├── mappers/           # Document → ResponseDto
├── schemas/           # @Schema classes, TimestampedDocument<T>
├── constants/         # enums, config objects
└── <feature>.module.ts
```

`processors/` and `interceptors/` are present only in modules that need them (e.g. `item/`).

### Circular dependency pattern

Several modules cross-reference each other (Item ↔ Container, Item ↔ Category). Each side uses **`forwardRef`** at both the module import and the constructor inject:

```ts
// item.module.ts
imports: [forwardRef(() => CategoryModule)]

// item.service.ts
@Inject(forwardRef(() => CategoryService))
private readonly categoryService: CategoryService
```

Modules expose only their **Service** (not repository) in `exports`. Cross-module calls go through services so cascade/validation logic lives in the owning module. E.g. `CategoryService.delete` calls `itemService.unsetCategoryFromAll(id)` for cascade null on items.

### Ownership model

- **Per-user** (have `ownerId`): User, Container, Item.
- **Global** (no `ownerId`): Category, ContainerRule. Edited by any authenticated user.
- Service layer enforces ownership on per-user resources (`findByIdAndOwner` + 404).

### Seed-on-startup pattern

Modules with default data (`CategorySeedService`, `ContainerRuleSeedService`) implement `OnModuleInit` and call `repo.upsertByName(...)` — idempotent on a unique-indexed field. Re-runs on every boot, so deleted defaults are restored (intentional). Renaming a default creates a duplicate of the original on next boot — known tradeoff.

### Photo upload flow (Item)

Decoupled from S3 paths in the client API:

1. Client `POST /items/photo` (multipart, single file) → `ItemPhotoFileInterceptor` (mime whitelist + size limit) → server uploads to S3 under `users/<userId>/<uuid>.<ext>` → returns `{ key, url, mimeType, size }`.
2. Client passes `photos: [key, key, ...]` (key-only) to `POST/PATCH /items/:id`.
3. `ItemPhotoService.resolve()` diffs against existing photos, validates ownership (key starts with `userStoragePrefix(ownerId)`), and `HEAD`s each new key for trusted metadata. Removed keys deleted from S3.
4. On upload, a BullMQ job enqueues background compression (`item-photo` queue) → `ItemPhotoCompressProcessor` rewrites the same key in-place (format preserved, sharp + mozjpeg/png/webp) → `ItemRepository.updatePhotoSize` syncs size.

Two race scenarios (attach-then-compress, compress-then-attach) both converge correctly because the worker uses positional `$` update by `photos.key` (no-op if not yet attached) and the attach path always re-`HEAD`s.

### BullMQ

- Global `defaultJobOptions` (attempts: 3, exponential backoff, removeOnComplete, removeOnFail: 100) set in `getBullConfig` → `forRoot`. Per-queue `registerQueue` and per-call `add` only override when needed.
- Bull-Board mounted at `QUEUES_ROUTE` (excluded from global `/api` prefix in `main.ts`).

### Bootstrap (main.ts)

- Global prefix `/api`, URI versioning with `defaultVersion: '1'` → routes resolve as `/api/v1/...`. `QUEUES_ROUTE` is excluded from the prefix.
- Global `ValidationPipe` config in `src/config`; class-validator + class-transformer drive DTO validation.
- Winston logger via `nest-winston` set as the Nest logger.
- `@nestjs/swagger` CLI plugin (`nest-cli.json`) auto-derives schemas from DTO types — most DTOs don't need `@ApiProperty`.

## Domain notes

- **Items**: live under a Container, optionally tagged with one Category. `GET /items` accepts optional `containerId`, `categoryId`, `q` (case-insensitive regex over name+description). All three AND-combine. `containerId` alone is browse-mode (one level); search across the subtree is a planned extension via `ContainerRepository.findSubtreeIds`.
- **Containers**: per-user tree (`parentId`, `rootId`). Movement validates against `ContainerRule` (allowed parents per kind). Root containers have `parentId: null, kind: null`.
- **Categories**: flat, global, name-unique. Delete cascades to `item.categoryId = null`.

See README.md for the full functional roadmap (auth, items, containers, categories, documents, reminders, cache, exports).
