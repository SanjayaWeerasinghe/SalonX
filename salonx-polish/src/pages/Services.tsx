import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Palette, Heart, Crown, Wand2, Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: Scissors,
    title: "Hair Styling",
    description: "Expert cuts, colors, and treatments tailored to your style.",
    features: ["Precision haircuts", "Coloring & highlights", "Hair treatments", "Blowouts & styling"],
    prices: [
      { name: "Haircut", price: "$50+" },
      { name: "Color", price: "$80+" },
      { name: "Highlights", price: "$120+" },
      { name: "Treatment", price: "$45+" },
    ],
    duration: "30-90 min",
  },
  {
    icon: Sparkles,
    title: "Skincare",
    description: "Rejuvenating facials and personalized skincare routines.",
    features: ["Deep cleansing facials", "Anti-aging treatments", "Hydrating therapy", "Acne solutions"],
    prices: [
      { name: "Basic facial", price: "$80+" },
      { name: "Premium facial", price: "$120+" },
      { name: "Anti-aging", price: "$150+" },
      { name: "Custom", price: "$100+" },
    ],
    duration: "45-75 min",
  },
  {
    icon: Palette,
    title: "Makeup",
    description: "Professional makeup for any occasion, from subtle to glam.",
    features: ["Natural everyday look", "Evening glam", "Special events", "Lessons & tutorials"],
    prices: [
      { name: "Day look", price: "$65+" },
      { name: "Evening", price: "$85+" },
      { name: "Special event", price: "$100+" },
      { name: "Lesson", price: "$75+" },
    ],
    duration: "30-60 min",
  },
  {
    icon: Heart,
    title: "Nail Art",
    description: "Manicures, pedicures, and creative nail designs.",
    features: ["Classic manicure", "Gel & acrylic nails", "Nail art designs", "Spa pedicures"],
    prices: [
      { name: "Manicure", price: "$35+" },
      { name: "Pedicure", price: "$45+" },
      { name: "Gel nails", price: "$60+" },
      { name: "Nail art", price: "$20+" },
    ],
    duration: "30-75 min",
  },
  {
    icon: Crown,
    title: "Bridal",
    description: "Complete bridal packages for your special day.",
    features: ["Bridal makeup trial", "Wedding day styling", "Bridal party packages", "Pre-wedding prep"],
    prices: [
      { name: "Trial", price: "$150+" },
      { name: "Wedding day", price: "$300+" },
      { name: "Full package", price: "$500+" },
      { name: "Party (each)", price: "$100+" },
    ],
    duration: "2-4 hours",
  },
  {
    icon: Wand2,
    title: "Wellness",
    description: "Relaxing massages and holistic wellness treatments.",
    features: ["Swedish massage", "Deep tissue therapy", "Hot stone massage", "Aromatherapy"],
    prices: [
      { name: "30 min", price: "$50+" },
      { name: "60 min", price: "$90+" },
      { name: "90 min", price: "$130+" },
      { name: "Hot stone", price: "$110+" },
    ],
    duration: "30-90 min",
  },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-hero">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-rose-light/50 text-sm font-medium text-foreground mb-4">
              Our Services
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
              Premium Beauty <span className="text-gradient">Services</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore our comprehensive range of treatments designed to enhance 
              your natural beauty and leave you feeling refreshed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="space-y-12">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-8 shadow-soft border border-border/50"
              >
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Service Info */}
                  <div className="lg:col-span-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft shrink-0">
                        <service.icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-semibold mb-2">{service.title}</h3>
                        <p className="text-muted-foreground mb-4">{service.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-accent" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <ul className="mt-6 space-y-2">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Prices */}
                  <div className="lg:col-span-2">
                    <div className="grid sm:grid-cols-2 gap-4">
                      {service.prices.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-accent font-semibold">{item.price}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex justify-end">
                      <Button variant="premium">Book {service.title}</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
