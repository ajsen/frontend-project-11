// @ts-nocheck
/* eslint-disable no-param-reassign */

import { find } from 'lodash';

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

  const { feeds } = initialState.newsFeed.uiState;
  const reversedFeeds = feeds.toReversed();
  const feedsElements = reversedFeeds.map(buildFeedElement);
  const feedList = document.createElement('ul');
  feedList.classList.add('list-group', 'border-0', 'rounded-0');
  feedList.append(...feedsElements);
  const cardTitleText = i18nextInstance.t('news_feed.feeds');
  const card = buildCard(cardTitleText);
  elements.feedsColumn.innerHTML = '';
  elements.feedsColumn.append(card, feedList);
};

const renderPosts = (elements, initialState, i18nextInstance) => {
  const buildPostElement = (post) => {
    const title = document.createElement('a');
    const { ids: readPostsIds } = initialState.newsFeed.uiState.readPosts;
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
    button.textContent = i18nextInstance.t('news_feed.view');

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

  const { posts } = initialState.newsFeed.uiState;
  const reversedPosts = posts.toReversed();
  const postsElements = reversedPosts.map(buildPostElement);
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsList.append(...postsElements);
  const cardTitleText = i18nextInstance.t('news_feed.posts');
  const card = buildCard(cardTitleText);
  elements.postsColumn.innerHTML = '';
  elements.postsColumn.append(card, postsList);
};

const renderModal = (elements, initialState, id) => {
  const { posts } = initialState.newsFeed.uiState;
  const post = find(posts, { id });
  const { title, description, link } = post;
  elements.modalTitle.textContent = title;
  elements.modalBody.textContent = description;
  elements.modalButton.setAttribute('href', link);
};

const renderPostAsRead = (postId) => {
  const postTitle = document.querySelector(`[data-id="${postId}"]`);
  postTitle.classList.replace('fw-bold', 'fw-normal');
};

const renderSuccessFeedback = (elements, i18nextInstance) => {
  elements.urlFormInput.classList.remove('is-invalid');
  elements.feedbackParagraph.classList.replace('text-danger', 'text-success');
  elements.feedbackParagraph.textContent = i18nextInstance.t('feedback.rss_loaded');
};

const renderErrorFeedback = (elements, i18nextInstance, error) => {
  if (error === null) {
    elements.urlFormInput.classList.remove('is-invalid');
    elements.feedbackParagraph.textContent = '';
    return;
  }

  elements.urlFormInput.classList.add('is-invalid');
  elements.feedbackParagraph.classList.replace('text-success', 'text-danger');
  elements.feedbackParagraph.textContent = i18nextInstance.t(error.message);
};

const handleProcessState = (elements, initialState, i18nextInstance, processState) => {
  const { urlForm, urlFormInput, urlFormSubmitButton } = elements;

  switch (processState) {
    case 'filling':
      urlFormInput.disabled = false;
      urlFormSubmitButton.disabled = false;
      break;
    case 'loading':
      urlFormInput.disabled = true;
      urlFormSubmitButton.disabled = true;
      break;
    case 'loaded':
      renderSuccessFeedback(elements, i18nextInstance);
      renderPosts(elements, initialState, i18nextInstance);
      renderFeeds(elements, initialState, i18nextInstance);
      urlFormInput.disabled = false;
      urlFormSubmitButton.disabled = false;
      urlForm.reset();
      urlFormInput.focus();
      break;
    case 'failed':
      urlFormInput.disabled = false;
      urlFormSubmitButton.disabled = false;
      urlFormInput.focus();
      break;
    default:
      throw new Error(`Unknown 'processState': ${processState}`);
  }
};

export default (elements, initialState, i18nextInstance) => (path, value, prevValue) => {
  console.log(path, value, prevValue);

  switch (path) {
    case 'feedAddingProcess.validationState':
      elements.urlFormSubmitButton.disabled = value === 'invalid';
      break;
    case 'feedAddingProcess.processError':
      renderErrorFeedback(elements, i18nextInstance, value);
      break;
    case 'feedAddingProcess.processState':
      handleProcessState(elements, initialState, i18nextInstance, value);
      break;
    case 'newsFeed.uiState.posts':
      renderPosts(elements, initialState, i18nextInstance);
      break;
    case 'newsFeed.uiState.readPosts.currentPostId':
      renderPostAsRead(value);
      break;
    case 'newsFeed.uiState.modal.postId':
      renderModal(elements, initialState, value);
      break;
    default:
      throw new Error(`Unknown "path": ${path}`);
  }
};
