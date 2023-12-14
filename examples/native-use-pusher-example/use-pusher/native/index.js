'use strict';

var React = require('react');
var dequal = require('dequal');
var invariant = require('invariant');
var PusherReactNative = require('pusher-js/react-native');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

// context setup
var ChannelsContext = React.createContext({});
var __ChannelsContext = ChannelsContext;
/**
 * Provider that creates your channels instances and provides it to child hooks throughout your app.
 */
var ChannelsProvider = function (_a) {
    var children = _a.children;
    var client = usePusher().client;
    var connectedChannels = React.useRef({});
    var subscribe = React.useCallback(function (channelName) {
        /** Return early if there's no client */
        if (!client || !channelName)
            return;
        /** Subscribe to channel and set it in state */
        var pusherChannel = client.subscribe(channelName);
        connectedChannels.current[channelName] = __spreadArray(__spreadArray([], (connectedChannels.current[channelName] || []), true), [
            pusherChannel,
        ], false);
        return pusherChannel;
    }, [client, connectedChannels]);
    var unsubscribe = React.useCallback(function (channelName) {
        /** Return early if there's no props */
        if (!client ||
            !channelName ||
            !(channelName in connectedChannels.current))
            return;
        /** If just one connection, unsubscribe totally*/
        if (connectedChannels.current[channelName].length === 1) {
            client.unsubscribe(channelName);
            delete connectedChannels.current[channelName];
        }
        else {
            connectedChannels.current[channelName].pop();
        }
    }, [connectedChannels, client]);
    var getChannel = React.useCallback(function (channelName) {
        /** Return early if there's no client */
        if (!client ||
            !channelName ||
            !(channelName in connectedChannels.current))
            return;
        /** Return channel */
        return connectedChannels.current[channelName][0];
    }, [connectedChannels, client]);
    return (React.createElement(ChannelsContext.Provider, { value: {
            unsubscribe: unsubscribe,
            subscribe: subscribe,
            getChannel: getChannel,
        } }, children));
};

// context setup
var PusherContext = React.createContext({});
var __PusherContext = PusherContext;
/**
 * Provider that creates your pusher instance and provides it to child hooks throughout your app.
 * Note, you can pass in value={{}} as a prop if you'd like to override the pusher client passed.
 * This is handy when simulating pusher locally, or for testing.
 * @param props Config for Pusher client
 */
var CorePusherProvider = function (_a) {
    var clientKey = _a.clientKey, cluster = _a.cluster, triggerEndpoint = _a.triggerEndpoint, _b = _a.defer, defer = _b === void 0 ? false : _b, children = _a.children, _PusherRuntime = _a._PusherRuntime, props = __rest(_a, ["clientKey", "cluster", "triggerEndpoint", "defer", "children", "_PusherRuntime"]);
    // errors when required props are not passed.
    React.useEffect(function () {
        if (!clientKey)
            console.error("A client key is required for pusher");
        if (!cluster)
            console.error("A cluster is required for pusher");
    }, [clientKey, cluster]);
    var config = React.useMemo(function () { return (__assign({ cluster: cluster }, props)); }, [cluster, props]);
    // track config for comparison
    var previousConfig = React.useRef(props);
    React.useEffect(function () {
        previousConfig.current = props;
    });
    var _c = React.useState(), client = _c[0], setClient = _c[1];
    React.useEffect(function () {
        // Skip creation of client if deferring, a value prop is passed, or config props are the same.
        if (!_PusherRuntime ||
            defer ||
            !clientKey ||
            props.value ||
            (dequal.dequal(previousConfig.current, props) && client !== undefined)) {
            return;
        }
        setClient(new _PusherRuntime(clientKey, config));
    }, [client, clientKey, props, defer, _PusherRuntime, config]);
    return (React.createElement(PusherContext.Provider, __assign({ value: {
            client: client,
            triggerEndpoint: triggerEndpoint,
        } }, props),
        React.createElement(ChannelsProvider, null, children)));
};

/**
 * Provides access to the pusher client instance.
 *
 * @returns a `MutableRefObject<Pusher|undefined>`. The instance is held by a `useRef()` hook.
 * @example
 * ```javascript
 * const { client } = usePusher();
 * client.current.subscribe('my-channel');
 * ```
 */
function usePusher() {
    var context = React.useContext(__PusherContext);
    React.useEffect(function () {
        if (!Object.keys(context).length)
            console.warn(NOT_IN_CONTEXT_WARNING$1);
    }, [context]);
    return context;
}
var NOT_IN_CONTEXT_WARNING$1 = "No Pusher context. Did you forget to wrap your app in a <PusherProvider />?";

