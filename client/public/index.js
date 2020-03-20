function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function get_store_value(store) {
    let value;
    subscribe(store, _ => value = _)();
    return value;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if (typeof $$scope.dirty === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}
function null_to_empty(value) {
    return value == null ? '' : value;
}
function set_store_value(store, ret, value = ret) {
    store.set(value);
    return ret;
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

function append(target, node) {
    target.appendChild(node);
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function element(name) {
    return document.createElement(name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function prevent_default(fn) {
    return function (event) {
        event.preventDefault();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function stop_propagation(fn) {
    return function (event) {
        event.stopPropagation();
        // @ts-ignore
        return fn.call(this, event);
    };
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function set_attributes(node, attributes) {
    // @ts-ignore
    const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
    for (const key in attributes) {
        if (attributes[key] == null) {
            node.removeAttribute(key);
        }
        else if (key === 'style') {
            node.style.cssText = attributes[key];
        }
        else if (key === '__value' || descriptors[key] && descriptors[key].set) {
            node[key] = attributes[key];
        }
        else {
            attr(node, key, attributes[key]);
        }
    }
}
function get_binding_group_value(group) {
    const value = [];
    for (let i = 0; i < group.length; i += 1) {
        if (group[i].checked)
            value.push(group[i].__value);
    }
    return value;
}
function to_number(value) {
    return value === '' ? undefined : +value;
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data !== data)
        text.data = data;
}
function set_input_value(input, value) {
    if (value != null || input.value) {
        input.value = value;
    }
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, false, false, detail);
    return e;
}

let stylesheet;
let active = 0;
let current_rules = {};
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    if (!current_rules[name]) {
        if (!stylesheet) {
            const style = element('style');
            document.head.appendChild(style);
            stylesheet = style.sheet;
        }
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    node.style.animation = (node.style.animation || '')
        .split(', ')
        .filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    )
        .join(', ');
    if (name && !--active)
        clear_rules();
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        let i = stylesheet.cssRules.length;
        while (i--)
            stylesheet.deleteRule(i);
        current_rules = {};
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function onDestroy(fn) {
    get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
    const component = get_current_component();
    return (type, detail) => {
        const callbacks = component.$$.callbacks[type];
        if (callbacks) {
            // TODO are there situations where events could be dispatched
            // in a server (non-DOM) environment?
            const event = custom_event(type, detail);
            callbacks.slice().forEach(fn => {
                fn.call(component, event);
            });
        }
    };
}
// TODO figure out if we still want to support
// shorthand events, or if we want to implement
// a real bubbling mechanism
function bubble(component, event) {
    const callbacks = component.$$.callbacks[event.type];
    if (callbacks) {
        callbacks.slice().forEach(fn => fn(event));
    }
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function tick() {
    schedule_update();
    return resolved_promise;
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
function add_flush_callback(fn) {
    flush_callbacks.push(fn);
}
let flushing = false;
const seen_callbacks = new Set();
function flush() {
    if (flushing)
        return;
    flushing = true;
    do {
        // first, call beforeUpdate functions
        // and update components
        for (let i = 0; i < dirty_components.length; i += 1) {
            const component = dirty_components[i];
            set_current_component(component);
            update(component.$$);
        }
        dirty_components.length = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    flushing = false;
    seen_callbacks.clear();
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}
function create_bidirectional_transition(node, fn, params, intro) {
    let config = fn(node, params);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = program.b - t;
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config();
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

const globals = (typeof window !== 'undefined' ? window : global);

function destroy_block(block, lookup) {
    block.d(1);
    lookup.delete(block.key);
}
function outro_and_destroy_block(block, lookup) {
    transition_out(block, 1, 1, () => {
        lookup.delete(block.key);
    });
}
function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
    let o = old_blocks.length;
    let n = list.length;
    let i = o;
    const old_indexes = {};
    while (i--)
        old_indexes[old_blocks[i].key] = i;
    const new_blocks = [];
    const new_lookup = new Map();
    const deltas = new Map();
    i = n;
    while (i--) {
        const child_ctx = get_context(ctx, list, i);
        const key = get_key(child_ctx);
        let block = lookup.get(key);
        if (!block) {
            block = create_each_block(key, child_ctx);
            block.c();
        }
        else if (dynamic) {
            block.p(child_ctx, dirty);
        }
        new_lookup.set(key, new_blocks[i] = block);
        if (key in old_indexes)
            deltas.set(key, Math.abs(i - old_indexes[key]));
    }
    const will_move = new Set();
    const did_move = new Set();
    function insert(block) {
        transition_in(block, 1);
        block.m(node, next);
        lookup.set(block.key, block);
        next = block.first;
        n--;
    }
    while (o && n) {
        const new_block = new_blocks[n - 1];
        const old_block = old_blocks[o - 1];
        const new_key = new_block.key;
        const old_key = old_block.key;
        if (new_block === old_block) {
            // do nothing
            next = new_block.first;
            o--;
            n--;
        }
        else if (!new_lookup.has(old_key)) {
            // remove old block
            destroy(old_block, lookup);
            o--;
        }
        else if (!lookup.has(new_key) || will_move.has(new_key)) {
            insert(new_block);
        }
        else if (did_move.has(old_key)) {
            o--;
        }
        else if (deltas.get(new_key) > deltas.get(old_key)) {
            did_move.add(new_key);
            insert(new_block);
        }
        else {
            will_move.add(old_key);
            o--;
        }
    }
    while (o--) {
        const old_block = old_blocks[o];
        if (!new_lookup.has(old_block.key))
            destroy(old_block, lookup);
    }
    while (n)
        insert(new_blocks[n - 1]);
    return new_blocks;
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}

function bind(component, name, callback) {
    const index = component.$$.props[name];
    if (index !== undefined) {
        component.$$.bound[index] = callback;
        callback(component.$$.ctx[index]);
    }
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    // onMount happens before the initial afterUpdate
    add_render_callback(() => {
        const new_on_destroy = on_mount.map(run).filter(is_function);
        if (on_destroy) {
            on_destroy.push(...new_on_destroy);
        }
        else {
            // Edge case - component was destroyed immediately,
            // most likely as a result of a binding initialising
            run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
    });
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const prop_values = options.props || {};
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        before_update: [],
        after_update: [],
        context: new Map(parent_component ? parent_component.$$.context : []),
        // everything else
        callbacks: blank_object(),
        dirty
    };
    let ready = false;
    $$.ctx = instance
        ? instance(component, prop_values, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if ($$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(children(options.target));
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor);
        flush();
    }
    set_current_component(parent_component);
}
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set() {
        // overridden by instance, if it has props
    }
}

let initialState;
try {
    initialState = JSON.parse(atob(window.__initialState));
}
catch (e) {
    initialState = {};
}
// remove global variable
delete window.__initialState;
// remove script node
const scriptNode = document.getElementById('initial-state');
scriptNode && scriptNode.parentNode.removeChild(scriptNode);
console.log('initialState => ', initialState);
const getInitialState = () => {
    return initialState;
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

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

const subscriber_queue = [];
/**
 * Creates a `Readable` store that allows reading by subscription.
 * @param value initial value
 * @param {StartStopNotifier}start start and stop notifications for subscriptions
 */
function readable(value, start) {
    return {
        subscribe: writable(value, start).subscribe,
    };
}
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}
function derived(stores, fn, initial_value) {
    const single = !Array.isArray(stores);
    const stores_array = single
        ? [stores]
        : stores;
    const auto = fn.length < 2;
    return readable(initial_value, (set) => {
        let inited = false;
        const values = [];
        let pending = 0;
        let cleanup = noop;
        const sync = () => {
            if (pending) {
                return;
            }
            cleanup();
            const result = fn(single ? values[0] : values, set);
            if (auto) {
                set(result);
            }
            else {
                cleanup = is_function(result) ? result : noop;
            }
        };
        const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
            values[i] = value;
            pending &= ~(1 << i);
            if (inited) {
                sync();
            }
        }, () => {
            pending |= (1 << i);
        }));
        inited = true;
        sync();
        return function stop() {
            run_all(unsubscribers);
            cleanup();
        };
    });
}

const setValue = (store, value) => {
    if (Array.isArray(value)) {
        store.set([...value]);
    }
    else if (typeof value === 'object' && value !== null) {
        store.set(Object.assign({}, value));
    }
    else {
        store.set(value);
    }
};
var createStore = (initial, methods, views) => {
    const store = writable(initial);
    const publicApi = {
        subscribe: store.subscribe,
        set: store.set,
        update: store.update,
    };
    if (methods) {
        Object.keys(methods).forEach(method => {
            publicApi[method] = (...args) => {
                const storeValue = get_store_value(store);
                const result = methods[method].apply(storeValue, args);
                setValue(store, typeof result === 'undefined' ? storeValue : result);
            };
        });
    }
    if (views) {
        Object.keys(views).forEach(view => {
            publicApi[view] = (...args) => {
                const storeValue = get_store_value(store);
                return views[view].apply(storeValue, args);
            };
        });
    }
    return publicApi;
};

const storeMethods = {
    clearById(id) {
        return this.filter(message => {
            return message.id !== id;
        });
    },
    addMessage(options) {
        this.push(createMessage(options));
    },
    addMessages(data) {
        this.push(...data.map(createMessage));
    }
};
const createMessage = (options) => (Object.assign(Object.assign({}, options), { id: (Date.now() + Math.random()).toString() }));
const store = createStore([], storeMethods);

const storeViews = {
    getGamesCategories(gameName) {
        const cats = this[gameName].categories.selected || [];
        return {
            categoriesIds: cats,
            nullCategory: this[gameName].categories.nullCategory || !cats.length
        };
    }
};
const store$1 = createStore({
    rusDeu: {
        buttonText: 'RUS - DEU',
        categories: {
            selected: [],
            nullCategory: false
        }
    },
    deuRus: {
        buttonText: 'DEU - RUS',
        categories: {
            selected: [],
            nullCategory: false
        }
    }
}, null, storeViews);

var unique = (value, index, self) => {
    return self.indexOf(value) === index;
};

var SyncTypes;
(function (SyncTypes) {
    SyncTypes["categories"] = "categories";
    SyncTypes["words"] = "words";
})(SyncTypes || (SyncTypes = {}));
const storeMethods$1 = {
    syncSetup() {
        this.setup = true;
    },
    create(id, type) {
        this[type].toCreate.push(id);
    },
    update(id, type) {
        if (this[type].toUpdate.indexOf(id) === -1) {
            this[type].toUpdate.push(id);
        }
    },
    deleteFromCreated(id, type) {
        this[type].toCreate = this[type].toCreate.filter(id => (id !== id));
    },
    deleteFromUpdated(id, type) {
        this[type].toUpdate = this[type].toUpdate.filter(id => (id !== id));
    },
    delete(id, type) {
        if (this[type].toDelete.indexOf(id) === -1) {
            this[type].toDelete.push(id);
        }
    },
    reset() {
        return {
            words: { toCreate: [], toDelete: [], toUpdate: [] }, categories: { toCreate: [], toDelete: [], toUpdate: [] }, setup: false
        };
    }
};
const storeViews$1 = {
    isNew(id, type) {
        return this[type].toCreate.indexOf(id) > -1;
    },
    syncRequired() {
        const { words, categories, setup } = this;
        return !!(setup
            || words.toCreate.length || words.toDelete.length || words.toUpdate.length
            || categories.toCreate.length || categories.toDelete.length || categories.toUpdate.length);
    },
    getData() {
        return this;
    }
};
const store$2 = createStore({
    words: { toCreate: [], toDelete: [], toUpdate: [] }, categories: { toCreate: [], toDelete: [], toUpdate: [] }, setup: false
}, storeMethods$1, storeViews$1);

const storeMethods$2 = {
    saveSetup(newSetup) {
        syncManager.syncSetup();
        return newSetup;
    },
    resetSetup() {
        return {
            voice: true,
            voiceSpeed: 10,
            phrases: true,
            soundPhrases: true,
            nouns: true,
            soundNouns: true,
            articles: true,
            soundArticles: true,
            plural: true,
            soundPlural: true,
            verbs: true,
            soundVerbs: true,
            strongVerbs: true,
            soundStrongVerbs: false,
            irregularVerbs: true,
            soundIrregularVerbs: false,
            other: true,
        };
    }
};
const storeViews$2 = {
    getSetup() {
        return this;
    },
    getId() {
        return this.userId;
    }
};
const store$3 = createStore(storeMethods$2.resetSetup(), storeMethods$2, storeViews$2);

const storeMethods$3 = {
    deleteWords(ids) {
        for (let i = 0; i < ids.length; i++) {
            delete this[syncManager.deleteWord(ids[i])];
        }
    },
    disableWords(ids) {
        for (let i = 0; i < ids.length; i++) {
            this[syncManager.syncWord(ids[i])].active = false;
        }
    },
    enableWords(ids) {
        for (let i = 0; i < ids.length; i++) {
            this[syncManager.syncWord(ids[i])].active = true;
        }
    },
    updateWord(word) {
        const wordId = syncManager.syncWord(word.wordId);
        this[wordId] = Object.assign(Object.assign({}, word), { wordId });
    },
    updateWordsCategories(categoriesMap) {
        const words = Object.values(this);
        const oldCategoriesIds = Object.keys(categoriesMap).map(Number);
        for (let i = 0; i < words.length; i++) {
            const wordCategories = words[i].categories;
            for (let j = 0; j < oldCategoriesIds.length; j++) {
                const oldIndex = wordCategories.indexOf(oldCategoriesIds[j]);
                if (oldIndex > -1) {
                    this[words[i].wordId].categories.splice(oldIndex, 1, categoriesMap[oldCategoriesIds[j]]);
                }
            }
        }
    },
    deleteCategoryIdFromWords(categoryId) {
        const wordIds = Object.keys(this).map(Number);
        for (let i = 0; i < wordIds.length; i++) {
            const wordCategories = this[wordIds[i]].categories;
            if (wordCategories.includes(categoryId)) {
                this[wordIds[i]].categories.splice(wordCategories.indexOf(categoryId), 1);
            }
        }
    },
    unChainWordWithCategoryId(wordId, categoryId) {
        this[wordId].categories.splice(this[wordId].categories.indexOf(categoryId), 1);
        syncManager.syncWord(wordId);
    },
    updateWordsIds(wordsMap) {
        const oldIds = Object.keys(wordsMap);
        for (let i = 0; i < oldIds.length; i++) {
            const oldId = oldIds[i];
            const newId = wordsMap[oldId];
            this[newId] = Object.assign(Object.assign({}, this[oldId]), { wordId: newId });
            delete this[oldId];
        }
    }
};
const storeViews$3 = {
    getWordsByCategoryId(categoryId) {
        return Object.values(this).filter(word => {
            return word.categories.includes(categoryId);
        }).map(word => word.wordId);
    },
    getWordsByCategoriesAndSetup(gameName) {
        const { categoriesIds, nullCategory } = store$1.getGamesCategories(gameName);
        const setup = store$3.getSetup();
        return Object.values(this).filter(word => {
            // skip not active words
            if (!word.active) {
                return false;
            }
            if (!word.categories.length) {
                // skip non-categories words with not selected null category
                if (!nullCategory) {
                    return false;
                }
            }
            else {
                let wordInSelectedCategories = false;
                for (let i = 0; i < word.categories.length; i++) {
                    const wordCategory = word.categories[i];
                    if (categoriesIds.indexOf(wordCategory) > -1) {
                        wordInSelectedCategories = true;
                        break;
                    }
                }
                // skip words with not selected categories
                if (!wordInSelectedCategories) {
                    return false;
                }
            }
            // final sort - by types in setup
            switch (word.type) {
                case 'other':
                    return setup.other;
                case 'phrase':
                    return setup.phrases;
                case 'noun':
                    return setup.nouns;
                case 'verb':
                    return setup.verbs;
            }
        }).map(word => word.wordId);
    },
    verbIsStrong(word) {
        return !!(word.strong1 || word.strong2 || word.strong3 || word.strong4 || word.strong5 || word.strong6);
    },
    verbIsIrregular(word) {
        return !!(word.irregular1 || word.irregular2);
    },
    getWordById(wordId) {
        return this[wordId];
    }
};
const store$4 = createStore({}, storeMethods$3, storeViews$3);

class SyncManager {
    syncSetup() {
        store$2.syncSetup();
    }
    sync(id, type) {
        if (id) {
            // update in case of existing
            if (!store$2.isNew(id, type)) {
                store$2.update(id, type);
            }
            return id;
        }
        // create a new id instead
        const newId = +(Math.random() * 100000).toFixed();
        store$2.create(newId, type);
        return newId;
    }
    delete(id, type) {
        if (store$2.isNew(id, type)) {
            store$2.deleteFromCreated(id, type);
        }
        else {
            store$2.delete(id, type);
            store$2.deleteFromUpdated(id, type);
        }
        return id;
    }
    syncWord(wordId) {
        return this.sync(wordId, SyncTypes.words);
    }
    deleteWord(wordId) {
        return this.delete(wordId, SyncTypes.words);
    }
    syncCategory(categoryId) {
        return this.sync(categoryId, SyncTypes.categories);
    }
    deleteCategory(categoryId) {
        return this.delete(categoryId, SyncTypes.categories);
    }
    getDataToSync() {
        const dataToSync = { data: { words: {}, categories: {}, setup: {} } };
        const syncStoreData = store$2.getData();
        // merge sync store into data
        Object.assign(dataToSync, syncStoreData);
        // save setup
        if (syncStoreData.setup) {
            dataToSync.data.setup = store$3.getSetup();
        }
        // save words models
        const wordsToUpdate = [...syncStoreData.words.toUpdate, ...syncStoreData.words.toCreate].filter(unique);
        for (let i = 0; i < wordsToUpdate.length; i++) {
            const wordId = wordsToUpdate[i];
            dataToSync.data.words[wordId] = store$4.getWordById(wordId);
        }
        // save categories models
        const categoriesToUpdate = [...syncStoreData.categories.toUpdate, ...syncStoreData.categories.toCreate].filter(unique);
        for (let i = 0; i < categoriesToUpdate.length; i++) {
            const categoryId = categoriesToUpdate[i];
            dataToSync.data.categories[categoryId] = store$5.getCategoryById(categoryId);
        }
        return dataToSync;
    }
}
var syncManager = new SyncManager();

const storeMethods$4 = {
    deleteCategory(categoryId) {
        syncManager.deleteCategory(categoryId);
        delete this[categoryId];
    },
    updateCategory(category) {
        const categoryId = syncManager.syncCategory(category.categoryId);
        this[categoryId] = Object.assign(Object.assign({}, category), { categoryId });
    },
    updateCategoriesIds(categoriesMap) {
        const oldIds = Object.keys(categoriesMap);
        for (let i = 0; i < oldIds.length; i++) {
            const oldId = oldIds[i];
            const newId = categoriesMap[oldId];
            this[newId] = Object.assign(Object.assign({}, this[oldId]), { categoryId: newId });
            delete this[oldId];
        }
    }
};
const storeViews$4 = {
    getIds() {
        return Object.keys(this).map(Number);
    },
    getCategoryIdByName(categoryName) {
        const category = Object.values(this).find(c => c.categoryName === categoryName);
        return category ? category.categoryId : null;
    },
    getCategoryById(categoryId) {
        return this[categoryId];
    }
};
const store$5 = createStore({}, storeMethods$4, storeViews$4);

var Views;
(function (Views) {
    Views["home"] = "home";
    Views["auth"] = "auth";
    Views["categories"] = "categories";
    Views["dict"] = "dict";
    Views["preGame"] = "preGame";
    Views["rusDeu"] = "rusDeu";
    Views["deuRus"] = "deuRus";
    Views["setup"] = "setup";
    Views["editWord"] = "editWord";
    Views["addWord"] = "addWord";
    Views["sync"] = "sync";
})(Views || (Views = {}));
const storeMethods$5 = {
    home: () => ({ viewId: Views.home }),
    auth: () => ({ viewId: Views.auth }),
    categories: () => ({ viewId: Views.categories }),
    dict: () => ({ viewId: Views.dict }),
    rusDeu: () => ({ viewId: Views.rusDeu }),
    deuRus: () => ({ viewId: Views.deuRus }),
    setup: () => ({ viewId: Views.setup }),
    sync: () => ({ viewId: Views.sync }),
    addWord: () => ({ viewId: Views.addWord }),
    editWord: (params) => ({
        viewId: Views.editWord,
        params
    }),
    preGame: (params) => ({
        viewId: Views.preGame,
        params
    }),
};
const storeViews$5 = {
    isSyncView() {
        return this.viewId === Views.sync;
    }
};
const store$6 = createStore(storeMethods$5.home(), storeMethods$5, storeViews$5);

const store$7 = derived([store$4, store$5, store$3, store$2, store$6, store$1], ([words, categories, user, sync, view, games]) => {
    return { words, categories, user, sync, view, games };
});

const status = response => new Promise((resolve, reject) => {
    if (response.status >= 200 && response.status < 300) {
        resolve(response);
    }
    else {
        reject(new Error(response.statusText));
    }
});
const json = response => response.json();
let busy = false;
const request = (options) => {
    if (busy) {
        return Promise.resolve(null);
    }
    busy = true;
    const { api, payload = {} } = options;
    const body = new FormData;
    body.append('payload', JSON.stringify(payload));
    body.append('api', JSON.stringify(api));
    return fetch(`/${api}`, {
        method: 'post',
        credentials: 'include',
        body
    }).then(status).then(json).then((responseData) => {
        busy = false;
        const { error, offline } = responseData, rest = __rest(responseData, ["error", "offline"]);
        if (offline) {
            store.addMessage(offline);
            return null;
        }
        const { messages } = rest;
        if (Array.isArray(messages)) {
            store.addMessages(messages);
        }
        if (error) {
            return null;
        }
        else {
            return rest;
        }
    }).catch((e) => {
        busy = false;
        return Promise.reject('request-error');
    });
};

const syncCallback = (response) => {
    if (response && response.syncResult) {
        const { categoriesMap, wordsMap, notValidNewCategories = [], notValidUpdatedCategories = [], notValidNewWords = [], notValidUpdatedWords = [] } = response.syncResult;
        // handle not valid data only on sync page
        if (store$6.isSyncView()) {
            if (notValidNewCategories.length) {
                store.addMessage({ text: 'notValidNewCategories.error' + notValidNewCategories.join(','), status: 'error', persistent: true });
            }
            if (notValidUpdatedCategories.length) {
                store.addMessage({ text: 'notValidUpdatedCategories.error' + notValidUpdatedCategories.join(','), status: 'error', persistent: true });
            }
            if (notValidNewWords.length) {
                store.addMessage({ text: 'notValidNewWords.error' + notValidNewWords.join(','), status: 'error', persistent: true });
            }
            if (notValidUpdatedWords.length) {
                store.addMessage({ text: 'notValidUpdatedWords.error' + notValidUpdatedWords.join(','), status: 'error', persistent: true });
            }
        }
        // update stores with real categories ids
        store$4.updateWordsCategories(categoriesMap);
        store$5.updateCategoriesIds(categoriesMap);
        // update stores with real words ids
        store$4.updateWordsIds(wordsMap);
        // reset sync local data
        store$2.reset();
    }
};
const syncData = (() => {
    const f = () => {
        return store$2.syncRequired()
            ? request({ api: 'syncData', payload: syncManager.getDataToSync() })
                .then(syncCallback)
                .catch(() => { })
            : Promise.resolve();
    };
    let syncTimer;
    let refreshSyncTimer = () => {
        clearTimeout(syncTimer);
        syncTimer = setTimeout(f, 10000);
    };
    // sync data when sync store changes
    store$2.subscribe(refreshSyncTimer);
    return f;
})();

const loadInitialData = ({ callback, payload = {} }) => {
    let initialData;
    try {
        initialData = JSON.parse(localStorage.getItem('lernen-storage'));
    }
    catch (e) { }
    if (initialData) {
        store$2.set(initialData.sync);
        store$4.set(initialData.words || {});
        store$5.set(initialData.categories || {});
        if (initialData.games) {
            store$1.set(initialData.games);
        }
        if (initialData.view) {
            store$6.set(initialData.view);
        }
        else {
            store$6.home();
        }
        if (initialData.user) {
            store$3.set(initialData.user);
        }
        else {
            store$3.resetSetup();
        }
    }
    const requestLoadOrDie = () => {
        // subscribe to storage change to sync storage with browser
        store$7.subscribe($store => {
            localStorage.setItem('lernen-storage', JSON.stringify($store));
        });
        callback && callback();
    };
    request({
        api: 'getInitialData',
        payload: Object.assign(Object.assign({}, syncManager.getDataToSync()), payload)
    }).then((response) => {
        syncCallback(response);
        if (response) {
            store$4.set(response.words || {});
            store$5.set(response.categories || {});
            store$3.set(response.user);
        }
    }).then(requestLoadOrDie).catch(requestLoadOrDie);
};

var checkbox = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 26 20\">\n  <path d=\"M.3 11c-.2-.2-.3-.5-.3-.7s.1-.5.3-.7l1.4-1.4c.4-.4 1-.4 1.4 0l.1.1 5.5 5.9c.2.2.5.2.7 0L22.8.3h.1c.4-.4 1-.4 1.4 0l1.4 1.4c.4.4.4 1 0 1.4l-16 16.6c-.2.2-.4.3-.7.3a.9.9 0 0 1-.7-.3L.5 11.3.3 11z\" />\n</svg>";

var close = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 21.9 21.9\">\n  <path d=\"M14.1 11.3a.5.5 0 0 1 0-.7l7.5-7.5c.2-.2.3-.5.3-.7s-.1-.5-.3-.7L20.2.3a1 1 0 0 0-.7-.3 1 1 0 0 0-.7.3l-7.5 7.5c-.2.2-.5.2-.7 0L3.1.3C2.9.1 2.6 0 2.4 0s-.5.1-.7.3L.3 1.7c-.2.2-.3.5-.3.7s.1.5.3.7l7.5 7.5c.2.2.2.5 0 .7L.3 18.8c-.2.2-.3.5-.3.7s.1.5.3.7l1.4 1.4c.2.2.5.3.7.3s.5-.1.7-.3l7.5-7.5c.2-.2.5-.2.7 0l7.5 7.5c.2.2.5.3.7.3s.5-.1.7-.3l1.4-1.4c.2-.2.3-.5.3-.7s-.1-.5-.3-.7l-7.5-7.5z\"/>\n</svg>";

var _delete = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"-68 0 512 512.001\">\n  <path d=\"m330.78125 62.871094h-49.828125v-7.871094c0-30.328125-24.671875-55-55-55h-76.125c-30.328125 0-55 24.671875-55 55v7.871094h-49.828125c-24.8125 0-45 20.1875-45 45v32.867187c0 8.285157 6.714844 15 15 15h12.050781l20.128907 342.144531c.464843 7.925782 7.03125 14.117188 14.972656 14.117188h251.480468c7.941407 0 14.507813-6.191406 14.972657-14.117188l20.125-342.144531h12.054687c8.28125 0 15-6.714843 15-15v-32.867187c-.003906-24.8125-20.191406-45-45.003906-45zm-205.953125-7.871094c0-13.785156 11.214844-25 25-25h76.125c13.785156 0 25 11.214844 25 25v7.871094h-126.125zm-94.828125 52.871094c0-8.273438 6.730469-15 15-15h285.78125c8.273438 0 15 6.726562 15 15v17.867187h-315.78125zm269.488281 374.128906h-223.191406l-19.195313-326.261719h261.578126zm0 0\"/>\n  <path d=\"m187.890625 451c8.285156 0 15-6.714844 15-15v-235c0-8.285156-6.714844-15-15-15-8.28125 0-15 6.714844-15 15v235c0 8.285156 6.71875 15 15 15zm0 0\"/>\n  <path d=\"m247.253906 450.984375c.214844.011719.433594.015625.648438.015625 7.988281 0 14.632812-6.304688 14.976562-14.363281l10-235c.351563-8.277344-6.074218-15.273438-14.351562-15.625-8.265625-.34375-15.269532 6.074219-15.621094 14.351562l-10 235c-.355469 8.277344 6.070312 15.269531 14.347656 15.621094zm0 0\"/>\n  <path d=\"m127.878906 451c.214844 0 .433594-.003906.652344-.015625 8.273438-.351563 14.699219-7.34375 14.347656-15.621094l-10-235c-.351562-8.277343-7.34375-14.699219-15.625-14.351562-8.277344.351562-14.699218 7.347656-14.347656 15.625l10 235c.339844 8.0625 6.984375 14.363281 14.972656 14.363281zm0 0\"/>\n</svg>";

var down = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 285 166\">\n  <path d=\"M282 17L268 3a9 9 0 0 0-13 0L142 115 30 3a9 9 0 0 0-13 0L3 17a9 9 0 0 0 0 13l133 133a9 9 0 0 0 13 0L282 30a9 9 0 0 0 0-13z\" class=\"currentLayer\"/>\n</svg>";

var edit = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">\n  <path d=\"m455.1,137.9l-32.4,32.4-81-81.1 32.4-32.4c6.6-6.6 18.1-6.6 24.7,0l56.3,56.4c6.8,6.8 6.8,17.9 0,24.7zm-270.7,271l-81-81.1 209.4-209.7 81,81.1-209.4,209.7zm-99.7-42l60.6,60.7-84.4,23.8 23.8-84.5zm399.3-282.6l-56.3-56.4c-11-11-50.7-31.8-82.4,0l-285.3,285.5c-2.5,2.5-4.3,5.5-5.2,8.9l-43,153.1c-2,7.1 0.1,14.7 5.2,20 5.2,5.3 15.6,6.2 20,5.2l153-43.1c3.4-0.9 6.4-2.7 8.9-5.2l285.1-285.5c22.7-22.7 22.7-59.7 0-82.5z\"/>\n</svg>";

var menu = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 459 459\">\n  <path d=\"M0,382.5h459v-51H0V382.5z M0,255h459v-51H0V255z M0,76.5v51h459v-51H0z\"/>\n</svg>";

var plus = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 305.002 305.002\">\n  <path d=\"M152.502,0.001C68.413,0.001,0,68.412,0,152.501s68.413,152.5,152.502,152.5c84.09,0,152.5-68.411,152.5-152.5    S236.592,0.001,152.502,0.001z M152.502,280.001C82.198,280.001,25,222.806,25,152.501c0-70.304,57.198-127.5,127.502-127.5    c70.305,0,127.5,57.196,127.5,127.5C280.002,222.806,222.807,280.001,152.502,280.001z\"/>\n  <path d=\"M225.999,140.001h-60.997V79.005c0-6.903-5.596-12.5-12.5-12.5c-6.902,0-12.5,5.597-12.5,12.5v60.996H79.007    c-6.903,0-12.5,5.597-12.5,12.5c0,6.902,5.597,12.5,12.5,12.5h60.995v60.996c0,6.902,5.598,12.5,12.5,12.5    c6.904,0,12.5-5.598,12.5-12.5v-60.996h60.997c6.903,0,12.5-5.598,12.5-12.5C238.499,145.598,232.902,140.001,225.999,140.001z\"/>\n</svg>";

var profile = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 266 350\">\n  <path d=\"M133 171c39 0 70-38 70-85 0-48-10-86-70-86S63 38 63 86c0 47 31 85 70 85zM0 302c0-3 0-1 0 0zm266 2c0-1 0-5 0 0zm0-6c-1-82-12-105-94-120 0 0-12 15-39 15s-39-15-39-15C13 192 2 216 0 296v15s20 39 133 39 133-39 133-39a3131 3131 0 0 1 0-13z\" />\n</svg>";

var turnOff = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\">\n  <path\n    d=\"M257,0C117.104,0,0,113.029,0,255c0,140.742,116.009,257,257,257c142.13,0,255-117.257,255-257    C512,114.061,397.951,0,257,0z M257,482.2C131.832,482.2,29.8,380.168,29.8,255C29.8,130.935,131.832,29.8,257,29.8    c124.065,0,225.2,101.135,225.2,225.2C482.2,380.168,381.065,482.2,257,482.2z\"/>\n  <path\n    d=\"M257,60c-41.452,0-82.276,12.827-114.952,36.117c-7.551,5.382-8.453,16.27-1.9,22.821l252.914,252.914    c6.56,6.562,17.442,5.645,22.821-1.9C439.173,337.277,452,296.453,452,255C452,147.477,364.523,60,257,60z M401.002,337.367    L174.634,110.999C199.283,97.372,227.929,89.8,257,89.8c90.981,0,165.2,74.219,165.2,165.2    C422.2,284.072,414.628,312.718,401.002,337.367z\"/>\n  <path\n    d=\"M371.852,393.062L118.938,140.147c-6.525-6.527-17.42-5.676-22.821,1.9C72.489,175.196,60,214.254,60,255    c0,107.493,89.147,197,197,197c40.744,0,79.803-12.489,112.952-36.117C377.503,410.501,378.405,399.613,371.852,393.062z M257,422    c-90.523,0-167.2-76.477-167.2-167c0-28.45,7.395-55.924,21.147-80.417l226.47,226.47C312.923,414.804,285.449,422,257,422z\"/>\n</svg>";

var turnOn = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 30.143 30.143\">\n\t<path d=\"M20.034,2.357v3.824c3.482,1.798,5.869,5.427,5.869,9.619c0,5.98-4.848,10.83-10.828,10.83   c-5.982,0-10.832-4.85-10.832-10.83c0-3.844,2.012-7.215,5.029-9.136V2.689C4.245,4.918,0.731,9.945,0.731,15.801   c0,7.921,6.42,14.342,14.34,14.342c7.924,0,14.342-6.421,14.342-14.342C29.412,9.624,25.501,4.379,20.034,2.357z\"/>\n  <path d=\"M14.795,17.652c1.576,0,1.736-0.931,1.736-2.076V2.08c0-1.148-0.16-2.08-1.736-2.08   c-1.57,0-1.732,0.932-1.732,2.08v13.496C13.062,16.722,13.225,17.652,14.795,17.652z\"/>\n</svg>";

var unchain = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\">\r\n  <path d=\"M44.0064665,10 L40.9119196,10.4615224 L37.8165905,10.9222626 L40.4214543,28.3928416 L46.6105481,27.4697968 L44.0064665,10 Z M49.7324734,26.7204095 L53.535731,37.6921272 L59.4486937,35.643437 L57.6949085,30.5831175 L79.1760391,23.137744 L87.0383472,45.8211796 L65.5579989,53.2665531 L63.8042137,48.2077981 L57.8912511,50.2572705 L61.6952909,61.2289881 L95,49.6838876 L83.038747,15.175309 L49.7324734,26.7204095 Z M22.5683592,29.0225459 L34.704052,36.5844734 L38.0137153,31.2730544 L25.8772403,23.7111269 L22.5683592,29.0225459 Z M52.8543988,41.6541798 L54.9038712,47.5671424 L72.8680446,41.3397187 L70.8193544,35.4275384 L52.8543988,41.6541798 Z M5,64.0857337 L30.8264815,89.9106507 L55.7518209,64.9860935 L47.5398509,56.7741235 L43.1154936,61.199263 L46.9023241,64.9860935 L30.8264815,81.0603717 L13.850279,64.0857337 L29.9261216,48.0091088 L33.7121699,51.7959393 L38.1373094,47.371582 L29.9261216,39.159612 L5,64.0857337 Z M28.5556347,61.9314409 L32.979992,66.3565804 L45.7289621,53.6083926 L41.3038226,49.1824708 L28.5556347,61.9314409 Z\"/>\r\n</svg>";



var iconComponents = /*#__PURE__*/Object.freeze({
  __proto__: null,
  checkboxIcon: checkbox,
  closeIcon: close,
  deleteIcon: _delete,
  downIcon: down,
  editIcon: edit,
  menuIcon: menu,
  plusIcon: plus,
  profileIcon: profile,
  turnOffIcon: turnOff,
  turnOnIcon: turnOn,
  unchainIcon: unchain
});

/* src/sdk/icon/icon.svelte generated by Svelte v3.19.1 */

function add_css() {
	var style = element("style");
	style.id = "svelte-1xthj36-style";
	style.textContent = ".icon{display:inline-block;fill:currentColor;height:100%;max-height:100px;vertical-align:top;max-width:100px;width:100%}.icon svg{display:block;height:100%;margin:0 auto;max-width:100%}";
	append(document.head, style);
}

function create_fragment(ctx) {
	let i;
	let raw_value = iconComponents[/*name*/ ctx[0] + "Icon"] + "";
	let i_levels = [/*$$props*/ ctx[1], { class: `icon icon-${/*name*/ ctx[0]}` }];
	let i_data = {};

	for (let i = 0; i < i_levels.length; i += 1) {
		i_data = assign(i_data, i_levels[i]);
	}

	return {
		c() {
			i = element("i");
			set_attributes(i, i_data);
		},
		m(target, anchor) {
			insert(target, i, anchor);
			i.innerHTML = raw_value;
		},
		p(ctx, [dirty]) {
			if (dirty & /*name*/ 1 && raw_value !== (raw_value = iconComponents[/*name*/ ctx[0] + "Icon"] + "")) i.innerHTML = raw_value;
			set_attributes(i, get_spread_update(i_levels, [
				dirty & /*$$props*/ 2 && /*$$props*/ ctx[1],
				dirty & /*name*/ 1 && { class: `icon icon-${/*name*/ ctx[0]}` }
			]));
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(i);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { name } = $$props;

	$$self.$set = $$new_props => {
		$$invalidate(1, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
		if ("name" in $$new_props) $$invalidate(0, name = $$new_props.name);
	};

	$$props = exclude_internal_props($$props);
	return [name, $$props];
}

class Icon extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1xthj36-style")) add_css();
		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });
	}
}

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}
function quintOut(t) {
    return --t * t * t * t * t + 1;
}

function fade(node, { delay = 0, duration = 400, easing = identity }) {
    const o = +getComputedStyle(node).opacity;
    return {
        delay,
        duration,
        easing,
        css: t => `opacity: ${t * o}`
    };
}
function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
    const style = getComputedStyle(node);
    const target_opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    const od = target_opacity * (1 - opacity);
    return {
        delay,
        duration,
        easing,
        css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
    };
}
function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const height = parseFloat(style.height);
    const padding_top = parseFloat(style.paddingTop);
    const padding_bottom = parseFloat(style.paddingBottom);
    const margin_top = parseFloat(style.marginTop);
    const margin_bottom = parseFloat(style.marginBottom);
    const border_top_width = parseFloat(style.borderTopWidth);
    const border_bottom_width = parseFloat(style.borderBottomWidth);
    return {
        delay,
        duration,
        easing,
        css: t => `overflow: hidden;` +
            `opacity: ${Math.min(t * 20, 1) * opacity};` +
            `height: ${t * height}px;` +
            `padding-top: ${t * padding_top}px;` +
            `padding-bottom: ${t * padding_bottom}px;` +
            `margin-top: ${t * margin_top}px;` +
            `margin-bottom: ${t * margin_bottom}px;` +
            `border-top-width: ${t * border_top_width}px;` +
            `border-bottom-width: ${t * border_bottom_width}px;`
    };
}

/* src/sdk/messages/message.svelte generated by Svelte v3.19.1 */

function add_css$1() {
	var style = element("style");
	style.id = "svelte-30k1ze-style";
	style.textContent = ".message.svelte-30k1ze.svelte-30k1ze{border-radius:5px;display:block;margin-top:10px;overflow:hidden;padding:5px 28px 5px 10px;position:relative;word-wrap:break-word}.message.svelte-30k1ze.svelte-30k1ze:first-child{margin-top:0}.message--success.svelte-30k1ze.svelte-30k1ze{background:#baffba}.message--error.svelte-30k1ze.svelte-30k1ze{background:#f4c1c6}.message.svelte-30k1ze span.svelte-30k1ze{position:relative;z-index:2}.message.svelte-30k1ze.svelte-30k1ze .icon{height:10px;position:absolute;right:9px;top:9px;width:10px;z-index:1}";
	append(document.head, style);
}

function create_fragment$1(ctx) {
	let span1;
	let span0;
	let t0;
	let t1;
	let span1_class_value;
	let span1_transition;
	let current;
	let dispose;
	const icon = new Icon({ props: { name: "close" } });

	return {
		c() {
			span1 = element("span");
			span0 = element("span");
			t0 = text(/*text*/ ctx[0]);
			t1 = space();
			create_component(icon.$$.fragment);
			attr(span0, "class", "text svelte-30k1ze");
			attr(span1, "class", span1_class_value = "" + (null_to_empty(`message message--${/*status*/ ctx[1]}`) + " svelte-30k1ze"));
		},
		m(target, anchor) {
			insert(target, span1, anchor);
			append(span1, span0);
			append(span0, t0);
			append(span1, t1);
			mount_component(icon, span1, null);
			current = true;
			dispose = listen(span1, "click", /*clearMessage*/ ctx[2]);
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*text*/ 1) set_data(t0, /*text*/ ctx[0]);

			if (!current || dirty & /*status*/ 2 && span1_class_value !== (span1_class_value = "" + (null_to_empty(`message message--${/*status*/ ctx[1]}`) + " svelte-30k1ze"))) {
				attr(span1, "class", span1_class_value);
			}
		},
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);

			if (local) {
				add_render_callback(() => {
					if (!span1_transition) span1_transition = create_bidirectional_transition(
						span1,
						fly,
						{
							duration: 300,
							easing: quintOut,
							x: 30,
							opacity: 0
						},
						true
					);

					span1_transition.run(1);
				});
			}

			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);

			if (local) {
				if (!span1_transition) span1_transition = create_bidirectional_transition(
					span1,
					fly,
					{
						duration: 300,
						easing: quintOut,
						x: 30,
						opacity: 0
					},
					false
				);

				span1_transition.run(0);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(span1);
			destroy_component(icon);
			if (detaching && span1_transition) span1_transition.end();
			dispose();
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { id } = $$props;
	let { text } = $$props;
	let { status } = $$props;
	let { persistent = false } = $$props;
	let timer;

	const clearMessage = () => {
		clearTimeout(timer);
		store.clearById(id);
	};

	onMount(() => {
		if (!persistent) {
			timer = setTimeout(clearMessage, 5000);
		}
	});

	onDestroy(() => {
		clearTimeout(timer);
	});

	$$self.$set = $$props => {
		if ("id" in $$props) $$invalidate(3, id = $$props.id);
		if ("text" in $$props) $$invalidate(0, text = $$props.text);
		if ("status" in $$props) $$invalidate(1, status = $$props.status);
		if ("persistent" in $$props) $$invalidate(4, persistent = $$props.persistent);
	};

	return [text, status, clearMessage, id, persistent];
}

