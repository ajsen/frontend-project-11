// @ts-check
/* eslint-disable no-param-reassign */

import { isEqual } from 'lodash';
import { setElementDisabled, toggleElementClass } from './utilities.js';

const buildCard = (cardTitleText) => {
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = cardTitleText;
  cardBody.append(cardTitle);

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  card.append(cardBody);
  return card;
};

const renderFeeds = (feedsContainer, initialState, i18nextInstance) => {
  const buildFeedElement = (feed) => {
    const title = document.createElement('h3');
    title.textContent = feed.title;
    title.classList.add('h6', 'm-0');

    const description = document.createElement('p');
    description.textContent = feed.description;
    description.classList.add('m-0', 'small', 'text-back-50');

    const feedEl = document.createElement('li');
    feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedEl.append(title, description);
    return feedEl;
  };

  const { feeds } = initialState.uiState.newsFeed;
  const reversedFeeds = feeds.toReversed();
  const feedsElements = reversedFeeds.map(buildFeedElement);
  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0', 'rounded-0');
  feedList.append(...feedsElements);
  const cardTitleText = i18nextInstance.t('news_feed.feeds.title');
  const card = buildCard(cardTitleText);
  card.append(feedList);
  feedsContainer.replaceChildren(card);
};

const renderPosts = (postsContainer, initialState, i18nextInstance) => {
  const buildPostElement = (post, buttonText) => {
    const title = document.createElement('a');
    const { readPostsIds } = initialState.uiState.newsFeed;
    const titleClassName = readPostsIds.includes(post.id) ? 'fw-normal' : 'fw-bold';
    title.classList.add(titleClassName);
    title.setAttribute('href', post.link);
    title.setAttribute('data-id', post.id);
    title.setAttribute('target', '_blank');
    title.setAttribute('rel', 'noopener noreferrer');
    title.textContent = post.title;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = buttonText;
    const handleMarkPostAsRead = () => {
      title.classList.replace('fw-bold', 'fw-normal');
      initialState.uiState.newsFeed.readPostsIds.push(post.id);
    };
    button.addEventListener('click', handleMarkPostAsRead);

    const postElement = document.createElement('li');
    postElement.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );
    postElement.append(title, button);
    return postElement;
  };

  const { posts } = initialState.uiState.newsFeed;
  const sortedPosts = posts.toSorted((post1, post2) => post2.pubDate - post1.pubDate);
  const buttonText = i18nextInstance.t('news_feed.posts.button');
  const postsElements = sortedPosts.map((post) => buildPostElement(post, buttonText));
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsList.append(...postsElements);
  const cardTitleText = i18nextInstance.t('news_feed.posts.title');
  const card = buildCard(cardTitleText);
  card.append(postsList);
  postsContainer.replaceChildren(card);
};

const renderModal = (modalElements, modalPost) => {
  modalElements.modalTitleElement.textContent = modalPost.title;
  modalElements.modalBodyElement.textContent = modalPost.description;
  modalElements.modalButton.setAttribute('href', modalPost.link);
};

const renderSuccessFeedback = (feedbackElement, successMessage) => {
  feedbackElement.textContent = successMessage;
  feedbackElement.classList.add('text-success');
};

const renderErrorFeedback = (feedbackElement, errorMessage) => {
  feedbackElement.textContent = errorMessage;
  feedbackElement.classList.add('text-danger');
};

const clearErrorFeedback = (feedbackElement) => {
  feedbackElement.textContent = '';
  feedbackElement.classList.remove('text-danger');
};

const handleProcessError = (feedbackElement, i18nextInstance, processError, prevProcessError) => {
  if (!processError && !prevProcessError) {
    return;
  }
  if (processError && prevProcessError && isEqual(processError, prevProcessError)) {
    return;
  }
  if (!processError && prevProcessError) {
    clearErrorFeedback(feedbackElement);
    return;
  }
  const errorMessage = i18nextInstance.t(processError.message);
  renderErrorFeedback(feedbackElement, errorMessage);
};

const disableForm = (formElements) => {
  setElementDisabled(formElements.formInputField, true);
  setElementDisabled(formElements.formSubmitButton, true);
};

const enableForm = (formElements) => {
  setElementDisabled(formElements.formInputField, false);
  setElementDisabled(formElements.formSubmitButton, false);
};

const handleProcessState = (elements, initialState, i18nextInstance, processState) => {
  switch (processState) {
    case 'filling':
      enableForm(elements.formElements);
      break;
    case 'loading':
      disableForm(elements.formElements);
      break;
    case 'loaded':
      renderSuccessFeedback(elements.feedbackElement, i18nextInstance.t('rss.loaded'));
      renderPosts(elements.postsContainer, initialState, i18nextInstance);
      renderFeeds(elements.feedsContainer, initialState, i18nextInstance);
      enableForm(elements.formElements);
      elements.formElements.formElement.reset();
      elements.formElements.formInputField.focus();
      break;
    case 'failed':
      enableForm(elements.formElements);
      elements.formElements.formInputField.focus();
      break;
    default:
      throw new Error(`Unknown 'processState': ${processState}`);
  }
};

const isValid = (validationState) => validationState === 'valid';

export default (elements, initialState, i18nextInstance) => (path, value, prevValue) => {
  switch (path) {
    case 'feedAddProcess.validationState':
      toggleElementClass(elements.formElements.formInputField, 'is-invalid', !isValid(value));
      break;
    case 'feedAddProcess.processError':
      handleProcessError(elements.feedbackElement, i18nextInstance, value, prevValue);
      break;
    case 'feedAddProcess.processState':
      handleProcessState(elements, initialState, i18nextInstance, value);
      break;
    case 'uiState.newsFeed.posts':
      renderPosts(elements.postsContainer, initialState, i18nextInstance);
      break;
    case 'uiState.modal.post':
      renderModal(elements.modalElements, value);
      break;
    default:
      throw new Error(`Unknown "path": ${path}`);
  }
};
