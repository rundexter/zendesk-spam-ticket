var util = require('./util.js'),
    pickInputs = {
        'id': { key: 'id', validate: { req: true }}
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            token = dexter.environment('zendesk_token'),
            username = dexter.environment('zendesk_username'),
            subdomain = dexter.environment('zendesk_subdomain');

        if (!token || !username || !subdomain)
            return this.fail('A [zendesk_token,zendesk_username,zendesk_subdomain] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        var request = require('request').defaults({
            baseUrl: 'https://' + subdomain + '.zendesk.com/api/v2/'
        });

        request.put({
            uri: '/tickets/' + inputs.id+ '/mark_as_spam.json',
            auth: {
                user: username.concat('/token'),
                pass: token
            },
            json: true
        }, function (err, response, result) {
            if (err || (result && result.error))
                this.fail(err || result);
            else
                this.complete({ success: true });
        }.bind(this));
    }
};
