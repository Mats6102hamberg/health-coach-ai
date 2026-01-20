import Link from 'next/link';
import { ArrowRight, Heart, TrendingUp, MessageCircle, Sparkles } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-4xl">🎩</span>
            <h1 className="text-2xl font-bold text-gray-800">Boris Run</h1>
          </div>
          <div className="flex gap-3">
            <Link
              href="/sign-in"
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              Logga in
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Kom igång
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            ✨ Din personliga AI-hälsocoach
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
            Möt Boris - Din AI-Coach
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Boris hjälper dig nå dina hälsomål med personliga råd, daglig uppföljning och 
            AI-driven analys av din hälsodata. Allt på svenska, allt för dig.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/sign-up"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all flex items-center gap-2 text-lg"
            >
              Börja din resa
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/sign-in"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:shadow-lg transition-all border-2 border-gray-200 text-lg"
            >
              Logga in
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <MessageCircle className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">AI-Coach Boris</h3>
            <p className="text-gray-600">
              Prata med Boris via text eller röst. Få personliga råd om mat, träning och hälsa 
              baserat på din unika data.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Spåra din progress</h3>
            <p className="text-gray-600">
              Följ din vikt, aktivitet, steg, vatten och sömn. Visualisera din utveckling 
              med vackra grafer och statistik.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Gamification</h3>
            <p className="text-gray-600">
              Bygg streaks, samla XP, nå nya nivåer och lås upp achievements. 
              Gör hälsa roligt och motiverande!
            </p>
          </div>
        </div>
      </section>

      {/* Boris Quote */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="text-6xl mb-6">🎩</div>
          <blockquote className="text-2xl text-gray-700 italic mb-6">
            "Boris är här för att hjälpa dig bli din bästa version. 
            Boris tror på dig, och Boris vet att du kan nå dina mål!"
          </blockquote>
          <p className="text-gray-600 font-semibold">— Boris, Din AI-Hälsocoach</p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Redo att börja din hälsoresa?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Skapa ditt konto idag och få tillgång till Boris och alla verktyg du behöver 
            för att nå dina hälsomål.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-xl transition-all text-lg"
          >
            Kom igång gratis
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>© 2026 Boris Run. Skapad med ❤️ för din hälsa.</p>
        </div>
      </footer>
    </div>
  );
}
