import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { motion } from 'motion/react';
import { 
  ArrowRight, Play, Check, Plus, Minus, MapPin, 
  Facebook, Twitter, Linkedin, Instagram, 
  Briefcase, Users, BookOpen, TrendingUp, 
  Globe, MessageSquare, Quote, Menu, X, Shield, Zap, Database
} from 'lucide-react';
import { BrandSettings } from '../types';

interface LandingProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onViewApp: (role: 'executive' | 'employee') => void;
  brand: BrandSettings;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted, onLogin, onViewApp, brand }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  // ── Contact form — powered by Formspree ──────────────────────────────────
  const [formState, handleFormSubmit] = useForm('xvzdknvj');
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [isAnnual, setIsAnnual] = useState(false);

  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const stats = [
    { icon: <Users className="w-5 h-5" />, label: 'EMPLOYEES MANAGED', value: '2.5M+', desc: 'Across global enterprises, trusting HRcopilot daily.' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'ADMIN TIME SAVED', value: '40%', desc: 'Automated workflows reduce manual HR overhead.' },
    { icon: <Globe className="w-5 h-5" />, label: 'COUNTRIES SUPPORTED', value: '120+', desc: 'Built-in localization and global compliance.' },
    { icon: <Shield className="w-5 h-5" />, label: 'PLATFORM UPTIME', value: '99.99%', desc: 'Enterprise-grade reliability and security.' },
  ];

  const workflow = [
    { num: '01', title: 'Unified Data Core', desc: 'Eliminate silos with a single source of truth for all your human capital data.' },
    { num: '02', title: 'Intelligent Automation', desc: 'Streamline onboarding, payroll, and performance reviews with AI-driven workflows.' },
    { num: '03', title: 'Actionable Analytics', desc: 'Make strategic decisions with real-time predictive insights and custom dashboards.' },
    { num: '04', title: 'Global Compliance', desc: 'Stay ahead of regulatory changes with automated local and international compliance tracking.' },
  ];

  const services = [
    { icon: <Database className="w-6 h-6" />, title: 'Core HR & Payroll', desc: 'Seamlessly manage employee records, benefits, and global payroll in one unified interface.' },
    { icon: <Briefcase className="w-6 h-6" />, title: 'Talent Acquisition', desc: 'Attract, track, and hire top-tier talent with our collaborative applicant tracking system.' },
    { icon: <TrendingUp className="w-6 h-6" />, title: 'Performance & OKRs', desc: 'Align individual goals with corporate strategy through continuous feedback and reviews.' },
    { icon: <BookOpen className="w-6 h-6" />, title: 'Learning & Development', desc: 'Upskill your workforce with personalized learning paths and certification tracking.' },
  ];

  const premierServices = [
    'Advanced Workforce Analytics',
    'Global Payroll Engine',
    'AI-Powered Recruitment',
    'Automated Compliance Tracking',
    'Employee Self-Service Portal'
  ];

  const testimonials = [
    { name: 'Sarah Johnson', role: 'CHIEF HR OFFICER AT TECHFLOW', quote: '"HRcopilot replaced 5 different disjointed systems. Our HR team is finally strategic rather than administrative. The ROI was apparent within months."', img: '/HRcopilot_Logo.png' },
    { name: 'Michael Chen', role: 'CIO AT GLOBALLOGISTICS', quote: '"Enterprise-grade security meets consumer-grade user experience. The implementation was seamless, and the analytics dashboard gives our C-suite unprecedented visibility."', img: '/HRcopilot_Logo.png' },
    { name: 'Elena Rodriguez', role: 'VP OF TALENT AT BLOOM CREATIVE', quote: '"The AI-powered recruitment and automated onboarding workflows have reduced our time-to-hire by 35%. HRcopilot is a fundamental game-changer."', img: '/HRcopilot_Logo.png' },
  ];

  const pricing = [
    { name: 'Growth', desc: 'For mid-market companies scaling their operations.', price: '70', unit: '/month', features: ['Core HR & Directory', 'Basic Payroll Integration', 'Time & Attendance', 'Standard Reporting', 'Email Support'], highlighted: false, cta: 'START FREE TRIAL', ctaHref: null },
    { name: 'Enterprise', desc: 'Comprehensive OS for large, complex organizations.', price: '130', unit: '/month', features: ['Everything in Growth', 'Advanced Analytics', 'Performance Management', 'Global Compliance', '24/7 Priority Support'], highlighted: true, cta: 'START FREE TRIAL', ctaHref: null },
    { name: 'Custom', desc: 'Tailored solutions for global multinationals.', price: 'Custom', unit: '', features: ['Everything in Enterprise', 'Custom Integrations', 'Dedicated Success Manager', 'On-Premise Options', 'SLA Guarantees'], highlighted: false, cta: 'CONTACT SALES', ctaHref: 'tel:+2347068110163' },
  ];

  const news = [
    { date: 'April 02, 2026', title: 'How AI is Reshaping Enterprise Talent Acquisition', img: '/HR360_bg.jpg', tag: 'PRODUCT' },
    { date: 'March 28, 2026', title: 'Navigating Global Compliance in a Remote-First World', img: '/HR360_bg.jpg', tag: 'COMPLIANCE' },
    { date: 'March 15, 2026', title: 'HRcopilot Named Leader in HCM Magic Quadrant', img: '/HR360_bg.jpg', tag: 'COMPANY' },
  ];

  const faqs = [
    { q: 'How does HRcopilot integrate with our existing ERP?', a: 'HRcopilot features a robust open API and pre-built connectors for major ERPs like SAP, Oracle, and Workday, ensuring seamless bidirectional data sync.' },
    { q: 'What is the typical implementation timeline?', a: 'Enterprise implementations typically range from 8 to 16 weeks, depending on the complexity of your legacy data migration and custom integration requirements.' },
    { q: 'Is HRcopilot compliant with GDPR and CCPA?', a: 'Yes. Security and privacy are foundational. HRcopilot is SOC 2 Type II certified, ISO 27001 compliant, and fully adheres to GDPR, CCPA, and other global data protection regulations.' },
    { q: 'Do you offer dedicated customer success managers?', a: 'All Enterprise and Custom tier customers are assigned a dedicated Customer Success Manager to guide implementation, training, and ongoing strategic optimization.' },
  ];

  const SectionLabel = ({ text, center = false }: { text: string, center?: boolean }) => (
    <div className={`flex items-center gap-4 mb-6 ${center ? 'justify-center' : ''}`}>
      {center && <div className="w-8 h-[2px] bg-[#0047cc]"></div>}
      <span className="text-[#0047cc] font-bold text-[10px] tracking-[0.2em] uppercase">{text}</span>
      <div className="w-8 h-[2px] bg-[#0047cc]"></div>
    </div>
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white text-slate-900 font-sans selection:bg-[#0047cc] selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 md:py-6 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center">
              <img src="/HRcopilot_Logo.png" alt="HRcopilot Logo" className="h-[50px] object-contain" />
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[11px] font-bold tracking-widest uppercase text-slate-400">
            <a href="#home" className="hover:text-[#0047cc] transition-colors">HOME</a>
            <a href="#features" className="hover:text-[#0047cc] transition-colors">FEATURES</a>
            <a href="#pricing" className="hover:text-[#0047cc] transition-colors">PRICING</a>
            <a href="#contact" className="hover:text-[#0047cc] transition-colors">CONTACT</a>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <button onClick={onLogin} className="text-slate-700 text-[11px] font-bold tracking-widest uppercase hover:text-[#0047cc] transition-colors">
              LOGIN
            </button>
            <button onClick={onGetStarted} className="relative overflow-hidden bg-gradient-to-r from-[#0047cc] to-[#0035a0] text-white px-6 py-3 rounded-full text-[11px] font-bold tracking-widest uppercase hover:shadow-lg hover:shadow-[#0047cc]/30 transition-all group">
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
              />
              <span className="relative z-10">Explore Demo</span>
            </button>
          </div>

          <button className="lg:hidden text-slate-900 p-2 -mr-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-2xl py-6 px-6 flex flex-col gap-6 animate-in slide-in-from-top-2 z-[101] max-h-[80vh] overflow-y-auto overscroll-contain touch-pan-y">
            <a href="#home" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold tracking-widest uppercase text-slate-900 hover:text-[#0047cc] transition-colors">HOME</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold tracking-widest uppercase text-slate-900 hover:text-[#0047cc] transition-colors">FEATURES</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold tracking-widest uppercase text-slate-900 hover:text-[#0047cc] transition-colors">PRICING</a>
            <a href="#contact" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold tracking-widest uppercase text-slate-900 hover:text-[#0047cc] transition-colors">CONTACT</a>
            <div className="h-px bg-slate-100 w-full my-2"></div>
            <button onClick={() => { setIsMenuOpen(false); onLogin(); }} className="text-slate-700 text-sm font-bold tracking-widest uppercase hover:text-[#0047cc] transition-colors text-left">
              LOGIN
            </button>
            <button onClick={() => { setIsMenuOpen(false); onGetStarted(); }} className="bg-[#0047cc] text-white px-6 py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-blue-700 transition-all text-center w-full">
              GET STARTED
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero-section" className="relative z-10 pt-24 md:pt-48 pb-16 md:pb-32 px-4 md:px-6 overflow-hidden min-h-screen flex flex-col items-center justify-center">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/HRcopilot_bg.jpg"
            alt="HRcopilot Background"
            className="w-full h-full object-cover opacity-20 dark:opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/30 to-white dark:from-[#0d0a1a]/50 dark:via-[#0d0a1a]/30 dark:to-[#0d0a1a]" />
        </div>
        <div className="max-w-6xl mx-auto text-center relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-8 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#e0f2fe]0 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-white/60 italic">Human Resources Operating System</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400 fill-mode-both"
          >
            <span className="block text-slate-900 dark:text-white mb-2">HUMAN CAPITAL</span>
            <span className="gradient-text-live italic">REIMAGINED.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl mx-auto text-slate-500 dark:text-slate-400 text-base md:text-lg lg:text-xl font-medium leading-relaxed mb-8 md:mb-12"
          >
            Empower your workforce with HRcopilot's most advanced HR operating system. Provision identities, automate compliance, and unlock predictive intelligence.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            {/* âœ¨ Glittering Explore Demo button */}
            <motion.button
              id="explore-btn"
              onClick={onGetStarted}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="relative w-full sm:w-auto px-10 py-5 rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] overflow-hidden shadow-2xl shadow-[#eff6ff]0/30 group"
              style={{ background: 'linear-gradient(135deg, #0047cc, #0035a0, #1d4ed8)' }}
            >
              {/* Shimmer sweep */}
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -skew-x-12"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
              />
              {/* Sparkle dots */}
              {[
                { top: '20%', left: '12%', delay: 0 },
                { top: '60%', left: '80%', delay: 0.4 },
                { top: '30%', left: '70%', delay: 0.8 },
                { top: '70%', left: '25%', delay: 1.2 },
              ].map((s, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-white"
                  style={{ top: s.top, left: s.left }}
                  animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
                />
              ))}
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Demo
              </span>
            </motion.button>

            <button
              onClick={() => setShowRolePicker(true)}
              className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-600 dark:text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              View Application
            </button>
          </motion.div>
        </div>

        {/* ── Role Picker Modal ─────────────────────────────────────────── */}
        {showRolePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            style={{ background: 'rgba(10,22,40,0.7)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowRolePicker(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-8 pt-8 pb-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.25em] uppercase text-[#0047cc] mb-1">No login required</p>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Choose Your View</h2>
                  </div>
                  <button onClick={() => setShowRolePicker(false)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-400 mt-2">Explore the full application interface. Switch views anytime from inside the app.</p>
              </div>

              {/* Role cards */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Executive */}
                <button
                  onClick={() => { setShowRolePicker(false); onViewApp('executive'); }}
                  className="group relative p-6 rounded-2xl border-2 border-slate-100 hover:border-[#0047cc] bg-white hover:bg-[#f0f5ff] transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0047cc] to-[#0035a0] flex items-center justify-center text-white text-2xl mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    👔
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Executive View</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Full dashboard — payroll, attendance, finance, procurement, CRM & more.</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-[#0047cc] uppercase tracking-widest">
                    Enter <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                {/* Employee */}
                <button
                  onClick={() => { setShowRolePicker(false); onViewApp('employee'); }}
                  className="group relative p-6 rounded-2xl border-2 border-slate-100 hover:border-[#0047cc] bg-white hover:bg-[#f0f5ff] transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0047cc] to-[#1d4ed8] flex items-center justify-center text-white text-2xl mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                    🧑‍💼
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Employee View</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Personal portal — my payslips, attendance, leave, performance & approvals.</p>
                  <div className="mt-4 flex items-center gap-1.5 text-[10px] font-black text-[#0047cc] uppercase tracking-widest">
                    Enter <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>

              <div className="px-6 pb-6 text-center">
                <p className="text-[10px] text-slate-300 uppercase tracking-widest">You can start the guided demo anytime from inside the app</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Marquee â€” pinned to hero bottom, always in viewport */}
        <div className="absolute bottom-0 left-0 right-0 text-white py-4 overflow-hidden flex whitespace-nowrap z-30" style={{ background: "linear-gradient(90deg, #0d1f3c, #0a3060, #0d1f3c)" }}>
          <motion.div
            animate={{ x: [0, -1200] }}
            transition={{ repeat: Infinity, duration: 22, ease: 'linear' }}
            className="flex items-center gap-8 text-[11px] font-black tracking-widest uppercase"
          >
            {['UNIFIED PLATFORM','ENTERPRISE GRADE','AI-DRIVEN INSIGHTS','SEAMLESS INTEGRATION','GLOBAL COMPLIANCE','BIOMETRIC ATTENDANCE','AUTOMATED PAYROLL','REAL-TIME ANALYTICS','UNIFIED PLATFORM','ENTERPRISE GRADE','AI-DRIVEN INSIGHTS','SEAMLESS INTEGRATION','GLOBAL COMPLIANCE'].map((label, i) => (
              <React.Fragment key={i}>
                <span>{label}</span>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#0047cc" }} />
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {stats.map((stat, i) => (
            <div key={i}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#0047cc] rounded flex items-center justify-center text-white">
                  {stat.icon}
                </div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-900">{stat.label}</span>
              </div>
              <h3 className="text-5xl font-bold text-slate-900 mb-4 tracking-tight">{stat.value}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Video / About Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <SectionLabel text="DISCOVER HRcopilot" center />
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Built for Scale: The Platform Powering Modern Enterprises
            </h2>
          </div>

          <div className="relative w-full max-w-5xl mx-auto aspect-video bg-slate-200 rounded-[2rem] overflow-hidden mb-12 group cursor-pointer">
            <img src="/HRcopilot_bg.jpg" alt="Dashboard Preview" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-[#0047cc] rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-slate-500 italic text-sm max-w-xl">
              "Our architecture is designed to handle the complexities of global workforces, providing consumer-grade experiences with enterprise-grade security and reliability."
            </p>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gradient-to-br from-[#0047cc] to-[#1d4ed8] flex items-center justify-center text-white font-bold text-sm">
                    {i}
                  </div>
                ))}
              </div>
              <button className="text-xs font-bold tracking-widest uppercase text-slate-900 flex items-center gap-2 hover:text-[#0047cc] transition-colors">
                MEET OUR CUSTOMERS <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="features" className="py-20 md:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <SectionLabel text="PLATFORM ARCHITECTURE" />
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-6">
              How HRcopilot Transforms Operations
            </h2>
            <p className="text-slate-500 mb-10 leading-relaxed">
              Our unified architecture ensures data flows seamlessly across all modules, eliminating silos and empowering strategic decision-making from the C-suite to the frontline.
            </p>
            <button className="bg-[#0a0a0a] text-white px-8 py-4 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-[#0047cc] hover:shadow-lg hover:shadow-[#0047cc]/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2">
              VIEW ARCHITECTURE <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-12">
            {workflow.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-[#0047cc] text-white flex items-center justify-center font-bold shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 md:py-32 px-6 bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <SectionLabel text="ENTERPRISE MODULES" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-6">
              A Complete Ecosystem For Your Workforce
            </h2>
            <p className="text-white/60 mb-10 leading-relaxed">
              From hire to retire, HRcopilot provides specialized modules that work together flawlessly within a single unified platform.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full border border-[#0047cc] flex items-center justify-center text-[#0047cc]">
                  <Check className="w-3 h-3" />
                </div>
                SOC 2 Type II Certified Security
              </li>
              <li className="flex items-center gap-3 text-sm font-semibold">
                <div className="w-5 h-5 rounded-full border border-[#0047cc] flex items-center justify-center text-[#0047cc]">
                  <Check className="w-3 h-3" />
                </div>
                Open API & Pre-built Integrations
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <div key={i} className="border border-white/10 bg-white/5 p-8 rounded-xl hover:border-[#0047cc]/50 transition-colors">
                <div className="text-[#0047cc] mb-6">{service.icon}</div>
                <h3 className="text-lg font-bold mb-4">{service.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <SectionLabel text="COMMON QUESTIONS" center />
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className={`font-bold ${activeFaq === i ? 'text-[#0047cc]' : 'text-slate-900'}`}>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${activeFaq === i ? 'bg-[#0047cc] text-white' : 'bg-slate-100 text-slate-400'}`}>
                    {activeFaq === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>
                {activeFaq === i && (
                  <div className="px-8 pb-6 text-slate-500 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Contact */}
      <section id="contact" className="py-20 md:py-32 px-6 bg-white relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="w-full h-[400px] bg-slate-200 rounded-3xl mb-20 relative overflow-hidden">
            <img src="/HRcopilot_bg.jpg" alt="Map" className="w-full h-full object-cover opacity-50 grayscale" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-12 h-12 bg-[#0047cc] rounded-full flex items-center justify-center text-white shadow-xl mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="bg-white p-6 rounded-xl shadow-xl text-center min-w-[250px]">
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-2">GLOBAL HQ:</p>
                <p className="text-sm font-semibold text-slate-900 mb-4">Hillcrest Mall, Ahmadu Bello Way, Lokogoma Crecient, Abuja, Nigeria</p>
                <p className="text-[9px] font-bold tracking-widest uppercase text-slate-400 mb-2">ENTERPRISE SALES:</p>
                <p className="text-sm font-semibold text-slate-900">HRcopilot-OS</p>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <SectionLabel text="REQUEST A DEMO" center />
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                Ready To Transform Your HR?
              </h2>
            </div>

            {formState.succeeded ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Request Received!</h3>
                <p className="text-slate-500 text-sm max-w-sm">Thanks for reaching out. Our team will be in touch within one business day.</p>
              </div>
            ) : (
            <form className="space-y-8" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">YOUR NAME</label>
                  <input required type="text" name="name" placeholder="John Doe" className="w-full border-b border-slate-200 py-3 bg-transparent focus:outline-none focus:border-[#0047cc] transition-colors text-slate-900" />
                  <ValidationError field="name" errors={formState.errors} className="text-rose-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">WORK EMAIL</label>
                  <input required type="email" name="email" placeholder="john@company.com" className="w-full border-b border-slate-200 py-3 bg-transparent focus:outline-none focus:border-[#0047cc] transition-colors text-slate-900" />
                  <ValidationError field="email" errors={formState.errors} className="text-rose-500 text-xs mt-1" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">COMPANY NAME</label>
                  <input required type="text" name="company" placeholder="Acme Corp" className="w-full border-b border-slate-200 py-3 bg-transparent focus:outline-none focus:border-[#0047cc] transition-colors text-slate-900" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">COMPANY SIZE</label>
                  <select name="size" className="w-full border-b border-slate-200 py-3 bg-transparent focus:outline-none focus:border-[#0047cc] transition-colors text-slate-900 appearance-none">
                    <option>100 - 499 Employees</option>
                    <option>500 - 999 Employees</option>
                    <option>1000 - 4999 Employees</option>
                    <option>5000+ Employees</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-2">WHAT ARE YOUR MAIN HR CHALLENGES?</label>
                <textarea name="message" placeholder="Tell us about your current stack and goals..." rows={4} className="w-full border-b border-slate-200 py-3 bg-transparent focus:outline-none focus:border-[#0047cc] transition-colors text-slate-900 resize-none"></textarea>
                <ValidationError field="message" errors={formState.errors} className="text-rose-500 text-xs mt-1" />
              </div>

              {/* General form error */}
              <ValidationError errors={formState.errors} className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-medium" />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={formState.submitting}
                  className="bg-[#0047cc] text-white px-8 py-4 rounded-full text-xs font-bold tracking-wider uppercase hover:bg-[#0035a0] hover:shadow-lg hover:shadow-[#0047cc]/30 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {formState.submitting ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> SENDING…</>
                  ) : (
                    <>REQUEST DEMO <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0a0a0a] text-white pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img src="/HRcopilot_Logo.png" alt="HRcopilot Logo" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                The unified human capital operating system built for global enterprises. Automate workflows, ensure compliance, and unlock insights.
              </p>
              <div className="flex items-center gap-4 text-white/50">
                <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Newsletter</h4>
              <p className="text-white/50 text-sm mb-4">Stay updated with the latest HR tech trends and platform updates.</p>
              <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 focus-within:border-[#0047cc]/50 transition-colors">
                <input type="email" placeholder="Your work email" className="bg-transparent border-none outline-none px-4 py-2 text-sm w-full text-white" />
                <button className="w-10 h-10 bg-[#0047cc] rounded-full flex items-center justify-center hover:bg-[#0035a0] hover:shadow-lg hover:shadow-[#0047cc]/30 active:scale-95 transition-all shrink-0">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="font-bold mb-6">Platform</h4>
              <ul className="space-y-3 text-white/50 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Core HR & Payroll</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Talent Acquisition</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Performance & OKRs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Workforce Analytics</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security & Compliance</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-white/50 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Sales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">System Status</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-xs">
            <p>Â© 2026 Analytictosin Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;




