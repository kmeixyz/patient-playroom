export type Section = {
  id: string
  number: string
  title: string
  eyebrow?: string
}

/**
 * Brief anchors are prefixed so every in-page link keeps the URL on the #brief
 * route while still resolving to a real element id for native scrolling.
 */
export const anchorId = (id: string) => `brief-${id}`

export const sections: Section[] = [
  { id: 'overview', number: '00', title: 'Overview', eyebrow: 'Start here' },
  { id: 'summary', number: '01', title: 'Executive Summary' },
  { id: 'background', number: '02', title: 'Background & Opportunity' },
  { id: 'hypothesis', number: '03', title: 'Design Hypothesis' },
  { id: 'purpose', number: '04', title: 'Purpose & Benefits' },
  { id: 'users', number: '05', title: 'Users & Use Context' },
  { id: 'experience', number: '06', title: 'Experience & Game Design' },
  { id: 'requirements', number: '07', title: 'Considerations & Requirements' },
  { id: 'pilot', number: '08', title: 'Pilot Questions & Measures' },
  { id: 'deliverables', number: '09', title: 'Suggested Deliverables' },
]

export const meta = {
  status: 'Draft',
  title: 'Pediatric Outpatient Waiting-Room Game',
  subtitle: 'Design brief',
  purpose:
    'Align the team on the problem, intended benefits, MVP boundaries, and design guardrails.',
  facts: [
    {
      label: 'Primary setting',
      value: "3rd floor Lurie Children's outpatient waiting room",
    },
    {
      label: 'Primary audience',
      value: 'Children approximately ages 6 through 14',
      note: 'Lower age bound to be confirmed',
    },
    {
      label: 'Project name',
      value: 'Medical Virtual Playground (MVP) Prototype',
    },
  ],
  challenge:
    'How might Lurie provide an easily accessible, age-appropriate smartphone-based activity that keeps pediatric patients engaged in the waiting room and/or clinic room to reduce anxiety while waiting for or receiving care?',
}

export type Responsibility = {
  owner: string
  tone: 'student' | 'lurie'
  items: string[]
  assess?: { name: string; detail: string }[]
}

export const summary: {
  scope: string
  responsibilities: Responsibility[]
  outcome: string
} = {
  scope:
    'Design and build a mobile-friendly prototype containing a small collection of short, Lurie-themed games and interactions that children can access in an outpatient waiting room and clinic room.',
  responsibilities: [
    {
      owner: 'Student responsibility',
      tone: 'student',
      items: [
        'Develop a functional mobile-friendly prototype that caregivers can download and young children can engage with while in the 3rd floor waiting room and/or a generic clinic room.',
      ],
    },
    {
      owner: 'Lurie responsibility',
      tone: 'lurie',
      items: ['Run a pilot to assess:'],
      assess: [
        {
          name: 'Engagement',
          detail: 'Number of downloads, types of games played, and for how long.',
        },
        {
          name: 'Usability',
          detail:
            'Is the app easy to access, is the UX/UI easy to navigate and use, are the activities developmentally appropriate?',
        },
        {
          name: 'Value',
          detail:
            'Do the kids enjoy the activities, does it reduce anxiety and/or restlessness, do caregivers find it helpful?',
        },
        {
          name: 'Implementation',
          detail:
            'How does it work with the environment, how do staff feel about it, what would be needed to expand use?',
        },
      ],
    },
  ],
  outcome:
    "Generate early evidence about whether families can and will access the app, which games and activities hold children's attention and help reduce anxiety, and how it fits into the workflow — to inform refinement and scaling.",
}

export const background = {
  paragraphs: [
    "When making an appointment at Lurie Children's, families are asked to arrive approximately 30 minutes early for check-in. However, some arrive even earlier (up to an hour early) because they are nervous about being late, and the wait can sometimes be extended further if appointments are running behind.",
    'Caregivers often bring snacks, water, and distraction activities (e.g. toys, coloring books) knowing that they may have to keep their child entertained while waiting for the appointment. But those resources may run out before the appointment begins.',
    'As children become antsy and more aware of the clinical environment, anxiety and restlessness may increase. Some children may get visibly upset or anxious, or start engaging in disruptive behavior — such as going up to other kids or attempting to leave the clinic area (a.k.a. "elopement").',
    'This sequence of events can occur in any child but may be more likely and/or more intense for neurodivergent children or younger children. Research has suggested neurodivergent populations experience anxiety at higher levels than their counterparts.',
    "Increased anxiety can result in a more stressful clinic visit and a negative experience for the patient and caregiver, potentially resulting in a negative association with doctor's appointments overall and greater anxiety on future visits.",
  ],
  opportunity:
    'There is an opportunity to create a Lurie-specific resource that helps reduce anxiety and restlessness in younger kids by providing them with engaging activities while they are in the waiting room or while receiving care in a clinic room.',
  chain: [
    { label: 'Early arrival', detail: '30–60 minutes before the appointment' },
    { label: 'Resources run out', detail: 'Snacks and toys stop working' },
    { label: 'Restlessness rises', detail: 'Awareness of the clinical setting' },
    { label: 'Anxiety & disruption', detail: 'Upset, wandering, elopement' },
    { label: 'Negative association', detail: 'Harder future visits' },
  ],
}

