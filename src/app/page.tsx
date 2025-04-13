'use client';

import React from 'react';
import Link from 'next/link';
import { DESIGN_PATTERNS } from './shared/constants/DESIGN_SYSTEM';
import { RiArrowRightLine, RiCheckLine, RiImageLine, RiUploadCloudLine, RiUserSettingsLine, RiPlayCircleLine } from 'react-icons/ri';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className={`min-h-screen ${DESIGN_PATTERNS.COLORS.background} text-white`}>
      {/* Header */}
      <header className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto flex justify-between items-center p-4`}>
        <Link href="/" className="flex items-center">
          <Image 
            src="/images/Weshow-logo-white_300px.webp" 
            alt="WeShow Logo" 
            width={120} 
            height={40} 
            className="object-contain"
          />
        </Link>
        <div className="flex gap-4">
          <Link href="/studio/auth/login" className={DESIGN_PATTERNS.BUTTON.secondary}>Log in</Link>
          <Link href="/studio/auth/signup" className={DESIGN_PATTERNS.BUTTON.primary}>Sign up</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto text-center py-20 px-4`}>
        <h1 className={`text-4xl md:text-6xl ${DESIGN_PATTERNS.TEXT.heading} mb-4`}>
          Present Projects. Impress Clients. Win More Work.
        </h1>
        <p className={`text-lg md:text-xl ${DESIGN_PATTERNS.TEXT.secondary} mb-8`}>
          WeShow is the easiest way for studios to deliver, showcase, and organize visual projects for clients — under one elegant, branded page.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            href="/studio/auth/signup" 
            className={`${DESIGN_PATTERNS.BUTTON.primary} px-6 py-3 rounded-full inline-flex items-center bg-[#00A3FF]/20 backdrop-blur-sm text-white shadow-lg shadow-[#00A3FF]/20 border border-[#00A3FF]/30 hover:bg-[#00A3FF]/30`}
          >
            Get Started – Free Trial <RiArrowRightLine className={DESIGN_PATTERNS.ICON.medium} />
          </Link>
          <button className={`${DESIGN_PATTERNS.BUTTON.secondary} px-6 py-3 rounded-full inline-flex items-center bg-[#00A3FF]/10 backdrop-blur-sm text-white shadow-lg shadow-[#00A3FF]/10 border border-[#00A3FF]/20 hover:bg-[#00A3FF]/20`}>
            <RiPlayCircleLine className={DESIGN_PATTERNS.ICON.medium} /> Watch Demo
          </button>
        </div>
        <div className="mt-10">
          <div className={DESIGN_PATTERNS.CARD.wrapper}>
            <div className={DESIGN_PATTERNS.CARD.inner}>
              <Image src="/device-mockup.png" alt="Device Mockup" width={800} height={400} className="rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Why Studios Love WeShow */}
      <section className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-20 px-4`}>
        <h2 className={`text-2xl md:text-3xl ${DESIGN_PATTERNS.TEXT.heading} text-center mb-12`}>Why Studios Love WeShow</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Feature icon={<RiUserSettingsLine className={`${DESIGN_PATTERNS.ICON.large} text-[#00A3FF]`} />} title="Studio Branded Pages" description="Show your projects under your logo, contact info, and design – like a mini website for each client." />
          <Feature icon={<RiUploadCloudLine className={`${DESIGN_PATTERNS.ICON.large} text-[#00A3FF]`} />} title="Organized Project Management" description="Create clients, upload projects, control access and keep everything neatly in one place." />
          <Feature icon={<RiImageLine className={`${DESIGN_PATTERNS.ICON.large} text-[#00A3FF]`} />} title="Link. Share. Done." description="Forget Dropbox and WeTransfer. Send a branded link your clients love." />
        </div>
      </section>

      {/* How It Works */}
      <section className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-20 px-4`}>
        <h2 className={`text-2xl md:text-3xl ${DESIGN_PATTERNS.TEXT.heading} text-center mb-12`}>How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Step number="1" title="Create Studio Account" description="Add your branding and payment info." />
          <Step number="2" title="Add Clients & Upload Projects" description="Add videos, images, and descriptions under each client." />
          <Step number="3" title="Send Link" description="Clients see their own beautiful page. Nothing to download, no login needed." />
        </div>
      </section>

      {/* Why Clients Prefer WeShow */}
      <section className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-20 px-4`}>
        <h2 className={`text-2xl md:text-3xl ${DESIGN_PATTERNS.TEXT.heading} text-center mb-12`}>Why Clients Prefer WeShow</h2>
        <div className={DESIGN_PATTERNS.CARD.wrapper}>
          <div className={`${DESIGN_PATTERNS.CARD.inner} p-8`}>
            <div className="max-w-3xl mx-auto text-center">
              <p className={`${DESIGN_PATTERNS.TEXT.secondary} mb-4`}>"It feels like my own gallery of work."</p>
              <p className={`${DESIGN_PATTERNS.TEXT.secondary} mb-4`}>"I finally don't need to download 3 zips to find what I want."</p>
              <p className={DESIGN_PATTERNS.TEXT.secondary}>"I show these project links to my partners — it's super impressive."</p>
            </div>
            <ul className="flex flex-wrap justify-center gap-4 mt-8">
              {["Mobile friendly", "Always up to date", "No login", "Feels premium"].map((item, index) => (
                <li key={index} className={`${DESIGN_PATTERNS.TEXT.secondary} flex items-center gap-2`}>
                  <RiCheckLine className={`${DESIGN_PATTERNS.ICON.small} text-[#00A3FF]`} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`${DESIGN_PATTERNS.LAYOUT.maxWidth} mx-auto py-8 px-4 text-center`}>
        <p className={DESIGN_PATTERNS.TEXT.secondary}>TRUSTED BY TEAMS FROM AROUND THE WORLD</p>
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {["google", "microsoft", "github", "uber", "notion"].map((company) => (
            <div key={company} className={DESIGN_PATTERNS.CARD.wrapper}>
              <div className={DESIGN_PATTERNS.CARD.inner}>
                <Image src={`/${company}.svg`} alt={company} width={50} height={50} className="p-2" />
              </div>
            </div>
          ))}
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