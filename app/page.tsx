import { headers } from "next/headers"
import Link from "next/link"
import {
  ArrowRightIcon,
  ChartBarIcon,
  FishIcon,
  KanbanSquareIcon,
  MegaphoneIcon,
  MessageSquareIcon,
  ShieldAlertIcon,
  UsersIcon,
} from "lucide-react"

import { auth } from "@/lib/auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const features = [
  {
    icon: KanbanSquareIcon,
    title: "Kanban boards",
    description:
      "Drag tasks from to-do to done. Every move is saved instantly and synced across the team.",
  },
  {
    icon: ChartBarIcon,
    title: "Progress insights",
    description:
      "Your home page turns tasks into clear stats, status breakdowns, and weekly activity.",
  },
  {
    icon: MegaphoneIcon,
    title: "Team updates",
    description:
      "Important updates from your team appear right on your home page — never miss a thing.",
  },
  {
    icon: MessageSquareIcon,
    title: "Your voice matters",
    description:
      "Report bugs and request features without leaving the app. Your input shapes the product.",
  },
  {
    icon: ShieldAlertIcon,
    title: "Stay on track",
    description:
      "Get a friendly heads-up before things slip, and acknowledge it with one click.",
  },
  {
    icon: UsersIcon,
    title: "Built for teams",
    description:
      "Everyone's work lives in one shared space, so collaboration stays effortless.",
  },
]

function MockKanban() {
  const columns = [
    {
      title: "To do",
      dot: "bg-slate-400",
      cards: ["Prepare demo slides", "Fix login redirect bug"],
    },
    {
      title: "In progress",
      dot: "bg-amber-400",
      cards: ["Build the dashboard graphs"],
    },
    {
      title: "Done",
      dot: "bg-emerald-400",
      cards: ["Set up local environment", "Read the onboarding guide"],
    },
  ]
  return (
    <div
      aria-hidden
      className="grid w-full gap-3 rounded-2xl border bg-card/80 p-4 shadow-2xl backdrop-blur sm:grid-cols-3"
    >
      {columns.map((col) => (
        <div
          key={col.title}
          className="flex flex-col gap-2 rounded-xl bg-muted/50 p-3"
        >
          <div className="flex items-center gap-2 px-1">
            <span className={`size-2 rounded-full ${col.dot}`} />
            <span className="text-xs font-semibold">{col.title}</span>
            <Badge variant="secondary" className="ml-auto h-5 min-w-5 px-1.5 text-[10px]">
              {col.cards.length}
            </Badge>
          </div>
          {col.cards.map((card) => (
            <div
              key={card}
              className="rounded-lg border-l-3 bg-card p-2.5 text-xs font-medium shadow-xs"
            >
              {card}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export default async function LandingPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const role = (session?.user as { role?: string | null } | undefined)?.role
  const appHref = role === "admin" ? "/admin" : "/dashboard"

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FishIcon className="size-4" />
            </span>
            <span className="font-heading text-sm font-semibold">FishTurns</span>
          </Link>
          <nav className="ml-6 hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {session ? (
              <Button asChild size="sm">
                <Link href={appHref}>
                  Open app <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">
                    Get started <ArrowRightIcon />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-primary)/15%,transparent_70%)]"
        />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4 pt-16 pb-12 text-center sm:pt-24">
          <Badge variant="secondary" className="px-3 py-1">
            Intern task management, minus the chaos
          </Badge>
          <h1 className="font-heading max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Every intern&apos;s work, visible in one place
          </h1>
          <p className="max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
            FishTurns gives you a calm home for your internship — a personal
            kanban board, progress insights, team updates, and a direct line
            for your feedback.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {session ? (
              <Button asChild size="lg">
                <Link href={appHref}>
                  Open your workspace <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get started free <ArrowRightIcon />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
          <MockKanban />
        </div>
      </section>

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" className="scroll-mt-16 border-t bg-muted/30">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16">
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
              Everything an internship program needs
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              One platform for doing the work and supervising it — no
              spreadsheets, no lost messages.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="size-4 text-primary" />
                  </span>
                  <CardTitle>{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{f.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-16 border-t">
        <div className="mx-auto grid w-full max-w-5xl gap-3 px-4 py-16 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>1. Plan your work</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Drop tasks onto your kanban board and drag them from to-do to
                done as you go.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>2. Watch progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your home page turns your tasks into stats, status breakdowns,
                and weekly activity.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>3. Stay in the loop</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Team updates land on your home page, and you can send feedback
                or catch up on notices anytime.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── CTA + footer ────────────────────────────────── */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 px-4 py-16 text-center">
          <h2 className="font-heading max-w-xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Ready for a calmer internship?
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {session ? (
              <Button asChild size="lg">
                <Link href={appHref}>
                  Open your workspace <ArrowRightIcon />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/signup">
                    Create your account <ArrowRightIcon />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/login">Sign in</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <span className="flex items-center gap-1.5">
            <FishIcon className="size-3.5" /> FishTurns — intern task management
          </span>
          <span>Built for focused teams.</span>
        </div>
      </footer>
    </div>
  )
}