export const hypothesis = {
  statement:
    'If Lurie provides children with fun and engaging activities and options, then they will be distracted from the clinical environment and extended wait time — reducing anxiety and creating a more positive experience for patients, caregivers, and staff.',
}

export const purpose = {
  primaryPurpose:
    'Provide a fun, light, and accessible distraction during outpatient waiting periods and when in the clinic room.',
  beneficiaries: [
    {
      role: 'Primary beneficiary',
      who: 'The child waiting for an outpatient appointment',
      detail: 'e.g. lab visit, cast removal, blood draw, vaccine, or follow-up visit.',
    },
    {
      role: 'Secondary beneficiaries',
      who: 'Caregivers and staff',
      detail:
        'Caregivers who need an engagement tool, and staff who benefit when the waiting environment is calmer and easier to manage.',
    },
  ],
  benefits: [
    {
      title: 'Something engaging to do',
      body: 'Give children something engaging to do in the waiting room and during clinic visits, as appropriate.',
    },
    {
      title: 'A shorter-feeling wait',
      body: 'Make the waiting experience feel shorter, lighter, and less intimidating.',
    },
    {
      title: 'Restlessness with an outlet',
      body: 'Help channel restlessness into an activity that is compatible with the waiting-room and clinic room workflow.',
    },
    {
      title: 'Recognizably Lurie',
      body: 'Offer a recognizable, Lurie-specific experience rather than a generic commercial game, to create positive associations with clinic visits and Lurie overall.',
    },
    {
      title: 'Built for a broad range of kids',
      body: 'Support a broad range of children, including neurodivergent children and children with different reading, sensory, communication, and mobility needs.',
    },
  ],
}

export type UserGroup = {
  kind: 'primary' | 'secondary'
  name: string
  facets: { label?: string; points: string[]; rationale?: string }[]
}

export const users: UserGroup[] = [
  {
    kind: 'primary',
    name: 'Children (patients)',
    facets: [
      {
        label: 'Age range',
        points: ['Ages 6 through 14.'],
        rationale:
          'Younger children may become frustrated or anxious more easily, while older teens will likely have preferred content, their own phones, and better coping strategies.',
      },
      {
        label: 'Developmental range',
        points: [
          'Kids at a 1st grade reading level',
          'Neurodivergent and neurotypical patients',
          'All mobility levels — the game does not require moving around the room or highly dexterous hand motions',
        ],
        rationale:
          "The app should be usable and valuable for both neurodivergent and neurotypical kiddos. This lets us leverage Mary Kate's expertise while supporting neurodivergent children who may be more prone to waiting room anxiety and restlessness, with the assumption that the app will also have value for neurotypical patients.",
      },
      {
        label: 'Primary setting',
        points: [
          '3rd floor outpatient waiting room and the clinic rooms on the 3rd floor.',
        ],
        rationale:
          'The 3rd floor serves multiple appointment types and has the largest outpatient volume. It will serve as the prototype and pilot setting, with the goal of expanding to the other outpatient floors (4th, 6th, and 7th).',
      },
    ],
  },
  {
    kind: 'secondary',
    name: 'Caregivers',
    facets: [
      {
        points: [
          'Caregivers will likely be the person informed about the game (via a staff member or signage) and who downloads it onto their phone.',
          'They may also help the child navigate the app and/or play the different games.',
        ],
      },
    ],
  },
  {
    kind: 'secondary',
    name: 'Staff',
    facets: [
      {
        points: [
          'Staff will be aware of the app and educated on how to access it so they can help caregivers download it, but they will not be primary users.',
          'Staff will be consulted on the design and implementation to ensure the app is patient appropriate and does not detract from providing or receiving care, or cause disruption to other patients and caregivers.',
        ],
      },
    ],
  },
]

