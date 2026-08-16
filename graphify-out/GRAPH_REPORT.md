# Graph Report - helios  (2026-08-16)

## Corpus Check
- 72 files · ~15,721 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 582 nodes · 783 edges · 34 communities (25 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `340b51a3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- growatt-api.service.ts
- backend/package.json
- options
- compilerOptions
- plant-detail.ts
- compilerOptions
- dependencies
- dependencies
- devDependencies
- helios
- scripts
- cli/index.ts
- devices/devices.ts
- lib/index.ts
- routes/auth.ts
- src/index.ts
- environment.ts
- routes/plants.ts
- AuthService
- plugins/auth.ts
- tsconfig.app.json
- CacheService
- sync-version.mjs
- plugins/db.ts
- rate-limit.ts
- security.ts
- load-env.mjs
- docker-entrypoint.sh
- helios-api (Prod Service)
- api-error-codes.const.ts
- App Root Layout
- Fastify Backend Choice
- SQLite Database Choice

## God Nodes (most connected - your core abstractions)
1. `GrowattApiService` - 24 edges
2. `compilerOptions` - 19 edges
3. `ApiResponse` - 17 edges
4. `compilerOptions` - 15 edges
5. `AuthService` - 13 edges
6. `scripts` - 11 edges
7. `App` - 10 edges
8. `LanguageService` - 9 edges
9. `loadConfig()` - 9 edges
10. `StorageService` - 9 edges

## Surprising Connections (you probably didn't know these)
- `helios-web (Prod Service)` --semantically_similar_to--> `helios-web (Dev Service)`  [INFERRED] [semantically similar]
  docker-compose.yml → docker-compose.dev.yml
- `helios-api (Prod Service)` --semantically_similar_to--> `helios-api (Dev Service)`  [INFERRED] [semantically similar]
  docker-compose.yml → docker-compose.dev.yml
- `Deploy Documentation` --conceptually_related_to--> `Docker Compose Infrastructure`  [INFERRED]
  docs/DEPLOY.md → README.md
- `CLI Session Commands` --conceptually_related_to--> `JWT + bcrypt Authentication`  [INFERRED]
  docs/ADMIN.md → README.md
- `main()` --indirect_call--> `authRoutes()`  [INFERRED]
  backend/src/index.ts → backend/src/routes/auth.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication Flow** — docs_api_auth_endpoints, frontend_src_app_pages_login_login, frontend_src_app_pages_register_register, readme_jwt_auth, docs_admin_invite_commands [INFERRED 0.85]
- **Solar Monitoring UI Pages** — frontend_src_app_pages_dashboard_dashboard, frontend_src_app_pages_plants_plants, frontend_src_app_pages_plants_plant_detail_plant_detail, frontend_src_app_pages_devices_devices, frontend_src_app_pages_devices_device_detail_device_detail [INFERRED 0.85]
- **Docker Deployment Configuration** — docker_compose_helios_web, docker_compose_helios_api, docker_compose_dev_helios_web, docker_compose_dev_helios_api, readme_docker_compose_infra [EXTRACTED 1.00]

## Communities (34 total, 9 thin omitted)

### Community 0 - "growatt-api.service.ts"
Cohesion: 0.09
Nodes (28): API_ENDPOINTS, DEVICE_TYPE_LABELS, CacheEntry, GrowattApiService, Injectable, ApiResponse, DeviceEnergyHistoryParams, EnergyHistoryParams (+20 more)

### Community 1 - "backend/package.json"
Cohesion: 0.05
Nodes (37): allowScripts, bcrypt@6.0.0, better-sqlite3@13.0.3, esbuild@0.25.12, description, devDependencies, eslint, @eslint/js (+29 more)

### Community 2 - "options"
Cohesion: 0.06
Nodes (35): build, lint, serve, test, builder, configurations, defaultConfiguration, options (+27 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (26): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module (+18 more)

### Community 4 - "plant-detail.ts"
Cohesion: 0.09
Nodes (19): App Side Navigation, Dashboard, Plant, PlantsResponse, Component, Device, DevicesResponse, EnergyHistoryResponse (+11 more)

### Community 5 - "compilerOptions"
Cohesion: 0.08
Nodes (25): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, strictTemplates, compileOnSave, compilerOptions, baseUrl (+17 more)

### Community 6 - "dependencies"
Cohesion: 0.08
Nodes (25): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, dependencies, @angular/common (+17 more)

### Community 7 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, bcrypt, better-sqlite3, commander, fastify, @fastify/cors, @fastify/helmet, @fastify/jwt (+17 more)

### Community 8 - "devDependencies"
Cohesion: 0.09
Nodes (23): @angular/build, @angular/cli, @angular/compiler-cli, angular-eslint, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+15 more)

### Community 9 - "helios"
Cohesion: 0.09
Nodes (21): cli, analytics, packageManager, schematicCollections, prefix, projectType, root, schematics (+13 more)

### Community 10 - "scripts"
Cohesion: 0.09
Nodes (22): allowScripts, esbuild@0.28.1, lmdb@3.5.1, msgpackr-extract@3.0.4, @parcel/watcher@2.6.0, engines, node, name (+14 more)

### Community 11 - "cli/index.ts"
Cohesion: 0.16
Nodes (13): InviteRow, registerInviteCommands(), UserRow, registerSessionCommands(), SessionRow, registerUserCommands(), UserRow, openDb() (+5 more)

### Community 12 - "devices/devices.ts"
Cohesion: 0.12
Nodes (13): DataCard, DetailResponse, DeviceDetail, EnergyResponse, MinDetail, Component, Device, Devices (+5 more)

### Community 13 - "lib/index.ts"
Cohesion: 0.05
Nodes (20): App, appConfig, routes, Component, authGuard(), guestGuard(), AuthResponse, AuthUser (+12 more)

### Community 14 - "routes/auth.ts"
Cohesion: 0.15
Nodes (8): authRoutes(), LoginBody, loginSchema, RegisterBody, registerSchema, UserRow, InviteCode, InviteCodeService

### Community 15 - "src/index.ts"
Cohesion: 0.25
Nodes (10): AppConfig, loadConfig(), optionalEnv(), requireEnv(), main(), swaggerPlugin, DeviceEnergyHistoryQuery, deviceRoutes() (+2 more)

### Community 17 - "routes/plants.ts"
Cohesion: 0.18
Nodes (6): EnergyHistoryQuery, PlantIdParams, GrowattApiResponse, GrowattService, GrowattServiceError, decrypt()

### Community 18 - "AuthService"
Cohesion: 0.07
Nodes (22): Admin CLI Documentation, CLI Invite Commands, CLI Session Commands, CLI User Commands, Auth Endpoints, API Cache Strategy, Devices Endpoints, Plants Endpoints (+14 more)

### Community 19 - "plugins/auth.ts"
Cohesion: 0.25
Nodes (6): authPlugin, AuthPluginOptions, fastify, @fastify/jwt, FastifyInstance, FastifyJWT

### Community 20 - "tsconfig.app.json"
Cohesion: 0.20
Nodes (9): compilerOptions, outDir, types, exclude, extends, include, src/**/*.ts, src/**/*.spec.ts (+1 more)

### Community 22 - "sync-version.mjs"
Cohesion: 0.42
Nodes (8): assertVersion(), main(), paths, readJson(), rootDir, syncPackageLockVersion(), syncVersionFiles(), writeJson()

### Community 23 - "plugins/db.ts"
Cohesion: 0.32
Nodes (7): dbPlugin, dbPluginFn(), DbPluginOptions, fastify, FastifyInstance, getMigrations(), runMigrations()

### Community 26 - "load-env.mjs"
Cohesion: 0.33
Nodes (4): environmentTsPath, envPath, envPathMonorepo, rootDir

### Community 28 - "helios-api (Prod Service)"
Cohesion: 0.50
Nodes (5): helios-api (Dev Service), helios-web (Dev Service), API Health Check, helios-api (Prod Service), helios-web (Prod Service)

## Knowledge Gaps
- **238 isolated node(s):** `docker-entrypoint.sh script`, `environment`, `SessionRow`, `UserRow`, `program` (+233 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App Side Navigation` connect `plant-detail.ts` to `devices/devices.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `AuthService` connect `AuthService` to `lib/index.ts`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `docker-entrypoint.sh script`, `environment`, `SessionRow` to the rest of the system?**
  _238 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `growatt-api.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09351256575102279 - nodes in this community are weakly interconnected._
- **Should `backend/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `options` be split into smaller, more focused modules?**
  _Cohesion score 0.06050420168067227 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._