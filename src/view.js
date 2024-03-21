const renderError = (error, previousError) => {
  const hadError = error && !previousError;
  const hasError = !error && previousError;
  const input = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');

  if (!hasError && hadError) {
    input.classList.remove('is-invalid');
    feedback.textContent = '';
    return;
  }

  input.classList.add('is-invalid');
  feedback.textContent = 'Ссылка должна быть валидным URL';
};

export default (path, value, previousValue) => {
  // console.log(path, value, previousValue);

  switch (path) {
    case 'form.isValid':
      renderError(value, previousValue);
      break;
    default:
      break;
  }
};
