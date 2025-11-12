import { useState } from "react";

const navLinks = [
  { label: "Capabilities", href: "#capabilities" },
  { label: "Tooling", href: "#tooling" },
  { label: "Architecture", href: "#architecture" },
  { label: "MVP", href: "#mvp" },
  { label: "Actions", href: "#next-steps" },
];

const featureHighlights = [
  {
    title: "Unified Scanning",
    description:
      "Automated web, API, network, cloud, container, Kubernetes, IaC, and sensitive data assessments in one platform.",
  },
  {
    title: "Hybrid Engagements",
    description:
      "Blend scheduled baseline scans with on-demand manual follow-up by vetted pentesters with NDA workflows.",
  },
  {
    title: "Evidence & Compliance",
    description:
      "Immutable audit trails, hash-based artifact verification, and exports mapped to SOC 2 Type II and ISO 27001 controls.",
  },
  {
    title: "Enterprise Integrations",
    description:
      "Jira, ServiceNow, Slack, SIEM feeds, SSO, and billing integrations keep remediation and operations in sync.",
  },
];

const toolingCategories = [
  {
    title: "Web & API",
    tools: ["OWASP ZAP", "Nuclei", "APIsec"],
  },
  {
    title: "Network",
    tools: ["Nmap", "OpenVAS / Greenbone"],
  },
  {
    title: "Code & IaC",
    tools: ["Semgrep", "Bandit", "gosec", "Checkov", "KICS"],
  },
  {
    title: "Cloud & K8s",
    tools: ["Prowler", "ScoutSuite", "kube-bench", "kubescape", "kube-hunter"],
  },
  {
    title: "Containers",
    tools: ["Trivy", "Clair"],
  },
  {
    title: "PII Discovery",
    tools: ["Microsoft Presidio", "OpenDLP / Octopii"],
  },
];

const architectureNotes = [
  "AWS-native deployment with CloudFront, API Gateway, ECS/EKS, and Aurora Postgres.",
  "Ephemeral scan workers in isolated VPCs or accounts with controlled egress.",
  "KMS-backed secrets with support for customer-managed keys and full audit logging.",
  "SHA-256 artifact hashes, CloudTrail admin logs, and WORM-ready compliance storage.",
  "Granular RBAC, MFA enforcement, and pentester vendor management with stored NDAs.",
];

const mvpChecklist = [
  "Automated unauthenticated and authenticated web scans powered by OWASP ZAP.",
  "API scan orchestration with ZAP and APIsec templates.",
  "Network discovery and vulnerability scanning via Nmap and OpenVAS.",
  "Report exports to PDF and JSON with a findings dashboard.",
  "Manual pentest booking workflow including hours, NDA, and scheduler.",
  "KMS-encrypted S3 artifact storage backed by audit logs.",
  "Jira and Slack integrations for automated ticketing and alerting.",
];

const nextActions = [
  "Shortlist 2-3 final brand names and begin domain plus trademark diligence.",
  "Select the MVP tooling stack and prototype an end-to-end ZAP orchestration path.",
  "Design a six-screen Figma concept covering dashboard, assets, scans, bookings, findings, and compliance.",
  "Deliver a minimal backend workflow: create scan job → worker execution → artifact storage → UI reporting.",
  "Draft vendor onboarding and NDA templates for pentesters and store them with audit-ready metadata.",
];

