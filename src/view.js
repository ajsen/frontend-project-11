// @ts-check

const renderSuccessFeedback = (elements, i18nextInstance) => {
  const { formUrlInput, feedbackParagraph } = elements;
  formUrlInput.classList.remove('is-invalid');
  feedbackParagraph.classList.replace('text-danger', 'text-success');
  feedbackParagraph.textContent = i18nextInstance.t('feedback.rss_loaded');
};

const renderErrorFeedback = (elements, i18nextInstance, error) => {
  const { formUrlInput, feedbackParagraph } = elements;

  if (!error) {
    formUrlInput.classList.remove('is-invalid');
    feedbackParagraph.textContent = '';
    return;
  }

  formUrlInput.classList.add('is-invalid');
  feedbackParagraph.classList.add('text-danger');
  feedbackParagraph.textContent = i18nextInstance.t(error.message);
};

const handleProcessState = (elements, i18nextInstance, processState) => {
  const { urlForm, urlFormSubmitButton, formUrlInput } = elements;
  switch (processState) {
    case 'loading':
      urlFormSubmitButton.disabled = true;
      formUrlInput.disabled = true;
      break;
    case 'loaded':
      urlFormSubmitButton.disabled = false;
      formUrlInput.disabled = false;
      renderSuccessFeedback(elements, i18nextInstance);
      urlForm.reset();
      formUrlInput.focus();
      break;
    case 'failed':
      urlFormSubmitButton.disabled = false;
      formUrlInput.disabled = false;
      formUrlInput.focus();
      break;
    case 'filling':
      urlFormSubmitButton.disabled = false;
      formUrlInput.disabled = false;
      break;
    default:
      throw new Error(`Unknown 'processState': ${processState}`);
  }
};

export default (elements, i18nextInstance, state) => (path, value) => {
  const { urlFormSubmitButton } = elements;
  switch (path) {
    case 'feedLoadingProcess.state':
      handleProcessState(elements, i18nextInstance, value);
      break;
    case 'feedLoadingProcess.validationState':
      urlFormSubmitButton.disabled = value === 'invalid';
      break;
    case 'feedLoadingProcess.error':
      renderErrorFeedback(elements, i18nextInstance, value);
      break;
    default:
      break;
  }
};
