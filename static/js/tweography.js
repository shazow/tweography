/// TODO: Change twitter.com to api.twitter.com
var twitter_api = function() {
    this.remaining_hits = 150;

    this.prototype = {
        query_twitter: function(api_target, params, callback) {
            this.remaining_hits -= 1;
            return OAuth.getJSON(api_target, params, callback, function() {
                log("Twitter API is suffering from epic failulitis. Refresh and hope for the best?");       
            });
        },
        check_limit: function(callback) {
            var api_target = "https://twitter.com/account/rate_limit_status.json"
            var self = this;
            return query_twitter(api_target, {}, function(data) {
                self.remaining_hits = data.remaining_hits;
                callback();
            });

        },
        user_timeline: function(screen_name, callback) {
            var api_target = "https://twitter.com/users/show.json";
            this.query_twitter(api_target, {screen_name: screen_name}, callback);
        },
        verify_credentials: function(callback) {
            var api_target = "http://twitter.com/account/verify_credentials.json";
            this.query_twitter(api_target, {}, callback);
        }
    };

}();
