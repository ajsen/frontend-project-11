// @ts-nocheck

import i18next from 'i18next';
import onChange from 'on-change';
import render from './view.js';
import resources from './locales/resources.js';
import validateUrl from './validator.js';
import getData from './dataGetter.js';

const defaultLng = 'ru';

export default () => {
  const elements = {
    urlForm: document.querySelector('.rss-form'),
    urlFormSubmitButton: document.querySelector('.rss-form button[type="submit"'),
    formUrlInput: document.getElementById('url-input'),
    feedbackParagraph: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
  };
  const state = {
    lng: defaultLng,
    feedLoadingProcess: {
      state: 'filling', // 'loading', 'loaded', 'failed'
      validationState: 'valid',
      error: null,
    },
    feeds: [],
    posts: [],
    urls: [],
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance
    .init({
      fallbackLng: state.lng,
      debug: true,
      resources,
    });

  const watchedState = onChange(state, render(elements, i18nextInstance, state));

  const handleUrlInput = (e) => {
    const newUrl = e.target.value;

    watchedState.feedLoadingProcess.state = 'filling';

    validateUrl(newUrl, state.urls)
      .then(() => {
        watchedState.feedLoadingProcess.validationState = 'valid';
        watchedState.feedLoadingProcess.error = null;
      })
      .catch((error) => {
        watchedState.feedLoadingProcess.validationState = 'invalid';
        watchedState.feedLoadingProcess.error = error;
      });
  };

  elements.formUrlInput.addEventListener('input', handleUrlInput);

  const handleForm = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const url = formData.get('url');
    const newUrl = new URL(String(url)).href;

    watchedState.feedLoadingProcess.state = 'loading';

    getData(newUrl)
      .then(({ feed, posts }) => {
        watchedState.urls.push(newUrl);
        watchedState.feeds.push(feed);
        watchedState.posts.push(posts);
        watchedState.feedLoadingProcess.state = 'loaded';
      })
      .catch((error) => {
        watchedState.feedLoadingProcess.error = error;
        watchedState.feedLoadingProcess.state = 'failed';
      });

    console.log(state);
  };

  elements.urlForm.addEventListener('submit', handleForm);
};
