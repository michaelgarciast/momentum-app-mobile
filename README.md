# Momentum

App móvil para gestión de rutinas de entrenamiento. Permite a los usuarios crear y administrar ejercicios, rutinas, series planificadas y perfiles con preferencias de unidades de peso.

## Tech Stack

- **Framework:** Expo SDK 57 (React Native 0.86, React 19)
- **Routing:** Expo Router (file-based)
- **Styling:** NativeWind 4 + TailwindCSS 3
- **State:** Zustand
- **Validation:** Zod
- **Backend:** Supabase (Auth + Postgres con esquemas separados por dominio)
- **Icons:** Lucide React Native
- **Package Manager:** Bun

## Requisitos

- Node.js >= 18
- Bun
- Expo CLI (incluido en dependencias)
- Cuenta de Supabase con las migraciones aplicadas

## Instalación

```bash
bun install
```

Crear un archivo `.env` en la raíz con:

```env
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_KEY=tu-anon-key
```

## Scripts

| Comando         | Descripción                          |
| --------------- | ------------------------------------ |
| `bun start`     | Inicia el dev server de Expo         |
| `bun run ios`   | Ejecuta en simulador iOS             |
| `bun run android` | Ejecuta en emulador Android        |
| `bun run web`   | Ejecuta en navegador web             |
| `bun run lint`  | Lint con ESLint                      |
| `bun run lint:fix` | Lint con auto-fix                 |
| `bun run format` | Formatea con Prettier               |
| `bun run format:check` | Verifica formato sin escribir   |

## Estructura del Proyecto

```
momentum-app/
├── app/                        # Rutas Expo Router (file-based)
│   ├── _layout.tsx             # Root layout: ErrorBoundary + Stack
│   ├── index.tsx               # Redirect según sesión
│   ├── +html.tsx               # HTML shell para web
│   ├── (auth)/                 # Grupo de rutas de autenticación
│   │   ├── _layout.tsx
│   │   ├── welcome.tsx         # Pantalla de bienvenida
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── (tabs)/                 # Grupo de rutas con tab bar
│       ├── _layout.tsx         # Tab bar con gradientes en iconos activos
│       ├── index.tsx           # Tab "Inicio" (dashboard)
│       ├── settings.tsx        # Tab "Ajustes"
│       ├── exercises/
│       │   ├── _layout.tsx
│       │   ├── index.tsx       # Lista de ejercicios
│       │   └── [id].tsx        # Detalle/edición de ejercicio
│       └── routines/
│           ├── _layout.tsx
│           ├── index.tsx       # Lista de rutinas
│           ├── new.tsx         # Crear rutina
│           └── [id]/           # Detalle de rutina
│               ├── index.tsx
│               ├── edit.tsx
│               └── ...
├── src/
│   ├── features/               # Feature modules (vertical slices)
│   │   ├── auth/               # Login, registro, sesión
│   │   │   ├── schema/         # Zod schemas (loginSchema, registerSchema)
│   │   │   ├── services/       # auth.service.ts (Supabase auth calls)
│   │   │   ├── store/          # auth.store.ts (Zustand)
│   │   │   ├── types/          # AuthState
│   │   │   └── ui/
│   │   ├── exercises/          # Catálogo de ejercicios del usuario
│   │   │   ├── schema/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types/
│   │   ├── routines/           # Rutinas, ejercicios dentro de rutinas, series
│   │   │   ├── schema/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types/
│   │   └── profiles/           # Perfil de usuario (nombre, unidad de peso)
│   │       ├── schema/
│   │       ├── services/
│   │       ├── store/
│   │       └── types/
│   └── shared/                 # Código compartido entre features
│       ├── components/         # UI components reutilizables
│       │   ├── AuthScreenLayout.tsx
│       │   ├── Button.tsx
│       │   ├── ChipSelector.tsx
│       │   ├── EmptyState.tsx
│       │   ├── ErrorBanner.tsx
│       │   ├── ErrorBoundary.tsx
│       │   ├── Input.tsx
│       │   ├── RestTimer.tsx
│       │   ├── ScreenHeader.tsx
│       │   ├── ScreenLayout.tsx
│       │   ├── Segmented.tsx
│       │   └── index.ts        # Barrel exports
│       └── lib/
│           ├── supabase.ts     # Cliente Supabase + helpers por esquema
│           ├── units.ts        # Conversión kg ↔ lb
│           └── confirm.ts      # Alert de confirmación de borrado
├── supabase/
│   ├── config.toml             # Config de Supabase local
│   └── migrations/
│       ├── 20260729233536_profiles_schema.sql
│       ├── 20260729233537_exercises_schema.sql
│       ├── 20260729233538_routines_schema.sql
│       ├── 20260729240000_grant_api_roles.sql
│       └── 20260819210000_rls_auth_uid_initplan.sql
├── global.css                  # Directivas Tailwind para NativeWind
├── tailwind.config.js
├── metro.config.js
├── babel.config.js
├── tsconfig.json               # Path alias @/* → ./src/*
├── app.json                    # Config Expo
└── package.json
```

