import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Zap, Globe, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Community First',
      description: 'We believe in the power of human connection and mutual growth. Every interaction strengthens our community.'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Empower Learning',
      description: 'Knowledge should be accessible to everyone. We remove barriers and create opportunities for continuous learning.'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Global Impact',
      description: 'Skills know no borders. Our platform connects learners and teachers across the world, breaking geographical limitations.'
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'Quality & Trust',
      description: 'We maintain high standards through verified profiles, transparent reviews, and a commitment to excellence.'
    }
  ];

  const teamMembers = [
    {
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Passionate about democratizing education and building communities.',
      image: 'https://static.wixstatic.com/media/5b6f22_fe3e8c0708fc4b7398e95cf15917fb80~mv2.png?originWidth=400&originHeight=400'
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Product',
      bio: 'Focused on creating intuitive experiences that connect people.',
      image: 'https://static.wixstatic.com/media/5b6f22_91fb0693376540f488d374217a5e2ecf~mv2.png?originWidth=400&originHeight=400'
    },
    {
      name: 'Marcus Williams',
      role: 'Community Manager',
      bio: 'Building meaningful relationships and fostering engagement.',
      image: 'https://static.wixstatic.com/media/5b6f22_c729d59d7776451dabe31b7b09f4916e~mv2.png?originWidth=400&originHeight=400'
    }
  ];

  const stats = [
    { number: '10k+', label: 'Active Members' },
    { number: '50k+', label: 'Skills Exchanged' },
    { number: '150+', label: 'Countries' },
    { number: '4.8★', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full max-w-[120rem] mx-auto px-4 md:px-8 py-24 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <h1 className="font-heading text-6xl md:text-8xl uppercase text-foreground mb-8 tracking-wider leading-none">
            About SkillSwap
          </h1>
          <p className="font-paragraph text-xl text-secondary-foreground mb-12 leading-relaxed max-w-2xl">
            We're building a world where knowledge flows freely, where expertise is shared generously, and where anyone can learn anything from anyone. SkillSwap is more than a platform—it's a movement toward equitable, accessible learning.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="w-full bg-primary py-20 md:py-32">
        <div className="max-w-[120rem] mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-5xl md:text-6xl uppercase text-primary-foreground mb-8 tracking-wider">
                Our Mission
              </h2>
              <p className="font-paragraph text-lg text-primary-foreground/90 mb-6 leading-relaxed">
                To create a global community where knowledge is the currency, where every person has the opportunity to teach and learn, and where barriers to education are eliminated.
              </p>
              <p className="font-paragraph text-lg text-primary-foreground/90 leading-relaxed">
                We believe that the best learning happens through direct human connection, peer-to-peer exchange, and mutual respect. By removing financial barriers, we unlock the potential in every individual.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="https://static.wixstatic.com/media/5b6f22_59e2c485890747128dab84c6a9cd84a2~mv2.png?originWidth=600&originHeight=400"
                alt="Our mission"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full max-w-[120rem] mx-auto px-4 md:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-heading text-5xl md:text-6xl uppercase text-foreground mb-4 tracking-wider">
            Our Values
          </h2>
          <p className="font-paragraph text-xl text-secondary-foreground max-w-2xl">
            These principles guide every decision we make and every feature we build.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-secondary p-8 rounded-2xl border-2 border-neutralborder hover:border-primary transition-all duration-300 hover:shadow-lg"
            >
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-6">
                {value.icon}
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground mb-3 tracking-wider">
                {value.title}
              </h3>
              <p className="font-paragraph text-secondary-foreground leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-foreground py-20 md:py-32">
        <div className="max-w-[120rem] mx-auto px-4 md:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-5xl md:text-6xl uppercase text-background mb-16 tracking-wider text-center"
          >
            By The Numbers
          </motion.h2>

          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="font-heading text-5xl md:text-6xl text-primary mb-4 tracking-wider">
                  {stat.number}
                </h3>
                <p className="font-paragraph text-lg text-background/80">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full max-w-[120rem] mx-auto px-4 md:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="font-heading text-5xl md:text-6xl uppercase text-foreground mb-4 tracking-wider">
            Meet The Team
          </h2>
          <p className="font-paragraph text-xl text-secondary-foreground max-w-2xl">
            Passionate individuals dedicated to transforming how people learn and grow together.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-lg group-hover:shadow-xl transition-all">
                <Image
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-heading text-2xl uppercase text-foreground mb-2 tracking-wider">
                {member.name}
              </h3>
              <p className="font-heading text-sm uppercase text-primary mb-3 tracking-wider">
                {member.role}
              </p>
              <p className="font-paragraph text-secondary-foreground">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-[120rem] mx-auto px-4 md:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-foreground to-foreground/90 text-background rounded-3xl p-12 md:p-24 text-center shadow-2xl"
        >
          <h2 className="font-heading text-5xl md:text-6xl uppercase mb-8 tracking-wider">
            Join Our Community
          </h2>
          <p className="font-paragraph text-xl text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Be part of a global movement that's transforming how people learn and grow. Start your skill exchange journey today.
          </p>
          <Link to="/profiles">
            <Button className="h-16 px-12 rounded-full bg-primary text-primary-foreground hover:bg-white hover:text-foreground text-lg font-heading uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl">
              Explore Profiles
            </Button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
