export interface Insight {
  label: string;
  value: string;
  status: "good" | "warn" | "bad" | "info";
}

const n = (v: string | undefined) => (v === undefined || v === "" ? NaN : Number(v));

/** Simple rule-based checks on common compliance fields. */
export function analyseFields(values: Record<string, string>): Insight[] {
  const out: Insight[] = [];

  const received = n(values.complaints_received);
  const resolved = n(values.complaints_resolved);
  if (received > 0 && Number.isFinite(resolved)) {
    const rate = (resolved / received) * 100;
    out.push({
      label: "Complaint resolution rate",
      value: `${rate.toFixed(1)}%`,
      status: resolved > received ? "bad" : rate >= 80 ? "good" : rate >= 50 ? "warn" : "bad",
    });
    if (resolved > received) out.push({ label: "Data check", value: "More complaints resolved than received", status: "bad" });
  }

  const coverage = n(values.coverage_percentage);
  if (Number.isFinite(coverage)) {
    out.push({ label: "Coverage", value: `${coverage}%`, status: coverage >= 80 ? "good" : coverage >= 50 ? "warn" : "bad" });
  }

  const uptime = n(values.uptime_percentage ?? values.network_uptime);
  if (Number.isFinite(uptime)) {
    out.push({ label: "Network uptime", value: `${uptime}%`, status: uptime >= 99 ? "good" : uptime >= 95 ? "warn" : "bad" });
  }

  const qos = n(values.qos_score);
  if (Number.isFinite(qos)) {
    out.push({ label: "QoS score", value: `${qos}/100`, status: qos >= 80 ? "good" : qos >= 60 ? "warn" : "bad" });
  }

  const revenue = n(values.revenue_total ?? values.revenue_bwp);
  if (Number.isFinite(revenue)) {
    out.push({ label: "Revenue reported", value: `BWP ${revenue.toLocaleString("en-GB")}`, status: "info" });
  }

  const tax = n(values.tax_paid);
  if (Number.isFinite(tax) && revenue > 0) {
    const pct = (tax / revenue) * 100;
    out.push({ label: "Tax as share of revenue", value: `${pct.toFixed(1)}%`, status: pct < 1 ? "warn" : "info" });
  }

  const days = n(values.avg_resolution_days);
  if (Number.isFinite(days)) {
    out.push({ label: "Avg resolution time", value: `${days} days`, status: days <= 14 ? "good" : days <= 30 ? "warn" : "bad" });
  }

  const incidents = n(values.security_incidents);
  if (Number.isFinite(incidents)) {
    out.push({ label: "Security incidents", value: String(incidents), status: incidents === 0 ? "good" : incidents <= 3 ? "warn" : "bad" });
  }

  return out;
}
