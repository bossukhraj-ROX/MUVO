import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ClipboardCheck, FileDown, ArrowRight, Shield, CircleCheck as CheckCircle2, TriangleAlert as AlertTriangle, Image as ImageIcon, PoundSterling, Mail, FileText, Layers } from 'lucide-react';
import Reveal from '../components/Reveal';
import Accordion from '../components/Accordion';
import { useProject } from '../lib/projectContext';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { project, loadDemo } = useProject();
  const heroVisualRef = useRef<HTMLDivElement>(null);

  function startProject() {
    if (project) {
      navigate('/app');
    } else {
      navigate('/setup');
    }
  }

  function exploreDemo() {
    loadDemo();
    navigate('/app');
  }

  // Subtle perspective tilt on pointer move (desktop only)
  useEffect(() => {
    const el = heroVisualRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none)').matches) return;

    function onMove(e: MouseEvent) {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
    }
    function onLeave() {
      if (!el) return;
      el.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    }
    const parent = el.parentElement;
    if (parent) {
      parent.addEventListener('mousemove', onMove);
      parent.addEventListener('mouseleave', onLeave);
      return () => {
        parent.removeEventListener('mousemove', onMove);
        parent.removeEventListener('mouseleave', onLeave);
      };
    }
  }, []);

  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="container-wide landing-nav-inner">
          <a href="/" className="wordmark" aria-label="MUVO home">
            MUVO
          </a>
          <div className="landing-nav-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/setup')}>
              Start
            </button>
            <button className="btn btn-primary btn-sm" onClick={exploreDemo}>
              Try demo
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container-wide hero-grid">
          <div className="hero-text">
            <span className="hero-eyebrow animate-fade-up">The move-out deposit toolkit</span>
            <h1 className="display-xl hero-headline animate-fade-up" style={{ animationDelay: '0.08s' }}>
              Moving out?
              <br />
              <span className="hero-headline-accent">Get your evidence together.</span>
            </h1>
            <p className="text-body-lg hero-sub animate-fade-up" style={{ animationDelay: '0.16s' }}>
              Keep your property photos, inspection notes and deposit records organised in one place before you hand back the keys.
            </p>
            <div className="hero-cta animate-fade-up" style={{ animationDelay: '0.24s' }}>
              <button className="btn btn-primary btn-lg" onClick={startProject}>
                Build my evidence pack
                <ArrowRight size={18} />
              </button>
              <a href="#how-it-works" className="btn btn-ghost btn-lg">
                See how it works
              </a>
            </div>
            <div className="hero-meta animate-fade-up" style={{ animationDelay: '0.32s' }}>
              <Shield size={16} />
              <span>No account needed. Data stays in your browser.</span>
            </div>
          </div>

          {/* 3D Hero visual */}
          <div className="hero-visual-wrapper" ref={heroVisualRef}>
            <div className="hero-visual">
              {/* Floating report card */}
              <div className="hero-card hero-card-report float-anim">
                <div className="hero-card-header">
                  <div className="hero-card-dot" />
                  <div className="hero-card-dot" />
                  <div className="hero-card-dot" />
                  <span className="hero-card-title">Inspection Report</span>
                </div>
                <div className="hero-card-body">
                  <div className="hero-report-row">
                    <span className="hero-report-label">Entrance & hallway</span>
                    <span className="badge badge-good">Good</span>
                  </div>
                  <div className="hero-report-row">
                    <span className="hero-report-label">Living room</span>
                    <span className="badge badge-warn">Attention</span>
                  </div>
                  <div className="hero-report-row">
                    <span className="hero-report-label">Bedroom</span>
                    <span className="badge badge-neutral">Not checked</span>
                  </div>
                  <div className="hero-report-row">
                    <span className="hero-report-label">Kitchen</span>
                    <span className="badge badge-good">Good</span>
                  </div>
                  <div className="hero-report-progress">
                    <div className="hero-report-progress-bar">
                      <div className="hero-report-progress-fill" style={{ width: '62%' }} />
                    </div>
                    <span className="hero-report-progress-text">62% complete</span>
                  </div>
                </div>
              </div>

              {/* Photo tiles */}
              <div className="hero-card hero-card-photo hero-card-photo-1 float-anim-slow">
                <div className="hero-photo-tile hero-photo-tile-1">
                  <Camera size={20} />
                  <span>Hallway carpet</span>
                </div>
              </div>
              <div className="hero-card hero-card-photo hero-card-photo-2 float-anim-slow" style={{ animationDelay: '1s' }}>
                <div className="hero-photo-tile hero-photo-tile-2">
                  <Camera size={20} />
                  <span>Kitchen seal</span>
                </div>
              </div>

              {/* Deduction summary */}
              <div className="hero-card hero-card-deduction float-anim" style={{ animationDelay: '2s' }}>
                <div className="hero-deduction-header">
                  <PoundSterling size={16} />
                  <span>Deductions tracked</span>
                </div>
                <div className="hero-deduction-amount">£306.50</div>
                <div className="hero-deduction-tag">
                  <span className="badge badge-error">1 disputed</span>
                  <span className="badge badge-warn">1 awaiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <Reveal>
            <p className="section-eyebrow">How it works</p>
            <h2 className="display-lg section-title">Three steps to an organised move-out</h2>
          </Reveal>
          <div className="how-grid">
            <Reveal delay={1}>
              <div className="how-card">
                <div className="how-icon">
                  <ClipboardCheck size={28} />
                </div>
                <span className="how-number">01</span>
                <h3 className="display-sm">Document your space</h3>
                <p className="text-body">Work through a room-by-room inspection and add photos and notes for each area.</p>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div className="how-card">
                <div className="how-icon">
                  <Layers size={28} />
                </div>
                <span className="how-number">02</span>
                <h3 className="display-sm">Organise your evidence</h3>
                <p className="text-body">Keep condition records and potential deductions together in one structured pack.</p>
              </div>
            </Reveal>
            <Reveal delay={3}>
              <div className="how-card">
                <div className="how-icon">
                  <FileDown size={28} />
                </div>
                <span className="how-number">03</span>
                <h3 className="display-sm">Export your report</h3>
                <p className="text-body">Create a structured document you can keep, print and share with your landlord or agent.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="section section-preview">
        <div className="container-wide">
          <Reveal>
            <p className="section-eyebrow">Product preview</p>
            <h2 className="display-lg section-title">See what your evidence pack looks like</h2>
            <p className="text-body-lg section-sub">A live preview of an in-progress inspection with demo data.</p>
          </Reveal>
          <Reveal delay={1}>
            <div className="preview-mockup">
              <div className="preview-mockup-header">
                <div className="preview-mockup-title">
                  <FileText size={18} />
                  <span>Flat 4B — Elm Street</span>
                </div>
                <span className="badge badge-mint">Demo project</span>
              </div>
              <div className="preview-mockup-body">
                <div className="preview-sidebar">
                  <div className="preview-sidebar-item active">
                    <Camera size={16} />
                    <span>Entrance & hallway</span>
                    <span className="badge badge-good">5/6</span>
                  </div>
                  <div className="preview-sidebar-item">
                    <Camera size={16} />
                    <span>Living room</span>
                    <span className="badge badge-warn">4/6</span>
                  </div>
                  <div className="preview-sidebar-item">
                    <Camera size={16} />
                    <span>Bedroom</span>
                    <span className="badge badge-neutral">4/6</span>
                  </div>
                  <div className="preview-sidebar-item">
                    <Camera size={16} />
                    <span>Kitchen</span>
                    <span className="badge badge-warn">4/6</span>
                  </div>
                  <div className="preview-sidebar-item">
                    <Camera size={16} />
                    <span>Bathroom</span>
                    <span className="badge badge-good">4/6</span>
                  </div>
                </div>
                <div className="preview-main">
                  <div className="preview-room-header">
                    <h3 className="display-sm">Entrance and hallway</h3>
                    <span className="text-sm">5 of 6 items checked</span>
                  </div>
                  <div className="preview-items">
                    <div className="preview-item">
                      <div className="preview-item-status">
                        <CheckCircle2 size={18} className="text-success" />
                      </div>
                      <div className="preview-item-content">
                        <span className="preview-item-label">Walls and paintwork</span>
                        <span className="text-sm">Walls clean, no new marks.</span>
                      </div>
                      <span className="badge badge-good">Good</span>
                    </div>
                    <div className="preview-item">
                      <div className="preview-item-status">
                        <AlertTriangle size={18} className="text-warn" />
                      </div>
                      <div className="preview-item-content">
                        <span className="preview-item-label">Flooring and carpets</span>
                        <span className="text-sm">Carpet has a small frayed edge near the door threshold.</span>
                      </div>
                      <span className="badge badge-warn">Attention</span>
                    </div>
                    <div className="preview-item">
                      <div className="preview-item-status">
                        <ImageIcon size={18} className="text-error" />
                      </div>
                      <div className="preview-item-content">
                        <span className="preview-item-label">Visible damage</span>
                        <span className="text-sm">Pre-existing scuff on skirting board noted in original inventory.</span>
                      </div>
                      <span className="badge badge-error">Pre-existing</span>
                    </div>
                  </div>
                  <div className="preview-deduction">
                    <div className="preview-deduction-header">
                      <PoundSterling size={16} />
                      <span>Deduction record</span>
                    </div>
                    <div className="preview-deduction-body">
                      <div>
                        <span className="preview-deduction-label">Description</span>
                        <span className="preview-deduction-value">Carpet replacement — hallway</span>
                      </div>
                      <div>
                        <span className="preview-deduction-label">Amount</span>
                        <span className="preview-deduction-value preview-deduction-amount">£180.00</span>
                      </div>
                      <div>
                        <span className="preview-deduction-label">Status</span>
                        <span className="badge badge-error">Disputed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
          <div className="preview-cta">
            <button className="btn btn-primary btn-lg" onClick={exploreDemo}>
              Explore the demo
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section">
        <div className="container">
          <Reveal>
            <p className="section-eyebrow">Why MUVO</p>
            <h2 className="display-lg section-title">Practical help for a stressful moment</h2>
          </Reveal>
          <div className="benefits-grid">
            <Reveal delay={1}>
              <div className="benefit-card">
                <Layers size={24} />
                <h3>Keep evidence organised</h3>
                <p>Photos, notes and records in one place — not scattered across phone albums and text messages.</p>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div className="benefit-card">
                <ClipboardCheck size={24} />
                <h3>Remember what's left</h3>
                <p>See which rooms and items still need checking before your inspection is complete.</p>
              </div>
            </Reveal>
            <Reveal delay={3}>
              <div className="benefit-card">
                <Camera size={24} />
                <h3>Record condition clearly</h3>
                <p>Document existing damage and the state of each area with photos and written notes.</p>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="benefit-card">
                <PoundSterling size={24} />
                <h3>Track deductions</h3>
                <p>Keep proposed deductions, explanations and your responses together in one tracker.</p>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div className="benefit-card">
                <Mail size={24} />
                <h3>Prepare correspondence</h3>
                <p>Generate polite, factual email drafts using the information you've already entered.</p>
              </div>
            </Reveal>
            <Reveal delay={3}>
              <div className="benefit-card">
                <FileDown size={24} />
                <h3>Export your report</h3>
                <p>Create a structured, printable evidence report for your own records or to share.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-faq">
        <div className="container-narrow">
          <Reveal>
            <p className="section-eyebrow">FAQ</p>
            <h2 className="display-lg section-title">Common questions</h2>
          </Reveal>
          <Reveal delay={1}>
            <Accordion
              items={[
                {
                  question: 'What does MUVO help me do?',
                  answer: (
                    <p>
                      MUVO helps you document your property's condition, organise photos and notes, track proposed deposit deductions, prepare factual email drafts and export an evidence report — all in one place before you move out.
                    </p>
                  ),
                },
                {
                  question: 'Is my information stored privately?',
                  answer: (
                    <p>
                      Yes. Your project data is stored locally in your browser using IndexedDB. Nothing is uploaded to a cloud server. If you clear your browser data or lose your device, your data may be lost — you can export a backup JSON file from Settings to keep a copy.
                    </p>
                  ),
                },
                {
                  question: 'Can MUVO guarantee my deposit will be returned?',
                  answer: (
                    <p>
                      No. MUVO is an independent evidence-organising tool. It does not provide legal advice, cannot determine legal responsibility automatically, and cannot guarantee the return of a deposit. Deposit procedures may vary across England, Wales, Scotland and Northern Ireland.
                    </p>
                  ),
                },
                {
                  question: 'How do I export my evidence report?',
                  answer: (
                    <p>
                      Open your project, go to the Report section, and use the "Print or save as PDF" button. Your browser's print dialog will let you save the report as a PDF file. The report contains your actual project data — inspection notes, photos, deductions and completion summary.
                    </p>
                  ),
                },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="final-cta-bg">
          <div className="final-cta-visual">
            <div className="final-cta-card float-anim">
              <FileText size={32} />
            </div>
            <div className="final-cta-card final-cta-card-2 float-anim-slow">
              <Camera size={28} />
            </div>
          </div>
        </div>
        <div className="container-narrow final-cta-content">
          <Reveal>
            <h2 className="display-xl final-cta-headline">
              A calmer move starts<br />with a clear record.
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <button className="btn btn-light btn-lg" onClick={startProject}>
              Create my evidence pack
              <ArrowRight size={18} />
            </button>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container-wide site-footer-inner">
          <div className="footer-left">
            <span className="wordmark wordmark-sm">MUVO</span>
            <span className="footer-disclaimer text-xs">
              Independent evidence-organising tool. Not a government service, deposit protection scheme or law firm. Does not provide legal advice. Deposit procedures vary across the UK.
            </span>
          </div>
          <nav className="footer-nav">
            <a href="#how-it-works">How it works</a>
            <button onClick={() => navigate('/setup')}>Start a project</button>
            <button onClick={exploreDemo}>Demo</button>
            <a href="/privacy">Privacy</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
