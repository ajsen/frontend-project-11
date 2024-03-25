import onChange from 'on-change';
import i18next from 'i18next';
import { isEmpty } from 'lodash';
import render from './view.js';
import validateForm from './validator.js';
import resources from './locales/resources.js';

const defaultLanguage = 'ru';

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

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  });

  const watchedState = onChange(
    state,
    render(elements.form, elements.input, i18nextInstance, state),
  );

  const handleForm = (e) => {
    e.preventDefault();

    const data = new FormData(e.target);
    const url = data.get('url');

    const isExist = state.feed.urls.includes(url);
    if (isExist) {
      watchedState.form.errors = ['feedback.errors.existing_url'];
      watchedState.form.isValid = !isExist;
      return;
    }

    watchedState.form.field.url = url;
    validateForm(state.form.field).then((errors) => {
      // console.log(err);
      const isValid = isEmpty(errors);
      if (isValid) {
        watchedState.feed.urls.push(url);
      }

      watchedState.form.errors = errors;
      watchedState.form.isValid = isValid;
      // console.log(state);
    });
  };

  elements.form.addEventListener('submit', handleForm);
};
