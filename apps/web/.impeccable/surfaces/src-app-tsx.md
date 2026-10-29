---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# Student screen: trips, reserve, My reservations

Scope: the RutaU web app for students (single route, with the My reservations view). Mode: **Operate**. Mobile-first (phone, before leaving), adapted for desktop.

Task: answer "do I have a seat on my bus?" and reserve or cancel in seconds. Data: trips by date (time, route, bus, occupied/capacity), route stops, a student's reservations. Important states: available, few seats, full, already departed, yours (active), cancelled, Rutas unavailable (502), loading, no trips that day.

## Direction contract

THESIS: the day is a grid of hours like the student's class schedule; each trip is a block at its departure time and your reservation gets painted in like one more class. It refuses the category default: a map with a bottom sheet of identical cards.

OWN-WORLD: white paper with gray grid hairlines `#DADCE0`; a UFPSO red band `#C71122` as the shell (header and day tabs); trip blocks in soft red `#F6E3E5` with an occupancy fill on a fixed ramp; departed blocks with gray hatching and the time struck through; yours in solid red with a white halo; cancelled ones stay struck through and labeled. Atkinson Hyperlegible Next with tabular figures, a closed scale where the time is the only large size.

STORY: the student opens the app, sees today with the "now" line, picks a trip block, chooses their stop and reserves. Their block turns red. In My reservations they see their week as a timetable and cancel there.

FIRST VIEWPORT: red band with RutaU and My reservations; Today / Tomorrow / day after tabs; the hour column (empty hours compressed) with blocks side by side when they overlap and the now line; at the bottom a fixed sheet with the selected trip, segmented stop selector and the Reserve my seat button.

FORM: candidate 7 of the re-rolled grounded list (the class schedule). seed:80b4b8b49e863502

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
