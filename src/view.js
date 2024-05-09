// @ts-check
/* eslint-disable no-param-reassign */

import onChange from 'on-change';
import { isEqual, find } from 'lodash';
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

    const feedElement = document.createElement('li');
    feedElement.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedElement.append(title, description);
    return feedElement;
  };

  const { feeds } = initialState;
  const reversedFeeds = feeds.toReversed();
  const feedsElements = reversedFeeds.map(buildFeedElement);
  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0', 'rounded-0');
  feedList.append(...feedsElements);
  const cardTitleText = i18nextInstance.t('feeds.title');
  const card = buildCard(cardTitleText);
  card.append(feedList);
  feedsContainer.replaceChildren(card);
};

const renderPosts = (postsContainer, initialState, i18nextInstance) => {
  const buildPostElement = (post, buttonText) => {
    const title = document.createElement('a');
    const { readPostsIds } = initialState.userUi;
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
      initialState.userUi.readPostsIds.push(post.id);
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

  const { posts } = initialState;
  const sortedPosts = posts.toSorted((post1, post2) => post2.pubDate - post1.pubDate);
  const buttonText = i18nextInstance.t('posts.button');
  const postsElements = sortedPosts.map((post) => buildPostElement(post, buttonText));
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsList.append(...postsElements);
  const cardTitleText = i18nextInstance.t('posts.title');
  const card = buildCard(cardTitleText);
  card.append(postsList);
  postsContainer.replaceChildren(card);
};

const renderModal = (initialState, modalElements, modalPostId) => {
  const modalPost = find(initialState.posts, { id: modalPostId });
  if (!modalPost) {
    throw new Error(`Modal post not found. Invalid 'modalPostId': ${modalPostId}`);
  }
  const { modalTitleElement, modalBodyElement, modalButton } = modalElements;
  modalTitleElement.textContent = modalPost.title;
  modalBodyElement.textContent = modalPost.description;
  modalButton.setAttribute('href', modalPost.link);
};

const renderErrorFeedback = (feedbackElement, errorMessage) => {
  feedbackElement.textContent = errorMessage;
  feedbackElement.classList.add('text-danger');
};

const clearErrorFeedback = (feedbackElement) => {
  feedbackElement.textContent = '';
  feedbackElement.classList.remove('text-danger');
};

const handleFeedbackError = (feedbackElement, i18nextInstance, errors, prevError) => {
  if (errors && prevError && isEqual(errors, prevError)) {
    return;
  }
  if (!errors && prevError) {
    clearErrorFeedback(feedbackElement);
    return;
  }
  const errorMessage = i18nextInstance.t(errors.message);
  renderErrorFeedback(feedbackElement, errorMessage);
};

const renderSuccessFeedback = (feedbackElement, successMessage) => {
  feedbackElement.textContent = successMessage;
  feedbackElement.classList.add('text-success');
};

const disableForm = (formElements) => {
  setElementDisabled(formElements.formInputField, true);
  setElementDisabled(formElements.formSubmitButton, true);
};

const enableForm = (formElements) => {
  setElementDisabled(formElements.formInputField, false);
  setElementDisabled(formElements.formSubmitButton, false);
};

const handleProcessState = (i18nextInstance, elements, processState) => {
  const { formElements, feedbackElement } = elements;
  switch (processState) {
    case 'loading':
      disableForm(formElements);
      break;
    case 'loaded':
      renderSuccessFeedback(feedbackElement, i18nextInstance.t('rss.loaded'));
      enableForm(formElements);
      formElements.formElement.reset();
      formElements.formInputField.focus();
      break;
    case 'failed':
      enableForm(elements.formElements);
      formElements.formInputField.focus();
      formElements.formInputField.classList.add('is-invalid');
      break;
    case 'waiting':
      break;
    default:
      throw new Error(`Unknown 'processState': ${processState}`);
  }
};

// eslint-disable-next-line max-len
export default (initialState, i18nextInstance, elements) => onChange(initialState, (path, value, prevValue) => {
  const { formInputField } = elements.formElements;
  switch (path) {
    case 'form.isValid':
      toggleElementClass(formInputField, 'is-invalid', !value);
      formInputField.focus();
      break;
    case 'form.errors':
      handleFeedbackError(elements.feedbackElement, i18nextInstance, value, prevValue);
      break;
    case 'feedLoadingProcess.errors':
      handleFeedbackError(elements.feedbackElement, i18nextInstance, value, prevValue);
      break;
    case 'feedLoadingProcess.state':
      handleProcessState(i18nextInstance, elements, value);
      break;
    case 'posts':
      renderPosts(elements.postsContainer, initialState, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(elements.feedsContainer, initialState, i18nextInstance);
      break;
    case 'userUi.modalPostId':
      renderModal(initialState, elements.modalElements, value);
      break;
    default:
      throw new Error(`Unknown 'path': ${path}`);
  }
});
