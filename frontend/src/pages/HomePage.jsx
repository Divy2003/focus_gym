import React, { useState, useEffect } from 'react';
import { Menu, X, Dumbbell, Users, Trophy, Star, ArrowRight, Play, CheckCircle, Phone, Mail, MapPin, Clock, X as Close } from 'lucide-react';
import '../styles/HomePage.css';

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Dummy transformation data
  const transformations = [
    {
      id: 1,
      name: "Sarah Johnson",
      beforeImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face",
      afterImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&crop=face",
      duration: "6 months",
      weightLost: "25 lbs"
    },
    {
      id: 2,
      name: "Mike Chen",
      beforeImage: "https://images.unsplash.com/photo-1592621385612-4d7129426394?w=400&h=500&fit=crop&crop=face",
      afterImage: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=500&fit=crop&crop=face",
      duration: "8 months",
      weightLost: "40 lbs"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      beforeImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop&crop=face",
      afterImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop&crop=face",
      duration: "4 months",
      weightLost: "18 lbs"
    }
  ];

  const features = [
    {
      icon: <Dumbbell className="icon" />,
      title: "Modern Equipment",
      description: "State-of-the-art fitness equipment for all your workout needs"
    },
    {
      icon: <Users className="icon" />,
      title: "Expert Trainers",
      description: "Certified personal trainers to guide your fitness journey"
    },
    {
      icon: <Star className="icon" />,
      title: "Personalized Plans",
      description: "Get tailored workout plans based on your goals and fitness level"
    }
  ];

  const testimonials = [
    {
      id: 1,
      name: "Alex Thompson",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "Best gym experience ever! The trainers are amazing and the facilities are top-notch."
    },
    {
      id: 2,
      name: "Jessica Lee",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "I've never felt stronger and more confident. This gym changed my life completely!"
    },
    {
      id: 3,
      name: "David Miller",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 5,
      text: "The community here is incredible. Everyone supports each other's fitness goals."
    }
  ];

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className="homepage">
      {selectedImage && (
        <div className="image-modal" onClick={closeImageModal}>
          <button className="close-modal" onClick={(e) => e.stopPropagation()}>
            <Close size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo */}
          <a href="#" className="logo">
            <Dumbbell className="logo-icon" />
            <span className="logo-text gradient-text">FOCUS</span>
          </a>
          
          {/* Desktop Menu */}
          <div className="nav-menu">
            <a href="#" className="btn-primary-nav">Join Today</a>
          </div>

          {/* Mobile menu button */}
          <button 
            className="nav-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <a href="#" className="btn-primary">Join Today</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-image"></div>
        
        <div className="container">
          <div className={`hero-content ${isVisible ? 'fade-in-up' : ''}`}>
            <h1 className="hero-title">
              Transform Your
              <span className="gradient-text"> Body & Mind</span>
            </h1>
            <p className="hero-subtitle">
              Join thousands who've discovered their strongest selves. Premium equipment, expert trainers, and a community that pushes you to greatness.
            </p>
            <div className="hero-buttons">
              <a href="#" className="btn-primary">
                Start Your Journey
                <ArrowRight />
              </a>
              
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="floating-element floating-1"></div>
        <div className="floating-element floating-2"></div>
      </section>

      {/* Features Section */}
      <section className="features section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              What We <span className="gradient-text">Provide </span>?
            </h2>
            <p className="section-description">
              We provide everything you need to achieve your fitness goals
            </p>
          </div>
          
          <div className="grid-3">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformation Section */}
      <section className="transformations section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Amazing <span className="gradient-text">Transformations</span>
            </h2>
            <p className="section-description">
              Real people, real results. See how our members transformed their lives
            </p>
          </div>

          <div className="grid-3">
            {transformations.map((transformation) => (
              <div key={transformation.id} className="transformation-card">
                <div className="transformation-images">
                  <div className="image-container" onClick={() => openImageModal(transformation.beforeImage)}>
                    <img 
                      src={transformation.beforeImage} 
                      alt={`${transformation.name} before`}
                      className="transformation-image"
                    />
                    <div className="image-label before-label">Before</div>
                  </div>
                  <div className="image-container" onClick={() => openImageModal(transformation.afterImage)}>
                    <img 
                      src={transformation.afterImage} 
                      alt={`${transformation.name} after`}
                      className="transformation-image"
                    />
                    <div className="image-label after-label">After</div>
                  </div>
                </div>
                
                <div className="transformation-info">
                  <h3 className="transformation-name">{transformation.name}</h3>
                  <div className="transformation-stats">
                    <span>{transformation.duration}</span>
                    <span className="weight-loss">-{transformation.weightLost}</span>
                  </div>
                  <div className="achievement">
                    <CheckCircle size={16} />
                    <span>Goal Achieved</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              What Our <span className="gradient-text">Members Say</span>
            </h2>
          </div>

          <div className="grid-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-header">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div>
                    <h3 className="testimonial-name">{testimonial.name}</h3>
                    <div className="testimonial-rating">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta section-padding">
        <div className="container">
          <h2 className="cta-title">
            Ready to Start Your Transformation?
          </h2>
          <p className="cta-description">
            Join FITPRO today and become the best version of yourself
          </p>
          <a href="#" className="cta-button">
            Join Today - Limited Time Offer
          </a>
          <p className="cta-disclaimer">No commitment required • Cancel anytime</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact section-padding">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">
              Get In <span className="gradient-text">Touch</span>
            </h2>
            <p className="section-description">
              Ready to start your fitness journey? Contact us today!
            </p>
          </div>

          <div className="contact-content">
            <div className="contact-item">
              <Phone size={24} color="var(--primary-red)" />
              <h3>Call Us</h3>
              <p>
                <a href="tel:+1234567890">+1 (234) 567-8900</a><br />
                <a href="tel:+1234567891">+1 (234) 567-8901</a>
              </p>
            </div>

            <div className="contact-item">
              <Mail size={24} color="var(--primary-red)" />
              <h3>Email Us</h3>
              <p>
                <a href="mailto:info@fitprogym.com">info@fitprogym.com</a><br />
                <a href="mailto:support@fitprogym.com">support@fitprogym.com</a>
              </p>
            </div>

            <div className="contact-item">
              <MapPin size={24} color="var(--primary-red)" />
              <h3>Visit Us</h3>
              <p>
                123 Fitness Street<br />
                Health District, FIT 12345<br />
                United States
              </p>
            </div>

            <div className="contact-item">
              <Clock size={24} color="var(--primary-red)" />
              <h3>Opening Hours</h3>
              <p>
                Monday - Friday: 5:00 AM - 11:00 PM<br />
                Saturday - Sunday: 6:00 AM - 10:00 PM<br />
                Holidays: 8:00 AM - 8:00 PM
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="logo">
              <Dumbbell className="logo-icon" />
              <span className="logo-text gradient-text">FITPRO</span>
            </div>
            <p className="footer-text">
              © 2024 FITPRO. All rights reserved. Transform your life today.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;