import * as React from "react";
import shellyWink from "@/assets/shelly-wink.png";
import { cn } from "@/lib/utils";

const Footer = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"footer">>(
  ({ className, ...props }, ref) => {
    return (
      <footer ref={ref} className={cn("border-t border-border px-4 py-8 sm:px-6", className)} {...props}>
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-2">
            <img src={shellyWink} alt="Shelly" className="h-8 w-8" />
            <span className="font-semibold text-foreground">Digital Psychologist</span>
          </div>
          <p className="max-w-xl text-xs leading-6 text-muted-foreground sm:text-sm">
            © 2026 Digital Psychologist. Shelly supports emotional wellbeing, but it does not replace licensed mental health care.
          </p>
        </div>
      </footer>
    );
  },
);

Footer.displayName = "Footer";

export default Footer;
