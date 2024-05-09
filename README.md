## Hexlet RSS feed reader

### Hexlet tests and linter status:

[![Actions Status](https://github.com/ajsen/frontend-project-11/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/ajsen/frontend-project-11/actions)
[![Maintainability](https://api.codeclimate.com/v1/badges/adecc15f2a33be29cd15/maintainability)](https://codeclimate.com/github/ajsen/frontend-project-11/maintainability)
[![Run tests](https://github.com/ajsen/frontend-project-11/actions/workflows/run-tests.yml/badge.svg)](https://github.com/ajsen/frontend-project-11/actions/workflows/run-tests.yml)

### About the project:

#### Description:

The project is a website that allows users to subscribe to RSS feeds. Users can enter a URL into the form input field and submit it and receive post updates from subscribed RSS feeds.

![The site](/assets/images/app.png)

[Link to the site](https://frontend-project-11-pi-five.vercel.app/)

#### What the app can do:

* Validate entered URL
* Output errors if the provided URL is invalid
* Load data from valid URLs
* Parses data (XML) and extract posts from it
* Outputs errors if the provided data doesn't contain an RSS feed or if a parsing error occurs
* Check for updates for added RSS feeds every 5 seconds, then get new posts from them and display them
* Display a modal window for each post that contains the post description, title, and a link to the article
* Mark a post as read when the "View" button for that post is clicked

#### Used technologies:

* JavaScript
* UI: [Bootstrap](https://github.com/twbs/bootstrap)
* Bundling: [Webpack](https://github.com/webpack/webpack)
* Internationalization: [i18next](https://github.com/i18next/i18next)
* HTTP requests: [Axios](https://github.com/axios/axios)
* Validation: [yup](https://github.com/jquense/yup)

### Installation and building:

#### Requirements:

* [Node.js](https://nodejs.org/en) 18.0.0 and above

#### To install the project on your computer:

1. Clone this repository: `git clone https://github.com/ajsen/frontend-project-11.git`
2. On the project's root directory: `npm ci` or `make install`

#### To build the project, run this command:

3. `webpack --mode production --config webpack.config.js` or `make build`

For testing purposes, you can use this RSS feed generator: https://lorem-rss.hexlet.app/