// @ts-check

import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/resources.js';
import watch from './view.js';
import validateUrl from './validator.js';
import parseData from './dataParser.js';

const defaultLng = 'ru';
const timeout = 5000;
const axiosConfig = { timeout: 10000 };
const allOriginsProxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true';
const networkErrorsByCode = {
  ERR_NETWORK: new Error('network_error'),
  ECONNABORTED: new Error('request_timed_out'),
};

const addProxy = (url) => {
  const proxifiedUrl = new URL(allOriginsProxyUrl);
  proxifiedUrl.searchParams.set('url', url);
  return proxifiedUrl.href;
};

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
    feedLoadingProcess: {
      state: 'waiting',
      errors: null,
    },
    form: {
      isValid: true,
      errors: null,
    },
    feeds: [],
    posts: [],
    userUi: {
      lng: defaultLng,
      modalPostId: null,
      readPostsIds: [],
    },
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      fallbackLng: initialState.userUi.lng,
      debug: false,
      resources,
    })
    .then((t) => t)
    .catch((error) => { throw error.message; });

  const axiosInstance = axios.create(axiosConfig);

  const watchedState = watch(initialState, i18nextInstance, elements);

  const handleOnInput = () => {
    watchedState.form.errors = null;
    watchedState.form.isValid = true;
  };

  if (elements.formElements.formInputField) {
    elements.formElements.formInputField.addEventListener('input', handleOnInput);
  }

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const url = new FormData(e.target).get('url');
    const existingUrls = watchedState.feeds.map((feed) => feed.url);
    validateUrl(url, existingUrls).then((result) => {
      if (result) {
        watchedState.form.errors = result;
        watchedState.form.isValid = false;
        return;
      }

      watchedState.feedLoadingProcess.state = 'loading';
      axiosInstance.get(addProxy(url))
        .then((response) => response.data.contents)
        .then(parseData)
        .then(({ feed: newFeed, posts: newPosts }) => {
          watchedState.feeds.push({
            ...newFeed,
            url,
          });
          watchedState.posts.push(...newPosts);
          watchedState.feedLoadingProcess.state = 'loaded';
          watchedState.feedLoadingProcess.state = 'waiting';
        })
        .catch((error) => {
          watchedState.feedLoadingProcess.errors = networkErrorsByCode[error.code] ?? error;
          watchedState.feedLoadingProcess.state = 'failed';
          watchedState.feedLoadingProcess.state = 'waiting';
        });
    });
  };

  if (elements.formElements.formElement) {
    elements.formElements.formElement.addEventListener('submit', handleOnSubmit);
  }

  const handleModal = (e) => {
    const button = e.relatedTarget;
    const postId = button.getAttribute('data-id');
    watchedState.userUi.modalPostId = postId;
  };

  if (elements.modalElements.modalContainer) {
    elements.modalElements.modalContainer.addEventListener('show.bs.modal', handleModal);
  }

  const getNewPosts = (posts) => {
    const initialPostsIds = initialState.posts.map(({ id }) => id);
    const initialPostsIdsSet = new Set(initialPostsIds);
    return posts.filter(({ id }) => !initialPostsIdsSet.has(id));
  };

  const updatePosts = () => {
    const { feeds } = initialState;

    if (!feeds.length) {
      setTimeout(updatePosts, timeout);
      return;
    }

    const rawData = feeds.map(({ url }) => axiosInstance.get(addProxy(url))
      .then((response) => response.data.contents)
      .catch((error) => { throw error; }));

    Promise.all(rawData)
      .then((rawDataToParse) => rawDataToParse.map(parseData))
      .then((parsedData) => parsedData.flatMap(({ posts }) => posts))
      .then(getNewPosts)
      .then((newPosts) => {
        if (!newPosts.length) { return; }
        watchedState.posts.push(...newPosts);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error.message);
      })
      .finally(() => {
        setTimeout(updatePosts, timeout);
      });
  };

  setTimeout(updatePosts, timeout);
};
