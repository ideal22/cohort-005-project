import { Link } from "react-router";
import { ArrowRight, ArrowUpRight, BookOpen, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { CourseImage } from "~/components/course-image";
import type { FeaturedCourse } from "~/modules/landing-page/index.server";

function lessonLabel(count: number) {
  return `${count} ${count === 1 ? "lesson" : "lessons"}`;
}

/** The hero's right-hand column: the newest course up front, the next two below. */
export function HeroShowcase({ courses }: { courses: FeaturedCourse[] }) {
  const [lead, ...rest] = courses;
  if (!lead) return null;

  return (
    <div className="relative">
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent blur-2xl"
      />
      <Link
        to={`/courses/${lead.slug}`}
        className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-shadow hover:shadow-2xl"
      >
        <CourseImage
          src={lead.coverImageUrl}
          alt={lead.title}
          className="aspect-[16/8] w-full object-cover"
        />
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            New · {lead.categoryName}
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:text-primary">
            {lead.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {lead.instructorName} · {lessonLabel(lead.lessonCount)}
          </p>
        </div>
      </Link>
      {rest.length > 0 && (
        <ul className="mt-4 space-y-2">
          {rest.map((course) => (
            <li key={course.id}>
              <ShowcaseRow course={course} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LatestCourses({ courses }: { courses: FeaturedCourse[] }) {
  if (courses.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Fresh this season</p>
          <h2 className="mt-1 text-3xl font-bold tracking-tight">
            Latest courses
          </h2>
          <p className="mt-2 max-w-xl text-muted-foreground">
            The newest courses from our instructors, ready to start today.
          </p>
        </div>
        <Button asChild variant="outline" className="self-start sm:self-auto">
          <Link to="/courses">
            View all courses
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <LatestCourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}

function ShowcaseRow({ course }: { course: FeaturedCourse }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-card/80 px-4 py-3 backdrop-blur transition-colors hover:border-primary/40"
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium group-hover:text-primary">
          {course.title}
        </span>
        <span className="block text-xs text-muted-foreground">
          {course.categoryName} · {lessonLabel(course.lessonCount)}
        </span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
    </Link>
  );
}

function LatestCourseCard({ course }: { course: FeaturedCourse }) {
  return (
    <Link to={`/courses/${course.slug}`} className="group">
      <Card className="h-full overflow-hidden pt-0 transition-shadow group-hover:shadow-md">
        <CourseImage
          src={course.coverImageUrl}
          alt={course.title}
          className="aspect-video w-full object-cover"
        />
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {course.categoryName}
          </p>
          <h3 className="font-semibold leading-snug group-hover:text-primary">
            {course.title}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        </CardContent>
        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {course.instructorName}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" />
            {lessonLabel(course.lessonCount)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
