// src/app/brand/[brandId]/page.tsx
    "use client";

    import BrandDashboard from '@/components/BrandDashboard';

    interface BrandPageProps {
      params: { brandId: string };
    }

    const BrandPage: React.FC<BrandPageProps> = ({ params }) => {
      const { brandId } = params;

      return (
        <main className="container mx-auto py-8">
          <BrandDashboard brandId={brandId} />
        </main>
      );
    };

    export default BrandPage;
