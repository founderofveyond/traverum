import { Link } from 'react-router-dom';
import type { Experience } from '@/types/experience';

interface ExperienceCardProps {
  experience: Experience;
}

const ExperienceCard = ({ experience }: ExperienceCardProps) => {
  return (
    <Link
      to={`/experience/${experience.slug}`}
      className="block rounded-card overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={experience.image}
          alt={experience.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h3 className="absolute bottom-4 left-4 right-4 font-semibold text-lg text-primary-foreground">
          {experience.title}
        </h3>
      </div>
    </Link>
  );
};

export default ExperienceCard;
