
import { useState } from "react";
import { Database, Upload, Download, Check, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Layout from "../components/Layout";
import db, { Message } from "../services/database";
import { toast } from "sonner";

const Dataset = () => {
  const [uploadText, setUploadText] = useState("");
  const [uploadClassification, setUploadClassification] = useState<"bullying" | "non_bullying">("bullying");
  const [uploadCategory, setUploadCategory] = useState("personal_attack");
  const [messages, setMessages] = useState<Message[]>(db.getAllMessages());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedData, setSelectedData] = useState<"all" | "bullying" | "non_bullying">("all");

  // Handle adding a new dataset entry
  const handleAddData = () => {
    if (!uploadText.trim()) {
      toast.error("Please enter some text");
      return;
    }

    try {
      // Create a new message
      const message = db.createMessage(
        uploadText,
        null,
        "dataset"
      );

      // Create a report for the message
      db.createReport(
        message.id,
        uploadClassification === "bullying",
        0.9,  // High confidence since this is manually classified
        {
          sentimental: 0.8,
          sarcastic: 0.5,
          syntactic: 0.6,
          semantic: 0.7,
          social: 0.4
        },
        uploadClassification === "bullying" ? uploadCategory : undefined
      );

      // Update the displayed messages
      setMessages(db.getAllMessages());
      setUploadText("");
      
      toast.success("Entry added to dataset successfully");
    } catch (error) {
      toast.error("Failed to add entry to dataset");
    }
  };

  // Filter messages based on search term and selected data type
  const filteredMessages = messages.filter(message => {
    // Filter by search term
    const matchesSearch = message.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by bullying status
    let matchesType = true;
    if (selectedData === "bullying") {
      matchesType = message.isCyberbullying === true;
    } else if (selectedData === "non_bullying") {
      matchesType = message.isCyberbullying === false;
    }
    
    return matchesSearch && matchesType;
  });

  // Export dataset (simulated)
  const exportDataset = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cyberbullying_dataset.json';
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success("Dataset exported successfully");
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyber-primary mb-2">Cyberbullying Dataset</h1>
          <p className="text-gray-600">
            View, manage, and contribute to the cyberbullying detection dataset.
          </p>
        </div>

        <Tabs defaultValue="view" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="view">View Dataset</TabsTrigger>
            <TabsTrigger value="contribute">Contribute</TabsTrigger>
          </TabsList>
          
          <TabsContent value="view" className="p-4 border rounded-md mt-2">
            <div className="mb-4 flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search dataset..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-3 py-2 border rounded-md"
                  value={selectedData}
                  onChange={(e) => setSelectedData(e.target.value as "all" | "bullying" | "non_bullying")}
                >
                  <option value="all">All Data</option>
                  <option value="bullying">Bullying Only</option>
                  <option value="non_bullying">Non-Bullying Only</option>
                </select>
                <Button 
                  variant="outline" 
                  onClick={exportDataset}
                  className="flex gap-2 items-center"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead className="w-[150px]">Classification</TableHead>
                    <TableHead className="w-[150px]">Category</TableHead>
                    <TableHead className="w-[120px]">Source</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No messages found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMessages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-mono">{message.id}</TableCell>
                        <TableCell className="max-w-md truncate">{message.content}</TableCell>
                        <TableCell>
                          {message.isCyberbullying === null ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-200">Unanalyzed</span>
                          ) : message.isCyberbullying ? (
                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 flex items-center gap-1">
                              <X className="h-3 w-3" /> Bullying
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 flex items-center gap-1">
                              <Check className="h-3 w-3" /> Safe
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {message.category ? (
                            <span className="capitalize">{message.category.replace('_', ' ')}</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{message.source}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="contribute" className="p-4 border rounded-md mt-2">
            <Card>
              <CardHeader>
                <CardTitle>Add to Dataset</CardTitle>
                <CardDescription>
                  Contribute new examples to help improve the cyberbullying detection model.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Content</label>
                    <Textarea
                      placeholder="Enter text content..."
                      value={uploadText}
                      onChange={(e) => setUploadText(e.target.value)}
                      className="min-h-32"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Classification</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={uploadClassification}
                        onChange={(e) => setUploadClassification(e.target.value as "bullying" | "non_bullying")}
                      >
                        <option value="bullying">Cyberbullying</option>
                        <option value="non_bullying">Non-Bullying</option>
                      </select>
                    </div>
                    
                    {uploadClassification === "bullying" && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value)}
                        >
                          <option value="personal_attack">Personal Attack</option>
                          <option value="appearance">Appearance-based</option>
                          <option value="threat">Threat or Intimidation</option>
                          <option value="sexual">Sexual Harassment</option>
                          <option value="discrimination">Discrimination</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleAddData}
                  className="w-full bg-cyber-primary hover:bg-cyber-dark"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add to Dataset
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Dataset;
