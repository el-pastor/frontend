/* global _: true */
define([
    'knockout',
    'modules/vars',
    'modules/content-api',
    'utils/as-observable-props',
    'utils/populate-observables',
    'utils/collection-guid'
], function(
    ko,
    vars,
    contentApi,
    asObservableProps,
    populateObservables,
    collectionGuid
) {
    var checkCount = 0;

    function Collection(opts) {
        opts = opts || {};

        this.id = opts.id || collectionGuid();

        this.parents = ko.observableArray();
        this.capiResults = ko.observableArray();

        this.meta   = asObservableProps([
            'displayName',
            'href',
            'groups',
            'type',
            'uneditable',
            'showTags',
            'showSections',
            'apiQuery']);

        populateObservables(this.meta, opts);

        if (_.isArray(this.meta.groups())) {
            this.meta.groups(this.meta.groups().join(','));
        }

        this.state = asObservableProps([
            'isOpen',
            'underDrag',
            'apiQueryStatus']);

        this.meta.apiQuery.subscribe(function(val) {
            if (this.state.isOpen()) {
                this.meta.apiQuery(val.replace(/\s+/g, ''));
                this.checkApiQueryStatus();
            }
        }, this);
    }

    Collection.prototype.toggleOpen = function() {
        this.state.isOpen(!this.state.isOpen());
    };

    Collection.prototype.close = function() {
        this.state.isOpen(false);
    };

    Collection.prototype.save = function() {
        if (vars.model.collections.indexOf(this) < 0) {
            vars.model.collections.unshift(this);
        }
        this.state.isOpen(false);
        this.state.apiQueryStatus(undefined);
        vars.model.save(this);
    };

    Collection.prototype.checkApiQueryStatus = function() {
        var self = this,
            apiQuery = this.meta.apiQuery(),
            cc;

        this.capiResults.removeAll();

        if (!apiQuery) {
            this.state.apiQueryStatus(undefined);
            return;
        }

        this.state.apiQueryStatus('check');

        checkCount += 1;
        cc = checkCount;

        apiQuery += apiQuery.indexOf('?') < 0 ? '?' : '&';
        apiQuery += 'show-editors-picks=true&show-fields=headline';

        contentApi.fetchContent(apiQuery)
        .always(function(results) {
            if (cc === checkCount) {
                self.capiResults(results);
                self.state.apiQueryStatus(results.length ? 'valid' : 'invalid');
            }
        });
    };

    Collection.prototype.discard = function() {
        vars.model.collections.remove(this);
        vars.model.save(this);
    };

    return Collection;
});
