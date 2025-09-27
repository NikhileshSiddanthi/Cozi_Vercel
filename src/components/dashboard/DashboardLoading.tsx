import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CategoryCardSkeleton } from '@/components/skeletons/CategoryCardSkeleton';
import { WelcomeSection } from './WelcomeSection';

export const DashboardLoading = () => (
  <MainLayout>
    <WelcomeSection />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[...Array(6)].map((_, index) => (
        <CategoryCardSkeleton key={index} />
      ))}
    </div>
  </MainLayout>
);