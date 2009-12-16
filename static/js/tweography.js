/// TODO: Change twitter.com to api.twitter.com
function TwitterAPI() {
    this.remaining_hits = 15;
}
TwitterAPI.prototype = {
    query_twitter: function(api_target, params, callback) {
        this.remaining_hits -= 1;
        if(!OAuth) {
            log("OAuth not completed, can't query Twitter.");
            return;
        }
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
    user_timeline: function(params, callback) {
        if($.isFunction(params)) {
            callback = params;
            params = {};
        }

        var api_target = "https://twitter.com/statuses/user_timeline.json";
        this.query_twitter(api_target, params, callback);
    },
};

var twitter_api = new TwitterAPI();
