import { motion } from "framer-motion";



const factors = [
  {
    emoji: "🧠",
    title: "AI powered",
    bg: "bg-soft-yellow",
    items: ["Auto-detect your mental state", "Get immediate guidance", "Talk to Shelly"],
  },
  {
    emoji: "⚡",
    title: "Effortless",
    bg: "bg-mint-green",
    items: ["3-second check-in", "No typing needed", "Intuitive UX"],
  },
  {
    emoji: "🛡️",
    title: "Radically private",
    bg: "bg-calm-lavender",
    items: ["No registration", "No personal data", "No ads, only AI support"],
  },
];

const KeyFactors = () => {
  return (
    <section className="bg-muted px-4 py-16 sm:px-6 sm:py-20">
      <div className="container mx-auto">
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {factors.map((f, i) => (
            <motion.div
              key={f.title}
              className="flex flex-col items-center space-y-4 rounded-3xl bg-card px-6 py-8 text-center shadow-sm"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className={`w-20 h-20 rounded-full ${f.bg} flex items-center justify-center`}>
                <span className="text-4xl">{f.emoji}</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">{f.title}</h3>
              <div className="space-y-1">
                {f.items.map((item) => (
                  <p key={item} className="text-sm leading-7 text-muted-foreground">{item}</p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFactors;
