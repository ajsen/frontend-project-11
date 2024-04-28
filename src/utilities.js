/* eslint-disable no-param-reassign */

export const setElementDisabled = (element, disabled) => {
  element.disabled = disabled;
};

export const toggleElementClass = (element, className, force) => {
  element.classList.toggle(className, force);
};
