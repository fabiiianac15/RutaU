# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + Vite + Tailwind CSS, in the `apps/web` workspace of the RutaU monorepo (npm workspaces). Deployed on Vercel. It consumes two HTTP/JSON APIs: the Rutas y Viajes service (`services/rutas`, port 3001 locally) and the Reservas service (`services/reservas`, port 3002 locally). An installable phone version may come later and is out of scope for now.

## Users

UFPSO students who travel by the university bus between Ocaña and the El Algodonal campus. Most use RutaU on their phone **before leaving**, at home or in class, to secure a seat on the trip that gets them to class and to check that the reservation is still active. They identify themselves only with their student code (4–12 digits) and their name. They have no account or password.

The interface is for students only. The transport coordination office benefits indirectly from the data, but no coordination view exists or is planned.

## Product Purpose

Today a student doesn't know whether their bus will have a seat until they reach the stop. If it's full, they miss the trip or arrive late to class. RutaU lets them see today's trips with the exact seats left, reserve one, and cancel it so the seat goes back to someone else.

Success: the student knows **before leaving** whether they have a seat, on which trip and at which stop.

## Positioning

Seats are real and guaranteed. Seat availability is the live counter that the Rutas service controls with an atomic operation: if the app says there is a seat and the reservation is confirmed, that seat belongs to the student, and nobody can take it at the same moment. The app must never promise a seat it didn't confirm.

## Operating Context

- Ocaña (Norte de Santander, Colombia), Colombia time (UTC-5). Trips run Monday through Sunday with fixed departure times (e.g. 06:00, 06:15, 12:30, 13:00, 17:00).
- Seed data: 2 routes (Ruta Centro, Ruta Terminal), 3 stops per route ending at Sede El Algodonal, 3 buses (40, 30 and 3 seats). The 3-seat bus `UFP-103` exists to demonstrate a full trip.
- Academic project for the Arquitectura Orientada a Servicios course (UFPSO). It is presented with a live demo of the full cycle: view trips → reserve → seat goes down → My reservations → cancel → seat comes back → full trip rejects with "no seats".

## Capabilities and Constraints

- View the routes with their stops in order, and the trips for a date with available seats. Without a date, it shows today's trips in Colombia time.
- Reserve a seat by choosing a trip and a stop on its route, with student code and name.
- "Mis reservas": look up a student's reservations by typing their code; each one shows the route, date, time, stop and status (activa/cancelada).
- Cancel an active reservation; the seat goes back to the trip.
- Rejections the interface must explain clearly (the API returns `{ "error": "..." }`): trip full (409), duplicate reservation on the same trip (409), trip already departed (409), stop not on the route (400), invalid data (400), reservation already cancelled (409), Rutas service unavailable (502).
- No authentication: whoever knows the code sees its reservations. This is an accepted limitation of the proposal.
- Interface language: Spanish (Colombia).

## Brand Commitments

- Name: **RutaU**.
- RutaU has its own identity (its own logo and personality), not the institutional portal's. It must read as belonging to the UFPSO through its palette, without using the official crest or logo.
- Official UFPSO colors (taken from ufpso.edu.co): primary red `#c71122` (variant `#c8102e`), white, secondary gray `#5f6368`.
- The user asked that it be **not generic at all**.

## Evidence on Hand

- Proposal: `docs/propuesta-rutau.docx`.
- API contracts documented in `services/rutas/README.md` and `services/reservas/README.md`.
- Real place names in the seed data: Parque 29 de Mayo, Hospital Emiro Quintero Cañizares, Terminal de Transportes, Glorieta de la Avenida Circunvalar, Sede El Algodonal.
- No testimonials, usage metrics, user counts or official photography. Don't fabricate them.

## Product Principles

1. **The seat count is the truth.** Show exactly what Rutas reports; never show a seat as "yours" until Reservas confirms it.
2. **Answer before leaving.** The main question ("do I have a seat on my bus?") is answered at a glance, with no scrolling and no hunting.
3. **Explain every no.** Each rejection says what happened and what to do next (another trip, another stop, try again).
4. **Code, not account.** Identifying yourself is typing your code; nothing should feel like signing up.

## Accessibility & Inclusion

WCAG 2.2 AA. Mostly phone use: touch targets of at least 44px, legible under outdoor light, and the trip status must never depend on color alone (full trip / few seats / available).
