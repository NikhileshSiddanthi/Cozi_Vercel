import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCategories } from '@/hooks/useCategories';
import { WelcomeSection } from '@/components/dashboard/WelcomeSection';
import { CategoryGrid } from '@/components/dashboard/CategoryGrid';
import { DashboardLoading } from '@/components/dashboard/DashboardLoading';

const Dashboard = () => {
  const { categories, loading } = useCategories();

  if (loading) {
    return <DashboardLoading />;
  }

  return (
    <MainLayout>
      <WelcomeSection />
      <CategoryGrid categories={categories} />
    </MainLayout>
  );
};

export default Dashboard;