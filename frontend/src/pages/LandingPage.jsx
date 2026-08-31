import { Link } from 'react-router-dom';
import { ChefHat, QrCode, Sparkles, Palette, ArrowRight, Star } from 'lucide-react';
import { useDarkMode } from '../hooks/useDarkMode';
import DarkModeToggle from '../components/DarkModeToggle';

const features = [
  { icon: Sparkles, title: 'AI-Powered Descriptions', desc: 'Generate compelling food descriptions with AI assistance' },
  { icon: Palette, title: 'Beautiful Templates', desc: '5 professionally designed menu templates to choose from' },
  { icon: QrCode, title: 'QR Code Ordering', desc: 'Customers scan QR and order directly from their phones' },
  { icon: Star, title: 'Smart Dashboard', desc: 'Analytics, order management, and real-time insights' },
];

export default function LandingPage() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 text-white">
      {/* Floating glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold font-display">SmartMenu</span>
        </div>
        <div className="flex items-center gap-3">
          <DarkModeToggle isDark={isDark} toggle={toggle} />
          <Link to="/login" className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-gray-300">AI-Powered Menu Designer</span>
        </div>

        <h1 className="text-5xl lg:text-7xl font-extrabold font-display leading-tight mb-6">
          Create Stunning
          <br />
          <span className="bg-gradient-to-r from-primary-400 to-amber-400 bg-clip-text text-transparent">
            Digital Menus
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Design beautiful restaurant menus with AI-assisted content, multiple templates,
          and QR code ordering — all running locally, completely free.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="btn-primary text-base px-8 py-3.5">
            Start Building <ArrowRight className="w-5 h-5" />
          </Link>
          <Link to="/menu/urban-spice" className="btn-secondary text-base px-8 py-3.5 bg-white/5 border-white/10 text-white hover:bg-white/10">
            View Demo Menu
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8 text-center">
        <p className="text-sm text-gray-500">
          Smart Digital Menu Designer — BTech Final Year Project
        </p>
      </footer>
    </div>
  );
}
