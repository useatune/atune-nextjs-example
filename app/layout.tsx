import type { Metadata } from "next";
import Link from "next/link";
import { ClerkProvider, OrganizationSwitcher, Show, SignInButton, UserButton } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teams & Projects (Atune example)",
  description: "A tiny multi-tenant Next.js app wired to Atune.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // telemetry={false}: this example sends usage data to Atune only.
    <ClerkProvider telemetry={false}>
      <html lang="en">
        <body>
          <header>
            <nav>
              <Link href="/">Teams &amp; Projects</Link>
              <Show when="signed-in">
                <Link href="/projects">Projects</Link>
              </Show>
            </nav>
            <nav>
              <Show when="signed-in">
                <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/projects" afterCreateOrganizationUrl="/projects" />
                <UserButton />
              </Show>
              <Show when="signed-out">
                <SignInButton />
              </Show>
            </nav>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
