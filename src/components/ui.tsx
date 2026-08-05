import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from "react";
import { AlertCircle, Check, CircleDashed, Database, Info, ShieldCheck } from "lucide-react";

const cx = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(" ");

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet" | "danger";
}) {
  return <button className={cx("button", `button-${variant}`, className)} {...props} />;
}

export function IconButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button className={cx("icon-button", className)} aria-label={label} title={label} {...props} />
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx("input", props.className)} {...props} />;
}
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cx("select", props.className)} {...props} />;
}
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx("textarea", props.className)} {...props} />;
}

export function Badge({
  children,
  tone = "neutral",
  className
}: {
  children: React.ReactNode;
  tone?: string;
  className?: string;
}) {
  return <span className={cx("badge", `tone-${tone}`, className)}>{children}</span>;
}

export function StatusIndicator({ label, tone = "neutral" }: { label: string; tone?: string }) {
  return (
    <span className={cx("status-indicator", `tone-${tone}`)}>
      <span className="status-glyph" aria-hidden="true" />
      {label}
    </span>
  );
}

export const SeverityIndicator = ({ level }: { level: "Advisory" | "Warning" | "Critical" }) => (
  <Badge tone={level.toLowerCase()}>
    <AlertCircle size={13} />
    {level}
  </Badge>
);
export const ConfidenceIndicator = ({ value }: { value: number }) => (
  <Badge tone="confidence">
    <CircleDashed size={13} />
    Confidence {value}%
  </Badge>
);
export const EvidenceIndicator = ({ status = "Sources linked" }: { status?: string }) => (
  <Badge tone="evidence">
    <Database size={13} />
    {status}
  </Badge>
);
export const AuditStatusLabel = ({ status = "Audit ready" }: { status?: string }) => (
  <Badge tone="audit">
    <ShieldCheck size={13} />
    {status}
  </Badge>
);
export const SimulatedDataLabel = () => (
  <Badge tone="simulated">
    <Database size={13} />
    Simulated data
  </Badge>
);

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("card", className)} {...props} />;
}
export function Panel({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cx("panel", className)} {...props} />;
}

export function KpiCard({
  label,
  value,
  unit,
  detail,
  tone = "neutral"
}: {
  label: string;
  value: string | number;
  unit?: string;
  detail: string;
  tone?: string;
}) {
  return (
    <Card className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={cx("kpi-value", `text-${tone}`)}>
        {value}
        <span>{unit}</span>
      </div>
      <div className="kpi-detail">{detail}</div>
    </Card>
  );
}

export function Alert({
  title,
  children,
  tone = "info"
}: {
  title: string;
  children: React.ReactNode;
  tone?: "info" | "warning" | "critical" | "success";
}) {
  const Icon = tone === "success" ? Check : tone === "info" ? Info : AlertCircle;
  return (
    <div className={cx("alert", `alert-${tone}`)} role={tone === "critical" ? "alert" : "status"}>
      <Icon size={18} />
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <CircleDashed aria-hidden="true" />
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
export function ErrorState({
  title = "Unable to load this area",
  description = "The rest of PlantMind remains available. Try this view again."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="error-state" role="alert">
      <AlertCircle aria-hidden="true" />
      <strong>{title}</strong>
      <p>{description}</p>
      <Button variant="secondary">Try again</Button>
    </div>
  );
}
export function Skeleton({ width = "100%" }: { width?: string }) {
  return <span className="skeleton" style={{ width }} aria-hidden="true" />;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
export function SectionHeader({
  title,
  detail,
  action
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="section-header">
      <div>
        <h2>{title}</h2>
        {detail && <p>{detail}</p>}
      </div>
      {action}
    </header>
  );
}
export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item}>
          {index > 0 && <span aria-hidden="true">/</span>}
          {index === items.length - 1 ? <strong aria-current="page">{item}</strong> : item}
        </span>
      ))}
    </nav>
  );
}

export function Tabs({ items, active }: { items: string[]; active: string }) {
  return (
    <div className="tabs" role="tablist" aria-label="View options">
      {items.map((item) => (
        <button
          key={item}
          role="tab"
          aria-selected={item === active}
          tabIndex={item === active ? 0 : -1}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export function TableShell({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="tooltip" data-tooltip={label}>
      {children}
    </span>
  );
}
export function Dialog({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="dialog-head">
          <h2 id="dialog-title">{title}</h2>
          <IconButton label="Close dialog" onClick={onClose}>
            ×
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Drawer({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <aside className={cx("drawer", open && "is-open")} aria-hidden={!open} aria-label={title}>
      <div className="dialog-head">
        <h2>{title}</h2>
        <IconButton label="Close drawer" onClick={onClose}>
          ×
        </IconButton>
      </div>
      {children}
    </aside>
  );
}
