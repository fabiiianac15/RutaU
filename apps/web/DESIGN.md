---
name: RutaU
description: El horario de clases del bus universitario de la UFPSO: ver el día, reservar tu cupo y verlo pintado de rojo.
colors:
  rojo: "#c71122"
  rojo-oscuro: "#9e0d1b"
  rojo-suave: "#f6e3e5"
  rojo-relleno: "#ebc0c5"
  rojo-tinte: "#fbeff0"
  rojo-ocupado: "#e8b4ba"
  tinta: "#202124"
  tinta-2: "#3c4043"
  apagada: "#5f6368"
  papel: "#ffffff"
  sutil: "#f1f3f4"
  rayado: "#e8eaed"
  grilla: "#dadce0"
  exito: "#137333"
  exito-suave: "#e6f4ea"
typography:
  hora:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: "2.25rem"
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  hora-bloque:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: "1.5rem"
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  titulo:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: "1.75rem"
  cuerpo:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "1.5rem"
    fontFeature: "tnum"
  detalle:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: "1.25rem"
    fontFeature: "tnum"
  etiqueta:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: "1rem"
    fontFeature: "tnum"
rounded:
  bloque: "8px"
  control: "10px"
  hoja: "16px"
  completo: "9999px"
spacing:
  junto: "8px"
  grupo: "12px"
  seccion: "16px"
  margen: "16px"
  margen-escritorio: "48px"
  columna-hora: "3.25rem"
  columna-hora-escritorio: "4.5rem"
  panel-escritorio: "26rem"
  contenido-max: "72rem"
components:
  boton-primario:
    backgroundColor: "{colors.rojo}"
    textColor: "{colors.papel}"
    typography: "{typography.cuerpo}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "52px"
  boton-primario-hover:
    backgroundColor: "{colors.rojo-oscuro}"
  boton-secundario:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "52px"
  boton-secundario-hover:
    backgroundColor: "{colors.sutil}"
  boton-peligro:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.rojo-oscuro}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "52px"
  boton-peligro-hover:
    backgroundColor: "{colors.rojo-tinte}"
  boton-desactivado:
    backgroundColor: "{colors.rayado}"
    textColor: "{colors.apagada}"
  campo:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.cuerpo}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  bloque-viaje:
    backgroundColor: "{colors.rojo-suave}"
    textColor: "{colors.tinta}"
    typography: "{typography.hora-bloque}"
    rounded: "{rounded.bloque}"
    padding: "8px 12px"
    height: "62px"
  bloque-viaje-tuyo:
    backgroundColor: "{colors.rojo}"
    textColor: "{colors.papel}"
    rounded: "{rounded.bloque}"
  bloque-viaje-salio:
    backgroundColor: "{colors.sutil}"
    textColor: "{colors.apagada}"
    rounded: "{rounded.bloque}"
  pestana-dia:
    textColor: "{colors.papel}"
    typography: "{typography.detalle}"
    padding: "10px 8px 12px"
    height: "44px"
  pestana-dia-activa:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.rojo}"
  selector-parada:
    backgroundColor: "{colors.sutil}"
    textColor: "{colors.tinta-2}"
    typography: "{typography.detalle}"
    rounded: "{rounded.control}"
    padding: "4px"
  selector-parada-elegida:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.rojo-oscuro}"
  aviso-exito:
    backgroundColor: "{colors.exito-suave}"
    textColor: "{colors.exito}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  aviso-error:
    backgroundColor: "{colors.rojo-tinte}"
    textColor: "{colors.rojo-oscuro}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  hoja:
    backgroundColor: "{colors.papel}"
    rounded: "{rounded.hoja}"
    padding: "10px 16px 24px"
---

# Design System: RutaU

## Overview

**Creative North Star: "El horario de clases"**

RutaU is drawn as the student's class schedule. The day is a grid of hours on white paper with gray hairlines; each bus trip sits as a block at its departure time, and a reservation gets painted in solid red like one more class. The shell is the UFPSO red band (header and day tabs). Everything inside the band is paper, rules and blocks. It deliberately avoids the category default of a map with a bottom sheet of identical cards.

The density is that of a printed timetable. There is an hour column on the left with a vertical rule. Hours with no trips collapse into one line of text. Simultaneous trips sit side by side, and a "now" line in ink marks the present. The interface speaks in short, tabular figures: times, seats left, stops. One typeface, Atkinson Hyperlegible Next, carries everything with tabular numerals, and only the departure time gets large.

