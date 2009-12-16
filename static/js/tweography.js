var twitter_api = function() {
    this.remaining_hits = 150;

    this.prototype = {
        query_twitter: function(api_target, params, callback) {
            this.remaining_hits -= 1;
            return OAuth.getJSON(api_target, params, callback, function() {
                log("Twitter API is suffering from epic failulitis. Refresh and hope for the best?");       
            });
        },
        user_timeline: function(screen_name, callback) {
            var api_target = "http://twitter.com/users/show.format";
            this.query_twitter(api_target, {}, callback);
        },
        
    };

}();
