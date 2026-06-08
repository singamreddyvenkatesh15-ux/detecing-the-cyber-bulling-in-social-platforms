
import { useEffect, useState } from "react";
import { BarChart, PieChart, Cell, Bar, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import Layout from "../components/Layout";
import db from "../services/database";
import { Shield, AlertTriangle, MessageCircle, CheckCircle } from "lucide-react";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899"];

const Analytics = () => {
  const [stats, setStats] = useState({
    totalMessages: 0,
    analyzedMessages: 0,
    bullyingMessages: 0,
    bullyingPercentage: 0,
    categoryData: {} as Record<string, number>,
    sourceData: {} as Record<string, number>
  });

  useEffect(() => {
    // Get statistics from the database
    const dbStats = db.getStatistics();
    setStats(dbStats);
  }, []);

  // Format category data for charts
  const categoryChartData = Object.entries(stats.categoryData).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  }));

  // Format source data for charts
  const sourceChartData = Object.entries(stats.sourceData).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyber-primary mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            View statistics and insights about cyberbullying detection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Messages</p>
                  <h3 className="text-2xl font-bold">{stats.totalMessages}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-full">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Analyzed</p>
                  <h3 className="text-2xl font-bold">{stats.analyzedMessages}</h3>
                </div>
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Bullying Detected</p>
                  <h3 className="text-2xl font-bold">{stats.bullyingMessages}</h3>
                </div>
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Safe Content</p>
                  <h3 className="text-2xl font-bold">{stats.analyzedMessages - stats.bullyingMessages}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Cyberbullying by Category</CardTitle>
              <CardDescription>
                Distribution of detected cyberbullying across different categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryChartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No category data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messages by Source</CardTitle>
              <CardDescription>
                Distribution of analyzed messages by their source.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sourceChartData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  No source data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={sourceChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Messages" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cyberbullying Detection Rate</CardTitle>
            <CardDescription>
              Percentage of analyzed content that was identified as cyberbullying.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <h3 className="text-5xl font-bold text-cyber-primary">
                  {stats.bullyingPercentage.toFixed(1)}%
                </h3>
                <p className="text-gray-500 mt-2">
                  of analyzed content was flagged as cyberbullying
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;
