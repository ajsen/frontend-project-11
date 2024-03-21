const renderError = (form, input, error, previousError) => {
  form.reset();
  input.focus();

  const hadError = error && !previousError;
  const hasError = !error && previousError;

  const feedback = document.querySelector('.feedback');

  if (!hasError && hadError) {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    return;
  }

  input.classList.add('is-invalid');
  feedback.textContent = 'Ссылка должна быть валидным URL';
};

export default (form, input) => (path, value, previousValue) => {
  // console.log(path, value, previousValue);

  switch (path) {
    case 'form.valid':
      renderError(form, input, value, previousValue);
      break;
    default:
      break;
  }
};
