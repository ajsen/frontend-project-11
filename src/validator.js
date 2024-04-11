// @ts-check

import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'feedback.errors.invalid_url',
  },
  mixed: {
    notOneOf: 'feedback.errors.existing_rss',
  },
});

export default (newUrl, existingUrls) => {
  const schema = yup
    .string()
    .trim()
    .url()
    .notOneOf(existingUrls);

  return schema.validate(newUrl);
};
