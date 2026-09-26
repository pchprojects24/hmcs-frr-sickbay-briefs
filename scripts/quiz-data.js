/* quiz-data.js — Knowledge Check questions for each brief, plus extra
   questions used only by the Crew Health Challenge.
   Every answer comes from the matching brief or page on this site.
   `answer` is the index of the correct option. */
(function () {
  'use strict';

  window.FRR_QUIZ = {
    fatigue: {
      title: 'Fatigue at Sea',
      page: 'fatigue.html',
      icon: '😴',
      questions: [
        {
          q: 'How much sleep in 24 hours do the Canadian 24-Hour Movement Guidelines recommend for adults?',
          options: ['4–5 hours', '5–6 hours', '7–9 hours', '10+ hours'],
          answer: 2,
          why: 'Aim for 7–9 hours in 24 hours. At sea that usually means a 4+ hour core block topped up with naps.'
        },
        {
          q: 'You are nodding off before a watch. What is the best-sized nap?',
          options: ['10–30 minutes', '45–60 minutes', '90 minutes', 'Skip the nap and push through'],
          answer: 0,
          why: 'Keep naps under 30 minutes, or allow 15+ minutes to shake off grogginess after a longer one.'
        },
        {
          q: 'About how much caffeine per day is the upper limit for most healthy adults, according to Health Canada?',
          options: ['100 mg', '250 mg', '400 mg', '800 mg'],
          answer: 2,
          why: 'Health Canada’s guidance is about 400 mg a day (roughly three 8 oz cups of brewed coffee).'
        },
        {
          q: 'Why is a "nightcap" a bad sleep aid?',
          options: ['It has too much sugar', 'Alcohol breaks up your sleep and worsens recovery', 'It makes you too alert', 'It is fine in small amounts every night'],
          answer: 1,
          why: 'Alcohol may help you drop off, but it fragments sleep, so you wake up less rested.'
        }
      ]
    },

    'foot-care': {
      title: 'Foot Care at Sea',
      page: 'foot-care.html',
      icon: '👟',
      questions: [
        {
          q: 'You feel a hotspot on your heel mid-watch. What should you do first?',
          options: ['Ignore it until it blisters', 'Stop, dry the area, change socks and pad it', 'Pop it with a pin', 'Wrap it with tight tape'],
          answer: 1,
          why: 'Treat hotspots early: dry, change socks, and pad with moleskin or a blister dressing.'
        },
        {
          q: 'How should toenails be trimmed to prevent ingrown nails?',
          options: ['Rounded and very short', 'Straight across, not too short', 'Only when they hurt', 'Angled into the corners'],
          answer: 1,
          why: 'Straight across and not too short lowers the chance of an ingrown nail.'
        },
        {
          q: 'Your athlete’s foot rash cleared up. How long should you keep using antifungal cream?',
          options: ['Stop right away', '1–2 weeks after it clears (or as the package directs)', '6 months', 'Only when it itches'],
          answer: 1,
          why: 'Keep going for 1–2 weeks after the rash clears so it does not come back.'
        }
      ]
    },

    seasickness: {
      title: 'Seasickness',
      page: 'seasickness.html',
      icon: '🌊',
      questions: [
        {
          q: 'Where on the ship is motion usually felt the least?',
          options: ['Bow, high up', 'Stern, high up', 'Midship and low', 'The bridge wings'],
          answer: 2,
          why: 'Midship and low is usually the most stable spot on the ship.'
        },
        {
          q: 'When is motion-sickness medication most effective?',
          options: ['Before the motion starts', 'After you have vomited twice', 'Only at night', 'With a drink to relax'],
          answer: 0,
          why: 'Take it early, before expected motion. Never mix it with alcohol, and tell your supervisor because it can make you drowsy.'
        },
        {
          q: 'How long do most people take to get their "sea legs"?',
          options: ['About 2 hours', 'About 2–3 days', 'About 2 weeks', 'Never'],
          answer: 1,
          why: 'Most people adapt after 2–3 days of continuous sailing.'
        },
        {
          q: 'Which is a sign you should see Sick Bay?',
          options: ['Mild queasiness on day one', 'Unable to keep fluids down for about 12+ hours', 'Craving crackers', 'Yawning more than usual'],
          answer: 1,
          why: 'Not keeping fluids down for about 12 hours, fainting, or very dark urine all point to dehydration.'
        }
      ]
    },

    shaving: {
      title: 'Shaving & Razor Bumps',
      page: 'shaving.html',
      icon: '🪒',
      questions: [
        {
          q: 'Which direction should you shave to reduce razor bumps?',
          options: ['Against the grain', 'With the grain', 'In circles', 'It does not matter'],
          answer: 1,
          why: 'Shave with the grain using light pressure and as few passes as possible.'
        },
        {
          q: 'About how often should you replace a razor blade?',
          options: ['Every shave', 'After about 5–7 shaves, or sooner if it tugs', 'Once a month no matter what', 'Only when it rusts'],
          answer: 1,
          why: 'Replace blades after about 5–7 shaves, or sooner if they tug or feel dull.'
        },
        {
          q: 'Which sign suggests infection rather than simple irritation?',
          options: ['Redness that settles within hours', 'Pus, crusting, or pain that increases after 1–2 days', 'A slight sting from aftershave', 'Smooth skin'],
          answer: 1,
          why: 'Pus, crusting, spreading redness, or worsening pain after 1–2 days means possible infection. See Sick Bay.'
        }
      ]
    },

    'winter-skin': {
      title: 'Cold Weather Skin',
      page: 'winter-skin.html',
      icon: '❄️',
      questions: [
        {
          q: 'Which lasts longest on dry skin?',
          options: ['Lotion', 'Cream', 'Ointment', 'Hand sanitizer'],
          answer: 2,
          why: 'Rule of thumb: ointment > cream > lotion for staying power.'
        },
        {
          q: 'Nosebleed! What is the right first move?',
          options: ['Tilt your head back', 'Sit up, lean forward, and pinch the soft part of the nose for 10–15 minutes', 'Lie flat', 'Blow your nose hard'],
          answer: 1,
          why: 'Lean forward and pinch firmly for 10–15 minutes without peeking. Do not tilt your head back.'
        },
        {
          q: 'Numb, hard, waxy, or pale skin after cold exposure could mean…',
          options: ['Normal dryness', 'Cold injury such as frostbite: cover gently and get help right away', 'An allergy to wool', 'Sunburn'],
          answer: 1,
          why: 'Those are signs of cold injury. Cover the area gently and get help right away.'
        }
      ]
    },

    'wound-care': {
      title: 'Minor Cuts & Wound Care',
      page: 'wound-care.html',
      icon: '🩹',
      questions: [
        {
          q: 'What is the best way to clean a minor cut?',
          options: ['Pour hydrogen peroxide into it', 'Rinse under gentle drinking water for 2–5 minutes', 'Rinse with seawater', 'Scrub hard with alcohol'],
          answer: 1,
          why: 'Rinse with potable water for 2–5 minutes and use mild soap on the skin around it. Peroxide and alcohol damage tissue.'
        },
        {
          q: 'For a dirty wound, a tetanus booster may be needed if your last dose was more than…',
          options: ['1 year ago', '5 years ago', '20 years ago', 'Never needed'],
          answer: 1,
          why: 'Routine boosters are every 10 years, but for dirty wounds you may need one if it has been more than 5 years.'
        },
        {
          q: 'Bleeding still has not stopped after 10 minutes of firm, steady pressure. You should…',
          options: ['Keep waiting another hour', 'Get it checked at Sick Bay', 'Close it yourself with glue', 'Leave it uncovered'],
          answer: 1,
          why: 'Bleeding past 10 minutes of firm pressure, deep or gaping cuts, punctures, and bites all need assessment.'
        }
      ]
    },

    /* ── Challenge-only sets ── */
    lifelines: {
      title: 'Lifelines',
      page: 'support.html',
      icon: '🆘',
      challengeOnly: true,
      questions: [
        {
          q: 'What number can you call OR text 24/7 anywhere in Canada if you are thinking about suicide?',
          options: ['811', '911', '988', '211'],
          answer: 2,
          why: '9-8-8 is Canada’s Suicide Crisis Helpline. Call or text, 24/7, in English or French.'
        },
        {
          q: 'What does CFMAP (1-800-268-7708) provide?',
          options: ['Pay and leave questions', 'Free, confidential 24/7 counselling for CAF members and families', 'Only financial loans', 'Medical records requests'],
          answer: 1,
          why: 'The CF Member Assistance Program is confidential, short-term counselling available 24/7.'
        },
        {
          q: 'The SMSRC has a new name and a wider mandate. What is it now?',
          options: ['Defence Community Support and Resource Centre (DCSRC)', 'Military Police Victim Services', 'CF Health Services Group', 'It was closed'],
          answer: 0,
          why: 'Since April 2026 it is the DCSRC. It supports people affected by sexual misconduct or racism, 24/7 at 1-844-750-1648.'
        },
        {
          q: 'Ashore in Nova Scotia and want free nurse advice? Call…',
          options: ['811', '411', '611', '311'],
          answer: 0,
          why: '811 Nova Scotia connects you with a registered nurse 24/7.'
        }
      ]
    },

    substance: {
      title: 'Substance Use',
      page: 'cessation.html',
      icon: '🩺',
      challengeOnly: true,
      questions: [
        {
          q: 'Under Canada’s Guidance on Alcohol and Health, what is the most you should drink on any one occasion?',
          options: ['2 standard drinks', '4 standard drinks', '6 standard drinks', 'No limit on weekends'],
          answer: 0,
          why: 'No more than 2 standard drinks per occasion, and 1–2 per week is low risk.'
        },
        {
          q: 'Which of these is ONE standard drink in Canada?',
          options: ['A 473 mL tall can of 5% beer', 'A 341 mL bottle of 5% beer', 'A full bottle of wine', 'A double shot of 40% spirits'],
          answer: 1,
          why: 'One standard drink = 341 mL of 5% beer, 142 mL of 12% wine, or 43 mL of 40% spirits.'
        },
        {
          q: 'Under DAOD 9004-1, what is the minimum time CAF members must go without cannabis before any duty?',
          options: ['1 hour', '8 hours', '2 hours', 'No rule'],
          answer: 1,
          why: 'At least 8 hours before any duty, with longer periods (24 hours, 28 days) for some duties, and none on board.'
        },
        {
          q: 'Where can you get a free Take Home Naloxone kit in Nova Scotia?',
          options: ['Only at hospitals, with a prescription', 'At participating pharmacies, with no prescription or ID needed', 'Online only', 'They are not available in NS'],
          answer: 1,
          why: 'Participating NS pharmacies give free kits and training. No prescription, health card, or ID is needed.'
        }
      ]
    }
  };
})();
