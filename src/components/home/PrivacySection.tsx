import { motion } from "framer-motion";

const PrivacySection = () => {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="container mx-auto grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <motion.div
          className="flex min-h-[18rem] items-center justify-center rounded-3xl bg-soft-blue p-6 sm:min-h-[20rem] sm:p-8"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="max-w-sm space-y-4 rounded-3xl bg-card p-6 shadow-lg">
            <p className="text-sm font-medium text-foreground">What are your main goals?</p>
            <div className="space-y-2">
              {["Reduce stress & anxiety", "Improve yourself", "Sleep better", "Live healthier", "Break bad habits"].map((goal) => (
                <div key={goal} className="bg-muted rounded-full px-4 py-2 text-xs text-foreground flex items-center gap-2">
                  <span>😊</span> {goal}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div
          className="space-y-4 text-center lg:text-left"
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Your privacy is <span className="inline-block rounded-full bg-peach px-3 py-1 text-primary">key</span>
          </h2>
          <p className="leading-7 text-muted-foreground">
            No registration is required to use Digital Psychologist. This means that we have no personal data whatsoever about you. Your data belongs to you and only to you.
          </p>
          <p className="leading-7 text-muted-foreground">
            We are not exposing it to third parties. Your data serves to support you and is used to build better tools for everyone who wants to manage anxiety in the future.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PrivacySection;
