import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { HomePageContent } from "@/components/marketing/HomePageContent";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <MarketingHeader />
      <HomePageContent />
    </div>
  );
}