export const experience = {
  intro:
    'The overall experience should feel playful, familiar, forgiving, and easy to enter. It should not feel like schoolwork, a clinical education module, or another task the child must finish.',
  latitude:
    'The student team has room to shape the visual style, characters, game mix, and technical approach within the requirements below.',
  structure: [
    'Offer multiple independent games or interactions from a clear menu.',
    'Keep each interaction short; total session length does not need to be fixed.',
    'Allow the child to leave one game and select another immediately — or replay the same game if it is keeping their interest. Let the child switch games, pause, or stop at any time without penalty or a failure message.',
    'Avoid levels, required progression, scores that create pressure, or anything the child must achieve.',
    'Familiarity is acceptable and may be beneficial. The same set of games can remain available each time, because unexpected novelty can be difficult for some children.',
    'Variation within the same set of games is welcome — for example, changing a tic-tac-toe opponent\u2019s moves, providing a new set of words for a word search, or rearranging matching tiles — but the MVP does not have to generate entirely new games each session.',
    'Use positive, low-key reinforcement without creating competition, failure, or frustration.',
    'Use Lurie-specific visual cues, environments, characters, or rewards only after the team confirms brand and asset approval.',
    'Build the prototype so additional games, settings, or educational content could be added later, without building those future features now.',
  ],
  conceptsNote:
    'These are creative references, not a required feature list. The students should select a coherent set that can be designed, built, and tested well within the available time; fewer, better-developed games are preferable to a larger unfinished collection.',
  concepts: [
    {
      icon: 'search',
      concept: 'Find and reveal',
      interaction:
        'Find characters in a scene; tap a chair, door, drawer, or other object to reveal a surprise.',
      intent: 'Visual discovery, curiosity, and connection to the environment.',
    },
    {
      icon: 'tiles',
      concept: 'Matching',
      interaction:
        'Turn over a small set of tiles and match pairs, potentially using approved Lurie imagery.',
      intent: 'Simple rules, brief play, and gentle positive reinforcement.',
    },
    {
      icon: 'eye',
      concept: '"I spy"',
      interaction:
        'Have a set of objects virtually scattered around the waiting room or clinic and have patients "find" them.',
      intent:
        'Visual discovery, simple rules, positive reinforcement, curiosity, and connection to the environment.',
    },
    {
      icon: 'grid',
      concept: 'Tic-tac-toe',
      interaction:
        'Play against the app or a caregiver; vary the board response between games.',
      intent: 'Familiar, repeatable, and easy to understand.',
    },
    {
      icon: 'maze',
      concept: 'Maze or ball maze',
      interaction:
        'Guide a character or ball through a short maze using simple touch or tilt controls.',
      intent: 'Focused interaction without a long learning curve.',
    },
    {
      icon: 'letters',
      concept: 'Word search',
      interaction:
        'Find a small set of age-appropriate words using large, readable targets.',
      intent: 'An option for older children who prefer language-based play.',
    },
    {
      icon: 'jump',
      concept: 'Simple jumping game',
      interaction:
        'Help a character jump over playful obstacles inspired by the waiting-room or clinic setting.',
      intent:
        'More active visual engagement without requiring the child to move physically.',
    },
    {
      icon: 'dance',
      concept: 'Dancing characters',
      interaction: 'Tap to trigger a brief, quiet animation or character dance.',
      intent:
        'A low-effort, humorous interaction that can make the space feel less serious.',
    },
  ],
  scenario: [
    {
      step: 'Arrive early',
      body: 'A kiddo and caregiver arrive early for an outpatient appointment and check in at the 2nd floor check-in desk.',
    },
    {
      step: 'Hear about it',
      body: 'A staff member tells the caregiver about the Lurie MVP app.',
    },
    {
      step: 'Get settled',
      body: 'The kiddo and caregiver travel to the 3rd floor and get settled in the waiting room.',
    },
    {
      step: 'Scan the QR code',
      body: 'The caregiver sees the QR code on the wall, downloads the app onto their phone, and opens it up.',
    },
    {
      step: 'Explore or play',
      body: 'The child virtually "explores" the waiting room, or chooses a short game to play.',
    },
    {
      step: 'Switch freely',
      body: "If the kiddo doesn't like the game or finishes it, they can easily switch to another game or keep exploring.",
    },
    {
      step: 'Stop when called',
      body: 'When their name is called, the kiddo can pause or end the game and head to the clinic room.',
    },
    {
      step: 'Continue in the room',
      body: 'They can choose to continue playing once in the room, or "explore" the clinic room.',
    },
  ],
}

export type RequirementGroup = {
  id: string
  title: string
  blurb: string
  must: string[]
  avoid: string[]
  niceToHave?: string[]
}

