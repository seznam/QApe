# Changelog

All notable changes to this project will be documented in this file.

## [v0.3.2](https://github.com/seznam/QApe/compare/v0.3.1...v0.3.2) - 2019-03-01

### Commits

- Improve page error handling [`2af2a2d`](https://github.com/seznam/QApe/commit/2af2a2d20b0f56d0cfca06af57d9c36f1c2b9f4e)
- Add page crash handler and fix problem with hanging chrome instances after longer test run [`05ee4a0`](https://github.com/seznam/QApe/commit/05ee4a0c6e5a1ae7325bbaadef420f1a1aa963f9)
- Add shouldRequestCauseError configuration [`cfbd031`](https://github.com/seznam/QApe/commit/cfbd03153424306c26773927296bb4cd5c65d9bc)

## [v0.3.1](https://github.com/seznam/QApe/compare/v0.3.0...v0.3.1) - 2019-02-25

### Commits

- Fix tests [`e30a843`](https://github.com/seznam/QApe/commit/e30a843e0b64c4f1a586b46d555a15f6ef515502)
- Fix display of execution error from random scenario [`9d33b27`](https://github.com/seznam/QApe/commit/9d33b27d1d7c28d66f18ab20393477aaa0035352)
- Requests with status code >= 500 will now cause error (instead of >= 400) [`39ba9f2`](https://github.com/seznam/QApe/commit/39ba9f268d648cc5d32aa6035953b8c73570ed99)

## [v0.3.0](https://github.com/seznam/QApe/compare/v0.2.2...v0.3.0) - 2019-02-24

### Commits

- Response status of any page request >= 400 will be now considered a page error [`b27d5fc`](https://github.com/seznam/QApe/commit/b27d5fc61287dc2eb0456f685147168c85aa2ae2)
- Fix proper respawn of reporter and scriptwriter on exit [`04909b1`](https://github.com/seznam/QApe/commit/04909b112533a916b1125eef594ff6af8a5010b4)
- Update to latest dependencies [`ebb7d5b`](https://github.com/seznam/QApe/commit/ebb7d5bb32a3c91318f586f6a0260c85b76e4262)

## [v0.2.2](https://github.com/seznam/QApe/compare/v0.2.1...v0.2.2) - 2019-02-04

### Commits

- Log selected element html to the report along with its selector [`0641079`](https://github.com/seznam/QApe/commit/0641079967e05e3290c347b9980e333d3d930f04)
- Fix defined scenarios execution error handling [`6d5a40f`](https://github.com/seznam/QApe/commit/6d5a40f16371b85e6e871d628e02c6e676fb5712)
- Update config documentation [`91c8627`](https://github.com/seznam/QApe/commit/91c8627ec64beb501b929882dd6c839327e3ab54)

## [v0.2.1](https://github.com/seznam/QApe/compare/v0.2.0...v0.2.1) - 2019-02-01

### Commits

- Fix unit tests [`320780f`](https://github.com/seznam/QApe/commit/320780f8b05df2481785c4e249dc944ceaa3401b)
- Fix execution error logging [`3fa910c`](https://github.com/seznam/QApe/commit/3fa910c047ca9e264f976ab94f298791255f90db)

## [v0.2.0](https://github.com/seznam/QApe/compare/v0.1.1...v0.2.0) - 2019-02-01

### Commits

- Rewrite QApe with cluster. It is now separated to multiple processes. This fixes an error, when page crashed an QApe got stuck. [`684baf6`](https://github.com/seznam/QApe/commit/684baf659456df1b3ed3b1e8bc7e6c2847fe1535)
- Fix console log "undefined" at the end of the test run [`40336da`](https://github.com/seznam/QApe/commit/40336da76d739ae68931253eee681278eb5ce021)
- Fix unit tests [`ef34c1a`](https://github.com/seznam/QApe/commit/ef34c1ac451fc54c691615e4ba9b8ab09818c7b6)

## [v0.1.1](https://github.com/seznam/QApe/compare/v0.1.0...v0.1.1) - 2018-12-21

### Commits

- Fix QApe run; Fix release process [`7150359`](https://github.com/seznam/QApe/commit/7150359ea463690e8335f44a831f14d68ad4f69a)

## [v0.1.0](https://github.com/seznam/QApe/compare/v0.0.5...v0.1.0) - 2018-12-21

### Commits

- Add project utils; Update documentation [`d71af16`](https://github.com/seznam/QApe/commit/d71af16b5a87d30af4957e5c6f1fe770c199b021)
- Deploy documentation to github pages [`dbe4cde`](https://github.com/seznam/QApe/commit/dbe4cdef39079d89759e4b1d0667850a77a57af4)
- Fix recovery from page crash error; Add tests and documentation [`20e46df`](https://github.com/seznam/QApe/commit/20e46df7607fc525bf70728c30aba826f2e3a2b8)

## [v0.0.5](https://github.com/seznam/QApe/compare/v0.0.4...v0.0.5) - 2018-12-11

### Commits

- Improve documentation [`a6c3e82`](https://github.com/seznam/QApe/commit/a6c3e82f19abf56b551baee72361c9aeb3688662)
- Add travis-ci [`6fb2345`](https://github.com/seznam/QApe/commit/6fb23454c82fcc723990a1996cff795d46d87bab)
- Updated README.md with badges and gif [`a4607e5`](https://github.com/seznam/QApe/commit/a4607e5cb5de55171594ce5cf834dcb7f05c3895)

## [v0.0.4](https://github.com/seznam/QApe/compare/v0.0.3...v0.0.4) - 2018-12-11

### Commits

- New default reporters created: [`7f03ddd`](https://github.com/seznam/QApe/commit/7f03ddd50e8d05f4529087eb5f7eaa04fc357f07)
- Update documentation with new config options [`d5ddabd`](https://github.com/seznam/QApe/commit/d5ddabd976f746a7ffd8676fd3135080c14bb627)
- Fix FileReporterSpec tests [`e2a6745`](https://github.com/seznam/QApe/commit/e2a674530dc74e11e685fdb92646f65f274ac466)

## [v0.0.3](https://github.com/seznam/QApe/compare/v0.0.2...v0.0.3) - 2018-11-17

### Commits

- Updated cli syntax; Added infinity run option; Minor code style updates [`f88828d`](https://github.com/seznam/QApe/commit/f88828d992aebe4be566e4e6da41e5e5c92a7879)
- Fixed report for random scenario when no error found; Updated isElementVisible method to use puppeteer method to check element visibility [`69807e1`](https://github.com/seznam/QApe/commit/69807e17df2e83573febc63fa87b2461cd2db211)
- Add auto-changelog to generate changelog from commits for each release [`204fdca`](https://github.com/seznam/QApe/commit/204fdca1ff18abc093724ff5950f4ed98c5f4618)

## [v0.0.2](https://github.com/seznam/QApe/compare/v0.0.1...v0.0.2) - 2018-11-16

### Commits

- Reporter is now EventEmitter; You can also defined custom reporters; Dropped progress bars [`3b2881d`](https://github.com/seznam/QApe/commit/3b2881d5558de1c4b4181340e1fb8d93c5961d8e)
- Rename [`7b02edb`](https://github.com/seznam/QApe/commit/7b02edb50d7f86e80577c7003d4d9df8336eadd0)
- Updated default config file [`77df689`](https://github.com/seznam/QApe/commit/77df689506bb2eb58a13517cde27795eb706604a)

## v0.0.1 - 2018-11-09

### Commits

- Added unit tests and documentation; Updated example page [`823720a`](https://github.com/seznam/QApe/commit/823720aef7d1f533744e15f386ea06b71b4a0981)
- #! Init Opicak [`4c1dacc`](https://github.com/seznam/QApe/commit/4c1dacc53746376bcb25a3d5638fb1d360d5c95a)
- Rename [`c878cae`](https://github.com/seznam/QApe/commit/c878cae74109e8b565c32a805169fec555836301)