function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <a href="/" className="text-xl font-semibold tracking-tight">
            Be4Scan
          </a>
          <button
            className="rounded-md border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="primary-navigation"
          >
            Menu
          </button>
          <nav className="hidden gap-6 text-sm font-medium text-slate-300 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-teal-400"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#next-steps"
              className="rounded-full bg-teal-500 px-4 py-2 text-slate-950 transition hover:bg-teal-400"
            >
              Start Planning
            </a>
          </nav>
        </div>
        {mobileMenuOpen && (
          <nav
            id="primary-navigation"
            className="space-y-2 border-t border-slate-800 px-4 py-4 text-sm font-medium text-slate-300 md:hidden"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 transition hover:bg-slate-900 hover:text-teal-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#next-steps"
              className="block rounded-md bg-teal-500 px-3 py-2 text-center text-slate-950 transition hover:bg-teal-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Start Planning
            </a>
          </nav>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 sm:px-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <p className="mb-3 inline-flex items-center rounded-full border border-teal-500/40 bg-teal-500/10 px-3 py-1 text-xs uppercase tracking-wide text-teal-300">
                Unified VAPT Orchestration
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Be4Scan consolidates automated and manual security testing into
                one command center.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-slate-300">
                Coordinate web, API, network, cloud, and Kubernetes security
                programs while keeping evidence, compliance mappings, and
                remediation workflows aligned with enterprise expectations.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#capabilities"
                  className="rounded-full bg-teal-500 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
                >
                  Explore Capabilities
                </a>
                <a
                  href="#tooling"
                  className="rounded-full border border-slate-700 px-6 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-teal-500 hover:text-teal-300"
                >
                  View Tooling Stack
                </a>
              </div>
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 transition hover:border-teal-500/60"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="capabilities"
          className="border-b border-slate-800 bg-slate-950"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Expanded Capabilities
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300">
              Automate baselines, schedule hybrid engagements, and equip
              pentesters with the workspace, evidence, and collaboration tools
              they need to deliver continuously auditable results.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <CapabilityCard
                title="Automated & Scheduled Scans"
                bullets={[
                  "DAST for web apps with authenticated flows.",
                  "API probes and schema-aware testing.",
                  "Network discovery and vulnerability enumeration.",
                  "Cloud posture, IaC, containers, and Kubernetes benchmarks.",
                  "Sensitive data/PII discovery across storage and documents.",
                ]}
              />
              <CapabilityCard
                title="Manual Pentest Operations"
                bullets={[
                  "Book scoped engagements, allocate hours, and capture NDAs.",
                  "Provide pentesters with collaboration, notes, and report workspaces.",
                  "Track time, deliverables, and hybrid follow-up tasks.",
                  "Lock down vendor access with RBAC and just-in-time controls.",
                ]}
              />
              <CapabilityCard
                title="Evidence & Reporting"
                bullets={[
                  "Secure artifact vault with hashing and KMS-backed encryption.",
                  "Immutable audit trails for SOC 2 Type II and ISO 27001.",
                  "Compliance exports mapping findings to control IDs.",
                  "Automated Jira/ServiceNow ticketing and Slack alerts.",
                ]}
              />
              <CapabilityCard
                title="Orchestration & Integrations"
                bullets={[
                  "Workflow engine for scheduled scans and hybrid follow-ups.",
                  "SIEM ingestion, billing, and invoicing hooks.",
                  "SSO via SAML/OIDC with MFA enforcement.",
                  "Observability via OpenTelemetry, CloudWatch, and ELK pipelines.",
                ]}
              />
            </div>
          </div>
        </section>

        <section
          id="tooling"
          className="border-b border-slate-800 bg-slate-950"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">
                  Open Source Tooling
                </h2>
                <p className="mt-3 max-w-xl text-sm text-slate-300">
                  Accelerate delivery by orchestrating proven projects. Maintain
                  an SBOM, follow upstream updates, and respect licensing
                  obligations during packaging and distribution.
                </p>
              </div>
              <a
                href="#next-steps"
                className="inline-flex items-center justify-center rounded-full border border-teal-500 px-5 py-3 text-sm font-semibold text-teal-300 transition hover:bg-teal-500/10"
              >
                Plan Integrations
              </a>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {toolingCategories.map((category) => (
                <div
                  key={category.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/50 transition hover:border-teal-500/60"
                >
                  <h3 className="text-lg font-semibold text-white">
                    {category.title}
                  </h3>
                  <ul className="mt-4 space-y-2 text-sm text-slate-300">
                    {category.tools.map((tool) => (
                      <li key={tool} className="flex items-center gap-2">
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-teal-400"
                          aria-hidden
                        />
                        <span>{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="architecture"
          className="border-b border-slate-800 bg-slate-950"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              Architecture & Security Notes
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-slate-300">
              Deploy Be4Scan with a defense-in-depth posture that supports
              enterprise threat models and audit requirements from day one.
            </p>
            <ul className="mt-8 grid gap-4 text-sm text-slate-300 md:grid-cols-2">
              {architectureNotes.map((note) => (
                <li
                  key={note}
                  className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 leading-relaxed shadow shadow-slate-950/40"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="mvp" className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <h2 className="text-3xl font-semibold tracking-tight">
              MVP Readiness Checklist
            </h2>
            <p className="mt-4 max-w-3xl text-sm text-slate-300">
              Anchor delivery around measurable milestones that demonstrate
              end-to-end orchestration, reporting, and evidence management.
            </p>
            <ol className="mt-8 space-y-4 text-sm text-slate-300">
              {mvpChecklist.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow shadow-slate-950/40"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-teal-500 text-xs font-medium text-teal-300">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="next-steps"
          className="border-b border-slate-800 bg-slate-950"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="rounded-3xl border border-teal-500/50 bg-gradient-to-br from-teal-500/10 via-slate-950 to-slate-950 p-8 shadow-xl shadow-slate-950/40">
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Next Moves Toward Launch
              </h2>
              <p className="mt-4 max-w-2xl text-sm text-slate-200">
                Translate strategic intent into execution plans across branding,
                product discovery, engineering, and vendor operations.
              </p>
              <ul className="mt-8 grid gap-4 text-sm text-slate-100 md:grid-cols-2">
                {nextActions.map((action) => (
                  <li
                    key={action}
                    className="rounded-2xl border border-teal-500/30 bg-slate-900/40 p-5 leading-relaxed ring-1 ring-teal-500/10"
                  >
                    {action}
                  </li>
                ))}
              </ul>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a
                  href="mailto:hello@be4scan.com"
                  className="rounded-full bg-teal-500 px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
                >
                  hello@be4scan.com
                </a>
                <a
                  href="#"
                  className="rounded-full border border-teal-400 px-6 py-3 text-center text-sm font-semibold text-teal-300 transition hover:bg-teal-400/10"
                >
                  Download Specification
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-500 sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Be4Scan. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#architecture" className="transition hover:text-teal-400">
              Security & Compliance
            </a>
            <a href="#capabilities" className="transition hover:text-teal-400">
              Platform
            </a>
            <a href="#next-steps" className="transition hover:text-teal-400">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

type CapabilityCardProps = {
  title: string;
  bullets: string[];
};

function CapabilityCard({ title, bullets }: CapabilityCardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-slate-950/40 transition hover:border-teal-500/60">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-slate-300">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span
              className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400"
              aria-hidden
            />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
