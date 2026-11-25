import { eq } from "drizzle-orm";
import { describe, it, expect, beforeEach } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import * as schema from "~/db/schema";
import { CourseStatus } from "~/db/schema";
import { markdown } from "~/lib/text";
import { createLandingPage, FEATURED_COURSE_LIMIT } from "../index.server";

let db: TestDb;
let instructorId: number;
let categoryId: number;
let baseCourseId: number;

beforeEach(() => {
  db = createTestDb();
  const base = seedBaseData(db);
  instructorId = base.instructor.id;
  categoryId = base.category.id;
  baseCourseId = base.course.id;
});

// ─── Fixtures ───
// The landing page only reads the catalogue; no module writes courses,
// modules or lessons yet, so rows go in directly. Kept in one place so a
// schema change touches only this block.

let slugCounter = 0;

function addCourse(
  title: string,
  {
    status = CourseStatus.Published,
    createdAt = "2026-01-01T00:00:00.000Z",
    category = categoryId,
  }: { status?: CourseStatus; createdAt?: string; category?: number } = {}
) {
  slugCounter += 1;
  return db
    .insert(schema.courses)
    .values({
      title,
      slug: `landing-${slugCounter}`,
      description: `${title} description`,
      salesCopy: markdown(title),
      instructorId,
      categoryId: category,
      status,
      createdAt,
    })
    .returning()
    .get();
}

function addCategory(name: string) {
  return db
    .insert(schema.categories)
    .values({ name, slug: name.toLowerCase() })
    .returning()
    .get();
}

function addLessons(courseId: number, lessonsPerModule: number[]) {
  lessonsPerModule.forEach((lessonCount, modulePosition) => {
    const module = db
      .insert(schema.modules)
      .values({
        courseId,
        title: `Module ${modulePosition}`,
        position: modulePosition,
      })
      .returning()
      .get();
    for (let position = 0; position < lessonCount; position++) {
      db.insert(schema.lessons)
        .values({ moduleId: module.id, title: `Lesson ${position}`, position })
        .run();
    }
  });
}

function unpublishBaseCourse() {
  db.update(schema.courses)
    .set({ status: CourseStatus.Draft })
    .where(eq(schema.courses.id, baseCourseId))
    .run();
}

function landing() {
  return createLandingPage(db).get();
}

describe("landingPage.get", () => {
  it("features the newest published courses, newest first", () => {
    unpublishBaseCourse();
    addCourse("Oldest", { createdAt: "2025-01-01T00:00:00.000Z" });
    addCourse("Newest", { createdAt: "2026-06-01T00:00:00.000Z" });
    addCourse("Middle", { createdAt: "2026-03-01T00:00:00.000Z" });
    addCourse("Draft", {
      status: CourseStatus.Draft,
      createdAt: "2026-09-01T00:00:00.000Z",
    });

    const titles = landing().featuredCourses.map((course) => course.title);

    expect(titles).toEqual(["Newest", "Middle", "Oldest"]);
  });

  it(`features at most ${FEATURED_COURSE_LIMIT} courses`, () => {
    for (let i = 0; i < 5; i++) addCourse(`Course ${i}`);

    expect(landing().featuredCourses).toHaveLength(FEATURED_COURSE_LIMIT);
  });

  it("names each featured course's instructor and category", () => {
    const featured = landing().featuredCourses[0];

    expect(featured).toMatchObject({
      id: baseCourseId,
      slug: "test-course",
      description: "A test course",
      instructorName: "Test Instructor",
      categoryName: "Programming",
      coverImageUrl: null,
    });
  });

  it("counts each featured course's lessons across its modules", () => {
    const course = addCourse("With lessons", {
      createdAt: "2026-06-01T00:00:00.000Z",
    });
    addLessons(course.id, [2, 3]);
    addLessons(baseCourseId, [1]);

    const counts = Object.fromEntries(
      landing().featuredCourses.map((c) => [c.title, c.lessonCount])
    );

    expect(counts).toEqual({ "With lessons": 5, "Test Course": 1 });
  });

  it("gives a featured course with no lessons a count of zero", () => {
    expect(landing().featuredCourses[0].lessonCount).toBe(0);
  });

  it("counts only published courses, their categories and their lessons", () => {
    const design = addCategory("Design");
    const empty = addCategory("Empty");
    const published = addCourse("Published", { category: design.id });
    const draft = addCourse("Draft", {
      status: CourseStatus.Draft,
      category: empty.id,
    });
    addLessons(published.id, [4]);
    addLessons(draft.id, [7]);
    for (let i = 0; i < 4; i++) addCourse(`More ${i}`);

    expect(landing()).toMatchObject({
      publishedCourseCount: 6,
      categoryCount: 2,
      lessonCount: 4,
    });
  });

  it("returns an empty page when nothing is published", () => {
    unpublishBaseCourse();

    expect(landing()).toEqual({
      featuredCourses: [],
      publishedCourseCount: 0,
      categoryCount: 0,
      lessonCount: 0,
    });
  });
});
