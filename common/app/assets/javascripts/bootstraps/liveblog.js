define([
    'common/utils/mediator',
    'common/$',
    'qwery',
    'bonzo',
    'bean',
    'lodash/functions/throttle',
    'common/_',
    'common/utils/scroller',
    'common/utils/detect',
    'common/modules/ui/autoupdate',
    'common/modules/live/filter',
    'common/modules/ui/notification-counter',
    'common/modules/experiments/affix'
], function (
    mediator,
    $,
    qwery,
    bonzo,
    bean,
    _throttle,
    _,
    scroller,
    detect,
    AutoUpdate,
    LiveFilter,
    NotificationCounter,
    Affix
) {
    'use strict';

    var affix = null;

    function getKeyEvents() {
        return qwery('.live-blog__blocks .is-key-event').slice(0, 9);
    }

    function createScrollTransitions(){

        var selectedClass = 'live-blog__key-event--selected';

        function unselect() {
            bonzo(qwery('.'+selectedClass)).removeClass(selectedClass);
        }

        var curBinding;
        function unselectOnScroll() {
            bean.off(curBinding);
            curBinding = bean.one(document, 'scroll', function() { unselect(); });
        }

        bean.on(qwery('.timeline')[0], 'click', '.timeline__link', function(e){
            mediator.emit('module:liveblog:showkeyevents', true);
            var el = e.currentTarget,
                eventId = bonzo(el).attr('data-event-id'),
                targetEl = qwery('#'+eventId),
                dim = bonzo(targetEl).offset();
            scroller.scrollTo(dim.top, 500, 'easeOutQuint');
            window.setTimeout(unselectOnScroll, 550);
            bean.off(curBinding);
            unselect();
            bonzo(el).addClass(selectedClass);
            e.stop();
        });
    }

    function createKeyEventHTML(el) {
        var keyEventTemplate =
            '<li class="timeline__item" data-event-id="{id}">' +
            '<a class="timeline__link" href="#{id}" data-event-id="{id}">' +
            '<span class="timeline__date">{time}</span><span class="timeline__title">{title}</span></a></li>';
        keyEventTemplate = keyEventTemplate.replace(/{id}/g, el.getAttribute('id'));
        keyEventTemplate = keyEventTemplate.replace(/{title}/g, $('.block-title', el).text());
        keyEventTemplate = keyEventTemplate.replace(/{time}/g, $('.block-time', el).html());

        return keyEventTemplate;
    }

    function getTimelineHTML(events) {
        var remaining;
        function recursiveRender(events, html) {
            if (events.length) { // key event at 0 index
                html += createKeyEventHTML(events[0]);
                remaining = events.slice(1);
            } else { // no events left
                return html;
            }
            return recursiveRender(remaining, html);
        }

        return recursiveRender(events, '');
    }

    function createTimeline() {
        mediator.on('page:article:ready', function(config, context) {
            var allEvents = getKeyEvents();
            var timelineHTML = getTimelineHTML(allEvents);
            context = qwery('.js-live-blog__timeline', context);
            bonzo(context).append(timelineHTML);

            if(/desktop|wide/.test(detect.getBreakpoint())) {
                affix = new Affix({
                    element: qwery('.js-live-blog__timeline-container')[0],
                    topMarker: qwery('.js-top-marker')[0],
                    bottomMarker: qwery('.js-bottom-marker')[0],
                    containerElement: qwery('.js-live-blog__key-events')[0]
                });
                createScrollTransitions();
            }
        });
    }

    function createAutoRefresh(){
        mediator.on('page:article:ready', function(config, context) {
            if (config.page.isLive) {

                var timerDelay = /desktop|wide/.test(detect.getBreakpoint()) ? 30000 : 60000;
                new AutoUpdate({
                    path: function() {
                        var id = context.querySelector('.article-body .block').id,
                            path = window.location.pathname;

                        return path + '.json' + '?lastUpdate=' + id;
                    },
                    delay: timerDelay,
                    attachTo: $('.article-body', context)[0],
                    switches: config.switches,
                    manipulationType: 'prepend'
                }).init();
            }
        });
    }

    function createFilter() {
        mediator.on('page:article:ready', function(config, context) {
            new LiveFilter($('.js-blog-blocks', context)[0]).render($('.js-live-filter')[0]);
            new NotificationCounter().init();
        });
    }

    return {
        init: function (config) {
            createAutoRefresh();
            createFilter();
            if(config.page.keywordIds.indexOf('football/football') < 0 && getKeyEvents().length > 0) {
                createTimeline();
            }
        }
    };
});