Motion is rare and means something. Pressing anything shrinks it slightly. The sheet rises once when the day loads. The block you just reserved fills with red from bottom to top, the way the occupancy fill finishes filling with you. That paint happens once, on that one block.

The build differs from the direction contract on one point. The contract describes "yours" as solid red with a white halo. The build marks your blocks with solid red plus a white check badge, and uses a white-then-ink double ring for the *selected* block, whatever its state.

**Key Characteristics:**
- Red band shell, white paper body, gray grid hairlines.
- Trip blocks in soft red with an occupancy fill on a fixed quarter ramp.
- Solid red block means only one thing: you have a seat.
- No state is shown by color alone: every state has words, and departed or cancelled trips also get texture or strikethrough.
- One typeface, tabular figures, a closed scale where the time is the only large size.
- Flat paper. Only the trip sheet floats.

## Colors

UFPSO red on white paper, with ink grays borrowed from the institutional secondary gray. A single green appears only to confirm success.

### Primary
- **Rojo UFPSO** (rojo): the band, the primary button, and blocks that are yours. The official university red.
- **Rojo oscuro** (rojo-oscuro): hover on red, the text color for danger and error, the "Últimos cupos" label, and inline text links on paper.
- **Rojo suave** (rojo-suave): the resting fill of every bookable trip block.
- **Rojo ocupado** (rojo-ocupado): the occupancy fill that rises inside a trip block. Added in the finish review so that ink text stays legible over the fill. It lives in the Figma collection "RutaU" as `color/marca/rojo-ocupado`.
- **Rojo relleno** (rojo-relleno): text selection, and a 50% wash for hovering a block.
- **Rojo tinte** (rojo-tinte): the error notice background, and hover on white controls that sit on the band or carry red text.

### Neutral
- **Tinta** (tinta): body text, the "now" line and its time chip, the focus ring, and the selection ring.
- **Tinta 2** (tinta-2): secondary text in sheets and panels, and the "Lleno" seat count.
- **Apagada** (apagada): hour labels, help text, collapsed-hour lines, departed-trip text, and disabled text. This is the UFPSO secondary gray.
- **Papel** (papel): the page, the sheet, active tabs, and text on red.
- **Sutil** (sutil): the segmented-control track, loading skeletons, and the light stripe of the hatching.
- **Rayado** (rayado): the dark stripe of the departed hatching, and the disabled button fill.
- **Grilla** (grilla): every hairline. That includes hour rules, the vertical rule, field and secondary-button strokes, the sheet's top edge, the drag handle and the scrollbar.

### Status
- **Éxito** / **Éxito suave** (exito, exito-suave): only for the "Listo, tienes cupo" and "Cancelaste tu reserva" notices.

### Named Rules
**The One Meaning of Solid Red Rule.** Inside the timetable, a solid red block means you have a seat, and nothing else. Choosing a block only adds an ink ring around it. It never changes the fill.

**The Fixed Ramp Rule.** Occupancy is never drawn proportionally. It rounds to the nearest quarter and is clamped. Zero occupied shows no fill, a lightly used bus shows an 8% strip, and the levels in between are 25%, 50% and 75%. Only a full bus fills the whole block.

**The Red Shell Rule.** Red is the shell (band and tabs) and the possession mark. On the band, the focus ring turns white.

## Typography

**Display Font:** Atkinson Hyperlegible Next Variable (with system-ui, sans-serif)
**Body Font:** the same family; it is the only one

**Character:** A legibility-first humanist sans built for low vision. Tabular figures are on globally (`font-variant-numeric: tabular-nums` on html), so times and seat counts line up like a printed timetable.

### Hierarchy
- **Hora** (800, 2rem/2.25rem, -0.02em): the selected trip's time in the sheet header. This is the only large size.
- **Hora de bloque** (800, 1.25rem/1.5rem, -0.01em): the time inside each trip or reservation block. It is struck through when departed or cancelled.
- **Título** (700, 1.125rem/1.75rem): the route name beside the time, panel headings, and "Mis reservas" in the band.
- **Cuerpo** (400 to 800, 1rem/1.5rem): body text. Buttons use the same size at 800.
- **Detalle** (600, 0.875rem/1.25rem): the block detail line ("29 libres de 30 · Terminal"), tabs, field labels and stop segments. Regular weight is for help text and secondary notes.
- **Etiqueta** (700, 0.75rem/1rem): hour labels in the left column, the "now" chip, and "Últimos cupos".

