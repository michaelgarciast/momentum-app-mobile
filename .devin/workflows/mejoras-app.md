---
description: Plan de mejoras incrementales de toda la app (UX, robustez, rendimiento) sin sobreingeniería
---

# Workflow: Mejoras de la app (sin sobreingeniería)

Reglas generales antes de empezar cualquier fase:

- **Una fase a la vez.** No mezclar cambios de varias fases en un solo commit/PR.
- **Reutilizar lo existente.** Antes de crear un componente nuevo, revisar
  `src/shared/components/` y las pantallas ya hechas para copiar patrones.
- **Nada de abstracciones prematuras.** No crear hooks/contexts/utilidades para algo
  que solo se usa en un lugar. Extraer solo cuando aparezca el segundo uso.
- **Sin dependencias nuevas** salvo necesidad real (justificarla en el commit).
- Revisar https://docs.expo.dev/versions/v57.0.0/ antes de tocar Expo Router o config
  nativa (ver `AGENTS.md`).
- Cambios de base de datos siempre via migración nueva en `supabase/migrations/`,
  nunca a mano en producción.

Al terminar cada fase, verificar:

// turbo
1. `npx tsc --noEmit` sin errores
2. `npx eslint .` sin errores ni warnings
3. Probar la pantalla tocada en el simulador/dispositivo (happy path + caso vacío + error)

---

## Fase 1 — Robustez y estados de UI (prioridad alta)

- [x] **Estados de error visibles**: componente compartido `ErrorBanner`
  (`src/shared/components/ErrorBanner.tsx`, texto rojo + botón reintentar) integrado en
  home, listas de ejercicios/rutinas y detalle de rutina. Los formularios ya mostraban
  errores inline.
- [x] **Estados vacíos consistentes**: ya existían con `EmptyState` en listas y detalle
  de rutina, y CTA dashed en home. Sin cambios necesarios.
- [x] **Confirmaciones antes de borrar**: helper compartido `confirmDelete`
  (`src/shared/lib/confirm.ts`) aplicado a ejercicio, rutina, ejercicio-en-rutina y serie.
  `routines/[id]/edit.tsx` ya tenía la suya propia para la rutina completa.
- [x] **Validación de formularios**: todos validan con zod; se agregó `updateProfileSchema`
  a `settings.tsx` que era el único que llamaba al store sin `safeParse`.
- [x] **Manejo de sesión expirada**: ya cubierto — `onAuthStateChange` setea sesión a null
  y `(tabs)/_layout.tsx` redirige a welcome. `autoRefreshToken` + AppState en
  `src/shared/lib/supabase.ts` mantienen el token fresco. Sin cambios necesarios.

## Fase 2 — Rendimiento puntual (solo lo que ya duele) ✅

- [x] **Home sin N+1**: nuevo `listRoutineStats(routineIds)` en `routines.service.ts`
  (2 queries batcheadas: `routine_exercises.in()` + `routine_exercise_sets.in()`)
  reemplaza N×`getRoutineDetail()`. Sin migración SQL. Home muestra conteos desde
  `statsByRoutine` y mantiene stats exactas (días/semana y series totales).
- [x] **Listas con `FlatList`**: NO se hizo — decisión consciente. Las listas son
  pequeñas (datos por usuario) y `ScreenLayout` comparte un `ScrollView` con header
  y refreshControl; convertir a `FlatList` sería un refactor grande sin ganancia
  medible a esta escala. Revisitar solo si una lista supera ~100 items.
- [x] **Evitar refetch innecesario**: flag `fetchedAt` + `fetchAll(force?)` con TTL de
  60s en stores de ejercicios y rutinas. Mutaciones y pull-to-refresh usan
  `fetchAll(true)`; mounts usan el caché fresco.
- [x] **RLS con initPlan**: migración `20260819210000_rls_auth_uid_initplan.sql`
  recrea las 5 políticas envolviendo `auth.uid()` en `(select ...)` para que Postgres
  lo evalúe una vez por query y no por fila.
- [x] **Sesión cifrada en nativo**: `src/shared/lib/supabase.ts` usa
  `expo-secure-store` (Keychain/Keystore) para la sesión en iOS/Android y mantiene
  AsyncStorage en web. Nota: al actualizar, usuarios existentes hacen login una vez
  (la sesión vieja en AsyncStorage no se migra).

## Fase 3 — Pulido de UX ✅

- [x] **Feedback táctil/visual**: ya cubierto — todos los `Pressable` tenían
  `active:opacity-*` y `Button` ya deshabilita + muestra spinner con `loading`.
  Sin cambios necesarios.
- [x] **Safe area y teclado**: `KeyboardAvoidingView` agregado una sola vez en
  `ScreenLayout` (padding en iOS) — cubre todos los formularios sin tocar pantallas.
- [x] **Fechas y textos en español consistentes**: verificado en la auditoría,
  textos ya en español con tono consistente y fechas `es-ES`. Sin cambios.
- [x] **Accesibilidad mínima**: `accessibilityRole`/`accessibilityLabel` en botones
  de ícono: back (`ScreenHeader` + detalle), trash/pencil de listas y detalle de rutina.

## Fase 4 — Calidad de código (deuda pequeña) ✅

- [x] **Componentes compartidos solo si hay 2+ usos**: caja de error inline duplicada
  en 9 pantallas consolidada en `ErrorBanner`; helper `confirmDelete` con 4 usos.
  La tarjeta de lista con chevron difiere suficiente entre pantallas → no se extrajo.
- [x] **Tipos duplicados**: ninguno encontrado — cada feature tiene sus tipos y
  `WeightUnit` ya vive en `src/shared/lib/units.ts`.
- [x] **Limpieza**: sin `console.log` ni código muerto (verificado con grep + eslint).
  Se silenció el `require` intencional del polyfill en `supabase.ts` y props
  `Readonly` en `ScreenLayout`/`ScreenHeader`.

## Fase 5 — Funcionalidad futura (NO empezar hasta completar 1–4)

- [x] **Base de datos pendiente** (de `.devin/plan-momentum.md`): `supabase db push`
  ejecutado — las 5 migraciones (incluida `rls_auth_uid_initplan`) están en el remoto
  y el historial local/remoto está sincronizado. CLI via `bunx supabase` (no hay brew).
- [ ] **Dominio `training_logs`**: registrar entrenamientos reales (sets ejecutados,
  peso real, RPE) — Fase 5 del plan principal.
- [ ] (Opcional) Tests con una sola herramienta (jest + testing-library) solo para
  `src/shared/lib/units.ts` y schemas zod — no montar infra de tests para toda la app.
- [ ] (Opcional) Modo oscuro: solo si se decide adoptarlo, hacerlo con las variables de
  NativeWind ya configuradas, sin theming engine propio.

---

## Anti-objetivos (qué NO hacer)

- No migrar a otra librería de estado (zustand alcanza).
- No agregar React Query / SWR salvo que el refetch manual se vuelva inmanejable.
- No internacionalización (i18n) formal mientras la app sea solo en español.
- No crear capas de "repositorio" ni inyección de dependencias sobre los services.
- No reestructurar carpetas: mantener feature-slice `schema/ services/ store/ types/`.