class Message extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-30k1ze-style")) add_css$1();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { id: 3, text: 0, status: 1, persistent: 4 });
	}
}

/* src/sdk/messages/messages.svelte generated by Svelte v3.19.1 */

const { document: document_1 } = globals;

function add_css$2() {
	var style = element("style");
	style.id = "svelte-a46uz0-style";
	style.textContent = ".messages-holder.svelte-a46uz0{background:#b7d8f4;box-shadow:0 0 5px #000;padding:10px;position:fixed;right:0;top:0;width:100%;z-index:2000}";
	append(document_1.head, style);
}

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[2] = list[i];
	return child_ctx;
}

// (12:0) {#if $messages.length}
function create_if_block(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let init_action;
	let div_transition;
	let current;
	let dispose;
	let each_value = /*$messages*/ ctx[0];
	const get_key = ctx => /*message*/ ctx[2].id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "messages-holder svelte-a46uz0");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
			dispose = action_destroyer(init_action = /*init*/ ctx[1].call(null, div));
		},
		p(ctx, dirty) {
			if (dirty & /*$messages*/ 1) {
				const each_value = /*$messages*/ ctx[0];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block, null, get_each_context);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			if (local) {
				add_render_callback(() => {
					if (!div_transition) div_transition = create_bidirectional_transition(
						div,
						fly,
						{
							duration: 300,
							easing: quintOut,
							y: -30,
							opacity: 0
						},
						true
					);

					div_transition.run(1);
				});
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			if (local) {
				if (!div_transition) div_transition = create_bidirectional_transition(
					div,
					fly,
					{
						duration: 300,
						easing: quintOut,
						y: -30,
						opacity: 0
					},
					false
				);

				div_transition.run(0);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (detaching && div_transition) div_transition.end();
			dispose();
		}
	};
}

// (18:4) {#each $messages as message (message.id)}
function create_each_block(key_1, ctx) {
	let first;
	let current;
	const message_spread_levels = [/*message*/ ctx[2]];
	let message_props = {};

	for (let i = 0; i < message_spread_levels.length; i += 1) {
		message_props = assign(message_props, message_spread_levels[i]);
	}

	const message = new Message({ props: message_props });

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(message.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(message, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const message_changes = (dirty & /*$messages*/ 1)
			? get_spread_update(message_spread_levels, [get_spread_object(/*message*/ ctx[2])])
			: {};

			message.$set(message_changes);
		},
		i(local) {
			if (current) return;
			transition_in(message.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(message.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(message, detaching);
		}
	};
}

function create_fragment$2(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*$messages*/ ctx[0].length && create_if_block(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*$messages*/ ctx[0].length) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let $messages;
	component_subscribe($$self, store, $$value => $$invalidate(0, $messages = $$value));

	const init = node => {
		document.body.appendChild(node);
	};

	return [$messages, init];
}

class Messages extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1.getElementById("svelte-a46uz0-style")) add_css$2();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
	}
}

/* src/sdk/intro/intro.svelte generated by Svelte v3.19.1 */

function add_css$3() {
	var style = element("style");
	style.id = "svelte-1gvjo6o-style";
	style.textContent = ".intro.svelte-1gvjo6o.svelte-1gvjo6o{background:#fff;align-items:center;display:flex;height:100%;left:0;justify-content:center;position:absolute;text-transform:uppercase;top:0;width:100%;z-index:1}.intro--wrap.svelte-1gvjo6o.svelte-1gvjo6o{display:flex;font-size:60px;line-height:70px}.introToHide.svelte-1gvjo6o.svelte-1gvjo6o{opacity:0;transition:opacity .5s ease-in-out}.intro--wrap.svelte-1gvjo6o i.svelte-1gvjo6o{font-style:normal;animation-timing-function:ease-in-out;animation-duration:3s;animation-iteration-count:infinite}.l.svelte-1gvjo6o.svelte-1gvjo6o,.e1.svelte-1gvjo6o.svelte-1gvjo6o{color:#424242}.r.svelte-1gvjo6o.svelte-1gvjo6o,.n1.svelte-1gvjo6o.svelte-1gvjo6o{color:#de0000}.e2.svelte-1gvjo6o.svelte-1gvjo6o,.n2.svelte-1gvjo6o.svelte-1gvjo6o{color:#f6b800}.l.svelte-1gvjo6o.svelte-1gvjo6o{animation-delay:1s}.e1.svelte-1gvjo6o.svelte-1gvjo6o{animation-delay:1.1s}.r.svelte-1gvjo6o.svelte-1gvjo6o{animation-delay:1.2s}.n1.svelte-1gvjo6o.svelte-1gvjo6o{animation-delay:1.3s}.e2.svelte-1gvjo6o.svelte-1gvjo6o{animation-delay:1.4s}.n2.svelte-1gvjo6o.svelte-1gvjo6o{animation-delay:1.5s}.letters.svelte-1gvjo6o .intro--wrap i.svelte-1gvjo6o{animation-name:svelte-1gvjo6o-lettersAnim}@keyframes svelte-1gvjo6o-lettersAnim{0%{transform:translateY(0)}25%{transform:translateY(-50%)}50%{transform:translateY(0)}100%{transform:translateY(0)}}";
	append(document.head, style);
}

function create_fragment$3(ctx) {
	let div1;

	return {
		c() {
			div1 = element("div");

			div1.innerHTML = `<div class="intro--wrap svelte-1gvjo6o"><i class="l svelte-1gvjo6o">l</i> 
    <i class="e1 svelte-1gvjo6o">e</i> 
    <i class="r svelte-1gvjo6o">r</i> 
    <i class="n1 svelte-1gvjo6o">n</i> 
    <i class="e2 svelte-1gvjo6o">e</i> 
    <i class="n2 svelte-1gvjo6o">n</i></div>`;

			attr(div1, "class", "intro svelte-1gvjo6o");
			toggle_class(div1, "letters", /*letters*/ ctx[1]);
			toggle_class(div1, "introToHide", /*introToHide*/ ctx[0]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
		},
		p(ctx, [dirty]) {
			if (dirty & /*letters*/ 2) {
				toggle_class(div1, "letters", /*letters*/ ctx[1]);
			}

			if (dirty & /*introToHide*/ 1) {
				toggle_class(div1, "introToHide", /*introToHide*/ ctx[0]);
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div1);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let { introActive } = $$props;
	let { introToHide } = $$props;
	let { dataReady } = $$props;
	let letters = false;

	onMount(() => {
		setTimeout(
			() => {
				$$invalidate(1, letters = true);

				const introInterval = setInterval(
					() => {
						if (dataReady) {
							clearInterval(introInterval);
							$$invalidate(0, introToHide = true);

							setTimeout(
								() => {
									$$invalidate(2, introActive = false);
								},
								510
							);
						}
					},
					4000
				);
			},
			1
		);
	});

	$$self.$set = $$props => {
		if ("introActive" in $$props) $$invalidate(2, introActive = $$props.introActive);
		if ("introToHide" in $$props) $$invalidate(0, introToHide = $$props.introToHide);
		if ("dataReady" in $$props) $$invalidate(3, dataReady = $$props.dataReady);
	};

	return [introToHide, letters, introActive, dataReady];
}

class Intro extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1gvjo6o-style")) add_css$3();

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			introActive: 2,
			introToHide: 0,
			dataReady: 3
		});
	}
}

/* src/sdk/menu/menu.svelte generated by Svelte v3.19.1 */

function add_css$4() {
	var style = element("style");
	style.id = "svelte-tdal7u-style";
	style.textContent = ".menu.svelte-tdal7u{position:absolute;right:0;text-align:left;top:0;width:75%;z-index:1}.menu--overlay.svelte-tdal7u{background:rgba(0,0,0,.5);content:'';height:100%;left:0;position:fixed;top:0;width:100%;z-index:1}.menu--wrap.svelte-tdal7u{background:#fff;box-shadow:5px 0 7px 5px #000;display:flex;flex-direction:column;justify-content:space-between;height:100vh;overflow:auto;position:relative;z-index:2}.menu--frame.svelte-tdal7u{display:flex;flex:1;flex-direction:column}button.svelte-tdal7u{background:#b7d8f4;border:0;flex:1;padding:20px;text-transform:uppercase;width:100%}button+button.svelte-tdal7u{border-top:1px solid #fff}";
	append(document.head, style);
}

function create_fragment$4(ctx) {
	let div2;
	let div1;
	let div0;
	let button0;
	let t1;
	let button1;
	let t3;
	let button2;
	let t5;
	let button3;
	let t7;
	let button4;
	let div1_transition;
	let t9;
	let i;
	let i_transition;
	let current;
	let dispose;

	return {
		c() {
			div2 = element("div");
			div1 = element("div");
			div0 = element("div");
			button0 = element("button");
			button0.textContent = "Домой";
			t1 = space();
			button1 = element("button");
			button1.textContent = "Добавить слово";
			t3 = space();
			button2 = element("button");
			button2.textContent = "словарь";
			t5 = space();
			button3 = element("button");
			button3.textContent = "категории";
			t7 = space();
			button4 = element("button");
			button4.textContent = "Настройки";
			t9 = space();
			i = element("i");
			attr(button0, "class", "svelte-tdal7u");
			attr(button1, "class", "svelte-tdal7u");
			attr(button2, "class", "svelte-tdal7u");
			attr(button3, "class", "svelte-tdal7u");
			attr(button4, "class", "svelte-tdal7u");
			attr(div0, "class", "menu--frame svelte-tdal7u");
			attr(div1, "class", "menu--wrap svelte-tdal7u");
			attr(i, "class", "menu--overlay svelte-tdal7u");
			attr(div2, "class", "menu svelte-tdal7u");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			append(div2, div1);
			append(div1, div0);
			append(div0, button0);
			append(div0, t1);
			append(div0, button1);
			append(div0, t3);
			append(div0, button2);
			append(div0, t5);
			append(div0, button3);
			append(div0, t7);
			append(div0, button4);
			append(div2, t9);
			append(div2, i);
			current = true;

			dispose = [
				listen(button0, "click", /*click_handler*/ ctx[3]),
				listen(button1, "click", /*click_handler_1*/ ctx[4]),
				listen(button2, "click", /*click_handler_2*/ ctx[5]),
				listen(button3, "click", /*click_handler_3*/ ctx[6]),
				listen(button4, "click", /*click_handler_4*/ ctx[7]),
				listen(i, "click", /*hideMenu*/ ctx[0])
			];
		},
		p: noop,
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 200, opacity: 0, duration: 300 }, true);
				div1_transition.run(1);
			});

			add_render_callback(() => {
				if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, true);
				i_transition.run(1);
			});

			current = true;
		},
		o(local) {
			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fly, { x: 200, opacity: 0, duration: 300 }, false);
			div1_transition.run(0);
			if (!i_transition) i_transition = create_bidirectional_transition(i, fade, {}, false);
			i_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if (detaching && div1_transition) div1_transition.end();
			if (detaching && i_transition) i_transition.end();
			run_all(dispose);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let { menuActive } = $$props;

	const hideMenu = () => {
		$$invalidate(2, menuActive = false);
	};

	const onMenu = viewId => {
		if (store$6[viewId]) {
			store$6[viewId]();
			hideMenu();
		}
	};

	const click_handler = () => onMenu("home");
	const click_handler_1 = () => onMenu("addWord");
	const click_handler_2 = () => onMenu("dict");
	const click_handler_3 = () => onMenu("categories");
	const click_handler_4 = () => onMenu("setup");

	$$self.$set = $$props => {
		if ("menuActive" in $$props) $$invalidate(2, menuActive = $$props.menuActive);
	};

	return [
		hideMenu,
		onMenu,
		menuActive,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4
	];
}

class Menu extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-tdal7u-style")) add_css$4();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { menuActive: 2 });
	}
}

/* src/sdk/header/header.svelte generated by Svelte v3.19.1 */

function add_css$5() {
	var style = element("style");
	style.id = "svelte-qj5be0-style";
	style.textContent = ".header.svelte-qj5be0.svelte-qj5be0{background:#b7d8f4;box-shadow:0 -10px 10px 10px #000;position:relative;text-align:center}.header.svelte-qj5be0 .logo.svelte-qj5be0{color:inherit;display:inline-flex;font-size:28px;font-weight:bold;height:40px;overflow:hidden;padding:0 10px;line-height:40px;text-transform:uppercase;text-decoration:none;vertical-align:top}.header--button.svelte-qj5be0.svelte-qj5be0{background:none;border:0;height:40px;padding:8px;position:absolute;top:0;width:40px}.header--menu.svelte-qj5be0.svelte-qj5be0{right:0}.header--nav.svelte-qj5be0.svelte-qj5be0{left:0}.logo.svelte-qj5be0 span.svelte-qj5be0{display:block;text-shadow:1px 1px 1px rgba(0,0,0,1), -1px -1px 1px rgba(0,0,0,1)}.black.svelte-qj5be0.svelte-qj5be0{color:#424242}.red.svelte-qj5be0.svelte-qj5be0{color:#de0000}.yellow.svelte-qj5be0.svelte-qj5be0{color:#f6b800}.attention.svelte-qj5be0.svelte-qj5be0{background:#db2123;border-radius:7px;bottom:5px;color:#fff;font-style:normal;font-size:11px;height:14px;line-height:14px;right:2px;position:absolute;text-align:center;width:14px}.attention.svelte-qj5be0.svelte-qj5be0:after{content:'!'}";
	append(document.head, style);
}

// (29:4) {#if !$user.userId}
function create_if_block_1(ctx) {
	let i;

	return {
		c() {
			i = element("i");
			attr(i, "class", "attention svelte-qj5be0");
		},
		m(target, anchor) {
			insert(target, i, anchor);
		},
		d(detaching) {
			if (detaching) detach(i);
		}
	};
}

