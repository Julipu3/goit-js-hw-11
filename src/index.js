

import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './pics.js';
import { throttle } from 'lodash';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const btn = document.querySelector('#button');

const refs = {
  failureMessage: 'Sorry, there are no images matching your search query. Please try again.',
  limitMessage: "We're sorry, but you've reached the end of search results.",
  emptyMessage: "The field can't be empty! Please type at least 1 character",
  errorResponseMessage: 'Something went wrong, please try again later',
  page: 1,
  totalPages: 0,
  LIMIT: 40,
  SCROLL_THROTTLE_INTERVAL: 300,
};

let endOfPageNotified = false;

const lightbox = new SimpleLightbox('.gallery a');

form.addEventListener('submit', handleSubmit);

function handleClick(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } 

btn.addEventListener('click', handleClick);

async function handleSubmit(e) {
  e.preventDefault();

  refs.page = 1;
  refs.totalPages = 0;
  endOfPageNotified = false;

  gallery.textContent = '';

  let query = form.searchQuery.value.trim();

  if (query === '') {
    return Notiflix.Notify.failure(refs.emptyMessage);
  }

  try {
    const result = await fetchImages(query, refs.page, refs.LIMIT);

    if (result.hits.length === 0) {
      return Notiflix.Notify.warning(refs.failureMessage);
    }

    refs.totalPages = Math.ceil(result.totalHits / refs.LIMIT);

    renderMarkup(result.hits);

    Notiflix.Notify.info(`Hooray! We found ${result.totalHits} images.`);
  } catch (error) {
    Notiflix.Notify.failure(refs.errorResponseMessage);
  }
}

function renderMarkup(images) {
  const markup = images.reduce(
    (
      html,
      { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) => {
      return (
        html +
        `
         <div class="photo-card">
         <a class="gallery__link" href="${largeImageURL}">
         <img src="${webformatURL}" alt="${tags}" width="300px" loading="lazy" />
         </a>
         <div class="info">
           <div class="info-item">
             <p>Likes</p>
             <p>${likes}</p>
           </div>
           <div class="info-item">
             <p>Views</p>
             <p>${views}</p>
           </div>
           <div class="info-item">
             <p>Comments</p>
             <p>${comments}</p>
           </div>
           <div class="info-item">
             <p>Downloads</p>
             <p>${downloads}</p>
           </div>
         </div>
       </div>
       `
      );
    },
    ''
  );

  gallery.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh(); 
}

function handleButtonVisibility() {
    if (window.scrollY > 200) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  }

const scrollHandler = throttle((e) => {
  handleButtonVisibility();
  loadMoreHandler();
}, refs.SCROLL_THROTTLE_INTERVAL);

window.addEventListener('scroll', scrollHandler);

function limitNotify() {
  let distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);
  if (!endOfPageNotified && distanceToBottom < 200) {
    Notiflix.Notify.info(refs.limitMessage);
    endOfPageNotified = true;
  }
}

function loadMoreHandler() {
  const distanceToBottom = document.documentElement.scrollHeight - (window.innerHeight + window.scrollY);

  if (distanceToBottom < 200) {
    if (refs.page < refs.totalPages) {
      refs.page += 1;
      fetchAndRenderImages();
    } else {
      if (!endOfPageNotified) {
        limitNotify();
      }
    }
  }
}

async function fetchAndRenderImages() {
  try {
    const result = await fetchImages(
      form.searchQuery.value,
      refs.page,
      refs.LIMIT
    );
    renderMarkup(result.hits);
  } catch (error) {
    Notiflix.Notify.failure(refs.errorResponseMessage);
  }
}