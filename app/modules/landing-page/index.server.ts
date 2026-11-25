import { db } from "~/db";
import { getLandingPage, type Db } from "./lib/landing-page";

export type { FeaturedCourse, LandingPage } from "./lib/landing-page";
export { FEATURED_COURSE_LIMIT } from "./lib/landing-page";

export function createLandingPage(database: Db) {
  return {
    get() {
      return getLandingPage(database);
    },
  };
}

// Pure so a route importing this only for its loader doesn't pull the
// database into the client bundle (see `~/db`).
export const landingPage = /* @__PURE__ */ createLandingPage(db);
