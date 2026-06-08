
import { useNavigate } from "react-router-dom";
import { Shield, AlertTriangle, Check, Search, Database, BarChart, LogIn } from "lucide-react";
import { Button } from "../components/ui/button";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleActionClick = (path: string) => {
    if (isAuthenticated || path === "/account") {
      navigate(path);
    } else {
      navigate("/account");
    }
  };

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-cyber-primary mb-4">
                Detect and Combat Cyberbullying with AI
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Our machine learning-powered platform helps identify harmful content on social media
                to create safer online environments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => handleActionClick("/detect")}
                  className="bg-cyber-primary hover:bg-cyber-dark"
                >
                  {isAuthenticated ? (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Try Bullying Detection
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login to Detect Bullying
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleActionClick("/account")}
                  variant="outline"
                  className="border-cyber-primary text-cyber-primary hover:bg-cyber-primary hover:text-white"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="bg-cyber-primary/10 rounded-full h-72 w-72 flex items-center justify-center">
                  <Shield className="h-32 w-32 text-cyber-primary" />
                </div>
                <div className="absolute -top-4 -right-4 bg-cyber-danger/90 text-white p-2 rounded-full animate-pulse">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-green-500/90 text-white p-2 rounded-full">
                  <Check className="h-6 w-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-cyber-primary">
            How CyberGuardian Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 bg-cyber-primary/10 p-3 rounded-full inline-block">
                <Search className="h-6 w-6 text-cyber-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Detect</h3>
              <p className="text-gray-600">
                Our AI analyzes text for signs of cyberbullying using multiple features including sentiment, syntax, and context.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 bg-cyber-primary/10 p-3 rounded-full inline-block">
                <Database className="h-6 w-6 text-cyber-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Classify</h3>
              <p className="text-gray-600">
                Identified bullying content is categorized by type, enabling more effective intervention strategies.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4 bg-cyber-primary/10 p-3 rounded-full inline-block">
                <BarChart className="h-6 w-6 text-cyber-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Report</h3>
              <p className="text-gray-600">
                Get detailed analytics and reports to understand the nature and prevalence of online harassment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8 text-cyber-primary">
            Ready to Create a Safer Online Environment?
          </h2>
          <Button 
            onClick={() => handleActionClick(isAuthenticated ? "/detect" : "/account")}
            className="bg-cyber-primary hover:bg-cyber-dark"
            size="lg"
          >
            {isAuthenticated ? "Start Detecting Cyberbullying" : "Login to Get Started"}
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
