import { motion } from "framer-motion";
import { Newspaper, ExternalLink } from "lucide-react";

const mockNews = [
  { title: "RBI Cuts Repo Rate by 25 Basis Points", summary: "The Reserve Bank of India has cut the repo rate to 5.75%, signaling a shift toward growth-focused monetary policy.", source: "Economic Times", date: "Apr 5, 2026", tag: "RBI Rate Cut Impact" },
  { title: "Gold Prices Hit All-Time High Amid Global Uncertainty", summary: "Gold surpasses ₹78,000 per 10 grams as investors flock to safe-haven assets amid geopolitical tensions.", source: "Mint", date: "Apr 5, 2026", tag: "Gold vs Equity 2026" },
  { title: "SIP Inflows Cross ₹22,000 Crore in March", summary: "Systematic investment plans continue to attract record inflows, reflecting growing retail investor confidence.", source: "Moneycontrol", date: "Apr 4, 2026", tag: "SIP vs Lump Sum" },
  { title: "New Tax Regime: What Changes in FY27", summary: "The government introduces revised tax slabs under the new regime, impacting salaried individuals and HNIs.", source: "NDTV Profit", date: "Apr 3, 2026", tag: "Tax Saving Tips" },
  { title: "Credit Card Debt Rises 18% YoY Among Millennials", summary: "A new report highlights the growing credit card debt problem among young Indians, with average outstanding balances increasing significantly.", source: "Business Standard", date: "Apr 3, 2026", tag: "Credit Card Mistakes" },
];

export default function NewsPage() {
  return (
    <div className="flex-1 p-6 md:p-10 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-primary" />
            Live Financial News
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time context for your content</p>
        </div>

        <div className="grid gap-4">
          {mockNews.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{item.summary}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-muted-foreground">{item.source}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                    <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary">{item.tag}</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
