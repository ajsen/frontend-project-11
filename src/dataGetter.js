// @ts-check

import loadData from './dataLoader.js';
import parseData from './dataParser.js';

export default (url) => loadData(url).then((response) => parseData(response.data.contents));