// (34:2) {#if menuActive}
function create_if_block$1(ctx) {
	let updating_menuActive;
	let current;

	function menu_menuActive_binding(value) {
		/*menu_menuActive_binding*/ ctx[5].call(null, value);
	}

	let menu_props = {};

	if (/*menuActive*/ ctx[0] !== void 0) {
		menu_props.menuActive = /*menuActive*/ ctx[0];
	}

	const menu = new Menu({ props: menu_props });
	binding_callbacks.push(() => bind(menu, "menuActive", menu_menuActive_binding));

	return {
		c() {
			create_component(menu.$$.fragment);
		},
		m(target, anchor) {
			mount_component(menu, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const menu_changes = {};

			if (!updating_menuActive && dirty & /*menuActive*/ 1) {
				updating_menuActive = true;
				menu_changes.menuActive = /*menuActive*/ ctx[0];
				add_flush_callback(() => updating_menuActive = false);
			}

			menu.$set(menu_changes);
		},
		i(local) {
			if (current) return;
			transition_in(menu.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(menu.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(menu, detaching);
		}
	};
}

function create_fragment$5(ctx) {
	let header;
	let a;
	let t5;
	let button0;
	let t6;
	let button1;
	let t7;
	let t8;
	let current;
	let dispose;
	const icon0 = new Icon({ props: { name: "menu" } });
	const icon1 = new Icon({ props: { name: "profile" } });
	let if_block0 = !/*$user*/ ctx[1].userId && create_if_block_1();
	let if_block1 = /*menuActive*/ ctx[0] && create_if_block$1(ctx);

	return {
		c() {
			header = element("header");
			a = element("a");

			a.innerHTML = `<span class="black svelte-qj5be0">le</span> 
    <span class="red svelte-qj5be0">rn</span> 
    <span class="yellow svelte-qj5be0">en</span>`;

			t5 = space();
			button0 = element("button");
			create_component(icon0.$$.fragment);
			t6 = space();
			button1 = element("button");
			create_component(icon1.$$.fragment);
			t7 = space();
			if (if_block0) if_block0.c();
			t8 = space();
			if (if_block1) if_block1.c();
			attr(a, "class", "logo svelte-qj5be0");
			attr(a, "href", "/");
			attr(button0, "class", "header--button header--menu svelte-qj5be0");
			attr(button1, "class", "header--button header--nav svelte-qj5be0");
			attr(header, "class", "header svelte-qj5be0");
		},
		m(target, anchor) {
			insert(target, header, anchor);
			append(header, a);
			append(header, t5);
			append(header, button0);
			mount_component(icon0, button0, null);
			append(header, t6);
			append(header, button1);
			mount_component(icon1, button1, null);
			append(button1, t7);
			if (if_block0) if_block0.m(button1, null);
			append(header, t8);
			if (if_block1) if_block1.m(header, null);
			current = true;

			dispose = [
				listen(a, "click", prevent_default(/*click_handler*/ ctx[3])),
				listen(button0, "click", /*openMenu*/ ctx[2]),
				listen(button1, "click", /*click_handler_1*/ ctx[4])
			];
		},
		p(ctx, [dirty]) {
			if (!/*$user*/ ctx[1].userId) {
				if (!if_block0) {
					if_block0 = create_if_block_1();
					if_block0.c();
					if_block0.m(button1, null);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (/*menuActive*/ ctx[0]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block$1(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(header, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(icon0.$$.fragment, local);
			transition_in(icon1.$$.fragment, local);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(icon0.$$.fragment, local);
			transition_out(icon1.$$.fragment, local);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(header);
			destroy_component(icon0);
			destroy_component(icon1);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			run_all(dispose);
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let $user;
	component_subscribe($$self, store$3, $$value => $$invalidate(1, $user = $$value));
	let menuActive = false;

	const openMenu = () => {
		$$invalidate(0, menuActive = true);
	};

	const click_handler = () => store$6.home();
	const click_handler_1 = () => store$6.sync();

	function menu_menuActive_binding(value) {
		menuActive = value;
		$$invalidate(0, menuActive);
	}

	return [
		menuActive,
		$user,
		openMenu,
		click_handler,
		click_handler_1,
		menu_menuActive_binding
	];
}

class Header extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-qj5be0-style")) add_css$5();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
	}
}

/* src/sdk/transition/slide.svelte generated by Svelte v3.19.1 */

function add_css$6() {
	var style = element("style");
	style.id = "svelte-15inpje-style";
	style.textContent = "div.svelte-15inpje{overflow:hidden}";
	append(document.head, style);
}

// (7:0) {#if active}
function create_if_block$2(ctx) {
	let div;
	let div_transition;
	let current;
	const default_slot_template = /*$$slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "class", "svelte-15inpje");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);

			if (local) {
				add_render_callback(() => {
					if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
					div_transition.run(1);
				});
			}

			current = true;
		},
		o(local) {
			transition_out(default_slot, local);

			if (local) {
				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
				div_transition.run(0);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
			if (detaching && div_transition) div_transition.end();
		}
	};
}

function create_fragment$6(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*active*/ ctx[0] && create_if_block$2(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*active*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let { active } = $$props;
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("active" in $$props) $$invalidate(0, active = $$props.active);
		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	return [active, $$scope, $$slots];
}

class Slide extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-15inpje-style")) add_css$6();
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { active: 0 });
	}
}

/* src/views/categories/categories.svelte generated by Svelte v3.19.1 */

const { document: document_1$1 } = globals;

function add_css$7() {
	var style = element("style");
	style.id = "svelte-1b7513r-style";
	style.textContent = ".category.svelte-1b7513r.svelte-1b7513r{background:#ffedc1;border:1px solid #104b8a;border-radius:5px;cursor:pointer;display:block;font-size:12px;font-weight:normal;line-height:16px;margin-top:20px;padding:7px 10px;user-select:none;text-transform:uppercase}.category.svelte-1b7513r.svelte-1b7513r:first-child{margin-top:0}.category.svelte-1b7513r.svelte-1b7513r::before{content:'-';display:inline-block;font-size:15px;margin-top:-1px;padding-right:10px;text-align:center;vertical-align:top;width:22px}.collapsed.svelte-1b7513r.svelte-1b7513r::before{content:'+'}.category.svelte-1b7513r .buttons.svelte-1b7513r{float:right;margin:-4px -7px -4px 5px}.category.svelte-1b7513r button.svelte-1b7513r{background:#f6b800;border:0;border-radius:5px;margin-left:3px;padding:2px}.category.svelte-1b7513r.svelte-1b7513r .icon{height:20px;width:20px}.words-block.svelte-1b7513r.svelte-1b7513r{padding:0 0 5px 30px;position:relative}.words-block.svelte-1b7513r.svelte-1b7513r:empty{padding-bottom:0}.words-block.svelte-1b7513r.svelte-1b7513r::before{background:#104b8a;content:'';height:calc(100% - 12px);left:15px;position:absolute;top:-6px;width:1px}.word.svelte-1b7513r.svelte-1b7513r{background:none;border:1px solid #104b8a;border-radius:5px;display:block;line-height:20px;margin-top:5px;padding:2px 5px;position:relative;text-align:left;width:100%}.word.svelte-1b7513r.svelte-1b7513r::before{background:#104b8a;content:'';height:1px;left:-16px;position:absolute;top:11px;width:16px}.word.svelte-1b7513r.svelte-1b7513r .icon{float:right;height:20px;margin-left:5px;width:20px}.suggestion.svelte-1b7513r.svelte-1b7513r{color:#db2123;padding-top:20px}.suggestion.svelte-1b7513r.svelte-1b7513r:first-child{padding-top:5px}.suggestion+.word.svelte-1b7513r.svelte-1b7513r{background:#f4c1c6;margin-bottom:20px}.suggestion+.word.svelte-1b7513r.svelte-1b7513r:last-child{margin-bottom:0}";
	append(document_1$1.head, style);
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[27] = list[i];
	return child_ctx;
}

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[22] = list[i].categoryName;
	child_ctx[23] = list[i].categoryId;
	child_ctx[24] = list[i].words;
	return child_ctx;
}

// (123:2) {:else}
function create_else_block_2(ctx) {
	let t;

	return {
		c() {
			t = text("нет категорий");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (94:6) {:else}
function create_else_block_1(ctx) {
	let t_value = /*categoryName*/ ctx[22] + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*categoriesList*/ 16 && t_value !== (t_value = /*categoryName*/ ctx[22] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (88:6) {#if categoryId === categoryToEdit}
function create_if_block_2(ctx) {
	let span;
	let t_value = /*categoryName*/ ctx[22] + "";
	let t;
	let dispose;

	return {
		c() {
			span = element("span");
			t = text(t_value);
			attr(span, "contenteditable", "");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
			/*span_binding*/ ctx[15](span);
			dispose = listen(span, "click", stop_propagation(/*click_handler*/ ctx[14]));
		},
		p(ctx, dirty) {
			if (dirty & /*categoriesList*/ 16 && t_value !== (t_value = /*categoryName*/ ctx[22] + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(span);
			/*span_binding*/ ctx[15](null);
			dispose();
		}
	};
}

// (102:8) {:else}
function create_else_block(ctx) {
	let button;
	let current;
	let dispose;
	const icon = new Icon({ props: { name: "edit" } });

	function click_handler_2(...args) {
		return /*click_handler_2*/ ctx[17](/*categoryId*/ ctx[23], ...args);
	}

	return {
		c() {
			button = element("button");
			create_component(icon.$$.fragment);
			attr(button, "class", "svelte-1b7513r");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			mount_component(icon, button, null);
			current = true;
			dispose = listen(button, "click", stop_propagation(click_handler_2));
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			destroy_component(icon);
			dispose();
		}
	};
}

// (99:8) {#if categoryId === categoryToEdit}
function create_if_block_1$1(ctx) {
	let button0;
	let t;
	let button1;
	let current;
	let dispose;
	const icon0 = new Icon({ props: { name: "checkbox" } });

	function click_handler_1(...args) {
		return /*click_handler_1*/ ctx[16](/*categoryId*/ ctx[23], ...args);
	}

	const icon1 = new Icon({ props: { name: "turnOff" } });

	return {
		c() {
			button0 = element("button");
			create_component(icon0.$$.fragment);
			t = space();
			button1 = element("button");
			create_component(icon1.$$.fragment);
			attr(button0, "class", "svelte-1b7513r");
			attr(button1, "class", "svelte-1b7513r");
		},
		m(target, anchor) {
			insert(target, button0, anchor);
			mount_component(icon0, button0, null);
			insert(target, t, anchor);
			insert(target, button1, anchor);
			mount_component(icon1, button1, null);
			current = true;

			dispose = [
				listen(button0, "click", stop_propagation(click_handler_1)),
				listen(button1, "click", stop_propagation(/*onCancel*/ ctx[8]))
			];
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
		},
		i(local) {
			if (current) return;
			transition_in(icon0.$$.fragment, local);
			transition_in(icon1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon0.$$.fragment, local);
			transition_out(icon1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button0);
			destroy_component(icon0);
			if (detaching) detach(t);
			if (detaching) detach(button1);
			destroy_component(icon1);
			run_all(dispose);
		}
	};
}

// (112:10) {#if clickedWord[0] === categoryId && clickedWord[1] === wordId}
function create_if_block$3(ctx) {
	let div;
	let dispose;

	return {
		c() {
			div = element("div");
			div.textContent = "Чтобы удалить слово из категории нажмите по нему еще раз. Чтобы отменить удаление - нажмите на это сообщение";
			attr(div, "class", "suggestion svelte-1b7513r");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			dispose = listen(div, "click", /*click_handler_5*/ ctx[20]);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(div);
			dispose();
		}
	};
}

// (111:8) {#each words as wordId (wordId)}
function create_each_block_1(key_1, ctx) {
	let first;
	let t0;
	let button;
	let t1_value = /*$wordsStore*/ ctx[5][/*wordId*/ ctx[27]].original + "";
	let t1;
	let t2;
	let t3;
	let current;
	let dispose;
	let if_block = /*clickedWord*/ ctx[0][0] === /*categoryId*/ ctx[23] && /*clickedWord*/ ctx[0][1] === /*wordId*/ ctx[27] && create_if_block$3(ctx);
	const icon = new Icon({ props: { name: "unchain" } });

	function click_handler_6(...args) {
		return /*click_handler_6*/ ctx[21](/*categoryId*/ ctx[23], /*wordId*/ ctx[27], ...args);
	}

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			if (if_block) if_block.c();
			t0 = space();
			button = element("button");
			t1 = text(t1_value);
			t2 = space();
			create_component(icon.$$.fragment);
			t3 = space();
			attr(button, "class", "word svelte-1b7513r");
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, t0, anchor);
			insert(target, button, anchor);
			append(button, t1);
			append(button, t2);
			mount_component(icon, button, null);
			append(button, t3);
			current = true;
			dispose = listen(button, "click", click_handler_6);
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (/*clickedWord*/ ctx[0][0] === /*categoryId*/ ctx[23] && /*clickedWord*/ ctx[0][1] === /*wordId*/ ctx[27]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					if_block.m(t0.parentNode, t0);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if ((!current || dirty & /*$wordsStore, categoriesList*/ 48) && t1_value !== (t1_value = /*$wordsStore*/ ctx[5][/*wordId*/ ctx[27]].original + "")) set_data(t1, t1_value);
		},
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(t0);
			if (detaching) detach(button);
			destroy_component(icon);
			dispose();
		}
	};
}

// (109:4) <Slide active={!collapsed.includes(categoryId)}>
function create_default_slot(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t;
	let current;
	let each_value_1 = /*words*/ ctx[24];
	const get_key = ctx => /*wordId*/ ctx[27];

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			attr(div, "class", "words-block svelte-1b7513r");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			insert(target, t, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*onUnChain, categoriesList, $wordsStore, clickedWord*/ 2097) {
				const each_value_1 = /*words*/ ctx[24];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1, null, get_each_context_1);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (detaching) detach(t);
		}
	};
}

// (82:2) {#each categoriesList as { categoryName, categoryId, words }
function create_each_block$1(key_1, ctx) {
	let h2;
	let t0;
	let div;
	let current_block_type_index;
	let if_block1;
	let t1;
	let button;
	let t2;
	let current;
	let dispose;

	function select_block_type(ctx, dirty) {
		if (/*categoryId*/ ctx[23] === /*categoryToEdit*/ ctx[2]) return create_if_block_2;
		return create_else_block_1;
	}

	let current_block_type = select_block_type(ctx);
	let if_block0 = current_block_type(ctx);
	const if_block_creators = [create_if_block_1$1, create_else_block];
	const if_blocks = [];

	function select_block_type_1(ctx, dirty) {
		if (/*categoryId*/ ctx[23] === /*categoryToEdit*/ ctx[2]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	const icon = new Icon({ props: { name: "delete" } });

	function click_handler_3(...args) {
		return /*click_handler_3*/ ctx[18](/*categoryId*/ ctx[23], ...args);
	}

	function click_handler_4(...args) {
		return /*click_handler_4*/ ctx[19](/*categoryId*/ ctx[23], ...args);
	}

	const slide = new Slide({
			props: {
				active: !/*collapsed*/ ctx[1].includes(/*categoryId*/ ctx[23]),
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			}
		});

	return {
		key: key_1,
		first: null,
		c() {
			h2 = element("h2");
			if_block0.c();
			t0 = space();
			div = element("div");
			if_block1.c();
			t1 = space();
			button = element("button");
			create_component(icon.$$.fragment);
			t2 = space();
			create_component(slide.$$.fragment);
			attr(button, "class", "svelte-1b7513r");
			attr(div, "class", "buttons svelte-1b7513r");
			attr(h2, "class", "category svelte-1b7513r");
			toggle_class(h2, "collapsed", /*collapsed*/ ctx[1].includes(/*categoryId*/ ctx[23]));
			this.first = h2;
		},
		m(target, anchor) {
			insert(target, h2, anchor);
			if_block0.m(h2, null);
			append(h2, t0);
			append(h2, div);
			if_blocks[current_block_type_index].m(div, null);
			append(div, t1);
			append(div, button);
			mount_component(icon, button, null);
			insert(target, t2, anchor);
			mount_component(slide, target, anchor);
			current = true;

			dispose = [
				listen(button, "click", stop_propagation(click_handler_3)),
				listen(h2, "click", click_handler_4)
			];
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;

			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
				if_block0.p(ctx, dirty);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);

				if (if_block0) {
					if_block0.c();
					if_block0.m(h2, t0);
				}
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block1 = if_blocks[current_block_type_index];

				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				}

				transition_in(if_block1, 1);
				if_block1.m(div, t1);
			}

			if (dirty & /*collapsed, categoriesList*/ 18) {
				toggle_class(h2, "collapsed", /*collapsed*/ ctx[1].includes(/*categoryId*/ ctx[23]));
			}

			const slide_changes = {};
			if (dirty & /*collapsed, categoriesList*/ 18) slide_changes.active = !/*collapsed*/ ctx[1].includes(/*categoryId*/ ctx[23]);

			if (dirty & /*$$scope, categoriesList, $wordsStore, clickedWord*/ 1073741873) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			transition_in(icon.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			transition_out(icon.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(h2);
			if_block0.d();
			if_blocks[current_block_type_index].d();
			destroy_component(icon);
			if (detaching) detach(t2);
			destroy_component(slide, detaching);
			run_all(dispose);
		}
	};
}

function create_fragment$7(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let current;
	let each_value = /*categoriesList*/ ctx[4];
	const get_key = ctx => /*categoryId*/ ctx[23];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$1(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
	}

	let each_1_else = null;

	if (!each_value.length) {
		each_1_else = create_else_block_2();
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			if (each_1_else) {
				each_1_else.c();
			}
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			if (each_1_else) {
				each_1_else.m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*collapsed, categoriesList, onUnChain, $wordsStore, clickedWord, onClick, onDelete, onCancel, onSave, categoryToEdit, onEdit, editableNode*/ 4095) {
				const each_value = /*categoriesList*/ ctx[4];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
				check_outros();
			}

			if (each_value.length) {
				if (each_1_else) {
					each_1_else.d(1);
					each_1_else = null;
				}
			} else if (!each_1_else) {
				each_1_else = create_else_block_2();
				each_1_else.c();
				each_1_else.m(div, null);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (each_1_else) each_1_else.d();
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let $wordsStore;
	let $categoriesStore;
	component_subscribe($$self, store$4, $$value => $$invalidate(5, $wordsStore = $$value));
	component_subscribe($$self, store$5, $$value => $$invalidate(12, $categoriesStore = $$value));
	let clickedWord = [];
	let collapsed = [];
	let categoryToEdit = null;
	let editableNode;
	let categoriesList;

	const onEdit = categoryId => {
		$$invalidate(2, categoryToEdit = categoryId);
	};

	const onSave = categoryId => {
		const newCategoryName = editableNode.textContent;
		const existedCatyName = categoriesList.find(c => c.categoryName === newCategoryName);

		if (!existedCatyName && newCategoryName.length <= 100) {
			store$5.updateCategory({
				categoryId,
				categoryName: newCategoryName
			});
		}

		onCancel();
	};

	const onCancel = () => {
		$$invalidate(2, categoryToEdit = $$invalidate(3, editableNode = null));
	};

	const onDelete = categoryId => {
		if (confirm("Удалить категорию?")) {
			store$4.deleteCategoryIdFromWords(categoryId);
			store$5.deleteCategory(categoryId);
		}
	};

	const onClick = categoryId => {
		if (collapsed.includes(categoryId)) {
			collapsed.splice(collapsed.indexOf(categoryId), 1);
		} else {
			collapsed.push(categoryId);
		}

		$$invalidate(1, collapsed = [...collapsed]);
	};

	const onUnChain = (categoryId, wordId) => {
		if (clickedWord[0] === categoryId && clickedWord[1] === wordId) {
			store$4.unChainWordWithCategoryId(wordId, categoryId);
		} else {
			$$invalidate(0, clickedWord = [categoryId, wordId]);
		}
	};

	const selectText = () => {
		if (editableNode && document.activeElement !== editableNode) {
			editableNode.focus();
			const range = document.createRange();
			range.selectNodeContents(editableNode);
			range.collapse();
			const sel = window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	};

	afterUpdate(selectText);

	function click_handler(event) {
		bubble($$self, event);
	}

	function span_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(3, editableNode = $$value);
		});
	}

	const click_handler_1 = categoryId => onSave(categoryId);
	const click_handler_2 = categoryId => onEdit(categoryId);
	const click_handler_3 = categoryId => onDelete(categoryId);
	const click_handler_4 = categoryId => onClick(categoryId);
	const click_handler_5 = () => $$invalidate(0, clickedWord = []);
	const click_handler_6 = (categoryId, wordId) => onUnChain(categoryId, wordId);

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$wordsStore, $categoriesStore*/ 4128) {
			 $$invalidate(4, categoriesList = $wordsStore && Object.values($categoriesStore).map(category => {
				return {
					...category,
					words: store$4.getWordsByCategoryId(category.categoryId)
				};
			}));
		}
	};

	return [
		clickedWord,
		collapsed,
		categoryToEdit,
		editableNode,
		categoriesList,
		$wordsStore,
		onEdit,
		onSave,
		onCancel,
		onDelete,
		onClick,
		onUnChain,
		$categoriesStore,
		selectText,
		click_handler,
		span_binding,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4,
		click_handler_5,
		click_handler_6
	];
}

class Categories extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1$1.getElementById("svelte-1b7513r-style")) add_css$7();
		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});
	}
}

/* src/sdk/form-input/form-input.svelte generated by Svelte v3.19.1 */

function add_css$8() {
	var style = element("style");
	style.id = "svelte-iji08-style";
	style.textContent = ".form-input.svelte-iji08{display:block;margin-bottom:20px;position:relative}.form-input.svelte-iji08:last-child{margin-bottom:0}.form-input--label.svelte-iji08{display:inline-block;margin-bottom:1px;vertical-align:top}.form-input.svelte-iji08 input,.form-input.svelte-iji08 select{background:#fff;border:solid #ccc;border-width:1px 1px 3px;border-radius:2px;color:#4b4b4b;display:block;font-size:15px;line-height:21px;height:40px;padding:7px 10px 8px;max-width:100%;min-width:100%;width:100%}.form-input.svelte-iji08 input:focus,.form-input.svelte-iji08 select:focus{border-color:#b7d8f4}.form-input--error.svelte-iji08 input,.form-input--error.svelte-iji08 select{border-color:#db2123}";
	append(document.head, style);
}

// (8:4) {#if label}
function create_if_block$4(ctx) {
	let span;
	let t;

	return {
		c() {
			span = element("span");
			t = text(/*label*/ ctx[0]);
			attr(span, "class", "form-input--label svelte-iji08");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*label*/ 1) set_data(t, /*label*/ ctx[0]);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

function create_fragment$8(ctx) {
	let span;
	let label_1;
	let t;
	let current;
	let if_block = /*label*/ ctx[0] && create_if_block$4(ctx);
	const default_slot_template = /*$$slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			span = element("span");
			label_1 = element("label");
			if (if_block) if_block.c();
			t = space();
			if (default_slot) default_slot.c();
			attr(span, "class", "form-input svelte-iji08");
			toggle_class(span, "form-input--error", /*errors*/ ctx[1] && /*$errors*/ ctx[2].length);
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, label_1);
			if (if_block) if_block.m(label_1, null);
			append(label_1, t);

			if (default_slot) {
				default_slot.m(label_1, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (/*label*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$4(ctx);
					if_block.c();
					if_block.m(label_1, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
			}

			if (dirty & /*errors, $errors*/ 6) {
				toggle_class(span, "form-input--error", /*errors*/ ctx[1] && /*$errors*/ ctx[2].length);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			if (if_block) if_block.d();
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let $errors,
		$$unsubscribe_errors = noop,
		$$subscribe_errors = () => ($$unsubscribe_errors(), $$unsubscribe_errors = subscribe(errors, $$value => $$invalidate(2, $errors = $$value)), errors);

	$$self.$$.on_destroy.push(() => $$unsubscribe_errors());
	let { label = "" } = $$props;
	let { errors = null } = $$props;
	$$subscribe_errors();
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("label" in $$props) $$invalidate(0, label = $$props.label);
		if ("errors" in $$props) $$subscribe_errors($$invalidate(1, errors = $$props.errors));
		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	return [label, errors, $errors, $$scope, $$slots];
}

class Form_input extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-iji08-style")) add_css$8();
		init(this, options, instance$8, create_fragment$8, safe_not_equal, { label: 0, errors: 1 });
	}
}

/* src/sdk/autocomplete/autocomplete.svelte generated by Svelte v3.19.1 */

function create_default_slot$1(ctx) {
	let input;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*value*/ ctx[0]);
			dispose = listen(input, "input", /*input_input_handler*/ ctx[4]);
		},
		p(ctx, dirty) {
			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				set_input_value(input, /*value*/ ctx[0]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			dispose();
		}
	};
}

function create_fragment$9(ctx) {
	let current;

	const forminput = new Form_input({
			props: {
				label: /*label*/ ctx[1],
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(forminput.$$.fragment);
		},
		m(target, anchor) {
			mount_component(forminput, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const forminput_changes = {};
			if (dirty & /*label*/ 2) forminput_changes.label = /*label*/ ctx[1];

			if (dirty & /*$$scope, value*/ 33) {
				forminput_changes.$$scope = { dirty, ctx };
			}

			forminput.$set(forminput_changes);
		},
		i(local) {
			if (current) return;
			transition_in(forminput.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(forminput.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(forminput, detaching);
		}
	};
}

function instance$9($$self, $$props, $$invalidate) {
	let $words;
	component_subscribe($$self, store$4, $$value => $$invalidate(3, $words = $$value));
	let { result } = $$props;
	let { value = "" } = $$props;
	let { label = null } = $$props;

	function input_input_handler() {
		value = this.value;
		$$invalidate(0, value);
	}

	$$self.$set = $$props => {
		if ("result" in $$props) $$invalidate(2, result = $$props.result);
		if ("value" in $$props) $$invalidate(0, value = $$props.value);
		if ("label" in $$props) $$invalidate(1, label = $$props.label);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*value, $words*/ 9) {
			 {
				$$invalidate(2, result = value && value.length
				? Object.values($words).filter(word => {
						return word.original.toString().toLowerCase().indexOf(value.toLowerCase()) > -1;
					}).sort((a, b) => {
						a = a.original.toLowerCase();
						b = b.original.toLowerCase();

						if (a > b) {
							return 1;
						} else if (a < b) {
							return -1;
						} else {
							return 0;
						}
					}).map(word => word.wordId)
				: []);
			}
		}
	};

	return [value, label, result, $words, input_input_handler];
}

class Autocomplete extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$9, create_fragment$9, safe_not_equal, { result: 2, value: 0, label: 1 });
	}
}

/* src/views/dict/dict-word.svelte generated by Svelte v3.19.1 */

function add_css$9() {
	var style = element("style");
	style.id = "svelte-5f9ren-style";
	style.textContent = ".item.svelte-5f9ren{border-top:1px solid #104b8a;font-size:16px;line-height:21px;position:relative;transition:background-color .3s ease}.disabled.svelte-5f9ren{background:linear-gradient(to right, #ececec, #fff)}.item.svelte-5f9ren .icon-turnOff{color:#ccc;height:21px;position:absolute;right:10px;top:10px;width:21px}.item.svelte-5f9ren:first-of-type{border:0}.edit.svelte-5f9ren{background:none;border:0;border-radius:5px;padding:10px;position:absolute;right:0;top:0}.edit.svelte-5f9ren .icon{height:21px;width:21px}input:checked+.item.svelte-5f9ren{background:#b7d8f4}.text.svelte-5f9ren{display:block;padding:10px}";
	append(document.head, style);
}

// (17:2) {#if !word.active && !checked}
function create_if_block_1$2(ctx) {
	let current;
	const icon = new Icon({ props: { name: "turnOff" } });

	return {
		c() {
			create_component(icon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(icon, detaching);
		}
	};
}

// (21:2) {#if checked}
function create_if_block$5(ctx) {
	let button;
	let current;
	let dispose;
	const icon = new Icon({ props: { name: "edit" } });

	return {
		c() {
			button = element("button");
			create_component(icon.$$.fragment);
			attr(button, "class", "edit svelte-5f9ren");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			mount_component(icon, button, null);
			current = true;
			dispose = listen(button, "click", /*onEdit*/ ctx[2]);
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			destroy_component(icon);
			dispose();
		}
	};
}

function create_fragment$a(ctx) {
	let div;
	let label;
	let t0_value = /*word*/ ctx[0].original + "";
	let t0;
	let label_for_value;
	let t1;
	let t2;
	let current;
	let if_block0 = !/*word*/ ctx[0].active && !/*checked*/ ctx[1] && create_if_block_1$2();
	let if_block1 = /*checked*/ ctx[1] && create_if_block$5(ctx);

	return {
		c() {
			div = element("div");
			label = element("label");
			t0 = text(t0_value);
			t1 = space();
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			attr(label, "class", "text svelte-5f9ren");
			attr(label, "for", label_for_value = `cat${/*word*/ ctx[0].wordId}`);
			attr(div, "class", "item svelte-5f9ren");
			toggle_class(div, "disabled", !/*word*/ ctx[0].active);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, label);
			append(label, t0);
			append(div, t1);
			if (if_block0) if_block0.m(div, null);
			append(div, t2);
			if (if_block1) if_block1.m(div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if ((!current || dirty & /*word*/ 1) && t0_value !== (t0_value = /*word*/ ctx[0].original + "")) set_data(t0, t0_value);

			if (!current || dirty & /*word*/ 1 && label_for_value !== (label_for_value = `cat${/*word*/ ctx[0].wordId}`)) {
				attr(label, "for", label_for_value);
			}

			if (!/*word*/ ctx[0].active && !/*checked*/ ctx[1]) {
				if (!if_block0) {
					if_block0 = create_if_block_1$2();
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div, t2);
				} else {
					transition_in(if_block0, 1);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*checked*/ ctx[1]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block$5(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (dirty & /*word*/ 1) {
				toggle_class(div, "disabled", !/*word*/ ctx[0].active);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance$a($$self, $$props, $$invalidate) {
	let { word } = $$props;
	let { checked } = $$props;
	const dispatch = createEventDispatcher();

	const onEdit = () => {
		dispatch("edit", word.wordId);
	};

	$$self.$set = $$props => {
		if ("word" in $$props) $$invalidate(0, word = $$props.word);
		if ("checked" in $$props) $$invalidate(1, checked = $$props.checked);
	};

	return [word, checked, onEdit];
}

class Dict_word extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-5f9ren-style")) add_css$9();
		init(this, options, instance$a, create_fragment$a, safe_not_equal, { word: 0, checked: 1 });
	}
}

/* src/views/dict/dict-buttons.svelte generated by Svelte v3.19.1 */

function add_css$a() {
	var style = element("style");
	style.id = "svelte-1t5b0za-style";
	style.textContent = ".buttons.svelte-1t5b0za.svelte-1t5b0za{background:#fff;box-shadow:0 0 5px #000;bottom:-100px;display:flex;left:0;opacity:0;padding:10px;position:fixed;transition:all .3s ease;width:100%}.buttons--active.svelte-1t5b0za.svelte-1t5b0za{bottom:0;opacity:1}.buttons.svelte-1t5b0za button.svelte-1t5b0za{border:0;border-radius:5px;font-size:12px;flex:1;line-height:15px;padding:7px;text-align:center;text-transform:uppercase}.green.svelte-1t5b0za.svelte-1t5b0za{background:#baffba}.grey.svelte-1t5b0za.svelte-1t5b0za{background:#ffedc1}.red.svelte-1t5b0za.svelte-1t5b0za{background:#f4c1c6}.buttons button+button.svelte-1t5b0za.svelte-1t5b0za{margin-left:10px}.buttons.svelte-1t5b0za.svelte-1t5b0za .icon{display:block;height:20px;margin:0 auto 7px;width:20px}";
	append(document.head, style);
}

function create_fragment$b(ctx) {
	let div;
	let button0;
	let t0;
	let t1;
	let button1;
	let t2;
	let t3;
	let button2;
	let t4;
	let current;
	let dispose;
	const icon0 = new Icon({ props: { name: "turnOff" } });
	const icon1 = new Icon({ props: { name: "turnOn" } });
	const icon2 = new Icon({ props: { name: "delete" } });

	return {
		c() {
			div = element("div");
			button0 = element("button");
			create_component(icon0.$$.fragment);
			t0 = text("выкл");
			t1 = space();
			button1 = element("button");
			create_component(icon1.$$.fragment);
			t2 = text("вкл");
			t3 = space();
			button2 = element("button");
			create_component(icon2.$$.fragment);
			t4 = text("удалить");
			attr(button0, "class", "grey svelte-1t5b0za");
			attr(button1, "class", "green svelte-1t5b0za");
			attr(button2, "class", "red svelte-1t5b0za");
			attr(div, "class", "buttons svelte-1t5b0za");
			toggle_class(div, "buttons--active", /*checked*/ ctx[0].length);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button0);
			mount_component(icon0, button0, null);
			append(button0, t0);
			append(div, t1);
			append(div, button1);
			mount_component(icon1, button1, null);
			append(button1, t2);
			append(div, t3);
			append(div, button2);
			mount_component(icon2, button2, null);
			append(button2, t4);
			current = true;

			dispose = [
				listen(button0, "click", /*onTurnOff*/ ctx[3]),
				listen(button1, "click", /*onTurnOn*/ ctx[2]),
				listen(button2, "click", /*onRemove*/ ctx[1])
			];
		},
		p(ctx, [dirty]) {
			if (dirty & /*checked*/ 1) {
				toggle_class(div, "buttons--active", /*checked*/ ctx[0].length);
			}
		},
		i(local) {
			if (current) return;
			transition_in(icon0.$$.fragment, local);
			transition_in(icon1.$$.fragment, local);
			transition_in(icon2.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon0.$$.fragment, local);
			transition_out(icon1.$$.fragment, local);
			transition_out(icon2.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(icon0);
			destroy_component(icon1);
			destroy_component(icon2);
			run_all(dispose);
		}
	};
}

function instance$b($$self, $$props, $$invalidate) {
	let { checked } = $$props;

	const editWords = selectedWordsAction => {
		switch (selectedWordsAction) {
			case "deleteWords":
				store$4.deleteWords(checked);
				break;
			case "enableWords":
				store$4.enableWords(checked);
				break;
			case "disableWords":
				store$4.disableWords(checked);
				break;
		}

		$$invalidate(0, checked = []);
	};

	const onRemove = () => editWords("deleteWords");
	const onTurnOn = () => editWords("enableWords");
	const onTurnOff = () => editWords("disableWords");

	$$self.$set = $$props => {
		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
	};

	return [checked, onRemove, onTurnOn, onTurnOff];
}

class Dict_buttons extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1t5b0za-style")) add_css$a();
		init(this, options, instance$b, create_fragment$b, safe_not_equal, { checked: 0 });
	}
}

/* src/views/dict/dict.svelte generated by Svelte v3.19.1 */

function add_css$b() {
	var style = element("style");
	style.id = "svelte-1n7fkrn-style";
	style.textContent = ".dict.svelte-1n7fkrn.svelte-1n7fkrn{position:relative;padding-bottom:76px}input.svelte-1n7fkrn.svelte-1n7fkrn{visibility:hidden;position:absolute}.alphabet.svelte-1n7fkrn.svelte-1n7fkrn{display:flex;flex-wrap:wrap;margin:0 -1px -1px 0}.alphabet.svelte-1n7fkrn button.svelte-1n7fkrn{background:#b7d8f4;border:solid #fff;border-width:0 1px 1px 0;flex:0 0 20%;font-size:20px;line-height:25px;padding:5px 15px}.alphabet--letter.svelte-1n7fkrn.svelte-1n7fkrn{flex:1 0 100%;margin:5px 0}.alphabet.svelte-1n7fkrn button.active.svelte-1n7fkrn{background:#104b8a;color:#fff;position:relative}.alphabet.svelte-1n7fkrn button.active.svelte-1n7fkrn:after{top:100%;border-style:solid;border-width:10px 10px 0;border-color:#104b8a transparent transparent;content:'';position:absolute;left:calc(50% - 10px);width:0;height:0}";
	append(document.head, style);
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[21] = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[26] = list[i];
	return child_ctx;
}

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[21] = list[i];
	return child_ctx;
}

// (84:2) {#if autocompleteValue && !renderResult.length}
function create_if_block_3(ctx) {
	let p;

	return {
		c() {
			p = element("p");
			p.textContent = "слов не найдено";
		},
		m(target, anchor) {
			insert(target, p, anchor);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

// (93:31) 
function create_if_block_1$3(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t;
	let current;
	let dispose;
	let each_value_2 = /*alphabet*/ ctx[9];
	const get_key = ctx => /*letter*/ ctx[26];

	for (let i = 0; i < each_value_2.length; i += 1) {
		let child_ctx = get_each_context_2(ctx, each_value_2, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_2(key, child_ctx));
	}

	let if_block = /*activeLetter*/ ctx[4] && create_if_block_2$1(ctx);

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			if (if_block) if_block.c();
			attr(div, "class", "alphabet svelte-1n7fkrn");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			append(div, t);
			if (if_block) if_block.m(div, null);
			current = true;
			dispose = listen(div, "click", /*showWordsByLetter*/ ctx[11]);
		},
		p(ctx, dirty) {
			if (dirty & /*alphabetWordsByLetters, alphabet, activeLetter*/ 592) {
				const each_value_2 = /*alphabet*/ ctx[9];
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_2, each_1_lookup, div, destroy_block, create_each_block_2, t, get_each_context_2);
			}

			if (/*activeLetter*/ ctx[4]) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block_2$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, null);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (if_block) if_block.d();
			dispose();
		}
	};
}

// (88:2) {#if renderResult.length}
function create_if_block$6(ctx) {
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_1_anchor;
	let current;
	let each_value = /*renderResult*/ ctx[2];
	const get_key = ctx => /*wordId*/ ctx[21];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$2(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (dirty & /*$words, renderResult, checked, onEdit*/ 1292) {
				const each_value = /*renderResult*/ ctx[2];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(each_1_anchor);
		}
	};
}

// (95:6) {#each alphabet as letter (letter)}
function create_each_block_2(key_1, ctx) {
	let button;
	let t_value = /*letter*/ ctx[26] + "";
	let t;
	let button_disabled_value;

	return {
		key: key_1,
		first: null,
		c() {
			button = element("button");
			t = text(t_value);
			button.disabled = button_disabled_value = !/*alphabetWordsByLetters*/ ctx[6][/*letter*/ ctx[26]];
			attr(button, "class", "svelte-1n7fkrn");
			toggle_class(button, "active", /*activeLetter*/ ctx[4] && /*letter*/ ctx[26] === /*activeLetter*/ ctx[4].innerText);
			this.first = button;
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, t);
		},
		p(ctx, dirty) {
			if (dirty & /*alphabetWordsByLetters*/ 64 && button_disabled_value !== (button_disabled_value = !/*alphabetWordsByLetters*/ ctx[6][/*letter*/ ctx[26]])) {
				button.disabled = button_disabled_value;
			}

			if (dirty & /*activeLetter, alphabet*/ 528) {
				toggle_class(button, "active", /*activeLetter*/ ctx[4] && /*letter*/ ctx[26] === /*activeLetter*/ ctx[4].innerText);
			}
		},
		d(detaching) {
			if (detaching) detach(button);
		}
	};
}

// (99:6) {#if activeLetter}
function create_if_block_2$1(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let current;
	let dispose;
	let each_value_1 = /*alphabetWords*/ ctx[7];
	const get_key = ctx => /*wordId*/ ctx[21];

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "alphabet--letter svelte-1n7fkrn");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			/*div_binding*/ ctx[19](div);
			current = true;
			dispose = listen(div, "click", stop_propagation(/*click_handler*/ ctx[13]));
		},
		p(ctx, dirty) {
			if (dirty & /*$words, alphabetWords, checked, onEdit*/ 1416) {
				const each_value_1 = /*alphabetWords*/ ctx[7];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1$1, null, get_each_context_1$1);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			/*div_binding*/ ctx[19](null);
			dispose();
		}
	};
}

// (101:10) {#each alphabetWords as wordId (wordId)}
function create_each_block_1$1(key_1, ctx) {
	let input;
	let input_value_value;
	let input_id_value;
	let checkbox_action;
	let t;
	let current;
	let dispose;

	const dictword = new Dict_word({
			props: {
				word: /*$words*/ ctx[8][/*wordId*/ ctx[21]],
				checked: /*checked*/ ctx[3].includes(/*wordId*/ ctx[21])
			}
		});

	dictword.$on("edit", /*onEdit*/ ctx[10]);

	return {
		key: key_1,
		first: null,
		c() {
			input = element("input");
			t = space();
			create_component(dictword.$$.fragment);
			attr(input, "type", "checkbox");
			input.__value = input_value_value = /*wordId*/ ctx[21];
			input.value = input.__value;
			attr(input, "id", input_id_value = `cat${/*wordId*/ ctx[21]}`);
			attr(input, "class", "svelte-1n7fkrn");
			/*$$binding_groups*/ ctx[17][0].push(input);
			this.first = input;
		},
		m(target, anchor) {
			insert(target, input, anchor);
			input.checked = ~/*checked*/ ctx[3].indexOf(input.__value);
			insert(target, t, anchor);
			mount_component(dictword, target, anchor);
			current = true;

			dispose = [
				listen(input, "change", /*input_change_handler_1*/ ctx[18]),
				action_destroyer(checkbox_action = /*checkbox*/ ctx[12].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (!current || dirty & /*alphabetWords*/ 128 && input_value_value !== (input_value_value = /*wordId*/ ctx[21])) {
				input.__value = input_value_value;
			}

			input.value = input.__value;

			if (!current || dirty & /*alphabetWords*/ 128 && input_id_value !== (input_id_value = `cat${/*wordId*/ ctx[21]}`)) {
				attr(input, "id", input_id_value);
			}

			if (dirty & /*checked*/ 8) {
				input.checked = ~/*checked*/ ctx[3].indexOf(input.__value);
			}

			const dictword_changes = {};
			if (dirty & /*$words, alphabetWords*/ 384) dictword_changes.word = /*$words*/ ctx[8][/*wordId*/ ctx[21]];
			if (dirty & /*checked, alphabetWords*/ 136) dictword_changes.checked = /*checked*/ ctx[3].includes(/*wordId*/ ctx[21]);
			dictword.$set(dictword_changes);
		},
		i(local) {
			if (current) return;
			transition_in(dictword.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(dictword.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(input);
			/*$$binding_groups*/ ctx[17][0].splice(/*$$binding_groups*/ ctx[17][0].indexOf(input), 1);
			if (detaching) detach(t);
			destroy_component(dictword, detaching);
			run_all(dispose);
		}
	};
}

// (89:4) {#each renderResult as wordId (wordId)}
function create_each_block$2(key_1, ctx) {
	let input;
	let input_value_value;
	let input_id_value;
	let checkbox_action;
	let t;
	let current;
	let dispose;

	const dictword = new Dict_word({
			props: {
				word: /*$words*/ ctx[8][/*wordId*/ ctx[21]],
				checked: /*checked*/ ctx[3].includes(/*wordId*/ ctx[21])
			}
		});

	dictword.$on("edit", /*onEdit*/ ctx[10]);

	return {
		key: key_1,
		first: null,
		c() {
			input = element("input");
			t = space();
			create_component(dictword.$$.fragment);
			attr(input, "type", "checkbox");
			input.__value = input_value_value = /*wordId*/ ctx[21];
			input.value = input.__value;
			attr(input, "id", input_id_value = `cat${/*wordId*/ ctx[21]}`);
			attr(input, "class", "svelte-1n7fkrn");
			/*$$binding_groups*/ ctx[17][0].push(input);
			this.first = input;
		},
		m(target, anchor) {
			insert(target, input, anchor);
			input.checked = ~/*checked*/ ctx[3].indexOf(input.__value);
			insert(target, t, anchor);
			mount_component(dictword, target, anchor);
			current = true;

			dispose = [
				listen(input, "change", /*input_change_handler*/ ctx[16]),
				action_destroyer(checkbox_action = /*checkbox*/ ctx[12].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (!current || dirty & /*renderResult*/ 4 && input_value_value !== (input_value_value = /*wordId*/ ctx[21])) {
				input.__value = input_value_value;
			}

			input.value = input.__value;

			if (!current || dirty & /*renderResult*/ 4 && input_id_value !== (input_id_value = `cat${/*wordId*/ ctx[21]}`)) {
				attr(input, "id", input_id_value);
			}

			if (dirty & /*checked*/ 8) {
				input.checked = ~/*checked*/ ctx[3].indexOf(input.__value);
			}

			const dictword_changes = {};
			if (dirty & /*$words, renderResult*/ 260) dictword_changes.word = /*$words*/ ctx[8][/*wordId*/ ctx[21]];
			if (dirty & /*checked, renderResult*/ 12) dictword_changes.checked = /*checked*/ ctx[3].includes(/*wordId*/ ctx[21]);
			dictword.$set(dictword_changes);
		},
		i(local) {
			if (current) return;
			transition_in(dictword.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(dictword.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(input);
			/*$$binding_groups*/ ctx[17][0].splice(/*$$binding_groups*/ ctx[17][0].indexOf(input), 1);
			if (detaching) detach(t);
			destroy_component(dictword, detaching);
			run_all(dispose);
		}
	};
}

function create_fragment$c(ctx) {
	let div;
	let updating_result;
	let updating_value;
	let t0;
	let t1;
	let current_block_type_index;
	let if_block1;
	let t2;
	let updating_checked;
	let current;

	function autocomplete_result_binding(value) {
		/*autocomplete_result_binding*/ ctx[14].call(null, value);
	}

	function autocomplete_value_binding(value) {
		/*autocomplete_value_binding*/ ctx[15].call(null, value);
	}

	let autocomplete_props = { label: "Начните вводить слово/фразу" };

	if (/*result*/ ctx[1] !== void 0) {
		autocomplete_props.result = /*result*/ ctx[1];
	}

	if (/*autocompleteValue*/ ctx[0] !== void 0) {
		autocomplete_props.value = /*autocompleteValue*/ ctx[0];
	}

	const autocomplete = new Autocomplete({ props: autocomplete_props });
	binding_callbacks.push(() => bind(autocomplete, "result", autocomplete_result_binding));
	binding_callbacks.push(() => bind(autocomplete, "value", autocomplete_value_binding));
	let if_block0 = /*autocompleteValue*/ ctx[0] && !/*renderResult*/ ctx[2].length && create_if_block_3();
	const if_block_creators = [create_if_block$6, create_if_block_1$3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*renderResult*/ ctx[2].length) return 0;
		if (!/*autocompleteValue*/ ctx[0]) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx))) {
		if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	function dictbuttons_checked_binding(value) {
		/*dictbuttons_checked_binding*/ ctx[20].call(null, value);
	}

	let dictbuttons_props = {};

	if (/*checked*/ ctx[3] !== void 0) {
		dictbuttons_props.checked = /*checked*/ ctx[3];
	}

	const dictbuttons = new Dict_buttons({ props: dictbuttons_props });
	binding_callbacks.push(() => bind(dictbuttons, "checked", dictbuttons_checked_binding));

	return {
		c() {
			div = element("div");
			create_component(autocomplete.$$.fragment);
			t0 = space();
			if (if_block0) if_block0.c();
			t1 = space();
			if (if_block1) if_block1.c();
			t2 = space();
			create_component(dictbuttons.$$.fragment);
			attr(div, "class", "dict svelte-1n7fkrn");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(autocomplete, div, null);
			append(div, t0);
			if (if_block0) if_block0.m(div, null);
			append(div, t1);

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(div, null);
			}

			append(div, t2);
			mount_component(dictbuttons, div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const autocomplete_changes = {};

			if (!updating_result && dirty & /*result*/ 2) {
				updating_result = true;
				autocomplete_changes.result = /*result*/ ctx[1];
				add_flush_callback(() => updating_result = false);
			}

			if (!updating_value && dirty & /*autocompleteValue*/ 1) {
				updating_value = true;
				autocomplete_changes.value = /*autocompleteValue*/ ctx[0];
				add_flush_callback(() => updating_value = false);
			}

			autocomplete.$set(autocomplete_changes);

			if (/*autocompleteValue*/ ctx[0] && !/*renderResult*/ ctx[2].length) {
				if (!if_block0) {
					if_block0 = create_if_block_3();
					if_block0.c();
					if_block0.m(div, t1);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block1) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block1 = if_blocks[current_block_type_index];

					if (!if_block1) {
						if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block1.c();
					}

					transition_in(if_block1, 1);
					if_block1.m(div, t2);
				} else {
					if_block1 = null;
				}
			}

			const dictbuttons_changes = {};

			if (!updating_checked && dirty & /*checked*/ 8) {
				updating_checked = true;
				dictbuttons_changes.checked = /*checked*/ ctx[3];
				add_flush_callback(() => updating_checked = false);
			}

			dictbuttons.$set(dictbuttons_changes);
		},
		i(local) {
			if (current) return;
			transition_in(autocomplete.$$.fragment, local);
			transition_in(if_block1);
			transition_in(dictbuttons.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(autocomplete.$$.fragment, local);
			transition_out(if_block1);
			transition_out(dictbuttons.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(autocomplete);
			if (if_block0) if_block0.d();

			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d();
			}

			destroy_component(dictbuttons);
		}
	};
}

function instance$c($$self, $$props, $$invalidate) {
	let $words;
	component_subscribe($$self, store$4, $$value => $$invalidate(8, $words = $$value));
	let autocompleteValue = "";
	let result = [];
	let renderResult = [];
	let checked = [];
	let activeLetter = null;
	let initLetterBox = null;

	let alphabet = [
		"A",
		"B",
		"C",
		"D",
		"E",
		"F",
		"G",
		"H",
		"I",
		"J",
		"K",
		"L",
		"M",
		"N",
		"O",
		"P",
		"Q",
		"R",
		"S",
		"T",
		"U",
		"V",
		"W",
		"X",
		"Y",
		"Z",
		"Ä",
		"Ö",
		"Ü",
		"ẞ"
	];

	let alphabetWordsByLetters;
	let alphabetWords;

	const onEdit = ({ detail: wordId }) => {
		store$6.editWord({ wordId });
	};

	const showWordsByLetter = async ({ target }) => {
		if (activeLetter === target) {
			$$invalidate(4, activeLetter = null);
			return;
		}

		$$invalidate(4, activeLetter = target);
		await tick();
		activeLetter.parentNode.insertBefore(initLetterBox, activeLetter.nextElementSibling);
		window.scrollTo(0, 0);
	};

	const checkbox = node => {
		return {
			destroy() {
				$$invalidate(3, checked = checked.filter(n => n.toString() !== node.value.toString()));
			}
		};
	};

	const $$binding_groups = [[]];

	function click_handler(event) {
		bubble($$self, event);
	}

	function autocomplete_result_binding(value) {
		result = value;
		$$invalidate(1, result);
	}

	function autocomplete_value_binding(value) {
		autocompleteValue = value;
		$$invalidate(0, autocompleteValue);
	}

	function input_change_handler() {
		checked = get_binding_group_value($$binding_groups[0]);
		$$invalidate(3, checked);
	}

	function input_change_handler_1() {
		checked = get_binding_group_value($$binding_groups[0]);
		$$invalidate(3, checked);
	}

	function div_binding($$value) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			$$invalidate(5, initLetterBox = $$value);
		});
	}

	function dictbuttons_checked_binding(value) {
		checked = value;
		$$invalidate(3, checked);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$words, alphabetWordsByLetters, activeLetter*/ 336) {
			 {
				$$invalidate(6, alphabetWordsByLetters = {});
				$$invalidate(7, alphabetWords = []);
				let wordsData = Object.values($words);

				for (let i = 0; i < wordsData.length; i++) {
					const firstLetter = wordsData[i].original[0].toUpperCase();

					if (!alphabetWordsByLetters[firstLetter]) {
						$$invalidate(6, alphabetWordsByLetters[firstLetter] = {}, alphabetWordsByLetters);
					}

					$$invalidate(6, alphabetWordsByLetters[firstLetter][wordsData[i].wordId] = 1, alphabetWordsByLetters);
				}

				if (activeLetter) {
					if (alphabetWordsByLetters[activeLetter.innerText]) {
						$$invalidate(7, alphabetWords = Object.keys(alphabetWordsByLetters[activeLetter.innerText]).sort((a, b) => {
							a = $words[a].original.toLowerCase();
							b = $words[b].original.toLowerCase();
							return a > b ? 1 : a < b ? -1 : 0;
						}));
					} else {
						$$invalidate(4, activeLetter = null);
					}
				}
			}
		}

		if ($$self.$$.dirty & /*autocompleteValue*/ 1) {
			 {
				if (autocompleteValue) {
					$$invalidate(4, activeLetter = null);
				}
			}
		}

		if ($$self.$$.dirty & /*result, $words*/ 258) {
			 {
				$$invalidate(2, renderResult = result.filter(wordId => $words[wordId]));
			}
		}
	};

	return [
		autocompleteValue,
		result,
		renderResult,
		checked,
		activeLetter,
		initLetterBox,
		alphabetWordsByLetters,
		alphabetWords,
		$words,
		alphabet,
		onEdit,
		showWordsByLetter,
		checkbox,
		click_handler,
		autocomplete_result_binding,
		autocomplete_value_binding,
		input_change_handler,
		$$binding_groups,
		input_change_handler_1,
		div_binding,
		dictbuttons_checked_binding
	];
}

class Dict extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1n7fkrn-style")) add_css$b();
		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});
	}
}

