import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import shellyMascot from "@/assets/shelly-mascot.png";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="container mx-auto grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)] lg:gap-14">
        <motion.div
          className="order-2 space-y-6 text-center lg:order-1 lg:text-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl font-extrabold leading-[0.95] text-foreground sm:text-5xl lg:text-6xl">
            Your Personal AI
            <span className="block text-primary">Mental Health Companion</span>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-7 text-muted-foreground sm:text-lg lg:mx-0">
            Talk with Shelly about stress, anxiety, emotions, self-reflection, and practical coping support whenever you need a grounded check-in.
          </p>
          <Button asChild size="lg" className="mt-2 rounded-full px-8 py-6 text-base sm:text-lg">
            <Link to="/chat">
              Chat With Shelly
            </Link>
          </Button>
        </motion.div>
        <motion.div
          className="order-1 flex justify-center lg:order-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <img
            src={shellyMascot}
            alt="Shelly the horseshoe crab mental wellness mascot"
            className="w-full max-w-[18rem] drop-shadow-xl sm:max-w-sm lg:max-w-lg"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
