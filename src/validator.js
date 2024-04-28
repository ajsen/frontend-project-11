// @ts-check

import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'url.invalid',
  },
  mixed: {
    required: 'url.required',
    notOneOf: 'url.exists',
  },
});

export default (newUrl, initialState) => {
  const existingUrls = initialState.uiState.newsFeed.feeds.map(({ link }) => link);
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(existingUrls);
  return schema
    .validate(newUrl, { abortEarly: true })
    .then(() => null)
    .catch((error) => error);
};
