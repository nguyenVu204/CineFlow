import React from 'react';
import { useBooking } from '../../context/BookingContext';

export const TrailerModal: React.FC = () => {
  const { trailerModalMovie, closeTrailer } = useBooking();

  if (!trailerModalMovie) return null;

  // Trailer URL mapping or default YouTube embed
  const trailerEmbed =
    trailerModalMovie.trailerUrl ||
    'https://www.youtube-nocookie.com/embed/Way9Dexny3w?autoplay=1';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-black">
        <button
          onClick={closeTrailer}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-cinema-red text-white flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>
        <iframe
          className="w-full h-full"
          src={trailerEmbed}
          title={`${trailerModalMovie.title} Trailer`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

