
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { FileQuestion } from "lucide-react";
import Layout from "../components/Layout";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-cyber-primary/10 rounded-full h-24 w-24 mx-auto mb-6 flex items-center justify-center">
            <FileQuestion className="h-12 w-12 text-cyber-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-cyber-primary">Page Not Found</h1>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="bg-cyber-primary hover:bg-cyber-dark"
            size="lg"
          >
            Return to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
