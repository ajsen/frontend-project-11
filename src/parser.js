// @ts-check

const getTextContent = (element) => element?.textContent || '';

const getPosts = (items) => {
  if (items.length === 0) {
    return [];
  }

  return Array.from(items).map((item) => {
    const title = item.querySelector('title');
    const description = item.querySelector('description');
    const link = item.querySelector('link');

    return {
      title: getTextContent(title),
      description: getTextContent(description),
      link: getTextContent(link),
    };
  });
};

const getFeed = (xmlDocument) => {
  const title = xmlDocument.querySelector('title');
  const description = xmlDocument.querySelector('description');
  const items = xmlDocument.getElementsByTagName('item');

  return {
    title: getTextContent(title),
    description: getTextContent(description),
    posts: getPosts(items),
  };
};

export default (xml) => {
  const xmlDocument = new DOMParser().parseFromString(xml, 'text/xml');
  const rootElement = xmlDocument.documentElement.nodeName;

  if (rootElement !== 'rss') {
    throw new Error('errors.invalid_rss');
  }

  return getFeed(xmlDocument);
};
