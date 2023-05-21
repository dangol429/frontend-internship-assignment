import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Book {
  title: string;
  author: string;
  publishDate: string;
}

interface ApiResponse {
  docs?: {
    title: string;
    author_name?: string[];
    first_publish_year?: string | number;
  }[];
  numFound: number;
}

@Component({
  selector: 'front-end-internship-assignment-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  limit: number = 10;
  scrollNumbers: number[] = [];
  searchKey: string = '';
  searchResults: Book[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  loading: boolean = false;
  showAllEntries: boolean = false;
  noResultsFound: boolean = false;
  searchTerm: string = '';
  books: Book[] = [];
  trendingSubjects: Array<any> = [
    { name: 'JavaScript' },
    { name: 'CSS' },
    { name: 'HTML' },
    { name: 'Harry Potter' },
    { name: 'Crypto' },
  ];

  bookSearch: FormControl;

  constructor(private http: HttpClient) {
    this.bookSearch = new FormControl('');
  }

  ngOnInit(): void {
    this.bookSearch.valueChanges.pipe(debounceTime(300)).subscribe((value: string) => {
      this.searchKey = value;
      this.searchBooks(value);
      this.generateScrollNumbers();
    });
  }

  getTotalEntries(): number {
    return this.showAllEntries ? this.searchResults.length : this.totalPages * this.limit;
  }

  generateScrollNumbers(): void {
    const maxEntries = this.totalPages * this.limit; // Replace with the maximum number of entries available after search
    const startNumber = 10;

    // Generate the numbers from startNumber to maxEntries
    this.scrollNumbers = [];
    for (let i = startNumber; i <= maxEntries; i++) {
      this.scrollNumbers.push(i);
    }
  }

  searchBooks(searchValue: string, offset: number = 0, limit: number = this.limit): void {
    this.loading = true;
  
    const apiUrl = `https://openlibrary.org/search.json?q=${searchValue}&offset=${offset}&limit=${limit}`;
  
    this.http.get<ApiResponse>(apiUrl).subscribe(
      (response: ApiResponse) => {
        this.handleApiResponse(response, limit);
      },
      (error: any) => {
        // Handle error
        console.error(error);
        this.loading = false;
        this.noResultsFound = true; // Set a flag to indicate no results found
      }
    );
  }


  private handleApiResponse(response: ApiResponse, limit: number): void {
    console.log(response);
    this.searchResults = response?.docs?.map((doc) => ({
      title: doc.title,
      author: doc.author_name?.join(', ') || 'Unknown',
      publishDate: doc.first_publish_year?.toString() || 'N/A',
    })) || [];
    console.log(this.searchResults);
    this.totalPages = Math.ceil(response?.numFound / limit);
    this.loading = false;
    this.generateScrollNumbers();

    if (this.searchResults.length === 0) {
      this.noResultsFound = true; // Set a flag to indicate no results found
    } else {
      this.noResultsFound = false; // Reset the flag
    }
  }

  clearSearch(): void {
    this.searchKey = '';
    this.searchResults = [];
    this.currentPage = 1;
    this.totalPages = 0;
    this.showAllEntries = false;
    this.noResultsFound = false; // Reset the flag
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      const offset = (this.currentPage - 1) * this.limit;
      const limit = this.limit;
      this.searchBooks(this.searchKey, offset, limit);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      const offset = (this.currentPage - 1) * this.limit;
      const limit = this.limit;
      this.searchBooks(this.searchKey, offset, limit);
    }
  }

  changeLimit(): void {
    const offset = (this.currentPage - 1) * this.limit;
    const limit = this.limit;
    this.searchBooks(this.searchKey, offset, limit);
  }

  getStartIndex(): number {
    return (this.currentPage - 1) * this.limit + 1;
  }

  getEndIndex(): number {
    const endIndex = this.currentPage * this.limit;
    return Math.min(this.currentPage * this.limit, this.searchResults.length);
  }

  toggleEntries(): void {
    this.showAllEntries = !this.showAllEntries;
    if (this.showAllEntries) {
      this.searchBooks(this.searchKey, 0, this.searchResults.length);
    } else {
      this.changeLimit();
    }
  }
}

