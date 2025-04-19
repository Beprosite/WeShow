'use client';

import React from 'react';
import Link from 'next/link';
import { DESIGN_PATTERNS } from './shared/constants/DESIGN_SYSTEM';
import { RiArrowRightLine, RiCheckLine, RiImageLine, RiUploadCloudLine, RiUserSettingsLine, RiPlayCircleLine, RiArrowDownLine, RiSmartphoneLine, RiRefreshLine, RiUserUnfollowLine, RiSparkling2Line } from 'react-icons/ri';
import Image from 'next/image';
import { 
  Building2, 
  Users, 
  Upload, 
  Share2, 
  Download, 
  TrendingUp,
  Shield,
  ImageOff,
  Mail,
  Sparkles,
  Layout,
  CheckCircle2
} from 'lucide-react';
import Logo from '@/app/components/Logo';

export default function HomePage() {
  return (
    <div className={`min-h-screen ${DESIGN_PATTERNS.COLORS.background} text-white`}>
      {/* Header */}
      <header className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto flex justify-between items-center p-4`}>
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>
        <div className="flex gap-4">
          <Link 
            href="/studio/auth/login" 
            className="bg-[#00A3FF]/20 backdrop-blur-sm text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30 hover:bg-[#00A3FF]/30 transition-all duration-200"
          >
            Log in
          </Link>
          <Link 
            href="/studio/auth/signup" 
            className="bg-[#00A3FF]/20 backdrop-blur-sm text-white px-3 md:px-4 py-1 rounded-full text-xs md:text-sm font-medium shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30 hover:bg-[#00A3FF]/30 transition-all duration-200"
          >
            Sign up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto text-center py-20 px-4`}>
        <h1 className={`text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4`}>
          Present Projects. Impress Clients.<br />
          Win More Work.
        </h1>
        <p className={`text-xl md:text-2xl font-medium bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent mb-8 max-w-3xl mx-auto leading-relaxed`}>
          WeShow is the easiest way for studios to deliver, showcase,<br />
          and organize visual projects for clients — under one elegant, branded page.
        </p>
        <div className="flex flex-row justify-center gap-4">
          <Link 
            href="/studio/auth/signup" 
            className={`px-6 py-3 rounded-full inline-flex items-center justify-center 
              bg-[#00A3FF]/20 backdrop-blur-sm text-white 
              shadow-lg shadow-[#00A3FF]/20 
              border border-[#00A3FF]/30 
              hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
              transition-all duration-200`}
          >
            Get Started – Free Trial <RiArrowRightLine className={DESIGN_PATTERNS.ICON.medium} />
          </Link>
          <button className={`px-6 py-3 rounded-full inline-flex items-center justify-center 
              bg-[#00A3FF]/20 backdrop-blur-sm text-white 
              shadow-lg shadow-[#00A3FF]/20 
              border border-[#00A3FF]/30 
              hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
              transition-all duration-200`}>
            <RiPlayCircleLine className={DESIGN_PATTERNS.ICON.medium} /> Watch Demo
          </button>
        </div>
        <div className="mt-10">
          <div className={DESIGN_PATTERNS.CARD.wrapper}>
            <div className={DESIGN_PATTERNS.CARD.inner}>
              <Image 
                src="/device-mockup.png" 
                alt="Device Mockup" 
                width={1200} 
                height={600} 
                quality={100}
                priority
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
        <div className="mt-12">
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-[#00A3FF]/20 blur-sm animate-pulse"></div>
              <div className="relative p-2 rounded-full border border-[#00A3FF]/30 cursor-pointer hover:border-[#00A3FF]/50 transition-all duration-200" 
                   onClick={() => document.getElementById('weshow-advantage')?.scrollIntoView({ behavior: 'smooth' })}>
                <RiArrowDownLine className="w-6 h-6 text-[#00A3FF]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The WeShow Advantage */}
      <section id="weshow-advantage" className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-20 px-4`}>
        <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent text-center mb-4`}>
          The WeShow Advantage
        </h2>
        <p className={`text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto`}>
          Why WeShow leaves platforms like WeTransfer, Vimeo, and Box in the dust.
        </p>
        <p className={`text-xl text-center mb-12 max-w-3xl mx-auto text-white`}>
          Hey studio owner — here's why using WeShow will save you time, money, and headaches.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200 relative p-6">
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-6 h-6 text-[#00A3FF]" />
            </div>
            <div className="absolute top-4 left-4 bg-[#00A3FF]/20 text-[#00A3FF] text-xs font-bold px-3 py-1 rounded-full">
              UNLIMITED ACCESS
            </div>
            <h3 className="text-xl font-bold text-white mb-2 mt-8">No Time or File Size Limits</h3>
            <p className="text-base text-gray-400">
              Stop re-uploading files every week like with WeTransfer. Your projects stay online — forever.
              Clients can download at any time. No expiration. No file size caps.
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200 relative p-6">
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-6 h-6 text-[#00A3FF]" />
            </div>
            <div className="absolute top-4 left-4 bg-[#00A3FF]/20 text-[#00A3FF] text-xs font-bold px-3 py-1 rounded-full">
              ALL-IN-ONE. FOR LESS.
            </div>
            <h3 className="text-xl font-bold text-white mb-2 mt-8">Save Over $300/Year</h3>
            <p className="text-base text-gray-400">
              Replace 3 tools with one: cloud storage (Box), delivery platform (WeTransfer), and client portal.
              WeShow gives you all of it, in one clean subscription.
            </p>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200 relative p-6 md:col-span-2">
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-6 h-6 text-[#00A3FF]" />
            </div>
            <div className="absolute top-4 left-4 bg-[#00A3FF]/20 text-[#00A3FF] text-xs font-bold px-3 py-1 rounded-full">
              CLIENT-FIRST DESIGN
            </div>
            <h3 className="text-xl font-bold text-white mb-2 mt-8">Flawless Client Experience</h3>
            <p className="text-base text-gray-400">
              No logins, no ads, no confusion. Your clients get a clean, professional link to their work — with your branding, not someone else's.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-lg text-gray-400 mb-6">Want to feel the difference?</p>
          <Link 
            href="/studio/auth/signup" 
            className={`px-6 py-3 rounded-full inline-flex items-center justify-center 
              bg-[#00A3FF]/20 backdrop-blur-sm text-white 
              shadow-lg shadow-[#00A3FF]/20 
              border border-[#00A3FF]/30 
              hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
              transition-all duration-200`}
          >
            Try WeShow Free <RiArrowRightLine className={DESIGN_PATTERNS.ICON.medium} />
          </Link>
        </div>
      </section>

      {/* Why Studios Love WeShow */}
      <section className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-20 px-4`}>
        <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent text-center mb-4`}>
          Why Studios Love WeShow
        </h2>
        <p className={`text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto`}>
          WeShow isn't just another file sharing tool. It's a beautifully designed, ultra-intuitive platform built specifically for studios who care about how they present their work. Here's why creatives choose us:
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <Building2 className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Built for Creatives</h3>
              <p className="text-base text-gray-400">
                Designed for visual studios. No clutter, no noise — just your work looking its best.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <Layout className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Beautiful Client Pages</h3>
              <p className="text-base text-gray-400">
                Impress your clients with clean, branded, read-only project links.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <Upload className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Fast, Simple, Drag & Drop</h3>
              <p className="text-base text-gray-400">
                No training needed. Upload and share in seconds.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <Shield className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Cloud Storage on AWS</h3>
              <p className="text-base text-gray-400">
                Files are stored securely and reliably, backed by Amazon's cloud.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <Download className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Full Downloads for Clients</h3>
              <p className="text-base text-gray-400">
                Clients can download all project assets in full resolution — no friction.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <ImageOff className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Watermarks. Ever.</h3>
              <p className="text-base text-gray-400">
                Your work stays untouched. Your brand stays in focus.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <Mail className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Email Notifications</h3>
              <p className="text-base text-gray-400">
                Keep clients informed automatically when new work is uploaded.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <TrendingUp className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Upgrade When Ready</h3>
              <p className="text-base text-gray-400">
                Start free. Grow your tier with a click, and unlock more power.
              </p>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 hover:border-white/20 transition-all duration-200">
            <div className="p-6">
              <Sparkles className="w-6 h-6 text-[#00A3FF] mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Looks & Feels Premium</h3>
              <p className="text-base text-gray-400">
                Every detail — from fonts to shadows — is crafted to elevate your image.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-b from-black to-gray-900">
        <div className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-20 px-4`}>
          <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent text-center mb-4`}>
            How It Works
          </h2>
          <p className={`text-lg text-gray-400 text-center mb-12 max-w-2xl mx-auto`}>
            A seamless experience from studio setup to project delivery.
          </p>
          
          <div className="space-y-10 max-w-3xl mx-auto">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00A3FF]/20 border border-[#00A3FF]/30 flex items-center justify-center text-white font-bold shadow-lg shadow-[#00A3FF]/20">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#00A3FF]" />
                  Create Your Studio
                </h3>
                <p className="text-base text-gray-400">
                  Sign up and set up your studio page in minutes. Upload your logo, add contact info, and choose your subscription tier (start free or go Pro).
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00A3FF]/20 border border-[#00A3FF]/30 flex items-center justify-center text-white font-bold shadow-lg shadow-[#00A3FF]/20">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#00A3FF]" />
                  Add Clients & Projects
                </h3>
                <p className="text-base text-gray-400">
                  Add a new client, then start uploading their projects. Organize your media into client-specific folders and projects, with titles, descriptions, and images or videos.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00A3FF]/20 border border-[#00A3FF]/30 flex items-center justify-center text-white font-bold shadow-lg shadow-[#00A3FF]/20">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#00A3FF]" />
                  Upload & Showcase Work
                </h3>
                <p className="text-base text-gray-400">
                  Drag and drop your media directly to the cloud – fast, secure, and watermark-free. Clients see exactly what you want them to see, with no distractions.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00A3FF]/20 border border-[#00A3FF]/30 flex items-center justify-center text-white font-bold shadow-lg shadow-[#00A3FF]/20">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-[#00A3FF]" />
                  Share a Beautiful Client Page
                </h3>
                <p className="text-base text-gray-400">
                  Every project has a clean, shareable link your client can access anytime. No logins or confusion – just your work, professionally displayed.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00A3FF]/20 border border-[#00A3FF]/30 flex items-center justify-center text-white font-bold shadow-lg shadow-[#00A3FF]/20">
                5
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Download className="w-5 h-5 text-[#00A3FF]" />
                  Clients Can Download Everything
                </h3>
                <p className="text-base text-gray-400">
                  Your clients can download all their project materials in high quality – instantly, with no limits or complicated steps.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00A3FF]/20 border border-[#00A3FF]/30 flex items-center justify-center text-white font-bold shadow-lg shadow-[#00A3FF]/20">
                6
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00A3FF]" />
                  Grow with Confidence
                </h3>
                <p className="text-base text-gray-400">
                  Need more storage or features? Upgrade your plan anytime to unlock email notifications, more clients, unlimited projects, and advanced tools.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Link 
              href="/studio/auth/signup" 
              className={`px-6 py-3 rounded-full inline-flex items-center justify-center 
                bg-[#00A3FF]/20 backdrop-blur-sm text-white 
                shadow-lg shadow-[#00A3FF]/20 
                border border-[#00A3FF]/30 
                hover:bg-[#00A3FF]/30 hover:shadow-[#00A3FF]/30
                transition-all duration-200`}
            >
              Start Your Studio Free <RiArrowRightLine className={DESIGN_PATTERNS.ICON.medium} />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Clients Prefer WeShow */}
      <section className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-20 px-4`}>
        <h2 className={`text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent text-center mb-4`}>
          Why Clients Love Receiving Projects via WeShow
        </h2>
        <p className={`text-lg text-gray-400 text-center mb-12 max-w-3xl mx-auto`}>
          It's not just easier for studios — it's a game changer for the people you work with.
        </p>
        
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Testimonials */}
          <div className="space-y-8">
            <div className="text-xl md:text-2xl font-medium text-white text-center">
              <p className="mb-2">"It feels like my own gallery of work."</p>
              <p className="text-sm text-gray-400 italic">I never thought a delivery link could feel this good.</p>
            </div>
            
            <div className="text-xl md:text-2xl font-medium text-white text-center">
              <p className="mb-2">"I finally don't need to download 3 zip files to find what I want."</p>
              <p className="text-sm text-gray-400 italic">Everything's right there — clean, clear, and accessible.</p>
            </div>
            
            <div className="text-xl md:text-2xl font-medium text-white text-center">
              <p className="mb-2">"I show these project links to my partners — it's super impressive."</p>
              <p className="text-sm text-gray-400 italic">It actually makes my team look more professional.</p>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-black/40 border border-white/10 text-white hover:border-white/20 transition">
              <RiSmartphoneLine className="w-6 h-6 text-[#00A3FF]" />
              <span>Mobile Friendly</span>
              <span className="text-sm text-gray-400">Works beautifully on any device</span>
            </div>
            
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-black/40 border border-white/10 text-white hover:border-white/20 transition">
              <RiRefreshLine className="w-6 h-6 text-[#00A3FF]" />
              <span>Always Up to Date</span>
              <span className="text-sm text-gray-400">You'll never get an outdated version</span>
            </div>
            
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-black/40 border border-white/10 text-white hover:border-white/20 transition">
              <RiUserUnfollowLine className="w-6 h-6 text-[#00A3FF]" />
              <span>No Login Required</span>
              <span className="text-sm text-gray-400">No barriers, just instant access</span>
            </div>
            
            <div className="flex flex-col items-center text-center gap-2 p-4 rounded-lg bg-black/40 border border-white/10 text-white hover:border-white/20 transition">
              <RiSparkling2Line className="w-6 h-6 text-[#00A3FF]" />
              <span>Feels Premium</span>
              <span className="text-sm text-gray-400">Your work, presented like it deserves</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="border-t border-white/10 mb-10"></div>
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div>
              <Link href="/" className="block mb-4">
                <Logo size="md" />
              </Link>
              <p className="text-gray-400">Deliver your work like it deserves.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-3">
                <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/why-weshow" className="text-gray-400 hover:text-white transition-colors">Why WeShow</Link></li>
                <li><Link href="/compare" className="text-gray-400 hover:text-white transition-colors">Compare Plans</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status Page</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/onboarding" className="text-gray-400 hover:text-white transition-colors">Studio Onboarding Guide</Link></li>
                <li><Link href="/client-guide" className="text-gray-400 hover:text-white transition-colors">Client Experience Guide</Link></li>
                <li><Link href="/feedback" className="text-gray-400 hover:text-white transition-colors">Submit Feedback</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} WeShow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ icon, title, description }) {
  return (
    <div className={DESIGN_PATTERNS.CARD.wrapper}>
      <div className={`${DESIGN_PATTERNS.CARD.inner} text-center p-6`}>
        <div className="mb-4">{icon}</div>
        <h3 className={`text-xl ${DESIGN_PATTERNS.TEXT.heading} mb-3`}>{title}</h3>
        <p className={DESIGN_PATTERNS.TEXT.secondary}>{description}</p>
      </div>
    </div>
  );
}

function Step({ number, title, description }) {
  return (
    <div className={DESIGN_PATTERNS.CARD.wrapper}>
      <div className={`${DESIGN_PATTERNS.CARD.inner} text-center p-6`}>
        <div className={`text-4xl mb-4 ${DESIGN_PATTERNS.TEXT.heading}`}>{number}</div>
        <h3 className={`text-xl ${DESIGN_PATTERNS.TEXT.heading} mb-3`}>{title}</h3>
        <p className={DESIGN_PATTERNS.TEXT.secondary}>{description}</p>
      </div>
    </div>
  );
} 