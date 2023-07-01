module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000/',
    viewportHeight: 1080,
    viewportWidth: 1920,
    waitForAnimations: true,
    watchForFileChanges: false,
    video: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
};