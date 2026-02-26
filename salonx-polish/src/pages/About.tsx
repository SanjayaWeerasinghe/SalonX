import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CTA } from "@/components/CTA";
import { motion } from "framer-motion";
import { Heart, Award, Users, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-salon.jpg";

const values = [
  {
    icon: Heart,
    title: "Passion",
    description: "We pour our heart into every service, treating each client like family.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "Only the highest standards. We continuously train and perfect our craft.",
  },
  {
    icon: Users,
    title: "Community",
    description: "Building lasting relationships with our clients and supporting local causes.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Using eco-friendly products and practices to protect our planet.",
  },
];

const team = [
  { name: "Sarah Johnson", role: "Founder & Lead Stylist", initials: "SJ" },
  { name: "Michael Chen", role: "Senior Colorist", initials: "MC" },
  { name: "Emma Williams", role: "Skincare Specialist", initials: "EW" },
  { name: "David Park", role: "Makeup Artist", initials: "DP" },
];

const AboutPage = () => {
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
              Our Story
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold mb-4">
              About <span className="text-gradient">SalonX</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              A journey of passion, creativity, and dedication to making 
              every client feel beautiful and confident.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-6">
                Where Every Client is <span className="text-gradient">Family</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2014, SalonX began with a simple vision: to create a space 
                  where beauty, relaxation, and personal care come together seamlessly.
                </p>
                <p>
                  What started as a small studio has grown into a beloved destination 
                  for those seeking premium beauty services delivered with warmth and 
                  expertise.
                </p>
                <p>
                  Our team of passionate professionals brings together decades of 
                  combined experience, continuous training in the latest techniques, 
                  and a genuine love for helping clients discover their best selves.
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated">
                <img
                  src={heroImage}
                  alt="SalonX interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-primary rounded-2xl p-6 shadow-elevated">
                <p className="font-serif text-3xl font-bold text-primary-foreground">10+</p>
                <p className="text-primary-foreground/80 text-sm">Years of Excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-rose-light/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Our <span className="text-gradient">Values</span>
            </h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do at SalonX.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-serif text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">
              Meet Our <span className="text-gradient">Team</span>
            </h2>
            <p className="text-muted-foreground">
              The talented professionals behind every beautiful transformation.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 text-center group hover:shadow-elevated transition-shadow"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center mx-auto mb-4 text-2xl font-serif font-semibold text-primary-foreground group-hover:scale-110 transition-transform">
                  {member.initials}
                </div>
                <h3 className="font-serif text-lg font-semibold mb-1">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </div>
  );
};

export default AboutPage;
