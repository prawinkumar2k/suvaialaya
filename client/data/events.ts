export type EventCategory = "Music" | "Design" | "Business";

export interface FeaturedEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string;
  location: string;
  attendees: string;
  accent: string;
}

export const featuredEvents: FeaturedEvent[] = [
  {
    id: "future-founders",
    title: "Future Founders Summit 2025",
    category: "Business",
    date: "Oct 14–16, 2025",
    location: "Pier 27, San Francisco",
    attendees: "1.2k attending",
    accent: "from-primary to-accent",
  },
  {
    id: "form-function",
    title: "Form & Function",
    category: "Design",
    date: "Nov 06, 2025",
    location: "The Foundry, New York",
    attendees: "684 attending",
    accent: "from-fuchsia-400 to-violet-600",
  },
  {
    id: "after-hours",
    title: "After Hours: Live in London",
    category: "Music",
    date: "Dec 12, 2025",
    location: "KOKO, London",
    attendees: "2.4k attending",
    accent: "from-amber-300 to-orange-600",
  },
];

export const platformStats = [
  { value: "14k+", label: "events powered" },
  { value: "2.8M", label: "tickets delivered" },
  { value: "99.99%", label: "scan reliability" },
];
