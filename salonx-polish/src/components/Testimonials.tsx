import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Emma Thompson",
    role: "Regular Client",
    content: "SalonX has transformed my hair care routine completely. The stylists here truly understand what I want and always deliver beyond expectations.",
    rating: 5,
  },
  {
    name: "Sarah Mitchell",
    role: "Bridal Client",
    content: "My bridal experience at SalonX was magical. They made me feel like a princess on my special day. Absolutely recommend their bridal packages!",
    rating: 5,
  },
  {
    name: "Jessica Brown",
    role: "VIP Member",
    content: "The ambiance, the service, the results - everything is top-notch. I've been a loyal customer for 3 years and wouldn't go anywhere else.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-rose-light/30">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-card text-sm font-medium text-foreground mb-4">
            Testimonials
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold mb-4">
            What Our <span className="text-gradient">Clients</span> Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Join thousands of satisfied clients who have discovered their 
            best selves at SalonX.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-card rounded-2xl p-8 shadow-soft border border-border/50"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8">
                <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Quote className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4 mt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-gold text-gold"
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-medium">
                  {testimonial.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
