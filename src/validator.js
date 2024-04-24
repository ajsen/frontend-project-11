// @ts-check

import * as yup from 'yup';

yup.setLocale({
  string: {
    url: 'feedback.errors.invalid_url',
  },
  mixed: {
    required: 'feedback.errors.required_field',
    notOneOf: 'feedback.errors.existing_rss',
  },
});

export default (newUrl, existingUrls) => {
  const schema = yup
    .string()
    .trim()
    .required()
    .url()
    .notOneOf(existingUrls);

  return schema.validate(newUrl, { abortEarly: true })
    .then(() => null)
    .catch((error) => error);
};
