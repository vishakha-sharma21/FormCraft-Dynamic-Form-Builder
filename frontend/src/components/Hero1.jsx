import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(SplitText);

const Hero1 = () => {
  const textRef = useRef(null);
  const spanRef = useRef(null);
  const headlineRef = useRef(null);
  const lineRef = useRef(null);
  const pRef = useRef(null);
  const navigate = useNavigate();

  function handleClick() {
    navigate('/signin');
  }

  useEffect(() => {
    let split1, split2;
    
    let ctx = gsap.context(() => {
      if (textRef.current && spanRef.current) {
        split1 = new SplitText(textRef.current, { type: 'words' });
        split2 = new SplitText(spanRef.current, { type: 'words' });

        gsap.set(split2.words, {
          color: 'transparent',
          backgroundImage: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
        });

        const tl = gsap.timeline();
        tl.from(split1.words, {
          y: 100,
          opacity: 0,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        })
          .from(
            split2.words,
            {
              y: 100,
              opacity: 0,
              stagger: 0.1,
              ease: 'back.out(1.7)',
            },
            '-=0.3'
          )
          .from(
            pRef.current,
            {
              y: 40,
              opacity: 0,
              duration: 1,
              ease: 'power2.out',
            },
            '-=0.5'
          )
          .from(
            lineRef.current,
            {
              width: 0,
              duration: 1,
              ease: 'power2.out',
            },
            '-=0.5'
          );
      }
    }, headlineRef);

    return () => {
      // Revert SplitText first
      if (split1) split1.revert();
      if (split2) split2.revert();
      // Then revert GSAP context
      ctx.revert();
    };
  }, []);

  return (
    <section className="text-center py-24 md:py-32 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl text-gray-700 font-medium mb-4">
          Welcome to <span className="text-blue-600 font-semibold">FormCraft</span>
        </h2>

        <div className="inline-block px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full mb-6 shadow-sm">
          ✨ AI-Powered Form Builder
        </div>

        <h1
          ref={headlineRef}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-8"
        >
          <span ref={textRef}>Build Dynamic Forms in</span>{' '}
          <span ref={spanRef} className="inline-block">
            Seconds
          </span>
        </h1>

        <p
          ref={pRef}
          className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-4"
        >
          Simply describe the form you need, and our AI will generate a fully
          functional, customizable form with validation, styling, and
          integrations.
        </p>

        <br />
        <div
          ref={lineRef}
          className="h-1 w-32 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto rounded-full mb-8"
        ></div>

        <div className="flex justify-center mt-6">
          <button 
            onClick={handleClick} 
            className="text-sm px-6 py-3 text-white font-medium bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg hover:scale-105 transition-transform duration-300"
          >
            Start Building Free →
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero1;