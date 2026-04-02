import * as React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CTASection = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"section">>(
  ({ className, ...props }, ref) => {
    return (
      <section ref={ref} className={cn("px-4 py-16 sm:px-6 sm:py-20", className)} {...props}>
        <div className="container mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-[2rem] bg-secondary px-6 py-10 text-center sm:px-10 sm:py-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mx-auto max-w-2xl space-y-5">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">Start a calmer check-in with Shelly today</h2>
              <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                Chat about stress, anxiety, emotions, and mental wellbeing with support that stays focused on your inner world.
              </p>
              <Button asChild size="lg" className="rounded-full px-8">
                <Link to="/chat">Start Now</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  },
);

CTASection.displayName = "CTASection";

export default CTASection;