### Named Rules
**The Time Is the Only Large Size Rule.** The scale is closed. Nothing but a departure time goes above 1.125rem. The one exception is the wordmark, at 1.375rem.

## Layout

The layout is mobile-first and built as a single column on phones. The page margin is 16px. The timetable grid has an hour column (3.25rem) and a trips column, with a 12px gutter and a 1px vertical rule in `grilla` between them. Each hour row starts with a hairline top rule. Trips in the same hour sit in a two-column grid with 8px gaps, and a lone trip spans the full width. Runs of two or more empty hours collapse into one line of text ("Sin viajes de 07:00 a 12:00"). The "now" row is a time chip plus a 2px ink line that spans the grid.

On phones, the selected trip lives in a sheet fixed to the bottom, at up to 78dvh. The grid reserves bottom padding equal to the sheet's measured height, and blocks scroll clear of it.

From 1024px up, content is centered at 72rem with 48px side margins. The page becomes two columns, the timetable plus a 26rem panel, with a 40px gap. The panel is sticky at 24px from the top. The hour column widens to 4.5rem, and trips fill columns of at least 15rem.

"Mis reservas" uses the same grammar as a week table. It has one column per day with a reservation (6.75rem minimum each) and one row per hour. On phones the table scrolls sideways once more than three days are present.

Vertical rhythm comes from gaps of 8, 12 and 16px inside groups, with 20 to 24px between sections.

## Elevation & Depth

The system is flat paper. Depth is carried by fills, hairlines and texture. The only thing that floats is the trip sheet, because it sits over the timetable.

### Shadow Vocabulary
- **Hoja móvil** (`box-shadow: 0 -6px 18px rgb(0 0 0 / 0.08)`): the bottom sheet on phones, together with a `grilla` top border.
- **Hoja escritorio** (`box-shadow: 0 8px 24px rgb(0 0 0 / 0.08)`): the sticky side panel on desktop.
- **Segmento elegido** (`box-shadow: 0 1px 3px rgb(0 0 0 / 0.12)`): the chosen stop lifting slightly out of its gray track.
- **Anillo de selección** (`box-shadow: 0 0 0 2px #fff, 0 0 0 4px #202124`): the chosen trip or reservation block. This is a ring, not elevation.

### Named Rules
**The Only the Sheet Floats Rule.** Blocks, notices, buttons and fields never cast shadows. If something needs separation, use a hairline or a fill.

## Shapes

There are three radii, one for each scale of object. Blocks have softly rounded corners (8px). Controls are slightly rounder (10px): buttons, fields, notices, the segmented track and the band's white pill links. Sheets are the roundest (16px, top corners only on phones). Day tabs are open-bottomed tabs that merge into the paper below them. Fully round shapes are reserved for the check badge, the drag handle and the spinner.

Strokes are 1.5px inset rings on secondary buttons and fields, and 2px for focus or error. Cancelled reservations get a 1.5px dashed `grilla` border instead of a fill. Departed trips get a 135° hatch of 6px stripes in `sutil`/`rayado`, so the state does not rely on gray alone.

## Components

### Buttons
Full width and tactile: 52px tall, 800 weight, and they shrink to 0.97 when pressed.
- **Shape:** control radius (10px).
- **Primario:** `rojo` fill with white text; `rojo-oscuro` on hover. Used for "Reservar mi cupo", "Confirmar reserva" and the final "Sí, cancelar".
- **Secundario:** white with a 1.5px `grilla` inset ring and ink text; `sutil` on hover. Used for every "see another / try again / go back" action.
- **Peligro:** white with a 1.5px `rojo` ring and `rojo-oscuro` text; `rojo-tinte` on hover. Used only to *begin* a cancellation, which then asks for confirmation in place, with no modal.
- **Desactivado / cargando:** `rayado` fill and `apagada` text with no ring. While loading, a 16px spinner sits before the label and `aria-busy` is set.
- **Band link:** a white pill (control radius, 14px semibold red text) with `rojo-tinte` on hover. Used for "Mis reservas" and "← Viajes".

