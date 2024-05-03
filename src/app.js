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
    modalElements: {
      modalContainer: document.getElementById('modal'),
      modalTitleElement: document.querySelector('.modal-title'),
      modalBodyElement: document.querySelector('.modal-body'),
      modalButton: document.querySelector('.modal a.btn'),
    },
    formElements: {
      formElement: document.querySelector('.rss-form'),
      formInputField: document.getElementById('url-input'),
      formSubmitButton: document.querySelector('button[type="submit"]'),
    },
    feedbackElement: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const initialState = {
    feedAddProcess: {
      processState: 'filling',
      processError: null,
      validationState: 'valid',
    },
    uiState: {
      lng: defaultLng,
      newsFeed: {
        feeds: [],
        posts: [],
        readPostsIds: [],
      },
      modal: {
        post: {},
      },
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    fallbackLng: initialState.uiState.lng,
    debug: false,
    resources,
  });

  const watchedState = onChange(initialState, render(elements, initialState, i18nextInstance));

  const handleOnInput = (e) => {
    watchedState.feedAddProcess.processState = 'filling';
    const newUrl = e.target.value;
    const existingUrls = initialState.uiState.newsFeed.feeds.map(({ url }) => url);
    validateUrl(newUrl, existingUrls).then((result) => {
      watchedState.feedAddProcess.processError = result;
      watchedState.feedAddProcess.validationState = result ? 'invalid' : 'valid';
    });
  };

  if (elements.formElements.formInputField) {
    elements.formElements.formInputField.addEventListener('input', handleOnInput);
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();

    if (initialState.feedAddProcess.validationState === 'invalid') {
      return;
    }

    const url = new FormData(e.target).get('url');

    watchedState.feedAddProcess.processState = 'loading';
    getData(url)
      .then(({ feed: newFeed, posts: newPosts }) => {
        initialState.uiState.newsFeed.feeds.push({
          ...newFeed,
          url,
        });
        initialState.uiState.newsFeed.posts.push(...newPosts);
        watchedState.feedAddProcess.processState = 'loaded';
      })
      .catch((error) => {
        watchedState.feedAddProcess.processError = (error.message === 'Network Error')
          ? new Error('network_error') : error;
        watchedState.feedAddProcess.processState = 'failed';
      });
  };

  if (elements.formElements.formElement) {
    elements.formElements.formElement.addEventListener('submit', handleOnSubmit);
  }

  const handleModal = (e) => {
    const button = e.relatedTarget;
    const { posts } = initialState.uiState.newsFeed;
    const id = button.getAttribute('data-id');
    const post = find(posts, { id });
    if (!post) {
      throw new Error(`Modal post not found. Invalid post 'id': ${id}`);
    }
    watchedState.uiState.modal.post = post;
  };

  if (elements.modalElements.modalContainer) {
    elements.modalElements.modalContainer.addEventListener('show.bs.modal', handleModal);
  }

  const delay = 5000;
  const updatePosts = () => {
    const { feeds } = initialState.uiState.newsFeed;

    if (!feeds.length) {
      setTimeout(updatePosts, delay);
      return;
    }

    feeds.forEach(({ url }) => getData(url)
      .then(({ posts: updatedPosts }) => {
        const initialPosts = initialState.uiState.newsFeed.posts;
        return differenceBy(updatedPosts, initialPosts, 'link');
      })
      .then((newPosts) => {
        if (!newPosts.length) { return; }
        watchedState.uiState.newsFeed.posts.push(...newPosts);
      })
      .catch((error) => {
        console.error(error.message);
      }));

    setTimeout(updatePosts, delay);
  };

  setTimeout(updatePosts, delay);
};
