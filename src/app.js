// @ts-check

import i18next from 'i18next';
import onChange from 'on-change';
import { differenceBy, find } from 'lodash';
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
    form: document.querySelector('.rss-form'),
    urlInput: document.getElementById('url-input'),
    formSubmitButton: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
    feedsColumn: document.querySelector('.feeds'),
    postsColumn: document.querySelector('.posts'),
  };

  const initialState = {
    feedUrls: [],
    feedAddingProcess: {
      processState: 'filling',
      processError: null,
      validationState: 'valid',
    },
    uiState: {
      lng: defaultLng,
      newsFeed: {
        feeds: [],
        posts: [],
        readPosts: [],
      },
      modal: {
        post: {},
      },
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    fallbackLng: initialState.uiState.lng,
    debug: true,
    resources,
  });

  const watchedState = onChange(initialState, render(elements, initialState, i18nextInstance));

  const handleOnInput = (e) => {
    watchedState.feedAddingProcess.processState = 'filling';
    const newUrl = e.target.value;
    const existingUrls = initialState.feedUrls;
    validateUrl(newUrl, existingUrls).then((error) => {
      watchedState.feedAddingProcess.processError = error;
      watchedState.feedAddingProcess.validationState = error ? 'invalid' : 'valid';
    });
  };

  if (elements.urlInput) {
    elements.urlInput.addEventListener('input', handleOnInput);
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const url = new FormData(e.target).get('url');
    const urlString = String(url);
    const newUrl = new URL(urlString).href;

    watchedState.feedAddingProcess.processState = 'loading';
    getData(newUrl)
      .then(({ feed: newFeed, posts: newPosts }) => {
        initialState.feedUrls.push(newUrl);
        initialState.uiState.newsFeed.feeds.push(newFeed);
        initialState.uiState.newsFeed.posts.push(...newPosts);
        watchedState.feedAddingProcess.processState = 'loaded';
      })
      .catch((error) => {
        watchedState.feedAddingProcess.processError = (error.message === 'Network Error')
          ? new Error('rss_form.feedback.errors.network_error') : error;
        watchedState.feedAddingProcess.processState = 'failed';
      });
  };

  if (elements.form) {
    elements.form.addEventListener('submit', handleOnSubmit);
  }

  const handleModal = (e) => {
    const button = e.relatedTarget;
    const { posts } = initialState.uiState.newsFeed;
    const id = button.getAttribute('data-id');
    const post = find(posts, { id });
    watchedState.uiState.modal.post = post;
  };

  if (elements.modal) {
    elements.modal.addEventListener('show.bs.modal', handleModal);
  }

  const delay = 5000;
  const updatePosts = () => {
    const { feedUrls } = initialState;

    if (feedUrls.length === 0) {
      setTimeout(updatePosts, delay);
      return;
    }

    feedUrls.forEach((feedUrl) => getData(feedUrl)
      .then(({ posts: updatedPosts }) => {
        const initialPosts = initialState.uiState.newsFeed.posts;
        return differenceBy(updatedPosts, initialPosts, 'link');
      })
      .then((newPosts) => {
        if (newPosts.length === 0) { return; }
        watchedState.uiState.newsFeed.posts.push(...newPosts);
      })
      .catch((error) => {
        console.error(error.message);
      }));

    setTimeout(updatePosts, delay);
  };

  setTimeout(updatePosts, delay);
};
