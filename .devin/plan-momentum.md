# Plan: Dominios de Ejercicios, Rutinas y Series (BD por dominio)

Arquitectura: un solo proyecto Supabase (Postgres) con **schemas separados por dominio**
(`profiles`, `exercises`, `routines`, y a futuro `training_logs`), siguiendo el patrón de
feature-slice ya usado en `src/features/auth` (`schema/ services/ store/ types/`).

Ver decisiones de modelado:
- Peso guardado tal cual lo ingresa el usuario (`target_weight` + `weight_unit`), conversión
  kg/lb solo en la capa de presentación según `profiles.preferred_weight_unit`.
- Series planificadas por serie individual (`routine_exercise_sets`): cada serie tiene su
  propio tipo (`approximation` | `effective`), reps, peso+unidad y descanso (o hereda el
  descanso por defecto del ejercicio en la rutina).
- Frecuencia (`frequency_days`) se define a nivel de ejercicio-dentro-de-rutina
  (`routine_exercises`), no a nivel de rutina completa.

## Fase 0 — Base de datos

- [x] `npx supabase init` (carpeta `supabase/` creada)
- [x] Migración `profiles`: schema, tabla `profiles.profiles`, trigger `on_auth_user_created`, RLS
- [x] Migración `exercises`: schema, tabla `exercises.exercises`, RLS
- [x] Migración `routines`: schema, enums (`set_type`, `weight_unit`), tablas
      `routines.routines` / `routine_exercises` / `routine_exercise_sets`, RLS
- [x] Exponer schemas (`profiles, exercises, routines`) en `supabase/config.toml`
- [ ] **Pendiente (requiere credenciales del usuario):** `npx supabase login` +
      `npx supabase link --project-ref mjjuvwzcjslobsftlvas` + `npx supabase db push`
      (o pegar el SQL de `supabase/migrations/*.sql` en el SQL Editor del dashboard)
- [ ] Exponer schemas también en el dashboard (Settings → API → Exposed schemas), ya que
      `config.toml` solo aplica al desarrollo local con Docker
- [ ] (Opcional) Regenerar tipos TS: `supabase gen types typescript --linked --schema public,profiles,exercises,routines`
      — de momento se usan tipos manuales en cada `*.service.ts`, igual que en `auth`
- [x] Helpers `exercisesDb()`, `routinesDb()`, `profilesDb()` en `src/shared/lib/supabase.ts`

## Fase 1 — Perfil de usuario (`src/features/profiles`) ✅

- [x] `schema/schemas.ts`: zod `updateProfileSchema` (displayName, preferredWeightUnit)
- [x] `services/profiles.service.ts`: `getProfile`, `updateProfile`
- [x] `store/profiles.store.ts`: `useProfileStore` (se carga en `(tabs)/_layout.tsx` cuando hay sesión)
- [x] `app/(tabs)/settings.tsx` — editar nombre, selector kg/lb, cerrar sesión

## Fase 2 — Ejercicios (`src/features/exercises`) ✅

- [x] `schema/schemas.ts`: zod `exerciseSchema` (name, muscleGroup, equipment, notes)
- [x] `services/exercises.service.ts`: CRUD sobre `exercises.exercises`
- [x] `store/exercises.store.ts`: lista + loading/error
- [x] `app/(tabs)/exercises/index.tsx` — listado
- [x] `app/(tabs)/exercises/[id].tsx` — crear/editar/eliminar (usa `id="new"` para crear)

## Fase 3 — Rutinas (`src/features/routines`) ✅

- [x] CRUD de rutina (nombre/descripción) — `app/(tabs)/routines/index.tsx`, `new.tsx`
- [x] Agregar ejercicio a rutina: selector de `exercises`, `frequency_days`,
      `default_rest_seconds` — `app/(tabs)/routines/[id]/add-exercise.tsx`
- [x] CRUD de `routine_exercise_sets`: tipo (aproximación/efectiva), reps, peso+unidad,
      descanso propio u heredado — `app/(tabs)/routines/[id]/add-set.tsx`
- [x] Servicio que arma el árbol completo (rutina → ejercicios → sets) resolviendo con
      3 queries batched (`routine_exercises` + `exercises.in()` + `routine_exercise_sets.in()`)
      en vez de embed cruzado de schemas — ver `routines.service.ts::getRoutineDetail`
- [x] Rutas:
  - [x] `app/(tabs)/routines/index.tsx`
  - [x] `app/(tabs)/routines/[id]/index.tsx`
  - [x] `app/(tabs)/routines/[id]/add-exercise.tsx`
  - [x] `app/(tabs)/routines/[id]/add-set.tsx`
- [x] Editar/eliminar rutina completa desde el detalle — `app/(tabs)/routines/[id]/edit.tsx`
- [x] Editar ejercicio-en-rutina (frecuencia/descanso/notas) —
      `app/(tabs)/routines/[id]/edit-exercise.tsx`
- [x] Editar sets in-place (refactor de `add-set.tsx` a modo add/edit vía `setId` query
      param); cada set en el detalle es tappable para editar

## Fase 4 — Utilidades de unidades ✅

- [x] `src/shared/lib/units.ts`: `kgToLb`, `lbToKg`, `convertWeight`, `formatWeight`
- [x] Usar `formatWeight` en el detalle de rutina para mostrar el peso convertido según
      `profile.preferredWeightUnit`. Si la unidad del set difiere de la preferida, se
      muestra el valor convertido seguido del original entre paréntesis, p.ej.
      `22.7 kg (50 lb)`.

## Verificación

- [x] `npx tsc --noEmit` — sin errores
- [x] `npx eslint .` — sin errores ni warnings
- [x] `npx expo export --platform web` — bundlea sin errores (3076 módulos)

## Fase 5 (futuro) — Registro de entrenamientos reales

- [ ] Dominio `training_logs`: sesiones ejecutadas, sets realmente hechos (peso real, reps
      reales, RPE), progreso histórico/gráficas

## Notas / recordatorios permanentes

- Revisar siempre https://docs.expo.dev/versions/v57.0.0/ antes de tocar Expo Router/config
  (ver `AGENTS.md`).
- Cualquier cambio de esquema pasa por una migración nueva en `supabase/migrations/`, nunca
  editar el dashboard a mano en producción.
- RLS: todas las políticas nuevas deben validar `auth.uid()` remontando hasta el dueño
  (patrón ya usado en `routines.routine_exercise_sets`).
