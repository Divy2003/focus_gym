import React, { useState } from "react";
import "../styles/HomePage.css";

// Dummy data for transformation comparison
const transformations = [
  {
    before:
      "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&w=700&q=60",
    after:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=60",
    details:
      "Samantha lost 18kg in 6 months with dedication and guidance from our trainers!",
  },
  {
    before:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2f2b36?auto=format&fit=crop&w=700&q=60",
    after:
      "https://images.unsplash.com/photo-1517964107959-4f4e36bbf2d6?auto=format&fit=crop&w=700&q=60",
    details:
      "Rahul built muscle and confidence within a year through our strength program.",
  },
];

// Testimonials dummy data
const testimonials = [
  {
    img:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=60",
    text:
      "Testimonials are short quotes from people who love your brand. It's a great way to convince customers to try your services.",
    name: "Donna Bleaker, 31",
  },
  {
    img:
      "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=200&q=60",
    text:
      "Testimonials are short quotes from people who love your brand. It's a great way to convince customers to try your services.",
    name: "Lauren Cross, 28",
  },
  {
    img:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=60",
    text:
      "Testimonials are short quotes from people who love your brand. It's a great way to convince customers to try your services.",
    name: "Thomas Xue, 44",
  },
];

// Transformation pair hover logic
function TransformationPair({ before, after, details }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="transformation-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={hovered ? after : before}
        alt={hovered ? "After" : "Before"}
        className="transformation-image"
        loading="lazy"
      />
      {hovered && (
        <div className="transformation-overlay">
          {details}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* HERO SECTION */}
      <div className="hero">
        <div className="hero-title">
          BE YOUR <span className="hero-accent">BEST</span>
        </div>
        <button className="button-main">Join Today</button>
      </div>

      {/* ABOUT SECTION */}
      <section className="section">
        <div className="section-title">ABOUT OUR FIT FAMILY</div>
        <div className="about-grid">
          <div className="about-text">
            Astraeus was founded in 2001 by a husband and wife team, Bobby and Dora Graff. Since then, we have expanded to over 115 locations nationwide!
            <br />
            <a href="#more" className="learn-more-link">Learn More</a>
          </div>
          <div className="about-images">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=60"
              alt="training"
              width="120"
              height="170"
              loading="lazy"
            />
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=300&q=60"
              alt="rope exercise"
              width="120"
              height="170"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* OFFER SECTION */}
      <section className="section">
        <div className="section-title">WHAT WE OFFER</div>
        <div className="section-desc">
          We're committed to bringing you the best workout experience.
        </div>
        <div className="offer-grid">
          <div className="offer-card">
            <img
              src="https://images.unsplash.com/photo-1571731956672-ac7f1db65d1b?auto=format&fit=crop&w=900&q=60"
              alt="Tour gym"
              loading="lazy"
            />
            <span className="offer-text">TOUR OUR GYM</span>
          </div>
          <div className="offer-card">
            <img
              src="https://images.unsplash.com/photo-1554284126-aa88f22d8b74?auto=format&fit=crop&w=900&q=60"
              alt="Group classes"
              loading="lazy"
            />
            <span className="offer-text">CHECK OUT OUR GROUP CLASSES</span>
          </div>
          <div className="offer-card">
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=60"
              alt="Personal training"
              loading="lazy"
            />
            <span className="offer-text">ASK ABOUT PERSONAL TRAINING</span>
          </div>
        </div>
      </section>

      {/* TRANSFORMATIONS */}
      <section className="section">
        <div className="section-title">TRANSFORMATIONS</div>
        <div className="transformation-grid">
          {transformations.map((t, idx) => (
            <TransformationPair key={idx} {...t} />
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div className="section-title">BEFORE AND AFTER</div>
        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <img src={t.img} alt={`Testimonial ${i+1}`} className="testimonial-avatar" loading="lazy" />
              <div className="testimonial-text">{t.text}</div>
              <div className="testimonial-name">{t.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* GET IN TOUCH */}
      <section className="get-in-touch">
        <div className="get-in-touch-title">GET IN TOUCH TODAY</div>
        <div className="get-in-touch-address">
          Astraeus Gym HQ<br/>
          123 Fitness Ave,<br/>
          Mumbai, MH, 400001<br/>
        </div>
        <div className="get-in-touch-contact">
          Email: info@astraeusgym.com<br/>
          Phone: +91 98765 43210
        </div>
      </section>
    </div>
  );
}
