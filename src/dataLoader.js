// @ts-check

import axios from 'axios';

const allOriginsProxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true';

const addProxy = (url, proxyUrl) => {
  const proxyUrlObj = new URL(proxyUrl);
  proxyUrlObj.searchParams.set('url', url);
  return proxyUrlObj.href;
};

export default (requestUrl) => axios.get(addProxy(requestUrl, allOriginsProxyUrl));
