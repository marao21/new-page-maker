import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'Neo-Brutalism Landing Page' },
      { name: 'description', content: 'Landing page em estilo Neo-Brutalismo utilizando cores vibrantes.' },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className='min-h-screen bg-[#ffe17c] font-sans text-black'>
      <header className='sticky top-0 z-50 border-b-2 border-black bg-[#ffe17c] h-20 flex items-center justify-between p-6'>
        <div className='w-10 h-10 bg-black'></div>
        <nav className='flex space-x-4'>
          <a href='#hero' className='font-bold'>Início</a>
          <a href='#features' className='font-bold'>Recursos</a>
          <a href='#contact' className='font-bold'>Contato</a>
        </nav>
        <a href='#' className='bg-black text-white py-2 px-4 rounded border border-black shadow transition-transform transform hover:translate-x-2 hover:translate-y-2'>Start Free Trial</a>
      </header>

      <section id='hero' className='grid grid-cols-2 gap-6 p-20 bg-[#ffe17c]'>
        <div>
          <span className='bg-white border-2 border-black rounded-full py-2 px-4'>NEW: AI Content Assistant 2.0</span>
          <h1 className='text-8xl font-cabinet-grotesk text-black'>Cabinet Grotesk</h1>
          <div className='flex space-x-4'>
            <button className='bg-black text-white rounded-full py-4 px-8 shadow-[8px_8px_0px_black] transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0px_black]'>Primary Action</button>
            <button className='bg-white text-black rounded-full py-4 px-8 border-2 border-black shadow-[4px_4px_0px_black] transition-transform hover:-translate-y-1'>Secondary Action</button>
          </div>
        </div>
        <div>
          <div className='bg-white border-2 border-black shadow-[8px_8px_0px_black]'><img src='browser-mockup.png' alt='Browser Mockup'/></div>
        </div>
      </section>

      {/* Repeat for other sections (Social Proof, Problem vs Solution, etc.) */}

      <footer className='bg-[#171e19] text-white py-4 text-center'>
        <div className='flex justify-around'>
          <div className='py-2'>© 2023 Neo-Brutalism</div>
          <a href='mailto:contact@neobrutalism.com' className='underline hover:text-[#ffe17c]'>contact@neobrutalism.com</a>
        </div>
      </footer>
    </main>
  );
}