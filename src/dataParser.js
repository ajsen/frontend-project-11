// @ts-check

const getPosts = (xmlDocument) => {
  const postElements = xmlDocument.getElementsByTagName('item');

  if (!postElements.length) {
    return [];
  }

  const posts = Array.from(postElements).map((postElement) => {
    const titleElement = postElement.querySelector('title');
    const descriptionElement = postElement.querySelector('description');
    const linkElement = postElement.querySelector('link');
    const guidElement = postElement.querySelector('guid');
    const pubDateElement = postElement.querySelector('pubDate');

    return {
      title: titleElement.textContent,
      description: descriptionElement.textContent,
      link: linkElement.textContent,
      id: guidElement.textContent,
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
  return !errorElement && rootElement === 'rss';
};

export default (xml) => {
  const xmlDocument = new DOMParser().parseFromString(xml, 'text/xml');

  if (!isValid(xmlDocument)) {
    throw new Error('rss.invalid');
  }

  return {
    feed: getFeed(xmlDocument),
    posts: getPosts(xmlDocument),
  };
};
