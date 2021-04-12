'use strict';

const Handlebars = require('handlebars');

module.exports = (server, options) => ({
    path: 'templates',
    partialsPath: 'templates/partials',
    helpersPath: 'templates/helpers',
    isCached: !options.developmentMode,
    defaultExtension: 'hbs',
    engines: {
        hbs: {
            module: Handlebars,
            compileMode: 'sync'
        }
    },
    context: {
        options,
        baseURI: server.realm.modifiers.route.prefix || ''
    },
    compileMode: 'sync'
});
