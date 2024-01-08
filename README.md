## React Server Component Logger

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A beautiful and highly configurable network request logger for react server components.

## Install

```bash
npm install rsc-logger
yarn add rsc-logger
```

## Usage

```ts
import RSC_LOGGER from './rsc-logger';

export const logger = RSC_LOGGER.init();

// page.tsx
export default function Home() {
  logger.attachLogger();

  return (...);
}

```

## API

```ts
RSC_LOGGER.init(options);
```

#### options

```ts
type LogModes = 'info' | 'debug' | 'error';
type LogTypes = 'all' | 'fetch' | 'image' | 'js' | 'css' | 'html' | 'unknown';
type Columns =
  | 'requestType'
  | 'responseStatus'
  | 'duration'
  | 'url'
  | 'responseSize'
  | 'filename'
  | 'timestamp';
type URLOptions = { host?: boolean; pathname?: 'full' | 'short'; search?: boolean };

type LoggerType = {
  mode?: LogModes;
  type?: LogTypes;
  columns?: Columns[];
  urlOptions?: URLOptions;
};
```

### Configure Example

```ts
import RSC_LOGGER from './rsc-logger';

export const logger = RSC_LOGGER.init({
  mode: 'debug',
  type: 'fetch',
  columns: ['requestType', 'responseStatus', 'duration', 'url', 'responseSize', 'timestamp'],
  urlOptions: { host: false, pathname: 'short', search: true },
});
```

[build-img]: https://github.com/abdify/rsc-logger/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/abdify/rsc-logger/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/rsc-logger
[downloads-url]: https://www.npmtrends.com/rsc-logger
[npm-img]: https://img.shields.io/npm/v/rsc-logger
[npm-url]: https://www.npmjs.com/package/rsc-logger
[issues-img]: https://img.shields.io/github/issues/abdify/rsc-logger
[issues-url]: https://github.com/abdify/rsc-logger/issues
[codecov-img]: https://codecov.io/gh/abdify/rsc-logger/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/abdify/rsc-logger
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
