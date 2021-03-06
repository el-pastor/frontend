define([
    'common/$',
    'bean',
    'bonzo',
    'qwery',
    'helpers/fixtures',
    'common/modules/adverts/slice-adverts'
], function(
    $,
    bean,
    bonzo,
    qwery,
    fixtures,
    SliceAdverts
){

    describe('Slice Adverts', function() {

        var fixturesConfig = {
                id: 'slice-adverts',
                fixtures: [
                    '<div class="container container-first"><div class="linkslist-container facia-slice-wrapper--ad"><div class="slice"></div></div></div>',
                    '<div class="container container-second"></div>',
                    '<div class="container container-third"><div class="facia-slice-wrapper--ad"><div class="slice"></div></div></div>',
                    '<div class="container container-fourth"><div class="facia-slice-wrapper--ad"><div class="slice"></div></div></div>',
                    '<div class="container container-fifth"><div class="facia-slice-wrapper--ad"><div class="slice"></div></div></div>'
                ]
            },
            createSwitch = function(isOn){
                return {
                    switches: {
                        standardAdverts: isOn
                    }
                };
            };

        beforeEach(function() {
            fixtures.render(fixturesConfig);
        });

        afterEach(function() {
            fixtures.clean(fixturesConfig.id);
        });

        it('should be able to instantiate', function() {
            var sliceAdverts = new SliceAdverts();
            expect(sliceAdverts).toBeDefined();
        });

        it('should not initiated if standard-adverts switch is off', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(false));
            expect(sliceAdverts.init()).toBeFalsy();
        });

        it('should only create a maximum of 2 advert slots', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            expect(qwery('.facia-slice-wrapper--ad .ad-slot').length).toEqual(2);
        });

        it('should have the correct ad names', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            var $adSlots = $('.facia-slice-wrapper--ad .ad-slot').map(function(slot) { return $(slot); });
            expect($adSlots[0].data('name')).toEqual('inline1');
            expect($adSlots[1].data('name')).toEqual('inline2');
        });

        it('should have the correct size mappings', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            $('.facia-slice-wrapper--ad .ad-slot')
                .map(function(slot) { return $(slot); })
                .forEach(function($adSlot) {
                    expect($adSlot.data('mobile')).toEqual('300,50');
                    expect($adSlot.data('tabletportrait')).toEqual('300,250');
                });
        });

        it('should move the existing content', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            qwery('.facia-slice-wrapper--ad .facia-slice__item').forEach(function(slot) {
                expect(bonzo(slot.children[0]).hasClass('slice')).toBe(true);
            });
        });

        it('should change collection classes', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init().forEach(function($adSlice) {
                expect($adSlice.hasClass('linkslist-container')).toEqual(false);
                expect($adSlice.hasClass('facia-slice-wrapper facia-slice-wrapper--position-2')).toEqual(true);
            });
        });

        it('should have at least two non-advert containers between advert containers', function() {
            var sliceAdverts = new SliceAdverts(createSwitch(true));
            sliceAdverts.init();
            expect(qwery('.container-first .ad-slot').length).toBe(1);
            expect(qwery('.container-fourth .ad-slot').length).toBe(1);
        });

    });

});
