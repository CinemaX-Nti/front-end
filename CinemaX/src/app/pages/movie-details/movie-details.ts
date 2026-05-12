import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule  } from '@angular/common';

interface IMovieShowTime {
  time: string;
  hall: string;
  seats: number;
  price: number;
  format: string;
  tag: string;
}

interface IMovie {
  title: string;
  tagline: string;
  status: string;
  duration: string;
  releaseDate: string;
  rating: string;
  genres: string[];
  format: string;
  image: string;
  startingPrice: number;
  description: string;
  synopsis: string;
  director: string;
  cast: string;
  showtimes: IMovieShowTime[];
}

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-details.html',
  styleUrls: ['./movie-details.css'],
})
export class MovieDetails implements OnInit {
  movieId: string | null = null;
  movie: IMovie = this.createFallbackMovie();

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('id');
    this.movie = this.getMovieDetails(this.movieId ?? '1');
  }

  private getMovieDetails(id: string): IMovie {
    const movies: Record<string, IMovie> = {
      '1': {
        title: 'Eternal Horizon',
        tagline: 'A thrilling sci-fi adventure across the galaxy.',
        status: 'Now Showing',
        duration: '148 min',
        releaseDate: 'Apr 15, 2026',
        rating: '8.5',
        genres: ['Sci-Fi', 'Adventure', 'Thriller'],
        format: 'IMAX',
        image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
        startingPrice: 12,
        description:
          'A thrilling sci-fi adventure across the galaxy where humanity discovers it is not alone in the universe.',
        synopsis:
          'A deep-space research expedition uncovers a mysterious signal. As rival factions close in, the crew must decode its origin before it triggers a galaxy-wide conflict. Courage, loyalty, and discovery collide in this epic space thriller.',
        director: 'Maya Rivers',
        cast: 'R. Clarke, S. Ng, A. Reyes',
        showtimes: [
          { time: '2:00 PM', hall: 'Grand Hall A', seats: 45, price: 12, format: '3D', tag: 'SCHEDULED' },
          { time: '6:30 PM', hall: 'Premium Hall B', seats: 32, price: 15, format: 'IMAX', tag: 'SCHEDULED' },
          { time: '9:00 PM', hall: 'Grand Hall A', seats: 58, price: 10, format: '2D', tag: 'SCHEDULED' },
        ],
      },
      '2': {
        title: 'Neon Shadows',
        tagline: 'The city glows, but danger lurks beneath.',
        status: 'Coming Soon',
        duration: '132 min',
        releaseDate: 'May 22, 2026',
        rating: '7.9',
        genres: ['Action', 'Mystery', 'Crime'],
        format: '3D',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        startingPrice: 14,
        description:
          'A cyber-thriller set in a neon-drenched metropolis where a lone detective fights corruption.',
        synopsis:
          'In a city ruled by powerful corporations, a former detective uncovers a conspiracy that threatens to erase millions from existence. She must choose between revenge and redemption.',
        director: 'Jordan Hale',
        cast: 'L. Carter, T. Wong, M. Silva',
        showtimes: [
          { time: '3:15 PM', hall: 'Hall C', seats: 20, price: 14, format: '3D', tag: 'SCHEDULED' },
          { time: '7:45 PM', hall: 'Hall D', seats: 18, price: 16, format: 'IMAX', tag: 'SCHEDULED' },
        ],
      },
      '3': {
        title: 'The Last Summit',
        tagline: 'Courage is measured at the edge of the world.',
        status: 'Now Showing',
        duration: '125 min',
        releaseDate: 'Jun 02, 2026',
        rating: '8.2',
        genres: ['Drama', 'Adventure'],
        format: 'Standard',
        image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
        startingPrice: 11,
        description:
          'An expedition climbs toward a legendary summit while personal secrets threaten to derail the journey.',
        synopsis:
          'When a sudden storm traps a small team near the highest pass, each member’s past resurfaces. To survive, they must trust one another and decide what the summit truly means—escape or transformation.',
        director: 'Elena Cruz',
        cast: 'T. Morgan, R. Ali, P. Jensen',
        showtimes: [
          { time: '1:45 PM', hall: 'Hall A', seats: 36, price: 11, format: '2D', tag: 'SCHEDULED' },
          { time: '5:20 PM', hall: 'Hall B', seats: 24, price: 13, format: '3D', tag: 'SCHEDULED' },
        ],
      },
      '4': {
        title: 'Velocity Dreams',
        tagline: 'Every race is a leap of faith.',
        status: 'Coming Soon',
        duration: '118 min',
        releaseDate: 'Jun 18, 2026',
        rating: '8.0',
        genres: ['Action', 'Sports'],
        format: '3D',
        image: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=900&q=80',
        startingPrice: 13,
        description:
          'A rookie racer uncovers a sabotage scheme and races against time to claim the championship.',
        synopsis:
          'After a string of suspicious crashes, a fearless rookie discovers the truth behind the missing funding. With only one season left, she pushes beyond limits to expose the plot and win with integrity.',
        director: 'Ravi Desai',
        cast: 'S. Kim, D. Watson, M. Ortega',
        showtimes: [
          { time: '4:10 PM', hall: 'Hall C', seats: 22, price: 13, format: '3D', tag: 'SCHEDULED' },
          { time: '8:25 PM', hall: 'Hall D', seats: 16, price: 16, format: 'IMAX', tag: 'SCHEDULED' },
        ],
      },
      '5': {
        title: 'Neon Reverb',
        tagline: 'Truth echoes louder than lies.',
        status: 'New',
        duration: '110 min',
        releaseDate: 'Jul 01, 2026',
        rating: '7.9',
        genres: ['Thriller', 'Drama'],
        format: 'Standard',
        image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=900&q=80',
        startingPrice: 10,
        description:
          'A haunting investigation unfolds through a city’s music, uncovering a past that refuses to fade.',
        synopsis:
          'A sound engineer finds recordings that implicate a missing singer. As the city’s nightlife heats up, he must decide whether the truth will free everyone—or destroy them.',
        director: 'Nadia Bell',
        cast: 'K. Reyes, J. Ward, H. Sato',
        showtimes: [
          { time: '2:30 PM', hall: 'Hall B', seats: 41, price: 10, format: '2D', tag: 'SCHEDULED' },
          { time: '6:10 PM', hall: 'Hall A', seats: 29, price: 12, format: '3D', tag: 'SCHEDULED' },
        ],
      },
      '6': {
        title: 'Starlit Heist',
        tagline: 'Steal the impossible.',
        status: 'Now Showing',
        duration: '122 min',
        releaseDate: 'Jul 10, 2026',
        rating: '8.3',
        genres: ['Crime', 'Adventure'],
        format: 'IMAX',
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        startingPrice: 14,
        description:
          'A daring crew plans a late-night heist beneath a sky of satellites and surveillance drones.',
        synopsis:
          'With security systems evolving by the minute, the crew races to synchronize their plan. Their final challenge isn’t the vault—it’s each other, and the secrets they kept along the way.',
        director: 'Miles Harper',
        cast: 'A. Torres, B. Nguyen, C. Price',
        showtimes: [
          { time: '3:00 PM', hall: 'Grand Hall A', seats: 33, price: 14, format: 'IMAX', tag: 'SCHEDULED' },
          { time: '7:00 PM', hall: 'Premium Hall B', seats: 21, price: 15, format: '3D', tag: 'SCHEDULED' },
        ],
      },
    };

    return movies[id] ?? this.createFallbackMovie();
  }


  private createFallbackMovie(): IMovie {
    return {
      title: 'CinemaX Feature',
      tagline: 'A cinematic story about discovery and connection.',
      status: 'Now Showing',
      duration: '120 min',
      releaseDate: 'May 10, 2026',
      rating: '8.0',
      genres: ['Drama', 'Adventure'],
      format: 'Standard',
      image: 'https://images.unsplash.com/photo-1497032205916-ac775f0649ae?auto=format&fit=crop&w=900&q=80',
      startingPrice: 11,
      description: 'A cinematic story about discovery, connection, and the power of hope in a changing world.',
      synopsis: 'A group of strangers discover their lives are more connected than they imagined. Through unexpected friendships and difficult choices, they learn how to move forward together.',
      director: 'A. Patel',
      cast: 'C. Johnson, E. Morales, K. Lee',
      showtimes: [
        { time: '1:30 PM', hall: 'Hall A', seats: 28, price: 11, format: '2D', tag: 'SCHEDULED' },
        { time: '5:00 PM', hall: 'Hall B', seats: 37, price: 13, format: '3D', tag: 'SCHEDULED' },
      ],
    };
  }
}
