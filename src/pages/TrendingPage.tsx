import { motion } from "framer-motion";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Hash } from "lucide-react";

const mockTopics = [
  { name: "SIP vs Lump Sum", volume: 1240, momentum: "up", change: "+34%", hashtags: ["#SIP", "#MutualFunds", "#Investing"] },
  { name: "RBI Rate Cut Impact", volume: 980, momentum: "up", change: "+28%", hashtags: ["#RBI", "#InterestRates", "#Economy"] },
  { name: "Gold vs Equity 2026", volume: 870, momentum: "up", change: "+22%", hashtags: ["#Gold", "#Equity", "#Investment"] },
  { name: "Tax Saving Tips", volume: 760, momentum: "down", change: "-5%", hashtags: ["#TaxSaving", "#80C", "#Finance"] },
  { name: "Credit Card Mistakes", volume: 650, momentum: "up", change: "+18%", hashtags: ["#CreditCard", "#Money", "#FinTips"] },
  { name: "Emergency Fund", volume: 540, momentum: "down", change: "-3%", hashtags: ["#EmergencyFund", "#Savings", "#PersonalFinance"] },
];

export default function TrendingPage() {
  return (
    <div className="flex-1 p-6 md:p-10 overflow-auto">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            Trending Topics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Finance · Instagram · This Week</p>
        </div>

        <div className="grid gap-3">
          {mockTopics.map((topic, i) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">{topic.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{topic.volume} posts</span>
                  <span className={`text-xs flex items-center gap-0.5 ${topic.momentum === "up" ? "text-green-400" : "text-red-400"}`}>
                    {topic.momentum === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {topic.change}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {topic.hashtags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-accent text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
