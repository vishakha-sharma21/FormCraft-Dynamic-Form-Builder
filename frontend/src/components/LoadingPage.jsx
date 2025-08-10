import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "./Loading";

const LoadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const formDescription = location.state?.formDescription;
  const [status, setStatus] = useState("Generating your form...");

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const generateForm = async () => {
      try {
        setStatus("Generating your form...");
        const response = await fetch("http://localhost:3000/generate-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: formDescription }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to generate form");
        }

        const result = await response.json();
        console.log("API Response:", result); // Debug log

        if (!isMounted) return;
        if (!result.success || !Array.isArray(result.fields)) {
          console.error("Invalid response structure:", result);
          throw new Error(
            result.error || "API did not return valid form fields"
          );
        }

        setStatus("Form ready! Redirecting...");
        const formId = Math.random().toString(36).substring(2, 9);

        navigate('/generated-form', {
          state: {
            formData: result.fields,

            meta: {
              requestId: result.requestId,

              responseTime: result.responseTime,
            },
          },

          replace: true,
        });
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Request cancelled");

          return;
        }

        if (isMounted) {
          setStatus("Failed to generate form");

          console.error("Error:", error.message);

          setTimeout(() => {
            navigate("/", {
              state: {
                error: error.message,

                formDescription, // Preserve the original input
              },

              replace: true,
            });
          }, 2000);
        }
      }
    };

    generateForm();

    return () => {
      isMounted = false;

      controller.abort();
    };
  }, [navigate, formDescription]);

  return (
    <div className="min-h-screen flex items-center justify-center">
           {" "}
      <div className="text-center">
                <Loading />       {" "}
        <h2 className="mt-4 text-2xl font-bold text-gray-800">{status}</h2>     
         {" "}
        {formDescription && (
          <p className="mt-2 text-gray-600">Creating: "{formDescription}"</p>
        )}
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default LoadingPage;
