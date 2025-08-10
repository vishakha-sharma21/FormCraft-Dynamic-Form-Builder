import { useNavigate } from "react-router-dom";

import { useState, useEffect, useRef } from "react";

import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import Loading from "./Loading";

import FormTypes from "./FormTypes";

// Register ScrollTrigger plugin

gsap.registerPlugin(ScrollTrigger);

const InputQuery = () => {
  const navigate = useNavigate();

  const [formDescription, setFormDescription] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(""); // Refs for GSAP animations

  const containerRef = useRef(null);

  const titleRef = useRef(null);

  const subtitleRef = useRef(null);

  const formRef = useRef(null);

  const examplesRef = useRef(null);

  const exampleButtonsRef = useRef([]);

  const examplePrompts = [
    "Contact form with name, email, and message",

    "Job application form with file upload",

    "Event registration with multiple attendees",

    "Customer feedback survey",

    "Product order form with payment",

    "Newsletter signup with preferences",
  ]; // GSAP ScrollTrigger animations

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states

      gsap.set(
        [
          titleRef.current,

          subtitleRef.current,

          formRef.current,

          examplesRef.current,
        ],

        {
          opacity: 0,

          y: 50,
        }
      );

      gsap.set(exampleButtonsRef.current, {
        opacity: 0,

        y: 30,

        scale: 0.8,
      }); // Create timeline

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,

          start: "top 80%",

          end: "bottom 20%",

          toggleActions: "play none none reverse",
        },
      }); // Animate elements in sequence

      tl.to(titleRef.current, {
        opacity: 1,

        y: 0,

        duration: 0.8,

        ease: "power2.out",
      })

        .to(
          subtitleRef.current,

          {
            opacity: 1,

            y: 0,

            duration: 0.6,

            ease: "power2.out",
          },

          "-=0.4"
        )

        .to(
          formRef.current,

          {
            opacity: 1,

            y: 0,

            duration: 0.8,

            ease: "power2.out",
          },

          "-=0.3"
        )

        .to(
          examplesRef.current,

          {
            opacity: 1,

            y: 0,

            duration: 0.6,

            ease: "power2.out",
          },

          "-=0.2"
        )

        .to(
          exampleButtonsRef.current,

          {
            opacity: 1,

            y: 0,

            scale: 1,

            duration: 0.5,

            ease: "back.out(1.7)",

            stagger: 0.1,
          },

          "-=0.1"
        );
    }, containerRef);

    return () => ctx.revert(); // Cleanup
  }, []);

  const handleGenerateForm = async () => {
    if (!formDescription.trim()) {
      setError("Please describe the form you want to generate.");

      return;
    }

    setLoading(true);

    setError("");

    navigate("/loading", {
      state: { formDescription },
    });
  };

  const handleExampleClick = (prompt) => {
    setFormDescription(prompt);
  };

  return (
    <>
            {/* Main Form Input Area */}     {" "}
      <section ref={containerRef} className="text-center py-8 md:py-12 px-4">
               {" "}
        <h2 ref={titleRef} className="text-2xl font-bold mb-2">
                      Let's build your custom form          {" "}
        </h2>
               {" "}
        <div className="mt-10 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                             {" "}
          <p className="text-left font-semibold text-gray-700">
                        What kind of form do you need?          {" "}
          </p>
                   {" "}
          <p ref={subtitleRef} className="text-left text-sm text-gray-500 mb-2">
                        Describe your form requirements and we'll generate it
            for you          {" "}
          </p>
                   {" "}
          <textarea
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
            rows="3"
            placeholder="e.g., A contact form with name, email, phone number, and a message field. Include validation and a submit button."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            disabled={loading}
          ></textarea>
                    {/* Error Message Display */}         {" "}
          {error && (
            <p className="mt-2 text-sm text-left font-medium text-red-600">
                            {error}           {" "}
            </p>
          )}
                   {" "}
          <button
            onClick={handleGenerateForm}
            disabled={!formDescription.trim() || loading}
            className="mt-4 w-full text-white font-bold py-3 px-6 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
                       {" "}
            {loading ? (
              <>
                                <Loading />               {" "}
                <span className="ml-2">Generating...</span>             {" "}
              </>
            ) : (
              "Generate My Form →"
            )}
                     {" "}
          </button>
                 {" "}
        </div>
                {/* Example Prompts */}       {" "}
        <div ref={examplesRef} className="mt-8">
                   {" "}
          <p className="text-gray-500">Or try one of these examples:</p>       
           {" "}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
                       {" "}
            {examplePrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(prompt)}
                ref={(el) => (exampleButtonsRef.current[index] = el)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                                {prompt}             {" "}
              </button>
            ))}
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </section>
            {/*input section ends over here*/}   {" "}
    </>
  );
};

export default InputQuery;
