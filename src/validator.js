import { object, string, setLocale } from 'yup';

setLocale({
  string: {
    url: 'feedback.errors.invalid_url',
  },
});

const schema = object({
  url: string().url(),
});

export default (field) => schema.validate(field, { abortEarly: false })
  .then(() => [])
  .catch(({ errors }) => errors);
