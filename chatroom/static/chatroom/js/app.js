(function (window, Pusher, $) {

    Pusher.log = function (msg) {
        if (window.console && window.console.log) {
            window.console.log(msg);
        }
    };


    // Connect
    var csrftoken = getCookie('csrftoken');
    var pusher = new Pusher(CONFIG.PUSHER.PUSHER_KEY, {
        authEndpoint: 'auth/',
        auth: {
            headers: {
                'HTTP_X_CSRFTOKEN': csrftoken
            }
        }
    });
    pusher.connection.bind('state_change', function (change) {
        var el = $('.connection-status');
        el.removeClass(change.previous);
        el.addClass(change.current);
    });

    // Subscribe to messages channel

    var channel = pusher.subscribe('presence-chat_room');

    // Receiving messages
    channel.bind('new_message', addMessage);

    function addMessage(data) {
        var li = $('<li class="ui-li ui-li-static ui-body-c"></li>');
        li.text(data.user_id+": "+data.new_message);
        li.hide();
        $('#messages').append(li);
        li.slideDown();
    }

    // Sending messages
    function handleClick() {
        var userMessageEl = $('#user_message');
        var message = $.trim(userMessageEl.val());
        if (message) {
            $.ajax({
                url: 'message/',
                headers: {'HTTP_X_CSRFTOKEN': csrftoken},
                type: 'post',
                data: {
                    text: message,
                    user_id: USER.NAME,
                    csrfmiddlewaretoken: csrftoken

                },
                success: function () {
                    userMessageEl.val('');
                    sendTypingEvent(false, false);
                }
            });
        }

        return false;
    }

    // Sending client events
    var typingTimeout = null;

    function userTyping() {

        var el = $(this);

        if (!typingTimeout) {
            var textEntered = ( $.trim(el.val()).length > 0 );
            sendTypingEvent(true, textEntered);
        }
        else {
            window.clearTimeout(typingTimeout);
            typingTimeout = null;
        }

        typingTimeout = window.setTimeout(function () {
            var textEntered = ( $.trim(el.val()).length > 0 );
            sendTypingEvent(false, textEntered);
            typingTimeout = null;
        }, 3000);
    }

    function sendTypingEvent(typing, enteredText) {
        channel.trigger('client-typing', {
            username: USER.NAME,
            typing: typing,
            enteredText: enteredText
        });
    }

    // Receiving client events
    channel.bind('client-typing', handleTyping);
    function handleTyping(data) {
        if (data.typing) {
            $("#activity").text(data.username + ' is typing');
        }
        else if (data.enteredText) {
            $("#activity").text(data.username + ' has entered text');
        }
        else {
            $("#activity").text('');
        }
    }

    // Presence
    channel.bind('pusher:subscription_succeeded', getOnlineUsers);

    function getOnlineUsers(members) {
        members.each(addMember);
    }

    channel.bind('pusher:member_added', addMember);

    function addMember(member) {

        var li = $('<li>');
        li.attr('text', member.id);
        li.text(member.id);
        $('#users').append(li);
    }

    channel.bind('pusher:member_removed', removeMember);

    function removeMember(member) {
        var li = $('#users li[text=' + member.id + ']');
        li.slideUp(function () {
            li.remove()
        });
    }

    // Init - bind to UI events
    $(function () {
        $('#send_btn').click(handleClick);
        $('#user_message').keyup(userTyping);
    });

    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }


})(window, window['Pusher'], jQuery);