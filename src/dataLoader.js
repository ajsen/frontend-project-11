// @ts-nocheck

import axios from 'axios';

const proxyUrl = 'https://allorigins.hexlet.app/get?disableCache=true&url=';

export default (requestUrl) => axios.get(`${proxyUrl}${requestUrl}`);
