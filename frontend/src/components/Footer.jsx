import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send } from 'lucide-react';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaTelegram,
  FaWhatsapp,
  FaYoutube,
  FaXTwitter,
} from 'react-icons/fa6';
import { useStoreSettingsContext } from '../context/StoreSettingsContext';

// ─── Social icon configuration ───────────────────────────────────────────────
// Maps each API field name to its react-icon component + accessible label.
// Only entries whose URL is non-null and non-empty are rendered.
const SOCIAL_ICONS = [
  { key: 'facebook_url',  Icon: FaFacebookF,      label: 'Facebook'  },
  { key: 'instagram_url', Icon: FaInstagram,      label: 'Instagram' },
  { key: 'linkedin_url',  Icon: FaLinkedinIn,     label: 'LinkedIn'  },
  { key: 'tiktok_url',    Icon: FaTiktok,         label: 'TikTok'    },
  { key: 'telegram_url',  Icon: FaTelegram,       label: 'Telegram'  },
  { key: 'whatsapp_url',  Icon: FaWhatsapp,       label: 'WhatsApp'  },
  { key: 'youtube_url',   Icon: FaYoutube,        label: 'YouTube'   },
  { key: 'x_url',         Icon: FaXTwitter,       label: 'X'         },
];

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success

  // Dynamic store settings — fall back gracefully while loading or on error
  const { settings } = useStoreSettingsContext();

  const storeName       = settings?.company_name    || 'STORE.ET';
  const footerDesc      = settings?.footer_description || settings?.company_description ||
    "Ethiopia's trusted marketplace for quality products — curated selection, fair prices, and delivery you can rely on.";
  const copyrightText   = settings?.copyright_text  || null;

  // Filter to only social links that have a URL configured
  const activeSocialLinks = SOCIAL_ICONS.filter(
    ({ key }) => settings?.[key] && settings[key].trim() !== ''
  );

  const handleSubscribe = (e) => {
    e.preventDefault();
    setStatus('loading');
    // TODO: Replace with real newsletter API when available
    setTimeout(() => {
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    }, 1000);
  };

  return (
    <footer className="bg-slate-900 text-slate-200 pt-10 pb-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-4">

          {/* ── Company Branding ───────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <Link to="/" className="text-2xl font-bold text-white mb-4 inline-block">
              {storeName}
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {footerDesc}
            </p>

            {/* Social Media Icons — only rendered when at least one URL is set */}
            {activeSocialLinks.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-5">
                {activeSocialLinks.map(({ key, Icon, label }) => (
                  <a
                    key={key}
                    href={settings[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white transition-colors duration-200"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Shop Links ─────────────────────────────────────────────── */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/products" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Company Links ──────────────────────────────────────────── */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-slate-400 hover:text-emerald-400 transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Newsletter ─────────────────────────────────────────────── */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Stay Updated</h3>
            <p className="text-slate-400 text-sm mb-4">
              Subscribe to our newsletter for the latest products and exclusive offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-3 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                  status === 'success'
                    ? 'bg-emerald-700 text-white cursor-default'
                    : status === 'loading'
                    ? 'bg-emerald-600/70 text-white cursor-wait'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:-translate-y-0.5 shadow-sm'
                }`}
              >
                {status === 'loading' ? (
                  <span className="animate-pulse">Subscribing...</span>
                ) : status === 'success' ? (
                  <span>Subscribed!</span>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Bottom Bar ─────────────────────────────────────────────────── */}
        <div className="border-t border-slate-800 pt-4 text-center text-sm text-slate-500">
          {copyrightText ? (
            <p>{copyrightText}</p>
          ) : (
            <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
