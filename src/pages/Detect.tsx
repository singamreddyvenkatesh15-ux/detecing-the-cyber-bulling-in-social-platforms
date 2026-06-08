
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Search, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import Layout from "../components/Layout";
import mlService from "../services/mlService";
import db from "../services/database";
import { useAuth } from "../hooks/useAuth";

interface AnalysisResult {
  result: boolean;
  confidence: number;
  category?: string;
  features: {
    sentimental?: number;
    sarcastic?: number;
    syntactic?: number;
    semantic?: number;
    social?: number;
  };
}

const Detect = () => {
  const { isAuthenticated, user } = useAuth();
  const [text, setText] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedResult, setSavedResult] = useState(false);

  const handleTextAnalysis = () => {
    if (!text.trim()) return;
    
    setLoading(true);
    setSavedResult(false);
    
    // Simulate a network delay for realism
    setTimeout(() => {
      const analysis = mlService.analyzeText(text);
      setResult(analysis);
      setLoading(false);
    }, 1500);
  };

  const handleTwitterAnalysis = () => {
    if (!twitterHandle.trim()) return;
    
    setLoading(true);
    setSavedResult(false);
    
    // Simulate Twitter API call and analysis
    setTimeout(() => {
      // In a real app, this would fetch tweets from the Twitter API
      const sampleTweet = `This is a simulated tweet from @${twitterHandle}. Let's assume this contains some bullying content to demonstrate the feature.`;
      
      const analysis = mlService.analyzeText(sampleTweet);
      setResult({
        ...analysis,
        // Make it more likely to be bullying for demonstration
        result: Math.random() > 0.3, 
        confidence: 0.7 + Math.random() * 0.3
      });
      
      setText(sampleTweet);
      setLoading(false);
    }, 2000);
  };

  const saveResult = () => {
    if (!result || !text) return;
    
    // Create a new message in the database
    const message = db.createMessage(
      text,
      user ? user.id : null,
      "manual_input"
    );
    
    // Create a report for the message
    db.createReport(
      message.id,
      result.result,
      result.confidence,
      result.features,
      result.category
    );
    
    setSavedResult(true);
  };

  const getCategoryLabel = (category?: string) => {
    if (!category) return "General Bullying";
    
    const labels: Record<string, string> = {
      personal_attack: "Personal Attack",
      appearance: "Appearance-based",
      threat: "Threat or Intimidation",
      sexual: "Sexual Harassment",
      discrimination: "Discrimination"
    };
    
    return labels[category] || "Other";
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyber-primary mb-2">Cyberbullying Detection</h1>
          <p className="text-gray-600">
            Analyze text to detect potential cyberbullying content using our machine learning model.
          </p>
        </div>
        
        <Tabs defaultValue="text" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Analyze Text</TabsTrigger>
            <TabsTrigger value="twitter">Twitter Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <Textarea
                placeholder="Enter text to analyze for cyberbullying content..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-32"
              />
              <Button
                onClick={handleTextAnalysis}
                disabled={!text.trim() || loading}
                className="w-full bg-cyber-primary hover:bg-cyber-dark"
              >
                {loading ? (
                  "Analyzing..."
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze Text
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="twitter" className="p-4 border rounded-md mt-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">@</span>
                <Input
                  placeholder="Twitter username"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                />
              </div>
              <Button
                onClick={handleTwitterAnalysis}
                disabled={!twitterHandle.trim() || loading}
                className="w-full bg-cyber-primary hover:bg-cyber-dark"
              >
                {loading ? (
                  "Fetching Tweets..."
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze Twitter User
                  </>
                )}
              </Button>
              <p className="text-xs text-gray-500">
                Note: This is a simulation. In a real application, this would connect to
                the Twitter API to fetch and analyze actual tweets.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {loading && (
          <div className="p-8 border rounded-md shadow-sm mb-6 text-center">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-cyber-primary animate-pulse" />
            </div>
            <h2 className="text-xl font-medium mb-4">Analyzing content...</h2>
            <Progress value={45} className="w-full mb-2" />
            <p className="text-sm text-gray-500">
              Our AI is analyzing multiple features to determine if cyberbullying is present.
            </p>
          </div>
        )}
        
        {result && !loading && (
          <div className="border rounded-md shadow-sm overflow-hidden mb-6">
            <div className={`p-4 ${result.result ? 'bg-red-100' : 'bg-green-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {result.result ? (
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  ) : (
                    <CheckCircle2 className="h-6 w-6 text-green-600 mr-2" />
                  )}
                  <h2 className="text-xl font-medium">
                    {result.result ? "Cyberbullying Detected" : "No Cyberbullying Detected"}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white">
                    {Math.round(result.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Analyzed Text</h3>
                <p className="p-3 bg-gray-50 rounded">{text}</p>
              </div>
              
              {result.result && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Classification</h3>
                  <p className="font-semibold">{getCategoryLabel(result.category)}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500">Feature Analysis</h3>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">Sentiment</span>
                    <span className="text-xs font-medium">
                      {Math.round((result.features.sentimental || 0) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(result.features.sentimental || 0) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">Semantic</span>
                    <span className="text-xs font-medium">
                      {Math.round((result.features.semantic || 0) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(result.features.semantic || 0) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">Sarcastic</span>
                    <span className="text-xs font-medium">
                      {Math.round((result.features.sarcastic || 0) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(result.features.sarcastic || 0) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">Syntactic</span>
                    <span className="text-xs font-medium">
                      {Math.round((result.features.syntactic || 0) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(result.features.syntactic || 0) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">Social Context</span>
                    <span className="text-xs font-medium">
                      {Math.round((result.features.social || 0) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(result.features.social || 0) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
              
              {!savedResult && (
                <div className="mt-6">
                  <Button 
                    onClick={saveResult} 
                    variant="outline"
                    className="w-full"
                  >
                    Save Analysis to Database
                  </Button>
                </div>
              )}
              
              {savedResult && (
                <div className="mt-6 p-3 bg-green-50 text-green-800 rounded-md text-sm">
                  Analysis saved to database successfully.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Detect;
