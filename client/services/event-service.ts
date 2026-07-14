import { featuredEvents } from "@/data/events";

export const eventService = {
  async getFeaturedEvents() {
    await new Promise((resolve) => setTimeout(resolve, 250));
    return featuredEvents;
  },
};
