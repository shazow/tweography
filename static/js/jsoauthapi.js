function parse_hash(hash) {
    if(!hash) return; // No hash

    var params_str = hash.split("?", 2);
    if(params_str.length==1) return; // No params

    var remainder_hash = params_str[0];
    var params_hash = params_str[1];

    var params = {};
    $.each(params_hash.split("&"), function(i, s) {
        kv = s.split("=", 2);
        params[kv[0]] = kv[1];
    });

    if(suffers_from_ie) {}
    else
        window.location.hash = remainder_hash; /// FIXME: IE doesn't like this line

    return params;
}

function check_cookies() {
    var data = {};
    $.each(["secret", "token", "consumer_secret", "consumer_key"], function(i, s) {
        var v = get_cookie(s);
        if(!v) return;
        data[s] = v;
    });
    return data;
}

function clear_cookies() {
    $.each(["secret", "token", "consumer_secret", "consumer_key"], function(i, s) {
        delete_cookie(s);
    });
}

function save_cookies(data) {
    $.each(["secret", "token", "consumer_secret", "consumer_key"], function(i, s) {
        var v = data[s];
        if(!v) return;

        set_cookie(s, v, 60*60*24);
    });
}

function load_accessor(data) {
    if(!(data.secret && data.token && data.consumer_secret && data.consumer_key)) {
        return;
    }
    OAuth.accessor = {
        tokenSecret: data.secret,
        token: data.token,
        consumerSecret: data.consumer_secret,
        consumerKey: data.consumer_key
    };
    save_cookies(data);
}

google.setOnLoadCallback(function() {
    var data = parse_hash(window.location.hash);
    if(!data) {
        data = check_cookies();
    }
    if(data) load_accessor(data);

    OAuth.auth_redirect = function() {
        window.location.replace("http://jsoauth.appspot.com/api?function=auth&app=" + OAuth.app);
    }

    OAuth.get_signed_url = function(url, parameters, method) {
        if(OAuth.accessor == undefined) {
            return OAuth.auth_redirect();
        }

        var message = {
            action: url,
            method: method ? method : "GET",
            parameters: parameters
        };
        message.parameters['oauth_signature_method'] = 'HMAC-SHA1';

        OAuth.completeRequest(message, OAuth.accessor);
        var signed_url = OAuth.addToURL(message.action, message.parameters); 

        return signed_url;
    }

    OAuth.getJSON = function(url, parameters, callback_success, callback_error) {
        parameters['callback'] = "json_callback";

        var signed_url = OAuth.get_signed_url(url, parameters);

        function try_again_callback() {
            return $.jsonp({
                success: callback_success,
                error: callback_error,
                callback: "json_callback",
                url: signed_url
            });
        }

        return $.jsonp({
            success: callback_success,
            error: try_again_callback,
            callback: "json_callback",
            url: signed_url
        });
    }

    OAuth.post = function(url, parameters, callback) {
        var signed_url = OAuth.get_signed_url(url, parameters, "POST");

        var fname = "tmpframe_" + (+new Date());
        var f = $('<form></form>').css('display', 'none').attr('method', 'POST').attr('action', signed_url).attr('target', fname).appendTo("body");
        var iframe = $('<iframe src="about:blank"></iframe>').attr('name', fname).css('display', 'none').appendTo("body").load(function() {
            callback(this);

            // Cleanup
            $(f).remove()
            $(iframe).remove();
        });
        f.submit();
    }
});


/***/

/* Cookie helpers stolen from:
 *  http://www.quirksmode.org/js/cookies.html
 */

function set_cookie(name, value, seconds) {
    if (seconds) {
        var date = new Date();
        date.setTime(date.getTime()+(seconds*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function get_cookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function delete_cookie(name) {
    set_cookie(name, "", -1000);
}

