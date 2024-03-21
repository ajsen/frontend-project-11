import onChange from 'on-change';
import { isEmpty } from 'lodash';
import render from './view.js';
import validateForm from './validator.js';

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.getElementById('url-input'),
  };
  const state = {
    form: {
      isValid: true,
      errors: [],
      field: {
        url: '',
      },
    },
    feed: {
      urls: [],
    },
  };

  const watchedState = onChange(state, render(elements.form, elements.input));

  const handleForm = (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const url = data.get('url');

    watchedState.form.field.url = url;
    validateForm(state.form.field).then((err) => {
      // console.log(err);
      const isValid = !state.feed.urls.includes(url) && isEmpty(err);

      if (isValid) {
        watchedState.feed.urls.push(url);
      }

      watchedState.form.errors = err;
      watchedState.form.isValid = isValid;
      // console.log(state);
    });
  };

  elements.form.addEventListener('submit', handleForm);
};
