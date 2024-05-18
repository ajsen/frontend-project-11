// @ts-check

import i18next from 'i18next';
import axios from 'axios';
import resources from './locales/resources.js';
import watch from './view.js';
import validateUrl from './validator.js';
import parseData from './dataParser.js';

const defaultLng = 'ru';
const timeout = 5000;
const axiosConfig = {
  timeout: 10000,
};
const allOriginsProxyUrl = 'https://allorigins.hexlet.app/get';
const networkErrorsByCode = {
  ERR_NETWORK: new Error('network_error'),
  ECONNABORTED: new Error('request_timed_out'),
};

const addProxy = (url) => {
  const proxifiedUrl = new URL(allOriginsProxyUrl);
  proxifiedUrl.searchParams.set('disableCache', 'true');
  proxifiedUrl.searchParams.set('url', url);
  return proxifiedUrl.href;
};

const app = (i18nextInstance, axiosInstance, initialState, elements) => {
  const state = {
    ...initialState,
  };

  const watchedState = watch(state, i18nextInstance, elements);

  const handleOnInput = () => {
    watchedState.feedLoadingProcess.errors = null;
    watchedState.feedLoadingProcess.status = 'waiting';
    watchedState.form.errors = null;
    watchedState.form.isValid = true;
  };

  if (elements.rssForm.inputField) {
    elements.rssForm.inputField.addEventListener('input', handleOnInput);
  }

  const loadFeed = (url) => {
    axiosInstance.get(addProxy(url))
      .then(({ data }) => {
        const { feed: newFeed, posts: newPosts } = parseData(data.contents);
        watchedState.feeds.push({
          ...newFeed,
          url,
        });
        watchedState.posts.push(...newPosts);
        watchedState.feedLoadingProcess.status = 'loaded';
      })
      .catch((error) => {
        watchedState.feedLoadingProcess.errors = networkErrorsByCode[error.code] ?? error;
        watchedState.feedLoadingProcess.status = 'failed';
      });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();

    const url = new FormData(e.target).get('url');
    const existingUrls = state.feeds.map((feed) => feed.url);
    validateUrl(url, existingUrls).then((result) => {
      if (result) {
        watchedState.form.errors = result;
        watchedState.form.isValid = false;
        return;
      }
      watchedState.feedLoadingProcess.status = 'loading';
      loadFeed(url);
    });
  };

  if (elements.rssForm.form) {
    elements.rssForm.form.addEventListener('submit', handleOnSubmit);
  }

  const postExist = (postId) => state.posts.some((post) => post.id === postId);

  const handleMarkPostAsRead = (e) => {
    const readPostId = e.target.dataset.id;
    if (!postExist(readPostId)) {
      return;
    }
    watchedState.userUi.idsOfReadPosts.add(readPostId);
    watchedState.userUi.modalPostId = readPostId;
  };

  if (elements.postsContainer) {
    elements.postsContainer.addEventListener('click', handleMarkPostAsRead);
  }

  const getNewPosts = (posts) => {
    const initialPostsIds = state.posts.map(({ id }) => id);
    const initialPostsIdsSet = new Set(initialPostsIds);
    return posts.filter(({ id }) => !initialPostsIdsSet.has(id));
  };

  const updatePosts = () => {
    const { feeds } = state;

    if (!feeds.length) {
      setTimeout(updatePosts, timeout);
      return;
    }

    const promises = feeds.map(({ url }) => axiosInstance.get(addProxy(url))
      .then((response) => {
        const parsedData = parseData(response.data.contents);
        const newPosts = getNewPosts(parsedData.posts);
        if (!newPosts.length) {
          return;
        }
        watchedState.posts.push(...newPosts);
      })
      .catch((error) => error));

    Promise.all(promises)
      .then(() => {
        setTimeout(updatePosts, timeout);
      });
  };

  updatePosts();
};

export default () => {
  const elements = {
    modal: {
      container: document.getElementById('modal'),
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      button: document.querySelector('.modal a.btn'),
    },
    rssForm: {
      form: document.querySelector('.rss-form'),
      inputField: document.getElementById('url-input'),
      submitButton: document.querySelector('button[type="submit"]'),
    },
    feedbackParagraph: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };

  const initialState = {
    feedLoadingProcess: {
      status: 'waiting',
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
      idsOfReadPosts: new Set(),
      modalPostId: null,
    },
  };

  const i18nextInstance = i18next.createInstance();
  const axiosInstance = axios.create(axiosConfig);

  i18nextInstance
    .init({
      fallbackLng: initialState.userUi.lng,
      debug: false,
      resources,
    })
    .then(() => {
      app(i18nextInstance, axiosInstance, initialState, elements);
    })
    .catch((error) => { throw error.message; });
};
