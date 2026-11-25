import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { count, countDistinct, desc, eq, inArray } from "drizzle-orm";
import * as schema from "~/db/schema";
import {
  categories,
  courses,
  CourseStatus,
  lessons,
  modules,
  users,
} from "~/db/schema";

export type Db = BetterSQLite3Database<typeof schema>;

export const FEATURED_COURSE_LIMIT = 3;

export type FeaturedCourse = {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  instructorName: string;
  categoryName: string;
  lessonCount: number;
};

export type LandingPage = {
  /** The newest published courses, newest first. */
  featuredCourses: FeaturedCourse[];
  publishedCourseCount: number;
  /** Categories that hold at least one published course. */
  categoryCount: number;
  /** Lessons across every published course. */
  lessonCount: number;
};

export function getLandingPage(db: Db): LandingPage {
  const newest = db
    .select({
      id: courses.id,
      title: courses.title,
      slug: courses.slug,
      description: courses.description,
      coverImageUrl: courses.coverImageUrl,
      instructorName: users.name,
      categoryName: categories.name,
    })
    .from(courses)
    .innerJoin(users, eq(courses.instructorId, users.id))
    .innerJoin(categories, eq(courses.categoryId, categories.id))
    .where(eq(courses.status, CourseStatus.Published))
    .orderBy(desc(courses.createdAt), desc(courses.id))
    .limit(FEATURED_COURSE_LIMIT)
    .all();

  const lessonCounts = countLessonsByCourse(
    db,
    newest.map((course) => course.id)
  );

  const totals = db
    .select({
      courseCount: count(courses.id),
      categoryCount: countDistinct(courses.categoryId),
    })
    .from(courses)
    .where(eq(courses.status, CourseStatus.Published))
    .get();

  const publishedLessons = db
    .select({ lessonCount: count(lessons.id) })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .innerJoin(courses, eq(modules.courseId, courses.id))
    .where(eq(courses.status, CourseStatus.Published))
    .get();

  return {
    featuredCourses: newest.map((course) => ({
      ...course,
      lessonCount: lessonCounts.get(course.id) ?? 0,
    })),
    publishedCourseCount: totals?.courseCount ?? 0,
    categoryCount: totals?.categoryCount ?? 0,
    lessonCount: publishedLessons?.lessonCount ?? 0,
  };
}

function countLessonsByCourse(db: Db, courseIds: number[]) {
  const rows = db
    .select({ courseId: modules.courseId, lessonCount: count(lessons.id) })
    .from(modules)
    .innerJoin(lessons, eq(lessons.moduleId, modules.id))
    .where(inArray(modules.courseId, courseIds))
    .groupBy(modules.courseId)
    .all();
  return new Map(rows.map((row) => [row.courseId, row.lessonCount]));
}
