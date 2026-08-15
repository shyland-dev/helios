# Graph Report - .  (2026-08-15)

## Corpus Check
- Corpus is ~15,086 words - fits in a single context window. You may not need a graph.

## Summary
- 563 nodes · 755 edges · 38 communities (29 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 24 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Growatt API Services
- Backend Package Config
- Angular Build Config
- Backend TypeScript Config
- Dashboard & Plants UI
- Frontend TypeScript Config
- Angular Dependencies
- Backend Dependencies
- Angular Dev Dependencies
- Angular Project Config
- Frontend Package Config
- CLI Admin Commands
- Device Detail Page
- Frontend Auth Services
- Backend Auth Routes
- Backend Config & Startup
- Growatt Backend Service
- Documentation Hub
- Login & Register Pages
- App Shell Component
- Frontend App TS Config
- Cache Service
- Version Sync Scripts
- Auth Service Methods
- Auth Plugin
- Database Plugin
- Env Loader Script
- Routing & Guards
- Docker Compose Services
- Theme Service
- Rate Limit Plugin
- Security Plugin
- API Error Codes
- App Layout & Entry
- Fastify Choice Rationale
- SQLite Choice Rationale

## God Nodes (most connected - your core abstractions)
1. `GrowattApiService` - 24 edges
2. `compilerOptions` - 19 edges
3. `ApiResponse` - 17 edges
4. `compilerOptions` - 15 edges
5. `AuthService` - 14 edges
6. `scripts` - 11 edges
7. `loadConfig()` - 9 edges
8. `CacheService` - 9 edges
9. `GrowattService` - 9 edges
10. `App` - 9 edges

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

## Communities (38 total, 9 thin omitted)

### Community 0 - "Growatt API Services"
Cohesion: 0.10
Nodes (28): API_ENDPOINTS, DEVICE_TYPE_LABELS, CacheEntry, GrowattApiService, Injectable, ApiResponse, DeviceEnergyHistoryParams, EnergyHistoryParams (+20 more)

### Community 1 - "Backend Package Config"
Cohesion: 0.05
Nodes (37): allowScripts, bcrypt@6.0.0, better-sqlite3@13.0.3, esbuild@0.25.12, description, devDependencies, eslint, @eslint/js (+29 more)

### Community 2 - "Angular Build Config"
Cohesion: 0.06
Nodes (35): build, lint, serve, test, builder, configurations, defaultConfiguration, options (+27 more)

### Community 3 - "Backend TypeScript Config"
Cohesion: 0.07
Nodes (26): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, isolatedModules, lib, module (+18 more)

### Community 4 - "Dashboard & Plants UI"
Cohesion: 0.09
Nodes (17): App Side Navigation, Dashboard, Plant, PlantsResponse, Component, Device, DevicesResponse, EnergyHistoryResponse (+9 more)

### Community 5 - "Frontend TypeScript Config"
Cohesion: 0.08
Nodes (25): angularCompilerOptions, enableI18nLegacyMessageIdFormat, strictInjectionParameters, strictInputAccessModifiers, strictTemplates, compileOnSave, compilerOptions, baseUrl (+17 more)

### Community 6 - "Angular Dependencies"
Cohesion: 0.08
Nodes (25): @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router, dependencies, @angular/common (+17 more)

### Community 7 - "Backend Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, bcrypt, better-sqlite3, commander, fastify, @fastify/cors, @fastify/helmet, @fastify/jwt (+17 more)

### Community 8 - "Angular Dev Dependencies"
Cohesion: 0.09
Nodes (23): @angular/build, @angular/cli, @angular/compiler-cli, angular-eslint, devDependencies, @angular/build, @angular/cli, @angular/compiler-cli (+15 more)

### Community 9 - "Angular Project Config"
Cohesion: 0.09
Nodes (21): cli, analytics, packageManager, schematicCollections, prefix, projectType, root, schematics (+13 more)

### Community 10 - "Frontend Package Config"
Cohesion: 0.09
Nodes (22): allowScripts, esbuild@0.28.1, lmdb@3.5.1, msgpackr-extract@3.0.4, @parcel/watcher@2.6.0, engines, node, name (+14 more)

### Community 11 - "CLI Admin Commands"
Cohesion: 0.16
Nodes (13): InviteRow, registerInviteCommands(), UserRow, registerSessionCommands(), SessionRow, registerUserCommands(), UserRow, openDb() (+5 more)

### Community 12 - "Device Detail Page"
Cohesion: 0.12
Nodes (13): DataCard, DetailResponse, DeviceDetail, EnergyResponse, MinDetail, Component, Device, Devices (+5 more)

### Community 13 - "Frontend Auth Services"
Cohesion: 0.15
Nodes (8): AuthResponse, AuthUser, LoginPayload, RegisterPayload, authInterceptor(), StorageService, Injectable, Theme

### Community 14 - "Backend Auth Routes"
Cohesion: 0.15
Nodes (8): authRoutes(), LoginBody, loginSchema, RegisterBody, registerSchema, UserRow, InviteCode, InviteCodeService

### Community 15 - "Backend Config & Startup"
Cohesion: 0.25
Nodes (10): AppConfig, loadConfig(), optionalEnv(), requireEnv(), main(), swaggerPlugin, DeviceEnergyHistoryQuery, deviceRoutes() (+2 more)

### Community 16 - "Growatt Backend Service"
Cohesion: 0.18
Nodes (6): EnergyHistoryQuery, PlantIdParams, GrowattApiResponse, GrowattService, GrowattServiceError, decrypt()

### Community 17 - "Documentation Hub"
Cohesion: 0.14
Nodes (15): Admin CLI Documentation, CLI Invite Commands, CLI Session Commands, CLI User Commands, API Cache Strategy, Devices Endpoints, Plants Endpoints, API Reference Documentation (+7 more)

### Community 18 - "Login & Register Pages"
Cohesion: 0.22
Nodes (5): Auth Endpoints, Login, Component, Register, Component

### Community 19 - "App Shell Component"
Cohesion: 0.22
Nodes (3): App, appConfig, Component

### Community 20 - "Frontend App TS Config"
Cohesion: 0.20
Nodes (9): compilerOptions, outDir, types, exclude, extends, include, src/**/*.ts, src/**/*.spec.ts (+1 more)

### Community 22 - "Version Sync Scripts"
Cohesion: 0.42
Nodes (8): assertVersion(), main(), paths, readJson(), rootDir, syncPackageLockVersion(), syncVersionFiles(), writeJson()

### Community 24 - "Auth Plugin"
Cohesion: 0.25
Nodes (6): authPlugin, AuthPluginOptions, fastify, @fastify/jwt, FastifyInstance, FastifyJWT

### Community 25 - "Database Plugin"
Cohesion: 0.32
Nodes (7): dbPlugin, dbPluginFn(), DbPluginOptions, fastify, FastifyInstance, getMigrations(), runMigrations()

### Community 26 - "Env Loader Script"
Cohesion: 0.33
Nodes (4): environmentTsPath, envPath, envPathMonorepo, rootDir

### Community 27 - "Routing & Guards"
Cohesion: 0.47
Nodes (3): routes, authGuard(), guestGuard()

### Community 28 - "Docker Compose Services"
Cohesion: 0.50
Nodes (5): helios-api (Dev Service), helios-web (Dev Service), API Health Check, helios-api (Prod Service), helios-web (Prod Service)

## Knowledge Gaps
- **234 isolated node(s):** `InviteRow`, `UserRow`, `SessionRow`, `UserRow`, `program` (+229 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `API Reference Documentation` connect `Documentation Hub` to `Login & Register Pages`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Auth Endpoints` connect `Login & Register Pages` to `Documentation Hub`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `Plants Endpoints` connect `Documentation Hub` to `Dashboard & Plants UI`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `InviteRow`, `UserRow`, `SessionRow` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Growatt API Services` be split into smaller, more focused modules?**
  _Cohesion score 0.0955837870538415 - nodes in this community are weakly interconnected._
- **Should `Backend Package Config` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._
- **Should `Angular Build Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06050420168067227 - nodes in this community are weakly interconnected._