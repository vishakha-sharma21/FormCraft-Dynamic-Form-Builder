// src/components/AppLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Toaster } from 'react-hot-toast';



// IMPORTANT: Register ScrollTrigger plugin globally before any component uses it
gsap.registerPlugin(ScrollTrigger);


// Initial checks for debugging (keep these)
console.log('GSAP is defined:', typeof gsap !== 'undefined');
console.log('ScrollTrigger is defined:', typeof ScrollTrigger !== 'undefined');


const AppLayout = () => {

  const lenisInstanceRef = useRef(null);
  const animationFrameIdRef = useRef(null); // Ref to store requestAnimationFrame ID

  useEffect(() => {
    // Only proceed if Lenis hasn't been initialized yet
    if (!lenisInstanceRef.current) {
      console.log('Attempting to initialize Lenis...');
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
      });

      lenisInstanceRef.current = lenis; // Store the instance

      // Connect Lenis scroll to ScrollTrigger updates
      lenis.on('scroll', (event) => {
        ScrollTrigger.update(); // Explicitly call ScrollTrigger.update here
      });

      // --- CRITICAL CHANGE: Use native requestAnimationFrame directly ---
      const animate = (time) => {
        lenis.raf(time); // Lenis expects time in milliseconds here, but raf gives performance.now() which is also ms
        animationFrameIdRef.current = requestAnimationFrame(animate); // Recursively call for next frame
      };

      // Start the animation loop
      animationFrameIdRef.current = requestAnimationFrame(animate);

      // Removed gsap.ticker.add and gsap.ticker.lagSmoothing for this test
      // gsap.ticker.lagSmoothing(0);

      console.log('Lenis initialized and integrated with ScrollTrigger via requestAnimationFrame.');


    }

    // Cleanup function: runs when the component unmounts OR when the effect re-runs
    return () => {
      if (lenisInstanceRef.current) {
        console.log('Lenis cleanup initiated...');
        lenisInstanceRef.current.off('scroll', ScrollTrigger.update);

        // Cancel the direct requestAnimationFrame loop
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }

        lenisInstanceRef.current.destroy();
        lenisInstanceRef.current = null;
        animationFrameIdRef.current = null; // Clear the ref
        console.log('Lenis instance destroyed and requestAnimationFrame stopped.');
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return (
    <div className="bg-[#FFFFFF] min-h-screen font-sans">
      <Toaster/>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;