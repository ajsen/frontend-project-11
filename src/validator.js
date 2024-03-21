import * as yup from 'yup';

const schema = yup.object({
  url: yup.string().url().required(),
});

export default (field) => schema.validate(field, { abortEarly: false })
  .then(() => [])
  .catch((err) => err.inner);
