import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageModal } from "@/components/LanguageModal";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Game Hub — Community games, private servers & tools" },
      {
        name: "description",
        content:
          "Your ultimate destination for community games, private servers, and exclusive tools.",
      },
      { property: "og:title", content: "Game Hub — Community games, private servers & tools" },
      {
        property: "og:description",
        content:
          "Your ultimate destination for community games, private servers, and exclusive tools.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Game Hub — Community games, private servers & tools" },
      { name: "description", content: "Site Duplicator creates a complete replica of a given website, including its structure and content." },
      { property: "og:description", content: "Site Duplicator creates a complete replica of a given website, including its structure and content." },
      { name: "twitter:description", content: "Site Duplicator creates a complete replica of a given website, including its structure and content." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7ca599cc-5984-4363-81c7-3e364e565de7/id-preview-b55665fd--b5f8586e-ae1e-4fdf-a9c0-640a59b11280.lovable.app-1777302031168.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7ca599cc-5984-4363-81c7-3e364e565de7/id-preview-b55665fd--b5f8586e-ae1e-4fdf-a9c0-640a59b11280.lovable.app-1777302031168.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@600;700;900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AppProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
        <LanguageModal />
      </div>
    </AppProvider>
  );
}