/* src/sdk/category/category.svelte generated by Svelte v3.19.1 */

function add_css$c() {
	var style = element("style");
	style.id = "svelte-1bx4e8m-style";
	style.textContent = "label.svelte-1bx4e8m{display:block;margin-top:10px;position:relative}.item.svelte-1bx4e8m{background:#ffedc1;border:1px solid #ddd;border-radius:5px;cursor:pointer;display:block;font-size:12px;line-height:15px;padding:7px 10px 7px 33px;user-select:none;text-transform:uppercase}label.svelte-1bx4e8m .icon{color:#ddd;height:16px;position:absolute;left:9px;transition:all .15s ease-in-out;top:8px;width:16px}label.svelte-1bx4e8m input:checked~.icon{color:inherit;height:20px;left:7px;top:5px;width:20px}input:checked+.item.svelte-1bx4e8m{background:#f6b800}label.svelte-1bx4e8m input{position:absolute;visibility:hidden}";
	append(document.head, style);
}

function create_fragment$d(ctx) {
	let label;
	let t0;
	let span;
	let t1;
	let t2;
	let current;
	let dispose;
	const default_slot_template = /*$$slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);
	const icon = new Icon({ props: { name: "checkbox" } });

	return {
		c() {
			label = element("label");
			if (default_slot) default_slot.c();
			t0 = space();
			span = element("span");
			t1 = text(/*categoryName*/ ctx[0]);
			t2 = space();
			create_component(icon.$$.fragment);
			attr(span, "class", "item svelte-1bx4e8m");
			attr(label, "class", "svelte-1bx4e8m");
		},
		m(target, anchor) {
			insert(target, label, anchor);

			if (default_slot) {
				default_slot.m(label, null);
			}

			append(label, t0);
			append(label, span);
			append(span, t1);
			append(label, t2);
			mount_component(icon, label, null);
			current = true;
			dispose = listen(label, "click", /*click_handler*/ ctx[3]);
		},
		p(ctx, [dirty]) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
			}

			if (!current || dirty & /*categoryName*/ 1) set_data(t1, /*categoryName*/ ctx[0]);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(label);
			if (default_slot) default_slot.d(detaching);
			destroy_component(icon);
			dispose();
		}
	};
}

function instance$d($$self, $$props, $$invalidate) {
	let { categoryName } = $$props;
	let { $$slots = {}, $$scope } = $$props;

	function click_handler(event) {
		bubble($$self, event);
	}

	$$self.$set = $$props => {
		if ("categoryName" in $$props) $$invalidate(0, categoryName = $$props.categoryName);
		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	return [categoryName, $$scope, $$slots, click_handler];
}

class Category extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1bx4e8m-style")) add_css$c();
		init(this, options, instance$d, create_fragment$d, safe_not_equal, { categoryName: 0 });
	}
}

const clickSplash = buttonNode => {
    const onMouseDown = (e) => {
        const splash = document.createElement('span');
        splash.className = 'splash';
        const rect = buttonNode.getBoundingClientRect();
        splash.style.cssText = `left: ${e.pageX - rect.left - window.scrollX}px; top: ${e.pageY - rect.top - window.scrollY}px`;
        setTimeout(() => splash.parentNode && splash.parentNode.removeChild(splash), 750);
        buttonNode.appendChild(splash);
    };
    buttonNode.addEventListener('mousedown', onMouseDown);
    return {
        destroy() {
            buttonNode.removeEventListener('mousedown', onMouseDown);
        }
    };
};

/* src/sdk/button/button.svelte generated by Svelte v3.19.1 */

function add_css$d() {
	var style = element("style");
	style.id = "svelte-l4yqdc-style";
	style.textContent = ".button{border-width:1px;border-style:solid;border-radius:5px;cursor:pointer;display:inline-block;font-size:13px;letter-spacing:1px;line-height:40px;margin-right:10px;overflow:hidden;padding:3px 12px;position:relative;vertical-align:top;width:100%}.button--color-default{background:#b7d8f4;color:inherit}.button--color-red{background:#f4c1c6;color:inherit}.button--active{background:#104b8a;color:#fff}.button:focus{border-color:#104b8a}.button--inner{height:40px;vertical-align:top;text-transform:uppercase;align-items:stretch;display:flex;flex-wrap:nowrap}.button--icon{height:100%;max-width:28px;margin:0 0 0 10px;padding:4px 0}.button--text{flex:1;margin-right:-2px;overflow:hidden;padding:1px 0 0;text-overflow:ellipsis;white-space:nowrap}.button--icon-only .button--icon{margin:0}.button:only-child{margin-right:0}";
	append(document.head, style);
}

// (24:4) {#if icon}
function create_if_block_1$4(ctx) {
	let span;
	let current;
	const icon_1 = new Icon({ props: { name: /*icon*/ ctx[0] } });

	return {
		c() {
			span = element("span");
			create_component(icon_1.$$.fragment);
			attr(span, "class", "button--icon");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			mount_component(icon_1, span, null);
			current = true;
		},
		p(ctx, dirty) {
			const icon_1_changes = {};
			if (dirty & /*icon*/ 1) icon_1_changes.name = /*icon*/ ctx[0];
			icon_1.$set(icon_1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(icon_1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon_1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			destroy_component(icon_1);
		}
	};
}

// (28:4) {#if text}
function create_if_block$7(ctx) {
	let span;
	let t;

	return {
		c() {
			span = element("span");
			t = text(/*text*/ ctx[2]);
			attr(span, "class", "button--text");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*text*/ 4) set_data(t, /*text*/ ctx[2]);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

function create_fragment$e(ctx) {
	let button;
	let span;
	let t0;
	let t1;
	let button_class_value;
	let clickSplash_action;
	let current;
	let dispose;
	let if_block0 = /*icon*/ ctx[0] && create_if_block_1$4(ctx);
	let if_block1 = /*text*/ ctx[2] && create_if_block$7(ctx);
	const default_slot_template = /*$$slots*/ ctx[8].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[7], null);

	return {
		c() {
			button = element("button");
			span = element("span");
			if (if_block0) if_block0.c();
			t0 = space();
			if (if_block1) if_block1.c();
			t1 = space();
			if (default_slot) default_slot.c();
			attr(span, "class", "button--inner");
			attr(button, "class", button_class_value = "button button--color-" + /*color*/ ctx[5]);
			attr(button, "type", /*type*/ ctx[3]);
			button.disabled = /*disabled*/ ctx[1];
			toggle_class(button, "button--icon-only", /*icon*/ ctx[0] && !/*text*/ ctx[2]);
			toggle_class(button, "button--empty", /*empty*/ ctx[4]);
			toggle_class(button, "button--active", /*active*/ ctx[6]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, span);
			if (if_block0) if_block0.m(span, null);
			append(span, t0);
			if (if_block1) if_block1.m(span, null);
			append(span, t1);

			if (default_slot) {
				default_slot.m(span, null);
			}

			current = true;

			dispose = [
				action_destroyer(clickSplash_action = clickSplash.call(null, button)),
				listen(button, "click", /*click_handler*/ ctx[9])
			];
		},
		p(ctx, [dirty]) {
			if (/*icon*/ ctx[0]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_1$4(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(span, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (/*text*/ ctx[2]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block$7(ctx);
					if_block1.c();
					if_block1.m(span, t1);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (default_slot && default_slot.p && dirty & /*$$scope*/ 128) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[7], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[7], dirty, null));
			}

			if (!current || dirty & /*color*/ 32 && button_class_value !== (button_class_value = "button button--color-" + /*color*/ ctx[5])) {
				attr(button, "class", button_class_value);
			}

			if (!current || dirty & /*type*/ 8) {
				attr(button, "type", /*type*/ ctx[3]);
			}

			if (!current || dirty & /*disabled*/ 2) {
				button.disabled = /*disabled*/ ctx[1];
			}

			if (dirty & /*color, icon, text*/ 37) {
				toggle_class(button, "button--icon-only", /*icon*/ ctx[0] && !/*text*/ ctx[2]);
			}

			if (dirty & /*color, empty*/ 48) {
				toggle_class(button, "button--empty", /*empty*/ ctx[4]);
			}

			if (dirty & /*color, active*/ 96) {
				toggle_class(button, "button--active", /*active*/ ctx[6]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (default_slot) default_slot.d(detaching);
			run_all(dispose);
		}
	};
}

function instance$e($$self, $$props, $$invalidate) {
	let { icon = null } = $$props;
	let { disabled = false } = $$props;
	let { text = "" } = $$props;
	let { type = "button" } = $$props;
	let { empty = false } = $$props;
	let { color = "default" } = $$props;
	let { active = false } = $$props;
	let { $$slots = {}, $$scope } = $$props;

	function click_handler(event) {
		bubble($$self, event);
	}

	$$self.$set = $$props => {
		if ("icon" in $$props) $$invalidate(0, icon = $$props.icon);
		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
		if ("text" in $$props) $$invalidate(2, text = $$props.text);
		if ("type" in $$props) $$invalidate(3, type = $$props.type);
		if ("empty" in $$props) $$invalidate(4, empty = $$props.empty);
		if ("color" in $$props) $$invalidate(5, color = $$props.color);
		if ("active" in $$props) $$invalidate(6, active = $$props.active);
		if ("$$scope" in $$props) $$invalidate(7, $$scope = $$props.$$scope);
	};

	return [
		icon,
		disabled,
		text,
		type,
		empty,
		color,
		active,
		$$scope,
		$$slots,
		click_handler
	];
}

class Button extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-l4yqdc-style")) add_css$d();

		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
			icon: 0,
			disabled: 1,
			text: 2,
			type: 3,
			empty: 4,
			color: 5,
			active: 6
		});
	}
}

/* src/sdk/transition/fly.svelte generated by Svelte v3.19.1 */

function create_if_block$8(ctx) {
	let div;
	let div_intro;
	let current;
	const default_slot_template = /*$$slots*/ ctx[3].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, dirty) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);

			if (local) {
				if (!div_intro) {
					add_render_callback(() => {
						div_intro = create_in_transition(div, fly, /*params*/ ctx[1]);
						div_intro.start();
					});
				}
			}

			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function create_fragment$f(ctx) {
	let if_block_anchor;
	let current;
	let if_block = /*active*/ ctx[0] && create_if_block$8(ctx);

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*active*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$8(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$f($$self, $$props, $$invalidate) {
	let { active } = $$props;
	let { params = { x: -50, opacity: 0 } } = $$props;
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("active" in $$props) $$invalidate(0, active = $$props.active);
		if ("params" in $$props) $$invalidate(1, params = $$props.params);
		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
	};

	return [active, params, $$scope, $$slots];
}

class Fly extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$f, create_fragment$f, safe_not_equal, { active: 0, params: 1 });
	}
}

/* src/views/games/pre-game.svelte generated by Svelte v3.19.1 */

function add_css$e() {
	var style = element("style");
	style.id = "svelte-1vi2r1h-style";
	style.textContent = ".pre-game.svelte-1vi2r1h .button{margin-bottom:10px}.categories.svelte-1vi2r1h{margin-bottom:20px}";
	append(document.head, style);
}

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[13] = list[i].categoryName;
	child_ctx[14] = list[i].categoryId;
	return child_ctx;
}

// (40:2) {#if categoriesList.length}
function create_if_block$9(ctx) {
	let t0;
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let t1;
	let current;

	const button = new Button({
			props: {
				text: `${/*selectedState*/ ctx[3] ? "убрать" : "выбрать"} все`
			}
		});

	button.$on("click", /*onToggleAll*/ ctx[5]);
	let each_value = /*categoriesList*/ ctx[0];
	const get_key = ctx => /*categoryId*/ ctx[14];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$3(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
	}

	const fly = new Fly({
			props: {
				active: /*selectedCategories*/ ctx[1].length,
				$$slots: { default: [create_default_slot$2] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(button.$$.fragment);
			t0 = space();
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			create_component(fly.$$.fragment);
			attr(div, "class", "categories svelte-1vi2r1h");
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			insert(target, t0, anchor);
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			append(div, t1);
			mount_component(fly, div, null);
			current = true;
		},
		p(ctx, dirty) {
			const button_changes = {};
			if (dirty & /*selectedState*/ 8) button_changes.text = `${/*selectedState*/ ctx[3] ? "убрать" : "выбрать"} все`;
			button.$set(button_changes);

			if (dirty & /*categoriesList, selectedCategories*/ 3) {
				const each_value = /*categoriesList*/ ctx[0];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$3, t1, get_each_context$3);
				check_outros();
			}

			const fly_changes = {};
			if (dirty & /*selectedCategories*/ 2) fly_changes.active = /*selectedCategories*/ ctx[1].length;

			if (dirty & /*$$scope, nullCategory*/ 131076) {
				fly_changes.$$scope = { dirty, ctx };
			}

			fly.$set(fly_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(fly.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(fly.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
			if (detaching) detach(t0);
			if (detaching) detach(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			destroy_component(fly);
		}
	};
}

// (45:8) <Category {categoryName}>
function create_default_slot_2(ctx) {
	let input;
	let input_value_value;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "checkbox");
			input.__value = input_value_value = /*categoryId*/ ctx[14];
			input.value = input.__value;
			/*$$binding_groups*/ ctx[11][0].push(input);
		},
		m(target, anchor) {
			insert(target, input, anchor);
			input.checked = ~/*selectedCategories*/ ctx[1].indexOf(input.__value);
			dispose = listen(input, "change", /*input_change_handler*/ ctx[10]);
		},
		p(ctx, dirty) {
			if (dirty & /*categoriesList*/ 1 && input_value_value !== (input_value_value = /*categoryId*/ ctx[14])) {
				input.__value = input_value_value;
			}

			input.value = input.__value;

			if (dirty & /*selectedCategories*/ 2) {
				input.checked = ~/*selectedCategories*/ ctx[1].indexOf(input.__value);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			/*$$binding_groups*/ ctx[11][0].splice(/*$$binding_groups*/ ctx[11][0].indexOf(input), 1);
			dispose();
		}
	};
}

// (44:6) {#each categoriesList as { categoryName, categoryId }
function create_each_block$3(key_1, ctx) {
	let first;
	let current;

	const category = new Category({
			props: {
				categoryName: /*categoryName*/ ctx[13],
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx }
			}
		});

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(category.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(category, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const category_changes = {};
			if (dirty & /*categoriesList*/ 1) category_changes.categoryName = /*categoryName*/ ctx[13];

			if (dirty & /*$$scope, categoriesList, selectedCategories*/ 131075) {
				category_changes.$$scope = { dirty, ctx };
			}

			category.$set(category_changes);
		},
		i(local) {
			if (current) return;
			transition_in(category.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(category.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(category, detaching);
		}
	};
}

// (51:8) <Category categoryName="без категории">
function create_default_slot_1(ctx) {
	let input;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "checkbox");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			input.checked = /*nullCategory*/ ctx[2];
			dispose = listen(input, "change", /*input_change_handler_1*/ ctx[12]);
		},
		p(ctx, dirty) {
			if (dirty & /*nullCategory*/ 4) {
				input.checked = /*nullCategory*/ ctx[2];
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			dispose();
		}
	};
}

// (50:6) <Fly active={selectedCategories.length}>
function create_default_slot$2(ctx) {
	let current;

	const category = new Category({
			props: {
				categoryName: "без категории",
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(category.$$.fragment);
		},
		m(target, anchor) {
			mount_component(category, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const category_changes = {};

			if (dirty & /*$$scope, nullCategory*/ 131076) {
				category_changes.$$scope = { dirty, ctx };
			}

			category.$set(category_changes);
		},
		i(local) {
			if (current) return;
			transition_in(category.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(category.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(category, detaching);
		}
	};
}

function create_fragment$g(ctx) {
	let div;
	let t;
	let current;
	let if_block = /*categoriesList*/ ctx[0].length && create_if_block$9(ctx);
	const button = new Button({ props: { text: "играть" } });
	button.$on("click", /*onReady*/ ctx[4]);

	return {
		c() {
			div = element("div");
			if (if_block) if_block.c();
			t = space();
			create_component(button.$$.fragment);
			attr(div, "class", "pre-game svelte-1vi2r1h");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block) if_block.m(div, null);
			append(div, t);
			mount_component(button, div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*categoriesList*/ ctx[0].length) {
				if (if_block) {
					if_block.p(ctx, dirty);
					transition_in(if_block, 1);
				} else {
					if_block = create_if_block$9(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(div, t);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
			destroy_component(button);
		}
	};
}

function instance$g($$self, $$props, $$invalidate) {
	let $view;
	let $categories;
	let $games;
	component_subscribe($$self, store$6, $$value => $$invalidate(6, $view = $$value));
	component_subscribe($$self, store$5, $$value => $$invalidate(7, $categories = $$value));
	component_subscribe($$self, store$1, $$value => $$invalidate(8, $games = $$value));
	let { gameId } = $view.params;
	let categoriesList;
	let selectedCategories = $games[gameId].categories.selected || [];
	let nullCategory = $games[gameId].categories.nullCategory || false;
	let selectedState = false;

	const onReady = () => {
		if (store$6[gameId]) {
			set_store_value(
				store$1,
				$games[gameId].categories = {
					selected: selectedCategories,
					nullCategory
				},
				$games
			);

			store$6[gameId]();
		}
	};

	const onToggleAll = () => {
		if (selectedState) {
			$$invalidate(1, selectedCategories = []);
			$$invalidate(2, nullCategory = false);
		} else {
			$$invalidate(1, selectedCategories = store$5.getIds());
			$$invalidate(2, nullCategory = true);
		}

		$$invalidate(3, selectedState = !selectedState);
	};

	const $$binding_groups = [[]];

	function input_change_handler() {
		selectedCategories = get_binding_group_value($$binding_groups[0]);
		$$invalidate(1, selectedCategories);
	}

	function input_change_handler_1() {
		nullCategory = this.checked;
		$$invalidate(2, nullCategory);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$categories*/ 128) {
			 $$invalidate(0, categoriesList = Object.values($categories));
		}

		if ($$self.$$.dirty & /*nullCategory, selectedCategories, categoriesList*/ 7) {
			 $$invalidate(3, selectedState = nullCategory && selectedCategories.length === categoriesList.length);
		}
	};

	return [
		categoriesList,
		selectedCategories,
		nullCategory,
		selectedState,
		onReady,
		onToggleAll,
		$view,
		$categories,
		$games,
		gameId,
		input_change_handler,
		$$binding_groups,
		input_change_handler_1
	];
}

class Pre_game extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1vi2r1h-style")) add_css$e();
		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});
	}
}

/* src/sdk/bottom-buttons/bottom-buttons.svelte generated by Svelte v3.19.1 */

const { document: document_1$2 } = globals;

function add_css$f() {
	var style = element("style");
	style.id = "svelte-khiv47-style";
	style.textContent = ".bottom-buttons{display:flex;margin:0 0 10px -10px}.bottom-buttons .button{flex:1;margin:0 0 0 10px}";
	append(document_1$2.head, style);
}

function create_fragment$h(ctx) {
	let div;
	let init_action;
	let current;
	let dispose;
	const default_slot_template = /*$$slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
			dispose = action_destroyer(init_action = /*init*/ ctx[0].call(null, div));
		},
		p(ctx, [dirty]) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 2) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
			dispose();
		}
	};
}

function instance$h($$self, $$props, $$invalidate) {
	const init = node => {
		const bottomButtonsParent = document.getElementById("bottom-buttons");
		const nodes = [];

		while (node.childNodes.length > 0) {
			nodes.push(node.childNodes[0]);
			bottomButtonsParent.appendChild(node.childNodes[0]);
		}

		return {
			destroy() {
				nodes.forEach(node => {
					if (node.parentNode) {
						node.parentNode.removeChild(node);
					}
				});
			}
		};
	};

	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	return [init, $$scope, $$slots];
}

class Bottom_buttons extends SvelteComponent {
	constructor(options) {
		super();
		if (!document_1$2.getElementById("svelte-khiv47-style")) add_css$f();
		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});
	}
}

const getVerbTextToSpeech = (word, setup) => {
    let result = [word.original];
    if (setup.soundStrongVerbs && word.strong1) {
        result.push(null, `Ich ${word.strong1}`);
        result.push(null, `Du ${word.strong2}`);
        result.push(null, `Er/sie/es ${word.strong3}`);
        result.push(null, `Wir ${word.strong4}`);
        result.push(null, `Ihr ${word.strong5}`);
        result.push(null, `Sie ${word.strong6}`);
    }
    if (setup.soundIrregularVerbs && word.irregular1) {
        result.push(null, word.irregular1);
        result.push(null, word.irregular2);
    }
    return result;
};
const getNounTextToSpeech = (word, setup) => {
    let result = setup.soundArticles ? [`${word.article} ${word.original}`] : [word.original];
    if (setup.soundPlural) {
        result.push(null);
        if (word.plural) {
            result.push(setup.soundArticles ? `die ${word.plural}` : word.plural);
        }
        else {
            result.push('plural');
        }
    }
    return result;
};
const getTextArray = (word, setup) => {
    if (!setup.voice) {
        return;
    }
    switch (word.type) {
        case 'verb':
            return setup.soundVerbs && getVerbTextToSpeech(word, setup);
        case 'noun':
            return setup.soundNouns && getNounTextToSpeech(word, setup);
        case 'phrase':
            return setup.soundPhrases && [word.original];
        default:
            return [word.original];
    }
};
let canceled = false;
const pronouncing = {
    stop() {
        if (speechSynthesis.speaking) {
            canceled = true;
            speechSynthesis.cancel();
        }
    },
    start(text, speed, callback) {
        this.stop();
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.voice = speechSynthesis.getVoices().find(i => i.lang === 'de-DE');
        utterThis.lang = 'de-DE';
        utterThis.rate = Math.max(.5, Math.min(1.5, speed * 10 / 100));
        speechSynthesis.speak(utterThis);
        utterThis.addEventListener('end', callback);
    }
};
const play = (textArray, voiceSpeed) => {
    const text = textArray.shift();
    if (text === null) {
        play(textArray, voiceSpeed);
        return;
    }
    pronouncing.start(text, voiceSpeed, () => {
        if (canceled) {
            canceled = false;
        }
        else {
            play(textArray, voiceSpeed);
        }
    });
};
const getVoiceSpeed = (wordType, voiceSpeed) => {
    if (wordType === 'verb') {
        return voiceSpeed - 2;
    }
    return voiceSpeed;
};
var speech = {
    sayWord(word, setup) {
        const textArray = getTextArray(word, setup);
        if (!textArray) {
            return;
        }
        play(textArray, getVoiceSpeed(word.type, setup.voiceSpeed));
    },
    stop() {
        pronouncing.stop();
    }
};

var shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

/* src/views/games/game.svelte generated by Svelte v3.19.1 */

function add_css$g() {
	var style = element("style");
	style.id = "svelte-1h0d1d2-style";
	style.textContent = ".game.svelte-1h0d1d2{display:flex;font-size:25px;line-height:35px;flex-direction:column;text-align:center}";
	append(document.head, style);
}

const get_default_slot_changes = dirty => ({
	activeWord: dirty & /*activeWord*/ 2,
	visible: dirty & /*visible*/ 1
});

const get_default_slot_context = ctx => ({
	activeWord: /*activeWord*/ ctx[1],
	visible: /*visible*/ ctx[0]
});

// (35:0) {:else}
function create_else_block$1(ctx) {
	let div;
	let t;
	let current;
	let dispose;
	const default_slot_template = /*$$slots*/ ctx[9].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], get_default_slot_context);

	const bottombuttons = new Bottom_buttons({
			props: {
				$$slots: { default: [create_default_slot$3] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
			t = space();
			create_component(bottombuttons.$$.fragment);
			attr(div, "class", "game svelte-1h0d1d2");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			append(div, t);
			mount_component(bottombuttons, div, null);
			current = true;
			dispose = listen(div, "click", /*showTranslation*/ ctx[3]);
		},
		p(ctx, dirty) {
			if (default_slot && default_slot.p && dirty & /*$$scope, activeWord, visible*/ 1027) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[10], get_default_slot_context), get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, get_default_slot_changes));
			}

			const bottombuttons_changes = {};

			if (dirty & /*$$scope*/ 1024) {
				bottombuttons_changes.$$scope = { dirty, ctx };
			}

			bottombuttons.$set(bottombuttons_changes);
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			transition_in(bottombuttons.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			transition_out(bottombuttons.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
			destroy_component(bottombuttons);
			dispose();
		}
	};
}

// (33:0) {#if !wordsIds.length}
function create_if_block$a(ctx) {
	let t;

	return {
		c() {
			t = text("нет слов");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (39:4) <BottomButtons>
function create_default_slot$3(ctx) {
	let current;
	const button = new Button({ props: { text: "Следующий" } });
	button.$on("click", /*nextWord*/ ctx[4]);

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

function create_fragment$i(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$a, create_else_block$1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*wordsIds*/ ctx[2].length) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			if_block.p(ctx, dirty);
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(if_block_anchor);
		}
	};
}

function instance$i($$self, $$props, $$invalidate) {
	let $wordsStore;
	let $user;
	component_subscribe($$self, store$4, $$value => $$invalidate(7, $wordsStore = $$value));
	component_subscribe($$self, store$3, $$value => $$invalidate(8, $user = $$value));
	let { gameName } = $$props;
	let visible = false;
	let activeIndex = 0;
	let wordsIds = shuffle(store$4.getWordsByCategoriesAndSetup(gameName));
	let activeWord = 1;

	const showTranslation = () => {
		$$invalidate(0, visible = true);
		speech.sayWord(activeWord, $user);
	};

	const nextWord = () => {
		speech.stop();
		$$invalidate(0, visible = false);

		$$invalidate(6, activeIndex = activeIndex === wordsIds.length - 1
		? 0
		: activeIndex + 1);
	};

	onDestroy(() => {
		speech.stop();
	});

	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("gameName" in $$props) $$invalidate(5, gameName = $$props.gameName);
		if ("$$scope" in $$props) $$invalidate(10, $$scope = $$props.$$scope);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$wordsStore, activeIndex*/ 192) {
			 $$invalidate(1, activeWord = $wordsStore[wordsIds[activeIndex]]);
		}
	};

	return [
		visible,
		activeWord,
		wordsIds,
		showTranslation,
		nextWord,
		gameName,
		activeIndex,
		$wordsStore,
		$user,
		$$slots,
		$$scope
	];
}

class Game extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1h0d1d2-style")) add_css$g();
		init(this, options, instance$i, create_fragment$i, safe_not_equal, { gameName: 5 });
	}
}

/* src/views/games/verb.svelte generated by Svelte v3.19.1 */

function add_css$h() {
	var style = element("style");
	style.id = "svelte-1cbqrpx-style";
	style.textContent = ".verb.svelte-1cbqrpx.svelte-1cbqrpx{font-size:16px;line-height:21px}table.svelte-1cbqrpx.svelte-1cbqrpx{border-collapse:collapse;margin-top:10px;text-align:left;width:100%}td.svelte-1cbqrpx.svelte-1cbqrpx{border:1px solid #fff;padding:5px;width:50%}table.svelte-1cbqrpx tr:first-child td.svelte-1cbqrpx{border-top:0}table.svelte-1cbqrpx tr:last-child td.svelte-1cbqrpx{border-bottom:0}table.svelte-1cbqrpx tr td.svelte-1cbqrpx:first-child{border-left:0}table.svelte-1cbqrpx tr td.svelte-1cbqrpx:last-child{border-right:0}";
	append(document.head, style);
}

// (26:2) {#if strongExists(word, $user)}
function create_if_block_1$5(ctx) {
	let table;
	let tr0;
	let td0;
	let t0;
	let b0;
	let t1_value = /*word*/ ctx[0].strong1 + "";
	let t1;
	let t2;
	let td1;
	let t3;
	let b1;
	let t4_value = /*word*/ ctx[0].strong4 + "";
	let t4;
	let t5;
	let tr1;
	let td2;
	let t6;
	let b2;
	let t7_value = /*word*/ ctx[0].strong2 + "";
	let t7;
	let t8;
	let td3;
	let t9;
	let b3;
	let t10_value = /*word*/ ctx[0].strong5 + "";
	let t10;
	let t11;
	let tr2;
	let td4;
	let t12;
	let b4;
	let t13_value = /*word*/ ctx[0].strong3 + "";
	let t13;
	let t14;
	let td5;
	let t15;
	let b5;
	let t16_value = /*word*/ ctx[0].strong6 + "";
	let t16;

	return {
		c() {
			table = element("table");
			tr0 = element("tr");
			td0 = element("td");
			t0 = text("Ich ");
			b0 = element("b");
			t1 = text(t1_value);
			t2 = space();
			td1 = element("td");
			t3 = text("wir ");
			b1 = element("b");
			t4 = text(t4_value);
			t5 = space();
			tr1 = element("tr");
			td2 = element("td");
			t6 = text("du ");
			b2 = element("b");
			t7 = text(t7_value);
			t8 = space();
			td3 = element("td");
			t9 = text("ihr ");
			b3 = element("b");
			t10 = text(t10_value);
			t11 = space();
			tr2 = element("tr");
			td4 = element("td");
			t12 = text("er/sie/es ");
			b4 = element("b");
			t13 = text(t13_value);
			t14 = space();
			td5 = element("td");
			t15 = text("Sie/sie ");
			b5 = element("b");
			t16 = text(t16_value);
			attr(td0, "class", "svelte-1cbqrpx");
			attr(td1, "class", "svelte-1cbqrpx");
			attr(td2, "class", "svelte-1cbqrpx");
			attr(td3, "class", "svelte-1cbqrpx");
			attr(td4, "class", "svelte-1cbqrpx");
			attr(td5, "class", "svelte-1cbqrpx");
			attr(table, "class", "svelte-1cbqrpx");
		},
		m(target, anchor) {
			insert(target, table, anchor);
			append(table, tr0);
			append(tr0, td0);
			append(td0, t0);
			append(td0, b0);
			append(b0, t1);
			append(tr0, t2);
			append(tr0, td1);
			append(td1, t3);
			append(td1, b1);
			append(b1, t4);
			append(table, t5);
			append(table, tr1);
			append(tr1, td2);
			append(td2, t6);
			append(td2, b2);
			append(b2, t7);
			append(tr1, t8);
			append(tr1, td3);
			append(td3, t9);
			append(td3, b3);
			append(b3, t10);
			append(table, t11);
			append(table, tr2);
			append(tr2, td4);
			append(td4, t12);
			append(td4, b4);
			append(b4, t13);
			append(tr2, t14);
			append(tr2, td5);
			append(td5, t15);
			append(td5, b5);
			append(b5, t16);
		},
		p(ctx, dirty) {
			if (dirty & /*word*/ 1 && t1_value !== (t1_value = /*word*/ ctx[0].strong1 + "")) set_data(t1, t1_value);
			if (dirty & /*word*/ 1 && t4_value !== (t4_value = /*word*/ ctx[0].strong4 + "")) set_data(t4, t4_value);
			if (dirty & /*word*/ 1 && t7_value !== (t7_value = /*word*/ ctx[0].strong2 + "")) set_data(t7, t7_value);
			if (dirty & /*word*/ 1 && t10_value !== (t10_value = /*word*/ ctx[0].strong5 + "")) set_data(t10, t10_value);
			if (dirty & /*word*/ 1 && t13_value !== (t13_value = /*word*/ ctx[0].strong3 + "")) set_data(t13, t13_value);
			if (dirty & /*word*/ 1 && t16_value !== (t16_value = /*word*/ ctx[0].strong6 + "")) set_data(t16, t16_value);
		},
		d(detaching) {
			if (detaching) detach(table);
		}
	};
}

// (43:2) {#if irregularExists(word, $user)}
function create_if_block$b(ctx) {
	let p;
	let t0_value = /*word*/ ctx[0].irregular1 + "";
	let t0;
	let t1;
	let t2_value = /*word*/ ctx[0].irregular2 + "";
	let t2;

	return {
		c() {
			p = element("p");
			t0 = text(t0_value);
			t1 = text(" / ");
			t2 = text(t2_value);
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t0);
			append(p, t1);
			append(p, t2);
		},
		p(ctx, dirty) {
			if (dirty & /*word*/ 1 && t0_value !== (t0_value = /*word*/ ctx[0].irregular1 + "")) set_data(t0, t0_value);
			if (dirty & /*word*/ 1 && t2_value !== (t2_value = /*word*/ ctx[0].irregular2 + "")) set_data(t2, t2_value);
		},
		d(detaching) {
			if (detaching) detach(p);
		}
	};
}

