export default function DesignPreview() {
  return (
    <div className="text-agt-text font-agt-sans">
      <h1 className="text-agt-h3 sm:text-agt-h2 lg:text-agt-h1 text-agt-heading mb-agt-8 lg:mb-agt-10">
        Design System Preview
      </h1>

      {/* ── Color Palette ───────────────────────────── */}
      <section className="mb-agt-10 lg:mb-agt-12">
        <h2 className="text-agt-h4 sm:text-agt-h3 text-agt-heading mb-agt-5 lg:mb-agt-6">Color Palette</h2>

        <div className="mb-agt-4">
          <p className="text-agt-sm text-agt-text-muted mb-agt-3">Backgrounds</p>
          <div className="flex flex-wrap gap-agt-3">
            <Swatch bg="bg-agt-canvas"        label="agt-canvas"        hex="#fff0e5" dark />
            <Swatch bg="bg-agt-base"          label="agt-base"          hex="#0F1929" />
            <Swatch bg="bg-agt-surface"       label="agt-surface"       hex="#162236" />
            <Swatch bg="bg-agt-elevated"      label="agt-elevated"      hex="#1E2F47" />
            <Swatch bg="bg-agt-border"        label="agt-border"        hex="#2A3F5F" />
            <Swatch bg="bg-agt-border-strong" label="agt-border-strong" hex="#3B5480" />
          </div>
        </div>

        <div className="mb-agt-4">
          <p className="text-agt-sm text-agt-text-muted mb-agt-3">Primary</p>
          <div className="flex flex-wrap gap-agt-3">
            <Swatch bg="bg-agt-primary"        label="agt-primary"        hex="#4A8FE7" />
            <Swatch bg="bg-agt-primary-hover"  label="agt-primary-hover"  hex="#6BA3ED" />
            <Swatch bg="bg-agt-primary-subtle" label="agt-primary-subtle" hex="rgba(74,143,231,.15)" />
          </div>
        </div>

        <div className="mb-agt-4">
          <p className="text-agt-sm text-agt-text-muted mb-agt-3">Text</p>
          <div className="flex flex-wrap gap-agt-3">
            <Swatch bg="bg-agt-text"       label="agt-text"       hex="#E2EAF4" />
            <Swatch bg="bg-agt-text-muted" label="agt-text-muted" hex="#7E9BB5" />
            <Swatch bg="bg-agt-heading"    label="agt-heading"    hex="#FFFFFF" />
          </div>
        </div>

        <div className="mb-agt-4">
          <p className="text-agt-sm text-agt-text-muted mb-agt-3">Semantic</p>
          <div className="flex flex-wrap gap-agt-3">
            <Swatch bg="bg-agt-success"        label="agt-success"        hex="#22C55E" />
            <Swatch bg="bg-agt-success-subtle" label="agt-success-subtle" hex="rgba(34,197,94,.12)" />
            <Swatch bg="bg-agt-error"          label="agt-error"          hex="#EF4444" />
            <Swatch bg="bg-agt-error-subtle"   label="agt-error-subtle"   hex="rgba(239,68,68,.12)" />
            <Swatch bg="bg-agt-warning"        label="agt-warning"        hex="#F59E0B" />
            <Swatch bg="bg-agt-warning-subtle" label="agt-warning-subtle" hex="rgba(245,158,11,.12)" />
          </div>
        </div>
      </section>

      {/* ── Typography Scale ─────────────────────────── */}
      <section className="mb-agt-10 lg:mb-agt-12">
        <h2 className="text-agt-h4 sm:text-agt-h3 text-agt-heading mb-agt-5 lg:mb-agt-6">Typography Scale</h2>
        <div className="bg-agt-surface rounded-agt-lg p-agt-4 sm:p-agt-6 lg:p-agt-8 flex flex-col gap-agt-4">
          <TypeRow label="h1 · 2.25rem · bold">
            <p className="text-agt-h1 text-agt-heading font-bold leading-none">The quick brown fox</p>
          </TypeRow>
          <TypeRow label="h2 · 1.75rem · bold">
            <p className="text-agt-h2 text-agt-heading font-bold leading-none">The quick brown fox</p>
          </TypeRow>
          <TypeRow label="h3 · 1.375rem · bold">
            <p className="text-agt-h3 text-agt-heading font-bold leading-none">The quick brown fox</p>
          </TypeRow>
          <TypeRow label="h4 · 1.125rem · medium">
            <p className="text-agt-h4 text-agt-heading font-medium leading-none">The quick brown fox</p>
          </TypeRow>
          <TypeRow label="h5 · 1rem · medium">
            <p className="text-agt-h5 text-agt-heading font-medium leading-none">The quick brown fox</p>
          </TypeRow>
          <TypeRow label="h6 · 0.875rem · medium">
            <p className="text-agt-h6 text-agt-heading font-medium leading-none">The quick brown fox</p>
          </TypeRow>
          <hr className="border-agt-border" />
          <TypeRow label="body · 1rem · regular">
            <p className="text-agt-body text-agt-text">The quick brown fox jumps over the lazy dog.</p>
          </TypeRow>
          <TypeRow label="sm · 0.875rem · regular">
            <p className="text-agt-sm text-agt-text-muted">The quick brown fox jumps over the lazy dog.</p>
          </TypeRow>
          <TypeRow label="xs · 0.75rem · regular">
            <p className="text-agt-xs text-agt-text-muted">The quick brown fox jumps over the lazy dog.</p>
          </TypeRow>
          <TypeRow label="mono · 0.875rem">
            <p className="text-agt-sm font-agt-mono text-agt-primary">const answer = 42;</p>
          </TypeRow>
        </div>
      </section>

      {/* ── Button Variants ──────────────────────────── */}
      <section className="mb-agt-10 lg:mb-agt-12">
        <h2 className="text-agt-h4 sm:text-agt-h3 text-agt-heading mb-agt-5 lg:mb-agt-6">Button Variants</h2>
        <div className="bg-agt-surface rounded-agt-lg p-agt-4 sm:p-agt-6 lg:p-agt-8 flex flex-col gap-agt-5 lg:gap-agt-6">
          <Row label="Primary">
            <button className="btn btn-primary">Confirm</button>
            <button className="btn btn-primary" disabled>Disabled</button>
          </Row>
          <Row label="Secondary">
            <button className="btn btn-secondary">Cancel</button>
            <button className="btn btn-secondary" disabled>Disabled</button>
          </Row>
          <Row label="Ghost">
            <button className="btn btn-ghost">Learn more</button>
            <button className="btn btn-ghost" disabled>Disabled</button>
          </Row>
          <Row label="Danger">
            <button className="btn btn-danger">Delete exam</button>
            <button className="btn btn-danger" disabled>Disabled</button>
          </Row>
        </div>
      </section>

      {/* ── Inputs ───────────────────────────────────── */}
      <section className="mb-agt-10 lg:mb-agt-12">
        <h2 className="text-agt-h4 sm:text-agt-h3 text-agt-heading mb-agt-5 lg:mb-agt-6">Inputs</h2>
        <div className="bg-agt-surface rounded-agt-lg p-agt-4 sm:p-agt-6 lg:p-agt-8 flex flex-col gap-agt-5 max-w-lg">
          <div>
            <label className="block text-agt-sm text-agt-text-muted mb-agt-2">Text input — default</label>
            <input className="input" placeholder="e.g. Introduction to Algorithms" />
          </div>
          <div>
            <label className="block text-agt-sm text-agt-text-muted mb-agt-2">Text input — filled</label>
            <input className="input" defaultValue="Midterm Exam 2025" />
          </div>
          <div>
            <label className="block text-agt-sm text-agt-text-muted mb-agt-2">Text input — disabled</label>
            <input className="input" placeholder="Not editable" disabled />
          </div>
          <div>
            <label className="block text-agt-sm text-agt-text-muted mb-agt-2">Textarea</label>
            <textarea className="textarea" placeholder="Write the question statement here…" />
          </div>
        </div>
      </section>

      {/* ── Semantic States ──────────────────────────── */}
      <section className="mb-agt-10 lg:mb-agt-12">
        <h2 className="text-agt-h4 sm:text-agt-h3 text-agt-heading mb-agt-5 lg:mb-agt-6">Semantic States</h2>
        <div className="flex flex-col gap-agt-3 max-w-lg">
          <div className="bg-agt-success-subtle border border-agt-success rounded-agt-md p-agt-4 text-agt-success text-agt-sm">
            Correct answer selected.
          </div>
          <div className="bg-agt-error-subtle border border-agt-error rounded-agt-md p-agt-4 text-agt-error text-agt-sm">
            Wrong answer — please review.
          </div>
          <div className="bg-agt-warning-subtle border border-agt-warning rounded-agt-md p-agt-4 text-agt-warning text-agt-sm">
            Exam in progress — 3 questions remaining.
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Internal helpers ───────────────────────────── */

function Swatch({ bg, label, hex, dark }: { bg: string; label: string; hex: string; dark?: boolean }) {
  return (
    <div className="flex flex-col gap-agt-1 w-24 sm:w-28">
      <div className={`${bg} h-10 sm:h-12 rounded-agt-md border border-agt-border`} />
      <p className={`text-agt-xs font-agt-mono ${dark ? 'text-agt-base' : 'text-agt-text'}`}>{label}</p>
      <p className="text-agt-xs text-agt-text-muted">{hex}</p>
    </div>
  );
}

function TypeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-agt-1 sm:flex-row sm:items-baseline sm:gap-agt-3">
      <span className="text-agt-xs text-agt-text-muted font-agt-mono sm:w-44 sm:shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-agt-2 sm:flex-row sm:items-center sm:gap-agt-4">
      <span className="text-agt-xs text-agt-text-muted font-agt-mono sm:w-20 sm:shrink-0">{label}</span>
      <div className="flex items-center gap-agt-3">{children}</div>
    </div>
  );
}