### Inputs / Fields
- **Style:** 48px tall, white, with a 1.5px `grilla` inset ring, control radius and 16px text. The label (14px semibold) sits above, and a help line (14px `apagada`) sits below and is always present.
- **Focus:** the ring becomes 2px `tinta`.
- **Error:** the ring becomes 2px `rojo`, and the help line is replaced by the error in `rojo-oscuro`.

### Navigation
- **Banda:** the red shell holds the wordmark (the word "Ruta" in white plus a "U" in red on a white tile), with an optional action on the right. It respects the safe-area inset.
- **Pestañas de día:** Today, Tomorrow and the day after, at 44px minimum. Inactive tabs have white text on red with `rojo-oscuro` on hover. The active tab is white paper with red text, so it reads as a tab cut into the page. Tabs share the width equally on phones and are 11rem each on desktop.

### Bloque de viaje (signature)
The trip block is a class in the schedule. It is at least 62px tall, uses block radius and 8×12px padding, and shows the time on the first line and the detail on the second.
- **Disponible / pocos / lleno:** a `rojo-suave` fill with a `rojo-ocupado` occupancy layer that rises from the bottom on the fixed ramp. When few seats remain, a third line reads "Últimos cupos" in `rojo-oscuro`. A full bus fills completely and its detail says "Lleno".
- **Salió:** hatched, `apagada` text, time struck through, detail "Salió · …", not interactive.
- **Tuyo:** solid `rojo` with white text, a white check badge next to the time, and detail "Tu cupo · {parada}".
- **Elegido:** the white-then-ink double ring. The fill stays the same.
- **Recién reservado:** a one-time red paint that wipes upward over 460ms. The text changes from ink to white at the same pace, so it never sits as white text on pink.

### Hoja de viaje
The sheet header pairs the time in **Hora** with the route in **Título**. The seat count sits on the right: red "N libres", or "Lleno" in `tinta-2`. Below it a line reads "Bus {placa} · X de Y ocupados". The body changes with the state: stop selector plus Reserve; the data form; a success notice for a trip that is yours; or, when the bus is full, an error notice plus the nearest trip that still has seats.

### Selector de parada
A segmented control: a `sutil` track with 4px padding and a 4px gap, holding one segment per stop with its short name ("Parque 29", "Hospital", "Algodonal"). The chosen segment is white with a 2px inset `rojo` ring and `rojo-oscuro` text. The full stop name and "parada N de M" appear underneath.

### Aviso
A notice: a control-radius box (12×16px) with a 22px Lucide icon and a semibold title, plus optional ink body text. Error notices use a `rojo-tinte` fill with `rojo` icon and `rojo-oscuro` title, and the `alert` role. Success notices use an `exito-suave` fill with `exito` icon and title, and the `status` role.

### Celda de reserva (Mis reservas)
An active reservation cell matches a "tuyo" trip block, with the stop name on two lines at most. A cancelled one keeps its place in the week as a dashed outline with the time struck through and the word "Cancelada". The detail panel opens with a 2px `rojo` top rule rather than a card.

## Do's and Don'ts

### Do:
- **Do** place every trip at its departure hour in the timetable grid, with hairline rules and collapsed empty hours.
- **Do** reserve solid `rojo` blocks for trips the student holds a confirmed seat on.
- **Do** draw occupancy with the `rojo-ocupado` layer on the fixed quarter ramp, and fill the block completely only when the bus is full.
- **Do** pair every state with words, and add hatching, dashing or strikethrough where gray alone would carry it.
- **Do** keep touch targets at 44px or more (buttons 52px, fields 48px, tabs and segments 44px).
- **Do** use the white focus ring on the red band and the 3px ink ring everywhere else.
- **Do** confirm destructive actions in place, as a second step inside the same panel.

### Don't:
- **Don't** use a solid red fill to show selection. Selection is the ink ring.
- **Don't** draw occupancy as a precise percentage bar.
- **Don't** add a second typeface, or any size above 1.125rem other than a departure time.
- **Don't** give blocks, notices or buttons shadows. Only the sheet floats.
- **Don't** show white text on the soft-red fills.
- **Don't** let a cancelled or departed trip disappear from its slot. Strike it through and label it.
