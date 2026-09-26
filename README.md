# HMCS Frédérick Rolette — Crew Health Hub

A static, mobile-first health information site for the ship's company: health briefs, clinic and contact directories, support resources, and interactive learning tools. No build step or server code. Open `index.html` or host the folder on any static web host.

## What's here

| Page | Purpose |
| --- | --- |
| `index.html` | Home, with the Readiness dashboard (badges and progress) |
| `health-topics.html` + 6 briefs | Fatigue, foot care, seasickness, shaving, winter skin, wound care. Each has a Knowledge Check quiz |
| `toolkit.html` | Caffeine & sleep planner, power-nap timer, wind chill (knots or km/h), humidex, hydration check, standard-drink counter |
| `challenge.html` | Crew Health Challenge: 10 random questions, streaks, and navy ranks |
| `clinic-hours.html`, `contacts.html`, `support.html`, `cessation.html`, `notices.html` | Clinic services, contacts, mental health and substance-use support, notices |
| `helping-pros.html`, `cfhs_halifax_phone_list.html` | Stand-alone searchable phone directories |

### Scripts

- `scripts/app.js` loads on every main page. It provides the **Help Now** crisis-lines button, progress and badges, toasts, and confetti.
- `scripts/quiz-data.js` holds all quiz questions. Edit here to add or change questions, and keep answers in line with the brief text.
- `scripts/quiz.js` renders brief Knowledge Checks (`<section data-quiz="id">`) and the Challenge.
- `scripts/toolkit.js` contains the toolkit calculators, with sources noted in the file header.
- `styles/interactive.css` styles all interactive components (light and dark themes).

Progress is saved only in the viewer's browser (`localStorage`) and is never sent anywhere. If storage is blocked, everything still works.

## Content review — 26 September 2026

Checked against current Canadian and CAF sources:

- **SMSRC → DCSRC.** Renamed Defence Community Support and Resource Centre in April 2026, with a mandate expanded to include racism. Same 24/7 line (1-844-750-1648); new email `DND.DCSRC-CSRCD.MDN@forces.gc.ca`. Updated on the support, clinic, and helping-professionals pages. The site previously showed the old "SMRC" name and email.
- **Crisis lines.** Removed the retired Talk Suicide Canada line (1-833-456-4566, text 45645) and the "HOME to 686868" adult text line. **9-8-8 (call or text)** is now the national line. Added Hope for Wellness (1-855-242-3310), Kids Help Phone, and CAFKIDS/JEUNESFAC texting.
- **Alcohol.** Added *Canada's Guidance on Alcohol and Health* (CCSA, 2023): 1–2 drinks/week low risk, no more than 2 per occasion, with standard-drink sizes.
- **Cannabis.** Added the DAOD 9004-1 rules (8 h / 24 h / 28 days; none on board or on international operations). Notes the June 2026 amendment (CANFORGEN 115/26) and links to the current DAOD.
- **Opioids.** Updated the NS Take Home Naloxone link to the NS Mental Health & Addictions page (no prescription, health card, or ID needed). Added a Good Samaritan Drug Overdose Act note.
- **Sleep.** Added the Canadian 24-Hour Movement Guidelines target (7–9 h per 24 h) to the fatigue brief.
- **Names.** "Nova Scotia Health Authority/NSHA" → "Nova Scotia Health"; "HealthLink" → "811 Nova Scotia".
- **Notices.** The 23 March 2026 scabies advisory was archived under Previous Notices, with the re-exposure timing and post-treatment itch duration corrected. Added a general respiratory-season reminder.
- **Fixes.** Removed stray Markdown code fences that showed as text on `helping-pros.html`. Made the pharmacy number tappable. Theme storage errors no longer break the page in private browsing.

### Needs local confirmation

Local phone extensions, CDU numbers, and the CFHS directory (dated January 2024) could not be checked from outside the base network. Ship's medical staff should confirm these and update the dates.
