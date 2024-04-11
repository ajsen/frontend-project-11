// @ts-check

import { uniqueId } from 'lodash';

const getPosts = (xmlDocument) => {
  const postElements = xmlDocument.getElementsByTagName('item');

  if (postElements.length === 0) {
    return [];
  }

  return Array.from(postElements).map((postElement) => {
    const titleElement = postElement.querySelector('title');
    const descriptionElement = postElement.querySelector('description');
    const linkElement = postElement.querySelector('link');

    return {
      title: titleElement.textContent,
      description: descriptionElement.textContent,
      link: linkElement.textContent,
      id: uniqueId('post_'),
    };
  });
};

const getFeed = (xmlDocument) => {
  const titleElement = xmlDocument.querySelector('title');
  const descriptionElement = xmlDocument.querySelector('description');

  return {
    title: titleElement.textContent,
    description: descriptionElement.textContent,
    id: uniqueId('feed_'),
  };
};

export default (xml) => new Promise((resolve, reject) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(xml, 'text/xml');
  const errorElement = xmlDocument.querySelector('parsererror');
  const rootElement = xmlDocument.documentElement.nodeName;
  if (errorElement || rootElement !== 'rss') {
    reject(new Error('feedback.errors.invalid_rss'));
    return;
  }

  const feed = getFeed(xmlDocument);
  const posts = getPosts(xmlDocument);

  resolve({
    feed,
    posts,
  });
});
