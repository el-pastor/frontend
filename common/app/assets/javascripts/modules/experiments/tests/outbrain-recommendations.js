define([
    'common/utils/detect',
    'common/utils/mediator',
    'common/modules/onward/right-hand-component-factory'
], function(
        detect,
        mediatory,
        RightHandComponentFactory
   ) {

   var OutbrainRecommendations = function() {

       var self = this;

       this.id = 'OutbrainRecommendations';
       this.expiry = '2014-02-28';
       this.audience = 0.2;
       this.audienceOffset = 0.0;
       this.description = 'Embeds the outbrain library on the page and for the tests uses their api to populate the right-hand menu';
       this.canRun = function(config) {
          return true;
       };

       this.variants = [
           {
               id: 'control',
               test: function(context, config) {}
           },
           {
               id: 'show-outbrain-recommendations',
               test: function(context, config) {
                   RightHandComponentFactory.setRecommenedForYou("outbrain");
               }
           }
       ];
   };

   return OutbrainRecommendations;

});