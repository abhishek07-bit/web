import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

interface StaticPageProps {
  title: string;
  content: string;
}

export default function StaticPage({ title, content }: StaticPageProps) {
  return (
    <div className="bg-background text-on-background antialiased min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow w-full max-w-max-width mx-auto px-lg md:px-container-padding py-section">
        <h1 className="font-display text-headline-lg text-primary mb-xl">{title}</h1>
        <div className="prose prose-invert max-w-none font-body-md text-secondary leading-relaxed">
          {content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
