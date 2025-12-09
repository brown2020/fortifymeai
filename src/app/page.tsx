import Link from "next/link";
import { 
  Pill, 
  Brain, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  FlaskConical,
  BookOpen,
  Zap,
  CheckCircle2,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

const features = [
  {
    icon: FlaskConical,
    title: "Smart Tracking",
    description: "Effortlessly track your supplements with intelligent reminders and personalized schedules. Never miss a dose again.",
    color: "from-emerald-500 to-teal-500",
    iconColor: "text-emerald-400",
    items: ["Customizable reminders", "Progress tracking", "Dosage management"],
  },
  {
    icon: Brain,
    title: "AI Research",
    description: "Get comprehensive, evidence-based information about any supplement powered by advanced AI.",
    color: "from-violet-500 to-purple-500",
    iconColor: "text-violet-400",
    items: ["Scientific analysis", "Interaction checks", "Dosing guidance"],
  },
  {
    icon: Shield,
    title: "Safety First",
    description: "Stay informed about potential interactions and ensure your supplement combination is safe.",
    color: "from-amber-500 to-orange-500",
    iconColor: "text-amber-400",
    items: ["Drug interactions", "Safety alerts", "Evidence-based guidance"],
  },
];

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "50K+", label: "Supplements Tracked" },
  { value: "100K+", label: "Research Queries" },
  { value: "99.9%", label: "Uptime" },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="floating-orb floating-orb-1" />
        <div className="floating-orb floating-orb-2" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.1),transparent_50%)]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
              bg-emerald-500/10 border border-emerald-500/20 mb-8 animate-in fade-in duration-500">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-medium text-emerald-300">
                AI-Powered Supplement Intelligence
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6 
              animate-in slide-in-from-bottom duration-700">
              <span className="text-white">Take Control of Your</span>
              <br />
              <span className="gradient-text">Supplement Journey</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed
              animate-in slide-in-from-bottom duration-700 delay-150">
              Track, research, and optimize your supplement routine with AI-powered insights 
              backed by science. Make informed decisions about your health.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center
              animate-in slide-in-from-bottom duration-700 delay-300">
              <Link href={ROUTES.signup}>
                <Button size="lg" className="gap-2 text-base px-8">
                  <Sparkles className="h-5 w-5" />
                  Get Started Free
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href={ROUTES.research}>
                <Button variant="outline" size="lg" className="gap-2 text-base px-8">
                  <BookOpen className="h-5 w-5" />
                  Try AI Research
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex items-center justify-center gap-8 text-slate-500
              animate-in fade-in duration-700 delay-500">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 text-sm text-slate-400">4.9/5 rating</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-slate-700" />
              <p className="hidden sm:block text-sm text-slate-400">Trusted by health enthusiasts</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-16 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to{" "}
              <span className="gradient-text">optimize your health</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Fortify.me combines intelligent tracking, AI-powered research, 
              and safety checks to help you build the perfect supplement routine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="glass-card p-8 card-hover group"
                >
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} 
                    bg-opacity-20 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Feature list */}
                  <ul className="space-y-2">
                    {feature.items.map((item, i) => (
                      <li key={i} className="flex items-center text-sm text-slate-300">
                        <CheckCircle2 className={`h-4 w-4 mr-2 ${feature.iconColor}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-24 lg:py-32 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Get started in <span className="gradient-text">minutes</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Start optimizing your supplement routine in three simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create Account",
                description: "Sign up for free and set up your profile with your health goals.",
                icon: Sparkles,
              },
              {
                step: "02",
                title: "Add Supplements",
                description: "Log your current supplements or research new ones with AI.",
                icon: Pill,
              },
              {
                step: "03",
                title: "Get Insights",
                description: "Receive personalized recommendations and track your progress.",
                icon: Zap,
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="relative">
                  {/* Connector line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-full h-px 
                      bg-gradient-to-r from-emerald-500/50 to-transparent" />
                  )}
                  
                  <div className="text-center">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl 
                      bg-slate-800/80 border border-slate-700/50 mb-6 relative">
                      <span className="text-2xl font-bold gradient-text">{item.step}</span>
                      <div className="absolute -top-2 -right-2 p-1.5 rounded-lg 
                        bg-gradient-to-br from-emerald-500 to-teal-500">
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-slate-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-12 lg:p-16 text-center relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
            
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to optimize your supplement routine?
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
                Join thousands of users who are taking control of their health with Fortify.me
              </p>
              <Link href={ROUTES.signup}>
                <Button size="lg" className="gap-2 text-base px-10">
                  <Sparkles className="h-5 w-5" />
                  Start Your Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 
                border border-emerald-500/20">
                <Pill className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold gradient-text">Fortify.me</span>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Fortify.me. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
