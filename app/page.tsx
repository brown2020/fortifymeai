import Link from "next/link";
import { Pill, Brain, Shield } from "lucide-react";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
              Take Control of Your{" "}
              <span className="text-blue-600">Supplement Journey</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Track, manage, and optimize your supplements with AI-powered
              insights. Make informed decisions about your health journey.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition duration-150 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started Free
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-gray-700 bg-white hover:bg-gray-50 rounded-lg transition duration-150 ease-in-out border border-gray-200 shadow-xs hover:shadow-md"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Features Section */}
      <section className="relative bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your supplements
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Fortify.me combines intelligent tracking, personalized insights,
              and safety checks to help you optimize your supplement routine.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Smart Tracking Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Pill className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Smart Tracking
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Effortlessly track your supplements with intelligent reminders
                and personalized schedules. Never miss a dose again.
              </p>
              <ul className="mt-6 space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                  Customizable reminders
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                  Progress tracking
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2" />
                  Dosage management
                </li>
              </ul>
            </div>

            {/* AI Insights Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-purple-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Brain className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI Insights
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Get personalized recommendations based on your goals, lifestyle,
                and current supplement stack.
              </p>
              <ul className="mt-6 space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                  Personalized recommendations
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                  Scientific research insights
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mr-2" />
                  Goal-based optimization
                </li>
              </ul>
            </div>

            {/* Safety First Card */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
              <div className="bg-green-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Safety First
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Stay informed about potential interactions and ensure your
                supplement combination is safe and effective.
              </p>
              <ul className="mt-6 space-y-2">
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2" />
                  Interaction checks
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2" />
                  Safety alerts
                </li>
                <li className="flex items-center text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2" />
                  Evidence-based guidance
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-linear-to-br from-blue-600 to-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to optimize your supplement routine?
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of users who are taking control of their health with
            Fortify.me
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-blue-600 bg-white hover:bg-blue-50 rounded-lg transition duration-150 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
