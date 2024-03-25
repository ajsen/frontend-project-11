import { isEmpty } from 'lodash';

const renderFeedback = (form, input, i18nextInstance, state, errors, previousErrors) => {
  form.reset();
  input.focus();

  const hadError = !isEmpty(previousErrors);
  const hasError = !isEmpty(errors);

  if (!hadError && !hasError) {
    return;
  }

  const feedback = document.querySelector('.feedback');

  if (!hasError && hadError) {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    return;
  }

  input.classList.add('is-invalid');
  feedback.textContent = i18nextInstance.t(state.form.errors);
};

export default (form, input, i18nextInstance, state) => (path, value, previousValue) => {
  // console.log(path, value, previousValue);
  switch (path) {
    case 'form.errors':
      renderFeedback(form, input, i18nextInstance, state, value, previousValue);
      break;
    default:
      break;
  }
};