function create_fragment$j(ctx) {
	let p;
	let t0_value = /*word*/ ctx[0].original + "";
	let t0;
	let t1;
	let div;
	let show_if_1 = /*strongExists*/ ctx[2](/*word*/ ctx[0], /*$user*/ ctx[1]);
	let t2;
	let show_if = /*irregularExists*/ ctx[3](/*word*/ ctx[0], /*$user*/ ctx[1]);
	let if_block0 = show_if_1 && create_if_block_1$5(ctx);
	let if_block1 = show_if && create_if_block$b(ctx);

	return {
		c() {
			p = element("p");
			t0 = text(t0_value);
			t1 = space();
			div = element("div");
			if (if_block0) if_block0.c();
			t2 = space();
			if (if_block1) if_block1.c();
			attr(div, "class", "verb svelte-1cbqrpx");
		},
		m(target, anchor) {
			insert(target, p, anchor);
			append(p, t0);
			insert(target, t1, anchor);
			insert(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append(div, t2);
			if (if_block1) if_block1.m(div, null);
		},
		p(ctx, [dirty]) {
			if (dirty & /*word*/ 1 && t0_value !== (t0_value = /*word*/ ctx[0].original + "")) set_data(t0, t0_value);
			if (dirty & /*word, $user*/ 3) show_if_1 = /*strongExists*/ ctx[2](/*word*/ ctx[0], /*$user*/ ctx[1]);

			if (show_if_1) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1$5(ctx);
					if_block0.c();
					if_block0.m(div, t2);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty & /*word, $user*/ 3) show_if = /*irregularExists*/ ctx[3](/*word*/ ctx[0], /*$user*/ ctx[1]);

			if (show_if) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block$b(ctx);
					if_block1.c();
					if_block1.m(div, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(p);
			if (detaching) detach(t1);
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance$j($$self, $$props, $$invalidate) {
	let $user;
	component_subscribe($$self, store$3, $$value => $$invalidate(1, $user = $$value));
	let { word } = $$props;

	const strongExists = (word, setup) => {
		if (!setup.strongVerbs) {
			return false;
		}

		return store$4.verbIsStrong(word);
	};

	const irregularExists = (word, setup) => {
		if (!setup.irregularVerbs) {
			return false;
		}

		return store$4.verbIsIrregular(word);
	};

	$$self.$set = $$props => {
		if ("word" in $$props) $$invalidate(0, word = $$props.word);
	};

	return [word, $user, strongExists, irregularExists];
}

class Verb extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1cbqrpx-style")) add_css$h();
		init(this, options, instance$j, create_fragment$j, safe_not_equal, { word: 0 });
	}
}

/* src/views/games/noun.svelte generated by Svelte v3.19.1 */

function create_if_block_3$1(ctx) {
	let t_value = /*word*/ ctx[0].article + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*word*/ 1 && t_value !== (t_value = /*word*/ ctx[0].article + "")) set_data(t, t_value);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (15:0) {#if $user.plural}
function create_if_block$c(ctx) {
	let p;

	function select_block_type(ctx, dirty) {
		if (!/*word*/ ctx[0].plural) return create_if_block_1$6;
		return create_else_block$2;
	}

	let current_block_type = select_block_type(ctx);
	let if_block = current_block_type(ctx);

	return {
		c() {
			p = element("p");
			if_block.c();
		},
		m(target, anchor) {
			insert(target, p, anchor);
			if_block.m(p, null);
		},
		p(ctx, dirty) {
			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
				if_block.p(ctx, dirty);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);

				if (if_block) {
					if_block.c();
					if_block.m(p, null);
				}
			}
		},
		d(detaching) {
			if (detaching) detach(p);
			if_block.d();
		}
	};
}

// (19:4) {:else}
function create_else_block$2(ctx) {
	let t0;
	let t1_value = /*word*/ ctx[0].plural + "";
	let t1;
	let if_block = /*$user*/ ctx[1].articles && create_if_block_2$2();

	return {
		c() {
			if (if_block) if_block.c();
			t0 = space();
			t1 = text(t1_value);
		},
		m(target, anchor) {
			if (if_block) if_block.m(target, anchor);
			insert(target, t0, anchor);
			insert(target, t1, anchor);
		},
		p(ctx, dirty) {
			if (/*$user*/ ctx[1].articles) {
				if (!if_block) {
					if_block = create_if_block_2$2();
					if_block.c();
					if_block.m(t0.parentNode, t0);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*word*/ 1 && t1_value !== (t1_value = /*word*/ ctx[0].plural + "")) set_data(t1, t1_value);
		},
		d(detaching) {
			if (if_block) if_block.d(detaching);
			if (detaching) detach(t0);
			if (detaching) detach(t1);
		}
	};
}

// (17:4) {#if !word.plural}
function create_if_block_1$6(ctx) {
	let t;

	return {
		c() {
			t = text("plural");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (21:6) {#if $user.articles}
function create_if_block_2$2(ctx) {
	let t;

	return {
		c() {
			t = text("die");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

function create_fragment$k(ctx) {
	let p;
	let t0;
	let t1_value = /*word*/ ctx[0].original + "";
	let t1;
	let t2;
	let if_block1_anchor;
	let if_block0 = /*$user*/ ctx[1].articles && create_if_block_3$1(ctx);
	let if_block1 = /*$user*/ ctx[1].plural && create_if_block$c(ctx);

	return {
		c() {
			p = element("p");
			if (if_block0) if_block0.c();
			t0 = space();
			t1 = text(t1_value);
			t2 = space();
			if (if_block1) if_block1.c();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			insert(target, p, anchor);
			if (if_block0) if_block0.m(p, null);
			append(p, t0);
			append(p, t1);
			insert(target, t2, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, if_block1_anchor, anchor);
		},
		p(ctx, [dirty]) {
			if (/*$user*/ ctx[1].articles) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_3$1(ctx);
					if_block0.c();
					if_block0.m(p, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty & /*word*/ 1 && t1_value !== (t1_value = /*word*/ ctx[0].original + "")) set_data(t1, t1_value);

			if (/*$user*/ ctx[1].plural) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
				} else {
					if_block1 = create_if_block$c(ctx);
					if_block1.c();
					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(p);
			if (if_block0) if_block0.d();
			if (detaching) detach(t2);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

function instance$k($$self, $$props, $$invalidate) {
	let $user;
	component_subscribe($$self, store$3, $$value => $$invalidate(1, $user = $$value));
	let { word } = $$props;

	$$self.$set = $$props => {
		if ("word" in $$props) $$invalidate(0, word = $$props.word);
	};

	return [word, $user];
}

class Noun extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$k, create_fragment$k, safe_not_equal, { word: 0 });
	}
}

/* src/views/games/rus-deu.svelte generated by Svelte v3.19.1 */

function add_css$i() {
	var style = element("style");
	style.id = "svelte-3ashaz-style";
	style.textContent = ".item-extra.svelte-3ashaz{background:#b7d8f4;margin-top:10px;opacity:0;padding:10px}.item-extra.visible.svelte-3ashaz{opacity:1;transition:opacity .5s ease}";
	append(document.head, style);
}

// (18:4) {:else}
function create_else_block$3(ctx) {
	let t_value = /*activeWord*/ ctx[0].original + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*activeWord*/ 1 && t_value !== (t_value = /*activeWord*/ ctx[0].original + "")) set_data(t, t_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (16:41) 
function create_if_block_1$7(ctx) {
	let current;
	const verb = new Verb({ props: { word: /*activeWord*/ ctx[0] } });

	return {
		c() {
			create_component(verb.$$.fragment);
		},
		m(target, anchor) {
			mount_component(verb, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const verb_changes = {};
			if (dirty & /*activeWord*/ 1) verb_changes.word = /*activeWord*/ ctx[0];
			verb.$set(verb_changes);
		},
		i(local) {
			if (current) return;
			transition_in(verb.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(verb.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(verb, detaching);
		}
	};
}

// (14:4) {#if activeWord.type === 'noun'}
function create_if_block$d(ctx) {
	let current;
	const noun = new Noun({ props: { word: /*activeWord*/ ctx[0] } });

	return {
		c() {
			create_component(noun.$$.fragment);
		},
		m(target, anchor) {
			mount_component(noun, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const noun_changes = {};
			if (dirty & /*activeWord*/ 1) noun_changes.word = /*activeWord*/ ctx[0];
			noun.$set(noun_changes);
		},
		i(local) {
			if (current) return;
			transition_in(noun.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(noun.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(noun, detaching);
		}
	};
}

// (10:0) <Game let:activeWord let:visible gameName="rusDeu">
function create_default_slot$4(ctx) {
	let div0;
	let t0_value = /*activeWord*/ ctx[0].translation + "";
	let t0;
	let t1;
	let div1;
	let current_block_type_index;
	let if_block;
	let current;
	const if_block_creators = [create_if_block$d, create_if_block_1$7, create_else_block$3];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*activeWord*/ ctx[0].type === "noun") return 0;
		if (/*activeWord*/ ctx[0].type === "verb") return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			div1 = element("div");
			if_block.c();
			attr(div0, "class", "item");
			attr(div1, "class", "item item-extra svelte-3ashaz");
			toggle_class(div1, "visible", /*visible*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, t0);
			insert(target, t1, anchor);
			insert(target, div1, anchor);
			if_blocks[current_block_type_index].m(div1, null);
			current = true;
		},
		p(ctx, dirty) {
			if ((!current || dirty & /*activeWord*/ 1) && t0_value !== (t0_value = /*activeWord*/ ctx[0].translation + "")) set_data(t0, t0_value);
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div1, null);
			}

			if (dirty & /*visible*/ 2) {
				toggle_class(div1, "visible", /*visible*/ ctx[1]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(t1);
			if (detaching) detach(div1);
			if_blocks[current_block_type_index].d();
		}
	};
}

function create_fragment$l(ctx) {
	let current;

	const game = new Game({
			props: {
				gameName: "rusDeu",
				$$slots: {
					default: [
						create_default_slot$4,
						({ activeWord, visible }) => ({ 0: activeWord, 1: visible }),
						({ activeWord, visible }) => (activeWord ? 1 : 0) | (visible ? 2 : 0)
					]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(game.$$.fragment);
		},
		m(target, anchor) {
			mount_component(game, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const game_changes = {};

			if (dirty & /*$$scope, visible, activeWord*/ 7) {
				game_changes.$$scope = { dirty, ctx };
			}

			game.$set(game_changes);
		},
		i(local) {
			if (current) return;
			transition_in(game.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(game.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(game, detaching);
		}
	};
}

function instance$l($$self) {
	let activeWord;
	let visible;
	return [activeWord, visible];
}

class Rus_deu extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-3ashaz-style")) add_css$i();
		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});
	}
}

/* src/views/games/deu-rus.svelte generated by Svelte v3.19.1 */

function add_css$j() {
	var style = element("style");
	style.id = "svelte-1d8pnx3-style";
	style.textContent = ".item-extra.svelte-1d8pnx3{background:#b7d8f4;margin-top:10px;opacity:0;padding:10px}.item-extra.visible.svelte-1d8pnx3{opacity:1;transition:opacity .5s ease}";
	append(document.head, style);
}

// (16:4) {:else}
function create_else_block$4(ctx) {
	let t_value = /*activeWord*/ ctx[0].original + "";
	let t;

	return {
		c() {
			t = text(t_value);
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*activeWord*/ 1 && t_value !== (t_value = /*activeWord*/ ctx[0].original + "")) set_data(t, t_value);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (14:41) 
function create_if_block_1$8(ctx) {
	let current;
	const verb = new Verb({ props: { word: /*activeWord*/ ctx[0] } });

	return {
		c() {
			create_component(verb.$$.fragment);
		},
		m(target, anchor) {
			mount_component(verb, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const verb_changes = {};
			if (dirty & /*activeWord*/ 1) verb_changes.word = /*activeWord*/ ctx[0];
			verb.$set(verb_changes);
		},
		i(local) {
			if (current) return;
			transition_in(verb.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(verb.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(verb, detaching);
		}
	};
}

// (12:4) {#if activeWord.type === 'noun'}
function create_if_block$e(ctx) {
	let current;
	const noun = new Noun({ props: { word: /*activeWord*/ ctx[0] } });

	return {
		c() {
			create_component(noun.$$.fragment);
		},
		m(target, anchor) {
			mount_component(noun, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const noun_changes = {};
			if (dirty & /*activeWord*/ 1) noun_changes.word = /*activeWord*/ ctx[0];
			noun.$set(noun_changes);
		},
		i(local) {
			if (current) return;
			transition_in(noun.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(noun.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(noun, detaching);
		}
	};
}

// (10:0) <Game let:activeWord let:visible gameName="deuRus">
function create_default_slot$5(ctx) {
	let div0;
	let current_block_type_index;
	let if_block;
	let t0;
	let div1;
	let t1_value = /*activeWord*/ ctx[0].translation + "";
	let t1;
	let current;
	const if_block_creators = [create_if_block$e, create_if_block_1$8, create_else_block$4];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*activeWord*/ ctx[0].type === "noun") return 0;
		if (/*activeWord*/ ctx[0].type === "verb") return 1;
		return 2;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div0 = element("div");
			if_block.c();
			t0 = space();
			div1 = element("div");
			t1 = text(t1_value);
			attr(div0, "class", "item");
			attr(div1, "class", "item item-extra svelte-1d8pnx3");
			toggle_class(div1, "visible", /*visible*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			if_blocks[current_block_type_index].m(div0, null);
			insert(target, t0, anchor);
			insert(target, div1, anchor);
			append(div1, t1);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div0, null);
			}

			if ((!current || dirty & /*activeWord*/ 1) && t1_value !== (t1_value = /*activeWord*/ ctx[0].translation + "")) set_data(t1, t1_value);

			if (dirty & /*visible*/ 2) {
				toggle_class(div1, "visible", /*visible*/ ctx[1]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div0);
			if_blocks[current_block_type_index].d();
			if (detaching) detach(t0);
			if (detaching) detach(div1);
		}
	};
}

function create_fragment$m(ctx) {
	let current;

	const game = new Game({
			props: {
				gameName: "deuRus",
				$$slots: {
					default: [
						create_default_slot$5,
						({ activeWord, visible }) => ({ 0: activeWord, 1: visible }),
						({ activeWord, visible }) => (activeWord ? 1 : 0) | (visible ? 2 : 0)
					]
				},
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(game.$$.fragment);
		},
		m(target, anchor) {
			mount_component(game, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const game_changes = {};

			if (dirty & /*$$scope, visible, activeWord*/ 7) {
				game_changes.$$scope = { dirty, ctx };
			}

			game.$set(game_changes);
		},
		i(local) {
			if (current) return;
			transition_in(game.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(game.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(game, detaching);
		}
	};
}

function instance$m($$self) {
	let activeWord;
	let visible;
	return [activeWord, visible];
}

class Deu_rus extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1d8pnx3-style")) add_css$j();
		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});
	}
}

/* src/views/home/home.svelte generated by Svelte v3.19.1 */

function add_css$k() {
	var style = element("style");
	style.id = "svelte-rixt8k-style";
	style.textContent = ".home.svelte-rixt8k>.button{margin-bottom:10px}";
	append(document.head, style);
}

function get_each_context$4(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[2] = list[i];
	return child_ctx;
}

// (7:2) {#each Object.keys($games) as gameId (gameId)}
function create_each_block$4(key_1, ctx) {
	let first;
	let current;

	function click_handler(...args) {
		return /*click_handler*/ ctx[1](/*gameId*/ ctx[2], ...args);
	}

	const button = new Button({
			props: {
				text: /*$games*/ ctx[0][/*gameId*/ ctx[2]].buttonText
			}
		});

	button.$on("click", click_handler);

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(button.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(button, target, anchor);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			const button_changes = {};
			if (dirty & /*$games*/ 1) button_changes.text = /*$games*/ ctx[0][/*gameId*/ ctx[2]].buttonText;
			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(button, detaching);
		}
	};
}

function create_fragment$n(ctx) {
	let div;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let current;
	let each_value = Object.keys(/*$games*/ ctx[0]);
	const get_key = ctx => /*gameId*/ ctx[2];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$4(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$4(key, child_ctx));
	}

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "home svelte-rixt8k");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*$games, Object, view*/ 1) {
				const each_value = Object.keys(/*$games*/ ctx[0]);
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$4, null, get_each_context$4);
				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}
		}
	};
}

function instance$n($$self, $$props, $$invalidate) {
	let $games;
	component_subscribe($$self, store$1, $$value => $$invalidate(0, $games = $$value));
	const click_handler = gameId => store$6.preGame({ gameId });
	return [$games, click_handler];
}

class Home extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-rixt8k-style")) add_css$k();
		init(this, options, instance$n, create_fragment$n, safe_not_equal, {});
	}
}

/* src/views/setup/setup-box.svelte generated by Svelte v3.19.1 */

function add_css$l() {
	var style = element("style");
	style.id = "svelte-1vbk6nl-style";
	style.textContent = ".box.svelte-1vbk6nl.svelte-1vbk6nl{border:1px dashed #104b8a;margin:25px 0;padding:30px 20px 0;position:relative}.flex.svelte-1vbk6nl.svelte-1vbk6nl{padding:20px 10px 10px}.flex.svelte-1vbk6nl .wrap.svelte-1vbk6nl{display:flex;margin-right:-10px}.title.svelte-1vbk6nl.svelte-1vbk6nl{background:#fff;font-size:16px;line-height:20px;left:10px;padding:2px 5px;position:absolute;top:-14px}.wrap.svelte-1vbk6nl.svelte-1vbk6nl>*{flex:1}";
	append(document.head, style);
}

// (7:2) {#if title}
function create_if_block$f(ctx) {
	let span;
	let t;

	return {
		c() {
			span = element("span");
			t = text(/*title*/ ctx[0]);
			attr(span, "class", "title svelte-1vbk6nl");
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
		},
		p(ctx, dirty) {
			if (dirty & /*title*/ 1) set_data(t, /*title*/ ctx[0]);
		},
		d(detaching) {
			if (detaching) detach(span);
		}
	};
}

function create_fragment$o(ctx) {
	let div1;
	let t;
	let div0;
	let current;
	let if_block = /*title*/ ctx[0] && create_if_block$f(ctx);
	const default_slot_template = /*$$slots*/ ctx[3].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

	return {
		c() {
			div1 = element("div");
			if (if_block) if_block.c();
			t = space();
			div0 = element("div");
			if (default_slot) default_slot.c();
			attr(div0, "class", "wrap svelte-1vbk6nl");
			attr(div1, "class", "box svelte-1vbk6nl");
			toggle_class(div1, "flex", /*flex*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			if (if_block) if_block.m(div1, null);
			append(div1, t);
			append(div1, div0);

			if (default_slot) {
				default_slot.m(div0, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (/*title*/ ctx[0]) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$f(ctx);
					if_block.c();
					if_block.m(div1, t);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (default_slot && default_slot.p && dirty & /*$$scope*/ 4) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[2], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null));
			}

			if (dirty & /*flex*/ 2) {
				toggle_class(div1, "flex", /*flex*/ ctx[1]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			if (if_block) if_block.d();
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$o($$self, $$props, $$invalidate) {
	let { title } = $$props;
	let { flex = false } = $$props;
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("title" in $$props) $$invalidate(0, title = $$props.title);
		if ("flex" in $$props) $$invalidate(1, flex = $$props.flex);
		if ("$$scope" in $$props) $$invalidate(2, $$scope = $$props.$$scope);
	};

	return [title, flex, $$scope, $$slots];
}

class Setup_box extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1vbk6nl-style")) add_css$l();
		init(this, options, instance$o, create_fragment$o, safe_not_equal, { title: 0, flex: 1 });
	}
}

/* src/sdk/form-switcher/form-switcher.svelte generated by Svelte v3.19.1 */

function add_css$m() {
	var style = element("style");
	style.id = "svelte-1ex3y9y-style";
	style.textContent = ".form-switcher{cursor:pointer;display:flex;align-items:center;justify-items:flex-start;margin-bottom:20px;position:relative}.form-switcher--real-element{position:absolute;visibility:hidden;z-index:-9}.form-switcher--label{margin-left:10px}.form-switcher--toggle{background:#ccc;border-radius:13px;display:inline-block;height:20px;min-width:42px;position:relative;transition:background 0.25s cubic-bezier(0.77, 0, 0.175, 1);vertical-align:top;width:42px}.form-switcher--toggle .form-switcher--icon{background:#fff;border-radius:10px;display:block;height:14px;left:5px;position:absolute;transform:translateX(-1px);top:3px;width:14px;transition-duration:0.25s;transition-timing-function:cubic-bezier(0.77, 0, 0.175, 1);transition-property:transform, background}.form-switcher--real-element:checked ~ .form-switcher--toggle{background:#104b8a}.form-switcher--real-element:checked ~ .form-switcher--toggle .form-switcher--icon{background:#fff;transform:translateX(18px)}.form-switcher--checkbox{background:#fff;border:1px solid #ccc;border-radius:2px;color:#104b8a;display:block;height:16px;transition:border-color 0.25s ease;width:16px}.form-switcher--real-element:checked ~ .form-switcher--checkbox{border-color:#b7d8f4}.form-switcher--checkbox .form-switcher--icon{display:inline-block;height:100%;opacity:0;position:relative;transform:scale(0.1);transition-duration:0.25s;transition-timing-function:cubic-bezier(0.45, -0.67, 0.53, 2);transition-property:transform, opacity;vertical-align:top;width:100%}.form-switcher--real-element:checked ~ .form-switcher--checkbox .form-switcher--icon{opacity:1;transform:scale(1)}";
	append(document.head, style);
}

// (10:2) {#if name}
function create_if_block_1$9(ctx) {
	let input;

	return {
		c() {
			input = element("input");
			attr(input, "name", /*name*/ ctx[2]);
			attr(input, "type", "hidden");
			input.value = /*checked*/ ctx[0];
		},
		m(target, anchor) {
			insert(target, input, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*name*/ 4) {
				attr(input, "name", /*name*/ ctx[2]);
			}

			if (dirty & /*checked*/ 1) {
				input.value = /*checked*/ ctx[0];
			}
		},
		d(detaching) {
			if (detaching) detach(input);
		}
	};
}

// (22:6) {#if type === 'checkbox'}
function create_if_block$g(ctx) {
	let current;
	const icon = new Icon({ props: { name: "checkbox" } });

	return {
		c() {
			create_component(icon.$$.fragment);
		},
		m(target, anchor) {
			mount_component(icon, target, anchor);
			current = true;
		},
		i(local) {
			if (current) return;
			transition_in(icon.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(icon.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(icon, detaching);
		}
	};
}

function create_fragment$p(ctx) {
	let label;
	let t0;
	let input;
	let t1;
	let i1;
	let i0;
	let i1_class_value;
	let t2;
	let span;
	let current;
	let dispose;
	let if_block0 = /*name*/ ctx[2] && create_if_block_1$9(ctx);
	let if_block1 = /*type*/ ctx[1] === "checkbox" && create_if_block$g();
	const default_slot_template = /*$$slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			label = element("label");
			if (if_block0) if_block0.c();
			t0 = space();
			input = element("input");
			t1 = space();
			i1 = element("i");
			i0 = element("i");
			if (if_block1) if_block1.c();
			t2 = space();
			span = element("span");
			if (default_slot) default_slot.c();
			attr(input, "class", "form-switcher--real-element");
			attr(input, "type", "checkbox");
			attr(i0, "class", "form-switcher--icon");
			attr(i1, "class", i1_class_value = "form-switcher--fake-element form-switcher--" + /*type*/ ctx[1]);
			attr(span, "class", "form-switcher--label");
			attr(label, "class", "form-switcher");
		},
		m(target, anchor) {
			insert(target, label, anchor);
			if (if_block0) if_block0.m(label, null);
			append(label, t0);
			append(label, input);
			input.checked = /*checked*/ ctx[0];
			append(label, t1);
			append(label, i1);
			append(i1, i0);
			if (if_block1) if_block1.m(i0, null);
			append(label, t2);
			append(label, span);

			if (default_slot) {
				default_slot.m(span, null);
			}

			current = true;
			dispose = listen(input, "change", /*input_change_handler*/ ctx[5]);
		},
		p(ctx, [dirty]) {
			if (/*name*/ ctx[2]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0 = create_if_block_1$9(ctx);
					if_block0.c();
					if_block0.m(label, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (dirty & /*checked*/ 1) {
				input.checked = /*checked*/ ctx[0];
			}

			if (/*type*/ ctx[1] === "checkbox") {
				if (!if_block1) {
					if_block1 = create_if_block$g();
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(i0, null);
				} else {
					transition_in(if_block1, 1);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (!current || dirty & /*type*/ 2 && i1_class_value !== (i1_class_value = "form-switcher--fake-element form-switcher--" + /*type*/ ctx[1])) {
				attr(i1, "class", i1_class_value);
			}

			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block1);
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(if_block1);
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(label);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
			if (default_slot) default_slot.d(detaching);
			dispose();
		}
	};
}

function instance$p($$self, $$props, $$invalidate) {
	let { type } = $$props;
	let { name = null } = $$props;
	let { checked = false } = $$props;
	let { $$slots = {}, $$scope } = $$props;

	function input_change_handler() {
		checked = this.checked;
		$$invalidate(0, checked);
	}

	$$self.$set = $$props => {
		if ("type" in $$props) $$invalidate(1, type = $$props.type);
		if ("name" in $$props) $$invalidate(2, name = $$props.name);
		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	return [checked, type, name, $$scope, $$slots, input_change_handler];
}

class Form_switcher extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1ex3y9y-style")) add_css$m();
		init(this, options, instance$p, create_fragment$p, safe_not_equal, { type: 1, name: 2, checked: 0 });
	}
}

/* src/views/setup/setup.svelte generated by Svelte v3.19.1 */

function add_css$n() {
	var style = element("style");
	style.id = "svelte-17st9zu-style";
	style.textContent = ".setup.svelte-17st9zu.svelte-17st9zu{width:100%}.setup.svelte-17st9zu.svelte-17st9zu .button{margin-bottom:20px}.range.svelte-17st9zu.svelte-17st9zu{display:flex;align-items:center;margin-right:10px;position:relative}.range.svelte-17st9zu.svelte-17st9zu .button{font-size:15px;margin:0}.range.svelte-17st9zu h2.svelte-17st9zu{min-width:100px;text-align:center}";
	append(document.head, style);
}

// (50:2) <FormSwitcher type="toggle" bind:checked={setup.voice}>
function create_default_slot_34(ctx) {
	let t;

	return {
		c() {
			t = text("Включить голос");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (53:4) <SetupBox title="скорость голоса" flex>
function create_default_slot_33(ctx) {
	let div;
	let t0;
	let h2;
	let t1_value = /*setup*/ ctx[0].voiceSpeed * 10 + "";
	let t1;
	let t2;
	let t3;
	let current;
	const button0 = new Button({ props: { text: "-5%" } });
	button0.$on("click", /*decVoiceSpeed*/ ctx[4]);
	const button1 = new Button({ props: { text: "+5%" } });
	button1.$on("click", /*incVoiceSpeed*/ ctx[3]);

	return {
		c() {
			div = element("div");
			create_component(button0.$$.fragment);
			t0 = space();
			h2 = element("h2");
			t1 = text(t1_value);
			t2 = text("%");
			t3 = space();
			create_component(button1.$$.fragment);
			attr(h2, "class", "svelte-17st9zu");
			attr(div, "class", "range svelte-17st9zu");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(button0, div, null);
			append(div, t0);
			append(div, h2);
			append(h2, t1);
			append(h2, t2);
			append(div, t3);
			mount_component(button1, div, null);
			current = true;
		},
		p(ctx, dirty) {
			if ((!current || dirty & /*setup*/ 1) && t1_value !== (t1_value = /*setup*/ ctx[0].voiceSpeed * 10 + "")) set_data(t1, t1_value);
		},
		i(local) {
			if (current) return;
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(button0);
			destroy_component(button1);
		}
	};
}

// (51:2) <Slide active={setup.voice}>
function create_default_slot_32(ctx) {
	let t;
	let current;
	const button = new Button({ props: { text: "проверить голос" } });
	button.$on("click", /*click_handler*/ ctx[8]);

	const setupbox = new Setup_box({
			props: {
				title: "скорость голоса",
				flex: true,
				$$slots: { default: [create_default_slot_33] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(button.$$.fragment);
			t = space();
			create_component(setupbox.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			insert(target, t, anchor);
			mount_component(setupbox, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const setupbox_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox_changes.$$scope = { dirty, ctx };
			}

			setupbox.$set(setupbox_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			transition_in(setupbox.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			transition_out(setupbox.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
			if (detaching) detach(t);
			destroy_component(setupbox, detaching);
		}
	};
}

// (65:4) <FormSwitcher type="toggle" bind:checked={setup.phrases}>
function create_default_slot_31(ctx) {
	let t;

	return {
		c() {
			t = text("учить");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (67:6) <FormSwitcher type="toggle" bind:checked={setup.soundPhrases}>
function create_default_slot_30(ctx) {
	let t;

	return {
		c() {
			t = text("озвучивать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (66:4) <Slide active={setup.phrases && setup.voice}>
function create_default_slot_29(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_2(value) {
		/*formswitcher_checked_binding_2*/ ctx[10].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_30] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].soundPhrases !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].soundPhrases;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_2));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].soundPhrases;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

// (64:2) <SetupBox title="фразы">
function create_default_slot_28(ctx) {
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding_1(value) {
		/*formswitcher_checked_binding_1*/ ctx[9].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_31] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].phrases !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].phrases;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_1));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].phrases && /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_29] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			insert(target, t, anchor);
			mount_component(slide, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].phrases;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].phrases && /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
			if (detaching) detach(t);
			destroy_component(slide, detaching);
		}
	};
}

// (72:4) <FormSwitcher type="toggle" bind:checked={setup.nouns}>
function create_default_slot_27(ctx) {
	let t;

	return {
		c() {
			t = text("учить");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (75:8) <FormSwitcher type="toggle" bind:checked={setup.soundNouns}>
function create_default_slot_26(ctx) {
	let t;

	return {
		c() {
			t = text("озвучивать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (74:6) <Slide active={setup.voice}>
function create_default_slot_25(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_4(value) {
		/*formswitcher_checked_binding_4*/ ctx[12].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_26] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].soundNouns !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].soundNouns;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_4));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].soundNouns;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

// (79:8) <FormSwitcher type="toggle" bind:checked={setup.articles}>
function create_default_slot_24(ctx) {
	let t;

	return {
		c() {
			t = text("показывать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (81:10) <FormSwitcher type="toggle" bind:checked={setup.soundArticles}>
function create_default_slot_23(ctx) {
	let t;

	return {
		c() {
			t = text("озвучивать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (80:8) <Slide active={setup.voice}>
function create_default_slot_22(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_6(value) {
		/*formswitcher_checked_binding_6*/ ctx[14].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_23] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].soundArticles !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].soundArticles;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_6));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].soundArticles;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

// (78:6) <SetupBox title="артикли">
function create_default_slot_21(ctx) {
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding_5(value) {
		/*formswitcher_checked_binding_5*/ ctx[13].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_24] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].articles !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].articles;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_5));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_22] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			insert(target, t, anchor);
			mount_component(slide, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].articles;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
			if (detaching) detach(t);
			destroy_component(slide, detaching);
		}
	};
}

// (86:8) <FormSwitcher type="toggle" bind:checked={setup.plural}>
function create_default_slot_20(ctx) {
	let t;

	return {
		c() {
			t = text("показывать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (88:10) <FormSwitcher type="toggle" bind:checked={setup.soundPlural}>
function create_default_slot_19(ctx) {
	let t;

	return {
		c() {
			t = text("озвучивать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (87:8) <Slide active={setup.voice}>
function create_default_slot_18(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_8(value) {
		/*formswitcher_checked_binding_8*/ ctx[16].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_19] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].soundPlural !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].soundPlural;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_8));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].soundPlural;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

// (85:6) <SetupBox title="plural">
function create_default_slot_17(ctx) {
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding_7(value) {
		/*formswitcher_checked_binding_7*/ ctx[15].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_20] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].plural !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].plural;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_7));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_18] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			insert(target, t, anchor);
			mount_component(slide, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].plural;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
			if (detaching) detach(t);
			destroy_component(slide, detaching);
		}
	};
}

// (73:4) <Slide active={setup.nouns}>
function create_default_slot_16(ctx) {
	let t0;
	let t1;
	let current;

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_25] },
				$$scope: { ctx }
			}
		});

	const setupbox0 = new Setup_box({
			props: {
				title: "артикли",
				$$slots: { default: [create_default_slot_21] },
				$$scope: { ctx }
			}
		});

	const setupbox1 = new Setup_box({
			props: {
				title: "plural",
				$$slots: { default: [create_default_slot_17] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(slide.$$.fragment);
			t0 = space();
			create_component(setupbox0.$$.fragment);
			t1 = space();
			create_component(setupbox1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(slide, target, anchor);
			insert(target, t0, anchor);
			mount_component(setupbox0, target, anchor);
			insert(target, t1, anchor);
			mount_component(setupbox1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
			const setupbox0_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox0_changes.$$scope = { dirty, ctx };
			}

			setupbox0.$set(setupbox0_changes);
			const setupbox1_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox1_changes.$$scope = { dirty, ctx };
			}

			setupbox1.$set(setupbox1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(slide.$$.fragment, local);
			transition_in(setupbox0.$$.fragment, local);
			transition_in(setupbox1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(slide.$$.fragment, local);
			transition_out(setupbox0.$$.fragment, local);
			transition_out(setupbox1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(slide, detaching);
			if (detaching) detach(t0);
			destroy_component(setupbox0, detaching);
			if (detaching) detach(t1);
			destroy_component(setupbox1, detaching);
		}
	};
}

// (71:2) <SetupBox title="существительные">
function create_default_slot_15(ctx) {
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding_3(value) {
		/*formswitcher_checked_binding_3*/ ctx[11].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_27] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].nouns !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].nouns;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_3));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].nouns,
				$$slots: { default: [create_default_slot_16] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			insert(target, t, anchor);
			mount_component(slide, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].nouns;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].nouns;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
			if (detaching) detach(t);
			destroy_component(slide, detaching);
		}
	};
}

// (95:4) <FormSwitcher type="toggle" bind:checked={setup.verbs}>
function create_default_slot_14(ctx) {
	let t;

	return {
		c() {
			t = text("учить");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (98:8) <FormSwitcher type="toggle" bind:checked={setup.soundVerbs}>
function create_default_slot_13(ctx) {
	let t;

	return {
		c() {
			t = text("озвучивать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (97:6) <Slide active={setup.voice}>
function create_default_slot_12(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_10(value) {
		/*formswitcher_checked_binding_10*/ ctx[18].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_13] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].soundVerbs !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].soundVerbs;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_10));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].soundVerbs;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

// (102:8) <FormSwitcher type="toggle" bind:checked={setup.strongVerbs}>
function create_default_slot_11(ctx) {
	let t;

	return {
		c() {
			t = text("показывать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (104:10) <FormSwitcher type="toggle" bind:checked={setup.soundStrongVerbs}>
function create_default_slot_10(ctx) {
	let t;

	return {
		c() {
			t = text("озвучивать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (103:8) <Slide active={setup.voice}>
function create_default_slot_9(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_12(value) {
		/*formswitcher_checked_binding_12*/ ctx[20].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_10] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].soundStrongVerbs !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].soundStrongVerbs;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_12));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].soundStrongVerbs;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

// (101:6) <SetupBox title="сильные">
function create_default_slot_8(ctx) {
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding_11(value) {
		/*formswitcher_checked_binding_11*/ ctx[19].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_11] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].strongVerbs !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].strongVerbs;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_11));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_9] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			insert(target, t, anchor);
			mount_component(slide, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].strongVerbs;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
			if (detaching) detach(t);
			destroy_component(slide, detaching);
		}
	};
}

// (109:8) <FormSwitcher type="toggle" bind:checked={setup.irregularVerbs}>
function create_default_slot_7(ctx) {
	let t;

	return {
		c() {
			t = text("показывать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (111:10) <FormSwitcher type="toggle" bind:checked={setup.soundIrregularVerbs}>
function create_default_slot_6(ctx) {
	let t;

	return {
		c() {
			t = text("озвучивать");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (110:8) <Slide active={setup.voice}>
function create_default_slot_5(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_14(value) {
		/*formswitcher_checked_binding_14*/ ctx[22].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_6] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].soundIrregularVerbs !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].soundIrregularVerbs;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_14));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].soundIrregularVerbs;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

// (108:6) <SetupBox title="неправильные">
function create_default_slot_4(ctx) {
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding_13(value) {
		/*formswitcher_checked_binding_13*/ ctx[21].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_7] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].irregularVerbs !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].irregularVerbs;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_13));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			insert(target, t, anchor);
			mount_component(slide, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].irregularVerbs;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
			if (detaching) detach(t);
			destroy_component(slide, detaching);
		}
	};
}

// (96:4) <Slide active={setup.verbs}>
function create_default_slot_3(ctx) {
	let t0;
	let t1;
	let current;

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_12] },
				$$scope: { ctx }
			}
		});

	const setupbox0 = new Setup_box({
			props: {
				title: "сильные",
				$$slots: { default: [create_default_slot_8] },
				$$scope: { ctx }
			}
		});

	const setupbox1 = new Setup_box({
			props: {
				title: "неправильные",
				$$slots: { default: [create_default_slot_4] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(slide.$$.fragment);
			t0 = space();
			create_component(setupbox0.$$.fragment);
			t1 = space();
			create_component(setupbox1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(slide, target, anchor);
			insert(target, t0, anchor);
			mount_component(setupbox0, target, anchor);
			insert(target, t1, anchor);
			mount_component(setupbox1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
			const setupbox0_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox0_changes.$$scope = { dirty, ctx };
			}

			setupbox0.$set(setupbox0_changes);
			const setupbox1_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox1_changes.$$scope = { dirty, ctx };
			}

			setupbox1.$set(setupbox1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(slide.$$.fragment, local);
			transition_in(setupbox0.$$.fragment, local);
			transition_in(setupbox1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(slide.$$.fragment, local);
			transition_out(setupbox0.$$.fragment, local);
			transition_out(setupbox1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(slide, detaching);
			if (detaching) detach(t0);
			destroy_component(setupbox0, detaching);
			if (detaching) detach(t1);
			destroy_component(setupbox1, detaching);
		}
	};
}

// (94:2) <SetupBox title="глаголы">
function create_default_slot_2$1(ctx) {
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding_9(value) {
		/*formswitcher_checked_binding_9*/ ctx[17].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_14] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].verbs !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].verbs;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_9));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].verbs,
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			insert(target, t, anchor);
			mount_component(slide, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].verbs;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].verbs;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
			if (detaching) detach(t);
			destroy_component(slide, detaching);
		}
	};
}

