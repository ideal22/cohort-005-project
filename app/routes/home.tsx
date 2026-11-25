import { Link } from "react-router";
import { useState, useEffect } from "react";
import type { Route } from "./+types/home";
import { Button } from "~/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Layers,
  ListVideo,
  Moon,
  Sun,
} from "lucide-react";
import { HeroShowcase, LatestCourses } from "~/components/landing-sections";
import { DevUI } from "~/components/dev-ui";
import { getCurrentUserId, getDevCountry } from "~/lib/session";
import { getCountryTierInfo, COUNTRIES } from "~/lib/ppp";
import { landingPage } from "~/modules/landing-page/index.server";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { users } from "~/db/schema";

function getAllUsers() {
  return db.select().from(users).all();
}

function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function meta() {
  return [
    { title: "Cadence — Learn at your own pace" },
    {
      name: "description",
      content:
        "A modern course platform for developers. Browse courses, track your progress, and learn at your own pace.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const users = getAllUsers();
  const currentUserId = await getCurrentUserId(request);
  const currentUser = currentUserId ? getUserById(currentUserId) : null;
  const devCountry = await getDevCountry(request);
  const countryTierInfo = getCountryTierInfo(devCountry);

  return {
    ...landingPage.get(),
    users: users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
    currentUser: currentUser
      ? { id: currentUser.id, name: currentUser.name, role: currentUser.role }
      : null,
    devCountry,
    countryTierInfo,
    countries: COUNTRIES,
  };
}

const HERO_POINTS = [
  "Bite-sized lessons",
  "Built-in quizzes",
  "Progress saved as you go",
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    featuredCourses,
    publishedCourseCount,
    categoryCount,
    publishedLessonCount,
    users,
    currentUser,
    devCountry,
    countryTierInfo,
    countries,
  } = loaderData;
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDarkMode() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("cadence-theme", next ? "dark" : "light");
    } catch {}
  }

  const stats = [
    { icon: BookOpen, value: publishedCourseCount, label: "Courses" },
    { icon: ListVideo, value: publishedLessonCount, label: "Lessons" },
    { icon: Layers, value: categoryCount, label: "Categories" },
    { icon: Clock, value: "Self-paced", label: "Learn on your schedule" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Cadence
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/courses"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Courses
            </Link>
            <button
              onClick={toggleDarkMode}
              className="rounded-md p-2 text-muted-foreground transition-colors hover:text-foreground"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? (
                <Sun className="size-4" />
              ) : (
                <Moon className="size-4" />
              )}
            </button>
            {currentUser ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Log In
                </Link>
                <Button asChild size="sm">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />
              {publishedCourseCount} courses · {publishedLessonCount} lessons
            </p>
            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
              Learn to code,
              <br />
              <span className="text-muted-foreground">at your own pace.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              Structured courses built by experienced instructors. Track your
              progress, take quizzes, and build real-world skills.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link to="/courses">
                  Browse courses
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                {currentUser ? (
                  <Link to="/dashboard">Go to your dashboard</Link>
                ) : (
                  <Link to="/signup">Create a free account</Link>
                )}
              </Button>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {HERO_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-2 whitespace-nowrap"
                >
                  <Check className="size-4 text-primary" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <HeroShowcase courses={featuredCourses} />
        </div>
      </section>

      <section className="border-y border-border bg-muted/50">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 lg:grid-cols-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <div className="flex flex-col-reverse">
                <dt className="text-sm text-muted-foreground">{label}</dt>
                <dd className="text-2xl font-bold leading-tight">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      <LatestCourses courses={featuredCourses} />

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link to="/" className="text-lg font-bold tracking-tight">
              Cadence
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              Learn to code, at your own pace.
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link to="/courses" className="hover:text-foreground">
              Courses
            </Link>
            {currentUser ? (
              <Link to="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-foreground">
                  Log in
                </Link>
                <Link to="/signup" className="hover:text-foreground">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </footer>

      <DevUI
        users={users}
        currentUser={currentUser}
        devCountry={devCountry}
        countryTierInfo={countryTierInfo}
        countries={countries}
      />
    </div>
  );
}
