module.exports = {
  source: {
    files : [],
    extractors: []
  },

  processing: {
    tagParser: null,
    processors: [],
    tagDefinitions: []
  },

  rendering: {
    templateFolder: './templates',
    filters: [],
    tags: [],
    extra: {},
    outputFolder: './build'
  },

  logging: {
    level: 'info'
  }
};