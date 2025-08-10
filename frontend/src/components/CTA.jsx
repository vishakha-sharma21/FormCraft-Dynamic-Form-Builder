import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate=useNavigate();
  function handleClick(){
    navigate('/signin');
  }
  return (
    <section className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white text-center py-20 px-4">
      <div className="container mx-auto">
        <h2 className="text-4xl font-extrabold">Ready to Build Your Form?</h2>
        <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
          Join thousands of users who have already created amazing forms with FormCraft. Start building your perfect form today.
        </p>
        <button onClick={handleClick} className="mt-8 bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-200 transition-colors">
          Get Started Free &rarr;
        </button>
      </div>
    </section>
  );
};

export default CTA;