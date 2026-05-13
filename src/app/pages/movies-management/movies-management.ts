import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MoviesService,iMovie } from '../../services/movies.service';

@Component({
  selector: 'app-movies-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movies-management.html',
  styleUrls: ['./movies-management.css'],
})
export class MoviesManagement implements OnInit {
  private moviesService = inject(MoviesService);

  searchTerm = '';
  statusFilter = 'All Status';
  genreFilter = 'All Genres';

  movies: iMovie[] = [];

  ngOnInit(): void {
    this.moviesService.getMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        console.log('Movies loaded from backend:', movies);
      },
      error: (err) => {
        console.error('Failed to load movies from backend', err);
        this.movies = [];
      },
    });
  }

  get visibleMovies(): iMovie[] {
    const term = this.searchTerm.toLowerCase();
    return this.movies.filter((movie) => {
      const matchesSearch = !term || movie.title.toLowerCase().includes(term);
      const matchesStatus = this.statusFilter === 'All Status' || movie.status === this.statusFilter;
      const matchesGenre = this.genreFilter === 'All Genres' || movie.genres.includes(this.genreFilter);
      return matchesSearch && matchesStatus && matchesGenre;
    });
  }
}