/**
 * Provides access to the channels global provider.
 */
function useChannels() {
    var context = React.useContext(__ChannelsContext);
    React.useEffect(function () {
        if (!context || !Object.keys(context).length)
            console.warn(NOT_IN_CONTEXT_WARNING);
    }, [context]);
    return context;
}
var NOT_IN_CONTEXT_WARNING = "No Channels context. Did you forget to wrap your app in a <ChannelsProvider />?";

/**
 * Subscribe to a channel
 *
 * @param channelName The name of the channel you want to subscribe to.
 * @typeparam Type of channel you're subscribing to. Can be one of `Channel` or `PresenceChannel` from `pusher-js`.
 * @returns Instance of the channel you just subscribed to.
 *
 * @example
 * ```javascript
 * const channel = useChannel("my-channel")
 * channel.bind('some-event', () => {})
 * ```
 */
function useChannel(channelName) {
    var _a = React.useState(), channel = _a[0], setChannel = _a[1];
    var _b = useChannels(), subscribe = _b.subscribe, unsubscribe = _b.unsubscribe;
    React.useEffect(function () {
        if (!channelName || !subscribe || !unsubscribe)
            return;
        var _channel = subscribe(channelName);
        setChannel(_channel);
        return function () { return unsubscribe(channelName); };
    }, [channelName, subscribe, unsubscribe]);
    /** Return the channel for use. */
    return channel;
}

/** Presence channel reducer to keep track of state */
var SET_STATE = "set-state";
var ADD_MEMBER = "add-member";
var REMOVE_MEMBER = "remove-member";
var presenceChannelReducer = function (state, _a) {
    var _b;
    var type = _a.type, payload = _a.payload;
    switch (type) {
        /** Generic setState */
        case SET_STATE:
            return __assign(__assign({}, state), payload);
        /** Member added */
        case ADD_MEMBER:
            var _c = payload, addedMemberId = _c.id, info = _c.info;
            return __assign(__assign({}, state), { count: state.count + 1, members: __assign(__assign({}, state.members), (_b = {}, _b[addedMemberId] = info, _b)) });
        /** Member removed */
        case REMOVE_MEMBER:
            var removedMemberId = payload.id;
            var members = __assign({}, state.members);
            delete members[removedMemberId];
            return __assign(__assign({}, state), { count: state.count - 1, members: __assign({}, members) });
    }
};
function usePresenceChannel(channelName) {
    // errors for missing arguments
    if (channelName) {
        invariant(channelName.includes("presence-"), "Presence channels should use prefix 'presence-' in their name. Use the useChannel hook instead.");
    }
    /** Store internal channel state */
    var _a = React.useReducer(presenceChannelReducer, {
        members: {},
        me: undefined,
        myID: undefined,
        count: 0,
    }), state = _a[0], dispatch = _a[1];
    // bind and unbind member events events on our channel
    var channel = useChannel(channelName);
    React.useEffect(function () {
        if (channel) {
            // Get membership info on successful subscription
            var handleSubscriptionSuccess_1 = function (members) {
                dispatch({
                    type: SET_STATE,
                    payload: {
                        members: members.members,
                        myID: members.myID,
                        me: members.me,
                        count: Object.keys(members.members).length,
                    },
                });
            };
            // Add member to the members object
            var handleAdd_1 = function (member) {
                dispatch({
                    type: ADD_MEMBER,
                    payload: member,
                });
            };
            // Remove member from the members object
            var handleRemove_1 = function (member) {
                dispatch({
                    type: REMOVE_MEMBER,
                    payload: member,
                });
            };
            // bind to all member addition/removal events
            channel.bind("pusher:subscription_succeeded", handleSubscriptionSuccess_1);
            channel.bind("pusher:member_added", handleAdd_1);
            channel.bind("pusher:member_removed", handleRemove_1);
            // cleanup
            return function () {
                channel.unbind("pusher:subscription_succeeded", handleSubscriptionSuccess_1);
                channel.unbind("pusher:member_added", handleAdd_1);
                channel.unbind("pusher:member_removed", handleRemove_1);
            };
        }
        // to make typescript happy.
        return function () { };
    }, [channel]);
    return __assign({ channel: channel }, state);
}

/**
 * Subscribes to a channel event and registers a callback.
 * @param channel Pusher channel to bind to
 * @param eventName Name of event to bind to
 * @param callback Callback to call on a new event
 */
