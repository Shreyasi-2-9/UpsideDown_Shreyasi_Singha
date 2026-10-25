import { useState } from "react"
import { useApp, useT } from "../../context/AppContext"
import { StatCard } from "../../components/common/StatCard"
import { Badge } from "../../components/common/Badge"
import { SpeakButton } from "../../components/voice/SpeakButton"

export function Earnings() {
  const { transactions, requests } = useApp()
  const { t, language, formatCurrency } = useT()
  const [selectedMonth] = useState("October 2026")

  const chartData = [
    { label: "Oct 01-03", val: 35, amt: "₹14,200" },
    { label: "Oct 04-06", val: 52, amt: "₹22,100" },
    { label: "Oct 07-09", val: 44, amt: "₹18,500" },
    { label: "Oct 10-12", val: 68, amt: "₹28,900" },
    { label: "Oct 13-15", val: 60, amt: "₹25,400" },
    { label: "Oct 16-18", val: 80, amt: "₹34,000" },
    { label: "Oct 19-21", val: 72, amt: "₹30,600" },
    { label: "Oct 22-24", val: 91, amt: "₹38,700" },
    { label: "Oct 25-27", val: 68, amt: "₹28,900" },
    { label: "Oct 28-30", val: 76, amt: "₹32,300" },
    { label: "Oct 31", val: 88, amt: "₹37,400" },
    { label: "Projected", val: 95, amt: "₹62,400" },
  ]

  const activeCount = requests.filter(
    (r) => r.status !== "completed" && r.status !== "cancelled",
  ).length

  const speechSummary =
    language === "hi"
      ? `कुल कमाई दो लाख चौरासी हजार रुपये। आज की कमाई बयालीस सौ पचास रुपये। चालू काम ${activeCount}।`
      : language === "mr"
        ? `एकूण कमाई २ लाख ८४ हजार रुपये. आजची कमाई ४२५० रुपये. चालू कामे ${activeCount}.`
        : `Career earnings ₹2,84,500. Today's earnings ₹4,250. Active jobs: ${activeCount}.`

  return (
    <div className="page" style={{ fontSize: "15px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <p className="eyebrow">FINANCIAL OVERVIEW</p>
          <h1>{t.technician.earningsTitle}</h1>
          <p className="subhead">
            {language === "hi"
              ? "पूरे किए गए और एस्क्रो से पास हुए कामों का सीधा बैंक भुगतान।"
              : language === "mr"
                ? "पूर्ण झालेल्या व एस्क्रो तपासलेल्या कामांचे थेट बँक पेमेंट."
                : "Transparent payouts from completed and escrow-cleared work."}
          </p>
        </div>
        <SpeakButton text={speechSummary} lang={language} />
      </div>

      <div className="stats-grid">
        <StatCard
          label={
            language === "hi"
              ? "कुल कमाई"
              : language === "mr"
                ? "एकूण कमाई"
                : "CAREER EARNINGS"
          }
          value="₹2,84,500"
          note="Verified municipal payout"
          icon="wallet"
        />
        <StatCard
          label={t.technician.todayEarnings}
          value="₹4,250"
          note="+18% vs last week"
          icon="trend"
        />
        <StatCard
          label={
            language === "hi"
              ? "इस महीने"
              : language === "mr"
                ? "या महिन्यात"
                : "THIS MONTH"
          }
          value="₹62,400"
          note="98.4% on-time"
          icon="document"
        />
        <StatCard
          label={t.technician.activeJobs}
          value={activeCount.toString()}
          note="In escrow"
          icon="briefcase"
        />
      </div>

      <div className="chart-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">{selectedMonth.toUpperCase()}</p>
            <h2>
              {language === "hi"
                ? "द्वि-साप्ताहिक भुगतान"
                : language === "mr"
                  ? "द्विसाप्ताहिक पेमेंट"
                  : "Bi-weekly payout velocity"}
            </h2>
          </div>
          <b>₹62,400</b>
        </div>
        <div className="chart">
          {chartData.map((d, i) => (
            <i
              key={i}
              style={{ height: `${d.val}%` }}
              title={`${d.label}: ${d.amt}`}
            />
          ))}
        </div>
      </div>

      <section className="table-card">
        <div className="section-title">
          <h2>
            {language === "hi"
              ? "हालिया भुगतान"
              : language === "mr"
                ? "नुकतेच व्यवहार"
                : "Recent technician settlements"}
          </h2>
          <span className="muted" style={{ fontSize: "12px" }}>
            {language === "hi"
              ? "बैंक खाता ending in **4821"
              : language === "mr"
                ? "बँक खाते ending in **4821"
                : "Direct deposit to bank ending in **4821"}
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Service</th>
              <th>Citizen</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Net Payout</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((r) => (
              <tr key={r.id}>
                <td>
                  <b className="tabular-nums">{r.jobId}</b>
                  <span
                    style={{
                      display: "block",
                      fontSize: "11px",
                      color: "var(--muted)",
                    }}
                  >
                    {r.date}
                  </span>
                </td>
                <td>{r.service}</td>
                <td>{r.citizen}</td>
                <td>
                  <Badge tone={r.status === "Paid" ? "green" : "amber"}>
                    {r.status}
                  </Badge>
                </td>
                <td>{formatCurrency(r.amount)}</td>
                <td>
                  <b>{formatCurrency(r.netPayout)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
