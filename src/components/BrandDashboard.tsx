"use client";

    import React from 'react';
    import {
      Card,
      CardContent,
      CardDescription,
      CardHeader,
      CardTitle,
    } from "@/components/ui/card";
    import {
      ResponsiveContainer,
      LineChart,
      Line,
      XAxis,
      YAxis,
      CartesianGrid,
      Tooltip,
    } from 'recharts';

    interface BrandDashboardProps {
      brandId: string;
    }

    const BrandDashboard: React.FC<BrandDashboardProps> = ({ brandId }) => {
      // Mock data - replace with Firestore data
      const brandData = {
        name: `Brand ${brandId}`,
        growthData: [
          { date: '2024-01-01', value: 100 },
          { date: '2024-02-01', value: 120 },
          { date: '2024-03-01', value: 150 },
          { date: '2024-04-01', value: 140 },
          { date: '2024-05-01', value: 180 },
        ],
        overallGrowthRate: 15,
        totalBrandsAnalyzed: 100,
        totalUsers: 20
      };

      return (
        <div className="p-6 space-y-6">
          <h1 className="text-2xl font-bold">Brand Dashboard: {brandData.name}</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Overall Growth Rate</CardTitle>
                <CardDescription>Year-over-year growth</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{brandData.overallGrowthRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Brands Analyzed</CardTitle>
                <CardDescription>Total number of brands analyzed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{brandData.totalBrandsAnalyzed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Total number of users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{brandData.totalUsers}</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Growth Over Time</CardTitle>
              <CardDescription>Brand growth trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={brandData.growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      );
    };

    export default BrandDashboard;
