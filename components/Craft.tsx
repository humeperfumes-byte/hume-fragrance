"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const Craft = () => {
  const features = [
    {
      title: "Finest Ingredients",
      description:
        "We source only the highest quality raw materials from renowned perfumeries across France and beyond.",
    },
    {
      title: "Master Craftsmanship",
      description:
        "Our perfumers meticulously analyse and recreate each note to ensure authentic olfactory experiences.",
    },
    {
      title: "Lasting Impression",
      description:
        "Formulated for exceptional longevity, our fragrances evolve beautifully throughout the day.",
    },
  ];

  return (
    <section id="craft" className="py-24 md:py-32 bg-secondary">
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src="/images/black-perfume.png"
              alt="HUME perfume collection"
              width={800}
              height={600}
              loading="lazy"
              className="w-full h-auto"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-caption text-muted-foreground mb-4">
              Our Philosophy
            </p>
            <h2 className="text-headline mb-6">
              The Art of <span className="italic">Perfumery</span>
            </h2>
            <div className="divider-elegant mb-8" />
            <p className="text-body text-muted-foreground mb-12">
              At HUME, we believe that luxury should be accessible. Our mission
              is to democratise fine fragrance, offering exceptional
              interpretations of the world&apos;s most coveted scents at a fraction
              of the price.
            </p>

            <div className="space-y-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <h3 className="font-serif text-lg mb-2">{feature.title}</h3>
                  <p className="text-body text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Craft;
