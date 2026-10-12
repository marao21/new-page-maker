import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Neo-Brutalist SaaS Landing Page' },
      { name: 'description', content: 'A vibrant Neo-Brutalist SaaS landing page with #ffe17c yellow, #171e19 charcoal, and #b7c6c2 sage.' },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-[#ffe17c] font-sans text-black selection:bg-black selection:text-[#ffe17c]">
      {/* Navigation Header */} 
      <header className="sticky top-0 z-50 h-20 bg-[#ffe17c] border-b-2 border-black flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_#000000]">
            <div className="w-4 h-4 bg-[#ffe17c] transform rotate-45"></div>
          </div>
          <span className="font-extrabold text-2xl tracking-tighter uppercase font-cabinet-grotesk">SaaS.neo</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8 font-bold text-base">
          <a href="#features" className="hover:underline underline-offset-4">Recursos</a>
          <a href="#how-it-works" className="hover:underline underline-offset-4">Como Funciona</a>
          <a href="#personas" className="hover:underline underline-offset-4">Para Quem</a>
          <a href="#testimonials" className="hover:underline underline-offset-4">Depoimentos</a>
        </nav>
        <div>
          <a 
            href="#cta" 
            className="bg-black text-white px-5 py-2.5 font-bold border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 inline-block"
          >
            Start Free Trial
          </a>
        </div>
      </header>

      {/* Hero Section */} 
      <section id="hero" className="relative py-16 md:py-24 px-6 md:px-12 bg-[#ffe17c] border-b-2 border-black overflow-hidden" style={{
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.12) 1.5px, transparent 1.5px)',
        backgroundSize: '32px 32px'
      }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center bg-white border-2 border-black px-4 py-1.5 rounded-full font-bold text-sm shadow-[4px_4px_0px_0px_#000000]">
              <span className="w-2.5 h-2.5 bg-black rounded-full mr-2 animate-pulse"></span>
              NEW: AI Content Assistant 2.0
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-none text-black font-cabinet-grotesk">
              SCALE <span className="text-transparent" style={{ WebkitTextStroke: '2px black' }}>FASTER</span> WITH AI.
            </h1>
            <p className="text-lg sm:text-xl font-medium max-w-lg">
              Transform your workflow with high-contrast neo-brutalist automation. Zero fluff, maximum output, and absolute design confidence.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a 
                href="#cta"
                className="bg-black text-white font-extrabold px-8 py-4 border-2 border-black shadow-[8px_8px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all duration-150 text-center inline-block rounded-xl"
              >
                Start Free Trial
              </a>
              <a 
                href="#features"
                className="bg-white text-black font-extrabold px-8 py-4 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 text-center inline-block rounded-xl"
              >
                View Features
              </a>
            </div>
          </div>

          {/* Browser Mockup Dashboard */} 
          <div className="w-full">
            <div className="bg-white border-2 border-black rounded-2xl shadow-[12px_12px_0px_0px_#000000] overflow-hidden">
              <div className="bg-black px-4 py-3 flex items-center justify-between border-b-2 border-black">
                <div className="flex items-center space-x-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] border border-black"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e] border border-black"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#28c840] border border-black"></div>
                </div>
                <div className="text-xs font-mono text-[#b7c6c2] bg-[#171e19] px-3 py-1 rounded border border-[#b7c6c2]/30">
                  app.neobrutalism.io/dashboard
                </div>
              </div>
              <div className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#b7c6c2] p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                    <div className="text-xs font-bold uppercase tracking-wide text-black">Monthly Revenue</div>
                    <div className="text-2xl font-extrabold mt-1 font-cabinet-grotesk">$142,850</div>
                    <div className="text-xs font-semibold text-black mt-1">+24.5% from last month</div>
                  </div>
                  <div className="bg-[#ffe17c] p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                    <div className="text-xs font-bold uppercase tracking-wide text-black">Active Users</div>
                    <div className="text-2xl font-extrabold mt-1 font-cabinet-grotesk">24,800+</div>
                    <div className="text-xs font-semibold text-black mt-1">99.8% retention rate</div>
                  </div>
                </div>
                <div className="bg-[#171e19] text-white p-5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-sm text-[#b7c6c2]">Real-time Conversion Velocity</span>
                    <span className="bg-[#ffe17c] text-black text-xs font-bold px-2 py-0.5 rounded border border-black">Live</span>
                  </div>
                  <div className="h-24 flex items-end gap-2 pt-2 border-t border-[#272727]">
                    {[40, 65, 30, 85, 60, 95, 75, 90, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-[#ffe17c] border border-black hover:bg-[#b7c6c2] transition-colors" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Marquee */} 
      <div className="bg-[#171e19] text-[#b7c6c2] border-b-2 border-black py-4 overflow-hidden whitespace-nowrap">
        <div className="inline-block animate-marquee font-cabinet-grotesk font-bold text-xl tracking-wider opacity-50 space-x-16">
          <span>ACME CORP</span>
          <span>•</span>
          <span>GLOBEX INDUSTRIES</span>
          <span>•</span>
          <span>SOYLENT VIBES</span>
          <span>•</span>
          <span>INITECH GLOBAL</span>
          <span>•</span>
          <span>UMBRELLA LABS</span>
          <span>•</span>
          <span>HOPE CORP</span>
          <span>•</span>
          <span>ACME CORP</span>
          <span>•</span>
          <span>GLOBEX INDUSTRIES</span>
        </div>
      </div>

      {/* Problem vs Solution */} 
      <section className="py-20 px-6 md:px-12 bg-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-[#ffe17c] border-2 border-black px-4 py-1.5 rounded-full font-bold text-sm shadow-[4px_4px_0px_0px_#000000]">
              TRANSFORMATION
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter mt-4 font-cabinet-grotesk">
              The Old Way vs. Neo-Brutalism
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card A: Problem */} 
            <div className="bg-[#f4f4f5] border-2 border-dashed border-gray-400 opacity-75 p-8 rounded-[2.5rem]">
              <div className="inline-block bg-gray-200 border border-gray-400 text-gray-700 font-bold px-3 py-1 rounded-full text-xs mb-6">
                OUTDATED SAAS
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-cabinet-grotesk mb-6 text-gray-700">Standard Boring Software</h3>
              <ul className="space-y-4 font-medium text-gray-600">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 border border-red-300 flex items-center justify-center font-bold text-sm">✕</span>
                  <span>Generic gradients & invisible borders</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 border border-red-300 flex items-center justify-center font-bold text-sm">✕</span>
                  <span>Slow conversion velocity & bland UI</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 border border-red-300 flex items-center justify-center font-bold text-sm">✕</span>
                  <span>Complex onboarding with zero character</span>
                </li>
              </ul>
            </div>

            {/* Card B: Solution */} 
            <div className="bg-[#ffe17c] border-2 border-black shadow-[8px_8px_0px_0px_#000000] p-8 rounded-[2.5rem]">
              <div className="inline-block bg-black text-white font-bold px-3 py-1 rounded-full text-xs mb-6 border border-black">
                NEO-BRUTALIST POWER
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-cabinet-grotesk mb-6 text-black">High-Impact Engine</h3>
              <ul className="space-y-4 font-bold text-black">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-[#ffe17c] border-2 border-black flex items-center justify-center font-bold text-sm">✓</span>
                  <span>High-contrast borders & crisp geometry</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-[#ffe17c] border-2 border-black flex items-center justify-center font-bold text-sm">✓</span>
                  <span>Instant physical press micro-interactions</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-black text-[#ffe17c] border-2 border-black flex items-center justify-center font-bold text-sm">✓</span>
                  <span>Bold Cabinet Grotesk typography & sage accents</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */} 
      <section id="features" className="py-20 px-6 md:px-12 bg-[#ffe17c] border-b-2 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-white border-2 border-black px-4 py-1.5 rounded-full font-bold text-sm shadow-[4px_4px_0px_0px_#000000]">
              POWERFUL MODULES
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter mt-4 font-cabinet-grotesk">
              Built for Maximum Output
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'AI Content Generation',
                desc: 'Generate viral copy, email sequences, and landing page wireframes instantly with custom tone controls.'
              },
              {
                title: 'Conversion Analytics',
                desc: 'Deep real-time metrics designed with high-contrast charts that highlight exact bottlenecks.'
              },
              {
                title: 'Neobrutalist UI Kit',
                desc: 'Access hundreds of pre-built components featuring crisp 2px borders and hard offset shadows.'
              },
              {
                title: 'Instant Workflow Sync',
                desc: 'Connect your favorite tools seamlessly without writing a single line of integration code.'
              },
              {
                title: 'Enterprise Security',
                desc: 'Military-grade encryption wrapped in an unyielding geometric fortress of code.'
              },
              {
                title: '24/7 Priority Support',
                desc: 'Direct line to elite engineers ready to optimize your pipelines around the clock.'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group bg-white border-2 border-black p-8 rounded-2xl shadow-[4px_4px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="w-16 h-16 bg-[#b7c6c2] group-hover:bg-[#ffe17c] transition-colors border-2 border-black rounded-xl mb-6 flex items-center justify-center font-bold text-xl shadow-[2px_2px_0px_0px_#000000]">
                    0{idx + 1}
                  </div>
                  <h3 className="text-2xl font-extrabold font-cabinet-grotesk mb-3">{feature.title}</h3>
                  <p className="font-medium text-gray-800">{feature.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t-2 border-black flex items-center justify-between font-bold text-sm">
                  <span>Explore module</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */} 
      <section id="how-it-works" className="py-20 px-6 md:px-12 bg-[#171e19] text-white border-b-2 border-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-[#ffe17c] text-black border-2 border-black px-4 py-1.5 rounded-full font-bold text-sm shadow-[4px_4px_0px_0px_#000000]">
              STEP-BY-STEP
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter mt-4 font-cabinet-grotesk text-white">
              How It Works
            </h2>
          </div>
          
          <div className="relative">
            {/* Horizontal connection line for desktop */} 
            <div className="hidden md:block absolute top-12 left-12 right-12 h-1 bg-[#272727] z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Connect Your Stack',
                  desc: 'Link your workspace in seconds with our secure one-click integration wizard.',
                  glowColor: '#b7c6c2'
                },
                {
                  step: '02',
                  title: 'Configure AI Engine',
                  desc: 'Select your brand voice, target audience, and primary growth KPIs.',
                  glowColor: '#ffe17c'
                },
                {
                  step: '03',
                  title: 'Scale & Dominate',
                  desc: 'Launch automated campaigns and watch your conversions skyrocket instantly.',
                  glowColor: '#ffffff'
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-[#171e19] border-2 border-[#272727] p-8 rounded-2xl flex flex-col items-center text-center">
                  <div 
                    className="w-24 h-24 rounded-full bg-black border-4 flex items-center justify-center font-cabinet-grotesk text-3xl font-extrabold mb-6"
                    style={{ borderColor: item.glowColor, boxShadow: `0 0 20px ${item.glowColor}40` }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-extrabold font-cabinet-grotesk mb-3 text-white">{item.title}</h3>
                  <p className="font-medium text-gray-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Case Personas */} 
      <section id="personas" className="py-20 px-6 md:px-12 bg-white border-b-2 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-[#b7c6c2] border-2 border-black px-4 py-1.5 rounded-full font-bold text-sm shadow-[4px_4px_0px_0px_#000000]">
              WHO IS IT FOR
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter mt-4 font-cabinet-grotesk">
              Tailored For Your Growth Team
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Sage */} 
            <div className="bg-[#b7c6c2] border-2 border-black p-8 rounded-2xl shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between">
              <div>
                <span className="bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-bold inline-block mb-6">
                  FOUNDERS & CEOs
                </span>
                <h3 className="text-3xl font-extrabold font-cabinet-grotesk mb-4">Visionary Leadership</h3>
                <p className="font-medium text-black">
                  Gain high-level oversight over all marketing and product metrics with zero operational friction.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t-2 border-black font-bold text-sm">
                → Perfect for early-stage scaling
              </div>
            </div>

            {/* Card 2: Yellow */} 
            <div className="bg-[#ffe17c] border-2 border-black p-8 rounded-2xl shadow-[8px_8px_0px_0px_#000000] flex flex-col justify-between">
              <div>
                <span className="bg-white border-2 border-black px-3 py-1 rounded-full text-xs font-bold inline-block mb-6">
                  GROWTH MARKETERS
                </span>
                <h3 className="text-3xl font-extrabold font-cabinet-grotesk mb-4">Velocity Engineers</h3>
                <p className="font-medium text-black">
                  Deploy rapid A/B tested campaigns and high-converting copy assets in a fraction of the usual time.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t-2 border-black font-bold text-sm">
                → Maximum conversion power
              </div>
            </div>

            {/* Card 3: Dark Gray */} 
            <div className="bg-[#171e19] text-white border-2 border-black p-8 rounded-2xl shadow-[4px_4px_0px_0px_#000000] flex flex-col justify-between">
              <div>
                <span className="bg-white text-black border-2 border-black px-3 py-1 rounded-full text-xs font-bold inline-block mb-6">
                  PRODUCT DEVELOPERS
                </span>
                <h3 className="text-3xl font-extrabold font-cabinet-grotesk mb-4 text-white">Technical Builders</h3>
                <p className="font-medium text-gray-300">
                  Integrate robust APIs and clean micro-interactions into your tech stack without bloated dependencies.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t-2 border-[#272727] font-bold text-sm text-[#b7c6c2]">
                → Built for pure performance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */} 
      <section id="testimonials" className="py-20 px-6 md:px-12 bg-[#b7c6c2] border-b-2 border-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="bg-white border-2 border-black px-4 py-1.5 rounded-full font-bold text-sm shadow-[4px_4px_0px_0px_#000000]">
              PROVEN RESULTS
            </span>
            <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter mt-4 font-cabinet-grotesk">
              Loved By Industry Leaders
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'The neo-brutalist aesthetic gave our brand instant credibility and doubled our trial conversion rate in week one.',
                name: 'Sarah Jenkins',
                role: 'VP of Growth at Acme'
              },
              {
                quote: 'Absolute masterpiece of design and performance. Clean, aggressive, and incredibly fast to implement.',
                name: 'Marcus Vance',
                role: 'Founder @ Globex'
              },
              {
                quote: 'We replaced three different tools with this single platform. The AI assistant alone saves us 20 hours a week.',
                name: 'Elena Rostova',
                role: 'Head of Product'
              }
            ].map((t, i) => (
              <div 
                key={i} 
                className="bg-white border-2 border-black p-8 shadow-[6px_6px_0px_0px_#000000] flex flex-col justify-between"
                style={{
                  borderRadius: '2.5rem 0.5rem 2.5rem 0.5rem'
                }}
              >
                <div>
                  <div className="flex space-x-1 text-[#ffbc2e] mb-4 text-xl">
                    {'★'.repeat(5)}
                  </div>
                  <p className="font-medium text-black text-lg mb-6 leading-relaxed">"{t.quote}"</p>
                </div>
                <div className="pt-4 border-t-2 border-black">
                  <div className="font-extrabold font-cabinet-grotesk text-lg">{t.name}</div>
                  <div className="text-sm font-semibold text-gray-600">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */} 
      <section id="cta" className="py-24 px-6 md:px-12 bg-[#ffe17c] border-b-2 border-black text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <span className="bg-white border-2 border-black px-4 py-1.5 rounded-full font-bold text-sm shadow-[4px_4px_0px_0px_#000000] inline-block">
            GET STARTED TODAY
          </span>
          <h2 className="text-5xl sm:text-7xl font-extrabold tracking-tighter font-cabinet-grotesk text-black">
            Ready to Elevate Your SaaS?
          </h2>
          <p className="text-xl font-medium max-w-2xl mx-auto">
            Join over 25,000 teams scaling faster with high-contrast neo-brutalist automation. No credit card required.
          </p>
          <div className="pt-4">
            <a 
              href="#hero"
              className="bg-black text-white font-extrabold px-10 py-5 border-2 border-black shadow-[8px_8px_0px_0px_#000000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_#000000] transition-all duration-150 text-xl inline-block rounded-xl"
            >
              Start Your Free Trial Now
            </a>
          </div>
        </div>
      </section>

      {/* Footer */} 
      <footer className="bg-[#171e19] text-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#ffe17c] border-2 border-[#b7c6c2] flex items-center justify-center">
                <div className="w-3 h-3 bg-black transform rotate-45"></div>
              </div>
              <span className="font-extrabold text-xl tracking-tighter uppercase font-cabinet-grotesk text-[#ffe17c]">SaaS.neo</span>
            </div>
            <p className="text-sm text-[#b7c6c2] font-medium">
              Vibrant Neo-Brutalist SaaS landing page engine designed for professional confidence with a playful edge.
            </p>
          </div>

          <div>
            <h4 className="font-cabinet-grotesk font-extrabold text-lg text-[#ffe17c] mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm font-medium text-[#b7c6c2]">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Workflows</a></li>
              <li><a href="#personas" className="hover:text-white transition-colors">Personas</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Case Studies</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-cabinet-grotesk font-extrabold text-lg text-[#ffe17c] mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm font-medium text-[#b7c6c2]">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-cabinet-grotesk font-extrabold text-lg text-[#ffe17c] mb-4">Connect</h4>
            <div className="flex space-x-3">
              {['TW', 'GH', 'LI', 'YT'].map((soc, idx) => (
                <a 
                  key={idx}
                  href="#"
                  className="w-10 h-10 bg-[#272727] border border-[#b7c6c2]/40 hover:border-[#ffe17c] hover:bg-[#ffe17c] hover:text-black text-[#b7c6c2] flex items-center justify-center font-bold text-xs transition-all duration-150"
                >
                  {soc}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#272727] flex flex-col md:flex-row justify-between items-center text-xs text-[#b7c6c2]">
          <div>© {new Date().getFullYear()} Neo-Brutalist SaaS. All rights reserved.</div>
          <div className="mt-4 md:mt-0">
            <a href="mailto:contact@neobrutalism.com" className="underline hover:text-[#ffe17c]">contact@neobrutalism.com</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
