import { motion } from 'framer-motion';
import Header from '@/components/Header';
import ExperienceCard from '@/components/ExperienceCard';
import { useExperiences } from '@/hooks/useExperiences';

const Index = () => {
  const { data: experiences, isLoading, error } = useExperiences();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-semibold text-foreground">Local Experiences</h1>
          <p className="text-muted-foreground mt-1">Curated by our concierge team</p>
        </motion.div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-card bg-muted animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 text-center py-12">
            <p className="text-muted-foreground">Failed to load experiences</p>
          </div>
        )}

        {!isLoading && !error && experiences?.length === 0 && (
          <div className="mt-6 text-center py-12">
            <p className="text-muted-foreground">No experiences available</p>
          </div>
        )}

        {!isLoading && !error && experiences && experiences.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
            {experiences.map((experience, index) => (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <ExperienceCard experience={experience} />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
