
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { User, LogIn, LogOut, UserPlus, ShieldCheck, Search, Database } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import Layout from "../components/Layout";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { signInWithEmailAndPassword, getAuth } from "firebase/auth";
import { app } from "../firebase";
import {
  getFirestore,
  query,
  where,
  getDocs,
  collection,
} from "firebase/firestore";


const db = getFirestore(app);
const auth = getAuth(app);

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Account = () => {
  const { isAuthenticated, user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we have a redirect path in state
  const from = location.state && (location.state as any).from ? (location.state as any).from : null;
  
  // Set up form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    },
  });
  
  const handleLogin = (values: z.infer<typeof loginSchema>) => {
    const success = login(values.username, values.password);
    if (!success) {
      loginForm.setError("username", { type: "manual", message: "Invalid username or password" });
      loginForm.setError("password", { type: "manual", message: "Invalid username or password" });
    }
  };
  
  const handleRegister = (values: z.infer<typeof registerSchema>) => {
    const success = register(values.email,values.password, values.username);
    if (!success) {
      registerForm.setError("username", { type: "manual", message: "Username may already exist" });
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyber-primary mb-2">Account</h1>
          <p className="text-gray-600">
            {isAuthenticated 
              ? "Manage your account settings and preferences" 
              : "Log in or register to access all features"}
          </p>
        </div>
        
        {!isAuthenticated && from && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <AlertDescription className="text-blue-700">
              You need to login to access the {from.substring(1)} page.
            </AlertDescription>
          </Alert>
        )}
        
        {!isAuthenticated && !from && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <ShieldCheck className="h-5 w-5 text-blue-500" />
            <AlertDescription className="text-blue-700">
              Authentication is required to access cyberbullying detection features, dataset management, and analytics.
            </AlertDescription>
          </Alert>
        )}
        
        {isAuthenticated ? (
          <Card>
            <CardHeader>
              <CardTitle>Welcome, {user?.username}!</CardTitle>
              <CardDescription>
                You're logged in and have full access to all features of the cyberbullying detection system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-md">
                  <div className="bg-cyber-primary/10 p-3 rounded-full mr-4">
                    <User className="h-6 w-6 text-cyber-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{user?.username}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>
                
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Account Information</h3>
                  <p className="text-sm text-gray-500 mb-1">
                    <span className="font-medium">User ID:</span> {user?.uid}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    {/* <span className="font-medium">Account Created:</span> {user?.createdAt?.toLocaleString()} */}
                  </p>
                </div>

                <div className="flex gap-4 mt-4">
                  <Button 
                    onClick={() => navigate("/detect")} 
                    className="flex-1 bg-cyber-primary hover:bg-cyber-dark"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Go to Detection
                  </Button>
                  <Button 
                    onClick={() => navigate("/dataset")} 
                    className="flex-1 bg-cyber-primary hover:bg-cyber-dark"
                  >
                    <Database className="mr-2 h-4 w-4" />
                    Manage Dataset
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleLogout} 
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="text-xs text-gray-500">
                        {/* For demo: Username: "testuser" / Password: "password123" */}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full bg-cyber-primary hover:bg-cyber-dark">
                        <LogIn className="mr-2 h-4 w-4" />
                        Login
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Register</CardTitle>
                  <CardDescription>
                    Create a new account to access all features
                  </CardDescription>
                </CardHeader>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                    <CardContent className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Your email address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Choose a password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Confirm your password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" className="w-full bg-cyber-primary hover:bg-cyber-dark">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Register
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default Account;