// (118:4) <FormSwitcher type="toggle" bind:checked={setup.other}>
function create_default_slot_1$1(ctx) {
	let t;

	return {
		c() {
			t = text("учить");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (117:2) <SetupBox title="другое">
function create_default_slot$6(ctx) {
	let updating_checked;
	let current;

	function formswitcher_checked_binding_15(value) {
		/*formswitcher_checked_binding_15*/ ctx[23].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_1$1] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].other !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].other;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding_15));

	return {
		c() {
			create_component(formswitcher.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].other;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher, detaching);
		}
	};
}

function create_fragment$q(ctx) {
	let div;
	let t0;
	let h10;
	let t2;
	let updating_checked;
	let t3;
	let t4;
	let h11;
	let t6;
	let t7;
	let t8;
	let t9;
	let t10;
	let current;
	const button0 = new Button({ props: { text: "Сохранить" } });
	button0.$on("click", /*onSave*/ ctx[1]);

	function formswitcher_checked_binding(value) {
		/*formswitcher_checked_binding*/ ctx[7].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_34] },
		$$scope: { ctx }
	};

	if (/*setup*/ ctx[0].voice !== void 0) {
		formswitcher_props.checked = /*setup*/ ctx[0].voice;
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding));

	const slide = new Slide({
			props: {
				active: /*setup*/ ctx[0].voice,
				$$slots: { default: [create_default_slot_32] },
				$$scope: { ctx }
			}
		});

	const setupbox0 = new Setup_box({
			props: {
				title: "фразы",
				$$slots: { default: [create_default_slot_28] },
				$$scope: { ctx }
			}
		});

	const setupbox1 = new Setup_box({
			props: {
				title: "существительные",
				$$slots: { default: [create_default_slot_15] },
				$$scope: { ctx }
			}
		});

	const setupbox2 = new Setup_box({
			props: {
				title: "глаголы",
				$$slots: { default: [create_default_slot_2$1] },
				$$scope: { ctx }
			}
		});

	const setupbox3 = new Setup_box({
			props: {
				title: "другое",
				$$slots: { default: [create_default_slot$6] },
				$$scope: { ctx }
			}
		});

	const button1 = new Button({ props: { text: "Сохранить" } });
	button1.$on("click", /*onSave*/ ctx[1]);

	return {
		c() {
			div = element("div");
			create_component(button0.$$.fragment);
			t0 = space();
			h10 = element("h1");
			h10.textContent = "Настройка голоса";
			t2 = space();
			create_component(formswitcher.$$.fragment);
			t3 = space();
			create_component(slide.$$.fragment);
			t4 = space();
			h11 = element("h1");
			h11.textContent = "Настройка словая";
			t6 = space();
			create_component(setupbox0.$$.fragment);
			t7 = space();
			create_component(setupbox1.$$.fragment);
			t8 = space();
			create_component(setupbox2.$$.fragment);
			t9 = space();
			create_component(setupbox3.$$.fragment);
			t10 = space();
			create_component(button1.$$.fragment);
			attr(div, "class", "setup svelte-17st9zu");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(button0, div, null);
			append(div, t0);
			append(div, h10);
			append(div, t2);
			mount_component(formswitcher, div, null);
			append(div, t3);
			mount_component(slide, div, null);
			append(div, t4);
			append(div, h11);
			append(div, t6);
			mount_component(setupbox0, div, null);
			append(div, t7);
			mount_component(setupbox1, div, null);
			append(div, t8);
			mount_component(setupbox2, div, null);
			append(div, t9);
			mount_component(setupbox3, div, null);
			append(div, t10);
			mount_component(button1, div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 16777216) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*setup*/ 1) {
				updating_checked = true;
				formswitcher_changes.checked = /*setup*/ ctx[0].voice;
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*setup*/ 1) slide_changes.active = /*setup*/ ctx[0].voice;

			if (dirty & /*$$scope, setup*/ 16777217) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);
			const setupbox0_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox0_changes.$$scope = { dirty, ctx };
			}

			setupbox0.$set(setupbox0_changes);
			const setupbox1_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox1_changes.$$scope = { dirty, ctx };
			}

			setupbox1.$set(setupbox1_changes);
			const setupbox2_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox2_changes.$$scope = { dirty, ctx };
			}

			setupbox2.$set(setupbox2_changes);
			const setupbox3_changes = {};

			if (dirty & /*$$scope, setup*/ 16777217) {
				setupbox3_changes.$$scope = { dirty, ctx };
			}

			setupbox3.$set(setupbox3_changes);
		},
		i(local) {
			if (current) return;
			transition_in(button0.$$.fragment, local);
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			transition_in(setupbox0.$$.fragment, local);
			transition_in(setupbox1.$$.fragment, local);
			transition_in(setupbox2.$$.fragment, local);
			transition_in(setupbox3.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button0.$$.fragment, local);
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			transition_out(setupbox0.$$.fragment, local);
			transition_out(setupbox1.$$.fragment, local);
			transition_out(setupbox2.$$.fragment, local);
			transition_out(setupbox3.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(button0);
			destroy_component(formswitcher);
			destroy_component(slide);
			destroy_component(setupbox0);
			destroy_component(setupbox1);
			destroy_component(setupbox2);
			destroy_component(setupbox3);
			destroy_component(button1);
		}
	};
}

