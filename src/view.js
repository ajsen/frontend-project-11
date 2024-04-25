// @ts-check
/* eslint-disable no-param-reassign */

import { keyBy } from 'lodash';

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

const renderFeeds = (elements, initialState, i18nextInstance) => {
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
  elements.feedsColumn.innerHTML = '';
  elements.feedsColumn.append(card, feedList);
};

const renderPosts = (elements, initialState, i18nextInstance) => {
  const buildPostElement = (post, buttonText) => {
    const title = document.createElement('a');
    const { readPosts } = initialState.uiState.newsFeed;
    const readPostsById = keyBy(readPosts, 'id');
    const titleClassName = readPostsById[post.id] ? 'fw-normal' : 'fw-bold';
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
    const handlePostButton = () => {
      title.classList.replace('fw-bold', 'fw-normal');
      initialState.uiState.newsFeed.readPosts.push(post);
    };
    button.addEventListener('click', handlePostButton);

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
  const buttonText = i18nextInstance.t('news_feed.posts.view');
  const postsElements = sortedPosts.map((post) => buildPostElement(post, buttonText));
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsList.append(...postsElements);
  const cardTitleText = i18nextInstance.t('news_feed.posts.title');
  const card = buildCard(cardTitleText);
  elements.postsColumn.innerHTML = '';
  elements.postsColumn.append(card, postsList);
};

const renderModal = (elements, modalPost) => {
  elements.modalTitle.textContent = modalPost.title;
  elements.modalBody.textContent = modalPost.description;
  elements.modalButton.setAttribute('href', modalPost.link);
};

const renderSuccessFeedback = (elements, i18nextInstance) => {
  elements.urlInput.classList.remove('is-invalid');
  elements.feedback.classList.replace('text-danger', 'text-success');
  elements.feedback.textContent = i18nextInstance.t('rss_form.feedback.success.rss_loaded');
};

const clearErrorFeedback = (elements) => {
  elements.urlInput.classList.remove('is-invalid');
  elements.feedback.textContent = '';
};

const showErrorFeedback = (elements, errorMessage) => {
  elements.urlInput.classList.add('is-invalid');
  elements.feedback.textContent = errorMessage;
};

const hasElementClass = (element, className) => element.classList.contains(className);

const renderErrorFeedback = (elements, i18nextInstance, error, prevError) => {
  if (error === null && prevError === null) {
    return;
  }

  if (error === null) {
    clearErrorFeedback(elements);
    return;
  }

  if (hasElementClass(elements.feedback, 'text-success')) {
    elements.feedback.classList.replace('text-success', 'text-danger');
  }
  const errorMessage = i18nextInstance.t(error.message);
  showErrorFeedback(elements, errorMessage);
};

const handleProcessState = (elements, initialState, i18nextInstance, processState) => {
  switch (processState) {
    case 'filling':
      elements.urlInput.disabled = false;
      elements.formSubmitButton.disabled = false;
      break;
    case 'loading':
      elements.urlInput.disabled = true;
      elements.formSubmitButton.disabled = true;
      break;
    case 'loaded':
      renderSuccessFeedback(elements, i18nextInstance);
      renderPosts(elements, initialState, i18nextInstance);
      renderFeeds(elements, initialState, i18nextInstance);
      elements.urlInput.disabled = false;
      elements.formSubmitButton.disabled = false;
      elements.form.reset();
      elements.urlInput.focus();
      break;
    case 'failed':
      elements.urlInput.disabled = false;
      elements.formSubmitButton.disabled = false;
      elements.urlInput.focus();
      break;
    default:
      throw new Error(`Unknown 'processState': ${processState}`);
  }
};

export default (elements, initialState, i18nextInstance) => (path, value, prevValue) => {
  switch (path) {
    case 'feedAddingProcess.validationState':
      elements.formSubmitButton.disabled = value === 'invalid';
      break;
    case 'feedAddingProcess.processError':
      renderErrorFeedback(elements, i18nextInstance, value, prevValue);
      break;
    case 'feedAddingProcess.processState':
      handleProcessState(elements, initialState, i18nextInstance, value);
      break;
    case 'uiState.newsFeed.posts':
      renderPosts(elements, initialState, i18nextInstance);
      break;
    case 'uiState.modal.post':
      renderModal(elements, value);
      break;
    default:
      throw new Error(`Unknown "path": ${path}`);
  }
};
