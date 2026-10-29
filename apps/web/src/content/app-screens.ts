// Existing Ikitai store captures: real app UI with fictional demo data.
// Provenance and original dimensions are documented in docs/ASSETS.md.
export const ikitaiScreens = [
  {
    id: 'timeline',
    label: 'Timeline',
    src: '/projects/ikitai-timeline.jpg',
    alt: 'Ikitai timeline with an upcoming concert, a ticket-sale reminder, and a trip.',
  },
  {
    id: 'details',
    label: 'Plan details',
    src: '/projects/ikitai-detail.jpg',
    alt: 'Ikitai plan details with the event date, venue, ticket options, and sharing controls.',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    src: '/projects/ikitai-calendar.jpg',
    alt: 'Ikitai calendar with a month view and a dinner plan for the selected day.',
  },
] as const;
