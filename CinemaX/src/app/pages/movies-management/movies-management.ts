import { AfterViewInit, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MoviesService } from '../../services/movies.service';
import { IMovie } from '../../models/movie.model';
import { AppLoadingComponent } from '../../components/app-loading/app-loading';
import { MovieTrailerModalComponent } from '../../components/movie-trailer-modal/movie-trailer-modal';

@Component({
  selector: 'app-movies-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AppLoadingComponent, MovieTrailerModalComponent],
  templateUrl: './movies-management.html',
  styleUrls: ['./movies-management.css'],
})
export class MoviesManagement implements OnInit, AfterViewInit {
  private moviesService = inject(MoviesService);


  // observable for route query params to determine if search input should be focused on load
  private route = inject(ActivatedRoute);

  @ViewChild('searchInput') private searchInput?: ElementRef<HTMLInputElement>;

  searchTerm = '';
  statusFilter = 'All Status';
  genreFilter = 'All Genres';
  languageFilter = 'All Languages';
  filtersOpen = false;
  isLoading = true;
  movies: IMovie[] = [];
  visibleMovies: IMovie[] = [];
  activeTrailerMovie: IMovie | null = null;
  private shouldFocusSearch = false;

  // status dropdown values mapped from backend enum values
  statuses = [
    { value: 'now_showing', label: 'Now Showing' },
    { value: 'coming_soon', label: 'Coming Soon' },
    { value: 'archived', label: 'Archived' },
    { value: 'New', label: 'New' },
  ];

  // backend genres come lowercase (e.g., "sci-fi")
  genres = [
    { value: 'action', label: 'Action' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'animation', label: 'Animation' },
    { value: 'biography', label: 'Biography' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'crime', label: 'Crime' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'drama', label: 'Drama' },
    { value: 'family', label: 'Family' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'history', label: 'History' },
    { value: 'horror', label: 'Horror' },
    { value: 'music', label: 'Music' },
    { value: 'mystery', label: 'Mystery' },
    { value: 'romance', label: 'Romance' },
    { value: 'sci-fi', label: 'Sci-Fi' },
    { value: 'sport', label: 'Sports' },
    { value: 'thriller', label: 'Thriller' },
    { value: 'war', label: 'War' },
    { value: 'western', label: 'Western' },
  ];

  readonly statusTabs = [
    { value: 'All Status', label: 'All Movies' },
    { value: 'now_showing', label: 'Now Showing' },
    { value: 'coming_soon', label: 'Coming Soon' },
    { value: 'archived', label: 'Archived' },
  ];

  ngAfterViewInit(): void {
    this.focusSearchIfNeeded();
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.shouldFocusSearch = params.get('focusSearch') === '1';
      this.focusSearchIfNeeded();
    });

    this.moviesService.getMovies().subscribe({
      next: (response: any) => {
        // backend shape you showed:
        // { success: true, data: IMovie[], pagination: {...} }
        const movies = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];


        // Normalize backend field names to match our UI/model
        this.movies = (movies ?? []).map((m: any) => ({
          ...m,
          id: m.id ?? m._id,
          genres: m.genres ?? m.genre,
          image: m.image ?? m.posterUrl,
          language: m.language ?? 'English',
          duration: typeof m.duration === 'number' ? m.duration : undefined,
          rating: typeof m.rating === 'number' ? m.rating : m.rating ? Number(m.rating) : 0,
          ageRating: m.ageRating ?? 'PG',
          status: m.status,
        })) as IMovie[];

        console.log('Normalized this.movies:', this.movies);

        // Ensure visible list is computed after loading movies
        this.visibleMovies = this.movies;
        this.updateVisibleMovies();
        this.isLoading = false;
      },

      error: (err) => {
        console.error('Failed to load movies from backend', err);
        this.movies = [];
        this.visibleMovies = [];
        this.isLoading = false;
      },
    });
  }

  // Called from template via getters below (status/genre/search are simple string bindings).
  private updateVisibleMovies(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const status = this.statusFilter;
    const genre = this.genreFilter;
    const language = this.languageFilter;

    console.log('updateVisibleMovies this.movies:', this.movies);

    this.visibleMovies = this.movies.filter((movie) => {
      const genreText = (movie.genres ?? []).join(' ').toLowerCase();
      const languageText = (movie.language ?? '').toLowerCase();
      const matchesSearch =
        !term || movie.title.toLowerCase().includes(term) || genreText.includes(term) || languageText.includes(term);
      const matchesStatus = status === 'All Status' || movie.status === status;

      const movieGenres = (movie.genres ?? []).map((g) => g.toLowerCase());
      const matchesGenre = genre === 'All Genres' || movieGenres.includes(genre.toLowerCase());
      const matchesLanguage =
        language === 'All Languages' || this.normalizeLanguage(movie.language) === this.normalizeLanguage(language);

      return matchesSearch && matchesStatus && matchesGenre && matchesLanguage;
    });
  }

  // Keep UI reactive without expensive filtering on every change detection cycle.
  // The setters ensure filtering runs only when a filter value changes.
  setSearchTerm(value: string): void {
    this.searchTerm = value;
    this.updateVisibleMovies();
  }

  setStatusFilter(value: string): void {
    this.statusFilter = value;
    this.updateVisibleMovies();
  }

  setGenreFilter(value: string): void {
    this.genreFilter = value;
    this.updateVisibleMovies();
  }

  setLanguageFilter(value: string): void {
    this.languageFilter = value;
    this.updateVisibleMovies();
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'All Status';
    this.genreFilter = 'All Genres';
    this.languageFilter = 'All Languages';
    this.updateVisibleMovies();
  }

  openTrailer(movie: IMovie): void {
    this.activeTrailerMovie = movie;
  }

  closeTrailer(): void {
    this.activeTrailerMovie = null;
  }

  get languages(): string[] {
    return Array.from(
      new Set(
        this.movies
          .map((movie) => this.normalizeLanguageLabel(movie.language))
          .filter((language): language is string => !!language),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }

  formatLanguage(language?: string): string {
    return this.normalizeLanguageLabel(language) ?? 'English';
  }

  getStatusLabel(status: string): string {
    return this.statuses.find((item) => item.value === status)?.label ?? status;
  }

  formatDuration(duration?: number): string {
    if (!duration || duration <= 0) {
      return 'TBA';
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${hours}h ${minutes}m`;
  }

  private focusSearchIfNeeded(): void {
    if (!this.shouldFocusSearch || !this.searchInput) {
      return;
    }

    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
      this.searchInput?.nativeElement.select();
      this.shouldFocusSearch = false;
    });
  }

  private normalizeLanguage(language?: string): string {
    return (language ?? '').trim().toLowerCase();
  }

  private normalizeLanguageLabel(language?: string): string | null {
    const normalized = this.normalizeLanguage(language);

    if (!normalized) {
      return null;
    }

    if (['english', 'en'].includes(normalized)) {
      return 'English';
    }

    if (['arabic', 'ar', 'العربية', 'عربي', 'arabic language'].includes(normalized)) {
      return 'Arabic';
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
}
