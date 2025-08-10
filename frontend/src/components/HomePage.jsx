// src/components/HomePage.js

import Features from "./Features";
import FormTypes from "./FormTypes";
import CTA from "./CTA";
import Hero1 from "./Hero1";
import InputQuery from "./InputQuery";

const HomePage = () => {
  return (
    <>
      <Hero1/>
      <InputQuery/>
      <Features />
      <FormTypes/>
      
      <CTA />
    </>
  );
};

export default HomePage;
