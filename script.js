
const apiKey = '1cdb4419';
const baseUrl = 'https://www.omdbapi.com/';

// Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const movieListContainer = document.getElementById('movieList');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageNumbers = document.getElementById('pageNumbers');
const movieDetailsContainer = document.getElementById('movieDetails');

let currentPage = 1;
let totalResults = 0;
let movies = [];

// Fetch movie data from the OMDB API
async function fetchMovies(searchTerm, page) {
    
  const url = `${baseUrl}?apikey=${apiKey}&s=${searchTerm}&page=${page}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'True') {
      totalResults = parseInt(data.totalResults);
      return data.Search;
    } else {
      throw new Error(data.Error);
    }
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

// Initial page load
searchMovies();

// Display the movie list on the page
function displayMovies() {
    // document.getElementsByClassName("main").style.background.display=none;
  movieListContainer.innerHTML = '';

  movies.forEach(movie => {
    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');

    const moviePoster = document.createElement('img');
    moviePoster.classList.add('movie-poster');
    moviePoster.src = movie.Poster !== 'N/A' ? movie.Poster : 'no_poster.jpg';
    moviePoster.alt = movie.Title;

    const movieTitle = document.createElement('div');
    movieTitle.classList.add('movie-title');
    movieTitle.textContent = movie.Title;

    movieItem.appendChild(moviePoster);
    movieItem.appendChild(movieTitle);

    movieListContainer.appendChild(movieItem);

    // Add event listener to each movie item to display its details when clicked
    movieItem.addEventListener('click', () => {
      displayMovieDetails(movie);
    });
  });
}

// Display the movie details in the movie details section


// Fetch movie details based on the IMDb ID
async function fetchMovieDetails(imdbID) {
    const url = `${baseUrl}?apikey=${apiKey}&i=${imdbID}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.Response === 'True') {
        return data;
      } else {
        throw new Error(data.Error);
      }
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }
  

// Fetch and display movies based on search query and page number
async function searchMovies() {
  const searchTerm = searchInput.value;
  currentPage = 1;

  if (searchTerm.trim() !== '') {
    movies = await fetchMovies(searchTerm, currentPage);
    displayMovies();

    if (totalResults > 10) {
      updatePagination();
    }
  }
}




// Set the maximum number of page buttons to display at a time
const maxPageButtons = 100;