export const requirements: RequirementGroup[] = [
  {
    id: 'environment',
    title: 'Connection to the Lurie environment',
    blurb: 'How the experience meets the family inside the building.',
    must: [
      'Provide a fast entry point, potentially a QR code or short link. The experience may be introduced during second-floor check-in and accessed after the family reaches the waiting room (the final workflow remains to be confirmed).',
      'The app may recreate the waiting room as an illustrated or virtual scene and place games or playful surprises within it.',
      'Most meaningful visual elements should be discoverable while the child remains seated.',
      'The design should draw attention away from frightening or stressful cues, for example during a blood draw.',
    ],
    avoid: [
      'Do not build on augmented reality or require the phone\u2019s camera to play.',
      "Do not direct the child toward restricted areas or into another family's personal space.",
    ],
    niceToHave: [
      'The experience should still be usable outside Lurie; hospital-specific context can enhance the experience without making location a technical dependency.',
    ],
  },
  {
    id: 'sensory',
    title: 'Sensory, accessibility, and physical workflow',
    blurb: 'Designing for a wide range of bodies, brains, and seating positions.',
    must: [
      'Use a visually led interface rather than relying on written or audible instruction, with minimal reading for core navigation, large touch targets, simple instructions, and forgiving controls.',
      'Keep the experience engaging but not overstimulating.',
      'Sound should be limited, optional, and off by default, with no sudden loud effects.',
      'Design for different reading, cognitive, communication, sensory, dexterity, and mobility needs rather than treating neurodivergent children as one uniform group.',
      'All core games must be playable while seated.',
    ],
    avoid: [
      'Do not use flashing effects; avoid rapid transitions, visually chaotic motion, and unexpected changes.',
      'Do not rely on audio or assume headphones are available.',
      'Do not require walking, standing, holding the phone steadily, or performing precise gestures.',
      'Do not encourage children to approach doors, check-in desks, other families, or restricted areas.',
      "Do not interfere with staff communication, check-in, caregiver supervision, or the child's ability to stop immediately when called.",
    ],
  },
  {
    id: 'technology',
    title: 'Technology, privacy, and operations',
    blurb: 'Constraints that keep the prototype safe, light, and pilot-ready.',
    must: [
      'Design for common mobile-phone screen sizes and both major mobile operating systems where feasible.',
      'Keep initial load time and data use low; if practical, preserve core play during a temporary connection loss.',
    ],
    avoid: [
      'Do not require account creation or collect names, diagnoses, appointment details, photographs, audio, precise location, or other identifiable information.',
      'Do not integrate with hospital systems during this phase.',
      'Do not assume reliable headphones, strong cellular service, or unlimited data.',
      'Do not use Lurie logos, photographs, characters, or brand assets until the team confirms permission and provides approved files.',
    ],
  },
]

export const pilot = {
  intro:
    'The first pilot is primarily an adoption and engagement test. The largest initial question is whether families will access and use the experience when it is made available. The pilot will be run by Lurie, but the design should enable access, adoption, and engagement data to be collected.',
  rows: [
    {
      dimension: 'Access and adoption',
      question: 'Do families notice and open it?',
      evidence:
        'Unique users or sessions; QR/link opens; proportion of approached or eligible families who access it, if measurable.',
    },
    {
      dimension: 'Engagement',
      question: 'Which games hold attention?',
      evidence:
        'Game starts; time spent; repeat plays; switching between games; voluntary return to the app.',
    },
    {
      dimension: 'Desirability',
      question: 'Do children find the games fun?',
      evidence:
        'Brief child feedback about favorite, least favorite, and confusing games.',
    },
    {
      dimension: 'Caregiver value',
      question: 'Does it provide a useful additional distraction?',
      evidence:
        "Brief caregiver feedback on usefulness, perceived child's anxiety, ease of access, and whether they would use it again.",
    },
    {
      dimension: 'Operational fit',
      question: 'Does it work in the waiting-room environment?',
      evidence:
        'Staff observations about noise, movement, interruptions, workflow, and any unintended effects.',
    },
  ],
}

export const deliverables = {
  groups: [
    {
      owner: 'Students',
      tone: 'student' as const,
      items: [
        {
          name: 'Environment and workflow observation',
          body: 'Take pictures and video of the 3rd floor waiting room and clinic room so the students can create a virtual version of each to house the different games and interaction points.',
        },
        {
          name: 'Experience concept',
          body: 'Propose a list of 3–5 games or interactions to be included in the app and how kids will navigate it.',
        },
        {
          name: 'Design prototype',
          body: 'Create wireframes and a clickable prototype showing the entire user experience journey — download, app entry, game selection, play, switching games, stopping games.',
        },
        {
          name: 'Functional MVP',
          body: 'Build the smallest functional version that can be used on a phone and tested with representative users. The pilot will be run by Lurie, but the design should enable access, adoption, and engagement data to be collected.',
        },
        {
          name: 'Technical handoff',
          body: 'Document the code and the information and steps needed for another developer to continue the work.',
        },
      ],
    },
    {
      owner: 'Lurie team',
      tone: 'lurie' as const,
      items: [
        {
          name: 'Pilot measurement plan',
          body: 'Define privacy-conscious analytics and short child, caregiver, and staff feedback questions aligned with the pilot hypotheses.',
        },
      ],
    },
  ],
  success:
    'A focused, usable prototype that allows families to access and interact with it and enables Lurie to run a pilot to evaluate whether families will access and use it, identifies which short interactions children prefer, and leaves a well-documented foundation for a larger effort.',
}
