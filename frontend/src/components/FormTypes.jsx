import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// This is a helper component used by FormTypes.
const FormTypeCard = ({ title, index }) => (
  <div 
    className="form-card bg-white p-6 rounded-xl shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow opacity-0 transform translate-y-8"
    data-index={index}
  >
    <div className="card-icon inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg transform scale-0">
      {/* You can dynamically change this icon if you want */}
      <span className="text-2xl font-bold text-white">{title.charAt(0)}</span>
    </div>
    <h3 className="card-title font-semibold text-gray-700 opacity-0 transform translate-y-4">{title}</h3>
  </div>
);

// This is the main component to be exported.
const FormTypes = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const cardsRef = useRef(null);
  const buttonRef = useRef(null);

  const types = [
    "Contact Forms", "Registration Forms", "Survey Forms",
    "Order Forms", "Feedback Forms", "Application Forms"
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(titleRef.current, 
        {
          opacity: 0,
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: titleRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Subtitle animation
      gsap.fromTo(subtitleRef.current,
        {
          opacity: 0,
          y: 30
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: subtitleRef.current,
            start: "top 85%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Cards container animation
      const cards = gsap.utils.toArray('.form-card');
      
      cards.forEach((card, index) => {
        const cardIcon = card.querySelector('.card-icon');
        const cardTitle = card.querySelector('.card-title');
        
        // Main card animation
        gsap.fromTo(card,
          {
            opacity: 0,
            y: 60,
            scale: 0.8,
            rotationY: 15
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.8,
            delay: index * 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Icon animation
        gsap.fromTo(cardIcon,
          {
            scale: 0,
            rotation: -180
          },
          {
            scale: 1,
            rotation: 0,
            duration: 0.6,
            delay: (index * 0.1) + 0.3,
            ease: "back.out(2)",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Title animation
        gsap.fromTo(cardTitle,
          {
            opacity: 0,
            y: 20
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: (index * 0.1) + 0.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 90%",
              end: "bottom 20%",
              toggleActions: "play none none reverse"
            }
          }
        );

        // Hover animations
        card.addEventListener('mouseenter', () => {
          gsap.to(card, {
            y: -10,
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          });
          gsap.to(cardIcon, {
            rotation: 10,
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out"
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to(card, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
          gsap.to(cardIcon, {
            rotation: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
        });
      });

      // Button animation
      gsap.fromTo(buttonRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: 0.6,
          ease: "power3.out",
          scrollTrigger: {
            trigger: buttonRef.current,
            start: "top 95%",
            end: "bottom 20%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Parallax effect for the entire section
      gsap.to(sectionRef.current, {
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      });

    }, sectionRef);

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 opacity-50"></div>
      <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-purple-200 to-blue-200 rounded-full opacity-20 blur-xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full opacity-20 blur-xl"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 
            ref={titleRef}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Form Types We Support
          </h2>
          <p 
            ref={subtitleRef}
            className="text-lg text-gray-600"
          >
            From simple contact forms to complex multi-step wizards, we can generate any type of form you need.
          </p>
        </div>
        
        <div 
          ref={cardsRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {types.map((type, index) => (
            <FormTypeCard key={type} title={type} index={index} />
          ))}
        </div>
        
        <div className="text-center mt-8">
          <a
            ref={buttonRef}
            href="/example"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:text-white transition-all duration-300 shadow-sm relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center">
              Explore Example Forms
              <svg className="ml-2 -mr-1 w-5 h-5 relative z-10" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default FormTypes;