function useEvent(channel, eventName, callback) {
    // error when required arguments aren't passed.
    invariant(eventName, "Must supply eventName and callback to onEvent");
    invariant(callback, "Must supply callback to onEvent");
    // bind and unbind events whenever the channel, eventName or callback changes.
    React.useEffect(function () {
        if (channel === undefined) {
            return;
        }
        else
            channel.bind(eventName, callback);
        return function () {
            channel.unbind(eventName, callback);
        };
    }, [channel, eventName, callback]);
}

/**
 *
 * @param channel the channel you'd like to trigger clientEvents on. Get this from [[useChannel]] or [[usePresenceChannel]].
 * @typeparam TData shape of the data you're sending with the event.
 * @returns A memoized trigger function that will perform client events on the channel.
 * @example
 * ```javascript
 * const channel = useChannel('my-channel');
 * const trigger = useClientTrigger(channel)
 *
 * const handleClick = () => trigger('some-client-event', {});
 * ```
 */
function useClientTrigger(channel) {
    channel &&
        invariant(channel.name.match(/(private-|presence-)/gi), "Channel provided to useClientTrigger wasn't private or presence channel. Client events only work on these types of channels.");
    // memoize trigger so it's not being created every render
    var trigger = React.useCallback(function (eventName, data) {
        invariant(eventName, "Must pass event name to trigger a client event.");
        channel && channel.trigger(eventName, data);
    }, [channel]);
    return trigger;
}

/**
 * Hook to provide a trigger function that calls the server defined in `PusherProviderProps.triggerEndpoint` using `fetch`.
 * Any `auth?.headers` in the config object will be passed with the `fetch` call.
 *
 * @param channelName name of channel to call trigger on
 * @typeparam TData shape of the data you're sending with the event
 *
 * @example
 * ```typescript
 * const trigger = useTrigger<{message: string}>('my-channel');
 * trigger('my-event', {message: 'hello'});
 * ```
 */
function useTrigger(channelName) {
    var _a = usePusher(), client = _a.client, triggerEndpoint = _a.triggerEndpoint;
    // you can't use this if you haven't supplied a triggerEndpoint.
    invariant(triggerEndpoint, "No trigger endpoint specified to <PusherProvider />. Cannot trigger an event.");
    // subscribe to the channel we'll be triggering to.
    useChannel(channelName);
    // memoized trigger function to return
    var trigger = React.useCallback(function (eventName, data) {
        var _a;
        var fetchOptions = {
            method: "POST",
            body: JSON.stringify({ channelName: channelName, eventName: eventName, data: data }),
        };
        // @ts-expect-error deprecated since 7.1.0, but still supported for backwards compatibility
        // now it should use channelAuthorization instead
        if (client && ((_a = client.config) === null || _a === void 0 ? void 0 : _a.auth)) {
            // @ts-expect-error deprecated
            fetchOptions.headers = client.config.auth.headers;
        }
        else {
            console.warn(NO_AUTH_HEADERS_WARNING);
        }
        return fetch(triggerEndpoint, fetchOptions);
    }, [client, triggerEndpoint, channelName]);
    return trigger;
}
var NO_AUTH_HEADERS_WARNING = "No auth parameters supplied to <PusherProvider />. Your events will be unauthenticated.";

/** Wrapper around the core PusherProvider that passes in the Pusher react-native lib */
var PusherProvider = function (props) { return (React.createElement(CorePusherProvider, __assign({ _PusherRuntime: PusherReactNative }, props))); };

exports.ADD_MEMBER = ADD_MEMBER;
exports.ChannelsProvider = ChannelsProvider;
exports.NOT_IN_CONTEXT_WARNING = NOT_IN_CONTEXT_WARNING$1;
exports.NO_AUTH_HEADERS_WARNING = NO_AUTH_HEADERS_WARNING;
exports.PusherProvider = PusherProvider;
exports.REMOVE_MEMBER = REMOVE_MEMBER;
exports.SET_STATE = SET_STATE;
exports.__ChannelsContext = __ChannelsContext;
exports.__PusherContext = __PusherContext;
exports.presenceChannelReducer = presenceChannelReducer;
exports.useChannel = useChannel;
exports.useChannels = useChannels;
exports.useClientTrigger = useClientTrigger;
exports.useEvent = useEvent;
exports.usePresenceChannel = usePresenceChannel;
exports.usePusher = usePusher;
exports.useTrigger = useTrigger;
//# sourceMappingURL=index.js.map
