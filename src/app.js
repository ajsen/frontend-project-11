// @ts-nocheck

import i18next from 'i18next';
import onChange from 'on-change';
import { isNull, differenceBy } from 'lodash';
import render from './view.js';
import resources from './locales/resources.js';
import validateUrl from './validator.js';
import getData from './dataGetter.js';

const defaultLng = 'ru';

export default () => {
  const elements = {
    modal: document.getElementById('modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalButton: document.querySelector('.modal a.btn'),
    urlForm: document.querySelector('.rss-form'),
    urlFormInput: document.getElementById('url-input'),
    urlFormSubmitButton: document.querySelector('button[type="submit"]'),
    feedbackParagraph: document.querySelector('.feedback'),
    feedsColumn: document.querySelector('.feeds'),
    postsColumn: document.querySelector('.posts'),
  };

  const initialState = {
    lng: defaultLng,
    feedAddingProcess: {
      processState: 'filling',
      processError: null,
      validationState: 'valid',
    },
    newsFeed: {
      uiState: {
        feeds: [],
        posts: [],
        readPosts: {
          currentPostId: null,
          ids: [],
        },
        modal: {
          postId: null,
        },
      },
      urls: [],
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    fallbackLng: initialState.lng,
    debug: true,
    resources,
  });

  const watchedState = onChange(initialState, render(elements, initialState, i18nextInstance));

  elements.urlFormInput.addEventListener('input', (e) => {
    watchedState.feedAddingProcess.processState = 'filling';
    const newUrl = e.target.value;
    const existingUrls = initialState.newsFeed.urls;
    validateUrl(newUrl, existingUrls).then((error) => {
      watchedState.feedAddingProcess.processError = error;
      watchedState.feedAddingProcess.validationState = isNull(error) ? 'valid' : 'invalid';
    });
  });

  elements.urlForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const url = new FormData(e.target).get('url');
    const urlString = String(url);
    const newUrl = new URL(urlString).href;

    watchedState.feedAddingProcess.processState = 'loading';
    getData(newUrl)
      .then(({ feed: newFeed, posts: newPosts }) => {
        initialState.newsFeed.urls.push(newUrl);
        initialState.newsFeed.uiState.feeds.push(newFeed);
        initialState.newsFeed.uiState.posts.push(...newPosts);
        watchedState.feedAddingProcess.processState = 'loaded';
      })
      .catch((error) => {
        watchedState.feedAddingProcess.processError = (error.message === 'Network Error')
          ? new Error('feedback.errors.network_error') : error;
        watchedState.feedAddingProcess.processState = 'failed';
      });
  });

  elements.modal.addEventListener('show.bs.modal', (e) => {
    const button = e.relatedTarget;
    const id = button.getAttribute('data-id');
    watchedState.newsFeed.uiState.readPosts.currentPostId = id;
    watchedState.newsFeed.uiState.modal.postId = id;
    initialState.newsFeed.uiState.readPosts.ids.push(id);
  });

  const delay = 5000;
  const updatePosts = () => {
    const { urls } = initialState.newsFeed;

    if (urls.length === 0) {
      setTimeout(updatePosts, delay);
      return;
    }

    urls.forEach((url) => getData(url)
      .then(({ posts: updatedPosts }) => {
        const initialPosts = initialState.newsFeed.uiState.posts;
        return differenceBy(updatedPosts, initialPosts, 'link');
      })
      .then((newPosts) => {
        if (newPosts.length === 0) { return; }
        watchedState.newsFeed.uiState.posts.push(...newPosts);
      })
      .catch((error) => {
        console.error(error.message);
      }));

    setTimeout(updatePosts, delay);
  };

  setTimeout(updatePosts, delay);
};
