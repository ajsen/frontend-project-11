// @ts-check

import { uniqueId } from 'lodash';

const getPosts = (xmlDocument) => {
  const postElements = xmlDocument.getElementsByTagName('item');

  if (postElements.length === 0) {
    return [];
  }

  const posts = Array.from(postElements).map((postElement) => {
    const titleElement = postElement.querySelector('title');
    const descriptionElement = postElement.querySelector('description');
    const linkElement = postElement.querySelector('link');
    const pubDateElement = postElement.querySelector('pubDate');

    return {
      title: titleElement.textContent,
      description: descriptionElement.textContent,
      link: linkElement.textContent,
      id: uniqueId(),
      pubDate: Date.parse(pubDateElement.textContent),
    };
  });

  return posts;
};

const getFeed = (xmlDocument) => {
  const titleElement = xmlDocument.querySelector('title');
  const descriptionElement = xmlDocument.querySelector('description');

  return {
    title: titleElement.textContent,
    description: descriptionElement.textContent,
  };
};

const isValid = (xmlDocument) => {
  const errorElement = xmlDocument.querySelector('parsererror');
  const rootElement = xmlDocument.documentElement.nodeName;
  return errorElement || rootElement !== 'rss';
};

export default (xml) => new Promise((resolve, reject) => {
  const xmlDocument = new DOMParser().parseFromString(xml, 'text/xml');

  if (isValid(xmlDocument)) {
    const error = new Error('rss.invalid');
    reject(error);
    return;
  }

  const data = {
    feed: getFeed(xmlDocument),
    posts: getPosts(xmlDocument),
  };

  resolve(data);
});