## Arquitectura

### Feature-based (vertical slices)

Cada dominio (`auth`, `exercises`, `routines`, `profiles`) es un módulo independiente con:

- **`schema/`** — Validación con Zod
- **`services/`** — Llamadas a Supabase (PostgREST por esquema)
- **`store/`** — Estado global con Zustand
- **`types/`** — Tipos TypeScript del dominio

### Path alias

```ts
import { ... } from "@/features/auth/store/auth.store";
import { ... } from "@/shared/components";
import { ... } from "@/shared/lib/supabase";
```

`@/*` se resuelve a `./src/*` (configurado en `tsconfig.json`).

### Supabase: esquemas por dominio

El backend usa esquemas Postgres separados en lugar de un único schema `public`:

| Esquema     | Tablas                                  |
| ----------- | --------------------------------------- |
| `profiles`  | `profiles`                              |
| `exercises` | `exercises`                             |
| `routines`  | `routines`, `routine_exercises`, `routine_exercise_sets` |

El cliente Supabase expone helpers para scoping:

```ts
import { profilesDb, exercisesDb, routinesDb } from "@/shared/lib/supabase";
```

### Seguridad

- **RLS** habilitado en todas las tablas con políticas `auth.uid() = user_id`
- **Optimización:** `auth.uid()` envuelto en `(select ...)` (initPlan) para evitar re-evaluación por fila
- **Auth storage:** `expo-secure-store` (Keychain/Keystore) en native, `AsyncStorage` en web
- **Auto-refresh:** Se activa/desactiva según `AppState` (foreground/background)

### Modelo de datos

```
auth.users (Supabase)
  └── profiles.profiles (1:1, trigger auto-create on signup)
  └── exercises.exercises (1:N)
  └── routines.routines (1:N)
        └── routines.routine_exercises (1:N)
              └── routines.routine_exercise_sets (1:N)
```

**Tipos de serie:** `approximation` | `effective`

**Frecuencia:** `frequency_days` es un array de `smallint` (1=Lunes ... 7=Domingo)

### Navegación

```
Root Stack
├── index (redirect según sesión)
├── (auth) → welcome / login / register
└── (tabs) → Inicio / Ejercicios / Rutinas / Ajustes
```

El tab bar usa gradientes (`expo-linear-gradient`) en iconos activos con colores `#4f46e5` → `#7c3aed`.

## Convenciones de Código

- **ESLint:** `expo` + `prettier`, con regla `import/order` (alfabético, grupos separados)
- **Prettier:** 2 espacios, comillas dobles, trailing comma all, printWidth 80
- **TypeScript:** `strict: true`, `noUncheckedIndexedAccess: true`
- **Idioma UI:** Español
- **Colores primarios:** `#4f46e5` (indigo) / `#7c3aed` (violeta)

## Supabase Local

```bash
# Iniciar Supabase local
supabase start

# Aplicar migraciones
supabase db reset

# Link al proyecto remoto
supabase link --project-ref <tu-ref>
```

## Licencia

Ver archivo [LICENSE](./LICENSE).
