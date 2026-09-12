import { NavBar } from "@/components/nav-bar";
import { HeroSection } from "@/components/hero-section";
import { AboutSection } from "@/components/about-section";
import { ServicesSection } from "@/components/services-section";
import { FacilitiesSection } from "@/components/facilities-section";
import { ExperienceSection } from "@/components/experience-section";
import { TrainingSection } from "@/components/training-section";
import { MembershipSection } from "@/components/membership-section";
import { GallerySection } from "@/components/gallery-section";
import { ReviewsSection } from "@/components/reviews-section";
import { LocationSection } from "@/components/location-section";
import { ContactSection } from "@/components/contact-section";
import { Footer } from "@/components/footer";
import { ChatWidget } from "@/components/chat-widget";
import { getGalleryImages } from "@/lib/gallery";

export default function Home() {
  const galleryImages = getGalleryImages();

  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <AboutSection />
        <ServicesSection />
        <FacilitiesSection />
        <ExperienceSection />
        <TrainingSection />
        <MembershipSection />
        <GallerySection images={galleryImages} />
        <ReviewsSection />
        <LocationSection />
        <ContactSection />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
