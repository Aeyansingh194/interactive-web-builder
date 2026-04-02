import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "AI powered tracking",
    desc: "Understand your emotional health in real time and receive suggestions to improve.",
    emoji: "📊",
    gradient: "gradient-pink",
  },
  {
    num: "02",
    title: "Real time conversations",
    desc: "Interact with your AI chat bot of choice for real time support based on your input.",
    emoji: "💬",
    gradient: "gradient-yellow",
  },
  {
    num: "03",
    title: "Guided selfcare sessions",
    desc: "Learn to focus on recovery, find calm and become your healthiest self.",
    emoji: "💖",
    gradient: "gradient-blue",
  },
];

const HowItWorks = () => {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="container mx-auto">
        <h2 className="mb-12 text-center text-2xl font-bold text-foreground sm:mb-16 sm:text-3xl">
          How it <span className="text-primary">works</span>
        </h2>
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <p className="text-sm font-medium text-muted-foreground">
                <span className="text-primary">{step.num}.</span> <span className="font-bold text-foreground">{step.title}</span>
              </p>
              <div className={`${step.gradient} flex min-h-[15rem] items-center justify-center rounded-3xl p-8`}>
                <span className="text-6xl">{step.emoji}</span>
              </div>
              <p className="text-center text-sm leading-7 text-muted-foreground">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
