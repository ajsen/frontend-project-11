// @ts-check

import onChange from 'on-change';
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
    const titleClassName = idsOfReadPosts.has(post.id) ? 'fw-normal' : 'fw-bold';
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
  const modalPost = state.posts.find((post) => post.id === modalPostId);
  // eslint-disable-next-line no-param-reassign
  modal.title.textContent = modalPost.title;
  // eslint-disable-next-line no-param-reassign
  modal.body.textContent = modalPost.description;
  modal.button.setAttribute('href', modalPost.link);
};

const clearFeedbackMessage = (feedbackParagraph) => {
  // eslint-disable-next-line no-param-reassign
  feedbackParagraph.textContent = '';
};

const showFeedbackMessage = (feedbackParagraph, message) => {
  // eslint-disable-next-line no-param-reassign
  feedbackParagraph.textContent = message;
};

const renderFeedbackError = (i18nextInstance, feedbackParagraph, error) => {
  if (!error) {
    clearFeedbackMessage(feedbackParagraph);
    feedbackParagraph.classList.remove('text-danger');
    return;
  }
  const errorMessage = i18nextInstance.t(error.message);
  showFeedbackMessage(feedbackParagraph, errorMessage);
  feedbackParagraph.classList.add('text-danger');
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
    case 'waiting':
      elements.feedbackParagraph.classList.remove('text-success');
      clearFeedbackMessage(elements.feedbackParagraph);
      break;
    case 'loading':
      disableForm(elements.rssForm);
      break;
    case 'loaded':
      elements.feedbackParagraph.classList.add('text-success');
      showFeedbackMessage(elements.feedbackParagraph, i18nextInstance.t('rss.loaded'));
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

export default (state, i18nextInstance, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.isValid':
      toggleElementClass(elements.rssForm.inputField, 'is-invalid', !value);
      elements.rssForm.inputField.focus();
      break;
    case 'form.errors':
      renderFeedbackError(i18nextInstance, elements.feedbackParagraph, value);
      break;
    case 'feedLoadingProcess.status':
      handleProcessStatus(i18nextInstance, elements, value);
      break;
    case 'feedLoadingProcess.errors':
      renderFeedbackError(i18nextInstance, elements.feedbackParagraph, value);
      break;
    case 'posts':
      renderPosts(elements.postsContainer, state, i18nextInstance);
      break;
    case 'feeds':
      renderFeeds(elements.feedsContainer, state, i18nextInstance);
      break;
    case 'userUi.idsOfReadPosts':
      renderPosts(elements.postsContainer, state, i18nextInstance);
      break;
    case 'userUi.modalPostId':
      renderModal(state, elements.modal, value);
      break;
    default:
      break;
  }
});
