import React, { useState, useRef, useEffect } from "react";
import {FiMail,FiUser,FiBarChart2,FiStar,FiCalendar,FiCreditCard,FiArrowLeft,} from "react-icons/fi";
import GeneratedForm from "./GeneratedForm";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Color mapping for consistent Tailwind classes
const colorMap = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-300',
    bgLight: 'bg-blue-50/30',
    textDark: 'text-blue-800'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-300',
    bgLight: 'bg-green-50/30',
    textDark: 'text-green-800'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    border: 'border-purple-300',
    bgLight: 'bg-purple-50/30',
    textDark: 'text-purple-800'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-300',
    bgLight: 'bg-yellow-50/30',
    textDark: 'text-yellow-800'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-600',
    border: 'border-red-300',
    bgLight: 'bg-red-50/30',
    textDark: 'text-red-800'
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-600',
    border: 'border-indigo-300',
    bgLight: 'bg-indigo-50/30',
    textDark: 'text-indigo-800'
  }
};

// Form examples data
const examplesData = [
  {
    title: "Contact Form",
    description: "Simple contact form with name, email, phone, and message fields",
    category: "Business",
    icon: <FiMail />,
    color: "blue",
    includes: ["Name", "Email", "Phone", "Message"],
    schema: {
      formSectionTitle: "Contact Information",
      formSectionDescription: "We'd love to hear from you. Please fill out the form below.",
      fields: [
        {
          name: "First Name",
          label: "First Name",
          type: "text",
          required: true,
          placeholder: "Enter your first name",
        },
        {
          name: "Last Name",
          label: "Last Name",
          type: "text",
          required: true,
          placeholder: "Enter your last name",
        },
        {
          name: "Email Address",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "Enter your email address",
        },
        {
          name: "Phone Number",
          label: "Phone Number",
          type: "text",
          placeholder: "Enter your phone number",
        },
        {
          name: "Message",
          label: "Message",
          type: "textarea",
          required: true,
          placeholder: "Your message...",
        },
        {
          name: "updates",
          label: "I'd like to receive updates and newsletters",
          type: "checkbox",
        },
      ],
    },
  },
  {
    title: "User Registration",
    description: "Complete signup form with validation and password confirmation",
    category: "Authentication",
    icon: <FiUser />,
    color: "green",
    includes: ["Username", "Email", "Password", "Confirm Password", "Terms Agreement"],
    schema: {
      formSectionTitle: "Create Your Account",
      formSectionDescription: "Get started with a free account today.",
      fields: [
        {
          name: "Username",
          label: "Username",
          type: "text",
          required: true,
          placeholder: "Choose a username",
        },
        {
          name: "Email Address",
          label: "Email Address",
          type: "email",
          required: true,
          placeholder: "Enter your email",
        },
        {
          name: "Password",
          label: "Password",
          type: "password",
          required: true,
          placeholder: "Create a password",
        },
        {
          name: "Confirm Password",
          label: "Confirm Password",
          type: "password",
          required: true,
          placeholder: "Confirm your password",
        },
        {
          name: "terms",
          label: "I agree to the terms and conditions",
          type: "checkbox",
          required: true,
        },
      ],
    },
  },
  {
    title: "Customer Survey",
    description: "Multi-step survey with rating scales and multiple choice questions",
    category: "Research",
    icon: <FiBarChart2 />,
    color: "purple",
    includes: ["Rating Scale", "Multiple Choice", "Text Areas", "Checkboxes"],
    schema: {
      formSectionTitle: "Customer Feedback Survey",
      formSectionDescription: "Your feedback is important to us.",
      fields: [
        {
          name: "Overall Satisfaction",
          label: "How satisfied are you with our service?",
          type: "radio",
          required: true,
          options: [
            "Very Satisfied",
            "Satisfied",
            "Neutral",
            "Dissatisfied",
            "Very Dissatisfied",
          ],
        },
        {
          name: "Features Used",
          label: "Which features do you use most often?",
          type: "checkbox",
          options: ["Dashboard", "Reporting", "Support", "Integrations"],
        },
        {
          name: "Improvements",
          label: "What can we do to improve?",
          type: "textarea",
          placeholder: "Any suggestions for us?",
        },
      ],
    },
  },
  {
    title: "Product Review",
    description: "Review form with star ratings and detailed feedback options",
    category: "E-commerce",
    icon: <FiStar />,
    color: "yellow",
    includes: ["Star Rating", "Review Title", "Detailed Review", "Recommend"],
    schema: {
      formSectionTitle: "Leave a Review",
      formSectionDescription: "Tell us what you think about your recent purchase.",
      fields: [
        {
          name: "Rating",
          label: "Your Rating",
          type: "select",
          required: true,
          options: [
            { value: 5, label: "★★★★★" },
            { value: 4, label: "★★★★☆" },
            { value: 3, label: "★★★☆☆" },
            { value: 2, label: "★★☆☆☆" },
            { value: 1, label: "★☆☆☆☆" },
          ],
        },
        {
          name: "Review Title",
          label: "Review Title",
          type: "text",
          required: true,
          placeholder: "A short summary of your review",
        },
        {
          name: "Detailed Review",
          label: "Detailed Review",
          type: "textarea",
          placeholder: "Tell us more about your experience",
        },
        {
          name: "Recommend",
          label: "Would you recommend this product?",
          type: "radio",
          options: ["Yes", "No"],
        },
      ],
    },
  },
  {
    title: "Event Registration",
    description: "Event signup with attendee details and dietary preferences",
    category: "Events",
    icon: <FiCalendar />,
    color: "red",
    includes: ["Attendee Info", "Event Selection", "Dietary Restrictions", "Emergency Contact"],
    schema: {
      formSectionTitle: "Event Registration",
      formSectionDescription: "Register now to secure your spot.",
      fields: [
        { name: "Full Name", label: "Full Name", type: "text", required: true },
        { name: "Email", label: "Email", type: "email", required: true },
        {
          name: "Dietary Restrictions",
          label: "Dietary Restrictions",
          type: "text",
          placeholder: "e.g., Vegetarian, Gluten-Free",
        },
        {
          name: "Emergency Contact",
          label: "Emergency Contact Name",
          type: "text",
          required: true,
        },
      ],
    },
  },
  {
    title: "Payment Form",
    description: "Secure payment form with billing and shipping information",
    category: "E-commerce",
    icon: <FiCreditCard />,
    color: "indigo",
    includes: ["Card Details", "Billing Address", "Shipping Address", "Order Summary"],
    schema: {
      formSectionTitle: "Secure Payment",
      formSectionDescription: "Complete your purchase by providing your payment details.",
      fields: [
        {
          name: "Card Number",
          label: "Card Number",
          type: "text",
          required: true,
          placeholder: "**** **** **** ****",
        },
        {
          name: "Card Holder",
          label: "Card Holder Name",
          type: "text",
          required: true,
        },
        {
          name: "Expiry Date",
          label: "Expiry Date (MM/YY)",
          type: "text",
          required: true,
          placeholder: "MM/YY",
        },
        {
          name: "CVC",
          label: "CVC",
          type: "text",
          required: true,
          placeholder: "123",
        },
      ],
    },
  },
];

const FormExamplesPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedFormSchema, setSelectedFormSchema] = useState(null);
  
  const headerRef = useRef(null);
  const filterRef = useRef(null);
  const cardsRef = useRef([]);
  const ctaRef = useRef(null);

  const categories = ["All", ...new Set(examplesData.map((ex) => ex.category))];
  const filteredExamples = activeFilter === "All" 
    ? examplesData 
    : examplesData.filter((ex) => ex.category === activeFilter);
  
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  const handleTryExample = (schema) => {
    setSelectedFormSchema(schema);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    // Reset cards ref
    cardsRef.current = [];
    
    const ctx = gsap.context(() => {
      gsap.set([headerRef.current, filterRef.current, ctaRef.current], { opacity: 0, y: 50 });
      gsap.set(cardsRef.current, { opacity: 0, y: 30 });

      gsap.to(headerRef.current, {
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 80%',
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      gsap.to(filterRef.current, {
        scrollTrigger: {
          trigger: filterRef.current,
          start: 'top 85%',
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });

      gsap.to(cardsRef.current, {
        scrollTrigger: {
          trigger: cardsRef.current[0],
          start: 'top 85%',
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out'
      });

      gsap.to(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 90%',
        },
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });

    return () => ctx.revert();
  }, []);

  if (selectedFormSchema) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => setSelectedFormSchema(null)}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900 font-medium"
        >
          <FiArrowLeft />
          Back to Examples
        </button>
        <GeneratedForm schema={selectedFormSchema} />
      </div>
    );
  }

  return (
    <div className="bg-white font-sans">
      <div className="container mx-auto px-4 py-16">
        {/* Header Section */}
        <div ref={headerRef} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Form Examples
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Explore different types of forms you can create instantly with our
            AI-powered builder
          </p>
        </div>

        {/* Filter Buttons Section */}
        <div ref={filterRef} className="flex justify-center flex-wrap gap-2 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors duration-200 ${
                activeFilter === category
                  ? "bg-gray-800 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Examples Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExamples.map((example, index) => (
            <div
              key={example.title}
              ref={el => cardsRef.current[index] = el}
              className={`border rounded-xl p-6 flex flex-col justify-between shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative ${colorMap[example.color].border} ${colorMap[example.color].bgLight}`}
            >
              <div>
                <div
                  className={`absolute top-4 right-4 ${colorMap[example.color].bg} ${colorMap[example.color].textDark} text-xs font-semibold px-2.5 py-0.5 rounded-full`}
                >
                  {example.category}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-lg ${colorMap[example.color].bg} ${colorMap[example.color].text} text-2xl`}
                >
                  {example.icon}
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {example.title}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {example.description}
                </p>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Includes:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {example.includes.map((item) => (
                      <span
                        key={item}
                        className="bg-gray-200 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleTryExample(example.schema)}
                className="w-full mt-6 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Try This Example
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div ref={ctaRef} className="bg-gray-50/70">
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-800">
            Don't see what you need?
          </h2>
          <p className="mt-3 text-gray-600 max-w-xl mx-auto">
            Describe any form you can imagine, and our AI will build it for you
          </p>
          <button
            className="mt-8 bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-900 transition-colors"
            onClick={handleClick}
          >
            Create Custom Form
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormExamplesPage;