// HPI 1.7-V
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ArrowRight, Users, BookOpen, Calendar, CheckCircle2, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// --- Custom Components & Visual Assets ---

const WireframeGraphic = () => (
  <svg className="w-full h-full opacity-20" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 10 H190 V190 H10 Z" stroke="currentColor" strokeWidth="1" />
    <path d="M10 60 H190" stroke="currentColor" strokeWidth="0.5" />
    <path d="M10 110 H190" stroke="currentColor" strokeWidth="0.5" />
    <path d="M10 160 H190" stroke="currentColor" strokeWidth="0.5" />
    <path d="M60 10 V190" stroke="currentColor" strokeWidth="0.5" />
    <path d="M110 10 V190" stroke="currentColor" strokeWidth="0.5" />
    <path d="M160 10 V190" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="60" cy="60" r="2" fill="currentColor" />
    <circle cx="110" cy="110" r="2" fill="currentColor" />
    <circle cx="160" cy="60" r="2" fill="currentColor" />
    <circle cx="60" cy="160" r="2" fill="currentColor" />
  </svg>
);

const SkillTicker = () => {
  const skills = ["Web Development", "Graphic Design", "Photography", "Cooking", "Languages", "Marketing", "Music", "Gardening", "Carpentry", "Yoga", "Finance", "Writing"];
  return (
    <div className="w-full overflow-hidden bg-foreground py-6 flex relative z-20">
      <motion.div 
        className="flex whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...skills, ...skills, ...skills].map((skill, i) => (
          <div key={i} className="flex items-center mx-8">
            <span className="text-background font-heading text-2xl uppercase tracking-wider">{skill}</span>
            <Sparkles className="w-5 h-5 text-primary ml-8" />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- Main Page Component ---

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroScroll = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroY = useTransform(heroScroll.scrollYProgress, [0, 1], [0, 150]);
  const heroScale = useTransform(heroScroll.scrollYProgress, [0, 1], [1, 1.05]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background overflow-clip selection:bg-primary selection:text-white">
      <Header />

      {/* HERO SECTION - Architectural Split */}
      <section ref={heroRef} className="relative w-full max-w-[120rem] mx-auto px-4 md:px-8 pt-24 pb-12 md:pb-24 min-h-[100vh] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-grow">
          
          {/* Left Column: Typography & Wireframe */}
          <div className="lg:col-span-4 flex flex-col justify-between relative z-10">
            <div className="mt-0 lg:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1 className="font-heading text-6xl md:text-7xl xl:text-8xl uppercase leading-[0.9] tracking-tight text-foreground mb-8">
                  Exchange<br />
                  <span className="text-primary">Skills</span>,<br />
                  Expand<br />
                  Mind.
                </h1>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-paragraph text-lg text-secondary-foreground max-w-md mb-10 leading-relaxed"
              >
                A premier community for mutual growth. Connect with experts, teach what you know, and learn what you need—no currency required.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/profiles">
                  <Button className="h-14 px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-base font-medium transition-all hover:scale-105 shadow-lg hover:shadow-xl">
                    Browse Profiles
                  </Button>
                </Link>
                <Link to="/my-profile">
                  <Button variant="outline" className="h-14 px-8 rounded-full border-2 border-neutralborder hover:bg-secondary text-base font-medium shadow-md hover:shadow-lg transition-all">
                    My Profile
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Architectural Wireframe Element (Bottom Left) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="hidden lg:block w-48 h-48 mt-12 text-foreground"
            >
              <WireframeGraphic />
              <p className="font-heading text-xs uppercase tracking-widest mt-4 text-neutralborder">System v1.0 // Grid Active</p>
            </motion.div>
          </div>

          {/* Right Column: Massive Image */}
          <div className="lg:col-span-8 relative h-[60vh] lg:h-auto">
            <motion.div 
              style={{ y: heroY, scale: heroScale }}
              className="w-full h-full relative rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
              <Image 
                src="https://static.wixstatic.com/media/5b6f22_fe3e8c0708fc4b7398e95cf15917fb80~mv2.png?originWidth=960&originHeight=512" 
                alt="Diverse group of people collaborating in a modern green space"
                className="w-full h-full object-cover"
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-8 left-8 z-20 bg-white/95 backdrop-blur-md p-6 rounded-2xl border border-white/30 max-w-xs shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  <span className="font-heading text-xs uppercase tracking-wider">Live Activity</span>
                </div>
                <p className="font-paragraph text-sm text-foreground font-medium">
                  "Just swapped a Guitar lesson for a React coding session."
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SkillTicker />

      {/* HOW IT WORKS - Sticky Scrollytelling */}
      <section id="how-it-works" className="w-full max-w-[120rem] mx-auto px-4 md:px-8 py-32">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* Sticky Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-32">
              <h2 className="font-heading text-5xl md:text-6xl uppercase text-foreground mb-8 leading-none tracking-wider">
                The<br />Process
              </h2>
              <p className="font-paragraph text-xl text-secondary-foreground mb-12 max-w-sm leading-relaxed">
                A simple, transparent framework designed for seamless knowledge exchange.
              </p>
              <div className="hidden lg:block w-full h-[2px] bg-gradient-to-r from-primary to-transparent mb-8" />
              <div className="hidden lg:flex flex-col gap-6">
                {['Create Profile', 'Find Matches', 'Swap Sessions'].map((step, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 text-secondary-foreground/70 hover:text-primary transition-colors"
                  >
                    <span className="font-heading text-sm font-bold">0{i + 1}</span>
                    <span className="font-heading text-lg uppercase tracking-wider">{step}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Scrolling Cards */}
          <div className="lg:w-2/3 flex flex-col gap-32">
            <WorkStepCard 
              number="01"
              title="Create Profile"
              description="Set up your digital persona. Define the skills you master and the knowledge you seek. Our algorithm uses this data to find your perfect learning counterparts."
              icon={<Users className="w-8 h-8" />}
              image="https://static.wixstatic.com/media/5b6f22_91fb0693376540f488d374217a5e2ecf~mv2.png?originWidth=384&originHeight=256"
            />
            <WorkStepCard 
              number="02"
              title="Find Matches"
              description="Explore a curated network of professionals and hobbyists. Filter by skill, availability, and rating to ensure a high-quality learning experience."
              icon={<BookOpen className="w-8 h-8" />}
              image="https://static.wixstatic.com/media/5b6f22_c729d59d7776451dabe31b7b09f4916e~mv2.png?originWidth=384&originHeight=256"
            />
            <WorkStepCard 
              number="03"
              title="Swap Sessions"
              description="Schedule your exchange. Whether virtual or in-person, our platform handles the logistics so you can focus on the learning. Rate and review to build trust."
              icon={<Calendar className="w-8 h-8" />}
              image="https://static.wixstatic.com/media/5b6f22_21a3fe9b407b456cac473f135206cb88~mv2.png?originWidth=384&originHeight=256"
            />
          </div>
        </div>
      </section>

      {/* BENEFITS - Full Bleed Parallax */}
      <section className="w-full py-32 bg-gradient-to-b from-secondary to-secondary/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <WireframeGraphic />
        </div>
        
        <div className="max-w-[120rem] mx-auto px-4 md:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-heading text-5xl md:text-6xl uppercase text-foreground mb-12 tracking-wider">
                Why Choose<br />SkillSwap?
              </h2>
              
              <div className="space-y-8">
                <BenefitRow 
                  title="No Currency Required" 
                  desc="Break free from financial barriers. Your knowledge is the only currency you need to access a world of new skills."
                />
                <div className="w-full h-[2px] bg-gradient-to-r from-neutralborder to-transparent" />
                <BenefitRow 
                  title="Flexible Learning" 
                  desc="Learn at your own pace. Our scheduling system adapts to your life, not the other way around."
                />
                <div className="w-full h-[2px] bg-gradient-to-r from-neutralborder to-transparent" />
                <BenefitRow 
                  title="Community Trust" 
                  desc="Verified profiles and a robust review system ensure a safe, professional, and productive environment."
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[600px] w-full"
            >
               {/* Abstract Composition */}
               <motion.div 
                 className="absolute top-0 right-0 w-3/4 h-3/4 bg-white rounded-[2rem] overflow-hidden shadow-2xl z-10"
                 whileHover={{ scale: 1.02 }}
                 transition={{ duration: 0.5 }}
               >
                 <Image 
                   src="https://static.wixstatic.com/media/5b6f22_59e2c485890747128dab84c6a9cd84a2~mv2.png?originWidth=768&originHeight=576" 
                   alt="People learning"
                   className="w-full h-full object-cover"
                 />
               </motion.div>
               <motion.div 
                 className="absolute bottom-0 left-0 w-2/3 h-2/3 bg-primary rounded-[2rem] overflow-hidden z-20 flex items-center justify-center p-8 shadow-2xl"
                 initial={{ y: 50, opacity: 0 }}
                 whileInView={{ y: 0, opacity: 1 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8 }}
               >
                 <div className="text-primary-foreground text-center">
                   <h3 className="font-heading text-5xl uppercase mb-4 tracking-wider">10k+</h3>
                   <p className="font-paragraph text-lg leading-relaxed">Active skill swaps happening right now across the globe.</p>
                 </div>
               </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA SECTION - Minimalist & Bold */}
      <section className="w-full max-w-[120rem] mx-auto px-4 md:px-8 py-40 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-br from-foreground to-foreground/90 text-background rounded-[3rem] p-12 md:p-24 relative overflow-hidden shadow-2xl"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-white" />
             <div className="absolute bottom-10 right-10 w-64 h-64 rounded-full border-2 border-white" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-heading text-5xl md:text-7xl uppercase mb-8 tracking-wider">
              Ready to Start<br />Your Journey?
            </h2>
            <p className="font-paragraph text-xl text-neutral-300 mb-12 leading-relaxed">
              Join thousands of learners and teachers today. Share your expertise and unlock new possibilities.
            </p>
            <Link to="/profiles">
              <Button className="h-20 px-12 rounded-full bg-primary text-primary-foreground hover:bg-white hover:text-foreground text-xl font-heading uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl">
                Start Learning Today
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

// --- Sub-Components ---

function WorkStepCard({ number, title, description, icon, image }: { number: string, title: string, description: string, icon: React.ReactNode, image: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      className="group"
    >
      <div className="flex items-baseline gap-4 mb-8">
        <span className="font-heading text-primary text-2xl font-bold">{number}</span>
        <h3 className="font-heading text-4xl uppercase text-foreground tracking-wider">{title}</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-gradient-to-br from-secondary to-secondary/70 p-8 rounded-2xl h-full flex flex-col justify-between min-h-[300px] transition-all duration-500 group-hover:from-foreground group-hover:to-foreground/90 group-hover:text-background shadow-lg group-hover:shadow-xl">
          <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center text-foreground mb-6 group-hover:bg-primary group-hover:text-white transition-all shadow-md">
            {icon}
          </div>
          <p className="font-paragraph text-lg leading-relaxed opacity-90">
            {description}
          </p>
          <div className="mt-8 flex justify-end">
            <ArrowUpRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="h-[300px] rounded-2xl overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
          <Image 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
        </div>
      </div>
    </motion.div>
  );
}

function BenefitRow({ title, desc }: { title: string, desc: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="group cursor-default"
    >
      <div className="flex items-start gap-4">
        <CheckCircle2 className="w-7 h-7 text-primary mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
        <div>
          <h4 className="font-heading text-2xl uppercase text-foreground mb-2 group-hover:text-primary transition-colors tracking-wider">
            {title}
          </h4>
          <p className="font-paragraph text-secondary-foreground text-lg max-w-md leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
}