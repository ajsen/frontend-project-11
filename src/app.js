import onChange from 'on-change';
import render from './view.js';
import validateForm from './validator.js';

export default () => {
  const state = {
    form: {
      isValid: true,
      errors: [],
      field: {
        url: '',
      },
    },
  };

  const watchedState = onChange(state, render);

  const handleForm = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('url');

    watchedState.form.field.url = url;
    validateForm(state.form.field)
      .then((err) => {
        // console.log(err);
        watchedState.form.errors = err;
        watchedState.form.isValid = !err.length;
        // console.log(state.form);
      });
  };

  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', handleForm);
};
