"use client";

import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-24 md:py-32">
      <div className="container-luxury">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-caption text-muted-foreground mb-4">
              Our Story
            </p>
            <h2 className="text-headline mb-8">
              A Legacy of <span className="italic">Excellence</span>
            </h2>
            <div className="divider-elegant mx-auto mb-12" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <p className="text-subheadline text-muted-foreground leading-relaxed">
              Founded with a passion for fine fragrance and a commitment to
              accessibility, HUME represents a new chapter in the world of
              perfumery.
            </p>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              We understand that a signature scent is more than a luxury—it&apos;s an
              expression of identity. Our artisans work tirelessly to capture
              the essence of iconic fragrances, from the fresh citrus notes of
              Eau Sauvage to the rich complexity of Creed Aventus.
            </p>
            <p className="text-body text-muted-foreground max-w-2xl mx-auto">
              Every HUME creation undergoes rigorous development and testing,
              ensuring that each bottle delivers an authentic olfactory journey
              that rivals the original at a fraction of the investment.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-3 gap-8 mt-16 pt-16 border-t border-border"
          >
            <div>
              <p className="font-serif text-4xl md:text-5xl font-light mb-2">50+</p>
              <p className="text-caption text-muted-foreground">Fragrances</p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl font-light mb-2">10k+</p>
              <p className="text-caption text-muted-foreground">Happy Clients</p>
            </div>
            <div>
              <p className="font-serif text-4xl md:text-5xl font-light mb-2">5★</p>
              <p className="text-caption text-muted-foreground">Reviews</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