function instance$q($$self, $$props, $$invalidate) {
	let $user;
	component_subscribe($$self, store$3, $$value => $$invalidate(5, $user = $$value));
	let setup = $user;

	const onSave = () => {
		store$3.saveSetup(setup);

		store.addMessage({
			status: "success",
			text: "setupSave.success"
		});
	};

	const onVoiceSpeedChange = s => {
		$$invalidate(0, setup.voiceSpeed = s, setup);
	};

	const onVoiceTest = () => {
		play(["Wie heißen Sie?"], setup.voiceSpeed);
	};

	const incVoiceSpeed = () => {
		if (setup.voiceSpeed === 15) {
			return;
		}

		$$invalidate(0, setup.voiceSpeed += 0.5, setup);
	};

	const decVoiceSpeed = () => {
		if (setup.voiceSpeed === 5) {
			return;
		}

		$$invalidate(0, setup.voiceSpeed -= 0.5, setup);
	};

	function formswitcher_checked_binding(value) {
		setup.voice = value;
		$$invalidate(0, setup);
	}

	const click_handler = () => onVoiceTest();

	function formswitcher_checked_binding_1(value) {
		setup.phrases = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_2(value) {
		setup.soundPhrases = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_3(value) {
		setup.nouns = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_4(value) {
		setup.soundNouns = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_5(value) {
		setup.articles = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_6(value) {
		setup.soundArticles = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_7(value) {
		setup.plural = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_8(value) {
		setup.soundPlural = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_9(value) {
		setup.verbs = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_10(value) {
		setup.soundVerbs = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_11(value) {
		setup.strongVerbs = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_12(value) {
		setup.soundStrongVerbs = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_13(value) {
		setup.irregularVerbs = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_14(value) {
		setup.soundIrregularVerbs = value;
		$$invalidate(0, setup);
	}

	function formswitcher_checked_binding_15(value) {
		setup.other = value;
		$$invalidate(0, setup);
	}

	return [
		setup,
		onSave,
		onVoiceTest,
		incVoiceSpeed,
		decVoiceSpeed,
		$user,
		onVoiceSpeedChange,
		formswitcher_checked_binding,
		click_handler,
		formswitcher_checked_binding_1,
		formswitcher_checked_binding_2,
		formswitcher_checked_binding_3,
		formswitcher_checked_binding_4,
		formswitcher_checked_binding_5,
		formswitcher_checked_binding_6,
		formswitcher_checked_binding_7,
		formswitcher_checked_binding_8,
		formswitcher_checked_binding_9,
		formswitcher_checked_binding_10,
		formswitcher_checked_binding_11,
		formswitcher_checked_binding_12,
		formswitcher_checked_binding_13,
		formswitcher_checked_binding_14,
		formswitcher_checked_binding_15
	];
}

class Setup extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-17st9zu-style")) add_css$n();
		init(this, options, instance$q, create_fragment$q, safe_not_equal, {});
	}
}

/* src/sdk/form-validation/form-validation.svelte generated by Svelte v3.19.1 */

function create_fragment$r(ctx) {
	let form_1;
	let use_action;
	let current;
	let dispose;
	const default_slot_template = /*$$slots*/ ctx[5].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

	return {
		c() {
			form_1 = element("form");
			if (default_slot) default_slot.c();
			attr(form_1, "class", /*className*/ ctx[0]);
			form_1.noValidate = true;
		},
		m(target, anchor) {
			insert(target, form_1, anchor);

			if (default_slot) {
				default_slot.m(form_1, null);
			}

			current = true;

			dispose = [
				action_destroyer(use_action = /*use*/ ctx[2].call(null, form_1, { onSuccess: /*onSuccess*/ ctx[1] })),
				listen(form_1, "submit", prevent_default(/*submit_handler*/ ctx[6]))
			];
		},
		p(ctx, [dirty]) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 16) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[4], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null));
			}

			if (!current || dirty & /*className*/ 1) {
				attr(form_1, "class", /*className*/ ctx[0]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(form_1);
			if (default_slot) default_slot.d(detaching);
			run_all(dispose);
		}
	};
}

function instance$r($$self, $$props, $$invalidate) {
	let { form } = $$props;
	let { className = "" } = $$props;
	const { onSuccess, use } = form;
	let { $$slots = {}, $$scope } = $$props;

	function submit_handler(event) {
		bubble($$self, event);
	}

	$$self.$set = $$props => {
		if ("form" in $$props) $$invalidate(3, form = $$props.form);
		if ("className" in $$props) $$invalidate(0, className = $$props.className);
		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
	};

	return [className, onSuccess, use, form, $$scope, $$slots, submit_handler];
}

class Form_validation extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$r, create_fragment$r, safe_not_equal, { form: 3, className: 0 });
	}
}

var ListenInputEventsEnum;
(function (ListenInputEventsEnum) {
    ListenInputEventsEnum[ListenInputEventsEnum["never"] = 0] = "never";
    ListenInputEventsEnum[ListenInputEventsEnum["always"] = 1] = "always";
    ListenInputEventsEnum[ListenInputEventsEnum["afterValidation"] = 2] = "afterValidation";
})(ListenInputEventsEnum || (ListenInputEventsEnum = {}));
var SvelidationPresence;
(function (SvelidationPresence) {
    SvelidationPresence["required"] = "required";
    SvelidationPresence["optional"] = "optional";
})(SvelidationPresence || (SvelidationPresence = {}));

var isFunction = (f) => {
    return typeof f === 'function';
};

class FormElement {
    constructor(node, options) {
        this.node = node;
        this.options = options;
        this.currentPhase = null;
        this.onClear = () => {
            if (!this.preventEvents()) {
                this.options.onClear();
            }
        };
        this.onValidate = () => {
            if (!this.preventEvents()) {
                this.options.onValidate();
            }
        };
        const { change, blur } = this.options.validateOnEvents;
        const { focus } = this.options.clearErrorsOnEvents;
        if (change) {
            node.addEventListener('change', this.onValidate);
        }
        if (blur) {
            node.addEventListener('blur', this.onValidate);
        }
        if (focus) {
            node.addEventListener('focus', this.onClear);
        }
    }
    setPhase(phase) {
        this.currentPhase = phase;
    }
    preventEvents() {
        const { listenInputEvents: initialPhase } = this.options;
        if (initialPhase === ListenInputEventsEnum.never) {
            return true;
        }
        if (initialPhase === ListenInputEventsEnum.always) {
            return false;
        }
        return this.currentPhase < initialPhase;
    }
    destroy() {
        this.node.removeEventListener('change', this.onValidate);
        this.node.removeEventListener('blur', this.onValidate);
        this.node.removeEventListener('focus', this.onClear);
    }
}

const prepareBaseParams = (entryParams, validationOptions) => {
    const { trim: entryTrim, required, optional } = entryParams;
    const { presence, trim: optionsTrim } = validationOptions;
    const output = { ...entryParams };
    if (presence === SvelidationPresence.required && required === undefined && optional === undefined) {
        output.required = true;
    }
    if (optionsTrim && entryTrim === undefined) {
        output.trim = true;
    }
    return output;
};

const globals$1 = [];
let typeRules = {};
let types = {};
let rules = {};
const getSpies = (params) => {
    if (!params) {
        return globals$1;
    }
    try {
        const { type: typeName, ruleName } = params;
        if (typeName && ruleName) {
            return typeRules[typeName][ruleName] || [];
        }
        else if (typeName) {
            return types[typeName] || [];
        }
        else {
            return rules[ruleName] || [];
        }
    }
    catch (e) {
        return [];
    }
};

let types$1 = {};
let rules$1 = {};
const ensureType = (typeName, typeRules) => {
    if (typeof typeRules !== 'object') {
        return;
    }
    Object.keys(typeRules).reduce((obj, key) => {
        const rule = typeRules[key];
        try {
            if (typeof rule === 'string') {
                const [typeName, ruleName] = rule.split('.');
                const inheritedRule = getType(typeName)[ruleName];
                if (isFunction(inheritedRule)) {
                    obj[ruleName] = inheritedRule;
                }
            }
            else if (isFunction(rule)) {
                obj[key] = rule;
            }
        }
        catch (e) {
            delete obj[key];
        }
        return obj;
    }, typeRules);
    if (!types$1[typeName]) {
        if (!isFunction(typeRules.type)) {
            return;
        }
        types$1[typeName] = {};
    }
    Object.assign(types$1[typeName], typeRules);
};
const resetType = (typeName) => {
    if (!typeName) {
        types$1 = {};
        Object.keys(installType).forEach(key => installType[key]());
    }
    else {
        delete types$1[typeName];
        if (installType[typeName]) {
            installType[typeName]();
        }
    }
};
const resetRule = (ruleName) => {
    if (!ruleName) {
        rules$1 = {};
        Object.keys(installRule).forEach(key => installRule[key]());
    }
    else {
        delete rules$1[ruleName];
        if (installRule[ruleName]) {
            installRule[ruleName]();
        }
    }
};
const installType = {
    string: () => {
        ensureType('string', {
            type: (value) => (typeof value === 'string'),
            min: (value, { min }) => (value.length >= min),
            max: (value, { max }) => (value.length <= max),
            between: (value, { between }) => (value.length >= between[0] && value.length <= between[1])
        });
    },
    email: () => {
        ensureType('email', {
            type: (value) => (typeof value === 'string' && (value === '' || !!(String(value)).match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)))
        });
    },
    number: () => {
        ensureType('number', {
            type: (value) => (typeof value === 'number' || (typeof value === 'string' && (value === '' || !isNaN(parseFloat(value))))),
            required: value => !isNaN(typeof value === 'number' ? value : parseFloat(value)),
            min: (value, { min }) => (parseFloat(value) >= min),
            max: (value, { max }) => (parseFloat(value) <= max),
            between: (value, { between }) => (value >= between[0] && value <= between[1])
        });
    },
    boolean: () => {
        ensureType('boolean', {
            type: (value) => typeof value === 'boolean',
            required: (value) => value,
        });
    },
    array: () => {
        ensureType('array', {
            type: (value) => Array.isArray(value),
            required: (value) => value.length > 0,
            min: (value, { min }) => value.length >= min,
            max: (value, { max }) => value.length <= max,
            equal: (value, { equal }) => {
                if (isFunction(equal)) {
                    return equal(value);
                }
                return value.sort().toString() === equal.sort().toString();
            },
            includes: (value, { includes }) => value.includes(includes)
        });
    },
};
const installRule = {
    equal: () => {
        ensureRule('equal', (value, { equal }) => {
            if (isFunction(equal)) {
                return equal(value);
            }
            return value === equal;
        });
    },
    match: () => {
        ensureRule('match', (value, { match }) => !!(String(value)).match(match));
    },
    required: () => {
        ensureRule('required', (value) => {
            if (value === undefined || value === null) {
                return false;
            }
            return !!String(value);
        });
    }
};
const ensureRule = (ruleName, rule) => {
    if (!isFunction(rule)) {
        return;
    }
    Object.assign(rules$1, {
        [ruleName]: rule
    });
};
const getType = (typeName) => types$1[typeName];
const getRule = (ruleName) => rules$1[ruleName];
resetType();
resetRule();

const runRuleWithSpies = ({ value, params: initialParams, rule, ruleName, spies }) => {
    const errors = [];
    const { type } = initialParams;
    let nextValue = value;
    let nextParams = initialParams;
    let stop = false;
    let abort = false;
    for (let i = 0; i < spies.length; i++) {
        stop = true;
        const spyErrors = spies[i](nextValue, { type, ruleName, ...nextParams }, (value, params = {}) => {
            nextValue = value;
            nextParams = { ...initialParams, ...params };
            stop = false;
        }, () => {
            abort = true;
        });
        if (abort) {
            return { abort };
        }
        if (Array.isArray(spyErrors)) {
            errors.push(...spyErrors);
        }
        if (stop) {
            break;
        }
    }
    if (!stop && !rule(nextValue, nextParams)) {
        errors.push(ruleName);
    }
    return { errors, stop, nextValue, nextParams };
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getScope = ({ type, optional, ...rules }) => {
    const typeRules = getType(type);
    if (!typeRules) {
        return {};
    }
    return [...Object.keys(rules), 'type'].reduce((obj, ruleName) => {
        const rule = typeRules[ruleName] || getRule(ruleName);
        if (rule) {
            obj[ruleName] = rule;
        }
        return obj;
    }, {});
};
const skipValidation = (value, { optional, required = false }) => {
    const valueIsAbsent = [undefined, null, ''].indexOf(value) > -1 || (Array.isArray(value) && !value.length);
    const valueIsOptional = typeof optional === 'boolean' ? optional : !required;
    return valueIsAbsent && valueIsOptional;
};
const validate = (value, validateParams) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,prefer-const
    let { trim = false, id, ...params } = validateParams;
    if (trim && typeof value === 'string') {
        value = value.trim();
    }
    const { required, optional, type } = params;
    const globalSpies = getSpies();
    const typeSpies = getSpies({ type });
    const scope = getScope(params);
    // no type - no party
    if (!isFunction(scope.type)) {
        return [];
    }
    // skip for empty and optional fields
    if (skipValidation(value, { required, optional })) {
        return [];
    }
    const result = [];
    // ensure type with first pick
    const ruleNames = Object.keys(scope).filter(key => (key !== 'type'));
    ruleNames.unshift('type');
    for (let i = 0; i < ruleNames.length; i++) {
        const typeRuleSpies = getSpies({ type, ruleName: ruleNames[i] });
        const ruleSpies = getSpies({ ruleName: ruleNames[i] });
        const spies = [];
        if (i === 0) {
            spies.push(...globalSpies);
            spies.push(...typeSpies);
        }
        spies.push(...typeRuleSpies);
        spies.push(...ruleSpies);
        const { stop, errors, abort, nextValue, nextParams } = runRuleWithSpies({
            value, params, spies,
            rule: scope[ruleNames[i]],
            ruleName: ruleNames[i]
        });
        // exit validation with no errors in case of abort call
        if (abort) {
            return;
        }
        // stop validation with current errors in case of stop call
        // or if there are errors on first (type) step
        if (stop || (i === 0 && errors.length)) {
            return errors;
        }
        result.push(...errors);
        value = nextValue;
        params = nextParams;
    }
    return result;
};

const setValidationPhase = (entries, phase) => {
    entries.forEach(({ formElements }) => {
        if (formElements) {
            formElements.forEach(formElement => formElement.setPhase(phase));
        }
    });
};
const createValidation = (opts) => {
    let phase = ListenInputEventsEnum.never;
    const entries = [];
    const options = Object.assign({
        listenInputEvents: ListenInputEventsEnum.afterValidation,
        presence: 'optional',
        trim: false,
        includeAllEntries: false,
        validateOnEvents: {
            input: false,
            change: true,
            blur: false
        },
        clearErrorsOnEvents: {
            focus: false,
            reset: true
        },
        useCustomErrorsStore: false,
        getValues: false,
        warningsEnabled: true
    }, opts);
    if (!options.warningsEnabled) ;
    if (typeof options.validateOnEvents !== 'object' || options.validateOnEvents === null) {
        options.validateOnEvents = {};
    }
    if (typeof options.clearErrorsOnEvents !== 'object' || options.clearErrorsOnEvents === null) {
        options.clearErrorsOnEvents = {};
    }
    const getValues = () => {
        if (isFunction(options.getValues)) {
            return options.getValues(entries.map(entry => {
                return {
                    params: entry.params,
                    value: get_store_value(entry.store.value)
                };
            }));
        }
        return entries.reduce((result, entry) => {
            if (entry.formElements || options.includeAllEntries) {
                const { id } = entry.params;
                result.set(id || entry.params, get_store_value(entry.store.value));
            }
            return result;
        }, new Map());
    };
    const buildErrorsStore = (errors, entryParams = null) => {
        return isFunction(options.useCustomErrorsStore)
            ? options.useCustomErrorsStore(errors, entryParams)
            : errors;
    };
    const createEntry = (createEntryParams) => {
        const { value = '', ...params } = createEntryParams;
        const store = {
            errors: writable(buildErrorsStore([])),
            value: writable(value)
        };
        const entry = { store, params };
        const useInput = (inputNode, useOptions) => {
            const formElementOptions = Object.assign({}, options, useOptions, {
                onClear: () => store.errors.set(buildErrorsStore([])),
                onValidate: () => validateValueStore(store.value)
            });
            if (!entry.formElements) {
                entry.formElements = [];
            }
            const newElement = new FormElement(inputNode, formElementOptions);
            newElement.setPhase(phase);
            entry.formElements.push(newElement);
            let preventFirstSubscriberEvent = true;
            const unsubscribe = formElementOptions.validateOnEvents.input && store.value.subscribe(() => {
                if (preventFirstSubscriberEvent) {
                    preventFirstSubscriberEvent = false;
                    return;
                }
                if (options.listenInputEvents === ListenInputEventsEnum.always
                    || (options.listenInputEvents !== ListenInputEventsEnum.never && phase >= options.listenInputEvents)) {
                    validateValueStore(store.value);
                }
            });
            return {
                destroy: () => {
                    if (isFunction(unsubscribe)) {
                        unsubscribe();
                    }
                    for (let i = 0; i < entry.formElements.length; i++) {
                        const formElement = entry.formElements[i];
                        if (formElement.node === inputNode) {
                            entry.formElements.splice(i, 1);
                            formElement.destroy();
                            break;
                        }
                    }
                    if (!entry.formElements.length) {
                        delete entry.formElements;
                    }
                }
            };
        };
        entries.push(entry);
        return [store.errors, store.value, useInput];
    };
    const createEntries = (data) => {
        if (Array.isArray(data)) {
            return data.map(createEntry);
        }
        else {
            return Object.keys(data).reduce((sum, currentKey) => {
                return Object.assign(sum, {
                    [currentKey]: createEntry(data[currentKey])
                });
            }, {});
        }
    };
    const createForm = (formNode, events = {}) => {
        const { onFail: fail, onSubmit: submit, onSuccess: success } = events;
        const onReset = () => clearErrors();
        const onSubmit = e => {
            const errors = validate$1();
            isFunction(submit) && submit(e, errors);
            if (errors.length) {
                isFunction(fail) && fail(errors);
            }
            else {
                isFunction(success) && success(getValues());
            }
        };
        formNode.addEventListener('submit', onSubmit);
        if (options.clearErrorsOnEvents.reset) {
            formNode.addEventListener('reset', onReset);
        }
        return {
            destroy: () => {
                formNode.removeEventListener('submit', onSubmit);
                formNode.removeEventListener('reset', onReset);
            }
        };
    };
    const validateValueStore = (value) => {
        const entry = entries.find(entry => (entry.store.value === value));
        if (entry) {
            const value = get_store_value(entry.store.value);
            const errors = validate(value, prepareBaseParams(entry.params, options));
            if (Array.isArray(errors)) {
                entry.store.errors.set(buildErrorsStore(errors, prepareBaseParams(entry.params, options)));
                return errors;
            }
        }
        return buildErrorsStore([]);
    };
    const validate$1 = (includeNoFormElements = false) => {
        const errors = entries.reduce((errors, entry) => {
            if (entry.formElements || includeNoFormElements || options.includeAllEntries) {
                const storeErrors = validateValueStore(entry.store.value);
                if (storeErrors.length) {
                    errors.push({ [entry.params.type]: buildErrorsStore(storeErrors, prepareBaseParams(entry.params, options)) });
                }
            }
            return errors;
        }, []);
        phase = ListenInputEventsEnum.afterValidation;
        setValidationPhase(entries, ListenInputEventsEnum.afterValidation);
        return errors;
    };
    const clearErrors = (includeNoFormElements = false) => {
        entries.forEach(entry => {
            if (entry.formElements || includeNoFormElements || options.includeAllEntries) {
                entry.store.errors.set(buildErrorsStore([]));
            }
        });
    };
    return {
        createEntry,
        createEntries,
        createForm,
        validateValueStore,
        validate: validate$1,
        clearErrors,
        getValues
    };
};

const { validationRules: rules$2 } = getInitialState();
var createValidation$1 = (options, callback) => {
    const { validationOptions = {}, scheme, initial = {} } = options;
    const { createForm, createEntries, clearErrors } = createValidation(Object.assign({
        presence: 'required',
        trim: true,
        getValues: entries => {
            return entries.reduce((result, { value, params }) => {
                result[params.id] = value;
                return result;
            }, {});
        }
    }, validationOptions));
    return {
        clearErrors,
        form: { use: createForm, onSuccess: callback },
        entries: createEntries(scheme.reduce((result, entryId) => {
            result[entryId] = Object.assign(Object.assign({}, rules$2[entryId]), { id: entryId });
            if (initial[entryId]) {
                result[entryId].value = initial[entryId];
            }
            return result;
        }, {}))
    };
};

/* src/views/auth/auth-login.svelte generated by Svelte v3.19.1 */

function create_default_slot_2$2(ctx) {
	let input;
	let lInput_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$lValue*/ ctx[0]);

			dispose = [
				listen(input, "input", /*input_input_handler*/ ctx[10]),
				action_destroyer(lInput_action = /*lInput*/ ctx[4].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty & /*$lValue*/ 1 && input.value !== /*$lValue*/ ctx[0]) {
				set_input_value(input, /*$lValue*/ ctx[0]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (32:2) <FormInput errors={pErrors} label="Пароль">
function create_default_slot_1$2(ctx) {
	let input;
	let pInput_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "password");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$pValue*/ ctx[1]);

			dispose = [
				listen(input, "input", /*input_input_handler_1*/ ctx[11]),
				action_destroyer(pInput_action = /*pInput*/ ctx[7].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty & /*$pValue*/ 2 && input.value !== /*$pValue*/ ctx[1]) {
				set_input_value(input, /*$pValue*/ ctx[1]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (27:0) <FormValidation {form}>
function create_default_slot$7(ctx) {
	let h1;
	let t1;
	let t2;
	let t3;
	let current;

	const forminput0 = new Form_input({
			props: {
				errors: /*lErrors*/ ctx[2],
				label: "Логин",
				$$slots: { default: [create_default_slot_2$2] },
				$$scope: { ctx }
			}
		});

	const forminput1 = new Form_input({
			props: {
				errors: /*pErrors*/ ctx[5],
				label: "Пароль",
				$$slots: { default: [create_default_slot_1$2] },
				$$scope: { ctx }
			}
		});

	const button = new Button({ props: { text: "Войти", type: "submit" } });

	return {
		c() {
			h1 = element("h1");
			h1.textContent = "Вход";
			t1 = space();
			create_component(forminput0.$$.fragment);
			t2 = space();
			create_component(forminput1.$$.fragment);
			t3 = space();
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			insert(target, h1, anchor);
			insert(target, t1, anchor);
			mount_component(forminput0, target, anchor);
			insert(target, t2, anchor);
			mount_component(forminput1, target, anchor);
			insert(target, t3, anchor);
			mount_component(button, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const forminput0_changes = {};

			if (dirty & /*$$scope, $lValue*/ 4097) {
				forminput0_changes.$$scope = { dirty, ctx };
			}

			forminput0.$set(forminput0_changes);
			const forminput1_changes = {};

			if (dirty & /*$$scope, $pValue*/ 4098) {
				forminput1_changes.$$scope = { dirty, ctx };
			}

			forminput1.$set(forminput1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(forminput0.$$.fragment, local);
			transition_in(forminput1.$$.fragment, local);
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(forminput0.$$.fragment, local);
			transition_out(forminput1.$$.fragment, local);
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(h1);
			if (detaching) detach(t1);
			destroy_component(forminput0, detaching);
			if (detaching) detach(t2);
			destroy_component(forminput1, detaching);
			if (detaching) detach(t3);
			destroy_component(button, detaching);
		}
	};
}

function create_fragment$s(ctx) {
	let current;

	const formvalidation = new Form_validation({
			props: {
				form: /*form*/ ctx[8],
				$$slots: { default: [create_default_slot$7] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formvalidation.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formvalidation, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const formvalidation_changes = {};

			if (dirty & /*$$scope, $pValue, $lValue*/ 4099) {
				formvalidation_changes.$$scope = { dirty, ctx };
			}

			formvalidation.$set(formvalidation_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formvalidation.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formvalidation.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formvalidation, detaching);
		}
	};
}

function instance$s($$self, $$props, $$invalidate) {
	let $lValue;
	let $pValue;

	const callback = values => {
		loadInitialData({ payload: { login: values } });
	};

	let { entries: { login: [lErrors, lValue, lInput], password: [pErrors, pValue, pInput] }, form } = createValidation$1({ scheme: ["login", "password"] }, callback);
	component_subscribe($$self, lValue, value => $$invalidate(0, $lValue = value));
	component_subscribe($$self, pValue, value => $$invalidate(1, $pValue = value));

	function input_input_handler() {
		$lValue = this.value;
		lValue.set($lValue);
	}

	function input_input_handler_1() {
		$pValue = this.value;
		pValue.set($pValue);
	}

	return [
		$lValue,
		$pValue,
		lErrors,
		lValue,
		lInput,
		pErrors,
		pValue,
		pInput,
		form,
		callback,
		input_input_handler,
		input_input_handler_1
	];
}

class Auth_login extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$s, create_fragment$s, safe_not_equal, {});
	}
}

/* src/views/auth/auth-registration.svelte generated by Svelte v3.19.1 */

function create_default_slot_3$1(ctx) {
	let input;
	let lInput_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$lValue*/ ctx[0]);

			dispose = [
				listen(input, "input", /*input_input_handler*/ ctx[15]),
				action_destroyer(lInput_action = /*lInput*/ ctx[5].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty & /*$lValue*/ 1 && input.value !== /*$lValue*/ ctx[0]) {
				set_input_value(input, /*$lValue*/ ctx[0]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (35:2) <FormInput errors={pErrors} label="Пароль">
function create_default_slot_2$3(ctx) {
	let input;
	let pInput_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "password");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$pValue*/ ctx[1]);

			dispose = [
				listen(input, "input", /*input_input_handler_1*/ ctx[16]),
				action_destroyer(pInput_action = /*pInput*/ ctx[8].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty & /*$pValue*/ 2 && input.value !== /*$pValue*/ ctx[1]) {
				set_input_value(input, /*$pValue*/ ctx[1]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (38:2) <FormInput errors={mErrors} label="Сложите eins и четыре">
function create_default_slot_1$3(ctx) {
	let input;
	let input_updating = false;
	let mInput_action;
	let dispose;

	function input_input_handler_2() {
		input_updating = true;
		/*input_input_handler_2*/ ctx[17].call(input);
	}

	return {
		c() {
			input = element("input");
			attr(input, "type", "number");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$mValue*/ ctx[2]);

			dispose = [
				listen(input, "input", input_input_handler_2),
				action_destroyer(mInput_action = /*mInput*/ ctx[11].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (!input_updating && dirty & /*$mValue*/ 4) {
				set_input_value(input, /*$mValue*/ ctx[2]);
			}

			input_updating = false;
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (30:0) <FormValidation {form}>
function create_default_slot$8(ctx) {
	let h1;
	let t1;
	let t2;
	let t3;
	let t4;
	let current;

	const forminput0 = new Form_input({
			props: {
				errors: /*lErrors*/ ctx[3],
				label: "Логин",
				$$slots: { default: [create_default_slot_3$1] },
				$$scope: { ctx }
			}
		});

	const forminput1 = new Form_input({
			props: {
				errors: /*pErrors*/ ctx[6],
				label: "Пароль",
				$$slots: { default: [create_default_slot_2$3] },
				$$scope: { ctx }
			}
		});

	const forminput2 = new Form_input({
			props: {
				errors: /*mErrors*/ ctx[9],
				label: "Сложите eins и четыре",
				$$slots: { default: [create_default_slot_1$3] },
				$$scope: { ctx }
			}
		});

	const button = new Button({
			props: { text: "Готово", type: "submit" }
		});

	return {
		c() {
			h1 = element("h1");
			h1.textContent = "Регистрация";
			t1 = space();
			create_component(forminput0.$$.fragment);
			t2 = space();
			create_component(forminput1.$$.fragment);
			t3 = space();
			create_component(forminput2.$$.fragment);
			t4 = space();
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			insert(target, h1, anchor);
			insert(target, t1, anchor);
			mount_component(forminput0, target, anchor);
			insert(target, t2, anchor);
			mount_component(forminput1, target, anchor);
			insert(target, t3, anchor);
			mount_component(forminput2, target, anchor);
			insert(target, t4, anchor);
			mount_component(button, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const forminput0_changes = {};

			if (dirty & /*$$scope, $lValue*/ 262145) {
				forminput0_changes.$$scope = { dirty, ctx };
			}

			forminput0.$set(forminput0_changes);
			const forminput1_changes = {};

			if (dirty & /*$$scope, $pValue*/ 262146) {
				forminput1_changes.$$scope = { dirty, ctx };
			}

			forminput1.$set(forminput1_changes);
			const forminput2_changes = {};

			if (dirty & /*$$scope, $mValue*/ 262148) {
				forminput2_changes.$$scope = { dirty, ctx };
			}

			forminput2.$set(forminput2_changes);
		},
		i(local) {
			if (current) return;
			transition_in(forminput0.$$.fragment, local);
			transition_in(forminput1.$$.fragment, local);
			transition_in(forminput2.$$.fragment, local);
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(forminput0.$$.fragment, local);
			transition_out(forminput1.$$.fragment, local);
			transition_out(forminput2.$$.fragment, local);
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(h1);
			if (detaching) detach(t1);
			destroy_component(forminput0, detaching);
			if (detaching) detach(t2);
			destroy_component(forminput1, detaching);
			if (detaching) detach(t3);
			destroy_component(forminput2, detaching);
			if (detaching) detach(t4);
			destroy_component(button, detaching);
		}
	};
}

function create_fragment$t(ctx) {
	let current;

	const formvalidation = new Form_validation({
			props: {
				form: /*form*/ ctx[12],
				$$slots: { default: [create_default_slot$8] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formvalidation.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formvalidation, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const formvalidation_changes = {};

			if (dirty & /*$$scope, $mValue, $pValue, $lValue*/ 262151) {
				formvalidation_changes.$$scope = { dirty, ctx };
			}

			formvalidation.$set(formvalidation_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formvalidation.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formvalidation.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formvalidation, detaching);
		}
	};
}

function instance$t($$self, $$props, $$invalidate) {
	let $lValue;
	let $pValue;
	let $mValue;
	const dispatch = createEventDispatcher();

	const callback = values => {
		request({ api: "registerUser", payload: values }).then(response => {
			if (response) {
				dispatch("done");
			}
		});
	};

	let { entries: { login: [lErrors, lValue, lInput], password: [pErrors, pValue, pInput], mcnulty: [mErrors, mValue, mInput] }, form } = createValidation$1({ scheme: ["login", "password", "mcnulty"] }, callback);
	component_subscribe($$self, lValue, value => $$invalidate(0, $lValue = value));
	component_subscribe($$self, pValue, value => $$invalidate(1, $pValue = value));
	component_subscribe($$self, mValue, value => $$invalidate(2, $mValue = value));

	function input_input_handler() {
		$lValue = this.value;
		lValue.set($lValue);
	}

	function input_input_handler_1() {
		$pValue = this.value;
		pValue.set($pValue);
	}

	function input_input_handler_2() {
		$mValue = to_number(this.value);
		mValue.set($mValue);
	}

	return [
		$lValue,
		$pValue,
		$mValue,
		lErrors,
		lValue,
		lInput,
		pErrors,
		pValue,
		pInput,
		mErrors,
		mValue,
		mInput,
		form,
		dispatch,
		callback,
		input_input_handler,
		input_input_handler_1,
		input_input_handler_2
	];
}

class Auth_registration extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$t, create_fragment$t, safe_not_equal, {});
	}
}

/* src/views/auth/auth.svelte generated by Svelte v3.19.1 */

function create_else_block$5(ctx) {
	let current;
	const registration = new Auth_registration({});
	registration.$on("done", /*done_handler*/ ctx[1]);

	return {
		c() {
			create_component(registration.$$.fragment);
		},
		m(target, anchor) {
			mount_component(registration, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(registration.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(registration.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(registration, detaching);
		}
	};
}

// (10:2) {#if !regMode}
function create_if_block$h(ctx) {
	let current;
	const login = new Auth_login({});

	return {
		c() {
			create_component(login.$$.fragment);
		},
		m(target, anchor) {
			mount_component(login, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(login.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(login.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(login, detaching);
		}
	};
}

function create_fragment$u(ctx) {
	let div;
	let current_block_type_index;
	let if_block;
	let t;
	let current;
	const if_block_creators = [create_if_block$h, create_else_block$5];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*regMode*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const button = new Button({
			props: {
				text: /*regMode*/ ctx[0] ? "Вход" : "Регистрация"
			}
		});

	button.$on("click", /*click_handler*/ ctx[2]);

	return {
		c() {
			div = element("div");
			if_block.c();
			t = space();
			create_component(button.$$.fragment);
			attr(div, "class", "form-auth");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if_blocks[current_block_type_index].m(div, null);
			append(div, t);
			mount_component(button, div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(div, t);
			}

			const button_changes = {};
			if (dirty & /*regMode*/ 1) button_changes.text = /*regMode*/ ctx[0] ? "Вход" : "Регистрация";
			button.$set(button_changes);
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if_blocks[current_block_type_index].d();
			destroy_component(button);
		}
	};
}

function instance$u($$self, $$props, $$invalidate) {
	let regMode = false;
	const done_handler = () => $$invalidate(0, regMode = false);
	const click_handler = () => $$invalidate(0, regMode = !regMode);
	return [regMode, done_handler, click_handler];
}

class Auth extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$u, create_fragment$u, safe_not_equal, {});
	}
}

/* src/views/sync/sync.svelte generated by Svelte v3.19.1 */

function add_css$o() {
	var style = element("style");
	style.id = "svelte-1p9u3is-style";
	style.textContent = ".box.svelte-1p9u3is.svelte-1p9u3is{background:#fff;box-shadow:0 0 3px #000;border-radius:5px;margin-bottom:20px;padding:10px}.box.form.svelte-1p9u3is.svelte-1p9u3is{background:linear-gradient(to bottom, #b7d8f4, #fff)\r\n  }.box.svelte-1p9u3is .error.svelte-1p9u3is{color:#db2123;margin-bottom:10px}.box.svelte-1p9u3is.svelte-1p9u3is,.sync.svelte-1p9u3is.svelte-1p9u3is .button{margin-bottom:10px}.sync.svelte-1p9u3is.svelte-1p9u3is>.button:last-child,.sync.svelte-1p9u3is.svelte-1p9u3is form + .button{margin-bottom:0}h2.svelte-1p9u3is.svelte-1p9u3is{margin-bottom:10px}h2.svelte-1p9u3is.svelte-1p9u3is:only-child{margin-bottom:0}";
	append(document.head, style);
}

// (33:2) {:else}
function create_else_block$6(ctx) {
	let current;
	const button = new Button({ props: { text: "выйти", color: "red" } });
	button.$on("click", /*onLogout*/ ctx[5]);

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

// (28:2) {#if !$user.userId}
function create_if_block_6(ctx) {
	let div;
	let p;
	let t1;
	let current;
	const auth = new Auth({});

	return {
		c() {
			div = element("div");
			p = element("p");
			p.textContent = "Войдите в свой аккаунт, чтобы не потерять свои слова";
			t1 = space();
			create_component(auth.$$.fragment);
			attr(p, "class", "error svelte-1p9u3is");
			attr(div, "class", "box form svelte-1p9u3is");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, p);
			append(div, t1);
			mount_component(auth, div, null);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(auth.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(auth.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(auth);
		}
	};
}

// (58:2) {#if $sync && sync.syncRequired()}
function create_if_block$i(ctx) {
	let t;
	let if_block1_anchor;
	let current;
	let if_block0 = /*$user*/ ctx[2].userId && create_if_block_2$3();
	let if_block1 = false ;

	return {
		c() {
			if (if_block0) if_block0.c();
			t = space();
			if_block1_anchor = empty();
		},
		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t, anchor);
			insert(target, if_block1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*$user*/ ctx[2].userId) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_2$3();
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t.parentNode, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach(t);
			if (detaching) detach(if_block1_anchor);
		}
	};
}

// (59:4) {#if $user.userId}
function create_if_block_2$3(ctx) {
	let current;
	const button = new Button({ props: { text: "синхронизировать" } });
	button.$on("click", syncData);

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

function create_fragment$v(ctx) {
	let div2;
	let current_block_type_index;
	let if_block0;
	let t0;
	let div0;
	let h20;
	let t1;
	let t2_value = Object.keys(/*$words*/ ctx[1]).length + "";
	let t2;
	let t3;
	let t4;
	let div1;
	let h21;
	let t5;
	let t6_value = Object.keys(/*$categories*/ ctx[0]).length + "";
	let t6;
	let t7;
	let t8;
	let t9;
	let show_if = /*$sync*/ ctx[3] && store$2.syncRequired();
	let t10;
	let p;
	let current;
	const if_block_creators = [create_if_block_6, create_else_block$6];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*$user*/ ctx[2].userId) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	let if_block4 = show_if && create_if_block$i(ctx);

	return {
		c() {
			div2 = element("div");
			if_block0.c();
			t0 = space();
			div0 = element("div");
			h20 = element("h2");
			t1 = text("Слов: ");
			t2 = text(t2_value);
			t3 = space();
			t4 = space();
			div1 = element("div");
			h21 = element("h2");
			t5 = text("Категорий: ");
			t6 = text(t6_value);
			t7 = space();
			t8 = space();
			t9 = space();
			if (if_block4) if_block4.c();
			t10 = space();
			p = element("p");
			p.textContent = `${1584738652043}`;
			attr(h20, "class", "svelte-1p9u3is");
			attr(div0, "class", "box svelte-1p9u3is");
			attr(h21, "class", "svelte-1p9u3is");
			attr(div1, "class", "box svelte-1p9u3is");
			attr(div2, "class", "sync svelte-1p9u3is");
		},
		m(target, anchor) {
			insert(target, div2, anchor);
			if_blocks[current_block_type_index].m(div2, null);
			append(div2, t0);
			append(div2, div0);
			append(div0, h20);
			append(h20, t1);
			append(h20, t2);
			append(div0, t3);
			append(div2, t4);
			append(div2, div1);
			append(div1, h21);
			append(h21, t5);
			append(h21, t6);
			append(div1, t7);
			append(div2, t8);
			append(div2, t9);
			if (if_block4) if_block4.m(div2, null);
			append(div2, t10);
			append(div2, p);
			current = true;
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block0 = if_blocks[current_block_type_index];

				if (!if_block0) {
					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block0.c();
				}

				transition_in(if_block0, 1);
				if_block0.m(div2, t0);
			}

			if ((!current || dirty & /*$words*/ 2) && t2_value !== (t2_value = Object.keys(/*$words*/ ctx[1]).length + "")) set_data(t2, t2_value);
			if ((!current || dirty & /*$categories*/ 1) && t6_value !== (t6_value = Object.keys(/*$categories*/ ctx[0]).length + "")) set_data(t6, t6_value);
			if (dirty & /*$sync*/ 8) show_if = /*$sync*/ ctx[3] && store$2.syncRequired();

			if (show_if) {
				if (if_block4) {
					if_block4.p(ctx, dirty);
					transition_in(if_block4, 1);
				} else {
					if_block4 = create_if_block$i(ctx);
					if_block4.c();
					transition_in(if_block4, 1);
					if_block4.m(div2, t10);
				}
			} else if (if_block4) {
				group_outros();

				transition_out(if_block4, 1, 1, () => {
					if_block4 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block4);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block4);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div2);
			if_blocks[current_block_type_index].d();
			if (if_block4) if_block4.d();
		}
	};
}

function instance$v($$self, $$props, $$invalidate) {
	let $categories;
	let $words;
	let $user;
	let $sync;
	component_subscribe($$self, store$5, $$value => $$invalidate(0, $categories = $$value));
	component_subscribe($$self, store$4, $$value => $$invalidate(1, $words = $$value));
	component_subscribe($$self, store$3, $$value => $$invalidate(2, $user = $$value));
	component_subscribe($$self, store$2, $$value => $$invalidate(3, $sync = $$value));

	const clearLocalData = () => {
		store$2.reset();
	};

	const onLogout = () => {
		if (confirm("Точно выйти?")) {
			// sync data then logout
			syncData().then(() => {
				request({ api: "logoutUser" }).then(() => {
					store$3.resetSetup();
					store$2.reset();
					set_store_value(store$5, $categories = {});
					set_store_value(store$4, $words = {});
				});
			});
		}
	};

	return [$categories, $words, $user, $sync, clearLocalData, onLogout];
}

class Sync extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1p9u3is-style")) add_css$o();
		init(this, options, instance$v, create_fragment$v, safe_not_equal, {});
	}
}

/* src/sdk/buttons-row/buttons-row.svelte generated by Svelte v3.19.1 */

function add_css$p() {
	var style = element("style");
	style.id = "svelte-fn64eb-style";
	style.textContent = ".buttons-row.svelte-fn64eb{border:1px solid #fff;border-radius:5px;display:flex;margin-bottom:10px;overflow:hidden}.error.svelte-fn64eb{border-color:#db2123}.buttons-row.svelte-fn64eb button{background:#b7d8f4;border:solid #fff;border-width:0 0 0 1px;flex:1;font-size:12px;line-height:14px;padding:15px 5px;text-align:center;text-transform:uppercase}.buttons-row.svelte-fn64eb button:first-child{border:0}.buttons-row.svelte-fn64eb button.active{background:#104b8a;color:#fff}.buttons-row.two-in-a-row.svelte-fn64eb{flex-wrap:wrap}.buttons-row.two-in-a-row.svelte-fn64eb button{border:0;flex:1 0 50%}.buttons-row.two-in-a-row.svelte-fn64eb button:nth-child(2n){border-left:1px solid #fff}.buttons-row.two-in-a-row.svelte-fn64eb button:nth-child(2n + 3),.buttons-row.two-in-a-row.svelte-fn64eb button:nth-child(2n + 4){border-top:1px solid #fff}";
	append(document.head, style);
}

function create_fragment$w(ctx) {
	let div;
	let div_class_value;
	let current;
	const default_slot_template = /*$$slots*/ ctx[4].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

	return {
		c() {
			div = element("div");
			if (default_slot) default_slot.c();
			attr(div, "class", div_class_value = "buttons-row " + (/*className*/ ctx[0] || "") + " svelte-fn64eb");
			toggle_class(div, "two-in-a-row", /*twoInARow*/ ctx[1]);
			toggle_class(div, "error", /*error*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (default_slot && default_slot.p && dirty & /*$$scope*/ 8) {
				default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[3], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null));
			}

			if (!current || dirty & /*className*/ 1 && div_class_value !== (div_class_value = "buttons-row " + (/*className*/ ctx[0] || "") + " svelte-fn64eb")) {
				attr(div, "class", div_class_value);
			}

			if (dirty & /*className, twoInARow*/ 3) {
				toggle_class(div, "two-in-a-row", /*twoInARow*/ ctx[1]);
			}

			if (dirty & /*className, error*/ 5) {
				toggle_class(div, "error", /*error*/ ctx[2]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},
		o(local) {
			transition_out(default_slot, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (default_slot) default_slot.d(detaching);
		}
	};
}

function instance$w($$self, $$props, $$invalidate) {
	let { className = "" } = $$props;
	let { twoInARow = false } = $$props;
	let { error = false } = $$props;
	let { $$slots = {}, $$scope } = $$props;

	$$self.$set = $$props => {
		if ("className" in $$props) $$invalidate(0, className = $$props.className);
		if ("twoInARow" in $$props) $$invalidate(1, twoInARow = $$props.twoInARow);
		if ("error" in $$props) $$invalidate(2, error = $$props.error);
		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
	};

	return [className, twoInARow, error, $$scope, $$slots];
}

class Buttons_row extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-fn64eb-style")) add_css$p();
		init(this, options, instance$w, create_fragment$w, safe_not_equal, { className: 0, twoInARow: 1, error: 2 });
	}
}

/* src/views/words/words-categories.svelte generated by Svelte v3.19.1 */

function add_css$q() {
	var style = element("style");
	style.id = "svelte-1g28u9v-style";
	style.textContent = ".wrap.svelte-1g28u9v{border:dashed #b7d8f4;border-width:1px 0;margin-bottom:10px;padding:20px 0}.active.svelte-1g28u9v{padding-bottom:10px}.wrap.svelte-1g28u9v .form-input{margin:10px 0 0}.wrap.svelte-1g28u9v .form-switcher{margin-bottom:0}.flex.svelte-1g28u9v{display:flex;margin-right:-10px}.wrap.svelte-1g28u9v .button{margin-top:10px}";
	append(document.head, style);
}

function get_each_context$5(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[13] = list[i].categoryName;
	child_ctx[14] = list[i].categoryId;
	return child_ctx;
}

// (40:2) <FormSwitcher type="toggle" bind:checked={active}>
function create_default_slot_3$2(ctx) {
	let t;

	return {
		c() {
			t = text("Добавить слово в категорию");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (51:4) {:else}
function create_else_block$7(ctx) {
	let current;

	const button = new Button({
			props: { text: "создать категорию", icon: "plus" }
		});

	button.$on("click", /*click_handler_1*/ ctx[10]);

	return {
		c() {
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			mount_component(button, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(button, detaching);
		}
	};
}

// (43:4) {#if formView}
function create_if_block$j(ctx) {
	let t0;
	let div;
	let t1;
	let current;

	const forminput = new Form_input({
			props: {
				label: "Имя категории",
				$$slots: { default: [create_default_slot_2$4] },
				$$scope: { ctx }
			}
		});

	const button0 = new Button({ props: { text: "создать" } });
	button0.$on("click", /*onCategoryAdd*/ ctx[5]);
	const button1 = new Button({ props: { text: "отменить" } });
	button1.$on("click", /*click_handler*/ ctx[9]);

	return {
		c() {
			create_component(forminput.$$.fragment);
			t0 = space();
			div = element("div");
			create_component(button0.$$.fragment);
			t1 = space();
			create_component(button1.$$.fragment);
			attr(div, "class", "flex svelte-1g28u9v");
		},
		m(target, anchor) {
			mount_component(forminput, target, anchor);
			insert(target, t0, anchor);
			insert(target, div, anchor);
			mount_component(button0, div, null);
			append(div, t1);
			mount_component(button1, div, null);
			current = true;
		},
		p(ctx, dirty) {
			const forminput_changes = {};

			if (dirty & /*$$scope, newCategoryName*/ 131088) {
				forminput_changes.$$scope = { dirty, ctx };
			}

			forminput.$set(forminput_changes);
		},
		i(local) {
			if (current) return;
			transition_in(forminput.$$.fragment, local);
			transition_in(button0.$$.fragment, local);
			transition_in(button1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(forminput.$$.fragment, local);
			transition_out(button0.$$.fragment, local);
			transition_out(button1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(forminput, detaching);
			if (detaching) detach(t0);
			if (detaching) detach(div);
			destroy_component(button0);
			destroy_component(button1);
		}
	};
}

// (44:6) <FormInput label="Имя категории">
function create_default_slot_2$4(ctx) {
	let input;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*newCategoryName*/ ctx[4]);
			dispose = listen(input, "input", /*input_input_handler*/ ctx[8]);
		},
		p(ctx, dirty) {
			if (dirty & /*newCategoryName*/ 16 && input.value !== /*newCategoryName*/ ctx[4]) {
				set_input_value(input, /*newCategoryName*/ ctx[4]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			dispose();
		}
	};
}

// (56:6) <Category {categoryName}>
function create_default_slot_1$4(ctx) {
	let input;
	let input_value_value;
	let t;
	let dispose;

	return {
		c() {
			input = element("input");
			t = space();
			attr(input, "type", "checkbox");
			input.__value = input_value_value = /*categoryId*/ ctx[14];
			input.value = input.__value;
			/*$$binding_groups*/ ctx[12][0].push(input);
		},
		m(target, anchor) {
			insert(target, input, anchor);
			input.checked = ~/*linked*/ ctx[0].indexOf(input.__value);
			insert(target, t, anchor);
			dispose = listen(input, "change", /*input_change_handler*/ ctx[11]);
		},
		p(ctx, dirty) {
			if (dirty & /*categories*/ 4 && input_value_value !== (input_value_value = /*categoryId*/ ctx[14])) {
				input.__value = input_value_value;
			}

			input.value = input.__value;

			if (dirty & /*linked*/ 1) {
				input.checked = ~/*linked*/ ctx[0].indexOf(input.__value);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			/*$$binding_groups*/ ctx[12][0].splice(/*$$binding_groups*/ ctx[12][0].indexOf(input), 1);
			if (detaching) detach(t);
			dispose();
		}
	};
}

// (55:4) {#each categories as { categoryName, categoryId }
function create_each_block$5(key_1, ctx) {
	let first;
	let current;

	const category = new Category({
			props: {
				categoryName: /*categoryName*/ ctx[13],
				$$slots: { default: [create_default_slot_1$4] },
				$$scope: { ctx }
			}
		});

	return {
		key: key_1,
		first: null,
		c() {
			first = empty();
			create_component(category.$$.fragment);
			this.first = first;
		},
		m(target, anchor) {
			insert(target, first, anchor);
			mount_component(category, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const category_changes = {};
			if (dirty & /*categories*/ 4) category_changes.categoryName = /*categoryName*/ ctx[13];

			if (dirty & /*$$scope, categories, linked*/ 131077) {
				category_changes.$$scope = { dirty, ctx };
			}

			category.$set(category_changes);
		},
		i(local) {
			if (current) return;
			transition_in(category.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(category.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(first);
			destroy_component(category, detaching);
		}
	};
}

// (42:2) <Slide active={active}>
function create_default_slot$9(ctx) {
	let current_block_type_index;
	let if_block;
	let t;
	let each_blocks = [];
	let each_1_lookup = new Map();
	let each_1_anchor;
	let current;
	const if_block_creators = [create_if_block$j, create_else_block$7];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*formView*/ ctx[3]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	let each_value = /*categories*/ ctx[2];
	const get_key = ctx => /*categoryId*/ ctx[14];

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$5(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
	}

	return {
		c() {
			if_block.c();
			t = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert(target, t, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert(target, each_1_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				}

				transition_in(if_block, 1);
				if_block.m(t.parentNode, t);
			}

			if (dirty & /*categories, linked*/ 5) {
				const each_value = /*categories*/ ctx[2];
				group_outros();
				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, outro_and_destroy_block, create_each_block$5, each_1_anchor, get_each_context$5);
				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			transition_out(if_block);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach(t);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (detaching) detach(each_1_anchor);
		}
	};
}

function create_fragment$x(ctx) {
	let div;
	let updating_checked;
	let t;
	let current;

	function formswitcher_checked_binding(value) {
		/*formswitcher_checked_binding*/ ctx[7].call(null, value);
	}

	let formswitcher_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_3$2] },
		$$scope: { ctx }
	};

	if (/*active*/ ctx[1] !== void 0) {
		formswitcher_props.checked = /*active*/ ctx[1];
	}

	const formswitcher = new Form_switcher({ props: formswitcher_props });
	binding_callbacks.push(() => bind(formswitcher, "checked", formswitcher_checked_binding));

	const slide = new Slide({
			props: {
				active: /*active*/ ctx[1],
				$$slots: { default: [create_default_slot$9] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			div = element("div");
			create_component(formswitcher.$$.fragment);
			t = space();
			create_component(slide.$$.fragment);
			attr(div, "class", "wrap svelte-1g28u9v");
			toggle_class(div, "active", /*active*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			mount_component(formswitcher, div, null);
			append(div, t);
			mount_component(slide, div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			const formswitcher_changes = {};

			if (dirty & /*$$scope*/ 131072) {
				formswitcher_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty & /*active*/ 2) {
				updating_checked = true;
				formswitcher_changes.checked = /*active*/ ctx[1];
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher.$set(formswitcher_changes);
			const slide_changes = {};
			if (dirty & /*active*/ 2) slide_changes.active = /*active*/ ctx[1];

			if (dirty & /*$$scope, categories, linked, formView, newCategoryName*/ 131101) {
				slide_changes.$$scope = { dirty, ctx };
			}

			slide.$set(slide_changes);

			if (dirty & /*active*/ 2) {
				toggle_class(div, "active", /*active*/ ctx[1]);
			}
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher.$$.fragment, local);
			transition_in(slide.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher.$$.fragment, local);
			transition_out(slide.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_component(formswitcher);
			destroy_component(slide);
		}
	};
}

function instance$x($$self, $$props, $$invalidate) {
	let $categoriesStore;
	component_subscribe($$self, store$5, $$value => $$invalidate(6, $categoriesStore = $$value));
	let { linked } = $$props;
	let { active } = $$props;
	let categories;
	let formView = false;
	let newCategoryName = "";

	const onCategoryAdd = () => {
		if (!newCategoryName) {
			return;
		}

		$$invalidate(4, newCategoryName = newCategoryName.toLowerCase());
		const existedCatyName = categories.find(c => c.categoryName === newCategoryName);

		if (!existedCatyName && newCategoryName.length <= 100) {
			const newCat = { categoryName: newCategoryName };
			store$5.updateCategory(newCat);
			$$invalidate(0, linked = [...linked, store$5.getCategoryIdByName(newCategoryName)]);
		} else if (linked.indexOf(existedCatyName.categoryId) === -1) {
			$$invalidate(0, linked = [...linked, existedCatyName.categoryId]);
		}

		$$invalidate(4, newCategoryName = "");
		$$invalidate(3, formView = false);
	};

	const $$binding_groups = [[]];

	function formswitcher_checked_binding(value) {
		active = value;
		$$invalidate(1, active);
	}

	function input_input_handler() {
		newCategoryName = this.value;
		$$invalidate(4, newCategoryName);
	}

	const click_handler = () => $$invalidate(3, formView = false);
	const click_handler_1 = () => $$invalidate(3, formView = true);

	function input_change_handler() {
		linked = get_binding_group_value($$binding_groups[0]);
		$$invalidate(0, linked);
	}

	$$self.$set = $$props => {
		if ("linked" in $$props) $$invalidate(0, linked = $$props.linked);
		if ("active" in $$props) $$invalidate(1, active = $$props.active);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$categoriesStore*/ 64) {
			 $$invalidate(2, categories = Object.values($categoriesStore));
		}
	};

	return [
		linked,
		active,
		categories,
		formView,
		newCategoryName,
		onCategoryAdd,
		$categoriesStore,
		formswitcher_checked_binding,
		input_input_handler,
		click_handler,
		click_handler_1,
		input_change_handler,
		$$binding_groups
	];
}

class Words_categories extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1g28u9v-style")) add_css$q();
		init(this, options, instance$x, create_fragment$x, safe_not_equal, { linked: 0, active: 1 });
	}
}

/* src/views/words/word.svelte generated by Svelte v3.19.1 */

function create_if_block_4(ctx) {
	let current;

	const buttonsrow = new Buttons_row({
			props: {
				twoInARow: true,
				$$slots: { default: [create_default_slot_17$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(buttonsrow.$$.fragment);
		},
		m(target, anchor) {
			mount_component(buttonsrow, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const buttonsrow_changes = {};

			if (dirty[0] & /*$typeValue*/ 32 | dirty[2] & /*$$scope*/ 4194304) {
				buttonsrow_changes.$$scope = { dirty, ctx };
			}

			buttonsrow.$set(buttonsrow_changes);
		},
		i(local) {
			if (current) return;
			transition_in(buttonsrow.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(buttonsrow.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(buttonsrow, detaching);
		}
	};
}

// (100:4) <ButtonsRow twoInARow>
function create_default_slot_17$1(ctx) {
	let button0;
	let t1;
	let button1;
	let t3;
	let button2;
	let t5;
	let button3;
	let dispose;

	return {
		c() {
			button0 = element("button");
			button0.textContent = "Существ.";
			t1 = space();
			button1 = element("button");
			button1.textContent = "Глагол";
			t3 = space();
			button2 = element("button");
			button2.textContent = "Фраза";
			t5 = space();
			button3 = element("button");
			button3.textContent = "Другое";
			toggle_class(button0, "active", /*$typeValue*/ ctx[5] === "noun");
			toggle_class(button1, "active", /*$typeValue*/ ctx[5] === "verb");
			toggle_class(button2, "active", /*$typeValue*/ ctx[5] === "phrase");
			toggle_class(button3, "active", /*$typeValue*/ ctx[5] === "other");
		},
		m(target, anchor) {
			insert(target, button0, anchor);
			insert(target, t1, anchor);
			insert(target, button1, anchor);
			insert(target, t3, anchor);
			insert(target, button2, anchor);
			insert(target, t5, anchor);
			insert(target, button3, anchor);

			dispose = [
				listen(button0, "click", prevent_default(/*click_handler*/ ctx[62])),
				listen(button1, "click", prevent_default(/*click_handler_1*/ ctx[63])),
				listen(button2, "click", prevent_default(/*click_handler_2*/ ctx[64])),
				listen(button3, "click", prevent_default(/*click_handler_3*/ ctx[65]))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$typeValue*/ 32) {
				toggle_class(button0, "active", /*$typeValue*/ ctx[5] === "noun");
			}

			if (dirty[0] & /*$typeValue*/ 32) {
				toggle_class(button1, "active", /*$typeValue*/ ctx[5] === "verb");
			}

			if (dirty[0] & /*$typeValue*/ 32) {
				toggle_class(button2, "active", /*$typeValue*/ ctx[5] === "phrase");
			}

			if (dirty[0] & /*$typeValue*/ 32) {
				toggle_class(button3, "active", /*$typeValue*/ ctx[5] === "other");
			}
		},
		d(detaching) {
			if (detaching) detach(button0);
			if (detaching) detach(t1);
			if (detaching) detach(button1);
			if (detaching) detach(t3);
			if (detaching) detach(button2);
			if (detaching) detach(t5);
			if (detaching) detach(button3);
			run_all(dispose);
		}
	};
}

// (108:2) {#if $typeValue}
function create_if_block$k(ctx) {
	let current;

	const formvalidation = new Form_validation({
			props: {
				form: /*form*/ ctx[18],
				$$slots: { default: [create_default_slot$a] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formvalidation.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formvalidation, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formvalidation_changes = {};

			if (dirty[0] & /*linkedCategories, categoriesActive, irregularVerb, $irregular2Value, $irregular1Value, strongVerb, $strong6Value, $strong5Value, $strong4Value, $strong3Value, $strong2Value, $strong1Value, $typeValue, $pluralValue, $trValue, $origValue, $articleValue*/ 131071 | dirty[2] & /*$$scope*/ 4194304) {
				formvalidation_changes.$$scope = { dirty, ctx };
			}

			formvalidation.$set(formvalidation_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formvalidation.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formvalidation.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formvalidation, detaching);
		}
	};
}

// (110:6) {#if $typeValue === 'noun'}
function create_if_block_3$2(ctx) {
	let current;

	const buttonsrow = new Buttons_row({
			props: {
				error: !/*$articleValue*/ ctx[4],
				$$slots: { default: [create_default_slot_16$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(buttonsrow.$$.fragment);
		},
		m(target, anchor) {
			mount_component(buttonsrow, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const buttonsrow_changes = {};
			if (dirty[0] & /*$articleValue*/ 16) buttonsrow_changes.error = !/*$articleValue*/ ctx[4];

			if (dirty[0] & /*$articleValue*/ 16 | dirty[2] & /*$$scope*/ 4194304) {
				buttonsrow_changes.$$scope = { dirty, ctx };
			}

			buttonsrow.$set(buttonsrow_changes);
		},
		i(local) {
			if (current) return;
			transition_in(buttonsrow.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(buttonsrow.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(buttonsrow, detaching);
		}
	};
}

// (111:8) <ButtonsRow error={!$articleValue}>
function create_default_slot_16$1(ctx) {
	let button0;
	let t1;
	let button1;
	let t3;
	let button2;
	let dispose;

	return {
		c() {
			button0 = element("button");
			button0.textContent = "der";
			t1 = space();
			button1 = element("button");
			button1.textContent = "die";
			t3 = space();
			button2 = element("button");
			button2.textContent = "das";
			toggle_class(button0, "active", /*$articleValue*/ ctx[4] === "der");
			toggle_class(button1, "active", /*$articleValue*/ ctx[4] === "die");
			toggle_class(button2, "active", /*$articleValue*/ ctx[4] === "das");
		},
		m(target, anchor) {
			insert(target, button0, anchor);
			insert(target, t1, anchor);
			insert(target, button1, anchor);
			insert(target, t3, anchor);
			insert(target, button2, anchor);

			dispose = [
				listen(button0, "click", prevent_default(/*click_handler_4*/ ctx[66])),
				listen(button1, "click", prevent_default(/*click_handler_5*/ ctx[67])),
				listen(button2, "click", prevent_default(/*click_handler_6*/ ctx[68]))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$articleValue*/ 16) {
				toggle_class(button0, "active", /*$articleValue*/ ctx[4] === "der");
			}

			if (dirty[0] & /*$articleValue*/ 16) {
				toggle_class(button1, "active", /*$articleValue*/ ctx[4] === "die");
			}

			if (dirty[0] & /*$articleValue*/ 16) {
				toggle_class(button2, "active", /*$articleValue*/ ctx[4] === "das");
			}
		},
		d(detaching) {
			if (detaching) detach(button0);
			if (detaching) detach(t1);
			if (detaching) detach(button1);
			if (detaching) detach(t3);
			if (detaching) detach(button2);
			run_all(dispose);
		}
	};
}

// (118:6) <FormInput errors={origErrors} label={$typeValue === 'phrase' ? 'Фраза' : 'Слово'}>
function create_default_slot_15$1(ctx) {
	let input;
	let origInput_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$origValue*/ ctx[6]);

			dispose = [
				listen(input, "input", /*input_input_handler*/ ctx[69]),
				action_destroyer(origInput_action = /*origInput*/ ctx[22].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$origValue*/ 64 && input.value !== /*$origValue*/ ctx[6]) {
				set_input_value(input, /*$origValue*/ ctx[6]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (122:6) <FormInput errors={trErrors} label="Перевод">
function create_default_slot_14$1(ctx) {
	let input;
	let trInput_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$trValue*/ ctx[7]);

			dispose = [
				listen(input, "input", /*input_input_handler_1*/ ctx[70]),
				action_destroyer(trInput_action = /*trInput*/ ctx[25].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$trValue*/ 128 && input.value !== /*$trValue*/ ctx[7]) {
				set_input_value(input, /*$trValue*/ ctx[7]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (126:6) {#if $typeValue === 'noun'}
function create_if_block_2$4(ctx) {
	let current;

	const forminput = new Form_input({
			props: {
				errors: /*pluralErrors*/ ctx[26],
				label: "Plural",
				$$slots: { default: [create_default_slot_13$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(forminput.$$.fragment);
		},
		m(target, anchor) {
			mount_component(forminput, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const forminput_changes = {};

			if (dirty[0] & /*$pluralValue*/ 256 | dirty[2] & /*$$scope*/ 4194304) {
				forminput_changes.$$scope = { dirty, ctx };
			}

			forminput.$set(forminput_changes);
		},
		i(local) {
			if (current) return;
			transition_in(forminput.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(forminput.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(forminput, detaching);
		}
	};
}

// (127:8) <FormInput errors={pluralErrors} label="Plural">
function create_default_slot_13$1(ctx) {
	let input;
	let pluralInput_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$pluralValue*/ ctx[8]);

			dispose = [
				listen(input, "input", /*input_input_handler_2*/ ctx[71]),
				action_destroyer(pluralInput_action = /*pluralInput*/ ctx[28].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$pluralValue*/ 256 && input.value !== /*$pluralValue*/ ctx[8]) {
				set_input_value(input, /*$pluralValue*/ ctx[8]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (132:6) {#if $typeValue === 'verb'}
function create_if_block_1$a(ctx) {
	let updating_checked;
	let t0;
	let t1;
	let updating_checked_1;
	let t2;
	let current;

	function formswitcher0_checked_binding(value) {
		/*formswitcher0_checked_binding*/ ctx[72].call(null, value);
	}

	let formswitcher0_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_12$1] },
		$$scope: { ctx }
	};

	if (/*strongVerb*/ ctx[1] !== void 0) {
		formswitcher0_props.checked = /*strongVerb*/ ctx[1];
	}

	const formswitcher0 = new Form_switcher({ props: formswitcher0_props });
	binding_callbacks.push(() => bind(formswitcher0, "checked", formswitcher0_checked_binding));

	const slide0 = new Slide({
			props: {
				active: /*strongVerb*/ ctx[1],
				$$slots: { default: [create_default_slot_5$1] },
				$$scope: { ctx }
			}
		});

	function formswitcher1_checked_binding(value) {
		/*formswitcher1_checked_binding*/ ctx[79].call(null, value);
	}

	let formswitcher1_props = {
		type: "toggle",
		$$slots: { default: [create_default_slot_4$1] },
		$$scope: { ctx }
	};

	if (/*irregularVerb*/ ctx[2] !== void 0) {
		formswitcher1_props.checked = /*irregularVerb*/ ctx[2];
	}

	const formswitcher1 = new Form_switcher({ props: formswitcher1_props });
	binding_callbacks.push(() => bind(formswitcher1, "checked", formswitcher1_checked_binding));

	const slide1 = new Slide({
			props: {
				active: /*irregularVerb*/ ctx[2],
				$$slots: { default: [create_default_slot_1$5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(formswitcher0.$$.fragment);
			t0 = space();
			create_component(slide0.$$.fragment);
			t1 = space();
			create_component(formswitcher1.$$.fragment);
			t2 = space();
			create_component(slide1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(formswitcher0, target, anchor);
			insert(target, t0, anchor);
			mount_component(slide0, target, anchor);
			insert(target, t1, anchor);
			mount_component(formswitcher1, target, anchor);
			insert(target, t2, anchor);
			mount_component(slide1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const formswitcher0_changes = {};

			if (dirty[2] & /*$$scope*/ 4194304) {
				formswitcher0_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked && dirty[0] & /*strongVerb*/ 2) {
				updating_checked = true;
				formswitcher0_changes.checked = /*strongVerb*/ ctx[1];
				add_flush_callback(() => updating_checked = false);
			}

			formswitcher0.$set(formswitcher0_changes);
			const slide0_changes = {};
			if (dirty[0] & /*strongVerb*/ 2) slide0_changes.active = /*strongVerb*/ ctx[1];

			if (dirty[0] & /*$strong6Value, $strong5Value, $strong4Value, $strong3Value, $strong2Value, $strong1Value*/ 32256 | dirty[2] & /*$$scope*/ 4194304) {
				slide0_changes.$$scope = { dirty, ctx };
			}

			slide0.$set(slide0_changes);
			const formswitcher1_changes = {};

			if (dirty[2] & /*$$scope*/ 4194304) {
				formswitcher1_changes.$$scope = { dirty, ctx };
			}

			if (!updating_checked_1 && dirty[0] & /*irregularVerb*/ 4) {
				updating_checked_1 = true;
				formswitcher1_changes.checked = /*irregularVerb*/ ctx[2];
				add_flush_callback(() => updating_checked_1 = false);
			}

			formswitcher1.$set(formswitcher1_changes);
			const slide1_changes = {};
			if (dirty[0] & /*irregularVerb*/ 4) slide1_changes.active = /*irregularVerb*/ ctx[2];

			if (dirty[0] & /*$irregular2Value, $irregular1Value*/ 98304 | dirty[2] & /*$$scope*/ 4194304) {
				slide1_changes.$$scope = { dirty, ctx };
			}

			slide1.$set(slide1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(formswitcher0.$$.fragment, local);
			transition_in(slide0.$$.fragment, local);
			transition_in(formswitcher1.$$.fragment, local);
			transition_in(slide1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(formswitcher0.$$.fragment, local);
			transition_out(slide0.$$.fragment, local);
			transition_out(formswitcher1.$$.fragment, local);
			transition_out(slide1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(formswitcher0, detaching);
			if (detaching) detach(t0);
			destroy_component(slide0, detaching);
			if (detaching) detach(t1);
			destroy_component(formswitcher1, detaching);
			if (detaching) detach(t2);
			destroy_component(slide1, detaching);
		}
	};
}

// (133:8) <FormSwitcher type="toggle" bind:checked={strongVerb}>
function create_default_slot_12$1(ctx) {
	let t;

	return {
		c() {
			t = text("Сильный глагол");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (136:10) <FormInput errors={strong1Errors} label="Ich">
function create_default_slot_11$1(ctx) {
	let input;
	let strong1Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$strong1Value*/ ctx[9]);

			dispose = [
				listen(input, "input", /*input_input_handler_3*/ ctx[73]),
				action_destroyer(strong1Input_action = /*strong1Input*/ ctx[33].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$strong1Value*/ 512 && input.value !== /*$strong1Value*/ ctx[9]) {
				set_input_value(input, /*$strong1Value*/ ctx[9]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (139:10) <FormInput errors={strong2Errors} label="du">
function create_default_slot_10$1(ctx) {
	let input;
	let strong2Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$strong2Value*/ ctx[10]);

			dispose = [
				listen(input, "input", /*input_input_handler_4*/ ctx[74]),
				action_destroyer(strong2Input_action = /*strong2Input*/ ctx[36].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$strong2Value*/ 1024 && input.value !== /*$strong2Value*/ ctx[10]) {
				set_input_value(input, /*$strong2Value*/ ctx[10]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (142:10) <FormInput errors={strong3Errors} label="er, sie, es">
function create_default_slot_9$1(ctx) {
	let input;
	let strong3Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$strong3Value*/ ctx[11]);

			dispose = [
				listen(input, "input", /*input_input_handler_5*/ ctx[75]),
				action_destroyer(strong3Input_action = /*strong3Input*/ ctx[39].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$strong3Value*/ 2048 && input.value !== /*$strong3Value*/ ctx[11]) {
				set_input_value(input, /*$strong3Value*/ ctx[11]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (145:10) <FormInput errors={strong4Errors} label="wir">
function create_default_slot_8$1(ctx) {
	let input;
	let strong4Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$strong4Value*/ ctx[12]);

			dispose = [
				listen(input, "input", /*input_input_handler_6*/ ctx[76]),
				action_destroyer(strong4Input_action = /*strong4Input*/ ctx[42].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$strong4Value*/ 4096 && input.value !== /*$strong4Value*/ ctx[12]) {
				set_input_value(input, /*$strong4Value*/ ctx[12]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (148:10) <FormInput errors={strong5Errors} label="ihr">
function create_default_slot_7$1(ctx) {
	let input;
	let strong5Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$strong5Value*/ ctx[13]);

			dispose = [
				listen(input, "input", /*input_input_handler_7*/ ctx[77]),
				action_destroyer(strong5Input_action = /*strong5Input*/ ctx[45].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$strong5Value*/ 8192 && input.value !== /*$strong5Value*/ ctx[13]) {
				set_input_value(input, /*$strong5Value*/ ctx[13]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (151:10) <FormInput errors={strong6Errors} label="Sie, sie">
function create_default_slot_6$1(ctx) {
	let input;
	let strong6Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$strong6Value*/ ctx[14]);

			dispose = [
				listen(input, "input", /*input_input_handler_8*/ ctx[78]),
				action_destroyer(strong6Input_action = /*strong6Input*/ ctx[48].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$strong6Value*/ 16384 && input.value !== /*$strong6Value*/ ctx[14]) {
				set_input_value(input, /*$strong6Value*/ ctx[14]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (135:8) <Slide active={strongVerb}>
function create_default_slot_5$1(ctx) {
	let t0;
	let t1;
	let t2;
	let t3;
	let t4;
	let current;

	const forminput0 = new Form_input({
			props: {
				errors: /*strong1Errors*/ ctx[31],
				label: "Ich",
				$$slots: { default: [create_default_slot_11$1] },
				$$scope: { ctx }
			}
		});

	const forminput1 = new Form_input({
			props: {
				errors: /*strong2Errors*/ ctx[34],
				label: "du",
				$$slots: { default: [create_default_slot_10$1] },
				$$scope: { ctx }
			}
		});

	const forminput2 = new Form_input({
			props: {
				errors: /*strong3Errors*/ ctx[37],
				label: "er, sie, es",
				$$slots: { default: [create_default_slot_9$1] },
				$$scope: { ctx }
			}
		});

	const forminput3 = new Form_input({
			props: {
				errors: /*strong4Errors*/ ctx[40],
				label: "wir",
				$$slots: { default: [create_default_slot_8$1] },
				$$scope: { ctx }
			}
		});

	const forminput4 = new Form_input({
			props: {
				errors: /*strong5Errors*/ ctx[43],
				label: "ihr",
				$$slots: { default: [create_default_slot_7$1] },
				$$scope: { ctx }
			}
		});

	const forminput5 = new Form_input({
			props: {
				errors: /*strong6Errors*/ ctx[46],
				label: "Sie, sie",
				$$slots: { default: [create_default_slot_6$1] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(forminput0.$$.fragment);
			t0 = space();
			create_component(forminput1.$$.fragment);
			t1 = space();
			create_component(forminput2.$$.fragment);
			t2 = space();
			create_component(forminput3.$$.fragment);
			t3 = space();
			create_component(forminput4.$$.fragment);
			t4 = space();
			create_component(forminput5.$$.fragment);
		},
		m(target, anchor) {
			mount_component(forminput0, target, anchor);
			insert(target, t0, anchor);
			mount_component(forminput1, target, anchor);
			insert(target, t1, anchor);
			mount_component(forminput2, target, anchor);
			insert(target, t2, anchor);
			mount_component(forminput3, target, anchor);
			insert(target, t3, anchor);
			mount_component(forminput4, target, anchor);
			insert(target, t4, anchor);
			mount_component(forminput5, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const forminput0_changes = {};

			if (dirty[0] & /*$strong1Value*/ 512 | dirty[2] & /*$$scope*/ 4194304) {
				forminput0_changes.$$scope = { dirty, ctx };
			}

			forminput0.$set(forminput0_changes);
			const forminput1_changes = {};

			if (dirty[0] & /*$strong2Value*/ 1024 | dirty[2] & /*$$scope*/ 4194304) {
				forminput1_changes.$$scope = { dirty, ctx };
			}

			forminput1.$set(forminput1_changes);
			const forminput2_changes = {};

			if (dirty[0] & /*$strong3Value*/ 2048 | dirty[2] & /*$$scope*/ 4194304) {
				forminput2_changes.$$scope = { dirty, ctx };
			}

			forminput2.$set(forminput2_changes);
			const forminput3_changes = {};

			if (dirty[0] & /*$strong4Value*/ 4096 | dirty[2] & /*$$scope*/ 4194304) {
				forminput3_changes.$$scope = { dirty, ctx };
			}

			forminput3.$set(forminput3_changes);
			const forminput4_changes = {};

			if (dirty[0] & /*$strong5Value*/ 8192 | dirty[2] & /*$$scope*/ 4194304) {
				forminput4_changes.$$scope = { dirty, ctx };
			}

			forminput4.$set(forminput4_changes);
			const forminput5_changes = {};

			if (dirty[0] & /*$strong6Value*/ 16384 | dirty[2] & /*$$scope*/ 4194304) {
				forminput5_changes.$$scope = { dirty, ctx };
			}

			forminput5.$set(forminput5_changes);
		},
		i(local) {
			if (current) return;
			transition_in(forminput0.$$.fragment, local);
			transition_in(forminput1.$$.fragment, local);
			transition_in(forminput2.$$.fragment, local);
			transition_in(forminput3.$$.fragment, local);
			transition_in(forminput4.$$.fragment, local);
			transition_in(forminput5.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(forminput0.$$.fragment, local);
			transition_out(forminput1.$$.fragment, local);
			transition_out(forminput2.$$.fragment, local);
			transition_out(forminput3.$$.fragment, local);
			transition_out(forminput4.$$.fragment, local);
			transition_out(forminput5.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(forminput0, detaching);
			if (detaching) detach(t0);
			destroy_component(forminput1, detaching);
			if (detaching) detach(t1);
			destroy_component(forminput2, detaching);
			if (detaching) detach(t2);
			destroy_component(forminput3, detaching);
			if (detaching) detach(t3);
			destroy_component(forminput4, detaching);
			if (detaching) detach(t4);
			destroy_component(forminput5, detaching);
		}
	};
}

// (156:8) <FormSwitcher type="toggle" bind:checked={irregularVerb}>
function create_default_slot_4$1(ctx) {
	let t;

	return {
		c() {
			t = text("Неправильный глагол");
		},
		m(target, anchor) {
			insert(target, t, anchor);
		},
		d(detaching) {
			if (detaching) detach(t);
		}
	};
}

// (159:10) <FormInput errors={irregular1Errors} label="Präteritum">
function create_default_slot_3$3(ctx) {
	let input;
	let irregular1Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$irregular1Value*/ ctx[15]);

			dispose = [
				listen(input, "input", /*input_input_handler_9*/ ctx[80]),
				action_destroyer(irregular1Input_action = /*irregular1Input*/ ctx[51].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$irregular1Value*/ 32768 && input.value !== /*$irregular1Value*/ ctx[15]) {
				set_input_value(input, /*$irregular1Value*/ ctx[15]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (162:10) <FormInput errors={irregular2Errors} label="Partizip II">
function create_default_slot_2$5(ctx) {
	let input;
	let irregular2Input_action;
	let dispose;

	return {
		c() {
			input = element("input");
			attr(input, "type", "text");
		},
		m(target, anchor) {
			insert(target, input, anchor);
			set_input_value(input, /*$irregular2Value*/ ctx[16]);

			dispose = [
				listen(input, "input", /*input_input_handler_10*/ ctx[81]),
				action_destroyer(irregular2Input_action = /*irregular2Input*/ ctx[54].call(null, input))
			];
		},
		p(ctx, dirty) {
			if (dirty[0] & /*$irregular2Value*/ 65536 && input.value !== /*$irregular2Value*/ ctx[16]) {
				set_input_value(input, /*$irregular2Value*/ ctx[16]);
			}
		},
		d(detaching) {
			if (detaching) detach(input);
			run_all(dispose);
		}
	};
}

// (158:8) <Slide active={irregularVerb}>
function create_default_slot_1$5(ctx) {
	let t;
	let current;

	const forminput0 = new Form_input({
			props: {
				errors: /*irregular1Errors*/ ctx[49],
				label: "Präteritum",
				$$slots: { default: [create_default_slot_3$3] },
				$$scope: { ctx }
			}
		});

	const forminput1 = new Form_input({
			props: {
				errors: /*irregular2Errors*/ ctx[52],
				label: "Partizip II",
				$$slots: { default: [create_default_slot_2$5] },
				$$scope: { ctx }
			}
		});

	return {
		c() {
			create_component(forminput0.$$.fragment);
			t = space();
			create_component(forminput1.$$.fragment);
		},
		m(target, anchor) {
			mount_component(forminput0, target, anchor);
			insert(target, t, anchor);
			mount_component(forminput1, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const forminput0_changes = {};

			if (dirty[0] & /*$irregular1Value*/ 32768 | dirty[2] & /*$$scope*/ 4194304) {
				forminput0_changes.$$scope = { dirty, ctx };
			}

			forminput0.$set(forminput0_changes);
			const forminput1_changes = {};

			if (dirty[0] & /*$irregular2Value*/ 65536 | dirty[2] & /*$$scope*/ 4194304) {
				forminput1_changes.$$scope = { dirty, ctx };
			}

			forminput1.$set(forminput1_changes);
		},
		i(local) {
			if (current) return;
			transition_in(forminput0.$$.fragment, local);
			transition_in(forminput1.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(forminput0.$$.fragment, local);
			transition_out(forminput1.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(forminput0, detaching);
			if (detaching) detach(t);
			destroy_component(forminput1, detaching);
		}
	};
}

// (109:4) <FormValidation {form}>
function create_default_slot$a(ctx) {
	let t0;
	let t1;
	let t2;
	let t3;
	let t4;
	let updating_linked;
	let updating_active;
	let t5;
	let current;
	let if_block0 = /*$typeValue*/ ctx[5] === "noun" && create_if_block_3$2(ctx);

	const forminput0 = new Form_input({
			props: {
				errors: /*origErrors*/ ctx[20],
				label: /*$typeValue*/ ctx[5] === "phrase" ? "Фраза" : "Слово",
				$$slots: { default: [create_default_slot_15$1] },
				$$scope: { ctx }
			}
		});

	const forminput1 = new Form_input({
			props: {
				errors: /*trErrors*/ ctx[23],
				label: "Перевод",
				$$slots: { default: [create_default_slot_14$1] },
				$$scope: { ctx }
			}
		});

	let if_block1 = /*$typeValue*/ ctx[5] === "noun" && create_if_block_2$4(ctx);
	let if_block2 = /*$typeValue*/ ctx[5] === "verb" && create_if_block_1$a(ctx);

	function categories_linked_binding(value) {
		/*categories_linked_binding*/ ctx[82].call(null, value);
	}

	function categories_active_binding(value) {
		/*categories_active_binding*/ ctx[83].call(null, value);
	}

	let categories_props = {};

	if (/*linkedCategories*/ ctx[0] !== void 0) {
		categories_props.linked = /*linkedCategories*/ ctx[0];
	}

	if (/*categoriesActive*/ ctx[3] !== void 0) {
		categories_props.active = /*categoriesActive*/ ctx[3];
	}

	const categories = new Words_categories({ props: categories_props });
	binding_callbacks.push(() => bind(categories, "linked", categories_linked_binding));
	binding_callbacks.push(() => bind(categories, "active", categories_active_binding));

	const button = new Button({
			props: {
				type: "submit",
				text: /*wordId*/ ctx[17] ? "редактировать" : "создать"
			}
		});

	return {
		c() {
			if (if_block0) if_block0.c();
			t0 = space();
			create_component(forminput0.$$.fragment);
			t1 = space();
			create_component(forminput1.$$.fragment);
			t2 = space();
			if (if_block1) if_block1.c();
			t3 = space();
			if (if_block2) if_block2.c();
			t4 = space();
			create_component(categories.$$.fragment);
			t5 = space();
			create_component(button.$$.fragment);
		},
		m(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert(target, t0, anchor);
			mount_component(forminput0, target, anchor);
			insert(target, t1, anchor);
			mount_component(forminput1, target, anchor);
			insert(target, t2, anchor);
			if (if_block1) if_block1.m(target, anchor);
			insert(target, t3, anchor);
			if (if_block2) if_block2.m(target, anchor);
			insert(target, t4, anchor);
			mount_component(categories, target, anchor);
			insert(target, t5, anchor);
			mount_component(button, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (/*$typeValue*/ ctx[5] === "noun") {
				if (if_block0) {
					if_block0.p(ctx, dirty);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_3$2(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(t0.parentNode, t0);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			const forminput0_changes = {};
			if (dirty[0] & /*$typeValue*/ 32) forminput0_changes.label = /*$typeValue*/ ctx[5] === "phrase" ? "Фраза" : "Слово";

			if (dirty[0] & /*$origValue*/ 64 | dirty[2] & /*$$scope*/ 4194304) {
				forminput0_changes.$$scope = { dirty, ctx };
			}

			forminput0.$set(forminput0_changes);
			const forminput1_changes = {};

			if (dirty[0] & /*$trValue*/ 128 | dirty[2] & /*$$scope*/ 4194304) {
				forminput1_changes.$$scope = { dirty, ctx };
			}

			forminput1.$set(forminput1_changes);

			if (/*$typeValue*/ ctx[5] === "noun") {
				if (if_block1) {
					if_block1.p(ctx, dirty);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block_2$4(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(t3.parentNode, t3);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}

			if (/*$typeValue*/ ctx[5] === "verb") {
				if (if_block2) {
					if_block2.p(ctx, dirty);
					transition_in(if_block2, 1);
				} else {
					if_block2 = create_if_block_1$a(ctx);
					if_block2.c();
					transition_in(if_block2, 1);
					if_block2.m(t4.parentNode, t4);
				}
			} else if (if_block2) {
				group_outros();

				transition_out(if_block2, 1, 1, () => {
					if_block2 = null;
				});

				check_outros();
			}

			const categories_changes = {};

			if (!updating_linked && dirty[0] & /*linkedCategories*/ 1) {
				updating_linked = true;
				categories_changes.linked = /*linkedCategories*/ ctx[0];
				add_flush_callback(() => updating_linked = false);
			}

			if (!updating_active && dirty[0] & /*categoriesActive*/ 8) {
				updating_active = true;
				categories_changes.active = /*categoriesActive*/ ctx[3];
				add_flush_callback(() => updating_active = false);
			}

			categories.$set(categories_changes);
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(forminput0.$$.fragment, local);
			transition_in(forminput1.$$.fragment, local);
			transition_in(if_block1);
			transition_in(if_block2);
			transition_in(categories.$$.fragment, local);
			transition_in(button.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(forminput0.$$.fragment, local);
			transition_out(forminput1.$$.fragment, local);
			transition_out(if_block1);
			transition_out(if_block2);
			transition_out(categories.$$.fragment, local);
			transition_out(button.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (if_block0) if_block0.d(detaching);
			if (detaching) detach(t0);
			destroy_component(forminput0, detaching);
			if (detaching) detach(t1);
			destroy_component(forminput1, detaching);
			if (detaching) detach(t2);
			if (if_block1) if_block1.d(detaching);
			if (detaching) detach(t3);
			if (if_block2) if_block2.d(detaching);
			if (detaching) detach(t4);
			destroy_component(categories, detaching);
			if (detaching) detach(t5);
			destroy_component(button, detaching);
		}
	};
}

function create_fragment$y(ctx) {
	let div;
	let h1;
	let t2;
	let t3;
	let current;
	let if_block0 = !/*wordId*/ ctx[17] && create_if_block_4(ctx);
	let if_block1 = /*$typeValue*/ ctx[5] && create_if_block$k(ctx);

	return {
		c() {
			div = element("div");
			h1 = element("h1");
			h1.textContent = `${/*wordId*/ ctx[17] ? "Редактировать" : "Добавить"} слово`;
			t2 = space();
			if (if_block0) if_block0.c();
			t3 = space();
			if (if_block1) if_block1.c();
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, h1);
			append(div, t2);
			if (if_block0) if_block0.m(div, null);
			append(div, t3);
			if (if_block1) if_block1.m(div, null);
			current = true;
		},
		p(ctx, dirty) {
			if (!/*wordId*/ ctx[17]) if_block0.p(ctx, dirty);

			if (/*$typeValue*/ ctx[5]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block$k(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance$y($$self, $$props, $$invalidate) {
	let $articleValue;
	let $articleErrors;
	let $typeValue;
	let $origValue;
	let $trValue;
	let $pluralValue;
	let $strong1Value;
	let $strong2Value;
	let $strong3Value;
	let $strong4Value;
	let $strong5Value;
	let $strong6Value;
	let $irregular1Value;
	let $irregular2Value;
	let { word = {} } = $$props;
	let { wordId = null, categories: linkedCategories = [] } = word;
	let strongVerb = store$4.verbIsStrong(word);
	let irregularVerb = store$4.verbIsIrregular(word);
	let categoriesActive = !!linkedCategories.length;

	const callback = values => {
		const wordObject = {
			...values,
			active: !wordId || word.active,
			categories: categoriesActive ? linkedCategories : []
		};

		if (wordId) {
			wordObject.wordId = wordId;
		}

		// save word
		store$4.updateWord(wordObject);

		store.addMessage({
			status: "success",
			text: wordId ? "wordEdit.success" : "wordCreate.success"
		});

		if (!wordId) {
			setTimeout(resetState, 1);
		}
	};

	let { form, clearErrors, entries: { type: [typeErrors, typeValue], original: [origErrors, origValue, origInput], translation: [trErrors, trValue, trInput], plural: [pluralErrors, pluralValue, pluralInput], article: [articleErrors, articleValue], strong1: [strong1Errors, strong1Value, strong1Input], strong2: [strong2Errors, strong2Value, strong2Input], strong3: [strong3Errors, strong3Value, strong3Input], strong4: [strong4Errors, strong4Value, strong4Input], strong5: [strong5Errors, strong5Value, strong5Input], strong6: [strong6Errors, strong6Value, strong6Input], irregular1: [irregular1Errors, irregular1Value, irregular1Input], irregular2: [irregular2Errors, irregular2Value, irregular2Input] } } = createValidation$1(
		{
			scheme: [
				"type",
				"original",
				"plural",
				"article",
				"translation",
				"strong1",
				"strong2",
				"strong3",
				"strong4",
				"strong5",
				"strong6",
				"irregular1",
				"irregular2"
			],
			initial: word
		},
		callback
	);

	component_subscribe($$self, typeValue, value => $$invalidate(5, $typeValue = value));
	component_subscribe($$self, origValue, value => $$invalidate(6, $origValue = value));
	component_subscribe($$self, trValue, value => $$invalidate(7, $trValue = value));
	component_subscribe($$self, pluralValue, value => $$invalidate(8, $pluralValue = value));
	component_subscribe($$self, articleErrors, value => $$invalidate(58, $articleErrors = value));
	component_subscribe($$self, articleValue, value => $$invalidate(4, $articleValue = value));
	component_subscribe($$self, strong1Value, value => $$invalidate(9, $strong1Value = value));
	component_subscribe($$self, strong2Value, value => $$invalidate(10, $strong2Value = value));
	component_subscribe($$self, strong3Value, value => $$invalidate(11, $strong3Value = value));
	component_subscribe($$self, strong4Value, value => $$invalidate(12, $strong4Value = value));
	component_subscribe($$self, strong5Value, value => $$invalidate(13, $strong5Value = value));
	component_subscribe($$self, strong6Value, value => $$invalidate(14, $strong6Value = value));
	component_subscribe($$self, irregular1Value, value => $$invalidate(15, $irregular1Value = value));
	component_subscribe($$self, irregular2Value, value => $$invalidate(16, $irregular2Value = value));

	const articleChange = article => {
		set_store_value(articleValue, $articleValue = article);
		set_store_value(articleErrors, $articleErrors = []);
	};

	const resetState = (t = "") => {
		$$invalidate(57, word = {});
		set_store_value(typeValue, $typeValue = t);
		$$invalidate(3, categoriesActive = false);
		$$invalidate(0, linkedCategories = []);
		$$invalidate(1, strongVerb = false);
		$$invalidate(2, irregularVerb = false);
		set_store_value(origValue, $origValue = "");
		set_store_value(trValue, $trValue = "");
		set_store_value(pluralValue, $pluralValue = "");
		set_store_value(articleValue, $articleValue = "");
		set_store_value(strong1Value, $strong1Value = "");
		set_store_value(strong2Value, $strong2Value = "");
		set_store_value(strong3Value, $strong3Value = "");
		set_store_value(strong4Value, $strong4Value = "");
		set_store_value(strong5Value, $strong5Value = "");
		set_store_value(strong6Value, $strong6Value = "");
		set_store_value(irregular1Value, $irregular1Value = "");
		set_store_value(irregular2Value, $irregular2Value = "");
		clearErrors(true);
	};

	const click_handler = () => resetState("noun");
	const click_handler_1 = () => resetState("verb");
	const click_handler_2 = () => resetState("phrase");
	const click_handler_3 = () => resetState("other");
	const click_handler_4 = () => articleChange("der");
	const click_handler_5 = () => articleChange("die");
	const click_handler_6 = () => articleChange("das");

	function input_input_handler() {
		$origValue = this.value;
		origValue.set($origValue);
	}

	function input_input_handler_1() {
		$trValue = this.value;
		trValue.set($trValue);
	}

	function input_input_handler_2() {
		$pluralValue = this.value;
		pluralValue.set($pluralValue);
	}

	function formswitcher0_checked_binding(value) {
		strongVerb = value;
		$$invalidate(1, strongVerb);
	}

	function input_input_handler_3() {
		$strong1Value = this.value;
		strong1Value.set($strong1Value);
	}

	function input_input_handler_4() {
		$strong2Value = this.value;
		strong2Value.set($strong2Value);
	}

	function input_input_handler_5() {
		$strong3Value = this.value;
		strong3Value.set($strong3Value);
	}

	function input_input_handler_6() {
		$strong4Value = this.value;
		strong4Value.set($strong4Value);
	}

	function input_input_handler_7() {
		$strong5Value = this.value;
		strong5Value.set($strong5Value);
	}

	function input_input_handler_8() {
		$strong6Value = this.value;
		strong6Value.set($strong6Value);
	}

	function formswitcher1_checked_binding(value) {
		irregularVerb = value;
		$$invalidate(2, irregularVerb);
	}

	function input_input_handler_9() {
		$irregular1Value = this.value;
		irregular1Value.set($irregular1Value);
	}

	function input_input_handler_10() {
		$irregular2Value = this.value;
		irregular2Value.set($irregular2Value);
	}

	function categories_linked_binding(value) {
		linkedCategories = value;
		$$invalidate(0, linkedCategories);
	}

	function categories_active_binding(value) {
		categoriesActive = value;
		$$invalidate(3, categoriesActive);
	}

	$$self.$set = $$props => {
		if ("word" in $$props) $$invalidate(57, word = $$props.word);
	};

	return [
		linkedCategories,
		strongVerb,
		irregularVerb,
		categoriesActive,
		$articleValue,
		$typeValue,
		$origValue,
		$trValue,
		$pluralValue,
		$strong1Value,
		$strong2Value,
		$strong3Value,
		$strong4Value,
		$strong5Value,
		$strong6Value,
		$irregular1Value,
		$irregular2Value,
		wordId,
		form,
		typeValue,
		origErrors,
		origValue,
		origInput,
		trErrors,
		trValue,
		trInput,
		pluralErrors,
		pluralValue,
		pluralInput,
		articleErrors,
		articleValue,
		strong1Errors,
		strong1Value,
		strong1Input,
		strong2Errors,
		strong2Value,
		strong2Input,
		strong3Errors,
		strong3Value,
		strong3Input,
		strong4Errors,
		strong4Value,
		strong4Input,
		strong5Errors,
		strong5Value,
		strong5Input,
		strong6Errors,
		strong6Value,
		strong6Input,
		irregular1Errors,
		irregular1Value,
		irregular1Input,
		irregular2Errors,
		irregular2Value,
		irregular2Input,
		articleChange,
		resetState,
		word,
		$articleErrors,
		callback,
		clearErrors,
		typeErrors,
		click_handler,
		click_handler_1,
		click_handler_2,
		click_handler_3,
		click_handler_4,
		click_handler_5,
		click_handler_6,
		input_input_handler,
		input_input_handler_1,
		input_input_handler_2,
		formswitcher0_checked_binding,
		input_input_handler_3,
		input_input_handler_4,
		input_input_handler_5,
		input_input_handler_6,
		input_input_handler_7,
		input_input_handler_8,
		formswitcher1_checked_binding,
		input_input_handler_9,
		input_input_handler_10,
		categories_linked_binding,
		categories_active_binding
	];
}

class Word extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$y, create_fragment$y, safe_not_equal, { word: 57 }, [-1, -1, -1]);
	}
}

/* src/views/words/add-word.svelte generated by Svelte v3.19.1 */

function create_fragment$z(ctx) {
	let current;
	const word = new Word({});

	return {
		c() {
			create_component(word.$$.fragment);
		},
		m(target, anchor) {
			mount_component(word, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(word.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(word.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(word, detaching);
		}
	};
}

class Add_word extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, null, create_fragment$z, safe_not_equal, {});
	}
}

/* src/views/words/edit-word.svelte generated by Svelte v3.19.1 */

function create_fragment$A(ctx) {
	let current;

	const word = new Word({
			props: {
				word: /*$words*/ ctx[0][/*$view*/ ctx[1].params.wordId]
			}
		});

	return {
		c() {
			create_component(word.$$.fragment);
		},
		m(target, anchor) {
			mount_component(word, target, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const word_changes = {};
			if (dirty & /*$words, $view*/ 3) word_changes.word = /*$words*/ ctx[0][/*$view*/ ctx[1].params.wordId];
			word.$set(word_changes);
		},
		i(local) {
			if (current) return;
			transition_in(word.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(word.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(word, detaching);
		}
	};
}

function instance$z($$self, $$props, $$invalidate) {
	let $words;
	let $view;
	component_subscribe($$self, store$4, $$value => $$invalidate(0, $words = $$value));
	component_subscribe($$self, store$6, $$value => $$invalidate(1, $view = $$value));
	return [$words, $view];
}

class Edit_word extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$z, create_fragment$A, safe_not_equal, {});
	}
}



var views = /*#__PURE__*/Object.freeze({
  __proto__: null,
  categories: Categories,
  dict: Dict,
  preGame: Pre_game,
  rusDeu: Rus_deu,
  deuRus: Deu_rus,
  home: Home,
  setup: Setup,
  sync: Sync,
  addWord: Add_word,
  editWord: Edit_word
});

/* src/sdk/app/app.svelte generated by Svelte v3.19.1 */

function add_css$r() {
	var style = element("style");
	style.id = "svelte-1g5wydk-style";
	style.textContent = ".app.svelte-1g5wydk{display:flex;flex-direction:column;min-height:100%}.main.svelte-1g5wydk{display:flex;flex:1;padding:20px 10px 10px;order:1}.main.svelte-1g5wydk>*{flex:1;width:100%}#bottom-buttons.svelte-1g5wydk{order:2;padding:10px 10px 0}#bottom-buttons.svelte-1g5wydk:empty{margin:0;padding:0}";
	append(document.head, style);
}

// (25:2) {#if introActive}
function create_if_block_1$b(ctx) {
	let updating_introActive;
	let updating_introToHide;
	let current;

	function intro_introActive_binding(value) {
		/*intro_introActive_binding*/ ctx[5].call(null, value);
	}

	function intro_introToHide_binding(value) {
		/*intro_introToHide_binding*/ ctx[6].call(null, value);
	}

	let intro_props = { dataReady: /*dataReady*/ ctx[3] };

	if (/*introActive*/ ctx[1] !== void 0) {
		intro_props.introActive = /*introActive*/ ctx[1];
	}

	if (/*introToHide*/ ctx[2] !== void 0) {
		intro_props.introToHide = /*introToHide*/ ctx[2];
	}

	const intro = new Intro({ props: intro_props });
	binding_callbacks.push(() => bind(intro, "introActive", intro_introActive_binding));
	binding_callbacks.push(() => bind(intro, "introToHide", intro_introToHide_binding));

	return {
		c() {
			create_component(intro.$$.fragment);
		},
		m(target, anchor) {
			mount_component(intro, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const intro_changes = {};
			if (dirty & /*dataReady*/ 8) intro_changes.dataReady = /*dataReady*/ ctx[3];

			if (!updating_introActive && dirty & /*introActive*/ 2) {
				updating_introActive = true;
				intro_changes.introActive = /*introActive*/ ctx[1];
				add_flush_callback(() => updating_introActive = false);
			}

			if (!updating_introToHide && dirty & /*introToHide*/ 4) {
				updating_introToHide = true;
				intro_changes.introToHide = /*introToHide*/ ctx[2];
				add_flush_callback(() => updating_introToHide = false);
			}

			intro.$set(intro_changes);
		},
		i(local) {
			if (current) return;
			transition_in(intro.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(intro.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(intro, detaching);
		}
	};
}

// (29:2) {#if !introActive || introToHide}
function create_if_block$l(ctx) {
	let t0;
	let div;
	let t1;
	let main;
	let t2;
	let current;
	const header = new Header({});
	var switch_value = /*activeComponent*/ ctx[0];

	function switch_props(ctx) {
		return {};
	}

	if (switch_value) {
		var switch_instance = new switch_value(switch_props());
	}

	const messages = new Messages({});

	return {
		c() {
			create_component(header.$$.fragment);
			t0 = space();
			div = element("div");
			t1 = space();
			main = element("main");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			t2 = space();
			create_component(messages.$$.fragment);
			attr(div, "id", "bottom-buttons");
			attr(div, "class", "bottom-buttons svelte-1g5wydk");
			attr(main, "class", "main svelte-1g5wydk");
		},
		m(target, anchor) {
			mount_component(header, target, anchor);
			insert(target, t0, anchor);
			insert(target, div, anchor);
			insert(target, t1, anchor);
			insert(target, main, anchor);

			if (switch_instance) {
				mount_component(switch_instance, main, null);
			}

			insert(target, t2, anchor);
			mount_component(messages, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (switch_value !== (switch_value = /*activeComponent*/ ctx[0])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, main, null);
				} else {
					switch_instance = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(header.$$.fragment, local);
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			transition_in(messages.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(header.$$.fragment, local);
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			transition_out(messages.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(header, detaching);
			if (detaching) detach(t0);
			if (detaching) detach(div);
			if (detaching) detach(t1);
			if (detaching) detach(main);
			if (switch_instance) destroy_component(switch_instance);
			if (detaching) detach(t2);
			destroy_component(messages, detaching);
		}
	};
}

function create_fragment$B(ctx) {
	let div;
	let t;
	let current;
	let if_block0 = /*introActive*/ ctx[1] && create_if_block_1$b(ctx);
	let if_block1 = (!/*introActive*/ ctx[1] || /*introToHide*/ ctx[2]) && create_if_block$l(ctx);

	return {
		c() {
			div = element("div");
			if (if_block0) if_block0.c();
			t = space();
			if (if_block1) if_block1.c();
			attr(div, "class", "app svelte-1g5wydk");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (if_block0) if_block0.m(div, null);
			append(div, t);
			if (if_block1) if_block1.m(div, null);
			current = true;
		},
		p(ctx, [dirty]) {
			if (/*introActive*/ ctx[1]) {
				if (if_block0) {
					if_block0.p(ctx, dirty);
					transition_in(if_block0, 1);
				} else {
					if_block0 = create_if_block_1$b(ctx);
					if_block0.c();
					transition_in(if_block0, 1);
					if_block0.m(div, t);
				}
			} else if (if_block0) {
				group_outros();

				transition_out(if_block0, 1, 1, () => {
					if_block0 = null;
				});

				check_outros();
			}

			if (!/*introActive*/ ctx[1] || /*introToHide*/ ctx[2]) {
				if (if_block1) {
					if_block1.p(ctx, dirty);
					transition_in(if_block1, 1);
				} else {
					if_block1 = create_if_block$l(ctx);
					if_block1.c();
					transition_in(if_block1, 1);
					if_block1.m(div, null);
				}
			} else if (if_block1) {
				group_outros();

				transition_out(if_block1, 1, 1, () => {
					if_block1 = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block0);
			transition_in(if_block1);
			current = true;
		},
		o(local) {
			transition_out(if_block0);
			transition_out(if_block1);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (if_block0) if_block0.d();
			if (if_block1) if_block1.d();
		}
	};
}

function instance$A($$self, $$props, $$invalidate) {
	let $view;
	component_subscribe($$self, store$6, $$value => $$invalidate(4, $view = $$value));
	let activeComponent;
	let introActive = !false;
	let introToHide = false;
	let dataReady = false;

	loadInitialData({
		callback: () => {
			$$invalidate(3, dataReady = true);
		}
	});

	function intro_introActive_binding(value) {
		introActive = value;
		$$invalidate(1, introActive);
	}

	function intro_introToHide_binding(value) {
		introToHide = value;
		$$invalidate(2, introToHide);
	}

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*$view*/ 16) {
			 $$invalidate(0, activeComponent = views[$view.viewId] || Home);
		}
	};

	return [
		activeComponent,
		introActive,
		introToHide,
		dataReady,
		$view,
		intro_introActive_binding,
		intro_introToHide_binding
	];
}

class App extends SvelteComponent {
	constructor(options) {
		super();
		if (!document.getElementById("svelte-1g5wydk-style")) add_css$r();
		init(this, options, instance$A, create_fragment$B, safe_not_equal, {});
	}
}

new App({
    target: document.body,
    props: {}
});