// Update pagination buttons and page numbers
function updatePagination() {
  const totalPages = Math.ceil(totalResults / 10);

  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  let startPage = 1;
  let endPage = totalPages;

  // Calculate the range of page numbers to display based on the maxPageButtons threshold
  if (totalPages > maxPageButtons) {
    const halfMaxButtons = Math.floor(maxPageButtons / 2);
    if (currentPage > halfMaxButtons) {
      startPage = currentPage - halfMaxButtons;
      endPage = currentPage + halfMaxButtons;
      if (endPage > totalPages) {
        endPage = totalPages;
      }
    } else {
      endPage = maxPageButtons;
    }
  }

  let pageNumbersHTML = '';
  for (let i = startPage; i <= endPage; i++) {
    pageNumbersHTML += `<button class="page-number ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }

  pageNumbers.innerHTML = pageNumbersHTML;
}




// Go to a specific page
async function goToPage(page) {
  currentPage = page;
  movies = await fetchMovies(searchInput.value, currentPage);
  displayMovies();
  updatePagination();
}

// Event listeners
searchBtn.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    searchMovies();
  }
});

prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
nextBtn.addEventListener('click', () => goToPage(currentPage + 1));



//submit rating
function submitRating(imdbID) {
    console.log("w")
    const rating = parseFloat(document.getElementById(`rating-${imdbID}`).value);
    if (isNaN(rating) || rating < 0 || rating > 5) {
        alert('Please enter a valid rating between 0 and 5.');
        return;
    }

    const selectedMovieId = localStorage.getItem('selectedMovieId');
    // console.log(selectedMovieId)
    
        const movieData = JSON.parse(selectedMovieId);
        console.log(movieData)
        if (movieData) {
            movieData.rating = rating;
            localStorage.setItem(selectedMovieId, JSON.stringify(movieData));
            displayMovieDetails(movieData);
        }
    
}


// Function to handle submitting a comment
function submitComment() {
    const commentText = document.getElementById('commentText').value.trim();
    if (commentText === '') {
        alert('Please enter a valid comment.');
        return;
    }

    const selectedMovieId = localStorage.getItem('selectedMovieId');
    if (selectedMovieId) {
        const movieData = JSON.parse(localStorage.getItem(selectedMovieId));
        if (movieData) {
            if (!movieData.comments) {
                movieData.comments = [];
            }
            const newComment = {
                text: commentText,
                timestamp: new Date().toISOString()
            };
            movieData.comments.push(newComment);
            localStorage.setItem(selectedMovieId, JSON.stringify(movieData));
            displayMovieDetails(movieData);
        }
    }
}

// Function to display the movie details and comments
async function displayMovieDetails(movie) {
    const movieData = await fetchMovieDetails(movie.imdbID);

    if (!movieData) {
        console.error('Failed to fetch movie details.');
        return;
    }
    
    
    movieDetailsContainer.innerHTML = `
      <h2>${movieData.Title}</h2>
      <p><strong>Year:</strong> ${movieData.Year}</p>
      <p><strong>Director:</strong> ${movieData.Director !== 'N/A' ? movieData.Director : 'Not available'}</p>
      <p><strong>Plot:</strong> ${movieData.Plot !== 'N/A' ? movieData.Plot : 'Plot details not available'}</p>
      <p><strong>Cast:</strong> ${movieData.Actors !== 'N/A' ? movieData.Actors : 'Actors details not available'}</p>
      <p><strong>Genre:</strong> ${movieData.Genre !== 'N/A' ? movieData.Genre : 'Genre details not available'}</p>
      <p><strong>IMDb Rating:</strong> ${movieData.imdbRating !== 'N/A' ? movieData.imdbRating : 'Not rated'}</p>
      <div class="star-rating">
      <label for="rating-${movie.imdbID}">Rate this movie:</label>
      <input type="number" id="rating-${movie.imdbID}" min="0" max="5" step="0.1">
      <button onclick="submitRating('${movie.imdbID}')" id="submitRatingBtn-${movie.imdbID}">Submit</button>
    </div>
    <div class="comments-edit">
      <!-- Here, you can add the comments section if needed -->
      <label for="comment-${movie.imdbID}">Comment this movie:</label>
      <input type="text" id="comment-${movie.imdbID}" min="0" max="5" step="0.1">
      <button onclick="submitCommentMovie('${movie.imdbID}')" id="submitCommentBtn-${movie.imdbID}">Submit</button>
    </div>
    `;
     
    movieDetailsContainer.style.display = 'block';



    const existingSubrating =
    parseFloat(localStorage.getItem(`subrating_${movie.imdbID}`)) || 0;

  const existingComment = localStorage.getItem(`comment_${movie.imdbID}`) || "";

  // Display existing user rating, if available
  const ratingInput = document.getElementById(`rating-${movie.imdbID}`);
  const commentInput = document.getElementById(`comment-${movie.imdbID}`);
  ratingInput.value = existingSubrating;
  commentInput.value = existingComment;

  // Add event listener to the submit button for subratings
  const submitRateBtn = document.getElementById(
    `submitRatingBtn-${movie.imdbID}`
  );
  submitRateBtn.addEventListener("click", function () {
    // Save the new subrating to local storage
    const newSubrating = parseFloat(ratingInput.value);
    if (newSubrating >= 0 && newSubrating <= 5) {
      localStorage.setItem(`subrating_${movie.imdbID}`, newSubrating);
      alert("Rating saved successfully!");
    } else {
      alert("Rating must be a number between 0 and 5.");
    }
  });
  // Add event listener to the submit button for user comments
  const submitCommentBtn = document.getElementById(
    `submitCommentBtn-${movie.imdbID}`
  );
  submitCommentBtn.addEventListener("click", function () {
    const newComment = commentInput.value;
    localStorage.setItem(`comment_${movie.imdbID}`, newComment);
    alert("Comment added successfully!");
  });
};