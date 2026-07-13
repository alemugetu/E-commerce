import React from 'react';
import { Package, Truck, Shield, Heart, Users, Target } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          About STORE.ET
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Your trusted destination for quality products at competitive prices. 
          We're committed to providing an exceptional shopping experience.
        </p>
      </div>

      {/* Mission Section */}
      <div className="bg-emerald-50 rounded-2xl p-8 md:p-12 mb-16">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-8 h-8 text-emerald-600" />
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Our Mission</h2>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              At STORE.ET, we believe everyone deserves access to quality products without 
              breaking the bank. Our mission is to provide a seamless shopping experience 
              with authentic products, competitive pricing, and exceptional customer service. 
              We're building a community where customers can shop with confidence and trust.
            </p>
          </div>
          <div className="flex-1">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">What We Stand For</h3>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  Quality products from trusted brands
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  Transparent pricing with no hidden fees
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  Exceptional customer support
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  Fast and reliable delivery
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Customer First</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Our customers are at the heart of everything we do. We listen, adapt, and improve based on your feedback.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Trust & Integrity</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We believe in honest business practices. What you see is what you get - no surprises, no gimmicks.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Quality Assurance</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Every product is carefully selected and verified to ensure it meets our high quality standards.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Community Focus</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We're more than a store - we're a community of shoppers who value quality and service.
            </p>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 text-center mb-12">What We Offer</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Wide Selection</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Browse through thousands of products across multiple categories. From electronics to fashion, we have it all.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Fast Delivery</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Get your orders delivered quickly and safely. We partner with reliable shipping services nationwide.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">Secure Payments</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Shop with peace of mind. Our payment system is secure and supports multiple payment methods.
            </p>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">Our Story</h2>
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            STORE.ET was founded with a simple idea: make quality products accessible to everyone in Ethiopia. 
            We noticed that while there were many shopping options, finding authentic products at fair prices 
            was often a challenge.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Starting as a small operation, we've grown into a trusted marketplace by staying true to our core 
            values: quality, transparency, and customer satisfaction. Every day, we work to improve our selection, 
            enhance our services, and build lasting relationships with our customers.
          </p>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            Today, we're proud to serve thousands of customers across Ethiopia. Our journey is just beginning, 
            and we're excited to have you as part of our story.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Ready to Start Shopping?</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Join thousands of satisfied customers and experience the STORE.ET difference.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Browse Products
        </a>
      </div>
    </div>
  );
};

export default About;
