import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IMovie, MOVIE_STATUS_LABELS } from '../../models/movie.model';
import { MoviesService } from '../../services/movies.service';
import { AuthService } from '../../services/auth.service';
import { AppLoadingComponent } from '../../components/app-loading/app-loading';
import { MovieTrailerModalComponent } from '../../components/movie-trailer-modal/movie-trailer-modal';

interface LandingFeature {
  icon: string;
  title: string;
  description: string;
}

interface LandingMovieSection {
  key: string;
  label: string;
  subtitle: string;
  movies: IMovie[];
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, AppLoadingComponent, MovieTrailerModalComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage implements OnInit {
  private readonly router = inject(Router);
  private readonly moviesService = inject(MoviesService);
  private readonly authService = inject(AuthService);

  protected get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  protected get isAdmin(): boolean {
    return this.authService.currentUserValue?.role === 'admin';
  }

  protected readonly features: LandingFeature[] = [
    {
      icon: 'bi-armchair',
      title: 'Premium Seats',
      description: 'Choose from Standard, Premium, and VIP seating options for the ultimate comfort.',
    },
    {
      icon: 'bi-ticket-perforated',
      title: 'Easy Booking',
      description: 'Quick and seamless ticket booking process with instant digital tickets.',
    },
    {
      icon: 'bi-cup-hot',
      title: 'Snacks & Drinks',
      description: 'Pre-order your favorite snacks and drinks for a hassle-free experience.',
    },
  ];

  protected isLoadingMovies = true;
  protected movieSections: LandingMovieSection[] = [];
  protected activeTrailerMovie: IMovie | null = null;
  protected activeSectionSlides: Record<string, number> = {};

  ngOnInit(): void {
    this.moviesService.getMovies().subscribe({
      next: (response: any) => {
        const rawMovies = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
        const movies = (rawMovies ?? []).map((movie: any) => ({
          ...movie,
          id: movie.id ?? movie._id,
          genres: movie.genres ?? movie.genre,
          image: movie.image ?? movie.posterUrl,
          language: movie.language ?? 'English',
          duration: typeof movie.duration === 'number' ? movie.duration : undefined,
          rating: typeof movie.rating === 'number' ? movie.rating : movie.rating ? Number(movie.rating) : 0,
          ageRating: movie.ageRating ?? 'PG',
          status: movie.status,
        })) as IMovie[];

        this.movieSections = this.buildSections(movies);
        this.activeSectionSlides = this.movieSections.reduce<Record<string, number>>((accumulator, section) => {
          accumulator[section.key] = 0;
          return accumulator;
        }, {});
        this.isLoadingMovies = false;
      },
      error: () => {
        this.movieSections = [];
        this.isLoadingMovies = false;
      },
    });
  }

  protected goToMovies(): void {
    this.router.navigate(['/movies'], { queryParams: { focusSearch: '1' } });
  }

  protected openTrailer(movie: IMovie): void {
    this.activeTrailerMovie = movie;
  }

  protected closeTrailer(): void {
    this.activeTrailerMovie = null;
  }






// pagination logic for each section


  protected getActiveMovie(section: LandingMovieSection): IMovie | null {
    if (section.movies.length === 0) {
      return null;
    }

    const activeIndex = this.activeSectionSlides[section.key] ?? 0;
    return section.movies[activeIndex] ?? section.movies[0];
  }

  protected setActiveMovie(sectionKey: string, index: number): void {
    this.activeSectionSlides[sectionKey] = index;
  }

  protected previousSlide(section: LandingMovieSection): void {
    const currentIndex = this.activeSectionSlides[section.key] ?? 0;
    const nextIndex = currentIndex === 0 ? section.movies.length - 1 : currentIndex - 1;
    this.activeSectionSlides[section.key] = nextIndex;
  }

  protected nextSlide(section: LandingMovieSection): void {
    const currentIndex = this.activeSectionSlides[section.key] ?? 0;
    this.activeSectionSlides[section.key] = (currentIndex + 1) % section.movies.length;
  }



  protected goToBooking(movie: IMovie): void {
    this.router.navigate(['/movies', movie.id, 'showtimes']);
  }

  protected getStatusTag(status: string): string {
    return MOVIE_STATUS_LABELS[status as keyof typeof MOVIE_STATUS_LABELS] ?? status;
  }

  protected formatDuration(duration?: number): string {
    if (!duration || duration <= 0) {
      return 'TBA';
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;

  }

  private buildSections(movies: IMovie[]): LandingMovieSection[] {
    const statusOrder = ['now_showing', 'coming_soon', 'archived', 'New'];
    const subtitles: Record<string, string> = {
      now_showing: 'Book your next show tonight.',
      coming_soon: 'See what is arriving soon.',
      archived: 'Revisit titles from the vault.',
      New: 'Fresh arrivals just added.',
    };

    return statusOrder
    .map((status) => {
        const sectionMovies = movies.filter((movie) => movie.status === status);
        if (sectionMovies.length === 0) {
          return null;
        }

        return {
          key: status,
          label: MOVIE_STATUS_LABELS[status as keyof typeof MOVIE_STATUS_LABELS] ?? status,
          subtitle: subtitles[status] ?? 'Explore the collection.',
          movies: sectionMovies.slice(0, 4),
        };
      })
      .filter((section): section is LandingMovieSection => !!section);
  }
}
