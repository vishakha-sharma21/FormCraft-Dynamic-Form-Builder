import { FiZap, FiUsers, FiShield } from "react-icons/fi";
import React, { useRef, useEffect, forwardRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./Features.css";

gsap.registerPlugin(ScrollTrigger);

// Reusable animated card component
const FeatureCard1 = forwardRef(
  ({ id, icon, title, children, backgroundColor = "bg-blue-100" }, ref) => (
    <div id={id} className="card" ref={ref}>
      <div className="card-wrapper">
        <div className="flip-card-inner">
          <div className="flip-card-front">
            <div className="front-content">
              <div className="card-icon">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 text-blue-500 ${backgroundColor} rounded-full`}
                >
                  {icon}
                </div>
              </div>
              <div className="card-title-front">
                <h3>{title}</h3>
              </div>
            </div>
          </div>
          <div className="flip-card-back">
            <div className="card-icon">
              <div
                className={`inline-flex items-center justify-center w-16 h-16 text-blue-500 ${backgroundColor} rounded-full`}
              >
                {icon}
              </div>
            </div>
            <div className="card-title-clean">
              <h3>{title}</h3>
            </div>
            <div className="card-description-clean">
              <p>{children}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
);

const Features = () => {
  const servicesSectionRef = useRef(null);
  const servicesHeaderRef = useRef(null);
  const cardsSectionRef = useRef(null);
  const serviceCardRefs = useRef([]);

  const smoothStep = (p) => p * p * (3 - 2 * p);

  useEffect(() => {
    const cards = gsap.utils.toArray(serviceCardRefs.current);
    if (!cards.length || !servicesHeaderRef.current || !cardsSectionRef.current)
      return;

    gsap.set(cards, { opacity: 0, y: "100%" });
    gsap.set(servicesHeaderRef.current, { y: "400%" });

    const scrollTrigger1 = ScrollTrigger.create({
      trigger: cardsSectionRef.current,
      start: "top bottom",
      end: "top top",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const headerY = gsap.utils.interpolate(
          "400%",
          "0%",
          smoothStep(progress)
        );
        gsap.set(servicesHeaderRef.current, { y: headerY });

        cards.forEach((card, index) => {
          if (!card) return;
          const innerCard = card.querySelector(".flip-card-inner");
          if (!innerCard) return;

          const staggerDelay = index * 0.15;
          const animationDuration = 0.7;
          const rawCardProgress = (progress - staggerDelay) / animationDuration;
          const cardProgress = gsap.utils.clamp(0, 1, rawCardProgress);

          const y = gsap.utils.interpolate(
            "100%",
            "0%",
            smoothStep(cardProgress)
          );
          const scale =
            cardProgress < 0.5
              ? gsap.utils.interpolate(0.5, 1, smoothStep(cardProgress * 2))
              : 1;
          const opacity = smoothStep(cardProgress);

          const flipStart = 0.8;
          const flipDuration = 1 - flipStart;
          const easeInOutCubic = (t) =>
            t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
          const rotationY =
            cardProgress > flipStart
              ? 180 *
                easeInOutCubic(
                  Math.min((cardProgress - flipStart) / flipDuration, 1)
                )
              : 0;

          const x = index === 0 ? "10%" : index === 1 ? "0%" : "-10%";

          gsap.set(card, { opacity, y, x, scale });
          gsap.set(innerCard, { rotationY });
        });
      },
    });

    const scrollTrigger2 = ScrollTrigger.create({
      trigger: servicesSectionRef.current,
      start: "top top",
      end: "+=100vh",
      pin: true,
      pinSpacing: true,
      pinType: "transform", // ✅ FIX: prevent removeChild error on DOM transition
      scrub: true,
    });

    return () => {
      scrollTrigger1.kill();
      scrollTrigger2.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); // ✅ FULL CLEANUP
      gsap.killTweensOf("*");
    };
  }, []);

  return (
    <section className="services" >
      <div ref={servicesSectionRef}>
        <div ref={servicesHeaderRef} className="services-header">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Why Choose FormCraft?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our dynamic form builder combines the power of AI with intuitive
            design to create forms that work perfectly for your needs.
          </p>
        </div>
        <section ref={cardsSectionRef} className="cards">
          <div className="card-container">
            <FeatureCard1
              ref={(el) => (serviceCardRefs.current[0] = el)}
              id="card-1"
              icon={<FiZap size={24} />}
              title="Lightning Fast"
              backgroundColor="bg-blue-100"
            >
              Generate forms in seconds with AI-powered suggestions.
            </FeatureCard1>
            <FeatureCard1
              ref={(el) => (serviceCardRefs.current[1] = el)}
              id="card-2"
              icon={<FiUsers size={24} />}
              title="User Friendly"
              backgroundColor="bg-blue-100"
            >
              Intuitive drag-and-drop interface for easy customization.
            </FeatureCard1>
            <FeatureCard1
              ref={(el) => (serviceCardRefs.current[2] = el)}
              id="card-3"
              icon={<FiShield size={24} />}
              title="Secure & Reliable"
              backgroundColor="bg-blue-100"
            >
              Built-in validation and security features.
            </FeatureCard1>
          </div>
        </section>
      </div>
    </section>
  );
};

export default Features;
