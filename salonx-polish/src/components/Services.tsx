import { motion } from "framer-motion";
import { Scissors, Sparkles, Palette, Heart, Crown, Wand2 } from "lucide-react";

const services = [
  {
    icon: Scissors,
    title: "Hair Styling",
    description: "Expert cuts, colors, and treatments tailored to your style.",
    price: "From $50",
  },
  {
    icon: Sparkles,
    title: "Skincare",
    description: "Rejuvenating facials and personalized skincare routines.",
    price: "From $80",
  },
  {
    icon: Palette,
    title: "Makeup",
    description: "Professional makeup for any occasion, from subtle to glam.",
    price: "From $65",
  },
  {
    icon: Heart,
    title: "Nail Art",
    description: "Manicures, pedicures, and creative nail designs.",
    price: "From $35",
  },
  {
    icon: Crown,
    title: "Bridal",
    description: "Complete bridal packages for your special day.",
    price: "From $300",
  },
  {
    icon: Wand2,
    title: "Wellness",
    description: "Relaxing massages and holistic wellness treatments.",
    price: "From $90",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function Services() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-rose-light/50 text-sm font-medium text-foreground mb-4">
            Our Services
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
            Treatments Designed for <span className="text-gradient">You</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover our comprehensive range of premium beauty services, 
            each crafted to enhance your natural radiance.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="group relative bg-gradient-card rounded-2xl p-8 shadow-soft hover:shadow-elevated transition-all duration-300 cursor-pointer border border-border/50 hover:border-primary/30"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-soft">
                <service.icon className="w-6 h-6 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-gradient transition-colors">
                {service.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {service.description}
              </p>
              <p className="font-medium text-accent">
                {service.price}
              </p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
