// @ts-check
/* eslint-disable no-param-reassign */

import onChange from 'on-change';
import { isEqual, find } from 'lodash';
import { setElementDisabled, toggleElementClass, elementHasClass } from './utilities.js';

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

const renderFeeds = (feedsContainer, state, i18nextInstance) => {
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

  const { feeds } = state;
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

const renderPosts = (postsContainer, state, i18nextInstance) => {
  const buildPostElement = (post, buttonText) => {
    const title = document.createElement('a');
    const { idsOfReadPosts } = state.userUi;
    const titleClassName = idsOfReadPosts.includes(post.id) ? 'fw-normal' : 'fw-bold';
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

  const { posts } = state;
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

const renderModal = (state, modal, modalPostId) => {
  const modalPost = find(state.posts, { id: modalPostId });
  if (!modalPost) {
    throw new Error(`'modalPost' not found in the 'state'. Invalid 'modalPostId': ${modalPostId}`);
  }
  modal.title.textContent = modalPost.title;
  modal.body.textContent = modalPost.description;
  modal.button.setAttribute('href', modalPost.link);
};

const renderPostAsRead = (state, postsContainer) => {
  const { idsOfReadPosts } = state.userUi;
  const idOfLastReadPost = idsOfReadPosts[idsOfReadPosts.length - 1];
  const titleOfReadPost = postsContainer.querySelector(`a[data-id="${idOfLastReadPost}"]`);
  if (!titleOfReadPost) {
    throw new Error(`'titleOfReadPost' not found in the DOM. Invalid 'idOfLastReadPost': ${idOfLastReadPost}`);
  }
  titleOfReadPost.classList.replace('fw-bold', 'fw-normal');
};

const renderErrorFeedback = (feedbackParagraph, errorMessage) => {
  feedbackParagraph.textContent = errorMessage;
  if (!elementHasClass(feedbackParagraph, 'text-danger')) {
    feedbackParagraph.classList.add('text-danger');
  }
  if (elementHasClass(feedbackParagraph, 'text-success')) {
    feedbackParagraph.classList.remove('text-success');
  }
};

const clearFeedbackError = (feedbackParagraph) => {
  feedbackParagraph.textContent = '';
  if (!elementHasClass(feedbackParagraph, 'text-danger')) {
    return;
  }
  feedbackParagraph.classList.remove('text-danger');
};

const handleFeedbackError = (feedbackParagraph, i18nextInstance, error, prevError) => {
  if (error && prevError && isEqual(error, prevError)) {
    return;
  }
  if (!error && prevError) {
    clearFeedbackError(feedbackParagraph);
    return;
  }
  const errorMessage = i18nextInstance.t(error.message);
  renderErrorFeedback(feedbackParagraph, errorMessage);
};

const renderSuccessFeedback = (feedbackParagraph, successMessage) => {
  feedbackParagraph.textContent = successMessage;
  if (elementHasClass(feedbackParagraph, 'text-success')) {
    return;
  }
  feedbackParagraph.classList.add('text-success');
};

const disableForm = (rssForm) => {
  setElementDisabled(rssForm.inputField, true);
  setElementDisabled(rssForm.submitButton, true);
};

const enableForm = (rssForm) => {
  setElementDisabled(rssForm.inputField, false);
  setElementDisabled(rssForm.submitButton, false);
};

const handleProcessStatus = (i18nextInstance, elements, processStatus) => {
  switch (processStatus) {
    case 'loading':
      disableForm(elements.rssForm);
      break;
    case 'loaded':
      renderSuccessFeedback(elements.feedbackParagraph, i18nextInstance.t('rss.loaded'));
      enableForm(elements.rssForm);
      elements.rssForm.form.reset();
      elements.rssForm.inputField.focus();
      break;
    case 'failed':
      enableForm(elements.rssForm);
      elements.rssForm.inputField.focus();
      break;
    default:
      throw new Error(`Unknown 'processState': ${processStatus}`);
  }
};

// eslint-disable-next-line max-len
export default (state, i18nextInstance, elements) => onChange(state, (path, value, prevValue) => {
  switch (path) {
    case 'form.isValid':
      toggleElementClass(elements.rssForm.inputField, 'is-invalid', !value);
      elements.rssForm.inputField.focus();
      break;
    case 'form.errors':
      handleFeedbackError(elements.feedbackParagraph, i18nextInstance, value, prevValue);
      break;
    case 'feedLoadingProcess.errors':
      handleFeedbackError(elements.feedbackParagraph, i18nextInstance, value, prevValue);
      break;
    case 'feedLoadingProcess.status':
      handleProcessStatus(i18nextInstance, elements, value);
      break;
    case 'posts':
      renderPosts(elements.postsContainer, state, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(elements.feedsContainer, state, i18nextInstance);
      break;
    case 'userUi.modalPostId':
      renderModal(state, elements.modal, value);
      break;
    case 'userUi.idsOfReadPosts':
      renderPostAsRead(state, elements.postsContainer);
      break;
    default:
      throw new Error(`Unknown 'path': ${path}`);
  }
});
