/**
 * Determine whether a value is an object.
 *
 * Uses `typeof` to guarantee this works cross-realm, which is where `instanceof Object` might fail.
 *
 * Some environments where these issues are known to arise:
 * - same-origin iframes (accessing the other realm via `window.top`)
 * - `jest`.
 *
 * The exact test is:
 * ```ts
 * typeof value === 'object' && value !== null || typeof value === 'function'
 * ```
 *
 * @param value - The value to test.
 * @returns `true` if the value is an object, otherwise `false`.
 * Also performs a type assertion that defaults to `value is Object | Function` which, if the input type is a union with an object type, will infer the correct type.
 * This can be overridden with the generic type argument.
 *
 * @example
 *
 * ```ts
 * class Foo {
 *   bar = 42;
 * }
 *
 * function doStuff(input?: Foo | null) {
 *   input.bar; // Object is possibly 'null' or 'undefined'
 *
 *   // input has an object type in its union (Foo) so that type will be extracted for the 'true' condition
 *   if (isObject(input)) {
 *     input.bar; // OK (input is now typed as Foo)
 *   }
 * }
 *
 * function doOtherStuff(input: unknown) {
 *   input.bar; // Object is of type 'unknown'
 *
 *   // input is 'unknown' so there is no union type to match and it will default to 'Object | Function'
 *   if (isObject(input)) {
 *     input.bar; // Property 'bar' does not exist on type 'Object | Function'
 *   }
 *
 *   // if we know for sure that, if input is an object, it must be a specific type, we can explicitly tell the function to assert that for us
 *   if (isObject<Foo>(input)) {
 *    input.bar; // OK (input is now typed as Foo)
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function isObject(value) {
    return typeof value === 'object' && value !== null || typeof value === 'function';
}
/**
 * Determine whether a value is `null` or `undefined`.
 *
 * @param value - The value to test.
 * @returns `true` if the value is `null` or `undefined`, otherwise `false`.
 * Also performs a type assertion that ensures TypeScript treats the value appropriately in the `if` and `else` branches after this check.
 */
function isNullOrUndefined(value) {
    return value === null || value === void 0;
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
const metadataInternalSlot = new WeakMap();
function $typeError(operation, args, paramName, actualValue, expectedType) {
    return new TypeError(`${operation}(${args.map(String).join(',')}) - Expected '${paramName}' to be of type ${expectedType}, but got: ${Object.prototype.toString.call(actualValue)} (${String(actualValue)})`);
}
function toPropertyKeyOrUndefined(propertyKey) {
    switch (typeof propertyKey) {
        case 'undefined':
        case 'string':
        case 'symbol':
            return propertyKey;
        default:
            return `${propertyKey}`;
    }
}
function toPropertyKey(propertyKey) {
    switch (typeof propertyKey) {
        case 'string':
        case 'symbol':
            return propertyKey;
        default:
            return `${propertyKey}`;
    }
}
function ensurePropertyKeyOrUndefined(propertyKey) {
    switch (typeof propertyKey) {
        case 'undefined':
        case 'string':
        case 'symbol':
            return propertyKey;
        default:
            throw new TypeError(`Invalid metadata propertyKey: ${propertyKey}.`);
    }
}
function GetOrCreateMetadataMap(O, P, Create) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let targetMetadata be the value of O's [[Metadata]] internal slot.
    let targetMetadata = metadataInternalSlot.get(O);
    // 3. If targetMetadata is undefined, then
    if (targetMetadata === void 0) {
        // 3. a. If Create is false, return undefined.
        if (!Create) {
            return void 0;
        }
        // 3. b. Set targetMetadata to be a newly created Map object.
        targetMetadata = new Map();
        // 3. c. Set the [[Metadata]] internal slot of O to targetMetadata.
        metadataInternalSlot.set(O, targetMetadata);
    }
    // 4. Let metadataMap be ? Invoke(targetMetadata, "get", P).
    let metadataMap = targetMetadata.get(P);
    // 5. If metadataMap is undefined, then
    if (metadataMap === void 0) {
        // 5. a. If Create is false, return undefined.
        if (!Create) {
            return void 0;
        }
        // 5. b. Set metadataMap to be a newly created Map object.
        metadataMap = new Map();
        // 5. c. Perform ? Invoke(targetMetadata, "set", P, metadataMap).
        targetMetadata.set(P, metadataMap);
    }
    // 6. Return metadataMap.
    return metadataMap;
}
// 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let metadataMap be ? GetOrCreateMetadataMap(O, P, false).
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create */ false);
    // 3. If metadataMap is undefined, return false.
    if (metadataMap === void 0) {
        return false;
    }
    // 4. Return ? ToBoolean(? Invoke(metadataMap, "has", MetadataKey)).
    return metadataMap.has(MetadataKey);
}
// 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
function OrdinaryHasMetadata(MetadataKey, O, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let hasOwn be ? OrdinaryHasOwnMetadata(MetadataKey, O, P).
    // 3. If hasOwn is true, return true.
    if (OrdinaryHasOwnMetadata(MetadataKey, O, P)) {
        return true;
    }
    // 4. Let parent be ? O.[[GetPrototypeOf]]().
    const parent = Object.getPrototypeOf(O);
    // 5. If parent is not null, Return ? parent.[[HasMetadata]](MetadataKey, P).
    if (parent !== null) {
        return OrdinaryHasMetadata(MetadataKey, parent, P);
    }
    // 6. Return false.
    return false;
}
// 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let metadataMap be ? GetOrCreateMetadataMap(O, P, false).
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create */ false);
    // 3. If metadataMap is undefined, return undefined.
    if (metadataMap === void 0) {
        return void 0;
    }
    // 4. Return ? Invoke(metadataMap, "get", MetadataKey).
    return metadataMap.get(MetadataKey);
}
// 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
function OrdinaryGetMetadata(MetadataKey, O, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let hasOwn be ? OrdinaryHasOwnMetadata(MetadataKey, O, P).
    // 3. If hasOwn is true, return ? OrdinaryGetOwnMetadata(MetadataKey, O, P).
    if (OrdinaryHasOwnMetadata(MetadataKey, O, P)) {
        return OrdinaryGetOwnMetadata(MetadataKey, O, P);
    }
    // 4. Let parent be ? O.[[GetPrototypeOf]]().
    const parent = Object.getPrototypeOf(O);
    // 5. If parent is not null, return ? parent.[[GetMetadata]](MetadataKey, P).
    if (parent !== null) {
        return OrdinaryGetMetadata(MetadataKey, parent, P);
    }
    // 6. Return undefined.
    return void 0;
}
// 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let metadataMap be ? GetOrCreateMetadataMap(O, P, true).
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create */ true);
    // 3. Return ? Invoke(metadataMap, "set", MetadataKey, MetadataValue).
    metadataMap.set(MetadataKey, MetadataValue);
}
// 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
function OrdinaryOwnMetadataKeys(O, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let keys be ? ArrayCreate(0).
    const keys = [];
    // 3. Let metadataMap be ? GetOrCreateMetadataMap(O, P, false).
    const metadataMap = GetOrCreateMetadataMap(O, P, /* Create */ false);
    // 4. If metadataMap is undefined, return keys.
    if (metadataMap === void 0) {
        return keys;
    }
    // 5. Let keysObj be ? Invoke(metadataMap, "keys").
    const keysObj = metadataMap.keys();
    // 6. Let iterator be ? GetIterator(keysObj).
    // 7. Let k be 0.
    let k = 0;
    // 8. Repeat
    for (const key of keysObj) {
        // 8. a. Let Pk be ! ToString(k).
        // 8. b. Let next be ? IteratorStep(iterator).
        // 8. c. If next is false, then
        // 8. c. i. Let setStatus be ? Set(keys, "length", k, true).
        // 8. c. ii. Assert: setStatus is true.
        // 8. c. iii. Return keys.
        // 8. d. Let nextValue be ? IteratorValue(next).
        // 8. e. Let defineStatus be CreateDataPropertyOrThrow(keys, Pk, nextValue).
        keys[k] = key;
        // 8. f. If defineStatus is an abrupt completion, return ? IteratorClose(iterator, defineStatus).
        // 8. g. Increase k by 1.
        ++k;
    }
    return keys;
}
// 3.1.6.1 OrdinaryMetadataKeys(O, P)
// https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
function OrdinaryMetadataKeys(O, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let ownKeys be ? OrdinaryOwnMetadataKeys(O, P).
    const ownKeys = OrdinaryOwnMetadataKeys(O, P);
    // 3. Let parent be ? O.[[GetPrototypeOf]]().
    const parent = Object.getPrototypeOf(O);
    // 4. If parent is null, then return ownKeys.
    if (parent === null) {
        return ownKeys;
    }
    // 5. Let parentKeys be ? O.[[OrdinaryMetadataKeys]](P).
    const parentKeys = OrdinaryMetadataKeys(parent, P);
    // 6. Let ownKeysLen = ? Get(ownKeys, "length").
    const ownKeysLen = ownKeys.length;
    // 7. If ownKeysLen is 0, return parentKeys.
    if (ownKeysLen === 0) {
        return parentKeys;
    }
    // 8. Let parentKeysLen = ? Get(parentKeys, "length").
    const parentKeysLen = parentKeys.length;
    // 9. If parentKeysLen is 0, return ownKeys.
    if (parentKeysLen === 0) {
        return ownKeys;
    }
    // 10. Let set be a newly created Set object.
    const set = new Set();
    // 11. Let keys be ? ArrayCreate(0).
    const keys = [];
    // 12. Let k be 0.
    let k = 0;
    // 13. For each element key of ownKeys
    let key;
    for (let i = 0; i < ownKeysLen; ++i) {
        key = ownKeys[i];
        // 13. a. Let hasKey be ? Invoke(set, "has", key).
        // 13. b. If hasKey is false, then
        if (!set.has(key)) {
            // 13. b. i. Let Pk be ! ToString(k).
            // 13. b. ii. Perform ? Invoke(set, "add", key).
            set.add(key);
            // 13. b. iii. Let defineStatus be CreateDataProperty(keys, Pk, key).
            // 13. b. iv. Assert: defineStatus is true.
            keys[k] = key;
            // 13. b. v. Increase k by 1.
            ++k;
        }
    }
    // 14. For each element key of parentKeys
    for (let i = 0; i < parentKeysLen; ++i) {
        key = parentKeys[i];
        // 14. a. Let hasKey be ? Invoke(set, "has", key).
        // 14. b. If hasKey is false, then
        if (!set.has(key)) {
            // 14. b. i. Let Pk be ! ToString(k).
            // 14. b. ii. Perform ? Invoke(set, "add", key).
            set.add(key);
            // 14. b. iii. Let defineStatus be CreateDataProperty(keys, Pk, key).
            // 14. b. iv. Assert: defineStatus is true.
            keys[k] = key;
            // 14. b. v. Increase k by 1.
            ++k;
        }
    }
    // 15. Perform ? Set(keys, "length", k).
    // 16. return keys.
    return keys;
}
// 3.1.8 DeleteMetadata(MetadataKey, P)
// https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots-deletemetadata
function OrdinaryDeleteMetadata(O, MetadataKey, P) {
    // 1. Assert: P is undefined or IsPropertyKey(P) is true.
    // 2. Let metadataMap be ? GetOrCreateMetadataMap(O, P, false).
    const metadataMap = GetOrCreateMetadataMap(O, P, false);
    // 3. If metadataMap is undefined, return false.
    if (metadataMap === void 0) {
        return false;
    }
    // 4. Return ? Invoke(metadataMap, "delete", MetadataKey).
    return metadataMap.delete(MetadataKey);
}
// 4.1.2 Reflect.metadata(metadataKey, metadataValue)
// https://rbuckton.github.io/reflect-metadata/#reflect.metadata
/**
 * A default metadata decorator factory that can be used on a class, class member, or parameter.
 *
 * @param metadataKey - The key for the metadata entry.
 * If `metadataKey` is already defined for the target and target key, the
 * metadataValue for that key will be overwritten.
 * @param metadataValue - The value for the metadata entry.
 * @returns A decorator function.
 */
function metadata(metadataKey, metadataValue) {
    function decorator(target, propertyKey) {
        // 1. Assert: F has a [[MetadataKey]] internal slot whose value is an ECMAScript language value, or undefined.
        // 2. Assert: F has a [[MetadataValue]] internal slot whose value is an ECMAScript language value, or undefined.
        // 3. If Type(target) is not Object, throw a TypeError exception.
        if (!isObject(target)) {
            throw $typeError('@metadata', [metadataKey, metadataValue, target, propertyKey], 'target', target, 'Object or Function');
        }
        // 4. If key is not undefined and IsPropertyKey(key) is false, throw a TypeError exception.
        // 5. Let metadataKey be the value of F's [[MetadataKey]] internal slot.
        // 6. Let metadataValue be the value of F's [[MetadataValue]] internal slot.
        // 7. Perform ? target.[[DefineMetadata]](metadataKey, metadataValue, target, key).
        OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, ensurePropertyKeyOrUndefined(propertyKey));
        // 8. Return undefined.
    }
    return decorator;
}
function decorate(decorators, target, propertyKey, attributes) {
    if (propertyKey !== void 0) {
        if (!Array.isArray(decorators)) {
            throw $typeError('Metadata.decorate', [decorators, target, propertyKey, attributes], 'decorators', decorators, 'Array');
        }
        if (!isObject(target)) {
            throw $typeError('Metadata.decorate', [decorators, target, propertyKey, attributes], 'target', target, 'Object or Function');
        }
        if (!isObject(attributes) && !isNullOrUndefined(attributes)) {
            throw $typeError('Metadata.decorate', [decorators, target, propertyKey, attributes], 'attributes', attributes, 'Object, Function, null, or undefined');
        }
        if (attributes === null) {
            attributes = void 0;
        }
        propertyKey = toPropertyKey(propertyKey);
        return DecorateProperty(decorators, target, propertyKey, attributes);
    }
    else {
        if (!Array.isArray(decorators)) {
            throw $typeError('Metadata.decorate', [decorators, target, propertyKey, attributes], 'decorators', decorators, 'Array');
        }
        if (typeof target !== 'function') {
            throw $typeError('Metadata.decorate', [decorators, target, propertyKey, attributes], 'target', target, 'Function');
        }
        return DecorateConstructor(decorators, target);
    }
}
function DecorateConstructor(decorators, target) {
    for (let i = decorators.length - 1; i >= 0; --i) {
        const decorator = decorators[i];
        const decorated = decorator(target);
        if (!isNullOrUndefined(decorated)) {
            if (typeof decorated !== 'function') {
                throw $typeError('DecorateConstructor', [decorators, target], 'decorated', decorated, 'Function, null, or undefined');
            }
            target = decorated;
        }
    }
    return target;
}
function DecorateProperty(decorators, target, propertyKey, descriptor) {
    for (let i = decorators.length - 1; i >= 0; --i) {
        const decorator = decorators[i];
        const decorated = decorator(target, propertyKey, descriptor);
        if (!isNullOrUndefined(decorated)) {
            if (!isObject(decorated)) {
                throw $typeError('DecorateProperty', [decorators, target, propertyKey, descriptor], 'decorated', decorated, 'Object, Function, null, or undefined');
            }
            descriptor = decorated;
        }
    }
    return descriptor;
}
function $define(metadataKey, metadataValue, target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.define', [metadataKey, metadataValue, target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[DefineMetadata]](metadataKey, metadataValue, propertyKey).
    return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, toPropertyKeyOrUndefined(propertyKey));
}
function $has(metadataKey, target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.has', [metadataKey, target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[HasMetadata]](metadataKey, propertyKey).
    return OrdinaryHasMetadata(metadataKey, target, toPropertyKeyOrUndefined(propertyKey));
}
function $hasOwn(metadataKey, target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.hasOwn', [metadataKey, target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[HasOwn]](metadataKey, propertyKey).
    return OrdinaryHasOwnMetadata(metadataKey, target, toPropertyKeyOrUndefined(propertyKey));
}
function $get(metadataKey, target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.get', [metadataKey, target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[GetMetadata]](metadataKey, propertyKey).
    return OrdinaryGetMetadata(metadataKey, target, toPropertyKeyOrUndefined(propertyKey));
}
function $getOwn(metadataKey, target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.getOwn', [metadataKey, target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[GetOwnMetadata]](metadataKey, propertyKey).
    return OrdinaryGetOwnMetadata(metadataKey, target, toPropertyKeyOrUndefined(propertyKey));
}
function $getKeys(target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.getKeys', [target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[GetMetadataKeys]](propertyKey).
    return OrdinaryMetadataKeys(target, toPropertyKeyOrUndefined(propertyKey));
}
function $getOwnKeys(target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.getOwnKeys', [target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[GetOwnMetadataKeys]](propertyKey).
    return OrdinaryOwnMetadataKeys(target, toPropertyKeyOrUndefined(propertyKey));
}
function $delete$2(metadataKey, target, propertyKey) {
    // 1. If Type(target) is not Object, throw a TypeError exception.
    if (!isObject(target)) {
        throw $typeError('Metadata.delete', [metadataKey, target, propertyKey], 'target', target, 'Object or Function');
    }
    // 2. Return ? target.[[DeleteMetadata]](metadataKey, propertyKey).
    return OrdinaryDeleteMetadata(target, metadataKey, toPropertyKeyOrUndefined(propertyKey));
}
const Metadata = {
    define: $define,
    has: $has,
    hasOwn: $hasOwn,
    get: $get,
    getOwn: $getOwn,
    getKeys: $getKeys,
    getOwnKeys: $getOwnKeys,
    delete: $delete$2,
};
function def$1(obj, key, value, writable, configurable) {
    if (!Reflect.defineProperty(obj, key, {
        writable,
        enumerable: false,
        configurable,
        value,
    })) {
        throw new Error(`Unable to apply metadata polyfill: could not add property '${key}' to the global Reflect object`);
    }
}
const internalSlotName = '[[$au]]';
function hasInternalSlot(reflect) {
    return internalSlotName in reflect;
}
function $applyMetadataPolyfill(reflect, writable, configurable) {
    def$1(reflect, internalSlotName, metadataInternalSlot, writable, configurable);
    def$1(reflect, 'metadata', metadata, writable, configurable);
    def$1(reflect, 'decorate', decorate, writable, configurable);
    def$1(reflect, 'defineMetadata', $define, writable, configurable);
    def$1(reflect, 'hasMetadata', $has, writable, configurable);
    def$1(reflect, 'hasOwnMetadata', $hasOwn, writable, configurable);
    def$1(reflect, 'getMetadata', $get, writable, configurable);
    def$1(reflect, 'getOwnMetadata', $getOwn, writable, configurable);
    def$1(reflect, 'getMetadataKeys', $getKeys, writable, configurable);
    def$1(reflect, 'getOwnMetadataKeys', $getOwnKeys, writable, configurable);
    def$1(reflect, 'deleteMetadata', $delete$2, writable, configurable);
}
function applyMetadataPolyfill(reflect, throwIfConflict = true, forceOverwrite = false, writable = true, configurable = true) {
    if (hasInternalSlot(reflect)) {
        if (reflect[internalSlotName] === metadataInternalSlot) {
            return;
        }
        throw new Error(`Conflicting @aurelia/metadata module import detected. Please make sure you have the same version of all Aurelia packages in your dependency tree.`);
    }
    const presentProps = [
        'metadata',
        'decorate',
        'defineMetadata',
        'hasMetadata',
        'hasOwnMetadata',
        'getMetadata',
        'getOwnMetadata',
        'getMetadataKeys',
        'getOwnMetadataKeys',
        'deleteMetadata',
    ].filter(function (p) {
        return p in Reflect;
    });
    if (presentProps.length > 0) {
        if (throwIfConflict) {
            const implementationSummary = presentProps.map(function (p) {
                const impl = `${Reflect[p].toString().slice(0, 100)}...`;
                return `${p}:\n${impl}`;
            }).join('\n\n');
            throw new Error(`Conflicting reflect.metadata polyfill found. If you have 'reflect-metadata' or any other reflect polyfill imported, please remove it, if not (or if you must use a specific polyfill) please file an issue at https://github.com/aurelia/aurelia/issues so that we can look into compatibility options for this scenario. Implementation summary:\n\n${implementationSummary}`);
        }
        else if (forceOverwrite) {
            $applyMetadataPolyfill(reflect, writable, configurable);
        }
    }
    else {
        $applyMetadataPolyfill(reflect, writable, configurable);
    }
}

const isNumericLookup = {};
/**
 * Efficiently determine whether the provided property key is numeric
 * (and thus could be an array indexer) or not.
 *
 * Always returns true for values of type `'number'`.
 *
 * Otherwise, only returns true for strings that consist only of positive integers.
 *
 * Results are cached.
 */
function isArrayIndex(value) {
    switch (typeof value) {
        case 'number':
            return value >= 0 && (value | 0) === value;
        case 'string': {
            const result = isNumericLookup[value];
            if (result !== void 0) {
                return result;
            }
            const length = value.length;
            if (length === 0) {
                return isNumericLookup[value] = false;
            }
            let ch = 0;
            for (let i = 0; i < length; ++i) {
                ch = value.charCodeAt(i);
                if (i === 0 && ch === 0x30 && length > 1 /* must not start with 0 */ || ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
                    return isNumericLookup[value] = false;
                }
            }
            return isNumericLookup[value] = true;
        }
        default:
            return false;
    }
}
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isNumberOrBigInt(value) {
    switch (typeof value) {
        case 'number':
        case 'bigint':
            return true;
        default:
            return false;
    }
}
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isStringOrDate(value) {
    switch (typeof value) {
        case 'string':
            return true;
        case 'object':
            return value instanceof Date;
        default:
            return false;
    }
}
/**
 * Base implementation of camel and kebab cases
 */
const baseCase = (function () {
    let CharKind;
    (function (CharKind) {
        CharKind[CharKind["none"] = 0] = "none";
        CharKind[CharKind["digit"] = 1] = "digit";
        CharKind[CharKind["upper"] = 2] = "upper";
        CharKind[CharKind["lower"] = 3] = "lower";
    })(CharKind || (CharKind = {}));
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const isDigit = Object.assign(Object.create(null), {
        '0': true,
        '1': true,
        '2': true,
        '3': true,
        '4': true,
        '5': true,
        '6': true,
        '7': true,
        '8': true,
        '9': true,
    });
    function charToKind(char) {
        if (char === '') {
            // We get this if we do charAt() with an index out of range
            return 0 /* none */;
        }
        if (char !== char.toUpperCase()) {
            return 3 /* lower */;
        }
        if (char !== char.toLowerCase()) {
            return 2 /* upper */;
        }
        if (isDigit[char] === true) {
            return 1 /* digit */;
        }
        return 0 /* none */;
    }
    return function (input, cb) {
        const len = input.length;
        if (len === 0) {
            return input;
        }
        let sep = false;
        let output = '';
        let prevKind;
        let curChar = '';
        let curKind = 0 /* none */;
        let nextChar = input.charAt(0);
        let nextKind = charToKind(nextChar);
        for (let i = 0; i < len; ++i) {
            prevKind = curKind;
            curChar = nextChar;
            curKind = nextKind;
            nextChar = input.charAt(i + 1);
            nextKind = charToKind(nextChar);
            if (curKind === 0 /* none */) {
                if (output.length > 0) {
                    // Only set sep to true if it's not at the beginning of output.
                    sep = true;
                }
            }
            else {
                if (!sep && output.length > 0 && curKind === 2 /* upper */) {
                    // Separate UAFoo into UA Foo.
                    // Separate uaFOO into ua FOO.
                    sep = prevKind === 3 /* lower */ || nextKind === 3 /* lower */;
                }
                output += cb(curChar, sep);
                sep = false;
            }
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to camelCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
 *
 * Results are cached.
 */
const camelCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? char.toUpperCase() : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to PascalCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert element names to class names for synthetic types.
 *
 * Results are cached.
 */
const pascalCase = (function () {
    const cache = Object.create(null);
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = camelCase(input);
            if (output.length > 0) {
                output = output[0].toUpperCase() + output.slice(1);
            }
            cache[input] = output;
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to kebab-case.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
 *
 * Results are cached.
 */
const kebabCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? `-${char.toLowerCase()}` : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
 *
 * Primarily used by Aurelia to convert DOM node lists to arrays.
 */
function toArray(input) {
    // benchmark: http://jsben.ch/xjsyF
    const { length } = input;
    const arr = Array(length);
    for (let i = 0; i < length; ++i) {
        arr[i] = input[i];
    }
    return arr;
}
const ids = {};
/**
 * Retrieve the next ID in a sequence for a given string, starting with `1`.
 *
 * Used by Aurelia to assign unique ID's to controllers and resources.
 *
 * Aurelia will always prepend the context name with `au$`, so as long as you avoid
 * using that convention you should be safe from collisions.
 */
function nextId(context) {
    if (ids[context] === void 0) {
        ids[context] = 0;
    }
    return ++ids[context];
}
/**
 * A compare function to pass to `Array.prototype.sort` for sorting numbers.
 * This is needed for numeric sort, since the default sorts them as strings.
 */
function compareNumber(a, b) {
    return a - b;
}
/**
 * Decorator. (lazily) bind the method to the class instance on first call.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function bound(target, key, descriptor) {
    return {
        configurable: true,
        enumerable: descriptor.enumerable,
        get() {
            const boundFn = descriptor.value.bind(this);
            Reflect.defineProperty(this, key, {
                value: boundFn,
                writable: true,
                configurable: true,
                enumerable: descriptor.enumerable,
            });
            return boundFn;
        },
    };
}
function mergeArrays(...arrays) {
    const result = [];
    let k = 0;
    const arraysLen = arrays.length;
    let arrayLen = 0;
    let array;
    for (let i = 0; i < arraysLen; ++i) {
        array = arrays[i];
        if (array !== void 0) {
            arrayLen = array.length;
            for (let j = 0; j < arrayLen; ++j) {
                result[k++] = array[j];
            }
        }
    }
    return result;
}
function firstDefined(...values) {
    const len = values.length;
    let value;
    for (let i = 0; i < len; ++i) {
        value = values[i];
        if (value !== void 0) {
            return value;
        }
    }
    throw new Error(`No default value found`);
}
const getPrototypeChain = (function () {
    const functionPrototype = Function.prototype;
    const getPrototypeOf = Object.getPrototypeOf;
    const cache = new WeakMap();
    let proto = functionPrototype;
    let i = 0;
    let chain = void 0;
    return function (Type) {
        chain = cache.get(Type);
        if (chain === void 0) {
            cache.set(Type, chain = [proto = Type]);
            i = 0;
            while ((proto = getPrototypeOf(proto)) !== functionPrototype) {
                chain[++i] = proto;
            }
        }
        return chain;
    };
})();
function toLookup$1(...objs) {
    return Object.assign(Object.create(null), ...objs);
}
/**
 * Determine whether the value is a native function.
 *
 * @param fn - The function to check.
 * @returns `true` is the function is a native function, otherwise `false`
 */
const isNativeFunction = (function () {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const lookup = new WeakMap();
    let isNative = false;
    let sourceText = '';
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (fn) {
        isNative = lookup.get(fn);
        if (isNative === void 0) {
            sourceText = fn.toString();
            i = sourceText.length;
            // http://www.ecma-international.org/ecma-262/#prod-NativeFunction
            isNative = (
            // 29 is the length of 'function () { [native code] }' which is the smallest length of a native function string
            i >= 29 &&
                // 100 seems to be a safe upper bound of the max length of a native function. In Chrome and FF it's 56, in Edge it's 61.
                i <= 100 &&
                // This whole heuristic *could* be tricked by a comment. Do we need to care about that?
                sourceText.charCodeAt(i - 1) === 0x7D && // }
                // TODO: the spec is a little vague about the precise constraints, so we do need to test this across various browsers to make sure just one whitespace is a safe assumption.
                sourceText.charCodeAt(i - 2) <= 0x20 && // whitespace
                sourceText.charCodeAt(i - 3) === 0x5D && // ]
                sourceText.charCodeAt(i - 4) === 0x65 && // e
                sourceText.charCodeAt(i - 5) === 0x64 && // d
                sourceText.charCodeAt(i - 6) === 0x6F && // o
                sourceText.charCodeAt(i - 7) === 0x63 && // c
                sourceText.charCodeAt(i - 8) === 0x20 && //
                sourceText.charCodeAt(i - 9) === 0x65 && // e
                sourceText.charCodeAt(i - 10) === 0x76 && // v
                sourceText.charCodeAt(i - 11) === 0x69 && // i
                sourceText.charCodeAt(i - 12) === 0x74 && // t
                sourceText.charCodeAt(i - 13) === 0x61 && // a
                sourceText.charCodeAt(i - 14) === 0x6E && // n
                sourceText.charCodeAt(i - 15) === 0x58 // [
            );
            lookup.set(fn, isNative);
        }
        return isNative;
    };
})();
/**
 * Normalize a potential promise via a callback, to ensure things stay synchronous when they can.
 *
 * If the value is a promise, it is `then`ed before the callback is invoked. Otherwise the callback is invoked synchronously.
 */
function onResolve(maybePromise, resolveCallback) {
    if (maybePromise instanceof Promise) {
        return maybePromise.then(resolveCallback);
    }
    return resolveCallback(maybePromise);
}
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
function resolveAll(...maybePromises) {
    let maybePromise = void 0;
    let firstPromise = void 0;
    let promises = void 0;
    for (let i = 0, ii = maybePromises.length; i < ii; ++i) {
        maybePromise = maybePromises[i];
        if ((maybePromise = maybePromises[i]) instanceof Promise) {
            if (firstPromise === void 0) {
                firstPromise = maybePromise;
            }
            else if (promises === void 0) {
                promises = [firstPromise, maybePromise];
            }
            else {
                promises.push(maybePromise);
            }
        }
    }
    if (promises === void 0) {
        return firstPromise;
    }
    return Promise.all(promises);
}

const annotation = {
    name: 'au:annotation',
    appendTo(target, key) {
        const keys = Metadata.getOwn(annotation.name, target);
        if (keys === void 0) {
            Metadata.define(annotation.name, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    set(target, prop, value) {
        Metadata.define(annotation.keyFor(prop), value, target);
    },
    get(target, prop) {
        return Metadata.getOwn(annotation.keyFor(prop), target);
    },
    getKeys(target) {
        let keys = Metadata.getOwn(annotation.name, target);
        if (keys === void 0) {
            Metadata.define(annotation.name, keys = [], target);
        }
        return keys;
    },
    isKey(key) {
        return key.startsWith(annotation.name);
    },
    keyFor(name, context) {
        if (context === void 0) {
            return `${annotation.name}:${name}`;
        }
        return `${annotation.name}:${name}:${context}`;
    },
};
const resource = {
    name: 'au:resource',
    appendTo(target, key) {
        const keys = Metadata.getOwn(resource.name, target);
        if (keys === void 0) {
            Metadata.define(resource.name, [key], target);
        }
        else {
            keys.push(key);
        }
    },
    has(target) {
        return Metadata.hasOwn(resource.name, target);
    },
    getAll(target) {
        const keys = Metadata.getOwn(resource.name, target);
        if (keys === void 0) {
            return emptyArray;
        }
        else {
            return keys.map(k => Metadata.getOwn(k, target));
        }
    },
    getKeys(target) {
        let keys = Metadata.getOwn(resource.name, target);
        if (keys === void 0) {
            Metadata.define(resource.name, keys = [], target);
        }
        return keys;
    },
    isKey(key) {
        return key.startsWith(resource.name);
    },
    keyFor(name, context) {
        if (context === void 0) {
            return `${resource.name}:${name}`;
        }
        return `${resource.name}:${name}:${context}`;
    },
};
const Protocol = {
    annotation,
    resource,
};
const hasOwn$1 = Object.prototype.hasOwnProperty;
/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override the definition as well as static properties on the type.
 * 2. Definition properties (usually set by the customElement decorator object literal) come next. They override static properties on the type.
 * 3. Static properties on the type come last. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 4. The default property that is provided last. The function is only called if the default property is needed
 */
function fromAnnotationOrDefinitionOrTypeOrDefault(name, def, Type, getDefault) {
    let value = Metadata.getOwn(Protocol.annotation.keyFor(name), Type);
    if (value === void 0) {
        value = def[name];
        if (value === void 0) {
            value = Type[name];
            if (value === void 0 || !hasOwn$1.call(Type, name)) { // First just check the value (common case is faster), but do make sure it doesn't come from the proto chain
                return getDefault();
            }
            return value;
        }
        return value;
    }
    return value;
}
/**
 * The order in which the values are checked:
 * 1. Annotations (usually set by decorators) have the highest priority; they override static properties on the type.
 * 2. Static properties on the typ. Note that this does not look up the prototype chain (bindables are an exception here, but we do that differently anyway)
 * 3. The default property that is provided last. The function is only called if the default property is needed
 */
function fromAnnotationOrTypeOrDefault(name, Type, getDefault) {
    let value = Metadata.getOwn(Protocol.annotation.keyFor(name), Type);
    if (value === void 0) {
        value = Type[name];
        if (value === void 0 || !hasOwn$1.call(Type, name)) { // First just check the value (common case is faster), but do make sure it doesn't come from the proto chain
            return getDefault();
        }
        return value;
    }
    return value;
}
/**
 * The order in which the values are checked:
 * 1. Definition properties.
 * 2. The default property that is provided last. The function is only called if the default property is needed
 */
function fromDefinitionOrDefault(name, def, getDefault) {
    const value = def[name];
    if (value === void 0) {
        return getDefault();
    }
    return value;
}

applyMetadataPolyfill(Reflect, false, false);
class ResolverBuilder {
    constructor(container, key) {
        this.container = container;
        this.key = key;
    }
    instance(value) {
        return this.registerResolver(0 /* instance */, value);
    }
    singleton(value) {
        return this.registerResolver(1 /* singleton */, value);
    }
    transient(value) {
        return this.registerResolver(2 /* transient */, value);
    }
    callback(value) {
        return this.registerResolver(3 /* callback */, value);
    }
    cachedCallback(value) {
        return this.registerResolver(3 /* callback */, cacheCallbackResult(value));
    }
    aliasTo(destinationKey) {
        return this.registerResolver(5 /* alias */, destinationKey);
    }
    registerResolver(strategy, state) {
        const { container, key } = this;
        this.container = this.key = (void 0);
        return container.registerResolver(key, new Resolver(key, strategy, state));
    }
}
function cloneArrayWithPossibleProps(source) {
    const clone = source.slice();
    const keys = Object.keys(source);
    const len = keys.length;
    let key;
    for (let i = 0; i < len; ++i) {
        key = keys[i];
        if (!isArrayIndex(key)) {
            clone[key] = source[key];
        }
    }
    return clone;
}
const DefaultResolver = {
    none(key) { throw Error(`${key.toString()} not registered, did you forget to add @singleton()?`); },
    singleton(key) { return new Resolver(key, 1 /* singleton */, key); },
    transient(key) { return new Resolver(key, 2 /* transient */, key); },
};
class ContainerConfiguration {
    constructor(inheritParentResources, defaultResolver) {
        this.inheritParentResources = inheritParentResources;
        this.defaultResolver = defaultResolver;
    }
    static from(config) {
        var _a, _b;
        if (config === void 0 ||
            config === ContainerConfiguration.DEFAULT) {
            return ContainerConfiguration.DEFAULT;
        }
        return new ContainerConfiguration((_a = config.inheritParentResources) !== null && _a !== void 0 ? _a : false, (_b = config.defaultResolver) !== null && _b !== void 0 ? _b : DefaultResolver.singleton);
    }
}
ContainerConfiguration.DEFAULT = ContainerConfiguration.from({});
const DI = {
    createContainer(config) {
        return new Container(null, ContainerConfiguration.from(config));
    },
    getDesignParamtypes(Type) {
        return Metadata.getOwn('design:paramtypes', Type);
    },
    getAnnotationParamtypes(Type) {
        const key = Protocol.annotation.keyFor('di:paramtypes');
        return Metadata.getOwn(key, Type);
    },
    getOrCreateAnnotationParamTypes(Type) {
        const key = Protocol.annotation.keyFor('di:paramtypes');
        let annotationParamtypes = Metadata.getOwn(key, Type);
        if (annotationParamtypes === void 0) {
            Metadata.define(key, annotationParamtypes = [], Type);
            Protocol.annotation.appendTo(Type, key);
        }
        return annotationParamtypes;
    },
    getDependencies(Type) {
        // Note: Every detail of this getDependencies method is pretty deliberate at the moment, and probably not yet 100% tested from every possible angle,
        // so be careful with making changes here as it can have a huge impact on complex end user apps.
        // Preferably, only make changes to the dependency resolution process via a RFC.
        const key = Protocol.annotation.keyFor('di:dependencies');
        let dependencies = Metadata.getOwn(key, Type);
        if (dependencies === void 0) {
            // Type.length is the number of constructor parameters. If this is 0, it could mean the class has an empty constructor
            // but it could also mean the class has no constructor at all (in which case it inherits the constructor from the prototype).
            // Non-zero constructor length + no paramtypes means emitDecoratorMetadata is off, or the class has no decorator.
            // We're not doing anything with the above right now, but it's good to keep in mind for any future issues.
            const inject = Type.inject;
            if (inject === void 0) {
                // design:paramtypes is set by tsc when emitDecoratorMetadata is enabled.
                const designParamtypes = DI.getDesignParamtypes(Type);
                // au:annotation:di:paramtypes is set by the parameter decorator from DI.createInterface or by @inject
                const annotationParamtypes = DI.getAnnotationParamtypes(Type);
                if (designParamtypes === void 0) {
                    if (annotationParamtypes === void 0) {
                        // Only go up the prototype if neither static inject nor any of the paramtypes is defined, as
                        // there is no sound way to merge a type's deps with its prototype's deps
                        const Proto = Object.getPrototypeOf(Type);
                        if (typeof Proto === 'function' && Proto !== Function.prototype) {
                            dependencies = cloneArrayWithPossibleProps(DI.getDependencies(Proto));
                        }
                        else {
                            dependencies = [];
                        }
                    }
                    else {
                        // No design:paramtypes so just use the au:annotation:di:paramtypes
                        dependencies = cloneArrayWithPossibleProps(annotationParamtypes);
                    }
                }
                else if (annotationParamtypes === void 0) {
                    // No au:annotation:di:paramtypes so just use the design:paramtypes
                    dependencies = cloneArrayWithPossibleProps(designParamtypes);
                }
                else {
                    // We've got both, so merge them (in case of conflict on same index, au:annotation:di:paramtypes take precedence)
                    dependencies = cloneArrayWithPossibleProps(designParamtypes);
                    let len = annotationParamtypes.length;
                    let auAnnotationParamtype;
                    for (let i = 0; i < len; ++i) {
                        auAnnotationParamtype = annotationParamtypes[i];
                        if (auAnnotationParamtype !== void 0) {
                            dependencies[i] = auAnnotationParamtype;
                        }
                    }
                    const keys = Object.keys(annotationParamtypes);
                    len = keys.length;
                    let key;
                    for (let i = 0; i < len; ++i) {
                        key = keys[i];
                        if (!isArrayIndex(key)) {
                            dependencies[key] = annotationParamtypes[key];
                        }
                    }
                }
            }
            else {
                // Ignore paramtypes if we have static inject
                dependencies = cloneArrayWithPossibleProps(inject);
            }
            Metadata.define(key, dependencies, Type);
            Protocol.annotation.appendTo(Type, key);
        }
        return dependencies;
    },
    /**
     * creates a decorator that also matches an interface and can be used as a {@linkcode Key}.
     * ```ts
     * const ILogger = DI.createInterface<Logger>('Logger');
     * container.register(Registration.singleton(ILogger, getSomeLogger()));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * you can also build default registrations into your interface.
     * ```ts
     * export const ILogger = DI.createInterface<Logger>('Logger', builder => builder.cachedCallback(LoggerDefault));
     * const log = container.get(ILogger);
     * log.info('hello world');
     * class Foo {
     *   constructor( @ILogger log: ILogger ) {
     *     log.info('hello world');
     *   }
     * }
     * ```
     * but these default registrations won't work the same with other decorators that take keys, for example
     * ```ts
     * export const MyStr = DI.createInterface<string>('MyStr', builder => builder.instance('somestring'));
     * class Foo {
     *   constructor( @optional(MyStr) public readonly str: string ) {
     *   }
     * }
     * container.get(Foo).str; // returns undefined
     * ```
     * to fix this add this line somewhere before you do a `get`
     * ```ts
     * container.register(MyStr);
     * container.get(Foo).str; // returns 'somestring'
     * ```
     *
     * - @param friendlyName used to improve error messaging
     */
    createInterface(configureOrName, configuror) {
        const configure = typeof configureOrName === 'function' ? configureOrName : configuror;
        const friendlyName = typeof configureOrName === 'string' ? configureOrName : undefined;
        const Interface = function (target, property, index) {
            if (target == null || new.target !== undefined) {
                throw new Error(`No registration for interface: '${Interface.friendlyName}'`); // TODO: add error (trying to resolve an InterfaceSymbol that has no registrations)
            }
            const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
            annotationParamtypes[index] = Interface;
        };
        Interface.$isInterface = true;
        Interface.friendlyName = friendlyName == null ? '(anonymous)' : friendlyName;
        if (configure != null) {
            Interface.register = function (container, key) {
                return configure(new ResolverBuilder(container, key !== null && key !== void 0 ? key : Interface));
            };
        }
        Interface.toString = function toString() {
            return `InterfaceSymbol<${Interface.friendlyName}>`;
        };
        return Interface;
    },
    inject(...dependencies) {
        return function (target, key, descriptor) {
            if (typeof descriptor === 'number') { // It's a parameter decorator.
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
                const dep = dependencies[0];
                if (dep !== void 0) {
                    annotationParamtypes[descriptor] = dep;
                }
            }
            else if (key) { // It's a property decorator. Not supported by the container without plugins.
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target.constructor);
                const dep = dependencies[0];
                if (dep !== void 0) {
                    annotationParamtypes[key] = dep;
                }
            }
            else if (descriptor) { // It's a function decorator (not a Class constructor)
                const fn = descriptor.value;
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(fn);
                let dep;
                for (let i = 0; i < dependencies.length; ++i) {
                    dep = dependencies[i];
                    if (dep !== void 0) {
                        annotationParamtypes[i] = dep;
                    }
                }
            }
            else { // It's a class decorator.
                const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
                let dep;
                for (let i = 0; i < dependencies.length; ++i) {
                    dep = dependencies[i];
                    if (dep !== void 0) {
                        annotationParamtypes[i] = dep;
                    }
                }
            }
        };
    },
    /**
     * Registers the `target` class as a transient dependency; each time the dependency is resolved
     * a new instance will be created.
     *
     * @param target - The class / constructor function to register as transient.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     *
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.transient(Foo);
     *
     * // Inline declaration
     * const Foo = DI.transient(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    transient(target) {
        target.register = function register(container) {
            const registration = Registration.transient(target, target);
            return registration.register(container, target);
        };
        target.registerInRequestor = false;
        return target;
    },
    /**
     * Registers the `target` class as a singleton dependency; the class will only be created once. Each
     * consecutive time the dependency is resolved, the same instance will be returned.
     *
     * @param target - The class / constructor function to register as a singleton.
     * @returns The same class, with a static `register` method that takes a container and returns the appropriate resolver.
     * @example ```ts
     * // On an existing class
     * class Foo { }
     * DI.singleton(Foo);
     *
     * // Inline declaration
     * const Foo = DI.singleton(class { });
     * // Foo is now strongly typed with register
     * Foo.register(container);
     * ```
     */
    singleton(target, options = defaultSingletonOptions) {
        target.register = function register(container) {
            const registration = Registration.singleton(target, target);
            return registration.register(container, target);
        };
        target.registerInRequestor = options.scoped;
        return target;
    },
};
const IContainer = DI.createInterface('IContainer');
const IServiceLocator = IContainer;
function createResolver(getter) {
    return function (key) {
        const resolver = function (target, property, descriptor) {
            DI.inject(resolver)(target, property, descriptor);
        };
        resolver.$isResolver = true;
        resolver.resolve = function (handler, requestor) {
            return getter(key, handler, requestor);
        };
        return resolver;
    };
}
const defaultSingletonOptions = { scoped: false };
function createAllResolver(getter) {
    return function (key, searchAncestors) {
        searchAncestors = !!searchAncestors;
        const resolver = function (target, property, descriptor) {
            DI.inject(resolver)(target, property, descriptor);
        };
        resolver.$isResolver = true;
        resolver.resolve = function (handler, requestor) {
            return getter(key, handler, requestor, searchAncestors);
        };
        return resolver;
    };
}
const all = createAllResolver((key, handler, requestor, searchAncestors) => requestor.getAll(key, searchAncestors));
/**
 * Allows you to optionally inject a dependency depending on whether the [[`Key`]] is present, for example
 * ```ts
 * class Foo {
 *   constructor( @inject('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo); // throws
 * ```
 * would fail
 * ```ts
 * class Foo {
 *   constructor( @optional('mystring') public str: string = 'somestring' )
 * }
 * container.get(Foo).str // somestring
 * ```
 * if you use it without a default it will inject `undefined`, so rember to mark your input type as
 * possibly `undefined`!
 *
 * - @param key: [[`Key`]]
 *
 * see { @link DI.createInterface } on interactions with interfaces
 */
const optional$1 = createResolver((key, handler, requestor) => {
    if (requestor.has(key, true)) {
        return requestor.get(key);
    }
    else {
        return undefined;
    }
});
/**
 * ignore tells the container not to try to inject a dependency
 */
function ignore(target, property, descriptor) {
    DI.inject(ignore)(target, property, descriptor);
}
ignore.$isResolver = true;
ignore.resolve = () => undefined;
/** @internal */
var ResolverStrategy;
(function (ResolverStrategy) {
    ResolverStrategy[ResolverStrategy["instance"] = 0] = "instance";
    ResolverStrategy[ResolverStrategy["singleton"] = 1] = "singleton";
    ResolverStrategy[ResolverStrategy["transient"] = 2] = "transient";
    ResolverStrategy[ResolverStrategy["callback"] = 3] = "callback";
    ResolverStrategy[ResolverStrategy["array"] = 4] = "array";
    ResolverStrategy[ResolverStrategy["alias"] = 5] = "alias";
})(ResolverStrategy || (ResolverStrategy = {}));
/** @internal */
class Resolver {
    constructor(key, strategy, state) {
        this.key = key;
        this.strategy = strategy;
        this.state = state;
        this.resolving = false;
    }
    get $isResolver() { return true; }
    register(container, key) {
        return container.registerResolver(key || this.key, this);
    }
    resolve(handler, requestor) {
        switch (this.strategy) {
            case 0 /* instance */:
                return this.state;
            case 1 /* singleton */: {
                if (this.resolving) {
                    throw new Error(`Cyclic dependency found: ${this.state.name}`);
                }
                this.resolving = true;
                this.state = handler.getFactory(this.state).construct(requestor);
                this.strategy = 0 /* instance */;
                this.resolving = false;
                return this.state;
            }
            case 2 /* transient */: {
                // Always create transients from the requesting container
                const factory = handler.getFactory(this.state);
                if (factory === null) {
                    throw new Error(`Resolver for ${String(this.key)} returned a null factory`);
                }
                return factory.construct(requestor);
            }
            case 3 /* callback */:
                return this.state(handler, requestor, this);
            case 4 /* array */:
                return this.state[0].resolve(handler, requestor);
            case 5 /* alias */:
                return requestor.get(this.state);
            default:
                throw new Error(`Invalid resolver strategy specified: ${this.strategy}.`);
        }
    }
    getFactory(container) {
        var _a, _b, _c;
        switch (this.strategy) {
            case 1 /* singleton */:
            case 2 /* transient */:
                return container.getFactory(this.state);
            case 5 /* alias */:
                return (_c = (_b = (_a = container.getResolver(this.state)) === null || _a === void 0 ? void 0 : _a.getFactory) === null || _b === void 0 ? void 0 : _b.call(_a, container)) !== null && _c !== void 0 ? _c : null;
            default:
                return null;
        }
    }
}
function containerGetKey(d) {
    return this.get(d);
}
function transformInstance(inst, transform) {
    return transform(inst);
}
/** @internal */
class Factory {
    constructor(Type, dependencies) {
        this.Type = Type;
        this.dependencies = dependencies;
        this.transformers = null;
    }
    construct(container, dynamicDependencies) {
        let instance;
        if (dynamicDependencies === void 0) {
            instance = new this.Type(...this.dependencies.map(containerGetKey, container));
        }
        else {
            instance = new this.Type(...this.dependencies.map(containerGetKey, container), ...dynamicDependencies);
        }
        if (this.transformers == null) {
            return instance;
        }
        return this.transformers.reduce(transformInstance, instance);
    }
    registerTransformer(transformer) {
        var _a;
        ((_a = this.transformers) !== null && _a !== void 0 ? _a : (this.transformers = [])).push(transformer);
    }
}
const containerResolver = {
    $isResolver: true,
    resolve(handler, requestor) {
        return requestor;
    }
};
function isRegistry(obj) {
    return typeof obj.register === 'function';
}
function isSelfRegistry(obj) {
    return isRegistry(obj) && typeof obj.registerInRequestor === 'boolean';
}
function isRegisterInRequester(obj) {
    return isSelfRegistry(obj) && obj.registerInRequestor;
}
function isClass(obj) {
    return obj.prototype !== void 0;
}
function isResourceKey(key) {
    return typeof key === 'string' && key.indexOf(':') > 0;
}
const InstrinsicTypeNames = new Set([
    'Array',
    'ArrayBuffer',
    'Boolean',
    'DataView',
    'Date',
    'Error',
    'EvalError',
    'Float32Array',
    'Float64Array',
    'Function',
    'Int8Array',
    'Int16Array',
    'Int32Array',
    'Map',
    'Number',
    'Object',
    'Promise',
    'RangeError',
    'ReferenceError',
    'RegExp',
    'Set',
    'SharedArrayBuffer',
    'String',
    'SyntaxError',
    'TypeError',
    'Uint8Array',
    'Uint8ClampedArray',
    'Uint16Array',
    'Uint32Array',
    'URIError',
    'WeakMap',
    'WeakSet',
]);
let containerId = 0;
/** @internal */
class Container {
    constructor(parent, config) {
        this.parent = parent;
        this.config = config;
        this.id = ++containerId;
        this.registerDepth = 0;
        this.disposableResolvers = new Set();
        if (parent === null) {
            this.root = this;
            this.resolvers = new Map();
            this.factories = new Map();
            this.resourceResolvers = Object.create(null);
        }
        else {
            this.root = parent.root;
            this.resolvers = new Map();
            this.factories = parent.factories;
            if (config.inheritParentResources) {
                this.resourceResolvers = Object.assign(Object.create(null), parent.resourceResolvers, this.root.resourceResolvers);
            }
            else {
                this.resourceResolvers = Object.assign(Object.create(null), this.root.resourceResolvers);
            }
        }
        this.resolvers.set(IContainer, containerResolver);
    }
    get depth() {
        return this.parent === null ? 0 : this.parent.depth + 1;
    }
    register(...params) {
        if (++this.registerDepth === 100) {
            throw new Error(`Unable to autoregister dependency: [${params.map(String)}]`);
            // TODO: change to reporter.error and add various possible causes in description.
            // Most likely cause is trying to register a plain object that does not have a
            // register method and is not a class constructor
        }
        let current;
        let keys;
        let value;
        let j;
        let jj;
        for (let i = 0, ii = params.length; i < ii; ++i) {
            current = params[i];
            if (!isObject(current)) {
                continue;
            }
            if (isRegistry(current)) {
                current.register(this);
            }
            else if (Protocol.resource.has(current)) {
                const defs = Protocol.resource.getAll(current);
                if (defs.length === 1) {
                    // Fast path for the very common case
                    defs[0].register(this);
                }
                else {
                    const len = defs.length;
                    for (let d = 0; d < len; ++d) {
                        defs[d].register(this);
                    }
                }
            }
            else if (isClass(current)) {
                Registration.singleton(current, current).register(this);
            }
            else {
                keys = Object.keys(current);
                j = 0;
                jj = keys.length;
                for (; j < jj; ++j) {
                    value = current[keys[j]];
                    if (!isObject(value)) {
                        continue;
                    }
                    // note: we could remove this if-branch and call this.register directly
                    // - the extra check is just a perf tweak to create fewer unnecessary arrays by the spread operator
                    if (isRegistry(value)) {
                        value.register(this);
                    }
                    else {
                        this.register(value);
                    }
                }
            }
        }
        --this.registerDepth;
        return this;
    }
    registerResolver(key, resolver, isDisposable = false) {
        validateKey(key);
        const resolvers = this.resolvers;
        const result = resolvers.get(key);
        if (result == null) {
            resolvers.set(key, resolver);
            if (isResourceKey(key)) {
                this.resourceResolvers[key] = resolver;
            }
        }
        else if (result instanceof Resolver && result.strategy === 4 /* array */) {
            result.state.push(resolver);
        }
        else {
            resolvers.set(key, new Resolver(key, 4 /* array */, [result, resolver]));
        }
        if (isDisposable) {
            this.disposableResolvers.add(resolver);
        }
        return resolver;
    }
    // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
    //   // const console =  (globalThis as any).console;
    //   // console.group("deregisterResolverFor");
    //   validateKey(key);
    //   let current: Container = this;
    //   let resolver: IResolver | undefined;
    //   while (current != null) {
    //     resolver = current.resolvers.get(key);
    //     if (resolver != null) { break; }
    //     if (current.parent == null) { return; }
    //     current = current.parent;
    //   }
    //   if (resolver === void 0) { return; }
    //   if (resolver instanceof Resolver && resolver.strategy === ResolverStrategy.array) {
    //     throw new Error('Cannot deregister a resolver with array strategy');
    //   }
    //   if (this.disposableResolvers.has(resolver as IDisposableResolver<T>)) {
    //     (resolver as IDisposableResolver<T>).dispose();
    //   }
    //   if (isResourceKey(key)) {
    //     // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    //     delete this.resourceResolvers[key];
    //   }
    //   // console.log(`BEFORE delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
    //   current.resolvers.delete(key);
    //   // console.log(`AFTER delete ${Array.from(current.resolvers.keys()).map((k) => k.toString())}`);
    //   // console.groupEnd();
    // }
    registerTransformer(key, transformer) {
        const resolver = this.getResolver(key);
        if (resolver == null) {
            return false;
        }
        if (resolver.getFactory) {
            const factory = resolver.getFactory(this);
            if (factory == null) {
                return false;
            }
            // This type cast is a bit of a hacky one, necessary due to the duplicity of IResolverLike.
            // Problem is that that interface's type arg can be of type Key, but the getFactory method only works on
            // type Constructable. So the return type of that optional method has this additional constraint, which
            // seems to confuse the type checker.
            factory.registerTransformer(transformer);
            return true;
        }
        return false;
    }
    getResolver(key, autoRegister = true) {
        validateKey(key);
        if (key.resolve !== void 0) {
            return key;
        }
        let current = this;
        let resolver;
        while (current != null) {
            resolver = current.resolvers.get(key);
            if (resolver == null) {
                if (current.parent == null) {
                    const handler = (isRegisterInRequester(key)) ? this : current;
                    return autoRegister ? this.jitRegister(key, handler) : null;
                }
                current = current.parent;
            }
            else {
                return resolver;
            }
        }
        return null;
    }
    has(key, searchAncestors = false) {
        return this.resolvers.has(key)
            ? true
            : searchAncestors && this.parent != null
                ? this.parent.has(key, true)
                : false;
    }
    get(key) {
        validateKey(key);
        if (key.$isResolver) {
            return key.resolve(this, this);
        }
        let current = this;
        let resolver;
        while (current != null) {
            resolver = current.resolvers.get(key);
            if (resolver == null) {
                if (current.parent == null) {
                    const handler = (isRegisterInRequester(key)) ? this : current;
                    resolver = this.jitRegister(key, handler);
                    return resolver.resolve(current, this);
                }
                current = current.parent;
            }
            else {
                return resolver.resolve(current, this);
            }
        }
        throw new Error(`Unable to resolve key: ${key}`);
    }
    getAll(key, searchAncestors = false) {
        validateKey(key);
        const requestor = this;
        let current = requestor;
        let resolver;
        if (searchAncestors) {
            let resolutions = emptyArray;
            while (current != null) {
                resolver = current.resolvers.get(key);
                if (resolver != null) {
                    resolutions = resolutions.concat(buildAllResponse(resolver, current, requestor));
                }
                current = current.parent;
            }
            return resolutions;
        }
        else {
            while (current != null) {
                resolver = current.resolvers.get(key);
                if (resolver == null) {
                    current = current.parent;
                    if (current == null) {
                        return emptyArray;
                    }
                }
                else {
                    return buildAllResponse(resolver, current, requestor);
                }
            }
        }
        return emptyArray;
    }
    invoke(Type, dynamicDependencies) {
        if (isNativeFunction(Type)) {
            throw createNativeInvocationError(Type);
        }
        return new Factory(Type, DI.getDependencies(Type)).construct(this, dynamicDependencies);
    }
    getFactory(Type) {
        let factory = this.factories.get(Type);
        if (factory === void 0) {
            if (isNativeFunction(Type)) {
                throw createNativeInvocationError(Type);
            }
            this.factories.set(Type, factory = new Factory(Type, DI.getDependencies(Type)));
        }
        return factory;
    }
    registerFactory(key, factory) {
        this.factories.set(key, factory);
    }
    createChild(config) {
        if (config === void 0 && this.config.inheritParentResources) {
            if (this.config === ContainerConfiguration.DEFAULT) {
                return new Container(this, this.config);
            }
            return new Container(this, ContainerConfiguration.from({
                ...this.config,
                inheritParentResources: false,
            }));
        }
        return new Container(this, ContainerConfiguration.from(config !== null && config !== void 0 ? config : this.config));
    }
    disposeResolvers() {
        var _a;
        const disposables = Array.from(this.disposableResolvers);
        while (disposables.length > 0) {
            (_a = disposables.pop()) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    }
    find(kind, name) {
        const key = kind.keyFrom(name);
        let resolver = this.resourceResolvers[key];
        if (resolver === void 0) {
            resolver = this.root.resourceResolvers[key];
            if (resolver === void 0) {
                return null;
            }
        }
        if (resolver === null) {
            return null;
        }
        if (typeof resolver.getFactory === 'function') {
            const factory = resolver.getFactory(this);
            if (factory === null || factory === void 0) {
                return null;
            }
            const definition = Metadata.getOwn(kind.name, factory.Type);
            if (definition === void 0) {
                // TODO: we may want to log a warning here, or even throw. This would happen if a dependency is registered with a resource-like key
                // but does not actually have a definition associated via the type's metadata. That *should* generally not happen.
                return null;
            }
            return definition;
        }
        return null;
    }
    create(kind, name) {
        var _a, _b;
        const key = kind.keyFrom(name);
        let resolver = this.resourceResolvers[key];
        if (resolver === void 0) {
            resolver = this.root.resourceResolvers[key];
            if (resolver === void 0) {
                return null;
            }
            return (_a = resolver.resolve(this.root, this)) !== null && _a !== void 0 ? _a : null;
        }
        return (_b = resolver.resolve(this, this)) !== null && _b !== void 0 ? _b : null;
    }
    dispose() {
        this.disposeResolvers();
        this.resolvers.clear();
    }
    jitRegister(keyAsValue, handler) {
        if (typeof keyAsValue !== 'function') {
            throw new Error(`Attempted to jitRegister something that is not a constructor: '${keyAsValue}'. Did you forget to register this resource?`);
        }
        if (InstrinsicTypeNames.has(keyAsValue.name)) {
            throw new Error(`Attempted to jitRegister an intrinsic type: ${keyAsValue.name}. Did you forget to add @inject(Key)`);
        }
        if (isRegistry(keyAsValue)) {
            const registrationResolver = keyAsValue.register(handler, keyAsValue);
            if (!(registrationResolver instanceof Object) || registrationResolver.resolve == null) {
                const newResolver = handler.resolvers.get(keyAsValue);
                if (newResolver != void 0) {
                    return newResolver;
                }
                throw new Error(`Invalid resolver returned from the static register method`);
            }
            return registrationResolver;
        }
        else if (Protocol.resource.has(keyAsValue)) {
            const defs = Protocol.resource.getAll(keyAsValue);
            if (defs.length === 1) {
                // Fast path for the very common case
                defs[0].register(handler);
            }
            else {
                const len = defs.length;
                for (let d = 0; d < len; ++d) {
                    defs[d].register(handler);
                }
            }
            const newResolver = handler.resolvers.get(keyAsValue);
            if (newResolver != void 0) {
                return newResolver;
            }
            throw new Error(`Invalid resolver returned from the static register method`);
        }
        else if (keyAsValue.$isInterface) {
            throw new Error(`Attempted to jitRegister an interface: ${keyAsValue.friendlyName}`);
        }
        else {
            const resolver = this.config.defaultResolver(keyAsValue, handler);
            handler.resolvers.set(keyAsValue, resolver);
            return resolver;
        }
    }
}
/**
 * An implementation of IRegistry that delegates registration to a
 * separately registered class. The ParameterizedRegistry facilitates the
 * passing of parameters to the final registry.
 */
class ParameterizedRegistry {
    constructor(key, params) {
        this.key = key;
        this.params = params;
    }
    register(container) {
        if (container.has(this.key, true)) {
            const registry = container.get(this.key);
            registry.register(container, ...this.params);
        }
        else {
            container.register(...this.params.filter(x => typeof x === 'object'));
        }
    }
}
const containerLookup$1 = new WeakMap();
function cacheCallbackResult(fun) {
    return function (handler, requestor, resolver) {
        let resolverLookup = containerLookup$1.get(handler);
        if (resolverLookup === void 0) {
            containerLookup$1.set(handler, resolverLookup = new WeakMap());
        }
        if (resolverLookup.has(resolver)) {
            return resolverLookup.get(resolver);
        }
        const t = fun(handler, requestor, resolver);
        resolverLookup.set(resolver, t);
        return t;
    };
}
/**
 * you can use the resulting {@linkcode IRegistration} of any of the factory methods
 * to register with the container, e.g.
 * ```
 * class Foo {}
 * const container = DI.createContainer();
 * container.register(Registration.instance(Foo, new Foo()));
 * container.get(Foo);
 * ```
 */
const Registration = {
    /**
     * allows you to pass an instance.
     * Every time you request this {@linkcode Key} you will get this instance back.
     * ```
     * Registration.instance(Foo, new Foo()));
     * ```
     *
     * @param key
     * @param value
     */
    instance(key, value) {
        return new Resolver(key, 0 /* instance */, value);
    },
    /**
     * Creates an instance from the class.
     * Every time you request this {@linkcode Key} you will get the same one back.
     * ```
     * Registration.singleton(Foo, Foo);
     * ```
     *
     * @param key
     * @param value
     */
    singleton(key, value) {
        return new Resolver(key, 1 /* singleton */, value);
    },
    /**
     * Creates an instance from a class.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.instance(Foo, Foo);
     * ```
     *
     * @param key
     * @param value
     */
    transient(key, value) {
        return new Resolver(key, 2 /* transient */, value);
    },
    /**
     * Creates an instance from the method passed.
     * Every time you request this {@linkcode Key} you will get a new instance.
     * ```
     * Registration.callback(Foo, () => new Foo());
     * Registration.callback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key
     * @param callback
     */
    callback(key, callback) {
        return new Resolver(key, 3 /* callback */, callback);
    },
    /**
     * Creates an instance from the method passed.
     * On the first request for the {@linkcode Key} your callback is called and returns an instance.
     * subsequent requests for the {@linkcode Key}, the initial instance returned will be returned.
     * If you pass the same {@linkcode Registration} to another container the same cached value will be used.
     * Should all references to the resolver returned be removed, the cache will expire.
     * ```
     * Registration.cachedCallback(Foo, () => new Foo());
     * Registration.cachedCallback(Bar, (c: IContainer) => new Bar(c.get(Foo)));
     * ```
     *
     * @param key
     * @param callback
     */
    cachedCallback(key, callback) {
        return new Resolver(key, 3 /* callback */, cacheCallbackResult(callback));
    },
    /**
     * creates an alternate {@linkcode Key} to retrieve an instance by.
     * Returns the same scope as the original {@linkcode Key}.
     * ```
     * Register.singleton(Foo, Foo)
     * Register.aliasTo(Foo, MyFoos);
     *
     * container.getAll(MyFoos) // contains an instance of Foo
     * ```
     *
     * @param originalKey
     * @param aliasKey
     */
    aliasTo(originalKey, aliasKey) {
        return new Resolver(aliasKey, 5 /* alias */, originalKey);
    },
    /**
     * @internal
     * @param key
     * @param params
     */
    defer(key, ...params) {
        return new ParameterizedRegistry(key, params);
    }
};
class InstanceProvider {
    constructor(friendlyName) {
        this.friendlyName = friendlyName;
        this.instance = null;
    }
    prepare(instance) {
        this.instance = instance;
    }
    get $isResolver() { return true; }
    resolve() {
        if (this.instance == null) {
            throw new Error(`Cannot call resolve ${this.friendlyName} before calling prepare or after calling dispose.`);
        }
        return this.instance;
    }
    dispose() {
        this.instance = null;
    }
}
/** @internal */
function validateKey(key) {
    if (key === null || key === void 0) {
        throw new Error('key/value cannot be null or undefined. Are you trying to inject/register something that doesn\'t exist with DI?');
    }
}
function buildAllResponse(resolver, handler, requestor) {
    if (resolver instanceof Resolver && resolver.strategy === 4 /* array */) {
        const state = resolver.state;
        let i = state.length;
        const results = new Array(i);
        while (i--) {
            results[i] = state[i].resolve(handler, requestor);
        }
        return results;
    }
    return [resolver.resolve(handler, requestor)];
}
function createNativeInvocationError(Type) {
    return new Error(`${Type.name} is a native function and therefore cannot be safely constructed by DI. If this is intentional, please use a callback or cachedCallback resolver.`);
}

/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
const emptyArray = Object.freeze([]);
const emptyObject = Object.freeze({});
/* eslint-enable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() { }
const IPlatform$1 = DI.createInterface('IPlatform');

const lookup$1 = new Map();
function notImplemented$1(name) {
    return function notImplemented() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
    };
}
class Platform {
    constructor(g, overrides = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = g;
        this.decodeURI = 'decodeURI' in overrides ? overrides.decodeURI : g.decodeURI;
        this.decodeURIComponent = 'decodeURIComponent' in overrides ? overrides.decodeURIComponent : g.decodeURIComponent;
        this.encodeURI = 'encodeURI' in overrides ? overrides.encodeURI : g.encodeURI;
        this.encodeURIComponent = 'encodeURIComponent' in overrides ? overrides.encodeURIComponent : g.encodeURIComponent;
        this.Date = 'Date' in overrides ? overrides.Date : g.Date;
        this.Reflect = 'Reflect' in overrides ? overrides.Reflect : g.Reflect;
        this.clearInterval = 'clearInterval' in overrides ? overrides.clearInterval : (_b = (_a = g.clearInterval) === null || _a === void 0 ? void 0 : _a.bind(g)) !== null && _b !== void 0 ? _b : notImplemented$1('clearInterval');
        this.clearTimeout = 'clearTimeout' in overrides ? overrides.clearTimeout : (_d = (_c = g.clearTimeout) === null || _c === void 0 ? void 0 : _c.bind(g)) !== null && _d !== void 0 ? _d : notImplemented$1('clearTimeout');
        this.queueMicrotask = 'queueMicrotask' in overrides ? overrides.queueMicrotask : (_f = (_e = g.queueMicrotask) === null || _e === void 0 ? void 0 : _e.bind(g)) !== null && _f !== void 0 ? _f : notImplemented$1('queueMicrotask');
        this.setInterval = 'setInterval' in overrides ? overrides.setInterval : (_h = (_g = g.setInterval) === null || _g === void 0 ? void 0 : _g.bind(g)) !== null && _h !== void 0 ? _h : notImplemented$1('setInterval');
        this.setTimeout = 'setTimeout' in overrides ? overrides.setTimeout : (_k = (_j = g.setTimeout) === null || _j === void 0 ? void 0 : _j.bind(g)) !== null && _k !== void 0 ? _k : notImplemented$1('setTimeout');
        this.console = 'console' in overrides ? overrides.console : g.console;
        this.performanceNow = 'performanceNow' in overrides ? overrides.performanceNow : (_o = (_m = (_l = g.performance) === null || _l === void 0 ? void 0 : _l.now) === null || _m === void 0 ? void 0 : _m.bind(g.performance)) !== null && _o !== void 0 ? _o : notImplemented$1('performance.now');
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(g, overrides = {}) {
        let platform = lookup$1.get(g);
        if (platform === void 0) {
            lookup$1.set(g, platform = new Platform(g, overrides));
        }
        return platform;
    }
    static set(g, platform) {
        lookup$1.set(g, platform);
    }
    requestMacroTask() {
        this.macroTaskRequested = true;
        if (this.macroTaskHandle === -1) {
            this.macroTaskHandle = this.setTimeout(this.flushMacroTask, 0);
        }
    }
    cancelMacroTask() {
        this.macroTaskRequested = false;
        if (this.macroTaskHandle > -1) {
            this.clearTimeout(this.macroTaskHandle);
            this.macroTaskHandle = -1;
        }
    }
    flushMacroTask() {
        this.macroTaskHandle = -1;
        if (this.macroTaskRequested === true) {
            this.macroTaskRequested = false;
            this.taskQueue.flush();
        }
    }
}
function isPersistent(task) {
    return task.persistent;
}
class TaskQueue {
    constructor(platform, $request, $cancel) {
        this.platform = platform;
        this.$request = $request;
        this.$cancel = $cancel;
        this.processing = [];
        this.suspenderTask = void 0;
        this.pendingAsyncCount = 0;
        this.pending = [];
        this.delayed = [];
        this.flushRequested = false;
        this.yieldPromise = void 0;
        this.taskPool = [];
        this.taskPoolSize = 0;
        this.lastRequest = 0;
        this.lastFlush = 0;
        this.requestFlush = () => {
            if (this.tracer.enabled) {
                this.tracer.enter(this, 'requestFlush');
            }
            if (!this.flushRequested) {
                this.flushRequested = true;
                this.lastRequest = this.platform.performanceNow();
                this.$request();
            }
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'requestFlush');
            }
        };
        this.tracer = new Tracer(platform.console);
    }
    get isEmpty() {
        return (this.pendingAsyncCount === 0 &&
            this.processing.length === 0 &&
            this.pending.length === 0 &&
            this.delayed.length === 0);
    }
    /**
     * Persistent tasks will re-queue themselves indefinitely until they are explicitly canceled,
     * so we consider them 'infinite work' whereas non-persistent (one-off) tasks are 'finite work'.
     *
     * This `hasNoMoreFiniteWork` getters returns true if either all remaining tasks are persistent, or if there are no more tasks.
     *
     * If that is the case, we can resolve the promise that was created when `yield()` is called.
     */
    get hasNoMoreFiniteWork() {
        return (this.pendingAsyncCount === 0 &&
            this.processing.every(isPersistent) &&
            this.pending.every(isPersistent) &&
            this.delayed.every(isPersistent));
    }
    flush(time = this.platform.performanceNow()) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'flush');
        }
        this.flushRequested = false;
        this.lastFlush = time;
        // Only process normally if we are *not* currently waiting for an async task to finish
        if (this.suspenderTask === void 0) {
            if (this.pending.length > 0) {
                this.processing.push(...this.pending);
                this.pending.length = 0;
            }
            if (this.delayed.length > 0) {
                let i = -1;
                while (++i < this.delayed.length && this.delayed[i].queueTime <= time) { /* do nothing */ }
                this.processing.push(...this.delayed.splice(0, i));
            }
            let cur;
            while (this.processing.length > 0) {
                (cur = this.processing.shift()).run();
                // If it's still running, it can only be an async task
                if (cur.status === 1 /* running */) {
                    if (cur.suspend === true) {
                        this.suspenderTask = cur;
                        this.requestFlush();
                        if (this.tracer.enabled) {
                            this.tracer.leave(this, 'flush early async');
                        }
                        return;
                    }
                    else {
                        ++this.pendingAsyncCount;
                    }
                }
            }
            if (this.pending.length > 0) {
                this.processing.push(...this.pending);
                this.pending.length = 0;
            }
            if (this.delayed.length > 0) {
                let i = -1;
                while (++i < this.delayed.length && this.delayed[i].queueTime <= time) { /* do nothing */ }
                this.processing.push(...this.delayed.splice(0, i));
            }
            if (this.processing.length > 0 || this.delayed.length > 0 || this.pendingAsyncCount > 0) {
                this.requestFlush();
            }
            if (this.yieldPromise !== void 0 &&
                this.hasNoMoreFiniteWork) {
                const p = this.yieldPromise;
                this.yieldPromise = void 0;
                p.resolve();
            }
        }
        else {
            // If we are still waiting for an async task to finish, just schedule the next flush and do nothing else.
            // Should the task finish before the next flush is invoked,
            // the callback to `completeAsyncTask` will have reset `this.suspenderTask` back to undefined so processing can return back to normal next flush.
            this.requestFlush();
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'flush full');
        }
    }
    /**
     * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
     *
     * This operation is idempotent and will do nothing if no flush is scheduled.
     */
    cancel() {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'cancel');
        }
        if (this.flushRequested) {
            this.$cancel();
            this.flushRequested = false;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'cancel');
        }
    }
    /**
     * Returns a promise that, when awaited, resolves when:
     * - all *non*-persistent (including async) tasks have finished;
     * - the last-added persistent task has run exactly once;
     *
     * This operation is idempotent: the same promise will be returned until it resolves.
     *
     * If `yield()` is called multiple times in a row when there are one or more persistent tasks in the queue, each call will await exactly one cycle of those tasks.
     */
    async yield() {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'yield');
        }
        if (this.isEmpty) {
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'yield empty');
            }
        }
        else {
            if (this.yieldPromise === void 0) {
                if (this.tracer.enabled) {
                    this.tracer.trace(this, 'yield - creating promise');
                }
                this.yieldPromise = createExposedPromise();
            }
            await this.yieldPromise;
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'yield task');
            }
        }
    }
    queueTask(callback, opts) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'queueTask');
        }
        const { delay, preempt, persistent, reusable, suspend } = { ...defaultQueueTaskOptions, ...opts };
        if (preempt) {
            if (delay > 0) {
                throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
            }
            if (persistent) {
                throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
            }
        }
        if (this.processing.length === 0) {
            this.requestFlush();
        }
        const time = this.platform.performanceNow();
        let task;
        if (reusable) {
            const taskPool = this.taskPool;
            const index = this.taskPoolSize - 1;
            if (index >= 0) {
                task = taskPool[index];
                taskPool[index] = (void 0);
                this.taskPoolSize = index;
                task.reuse(time, delay, preempt, persistent, suspend, callback);
            }
            else {
                task = new Task(this.tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
            }
        }
        else {
            task = new Task(this.tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
        }
        if (preempt) {
            this.processing[this.processing.length] = task;
        }
        else if (delay === 0) {
            this.pending[this.pending.length] = task;
        }
        else {
            this.delayed[this.delayed.length] = task;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'queueTask');
        }
        return task;
    }
    /**
     * Remove the task from this queue.
     */
    remove(task) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'remove');
        }
        let idx = this.processing.indexOf(task);
        if (idx > -1) {
            this.processing.splice(idx, 1);
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'remove processing');
            }
            return;
        }
        idx = this.pending.indexOf(task);
        if (idx > -1) {
            this.pending.splice(idx, 1);
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'remove pending');
            }
            return;
        }
        idx = this.delayed.indexOf(task);
        if (idx > -1) {
            this.delayed.splice(idx, 1);
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'remove delayed');
            }
            return;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'remove error');
        }
        throw new Error(`Task #${task.id} could not be found`);
    }
    /**
     * Return a reusable task to the shared task pool.
     * The next queued callback will reuse this task object instead of creating a new one, to save overhead of creating additional objects.
     */
    returnToPool(task) {
        if (this.tracer.enabled) {
            this.tracer.trace(this, 'returnToPool');
        }
        this.taskPool[this.taskPoolSize++] = task;
    }
    /**
     * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
     */
    resetPersistentTask(task) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'resetPersistentTask');
        }
        task.reset(this.platform.performanceNow());
        if (task.createdTime === task.queueTime) {
            this.pending[this.pending.length] = task;
        }
        else {
            this.delayed[this.delayed.length] = task;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'resetPersistentTask');
        }
    }
    /**
     * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
     */
    completeAsyncTask(task) {
        var _a;
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'completeAsyncTask');
        }
        if (task.suspend === true) {
            if (this.suspenderTask !== task) {
                if (this.tracer.enabled) {
                    this.tracer.leave(this, 'completeAsyncTask error');
                }
                throw new Error(`Async task completion mismatch: suspenderTask=${(_a = this.suspenderTask) === null || _a === void 0 ? void 0 : _a.id}, task=${task.id}`);
            }
            this.suspenderTask = void 0;
        }
        else {
            --this.pendingAsyncCount;
        }
        if (this.yieldPromise !== void 0 &&
            this.hasNoMoreFiniteWork) {
            const p = this.yieldPromise;
            this.yieldPromise = void 0;
            p.resolve();
        }
        if (this.isEmpty) {
            this.cancel();
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'completeAsyncTask');
        }
    }
}
class TaskAbortError extends Error {
    constructor(task) {
        super('Task was canceled.');
        this.task = task;
    }
}
let id = 0;
var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["pending"] = 0] = "pending";
    TaskStatus[TaskStatus["running"] = 1] = "running";
    TaskStatus[TaskStatus["completed"] = 2] = "completed";
    TaskStatus[TaskStatus["canceled"] = 3] = "canceled";
})(TaskStatus || (TaskStatus = {}));
class Task {
    constructor(tracer, taskQueue, createdTime, queueTime, preempt, persistent, suspend, reusable, callback) {
        this.tracer = tracer;
        this.taskQueue = taskQueue;
        this.createdTime = createdTime;
        this.queueTime = queueTime;
        this.preempt = preempt;
        this.persistent = persistent;
        this.suspend = suspend;
        this.reusable = reusable;
        this.callback = callback;
        this.id = ++id;
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
        this._status = 0 /* pending */;
    }
    get result() {
        const result = this._result;
        if (result === void 0) {
            switch (this._status) {
                case 0 /* pending */: {
                    const promise = this._result = createExposedPromise();
                    this.resolve = promise.resolve;
                    this.reject = promise.reject;
                    return promise;
                }
                case 1 /* running */:
                    throw new Error('Trying to await task from within task will cause a deadlock.');
                case 2 /* completed */:
                    return this._result = Promise.resolve();
                case 3 /* canceled */:
                    return this._result = Promise.reject(new TaskAbortError(this));
            }
        }
        return result;
    }
    get status() {
        return this._status;
    }
    run(time = this.taskQueue.platform.performanceNow()) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'run');
        }
        if (this._status !== 0 /* pending */) {
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'run error');
            }
            throw new Error(`Cannot run task in ${this._status} state`);
        }
        // this.persistent could be changed while the task is running (this can only be done by the task itself if canceled, and is a valid way of stopping a loop)
        // so we deliberately reference this.persistent instead of the local variable, but we keep it around to know whether the task *was* persistent before running it,
        // so we can set the correct cancelation state.
        const { persistent, reusable, taskQueue, callback, resolve, reject, createdTime, } = this;
        this._status = 1 /* running */;
        try {
            const ret = callback(time - createdTime);
            if (ret instanceof Promise) {
                ret.then($ret => {
                    if (this.persistent) {
                        taskQueue['resetPersistentTask'](this);
                    }
                    else {
                        if (persistent) {
                            // Persistent tasks never reach completed status. They're either pending, running, or canceled.
                            this._status = 3 /* canceled */;
                        }
                        else {
                            this._status = 2 /* completed */;
                        }
                        this.dispose();
                    }
                    taskQueue['completeAsyncTask'](this);
                    if (this.tracer.enabled) {
                        this.tracer.leave(this, 'run async then');
                    }
                    if (resolve !== void 0) {
                        resolve($ret);
                    }
                    if (!this.persistent && reusable) {
                        taskQueue['returnToPool'](this);
                    }
                })
                    .catch(err => {
                    if (!this.persistent) {
                        this.dispose();
                    }
                    taskQueue['completeAsyncTask'](this);
                    if (this.tracer.enabled) {
                        this.tracer.leave(this, 'run async catch');
                    }
                    if (reject !== void 0) {
                        reject(err);
                    }
                    else {
                        throw err;
                    }
                });
            }
            else {
                if (this.persistent) {
                    taskQueue['resetPersistentTask'](this);
                }
                else {
                    if (persistent) {
                        // Persistent tasks never reach completed status. They're either pending, running, or canceled.
                        this._status = 3 /* canceled */;
                    }
                    else {
                        this._status = 2 /* completed */;
                    }
                    this.dispose();
                }
                if (this.tracer.enabled) {
                    this.tracer.leave(this, 'run sync success');
                }
                if (resolve !== void 0) {
                    resolve(ret);
                }
                if (!this.persistent && reusable) {
                    taskQueue['returnToPool'](this);
                }
            }
        }
        catch (err) {
            if (!this.persistent) {
                this.dispose();
            }
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'run sync error');
            }
            if (reject !== void 0) {
                reject(err);
            }
            else {
                throw err;
            }
        }
    }
    cancel() {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'cancel');
        }
        if (this._status === 0 /* pending */) {
            const taskQueue = this.taskQueue;
            const reusable = this.reusable;
            const reject = this.reject;
            taskQueue.remove(this);
            if (taskQueue.isEmpty) {
                taskQueue.cancel();
            }
            this._status = 3 /* canceled */;
            this.dispose();
            if (reusable) {
                taskQueue['returnToPool'](this);
            }
            if (reject !== void 0) {
                reject(new TaskAbortError(this));
            }
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'cancel true =pending');
            }
            return true;
        }
        else if (this._status === 1 /* running */ && this.persistent) {
            this.persistent = false;
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'cancel true =running+persistent');
            }
            return true;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'cancel false');
        }
        return false;
    }
    reset(time) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'reset');
        }
        const delay = this.queueTime - this.createdTime;
        this.createdTime = time;
        this.queueTime = time + delay;
        this._status = 0 /* pending */;
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'reset');
        }
    }
    reuse(time, delay, preempt, persistent, suspend, callback) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'reuse');
        }
        this.createdTime = time;
        this.queueTime = time + delay;
        this.preempt = preempt;
        this.persistent = persistent;
        this.suspend = suspend;
        this.callback = callback;
        this._status = 0 /* pending */;
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'reuse');
        }
    }
    dispose() {
        if (this.tracer.enabled) {
            this.tracer.trace(this, 'dispose');
        }
        this.callback = (void 0);
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
    }
}
function taskStatus(status) {
    switch (status) {
        case 0 /* pending */: return 'pending';
        case 1 /* running */: return 'running';
        case 3 /* canceled */: return 'canceled';
        case 2 /* completed */: return 'completed';
    }
}
class Tracer {
    constructor(console) {
        this.console = console;
        this.enabled = false;
        this.depth = 0;
    }
    enter(obj, method) {
        this.log(`${'  '.repeat(this.depth++)}> `, obj, method);
    }
    leave(obj, method) {
        this.log(`${'  '.repeat(--this.depth)}< `, obj, method);
    }
    trace(obj, method) {
        this.log(`${'  '.repeat(this.depth)}- `, obj, method);
    }
    log(prefix, obj, method) {
        if (obj instanceof TaskQueue) {
            const processing = obj['processing'].length;
            const pending = obj['pending'].length;
            const delayed = obj['delayed'].length;
            const flushReq = obj['flushRequested'];
            const susTask = !!obj['suspenderTask'];
            const info = `processing=${processing} pending=${pending} delayed=${delayed} flushReq=${flushReq} susTask=${susTask}`;
            this.console.log(`${prefix}[Q.${method}] ${info}`);
        }
        else {
            const id = obj['id'];
            const created = Math.round(obj['createdTime'] * 10) / 10;
            const queue = Math.round(obj['queueTime'] * 10) / 10;
            const preempt = obj['preempt'];
            const reusable = obj['reusable'];
            const persistent = obj['persistent'];
            const suspend = obj['suspend'];
            const status = taskStatus(obj['_status']);
            const info = `id=${id} created=${created} queue=${queue} preempt=${preempt} persistent=${persistent} reusable=${reusable} status=${status} suspend=${suspend}`;
            this.console.log(`${prefix}[T.${method}] ${info}`);
        }
    }
}
var TaskQueuePriority;
(function (TaskQueuePriority) {
    TaskQueuePriority[TaskQueuePriority["render"] = 0] = "render";
    TaskQueuePriority[TaskQueuePriority["macroTask"] = 1] = "macroTask";
    TaskQueuePriority[TaskQueuePriority["postRender"] = 2] = "postRender";
})(TaskQueuePriority || (TaskQueuePriority = {}));
const defaultQueueTaskOptions = {
    delay: 0,
    preempt: false,
    persistent: false,
    reusable: true,
    suspend: false,
};
let $resolve;
let $reject;
function executor(resolve, reject) {
    $resolve = resolve;
    $reject = reject;
}
/**
 * Efficiently create a promise where the `resolve` and `reject` functions are stored as properties on the prommise itself.
 */
function createExposedPromise() {
    const p = new Promise(executor);
    p.resolve = $resolve;
    p.reject = $reject;
    return p;
}

var __decorate$t = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$p = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LogLevel;
(function (LogLevel) {
    /**
     * The most detailed information about internal app state.
     *
     * Disabled by default and should never be enabled in a production environment.
     */
    LogLevel[LogLevel["trace"] = 0] = "trace";
    /**
     * Information that is useful for debugging during development and has no long-term value.
     */
    LogLevel[LogLevel["debug"] = 1] = "debug";
    /**
     * Information about the general flow of the application that has long-term value.
     */
    LogLevel[LogLevel["info"] = 2] = "info";
    /**
     * Unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
     */
    LogLevel[LogLevel["warn"] = 3] = "warn";
    /**
     * Unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
     */
    LogLevel[LogLevel["error"] = 4] = "error";
    /**
     * Unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
     */
    LogLevel[LogLevel["fatal"] = 5] = "fatal";
    /**
     * No messages should be written.
     */
    LogLevel[LogLevel["none"] = 6] = "none";
})(LogLevel || (LogLevel = {}));
/**
 * Flags to enable/disable color usage in the logging output.
 */
var ColorOptions;
(function (ColorOptions) {
    /**
     * Do not use ASCII color codes in logging output.
     */
    ColorOptions[ColorOptions["noColors"] = 0] = "noColors";
    /**
     * Use ASCII color codes in logging output. By default, timestamps and the TRC and DBG prefix are colored grey. INF white, WRN yellow, and ERR and FTL red.
     */
    ColorOptions[ColorOptions["colors"] = 1] = "colors";
})(ColorOptions || (ColorOptions = {}));
const ILogConfig = DI.createInterface('ILogConfig', x => x.instance(new LogConfig(0 /* noColors */, 3 /* warn */)));
const ISink = DI.createInterface('ISink');
const ILogEventFactory = DI.createInterface('ILogEventFactory', x => x.singleton(DefaultLogEventFactory));
const ILogger = DI.createInterface('ILogger', x => x.singleton(DefaultLogger));
const ILogScopes = DI.createInterface('ILogScope');
const LoggerSink = Object.freeze({
    key: Protocol.annotation.keyFor('logger-sink-handles'),
    define(target, definition) {
        Metadata.define(this.key, definition.handles, target.prototype);
        return target;
    },
    getHandles(target) {
        return Metadata.get(this.key, target);
    },
});
// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
const format = toLookup$1({
    red(str) {
        return `\u001b[31m${str}\u001b[39m`;
    },
    green(str) {
        return `\u001b[32m${str}\u001b[39m`;
    },
    yellow(str) {
        return `\u001b[33m${str}\u001b[39m`;
    },
    blue(str) {
        return `\u001b[34m${str}\u001b[39m`;
    },
    magenta(str) {
        return `\u001b[35m${str}\u001b[39m`;
    },
    cyan(str) {
        return `\u001b[36m${str}\u001b[39m`;
    },
    white(str) {
        return `\u001b[37m${str}\u001b[39m`;
    },
    grey(str) {
        return `\u001b[90m${str}\u001b[39m`;
    },
});
class LogConfig {
    constructor(colorOptions, level) {
        this.colorOptions = colorOptions;
        this.level = level;
    }
}
const getLogLevelString = (function () {
    const logLevelString = [
        toLookup$1({
            TRC: 'TRC',
            DBG: 'DBG',
            INF: 'INF',
            WRN: 'WRN',
            ERR: 'ERR',
            FTL: 'FTL',
            QQQ: '???',
        }),
        toLookup$1({
            TRC: format.grey('TRC'),
            DBG: format.grey('DBG'),
            INF: format.white('INF'),
            WRN: format.yellow('WRN'),
            ERR: format.red('ERR'),
            FTL: format.red('FTL'),
            QQQ: format.grey('???'),
        }),
    ];
    return function (level, colorOptions) {
        if (level <= 0 /* trace */) {
            return logLevelString[colorOptions].TRC;
        }
        if (level <= 1 /* debug */) {
            return logLevelString[colorOptions].DBG;
        }
        if (level <= 2 /* info */) {
            return logLevelString[colorOptions].INF;
        }
        if (level <= 3 /* warn */) {
            return logLevelString[colorOptions].WRN;
        }
        if (level <= 4 /* error */) {
            return logLevelString[colorOptions].ERR;
        }
        if (level <= 5 /* fatal */) {
            return logLevelString[colorOptions].FTL;
        }
        return logLevelString[colorOptions].QQQ;
    };
})();
function getScopeString(scope, colorOptions) {
    if (colorOptions === 0 /* noColors */) {
        return scope.join('.');
    }
    return scope.map(format.cyan).join('.');
}
function getIsoString(timestamp, colorOptions) {
    if (colorOptions === 0 /* noColors */) {
        return new Date(timestamp).toISOString();
    }
    return format.grey(new Date(timestamp).toISOString());
}
class DefaultLogEvent {
    constructor(severity, message, optionalParams, scope, colorOptions, timestamp) {
        this.severity = severity;
        this.message = message;
        this.optionalParams = optionalParams;
        this.scope = scope;
        this.colorOptions = colorOptions;
        this.timestamp = timestamp;
    }
    toString() {
        const { severity, message, scope, colorOptions, timestamp } = this;
        if (scope.length === 0) {
            return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)}] ${message}`;
        }
        return `${getIsoString(timestamp, colorOptions)} [${getLogLevelString(severity, colorOptions)} ${getScopeString(scope, colorOptions)}] ${message}`;
    }
}
let DefaultLogEventFactory = class DefaultLogEventFactory {
    constructor(config) {
        this.config = config;
    }
    createLogEvent(logger, level, message, optionalParams) {
        return new DefaultLogEvent(level, message, optionalParams, logger.scope, this.config.colorOptions, Date.now());
    }
};
DefaultLogEventFactory = __decorate$t([
    __param$p(0, ILogConfig)
], DefaultLogEventFactory);
let ConsoleSink = class ConsoleSink {
    constructor(p) {
        const $console = p.console;
        this.handleEvent = function emit(event) {
            const optionalParams = event.optionalParams;
            if (optionalParams === void 0 || optionalParams.length === 0) {
                const msg = event.toString();
                switch (event.severity) {
                    case 0 /* trace */:
                    case 1 /* debug */:
                        return $console.debug(msg);
                    case 2 /* info */:
                        return $console.info(msg);
                    case 3 /* warn */:
                        return $console.warn(msg);
                    case 4 /* error */:
                    case 5 /* fatal */:
                        return $console.error(msg);
                }
            }
            else {
                let msg = event.toString();
                let offset = 0;
                // console.log in chrome doesn't call .toString() on object inputs (https://bugs.chromium.org/p/chromium/issues/detail?id=1146817)
                while (msg.includes('%s')) {
                    msg = msg.replace('%s', String(optionalParams[offset++]));
                }
                switch (event.severity) {
                    case 0 /* trace */:
                    case 1 /* debug */:
                        return $console.debug(msg, ...optionalParams.slice(offset));
                    case 2 /* info */:
                        return $console.info(msg, ...optionalParams.slice(offset));
                    case 3 /* warn */:
                        return $console.warn(msg, ...optionalParams.slice(offset));
                    case 4 /* error */:
                    case 5 /* fatal */:
                        return $console.error(msg, ...optionalParams.slice(offset));
                }
            }
        };
    }
    static register(container) {
        Registration.singleton(ISink, ConsoleSink).register(container);
    }
};
ConsoleSink = __decorate$t([
    __param$p(0, IPlatform$1)
], ConsoleSink);
let DefaultLogger = class DefaultLogger {
    constructor(
    /**
     * The global logger configuration.
     */
    config, factory, sinks, 
    /**
     * The scopes that this logger was created for, if any.
     */
    scope = [], parent = null) {
        var _a, _b, _c, _d, _e, _f;
        this.config = config;
        this.factory = factory;
        this.scope = scope;
        this.scopedLoggers = Object.create(null);
        let traceSinks;
        let debugSinks;
        let infoSinks;
        let warnSinks;
        let errorSinks;
        let fatalSinks;
        if (parent === null) {
            this.root = this;
            this.parent = this;
            traceSinks = this.traceSinks = [];
            debugSinks = this.debugSinks = [];
            infoSinks = this.infoSinks = [];
            warnSinks = this.warnSinks = [];
            errorSinks = this.errorSinks = [];
            fatalSinks = this.fatalSinks = [];
            for (const $sink of sinks) {
                const handles = LoggerSink.getHandles($sink);
                if ((_a = handles === null || handles === void 0 ? void 0 : handles.includes(0 /* trace */)) !== null && _a !== void 0 ? _a : true) {
                    traceSinks.push($sink);
                }
                if ((_b = handles === null || handles === void 0 ? void 0 : handles.includes(1 /* debug */)) !== null && _b !== void 0 ? _b : true) {
                    debugSinks.push($sink);
                }
                if ((_c = handles === null || handles === void 0 ? void 0 : handles.includes(2 /* info */)) !== null && _c !== void 0 ? _c : true) {
                    infoSinks.push($sink);
                }
                if ((_d = handles === null || handles === void 0 ? void 0 : handles.includes(3 /* warn */)) !== null && _d !== void 0 ? _d : true) {
                    warnSinks.push($sink);
                }
                if ((_e = handles === null || handles === void 0 ? void 0 : handles.includes(4 /* error */)) !== null && _e !== void 0 ? _e : true) {
                    errorSinks.push($sink);
                }
                if ((_f = handles === null || handles === void 0 ? void 0 : handles.includes(5 /* fatal */)) !== null && _f !== void 0 ? _f : true) {
                    fatalSinks.push($sink);
                }
            }
        }
        else {
            this.root = parent.root;
            this.parent = parent;
            traceSinks = this.traceSinks = parent.traceSinks;
            debugSinks = this.debugSinks = parent.debugSinks;
            infoSinks = this.infoSinks = parent.infoSinks;
            warnSinks = this.warnSinks = parent.warnSinks;
            errorSinks = this.errorSinks = parent.errorSinks;
            fatalSinks = this.fatalSinks = parent.fatalSinks;
        }
    }
    trace(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 0 /* trace */) {
            this.emit(this.traceSinks, 0 /* trace */, messageOrGetMessage, optionalParams);
        }
    }
    debug(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 1 /* debug */) {
            this.emit(this.debugSinks, 1 /* debug */, messageOrGetMessage, optionalParams);
        }
    }
    info(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 2 /* info */) {
            this.emit(this.infoSinks, 2 /* info */, messageOrGetMessage, optionalParams);
        }
    }
    warn(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 3 /* warn */) {
            this.emit(this.warnSinks, 3 /* warn */, messageOrGetMessage, optionalParams);
        }
    }
    error(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 4 /* error */) {
            this.emit(this.errorSinks, 4 /* error */, messageOrGetMessage, optionalParams);
        }
    }
    fatal(messageOrGetMessage, ...optionalParams) {
        if (this.config.level <= 5 /* fatal */) {
            this.emit(this.fatalSinks, 5 /* fatal */, messageOrGetMessage, optionalParams);
        }
    }
    /**
     * Create a new logger with an additional permanent prefix added to the logging outputs.
     * When chained, multiple scopes are separated by a dot.
     *
     * This is preliminary API and subject to change before alpha release.
     *
     * @example
     *
     * ```ts
     * export class MyComponent {
     *   constructor(@ILogger private logger: ILogger) {
     *     this.logger.debug('before scoping');
     *     // console output: '[DBG] before scoping'
     *     this.logger = logger.scopeTo('MyComponent');
     *     this.logger.debug('after scoping');
     *     // console output: '[DBG MyComponent] after scoping'
     *   }
     *
     *   public doStuff(): void {
     *     const logger = this.logger.scopeTo('doStuff()');
     *     logger.debug('doing stuff');
     *     // console output: '[DBG MyComponent.doStuff()] doing stuff'
     *   }
     * }
     * ```
     */
    scopeTo(name) {
        const scopedLoggers = this.scopedLoggers;
        let scopedLogger = scopedLoggers[name];
        if (scopedLogger === void 0) {
            scopedLogger = scopedLoggers[name] = new DefaultLogger(this.config, this.factory, (void 0), this.scope.concat(name), this);
        }
        return scopedLogger;
    }
    emit(sinks, level, msgOrGetMsg, optionalParams) {
        const message = typeof msgOrGetMsg === 'function' ? msgOrGetMsg() : msgOrGetMsg;
        const event = this.factory.createLogEvent(this, level, message, optionalParams);
        for (let i = 0, ii = sinks.length; i < ii; ++i) {
            sinks[i].handleEvent(event);
        }
    }
};
__decorate$t([
    bound
], DefaultLogger.prototype, "trace", null);
__decorate$t([
    bound
], DefaultLogger.prototype, "debug", null);
__decorate$t([
    bound
], DefaultLogger.prototype, "info", null);
__decorate$t([
    bound
], DefaultLogger.prototype, "warn", null);
__decorate$t([
    bound
], DefaultLogger.prototype, "error", null);
__decorate$t([
    bound
], DefaultLogger.prototype, "fatal", null);
DefaultLogger = __decorate$t([
    __param$p(0, ILogConfig),
    __param$p(1, ILogEventFactory),
    __param$p(2, all(ISink)),
    __param$p(3, optional$1(ILogScopes)),
    __param$p(4, ignore)
], DefaultLogger);
/**
 * A basic `ILogger` configuration that configures a single `console` sink based on provided options.
 *
 * NOTE: You *must* register the return value of `.create` with the container / au instance, not this `LoggerConfiguration` object itself.
 *
 * @example
 * ```ts
 * container.register(LoggerConfiguration.create());
 *
 * container.register(LoggerConfiguration.create({sinks: [ConsoleSink]}))
 *
 * container.register(LoggerConfiguration.create({sinks: [ConsoleSink], level: LogLevel.debug}))
 *
 * ```
 */
toLookup$1({
    /**
     * @param $console - The `console` object to use. Can be the native `window.console` / `global.console`, but can also be a wrapper or mock that implements the same interface.
     * @param level - The global `LogLevel` to configure. Defaults to `warn` or higher.
     * @param colorOptions - Whether to use colors or not. Defaults to `noColors`. Colors are especially nice in nodejs environments but don't necessarily work (well) in all environments, such as browsers.
     */
    create({ level = 3 /* warn */, colorOptions = 0 /* noColors */, sinks = [], } = {}) {
        return toLookup$1({
            register(container) {
                container.register(Registration.instance(ILogConfig, new LogConfig(colorOptions, level)));
                for (const $sink of sinks) {
                    if (typeof $sink === 'function') {
                        container.register(Registration.singleton(ISink, $sink));
                    }
                    else {
                        container.register($sink);
                    }
                }
                return container;
            },
        });
    },
});

const IModuleLoader = DI.createInterface(x => x.singleton(ModuleLoader));
function noTransform(m) {
    return m;
}
class ModuleTransformer {
    constructor($transform) {
        this.$transform = $transform;
        this.promiseCache = new Map();
        this.objectCache = new Map();
    }
    transform(objOrPromise) {
        if (objOrPromise instanceof Promise) {
            return this.transformPromise(objOrPromise);
        }
        else if (typeof objOrPromise === 'object' && objOrPromise !== null) {
            return this.transformObject(objOrPromise);
        }
        else {
            throw new Error(`Invalid input: ${String(objOrPromise)}. Expected Promise or Object.`);
        }
    }
    transformPromise(promise) {
        if (this.promiseCache.has(promise)) {
            return this.promiseCache.get(promise);
        }
        const ret = promise.then(obj => {
            return this.transformObject(obj);
        });
        this.promiseCache.set(promise, ret);
        void ret.then(value => {
            // make it synchronous for future requests
            this.promiseCache.set(promise, value);
        });
        return ret;
    }
    transformObject(obj) {
        if (this.objectCache.has(obj)) {
            return this.objectCache.get(obj);
        }
        const ret = this.$transform(this.analyze(obj));
        this.objectCache.set(obj, ret);
        if (ret instanceof Promise) {
            void ret.then(value => {
                // make it synchronous for future requests
                this.objectCache.set(obj, value);
            });
        }
        return ret;
    }
    analyze(m) {
        let value;
        let isRegistry;
        let isConstructable;
        let definitions;
        const items = [];
        for (const key in m) {
            switch (typeof (value = m[key])) {
                case 'object':
                    if (value === null) {
                        continue;
                    }
                    isRegistry = typeof value.register === 'function';
                    isConstructable = false;
                    definitions = emptyArray;
                    break;
                case 'function':
                    isRegistry = typeof value.register === 'function';
                    isConstructable = value.prototype !== void 0;
                    definitions = Protocol.resource.getAll(value);
                    break;
                default:
                    continue;
            }
            items.push(new ModuleItem(key, value, isRegistry, isConstructable, definitions));
        }
        return new AnalyzedModule(m, items);
    }
}
class ModuleLoader {
    constructor() {
        this.transformers = new Map();
    }
    load(objOrPromise, transform = noTransform) {
        const transformers = this.transformers;
        let transformer = transformers.get(transform);
        if (transformer === void 0) {
            transformers.set(transform, transformer = new ModuleTransformer(transform));
        }
        return transformer.transform(objOrPromise);
    }
    dispose() {
        this.transformers.clear();
    }
}
class AnalyzedModule {
    constructor(raw, items) {
        this.raw = raw;
        this.items = items;
    }
}
class ModuleItem {
    constructor(key, value, isRegistry, isConstructable, definitions) {
        this.key = key;
        this.value = value;
        this.isRegistry = isRegistry;
        this.isConstructable = isConstructable;
        this.definitions = definitions;
    }
}

/* eslint-disable @typescript-eslint/restrict-template-expressions */
/**
 * Represents a handler for an EventAggregator event.
 */
class Handler {
    constructor(messageType, callback) {
        this.messageType = messageType;
        this.callback = callback;
    }
    handle(message) {
        if (message instanceof this.messageType) {
            this.callback.call(null, message);
        }
    }
}
const IEventAggregator = DI.createInterface('IEventAggregator', x => x.singleton(EventAggregator));
/**
 * Enables loosely coupled publish/subscribe messaging.
 */
class EventAggregator {
    constructor() {
        /** @internal */
        this.eventLookup = {};
        /** @internal */
        this.messageHandlers = [];
    }
    publish(channelOrInstance, message) {
        if (!channelOrInstance) {
            throw new Error(`Invalid channel name or instance: ${channelOrInstance}.`);
        }
        if (typeof channelOrInstance === 'string') {
            let subscribers = this.eventLookup[channelOrInstance];
            if (subscribers !== void 0) {
                subscribers = subscribers.slice();
                let i = subscribers.length;
                while (i-- > 0) {
                    subscribers[i](message, channelOrInstance);
                }
            }
        }
        else {
            const subscribers = this.messageHandlers.slice();
            let i = subscribers.length;
            while (i-- > 0) {
                subscribers[i].handle(channelOrInstance);
            }
        }
    }
    subscribe(channelOrType, callback) {
        if (!channelOrType) {
            throw new Error(`Invalid channel name or type: ${channelOrType}.`);
        }
        let handler;
        let subscribers;
        if (typeof channelOrType === 'string') {
            if (this.eventLookup[channelOrType] === void 0) {
                this.eventLookup[channelOrType] = [];
            }
            handler = callback;
            subscribers = this.eventLookup[channelOrType];
        }
        else {
            handler = new Handler(channelOrType, callback);
            subscribers = this.messageHandlers;
        }
        subscribers.push(handler);
        return {
            dispose() {
                const idx = subscribers.indexOf(handler);
                if (idx !== -1) {
                    subscribers.splice(idx, 1);
                }
            }
        };
    }
    subscribeOnce(channelOrType, callback) {
        const sub = this.subscribe(channelOrType, function (message, event) {
            sub.dispose();
            callback(message, event);
        });
        return sub;
    }
}

const lookup = new Map();
function notImplemented(name) {
    return function notImplemented() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
    };
}
class BrowserPlatform extends Platform {
    constructor(g, overrides = {}) {
        var _a, _b, _c, _d, _e, _f;
        super(g, overrides);
        this.domReadRequested = false;
        this.domReadHandle = -1;
        this.domWriteRequested = false;
        this.domWriteHandle = -1;
        this.Node = 'Node' in overrides ? overrides.Node : g.Node;
        this.Element = 'Element' in overrides ? overrides.Element : g.Element;
        this.HTMLElement = 'HTMLElement' in overrides ? overrides.HTMLElement : g.HTMLElement;
        this.CustomEvent = 'CustomEvent' in overrides ? overrides.CustomEvent : g.CustomEvent;
        this.CSSStyleSheet = 'CSSStyleSheet' in overrides ? overrides.CSSStyleSheet : g.CSSStyleSheet;
        this.ShadowRoot = 'ShadowRoot' in overrides ? overrides.ShadowRoot : g.ShadowRoot;
        this.MutationObserver = 'MutationObserver' in overrides ? overrides.MutationObserver : g.MutationObserver;
        this.window = 'window' in overrides ? overrides.window : g.window;
        this.document = 'document' in overrides ? overrides.document : g.document;
        this.location = 'location' in overrides ? overrides.location : g.location;
        this.history = 'history' in overrides ? overrides.history : g.history;
        this.navigator = 'navigator' in overrides ? overrides.navigator : g.navigator;
        this.fetch = 'fetch' in overrides ? overrides.fetch : (_b = (_a = g.fetch) === null || _a === void 0 ? void 0 : _a.bind(g)) !== null && _b !== void 0 ? _b : notImplemented('fetch');
        this.requestAnimationFrame = 'requestAnimationFrame' in overrides ? overrides.requestAnimationFrame : (_d = (_c = g.requestAnimationFrame) === null || _c === void 0 ? void 0 : _c.bind(g)) !== null && _d !== void 0 ? _d : notImplemented('requestAnimationFrame');
        this.cancelAnimationFrame = 'cancelAnimationFrame' in overrides ? overrides.cancelAnimationFrame : (_f = (_e = g.cancelAnimationFrame) === null || _e === void 0 ? void 0 : _e.bind(g)) !== null && _f !== void 0 ? _f : notImplemented('cancelAnimationFrame');
        this.customElements = 'customElements' in overrides ? overrides.customElements : g.customElements;
        this.flushDomRead = this.flushDomRead.bind(this);
        this.flushDomWrite = this.flushDomWrite.bind(this);
        this.domReadQueue = new TaskQueue(this, this.requestDomRead.bind(this), this.cancelDomRead.bind(this));
        this.domWriteQueue = new TaskQueue(this, this.requestDomWrite.bind(this), this.cancelDomWrite.bind(this));
        /* eslint-enable @typescript-eslint/no-unnecessary-type-assertion */
    }
    static getOrCreate(g, overrides = {}) {
        let platform = lookup.get(g);
        if (platform === void 0) {
            lookup.set(g, platform = new BrowserPlatform(g, overrides));
        }
        return platform;
    }
    static set(g, platform) {
        lookup.set(g, platform);
    }
    requestDomRead() {
        this.domReadRequested = true;
        // Yes, this is intentional: the timing of the read can only be "found" by doing a write first.
        // The flushDomWrite queues the read.
        // If/when requestPostAnimationFrame is implemented in browsers, we can use that instead.
        if (this.domWriteHandle === -1) {
            this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
        }
    }
    cancelDomRead() {
        this.domReadRequested = false;
        if (this.domReadHandle > -1) {
            this.clearTimeout(this.domReadHandle);
            this.domReadHandle = -1;
        }
        if (this.domWriteRequested === false && this.domWriteHandle > -1) {
            this.cancelAnimationFrame(this.domWriteHandle);
            this.domWriteHandle = -1;
        }
    }
    flushDomRead() {
        this.domReadHandle = -1;
        if (this.domReadRequested === true) {
            this.domReadRequested = false;
            this.domReadQueue.flush();
        }
    }
    requestDomWrite() {
        this.domWriteRequested = true;
        if (this.domWriteHandle === -1) {
            this.domWriteHandle = this.requestAnimationFrame(this.flushDomWrite);
        }
    }
    cancelDomWrite() {
        this.domWriteRequested = false;
        if (this.domWriteHandle > -1 &&
            // if dom read is requested and there is no readHandle yet, we need the rAF to proceed regardless.
            // The domWriteRequested=false will prevent the read flush from happening.
            (this.domReadRequested === false || this.domReadHandle > -1)) {
            this.cancelAnimationFrame(this.domWriteHandle);
            this.domWriteHandle = -1;
        }
    }
    flushDomWrite() {
        this.domWriteHandle = -1;
        if (this.domWriteRequested === true) {
            this.domWriteRequested = false;
            this.domWriteQueue.flush();
        }
        if (this.domReadRequested === true && this.domReadHandle === -1) {
            this.domReadHandle = this.setTimeout(this.flushDomRead, 0);
        }
    }
}

function alias(...aliases) {
    return function (target) {
        const key = Protocol.annotation.keyFor('aliases');
        const existing = Metadata.getOwn(key, target);
        if (existing === void 0) {
            Metadata.define(key, aliases, target);
        }
        else {
            existing.push(...aliases);
        }
    };
}
function registerAliases(aliases, resource, key, container) {
    for (let i = 0, ii = aliases.length; i < ii; ++i) {
        Registration.aliasTo(key, resource.keyFrom(aliases[i])).register(container);
    }
}

const marker = Object.freeze({});
class BindingContext {
    constructor(keyOrObj, value) {
        if (keyOrObj !== void 0) {
            if (value !== void 0) {
                // if value is defined then it's just a property and a value to initialize with
                this[keyOrObj] = value;
            }
            else {
                // can either be some random object or another bindingContext to clone from
                for (const prop in keyOrObj) {
                    if (Object.prototype.hasOwnProperty.call(keyOrObj, prop)) {
                        this[prop] = keyOrObj[prop];
                    }
                }
            }
        }
    }
    static create(keyOrObj, value) {
        return new BindingContext(keyOrObj, value);
    }
    static get(scope, name, ancestor, flags, hostScope) {
        if (scope == null && hostScope == null) {
            throw new Error(`Scope is ${scope} and HostScope is ${hostScope}.`);
        }
        const hasOtherScope = hostScope !== scope && hostScope != null;
        /* eslint-disable jsdoc/check-indentation */
        /**
         * This fallback is needed to support the following case:
         * <div au-slot="s1">
         *  <let outer-host.bind="$host"></let>
         *  ${outerHost.prop}
         * </div>
         * To enable the `let` binding for 'hostScope', the property is added to `hostScope.overrideContext`. That enables us to use such let binding also inside a repeater.
         * However, as the expression `${outerHost.prop}` does not start with `$host`, it is considered that to evaluate this expression we don't need the access to hostScope.
         * This artifact raises the need for this fallback.
         */
        /* eslint-enable jsdoc/check-indentation */
        let context = chooseContext(scope, name, ancestor, null);
        if (context !== null
            && ((context == null ? false : name in context)
                || !hasOtherScope)) {
            return context;
        }
        if (hasOtherScope) {
            context = chooseContext(hostScope, name, ancestor, scope);
            if (context !== null && (context !== undefined && name in context)) {
                return context;
            }
        }
        // still nothing found. return the root binding context (or null
        // if this is a parent scope traversal, to ensure we fall back to the
        // correct level)
        if (flags & 16 /* isTraversingParentScope */) {
            return marker;
        }
        return scope.bindingContext || scope.overrideContext;
    }
}
function chooseContext(scope, name, ancestor, projectionScope) {
    var _a, _b;
    let overrideContext = scope.overrideContext;
    let currentScope = scope;
    if (ancestor > 0) {
        // jump up the required number of ancestor contexts (eg $parent.$parent requires two jumps)
        while (ancestor > 0) {
            ancestor--;
            currentScope = currentScope.parentScope;
            if ((currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) == null) {
                return void 0;
            }
        }
        overrideContext = currentScope.overrideContext;
        return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }
    // traverse the context and it's ancestors, searching for a context that has the name.
    while ((!(currentScope === null || currentScope === void 0 ? void 0 : currentScope.isComponentBoundary)
        || projectionScope !== null && projectionScope !== currentScope)
        && overrideContext
        && !(name in overrideContext)
        && !(overrideContext.bindingContext
            && name in overrideContext.bindingContext)) {
        currentScope = (_a = currentScope.parentScope) !== null && _a !== void 0 ? _a : null;
        overrideContext = (_b = currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) !== null && _b !== void 0 ? _b : null;
    }
    if (overrideContext) {
        return name in overrideContext ? overrideContext : overrideContext.bindingContext;
    }
    return null;
}
class Scope {
    constructor(parentScope, bindingContext, overrideContext, isComponentBoundary) {
        this.parentScope = parentScope;
        this.bindingContext = bindingContext;
        this.overrideContext = overrideContext;
        this.isComponentBoundary = isComponentBoundary;
    }
    static create(bc, oc, isComponentBoundary) {
        return new Scope(null, bc, oc == null ? OverrideContext.create(bc) : oc, isComponentBoundary !== null && isComponentBoundary !== void 0 ? isComponentBoundary : false);
    }
    static fromOverride(oc) {
        if (oc == null) {
            throw new Error(`OverrideContext is ${oc}`);
        }
        return new Scope(null, oc.bindingContext, oc, false);
    }
    static fromParent(ps, bc) {
        if (ps == null) {
            throw new Error(`ParentScope is ${ps}`);
        }
        return new Scope(ps, bc, OverrideContext.create(bc), false);
    }
}
class OverrideContext {
    constructor(bindingContext) {
        this.bindingContext = bindingContext;
    }
    static create(bc) {
        return new OverrideContext(bc);
    }
}

const ISignaler = DI.createInterface('ISignaler', x => x.singleton(Signaler));
class Signaler {
    constructor() {
        this.signals = Object.create(null);
    }
    dispatchSignal(name, flags) {
        const listeners = this.signals[name];
        if (listeners === undefined) {
            return;
        }
        for (const listener of listeners.keys()) {
            listener.handleChange(undefined, undefined, flags);
        }
    }
    addSignalListener(name, listener) {
        const signals = this.signals;
        const listeners = signals[name];
        if (listeners === undefined) {
            signals[name] = new Set([listener]);
        }
        else {
            listeners.add(listener);
        }
    }
    removeSignalListener(name, listener) {
        const listeners = this.signals[name];
        if (listeners) {
            listeners.delete(listener);
        }
    }
}

var BindingBehaviorStrategy;
(function (BindingBehaviorStrategy) {
    BindingBehaviorStrategy[BindingBehaviorStrategy["singleton"] = 1] = "singleton";
    BindingBehaviorStrategy[BindingBehaviorStrategy["interceptor"] = 2] = "interceptor";
})(BindingBehaviorStrategy || (BindingBehaviorStrategy = {}));
function bindingBehavior(nameOrDef) {
    return function (target) {
        return BindingBehavior.define(nameOrDef, target);
    };
}
class BindingBehaviorDefinition {
    constructor(Type, name, aliases, key, strategy) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.strategy = strategy;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        const inheritsFromInterceptor = Object.getPrototypeOf(Type) === BindingInterceptor;
        return new BindingBehaviorDefinition(Type, firstDefined(BindingBehavior.getAnnotation(Type, 'name'), name), mergeArrays(BindingBehavior.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingBehavior.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('strategy', def, Type, () => inheritsFromInterceptor ? 2 /* interceptor */ : 1 /* singleton */));
    }
    register(container) {
        const { Type, key, aliases, strategy } = this;
        switch (strategy) {
            case 1 /* singleton */:
                Registration.singleton(key, Type).register(container);
                break;
            case 2 /* interceptor */:
                Registration.instance(key, new BindingBehaviorFactory(container, Type)).register(container);
                break;
        }
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, BindingBehavior, key, container);
    }
}
class BindingBehaviorFactory {
    constructor(container, Type) {
        this.container = container;
        this.Type = Type;
        this.deps = DI.getDependencies(Type);
    }
    construct(binding, expr) {
        const container = this.container;
        const deps = this.deps;
        switch (deps.length) {
            case 0:
            case 1:
            case 2:
                // TODO(fkleuver): fix this cast
                return new this.Type(binding, expr);
            case 3:
                return new this.Type(container.get(deps[0]), binding, expr);
            case 4:
                return new this.Type(container.get(deps[0]), container.get(deps[1]), binding, expr);
            default:
                return new this.Type(...deps.map(d => container.get(d)), binding, expr);
        }
    }
}
class BindingInterceptor {
    constructor(binding, expr) {
        this.binding = binding;
        this.expr = expr;
        this.interceptor = this;
        let interceptor;
        while (binding.interceptor !== this) {
            interceptor = binding.interceptor;
            binding.interceptor = this;
            binding = interceptor;
        }
    }
    get observerLocator() {
        return this.binding.observerLocator;
    }
    get locator() {
        return this.binding.locator;
    }
    get $scope() {
        return this.binding.$scope;
    }
    get $hostScope() {
        return this.binding.$hostScope;
    }
    get isBound() {
        return this.binding.isBound;
    }
    get obs() {
        return this.binding.obs;
    }
    get sourceExpression() {
        return this.binding.sourceExpression;
    }
    updateTarget(value, flags) {
        this.binding.updateTarget(value, flags);
    }
    updateSource(value, flags) {
        this.binding.updateSource(value, flags);
    }
    callSource(args) {
        return this.binding.callSource(args);
    }
    handleChange(newValue, previousValue, flags) {
        this.binding.handleChange(newValue, previousValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.binding.handleCollectionChange(indexMap, flags);
    }
    observeProperty(obj, key) {
        this.binding.observeProperty(obj, key);
    }
    observeCollection(observer) {
        this.binding.observeCollection(observer);
    }
    $bind(flags, scope, hostScope) {
        this.binding.$bind(flags, scope, hostScope);
    }
    $unbind(flags) {
        this.binding.$unbind(flags);
    }
}
const BindingBehavior = {
    name: Protocol.resource.keyFor('binding-behavior'),
    keyFrom(name) {
        return `${BindingBehavior.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(BindingBehavior.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingBehaviorDefinition.create(nameOrDef, Type);
        Metadata.define(BindingBehavior.name, definition, definition.Type);
        Metadata.define(BindingBehavior.name, definition, definition);
        Protocol.resource.appendTo(Type, BindingBehavior.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(BindingBehavior.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};

function valueConverter(nameOrDef) {
    return function (target) {
        return ValueConverter.define(nameOrDef, target);
    };
}
class ValueConverterDefinition {
    constructor(Type, name, aliases, key) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        return new ValueConverterDefinition(Type, firstDefined(ValueConverter.getAnnotation(Type, 'name'), name), mergeArrays(ValueConverter.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), ValueConverter.keyFrom(name));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, ValueConverter, key, container);
    }
}
const ValueConverter = {
    name: Protocol.resource.keyFor('value-converter'),
    keyFrom(name) {
        return `${ValueConverter.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(ValueConverter.name, value);
    },
    define(nameOrDef, Type) {
        const definition = ValueConverterDefinition.create(nameOrDef, Type);
        Metadata.define(ValueConverter.name, definition, definition.Type);
        Metadata.define(ValueConverter.name, definition, definition);
        Protocol.resource.appendTo(Type, ValueConverter.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(ValueConverter.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};

/* eslint-disable eqeqeq */
var ExpressionKind$1;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["Connects"] = 32] = "Connects";
    ExpressionKind[ExpressionKind["Observes"] = 64] = "Observes";
    ExpressionKind[ExpressionKind["CallsFunction"] = 128] = "CallsFunction";
    ExpressionKind[ExpressionKind["HasAncestor"] = 256] = "HasAncestor";
    ExpressionKind[ExpressionKind["IsPrimary"] = 512] = "IsPrimary";
    ExpressionKind[ExpressionKind["IsLeftHandSide"] = 1024] = "IsLeftHandSide";
    ExpressionKind[ExpressionKind["HasBind"] = 2048] = "HasBind";
    ExpressionKind[ExpressionKind["HasUnbind"] = 4096] = "HasUnbind";
    ExpressionKind[ExpressionKind["IsAssignable"] = 8192] = "IsAssignable";
    ExpressionKind[ExpressionKind["IsLiteral"] = 16384] = "IsLiteral";
    ExpressionKind[ExpressionKind["IsResource"] = 32768] = "IsResource";
    ExpressionKind[ExpressionKind["IsForDeclaration"] = 65536] = "IsForDeclaration";
    ExpressionKind[ExpressionKind["Type"] = 31] = "Type";
    // ---------------------------------------------------------------------------------------------------------------------------
    ExpressionKind[ExpressionKind["AccessThis"] = 1793] = "AccessThis";
    ExpressionKind[ExpressionKind["AccessScope"] = 10082] = "AccessScope";
    ExpressionKind[ExpressionKind["ArrayLiteral"] = 17955] = "ArrayLiteral";
    ExpressionKind[ExpressionKind["ObjectLiteral"] = 17956] = "ObjectLiteral";
    ExpressionKind[ExpressionKind["PrimitiveLiteral"] = 17925] = "PrimitiveLiteral";
    ExpressionKind[ExpressionKind["Template"] = 17958] = "Template";
    ExpressionKind[ExpressionKind["Unary"] = 39] = "Unary";
    ExpressionKind[ExpressionKind["CallScope"] = 1448] = "CallScope";
    ExpressionKind[ExpressionKind["CallMember"] = 1161] = "CallMember";
    ExpressionKind[ExpressionKind["CallFunction"] = 1162] = "CallFunction";
    ExpressionKind[ExpressionKind["AccessMember"] = 9323] = "AccessMember";
    ExpressionKind[ExpressionKind["AccessKeyed"] = 9324] = "AccessKeyed";
    ExpressionKind[ExpressionKind["TaggedTemplate"] = 1197] = "TaggedTemplate";
    ExpressionKind[ExpressionKind["Binary"] = 46] = "Binary";
    ExpressionKind[ExpressionKind["Conditional"] = 63] = "Conditional";
    ExpressionKind[ExpressionKind["Assign"] = 8208] = "Assign";
    ExpressionKind[ExpressionKind["ValueConverter"] = 36913] = "ValueConverter";
    ExpressionKind[ExpressionKind["BindingBehavior"] = 38962] = "BindingBehavior";
    ExpressionKind[ExpressionKind["HtmlLiteral"] = 51] = "HtmlLiteral";
    ExpressionKind[ExpressionKind["ArrayBindingPattern"] = 65556] = "ArrayBindingPattern";
    ExpressionKind[ExpressionKind["ObjectBindingPattern"] = 65557] = "ObjectBindingPattern";
    ExpressionKind[ExpressionKind["BindingIdentifier"] = 65558] = "BindingIdentifier";
    ExpressionKind[ExpressionKind["ForOfStatement"] = 6199] = "ForOfStatement";
    ExpressionKind[ExpressionKind["Interpolation"] = 24] = "Interpolation"; //
})(ExpressionKind$1 || (ExpressionKind$1 = {}));
class Unparser {
    constructor() {
        this.text = '';
    }
    static unparse(expr) {
        const visitor = new Unparser();
        expr.accept(visitor);
        return visitor.text;
    }
    visitAccessMember(expr) {
        expr.object.accept(this);
        this.text += `.${expr.name}`;
    }
    visitAccessKeyed(expr) {
        expr.object.accept(this);
        this.text += '[';
        expr.key.accept(this);
        this.text += ']';
    }
    visitAccessThis(expr) {
        if (expr.ancestor === 0) {
            this.text += '$this';
            return;
        }
        this.text += '$parent';
        let i = expr.ancestor - 1;
        while (i--) {
            this.text += '.$parent';
        }
    }
    visitAccessScope(expr) {
        let i = expr.ancestor;
        while (i--) {
            this.text += '$parent.';
        }
        this.text += expr.name;
    }
    visitArrayLiteral(expr) {
        const elements = expr.elements;
        this.text += '[';
        for (let i = 0, length = elements.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            elements[i].accept(this);
        }
        this.text += ']';
    }
    visitObjectLiteral(expr) {
        const keys = expr.keys;
        const values = expr.values;
        this.text += '{';
        for (let i = 0, length = keys.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            this.text += `'${keys[i]}':`;
            values[i].accept(this);
        }
        this.text += '}';
    }
    visitPrimitiveLiteral(expr) {
        this.text += '(';
        if (typeof expr.value === 'string') {
            const escaped = expr.value.replace(/'/g, '\\\'');
            this.text += `'${escaped}'`;
        }
        else {
            this.text += `${expr.value}`;
        }
        this.text += ')';
    }
    visitCallFunction(expr) {
        this.text += '(';
        expr.func.accept(this);
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallMember(expr) {
        this.text += '(';
        expr.object.accept(this);
        this.text += `.${expr.name}`;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitCallScope(expr) {
        this.text += '(';
        let i = expr.ancestor;
        while (i--) {
            this.text += '$parent.';
        }
        this.text += expr.name;
        this.writeArgs(expr.args);
        this.text += ')';
    }
    visitTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            expressions[i].accept(this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitTaggedTemplate(expr) {
        const { cooked, expressions } = expr;
        const length = expressions.length;
        expr.func.accept(this);
        this.text += '`';
        this.text += cooked[0];
        for (let i = 0; i < length; i++) {
            expressions[i].accept(this);
            this.text += cooked[i + 1];
        }
        this.text += '`';
    }
    visitUnary(expr) {
        this.text += `(${expr.operation}`;
        if (expr.operation.charCodeAt(0) >= /* a */ 97) {
            this.text += ' ';
        }
        expr.expression.accept(this);
        this.text += ')';
    }
    visitBinary(expr) {
        this.text += '(';
        expr.left.accept(this);
        if (expr.operation.charCodeAt(0) === /* i */ 105) {
            this.text += ` ${expr.operation} `;
        }
        else {
            this.text += expr.operation;
        }
        expr.right.accept(this);
        this.text += ')';
    }
    visitConditional(expr) {
        this.text += '(';
        expr.condition.accept(this);
        this.text += '?';
        expr.yes.accept(this);
        this.text += ':';
        expr.no.accept(this);
        this.text += ')';
    }
    visitAssign(expr) {
        this.text += '(';
        expr.target.accept(this);
        this.text += '=';
        expr.value.accept(this);
        this.text += ')';
    }
    visitValueConverter(expr) {
        const args = expr.args;
        expr.expression.accept(this);
        this.text += `|${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            args[i].accept(this);
        }
    }
    visitBindingBehavior(expr) {
        const args = expr.args;
        expr.expression.accept(this);
        this.text += `&${expr.name}`;
        for (let i = 0, length = args.length; i < length; ++i) {
            this.text += ':';
            args[i].accept(this);
        }
    }
    visitArrayBindingPattern(expr) {
        const elements = expr.elements;
        this.text += '[';
        for (let i = 0, length = elements.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            elements[i].accept(this);
        }
        this.text += ']';
    }
    visitObjectBindingPattern(expr) {
        const keys = expr.keys;
        const values = expr.values;
        this.text += '{';
        for (let i = 0, length = keys.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            this.text += `'${keys[i]}':`;
            values[i].accept(this);
        }
        this.text += '}';
    }
    visitBindingIdentifier(expr) {
        this.text += expr.name;
    }
    visitHtmlLiteral(expr) { throw new Error('visitHtmlLiteral'); }
    visitForOfStatement(expr) {
        expr.declaration.accept(this);
        this.text += ' of ';
        expr.iterable.accept(this);
    }
    visitInterpolation(expr) {
        const { parts, expressions } = expr;
        const length = expressions.length;
        this.text += '${';
        this.text += parts[0];
        for (let i = 0; i < length; i++) {
            expressions[i].accept(this);
            this.text += parts[i + 1];
        }
        this.text += '}';
    }
    writeArgs(args) {
        this.text += '(';
        for (let i = 0, length = args.length; i < length; ++i) {
            if (i !== 0) {
                this.text += ',';
            }
            args[i].accept(this);
        }
        this.text += ')';
    }
}
function chooseScope(accessHostScope, s, hs) {
    if (accessHostScope) {
        if (hs === null || hs === void 0) {
            throw new Error('Host scope is missing. Are you using `$host` outside the `au-slot`? Or missing the `au-slot` attribute?');
        }
        return hs;
    }
    return s;
}
class CustomExpression {
    constructor(value) {
        this.value = value;
    }
    evaluate(_f, _s, _hs, _l, _c) {
        return this.value;
    }
}
class BindingBehaviorExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.behaviorKey = BindingBehavior.keyFrom(name);
    }
    get $kind() { return 38962 /* BindingBehavior */; }
    get hasBind() { return true; }
    get hasUnbind() { return true; }
    evaluate(f, s, hs, l, c) {
        return this.expression.evaluate(f, s, hs, l, c);
    }
    assign(f, s, hs, l, val) {
        return this.expression.assign(f, s, hs, l, val);
    }
    bind(f, s, hs, b) {
        if (this.expression.hasBind) {
            this.expression.bind(f, s, hs, b);
        }
        const behavior = b.locator.get(this.behaviorKey);
        if (behavior == null) {
            throw new Error(`BindingBehavior named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        if (!(behavior instanceof BindingBehaviorFactory)) {
            if (b[this.behaviorKey] === void 0) {
                b[this.behaviorKey] = behavior;
                behavior.bind.call(behavior, f, s, hs, b, ...this.args.map(a => a.evaluate(f, s, hs, b.locator, null)));
            }
            else {
                throw new Error(`BindingBehavior named '${this.name}' already applied.`);
            }
        }
    }
    unbind(f, s, hs, b) {
        const key = this.behaviorKey;
        const $b = b;
        if ($b[key] !== void 0) {
            if (typeof $b[key].unbind === 'function') {
                $b[key].unbind(f, s, hs, b);
            }
            $b[key] = void 0;
        }
        if (this.expression.hasUnbind) {
            this.expression.unbind(f, s, hs, b);
        }
    }
    accept(visitor) {
        return visitor.visitBindingBehavior(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ValueConverterExpression {
    constructor(expression, name, args) {
        this.expression = expression;
        this.name = name;
        this.args = args;
        this.converterKey = ValueConverter.keyFrom(name);
    }
    get $kind() { return 36913 /* ValueConverter */; }
    get hasBind() { return false; }
    get hasUnbind() { return true; }
    evaluate(f, s, hs, l, c) {
        const vc = l.get(this.converterKey);
        if (vc == null) {
            throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        // note: the cast is expected. To connect, it just needs to be a IConnectable
        // though to work with signal, it needs to have `handleChange`
        // so having `handleChange` as a guard in the connectable as a safe measure is needed
        // to make sure signaler works
        if (c !== null && ('handleChange' in c)) {
            const signals = vc.signals;
            if (signals != null) {
                const signaler = l.get(ISignaler);
                for (let i = 0, ii = signals.length; i < ii; ++i) {
                    signaler.addSignalListener(signals[i], c);
                }
            }
        }
        if ('toView' in vc) {
            return vc.toView(this.expression.evaluate(f, s, hs, l, c), ...this.args.map(a => a.evaluate(f, s, hs, l, c)));
        }
        return this.expression.evaluate(f, s, hs, l, c);
    }
    assign(f, s, hs, l, val) {
        const vc = l.get(this.converterKey);
        if (vc == null) {
            throw new Error(`ValueConverter named '${this.name}' could not be found. Did you forget to register it as a dependency?`);
        }
        if ('fromView' in vc) {
            val = vc.fromView(val, ...this.args.map(a => a.evaluate(f, s, hs, l, null)));
        }
        return this.expression.assign(f, s, hs, l, val);
    }
    unbind(_f, _s, _hs, b) {
        const vc = b.locator.get(this.converterKey);
        if (vc.signals === void 0) {
            return;
        }
        const signaler = b.locator.get(ISignaler);
        for (let i = 0; i < vc.signals.length; ++i) {
            // the cast is correct, as the value converter expression would only add
            // a IConnectable that also implements `ISubscriber` interface to the signaler
            signaler.removeSignalListener(vc.signals[i], b);
        }
    }
    accept(visitor) {
        return visitor.visitValueConverter(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AssignExpression {
    constructor(target, value) {
        this.target = target;
        this.value = value;
    }
    get $kind() { return 8208 /* Assign */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        return this.target.assign(f, s, hs, l, this.value.evaluate(f, s, hs, l, c));
    }
    assign(f, s, hs, l, val) {
        this.value.assign(f, s, hs, l, val);
        return this.target.assign(f, s, hs, l, val);
    }
    accept(visitor) {
        return visitor.visitAssign(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ConditionalExpression {
    constructor(condition, yes, no) {
        this.condition = condition;
        this.yes = yes;
        this.no = no;
    }
    get $kind() { return 63 /* Conditional */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        return this.condition.evaluate(f, s, hs, l, c) ? this.yes.evaluate(f, s, hs, l, c) : this.no.evaluate(f, s, hs, l, c);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitConditional(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AccessThisExpression {
    constructor(ancestor = 0) {
        this.ancestor = ancestor;
    }
    get $kind() { return 1793 /* AccessThis */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, s, hs, _l, _c) {
        var _a;
        if (this === AccessThisExpression.$host) {
            s = chooseScope(true, s, hs);
        }
        let oc = s.overrideContext;
        let currentScope = s;
        let i = this.ancestor;
        while (i-- && oc) {
            currentScope = currentScope.parentScope;
            oc = (_a = currentScope === null || currentScope === void 0 ? void 0 : currentScope.overrideContext) !== null && _a !== void 0 ? _a : null;
        }
        return i < 1 && oc ? oc.bindingContext : void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitAccessThis(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
AccessThisExpression.$this = new AccessThisExpression(0);
// $host and $this are loosely the same thing. $host is used in the context of `au-slot` with the primary objective of determining the s.
AccessThisExpression.$host = new AccessThisExpression(0);
AccessThisExpression.$parent = new AccessThisExpression(1);
class AccessScopeExpression {
    constructor(name, ancestor = 0, accessHostScope = false) {
        this.name = name;
        this.ancestor = ancestor;
        this.accessHostScope = accessHostScope;
    }
    get $kind() { return 10082 /* AccessScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, _l, c) {
        const obj = BindingContext.get(chooseScope(this.accessHostScope, s, hs), this.name, this.ancestor, f, hs);
        if (c !== null) {
            c.observeProperty(obj, this.name);
        }
        const evaluatedValue = obj[this.name];
        if (f & 1 /* isStrictBindingStrategy */) {
            return evaluatedValue;
        }
        return evaluatedValue == null ? '' : evaluatedValue;
    }
    assign(f, s, hs, _l, val) {
        var _a;
        const obj = BindingContext.get(chooseScope(this.accessHostScope, s, hs), this.name, this.ancestor, f, hs);
        if (obj instanceof Object) {
            if (((_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[this.name]) !== void 0) {
                obj.$observers[this.name].setValue(val, f);
                return val;
            }
            else {
                return obj[this.name] = val;
            }
        }
        return void 0;
    }
    accept(visitor) {
        return visitor.visitAccessScope(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AccessMemberExpression {
    constructor(object, name) {
        this.object = object;
        this.name = name;
    }
    get $kind() { return 9323 /* AccessMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = this.object.evaluate(f, s, hs, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        if (f & 1 /* isStrictBindingStrategy */) {
            if (instance == null) {
                return instance;
            }
            if (c !== null) {
                c.observeProperty(instance, this.name);
            }
            return instance[this.name];
        }
        if (c !== null && instance instanceof Object) {
            c.observeProperty(instance, this.name);
        }
        return instance ? instance[this.name] : '';
    }
    assign(f, s, hs, l, val) {
        const obj = this.object.evaluate(f, s, hs, l, null);
        if (obj instanceof Object) {
            if (obj.$observers !== void 0 && obj.$observers[this.name] !== void 0) {
                obj.$observers[this.name].setValue(val, f);
            }
            else {
                obj[this.name] = val;
            }
        }
        else {
            this.object.assign(f, s, hs, l, { [this.name]: val });
        }
        return val;
    }
    accept(visitor) {
        return visitor.visitAccessMember(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class AccessKeyedExpression {
    constructor(object, key) {
        this.object = object;
        this.key = key;
    }
    get $kind() { return 9324 /* AccessKeyed */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = this.object.evaluate(f, s, hs, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        if (instance instanceof Object) {
            const key = this.key.evaluate(f, s, hs, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
            if (c !== null) {
                c.observeProperty(instance, key);
            }
            return instance[key];
        }
        return void 0;
    }
    assign(f, s, hs, l, val) {
        const instance = this.object.evaluate(f, s, hs, l, null);
        const key = this.key.evaluate(f, s, hs, l, null);
        return instance[key] = val;
    }
    accept(visitor) {
        return visitor.visitAccessKeyed(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class CallScopeExpression {
    constructor(name, args, ancestor = 0, accessHostScope = false) {
        this.name = name;
        this.args = args;
        this.ancestor = ancestor;
        this.accessHostScope = accessHostScope;
    }
    get $kind() { return 1448 /* CallScope */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        s = chooseScope(this.accessHostScope, s, hs);
        const args = this.args.map(a => a.evaluate(f, s, hs, l, c));
        const context = BindingContext.get(s, this.name, this.ancestor, f, hs);
        // ideally, should observe property represents by this.name as well
        // because it could be changed
        // todo: did it ever surprise anyone?
        const func = getFunction(f, context, this.name);
        if (func) {
            return func.apply(context, args);
        }
        return void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallScope(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class CallMemberExpression {
    constructor(object, name, args) {
        this.object = object;
        this.name = name;
        this.args = args;
    }
    get $kind() { return 1161 /* CallMember */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = this.object.evaluate(f, s, hs, l, (f & 128 /* observeLeafPropertiesOnly */) > 0 ? null : c);
        const args = this.args.map(a => a.evaluate(f, s, hs, l, c));
        const func = getFunction(f, instance, this.name);
        if (func) {
            return func.apply(instance, args);
        }
        return void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallMember(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class CallFunctionExpression {
    constructor(func, args) {
        this.func = func;
        this.args = args;
    }
    get $kind() { return 1162 /* CallFunction */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const func = this.func.evaluate(f, s, hs, l, c);
        if (typeof func === 'function') {
            return func(...this.args.map(a => a.evaluate(f, s, hs, l, c)));
        }
        if (!(f & 8 /* mustEvaluate */) && (func == null)) {
            return void 0;
        }
        throw new Error(`Expression is not a function.`);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitCallFunction(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class BinaryExpression {
    constructor(operation, left, right) {
        this.operation = operation;
        this.left = left;
        this.right = right;
    }
    get $kind() { return 46 /* Binary */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        switch (this.operation) {
            case '&&':
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return this.left.evaluate(f, s, hs, l, c) && this.right.evaluate(f, s, hs, l, c);
            case '||':
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                return this.left.evaluate(f, s, hs, l, c) || this.right.evaluate(f, s, hs, l, c);
            case '==':
                return this.left.evaluate(f, s, hs, l, c) == this.right.evaluate(f, s, hs, l, c);
            case '===':
                return this.left.evaluate(f, s, hs, l, c) === this.right.evaluate(f, s, hs, l, c);
            case '!=':
                return this.left.evaluate(f, s, hs, l, c) != this.right.evaluate(f, s, hs, l, c);
            case '!==':
                return this.left.evaluate(f, s, hs, l, c) !== this.right.evaluate(f, s, hs, l, c);
            case 'instanceof': {
                const right = this.right.evaluate(f, s, hs, l, c);
                if (typeof right === 'function') {
                    return this.left.evaluate(f, s, hs, l, c) instanceof right;
                }
                return false;
            }
            case 'in': {
                const right = this.right.evaluate(f, s, hs, l, c);
                if (right instanceof Object) {
                    return this.left.evaluate(f, s, hs, l, c) in right;
                }
                return false;
            }
            // note: autoConvertAdd (and the null check) is removed because the default spec behavior is already largely similar
            // and where it isn't, you kind of want it to behave like the spec anyway (e.g. return NaN when adding a number to undefined)
            // this makes bugs in user code easier to track down for end users
            // also, skipping these checks and leaving it to the runtime is a nice little perf boost and simplifies our code
            case '+': {
                const left = this.left.evaluate(f, s, hs, l, c);
                const right = this.right.evaluate(f, s, hs, l, c);
                if ((f & 1 /* isStrictBindingStrategy */) > 0) {
                    return left + right;
                }
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!left || !right) {
                    if (isNumberOrBigInt(left) || isNumberOrBigInt(right)) {
                        return (left || 0) + (right || 0);
                    }
                    if (isStringOrDate(left) || isStringOrDate(right)) {
                        return (left || '') + (right || '');
                    }
                }
                return left + right;
            }
            case '-':
                return this.left.evaluate(f, s, hs, l, c) - this.right.evaluate(f, s, hs, l, c);
            case '*':
                return this.left.evaluate(f, s, hs, l, c) * this.right.evaluate(f, s, hs, l, c);
            case '/':
                return this.left.evaluate(f, s, hs, l, c) / this.right.evaluate(f, s, hs, l, c);
            case '%':
                return this.left.evaluate(f, s, hs, l, c) % this.right.evaluate(f, s, hs, l, c);
            case '<':
                return this.left.evaluate(f, s, hs, l, c) < this.right.evaluate(f, s, hs, l, c);
            case '>':
                return this.left.evaluate(f, s, hs, l, c) > this.right.evaluate(f, s, hs, l, c);
            case '<=':
                return this.left.evaluate(f, s, hs, l, c) <= this.right.evaluate(f, s, hs, l, c);
            case '>=':
                return this.left.evaluate(f, s, hs, l, c) >= this.right.evaluate(f, s, hs, l, c);
            default:
                throw new Error(`Unknown binary operator: '${this.operation}'`);
        }
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitBinary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class UnaryExpression {
    constructor(operation, expression) {
        this.operation = operation;
        this.expression = expression;
    }
    get $kind() { return 39 /* Unary */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        switch (this.operation) {
            case 'void':
                return void this.expression.evaluate(f, s, hs, l, c);
            case 'typeof':
                return typeof this.expression.evaluate(f | 1 /* isStrictBindingStrategy */, s, hs, l, c);
            case '!':
                return !this.expression.evaluate(f, s, hs, l, c);
            case '-':
                return -this.expression.evaluate(f, s, hs, l, c);
            case '+':
                return +this.expression.evaluate(f, s, hs, l, c);
            default:
                throw new Error(`Unknown unary operator: '${this.operation}'`);
        }
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitUnary(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class PrimitiveLiteralExpression {
    constructor(value) {
        this.value = value;
    }
    get $kind() { return 17925 /* PrimitiveLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
        return this.value;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitPrimitiveLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
PrimitiveLiteralExpression.$undefined = new PrimitiveLiteralExpression(void 0);
PrimitiveLiteralExpression.$null = new PrimitiveLiteralExpression(null);
PrimitiveLiteralExpression.$true = new PrimitiveLiteralExpression(true);
PrimitiveLiteralExpression.$false = new PrimitiveLiteralExpression(false);
PrimitiveLiteralExpression.$empty = new PrimitiveLiteralExpression('');
class ArrayLiteralExpression {
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 17955 /* ArrayLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        return this.elements.map(e => e.evaluate(f, s, hs, l, c));
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitArrayLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
ArrayLiteralExpression.$empty = new ArrayLiteralExpression(emptyArray);
class ObjectLiteralExpression {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 17956 /* ObjectLiteral */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const instance = {};
        for (let i = 0; i < this.keys.length; ++i) {
            instance[this.keys[i]] = this.values[i].evaluate(f, s, hs, l, c);
        }
        return instance;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitObjectLiteral(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
ObjectLiteralExpression.$empty = new ObjectLiteralExpression(emptyArray, emptyArray);
class TemplateExpression {
    constructor(cooked, expressions = emptyArray) {
        this.cooked = cooked;
        this.expressions = expressions;
    }
    get $kind() { return 17958 /* Template */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        let result = this.cooked[0];
        for (let i = 0; i < this.expressions.length; ++i) {
            result += String(this.expressions[i].evaluate(f, s, hs, l, c));
            result += this.cooked[i + 1];
        }
        return result;
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
TemplateExpression.$empty = new TemplateExpression(['']);
class TaggedTemplateExpression {
    constructor(cooked, raw, func, expressions = emptyArray) {
        this.cooked = cooked;
        this.func = func;
        this.expressions = expressions;
        cooked.raw = raw;
    }
    get $kind() { return 1197 /* TaggedTemplate */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        const results = this.expressions.map(e => e.evaluate(f, s, hs, l, c));
        const func = this.func.evaluate(f, s, hs, l, c);
        if (typeof func !== 'function') {
            throw new Error(`Left-hand side of tagged template expression is not a function.`);
        }
        return func(this.cooked, ...results);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitTaggedTemplate(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ArrayBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(elements) {
        this.elements = elements;
    }
    get $kind() { return 65556 /* ArrayBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
        // TODO: this should come after batch
        // as a destructuring expression like [x, y] = value
        //
        // should only trigger change only once:
        // batch(() => {
        //   object.x = value[0]
        //   object.y = value[1]
        // })
        //
        // instead of twice:
        // object.x = value[0]
        // object.y = value[1]
        return void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        // TODO
        return void 0;
    }
    accept(visitor) {
        return visitor.visitArrayBindingPattern(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class ObjectBindingPattern {
    // We'll either have elements, or keys+values, but never all 3
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    get $kind() { return 65557 /* ObjectBindingPattern */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
        // TODO
        // similar to array binding ast, this should only come after batch
        // for a single notification per destructing,
        // regardless number of property assignments on the scope binding context
        return void 0;
    }
    assign(_f, _s, _hs, _l, _obj) {
        // TODO
        return void 0;
    }
    accept(visitor) {
        return visitor.visitObjectBindingPattern(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
class BindingIdentifier {
    constructor(name) {
        this.name = name;
    }
    get $kind() { return 65558 /* BindingIdentifier */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(_f, _s, _hs, _l, _c) {
        return this.name;
    }
    accept(visitor) {
        return visitor.visitBindingIdentifier(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
const toStringTag$1 = Object.prototype.toString;
// https://tc39.github.io/ecma262/#sec-iteration-statements
// https://tc39.github.io/ecma262/#sec-for-in-and-for-of-statements
class ForOfStatement {
    constructor(declaration, iterable) {
        this.declaration = declaration;
        this.iterable = iterable;
    }
    get $kind() { return 6199 /* ForOfStatement */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        return this.iterable.evaluate(f, s, hs, l, c);
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    count(_f, result) {
        switch (toStringTag$1.call(result)) {
            case '[object Array]': return result.length;
            case '[object Map]': return result.size;
            case '[object Set]': return result.size;
            case '[object Number]': return result;
            case '[object Null]': return 0;
            case '[object Undefined]': return 0;
            default: throw new Error(`Cannot count ${toStringTag$1.call(result)}`);
        }
    }
    // deepscan-disable-next-line
    iterate(f, result, func) {
        switch (toStringTag$1.call(result)) {
            case '[object Array]': return $array(result, func);
            case '[object Map]': return $map(result, func);
            case '[object Set]': return $set$1(result, func);
            case '[object Number]': return $number(result, func);
            case '[object Null]': return;
            case '[object Undefined]': return;
            default: throw new Error(`Cannot iterate over ${toStringTag$1.call(result)}`);
        }
    }
    bind(f, s, hs, b) {
        if (this.iterable.hasBind) {
            this.iterable.bind(f, s, hs, b);
        }
    }
    unbind(f, s, hs, b) {
        if (this.iterable.hasUnbind) {
            this.iterable.unbind(f, s, hs, b);
        }
    }
    accept(visitor) {
        return visitor.visitForOfStatement(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
/*
* Note: this implementation is far simpler than the one in vCurrent and might be missing important stuff (not sure yet)
* so while this implementation is identical to Template and we could reuse that one, we don't want to lock outselves in to potentially the wrong abstraction
* but this class might be a candidate for removal if it turns out it does provide all we need
*/
class Interpolation {
    constructor(parts, expressions = emptyArray) {
        this.parts = parts;
        this.expressions = expressions;
        this.isMulti = expressions.length > 1;
        this.firstExpression = expressions[0];
    }
    get $kind() { return 24 /* Interpolation */; }
    get hasBind() { return false; }
    get hasUnbind() { return false; }
    evaluate(f, s, hs, l, c) {
        if (this.isMulti) {
            let result = this.parts[0];
            for (let i = 0; i < this.expressions.length; ++i) {
                result += String(this.expressions[i].evaluate(f, s, hs, l, c));
                result += this.parts[i + 1];
            }
            return result;
        }
        else {
            return `${this.parts[0]}${this.firstExpression.evaluate(f, s, hs, l, c)}${this.parts[1]}`;
        }
    }
    assign(_f, _s, _hs, _l, _obj) {
        return void 0;
    }
    accept(visitor) {
        return visitor.visitInterpolation(this);
    }
    toString() {
        return Unparser.unparse(this);
    }
}
function getFunction(f, obj, name) {
    const func = obj == null ? null : obj[name];
    if (typeof func === 'function') {
        return func;
    }
    if (!(f & 8 /* mustEvaluate */) && func == null) {
        return null;
    }
    throw new Error(`Expected '${name}' to be a function`);
}
function $array(result, func) {
    for (let i = 0, ii = result.length; i < ii; ++i) {
        func(result, i, result[i]);
    }
}
function $map(result, func) {
    const arr = Array(result.size);
    let i = -1;
    for (const entry of result.entries()) {
        arr[++i] = entry;
    }
    $array(arr, func);
}
function $set$1(result, func) {
    const arr = Array(result.size);
    let i = -1;
    for (const key of result.keys()) {
        arr[++i] = key;
    }
    $array(arr, func);
}
function $number(result, func) {
    const arr = Array(result);
    for (let i = 0; i < result; ++i) {
        arr[i] = i;
    }
    $array(arr, func);
}

const def = Reflect.defineProperty;
function defineHiddenProp(obj, key, value) {
    def(obj, key, {
        enumerable: false,
        configurable: true,
        writable: true,
        value
    });
}
function ensureProto(proto, key, defaultValue, force = false) {
    if (force || !Object.prototype.hasOwnProperty.call(proto, key)) {
        defineHiddenProp(proto, key, defaultValue);
    }
}

/*
* Note: the oneTime binding now has a non-zero value for 2 reasons:
*  - plays nicer with bitwise operations (more consistent code, more explicit settings)
*  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
*
* Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
* This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
*/
var BindingMode;
(function (BindingMode) {
    BindingMode[BindingMode["oneTime"] = 1] = "oneTime";
    BindingMode[BindingMode["toView"] = 2] = "toView";
    BindingMode[BindingMode["fromView"] = 4] = "fromView";
    BindingMode[BindingMode["twoWay"] = 6] = "twoWay";
    BindingMode[BindingMode["default"] = 8] = "default";
})(BindingMode || (BindingMode = {}));
var LifecycleFlags;
(function (LifecycleFlags) {
    LifecycleFlags[LifecycleFlags["none"] = 0] = "none";
    // Bitmask for flags that need to be stored on a binding during $bind for mutation
    // callbacks outside of $bind
    LifecycleFlags[LifecycleFlags["persistentBindingFlags"] = 961] = "persistentBindingFlags";
    LifecycleFlags[LifecycleFlags["allowParentScopeTraversal"] = 64] = "allowParentScopeTraversal";
    LifecycleFlags[LifecycleFlags["observeLeafPropertiesOnly"] = 128] = "observeLeafPropertiesOnly";
    LifecycleFlags[LifecycleFlags["targetObserverFlags"] = 769] = "targetObserverFlags";
    LifecycleFlags[LifecycleFlags["noFlush"] = 256] = "noFlush";
    LifecycleFlags[LifecycleFlags["persistentTargetObserverQueue"] = 512] = "persistentTargetObserverQueue";
    LifecycleFlags[LifecycleFlags["bindingStrategy"] = 1] = "bindingStrategy";
    LifecycleFlags[LifecycleFlags["isStrictBindingStrategy"] = 1] = "isStrictBindingStrategy";
    LifecycleFlags[LifecycleFlags["fromBind"] = 2] = "fromBind";
    LifecycleFlags[LifecycleFlags["fromUnbind"] = 4] = "fromUnbind";
    LifecycleFlags[LifecycleFlags["mustEvaluate"] = 8] = "mustEvaluate";
    LifecycleFlags[LifecycleFlags["isTraversingParentScope"] = 16] = "isTraversingParentScope";
    LifecycleFlags[LifecycleFlags["dispose"] = 32] = "dispose";
})(LifecycleFlags || (LifecycleFlags = {}));
/** @internal */
var SubscriberFlags;
(function (SubscriberFlags) {
    SubscriberFlags[SubscriberFlags["None"] = 0] = "None";
    SubscriberFlags[SubscriberFlags["Subscriber0"] = 1] = "Subscriber0";
    SubscriberFlags[SubscriberFlags["Subscriber1"] = 2] = "Subscriber1";
    SubscriberFlags[SubscriberFlags["Subscriber2"] = 4] = "Subscriber2";
    SubscriberFlags[SubscriberFlags["SubscribersRest"] = 8] = "SubscribersRest";
    SubscriberFlags[SubscriberFlags["Any"] = 15] = "Any";
})(SubscriberFlags || (SubscriberFlags = {}));
var DelegationStrategy;
(function (DelegationStrategy) {
    DelegationStrategy[DelegationStrategy["none"] = 0] = "none";
    DelegationStrategy[DelegationStrategy["capturing"] = 1] = "capturing";
    DelegationStrategy[DelegationStrategy["bubbling"] = 2] = "bubbling";
})(DelegationStrategy || (DelegationStrategy = {}));
var CollectionKind;
(function (CollectionKind) {
    CollectionKind[CollectionKind["indexed"] = 8] = "indexed";
    CollectionKind[CollectionKind["keyed"] = 4] = "keyed";
    CollectionKind[CollectionKind["array"] = 9] = "array";
    CollectionKind[CollectionKind["map"] = 6] = "map";
    CollectionKind[CollectionKind["set"] = 7] = "set";
})(CollectionKind || (CollectionKind = {}));
var AccessorType;
(function (AccessorType) {
    AccessorType[AccessorType["None"] = 0] = "None";
    AccessorType[AccessorType["Observer"] = 1] = "Observer";
    AccessorType[AccessorType["Node"] = 2] = "Node";
    // misc characteristic of accessors/observers when update
    //
    // by default, everything is synchronous
    // except changes that are supposed to cause reflow/heavy computation
    // an observer can use this flag to signal binding that don't carelessly tell it to update
    // queue it instead
    // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
    // todo: https://csstriggers.com/
    AccessorType[AccessorType["Layout"] = 4] = "Layout";
    // by default, everything is an object
    // eg: a property is accessed on an object
    // unless explicitly not so
    AccessorType[AccessorType["Primtive"] = 8] = "Primtive";
    AccessorType[AccessorType["Array"] = 18] = "Array";
    AccessorType[AccessorType["Set"] = 34] = "Set";
    AccessorType[AccessorType["Map"] = 66] = "Map";
})(AccessorType || (AccessorType = {}));
function createIndexMap(length = 0) {
    const arr = Array(length);
    let i = 0;
    while (i < length) {
        arr[i] = i++;
    }
    arr.deletedItems = [];
    arr.isIndexMap = true;
    return arr;
}

function subscriberCollection(target) {
    return target == null ? subscriberCollectionDeco : subscriberCollectionDeco(target);
}
function subscriberCollectionDeco(target) {
    const proto = target.prototype;
    // not configurable, as in devtool, the getter could be invoked on the prototype,
    // and become permanently broken
    def(proto, 'subs', { get: getSubscriberRecord });
    ensureProto(proto, 'subscribe', addSubscriber);
    ensureProto(proto, 'unsubscribe', removeSubscriber);
}
/* eslint-enable @typescript-eslint/ban-types */
class SubscriberRecord {
    constructor() {
        /**
         * subscriber flags: bits indicating the existence status of the subscribers of this record
         */
        this._sf = 0 /* None */;
        this.count = 0;
    }
    add(subscriber) {
        if (this.has(subscriber)) {
            return false;
        }
        const subscriberFlags = this._sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) === 0) {
            this._s0 = subscriber;
            this._sf |= 1 /* Subscriber0 */;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) === 0) {
            this._s1 = subscriber;
            this._sf |= 2 /* Subscriber1 */;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) === 0) {
            this._s2 = subscriber;
            this._sf |= 4 /* Subscriber2 */;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) === 0) {
            this._sr = [subscriber];
            this._sf |= 8 /* SubscribersRest */;
        }
        else {
            this._sr.push(subscriber); // Non-null is implied by else branch of (subscriberFlags & SF.SubscribersRest) === 0
        }
        ++this.count;
        return true;
    }
    has(subscriber) {
        // Flags here is just a perf tweak
        // Compared to not using flags, it's a moderate speed-up when this collection does not have the subscriber;
        // and minor slow-down when it does, and the former is more common than the latter.
        const subscriberFlags = this._sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._s0 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._s1 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._s2 === subscriber) {
            return true;
        }
        if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            const subscribers = this._sr; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const ii = subscribers.length;
            let i = 0;
            for (; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    return true;
                }
            }
        }
        return false;
    }
    any() {
        return this._sf !== 0 /* None */;
    }
    remove(subscriber) {
        const subscriberFlags = this._sf;
        if ((subscriberFlags & 1 /* Subscriber0 */) > 0 && this._s0 === subscriber) {
            this._s0 = void 0;
            this._sf = (this._sf | 1 /* Subscriber0 */) ^ 1 /* Subscriber0 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 2 /* Subscriber1 */) > 0 && this._s1 === subscriber) {
            this._s1 = void 0;
            this._sf = (this._sf | 2 /* Subscriber1 */) ^ 2 /* Subscriber1 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 4 /* Subscriber2 */) > 0 && this._s2 === subscriber) {
            this._s2 = void 0;
            this._sf = (this._sf | 4 /* Subscriber2 */) ^ 4 /* Subscriber2 */;
            --this.count;
            return true;
        }
        else if ((subscriberFlags & 8 /* SubscribersRest */) > 0) {
            const subscribers = this._sr; // Non-null is implied by (subscriberFlags & SF.SubscribersRest) > 0
            const ii = subscribers.length;
            let i = 0;
            for (; i < ii; ++i) {
                if (subscribers[i] === subscriber) {
                    subscribers.splice(i, 1);
                    if (ii === 1) {
                        this._sf = (this._sf | 8 /* SubscribersRest */) ^ 8 /* SubscribersRest */;
                    }
                    --this.count;
                    return true;
                }
            }
        }
        return false;
    }
    notify(val, oldVal, flags) {
        /**
         * Note: change handlers may have the side-effect of adding/removing subscribers to this collection during this
         * callSubscribers invocation, so we're caching them all before invoking any.
         * Subscribers added during this invocation are not invoked (and they shouldn't be).
         * Subscribers removed during this invocation will still be invoked (and they also shouldn't be,
         * however this is accounted for via $isBound and similar flags on the subscriber objects)
         */
        const sub0 = this._s0;
        const sub1 = this._s1;
        const sub2 = this._s2;
        let subs = this._sr;
        if (subs !== void 0) {
            subs = subs.slice();
        }
        if (sub0 !== void 0) {
            sub0.handleChange(val, oldVal, flags);
        }
        if (sub1 !== void 0) {
            sub1.handleChange(val, oldVal, flags);
        }
        if (sub2 !== void 0) {
            sub2.handleChange(val, oldVal, flags);
        }
        if (subs !== void 0) {
            const ii = subs.length;
            let sub;
            let i = 0;
            for (; i < ii; ++i) {
                sub = subs[i];
                if (sub !== void 0) {
                    sub.handleChange(val, oldVal, flags);
                }
            }
        }
    }
    notifyCollection(indexMap, flags) {
        const sub0 = this._s0;
        const sub1 = this._s1;
        const sub2 = this._s2;
        let subs = this._sr;
        if (subs !== void 0) {
            subs = subs.slice();
        }
        if (sub0 !== void 0) {
            sub0.handleCollectionChange(indexMap, flags);
        }
        if (sub1 !== void 0) {
            sub1.handleCollectionChange(indexMap, flags);
        }
        if (sub2 !== void 0) {
            sub2.handleCollectionChange(indexMap, flags);
        }
        if (subs !== void 0) {
            const ii = subs.length;
            let sub;
            let i = 0;
            for (; i < ii; ++i) {
                sub = subs[i];
                if (sub !== void 0) {
                    sub.handleCollectionChange(indexMap, flags);
                }
            }
        }
    }
}
function getSubscriberRecord() {
    const record = new SubscriberRecord();
    defineHiddenProp(this, 'subs', record);
    return record;
}
function addSubscriber(subscriber) {
    return this.subs.add(subscriber);
}
function removeSubscriber(subscriber) {
    return this.subs.remove(subscriber);
}

function withFlushQueue(target) {
    return target == null ? queueableDeco : queueableDeco(target);
}
function queueableDeco(target) {
    const proto = target.prototype;
    def(proto, 'queue', { get: getFlushQueue });
}
class FlushQueue {
    constructor() {
        this.flushing = false;
        this.items = new Set();
    }
    get count() {
        return this.items.size;
    }
    add(callable) {
        this.items.add(callable);
        if (this.flushing) {
            return;
        }
        this.flushing = true;
        const items = this.items;
        let item;
        try {
            for (item of items) {
                items.delete(item);
                item.flush();
            }
        }
        finally {
            this.flushing = false;
        }
    }
    clear() {
        this.items.clear();
        this.flushing = false;
    }
}
FlushQueue.instance = new FlushQueue();
function getFlushQueue() {
    return FlushQueue.instance;
}

class CollectionLengthObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.type = 18 /* Array */;
        this.value = this.oldvalue = (this.obj = owner.collection).length;
    }
    getValue() {
        return this.obj.length;
    }
    setValue(newValue, flags) {
        const currentValue = this.value;
        // if in the template, length is two-way bound directly
        // then there's a chance that the new value is invalid
        // add a guard so that we don't accidentally broadcast invalid values
        if (newValue !== currentValue && isArrayIndex(newValue)) {
            if ((flags & 256 /* noFlush */) === 0) {
                this.obj.length = newValue;
            }
            this.value = newValue;
            this.oldvalue = currentValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.length;
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV$7 = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV$7, this.f);
    }
}
class CollectionSizeObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.value = this.oldvalue = (this.obj = owner.collection).size;
        this.type = this.obj instanceof Map ? 66 /* Map */ : 34 /* Set */;
    }
    getValue() {
        return this.obj.size;
    }
    setValue() {
        throw new Error('Map/Set "size" is a readonly property');
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.size;
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV$7 = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV$7, this.f);
    }
}
function implementLengthObserver(klass) {
    const proto = klass.prototype;
    ensureProto(proto, 'subscribe', subscribe, true);
    ensureProto(proto, 'unsubscribe', unsubscribe, true);
    withFlushQueue(klass);
    subscriberCollection(klass);
}
function subscribe(subscriber) {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
        this.owner.subscribe(this);
    }
}
function unsubscribe(subscriber) {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
        this.owner.subscribe(this);
    }
}
implementLengthObserver(CollectionLengthObserver);
implementLengthObserver(CollectionSizeObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$7 = void 0;

const observerLookup$2 = new WeakMap();
// https://tc39.github.io/ecma262/#sec-sortcompare
function sortCompare(x, y) {
    if (x === y) {
        return 0;
    }
    x = x === null ? 'null' : x.toString();
    y = y === null ? 'null' : y.toString();
    return x < y ? -1 : 1;
}
function preSortCompare(x, y) {
    if (x === void 0) {
        if (y === void 0) {
            return 0;
        }
        else {
            return 1;
        }
    }
    if (y === void 0) {
        return -1;
    }
    return 0;
}
function insertionSort(arr, indexMap, from, to, compareFn) {
    let velement, ielement, vtmp, itmp, order;
    let i, j;
    for (i = from + 1; i < to; i++) {
        velement = arr[i];
        ielement = indexMap[i];
        for (j = i - 1; j >= from; j--) {
            vtmp = arr[j];
            itmp = indexMap[j];
            order = compareFn(vtmp, velement);
            if (order > 0) {
                arr[j + 1] = vtmp;
                indexMap[j + 1] = itmp;
            }
            else {
                break;
            }
        }
        arr[j + 1] = velement;
        indexMap[j + 1] = ielement;
    }
}
function quickSort(arr, indexMap, from, to, compareFn) {
    let thirdIndex = 0, i = 0;
    let v0, v1, v2;
    let i0, i1, i2;
    let c01, c02, c12;
    let vtmp, itmp;
    let vpivot, ipivot, lowEnd, highStart;
    let velement, ielement, order, vtopElement;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        if (to - from <= 10) {
            insertionSort(arr, indexMap, from, to, compareFn);
            return;
        }
        thirdIndex = from + ((to - from) >> 1);
        v0 = arr[from];
        i0 = indexMap[from];
        v1 = arr[to - 1];
        i1 = indexMap[to - 1];
        v2 = arr[thirdIndex];
        i2 = indexMap[thirdIndex];
        c01 = compareFn(v0, v1);
        if (c01 > 0) {
            vtmp = v0;
            itmp = i0;
            v0 = v1;
            i0 = i1;
            v1 = vtmp;
            i1 = itmp;
        }
        c02 = compareFn(v0, v2);
        if (c02 >= 0) {
            vtmp = v0;
            itmp = i0;
            v0 = v2;
            i0 = i2;
            v2 = v1;
            i2 = i1;
            v1 = vtmp;
            i1 = itmp;
        }
        else {
            c12 = compareFn(v1, v2);
            if (c12 > 0) {
                vtmp = v1;
                itmp = i1;
                v1 = v2;
                i1 = i2;
                v2 = vtmp;
                i2 = itmp;
            }
        }
        arr[from] = v0;
        indexMap[from] = i0;
        arr[to - 1] = v2;
        indexMap[to - 1] = i2;
        vpivot = v1;
        ipivot = i1;
        lowEnd = from + 1;
        highStart = to - 1;
        arr[thirdIndex] = arr[lowEnd];
        indexMap[thirdIndex] = indexMap[lowEnd];
        arr[lowEnd] = vpivot;
        indexMap[lowEnd] = ipivot;
        partition: for (i = lowEnd + 1; i < highStart; i++) {
            velement = arr[i];
            ielement = indexMap[i];
            order = compareFn(velement, vpivot);
            if (order < 0) {
                arr[i] = arr[lowEnd];
                indexMap[i] = indexMap[lowEnd];
                arr[lowEnd] = velement;
                indexMap[lowEnd] = ielement;
                lowEnd++;
            }
            else if (order > 0) {
                do {
                    highStart--;
                    // eslint-disable-next-line eqeqeq
                    if (highStart == i) {
                        break partition;
                    }
                    vtopElement = arr[highStart];
                    order = compareFn(vtopElement, vpivot);
                } while (order > 0);
                arr[i] = arr[highStart];
                indexMap[i] = indexMap[highStart];
                arr[highStart] = velement;
                indexMap[highStart] = ielement;
                if (order < 0) {
                    velement = arr[i];
                    ielement = indexMap[i];
                    arr[i] = arr[lowEnd];
                    indexMap[i] = indexMap[lowEnd];
                    arr[lowEnd] = velement;
                    indexMap[lowEnd] = ielement;
                    lowEnd++;
                }
            }
        }
        if (to - highStart < lowEnd - from) {
            quickSort(arr, indexMap, highStart, to, compareFn);
            to = lowEnd;
        }
        else {
            quickSort(arr, indexMap, from, lowEnd, compareFn);
            from = highStart;
        }
    }
}
const proto$2 = Array.prototype;
const $push = proto$2.push;
const $unshift = proto$2.unshift;
const $pop = proto$2.pop;
const $shift = proto$2.shift;
const $splice = proto$2.splice;
const $reverse = proto$2.reverse;
const $sort = proto$2.sort;
const methods$2 = ['push', 'unshift', 'pop', 'shift', 'splice', 'reverse', 'sort'];
const observe$2 = {
    // https://tc39.github.io/ecma262/#sec-array.prototype.push
    push: function (...args) {
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $push.apply(this, args);
        }
        const len = this.length;
        const argCount = args.length;
        if (argCount === 0) {
            return len;
        }
        this.length = o.indexMap.length = len + argCount;
        let i = len;
        while (i < this.length) {
            this[i] = args[i - len];
            o.indexMap[i] = -2;
            i++;
        }
        o.notify();
        return this.length;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.unshift
    unshift: function (...args) {
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $unshift.apply(this, args);
        }
        const argCount = args.length;
        const inserts = new Array(argCount);
        let i = 0;
        while (i < argCount) {
            inserts[i++] = -2;
        }
        $unshift.apply(o.indexMap, inserts);
        const len = $unshift.apply(this, args);
        o.notify();
        return len;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.pop
    pop: function () {
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $pop.call(this);
        }
        const indexMap = o.indexMap;
        const element = $pop.call(this);
        // only mark indices as deleted if they actually existed in the original array
        const index = indexMap.length - 1;
        if (indexMap[index] > -1) {
            indexMap.deletedItems.push(indexMap[index]);
        }
        $pop.call(indexMap);
        o.notify();
        return element;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.shift
    shift: function () {
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $shift.call(this);
        }
        const indexMap = o.indexMap;
        const element = $shift.call(this);
        // only mark indices as deleted if they actually existed in the original array
        if (indexMap[0] > -1) {
            indexMap.deletedItems.push(indexMap[0]);
        }
        $shift.call(indexMap);
        o.notify();
        return element;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.splice
    splice: function (...args) {
        const start = args[0];
        const deleteCount = args[1];
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            return $splice.apply(this, args);
        }
        const len = this.length;
        const relativeStart = start | 0;
        const actualStart = relativeStart < 0 ? Math.max((len + relativeStart), 0) : Math.min(relativeStart, len);
        const indexMap = o.indexMap;
        const argCount = args.length;
        const actualDeleteCount = argCount === 0 ? 0 : argCount === 1 ? len - actualStart : deleteCount;
        if (actualDeleteCount > 0) {
            let i = actualStart;
            const to = i + actualDeleteCount;
            while (i < to) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                i++;
            }
        }
        if (argCount > 2) {
            const itemCount = argCount - 2;
            const inserts = new Array(itemCount);
            let i = 0;
            while (i < itemCount) {
                inserts[i++] = -2;
            }
            $splice.call(indexMap, start, deleteCount, ...inserts);
        }
        else {
            $splice.apply(indexMap, args);
        }
        const deleted = $splice.apply(this, args);
        o.notify();
        return deleted;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.reverse
    reverse: function () {
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            $reverse.call(this);
            return this;
        }
        const len = this.length;
        const middle = (len / 2) | 0;
        let lower = 0;
        while (lower !== middle) {
            const upper = len - lower - 1;
            const lowerValue = this[lower];
            const lowerIndex = o.indexMap[lower];
            const upperValue = this[upper];
            const upperIndex = o.indexMap[upper];
            this[lower] = upperValue;
            o.indexMap[lower] = upperIndex;
            this[upper] = lowerValue;
            o.indexMap[upper] = lowerIndex;
            lower++;
        }
        o.notify();
        return this;
    },
    // https://tc39.github.io/ecma262/#sec-array.prototype.sort
    // https://github.com/v8/v8/blob/master/src/js/array.js
    sort: function (compareFn) {
        const o = observerLookup$2.get(this);
        if (o === void 0) {
            $sort.call(this, compareFn);
            return this;
        }
        const len = this.length;
        if (len < 2) {
            return this;
        }
        quickSort(this, o.indexMap, 0, len, preSortCompare);
        let i = 0;
        while (i < len) {
            if (this[i] === void 0) {
                break;
            }
            i++;
        }
        if (compareFn === void 0 || typeof compareFn !== 'function' /* spec says throw a TypeError, should we do that too? */) {
            compareFn = sortCompare;
        }
        quickSort(this, o.indexMap, 0, i, compareFn);
        o.notify();
        return this;
    }
};
for (const method of methods$2) {
    def(observe$2[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableArrayObservationCalled = false;
function enableArrayObservation() {
    for (const method of methods$2) {
        if (proto$2[method].observing !== true) {
            defineHiddenProp(proto$2, method, observe$2[method]);
        }
    }
}
class ArrayObserver {
    constructor(array) {
        this.type = 18 /* Array */;
        if (!enableArrayObservationCalled) {
            enableArrayObservationCalled = true;
            enableArrayObservation();
        }
        this.indexObservers = {};
        this.collection = array;
        this.indexMap = createIndexMap(array.length);
        this.lenObs = void 0;
        observerLookup$2.set(array, this);
    }
    notify() {
        const indexMap = this.indexMap;
        const length = this.collection.length;
        this.indexMap = createIndexMap(length);
        this.subs.notifyCollection(indexMap, 0 /* none */);
    }
    getLengthObserver() {
        var _a;
        return (_a = this.lenObs) !== null && _a !== void 0 ? _a : (this.lenObs = new CollectionLengthObserver(this));
    }
    getIndexObserver(index) {
        var _a;
        var _b;
        // It's unnecessary to destroy/recreate index observer all the time,
        // so just create once, and add/remove instead
        return (_a = (_b = this.indexObservers)[index]) !== null && _a !== void 0 ? _a : (_b[index] = new ArrayIndexObserver(this, index));
    }
}
class ArrayIndexObserver {
    constructor(owner, index) {
        this.owner = owner;
        this.index = index;
        this.doNotCache = true;
        this.value = this.getValue();
    }
    getValue() {
        return this.owner.collection[this.index];
    }
    setValue(newValue, flags) {
        if (newValue === this.getValue()) {
            return;
        }
        const arrayObserver = this.owner;
        const index = this.index;
        const indexMap = arrayObserver.indexMap;
        if (indexMap[index] > -1) {
            indexMap.deletedItems.push(indexMap[index]);
        }
        indexMap[index] = -2;
        // do not need to update current value here
        // as it will be updated inside handle collection change
        arrayObserver.collection[index] = newValue;
        arrayObserver.notify();
    }
    /**
     * From interface `ICollectionSubscriber`
     */
    handleCollectionChange(indexMap, flags) {
        const index = this.index;
        const noChange = indexMap[index] === index;
        if (noChange) {
            return;
        }
        const prevValue = this.value;
        const currValue = this.value = this.getValue();
        // hmm
        if (prevValue !== currValue) {
            this.subs.notify(currValue, prevValue, flags);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.owner.subscribe(this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.owner.unsubscribe(this);
        }
    }
}
subscriberCollection(ArrayObserver);
subscriberCollection(ArrayIndexObserver);
function getArrayObserver(array) {
    let observer = observerLookup$2.get(array);
    if (observer === void 0) {
        observer = new ArrayObserver(array);
    }
    return observer;
}
/**
 * Applies offsets to the non-negative indices in the IndexMap
 * based on added and deleted items relative to those indices.
 *
 * e.g. turn `[-2, 0, 1]` into `[-2, 1, 2]`, allowing the values at the indices to be
 * used for sorting/reordering items if needed
 */
function applyMutationsToIndices(indexMap) {
    let offset = 0;
    let j = 0;
    const len = indexMap.length;
    for (let i = 0; i < len; ++i) {
        while (indexMap.deletedItems[j] <= i - offset) {
            ++j;
            --offset;
        }
        if (indexMap[i] === -2) {
            ++offset;
        }
        else {
            indexMap[i] += offset;
        }
    }
}
/**
 * After `applyMutationsToIndices`, this function can be used to reorder items in a derived
 * array (e.g.  the items in the `views` in the repeater are derived from the `items` property)
 */
function synchronizeIndices(items, indexMap) {
    const copy = items.slice();
    const len = indexMap.length;
    let to = 0;
    let from = 0;
    while (to < len) {
        from = indexMap[to];
        if (from !== -2) {
            items[to] = copy[from];
        }
        ++to;
    }
}

const observerLookup$1 = new WeakMap();
const proto$1 = Set.prototype;
const $add = proto$1.add;
const $clear$1 = proto$1.clear;
const $delete$1 = proto$1.delete;
const methods$1 = ['add', 'clear', 'delete'];
// note: we can't really do much with Set due to the internal data structure not being accessible so we're just using the native calls
// fortunately, add/delete/clear are easy to reconstruct for the indexMap
const observe$1 = {
    // https://tc39.github.io/ecma262/#sec-set.prototype.add
    add: function (value) {
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            $add.call(this, value);
            return this;
        }
        const oldSize = this.size;
        $add.call(this, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.notify();
        return this;
    },
    // https://tc39.github.io/ecma262/#sec-set.prototype.clear
    clear: function () {
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            return $clear$1.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            // deepscan-disable-next-line
            for (const _ of this.keys()) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                i++;
            }
            $clear$1.call(this);
            indexMap.length = 0;
            o.notify();
        }
        return undefined;
    },
    // https://tc39.github.io/ecma262/#sec-set.prototype.delete
    delete: function (value) {
        const o = observerLookup$1.get(this);
        if (o === undefined) {
            return $delete$1.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                indexMap.splice(i, 1);
                const deleteResult = $delete$1.call(this, value);
                if (deleteResult === true) {
                    o.notify();
                }
                return deleteResult;
            }
            i++;
        }
        return false;
    }
};
const descriptorProps$1 = {
    writable: true,
    enumerable: false,
    configurable: true
};
for (const method of methods$1) {
    def(observe$1[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableSetObservationCalled = false;
function enableSetObservation() {
    for (const method of methods$1) {
        if (proto$1[method].observing !== true) {
            def(proto$1, method, { ...descriptorProps$1, value: observe$1[method] });
        }
    }
}
class SetObserver {
    constructor(observedSet) {
        this.type = 34 /* Set */;
        if (!enableSetObservationCalled) {
            enableSetObservationCalled = true;
            enableSetObservation();
        }
        this.collection = observedSet;
        this.indexMap = createIndexMap(observedSet.size);
        this.lenObs = void 0;
        observerLookup$1.set(observedSet, this);
    }
    notify() {
        const indexMap = this.indexMap;
        const size = this.collection.size;
        this.indexMap = createIndexMap(size);
        this.subs.notifyCollection(indexMap, 0 /* none */);
    }
    getLengthObserver() {
        var _a;
        return (_a = this.lenObs) !== null && _a !== void 0 ? _a : (this.lenObs = new CollectionSizeObserver(this));
    }
}
subscriberCollection(SetObserver);
function getSetObserver(observedSet) {
    let observer = observerLookup$1.get(observedSet);
    if (observer === void 0) {
        observer = new SetObserver(observedSet);
    }
    return observer;
}

const observerLookup = new WeakMap();
const proto = Map.prototype;
const $set = proto.set;
const $clear = proto.clear;
const $delete = proto.delete;
const methods = ['set', 'clear', 'delete'];
// note: we can't really do much with Map due to the internal data structure not being accessible so we're just using the native calls
// fortunately, map/delete/clear are easy to reconstruct for the indexMap
const observe = {
    // https://tc39.github.io/ecma262/#sec-map.prototype.map
    set: function (key, value) {
        const o = observerLookup.get(this);
        if (o === undefined) {
            $set.call(this, key, value);
            return this;
        }
        const oldValue = this.get(key);
        const oldSize = this.size;
        $set.call(this, key, value);
        const newSize = this.size;
        if (newSize === oldSize) {
            let i = 0;
            for (const entry of this.entries()) {
                if (entry[0] === key) {
                    if (entry[1] !== oldValue) {
                        o.indexMap.deletedItems.push(o.indexMap[i]);
                        o.indexMap[i] = -2;
                        o.notify();
                    }
                    return this;
                }
                i++;
            }
            return this;
        }
        o.indexMap[oldSize] = -2;
        o.notify();
        return this;
    },
    // https://tc39.github.io/ecma262/#sec-map.prototype.clear
    clear: function () {
        const o = observerLookup.get(this);
        if (o === undefined) {
            return $clear.call(this);
        }
        const size = this.size;
        if (size > 0) {
            const indexMap = o.indexMap;
            let i = 0;
            // deepscan-disable-next-line
            for (const _ of this.keys()) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                i++;
            }
            $clear.call(this);
            indexMap.length = 0;
            o.notify();
        }
        return undefined;
    },
    // https://tc39.github.io/ecma262/#sec-map.prototype.delete
    delete: function (value) {
        const o = observerLookup.get(this);
        if (o === undefined) {
            return $delete.call(this, value);
        }
        const size = this.size;
        if (size === 0) {
            return false;
        }
        let i = 0;
        const indexMap = o.indexMap;
        for (const entry of this.keys()) {
            if (entry === value) {
                if (indexMap[i] > -1) {
                    indexMap.deletedItems.push(indexMap[i]);
                }
                indexMap.splice(i, 1);
                const deleteResult = $delete.call(this, value);
                if (deleteResult === true) {
                    o.notify();
                }
                return deleteResult;
            }
            ++i;
        }
        return false;
    }
};
const descriptorProps = {
    writable: true,
    enumerable: false,
    configurable: true
};
for (const method of methods) {
    def(observe[method], 'observing', { value: true, writable: false, configurable: false, enumerable: false });
}
let enableMapObservationCalled = false;
function enableMapObservation() {
    for (const method of methods) {
        if (proto[method].observing !== true) {
            def(proto, method, { ...descriptorProps, value: observe[method] });
        }
    }
}
class MapObserver {
    constructor(map) {
        this.type = 66 /* Map */;
        if (!enableMapObservationCalled) {
            enableMapObservationCalled = true;
            enableMapObservation();
        }
        this.collection = map;
        this.indexMap = createIndexMap(map.size);
        this.lenObs = void 0;
        observerLookup.set(map, this);
    }
    notify() {
        const indexMap = this.indexMap;
        const size = this.collection.size;
        this.indexMap = createIndexMap(size);
        this.subs.notifyCollection(indexMap, 0 /* none */);
    }
    getLengthObserver() {
        var _a;
        return (_a = this.lenObs) !== null && _a !== void 0 ? _a : (this.lenObs = new CollectionSizeObserver(this));
    }
}
subscriberCollection(MapObserver);
function getMapObserver(map) {
    let observer = observerLookup.get(map);
    if (observer === void 0) {
        observer = new MapObserver(map);
    }
    return observer;
}

function observeProperty(obj, key) {
    const observer = this.observerLocator.getObserver(obj, key);
    /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
     *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
     *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
     *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
     *
     * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
     */
    this.obs.add(observer);
}
function getObserverRecord() {
    const record = new BindingObserverRecord(this);
    defineHiddenProp(this, 'obs', record);
    return record;
}
function observeCollection(collection) {
    let obs;
    if (collection instanceof Array) {
        obs = getArrayObserver(collection);
    }
    else if (collection instanceof Set) {
        obs = getSetObserver(collection);
    }
    else if (collection instanceof Map) {
        obs = getMapObserver(collection);
    }
    else {
        throw new Error('Unrecognised collection type.');
    }
    this.obs.add(obs);
}
function subscribeTo(subscribable) {
    this.obs.add(subscribable);
}
function noopHandleChange() {
    throw new Error('method "handleChange" not implemented');
}
function noopHandleCollectionChange() {
    throw new Error('method "handleCollectionChange" not implemented');
}
class BindingObserverRecord {
    constructor(binding) {
        this.binding = binding;
        this.version = 0;
        this.count = 0;
        this.slots = 0;
    }
    handleChange(value, oldValue, flags) {
        return this.binding.interceptor.handleChange(value, oldValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.binding.interceptor.handleCollectionChange(indexMap, flags);
    }
    /**
     * Add, and subscribe to a given observer
     */
    add(observer) {
        // find the observer.
        const observerSlots = this.slots;
        let i = observerSlots;
        // find the slot number of the observer
        while (i-- && this[`_o${i}`] !== observer)
            ;
        // if we are not already observing, put the observer in an open slot and subscribe.
        if (i === -1) {
            i = 0;
            // go from the start, find an open slot number
            while (this[`_o${i}`] !== void 0) {
                i++;
            }
            // store the reference to the observer and subscribe
            this[`_o${i}`] = observer;
            observer.subscribe(this);
            // increment the slot count.
            if (i === observerSlots) {
                this.slots = i + 1;
            }
            ++this.count;
        }
        this[`_v${i}`] = this.version;
    }
    /**
     * Unsubscribe the observers that are not up to date with the record version
     */
    clear(all) {
        const slotCount = this.slots;
        let slotName;
        let observer;
        let i = 0;
        if (all === true) {
            for (; i < slotCount; ++i) {
                slotName = `_o${i}`;
                observer = this[slotName];
                if (observer !== void 0) {
                    this[slotName] = void 0;
                    observer.unsubscribe(this);
                }
            }
            this.count = this.slots = 0;
        }
        else {
            for (; i < slotCount; ++i) {
                if (this[`_v${i}`] !== this.version) {
                    slotName = `_o${i}`;
                    observer = this[slotName];
                    if (observer !== void 0) {
                        this[slotName] = void 0;
                        observer.unsubscribe(this);
                        this.count--;
                    }
                }
            }
        }
    }
}
function connectableDecorator(target) {
    const proto = target.prototype;
    ensureProto(proto, 'observeProperty', observeProperty, true);
    ensureProto(proto, 'observeCollection', observeCollection, true);
    ensureProto(proto, 'subscribeTo', subscribeTo, true);
    def(proto, 'obs', { get: getObserverRecord });
    // optionally add these two methods to normalize a connectable impl
    ensureProto(proto, 'handleChange', noopHandleChange);
    ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);
    return target;
}
function connectable(target) {
    return target == null ? connectableDecorator : connectableDecorator(target);
}
// @connectable
class BindingMediator {
    constructor(key, binding, observerLocator, locator) {
        this.key = key;
        this.binding = binding;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.interceptor = this;
    }
    $bind(flags, scope, hostScope, projection) {
        throw new Error('Method not implemented.');
    }
    $unbind(flags) {
        throw new Error('Method not implemented.');
    }
    handleChange(newValue, previousValue, flags) {
        this.binding[this.key](newValue, previousValue, flags);
    }
}
connectableDecorator(BindingMediator);

const IExpressionParser = DI.createInterface('IExpressionParser', x => x.singleton(ExpressionParser));
class ExpressionParser {
    constructor() {
        this.expressionLookup = Object.create(null);
        this.forOfLookup = Object.create(null);
        this.interpolationLookup = Object.create(null);
    }
    parse(expression, bindingType) {
        switch (bindingType) {
            case 2048 /* Interpolation */: {
                let found = this.interpolationLookup[expression];
                if (found === void 0) {
                    found = this.interpolationLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
            case 539 /* ForCommand */: {
                let found = this.forOfLookup[expression];
                if (found === void 0) {
                    found = this.forOfLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
            default: {
                // Allow empty strings for normal bindings and those that are empty by default (such as a custom attribute without an equals sign)
                // But don't cache it, because empty strings are always invalid for any other type of binding
                if (expression.length === 0 && (bindingType & (53 /* BindCommand */ | 49 /* OneTimeCommand */ | 50 /* ToViewCommand */))) {
                    return PrimitiveLiteralExpression.$empty;
                }
                let found = this.expressionLookup[expression];
                if (found === void 0) {
                    found = this.expressionLookup[expression] = this.$parse(expression, bindingType);
                }
                return found;
            }
        }
    }
    $parse(expression, bindingType) {
        $state$1.input = expression;
        $state$1.length = expression.length;
        $state$1.index = 0;
        $state$1.currentChar = expression.charCodeAt(0);
        return parse($state$1, 0 /* Reset */, 61 /* Variadic */, bindingType === void 0 ? 53 /* BindCommand */ : bindingType);
    }
}
var Char;
(function (Char) {
    Char[Char["Null"] = 0] = "Null";
    Char[Char["Backspace"] = 8] = "Backspace";
    Char[Char["Tab"] = 9] = "Tab";
    Char[Char["LineFeed"] = 10] = "LineFeed";
    Char[Char["VerticalTab"] = 11] = "VerticalTab";
    Char[Char["FormFeed"] = 12] = "FormFeed";
    Char[Char["CarriageReturn"] = 13] = "CarriageReturn";
    Char[Char["Space"] = 32] = "Space";
    Char[Char["Exclamation"] = 33] = "Exclamation";
    Char[Char["DoubleQuote"] = 34] = "DoubleQuote";
    Char[Char["Dollar"] = 36] = "Dollar";
    Char[Char["Percent"] = 37] = "Percent";
    Char[Char["Ampersand"] = 38] = "Ampersand";
    Char[Char["SingleQuote"] = 39] = "SingleQuote";
    Char[Char["OpenParen"] = 40] = "OpenParen";
    Char[Char["CloseParen"] = 41] = "CloseParen";
    Char[Char["Asterisk"] = 42] = "Asterisk";
    Char[Char["Plus"] = 43] = "Plus";
    Char[Char["Comma"] = 44] = "Comma";
    Char[Char["Minus"] = 45] = "Minus";
    Char[Char["Dot"] = 46] = "Dot";
    Char[Char["Slash"] = 47] = "Slash";
    Char[Char["Semicolon"] = 59] = "Semicolon";
    Char[Char["Backtick"] = 96] = "Backtick";
    Char[Char["OpenBracket"] = 91] = "OpenBracket";
    Char[Char["Backslash"] = 92] = "Backslash";
    Char[Char["CloseBracket"] = 93] = "CloseBracket";
    Char[Char["Caret"] = 94] = "Caret";
    Char[Char["Underscore"] = 95] = "Underscore";
    Char[Char["OpenBrace"] = 123] = "OpenBrace";
    Char[Char["Bar"] = 124] = "Bar";
    Char[Char["CloseBrace"] = 125] = "CloseBrace";
    Char[Char["Colon"] = 58] = "Colon";
    Char[Char["LessThan"] = 60] = "LessThan";
    Char[Char["Equals"] = 61] = "Equals";
    Char[Char["GreaterThan"] = 62] = "GreaterThan";
    Char[Char["Question"] = 63] = "Question";
    Char[Char["Zero"] = 48] = "Zero";
    Char[Char["One"] = 49] = "One";
    Char[Char["Two"] = 50] = "Two";
    Char[Char["Three"] = 51] = "Three";
    Char[Char["Four"] = 52] = "Four";
    Char[Char["Five"] = 53] = "Five";
    Char[Char["Six"] = 54] = "Six";
    Char[Char["Seven"] = 55] = "Seven";
    Char[Char["Eight"] = 56] = "Eight";
    Char[Char["Nine"] = 57] = "Nine";
    Char[Char["UpperA"] = 65] = "UpperA";
    Char[Char["UpperB"] = 66] = "UpperB";
    Char[Char["UpperC"] = 67] = "UpperC";
    Char[Char["UpperD"] = 68] = "UpperD";
    Char[Char["UpperE"] = 69] = "UpperE";
    Char[Char["UpperF"] = 70] = "UpperF";
    Char[Char["UpperG"] = 71] = "UpperG";
    Char[Char["UpperH"] = 72] = "UpperH";
    Char[Char["UpperI"] = 73] = "UpperI";
    Char[Char["UpperJ"] = 74] = "UpperJ";
    Char[Char["UpperK"] = 75] = "UpperK";
    Char[Char["UpperL"] = 76] = "UpperL";
    Char[Char["UpperM"] = 77] = "UpperM";
    Char[Char["UpperN"] = 78] = "UpperN";
    Char[Char["UpperO"] = 79] = "UpperO";
    Char[Char["UpperP"] = 80] = "UpperP";
    Char[Char["UpperQ"] = 81] = "UpperQ";
    Char[Char["UpperR"] = 82] = "UpperR";
    Char[Char["UpperS"] = 83] = "UpperS";
    Char[Char["UpperT"] = 84] = "UpperT";
    Char[Char["UpperU"] = 85] = "UpperU";
    Char[Char["UpperV"] = 86] = "UpperV";
    Char[Char["UpperW"] = 87] = "UpperW";
    Char[Char["UpperX"] = 88] = "UpperX";
    Char[Char["UpperY"] = 89] = "UpperY";
    Char[Char["UpperZ"] = 90] = "UpperZ";
    Char[Char["LowerA"] = 97] = "LowerA";
    Char[Char["LowerB"] = 98] = "LowerB";
    Char[Char["LowerC"] = 99] = "LowerC";
    Char[Char["LowerD"] = 100] = "LowerD";
    Char[Char["LowerE"] = 101] = "LowerE";
    Char[Char["LowerF"] = 102] = "LowerF";
    Char[Char["LowerG"] = 103] = "LowerG";
    Char[Char["LowerH"] = 104] = "LowerH";
    Char[Char["LowerI"] = 105] = "LowerI";
    Char[Char["LowerJ"] = 106] = "LowerJ";
    Char[Char["LowerK"] = 107] = "LowerK";
    Char[Char["LowerL"] = 108] = "LowerL";
    Char[Char["LowerM"] = 109] = "LowerM";
    Char[Char["LowerN"] = 110] = "LowerN";
    Char[Char["LowerO"] = 111] = "LowerO";
    Char[Char["LowerP"] = 112] = "LowerP";
    Char[Char["LowerQ"] = 113] = "LowerQ";
    Char[Char["LowerR"] = 114] = "LowerR";
    Char[Char["LowerS"] = 115] = "LowerS";
    Char[Char["LowerT"] = 116] = "LowerT";
    Char[Char["LowerU"] = 117] = "LowerU";
    Char[Char["LowerV"] = 118] = "LowerV";
    Char[Char["LowerW"] = 119] = "LowerW";
    Char[Char["LowerX"] = 120] = "LowerX";
    Char[Char["LowerY"] = 121] = "LowerY";
    Char[Char["LowerZ"] = 122] = "LowerZ";
})(Char || (Char = {}));
function unescapeCode(code) {
    switch (code) {
        case 98 /* LowerB */: return 8 /* Backspace */;
        case 116 /* LowerT */: return 9 /* Tab */;
        case 110 /* LowerN */: return 10 /* LineFeed */;
        case 118 /* LowerV */: return 11 /* VerticalTab */;
        case 102 /* LowerF */: return 12 /* FormFeed */;
        case 114 /* LowerR */: return 13 /* CarriageReturn */;
        case 34 /* DoubleQuote */: return 34 /* DoubleQuote */;
        case 39 /* SingleQuote */: return 39 /* SingleQuote */;
        case 92 /* Backslash */: return 92 /* Backslash */;
        default: return code;
    }
}
var Access;
(function (Access) {
    Access[Access["Reset"] = 0] = "Reset";
    Access[Access["Ancestor"] = 511] = "Ancestor";
    Access[Access["This"] = 512] = "This";
    Access[Access["Scope"] = 1024] = "Scope";
    Access[Access["Member"] = 2048] = "Member";
    Access[Access["Keyed"] = 4096] = "Keyed";
})(Access || (Access = {}));
var Precedence;
(function (Precedence) {
    Precedence[Precedence["Variadic"] = 61] = "Variadic";
    Precedence[Precedence["Assign"] = 62] = "Assign";
    Precedence[Precedence["Conditional"] = 63] = "Conditional";
    Precedence[Precedence["LogicalOR"] = 64] = "LogicalOR";
    Precedence[Precedence["LogicalAND"] = 128] = "LogicalAND";
    Precedence[Precedence["Equality"] = 192] = "Equality";
    Precedence[Precedence["Relational"] = 256] = "Relational";
    Precedence[Precedence["Additive"] = 320] = "Additive";
    Precedence[Precedence["Multiplicative"] = 384] = "Multiplicative";
    Precedence[Precedence["Binary"] = 448] = "Binary";
    Precedence[Precedence["LeftHandSide"] = 449] = "LeftHandSide";
    Precedence[Precedence["Primary"] = 450] = "Primary";
    Precedence[Precedence["Unary"] = 451] = "Unary";
})(Precedence || (Precedence = {}));
var Token;
(function (Token) {
    Token[Token["EOF"] = 1572864] = "EOF";
    Token[Token["ExpressionTerminal"] = 1048576] = "ExpressionTerminal";
    Token[Token["AccessScopeTerminal"] = 524288] = "AccessScopeTerminal";
    Token[Token["ClosingToken"] = 262144] = "ClosingToken";
    Token[Token["OpeningToken"] = 131072] = "OpeningToken";
    Token[Token["BinaryOp"] = 65536] = "BinaryOp";
    Token[Token["UnaryOp"] = 32768] = "UnaryOp";
    Token[Token["LeftHandSide"] = 16384] = "LeftHandSide";
    Token[Token["StringOrNumericLiteral"] = 12288] = "StringOrNumericLiteral";
    Token[Token["NumericLiteral"] = 8192] = "NumericLiteral";
    Token[Token["StringLiteral"] = 4096] = "StringLiteral";
    Token[Token["IdentifierName"] = 3072] = "IdentifierName";
    Token[Token["Keyword"] = 2048] = "Keyword";
    Token[Token["Identifier"] = 1024] = "Identifier";
    Token[Token["Contextual"] = 512] = "Contextual";
    Token[Token["Precedence"] = 448] = "Precedence";
    Token[Token["Type"] = 63] = "Type";
    Token[Token["FalseKeyword"] = 2048] = "FalseKeyword";
    Token[Token["TrueKeyword"] = 2049] = "TrueKeyword";
    Token[Token["NullKeyword"] = 2050] = "NullKeyword";
    Token[Token["UndefinedKeyword"] = 2051] = "UndefinedKeyword";
    Token[Token["ThisScope"] = 3076] = "ThisScope";
    Token[Token["HostScope"] = 3077] = "HostScope";
    Token[Token["ParentScope"] = 3078] = "ParentScope";
    Token[Token["OpenParen"] = 671751] = "OpenParen";
    Token[Token["OpenBrace"] = 131080] = "OpenBrace";
    Token[Token["Dot"] = 16393] = "Dot";
    Token[Token["CloseBrace"] = 1835018] = "CloseBrace";
    Token[Token["CloseParen"] = 1835019] = "CloseParen";
    Token[Token["Comma"] = 1572876] = "Comma";
    Token[Token["OpenBracket"] = 671757] = "OpenBracket";
    Token[Token["CloseBracket"] = 1835022] = "CloseBracket";
    Token[Token["Colon"] = 1572879] = "Colon";
    Token[Token["Question"] = 1572880] = "Question";
    Token[Token["Ampersand"] = 1572883] = "Ampersand";
    Token[Token["Bar"] = 1572884] = "Bar";
    Token[Token["BarBar"] = 1638549] = "BarBar";
    Token[Token["AmpersandAmpersand"] = 1638614] = "AmpersandAmpersand";
    Token[Token["EqualsEquals"] = 1638679] = "EqualsEquals";
    Token[Token["ExclamationEquals"] = 1638680] = "ExclamationEquals";
    Token[Token["EqualsEqualsEquals"] = 1638681] = "EqualsEqualsEquals";
    Token[Token["ExclamationEqualsEquals"] = 1638682] = "ExclamationEqualsEquals";
    Token[Token["LessThan"] = 1638747] = "LessThan";
    Token[Token["GreaterThan"] = 1638748] = "GreaterThan";
    Token[Token["LessThanEquals"] = 1638749] = "LessThanEquals";
    Token[Token["GreaterThanEquals"] = 1638750] = "GreaterThanEquals";
    Token[Token["InKeyword"] = 1640799] = "InKeyword";
    Token[Token["InstanceOfKeyword"] = 1640800] = "InstanceOfKeyword";
    Token[Token["Plus"] = 623009] = "Plus";
    Token[Token["Minus"] = 623010] = "Minus";
    Token[Token["TypeofKeyword"] = 34851] = "TypeofKeyword";
    Token[Token["VoidKeyword"] = 34852] = "VoidKeyword";
    Token[Token["Asterisk"] = 1638885] = "Asterisk";
    Token[Token["Percent"] = 1638886] = "Percent";
    Token[Token["Slash"] = 1638887] = "Slash";
    Token[Token["Equals"] = 1048616] = "Equals";
    Token[Token["Exclamation"] = 32809] = "Exclamation";
    Token[Token["TemplateTail"] = 540714] = "TemplateTail";
    Token[Token["TemplateContinuation"] = 540715] = "TemplateContinuation";
    Token[Token["OfKeyword"] = 1051180] = "OfKeyword";
})(Token || (Token = {}));
const $false = PrimitiveLiteralExpression.$false;
const $true = PrimitiveLiteralExpression.$true;
const $null = PrimitiveLiteralExpression.$null;
const $undefined = PrimitiveLiteralExpression.$undefined;
const $this = AccessThisExpression.$this;
const $host = AccessThisExpression.$host;
const $parent = AccessThisExpression.$parent;
var BindingType;
(function (BindingType) {
    BindingType[BindingType["None"] = 0] = "None";
    // if a binding command is taking over the processing of an attribute
    // then it should add this flag to its binding type
    // which then tell the binder to proceed the attribute compilation as is,
    // instead of normal process: transformation -> compilation
    BindingType[BindingType["IgnoreAttr"] = 4096] = "IgnoreAttr";
    BindingType[BindingType["Interpolation"] = 2048] = "Interpolation";
    BindingType[BindingType["IsRef"] = 5376] = "IsRef";
    BindingType[BindingType["IsIterator"] = 512] = "IsIterator";
    BindingType[BindingType["IsCustom"] = 256] = "IsCustom";
    BindingType[BindingType["IsFunction"] = 128] = "IsFunction";
    BindingType[BindingType["IsEvent"] = 64] = "IsEvent";
    BindingType[BindingType["IsProperty"] = 32] = "IsProperty";
    BindingType[BindingType["IsCommand"] = 16] = "IsCommand";
    BindingType[BindingType["IsPropertyCommand"] = 48] = "IsPropertyCommand";
    BindingType[BindingType["IsEventCommand"] = 80] = "IsEventCommand";
    BindingType[BindingType["DelegationStrategyDelta"] = 6] = "DelegationStrategyDelta";
    BindingType[BindingType["Command"] = 15] = "Command";
    BindingType[BindingType["OneTimeCommand"] = 49] = "OneTimeCommand";
    BindingType[BindingType["ToViewCommand"] = 50] = "ToViewCommand";
    BindingType[BindingType["FromViewCommand"] = 51] = "FromViewCommand";
    BindingType[BindingType["TwoWayCommand"] = 52] = "TwoWayCommand";
    BindingType[BindingType["BindCommand"] = 53] = "BindCommand";
    BindingType[BindingType["TriggerCommand"] = 4182] = "TriggerCommand";
    BindingType[BindingType["CaptureCommand"] = 4183] = "CaptureCommand";
    BindingType[BindingType["DelegateCommand"] = 4184] = "DelegateCommand";
    BindingType[BindingType["CallCommand"] = 153] = "CallCommand";
    BindingType[BindingType["OptionsCommand"] = 26] = "OptionsCommand";
    BindingType[BindingType["ForCommand"] = 539] = "ForCommand";
    BindingType[BindingType["CustomCommand"] = 284] = "CustomCommand";
})(BindingType || (BindingType = {}));
/* eslint-enable @typescript-eslint/indent */
/** @internal */
class ParserState$1 {
    constructor(input) {
        this.input = input;
        this.index = 0;
        this.startIndex = 0;
        this.lastIndex = 0;
        this.currentToken = 1572864 /* EOF */;
        this.tokenValue = '';
        this.assignable = true;
        this.length = input.length;
        this.currentChar = input.charCodeAt(0);
    }
    get tokenRaw() {
        return this.input.slice(this.startIndex, this.index);
    }
}
const $state$1 = new ParserState$1('');
/** @internal */
// This is performance-critical code which follows a subset of the well-known ES spec.
// Knowing the spec, or parsers in general, will help with understanding this code and it is therefore not the
// single source of information for being able to figure it out.
// It generally does not need to change unless the spec changes or spec violations are found, or optimization
// opportunities are found (which would likely not fix these warnings in any case).
// It's therefore not considered to have any tangible impact on the maintainability of the code base.
// For reference, most of the parsing logic is based on: https://tc39.github.io/ecma262/#sec-ecmascript-language-expressions
// eslint-disable-next-line max-lines-per-function
function parse(state, access, minPrecedence, bindingType) {
    if (bindingType === 284 /* CustomCommand */) {
        return new CustomExpression(state.input);
    }
    if (state.index === 0) {
        if (bindingType & 2048 /* Interpolation */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseInterpolation(state);
        }
        nextToken(state);
        if (state.currentToken & 1048576 /* ExpressionTerminal */) {
            throw new Error(`Invalid start of expression: '${state.input}'`);
        }
    }
    state.assignable = 448 /* Binary */ > minPrecedence;
    let result = void 0;
    if (state.currentToken & 32768 /* UnaryOp */) {
        /** parseUnaryExpression
         * https://tc39.github.io/ecma262/#sec-unary-operators
         *
         * UnaryExpression :
         * 1. LeftHandSideExpression
         * 2. void UnaryExpression
         * 3. typeof UnaryExpression
         * 4. + UnaryExpression
         * 5. - UnaryExpression
         * 6. ! UnaryExpression
         *
         * IsValidAssignmentTarget
         * 2,3,4,5,6 = false
         * 1 = see parseLeftHandSideExpression
         *
         * Note: technically we should throw on ++ / -- / +++ / ---, but there's nothing to gain from that
         */
        const op = TokenValues[state.currentToken & 63 /* Type */];
        nextToken(state);
        result = new UnaryExpression(op, parse(state, access, 449 /* LeftHandSide */, bindingType));
        state.assignable = false;
    }
    else {
        /** parsePrimaryExpression
         * https://tc39.github.io/ecma262/#sec-primary-expression
         *
         * PrimaryExpression :
         * 1. this
         * 2. IdentifierName
         * 3. Literal
         * 4. ArrayLiteralExpression
         * 5. ObjectLiteralExpression
         * 6. TemplateLiteral
         * 7. ParenthesizedExpression
         *
         * Literal :
         * NullLiteral
         * BooleanLiteral
         * NumericLiteral
         * StringLiteral
         *
         * ParenthesizedExpression :
         * ( AssignmentExpression )
         *
         * IsValidAssignmentTarget
         * 1,3,4,5,6,7 = false
         * 2 = true
         */
        primary: switch (state.currentToken) {
            case 3078 /* ParentScope */: // $parent
                state.assignable = false;
                do {
                    nextToken(state);
                    access++; // ancestor
                    if (consumeOpt(state, 16393 /* Dot */)) {
                        if (state.currentToken === 16393 /* Dot */) {
                            throw new Error(`Double dot and spread operators are not supported: '${state.input}'`);
                        }
                        else if (state.currentToken === 1572864 /* EOF */) {
                            throw new Error(`Expected identifier: '${state.input}'`);
                        }
                    }
                    else if (state.currentToken & 524288 /* AccessScopeTerminal */) {
                        const ancestor = access & 511 /* Ancestor */;
                        result = ancestor === 0 ? $this : ancestor === 1 ? $parent : new AccessThisExpression(ancestor);
                        access = 512 /* This */;
                        break primary;
                    }
                    else {
                        throw new Error(`Invalid member expression: '${state.input}'`);
                    }
                } while (state.currentToken === 3078 /* ParentScope */);
            // falls through
            case 1024 /* Identifier */: // identifier
                if (bindingType & 512 /* IsIterator */) {
                    result = new BindingIdentifier(state.tokenValue);
                }
                else {
                    result = new AccessScopeExpression(state.tokenValue, access & 511 /* Ancestor */);
                    access = 1024 /* Scope */;
                }
                state.assignable = true;
                nextToken(state);
                break;
            case 3076 /* ThisScope */: // $this
                state.assignable = false;
                nextToken(state);
                result = $this;
                access = 512 /* This */;
                break;
            case 3077 /* HostScope */: // $host
                state.assignable = false;
                nextToken(state);
                result = $host;
                access = 512 /* This */;
                break;
            case 671751 /* OpenParen */: // parenthesized expression
                nextToken(state);
                result = parse(state, 0 /* Reset */, 62 /* Assign */, bindingType);
                consume(state, 1835019 /* CloseParen */);
                access = 0 /* Reset */;
                break;
            case 671757 /* OpenBracket */:
                result = parseArrayLiteralExpression(state, access, bindingType);
                access = 0 /* Reset */;
                break;
            case 131080 /* OpenBrace */:
                result = parseObjectLiteralExpression(state, bindingType);
                access = 0 /* Reset */;
                break;
            case 540714 /* TemplateTail */:
                result = new TemplateExpression([state.tokenValue]);
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            case 540715 /* TemplateContinuation */:
                result = parseTemplate(state, access, bindingType, result, false);
                access = 0 /* Reset */;
                break;
            case 4096 /* StringLiteral */:
            case 8192 /* NumericLiteral */:
                result = new PrimitiveLiteralExpression(state.tokenValue);
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            case 2050 /* NullKeyword */:
            case 2051 /* UndefinedKeyword */:
            case 2049 /* TrueKeyword */:
            case 2048 /* FalseKeyword */:
                result = TokenValues[state.currentToken & 63 /* Type */];
                state.assignable = false;
                nextToken(state);
                access = 0 /* Reset */;
                break;
            default:
                if (state.index >= state.length) {
                    throw new Error(`Unexpected end of expression: '${state.input}'`);
                }
                else {
                    throw new Error(`Unconsumed token: '${state.input}'`);
                }
        }
        if (bindingType & 512 /* IsIterator */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return parseForOfStatement(state, result);
        }
        if (449 /* LeftHandSide */ < minPrecedence) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        /** parseMemberExpression (Token.Dot, Token.OpenBracket, Token.TemplateContinuation)
         * MemberExpression :
         * 1. PrimaryExpression
         * 2. MemberExpression [ AssignmentExpression ]
         * 3. MemberExpression . IdentifierName
         * 4. MemberExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,4 = false
         * 2,3 = true
         *
         *
         * parseCallExpression (Token.OpenParen)
         * CallExpression :
         * 1. MemberExpression Arguments
         * 2. CallExpression Arguments
         * 3. CallExpression [ AssignmentExpression ]
         * 4. CallExpression . IdentifierName
         * 5. CallExpression TemplateLiteral
         *
         * IsValidAssignmentTarget
         * 1,2,5 = false
         * 3,4 = true
         */
        let name = state.tokenValue;
        while ((state.currentToken & 16384 /* LeftHandSide */) > 0) {
            const args = [];
            let strings;
            switch (state.currentToken) {
                case 16393 /* Dot */:
                    state.assignable = true;
                    nextToken(state);
                    if ((state.currentToken & 3072 /* IdentifierName */) === 0) {
                        throw new Error(`Expected identifier: '${state.input}'`);
                    }
                    name = state.tokenValue;
                    nextToken(state);
                    // Change $This to $Scope, change $Scope to $Member, keep $Member as-is, change $Keyed to $Member, disregard other flags
                    access = ((access & (512 /* This */ | 1024 /* Scope */)) << 1) | (access & 2048 /* Member */) | ((access & 4096 /* Keyed */) >> 1);
                    if (state.currentToken === 671751 /* OpenParen */) {
                        if (access === 0 /* Reset */) { // if the left hand side is a literal, make sure we parse a CallMemberExpression
                            access = 2048 /* Member */;
                        }
                        continue;
                    }
                    if (access & 1024 /* Scope */) {
                        result = new AccessScopeExpression(name, result.ancestor, result === $host);
                    }
                    else { // if it's not $Scope, it's $Member
                        result = new AccessMemberExpression(result, name);
                    }
                    continue;
                case 671757 /* OpenBracket */:
                    state.assignable = true;
                    nextToken(state);
                    access = 4096 /* Keyed */;
                    result = new AccessKeyedExpression(result, parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                    consume(state, 1835022 /* CloseBracket */);
                    break;
                case 671751 /* OpenParen */:
                    state.assignable = false;
                    nextToken(state);
                    while (state.currentToken !== 1835019 /* CloseParen */) {
                        args.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType));
                        if (!consumeOpt(state, 1572876 /* Comma */)) {
                            break;
                        }
                    }
                    consume(state, 1835019 /* CloseParen */);
                    if (access & 1024 /* Scope */) {
                        result = new CallScopeExpression(name, args, result.ancestor, result === $host);
                    }
                    else if (access & 2048 /* Member */) {
                        result = new CallMemberExpression(result, name, args);
                    }
                    else {
                        result = new CallFunctionExpression(result, args);
                    }
                    access = 0;
                    break;
                case 540714 /* TemplateTail */:
                    state.assignable = false;
                    strings = [state.tokenValue];
                    result = new TaggedTemplateExpression(strings, strings, result);
                    nextToken(state);
                    break;
                case 540715 /* TemplateContinuation */:
                    result = parseTemplate(state, access, bindingType, result, true);
            }
        }
    }
    if (448 /* Binary */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseBinaryExpression
     * https://tc39.github.io/ecma262/#sec-multiplicative-operators
     *
     * MultiplicativeExpression : (local precedence 6)
     * UnaryExpression
     * MultiplicativeExpression * / % UnaryExpression
     *
     * AdditiveExpression : (local precedence 5)
     * MultiplicativeExpression
     * AdditiveExpression + - MultiplicativeExpression
     *
     * RelationalExpression : (local precedence 4)
     * AdditiveExpression
     * RelationalExpression < > <= >= instanceof in AdditiveExpression
     *
     * EqualityExpression : (local precedence 3)
     * RelationalExpression
     * EqualityExpression == != === !== RelationalExpression
     *
     * LogicalANDExpression : (local precedence 2)
     * EqualityExpression
     * LogicalANDExpression && EqualityExpression
     *
     * LogicalORExpression : (local precedence 1)
     * LogicalANDExpression
     * LogicalORExpression || LogicalANDExpression
     */
    while ((state.currentToken & 65536 /* BinaryOp */) > 0) {
        const opToken = state.currentToken;
        if ((opToken & 448 /* Precedence */) <= minPrecedence) {
            break;
        }
        nextToken(state);
        result = new BinaryExpression(TokenValues[opToken & 63 /* Type */], result, parse(state, access, opToken & 448 /* Precedence */, bindingType));
        state.assignable = false;
    }
    if (63 /* Conditional */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /**
     * parseConditionalExpression
     * https://tc39.github.io/ecma262/#prod-ConditionalExpression
     *
     * ConditionalExpression :
     * 1. BinaryExpression
     * 2. BinaryExpression ? AssignmentExpression : AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(state, 1572880 /* Question */)) {
        const yes = parse(state, access, 62 /* Assign */, bindingType);
        consume(state, 1572879 /* Colon */);
        result = new ConditionalExpression(result, yes, parse(state, access, 62 /* Assign */, bindingType));
        state.assignable = false;
    }
    if (62 /* Assign */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseAssignmentExpression
     * https://tc39.github.io/ecma262/#prod-AssignmentExpression
     * Note: AssignmentExpression here is equivalent to ES Expression because we don't parse the comma operator
     *
     * AssignmentExpression :
     * 1. ConditionalExpression
     * 2. LeftHandSideExpression = AssignmentExpression
     *
     * IsValidAssignmentTarget
     * 1,2 = false
     */
    if (consumeOpt(state, 1048616 /* Equals */)) {
        if (!state.assignable) {
            throw new Error(`Left hand side of expression is not assignable: '${state.input}'`);
        }
        result = new AssignExpression(result, parse(state, access, 62 /* Assign */, bindingType));
    }
    if (61 /* Variadic */ < minPrecedence) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result;
    }
    /** parseValueConverter
     */
    while (consumeOpt(state, 1572884 /* Bar */)) {
        if (state.currentToken === 1572864 /* EOF */) {
            throw new Error(`Expected identifier to come after ValueConverter operator: '${state.input}'`);
        }
        const name = state.tokenValue;
        nextToken(state);
        const args = new Array();
        while (consumeOpt(state, 1572879 /* Colon */)) {
            args.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        result = new ValueConverterExpression(result, name, args);
    }
    /** parseBindingBehavior
     */
    while (consumeOpt(state, 1572883 /* Ampersand */)) {
        if (state.currentToken === 1572864 /* EOF */) {
            throw new Error(`Expected identifier to come after BindingBehavior operator: '${state.input}'`);
        }
        const name = state.tokenValue;
        nextToken(state);
        const args = new Array();
        while (consumeOpt(state, 1572879 /* Colon */)) {
            args.push(parse(state, access, 62 /* Assign */, bindingType));
        }
        result = new BindingBehaviorExpression(result, name, args);
    }
    if (state.currentToken !== 1572864 /* EOF */) {
        if (bindingType & 2048 /* Interpolation */) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return result;
        }
        if (state.tokenRaw === 'of') {
            throw new Error(`Unexpected keyword "of": '${state.input}'`);
        }
        throw new Error(`Unconsumed token: '${state.input}'`);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result;
}
/**
 * parseArrayLiteralExpression
 * https://tc39.github.io/ecma262/#prod-ArrayLiteralExpression
 *
 * ArrayLiteralExpression :
 * [ Elision(opt) ]
 * [ ElementList ]
 * [ ElementList, Elision(opt) ]
 *
 * ElementList :
 * Elision(opt) AssignmentExpression
 * ElementList, Elision(opt) AssignmentExpression
 *
 * Elision :
 * ,
 * Elision ,
 */
function parseArrayLiteralExpression(state, access, bindingType) {
    nextToken(state);
    const elements = new Array();
    while (state.currentToken !== 1835022 /* CloseBracket */) {
        if (consumeOpt(state, 1572876 /* Comma */)) {
            elements.push($undefined);
            if (state.currentToken === 1835022 /* CloseBracket */) {
                break;
            }
        }
        else {
            elements.push(parse(state, access, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            if (consumeOpt(state, 1572876 /* Comma */)) {
                if (state.currentToken === 1835022 /* CloseBracket */) {
                    break;
                }
            }
            else {
                break;
            }
        }
    }
    consume(state, 1835022 /* CloseBracket */);
    if (bindingType & 512 /* IsIterator */) {
        return new ArrayBindingPattern(elements);
    }
    else {
        state.assignable = false;
        return new ArrayLiteralExpression(elements);
    }
}
function parseForOfStatement(state, result) {
    if ((result.$kind & 65536 /* IsForDeclaration */) === 0) {
        throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.input}'`);
    }
    if (state.currentToken !== 1051180 /* OfKeyword */) {
        throw new Error(`Invalid BindingIdentifier at left hand side of "of": '${state.input}'`);
    }
    nextToken(state);
    const declaration = result;
    const statement = parse(state, 0 /* Reset */, 61 /* Variadic */, 0 /* None */);
    return new ForOfStatement(declaration, statement);
}
/**
 * parseObjectLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * ObjectLiteralExpression :
 * { }
 * { PropertyDefinitionList }
 *
 * PropertyDefinitionList :
 * PropertyDefinition
 * PropertyDefinitionList, PropertyDefinition
 *
 * PropertyDefinition :
 * IdentifierName
 * PropertyName : AssignmentExpression
 *
 * PropertyName :
 * IdentifierName
 * StringLiteral
 * NumericLiteral
 */
function parseObjectLiteralExpression(state, bindingType) {
    const keys = new Array();
    const values = new Array();
    nextToken(state);
    while (state.currentToken !== 1835018 /* CloseBrace */) {
        keys.push(state.tokenValue);
        // Literal = mandatory colon
        if (state.currentToken & 12288 /* StringOrNumericLiteral */) {
            nextToken(state);
            consume(state, 1572879 /* Colon */);
            values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
        }
        else if (state.currentToken & 3072 /* IdentifierName */) {
            // IdentifierName = optional colon
            const { currentChar, currentToken, index } = state;
            nextToken(state);
            if (consumeOpt(state, 1572879 /* Colon */)) {
                values.push(parse(state, 0 /* Reset */, 62 /* Assign */, bindingType & ~512 /* IsIterator */));
            }
            else {
                // Shorthand
                state.currentChar = currentChar;
                state.currentToken = currentToken;
                state.index = index;
                values.push(parse(state, 0 /* Reset */, 450 /* Primary */, bindingType & ~512 /* IsIterator */));
            }
        }
        else {
            throw new Error(`Invalid or unsupported property definition in object literal: '${state.input}'`);
        }
        if (state.currentToken !== 1835018 /* CloseBrace */) {
            consume(state, 1572876 /* Comma */);
        }
    }
    consume(state, 1835018 /* CloseBrace */);
    if (bindingType & 512 /* IsIterator */) {
        return new ObjectBindingPattern(keys, values);
    }
    else {
        state.assignable = false;
        return new ObjectLiteralExpression(keys, values);
    }
}
function parseInterpolation(state) {
    const parts = [];
    const expressions = [];
    const length = state.length;
    let result = '';
    while (state.index < length) {
        switch (state.currentChar) {
            case 36 /* Dollar */:
                if (state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                    parts.push(result);
                    result = '';
                    state.index += 2;
                    state.currentChar = state.input.charCodeAt(state.index);
                    nextToken(state);
                    const expression = parse(state, 0 /* Reset */, 61 /* Variadic */, 2048 /* Interpolation */);
                    expressions.push(expression);
                    continue;
                }
                else {
                    result += '$';
                }
                break;
            case 92 /* Backslash */:
                result += String.fromCharCode(unescapeCode(nextChar(state)));
                break;
            default:
                result += String.fromCharCode(state.currentChar);
        }
        nextChar(state);
    }
    if (expressions.length) {
        parts.push(result);
        return new Interpolation(parts, expressions);
    }
    return null;
}
/**
 * parseTemplateLiteralExpression
 * https://tc39.github.io/ecma262/#prod-Literal
 *
 * TemplateExpression :
 * NoSubstitutionTemplate
 * TemplateHead
 *
 * NoSubstitutionTemplate :
 * ` TemplateCharacters(opt) `
 *
 * TemplateHead :
 * ` TemplateCharacters(opt) ${
 *
 * TemplateSubstitutionTail :
 * TemplateMiddle
 * TemplateTail
 *
 * TemplateMiddle :
 * } TemplateCharacters(opt) ${
 *
 * TemplateTail :
 * } TemplateCharacters(opt) `
 *
 * TemplateCharacters :
 * TemplateCharacter TemplateCharacters(opt)
 *
 * TemplateCharacter :
 * $ [lookahead ≠ {]
 * \ EscapeSequence
 * SourceCharacter (but not one of ` or \ or $)
 */
function parseTemplate(state, access, bindingType, result, tagged) {
    const cooked = [state.tokenValue];
    // TODO: properly implement raw parts / decide whether we want this
    consume(state, 540715 /* TemplateContinuation */);
    const expressions = [parse(state, access, 62 /* Assign */, bindingType)];
    while ((state.currentToken = scanTemplateTail(state)) !== 540714 /* TemplateTail */) {
        cooked.push(state.tokenValue);
        consume(state, 540715 /* TemplateContinuation */);
        expressions.push(parse(state, access, 62 /* Assign */, bindingType));
    }
    cooked.push(state.tokenValue);
    state.assignable = false;
    if (tagged) {
        nextToken(state);
        return new TaggedTemplateExpression(cooked, cooked, result, expressions);
    }
    else {
        nextToken(state);
        return new TemplateExpression(cooked, expressions);
    }
}
function nextToken(state) {
    while (state.index < state.length) {
        state.startIndex = state.index;
        if ((state.currentToken = (CharScanners[state.currentChar](state))) != null) { // a null token means the character must be skipped
            return;
        }
    }
    state.currentToken = 1572864 /* EOF */;
}
function nextChar(state) {
    return state.currentChar = state.input.charCodeAt(++state.index);
}
function scanIdentifier(state) {
    // run to the next non-idPart
    while (IdParts[nextChar(state)])
        ;
    const token = KeywordLookup[state.tokenValue = state.tokenRaw];
    return token === undefined ? 1024 /* Identifier */ : token;
}
function scanNumber(state, isFloat) {
    let char = state.currentChar;
    if (isFloat === false) {
        do {
            char = nextChar(state);
        } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
        if (char !== 46 /* Dot */) {
            state.tokenValue = parseInt(state.tokenRaw, 10);
            return 8192 /* NumericLiteral */;
        }
        // past this point it's always a float
        char = nextChar(state);
        if (state.index >= state.length) {
            // unless the number ends with a dot - that behaves a little different in native ES expressions
            // but in our AST that behavior has no effect because numbers are always stored in variables
            state.tokenValue = parseInt(state.tokenRaw.slice(0, -1), 10);
            return 8192 /* NumericLiteral */;
        }
    }
    if (char <= 57 /* Nine */ && char >= 48 /* Zero */) {
        do {
            char = nextChar(state);
        } while (char <= 57 /* Nine */ && char >= 48 /* Zero */);
    }
    else {
        state.currentChar = state.input.charCodeAt(--state.index);
    }
    state.tokenValue = parseFloat(state.tokenRaw);
    return 8192 /* NumericLiteral */;
}
function scanString(state) {
    const quote = state.currentChar;
    nextChar(state); // Skip initial quote.
    let unescaped = 0;
    const buffer = new Array();
    let marker = state.index;
    while (state.currentChar !== quote) {
        if (state.currentChar === 92 /* Backslash */) {
            buffer.push(state.input.slice(marker, state.index));
            nextChar(state);
            unescaped = unescapeCode(state.currentChar);
            nextChar(state);
            buffer.push(String.fromCharCode(unescaped));
            marker = state.index;
        }
        else if (state.index >= state.length) {
            throw new Error(`Unterminated quote in string literal: '${state.input}'`);
        }
        else {
            nextChar(state);
        }
    }
    const last = state.input.slice(marker, state.index);
    nextChar(state); // Skip terminating quote.
    // Compute the unescaped string value.
    buffer.push(last);
    const unescapedStr = buffer.join('');
    state.tokenValue = unescapedStr;
    return 4096 /* StringLiteral */;
}
function scanTemplate(state) {
    let tail = true;
    let result = '';
    while (nextChar(state) !== 96 /* Backtick */) {
        if (state.currentChar === 36 /* Dollar */) {
            if ((state.index + 1) < state.length && state.input.charCodeAt(state.index + 1) === 123 /* OpenBrace */) {
                state.index++;
                tail = false;
                break;
            }
            else {
                result += '$';
            }
        }
        else if (state.currentChar === 92 /* Backslash */) {
            result += String.fromCharCode(unescapeCode(nextChar(state)));
        }
        else {
            if (state.index >= state.length) {
                throw new Error(`Unterminated template string: '${state.input}'`);
            }
            result += String.fromCharCode(state.currentChar);
        }
    }
    nextChar(state);
    state.tokenValue = result;
    if (tail) {
        return 540714 /* TemplateTail */;
    }
    return 540715 /* TemplateContinuation */;
}
function scanTemplateTail(state) {
    if (state.index >= state.length) {
        throw new Error(`Unterminated template string: '${state.input}'`);
    }
    state.index--;
    return scanTemplate(state);
}
function consumeOpt(state, token) {
    if (state.currentToken === token) {
        nextToken(state);
        return true;
    }
    return false;
}
function consume(state, token) {
    if (state.currentToken === token) {
        nextToken(state);
    }
    else {
        throw new Error(`Missing expected token: '${state.input}'`);
    }
}
/**
 * Array for mapping tokens to token values. The indices of the values
 * correspond to the token bits 0-38.
 * For this to work properly, the values in the array must be kept in
 * the same order as the token bits.
 * Usage: TokenValues[token & Token.Type]
 */
const TokenValues = [
    $false, $true, $null, $undefined, '$this', '$host', '$parent',
    '(', '{', '.', '}', ')', ',', '[', ']', ':', '?', '\'', '"',
    '&', '|', '||', '&&', '==', '!=', '===', '!==', '<', '>',
    '<=', '>=', 'in', 'instanceof', '+', '-', 'typeof', 'void', '*', '%', '/', '=', '!',
    540714 /* TemplateTail */, 540715 /* TemplateContinuation */,
    'of'
];
const KeywordLookup = Object.create(null);
KeywordLookup.true = 2049 /* TrueKeyword */;
KeywordLookup.null = 2050 /* NullKeyword */;
KeywordLookup.false = 2048 /* FalseKeyword */;
KeywordLookup.undefined = 2051 /* UndefinedKeyword */;
KeywordLookup.$this = 3076 /* ThisScope */;
KeywordLookup.$host = 3077 /* HostScope */;
KeywordLookup.$parent = 3078 /* ParentScope */;
KeywordLookup.in = 1640799 /* InKeyword */;
KeywordLookup.instanceof = 1640800 /* InstanceOfKeyword */;
KeywordLookup.typeof = 34851 /* TypeofKeyword */;
KeywordLookup.void = 34852 /* VoidKeyword */;
KeywordLookup.of = 1051180 /* OfKeyword */;
/**
 * Ranges of code points in pairs of 2 (eg 0x41-0x5B, 0x61-0x7B, ...) where the second value is not inclusive (5-7 means 5 and 6)
 * Single values are denoted by the second value being a 0
 *
 * Copied from output generated with "node build/generate-unicode.js"
 *
 * See also: https://en.wikibooks.org/wiki/Unicode/Character_reference/0000-0FFF
 */
const codes = {
    /* [$0-9A-Za_a-z] */
    AsciiIdPart: [0x24, 0, 0x30, 0x3A, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B],
    IdStart: /* IdentifierStart */ [0x24, 0, 0x41, 0x5B, 0x5F, 0, 0x61, 0x7B, 0xAA, 0, 0xBA, 0, 0xC0, 0xD7, 0xD8, 0xF7, 0xF8, 0x2B9, 0x2E0, 0x2E5, 0x1D00, 0x1D26, 0x1D2C, 0x1D5D, 0x1D62, 0x1D66, 0x1D6B, 0x1D78, 0x1D79, 0x1DBF, 0x1E00, 0x1F00, 0x2071, 0, 0x207F, 0, 0x2090, 0x209D, 0x212A, 0x212C, 0x2132, 0, 0x214E, 0, 0x2160, 0x2189, 0x2C60, 0x2C80, 0xA722, 0xA788, 0xA78B, 0xA7AF, 0xA7B0, 0xA7B8, 0xA7F7, 0xA800, 0xAB30, 0xAB5B, 0xAB5C, 0xAB65, 0xFB00, 0xFB07, 0xFF21, 0xFF3B, 0xFF41, 0xFF5B],
    Digit: /* DecimalNumber */ [0x30, 0x3A],
    Skip: /* Skippable */ [0, 0x21, 0x7F, 0xA1]
};
/**
 * Decompress the ranges into an array of numbers so that the char code
 * can be used as an index to the lookup
 */
function decompress(lookup, $set, compressed, value) {
    const rangeCount = compressed.length;
    for (let i = 0; i < rangeCount; i += 2) {
        const start = compressed[i];
        let end = compressed[i + 1];
        end = end > 0 ? end : start + 1;
        if (lookup) {
            lookup.fill(value, start, end);
        }
        if ($set) {
            for (let ch = start; ch < end; ch++) {
                $set.add(ch);
            }
        }
    }
}
// CharFuncLookup functions
function returnToken(token) {
    return s => {
        nextChar(s);
        return token;
    };
}
const unexpectedCharacter = s => {
    throw new Error(`Unexpected character: '${s.input}'`);
};
unexpectedCharacter.notMapped = true;
// ASCII IdentifierPart lookup
const AsciiIdParts = new Set();
decompress(null, AsciiIdParts, codes.AsciiIdPart, true);
// IdentifierPart lookup
const IdParts = new Uint8Array(0xFFFF);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.IdStart, 1);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
decompress(IdParts, null, codes.Digit, 1);
// Character scanning function lookup
const CharScanners = new Array(0xFFFF);
CharScanners.fill(unexpectedCharacter, 0, 0xFFFF);
decompress(CharScanners, null, codes.Skip, s => {
    nextChar(s);
    return null;
});
decompress(CharScanners, null, codes.IdStart, scanIdentifier);
decompress(CharScanners, null, codes.Digit, s => scanNumber(s, false));
CharScanners[34 /* DoubleQuote */] =
    CharScanners[39 /* SingleQuote */] = s => {
        return scanString(s);
    };
CharScanners[96 /* Backtick */] = s => {
    return scanTemplate(s);
};
// !, !=, !==
CharScanners[33 /* Exclamation */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 32809 /* Exclamation */;
    }
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638680 /* ExclamationEquals */;
    }
    nextChar(s);
    return 1638682 /* ExclamationEqualsEquals */;
};
// =, ==, ===
CharScanners[61 /* Equals */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1048616 /* Equals */;
    }
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638679 /* EqualsEquals */;
    }
    nextChar(s);
    return 1638681 /* EqualsEqualsEquals */;
};
// &, &&
CharScanners[38 /* Ampersand */] = s => {
    if (nextChar(s) !== 38 /* Ampersand */) {
        return 1572883 /* Ampersand */;
    }
    nextChar(s);
    return 1638614 /* AmpersandAmpersand */;
};
// |, ||
CharScanners[124 /* Bar */] = s => {
    if (nextChar(s) !== 124 /* Bar */) {
        return 1572884 /* Bar */;
    }
    nextChar(s);
    return 1638549 /* BarBar */;
};
// .
CharScanners[46 /* Dot */] = s => {
    if (nextChar(s) <= 57 /* Nine */ && s.currentChar >= 48 /* Zero */) {
        return scanNumber(s, true);
    }
    return 16393 /* Dot */;
};
// <, <=
CharScanners[60 /* LessThan */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638747 /* LessThan */;
    }
    nextChar(s);
    return 1638749 /* LessThanEquals */;
};
// >, >=
CharScanners[62 /* GreaterThan */] = s => {
    if (nextChar(s) !== 61 /* Equals */) {
        return 1638748 /* GreaterThan */;
    }
    nextChar(s);
    return 1638750 /* GreaterThanEquals */;
};
CharScanners[37 /* Percent */] = returnToken(1638886 /* Percent */);
CharScanners[40 /* OpenParen */] = returnToken(671751 /* OpenParen */);
CharScanners[41 /* CloseParen */] = returnToken(1835019 /* CloseParen */);
CharScanners[42 /* Asterisk */] = returnToken(1638885 /* Asterisk */);
CharScanners[43 /* Plus */] = returnToken(623009 /* Plus */);
CharScanners[44 /* Comma */] = returnToken(1572876 /* Comma */);
CharScanners[45 /* Minus */] = returnToken(623010 /* Minus */);
CharScanners[47 /* Slash */] = returnToken(1638887 /* Slash */);
CharScanners[58 /* Colon */] = returnToken(1572879 /* Colon */);
CharScanners[63 /* Question */] = returnToken(1572880 /* Question */);
CharScanners[91 /* OpenBracket */] = returnToken(671757 /* OpenBracket */);
CharScanners[93 /* CloseBracket */] = returnToken(1835022 /* CloseBracket */);
CharScanners[123 /* OpenBrace */] = returnToken(131080 /* OpenBrace */);
CharScanners[125 /* CloseBrace */] = returnToken(1835018 /* CloseBrace */);

/**
 * Current subscription collector
 */
let _connectable = null;
const connectables = [];
// eslint-disable-next-line
let connecting = false;
// todo: layer based collection pause/resume?
function pauseConnecting() {
    connecting = false;
}
function resumeConnecting() {
    connecting = true;
}
function currentConnectable() {
    return _connectable;
}
function enterConnectable(connectable) {
    if (connectable == null) {
        throw new Error('Connectable cannot be null/undefined');
    }
    if (_connectable == null) {
        _connectable = connectable;
        connectables[0] = _connectable;
        connecting = true;
        return;
    }
    if (_connectable === connectable) {
        throw new Error(`Trying to enter an active connectable`);
    }
    connectables.push(_connectable);
    _connectable = connectable;
    connecting = true;
}
function exitConnectable(connectable) {
    if (connectable == null) {
        throw new Error('Connectable cannot be null/undefined');
    }
    if (_connectable !== connectable) {
        throw new Error(`Trying to exit an unactive connectable`);
    }
    connectables.pop();
    _connectable = connectables.length > 0 ? connectables[connectables.length - 1] : null;
    connecting = _connectable != null;
}
const ConnectableSwitcher = Object.freeze({
    get current() {
        return _connectable;
    },
    get connecting() {
        return connecting;
    },
    enter: enterConnectable,
    exit: exitConnectable,
    pause: pauseConnecting,
    resume: resumeConnecting,
});

const R$get = Reflect.get;
const toStringTag = Object.prototype.toString;
const proxyMap = new WeakMap();
function canWrap(obj) {
    switch (toStringTag.call(obj)) {
        case '[object Object]':
        case '[object Array]':
        case '[object Map]':
        case '[object Set]':
            // it's unlikely that methods on the following 2 objects need to be observed for changes
            // so while they are valid/ we don't wrap them either
            // case '[object Math]':
            // case '[object Reflect]':
            return true;
        default:
            return false;
    }
}
const rawKey = '__raw__';
function wrap$1(v) {
    return canWrap(v) ? getProxy(v) : v;
}
function getProxy(obj) {
    var _a;
    // deepscan-disable-next-line
    return (_a = proxyMap.get(obj)) !== null && _a !== void 0 ? _a : createProxy(obj);
}
function getRaw(obj) {
    var _a;
    // todo: get in a weakmap if null/undef
    return (_a = obj[rawKey]) !== null && _a !== void 0 ? _a : obj;
}
function unwrap$1(v) {
    return canWrap(v) && v[rawKey] || v;
}
function doNotCollect(key) {
    return key === 'constructor'
        || key === '__proto__'
        // probably should revert to v1 naming style for consistency with builtin?
        // __o__ is shorters & less chance of conflict with other libs as well
        || key === '$observers'
        || key === Symbol.toPrimitive
        || key === Symbol.toStringTag;
}
function createProxy(obj) {
    const handler = obj instanceof Array
        ? arrayHandler
        : obj instanceof Map || obj instanceof Set
            ? collectionHandler
            : objectHandler;
    const proxiedObj = new Proxy(obj, handler);
    proxyMap.set(obj, proxiedObj);
    return proxiedObj;
}
const objectHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        // todo: static
        connectable.observeProperty(target, key);
        return wrap$1(R$get(target, key, receiver));
    },
};
const arrayHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'length':
                connectable.observeProperty(target, 'length');
                return target.length;
            case 'map':
                return wrappedArrayMap;
            case 'includes':
                return wrappedArrayIncludes;
            case 'indexOf':
                return wrappedArrayIndexOf;
            case 'lastIndexOf':
                return wrappedArrayLastIndexOf;
            case 'every':
                return wrappedArrayEvery;
            case 'filter':
                return wrappedArrayFilter;
            case 'find':
                return wrappedArrayFind;
            case 'findIndex':
                return wrappedArrayFindIndex;
            case 'flat':
                return wrappedArrayFlat;
            case 'flatMap':
                return wrappedArrayFlatMap;
            case 'join':
                return wrappedArrayJoin;
            case 'push':
                return wrappedArrayPush;
            case 'pop':
                return wrappedArrayPop;
            case 'reduce':
                return wrappedReduce;
            case 'reduceRight':
                return wrappedReduceRight;
            case 'reverse':
                return wrappedArrayReverse;
            case 'shift':
                return wrappedArrayShift;
            case 'unshift':
                return wrappedArrayUnshift;
            case 'slice':
                return wrappedArraySlice;
            case 'splice':
                return wrappedArraySplice;
            case 'some':
                return wrappedArraySome;
            case 'sort':
                return wrappedArraySort;
            case 'keys':
                return wrappedKeys;
            case 'values':
            case Symbol.iterator:
                return wrappedValues;
            case 'entries':
                return wrappedEntries;
        }
        connectable.observeProperty(target, key);
        return wrap$1(R$get(target, key, receiver));
    },
    // for (let i in array) ...
    ownKeys(target) {
        var _a;
        (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeProperty(target, 'length');
        return Reflect.ownKeys(target);
    },
};
function wrappedArrayMap(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.map((v, i) => 
    // do we wrap `thisArg`?
    unwrap$1(cb.call(thisArg, wrap$1(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(res);
}
function wrappedArrayEvery(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.every((v, i) => cb.call(thisArg, wrap$1(v), i, this));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFilter(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.filter((v, i) => 
    // do we wrap `thisArg`?
    unwrap$1(cb.call(thisArg, wrap$1(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(res);
}
function wrappedArrayIncludes(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.includes(unwrap$1(v));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayIndexOf(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.indexOf(unwrap$1(v));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayLastIndexOf(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.lastIndexOf(unwrap$1(v));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFindIndex(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.findIndex((v, i) => unwrap$1(cb.call(thisArg, wrap$1(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFind(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.find((v, i) => cb(wrap$1(v), i, this), thisArg);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(res);
}
function wrappedArrayFlat() {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(raw.flat());
}
function wrappedArrayFlatMap(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxy(raw.flatMap((v, i) => wrap$1(cb.call(thisArg, wrap$1(v), i, this))));
}
function wrappedArrayJoin(separator) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.join(separator);
}
function wrappedArrayPop() {
    return wrap$1(getRaw(this).pop());
}
function wrappedArrayPush(...args) {
    return getRaw(this).push(...args);
}
function wrappedArrayShift() {
    return wrap$1(getRaw(this).shift());
}
function wrappedArrayUnshift(...args) {
    return getRaw(this).unshift(...args);
}
function wrappedArraySplice(...args) {
    return wrap$1(getRaw(this).splice(...args));
}
function wrappedArrayReverse(...args) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reverse();
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(res);
}
function wrappedArraySome(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.some((v, i) => unwrap$1(cb.call(thisArg, wrap$1(v), i, this)));
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArraySort(cb) {
    var _a;
    const raw = getRaw(this);
    const res = raw.sort(cb);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(res);
}
function wrappedArraySlice(start, end) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxy(raw.slice(start, end));
}
function wrappedReduce(cb, initValue) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reduce((curr, v, i) => cb(curr, wrap$1(v), i, this), initValue);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(res);
}
function wrappedReduceRight(cb, initValue) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reduceRight((curr, v, i) => cb(curr, wrap$1(v), i, this), initValue);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(res);
}
// the below logic takes inspiration from Vue, Mobx
// much thanks to them for working out this
const collectionHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentConnectable();
        if (!connecting || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'size':
                connectable.observeProperty(target, 'size');
                return target.size;
            case 'clear':
                return wrappedClear;
            case 'delete':
                return wrappedDelete;
            case 'forEach':
                return wrappedForEach;
            case 'add':
                if (target instanceof Set) {
                    return wrappedAdd;
                }
                break;
            case 'get':
                if (target instanceof Map) {
                    return wrappedGet;
                }
                break;
            case 'set':
                if (target instanceof Map) {
                    return wrappedSet;
                }
                break;
            case 'has':
                return wrappedHas;
            case 'keys':
                return wrappedKeys;
            case 'values':
                return wrappedValues;
            case 'entries':
                return wrappedEntries;
            case Symbol.iterator:
                return target instanceof Map ? wrappedEntries : wrappedValues;
        }
        return wrap$1(R$get(target, key, receiver));
    },
};
function wrappedForEach(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.forEach((v, key) => {
        cb.call(/* should wrap or not?? */ thisArg, wrap$1(v), wrap$1(key), this);
    });
}
function wrappedHas(v) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.has(unwrap$1(v));
}
function wrappedGet(k) {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return wrap$1(raw.get(unwrap$1(k)));
}
function wrappedSet(k, v) {
    return wrap$1(getRaw(this).set(unwrap$1(k), unwrap$1(v)));
}
function wrappedAdd(v) {
    return wrap$1(getRaw(this).add(unwrap$1(v)));
}
function wrappedClear() {
    return wrap$1(getRaw(this).clear());
}
function wrappedDelete(k) {
    return wrap$1(getRaw(this).delete(unwrap$1(k)));
}
function wrappedKeys() {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    const iterator = raw.keys();
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: wrap$1(value), done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
function wrappedValues() {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    const iterator = raw.values();
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: wrap$1(value), done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
function wrappedEntries() {
    var _a;
    const raw = getRaw(this);
    (_a = currentConnectable()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    const iterator = raw.entries();
    // return a wrapped iterator which returns observed versions of the
    // values emitted from the real iterator
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: [wrap$1(value[0]), wrap$1(value[1])], done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
const ProxyObservable = Object.freeze({
    getProxy,
    getRaw,
    wrap: wrap$1,
    unwrap: unwrap$1,
    rawKey,
});

class ComputedObserver {
    constructor(obj, get, set, useProxy, observerLocator) {
        this.obj = obj;
        this.get = get;
        this.set = set;
        this.useProxy = useProxy;
        this.observerLocator = observerLocator;
        this.interceptor = this;
        this.type = 1 /* Observer */;
        this.value = void 0;
        this.oldValue = void 0;
        // todo: maybe use a counter allow recursive call to a certain level
        /**
         * @internal
         */
        this.running = false;
        this.isDirty = false;
    }
    static create(obj, key, descriptor, observerLocator, useProxy) {
        const getter = descriptor.get;
        const setter = descriptor.set;
        const observer = new ComputedObserver(obj, getter, setter, useProxy, observerLocator);
        const $get = (( /* Computed Observer */) => observer.getValue());
        $get.getObserver = () => observer;
        def(obj, key, {
            enumerable: descriptor.enumerable,
            configurable: true,
            get: $get,
            set: (/* Computed Observer */ v) => {
                observer.setValue(v, 0 /* none */);
            },
        });
        return observer;
    }
    getValue() {
        if (this.subs.count === 0) {
            return this.get.call(this.obj, this);
        }
        if (this.isDirty) {
            this.compute();
            this.isDirty = false;
        }
        return this.value;
    }
    // deepscan-disable-next-line
    setValue(v, _flags) {
        if (typeof this.set === 'function') {
            if (v !== this.value) {
                // setting running true as a form of batching
                this.running = true;
                this.set.call(this.obj, v);
                this.running = false;
                this.run();
            }
        }
        else {
            throw new Error('Property is readonly');
        }
    }
    handleChange() {
        this.isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    handleCollectionChange() {
        this.isDirty = true;
        if (this.subs.count > 0) {
            this.run();
        }
    }
    subscribe(subscriber) {
        // in theory, a collection subscriber could be added before a property subscriber
        // and it should be handled similarly in subscribeToCollection
        // though not handling for now, and wait until the merge of normal + collection subscription
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.compute();
            this.isDirty = false;
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.isDirty = true;
            this.obs.clear(true);
        }
    }
    flush() {
        oV$6 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$6, 0 /* none */);
    }
    run() {
        if (this.running) {
            return;
        }
        const oldValue = this.value;
        const newValue = this.compute();
        this.isDirty = false;
        if (!Object.is(newValue, oldValue)) {
            this.oldValue = oldValue;
            this.queue.add(this);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            enterConnectable(this);
            return this.value = unwrap$1(this.get.call(this.useProxy ? wrap$1(this.obj) : this.obj, this));
        }
        finally {
            this.obs.clear(false);
            this.running = false;
            exitConnectable(this);
        }
    }
}
connectable(ComputedObserver);
subscriberCollection(ComputedObserver);
withFlushQueue(ComputedObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$6 = void 0;

const IDirtyChecker = DI.createInterface('IDirtyChecker', x => x.singleton(DirtyChecker));
const DirtyCheckSettings = {
    /**
     * Default: `6`
     *
     * Adjust the global dirty check frequency.
     * Measures in "timeouts per check", such that (given a default of 250 timeouts per second in modern browsers):
     * - A value of 1 will result in 250 dirty checks per second (or 1 dirty check per second for an inactive tab)
     * - A value of 25 will result in 10 dirty checks per second (or 1 dirty check per 25 seconds for an inactive tab)
     */
    timeoutsPerCheck: 25,
    /**
     * Default: `false`
     *
     * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
     * or an adapter, will simply not be observed.
     */
    disabled: false,
    /**
     * Default: `false`
     *
     * Throw an error if a property is being dirty-checked.
     */
    throw: false,
    /**
     * Resets all dirty checking settings to the framework's defaults.
     */
    resetToDefault() {
        this.timeoutsPerCheck = 6;
        this.disabled = false;
        this.throw = false;
    }
};
const queueTaskOpts = {
    persistent: true,
};
class DirtyChecker {
    constructor(platform) {
        this.platform = platform;
        this.tracked = [];
        this.task = null;
        this.elapsedFrames = 0;
        this.check = () => {
            if (++this.elapsedFrames < DirtyCheckSettings.timeoutsPerCheck) {
                return;
            }
            this.elapsedFrames = 0;
            const tracked = this.tracked;
            const len = tracked.length;
            let current;
            let i = 0;
            for (; i < len; ++i) {
                current = tracked[i];
                if (current.isDirty()) {
                    this.queue.add(current);
                }
            }
        };
    }
    createProperty(obj, propertyName) {
        return new DirtyCheckProperty(this, obj, propertyName);
    }
    addProperty(property) {
        this.tracked.push(property);
        if (this.tracked.length === 1) {
            this.task = this.platform.taskQueue.queueTask(this.check, queueTaskOpts);
        }
    }
    removeProperty(property) {
        this.tracked.splice(this.tracked.indexOf(property), 1);
        if (this.tracked.length === 0) {
            this.task.cancel();
            this.task = null;
        }
    }
}
/**
 * @internal
 */
DirtyChecker.inject = [IPlatform$1];
withFlushQueue(DirtyChecker);
class DirtyCheckProperty {
    constructor(dirtyChecker, obj, propertyKey) {
        this.dirtyChecker = dirtyChecker;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.oldValue = void 0;
        this.type = 0 /* None */;
    }
    getValue() {
        return this.obj[this.propertyKey];
    }
    setValue(v, f) {
        // todo: this should be allowed, probably
        // but the construction of dirty checker should throw instead
        throw new Error(`Trying to set value for property ${this.propertyKey} in dirty checker`);
    }
    isDirty() {
        return this.oldValue !== this.obj[this.propertyKey];
    }
    flush() {
        const oldValue = this.oldValue;
        const newValue = this.getValue();
        this.oldValue = newValue;
        this.subs.notify(newValue, oldValue, 0 /* none */);
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.oldValue = this.obj[this.propertyKey];
            this.dirtyChecker.addProperty(this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.dirtyChecker.removeProperty(this);
        }
    }
}
subscriberCollection(DirtyCheckProperty);

class PrimitiveObserver {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.type = 0 /* None */;
    }
    get doNotCache() { return true; }
    getValue() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
        return this.obj[this.propertyKey];
    }
    setValue() { }
    subscribe() { }
    unsubscribe() { }
}

class PropertyAccessor {
    constructor() {
        // the only thing can be guaranteed is it's an object
        // even if this property accessor is used to access an element
        this.type = 0 /* None */;
    }
    getValue(obj, key) {
        return obj[key];
    }
    setValue(value, flags, obj, key) {
        obj[key] = value;
    }
}

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$5 = void 0;
/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
class SetterObserver {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.value = void 0;
        this.oldValue = void 0;
        this.observing = false;
        // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
        this.type = 1 /* Observer */;
        this.f = 0 /* none */;
    }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        if (this.observing) {
            const value = this.value;
            if (Object.is(newValue, value)) {
                return;
            }
            this.value = newValue;
            this.oldValue = value;
            this.f = flags;
            this.queue.add(this);
        }
        else {
            // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
            // so calling obj[propertyKey] will actually return this.value.
            // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
            // is unmodified and we need to explicitly set the property value.
            // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
            // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
            this.obj[this.propertyKey] = newValue;
        }
    }
    subscribe(subscriber) {
        if (this.observing === false) {
            this.start();
        }
        this.subs.add(subscriber);
    }
    flush() {
        oV$5 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$5, this.f);
    }
    start() {
        if (this.observing === false) {
            this.observing = true;
            this.value = this.obj[this.propertyKey];
            def(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: ( /* Setter Observer */) => this.getValue(),
                set: (/* Setter Observer */ value) => {
                    this.setValue(value, 0 /* none */);
                },
            });
        }
        return this;
    }
    stop() {
        if (this.observing) {
            def(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.value,
            });
            this.observing = false;
            // todo(bigopon/fred): add .removeAllSubscribers()
        }
        return this;
    }
}
class SetterNotifier {
    constructor(obj, callbackKey, set, initialValue) {
        this.type = 1 /* Observer */;
        /**
         * @internal
         */
        this.v = void 0;
        /**
         * @internal
         */
        this.oV = void 0;
        /**
         * @internal
         */
        this.f = 0 /* none */;
        this.obj = obj;
        this.s = set;
        const callback = obj[callbackKey];
        this.cb = typeof callback === 'function' ? callback : void 0;
        this.v = initialValue;
    }
    getValue() {
        return this.v;
    }
    setValue(value, flags) {
        var _a;
        if (typeof this.s === 'function') {
            value = this.s(value);
        }
        if (!Object.is(value, this.v)) {
            this.oV = this.v;
            this.v = value;
            this.f = flags;
            (_a = this.cb) === null || _a === void 0 ? void 0 : _a.call(this.obj, this.v, this.oV, flags);
            this.queue.add(this);
        }
    }
    flush() {
        oV$5 = this.oV;
        this.oV = this.v;
        this.subs.notify(this.v, oV$5, this.f);
    }
}
subscriberCollection(SetterObserver);
subscriberCollection(SetterNotifier);
withFlushQueue(SetterObserver);
withFlushQueue(SetterNotifier);

const propertyAccessor = new PropertyAccessor();
const IObserverLocator = DI.createInterface('IObserverLocator', x => x.singleton(ObserverLocator));
const INodeObserverLocator = DI
    .createInterface('INodeObserverLocator', x => x.cachedCallback(handler => {
    handler.getAll(ILogger).forEach(logger => {
        logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
    });
    return new DefaultNodeObserverLocator();
}));
class DefaultNodeObserverLocator {
    handles() {
        return false;
    }
    getObserver() {
        return propertyAccessor;
    }
    getAccessor() {
        return propertyAccessor;
    }
}
class ObserverLocator {
    constructor(dirtyChecker, nodeObserverLocator) {
        this.dirtyChecker = dirtyChecker;
        this.nodeObserverLocator = nodeObserverLocator;
        this.adapters = [];
    }
    addAdapter(adapter) {
        this.adapters.push(adapter);
    }
    getObserver(obj, key) {
        var _a, _b;
        return (_b = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this.cache(obj, key, this.createObserver(obj, key));
    }
    getAccessor(obj, key) {
        var _a;
        const cached = (_a = obj.$observers) === null || _a === void 0 ? void 0 : _a[key];
        if (cached !== void 0) {
            return cached;
        }
        if (this.nodeObserverLocator.handles(obj, key, this)) {
            return this.nodeObserverLocator.getAccessor(obj, key, this);
        }
        return propertyAccessor;
    }
    getArrayObserver(observedArray) {
        return getArrayObserver(observedArray);
    }
    getMapObserver(observedMap) {
        return getMapObserver(observedMap);
    }
    getSetObserver(observedSet) {
        return getSetObserver(observedSet);
    }
    createObserver(obj, key) {
        var _a, _b, _c, _d;
        if (!(obj instanceof Object)) {
            return new PrimitiveObserver(obj, key);
        }
        if (this.nodeObserverLocator.handles(obj, key, this)) {
            return this.nodeObserverLocator.getObserver(obj, key, this);
        }
        switch (key) {
            case 'length':
                if (obj instanceof Array) {
                    return getArrayObserver(obj).getLengthObserver();
                }
                break;
            case 'size':
                if (obj instanceof Map) {
                    return getMapObserver(obj).getLengthObserver();
                }
                else if (obj instanceof Set) {
                    return getSetObserver(obj).getLengthObserver();
                }
                break;
            default:
                if (obj instanceof Array && isArrayIndex(key)) {
                    return getArrayObserver(obj).getIndexObserver(Number(key));
                }
                break;
        }
        let pd = Object.getOwnPropertyDescriptor(obj, key);
        // Only instance properties will yield a descriptor here, otherwise walk up the proto chain
        if (pd === void 0) {
            let proto = Object.getPrototypeOf(obj);
            while (proto !== null) {
                pd = Object.getOwnPropertyDescriptor(proto, key);
                if (pd === void 0) {
                    proto = Object.getPrototypeOf(proto);
                }
                else {
                    break;
                }
            }
        }
        // If the descriptor does not have a 'value' prop, it must have a getter and/or setter
        if (pd !== void 0 && !Object.prototype.hasOwnProperty.call(pd, 'value')) {
            let obs = this.getAdapterObserver(obj, key, pd);
            if (obs == null) {
                obs = (_d = ((_b = (_a = pd.get) === null || _a === void 0 ? void 0 : _a.getObserver) !== null && _b !== void 0 ? _b : (_c = pd.set) === null || _c === void 0 ? void 0 : _c.getObserver)) === null || _d === void 0 ? void 0 : _d(obj, this);
            }
            return obs == null
                ? pd.configurable
                    ? ComputedObserver.create(obj, key, pd, this, /* AOT: not true for IE11 */ true)
                    : this.dirtyChecker.createProperty(obj, key)
                : obs;
        }
        // Ordinary get/set observation (the common use case)
        // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
        return new SetterObserver(obj, key);
    }
    getAdapterObserver(obj, propertyName, pd) {
        if (this.adapters.length > 0) {
            for (const adapter of this.adapters) {
                const observer = adapter.getObserver(obj, propertyName, pd, this);
                if (observer != null) {
                    return observer;
                }
            }
        }
        return null;
    }
    cache(obj, key, observer) {
        if (observer.doNotCache === true) {
            return observer;
        }
        if (obj.$observers === void 0) {
            def(obj, '$observers', { value: { [key]: observer } });
            return observer;
        }
        return obj.$observers[key] = observer;
    }
}
ObserverLocator.inject = [IDirtyChecker, INodeObserverLocator];
function getCollectionObserver$1(collection) {
    let obs;
    if (collection instanceof Array) {
        obs = getArrayObserver(collection);
    }
    else if (collection instanceof Map) {
        obs = getMapObserver(collection);
    }
    else if (collection instanceof Set) {
        obs = getSetObserver(collection);
    }
    return obs;
}

DI.createInterface('IObservation', x => x.singleton(Observation));
class Observation {
    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }
    static get inject() { return [IObserverLocator]; }
    /**
     * Run an effect function an track the dependencies inside it,
     * to re-run whenever a dependency has changed
     */
    run(fn) {
        const effect = new Effect(this.observerLocator, fn);
        // todo: batch effect run after it's in
        effect.run();
        return effect;
    }
}
class Effect {
    constructor(observerLocator, fn) {
        this.observerLocator = observerLocator;
        this.fn = fn;
        this.interceptor = this;
        // to configure this, potentially a 2nd parameter is needed for run
        this.maxRunCount = 10;
        this.queued = false;
        this.running = false;
        this.runCount = 0;
        this.stopped = false;
    }
    handleChange() {
        this.queued = true;
        this.run();
    }
    handleCollectionChange() {
        this.queued = true;
        this.run();
    }
    run() {
        if (this.stopped) {
            throw new Error('Effect has already been stopped');
        }
        if (this.running) {
            return;
        }
        ++this.runCount;
        this.running = true;
        this.queued = false;
        ++this.obs.version;
        try {
            enterConnectable(this);
            this.fn(this);
        }
        finally {
            this.obs.clear(false);
            this.running = false;
            exitConnectable(this);
        }
        // when doing this.fn(this), there's a chance that it has recursive effect
        // continue to run for a certain number before bailing
        // whenever there's a dependency change while running, this.queued will be true
        // so we use it as an indicator to continue to run the effect
        if (this.queued) {
            if (this.runCount > this.maxRunCount) {
                this.runCount = 0;
                throw new Error('Maximum number of recursive effect run reached. Consider handle effect dependencies differently.');
            }
            this.run();
        }
        else {
            this.runCount = 0;
        }
    }
    stop() {
        this.stopped = true;
        this.obs.clear(true);
    }
}
connectable(Effect);

(undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function bindable(configOrTarget, prop) {
    let config;
    function decorator($target, $prop) {
        if (arguments.length > 1) {
            // Non invocation:
            // - @bindable
            // Invocation with or w/o opts:
            // - @bindable()
            // - @bindable({...opts})
            config.property = $prop;
        }
        Metadata.define(Bindable.name, BindableDefinition.create($prop, config), $target.constructor, $prop);
        Protocol.annotation.appendTo($target.constructor, Bindable.keyFrom($prop));
    }
    if (arguments.length > 1) {
        // Non invocation:
        // - @bindable
        config = {};
        decorator(configOrTarget, prop);
        return;
    }
    else if (typeof configOrTarget === 'string') {
        // ClassDecorator
        // - @bindable('bar')
        // Direct call:
        // - @bindable('bar')(Foo)
        config = {};
        return decorator;
    }
    // Invocation with or w/o opts:
    // - @bindable()
    // - @bindable({...opts})
    config = configOrTarget === void 0 ? {} : configOrTarget;
    return decorator;
}
function isBindableAnnotation(key) {
    return key.startsWith(Bindable.name);
}
const Bindable = {
    name: Protocol.annotation.keyFor('bindable'),
    keyFrom(name) {
        return `${Bindable.name}:${name}`;
    },
    from(...bindableLists) {
        const bindables = {};
        const isArray = Array.isArray;
        function addName(name) {
            bindables[name] = BindableDefinition.create(name);
        }
        function addDescription(name, def) {
            bindables[name] = def instanceof BindableDefinition ? def : BindableDefinition.create(name, def);
        }
        function addList(maybeList) {
            if (isArray(maybeList)) {
                maybeList.forEach(addName);
            }
            else if (maybeList instanceof BindableDefinition) {
                bindables[maybeList.property] = maybeList;
            }
            else if (maybeList !== void 0) {
                Object.keys(maybeList).forEach(name => addDescription(name, maybeList[name]));
            }
        }
        bindableLists.forEach(addList);
        return bindables;
    },
    for(Type) {
        let def;
        const builder = {
            add(configOrProp) {
                let prop;
                let config;
                if (typeof configOrProp === 'string') {
                    prop = configOrProp;
                    config = { property: prop };
                }
                else {
                    prop = configOrProp.property;
                    config = configOrProp;
                }
                def = BindableDefinition.create(prop, config);
                if (!Metadata.hasOwn(Bindable.name, Type, prop)) {
                    Protocol.annotation.appendTo(Type, Bindable.keyFrom(prop));
                }
                Metadata.define(Bindable.name, def, Type, prop);
                return builder;
            },
            mode(mode) {
                def.mode = mode;
                return builder;
            },
            callback(callback) {
                def.callback = callback;
                return builder;
            },
            attribute(attribute) {
                def.attribute = attribute;
                return builder;
            },
            primary() {
                def.primary = true;
                return builder;
            },
            set(setInterpreter) {
                def.set = setInterpreter;
                return builder;
            }
        };
        return builder;
    },
    getAll(Type) {
        const propStart = Bindable.name.length + 1;
        const defs = [];
        const prototypeChain = getPrototypeChain(Type);
        let iProto = prototypeChain.length;
        let iDefs = 0;
        let keys;
        let keysLen;
        let Class;
        while (--iProto >= 0) {
            Class = prototypeChain[iProto];
            keys = Protocol.annotation.getKeys(Class).filter(isBindableAnnotation);
            keysLen = keys.length;
            for (let i = 0; i < keysLen; ++i) {
                defs[iDefs++] = Metadata.getOwn(Bindable.name, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
};
class BindableDefinition {
    constructor(attribute, callback, mode, primary, property, set) {
        this.attribute = attribute;
        this.callback = callback;
        this.mode = mode;
        this.primary = primary;
        this.property = property;
        this.set = set;
    }
    static create(prop, def = {}) {
        return new BindableDefinition(firstDefined(def.attribute, kebabCase(prop)), firstDefined(def.callback, `${prop}Changed`), firstDefined(def.mode, BindingMode.toView), firstDefined(def.primary, false), firstDefined(def.property, prop), firstDefined(def.set, noop));
    }
}
/* eslint-enable @typescript-eslint/no-unused-vars,spaced-comment */

class BindableObserver {
    constructor(obj, propertyKey, cbName, set, 
    // todo: a future feature where the observer is not instantiated via a controller
    // this observer can become more static, as in immediately available when used
    // in the form of a decorator
    $controller) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.set = set;
        this.$controller = $controller;
        // todo: name too long. just value/oldValue, or v/oV
        this.value = void 0;
        this.oldValue = void 0;
        this.f = 0 /* none */;
        const cb = obj[cbName];
        const cbAll = obj.propertyChanged;
        const hasCb = this.hasCb = typeof cb === 'function';
        const hasCbAll = this.hasCbAll = typeof cbAll === 'function';
        const hasSetter = this.hasSetter = set !== noop;
        this.cb = hasCb ? cb : noop;
        this.cbAll = hasCbAll ? cbAll : noop;
        // when user declare @bindable({ set })
        // it's expected to work from the start,
        // regardless where the assignment comes from: either direct view model assignment or from binding during render
        // so if either getter/setter config is present, alter the accessor straight await
        if (this.cb === void 0 && !hasCbAll && !hasSetter) {
            this.observing = false;
        }
        else {
            this.observing = true;
            const val = obj[propertyKey];
            this.value = hasSetter && val !== void 0 ? set(val) : val;
            this.createGetterSetter();
        }
    }
    get type() { return 1 /* Observer */; }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        if (this.hasSetter) {
            newValue = this.set(newValue);
        }
        if (this.observing) {
            const currentValue = this.value;
            if (Object.is(newValue, currentValue)) {
                return;
            }
            this.value = newValue;
            this.oldValue = currentValue;
            this.f = flags;
            // todo: controller (if any) state should determine the invocation instead
            if ( /* either not instantiated via a controller */this.$controller == null
                /* or the controller instantiating this is bound */ || this.$controller.isBound) {
                if (this.hasCb) {
                    this.cb.call(this.obj, newValue, currentValue, flags);
                }
                if (this.hasCbAll) {
                    this.cbAll.call(this.obj, this.propertyKey, newValue, currentValue, flags);
                }
            }
            this.queue.add(this);
            // this.subs.notify(newValue, currentValue, flags);
        }
        else {
            // See SetterObserver.setValue for explanation
            this.obj[this.propertyKey] = newValue;
        }
    }
    subscribe(subscriber) {
        if (!this.observing === false) {
            this.observing = true;
            const currentValue = this.obj[this.propertyKey];
            this.value = this.hasSetter
                ? this.set(currentValue)
                : currentValue;
            this.createGetterSetter();
        }
        this.subs.add(subscriber);
    }
    flush() {
        oV$4 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$4, this.f);
    }
    createGetterSetter() {
        Reflect.defineProperty(this.obj, this.propertyKey, {
            enumerable: true,
            configurable: true,
            get: ( /* Bindable Observer */) => this.value,
            set: (/* Bindable Observer */ value) => {
                this.setValue(value, 0 /* none */);
            }
        });
    }
}
subscriberCollection(BindableObserver);
withFlushQueue(BindableObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$4 = void 0;

var __decorate$s = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$o = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/** @internal */
class CharSpec {
    constructor(chars, repeat, isSymbol, isInverted) {
        this.chars = chars;
        this.repeat = repeat;
        this.isSymbol = isSymbol;
        this.isInverted = isInverted;
        if (isInverted) {
            switch (chars.length) {
                case 0:
                    this.has = this.hasOfNoneInverse;
                    break;
                case 1:
                    this.has = this.hasOfSingleInverse;
                    break;
                default:
                    this.has = this.hasOfMultipleInverse;
            }
        }
        else {
            switch (chars.length) {
                case 0:
                    this.has = this.hasOfNone;
                    break;
                case 1:
                    this.has = this.hasOfSingle;
                    break;
                default:
                    this.has = this.hasOfMultiple;
            }
        }
    }
    equals(other) {
        return this.chars === other.chars
            && this.repeat === other.repeat
            && this.isSymbol === other.isSymbol
            && this.isInverted === other.isInverted;
    }
    hasOfMultiple(char) {
        return this.chars.includes(char);
    }
    hasOfSingle(char) {
        return this.chars === char;
    }
    hasOfNone(char) {
        return false;
    }
    hasOfMultipleInverse(char) {
        return !this.chars.includes(char);
    }
    hasOfSingleInverse(char) {
        return this.chars !== char;
    }
    hasOfNoneInverse(char) {
        return true;
    }
}
class Interpretation {
    constructor() {
        this.parts = emptyArray;
        this._pattern = '';
        this.currentRecord = {};
        this.partsRecord = {};
    }
    get pattern() {
        const value = this._pattern;
        if (value === '') {
            return null;
        }
        else {
            return value;
        }
    }
    set pattern(value) {
        if (value == null) {
            this._pattern = '';
            this.parts = emptyArray;
        }
        else {
            this._pattern = value;
            this.parts = this.partsRecord[value];
        }
    }
    append(pattern, ch) {
        const { currentRecord } = this;
        if (currentRecord[pattern] === undefined) {
            currentRecord[pattern] = ch;
        }
        else {
            currentRecord[pattern] += ch;
        }
    }
    next(pattern) {
        const { currentRecord } = this;
        if (currentRecord[pattern] !== undefined) {
            const { partsRecord } = this;
            if (partsRecord[pattern] === undefined) {
                partsRecord[pattern] = [currentRecord[pattern]];
            }
            else {
                partsRecord[pattern].push(currentRecord[pattern]);
            }
            currentRecord[pattern] = undefined;
        }
    }
}
/** @internal */
class State$3 {
    constructor(charSpec, ...patterns) {
        this.charSpec = charSpec;
        this.nextStates = [];
        this.types = null;
        this.isEndpoint = false;
        this.patterns = patterns;
    }
    get pattern() {
        return this.isEndpoint ? this.patterns[0] : null;
    }
    findChild(charSpec) {
        const nextStates = this.nextStates;
        const len = nextStates.length;
        let child = null;
        for (let i = 0; i < len; ++i) {
            child = nextStates[i];
            if (charSpec.equals(child.charSpec)) {
                return child;
            }
        }
        return null;
    }
    append(charSpec, pattern) {
        const { patterns } = this;
        if (!patterns.includes(pattern)) {
            patterns.push(pattern);
        }
        let state = this.findChild(charSpec);
        if (state == null) {
            state = new State$3(charSpec, pattern);
            this.nextStates.push(state);
            if (charSpec.repeat) {
                state.nextStates.push(state);
            }
        }
        return state;
    }
    findMatches(ch, interpretation) {
        // TODO: reuse preallocated arrays
        const results = [];
        const nextStates = this.nextStates;
        const len = nextStates.length;
        let childLen = 0;
        let child = null;
        let i = 0;
        let j = 0;
        for (; i < len; ++i) {
            child = nextStates[i];
            if (child.charSpec.has(ch)) {
                results.push(child);
                childLen = child.patterns.length;
                j = 0;
                if (child.charSpec.isSymbol) {
                    for (; j < childLen; ++j) {
                        interpretation.next(child.patterns[j]);
                    }
                }
                else {
                    for (; j < childLen; ++j) {
                        interpretation.append(child.patterns[j], ch);
                    }
                }
            }
        }
        return results;
    }
}
/** @internal */
class StaticSegment$1 {
    constructor(text) {
        this.text = text;
        const len = this.len = text.length;
        const specs = this.specs = [];
        for (let i = 0; i < len; ++i) {
            specs.push(new CharSpec(text[i], false, false, false));
        }
    }
    eachChar(callback) {
        const { len, specs } = this;
        for (let i = 0; i < len; ++i) {
            callback(specs[i]);
        }
    }
}
/** @internal */
class DynamicSegment$1 {
    constructor(symbols) {
        this.text = 'PART';
        this.spec = new CharSpec(symbols, true, false, true);
    }
    eachChar(callback) {
        callback(this.spec);
    }
}
/** @internal */
class SymbolSegment {
    constructor(text) {
        this.text = text;
        this.spec = new CharSpec(text, false, true, false);
    }
    eachChar(callback) {
        callback(this.spec);
    }
}
/** @internal */
class SegmentTypes {
    constructor() {
        this.statics = 0;
        this.dynamics = 0;
        this.symbols = 0;
    }
}
const ISyntaxInterpreter = DI.createInterface('ISyntaxInterpreter', x => x.singleton(SyntaxInterpreter));
class SyntaxInterpreter {
    constructor() {
        this.rootState = new State$3(null);
        this.initialStates = [this.rootState];
    }
    add(defOrDefs) {
        let i = 0;
        if (Array.isArray(defOrDefs)) {
            const ii = defOrDefs.length;
            for (; i < ii; ++i) {
                this.add(defOrDefs[i]);
            }
            return;
        }
        let currentState = this.rootState;
        const def = defOrDefs;
        const pattern = def.pattern;
        const types = new SegmentTypes();
        const segments = this.parse(def, types);
        const len = segments.length;
        const callback = (ch) => {
            currentState = currentState.append(ch, pattern);
        };
        for (i = 0; i < len; ++i) {
            segments[i].eachChar(callback);
        }
        currentState.types = types;
        currentState.isEndpoint = true;
    }
    interpret(name) {
        const interpretation = new Interpretation();
        let states = this.initialStates;
        const len = name.length;
        for (let i = 0; i < len; ++i) {
            states = this.getNextStates(states, name.charAt(i), interpretation);
            if (states.length === 0) {
                break;
            }
        }
        states.sort((a, b) => {
            if (a.isEndpoint) {
                if (!b.isEndpoint) {
                    return -1;
                }
            }
            else if (b.isEndpoint) {
                return 1;
            }
            else {
                return 0;
            }
            const aTypes = a.types;
            const bTypes = b.types;
            if (aTypes.statics !== bTypes.statics) {
                return bTypes.statics - aTypes.statics;
            }
            if (aTypes.dynamics !== bTypes.dynamics) {
                return bTypes.dynamics - aTypes.dynamics;
            }
            if (aTypes.symbols !== bTypes.symbols) {
                return bTypes.symbols - aTypes.symbols;
            }
            return 0;
        });
        if (states.length > 0) {
            const state = states[0];
            if (!state.charSpec.isSymbol) {
                interpretation.next(state.pattern);
            }
            interpretation.pattern = state.pattern;
        }
        return interpretation;
    }
    getNextStates(states, ch, interpretation) {
        // TODO: reuse preallocated arrays
        const nextStates = [];
        let state = null;
        const len = states.length;
        for (let i = 0; i < len; ++i) {
            state = states[i];
            nextStates.push(...state.findMatches(ch, interpretation));
        }
        return nextStates;
    }
    parse(def, types) {
        const result = [];
        const pattern = def.pattern;
        const len = pattern.length;
        let i = 0;
        let start = 0;
        let c = '';
        while (i < len) {
            c = pattern.charAt(i);
            if (!def.symbols.includes(c)) {
                if (i === start) {
                    if (c === 'P' && pattern.slice(i, i + 4) === 'PART') {
                        start = i = (i + 4);
                        result.push(new DynamicSegment$1(def.symbols));
                        ++types.dynamics;
                    }
                    else {
                        ++i;
                    }
                }
                else {
                    ++i;
                }
            }
            else if (i !== start) {
                result.push(new StaticSegment$1(pattern.slice(start, i)));
                ++types.statics;
                start = i;
            }
            else {
                result.push(new SymbolSegment(pattern.slice(start, i + 1)));
                ++types.symbols;
                start = ++i;
            }
        }
        if (start !== i) {
            result.push(new StaticSegment$1(pattern.slice(start, i)));
            ++types.statics;
        }
        return result;
    }
}
class AttrSyntax {
    constructor(rawName, rawValue, target, command) {
        this.rawName = rawName;
        this.rawValue = rawValue;
        this.target = target;
        this.command = command;
    }
}
const IAttributePattern = DI.createInterface('IAttributePattern');
const IAttributeParser = DI.createInterface('IAttributeParser', x => x.singleton(AttributeParser));
let AttributeParser = class AttributeParser {
    constructor(interpreter, attrPatterns) {
        this.interpreter = interpreter;
        this.cache = {};
        const patterns = this.patterns = {};
        attrPatterns.forEach(attrPattern => {
            const defs = AttributePattern.getPatternDefinitions(attrPattern.constructor);
            interpreter.add(defs);
            defs.forEach(def => {
                patterns[def.pattern] = attrPattern;
            });
        });
    }
    parse(name, value) {
        let interpretation = this.cache[name];
        if (interpretation == null) {
            interpretation = this.cache[name] = this.interpreter.interpret(name);
        }
        const pattern = interpretation.pattern;
        if (pattern == null) {
            return new AttrSyntax(name, value, name, null);
        }
        else {
            return this.patterns[pattern][pattern](name, value, interpretation.parts);
        }
    }
};
AttributeParser = __decorate$s([
    __param$o(0, ISyntaxInterpreter),
    __param$o(1, all(IAttributePattern))
], AttributeParser);
function attributePattern(...patternDefs) {
    return function decorator(target) {
        return AttributePattern.define(patternDefs, target);
    };
}
class AttributePatternResourceDefinition {
    constructor(Type) {
        this.Type = Type;
        this.name = (void 0);
    }
    register(container) {
        Registration.singleton(IAttributePattern, this.Type).register(container);
    }
}
const AttributePattern = Object.freeze({
    name: Protocol.resource.keyFor('attribute-pattern'),
    definitionAnnotationKey: 'attribute-pattern-definitions',
    define(patternDefs, Type) {
        const definition = new AttributePatternResourceDefinition(Type);
        const { name, definitionAnnotationKey } = AttributePattern;
        Metadata.define(name, definition, Type);
        Protocol.resource.appendTo(Type, name);
        Protocol.annotation.set(Type, definitionAnnotationKey, patternDefs);
        Protocol.annotation.appendTo(Type, definitionAnnotationKey);
        return Type;
    },
    getPatternDefinitions(Type) {
        return Protocol.annotation.get(Type, AttributePattern.definitionAnnotationKey);
    }
});
let DotSeparatedAttributePattern = class DotSeparatedAttributePattern {
    'PART.PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], parts[1]);
    }
    'PART.PART.PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], parts[2]);
    }
};
DotSeparatedAttributePattern = __decorate$s([
    attributePattern({ pattern: 'PART.PART', symbols: '.' }, { pattern: 'PART.PART.PART', symbols: '.' })
], DotSeparatedAttributePattern);
let RefAttributePattern = class RefAttributePattern {
    'ref'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, 'element', 'ref');
    }
    'PART.ref'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'ref');
    }
};
RefAttributePattern = __decorate$s([
    attributePattern({ pattern: 'ref', symbols: '' }, { pattern: 'PART.ref', symbols: '.' })
], RefAttributePattern);
let ColonPrefixedBindAttributePattern = class ColonPrefixedBindAttributePattern {
    ':PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'bind');
    }
};
ColonPrefixedBindAttributePattern = __decorate$s([
    attributePattern({ pattern: ':PART', symbols: ':' })
], ColonPrefixedBindAttributePattern);
let AtPrefixedTriggerAttributePattern = class AtPrefixedTriggerAttributePattern {
    '@PART'(rawName, rawValue, parts) {
        return new AttrSyntax(rawName, rawValue, parts[0], 'trigger');
    }
};
AtPrefixedTriggerAttributePattern = __decorate$s([
    attributePattern({ pattern: '@PART', symbols: '@' })
], AtPrefixedTriggerAttributePattern);

class CallBinding {
    constructor(sourceExpression, target, targetProperty, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$hostScope = null;
        this.targetObserver = observerLocator.getObserver(target, targetProperty);
    }
    callSource(args) {
        const overrideContext = this.$scope.overrideContext;
        // really need to delete the following line
        // and the for..in loop below
        // convenience in the template won't outweight the draw back of such confusing feature
        // OR, at the very least, use getter/setter for each property in args to get/set original source
        // ---
        Object.assign(overrideContext, args);
        const result = this.sourceExpression.evaluate(8 /* mustEvaluate */, this.$scope, this.$hostScope, this.locator, null);
        for (const prop in args) {
            Reflect.deleteProperty(overrideContext, prop);
        }
        return result;
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        this.targetObserver.setValue(($args) => this.interceptor.callSource($args), flags, this.target, this.targetProperty);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.targetObserver.setValue(null, flags, this.target, this.targetProperty);
        this.isBound = false;
    }
    observeProperty(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

/**
 * Observer for handling two-way binding with attributes
 * Has different strategy for class/style and normal attributes
 * TODO: handle SVG/attributes with namespace
 */
class AttributeObserver {
    constructor(platform, observerLocator, obj, propertyKey, targetAttribute) {
        this.platform = platform;
        this.observerLocator = observerLocator;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.targetAttribute = targetAttribute;
        this.value = null;
        this.oldValue = null;
        this.hasChanges = false;
        // layout is not certain, depends on the attribute being flushed to owner element
        // but for simple start, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.f = 0 /* none */;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(value, flags) {
        this.value = value;
        this.hasChanges = value !== this.oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.value;
            this.oldValue = currentValue;
            switch (this.targetAttribute) {
                case 'class': {
                    // Why does class attribute observer setValue look different with class attribute accessor?
                    // ==============
                    // For class list
                    // newValue is simply checked if truthy or falsy
                    // and toggle the class accordingly
                    // -- the rule of this is quite different to normal attribute
                    //
                    // for class attribute, observer is different in a way that it only observes one class at a time
                    // this also comes from syntax, where it would typically be my-class.class="someProperty"
                    //
                    // so there is no need for separating class by space and add all of them like class accessor
                    this.obj.classList.toggle(this.propertyKey, !!currentValue);
                    break;
                }
                case 'style': {
                    let priority = '';
                    let newValue = currentValue;
                    if (typeof newValue === 'string' && newValue.includes('!important')) {
                        priority = 'important';
                        newValue = newValue.replace('!important', '');
                    }
                    this.obj.style.setProperty(this.propertyKey, newValue, priority);
                }
            }
        }
    }
    handleMutation(mutationRecords) {
        let shouldProcess = false;
        for (let i = 0, ii = mutationRecords.length; ii > i; ++i) {
            const record = mutationRecords[i];
            if (record.type === 'attributes' && record.attributeName === this.propertyKey) {
                shouldProcess = true;
                break;
            }
        }
        if (shouldProcess) {
            let newValue;
            switch (this.targetAttribute) {
                case 'class':
                    newValue = this.obj.classList.contains(this.propertyKey);
                    break;
                case 'style':
                    newValue = this.obj.style.getPropertyValue(this.propertyKey);
                    break;
                default:
                    throw new Error(`Unsupported targetAttribute: ${this.targetAttribute}`);
            }
            if (newValue !== this.value) {
                this.oldValue = this.value;
                this.value = newValue;
                this.hasChanges = false;
                this.f = 0 /* none */;
                this.queue.add(this);
            }
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.value = this.oldValue = this.obj.getAttribute(this.propertyKey);
            startObservation(this.obj.ownerDocument.defaultView.MutationObserver, this.obj, this);
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            stopObservation(this.obj, this);
        }
    }
    flush() {
        oV$3 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$3, this.f);
    }
}
subscriberCollection(AttributeObserver);
withFlushQueue(AttributeObserver);
const startObservation = ($MutationObserver, element, subscription) => {
    if (element.$eMObservers === undefined) {
        element.$eMObservers = new Set();
    }
    if (element.$mObserver === undefined) {
        (element.$mObserver = new $MutationObserver(handleMutation)).observe(element, { attributes: true });
    }
    element.$eMObservers.add(subscription);
};
const stopObservation = (element, subscription) => {
    const $eMObservers = element.$eMObservers;
    if ($eMObservers && $eMObservers.delete(subscription)) {
        if ($eMObservers.size === 0) {
            element.$mObserver.disconnect();
            element.$mObserver = undefined;
        }
        return true;
    }
    return false;
};
const handleMutation = (mutationRecords) => {
    mutationRecords[0].target.$eMObservers.forEach(invokeHandleMutation, mutationRecords);
};
function invokeHandleMutation(s) {
    s.handleMutation(this);
}
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$3 = void 0;

const IPlatform = IPlatform$1;

/**
 * A subscriber that is used for subcribing to target observer & invoking `updateSource` on a binding
 */
class BindingTargetSubscriber {
    constructor(b) {
        this.b = b;
    }
    // deepscan-disable-next-line
    handleChange(value, _, flags) {
        const b = this.b;
        if (value !== b.sourceExpression.evaluate(flags, b.$scope, b.$hostScope, b.locator, null)) {
            b.updateSource(value, flags);
        }
    }
}

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime: oneTime$1, toView: toView$2, fromView: fromView$1 } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime$1 = toView$2 | oneTime$1;
const taskOptions = {
    reusable: false,
    preempt: true,
};
/**
 * Attribute binding. Handle attribute binding betwen view/view model. Understand Html special attributes
 */
class AttributeBinding {
    constructor(sourceExpression, target, 
    // some attributes may have inner structure
    // such as class -> collection of class names
    // such as style -> collection of style rules
    //
    // for normal attributes, targetAttribute and targetProperty are the same and can be ignore
    targetAttribute, targetProperty, mode, observerLocator, locator) {
        this.sourceExpression = sourceExpression;
        this.targetAttribute = targetAttribute;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = null;
        this.$hostScope = null;
        this.task = null;
        this.targetSubscriber = null;
        this.persistentFlags = 0 /* none */;
        this.value = void 0;
        this.target = target;
        this.$platform = locator.get(IPlatform);
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags, this.target, this.targetProperty);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, value);
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        flags |= this.persistentFlags;
        const mode = this.mode;
        const interceptor = this.interceptor;
        const sourceExpression = this.sourceExpression;
        const $scope = this.$scope;
        const locator = this.locator;
        const targetObserver = this.targetObserver;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        if (sourceExpression.$kind !== 10082 /* AccessScope */ || this.obs.count > 1) {
            const shouldConnect = (mode & oneTime$1) === 0;
            if (shouldConnect) {
                this.obs.version++;
            }
            newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator, interceptor);
            if (shouldConnect) {
                this.obs.clear(false);
            }
        }
        let task;
        if (newValue !== this.value) {
            this.value = newValue;
            if (shouldQueueFlush) {
                // Queue the new one before canceling the old one, to prevent early yield
                task = this.task;
                this.task = this.$platform.domWriteQueue.queueTask(() => {
                    this.task = null;
                    interceptor.updateTarget(newValue, flags);
                }, taskOptions);
                task === null || task === void 0 ? void 0 : task.cancel();
            }
            else {
                interceptor.updateTarget(newValue, flags);
            }
        }
    }
    $bind(flags, scope, hostScope, projection) {
        var _a;
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        // Store flags which we can only receive during $bind and need to pass on
        // to the AST during evaluate/connect/assign
        this.persistentFlags = flags & 961 /* persistentBindingFlags */;
        this.$scope = scope;
        this.$hostScope = hostScope;
        this.projection = projection;
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            targetObserver = this.targetObserver = new AttributeObserver(this.$platform, this.observerLocator, this.target, this.targetProperty, this.targetAttribute);
        }
        // during bind, binding behavior might have changed sourceExpression
        sourceExpression = this.sourceExpression;
        const $mode = this.mode;
        const interceptor = this.interceptor;
        if ($mode & toViewOrOneTime$1) {
            const shouldConnect = ($mode & toView$2) > 0;
            interceptor.updateTarget(this.value = sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator, shouldConnect ? interceptor : null), flags);
        }
        if ($mode & fromView$1) {
            targetObserver.subscribe((_a = this.targetSubscriber) !== null && _a !== void 0 ? _a : (this.targetSubscriber = new BindingTargetSubscriber(interceptor)));
        }
        this.isBound = true;
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        // clear persistent flags
        this.persistentFlags = 0 /* none */;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope
            = this.$hostScope
                = null;
        this.value = void 0;
        if (this.targetSubscriber) {
            this.targetObserver.unsubscribe(this.targetSubscriber);
        }
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        this.obs.clear(true);
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
}
connectable(AttributeBinding);

const { toView: toView$1 } = BindingMode;
const queueTaskOptions = {
    reusable: false,
    preempt: true,
};
// a pseudo binding to manage multiple InterpolationBinding s
// ========
// Note: the child expressions of an Interpolation expression are full Aurelia expressions, meaning they may include
// value converters and binding behaviors.
// Each expression represents one ${interpolation}, and for each we create a child TextBinding unless there is only one,
// in which case the renderer will create the TextBinding directly
class InterpolationBinding {
    constructor(observerLocator, interpolation, target, targetProperty, mode, locator, taskQueue) {
        this.observerLocator = observerLocator;
        this.interpolation = interpolation;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.locator = locator;
        this.taskQueue = taskQueue;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.task = null;
        this.targetObserver = observerLocator.getAccessor(target, targetProperty);
        const expressions = interpolation.expressions;
        const partBindings = this.partBindings = Array(expressions.length);
        for (let i = 0, ii = expressions.length; i < ii; ++i) {
            partBindings[i] = new InterpolationPartBinding(expressions[i], target, targetProperty, locator, observerLocator, this);
        }
    }
    updateTarget(value, flags) {
        const partBindings = this.partBindings;
        const staticParts = this.interpolation.parts;
        const ii = partBindings.length;
        let result = '';
        if (ii === 1) {
            result = staticParts[0] + partBindings[0].value + staticParts[1];
        }
        else {
            result = staticParts[0];
            for (let i = 0; ii > i; ++i) {
                result += partBindings[i].value + staticParts[i + 1];
            }
        }
        const targetObserver = this.targetObserver;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        if (shouldQueueFlush) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            this.task = this.taskQueue.queueTask(() => {
                this.task = null;
                targetObserver.setValue(result, flags, this.target, this.targetProperty);
            }, queueTaskOptions);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            targetObserver.setValue(result, flags, this.target, this.targetProperty);
        }
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        const partBindings = this.partBindings;
        for (let i = 0, ii = partBindings.length; ii > i; ++i) {
            partBindings[i].$bind(flags, scope, hostScope);
        }
        this.updateTarget(void 0, flags);
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.$scope = void 0;
        const partBindings = this.partBindings;
        for (let i = 0, ii = partBindings.length; i < ii; ++i) {
            partBindings[i].interceptor.$unbind(flags);
        }
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
}
class InterpolationPartBinding {
    constructor(sourceExpression, target, targetProperty, locator, observerLocator, owner) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.owner = owner;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = BindingMode.toView;
        this.value = '';
        this.$hostScope = null;
        this.task = null;
        this.isBound = false;
    }
    handleChange(newValue, oldValue, flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const obsRecord = this.obs;
        const canOptimize = sourceExpression.$kind === 10082 /* AccessScope */ && obsRecord.count === 1;
        if (!canOptimize) {
            const shouldConnect = (this.mode & toView$1) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (newValue != this.value) {
            this.value = newValue;
            if (newValue instanceof Array) {
                this.observeCollection(newValue);
            }
            this.owner.updateTarget(newValue, flags);
        }
    }
    handleCollectionChange(indexMap, flags) {
        this.owner.updateTarget(void 0, flags);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const v = this.value = this.sourceExpression.evaluate(flags, scope, hostScope, this.locator, (this.mode & toView$1) > 0 ? this.interceptor : null);
        if (v instanceof Array) {
            this.observeCollection(v);
        }
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        this.obs.clear(true);
    }
}
connectable(InterpolationPartBinding);
/**
 * A binding for handling the element content interpolation
 */
class ContentBinding {
    constructor(sourceExpression, target, locator, observerLocator, p) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.p = p;
        this.interceptor = this;
        // at runtime, mode may be overriden by binding behavior
        // but it wouldn't matter here, just start with something for later check
        this.mode = BindingMode.toView;
        this.value = '';
        this.$hostScope = null;
        this.task = null;
        this.isBound = false;
    }
    updateTarget(value, flags) {
        var _a, _b;
        const target = this.target;
        const NodeCtor = this.p.Node;
        const oldValue = this.value;
        this.value = value;
        if (oldValue instanceof NodeCtor) {
            (_a = oldValue.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(oldValue);
        }
        if (value instanceof NodeCtor) {
            target.textContent = '';
            (_b = target.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(value, target);
        }
        else {
            target.textContent = String(value);
        }
    }
    handleChange(newValue, oldValue, flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        const obsRecord = this.obs;
        const canOptimize = sourceExpression.$kind === 10082 /* AccessScope */ && obsRecord.count === 1;
        if (!canOptimize) {
            const shouldConnect = (this.mode & toView$1) > 0;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, shouldConnect ? this.interceptor : null);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (newValue === this.value) {
            // in a frequent update, e.g collection mutation in a loop
            // value could be changing frequently and previous update task may be stale at this point
            // cancel if any task going on because the latest value is already the same
            (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
            this.task = null;
            return;
        }
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start().wait()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0;
        if (shouldQueueFlush) {
            this.queueUpdate(newValue, flags);
        }
        else {
            this.updateTarget(newValue, flags);
        }
    }
    handleCollectionChange() {
        this.queueUpdate(String(this.value), 0 /* none */);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags);
        }
        this.isBound = true;
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const v = this.value = this.sourceExpression.evaluate(flags, scope, hostScope, this.locator, (this.mode & toView$1) > 0 ? this.interceptor : null);
        if (v instanceof Array) {
            this.observeCollection(v);
        }
        this.updateTarget(v, flags);
    }
    $unbind(flags) {
        var _a;
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        // TODO: should existing value (either connected node, or a string)
        // be removed when this binding is unbound?
        // this.updateTarget('', flags);
        this.$scope = void 0;
        this.$hostScope = null;
        this.obs.clear(true);
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
    queueUpdate(newValue, flags) {
        const task = this.task;
        this.task = this.p.domWriteQueue.queueTask(() => {
            this.task = null;
            this.updateTarget(newValue, flags);
        }, queueTaskOptions);
        task === null || task === void 0 ? void 0 : task.cancel();
    }
}
connectable(ContentBinding);

class LetBinding {
    constructor(sourceExpression, targetProperty, observerLocator, locator, toBindingContext = false) {
        this.sourceExpression = sourceExpression;
        this.targetProperty = targetProperty;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.toBindingContext = toBindingContext;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.task = null;
        this.target = null;
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        const target = this.target;
        const targetProperty = this.targetProperty;
        const previousValue = target[targetProperty];
        this.obs.version++;
        newValue = this.sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, this.interceptor);
        this.obs.clear(false);
        if (newValue !== previousValue) {
            target[targetProperty] = newValue;
        }
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        this.target = (this.toBindingContext ? (hostScope !== null && hostScope !== void 0 ? hostScope : scope).bindingContext : (hostScope !== null && hostScope !== void 0 ? hostScope : scope).overrideContext);
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        // sourceExpression might have been changed during bind
        this.target[this.targetProperty]
            = this.sourceExpression.evaluate(flags | 2 /* fromBind */, scope, hostScope, this.locator, this.interceptor);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        this.obs.clear(true);
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
}
connectable(LetBinding);

// BindingMode is not a const enum (and therefore not inlined), so assigning them to a variable to save a member accessor is a minor perf tweak
const { oneTime, toView, fromView } = BindingMode;
// pre-combining flags for bitwise checks is a minor perf tweak
const toViewOrOneTime = toView | oneTime;
const updateTaskOpts = {
    reusable: false,
    preempt: true,
};
class PropertyBinding {
    constructor(sourceExpression, target, targetProperty, mode, observerLocator, locator, taskQueue) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.targetProperty = targetProperty;
        this.mode = mode;
        this.observerLocator = observerLocator;
        this.locator = locator;
        this.taskQueue = taskQueue;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
        this.targetObserver = void 0;
        this.persistentFlags = 0 /* none */;
        this.task = null;
        this.targetSubscriber = null;
    }
    updateTarget(value, flags) {
        flags |= this.persistentFlags;
        this.targetObserver.setValue(value, flags, this.target, this.targetProperty);
    }
    updateSource(value, flags) {
        flags |= this.persistentFlags;
        this.sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, value);
    }
    handleChange(newValue, _previousValue, flags) {
        if (!this.isBound) {
            return;
        }
        flags |= this.persistentFlags;
        const targetObserver = this.targetObserver;
        const interceptor = this.interceptor;
        const sourceExpression = this.sourceExpression;
        const $scope = this.$scope;
        const locator = this.locator;
        // Alpha: during bind a simple strategy for bind is always flush immediately
        // todo:
        //  (1). determine whether this should be the behavior
        //  (2). if not, then fix tests to reflect the changes/platform to properly yield all with aurelia.start()
        const shouldQueueFlush = (flags & 2 /* fromBind */) === 0 && (targetObserver.type & 4 /* Layout */) > 0;
        const obsRecord = this.obs;
        // if the only observable is an AccessScope then we can assume the passed-in newValue is the correct and latest value
        if (sourceExpression.$kind !== 10082 /* AccessScope */ || obsRecord.count > 1) {
            // todo: in VC expressions, from view also requires connect
            const shouldConnect = this.mode > oneTime;
            if (shouldConnect) {
                obsRecord.version++;
            }
            newValue = sourceExpression.evaluate(flags, $scope, this.$hostScope, locator, interceptor);
            if (shouldConnect) {
                obsRecord.clear(false);
            }
        }
        if (shouldQueueFlush) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            this.task = this.taskQueue.queueTask(() => {
                interceptor.updateTarget(newValue, flags);
                this.task = null;
            }, updateTaskOpts);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            interceptor.updateTarget(newValue, flags);
        }
    }
    $bind(flags, scope, hostScope) {
        var _a;
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        // Force property binding to always be strict
        flags |= 1 /* isStrictBindingStrategy */;
        // Store flags which we can only receive during $bind and need to pass on
        // to the AST during evaluate/connect/assign
        this.persistentFlags = flags & 961 /* persistentBindingFlags */;
        this.$scope = scope;
        this.$hostScope = hostScope;
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        const $mode = this.mode;
        let targetObserver = this.targetObserver;
        if (!targetObserver) {
            const observerLocator = this.observerLocator;
            if ($mode & fromView) {
                targetObserver = observerLocator.getObserver(this.target, this.targetProperty);
            }
            else {
                targetObserver = observerLocator.getAccessor(this.target, this.targetProperty);
            }
            this.targetObserver = targetObserver;
        }
        // during bind, binding behavior might have changed sourceExpression
        // deepscan-disable-next-line
        sourceExpression = this.sourceExpression;
        const interceptor = this.interceptor;
        const shouldConnect = ($mode & toView) > 0;
        if ($mode & toViewOrOneTime) {
            interceptor.updateTarget(sourceExpression.evaluate(flags, scope, this.$hostScope, this.locator, shouldConnect ? interceptor : null), flags);
        }
        if ($mode & fromView) {
            targetObserver.subscribe((_a = this.targetSubscriber) !== null && _a !== void 0 ? _a : (this.targetSubscriber = new BindingTargetSubscriber(interceptor)));
            if (!shouldConnect) {
                interceptor.updateSource(targetObserver.getValue(this.target, this.targetProperty), flags);
            }
        }
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        this.persistentFlags = 0 /* none */;
        if (this.sourceExpression.hasUnbind) {
            this.sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        const task = this.task;
        if (this.targetSubscriber) {
            this.targetObserver.unsubscribe(this.targetSubscriber);
        }
        if (task != null) {
            task.cancel();
            this.task = null;
        }
        this.obs.clear(true);
        this.isBound = false;
    }
}
connectable(PropertyBinding);

class RefBinding {
    constructor(sourceExpression, target, locator) {
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$scope = void 0;
        this.$hostScope = null;
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        if (this.sourceExpression.hasBind) {
            this.sourceExpression.bind(flags, scope, hostScope, this);
        }
        this.sourceExpression.assign(flags, this.$scope, hostScope, this.locator, this.target);
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        let sourceExpression = this.sourceExpression;
        if (sourceExpression.evaluate(flags, this.$scope, this.$hostScope, this.locator, null) === this.target) {
            sourceExpression.assign(flags, this.$scope, this.$hostScope, this.locator, null);
        }
        // source expression might have been modified durring assign, via a BB
        // deepscan-disable-next-line
        sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = void 0;
        this.$hostScope = null;
        this.isBound = false;
    }
    observeProperty(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

const IAppTask = DI.createInterface('IAppTask');

var __decorate$r = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function isChildrenObserverAnnotation(key) {
    return key.startsWith(Children.name);
}
const Children = {
    name: Protocol.annotation.keyFor('children-observer'),
    keyFrom(name) {
        return `${Children.name}:${name}`;
    },
    from(...childrenObserverLists) {
        const childrenObservers = {};
        const isArray = Array.isArray;
        function addName(name) {
            childrenObservers[name] = ChildrenDefinition.create(name);
        }
        function addDescription(name, def) {
            childrenObservers[name] = ChildrenDefinition.create(name, def);
        }
        function addList(maybeList) {
            if (isArray(maybeList)) {
                maybeList.forEach(addName);
            }
            else if (maybeList instanceof ChildrenDefinition) {
                childrenObservers[maybeList.property] = maybeList;
            }
            else if (maybeList !== void 0) {
                Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
            }
        }
        childrenObserverLists.forEach(addList);
        return childrenObservers;
    },
    getAll(Type) {
        const propStart = Children.name.length + 1;
        const defs = [];
        const prototypeChain = getPrototypeChain(Type);
        let iProto = prototypeChain.length;
        let iDefs = 0;
        let keys;
        let keysLen;
        let Class;
        while (--iProto >= 0) {
            Class = prototypeChain[iProto];
            keys = Protocol.annotation.getKeys(Class).filter(isChildrenObserverAnnotation);
            keysLen = keys.length;
            for (let i = 0; i < keysLen; ++i) {
                defs[iDefs++] = Metadata.getOwn(Children.name, Class, keys[i].slice(propStart));
            }
        }
        return defs;
    },
};
const childObserverOptions$1 = { childList: true };
class ChildrenDefinition {
    constructor(callback, property, options, query, filter, map) {
        this.callback = callback;
        this.property = property;
        this.options = options;
        this.query = query;
        this.filter = filter;
        this.map = map;
    }
    static create(prop, def = {}) {
        var _a;
        return new ChildrenDefinition(firstDefined(def.callback, `${prop}Changed`), firstDefined(def.property, prop), (_a = def.options) !== null && _a !== void 0 ? _a : childObserverOptions$1, def.query, def.filter, def.map);
    }
}
/** @internal */
let ChildrenObserver = class ChildrenObserver {
    constructor(controller, obj, propertyKey, cbName, query = defaultChildQuery, filter = defaultChildFilter, map = defaultChildMap, options) {
        this.controller = controller;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.query = query;
        this.filter = filter;
        this.map = map;
        this.options = options;
        this.observing = false;
        this.children = (void 0);
        this.callback = obj[cbName];
        Reflect.defineProperty(this.obj, this.propertyKey, {
            enumerable: true,
            configurable: true,
            get: () => this.getValue(),
            set: () => { return; },
        });
    }
    getValue() {
        this.tryStartObserving();
        return this.children;
    }
    setValue(newValue) { }
    subscribe(subscriber) {
        this.tryStartObserving();
        this.subs.add(subscriber);
    }
    tryStartObserving() {
        if (!this.observing) {
            this.observing = true;
            this.children = filterChildren(this.controller, this.query, this.filter, this.map);
            const obs = new this.controller.host.ownerDocument.defaultView.MutationObserver(() => { this.onChildrenChanged(); });
            obs.observe(this.controller.host, this.options);
        }
    }
    onChildrenChanged() {
        this.children = filterChildren(this.controller, this.query, this.filter, this.map);
        if (this.callback !== void 0) {
            this.callback.call(this.obj);
        }
        this.subs.notify(this.children, undefined, 0 /* none */);
    }
};
ChildrenObserver = __decorate$r([
    subscriberCollection()
], ChildrenObserver);
function defaultChildQuery(controller) {
    return controller.host.childNodes;
}
function defaultChildFilter(node, controller, viewModel) {
    return !!viewModel;
}
function defaultChildMap(node, controller, viewModel) {
    return viewModel;
}
const forOpts = { optional: true };
/** @internal */
function filterChildren(controller, query, filter, map) {
    var _a;
    const nodes = query(controller);
    const children = [];
    for (let i = 0, ii = nodes.length; i < ii; ++i) {
        const node = nodes[i];
        const $controller = CustomElement.for(node, forOpts);
        const viewModel = (_a = $controller === null || $controller === void 0 ? void 0 : $controller.viewModel) !== null && _a !== void 0 ? _a : null;
        if (filter(node, $controller, viewModel)) {
            children.push(map(node, $controller, viewModel));
        }
    }
    return children;
}

const noDefinitions = emptyArray;
const Watch = {
    name: Protocol.annotation.keyFor('watch'),
    add(Type, definition) {
        let watchDefinitions = Metadata.getOwn(Watch.name, Type);
        if (watchDefinitions == null) {
            Metadata.define(Watch.name, watchDefinitions = [], Type);
        }
        watchDefinitions.push(definition);
    },
    getAnnotation(Type) {
        var _a;
        return (_a = Metadata.getOwn(Watch.name, Type)) !== null && _a !== void 0 ? _a : noDefinitions;
    },
};

function customElement(nameOrDef) {
    return function (target) {
        return CustomElement.define(nameOrDef, target);
    };
}
const definitionLookup = new WeakMap();
class CustomElementDefinition {
    constructor(Type, name, aliases, key, cache, template, instructions, dependencies, injectable, needsCompile, surrogates, bindables, childrenObservers, containerless, isStrictBinding, shadowOptions, hasSlots, enhance, projectionsMap, watches, processContent) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.cache = cache;
        this.template = template;
        this.instructions = instructions;
        this.dependencies = dependencies;
        this.injectable = injectable;
        this.needsCompile = needsCompile;
        this.surrogates = surrogates;
        this.bindables = bindables;
        this.childrenObservers = childrenObservers;
        this.containerless = containerless;
        this.isStrictBinding = isStrictBinding;
        this.shadowOptions = shadowOptions;
        this.hasSlots = hasSlots;
        this.enhance = enhance;
        this.projectionsMap = projectionsMap;
        this.watches = watches;
        this.processContent = processContent;
    }
    static create(nameOrDef, Type = null) {
        if (Type === null) {
            const def = nameOrDef;
            if (typeof def === 'string') {
                throw new Error(`Cannot create a custom element definition with only a name and no type: ${nameOrDef}`);
            }
            const name = fromDefinitionOrDefault('name', def, CustomElement.generateName);
            if (typeof def.Type === 'function') {
                // This needs to be a clone (it will usually be the compiler calling this signature)
                // TODO: we need to make sure it's documented that passing in the type via the definition (while passing in null
                // as the "Type" parameter) effectively skips type analysis, so it should only be used this way for cloning purposes.
                Type = def.Type;
            }
            else {
                Type = CustomElement.generateType(pascalCase(name));
            }
            return new CustomElementDefinition(Type, name, mergeArrays(def.aliases), fromDefinitionOrDefault('key', def, () => CustomElement.keyFrom(name)), fromDefinitionOrDefault('cache', def, () => 0), fromDefinitionOrDefault('template', def, () => null), mergeArrays(def.instructions), mergeArrays(def.dependencies), fromDefinitionOrDefault('injectable', def, () => null), fromDefinitionOrDefault('needsCompile', def, () => true), mergeArrays(def.surrogates), Bindable.from(def.bindables), Children.from(def.childrenObservers), fromDefinitionOrDefault('containerless', def, () => false), fromDefinitionOrDefault('isStrictBinding', def, () => false), fromDefinitionOrDefault('shadowOptions', def, () => null), fromDefinitionOrDefault('hasSlots', def, () => false), fromDefinitionOrDefault('enhance', def, () => false), fromDefinitionOrDefault('projectionsMap', def, () => new Map()), fromDefinitionOrDefault('watches', def, () => emptyArray), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // If a type is passed in, we ignore the Type property on the definition if it exists.
        // TODO: document this behavior
        if (typeof nameOrDef === 'string') {
            return new CustomElementDefinition(Type, nameOrDef, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), Type.aliases), CustomElement.keyFrom(nameOrDef), fromAnnotationOrTypeOrDefault('cache', Type, () => 0), fromAnnotationOrTypeOrDefault('template', Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), Type.dependencies), fromAnnotationOrTypeOrDefault('injectable', Type, () => null), fromAnnotationOrTypeOrDefault('needsCompile', Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers), fromAnnotationOrTypeOrDefault('containerless', Type, () => false), fromAnnotationOrTypeOrDefault('isStrictBinding', Type, () => false), fromAnnotationOrTypeOrDefault('shadowOptions', Type, () => null), fromAnnotationOrTypeOrDefault('hasSlots', Type, () => false), fromAnnotationOrTypeOrDefault('enhance', Type, () => false), fromAnnotationOrTypeOrDefault('projectionsMap', Type, () => new Map()), mergeArrays(Watch.getAnnotation(Type), Type.watches), fromAnnotationOrTypeOrDefault('processContent', Type, () => null));
        }
        // This is the typical default behavior, e.g. from regular CustomElement.define invocations or from @customElement deco
        // The ViewValueConverter also uses this signature and passes in a definition where everything except for the 'hooks'
        // property needs to be copied. So we have that exception for 'hooks', but we may need to revisit that default behavior
        // if this turns out to be too opinionated.
        const name = fromDefinitionOrDefault('name', nameOrDef, CustomElement.generateName);
        return new CustomElementDefinition(Type, name, mergeArrays(CustomElement.getAnnotation(Type, 'aliases'), nameOrDef.aliases, Type.aliases), CustomElement.keyFrom(name), fromAnnotationOrDefinitionOrTypeOrDefault('cache', nameOrDef, Type, () => 0), fromAnnotationOrDefinitionOrTypeOrDefault('template', nameOrDef, Type, () => null), mergeArrays(CustomElement.getAnnotation(Type, 'instructions'), nameOrDef.instructions, Type.instructions), mergeArrays(CustomElement.getAnnotation(Type, 'dependencies'), nameOrDef.dependencies, Type.dependencies), fromAnnotationOrDefinitionOrTypeOrDefault('injectable', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('needsCompile', nameOrDef, Type, () => true), mergeArrays(CustomElement.getAnnotation(Type, 'surrogates'), nameOrDef.surrogates, Type.surrogates), Bindable.from(...Bindable.getAll(Type), CustomElement.getAnnotation(Type, 'bindables'), Type.bindables, nameOrDef.bindables), Children.from(...Children.getAll(Type), CustomElement.getAnnotation(Type, 'childrenObservers'), Type.childrenObservers, nameOrDef.childrenObservers), fromAnnotationOrDefinitionOrTypeOrDefault('containerless', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('isStrictBinding', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('shadowOptions', nameOrDef, Type, () => null), fromAnnotationOrDefinitionOrTypeOrDefault('hasSlots', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('enhance', nameOrDef, Type, () => false), fromAnnotationOrDefinitionOrTypeOrDefault('projectionsMap', nameOrDef, Type, () => new Map()), mergeArrays(nameOrDef.watches, Watch.getAnnotation(Type), Type.watches), fromAnnotationOrDefinitionOrTypeOrDefault('processContent', nameOrDef, Type, () => null));
    }
    static getOrCreate(partialDefinition) {
        if (partialDefinition instanceof CustomElementDefinition) {
            return partialDefinition;
        }
        if (definitionLookup.has(partialDefinition)) {
            return definitionLookup.get(partialDefinition);
        }
        const definition = CustomElementDefinition.create(partialDefinition);
        definitionLookup.set(partialDefinition, definition);
        // Make sure the full definition can be retrieved from dynamically created classes as well
        Metadata.define(CustomElement.name, definition, definition.Type);
        return definition;
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.transient(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, CustomElement, key, container);
    }
}
const defaultForOpts = {
    name: undefined,
    searchParents: false,
    optional: false,
};
const CustomElement = {
    name: Protocol.resource.keyFor('custom-element'),
    keyFrom(name) {
        return `${CustomElement.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(CustomElement.name, value);
    },
    for(node, opts = defaultForOpts) {
        if (opts.name === void 0 && opts.searchParents !== true) {
            const controller = getRef(node, CustomElement.name);
            if (controller === null) {
                if (opts.optional === true) {
                    return null;
                }
                throw new Error(`The provided node is not a custom element or containerless host.`);
            }
            return controller;
        }
        if (opts.name !== void 0) {
            if (opts.searchParents !== true) {
                const controller = getRef(node, CustomElement.name);
                if (controller === null) {
                    throw new Error(`The provided node is not a custom element or containerless host.`);
                }
                if (controller.is(opts.name)) {
                    return controller;
                }
                return (void 0);
            }
            let cur = node;
            let foundAController = false;
            while (cur !== null) {
                const controller = getRef(cur, CustomElement.name);
                if (controller !== null) {
                    foundAController = true;
                    if (controller.is(opts.name)) {
                        return controller;
                    }
                }
                cur = getEffectiveParentNode(cur);
            }
            if (foundAController) {
                return (void 0);
            }
            throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
        }
        let cur = node;
        while (cur !== null) {
            const controller = getRef(cur, CustomElement.name);
            if (controller !== null) {
                return controller;
            }
            cur = getEffectiveParentNode(cur);
        }
        throw new Error(`The provided node does does not appear to be part of an Aurelia app DOM tree, or it was added to the DOM in a way that Aurelia cannot properly resolve its position in the component tree.`);
    },
    define(nameOrDef, Type) {
        const definition = CustomElementDefinition.create(nameOrDef, Type);
        Metadata.define(CustomElement.name, definition, definition.Type);
        Metadata.define(CustomElement.name, definition, definition);
        Protocol.resource.appendTo(definition.Type, CustomElement.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(CustomElement.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
    generateName: (function () {
        let id = 0;
        return function () {
            return `unnamed-${++id}`;
        };
    })(),
    createInjectable() {
        const $injectable = function (target, property, index) {
            const annotationParamtypes = DI.getOrCreateAnnotationParamTypes(target);
            annotationParamtypes[index] = $injectable;
            return target;
        };
        $injectable.register = function (container) {
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            return {
                resolve(container, requestor) {
                    if (requestor.has($injectable, true)) {
                        return requestor.get($injectable);
                    }
                    else {
                        return null;
                    }
                },
            };
        };
        return $injectable;
    },
    generateType: (function () {
        const nameDescriptor = {
            value: '',
            writable: false,
            enumerable: false,
            configurable: true,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const defaultProto = {};
        return function (name, proto = defaultProto) {
            // Anonymous class ensures that minification cannot cause unintended side-effects, and keeps the class
            // looking similarly from the outside (when inspected via debugger, etc).
            const Type = class {
            };
            // Define the name property so that Type.name can be used by end users / plugin authors if they really need to,
            // even when minified.
            nameDescriptor.value = name;
            Reflect.defineProperty(Type, 'name', nameDescriptor);
            // Assign anything from the prototype that was passed in
            if (proto !== defaultProto) {
                Object.assign(Type.prototype, proto);
            }
            return Type;
        };
    })(),
};

function customAttribute(nameOrDef) {
    return function (target) {
        return CustomAttribute.define(nameOrDef, target);
    };
}
function templateController(nameOrDef) {
    return function (target) {
        return CustomAttribute.define(typeof nameOrDef === 'string'
            ? { isTemplateController: true, name: nameOrDef }
            : { isTemplateController: true, ...nameOrDef }, target);
    };
}
class CustomAttributeDefinition {
    constructor(Type, name, aliases, key, defaultBindingMode, isTemplateController, bindables, noMultiBindings, watches) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.defaultBindingMode = defaultBindingMode;
        this.isTemplateController = isTemplateController;
        this.bindables = bindables;
        this.noMultiBindings = noMultiBindings;
        this.watches = watches;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        return new CustomAttributeDefinition(Type, firstDefined(CustomAttribute.getAnnotation(Type, 'name'), name), mergeArrays(CustomAttribute.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), CustomAttribute.keyFrom(name), firstDefined(CustomAttribute.getAnnotation(Type, 'defaultBindingMode'), def.defaultBindingMode, Type.defaultBindingMode, BindingMode.toView), firstDefined(CustomAttribute.getAnnotation(Type, 'isTemplateController'), def.isTemplateController, Type.isTemplateController, false), Bindable.from(...Bindable.getAll(Type), CustomAttribute.getAnnotation(Type, 'bindables'), Type.bindables, def.bindables), firstDefined(CustomAttribute.getAnnotation(Type, 'noMultiBindings'), def.noMultiBindings, Type.noMultiBindings, false), mergeArrays(Watch.getAnnotation(Type), Type.watches));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.transient(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, CustomAttribute, key, container);
    }
}
const CustomAttribute = {
    name: Protocol.resource.keyFor('custom-attribute'),
    keyFrom(name) {
        return `${CustomAttribute.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(CustomAttribute.name, value);
    },
    for(node, name) {
        var _a;
        return ((_a = getRef(node, CustomAttribute.keyFrom(name))) !== null && _a !== void 0 ? _a : void 0);
    },
    define(nameOrDef, Type) {
        const definition = CustomAttributeDefinition.create(nameOrDef, Type);
        Metadata.define(CustomAttribute.name, definition, definition.Type);
        Metadata.define(CustomAttribute.name, definition, definition);
        Protocol.resource.appendTo(Type, CustomAttribute.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(CustomAttribute.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};

const IViewFactory = DI.createInterface('IViewFactory');
class ViewFactory {
    constructor(name, context, contentType, projectionScope = null) {
        this.name = name;
        this.context = context;
        this.contentType = contentType;
        this.projectionScope = projectionScope;
        this.isCaching = false;
        this.cache = null;
        this.cacheSize = -1;
    }
    setCacheSize(size, doNotOverrideIfAlreadySet) {
        if (size) {
            if (size === '*') {
                size = ViewFactory.maxCacheSize;
            }
            else if (typeof size === 'string') {
                size = parseInt(size, 10);
            }
            if (this.cacheSize === -1 || !doNotOverrideIfAlreadySet) {
                this.cacheSize = size;
            }
        }
        if (this.cacheSize > 0) {
            this.cache = [];
        }
        else {
            this.cache = null;
        }
        this.isCaching = this.cacheSize > 0;
    }
    canReturnToCache(controller) {
        return this.cache != null && this.cache.length < this.cacheSize;
    }
    tryReturnToCache(controller) {
        if (this.canReturnToCache(controller)) {
            this.cache.push(controller);
            return true;
        }
        return false;
    }
    create(flags, parentController) {
        const cache = this.cache;
        let controller;
        if (cache != null && cache.length > 0) {
            controller = cache.pop();
            return controller;
        }
        controller = Controller.forSyntheticView(null, this.context, this, flags, parentController);
        return controller;
    }
}
ViewFactory.maxCacheSize = 0xFFFF;
const seenViews = new WeakSet();
function notYetSeen($view) {
    return !seenViews.has($view);
}
function toCustomElementDefinition($view) {
    seenViews.add($view);
    return CustomElementDefinition.create($view);
}
const Views = {
    name: Protocol.resource.keyFor('views'),
    has(value) {
        return typeof value === 'function' && (Metadata.hasOwn(Views.name, value) || '$views' in value);
    },
    get(value) {
        if (typeof value === 'function' && '$views' in value) {
            // TODO: a `get` operation with side effects is not a good thing. Should refactor this to a proper resource kind.
            const $views = value.$views;
            const definitions = $views.filter(notYetSeen).map(toCustomElementDefinition);
            for (const def of definitions) {
                Views.add(value, def);
            }
        }
        let views = Metadata.getOwn(Views.name, value);
        if (views === void 0) {
            Metadata.define(Views.name, views = [], value);
        }
        return views;
    },
    add(Type, partialDefinition) {
        const definition = CustomElementDefinition.create(partialDefinition);
        let views = Metadata.getOwn(Views.name, Type);
        if (views === void 0) {
            Metadata.define(Views.name, views = [definition], Type);
        }
        else {
            views.push(definition);
        }
        return views;
    },
};
const IViewLocator = DI.createInterface('IViewLocator', x => x.singleton(ViewLocator));
class ViewLocator {
    constructor() {
        this.modelInstanceToBoundComponent = new WeakMap();
        this.modelTypeToUnboundComponent = new Map();
    }
    getViewComponentForObject(object, viewNameOrSelector) {
        if (object) {
            const availableViews = Views.has(object.constructor) ? Views.get(object.constructor) : [];
            const resolvedViewName = typeof viewNameOrSelector === 'function'
                ? viewNameOrSelector(object, availableViews)
                : this.getViewName(availableViews, viewNameOrSelector);
            return this.getOrCreateBoundComponent(object, availableViews, resolvedViewName);
        }
        return null;
    }
    getOrCreateBoundComponent(object, availableViews, resolvedViewName) {
        let lookup = this.modelInstanceToBoundComponent.get(object);
        let BoundComponent;
        if (lookup === void 0) {
            lookup = {};
            this.modelInstanceToBoundComponent.set(object, lookup);
        }
        else {
            BoundComponent = lookup[resolvedViewName];
        }
        if (BoundComponent === void 0) {
            const UnboundComponent = this.getOrCreateUnboundComponent(object, availableViews, resolvedViewName);
            BoundComponent = CustomElement.define(CustomElement.getDefinition(UnboundComponent), class extends UnboundComponent {
                constructor() {
                    super(object);
                }
            });
            lookup[resolvedViewName] = BoundComponent;
        }
        return BoundComponent;
    }
    getOrCreateUnboundComponent(object, availableViews, resolvedViewName) {
        let lookup = this.modelTypeToUnboundComponent.get(object.constructor);
        let UnboundComponent;
        if (lookup === void 0) {
            lookup = {};
            this.modelTypeToUnboundComponent.set(object.constructor, lookup);
        }
        else {
            UnboundComponent = lookup[resolvedViewName];
        }
        if (UnboundComponent === void 0) {
            UnboundComponent = CustomElement.define(this.getView(availableViews, resolvedViewName), class {
                constructor(viewModel) {
                    this.viewModel = viewModel;
                }
                define(controller, parentContainer, definition) {
                    const vm = this.viewModel;
                    controller.scope = Scope.fromParent(controller.scope, vm);
                    if (vm.define !== void 0) {
                        return vm.define(controller, parentContainer, definition);
                    }
                }
            });
            const proto = UnboundComponent.prototype;
            if ('hydrating' in object) {
                proto.hydrating = function hydrating(controller) {
                    this.viewModel.hydrating(controller);
                };
            }
            if ('hydrated' in object) {
                proto.hydrated = function hydrated(controller) {
                    this.viewModel.hydrated(controller);
                };
            }
            if ('created' in object) {
                proto.created = function created(controller) {
                    this.viewModel.created(controller);
                };
            }
            if ('binding' in object) {
                proto.binding = function binding(initiator, parent, flags) {
                    return this.viewModel.binding(initiator, parent, flags);
                };
            }
            if ('bound' in object) {
                proto.bound = function bound(initiator, parent, flags) {
                    return this.viewModel.bound(initiator, parent, flags);
                };
            }
            if ('attaching' in object) {
                proto.attaching = function attaching(initiator, parent, flags) {
                    return this.viewModel.attaching(initiator, parent, flags);
                };
            }
            if ('attached' in object) {
                proto.attached = function attached(initiator, flags) {
                    return this.viewModel.attached(initiator, flags);
                };
            }
            if ('detaching' in object) {
                proto.detaching = function detaching(initiator, parent, flags) {
                    return this.viewModel.detaching(initiator, parent, flags);
                };
            }
            if ('unbinding' in object) {
                proto.unbinding = function unbinding(initiator, parent, flags) {
                    return this.viewModel.unbinding(initiator, parent, flags);
                };
            }
            if ('dispose' in object) {
                proto.dispose = function dispose() {
                    this.viewModel.dispose();
                };
            }
            lookup[resolvedViewName] = UnboundComponent;
        }
        return UnboundComponent;
    }
    getViewName(views, requestedName) {
        if (requestedName) {
            return requestedName;
        }
        if (views.length === 1) {
            return views[0].name;
        }
        return 'default-view';
    }
    getView(views, name) {
        const v = views.find(x => x.name === name);
        if (v === void 0) {
            throw new Error(`Could not find view: ${name}`);
        }
        return v;
    }
}

DI.createInterface("IProjections");
var AuSlotContentType;
(function (AuSlotContentType) {
    AuSlotContentType[AuSlotContentType["Projection"] = 0] = "Projection";
    AuSlotContentType[AuSlotContentType["Fallback"] = 1] = "Fallback";
})(AuSlotContentType || (AuSlotContentType = {}));
class SlotInfo {
    constructor(name, type, projectionContext) {
        this.name = name;
        this.type = type;
        this.projectionContext = projectionContext;
    }
}
class ProjectionContext {
    constructor(content, scope = null) {
        this.content = content;
        this.scope = scope;
    }
}
class RegisteredProjections {
    constructor(scope, projections) {
        this.scope = scope;
        this.projections = projections;
    }
}
const IProjectionProvider = DI.createInterface('IProjectionProvider', x => x.singleton(ProjectionProvider));
const projectionMap = new WeakMap();
class ProjectionProvider {
    registerProjections(projections, scope) {
        for (const [instruction, $projections] of projections) {
            projectionMap.set(instruction, new RegisteredProjections(scope, $projections));
        }
    }
    getProjectionFor(instruction) {
        var _a;
        return (_a = projectionMap.get(instruction)) !== null && _a !== void 0 ? _a : null;
    }
}
class AuSlot {
    constructor(factory, location) {
        this.hostScope = null;
        this.view = factory.create().setLocation(location);
        this.isProjection = factory.contentType === AuSlotContentType.Projection;
        this.outerScope = factory.projectionScope;
    }
    /**
     * @internal
     */
    static get inject() { return [IViewFactory, IRenderLocation]; }
    binding(_initiator, _parent, _flags) {
        this.hostScope = this.$controller.scope.parentScope;
    }
    attaching(initiator, parent, flags) {
        var _a;
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags, (_a = this.outerScope) !== null && _a !== void 0 ? _a : this.hostScope, this.hostScope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
customElement({ name: 'au-slot', template: null, containerless: true })(AuSlot);
const IAuSlotsInfo = DI.createInterface('AuSlotsInfo');
class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}

const definitionContainerLookup = new WeakMap();
const definitionContainerProjectionsLookup = new WeakMap();
const fragmentCache = new WeakMap();
function getRenderContext(partialDefinition, parentContainer, projections) {
    const definition = CustomElementDefinition.getOrCreate(partialDefinition);
    // injectable completely prevents caching, ensuring that each instance gets a new context context
    if (definition.injectable !== null) {
        return new RenderContext(definition, parentContainer);
    }
    if (projections == null) {
        let containerLookup = definitionContainerLookup.get(definition);
        if (containerLookup === void 0) {
            definitionContainerLookup.set(definition, containerLookup = new WeakMap());
        }
        let context = containerLookup.get(parentContainer);
        if (context === void 0) {
            containerLookup.set(parentContainer, context = new RenderContext(definition, parentContainer));
        }
        return context;
    }
    let containerProjectionsLookup = definitionContainerProjectionsLookup.get(definition);
    if (containerProjectionsLookup === void 0) {
        definitionContainerProjectionsLookup.set(definition, containerProjectionsLookup = new WeakMap());
    }
    let projectionsLookup = containerProjectionsLookup.get(parentContainer);
    if (projectionsLookup === void 0) {
        containerProjectionsLookup.set(parentContainer, projectionsLookup = new WeakMap());
    }
    let context = projectionsLookup.get(projections);
    if (context === void 0) {
        projectionsLookup.set(projections, context = new RenderContext(definition, parentContainer));
    }
    return context;
}
const emptyNodeCache = new WeakMap();
class RenderContext {
    constructor(definition, parentContainer) {
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.viewModelProvider = void 0;
        this.fragment = null;
        this.factory = void 0;
        this.isCompiled = false;
        this.renderers = Object.create(null);
        this.compiledDefinition = (void 0);
        this.root = parentContainer.root;
        const container = this.container = parentContainer.createChild();
        // TODO(fkleuver): get contextual + root renderers
        const renderers = container.getAll(IRenderer);
        let i = 0;
        let renderer;
        for (; i < renderers.length; ++i) {
            renderer = renderers[i];
            this.renderers[renderer.instructionType] = renderer;
        }
        this.projectionProvider = container.get(IProjectionProvider);
        container.registerResolver(IViewFactory, this.factoryProvider = new ViewFactoryProvider(), true);
        container.registerResolver(IController, this.parentControllerProvider = new InstanceProvider('IController'), true);
        container.registerResolver(IInstruction, this.instructionProvider = new InstanceProvider('IInstruction'), true);
        container.registerResolver(IRenderLocation, this.renderLocationProvider = new InstanceProvider('IRenderLocation'), true);
        container.registerResolver(IAuSlotsInfo, this.auSlotsInfoProvider = new InstanceProvider('IAuSlotsInfo'), true);
        const p = this.platform = container.get(IPlatform);
        const ep = this.elementProvider = new InstanceProvider('ElementResolver');
        container.registerResolver(INode, ep);
        container.registerResolver(p.Node, ep);
        container.registerResolver(p.Element, ep);
        container.registerResolver(p.HTMLElement, ep);
        container.register(...definition.dependencies);
    }
    get id() {
        return this.container.id;
    }
    // #region IServiceLocator api
    has(key, searchAncestors) {
        return this.container.has(key, searchAncestors);
    }
    get(key) {
        return this.container.get(key);
    }
    getAll(key) {
        return this.container.getAll(key);
    }
    // #endregion
    // #region IContainer api
    register(...params) {
        return this.container.register(...params);
    }
    registerResolver(key, resolver) {
        return this.container.registerResolver(key, resolver);
    }
    // public deregisterResolverFor<K extends Key, T = K>(key: K): void {
    //   this.container.deregisterResolverFor(key);
    // }
    registerTransformer(key, transformer) {
        return this.container.registerTransformer(key, transformer);
    }
    getResolver(key, autoRegister) {
        return this.container.getResolver(key, autoRegister);
    }
    invoke(key, dynamicDependencies) {
        return this.container.invoke(key, dynamicDependencies);
    }
    getFactory(key) {
        return this.container.getFactory(key);
    }
    registerFactory(key, factory) {
        this.container.registerFactory(key, factory);
    }
    createChild() {
        return this.container.createChild();
    }
    find(kind, name) {
        return this.container.find(kind, name);
    }
    create(kind, name) {
        return this.container.create(kind, name);
    }
    disposeResolvers() {
        this.container.disposeResolvers();
    }
    // #endregion
    // #region IRenderContext api
    compile(targetedProjections) {
        let compiledDefinition;
        if (this.isCompiled) {
            return this;
        }
        this.isCompiled = true;
        const definition = this.definition;
        if (definition.needsCompile) {
            const container = this.container;
            const compiler = container.get(ITemplateCompiler);
            compiledDefinition = this.compiledDefinition = compiler.compile(definition, container, targetedProjections);
        }
        else {
            compiledDefinition = this.compiledDefinition = definition;
        }
        // Support Recursive Components by adding self to own context
        compiledDefinition.register(this);
        if (fragmentCache.has(compiledDefinition)) {
            this.fragment = fragmentCache.get(compiledDefinition);
        }
        else {
            const doc = this.platform.document;
            const template = compiledDefinition.template;
            if (template === null || this.definition.enhance === true) {
                this.fragment = null;
            }
            else if (template instanceof this.platform.Node) {
                if (template.nodeName === 'TEMPLATE') {
                    this.fragment = doc.adoptNode(template.content);
                }
                else {
                    (this.fragment = doc.adoptNode(doc.createDocumentFragment())).appendChild(template);
                }
            }
            else {
                const tpl = doc.createElement('template');
                doc.adoptNode(tpl.content);
                if (typeof template === 'string') {
                    tpl.innerHTML = template;
                }
                this.fragment = tpl.content;
            }
            fragmentCache.set(compiledDefinition, this.fragment);
        }
        return this;
    }
    getViewFactory(name, contentType, projectionScope) {
        let factory = this.factory;
        if (factory === void 0) {
            if (name === void 0) {
                name = this.definition.name;
            }
            factory = this.factory = new ViewFactory(name, this, contentType, projectionScope);
        }
        return factory;
    }
    beginChildComponentOperation(instance) {
        const definition = this.definition;
        if (definition.injectable !== null) {
            if (this.viewModelProvider === void 0) {
                this.container.registerResolver(definition.injectable, this.viewModelProvider = new InstanceProvider('definition.injectable'));
            }
            this.viewModelProvider.prepare(instance);
        }
        return this;
    }
    // #endregion
    // #region ICompiledRenderContext api
    createNodes() {
        if (this.compiledDefinition.enhance === true) {
            return new FragmentNodeSequence(this.platform, this.compiledDefinition.template);
        }
        if (this.fragment === null) {
            let emptyNodes = emptyNodeCache.get(this.platform);
            if (emptyNodes === void 0) {
                emptyNodeCache.set(this.platform, emptyNodes = new FragmentNodeSequence(this.platform, this.platform.document.createDocumentFragment()));
            }
            return emptyNodes;
        }
        return new FragmentNodeSequence(this.platform, this.fragment.cloneNode(true));
    }
    // TODO: split up into 2 methods? getComponentFactory + getSyntheticFactory or something
    getComponentFactory(parentController, host, instruction, viewFactory, location, auSlotsInfo) {
        if (parentController !== void 0) {
            this.parentControllerProvider.prepare(parentController);
        }
        if (host !== void 0) {
            // TODO: fix provider input type, Key is probably not a good constraint
            this.elementProvider.prepare(host);
        }
        if (instruction !== void 0) {
            this.instructionProvider.prepare(instruction);
        }
        if (location !== void 0) {
            this.renderLocationProvider.prepare(location);
        }
        if (viewFactory !== void 0) {
            this.factoryProvider.prepare(viewFactory);
        }
        if (auSlotsInfo !== void 0) {
            this.auSlotsInfoProvider.prepare(auSlotsInfo);
        }
        return this;
    }
    // #endregion
    // #region IComponentFactory api
    createComponent(resourceKey) {
        return this.container.get(resourceKey);
    }
    render(flags, controller, targets, definition, host) {
        if (targets.length !== definition.instructions.length) {
            throw new Error(`The compiled template is not aligned with the render instructions. There are ${targets.length} targets and ${definition.instructions.length} instructions.`);
        }
        for (let i = 0; i < targets.length; ++i) {
            this.renderChildren(
            /* flags        */ flags, 
            /* instructions */ definition.instructions[i], 
            /* controller   */ controller, 
            /* target       */ targets[i]);
        }
        if (host !== void 0 && host !== null) {
            this.renderChildren(
            /* flags        */ flags, 
            /* instructions */ definition.surrogates, 
            /* controller   */ controller, 
            /* target       */ host);
        }
    }
    renderChildren(flags, instructions, controller, target) {
        for (let i = 0; i < instructions.length; ++i) {
            const current = instructions[i];
            this.renderers[current.type].render(flags, this, controller, target, current);
        }
    }
    dispose() {
        this.elementProvider.dispose();
    }
    // #endregion
    // #region IProjectionProvider api
    registerProjections(projections, scope) {
        this.projectionProvider.registerProjections(projections, scope);
    }
    getProjectionFor(instruction) {
        return this.projectionProvider.getProjectionFor(instruction);
    }
}
/** @internal */
class ViewFactoryProvider {
    constructor() {
        this.factory = null;
    }
    prepare(factory) {
        this.factory = factory;
    }
    get $isResolver() { return true; }
    resolve(_handler, _requestor) {
        const factory = this.factory;
        if (factory === null) {
            throw new Error('Cannot resolve ViewFactory before the provider was prepared.');
        }
        if (typeof factory.name !== 'string' || factory.name.length === 0) {
            throw new Error('Cannot resolve ViewFactory without a (valid) name.');
        }
        return factory;
    }
    dispose() {
        this.factory = null;
    }
}

class ClassAttributeAccessor {
    constructor(obj) {
        this.obj = obj;
        this.value = '';
        this.oldValue = '';
        this.doNotCache = true;
        this.nameIndex = {};
        this.version = 0;
        this.hasChanges = false;
        this.isActive = false;
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(newValue, flags) {
        this.value = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.value;
            const nameIndex = this.nameIndex;
            let version = this.version;
            this.oldValue = currentValue;
            const classesToAdd = getClassesToAdd(currentValue);
            // Get strings split on a space not including empties
            if (classesToAdd.length > 0) {
                this.addClassesAndUpdateIndex(classesToAdd);
            }
            this.version += 1;
            // First call to setValue?  We're done.
            if (version === 0) {
                return;
            }
            // Remove classes from previous version.
            version -= 1;
            for (const name in nameIndex) {
                if (!Object.prototype.hasOwnProperty.call(nameIndex, name) || nameIndex[name] !== version) {
                    continue;
                }
                // TODO: this has the side-effect that classes already present which are added again,
                // will be removed if they're not present in the next update.
                // Better would be do have some configurability for this behavior, allowing the user to
                // decide whether initial classes always need to be kept, always removed, or something in between
                this.obj.classList.remove(name);
            }
        }
    }
    addClassesAndUpdateIndex(classes) {
        const node = this.obj;
        for (let i = 0, ii = classes.length; i < ii; i++) {
            const className = classes[i];
            if (className.length === 0) {
                continue;
            }
            this.nameIndex[className] = this.version;
            node.classList.add(className);
        }
    }
}
function getClassesToAdd(object) {
    if (typeof object === 'string') {
        return splitClassString(object);
    }
    if (typeof object !== 'object') {
        return emptyArray;
    }
    if (object instanceof Array) {
        const len = object.length;
        if (len > 0) {
            const classes = [];
            for (let i = 0; i < len; ++i) {
                classes.push(...getClassesToAdd(object[i]));
            }
            return classes;
        }
        else {
            return emptyArray;
        }
    }
    const classes = [];
    for (const property in object) {
        // Let non typical values also evaluate true so disable bool check
        if (Boolean(object[property])) {
            // We must do this in case object property has a space in the name which results in two classes
            if (property.includes(' ')) {
                classes.push(...splitClassString(property));
            }
            else {
                classes.push(property);
            }
        }
    }
    return classes;
}
function splitClassString(classString) {
    const matches = classString.match(/\S+/g);
    if (matches === null) {
        return emptyArray;
    }
    return matches;
}

var __decorate$q = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$n = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
DI.createInterface('IShadowDOMStyleFactory', x => x.cachedCallback(handler => {
    if (AdoptedStyleSheetsStyles.supported(handler.get(IPlatform))) {
        return handler.get(AdoptedStyleSheetsStylesFactory);
    }
    return handler.get(StyleElementStylesFactory);
}));
let AdoptedStyleSheetsStylesFactory = class AdoptedStyleSheetsStylesFactory {
    constructor(p) {
        this.p = p;
        this.cache = new Map();
    }
    createStyles(localStyles, sharedStyles) {
        return new AdoptedStyleSheetsStyles(this.p, localStyles, this.cache, sharedStyles);
    }
};
AdoptedStyleSheetsStylesFactory = __decorate$q([
    __param$n(0, IPlatform)
], AdoptedStyleSheetsStylesFactory);
let StyleElementStylesFactory = class StyleElementStylesFactory {
    constructor(p) {
        this.p = p;
    }
    createStyles(localStyles, sharedStyles) {
        return new StyleElementStyles(this.p, localStyles, sharedStyles);
    }
};
StyleElementStylesFactory = __decorate$q([
    __param$n(0, IPlatform)
], StyleElementStylesFactory);
const IShadowDOMStyles = DI.createInterface('IShadowDOMStyles');
const IShadowDOMGlobalStyles = DI.createInterface('IShadowDOMGlobalStyles', x => x.instance({ applyTo: noop }));
class AdoptedStyleSheetsStyles {
    constructor(p, localStyles, styleSheetCache, sharedStyles = null) {
        this.sharedStyles = sharedStyles;
        this.styleSheets = localStyles.map(x => {
            let sheet;
            if (x instanceof p.CSSStyleSheet) {
                sheet = x;
            }
            else {
                sheet = styleSheetCache.get(x);
                if (sheet === void 0) {
                    sheet = new p.CSSStyleSheet();
                    sheet.replaceSync(x);
                    styleSheetCache.set(x, sheet);
                }
            }
            return sheet;
        });
    }
    static supported(p) {
        return 'adoptedStyleSheets' in p.ShadowRoot.prototype;
    }
    applyTo(shadowRoot) {
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(shadowRoot);
        }
        // https://wicg.github.io/construct-stylesheets/
        // https://developers.google.com/web/updates/2019/02/constructable-stylesheets
        shadowRoot.adoptedStyleSheets = [
            ...shadowRoot.adoptedStyleSheets,
            ...this.styleSheets
        ];
    }
}
class StyleElementStyles {
    constructor(p, localStyles, sharedStyles = null) {
        this.p = p;
        this.localStyles = localStyles;
        this.sharedStyles = sharedStyles;
    }
    applyTo(shadowRoot) {
        const styles = this.localStyles;
        const p = this.p;
        for (let i = styles.length - 1; i > -1; --i) {
            const element = p.document.createElement('style');
            element.innerHTML = styles[i];
            shadowRoot.prepend(element);
        }
        if (this.sharedStyles !== null) {
            this.sharedStyles.applyTo(shadowRoot);
        }
    }
}

const { enter, exit } = ConnectableSwitcher;
const { wrap, unwrap } = ProxyObservable;
class ComputedWatcher {
    constructor(obj, observerLocator, get, cb, useProxy) {
        this.obj = obj;
        this.observerLocator = observerLocator;
        this.get = get;
        this.cb = cb;
        this.useProxy = useProxy;
        this.interceptor = this;
        this.value = void 0;
        this.isBound = false;
        // todo: maybe use a counter allow recursive call to a certain level
        this.running = false;
    }
    handleChange() {
        this.run();
    }
    handleCollectionChange() {
        this.run();
    }
    $bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.compute();
    }
    $unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clear(true);
    }
    run() {
        if (!this.isBound || this.running) {
            return;
        }
        const obj = this.obj;
        const oldValue = this.value;
        const newValue = this.compute();
        if (!Object.is(newValue, oldValue)) {
            // should optionally queue
            this.cb.call(obj, newValue, oldValue, obj);
        }
    }
    compute() {
        this.running = true;
        this.obs.version++;
        try {
            enter(this);
            return this.value = unwrap(this.get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
        }
        finally {
            this.obs.clear(false);
            this.running = false;
            exit(this);
        }
    }
}
class ExpressionWatcher {
    constructor(scope, locator, observerLocator, expression, callback) {
        this.scope = scope;
        this.locator = locator;
        this.observerLocator = observerLocator;
        this.expression = expression;
        this.callback = callback;
        this.interceptor = this;
        this.isBound = false;
        this.obj = scope.bindingContext;
    }
    handleChange(value) {
        const expr = this.expression;
        const obj = this.obj;
        const oldValue = this.value;
        const canOptimize = expr.$kind === 10082 /* AccessScope */ && this.obs.count === 1;
        if (!canOptimize) {
            this.obs.version++;
            value = expr.evaluate(0, this.scope, null, this.locator, this);
            this.obs.clear(false);
        }
        if (!Object.is(value, oldValue)) {
            this.value = value;
            // should optionally queue for batch synchronous
            this.callback.call(obj, value, oldValue, obj);
        }
    }
    $bind() {
        if (this.isBound) {
            return;
        }
        this.isBound = true;
        this.obs.version++;
        this.value = this.expression.evaluate(0 /* none */, this.scope, null, this.locator, this);
        this.obs.clear(false);
    }
    $unbind() {
        if (!this.isBound) {
            return;
        }
        this.isBound = false;
        this.obs.clear(true);
        this.value = void 0;
    }
}
connectable(ComputedWatcher);
connectable(ExpressionWatcher);

const ILifecycleHooks = DI.createInterface('ILifecycleHooks');
class LifecycleHooksEntry {
    constructor(definition, instance) {
        this.definition = definition;
        this.instance = instance;
    }
}
/**
 * This definition has no specific properties yet other than the type, but is in place for future extensions.
 *
 * See: https://github.com/aurelia/aurelia/issues/1044
 */
class LifecycleHooksDefinition {
    constructor(Type, propertyNames) {
        this.Type = Type;
        this.propertyNames = propertyNames;
    }
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    static create(def, Type) {
        const propertyNames = new Set();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        let proto = Type.prototype;
        while (proto !== Object.prototype) {
            for (const name of Object.getOwnPropertyNames(proto)) {
                // This is the only check we will do for now. Filtering on e.g. function types might not always work properly when decorators come into play. This would need more testing first.
                if (name !== 'constructor') {
                    propertyNames.add(name);
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            proto = Object.getPrototypeOf(proto);
        }
        return new LifecycleHooksDefinition(Type, propertyNames);
    }
    register(container) {
        Registration.singleton(ILifecycleHooks, this.Type).register(container);
    }
}
const containerLookup = new WeakMap();
const LifecycleHooks = {
    name: Protocol.annotation.keyFor('lifecycle-hooks'),
    /**
     * @param def - Placeholder for future extensions. Currently always an empty object.
     */
    define(def, Type) {
        const definition = LifecycleHooksDefinition.create(def, Type);
        Metadata.define(LifecycleHooks.name, definition, Type);
        Protocol.resource.appendTo(Type, LifecycleHooks.name);
        return definition.Type;
    },
    resolve(ctx) {
        let lookup = containerLookup.get(ctx);
        if (lookup === void 0) {
            lookup = new LifecycleHooksLookupImpl();
            const root = ctx.root;
            const instances = root.id === ctx.id
                ? ctx.getAll(ILifecycleHooks)
                // if it's not root, only resolve it from the current context when it has the resolver
                // to maintain resources semantic: current -> root
                : ctx.has(ILifecycleHooks, false)
                    ? [...root.getAll(ILifecycleHooks), ...ctx.getAll(ILifecycleHooks)]
                    : root.getAll(ILifecycleHooks);
            let instance;
            let definition;
            let entry;
            let name;
            let entries;
            for (instance of instances) {
                definition = Metadata.getOwn(LifecycleHooks.name, instance.constructor);
                entry = new LifecycleHooksEntry(definition, instance);
                for (name of definition.propertyNames) {
                    entries = lookup[name];
                    if (entries === void 0) {
                        lookup[name] = [entry];
                    }
                    else {
                        entries.push(entry);
                    }
                }
            }
        }
        return lookup;
    },
};
class LifecycleHooksLookupImpl {
}

/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
function callDispose(disposable) {
    disposable.dispose();
}
var MountTarget;
(function (MountTarget) {
    MountTarget[MountTarget["none"] = 0] = "none";
    MountTarget[MountTarget["host"] = 1] = "host";
    MountTarget[MountTarget["shadowRoot"] = 2] = "shadowRoot";
    MountTarget[MountTarget["location"] = 3] = "location";
})(MountTarget || (MountTarget = {}));
const optional = { optional: true };
const controllerLookup = new WeakMap();
class Controller {
    constructor(root, container, vmKind, flags, definition, 
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory, 
    /**
     * The backing viewModel. Only present for custom attributes and elements.
     */
    viewModel, 
    /**
     * The physical host dom node.
     *
     * For containerless elements, this node will be removed from the DOM and replaced by a comment, which is assigned to the `location` property.
     *
     * For ShadowDOM elements, this will be the original declaring element, NOT the shadow root (the shadow root is stored on the `shadowRoot` property)
     */
    host) {
        this.root = root;
        this.container = container;
        this.vmKind = vmKind;
        this.flags = flags;
        this.definition = definition;
        this.viewFactory = viewFactory;
        this.viewModel = viewModel;
        this.host = host;
        this.id = nextId('au$component');
        this.head = null;
        this.tail = null;
        this.next = null;
        this.parent = null;
        this.bindings = null;
        this.children = null;
        this.hasLockedScope = false;
        this.isStrictBinding = false;
        this.scope = null;
        this.hostScope = null;
        this.isBound = false;
        // If a host from another custom element was passed in, then this will be the controller for that custom element (could be `au-viewport` for example).
        // In that case, this controller will create a new host node (with the definition's name) and use that as the target host for the nodes instead.
        // That host node is separately mounted to the host controller's original host node.
        this.hostController = null;
        this.mountTarget = 0 /* none */;
        this.shadowRoot = null;
        this.nodes = null;
        this.context = null;
        this.location = null;
        this.lifecycleHooks = null;
        this.state = 0 /* none */;
        this.logger = null;
        this.debug = false;
        this.fullyNamed = false;
        this.$initiator = null;
        this.$flags = 0 /* none */;
        this.$resolve = void 0;
        this.$reject = void 0;
        this.$promise = void 0;
        this.activatingStack = 0;
        this.detachingStack = 0;
        this.unbindingStack = 0;
        if (root === null && container.has(IAppRoot, true)) {
            this.root = container.get(IAppRoot);
        }
        this.platform = container.get(IPlatform);
        switch (vmKind) {
            case 1 /* customAttribute */:
            case 0 /* customElement */:
                this.hooks = new HooksDefinition(viewModel);
                break;
            case 2 /* synthetic */:
                this.hooks = HooksDefinition.none;
                break;
        }
    }
    get isActive() {
        return (this.state & (1 /* activating */ | 2 /* activated */)) > 0 && (this.state & 4 /* deactivating */) === 0;
    }
    get name() {
        var _a;
        if (this.parent === null) {
            switch (this.vmKind) {
                case 1 /* customAttribute */:
                    return `[${this.definition.name}]`;
                case 0 /* customElement */:
                    return this.definition.name;
                case 2 /* synthetic */:
                    return this.viewFactory.name;
            }
        }
        switch (this.vmKind) {
            case 1 /* customAttribute */:
                return `${this.parent.name}>[${this.definition.name}]`;
            case 0 /* customElement */:
                return `${this.parent.name}>${this.definition.name}`;
            case 2 /* synthetic */:
                return this.viewFactory.name === ((_a = this.parent.definition) === null || _a === void 0 ? void 0 : _a.name)
                    ? `${this.parent.name}[view]`
                    : `${this.parent.name}[view:${this.viewFactory.name}]`;
        }
    }
    static getCached(viewModel) {
        return controllerLookup.get(viewModel);
    }
    static getCachedOrThrow(viewModel) {
        const controller = Controller.getCached(viewModel);
        if (controller === void 0) {
            throw new Error(`There is no cached controller for the provided ViewModel: ${String(viewModel)}`);
        }
        return controller;
    }
    static forCustomElement(root, container, viewModel, host, 
    // projections *targeted* for this custom element. these are not the projections *provided* by this custom element.
    targetedProjections, flags = 0 /* none */, hydrate = true, 
    // Use this when `instance.constructor` is not a custom element type to pass on the CustomElement definition
    definition = void 0) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        definition = definition !== null && definition !== void 0 ? definition : CustomElement.getDefinition(viewModel.constructor);
        const controller = new Controller(
        /* root           */ root, 
        /* container      */ container, 0 /* customElement */, 
        /* flags          */ flags, 
        /* definition     */ definition, 
        /* viewFactory    */ null, 
        /* viewModel      */ viewModel, 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        if (hydrate) {
            controller.hydrateCustomElement(container, targetedProjections);
        }
        return controller;
    }
    static forCustomAttribute(root, container, viewModel, host, flags = 0 /* none */) {
        if (controllerLookup.has(viewModel)) {
            return controllerLookup.get(viewModel);
        }
        const definition = CustomAttribute.getDefinition(viewModel.constructor);
        const controller = new Controller(
        /* root           */ root, 
        /* container      */ container, 1 /* customAttribute */, 
        /* flags          */ flags, 
        /* definition     */ definition, 
        /* viewFactory    */ null, 
        /* viewModel      */ viewModel, 
        /* host           */ host);
        controllerLookup.set(viewModel, controller);
        controller.hydrateCustomAttribute();
        return controller;
    }
    static forSyntheticView(root, context, viewFactory, flags = 0 /* none */, parentController = void 0) {
        const controller = new Controller(
        /* root           */ root, 
        /* container      */ context, 2 /* synthetic */, 
        /* flags          */ flags, 
        /* definition     */ null, 
        /* viewFactory    */ viewFactory, 
        /* viewModel      */ null, 
        /* host           */ null);
        controller.parent = parentController !== null && parentController !== void 0 ? parentController : null;
        controller.hydrateSynthetic(context);
        return controller;
    }
    /** @internal */
    hydrateCustomElement(parentContainer, targetedProjections) {
        var _a;
        this.logger = parentContainer.get(ILogger).root;
        this.debug = this.logger.config.level <= 1 /* debug */;
        if (this.debug) {
            this.logger = this.logger.scopeTo(this.name);
        }
        let definition = this.definition;
        const flags = this.flags;
        const instance = this.viewModel;
        this.scope = Scope.create(instance, null, true);
        if (definition.watches.length > 0) {
            createWatchers(this, this.container, definition, instance);
        }
        createObservers(this, definition, flags, instance);
        createChildrenObservers(this, definition, flags, instance);
        if (this.hooks.hasDefine) {
            if (this.debug) {
                this.logger.trace(`invoking define() hook`);
            }
            const result = instance.define(
            /* controller      */ this, 
            /* parentContainer */ parentContainer, 
            /* definition      */ definition);
            if (result !== void 0 && result !== definition) {
                definition = CustomElementDefinition.getOrCreate(result);
            }
        }
        const context = this.context = getRenderContext(definition, parentContainer, targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections);
        this.lifecycleHooks = LifecycleHooks.resolve(context);
        // Support Recursive Components by adding self to own context
        definition.register(context);
        if (definition.injectable !== null) {
            // If the element is registered as injectable, support injecting the instance into children
            context.beginChildComponentOperation(instance);
        }
        // If this is the root controller, then the AppRoot will invoke things in the following order:
        // - Controller.hydrateCustomElement
        // - runAppTasks('hydrating') // may return a promise
        // - Controller.compile
        // - runAppTasks('hydrated') // may return a promise
        // - Controller.compileChildren
        // This keeps hydration synchronous while still allowing the composition root compile hooks to do async work.
        if (((_a = this.root) === null || _a === void 0 ? void 0 : _a.controller) !== this) {
            this.hydrate(targetedProjections);
            this.hydrateChildren();
        }
    }
    /** @internal */
    hydrate(targetedProjections) {
        if (this.hooks.hasHydrating) {
            if (this.debug) {
                this.logger.trace(`invoking hasHydrating() hook`);
            }
            this.viewModel.hydrating(this);
        }
        const compiledContext = this.context.compile(targetedProjections);
        const { projectionsMap, shadowOptions, isStrictBinding, hasSlots, containerless } = compiledContext.compiledDefinition;
        compiledContext.registerProjections(projectionsMap, this.scope);
        // once the projections are registered, we can cleanup the projection map to prevent memory leaks.
        projectionsMap.clear();
        this.isStrictBinding = isStrictBinding;
        if ((this.hostController = CustomElement.for(this.host, optional)) !== null) {
            this.host = this.platform.document.createElement(this.context.definition.name);
        }
        setRef(this.host, CustomElement.name, this);
        setRef(this.host, this.definition.key, this);
        if (shadowOptions !== null || hasSlots) {
            if (containerless) {
                throw new Error('You cannot combine the containerless custom element option with Shadow DOM.');
            }
            setRef(this.shadowRoot = this.host.attachShadow(shadowOptions !== null && shadowOptions !== void 0 ? shadowOptions : defaultShadowOptions), CustomElement.name, this);
            setRef(this.shadowRoot, this.definition.key, this);
            this.mountTarget = 2 /* shadowRoot */;
        }
        else if (containerless) {
            setRef(this.location = convertToRenderLocation(this.host), CustomElement.name, this);
            setRef(this.location, this.definition.key, this);
            this.mountTarget = 3 /* location */;
        }
        else {
            this.mountTarget = 1 /* host */;
        }
        this.viewModel.$controller = this;
        this.nodes = compiledContext.createNodes();
        if (this.hooks.hasHydrated) {
            if (this.debug) {
                this.logger.trace(`invoking hasHydrated() hook`);
            }
            this.viewModel.hydrated(this);
        }
    }
    /** @internal */
    hydrateChildren() {
        const targets = this.nodes.findTargets();
        this.context.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ targets, 
        /* definition */ this.context.compiledDefinition, 
        /* host       */ this.host);
        if (this.hooks.hasCreated) {
            if (this.debug) {
                this.logger.trace(`invoking created() hook`);
            }
            this.viewModel.created(this);
        }
    }
    hydrateCustomAttribute() {
        const definition = this.definition;
        const instance = this.viewModel;
        if (definition.watches.length > 0) {
            createWatchers(this, this.container, definition, instance);
        }
        createObservers(this, definition, this.flags, instance);
        instance.$controller = this;
        this.lifecycleHooks = LifecycleHooks.resolve(this.container);
        if (this.hooks.hasCreated) {
            if (this.debug) {
                this.logger.trace(`invoking created() hook`);
            }
            this.viewModel.created(this);
        }
    }
    hydrateSynthetic(context) {
        this.context = context;
        const compiledContext = context.compile(null);
        const compiledDefinition = compiledContext.compiledDefinition;
        this.isStrictBinding = compiledDefinition.isStrictBinding;
        const nodes = this.nodes = compiledContext.createNodes();
        const targets = nodes.findTargets();
        compiledContext.render(
        /* flags      */ this.flags, 
        /* controller */ this, 
        /* targets    */ targets, 
        /* definition */ compiledDefinition, 
        /* host       */ void 0);
    }
    activate(initiator, parent, flags, scope, hostScope) {
        switch (this.state) {
            case 0 /* none */:
            case 8 /* deactivated */:
                if (!(parent === null || parent.isActive)) {
                    // If this is not the root, and the parent is either:
                    // 1. Not activated, or activating children OR
                    // 2. Deactivating itself
                    // abort.
                    return;
                }
                // Otherwise, proceed normally.
                // 'deactivated' and 'none' are treated the same because, from an activation perspective, they mean the same thing.
                this.state = 1 /* activating */;
                break;
            case 2 /* activated */:
                // If we're already activated, no need to do anything.
                return;
            case 32 /* disposed */:
                throw new Error(`${this.name} trying to activate a controller that is disposed.`);
            default:
                throw new Error(`${this.name} unexpected state: ${stringifyState$1(this.state)}.`);
        }
        this.parent = parent;
        if (this.debug && !this.fullyNamed) {
            this.fullyNamed = true;
            this.logger = this.context.get(ILogger).root.scopeTo(this.name);
            this.logger.trace(`activate()`);
        }
        this.hostScope = hostScope !== null && hostScope !== void 0 ? hostScope : null;
        flags |= 2 /* fromBind */;
        switch (this.vmKind) {
            case 0 /* customElement */:
                // Custom element scope is created and assigned during hydration
                this.scope.parentScope = scope !== null && scope !== void 0 ? scope : null;
                break;
            case 1 /* customAttribute */:
                this.scope = scope !== null && scope !== void 0 ? scope : null;
                break;
            case 2 /* synthetic */:
                if (scope === void 0 || scope === null) {
                    throw new Error(`Scope is null or undefined`);
                }
                if (!this.hasLockedScope) {
                    this.scope = scope;
                }
                break;
        }
        if (this.isStrictBinding) {
            flags |= 1 /* isStrictBindingStrategy */;
        }
        this.$initiator = initiator;
        this.$flags = flags;
        // opposing leave is called in attach() (which will trigger attached())
        this.enterActivating();
        if (this.hooks.hasBinding) {
            if (this.debug) {
                this.logger.trace(`binding()`);
            }
            const ret = this.viewModel.binding(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this.ensurePromise();
                ret.then(() => {
                    this.bind();
                }).catch(err => {
                    this.reject(err);
                });
                return this.$promise;
            }
        }
        this.bind();
        return this.$promise;
    }
    bind() {
        if (this.debug) {
            this.logger.trace(`bind()`);
        }
        if (this.bindings !== null) {
            for (let i = 0; i < this.bindings.length; ++i) {
                this.bindings[i].$bind(this.$flags, this.scope, this.hostScope);
            }
        }
        if (this.hooks.hasBound) {
            if (this.debug) {
                this.logger.trace(`bound()`);
            }
            const ret = this.viewModel.bound(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this.ensurePromise();
                ret.then(() => {
                    this.isBound = true;
                    this.attach();
                }).catch(err => {
                    this.reject(err);
                });
                return;
            }
        }
        this.isBound = true;
        this.attach();
    }
    append(...nodes) {
        switch (this.mountTarget) {
            case 1 /* host */:
                this.host.append(...nodes);
                break;
            case 2 /* shadowRoot */:
                this.shadowRoot.append(...nodes);
                break;
            case 3 /* location */:
                for (let i = 0; i < nodes.length; ++i) {
                    this.location.parentNode.insertBefore(nodes[i], this.location);
                }
                break;
        }
    }
    attach() {
        var _a;
        if (this.debug) {
            this.logger.trace(`attach()`);
        }
        if (this.hostController !== null) {
            switch (this.mountTarget) {
                case 1 /* host */:
                case 2 /* shadowRoot */:
                    this.hostController.append(this.host);
                    break;
                case 3 /* location */:
                    this.hostController.append(this.location.$start, this.location);
                    break;
            }
        }
        switch (this.mountTarget) {
            case 1 /* host */:
                this.nodes.appendTo(this.host, (_a = this.definition) === null || _a === void 0 ? void 0 : _a.enhance);
                break;
            case 2 /* shadowRoot */: {
                const styles = this.context.has(IShadowDOMStyles, false)
                    ? this.context.get(IShadowDOMStyles)
                    : this.context.get(IShadowDOMGlobalStyles);
                styles.applyTo(this.shadowRoot);
                this.nodes.appendTo(this.shadowRoot);
                break;
            }
            case 3 /* location */:
                this.nodes.insertBefore(this.location);
                break;
        }
        if (this.hooks.hasAttaching) {
            if (this.debug) {
                this.logger.trace(`attaching()`);
            }
            const ret = this.viewModel.attaching(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this.ensurePromise();
                this.enterActivating();
                ret.then(() => {
                    this.leaveActivating();
                }).catch(err => {
                    this.reject(err);
                });
            }
        }
        // attaching() and child activation run in parallel, and attached() is called when both are finished
        if (this.children !== null) {
            for (let i = 0; i < this.children.length; ++i) {
                // Any promises returned from child activation are cumulatively awaited before this.$promise resolves
                void this.children[i].activate(this.$initiator, this, this.$flags, this.scope, this.hostScope);
            }
        }
        // attached() is invoked by Controller#leaveActivating when `activatingStack` reaches 0
        this.leaveActivating();
    }
    deactivate(initiator, parent, flags) {
        switch ((this.state & ~16 /* released */)) {
            case 2 /* activated */:
                // We're fully activated, so proceed with normal deactivation.
                this.state = 4 /* deactivating */;
                break;
            case 0 /* none */:
            case 8 /* deactivated */:
            case 32 /* disposed */:
            case 8 /* deactivated */ | 32 /* disposed */:
                // If we're already deactivated (or even disposed), or never activated in the first place, no need to do anything.
                return;
            default:
                throw new Error(`${this.name} unexpected state: ${stringifyState$1(this.state)}.`);
        }
        if (this.debug) {
            this.logger.trace(`deactivate()`);
        }
        this.$initiator = initiator;
        this.$flags = flags;
        if (initiator === this) {
            this.enterDetaching();
        }
        if (this.children !== null) {
            for (let i = 0; i < this.children.length; ++i) {
                // Child promise results are tracked by enter/leave combo's
                void this.children[i].deactivate(initiator, this, flags);
            }
        }
        if (this.hooks.hasDetaching) {
            if (this.debug) {
                this.logger.trace(`detaching()`);
            }
            const ret = this.viewModel.detaching(this.$initiator, this.parent, this.$flags);
            if (ret instanceof Promise) {
                this.ensurePromise();
                initiator.enterDetaching();
                ret.then(() => {
                    initiator.leaveDetaching();
                }).catch(err => {
                    initiator.reject(err);
                });
            }
        }
        // Note: if a 3rd party plugin happens to do any async stuff in a template controller before calling deactivate on its view,
        // then the linking will become out of order.
        // For framework components, this shouldn't cause issues.
        // We can only prevent that by linking up after awaiting the detaching promise, which would add an extra tick + a fair bit of
        // overhead on this hot path, so it's (for now) a deliberate choice to not account for such situation.
        // Just leaving the note here so that we know to look here if a weird detaching-related timing issue is ever reported.
        if (initiator.head === null) {
            initiator.head = this;
        }
        else {
            initiator.tail.next = this;
        }
        initiator.tail = this;
        if (initiator !== this) {
            // Only detaching is called + the linked list is built when any controller that is not the initiator, is deactivated.
            // The rest is handled by the initiator.
            // This means that descendant controllers have to make sure to await the initiator's promise before doing any subsequent
            // controller api calls, or race conditions might occur.
            return;
        }
        this.leaveDetaching();
        return this.$promise;
    }
    removeNodes() {
        switch (this.vmKind) {
            case 0 /* customElement */:
            case 2 /* synthetic */:
                this.nodes.remove();
                this.nodes.unlink();
        }
        if (this.hostController !== null) {
            switch (this.mountTarget) {
                case 1 /* host */:
                case 2 /* shadowRoot */:
                    this.host.remove();
                    break;
                case 3 /* location */:
                    this.location.$start.remove();
                    this.location.remove();
                    break;
            }
        }
    }
    unbind() {
        if (this.debug) {
            this.logger.trace(`unbind()`);
        }
        const flags = this.$flags | 4 /* fromUnbind */;
        if (this.bindings !== null) {
            for (let i = 0; i < this.bindings.length; ++i) {
                this.bindings[i].$unbind(flags);
            }
        }
        this.parent = null;
        switch (this.vmKind) {
            case 1 /* customAttribute */:
                this.scope = null;
                break;
            case 2 /* synthetic */:
                if (!this.hasLockedScope) {
                    this.scope = null;
                }
                if ((this.state & 16 /* released */) === 16 /* released */ &&
                    !this.viewFactory.tryReturnToCache(this) &&
                    this.$initiator === this) {
                    this.dispose();
                }
                break;
            case 0 /* customElement */:
                this.scope.parentScope = null;
                break;
        }
        if ((flags & 32 /* dispose */) === 32 /* dispose */ && this.$initiator === this) {
            this.dispose();
        }
        this.state = (this.state & 32 /* disposed */) | 8 /* deactivated */;
        this.$initiator = null;
        this.resolve();
    }
    ensurePromise() {
        if (this.$promise === void 0) {
            this.$promise = new Promise((resolve, reject) => {
                this.$resolve = resolve;
                this.$reject = reject;
            });
            if (this.$initiator !== this) {
                this.parent.ensurePromise();
            }
        }
    }
    resolve() {
        if (this.$promise !== void 0) {
            const resolve = this.$resolve;
            this.$resolve = this.$reject = this.$promise = void 0;
            resolve();
        }
    }
    reject(err) {
        if (this.$promise !== void 0) {
            const reject = this.$reject;
            this.$resolve = this.$reject = this.$promise = void 0;
            reject(err);
        }
        if (this.$initiator !== this) {
            this.parent.reject(err);
        }
    }
    enterActivating() {
        ++this.activatingStack;
        if (this.$initiator !== this) {
            this.parent.enterActivating();
        }
    }
    leaveActivating() {
        if (--this.activatingStack === 0) {
            if (this.hooks.hasAttached) {
                if (this.debug) {
                    this.logger.trace(`attached()`);
                }
                const ret = this.viewModel.attached(this.$initiator, this.$flags);
                if (ret instanceof Promise) {
                    this.ensurePromise();
                    ret.then(() => {
                        this.state = 2 /* activated */;
                        // Resolve this.$promise, signaling that activation is done (path 1 of 2)
                        this.resolve();
                        if (this.$initiator !== this) {
                            this.parent.leaveActivating();
                        }
                    }).catch(err => {
                        this.reject(err);
                    });
                    return;
                }
            }
            this.state = 2 /* activated */;
            // Resolve this.$promise (if present), signaling that activation is done (path 2 of 2)
            this.resolve();
        }
        if (this.$initiator !== this) {
            this.parent.leaveActivating();
        }
    }
    enterDetaching() {
        ++this.detachingStack;
    }
    leaveDetaching() {
        if (--this.detachingStack === 0) {
            // Note: this controller is the initiator (detach is only ever called on the initiator)
            if (this.debug) {
                this.logger.trace(`detach()`);
            }
            this.enterUnbinding();
            this.removeNodes();
            let cur = this.$initiator.head;
            while (cur !== null) {
                if (cur !== this) {
                    if (cur.debug) {
                        cur.logger.trace(`detach()`);
                    }
                    cur.removeNodes();
                }
                if (cur.hooks.hasUnbinding) {
                    if (cur.debug) {
                        cur.logger.trace('unbinding()');
                    }
                    const ret = cur.viewModel.unbinding(cur.$initiator, cur.parent, cur.$flags);
                    if (ret instanceof Promise) {
                        this.ensurePromise();
                        this.enterUnbinding();
                        ret.then(() => {
                            this.leaveUnbinding();
                        }).catch(err => {
                            this.reject(err);
                        });
                    }
                }
                cur = cur.next;
            }
            this.leaveUnbinding();
        }
    }
    enterUnbinding() {
        ++this.unbindingStack;
    }
    leaveUnbinding() {
        if (--this.unbindingStack === 0) {
            if (this.debug) {
                this.logger.trace(`unbind()`);
            }
            let cur = this.$initiator.head;
            let next = null;
            while (cur !== null) {
                if (cur !== this) {
                    cur.isBound = false;
                    cur.unbind();
                }
                next = cur.next;
                cur.next = null;
                cur = next;
            }
            this.head = this.tail = null;
            this.isBound = false;
            this.unbind();
        }
    }
    addBinding(binding) {
        if (this.bindings === null) {
            this.bindings = [binding];
        }
        else {
            this.bindings[this.bindings.length] = binding;
        }
    }
    addController(controller) {
        if (this.children === null) {
            this.children = [controller];
        }
        else {
            this.children[this.children.length] = controller;
        }
    }
    is(name) {
        switch (this.vmKind) {
            case 1 /* customAttribute */: {
                const def = CustomAttribute.getDefinition(this.viewModel.constructor);
                return def.name === name;
            }
            case 0 /* customElement */: {
                const def = CustomElement.getDefinition(this.viewModel.constructor);
                return def.name === name;
            }
            case 2 /* synthetic */:
                return this.viewFactory.name === name;
        }
    }
    lockScope(scope) {
        this.scope = scope;
        this.hasLockedScope = true;
    }
    setHost(host) {
        if (this.vmKind === 0 /* customElement */) {
            setRef(host, CustomElement.name, this);
            setRef(host, this.definition.key, this);
        }
        this.host = host;
        this.mountTarget = 1 /* host */;
        return this;
    }
    setShadowRoot(shadowRoot) {
        if (this.vmKind === 0 /* customElement */) {
            setRef(shadowRoot, CustomElement.name, this);
            setRef(shadowRoot, this.definition.key, this);
        }
        this.shadowRoot = shadowRoot;
        this.mountTarget = 2 /* shadowRoot */;
        return this;
    }
    setLocation(location) {
        if (this.vmKind === 0 /* customElement */) {
            setRef(location, CustomElement.name, this);
            setRef(location, this.definition.key, this);
        }
        this.location = location;
        this.mountTarget = 3 /* location */;
        return this;
    }
    release() {
        this.state |= 16 /* released */;
    }
    dispose() {
        if (this.debug) {
            this.logger.trace(`dispose()`);
        }
        if ((this.state & 32 /* disposed */) === 32 /* disposed */) {
            return;
        }
        this.state |= 32 /* disposed */;
        if (this.hooks.hasDispose) {
            this.viewModel.dispose();
        }
        if (this.children !== null) {
            this.children.forEach(callDispose);
            this.children = null;
        }
        this.hostController = null;
        this.scope = null;
        this.nodes = null;
        this.context = null;
        this.location = null;
        this.viewFactory = null;
        if (this.viewModel !== null) {
            controllerLookup.delete(this.viewModel);
            this.viewModel = null;
        }
        this.viewModel = null;
        this.host = null;
        this.shadowRoot = null;
        this.root = null;
    }
    accept(visitor) {
        if (visitor(this) === true) {
            return true;
        }
        if (this.hooks.hasAccept && this.viewModel.accept(visitor) === true) {
            return true;
        }
        if (this.children !== null) {
            const { children } = this;
            for (let i = 0, ii = children.length; i < ii; ++i) {
                if (children[i].accept(visitor) === true) {
                    return true;
                }
            }
        }
    }
    getTargetAccessor(propertyName) {
        const { bindings } = this;
        if (bindings !== null) {
            const binding = bindings.find(b => b.targetProperty === propertyName);
            if (binding !== void 0) {
                return binding.targetObserver;
            }
        }
        return void 0;
    }
}
function getLookup(instance) {
    let lookup = instance.$observers;
    if (lookup === void 0) {
        Reflect.defineProperty(instance, '$observers', {
            enumerable: false,
            value: lookup = {},
        });
    }
    return lookup;
}
function createObservers(controller, definition, 
// deepscan-disable-next-line
_flags, instance) {
    const bindables = definition.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);
    const length = observableNames.length;
    if (length > 0) {
        let name;
        let bindable;
        let i = 0;
        const observers = getLookup(instance);
        for (; i < length; ++i) {
            name = observableNames[i];
            if (observers[name] === void 0) {
                bindable = bindables[name];
                observers[name] = new BindableObserver(instance, name, bindable.callback, bindable.set, controller);
            }
        }
    }
}
function createChildrenObservers(controller, definition, 
// deepscan-disable-next-line
_flags, instance) {
    const childrenObservers = definition.childrenObservers;
    const childObserverNames = Object.getOwnPropertyNames(childrenObservers);
    const length = childObserverNames.length;
    if (length > 0) {
        const observers = getLookup(instance);
        let name;
        let i = 0;
        let childrenDescription;
        for (; i < length; ++i) {
            name = childObserverNames[i];
            if (observers[name] == void 0) {
                childrenDescription = childrenObservers[name];
                observers[name] = new ChildrenObserver(controller, instance, name, childrenDescription.callback, childrenDescription.query, childrenDescription.filter, childrenDescription.map, childrenDescription.options);
            }
        }
    }
}
const AccessScopeAst = {
    map: new Map(),
    for(key) {
        let ast = AccessScopeAst.map.get(key);
        if (ast == null) {
            ast = new AccessScopeExpression(key, 0);
            AccessScopeAst.map.set(key, ast);
        }
        return ast;
    },
};
function createWatchers(controller, context, definition, instance) {
    const observerLocator = context.get(IObserverLocator);
    const expressionParser = context.get(IExpressionParser);
    const watches = definition.watches;
    const ii = watches.length;
    let expression;
    let callback;
    let ast;
    let i = 0;
    for (; ii > i; ++i) {
        ({ expression, callback } = watches[i]);
        callback = typeof callback === 'function'
            ? callback
            : Reflect.get(instance, callback);
        if (typeof callback !== 'function') {
            throw new Error(`Invalid callback for @watch decorator: ${String(callback)}`);
        }
        if (typeof expression === 'function') {
            controller.addBinding(new ComputedWatcher(instance, observerLocator, expression, callback, 
            // there should be a flag to purposely disable proxy
            // AOT: not true for IE11
            true));
        }
        else {
            ast = typeof expression === 'string'
                ? expressionParser.parse(expression, 53 /* BindCommand */)
                : AccessScopeAst.for(expression);
            controller.addBinding(new ExpressionWatcher(controller.scope, context, observerLocator, ast, callback));
        }
    }
}
function isCustomElementController(value) {
    return value instanceof Controller && value.vmKind === 0 /* customElement */;
}
function isCustomElementViewModel(value) {
    return isObject(value) && CustomElement.isType(value.constructor);
}
class HooksDefinition {
    constructor(target) {
        this.hasDefine = 'define' in target;
        this.hasHydrating = 'hydrating' in target;
        this.hasHydrated = 'hydrated' in target;
        this.hasCreated = 'created' in target;
        this.hasBinding = 'binding' in target;
        this.hasBound = 'bound' in target;
        this.hasAttaching = 'attaching' in target;
        this.hasAttached = 'attached' in target;
        this.hasDetaching = 'detaching' in target;
        this.hasUnbinding = 'unbinding' in target;
        this.hasDispose = 'dispose' in target;
        this.hasAccept = 'accept' in target;
    }
}
HooksDefinition.none = new HooksDefinition({});
const defaultShadowOptions = {
    mode: 'open'
};
var ViewModelKind;
(function (ViewModelKind) {
    ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
    ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
    ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
})(ViewModelKind || (ViewModelKind = {}));
var State$2;
(function (State) {
    State[State["none"] = 0] = "none";
    State[State["activating"] = 1] = "activating";
    State[State["activated"] = 2] = "activated";
    State[State["deactivating"] = 4] = "deactivating";
    State[State["deactivated"] = 8] = "deactivated";
    State[State["released"] = 16] = "released";
    State[State["disposed"] = 32] = "disposed";
})(State$2 || (State$2 = {}));
function stringifyState$1(state) {
    const names = [];
    if ((state & 1 /* activating */) === 1 /* activating */) {
        names.push('activating');
    }
    if ((state & 2 /* activated */) === 2 /* activated */) {
        names.push('activated');
    }
    if ((state & 4 /* deactivating */) === 4 /* deactivating */) {
        names.push('deactivating');
    }
    if ((state & 8 /* deactivated */) === 8 /* deactivated */) {
        names.push('deactivated');
    }
    if ((state & 16 /* released */) === 16 /* released */) {
        names.push('released');
    }
    if ((state & 32 /* disposed */) === 32 /* disposed */) {
        names.push('disposed');
    }
    return names.length === 0 ? 'none' : names.join('|');
}
const IController = DI.createInterface('IController');

var __decorate$p = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$m = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const IAppRoot = DI.createInterface('IAppRoot');
const IWorkTracker = DI.createInterface('IWorkTracker', x => x.singleton(WorkTracker));
let WorkTracker = class WorkTracker {
    constructor(logger) {
        this.logger = logger;
        this.stack = 0;
        this.promise = null;
        this.resolve = null;
        this.logger = logger.scopeTo('WorkTracker');
    }
    start() {
        this.logger.trace(`start(stack:${this.stack})`);
        ++this.stack;
    }
    finish() {
        this.logger.trace(`finish(stack:${this.stack})`);
        if (--this.stack === 0) {
            const resolve = this.resolve;
            if (resolve !== null) {
                this.resolve = this.promise = null;
                resolve();
            }
        }
    }
    wait() {
        this.logger.trace(`wait(stack:${this.stack})`);
        if (this.promise === null) {
            if (this.stack === 0) {
                return Promise.resolve();
            }
            this.promise = new Promise(resolve => {
                this.resolve = resolve;
            });
        }
        return this.promise;
    }
};
WorkTracker = __decorate$p([
    __param$m(0, ILogger)
], WorkTracker);
class AppRoot {
    constructor(config, platform, container, rootProvider, enhance = false) {
        this.config = config;
        this.platform = platform;
        this.container = container;
        this.controller = (void 0);
        this.hydratePromise = void 0;
        this.host = config.host;
        this.work = container.get(IWorkTracker);
        rootProvider.prepare(this);
        if (container.has(INode, false) && container.get(INode) !== config.host) {
            this.container = container.createChild();
        }
        this.container.register(Registration.instance(INode, config.host));
        if (enhance) {
            const component = config.component;
            this.enhanceDefinition = CustomElement.getDefinition(CustomElement.isType(component)
                ? CustomElement.define({ ...CustomElement.getDefinition(component), template: this.host, enhance: true }, component)
                : CustomElement.define({ name: (void 0), template: this.host, enhance: true }));
        }
        this.hydratePromise = onResolve(this.runAppTasks('beforeCreate'), () => {
            const instance = CustomElement.isType(config.component)
                ? this.container.get(config.component)
                : config.component;
            const controller = (this.controller = Controller.forCustomElement(this, container, instance, this.host, null, 0 /* none */, false, this.enhanceDefinition));
            controller.hydrateCustomElement(container, null);
            return onResolve(this.runAppTasks('hydrating'), () => {
                controller.hydrate(null);
                return onResolve(this.runAppTasks('hydrated'), () => {
                    controller.hydrateChildren();
                    this.hydratePromise = void 0;
                });
            });
        });
    }
    activate() {
        return onResolve(this.hydratePromise, () => {
            return onResolve(this.runAppTasks('beforeActivate'), () => {
                return onResolve(this.controller.activate(this.controller, null, 2 /* fromBind */, void 0), () => {
                    return this.runAppTasks('afterActivate');
                });
            });
        });
    }
    deactivate() {
        return onResolve(this.runAppTasks('beforeDeactivate'), () => {
            return onResolve(this.controller.deactivate(this.controller, null, 0 /* none */), () => {
                return this.runAppTasks('afterDeactivate');
            });
        });
    }
    /** @internal */
    runAppTasks(slot) {
        return resolveAll(...this.container.getAll(IAppTask).reduce((results, task) => {
            if (task.slot === slot) {
                results.push(task.run());
            }
            return results;
        }, []));
    }
    dispose() {
        var _a;
        (_a = this.controller) === null || _a === void 0 ? void 0 : _a.dispose();
    }
}

class Refs {
}
function getRef(node, name) {
    var _a, _b;
    return (_b = (_a = node.$au) === null || _a === void 0 ? void 0 : _a[name]) !== null && _b !== void 0 ? _b : null;
}
function setRef(node, name, controller) {
    var _a;
    var _b;
    ((_a = (_b = node).$au) !== null && _a !== void 0 ? _a : (_b.$au = new Refs()))[name] = controller;
}
const INode = DI.createInterface('INode');
const IEventTarget = DI.createInterface('IEventTarget', x => x.cachedCallback(handler => {
    if (handler.has(IAppRoot, true)) {
        return handler.get(IAppRoot).host;
    }
    return handler.get(IPlatform).document;
}));
const IRenderLocation = DI.createInterface('IRenderLocation');
var NodeType;
(function (NodeType) {
    NodeType[NodeType["Element"] = 1] = "Element";
    NodeType[NodeType["Attr"] = 2] = "Attr";
    NodeType[NodeType["Text"] = 3] = "Text";
    NodeType[NodeType["CDATASection"] = 4] = "CDATASection";
    NodeType[NodeType["EntityReference"] = 5] = "EntityReference";
    NodeType[NodeType["Entity"] = 6] = "Entity";
    NodeType[NodeType["ProcessingInstruction"] = 7] = "ProcessingInstruction";
    NodeType[NodeType["Comment"] = 8] = "Comment";
    NodeType[NodeType["Document"] = 9] = "Document";
    NodeType[NodeType["DocumentType"] = 10] = "DocumentType";
    NodeType[NodeType["DocumentFragment"] = 11] = "DocumentFragment";
    NodeType[NodeType["Notation"] = 12] = "Notation";
})(NodeType || (NodeType = {}));
const effectiveParentNodeOverrides = new WeakMap();
/**
 * Returns the effective parentNode according to Aurelia's component hierarchy.
 *
 * Used by Aurelia to find the closest parent controller relative to a node.
 *
 * This method supports 3 additional scenarios that `node.parentNode` does not support:
 * - Containerless elements. The parentNode in this case is a comment precending the element under specific conditions, rather than a node wrapping the element.
 * - ShadowDOM. If a `ShadowRoot` is encountered, this method retrieves the associated controller via the metadata api to locate the original host.
 * - Portals. If the provided node was moved to a different location in the DOM by a `portal` attribute, then the original parent of the node will be returned.
 *
 * @param node - The node to get the parent for.
 * @returns Either the closest parent node, the closest `IRenderLocation` (comment node that is the containerless host), original portal host, or `null` if this is either the absolute document root or a disconnected node.
 */
function getEffectiveParentNode(node) {
    // TODO: this method needs more tests!
    // First look for any overrides
    if (effectiveParentNodeOverrides.has(node)) {
        return effectiveParentNodeOverrides.get(node);
    }
    // Then try to get the nearest au-start render location, which would be the containerless parent,
    // again looking for any overrides along the way.
    // otherwise return the normal parent node
    let containerlessOffset = 0;
    let next = node.nextSibling;
    while (next !== null) {
        if (next.nodeType === 8 /* Comment */) {
            switch (next.textContent) {
                case 'au-start':
                    // If we see an au-start before we see au-end, it will precede the host of a sibling containerless element rather than a parent.
                    // So we use the offset to ignore the next au-end
                    ++containerlessOffset;
                    break;
                case 'au-end':
                    if (containerlessOffset-- === 0) {
                        return next;
                    }
            }
        }
        next = next.nextSibling;
    }
    if (node.parentNode === null && node.nodeType === 11 /* DocumentFragment */) {
        // Could be a shadow root; see if there's a controller and if so, get the original host via the projector
        const controller = CustomElement.for(node);
        if (controller === void 0) {
            // Not a shadow root (or at least, not one created by Aurelia)
            // Nothing more we can try, just return null
            return null;
        }
        if (controller.mountTarget === 2 /* shadowRoot */) {
            return getEffectiveParentNode(controller.host);
        }
    }
    return node.parentNode;
}
function setEffectiveParentNode(childNodeOrNodeSequence, parentNode) {
    if (childNodeOrNodeSequence.platform !== void 0 && !(childNodeOrNodeSequence instanceof childNodeOrNodeSequence.platform.Node)) {
        const nodes = childNodeOrNodeSequence.childNodes;
        for (let i = 0, ii = nodes.length; i < ii; ++i) {
            effectiveParentNodeOverrides.set(nodes[i], parentNode);
        }
    }
    else {
        effectiveParentNodeOverrides.set(childNodeOrNodeSequence, parentNode);
    }
}
function convertToRenderLocation(node) {
    if (isRenderLocation(node)) {
        return node; // it's already a IRenderLocation (converted by FragmentNodeSequence)
    }
    const locationEnd = node.ownerDocument.createComment('au-end');
    const locationStart = node.ownerDocument.createComment('au-start');
    if (node.parentNode !== null) {
        node.parentNode.replaceChild(locationEnd, node);
        locationEnd.parentNode.insertBefore(locationStart, locationEnd);
    }
    locationEnd.$start = locationStart;
    return locationEnd;
}
function isRenderLocation(node) {
    return node.textContent === 'au-end';
}
class FragmentNodeSequence {
    constructor(platform, fragment) {
        this.platform = platform;
        this.fragment = fragment;
        this.isMounted = false;
        this.isLinked = false;
        this.next = void 0;
        this.refNode = void 0;
        const targetNodeList = fragment.querySelectorAll('.au');
        let i = 0;
        let ii = targetNodeList.length;
        const targets = this.targets = Array(ii);
        while (i < ii) {
            // eagerly convert all markers to RenderLocations (otherwise the renderer
            // will do it anyway) and store them in the target list (since the comments
            // can't be queried)
            const target = targetNodeList[i];
            if (target.nodeName === 'AU-M') {
                // note the renderer will still call this method, but it will just return the
                // location if it sees it's already a location
                targets[i] = convertToRenderLocation(target);
            }
            else {
                // also store non-markers for consistent ordering
                targets[i] = target;
            }
            ++i;
        }
        const childNodeList = fragment.childNodes;
        i = 0;
        ii = childNodeList.length;
        const childNodes = this.childNodes = Array(ii);
        while (i < ii) {
            childNodes[i] = childNodeList[i];
            ++i;
        }
        this.firstChild = fragment.firstChild;
        this.lastChild = fragment.lastChild;
    }
    findTargets() {
        return this.targets;
    }
    insertBefore(refNode) {
        if (this.isLinked && !!this.refNode) {
            this.addToLinked();
        }
        else {
            const parent = refNode.parentNode;
            if (this.isMounted) {
                let current = this.firstChild;
                const end = this.lastChild;
                let next;
                while (current != null) {
                    next = current.nextSibling;
                    parent.insertBefore(current, refNode);
                    if (current === end) {
                        break;
                    }
                    current = next;
                }
            }
            else {
                this.isMounted = true;
                refNode.parentNode.insertBefore(this.fragment, refNode);
            }
        }
    }
    appendTo(parent, enhance = false) {
        if (this.isMounted) {
            let current = this.firstChild;
            const end = this.lastChild;
            let next;
            while (current != null) {
                next = current.nextSibling;
                parent.appendChild(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
        else {
            this.isMounted = true;
            if (!enhance) {
                parent.appendChild(this.fragment);
            }
        }
    }
    remove() {
        if (this.isMounted) {
            this.isMounted = false;
            const fragment = this.fragment;
            const end = this.lastChild;
            let next;
            let current = this.firstChild;
            while (current !== null) {
                next = current.nextSibling;
                fragment.appendChild(current);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
    }
    addToLinked() {
        const refNode = this.refNode;
        const parent = refNode.parentNode;
        if (this.isMounted) {
            let current = this.firstChild;
            const end = this.lastChild;
            let next;
            while (current != null) {
                next = current.nextSibling;
                parent.insertBefore(current, refNode);
                if (current === end) {
                    break;
                }
                current = next;
            }
        }
        else {
            this.isMounted = true;
            parent.insertBefore(this.fragment, refNode);
        }
    }
    unlink() {
        this.isLinked = false;
        this.next = void 0;
        this.refNode = void 0;
    }
    link(next) {
        this.isLinked = true;
        if (isRenderLocation(next)) {
            this.refNode = next;
        }
        else {
            this.next = next;
            this.obtainRefNode();
        }
    }
    obtainRefNode() {
        if (this.next !== void 0) {
            this.refNode = this.next.firstChild;
        }
        else {
            this.refNode = void 0;
        }
    }
}
const IWindow = DI.createInterface('IWindow', x => x.callback(handler => handler.get(IPlatform).window));
const ILocation = DI.createInterface('ILocation', x => x.callback(handler => handler.get(IWindow).location));
const IHistory = DI.createInterface('IHistory', x => x.callback(handler => handler.get(IWindow).history));

const options = {
    [DelegationStrategy.capturing]: { capture: true },
    [DelegationStrategy.bubbling]: { capture: false },
};
/**
 * Listener binding. Handle event binding between view and view model
 */
class Listener {
    constructor(platform, targetEvent, delegationStrategy, sourceExpression, target, preventDefault, eventDelegator, locator) {
        this.platform = platform;
        this.targetEvent = targetEvent;
        this.delegationStrategy = delegationStrategy;
        this.sourceExpression = sourceExpression;
        this.target = target;
        this.preventDefault = preventDefault;
        this.eventDelegator = eventDelegator;
        this.locator = locator;
        this.interceptor = this;
        this.isBound = false;
        this.$hostScope = null;
        this.handler = null;
    }
    callSource(event) {
        const overrideContext = this.$scope.overrideContext;
        overrideContext.$event = event;
        const result = this.sourceExpression.evaluate(8 /* mustEvaluate */, this.$scope, this.$hostScope, this.locator, null);
        Reflect.deleteProperty(overrideContext, '$event');
        if (result !== true && this.preventDefault) {
            event.preventDefault();
        }
        return result;
    }
    handleEvent(event) {
        this.interceptor.callSource(event);
    }
    $bind(flags, scope, hostScope) {
        if (this.isBound) {
            if (this.$scope === scope) {
                return;
            }
            this.interceptor.$unbind(flags | 2 /* fromBind */);
        }
        this.$scope = scope;
        this.$hostScope = hostScope;
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasBind) {
            sourceExpression.bind(flags, scope, hostScope, this.interceptor);
        }
        if (this.delegationStrategy === DelegationStrategy.none) {
            this.target.addEventListener(this.targetEvent, this);
        }
        else {
            const eventTarget = this.locator.get(IEventTarget);
            this.handler = this.eventDelegator.addEventListener(eventTarget, this.target, this.targetEvent, this, options[this.delegationStrategy]);
        }
        // add isBound flag and remove isBinding flag
        this.isBound = true;
    }
    $unbind(flags) {
        if (!this.isBound) {
            return;
        }
        const sourceExpression = this.sourceExpression;
        if (sourceExpression.hasUnbind) {
            sourceExpression.unbind(flags, this.$scope, this.$hostScope, this.interceptor);
        }
        this.$scope = null;
        if (this.delegationStrategy === DelegationStrategy.none) {
            this.target.removeEventListener(this.targetEvent, this);
        }
        else {
            this.handler.dispose();
            this.handler = null;
        }
        // remove isBound and isUnbinding flags
        this.isBound = false;
    }
    observeProperty(obj, propertyName) {
        return;
    }
    handleChange(newValue, previousValue, flags) {
        return;
    }
}

const defaultOptions = {
    capture: false,
};
class ListenerTracker {
    constructor(publisher, eventName, options = defaultOptions) {
        this.publisher = publisher;
        this.eventName = eventName;
        this.options = options;
        this.count = 0;
        this.captureLookups = new Map();
        this.bubbleLookups = new Map();
    }
    increment() {
        if (++this.count === 1) {
            this.publisher.addEventListener(this.eventName, this, this.options);
        }
    }
    decrement() {
        if (--this.count === 0) {
            this.publisher.removeEventListener(this.eventName, this, this.options);
        }
    }
    dispose() {
        if (this.count > 0) {
            this.count = 0;
            this.publisher.removeEventListener(this.eventName, this, this.options);
        }
        this.captureLookups.clear();
        this.bubbleLookups.clear();
    }
    /** @internal */
    getLookup(target) {
        const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
        let lookup = lookups.get(target);
        if (lookup === void 0) {
            lookups.set(target, lookup = Object.create(null));
        }
        return lookup;
    }
    /** @internal */
    handleEvent(event) {
        const lookups = this.options.capture === true ? this.captureLookups : this.bubbleLookups;
        const path = event.composedPath();
        if (this.options.capture === true) {
            path.reverse();
        }
        for (const target of path) {
            const lookup = lookups.get(target);
            if (lookup === void 0) {
                continue;
            }
            const listener = lookup[this.eventName];
            if (listener === void 0) {
                continue;
            }
            if (typeof listener === 'function') {
                listener(event);
            }
            else {
                listener.handleEvent(event);
            }
            if (event.cancelBubble === true) {
                return;
            }
        }
    }
}
/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
class DelegateSubscription {
    constructor(tracker, lookup, eventName, callback) {
        this.tracker = tracker;
        this.lookup = lookup;
        this.eventName = eventName;
        tracker.increment();
        lookup[eventName] = callback;
    }
    dispose() {
        this.tracker.decrement();
        this.lookup[this.eventName] = void 0;
    }
}
class EventSubscriber {
    constructor(config) {
        this.config = config;
        this.target = null;
        this.handler = null;
    }
    subscribe(node, callbackOrListener) {
        this.target = node;
        this.handler = callbackOrListener;
        for (const event of this.config.events) {
            node.addEventListener(event, callbackOrListener);
        }
    }
    dispose() {
        const { target, handler } = this;
        if (target !== null && handler !== null) {
            for (const event of this.config.events) {
                target.removeEventListener(event, handler);
            }
        }
        this.target = this.handler = null;
    }
}
const IEventDelegator = DI.createInterface('IEventDelegator', x => x.singleton(EventDelegator));
class EventDelegator {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor
    constructor() {
        this.trackerMaps = Object.create(null);
    }
    addEventListener(publisher, target, eventName, listener, options) {
        var _a;
        var _b;
        const trackerMap = (_a = (_b = this.trackerMaps)[eventName]) !== null && _a !== void 0 ? _a : (_b[eventName] = new Map());
        let tracker = trackerMap.get(publisher);
        if (tracker === void 0) {
            trackerMap.set(publisher, tracker = new ListenerTracker(publisher, eventName, options));
        }
        return new DelegateSubscription(tracker, tracker.getLookup(target), eventName, listener);
    }
    dispose() {
        for (const eventName in this.trackerMaps) {
            const trackerMap = this.trackerMaps[eventName];
            for (const tracker of trackerMap.values()) {
                tracker.dispose();
            }
            trackerMap.clear();
        }
    }
}

var __decorate$o = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$l = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InstructionType;
(function (InstructionType) {
    InstructionType["hydrateElement"] = "ra";
    InstructionType["hydrateAttribute"] = "rb";
    InstructionType["hydrateTemplateController"] = "rc";
    InstructionType["hydrateLetElement"] = "rd";
    InstructionType["setProperty"] = "re";
    InstructionType["interpolation"] = "rf";
    InstructionType["propertyBinding"] = "rg";
    InstructionType["callBinding"] = "rh";
    InstructionType["letBinding"] = "ri";
    InstructionType["refBinding"] = "rj";
    InstructionType["iteratorBinding"] = "rk";
    InstructionType["textBinding"] = "ha";
    InstructionType["listenerBinding"] = "hb";
    InstructionType["attributeBinding"] = "hc";
    InstructionType["stylePropertyBinding"] = "hd";
    InstructionType["setAttribute"] = "he";
    InstructionType["setClassAttribute"] = "hf";
    InstructionType["setStyleAttribute"] = "hg";
})(InstructionType || (InstructionType = {}));
const IInstruction = DI.createInterface('Instruction');
function isInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && type.length === 2;
}
class InterpolationInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rf" /* interpolation */; }
}
class PropertyBindingInstruction {
    constructor(from, to, mode) {
        this.from = from;
        this.to = to;
        this.mode = mode;
    }
    get type() { return "rg" /* propertyBinding */; }
}
class IteratorBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rk" /* iteratorBinding */; }
}
class CallBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rh" /* callBinding */; }
}
class RefBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "rj" /* refBinding */; }
}
class SetPropertyInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
    }
    get type() { return "re" /* setProperty */; }
}
class HydrateElementInstruction {
    constructor(res, alias, instructions, slotInfo) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
        this.slotInfo = slotInfo;
    }
    get type() { return "ra" /* hydrateElement */; }
}
class HydrateAttributeInstruction {
    constructor(res, alias, instructions) {
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
    }
    get type() { return "rb" /* hydrateAttribute */; }
}
class HydrateTemplateController {
    constructor(def, res, alias, instructions) {
        this.def = def;
        this.res = res;
        this.alias = alias;
        this.instructions = instructions;
    }
    get type() { return "rc" /* hydrateTemplateController */; }
}
class HydrateLetElementInstruction {
    constructor(instructions, toBindingContext) {
        this.instructions = instructions;
        this.toBindingContext = toBindingContext;
    }
    get type() { return "rd" /* hydrateLetElement */; }
}
class LetBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    get type() { return "ri" /* letBinding */; }
}
class TextBindingInstruction {
    constructor(from) {
        this.from = from;
    }
    get type() { return "ha" /* textBinding */; }
}
class ListenerBindingInstruction {
    constructor(from, to, preventDefault, strategy) {
        this.from = from;
        this.to = to;
        this.preventDefault = preventDefault;
        this.strategy = strategy;
    }
    get type() { return "hb" /* listenerBinding */; }
}
class SetAttributeInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
    }
    get type() { return "he" /* setAttribute */; }
}
class SetClassAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hf" /* setClassAttribute */;
    }
}
class SetStyleAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hg" /* setStyleAttribute */;
    }
}
class AttributeBindingInstruction {
    constructor(
    /**
     * `attr` and `to` have the same value on a normal attribute
     * Will be different on `class` and `style`
     * on `class`: attr = `class` (from binding command), to = attribute name
     * on `style`: attr = `style` (from binding command), to = attribute name
     */
    attr, from, to) {
        this.attr = attr;
        this.from = from;
        this.to = to;
    }
    get type() { return "hc" /* attributeBinding */; }
}
const ITemplateCompiler = DI.createInterface('ITemplateCompiler');
const IRenderer = DI.createInterface('IRenderer');
function renderer(instructionType) {
    return function decorator(target) {
        // wrap the constructor to set the instructionType to the instance (for better performance than when set on the prototype)
        const decoratedTarget = function (...args) {
            const instance = new target(...args);
            instance.instructionType = instructionType;
            return instance;
        };
        // make sure we register the decorated constructor with DI
        decoratedTarget.register = function register(container) {
            Registration.singleton(IRenderer, decoratedTarget).register(container);
        };
        // copy over any metadata such as annotations (set by preceding decorators) as well as static properties set by the user
        // also copy the name, to be less confusing to users (so they can still use constructor.name for whatever reason)
        // the length (number of ctor arguments) is copied for the same reason
        const metadataKeys = Metadata.getOwnKeys(target);
        for (const key of metadataKeys) {
            Metadata.define(key, Metadata.getOwn(key, target), decoratedTarget);
        }
        const ownProperties = Object.getOwnPropertyDescriptors(target);
        Object.keys(ownProperties).filter(prop => prop !== 'prototype').forEach(prop => {
            Reflect.defineProperty(decoratedTarget, prop, ownProperties[prop]);
        });
        return decoratedTarget;
    };
}
function ensureExpression(parser, srcOrExpr, bindingType) {
    if (typeof srcOrExpr === 'string') {
        return parser.parse(srcOrExpr, bindingType);
    }
    return srcOrExpr;
}
function getTarget$1(potentialTarget) {
    if (potentialTarget.viewModel != null) {
        return potentialTarget.viewModel;
    }
    return potentialTarget;
}
function getRefTarget(refHost, refTargetName) {
    if (refTargetName === 'element') {
        return refHost;
    }
    switch (refTargetName) {
        case 'controller':
            // this means it supports returning undefined
            return CustomElement.for(refHost);
        case 'view':
            // todo: returns node sequences for fun?
            throw new Error('Not supported API');
        case 'view-model':
            // this means it supports returning undefined
            return CustomElement.for(refHost).viewModel;
        default: {
            const caController = CustomAttribute.for(refHost, refTargetName);
            if (caController !== void 0) {
                return caController.viewModel;
            }
            const ceController = CustomElement.for(refHost, { name: refTargetName });
            if (ceController === void 0) {
                throw new Error(`Attempted to reference "${refTargetName}", but it was not found amongst the target's API.`);
            }
            return ceController.viewModel;
        }
    }
}
let SetPropertyRenderer = 
/** @internal */
class SetPropertyRenderer {
    render(flags, context, controller, target, instruction) {
        const obj = getTarget$1(target);
        if (obj.$observers !== void 0 && obj.$observers[instruction.to] !== void 0) {
            obj.$observers[instruction.to].setValue(instruction.value, 2 /* fromBind */);
        }
        else {
            obj[instruction.to] = instruction.value;
        }
    }
};
SetPropertyRenderer = __decorate$o([
    renderer("re" /* setProperty */)
    /** @internal */
], SetPropertyRenderer);
let CustomElementRenderer = 
/** @internal */
class CustomElementRenderer {
    render(flags, context, controller, target, instruction) {
        var _a;
        let viewFactory;
        const slotInfo = instruction.slotInfo;
        if (slotInfo !== null) {
            const projectionCtx = slotInfo.projectionContext;
            viewFactory = getRenderContext(projectionCtx.content, context).getViewFactory(void 0, slotInfo.type, projectionCtx.scope);
        }
        const targetedProjections = context.getProjectionFor(instruction);
        const factory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ target, 
        /* auSlotsInfo      */ new AuSlotsInfo(Object.keys((_a = targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections) !== null && _a !== void 0 ? _a : {})));
        const key = CustomElement.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomElement(
        /* root                */ controller.root, 
        /* container           */ context, 
        /* viewModel           */ component, 
        /* host                */ target, 
        /* targetedProjections */ targetedProjections, 
        /* flags               */ flags);
        flags = childController.flags;
        setRef(target, key, childController);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ controller, 
        /* target       */ childController);
        controller.addController(childController);
        factory.dispose();
    }
};
CustomElementRenderer = __decorate$o([
    renderer("ra" /* hydrateElement */)
    /** @internal */
], CustomElementRenderer);
let CustomAttributeRenderer = 
/** @internal */
class CustomAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        const factory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ void 0, 
        /* location         */ void 0);
        const key = CustomAttribute.keyFrom(instruction.res);
        const component = factory.createComponent(key);
        const childController = Controller.forCustomAttribute(
        /* root      */ controller.root, 
        /* container */ context, 
        /* viewModel */ component, 
        /* host      */ target, 
        /* flags     */ flags);
        setRef(target, key, childController);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ controller, 
        /* target       */ childController);
        controller.addController(childController);
        factory.dispose();
    }
};
CustomAttributeRenderer = __decorate$o([
    renderer("rb" /* hydrateAttribute */)
    /** @internal */
], CustomAttributeRenderer);
let TemplateControllerRenderer = 
/** @internal */
class TemplateControllerRenderer {
    render(flags, context, controller, target, instruction) {
        var _a;
        const viewFactory = getRenderContext(instruction.def, context).getViewFactory();
        const renderLocation = convertToRenderLocation(target);
        const componentFactory = context.getComponentFactory(
        /* parentController */ controller, 
        /* host             */ target, 
        /* instruction      */ instruction, 
        /* viewFactory      */ viewFactory, 
        /* location         */ renderLocation);
        const key = CustomAttribute.keyFrom(instruction.res);
        const component = componentFactory.createComponent(key);
        const childController = Controller.forCustomAttribute(
        /* root      */ controller.root, 
        /* container */ context, 
        /* viewModel */ component, 
        /* host      */ target, 
        /* flags     */ flags);
        setRef(renderLocation, key, childController);
        (_a = component.link) === null || _a === void 0 ? void 0 : _a.call(component, flags, context, controller, childController, target, instruction);
        context.renderChildren(
        /* flags        */ flags, 
        /* instructions */ instruction.instructions, 
        /* controller   */ controller, 
        /* target       */ childController);
        controller.addController(childController);
        componentFactory.dispose();
    }
};
TemplateControllerRenderer = __decorate$o([
    renderer("rc" /* hydrateTemplateController */)
    /** @internal */
], TemplateControllerRenderer);
let LetElementRenderer = 
/** @internal */
class LetElementRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        target.remove();
        const childInstructions = instruction.instructions;
        const toBindingContext = instruction.toBindingContext;
        let childInstruction;
        let expr;
        let binding;
        for (let i = 0, ii = childInstructions.length; i < ii; ++i) {
            childInstruction = childInstructions[i];
            expr = ensureExpression(this.parser, childInstruction.from, 48 /* IsPropertyCommand */);
            binding = applyBindingBehavior(new LetBinding(expr, childInstruction.to, this.observerLocator, context, toBindingContext), expr, context);
            controller.addBinding(binding);
        }
    }
};
LetElementRenderer = __decorate$o([
    renderer("rd" /* hydrateLetElement */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator)
], LetElementRenderer);
let CallBindingRenderer = 
/** @internal */
class CallBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 153 /* CallCommand */);
        const binding = applyBindingBehavior(new CallBinding(expr, getTarget$1(target), instruction.to, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
    }
};
CallBindingRenderer = __decorate$o([
    renderer("rh" /* callBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator)
], CallBindingRenderer);
let RefBindingRenderer = 
/** @internal */
class RefBindingRenderer {
    constructor(parser) {
        this.parser = parser;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 5376 /* IsRef */);
        const binding = applyBindingBehavior(new RefBinding(expr, getRefTarget(target, instruction.to), context), expr, context);
        controller.addBinding(binding);
    }
};
RefBindingRenderer = __decorate$o([
    renderer("rj" /* refBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser)
], RefBindingRenderer);
let InterpolationBindingRenderer = 
/** @internal */
class InterpolationBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const binding = new InterpolationBinding(this.observerLocator, expr, getTarget$1(target), instruction.to, BindingMode.toView, context, this.platform.domWriteQueue);
        const partBindings = binding.partBindings;
        const ii = partBindings.length;
        let i = 0;
        let partBinding;
        for (; ii > i; ++i) {
            partBinding = partBindings[i];
            partBindings[i] = applyBindingBehavior(partBinding, partBinding.sourceExpression, context);
        }
        controller.addBinding(binding);
    }
};
InterpolationBindingRenderer = __decorate$o([
    renderer("rf" /* interpolation */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator),
    __param$l(2, IPlatform)
], InterpolationBindingRenderer);
let PropertyBindingRenderer = 
/** @internal */
class PropertyBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | instruction.mode);
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget$1(target), instruction.to, instruction.mode, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
PropertyBindingRenderer = __decorate$o([
    renderer("rg" /* propertyBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator),
    __param$l(2, IPlatform)
], PropertyBindingRenderer);
let IteratorBindingRenderer = 
/** @internal */
class IteratorBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 539 /* ForCommand */);
        const binding = applyBindingBehavior(new PropertyBinding(expr, getTarget$1(target), instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
IteratorBindingRenderer = __decorate$o([
    renderer("rk" /* iteratorBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator),
    __param$l(2, IPlatform)
], IteratorBindingRenderer);
let behaviorExpressionIndex = 0;
const behaviorExpressions = [];
function applyBindingBehavior(binding, expression, locator) {
    while (expression instanceof BindingBehaviorExpression) {
        behaviorExpressions[behaviorExpressionIndex++] = expression;
        expression = expression.expression;
    }
    while (behaviorExpressionIndex > 0) {
        const behaviorExpression = behaviorExpressions[--behaviorExpressionIndex];
        const behaviorOrFactory = locator.get(behaviorExpression.behaviorKey);
        if (behaviorOrFactory instanceof BindingBehaviorFactory) {
            binding = behaviorOrFactory.construct(binding, behaviorExpression);
        }
    }
    behaviorExpressions.length = 0;
    return binding;
}
let TextBindingRenderer = 
/** @internal */
class TextBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const next = target.nextSibling;
        const parent = target.parentNode;
        const doc = this.platform.document;
        const expr = ensureExpression(this.parser, instruction.from, 2048 /* Interpolation */);
        const staticParts = expr.parts;
        const dynamicParts = expr.expressions;
        const ii = dynamicParts.length;
        let i = 0;
        let text = staticParts[0];
        if (text !== '') {
            parent.insertBefore(doc.createTextNode(text), next);
        }
        for (; ii > i; ++i) {
            // each of the dynamic expression of an interpolation
            // will be mapped to a ContentBinding
            controller.addBinding(applyBindingBehavior(new ContentBinding(dynamicParts[i], 
            // using a text node instead of comment, as a mean to:
            // support seamless transition between a html node, or a text
            // reduce the noise in the template, caused by html comment
            parent.insertBefore(doc.createTextNode(''), next), context, this.observerLocator, this.platform), dynamicParts[i], context));
            // while each of the static part of an interpolation
            // will just be a text node
            text = staticParts[i + 1];
            if (text !== '') {
                parent.insertBefore(doc.createTextNode(text), next);
            }
        }
        if (target.nodeName === 'AU-M') {
            target.remove();
        }
    }
};
TextBindingRenderer = __decorate$o([
    renderer("ha" /* textBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator),
    __param$l(2, IPlatform)
], TextBindingRenderer);
let ListenerBindingRenderer = 
/** @internal */
class ListenerBindingRenderer {
    constructor(parser, eventDelegator) {
        this.parser = parser;
        this.eventDelegator = eventDelegator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 80 /* IsEventCommand */ | (instruction.strategy + 6 /* DelegationStrategyDelta */));
        const binding = applyBindingBehavior(new Listener(context.platform, instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventDelegator, context), expr, context);
        controller.addBinding(binding);
    }
};
ListenerBindingRenderer = __decorate$o([
    renderer("hb" /* listenerBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IEventDelegator)
], ListenerBindingRenderer);
let SetAttributeRenderer = 
/** @internal */
class SetAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        target.setAttribute(instruction.to, instruction.value);
    }
};
SetAttributeRenderer = __decorate$o([
    renderer("he" /* setAttribute */)
    /** @internal */
], SetAttributeRenderer);
let SetClassAttributeRenderer = class SetClassAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        addClasses(target.classList, instruction.value);
    }
};
SetClassAttributeRenderer = __decorate$o([
    renderer("hf" /* setClassAttribute */)
], SetClassAttributeRenderer);
let SetStyleAttributeRenderer = class SetStyleAttributeRenderer {
    render(flags, context, controller, target, instruction) {
        target.style.cssText += instruction.value;
    }
};
SetStyleAttributeRenderer = __decorate$o([
    renderer("hg" /* setStyleAttribute */)
], SetStyleAttributeRenderer);
let StylePropertyBindingRenderer = 
/** @internal */
class StylePropertyBindingRenderer {
    constructor(parser, observerLocator, platform) {
        this.parser = parser;
        this.observerLocator = observerLocator;
        this.platform = platform;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new PropertyBinding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context, this.platform.domWriteQueue), expr, context);
        controller.addBinding(binding);
    }
};
StylePropertyBindingRenderer = __decorate$o([
    renderer("hd" /* stylePropertyBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator),
    __param$l(2, IPlatform)
], StylePropertyBindingRenderer);
let AttributeBindingRenderer = 
/** @internal */
class AttributeBindingRenderer {
    constructor(parser, observerLocator) {
        this.parser = parser;
        this.observerLocator = observerLocator;
    }
    render(flags, context, controller, target, instruction) {
        const expr = ensureExpression(this.parser, instruction.from, 48 /* IsPropertyCommand */ | BindingMode.toView);
        const binding = applyBindingBehavior(new AttributeBinding(expr, target, instruction.attr /* targetAttribute */, instruction.to /* targetKey */, BindingMode.toView, this.observerLocator, context), expr, context);
        controller.addBinding(binding);
    }
};
AttributeBindingRenderer = __decorate$o([
    renderer("hc" /* attributeBinding */)
    /** @internal */
    ,
    __param$l(0, IExpressionParser),
    __param$l(1, IObserverLocator)
], AttributeBindingRenderer);
// http://jsben.ch/7n5Kt
function addClasses(classList, className) {
    const len = className.length;
    let start = 0;
    for (let i = 0; i < len; ++i) {
        if (className.charCodeAt(i) === 0x20) {
            if (i !== start) {
                classList.add(className.slice(start, i));
            }
            start = i + 1;
        }
        else if (i + 1 === len) {
            classList.add(className.slice(start));
        }
    }
}

var SymbolFlags;
(function (SymbolFlags) {
    SymbolFlags[SymbolFlags["type"] = 1023] = "type";
    SymbolFlags[SymbolFlags["isTemplateController"] = 1] = "isTemplateController";
    SymbolFlags[SymbolFlags["isProjection"] = 2] = "isProjection";
    SymbolFlags[SymbolFlags["isCustomAttribute"] = 4] = "isCustomAttribute";
    SymbolFlags[SymbolFlags["isPlainAttribute"] = 8] = "isPlainAttribute";
    SymbolFlags[SymbolFlags["isCustomElement"] = 16] = "isCustomElement";
    SymbolFlags[SymbolFlags["isLetElement"] = 32] = "isLetElement";
    SymbolFlags[SymbolFlags["isPlainElement"] = 64] = "isPlainElement";
    SymbolFlags[SymbolFlags["isText"] = 128] = "isText";
    SymbolFlags[SymbolFlags["isBinding"] = 256] = "isBinding";
    SymbolFlags[SymbolFlags["isAuSlot"] = 512] = "isAuSlot";
    SymbolFlags[SymbolFlags["hasMarker"] = 1024] = "hasMarker";
    SymbolFlags[SymbolFlags["hasTemplate"] = 2048] = "hasTemplate";
    SymbolFlags[SymbolFlags["hasAttributes"] = 4096] = "hasAttributes";
    SymbolFlags[SymbolFlags["hasBindings"] = 8192] = "hasBindings";
    SymbolFlags[SymbolFlags["hasChildNodes"] = 16384] = "hasChildNodes";
    SymbolFlags[SymbolFlags["hasProjections"] = 32768] = "hasProjections";
})(SymbolFlags || (SymbolFlags = {}));
function createMarker(p) {
    const marker = p.document.createElement('au-m');
    marker.className = 'au';
    return marker;
}
/**
 * A html attribute that is associated with a registered resource, specifically a template controller.
 */
class TemplateControllerSymbol {
    constructor(p, syntax, info, res = info.name) {
        this.syntax = syntax;
        this.info = info;
        this.res = res;
        this.flags = 1 /* isTemplateController */ | 1024 /* hasMarker */;
        this.physicalNode = null;
        this.template = null;
        this.templateController = null;
        this._bindings = null;
        this.marker = createMarker(p);
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
class ProjectionSymbol {
    constructor(name, template) {
        this.name = name;
        this.template = template;
        this.flags = 2 /* isProjection */;
    }
}
/**
 * A html attribute that is associated with a registered resource, but not a template controller.
 */
class CustomAttributeSymbol {
    constructor(syntax, info, res = info.name) {
        this.syntax = syntax;
        this.info = info;
        this.res = res;
        this.flags = 4 /* isCustomAttribute */;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
/**
 * An attribute, with either a binding command or an interpolation, whose target is the html
 * attribute of the element.
 *
 * This will never target a bindable property of a custom attribute or element;
 */
class PlainAttributeSymbol {
    constructor(syntax, command, expression) {
        this.syntax = syntax;
        this.command = command;
        this.expression = expression;
        this.flags = 8 /* isPlainAttribute */;
    }
}
/**
 * Either an attribute on an custom element that maps to a declared bindable property of that element,
 * a single-value bound custom attribute, or one of several bindables that were extracted from the attribute
 * value of a custom attribute with multiple bindings usage.
 *
 * This will always target a bindable property of a custom attribute or element;
 */
class BindingSymbol {
    constructor(command, bindable, expression, rawValue, target) {
        this.command = command;
        this.bindable = bindable;
        this.expression = expression;
        this.rawValue = rawValue;
        this.target = target;
        this.flags = 256 /* isBinding */;
    }
}
/**
 * A html element that is associated with a registered resource either via its (lowerCase) `nodeName`
 * or the value of its `as-element` attribute.
 */
class CustomElementSymbol {
    constructor(p, physicalNode, info, res = info.name, bindables = info.bindables) {
        this.physicalNode = physicalNode;
        this.info = info;
        this.res = res;
        this.bindables = bindables;
        this.flags = 16 /* isCustomElement */;
        this.isTarget = true;
        this.templateController = null;
        this._customAttributes = null;
        this._plainAttributes = null;
        this._bindings = null;
        this._childNodes = null;
        this._projections = null;
        if (info.containerless) {
            this.isContainerless = true;
            this.marker = createMarker(p);
            this.flags |= 1024 /* hasMarker */;
        }
        else {
            this.isContainerless = false;
            this.marker = null;
        }
    }
    get customAttributes() {
        if (this._customAttributes === null) {
            this._customAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
    get childNodes() {
        if (this._childNodes === null) {
            this._childNodes = [];
            this.flags |= 16384 /* hasChildNodes */;
        }
        return this._childNodes;
    }
    get projections() {
        if (this._projections === null) {
            this._projections = [];
            this.flags |= 32768 /* hasProjections */;
        }
        return this._projections;
    }
}
class LetElementSymbol {
    constructor(p, physicalNode, marker = createMarker(p)) {
        this.physicalNode = physicalNode;
        this.marker = marker;
        this.flags = 32 /* isLetElement */ | 1024 /* hasMarker */;
        this.toBindingContext = false;
        this._bindings = null;
    }
    get bindings() {
        if (this._bindings === null) {
            this._bindings = [];
            this.flags |= 8192 /* hasBindings */;
        }
        return this._bindings;
    }
}
/**
 * A normal html element that may or may not have attribute behaviors and/or child node behaviors.
 *
 * It is possible for a PlainElementSymbol to not yield any instructions during compilation.
 */
class PlainElementSymbol {
    constructor(physicalNode) {
        this.physicalNode = physicalNode;
        this.flags = 64 /* isPlainElement */;
        this.isTarget = false;
        this.templateController = null;
        this.hasSlots = false;
        this._customAttributes = null;
        this._plainAttributes = null;
        this._childNodes = null;
    }
    get customAttributes() {
        if (this._customAttributes === null) {
            this._customAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._customAttributes;
    }
    get plainAttributes() {
        if (this._plainAttributes === null) {
            this._plainAttributes = [];
            this.flags |= 4096 /* hasAttributes */;
        }
        return this._plainAttributes;
    }
    get childNodes() {
        if (this._childNodes === null) {
            this._childNodes = [];
            this.flags |= 16384 /* hasChildNodes */;
        }
        return this._childNodes;
    }
}
/**
 * A standalone text node that has an interpolation.
 */
class TextSymbol {
    constructor(p, physicalNode, interpolation, marker = createMarker(p)) {
        this.physicalNode = physicalNode;
        this.interpolation = interpolation;
        this.marker = marker;
        this.flags = 128 /* isText */ | 1024 /* hasMarker */;
    }
}
/**
 * A pre-processed piece of information about a defined bindable property on a custom
 * element or attribute, optimized for consumption by the template compiler.
 */
class BindableInfo {
    constructor(
    /**
     * The pre-processed *property* (not attribute) name of the bindable, which is
     * (in order of priority):
     *
     * 1. The `property` from the description (if defined)
     * 2. The name of the property of the bindable itself
     */
    propName, 
    /**
     * The pre-processed (default) bindingMode of the bindable, which is (in order of priority):
     *
     * 1. The `mode` from the bindable (if defined and not bindingMode.default)
     * 2. The `defaultBindingMode` (if it's an attribute, defined, and not bindingMode.default)
     * 3. `bindingMode.toView`
     */
    mode) {
        this.propName = propName;
        this.mode = mode;
    }
}
const elementInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom element resource, optimized
 * for consumption by the template compiler.
 */
class ElementInfo {
    constructor(name, alias, containerless) {
        this.name = name;
        this.alias = alias;
        this.containerless = containerless;
        /**
         * A lookup of the bindables of this element, indexed by the (pre-processed)
         * attribute names as they would be found in parsed markup.
         */
        this.bindables = Object.create(null);
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = elementInfoLookup.get(def);
        if (rec === void 0) {
            elementInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new ElementInfo(def.name, alias === def.name ? void 0 : alias, def.containerless);
            const bindables = def.bindables;
            const defaultBindingMode = BindingMode.toView;
            let bindable;
            let prop;
            let attr;
            let mode;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                // explicitly provided attribute name has priority over the derived implicit attribute name
                if (bindable.attribute !== void 0) {
                    attr = bindable.attribute;
                }
                else {
                    // derive the attribute name from the resolved property name
                    attr = kebabCase(prop);
                }
                if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                info.bindables[attr] = new BindableInfo(prop, mode);
            }
        }
        return info;
    }
}
const attrInfoLookup = new WeakMap();
/**
 * Pre-processed information about a custom attribute resource, optimized
 * for consumption by the template compiler.
 */
class AttrInfo {
    constructor(name, alias, isTemplateController, noMultiBindings) {
        this.name = name;
        this.alias = alias;
        this.isTemplateController = isTemplateController;
        this.noMultiBindings = noMultiBindings;
        /**
         * A lookup of the bindables of this attribute, indexed by the (pre-processed)
         * bindable names as they would be found in the attribute value.
         *
         * Only applicable to multi attribute bindings (semicolon-separated).
         */
        this.bindables = Object.create(null);
        /**
         * The single or first bindable of this attribute, or a default 'value'
         * bindable if no bindables were defined on the attribute.
         *
         * Only applicable to single attribute bindings (where the attribute value
         * contains no semicolons)
         */
        this.bindable = null;
    }
    static from(def, alias) {
        if (def === null) {
            return null;
        }
        let rec = attrInfoLookup.get(def);
        if (rec === void 0) {
            attrInfoLookup.set(def, rec = Object.create(null));
        }
        let info = rec[alias];
        if (info === void 0) {
            info = rec[alias] = new AttrInfo(def.name, alias === def.name ? void 0 : alias, def.isTemplateController, def.noMultiBindings);
            const bindables = def.bindables;
            const defaultBindingMode = def.defaultBindingMode !== void 0 && def.defaultBindingMode !== BindingMode.default
                ? def.defaultBindingMode
                : BindingMode.toView;
            let bindable;
            let prop;
            let mode;
            let hasPrimary = false;
            let isPrimary = false;
            let bindableInfo;
            for (prop in bindables) {
                bindable = bindables[prop];
                // explicitly provided property name has priority over the implicit property name
                if (bindable.property !== void 0) {
                    prop = bindable.property;
                }
                if (bindable.mode !== void 0 && bindable.mode !== BindingMode.default) {
                    mode = bindable.mode;
                }
                else {
                    mode = defaultBindingMode;
                }
                isPrimary = bindable.primary === true;
                bindableInfo = info.bindables[prop] = new BindableInfo(prop, mode);
                if (isPrimary) {
                    if (hasPrimary) {
                        throw new Error('primary already exists');
                    }
                    hasPrimary = true;
                    info.bindable = bindableInfo;
                }
                // set to first bindable by convention
                if (info.bindable === null) {
                    info.bindable = bindableInfo;
                }
            }
            // if no bindables are present, default to "value"
            if (info.bindable === null) {
                info.bindable = new BindableInfo('value', defaultBindingMode);
            }
        }
        return info;
    }
}

var __decorate$n = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function bindingCommand(nameOrDefinition) {
    return function (target) {
        return BindingCommand.define(nameOrDefinition, target);
    };
}
class BindingCommandDefinition {
    constructor(Type, name, aliases, key, type) {
        this.Type = Type;
        this.name = name;
        this.aliases = aliases;
        this.key = key;
        this.type = type;
    }
    static create(nameOrDef, Type) {
        let name;
        let def;
        if (typeof nameOrDef === 'string') {
            name = nameOrDef;
            def = { name };
        }
        else {
            name = nameOrDef.name;
            def = nameOrDef;
        }
        return new BindingCommandDefinition(Type, firstDefined(BindingCommand.getAnnotation(Type, 'name'), name), mergeArrays(BindingCommand.getAnnotation(Type, 'aliases'), def.aliases, Type.aliases), BindingCommand.keyFrom(name), firstDefined(BindingCommand.getAnnotation(Type, 'type'), def.type, Type.type, null));
    }
    register(container) {
        const { Type, key, aliases } = this;
        Registration.singleton(key, Type).register(container);
        Registration.aliasTo(key, Type).register(container);
        registerAliases(aliases, BindingCommand, key, container);
    }
}
const BindingCommand = {
    name: Protocol.resource.keyFor('binding-command'),
    keyFrom(name) {
        return `${BindingCommand.name}:${name}`;
    },
    isType(value) {
        return typeof value === 'function' && Metadata.hasOwn(BindingCommand.name, value);
    },
    define(nameOrDef, Type) {
        const definition = BindingCommandDefinition.create(nameOrDef, Type);
        Metadata.define(BindingCommand.name, definition, definition.Type);
        Metadata.define(BindingCommand.name, definition, definition);
        Protocol.resource.appendTo(Type, BindingCommand.name);
        return definition.Type;
    },
    getDefinition(Type) {
        const def = Metadata.getOwn(BindingCommand.name, Type);
        if (def === void 0) {
            throw new Error(`No definition found for type ${Type.name}`);
        }
        return def;
    },
    annotate(Type, prop, value) {
        Metadata.define(Protocol.annotation.keyFor(prop), value, Type);
    },
    getAnnotation(Type, prop) {
        return Metadata.getOwn(Protocol.annotation.keyFor(prop), Type);
    },
};
function getTarget(binding, makeCamelCase) {
    if (binding.flags & 256 /* isBinding */) {
        return binding.bindable.propName;
    }
    else if (makeCamelCase) {
        return camelCase(binding.syntax.target);
    }
    else {
        return binding.syntax.target;
    }
}
let OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor() {
        this.bindingType = 49 /* OneTimeCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.oneTime);
    }
};
OneTimeBindingCommand = __decorate$n([
    bindingCommand('one-time')
], OneTimeBindingCommand);
let ToViewBindingCommand = class ToViewBindingCommand {
    constructor() {
        this.bindingType = 50 /* ToViewCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.toView);
    }
};
ToViewBindingCommand = __decorate$n([
    bindingCommand('to-view')
], ToViewBindingCommand);
let FromViewBindingCommand = class FromViewBindingCommand {
    constructor() {
        this.bindingType = 51 /* FromViewCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.fromView);
    }
};
FromViewBindingCommand = __decorate$n([
    bindingCommand('from-view')
], FromViewBindingCommand);
let TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor() {
        this.bindingType = 52 /* TwoWayCommand */;
    }
    compile(binding) {
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), BindingMode.twoWay);
    }
};
TwoWayBindingCommand = __decorate$n([
    bindingCommand('two-way')
], TwoWayBindingCommand);
let DefaultBindingCommand = class DefaultBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        let mode = BindingMode.default;
        if (binding instanceof BindingSymbol) {
            mode = binding.bindable.mode;
        }
        else {
            const command = binding.syntax.command;
            switch (command) {
                case 'bind':
                case 'to-view':
                    mode = BindingMode.toView;
                    break;
                case 'one-time':
                    mode = BindingMode.oneTime;
                    break;
                case 'from-view':
                    mode = BindingMode.fromView;
                    break;
                case 'two-way':
                    mode = BindingMode.twoWay;
                    break;
            }
        }
        return new PropertyBindingInstruction(binding.expression, getTarget(binding, false), mode === BindingMode.default ? BindingMode.toView : mode);
    }
};
DefaultBindingCommand = __decorate$n([
    bindingCommand('bind')
], DefaultBindingCommand);
let CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153 /* CallCommand */;
    }
    compile(binding) {
        return new CallBindingInstruction(binding.expression, getTarget(binding, true));
    }
};
CallBindingCommand = __decorate$n([
    bindingCommand('call')
], CallBindingCommand);
let ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539 /* ForCommand */;
    }
    compile(binding) {
        return new IteratorBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
ForBindingCommand = __decorate$n([
    bindingCommand('for')
], ForBindingCommand);
let TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182 /* TriggerCommand */;
    }
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), true, DelegationStrategy.none);
    }
};
TriggerBindingCommand = __decorate$n([
    bindingCommand('trigger')
], TriggerBindingCommand);
let DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184 /* DelegateCommand */;
    }
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), false, DelegationStrategy.bubbling);
    }
};
DelegateBindingCommand = __decorate$n([
    bindingCommand('delegate')
], DelegateBindingCommand);
let CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183 /* CaptureCommand */;
    }
    compile(binding) {
        return new ListenerBindingInstruction(binding.expression, getTarget(binding, false), false, DelegationStrategy.capturing);
    }
};
CaptureBindingCommand = __decorate$n([
    bindingCommand('capture')
], CaptureBindingCommand);
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
let AttrBindingCommand = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        const target = getTarget(binding, false);
        return new AttributeBindingInstruction(target, binding.expression, target);
    }
};
AttrBindingCommand = __decorate$n([
    bindingCommand('attr')
], AttrBindingCommand);
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
let StyleBindingCommand = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('style', binding.expression, getTarget(binding, false));
    }
};
StyleBindingCommand = __decorate$n([
    bindingCommand('style')
], StyleBindingCommand);
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
let ClassBindingCommand = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('class', binding.expression, getTarget(binding, false));
    }
};
ClassBindingCommand = __decorate$n([
    bindingCommand('class')
], ClassBindingCommand);
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) attached to an element
 */
let RefBindingCommand = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreAttr */;
    }
    compile(binding) {
        return new RefBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
RefBindingCommand = __decorate$n([
    bindingCommand('ref')
], RefBindingCommand);

const IsDataAttribute = createLookup();
function isDataAttribute(obj, key, svgAnalyzer) {
    if (IsDataAttribute[key] === true) {
        return true;
    }
    if (typeof key !== 'string') {
        return false;
    }
    const prefix = key.slice(0, 5);
    // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
    // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
    return IsDataAttribute[key] =
        prefix === 'aria-' ||
            prefix === 'data-' ||
            svgAnalyzer.isStandardSvgAttribute(obj, key);
}
function createLookup() {
    return Object.create(null);
}

const ISVGAnalyzer = DI.createInterface('ISVGAnalyzer', x => x.singleton(NoopSVGAnalyzer));
class NoopSVGAnalyzer {
    isStandardSvgAttribute(node, attributeName) {
        return false;
    }
}

const IAttrSyntaxTransformer = DI
    .createInterface('IAttrSyntaxTransformer', x => x.singleton(AttrSyntaxTransformer));
class AttrSyntaxTransformer {
    constructor(svg) {
        this.svg = svg;
        /**
         * @internal
         */
        this.fns = [];
        /**
         * @internal
         */
        this.tagAttrMap = createLookup();
        /**
         * @internal
         */
        this.globalAttrMap = createLookup();
        this.useMapping({
            LABEL: { for: 'htmlFor' },
            IMG: { usemap: 'useMap' },
            INPUT: {
                maxlength: 'maxLength',
                minlength: 'minLength',
                formaction: 'formAction',
                formenctype: 'formEncType',
                formmethod: 'formMethod',
                formnovalidate: 'formNoValidate',
                formtarget: 'formTarget',
                inputmode: 'inputMode',
            },
            TEXTAREA: { maxlength: 'maxLength' },
            TD: { rowspan: 'rowSpan', colspan: 'colSpan' },
            TH: { rowspan: 'rowSpan', colspan: 'colSpan' },
        });
        this.useGlobalMapping({
            accesskey: 'accessKey',
            contenteditable: 'contentEditable',
            tabindex: 'tabIndex',
            textcontent: 'textContent',
            innerhtml: 'innerHTML',
            scrolltop: 'scrollTop',
            scrollleft: 'scrollLeft',
            readonly: 'readOnly',
        });
    }
    static get inject() { return [ISVGAnalyzer]; }
    /**
     * Allow application to teach Aurelia how to define how to map attributes to properties
     * based on element tagName
     */
    useMapping(config) {
        var _a;
        var _b;
        let newAttrMapping;
        let targetAttrMapping;
        let tagName;
        let attr;
        for (tagName in config) {
            newAttrMapping = config[tagName];
            targetAttrMapping = (_a = (_b = this.tagAttrMap)[tagName]) !== null && _a !== void 0 ? _a : (_b[tagName] = createLookup());
            for (attr in newAttrMapping) {
                if (targetAttrMapping[attr] !== void 0) {
                    throw createMappedError(attr, tagName);
                }
                targetAttrMapping[attr] = newAttrMapping[attr];
            }
        }
    }
    /**
     * Allow applications to teach Aurelia how to define how to map attributes to properties
     * for all elements
     */
    useGlobalMapping(config) {
        const mapper = this.globalAttrMap;
        for (const attr in config) {
            if (mapper[attr] !== void 0) {
                throw createMappedError(attr, '*');
            }
            mapper[attr] = config[attr];
        }
    }
    /**
     * Add a given function to a list of fns that will be used
     * to check if `'bind'` command can be transformed to `'two-way'` command.
     *
     * If one of those functions in this lists returns true, the `'bind'` command
     * will be transformed into `'two-way'` command.
     *
     * The function will be called with 2 parameters:
     * - element: the element that the template compiler is currently working with
     * - property: the target property name
     */
    useTwoWay(fn) {
        this.fns.push(fn);
    }
    /**
     * @internal
     */
    transform(node, attrSyntax) {
        var _a, _b, _c;
        if (attrSyntax.command === 'bind' &&
            (
            // note: even though target could possibly be mapped to a different name
            // the final property name shouldn't affect the two way transformation
            // as they both should work with original source attribute name
            shouldDefaultToTwoWay(node, attrSyntax.target) ||
                this.fns.length > 0 && this.fns.some(fn => fn(node, attrSyntax.target)))) {
            attrSyntax.command = 'two-way';
        }
        const attr = attrSyntax.target;
        attrSyntax.target = (_c = (_b = (_a = this.tagAttrMap[node.tagName]) === null || _a === void 0 ? void 0 : _a[attr]) !== null && _b !== void 0 ? _b : this.globalAttrMap[attr]) !== null && _c !== void 0 ? _c : (isDataAttribute(node, attr, this.svg)
            ? attr
            : camelCase(attr));
        // attrSyntax.target = this.map(node.tagName, attrSyntax.target);
    }
}
function shouldDefaultToTwoWay(element, attr) {
    switch (element.tagName) {
        case 'INPUT':
            switch (element.type) {
                case 'checkbox':
                case 'radio':
                    return attr === 'checked';
                // note:
                // ideally, it should check for corresponding input type first
                // as 'files' shouldn't be two way on a number input, for example
                // but doing it this way is acceptable-ish, as the common user expectations,
                // and the behavior of the control for these properties are the same,
                // regardless the type of the <input>
                default:
                    return attr === 'value' || attr === 'files' || attr === 'value-as-number' || attr === 'value-as-date';
            }
        case 'TEXTAREA':
        case 'SELECT':
            return attr === 'value';
        default:
            switch (attr) {
                case 'textcontent':
                case 'innerhtml':
                    return element.hasAttribute('contenteditable');
                case 'scrolltop':
                case 'scrollleft':
                    return true;
                default:
                    return false;
            }
    }
}
function createMappedError(attr, tagName) {
    return new Error(`Attribute ${attr} has been already registered for ${tagName === '*' ? 'all elements' : `<${tagName}/>`}`);
}

const invalidSurrogateAttribute = Object.assign(Object.create(null), {
    'id': true,
    'au-slot': true,
});
const attributesToIgnore = Object.assign(Object.create(null), {
    'as-element': true,
});
function hasInlineBindings(rawValue) {
    const len = rawValue.length;
    let ch = 0;
    for (let i = 0; i < len; ++i) {
        ch = rawValue.charCodeAt(i);
        if (ch === 92 /* Backslash */) {
            ++i;
            // Ignore whatever comes next because it's escaped
        }
        else if (ch === 58 /* Colon */) {
            return true;
        }
        else if (ch === 36 /* Dollar */ && rawValue.charCodeAt(i + 1) === 123 /* OpenBrace */) {
            return false;
        }
    }
    return false;
}
function processInterpolationText(symbol) {
    const node = symbol.physicalNode;
    const parentNode = node.parentNode;
    while (node.nextSibling !== null && node.nextSibling.nodeType === 3 /* Text */) {
        parentNode.removeChild(node.nextSibling);
    }
    node.textContent = '';
    parentNode.insertBefore(symbol.marker, node);
}
function isTemplateControllerOf(proxy, manifest) {
    return proxy !== manifest;
}
/**
 * A (temporary) standalone function that purely does the DOM processing (lifting) related to template controllers.
 * It's a first refactoring step towards separating DOM parsing/binding from mutations.
 */
function processTemplateControllers(p, manifestProxy, manifest) {
    const manifestNode = manifest.physicalNode;
    let current = manifestProxy;
    let currentTemplate;
    while (isTemplateControllerOf(current, manifest)) {
        if (current.template === manifest) {
            // the DOM linkage is still in its original state here so we can safely assume the parentNode is non-null
            manifestNode.parentNode.replaceChild(current.marker, manifestNode);
            // if the manifest is a template element (e.g. <template repeat.for="...">) then we can skip one lift operation
            // and simply use the template directly, saving a bit of work
            if (manifestNode.nodeName === 'TEMPLATE') {
                current.physicalNode = manifestNode;
                // the template could safely stay without affecting anything visible, but let's keep the DOM tidy
                manifestNode.remove();
            }
            else {
                // the manifest is not a template element so we need to wrap it in one
                currentTemplate = current.physicalNode = p.document.createElement('template');
                currentTemplate.content.appendChild(manifestNode);
            }
        }
        else {
            currentTemplate = current.physicalNode = p.document.createElement('template');
            currentTemplate.content.appendChild(current.marker);
        }
        manifestNode.removeAttribute(current.syntax.rawName);
        current = current.template;
    }
}
// - on binding plain attribute, if there's interpolation
// the attribute itself should be removed completely
// otherwise, produce invalid output sometimes.
// e.g
// <input value=${value}>
//    without removing: `<input value="">
//    with removing: `<input>
// <circle cx=${x}>
//    without removing `<circle cx="">
//    with removing: `<circle>
//
// - custom attribute probably should be removed too
var AttrBindingSignal;
(function (AttrBindingSignal) {
    AttrBindingSignal[AttrBindingSignal["none"] = 0] = "none";
    AttrBindingSignal[AttrBindingSignal["remove"] = 1] = "remove";
})(AttrBindingSignal || (AttrBindingSignal = {}));
/**
 * TemplateBinder. Todo: describe goal of this class
 */
class TemplateBinder {
    constructor(platform, container, attrParser, exprParser, attrSyntaxTransformer) {
        this.platform = platform;
        this.container = container;
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.attrSyntaxTransformer = attrSyntaxTransformer;
        this.commandLookup = Object.create(null);
    }
    bind(node) {
        const surrogate = new PlainElementSymbol(node);
        const attributes = node.attributes;
        let i = 0;
        let attr;
        let attrSyntax;
        let bindingCommand = null;
        let attrInfo = null;
        while (i < attributes.length) {
            attr = attributes[i];
            attrSyntax = this.attrParser.parse(attr.name, attr.value);
            if (invalidSurrogateAttribute[attrSyntax.target] === true) {
                throw new Error(`Invalid surrogate attribute: ${attrSyntax.target}`);
                // TODO: use reporter
            }
            bindingCommand = this.getBindingCommand(attrSyntax, true);
            if (bindingCommand === null || (bindingCommand.bindingType & 4096 /* IgnoreAttr */) === 0) {
                attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);
                if (attrInfo === null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    // NOTE: on surrogate, we don't care about removing the attribute with interpolation
                    // as the element is not used (cloned)
                    this.bindPlainAttribute(
                    /* node       */ node, 
                    /* attrSyntax */ attrSyntax, 
                    /* attr       */ attr, 
                    /* surrogate  */ surrogate, 
                    /* manifest   */ surrogate);
                }
                else if (attrInfo.isTemplateController) {
                    throw new Error('Cannot have template controller on surrogate element.');
                    // TODO: use reporter
                }
                else {
                    this.bindCustomAttribute(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo, 
                    /* command    */ bindingCommand, 
                    /* manifest   */ surrogate);
                }
            }
            else {
                // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                // NOTE: on surrogate, we don't care about removing the attribute with interpolation
                // as the element is not used (cloned)
                this.bindPlainAttribute(
                /* node       */ node, 
                /* attrSyntax */ attrSyntax, 
                /* attr       */ attr, 
                /* surrogate  */ surrogate, 
                /* manifest   */ surrogate);
            }
            ++i;
        }
        this.bindChildNodes(
        /* node               */ node, 
        /* surrogate          */ surrogate, 
        /* manifest           */ surrogate, 
        /* manifestRoot       */ null, 
        /* parentManifestRoot */ null);
        return surrogate;
    }
    bindManifest(parentManifest, node, surrogate, manifest, manifestRoot, parentManifestRoot) {
        var _a, _b, _c, _d;
        switch (node.nodeName) {
            case 'LET':
                // let cannot have children and has some different processing rules, so return early
                this.bindLetElement(
                /* parentManifest */ parentManifest, 
                /* node           */ node);
                return;
            case 'SLOT':
                surrogate.hasSlots = true;
                break;
        }
        let name = node.getAttribute('as-element');
        if (name === null) {
            name = node.nodeName.toLowerCase();
        }
        const isAuSlot = name === 'au-slot';
        const definition = this.container.find(CustomElement, name);
        const elementInfo = ElementInfo.from(definition, name);
        let compileChildren = true;
        if (elementInfo === null) {
            // there is no registered custom element with this name
            manifest = new PlainElementSymbol(node);
        }
        else {
            // it's a custom element so we set the manifestRoot as well (for storing replaces)
            compileChildren = ((_c = (_b = (_a = definition === null || definition === void 0 ? void 0 : definition.processContent) === null || _a === void 0 ? void 0 : _a.bind(definition.Type)) === null || _b === void 0 ? void 0 : _b(node, this.platform)) !== null && _c !== void 0 ? _c : true);
            parentManifestRoot = manifestRoot;
            const ceSymbol = new CustomElementSymbol(this.platform, node, elementInfo);
            if (isAuSlot) {
                ceSymbol.flags = 512 /* isAuSlot */;
                ceSymbol.slotName = (_d = node.getAttribute("name")) !== null && _d !== void 0 ? _d : "default";
            }
            manifestRoot = manifest = ceSymbol;
        }
        if (compileChildren) {
            // lifting operations done by template controllers and replaces effectively unlink the nodes, so start at the bottom
            this.bindChildNodes(
            /* node               */ node, 
            /* surrogate          */ surrogate, 
            /* manifest           */ manifest, 
            /* manifestRoot       */ manifestRoot, 
            /* parentManifestRoot */ parentManifestRoot);
        }
        // the parentManifest will receive either the direct child nodes, or the template controllers / replaces
        // wrapping them
        this.bindAttributes(
        /* node               */ node, 
        /* parentManifest     */ parentManifest, 
        /* surrogate          */ surrogate, 
        /* manifest           */ manifest, 
        /* manifestRoot       */ manifestRoot, 
        /* parentManifestRoot */ parentManifestRoot);
        if (manifestRoot === manifest && manifest.isContainerless) {
            node.parentNode.replaceChild(manifest.marker, node);
        }
        else if (manifest.isTarget) {
            node.classList.add('au');
        }
    }
    bindLetElement(parentManifest, node) {
        const symbol = new LetElementSymbol(this.platform, node);
        parentManifest.childNodes.push(symbol);
        const attributes = node.attributes;
        let i = 0;
        while (i < attributes.length) {
            const attr = attributes[i];
            if (attr.name === 'to-binding-context') {
                node.removeAttribute('to-binding-context');
                symbol.toBindingContext = true;
                continue;
            }
            const attrSyntax = this.attrParser.parse(attr.name, attr.value);
            const command = this.getBindingCommand(attrSyntax, false);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrSyntax.rawValue, bindingType);
            const to = camelCase(attrSyntax.target);
            const info = new BindableInfo(to, BindingMode.toView);
            symbol.bindings.push(new BindingSymbol(command, info, expr, attrSyntax.rawValue, to));
            ++i;
        }
        node.parentNode.replaceChild(symbol.marker, node);
    }
    bindAttributes(node, parentManifest, surrogate, manifest, manifestRoot, parentManifestRoot) {
        var _a, _b, _c;
        // This is the top-level symbol for the current depth.
        // If there are no template controllers or replaces, it is always the manifest itself.
        // If there are template controllers, then this will be the outer-most TemplateControllerSymbol.
        let manifestProxy = manifest;
        let previousController = (void 0);
        let currentController = (void 0);
        const attributes = node.attributes;
        let i = 0;
        let attr;
        let bindSignal;
        let attrSyntax;
        let bindingCommand = null;
        let attrInfo = null;
        while (i < attributes.length) {
            attr = attributes[i];
            ++i;
            if (attributesToIgnore[attr.name] === true) {
                continue;
            }
            attrSyntax = this.attrParser.parse(attr.name, attr.value);
            bindingCommand = this.getBindingCommand(attrSyntax, true);
            if (bindingCommand === null || (bindingCommand.bindingType & 4096 /* IgnoreAttr */) === 0) {
                attrInfo = AttrInfo.from(this.container.find(CustomAttribute, attrSyntax.target), attrSyntax.target);
                if (attrInfo === null) {
                    // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                    bindSignal = this.bindPlainAttribute(
                    /* node       */ node, 
                    /* attrSyntax */ attrSyntax, 
                    /* attr       */ attr, 
                    /* surrogate  */ surrogate, 
                    /* manifest   */ manifest);
                    if (bindSignal === 1 /* remove */) {
                        node.removeAttributeNode(attr);
                        --i;
                    }
                }
                else if (attrInfo.isTemplateController) {
                    // the manifest is wrapped by the inner-most template controller (if there are multiple on the same element)
                    // so keep setting manifest.templateController to the latest template controller we find
                    currentController = manifest.templateController = this.declareTemplateController(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo);
                    // the proxy and the manifest are only identical when we're at the first template controller (since the controller
                    // is assigned to the proxy), so this evaluates to true at most once per node
                    if (manifestProxy === manifest) {
                        currentController.template = manifest;
                        manifestProxy = currentController;
                    }
                    else {
                        currentController.templateController = previousController;
                        currentController.template = previousController.template;
                        previousController.template = currentController;
                    }
                    previousController = currentController;
                }
                else {
                    // a regular custom attribute
                    this.bindCustomAttribute(
                    /* attrSyntax */ attrSyntax, 
                    /* attrInfo   */ attrInfo, 
                    /* command    */ bindingCommand, 
                    /* manifest   */ manifest);
                }
            }
            else {
                // it's not a custom attribute but might be a regular bound attribute or interpolation (it might also be nothing)
                bindSignal = this.bindPlainAttribute(
                /* node       */ node, 
                /* attrSyntax */ attrSyntax, 
                /* attr       */ attr, 
                /* surrogate  */ surrogate, 
                /* manifest   */ manifest);
                if (bindSignal === 1 /* remove */) {
                    node.removeAttributeNode(attr);
                    --i;
                }
            }
        }
        if (node.tagName === 'INPUT') {
            const type = node.type;
            if (type === 'checkbox' || type === 'radio') {
                this.ensureAttributeOrder(manifest);
            }
        }
        let projection = node.getAttribute('au-slot');
        if (projection === '') {
            projection = 'default';
        }
        const hasProjection = projection !== null;
        if (hasProjection && isTemplateControllerOf(manifestProxy, manifest)) {
            // prevents <some-el au-slot TEMPLATE.CONTROLLER></some-el>.
            throw new Error(`Unsupported usage of [au-slot="${projection}"] along with a template controller (if, else, repeat.for etc.) found (example: <some-el au-slot if.bind="true"></some-el>).`);
            /**
             * TODO: prevent <template TEMPLATE.CONTROLLER><some-el au-slot></some-el></template>.
             * But there is not easy way for now, as the attribute binding is done after binding the child nodes.
             * This means by the time the template controller in the ancestor is processed, the projection is already registered.
             */
        }
        const parentName = (_b = (_a = node.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute('as-element')) !== null && _b !== void 0 ? _b : (_c = node.parentNode) === null || _c === void 0 ? void 0 : _c.nodeName.toLowerCase();
        if (hasProjection
            && (manifestRoot === null
                || parentName === void 0
                || this.container.find(CustomElement, parentName) === null)) {
            /**
             * Prevents the following cases:
             * - <template><div au-slot></div></template>
             * - <my-ce><div><div au-slot></div></div></my-ce>
             * - <my-ce><div au-slot="s1"><div au-slot="s2"></div></div></my-ce>
             */
            throw new Error(`Unsupported usage of [au-slot="${projection}"]. It seems that projection is attempted, but not for a custom element.`);
        }
        processTemplateControllers(this.platform, manifestProxy, manifest);
        const projectionOwner = manifest === manifestRoot ? parentManifestRoot : manifestRoot;
        if (!hasProjection || projectionOwner === null) {
            // the proxy is either the manifest itself or the outer-most controller; add it directly to the parent
            parentManifest.childNodes.push(manifestProxy);
        }
        else if (hasProjection) {
            projectionOwner.projections.push(new ProjectionSymbol(projection, manifestProxy));
            node.removeAttribute('au-slot');
            node.remove();
        }
    }
    // TODO: refactor to use render priority slots (this logic shouldn't be in the template binder)
    ensureAttributeOrder(manifest) {
        // swap the order of checked and model/value attribute, so that the required observers are prepared for checked-observer
        const attributes = manifest.plainAttributes;
        let modelOrValueIndex = void 0;
        let checkedIndex = void 0;
        let found = 0;
        for (let i = 0; i < attributes.length && found < 3; i++) {
            switch (attributes[i].syntax.target) {
                case 'model':
                case 'value':
                case 'matcher':
                    modelOrValueIndex = i;
                    found++;
                    break;
                case 'checked':
                    checkedIndex = i;
                    found++;
                    break;
            }
        }
        if (checkedIndex !== void 0 && modelOrValueIndex !== void 0 && checkedIndex < modelOrValueIndex) {
            [attributes[modelOrValueIndex], attributes[checkedIndex]] = [attributes[checkedIndex], attributes[modelOrValueIndex]];
        }
    }
    bindChildNodes(node, surrogate, manifest, manifestRoot, parentManifestRoot) {
        let childNode;
        if (node.nodeName === 'TEMPLATE') {
            childNode = node.content.firstChild;
        }
        else {
            childNode = node.firstChild;
        }
        let nextChild;
        while (childNode !== null) {
            switch (childNode.nodeType) {
                case 1 /* Element */:
                    nextChild = childNode.nextSibling;
                    this.bindManifest(
                    /* parentManifest     */ manifest, 
                    /* node               */ childNode, 
                    /* surrogate          */ surrogate, 
                    /* manifest           */ manifest, 
                    /* manifestRoot       */ manifestRoot, 
                    /* parentManifestRoot */ parentManifestRoot);
                    childNode = nextChild;
                    break;
                case 3 /* Text */:
                    childNode = this.bindText(
                    /* textNode */ childNode, 
                    /* manifest */ manifest).nextSibling;
                    break;
                case 4 /* CDATASection */:
                case 7 /* ProcessingInstruction */:
                case 8 /* Comment */:
                case 10 /* DocumentType */:
                    childNode = childNode.nextSibling;
                    break;
                case 9 /* Document */:
                case 11 /* DocumentFragment */:
                    childNode = childNode.firstChild;
            }
        }
    }
    bindText(textNode, manifest) {
        const interpolation = this.exprParser.parse(textNode.wholeText, 2048 /* Interpolation */);
        if (interpolation !== null) {
            const symbol = new TextSymbol(this.platform, textNode, interpolation);
            manifest.childNodes.push(symbol);
            processInterpolationText(symbol);
        }
        let next = textNode;
        while (next.nextSibling !== null && next.nextSibling.nodeType === 3 /* Text */) {
            next = next.nextSibling;
        }
        return next;
    }
    declareTemplateController(attrSyntax, attrInfo) {
        let symbol;
        const attrRawValue = attrSyntax.rawValue;
        const command = this.getBindingCommand(attrSyntax, false);
        // multi-bindings logic here is similar to (and explained in) bindCustomAttribute
        const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);
        if (isMultiBindings) {
            symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
            this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
        }
        else {
            symbol = new TemplateControllerSymbol(this.platform, attrSyntax, attrInfo);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrRawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
        }
        return symbol;
    }
    bindCustomAttribute(attrSyntax, attrInfo, command, manifest) {
        let symbol;
        const attrRawValue = attrSyntax.rawValue;
        // Custom attributes are always in multiple binding mode,
        // except when they can't be
        // When they cannot be:
        //        * has explicit configuration noMultiBindings: false
        //        * has binding command, ie: <div my-attr.bind="...">.
        //          In this scenario, the value of the custom attributes is required to be a valid expression
        //        * has no colon: ie: <div my-attr="abcd">
        //          In this scenario, it's simply invalid syntax. Consider style attribute rule-value pair: <div style="rule: ruleValue">
        const isMultiBindings = attrInfo.noMultiBindings === false && command === null && hasInlineBindings(attrRawValue);
        if (isMultiBindings) {
            // a multiple-bindings attribute usage (semicolon separated binding) is only valid without a binding command;
            // the binding commands must be declared in each of the property bindings
            symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
            this.bindMultiAttribute(symbol, attrInfo, attrRawValue);
        }
        else {
            symbol = new CustomAttributeSymbol(attrSyntax, attrInfo);
            const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
            const expr = this.exprParser.parse(attrRawValue, bindingType);
            symbol.bindings.push(new BindingSymbol(command, attrInfo.bindable, expr, attrRawValue, attrSyntax.target));
        }
        manifest.customAttributes.push(symbol);
        manifest.isTarget = true;
    }
    bindMultiAttribute(symbol, attrInfo, value) {
        const bindables = attrInfo.bindables;
        const valueLength = value.length;
        let attrName = void 0;
        let attrValue = void 0;
        let start = 0;
        let ch = 0;
        for (let i = 0; i < valueLength; ++i) {
            ch = value.charCodeAt(i);
            if (ch === 92 /* Backslash */) {
                ++i;
                // Ignore whatever comes next because it's escaped
            }
            else if (ch === 58 /* Colon */) {
                attrName = value.slice(start, i);
                // Skip whitespace after colon
                while (value.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                for (; i < valueLength; ++i) {
                    ch = value.charCodeAt(i);
                    if (ch === 92 /* Backslash */) {
                        ++i;
                        // Ignore whatever comes next because it's escaped
                    }
                    else if (ch === 59 /* Semicolon */) {
                        attrValue = value.slice(start, i);
                        break;
                    }
                }
                if (attrValue === void 0) {
                    // No semicolon found, so just grab the rest of the value
                    attrValue = value.slice(start);
                }
                const attrSyntax = this.attrParser.parse(attrName, attrValue);
                const attrTarget = camelCase(attrSyntax.target);
                const command = this.getBindingCommand(attrSyntax, false);
                const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
                const expr = this.exprParser.parse(attrValue, bindingType);
                let bindable = bindables[attrTarget];
                if (bindable === undefined) {
                    // everything in a multi-bindings expression must be used,
                    // so if it's not a bindable then we create one on the spot
                    bindable = bindables[attrTarget] = new BindableInfo(attrTarget, BindingMode.toView);
                }
                symbol.bindings.push(new BindingSymbol(command, bindable, expr, attrValue, attrTarget));
                // Skip whitespace after semicolon
                while (i < valueLength && value.charCodeAt(++i) <= 32 /* Space */)
                    ;
                start = i;
                attrName = void 0;
                attrValue = void 0;
            }
        }
    }
    bindPlainAttribute(node, attrSyntax, attr, surrogate, manifest) {
        const attrTarget = attrSyntax.target;
        const attrRawValue = attrSyntax.rawValue;
        const command = this.getBindingCommand(attrSyntax, false);
        const bindingType = command === null ? 2048 /* Interpolation */ : command.bindingType;
        let isInterpolation = false;
        let expr;
        if ((manifest.flags & 16 /* isCustomElement */) > 0) {
            const bindable = manifest.bindables[attrTarget];
            if (bindable != null) {
                // if it looks like this
                // <my-el value.bind>
                // it means
                // <my-el value.bind="value">
                // this is a shortcut
                const realAttrValue = attrRawValue.length === 0
                    && (bindingType
                        & (53 /* BindCommand */
                            | 49 /* OneTimeCommand */
                            | 50 /* ToViewCommand */
                            | 52 /* TwoWayCommand */)) > 0
                    ? camelCase(attrTarget)
                    : attrRawValue;
                expr = this.exprParser.parse(realAttrValue, bindingType);
                // if the attribute name matches a bindable property name, add it regardless of whether it's a command, interpolation, or just a plain string;
                // the template compiler will translate it to the correct instruction
                manifest.bindings.push(new BindingSymbol(command, bindable, expr, attrRawValue, attrTarget));
                isInterpolation = bindingType === 2048 /* Interpolation */ && expr != null;
                manifest.isTarget = true;
                return isInterpolation
                    ? 1 /* remove */
                    : 0 /* none */;
            }
        }
        // plain attribute, on a normal, or a custom element here
        // regardless, can process the same way
        expr = this.exprParser.parse(attrRawValue, bindingType);
        isInterpolation = bindingType === 2048 /* Interpolation */ && expr != null;
        if ((bindingType & 4096 /* IgnoreAttr */) === 0) {
            this.attrSyntaxTransformer.transform(node, attrSyntax);
        }
        if (expr != null) {
            // either a binding command, an interpolation, or a ref
            manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
            manifest.isTarget = true;
        }
        else if (manifest === surrogate) {
            // any attributes, even if they are plain (no command/interpolation etc), should be added if they
            // are on the surrogate element
            manifest.plainAttributes.push(new PlainAttributeSymbol(attrSyntax, command, expr));
        }
        return isInterpolation
            ? 1 /* remove */
            : 0 /* none */;
    }
    /**
     * Retrieve a binding command resource.
     *
     * @param name - The parsed `AttrSyntax`
     *
     * @returns An instance of the command if it exists, or `null` if it does not exist.
     */
    getBindingCommand(syntax, optional) {
        const name = syntax.command;
        if (name === null) {
            return null;
        }
        let result = this.commandLookup[name];
        if (result === void 0) {
            result = this.container.create(BindingCommand, name);
            if (result === null) {
                if (optional) {
                    return null;
                }
                throw new Error(`Unknown binding command: ${name}`);
            }
            this.commandLookup[name] = result;
        }
        return result;
    }
}

var __decorate$m = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$k = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const ITemplateElementFactory = DI.createInterface('ITemplateElementFactory', x => x.singleton(TemplateElementFactory));
const markupCache = {};
let TemplateElementFactory = class TemplateElementFactory {
    constructor(p) {
        this.p = p;
        this.template = p.document.createElement('template');
    }
    createTemplate(input) {
        var _a;
        if (typeof input === 'string') {
            let result = markupCache[input];
            if (result === void 0) {
                const template = this.template;
                template.innerHTML = input;
                const node = template.content.firstElementChild;
                // if the input is either not wrapped in a template or there is more than one node,
                // return the whole template that wraps it/them (and create a new one for the next input)
                if (node == null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling != null) {
                    this.template = this.p.document.createElement('template');
                    result = template;
                }
                else {
                    // the node to return is both a template and the only node, so return just the node
                    // and clean up the template for the next input
                    template.content.removeChild(node);
                    result = node;
                }
                markupCache[input] = result;
            }
            return result.cloneNode(true);
        }
        if (input.nodeName !== 'TEMPLATE') {
            // if we get one node that is not a template, wrap it in one
            const template = this.p.document.createElement('template');
            template.content.appendChild(input);
            return template;
        }
        // we got a template element, remove it from the DOM if it's present there and don't
        // do any other processing
        (_a = input.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(input);
        return input.cloneNode(true);
    }
};
TemplateElementFactory = __decorate$m([
    __param$k(0, IPlatform)
], TemplateElementFactory);

var __decorate$l = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$j = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
class CustomElementCompilationUnit {
    constructor(partialDefinition, surrogate, template) {
        this.partialDefinition = partialDefinition;
        this.surrogate = surrogate;
        this.template = template;
        this.instructions = [];
        this.surrogates = [];
        this.projectionsMap = new Map();
    }
    toDefinition() {
        const def = this.partialDefinition;
        return CustomElementDefinition.create({
            ...def,
            instructions: mergeArrays(def.instructions, this.instructions),
            surrogates: mergeArrays(def.surrogates, this.surrogates),
            template: this.template,
            needsCompile: false,
            hasSlots: this.surrogate.hasSlots,
            projectionsMap: this.projectionsMap,
        });
    }
}
var LocalTemplateBindableAttributes;
(function (LocalTemplateBindableAttributes) {
    LocalTemplateBindableAttributes["property"] = "property";
    LocalTemplateBindableAttributes["attribute"] = "attribute";
    LocalTemplateBindableAttributes["mode"] = "mode";
})(LocalTemplateBindableAttributes || (LocalTemplateBindableAttributes = {}));
const allowedLocalTemplateBindableAttributes = Object.freeze([
    "property" /* property */,
    "attribute" /* attribute */,
    "mode" /* mode */
]);
const localTemplateIdentifier = 'as-custom-element';
/**
 * Default (runtime-agnostic) implementation for `ITemplateCompiler`.
 *
 * @internal
 */
let TemplateCompiler = class TemplateCompiler {
    constructor(factory, attrParser, exprParser, attrSyntaxModifier, logger, p) {
        this.factory = factory;
        this.attrParser = attrParser;
        this.exprParser = exprParser;
        this.attrSyntaxModifier = attrSyntaxModifier;
        this.p = p;
        this.logger = logger.scopeTo('TemplateCompiler');
    }
    get name() {
        return 'default';
    }
    static register(container) {
        return Registration.singleton(ITemplateCompiler, this).register(container);
    }
    compile(partialDefinition, context, targetedProjections) {
        const definition = CustomElementDefinition.getOrCreate(partialDefinition);
        if (definition.template === null || definition.template === void 0) {
            return definition;
        }
        const { attrParser, exprParser, attrSyntaxModifier, factory } = this;
        const p = context.get(IPlatform);
        const binder = new TemplateBinder(p, context, attrParser, exprParser, attrSyntaxModifier);
        const template = definition.enhance === true
            ? definition.template
            : factory.createTemplate(definition.template);
        processLocalTemplates(template, definition, context, p, this.logger);
        const surrogate = binder.bind(template);
        const compilation = this.compilation = new CustomElementCompilationUnit(definition, surrogate, template);
        const customAttributes = surrogate.customAttributes;
        const plainAttributes = surrogate.plainAttributes;
        const customAttributeLength = customAttributes.length;
        const plainAttributeLength = plainAttributes.length;
        if (customAttributeLength + plainAttributeLength > 0) {
            let offset = 0;
            for (let i = 0; customAttributeLength > i; ++i) {
                compilation.surrogates[offset] = this.compileCustomAttribute(customAttributes[i]);
                offset++;
            }
            for (let i = 0; i < plainAttributeLength; ++i) {
                compilation.surrogates[offset] = this.compilePlainAttribute(plainAttributes[i], true);
                offset++;
            }
        }
        this.compileChildNodes(surrogate, compilation.instructions, compilation.projectionsMap, targetedProjections);
        const compiledDefinition = compilation.toDefinition();
        this.compilation = null;
        return compiledDefinition;
    }
    compileChildNodes(parent, instructionRows, projections, targetedProjections) {
        if ((parent.flags & 16384 /* hasChildNodes */) > 0) {
            const childNodes = parent.childNodes;
            const ii = childNodes.length;
            let childNode;
            for (let i = 0; i < ii; ++i) {
                childNode = childNodes[i];
                if ((childNode.flags & 128 /* isText */) > 0) {
                    instructionRows.push([new TextBindingInstruction(childNode.interpolation)]);
                }
                else if ((childNode.flags & 32 /* isLetElement */) > 0) {
                    const bindings = childNode.bindings;
                    const instructions = [];
                    let binding;
                    const jj = bindings.length;
                    for (let j = 0; j < jj; ++j) {
                        binding = bindings[j];
                        instructions[j] = new LetBindingInstruction(binding.expression, binding.target);
                    }
                    instructionRows.push([new HydrateLetElementInstruction(instructions, childNode.toBindingContext)]);
                }
                else {
                    this.compileParentNode(childNode, instructionRows, projections, targetedProjections);
                }
            }
        }
    }
    compileCustomElement(symbol, instructionRows, projections, targetedProjections) {
        var _a;
        const isAuSlot = (symbol.flags & 512 /* isAuSlot */) > 0;
        // offset 1 to leave a spot for the hydrate instruction so we don't need to create 2 arrays with a spread etc
        const instructionRow = this.compileAttributes(symbol, 1);
        const slotName = symbol.slotName;
        let slotInfo = null;
        if (isAuSlot) {
            const targetedProjection = (_a = targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.projections) === null || _a === void 0 ? void 0 : _a[slotName];
            slotInfo = targetedProjection !== void 0
                ? new SlotInfo(slotName, AuSlotContentType.Projection, new ProjectionContext(targetedProjection, targetedProjections === null || targetedProjections === void 0 ? void 0 : targetedProjections.scope))
                : new SlotInfo(slotName, AuSlotContentType.Fallback, new ProjectionContext(this.compileProjectionFallback(symbol, projections, targetedProjections)));
        }
        const instruction = instructionRow[0] = new HydrateElementInstruction(symbol.res, symbol.info.alias, this.compileBindings(symbol), slotInfo);
        const compiledProjections = this.compileProjections(symbol, projections, targetedProjections);
        if (compiledProjections !== null) {
            projections.set(instruction, compiledProjections);
        }
        instructionRows.push(instructionRow);
        if (!isAuSlot) {
            this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
        }
    }
    compilePlainElement(symbol, instructionRows, projections, targetedProjections) {
        const attributes = this.compileAttributes(symbol, 0);
        if (attributes.length > 0) {
            instructionRows.push(attributes);
        }
        this.compileChildNodes(symbol, instructionRows, projections, targetedProjections);
    }
    compileParentNode(symbol, instructionRows, projections, targetedProjections) {
        switch (symbol.flags & 1023 /* type */) {
            case 16 /* isCustomElement */:
            case 512 /* isAuSlot */:
                this.compileCustomElement(symbol, instructionRows, projections, targetedProjections);
                break;
            case 64 /* isPlainElement */:
                this.compilePlainElement(symbol, instructionRows, projections, targetedProjections);
                break;
            case 1 /* isTemplateController */:
                this.compileTemplateController(symbol, instructionRows, projections, targetedProjections);
        }
    }
    compileTemplateController(symbol, instructionRows, projections, targetedProjections) {
        var _a;
        const bindings = this.compileBindings(symbol);
        const controllerInstructionRows = [];
        this.compileParentNode(symbol.template, controllerInstructionRows, projections, targetedProjections);
        const def = CustomElementDefinition.create({
            name: (_a = symbol.info.alias) !== null && _a !== void 0 ? _a : symbol.info.name,
            template: symbol.physicalNode,
            instructions: controllerInstructionRows,
            needsCompile: false,
        });
        instructionRows.push([new HydrateTemplateController(def, symbol.res, symbol.info.alias, bindings)]);
    }
    compileBindings(symbol) {
        let bindingInstructions;
        if ((symbol.flags & 8192 /* hasBindings */) > 0) {
            // either a custom element with bindings, a custom attribute / template controller with dynamic options,
            // or a single value custom attribute binding
            const { bindings } = symbol;
            const len = bindings.length;
            bindingInstructions = Array(len);
            let i = 0;
            for (; i < len; ++i) {
                bindingInstructions[i] = this.compileBinding(bindings[i]);
            }
        }
        else {
            bindingInstructions = emptyArray;
        }
        return bindingInstructions;
    }
    compileBinding(symbol) {
        if (symbol.command === null) {
            // either an interpolation or a normal string value assigned to an element or attribute binding
            if (symbol.expression === null) {
                // the template binder already filtered out non-bindables, so we know we need a setProperty here
                return new SetPropertyInstruction(symbol.rawValue, symbol.bindable.propName);
            }
            else {
                // either an element binding interpolation or a dynamic options attribute binding interpolation
                return new InterpolationInstruction(symbol.expression, symbol.bindable.propName);
            }
        }
        else {
            // either an element binding command, dynamic options attribute binding command,
            // or custom attribute / template controller (single value) binding command
            return symbol.command.compile(symbol);
        }
    }
    compileAttributes(symbol, offset) {
        let attributeInstructions;
        if ((symbol.flags & 4096 /* hasAttributes */) > 0) {
            // any attributes on a custom element (which are not bindables) or a plain element
            const customAttributes = symbol.customAttributes;
            const plainAttributes = symbol.plainAttributes;
            const customAttributeLength = customAttributes.length;
            const plainAttributesLength = plainAttributes.length;
            attributeInstructions = Array(offset + customAttributeLength + plainAttributesLength);
            for (let i = 0; customAttributeLength > i; ++i) {
                attributeInstructions[offset] = this.compileCustomAttribute(customAttributes[i]);
                offset++;
            }
            for (let i = 0; plainAttributesLength > i; ++i) {
                attributeInstructions[offset] = this.compilePlainAttribute(plainAttributes[i], false);
                offset++;
            }
        }
        else if (offset > 0) {
            attributeInstructions = Array(offset);
        }
        else {
            attributeInstructions = emptyArray;
        }
        return attributeInstructions;
    }
    compileCustomAttribute(symbol) {
        // a normal custom attribute (not template controller)
        const bindings = this.compileBindings(symbol);
        return new HydrateAttributeInstruction(symbol.res, symbol.info.alias, bindings);
    }
    compilePlainAttribute(symbol, isOnSurrogate) {
        if (symbol.command === null) {
            const syntax = symbol.syntax;
            if (symbol.expression === null) {
                const attrRawValue = syntax.rawValue;
                if (isOnSurrogate) {
                    switch (syntax.target) {
                        case 'class':
                            return new SetClassAttributeInstruction(attrRawValue);
                        case 'style':
                            return new SetStyleAttributeInstruction(attrRawValue);
                        // todo:  define how to merge other attribute peacefully
                        //        this is an existing feature request
                    }
                }
                // a plain attribute on a surrogate
                return new SetAttributeInstruction(attrRawValue, syntax.target);
            }
            else {
                // a plain attribute with an interpolation
                return new InterpolationInstruction(symbol.expression, syntax.target);
            }
        }
        else {
            // a plain attribute with a binding command
            return symbol.command.compile(symbol);
        }
    }
    // private compileAttribute(symbol: IAttributeSymbol): AttributeInstruction {
    //   // any attribute on a custom element (which is not a bindable) or a plain element
    //   if (symbol.flags & SymbolFlags.isCustomAttribute) {
    //     return this.compileCustomAttribute(symbol as CustomAttributeSymbol);
    //   } else {
    //     return this.compilePlainAttribute(symbol as PlainAttributeSymbol);
    //   }
    // }
    compileProjections(symbol, projectionMap, targetedProjections) {
        if ((symbol.flags & 32768 /* hasProjections */) === 0) {
            return null;
        }
        const p = this.p;
        const projections = Object.create(null);
        const $projections = symbol.projections;
        const len = $projections.length;
        for (let i = 0; i < len; ++i) {
            const projection = $projections[i];
            const name = projection.name;
            const instructions = [];
            this.compileParentNode(projection.template, instructions, projectionMap, targetedProjections);
            const definition = projections[name];
            if (definition === void 0) {
                let template = projection.template.physicalNode;
                if (template.tagName !== 'TEMPLATE') {
                    const _template = p.document.createElement('template');
                    _template.content.appendChild(template);
                    template = _template;
                }
                projections[name] = CustomElementDefinition.create({ name, template, instructions, needsCompile: false });
            }
            else {
                // consolidate the projections to same slot
                definition.template.content.appendChild(projection.template.physicalNode);
                definition.instructions.push(...instructions);
            }
        }
        return projections;
    }
    compileProjectionFallback(symbol, projections, targetedProjections) {
        const instructions = [];
        this.compileChildNodes(symbol, instructions, projections, targetedProjections);
        const template = this.p.document.createElement('template');
        template.content.append(...toArray(symbol.physicalNode.childNodes));
        return CustomElementDefinition.create({ name: CustomElement.generateName(), template, instructions, needsCompile: false });
    }
};
TemplateCompiler = __decorate$l([
    __param$j(0, ITemplateElementFactory),
    __param$j(1, IAttributeParser),
    __param$j(2, IExpressionParser),
    __param$j(3, IAttrSyntaxTransformer),
    __param$j(4, ILogger),
    __param$j(5, IPlatform)
], TemplateCompiler);
function processTemplateName(localTemplate, localTemplateNames) {
    const name = localTemplate.getAttribute(localTemplateIdentifier);
    if (name === null || name === '') {
        throw new Error('The value of "as-custom-element" attribute cannot be empty for local template');
    }
    if (localTemplateNames.has(name)) {
        throw new Error(`Duplicate definition of the local template named ${name}`);
    }
    else {
        localTemplateNames.add(name);
        localTemplate.removeAttribute(localTemplateIdentifier);
    }
    return name;
}
function getBindingMode(bindable) {
    switch (bindable.getAttribute("mode" /* mode */)) {
        case 'oneTime':
            return BindingMode.oneTime;
        case 'toView':
            return BindingMode.toView;
        case 'fromView':
            return BindingMode.fromView;
        case 'twoWay':
            return BindingMode.twoWay;
        case 'default':
        default:
            return BindingMode.default;
    }
}
function processLocalTemplates(template, definition, context, p, logger) {
    let root;
    if (template.nodeName === 'TEMPLATE') {
        if (template.hasAttribute(localTemplateIdentifier)) {
            throw new Error('The root cannot be a local template itself.');
        }
        root = template.content;
    }
    else {
        root = template;
    }
    const localTemplates = toArray(root.querySelectorAll('template[as-custom-element]'));
    const numLocalTemplates = localTemplates.length;
    if (numLocalTemplates === 0) {
        return;
    }
    if (numLocalTemplates === root.childElementCount) {
        throw new Error('The custom element does not have any content other than local template(s).');
    }
    const localTemplateNames = new Set();
    for (const localTemplate of localTemplates) {
        if (localTemplate.parentNode !== root) {
            throw new Error('Local templates needs to be defined directly under root.');
        }
        const name = processTemplateName(localTemplate, localTemplateNames);
        const localTemplateType = class LocalTemplate {
        };
        const content = localTemplate.content;
        const bindableEls = toArray(content.querySelectorAll('bindable'));
        const bindableInstructions = Bindable.for(localTemplateType);
        const properties = new Set();
        const attributes = new Set();
        for (const bindableEl of bindableEls) {
            if (bindableEl.parentNode !== content) {
                throw new Error('Bindable properties of local templates needs to be defined directly under root.');
            }
            const property = bindableEl.getAttribute("property" /* property */);
            if (property === null) {
                throw new Error(`The attribute 'property' is missing in ${bindableEl.outerHTML}`);
            }
            const attribute = bindableEl.getAttribute("attribute" /* attribute */);
            if (attribute !== null
                && attributes.has(attribute)
                || properties.has(property)) {
                throw new Error(`Bindable property and attribute needs to be unique; found property: ${property}, attribute: ${attribute}`);
            }
            else {
                if (attribute !== null) {
                    attributes.add(attribute);
                }
                properties.add(property);
            }
            bindableInstructions.add({
                property,
                attribute: attribute !== null && attribute !== void 0 ? attribute : void 0,
                mode: getBindingMode(bindableEl),
            });
            const ignoredAttributes = bindableEl.getAttributeNames().filter((attrName) => !allowedLocalTemplateBindableAttributes.includes(attrName));
            if (ignoredAttributes.length > 0) {
                logger.warn(`The attribute(s) ${ignoredAttributes.join(', ')} will be ignored for ${bindableEl.outerHTML}. Only ${allowedLocalTemplateBindableAttributes.join(', ')} are processed.`);
            }
            content.removeChild(bindableEl);
        }
        const localTemplateDefinition = CustomElement.define({ name, template: localTemplate }, localTemplateType);
        // the casting is needed here as the dependencies are typed as readonly array
        definition.dependencies.push(localTemplateDefinition);
        context.register(localTemplateDefinition);
        root.removeChild(localTemplate);
    }
}

class BindingModeBehavior {
    constructor(mode) {
        this.mode = mode;
        this.originalModes = new Map();
    }
    bind(flags, scope, hostScope, binding) {
        this.originalModes.set(binding, binding.mode);
        binding.mode = this.mode;
    }
    unbind(flags, scope, hostScope, binding) {
        binding.mode = this.originalModes.get(binding);
        this.originalModes.delete(binding);
    }
}
class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.oneTime);
    }
}
class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.toView);
    }
}
class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.fromView);
    }
}
class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.twoWay);
    }
}
bindingBehavior('oneTime')(OneTimeBindingBehavior);
bindingBehavior('toView')(ToViewBindingBehavior);
bindingBehavior('fromView')(FromViewBindingBehavior);
bindingBehavior('twoWay')(TwoWayBindingBehavior);

const defaultDelay$1 = 200;
//
// A binding behavior that prevents
// - (v1 + v2) the view-model from being updated in two-way binding, OR
// - (v1) the the view from being updated in to-view binding,
// until a specified interval has passed without any changes
//
class DebounceBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: defaultDelay$1 };
        this.firstArg = null;
        this.task = null;
        this.taskQueue = binding.locator.get(IPlatform$1).taskQueue;
        if (expr.args.length > 0) {
            this.firstArg = expr.args[0];
        }
    }
    callSource(args) {
        this.queueTask(() => this.binding.callSource(args));
        return void 0;
    }
    handleChange(newValue, oldValue, flags) {
        // when source has changed before the latest debounced value from target
        // then discard that value, and take latest value from source only
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
        }
        this.binding.handleChange(newValue, oldValue, flags);
    }
    updateSource(newValue, flags) {
        this.queueTask(() => this.binding.updateSource(newValue, flags));
    }
    queueTask(callback) {
        // Queue the new one before canceling the old one, to prevent early yield
        const task = this.task;
        this.task = this.taskQueue.queueTask(() => {
            this.task = null;
            return callback();
        }, this.opts);
        task === null || task === void 0 ? void 0 : task.cancel();
    }
    $bind(flags, scope, hostScope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, hostScope, this.locator, null));
            this.opts.delay = isNaN(delay) ? defaultDelay$1 : delay;
        }
        this.binding.$bind(flags, scope, hostScope);
    }
    $unbind(flags) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        this.binding.$unbind(flags);
    }
}
bindingBehavior('debounce')(DebounceBindingBehavior);

var __decorate$k = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$i = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let SignalBindingBehavior = class SignalBindingBehavior {
    constructor(signaler) {
        this.signaler = signaler;
        this.lookup = new Map();
    }
    bind(flags, scope, hostScope, binding, ...names) {
        if (!('handleChange' in binding)) {
            throw new Error(`The signal behavior can only be used with bindings that have a 'handleChange' method`);
        }
        if (names.length === 0) {
            throw new Error(`At least one signal name must be passed to the signal behavior, e.g. \`expr & signal:'my-signal'\``);
        }
        this.lookup.set(binding, names);
        for (const name of names) {
            this.signaler.addSignalListener(name, binding);
        }
    }
    unbind(flags, scope, hostScope, binding) {
        const names = this.lookup.get(binding);
        this.lookup.delete(binding);
        for (const name of names) {
            this.signaler.removeSignalListener(name, binding);
        }
    }
};
SignalBindingBehavior = __decorate$k([
    __param$i(0, ISignaler)
], SignalBindingBehavior);
bindingBehavior('signal')(SignalBindingBehavior);

const defaultDelay = 200;
// A binding behavior that limits
// - (v1) the rate at which the view-model is updated in two-way bindings, OR
// - (v1 + v2) the rate at which the view is updated in to-view binding scenarios.
class ThrottleBindingBehavior extends BindingInterceptor {
    constructor(binding, expr) {
        super(binding, expr);
        this.opts = { delay: defaultDelay };
        this.firstArg = null;
        this.task = null;
        this.lastCall = 0;
        this.delay = 0;
        this.platform = binding.locator.get(IPlatform$1);
        this.taskQueue = this.platform.taskQueue;
        if (expr.args.length > 0) {
            this.firstArg = expr.args[0];
        }
    }
    callSource(args) {
        this.queueTask(() => this.binding.callSource(args));
        return void 0;
    }
    handleChange(newValue, oldValue, flags) {
        // when source has changed before the latest throttled value from target
        // then discard that value, and take latest value from source only
        if (this.task !== null) {
            this.task.cancel();
            this.task = null;
            this.lastCall = this.platform.performanceNow();
        }
        this.binding.handleChange(newValue, oldValue, flags);
    }
    updateSource(newValue, flags) {
        this.queueTask(() => this.binding.updateSource(newValue, flags));
    }
    queueTask(callback) {
        const opts = this.opts;
        const platform = this.platform;
        const nextDelay = this.lastCall + opts.delay - platform.performanceNow();
        if (nextDelay > 0) {
            // Queue the new one before canceling the old one, to prevent early yield
            const task = this.task;
            opts.delay = nextDelay;
            this.task = this.taskQueue.queueTask(() => {
                this.lastCall = platform.performanceNow();
                this.task = null;
                opts.delay = this.delay;
                callback();
            }, opts);
            task === null || task === void 0 ? void 0 : task.cancel();
        }
        else {
            this.lastCall = platform.performanceNow();
            callback();
        }
    }
    $bind(flags, scope, hostScope) {
        if (this.firstArg !== null) {
            const delay = Number(this.firstArg.evaluate(flags, scope, hostScope, this.locator, null));
            this.opts.delay = this.delay = isNaN(delay) ? defaultDelay : delay;
        }
        this.binding.$bind(flags, scope, hostScope);
    }
    $unbind(flags) {
        var _a;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
        super.$unbind(flags);
    }
}
bindingBehavior('throttle')(ThrottleBindingBehavior);

/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
class DataAttributeAccessor {
    constructor() {
        this.propertyKey = '';
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue(obj, key) {
        return obj.getAttribute(key);
    }
    setValue(newValue, flags, obj, key) {
        if (newValue == void 0) {
            obj.removeAttribute(key);
        }
        else {
            obj.setAttribute(key, newValue);
        }
    }
}
const attrAccessor = new DataAttributeAccessor();

var __decorate$j = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
let AttrBindingBehavior = class AttrBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        binding.targetObserver = attrAccessor;
    }
    unbind(flags, _scope, _hostScope, binding) {
        return;
    }
};
AttrBindingBehavior = __decorate$j([
    bindingBehavior('attr')
], AttrBindingBehavior);

var __decorate$i = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
/** @internal */
function handleSelfEvent(event) {
    const target = event.composedPath()[0];
    if (this.target !== target) {
        return;
    }
    return this.selfEventCallSource(event);
}
let SelfBindingBehavior = class SelfBindingBehavior {
    bind(flags, _scope, _hostScope, binding) {
        if (!binding.callSource || !binding.targetEvent) {
            throw new Error('Self binding behavior only supports events.');
        }
        binding.selfEventCallSource = binding.callSource;
        binding.callSource = handleSelfEvent;
    }
    unbind(flags, _scope, _hostScope, binding) {
        binding.callSource = binding.selfEventCallSource;
        binding.selfEventCallSource = null;
    }
};
SelfBindingBehavior = __decorate$i([
    bindingBehavior('self')
], SelfBindingBehavior);

const nsMap = Object.create(null);
/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
class AttributeNSAccessor {
    constructor(namespace) {
        this.namespace = namespace;
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    static forNs(ns) {
        var _a;
        return (_a = nsMap[ns]) !== null && _a !== void 0 ? _a : (nsMap[ns] = new AttributeNSAccessor(ns));
    }
    getValue(obj, propertyKey) {
        return obj.getAttributeNS(this.namespace, propertyKey);
    }
    setValue(newValue, flags, obj, key) {
        if (newValue == void 0) {
            obj.removeAttributeNS(this.namespace, key);
        }
        else {
            obj.setAttributeNS(this.namespace, key, newValue);
        }
    }
}

function defaultMatcher$1(a, b) {
    return a === b;
}
class CheckedObserver {
    constructor(obj, 
    // deepscan-disable-next-line
    _key, handler, observerLocator) {
        this.handler = handler;
        this.observerLocator = observerLocator;
        this.value = void 0;
        this.oldValue = void 0;
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.collectionObserver = void 0;
        this.valueObserver = void 0;
        this.f = 0 /* none */;
        this.obj = obj;
    }
    getValue() {
        return this.value;
    }
    setValue(newValue, flags) {
        const currentValue = this.value;
        if (newValue === currentValue) {
            return;
        }
        this.value = newValue;
        this.oldValue = currentValue;
        this.f = flags;
        this.observe();
        this.synchronizeElement();
        this.queue.add(this);
    }
    handleCollectionChange(indexMap, flags) {
        this.synchronizeElement();
    }
    handleChange(newValue, previousValue, flags) {
        this.synchronizeElement();
    }
    synchronizeElement() {
        const currentValue = this.value;
        const obj = this.obj;
        const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
        const isRadio = obj.type === 'radio';
        const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher$1;
        if (isRadio) {
            obj.checked = !!matcher(currentValue, elementValue);
        }
        else if (currentValue === true) {
            obj.checked = true;
        }
        else {
            let hasMatch = false;
            if (currentValue instanceof Array) {
                hasMatch = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
            }
            else if (currentValue instanceof Set) {
                for (const v of currentValue) {
                    if (matcher(v, elementValue)) {
                        hasMatch = true;
                        break;
                    }
                }
            }
            else if (currentValue instanceof Map) {
                for (const pair of currentValue) {
                    const existingItem = pair[0];
                    const $isChecked = pair[1];
                    // a potential complain, when only `true` is supported
                    // but it's consistent with array
                    if (matcher(existingItem, elementValue) && $isChecked === true) {
                        hasMatch = true;
                        break;
                    }
                }
            }
            obj.checked = hasMatch;
        }
    }
    handleEvent() {
        let currentValue = this.oldValue = this.value;
        const obj = this.obj;
        const elementValue = Object.prototype.hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
        const isChecked = obj.checked;
        const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher$1;
        if (obj.type === 'checkbox') {
            if (currentValue instanceof Array) {
                // Array binding steps on a change event:
                // 1. find corresponding item INDEX in the Set based on current model/value and matcher
                // 2. is the checkbox checked?
                //    2.1. Yes: is the corresponding item in the Array (index === -1)?
                //        2.1.1 No: push the current model/value to the Array
                //    2.2. No: is the corresponding item in the Array (index !== -1)?
                //        2.2.1: Yes: remove the corresponding item
                // =================================================
                const index = currentValue.findIndex(item => !!matcher(item, elementValue));
                // if the checkbox is checkde, and there's no matching value in the existing array
                // add the checkbox model/value to the array
                if (isChecked && index === -1) {
                    currentValue.push(elementValue);
                }
                else if (!isChecked && index !== -1) {
                    // if the checkbox is not checked, and found a matching item in the array
                    // based on the checkbox model/value
                    // remove the existing item
                    currentValue.splice(index, 1);
                }
                // when existing currentValue is an array,
                // do not invoke callback as only the array obj has changed
                return;
            }
            else if (currentValue instanceof Set) {
                // Set binding steps on a change event:
                // 1. find corresponding item in the Set based on current model/value and matcher
                // 2. is the checkbox checked?
                //    2.1. Yes: is the corresponding item in the Set?
                //        2.1.1 No: add the current model/value to the Set
                //    2.2. No: is the corresponding item in the Set?
                //        2.2.1: Yes: remove the corresponding item
                // =================================================
                // 1. find corresponding item
                const unset = {};
                let existingItem = unset;
                for (const value of currentValue) {
                    if (matcher(value, elementValue) === true) {
                        existingItem = value;
                        break;
                    }
                }
                // 2.1. Checkbox is checked, is the corresponding item in the Set?
                //
                // if checkbox is checked and there's no value in the existing Set
                // add the checkbox model/value to the Set
                if (isChecked && existingItem === unset) {
                    // 2.1.1. add the current model/value to the Set
                    currentValue.add(elementValue);
                }
                else if (!isChecked && existingItem !== unset) {
                    // 2.2.1 Checkbox is unchecked, corresponding is in the Set
                    //
                    // if checkbox is not checked, and found a matching item in the Set
                    // based on the checkbox model/value
                    // remove the existing item
                    currentValue.delete(existingItem);
                }
                // when existing value is a Set,
                // do not invoke callback as only the Set has been mutated
                return;
            }
            else if (currentValue instanceof Map) {
                // Map binding steps on a change event
                // 1. find corresponding item in the Map based on current model/value and matcher
                // 2. Set the value of the corresponding item in the Map based on checked state of the checkbox
                // =================================================
                // 1. find the corresponding item
                let existingItem;
                for (const pair of currentValue) {
                    const currItem = pair[0];
                    if (matcher(currItem, elementValue) === true) {
                        existingItem = currItem;
                        break;
                    }
                }
                // 2. set the value of the corresponding item in the map
                // if checkbox is checked and there's no value in the existing Map
                // add the checkbox model/value to the Map as key,
                // and value will be checked state of the checkbox
                currentValue.set(existingItem, isChecked);
                // when existing value is a Map,
                // do not invoke callback as only the Map has been mutated
                return;
            }
            currentValue = isChecked;
        }
        else if (isChecked) {
            currentValue = elementValue;
        }
        else {
            // if it's a radio and it has been unchecked
            // do nothing, as the radio that was checked will fire change event and it will be handle there
            // a radio cannot be unchecked by user
            return;
        }
        this.value = currentValue;
        this.queue.add(this);
    }
    start() {
        this.handler.subscribe(this.obj, this);
        this.observe();
    }
    stop() {
        var _a, _b;
        this.handler.dispose();
        (_a = this.collectionObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this.collectionObserver = void 0;
        (_b = this.valueObserver) === null || _b === void 0 ? void 0 : _b.unsubscribe(this);
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.start();
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.stop();
        }
    }
    flush() {
        oV$2 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$2, this.f);
    }
    observe() {
        var _a, _b, _c, _d, _e, _f, _g;
        const obj = this.obj;
        (_e = ((_a = this.valueObserver) !== null && _a !== void 0 ? _a : (this.valueObserver = (_c = (_b = obj.$observers) === null || _b === void 0 ? void 0 : _b.model) !== null && _c !== void 0 ? _c : (_d = obj.$observers) === null || _d === void 0 ? void 0 : _d.value))) === null || _e === void 0 ? void 0 : _e.subscribe(this);
        (_f = this.collectionObserver) === null || _f === void 0 ? void 0 : _f.unsubscribe(this);
        this.collectionObserver = void 0;
        if (obj.type === 'checkbox') {
            (_g = (this.collectionObserver = getCollectionObserver(this.value, this.observerLocator))) === null || _g === void 0 ? void 0 : _g.subscribe(this);
        }
    }
}
subscriberCollection(CheckedObserver);
withFlushQueue(CheckedObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$2 = void 0;

const hasOwn = Object.prototype.hasOwnProperty;
const childObserverOptions = {
    childList: true,
    subtree: true,
    characterData: true
};
function defaultMatcher(a, b) {
    return a === b;
}
class SelectValueObserver {
    constructor(obj, 
    // deepscan-disable-next-line
    _key, handler, observerLocator) {
        this.handler = handler;
        this.observerLocator = observerLocator;
        this.value = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        // ObserverType.Layout is not always true
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.arrayObserver = void 0;
        this.nodeObserver = void 0;
        this.observing = false;
        this.obj = obj;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.observing
            ? this.value
            : this.obj.multiple
                ? Array.from(this.obj.options).map(o => o.value)
                : this.obj.value;
    }
    setValue(newValue, flags) {
        this.oldValue = this.value;
        this.value = newValue;
        this.hasChanges = newValue !== this.oldValue;
        this.observeArray(newValue instanceof Array ? newValue : null);
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            this.syncOptions();
        }
    }
    handleCollectionChange() {
        // always sync "selected" property of <options/>
        // immediately whenever the array notifies its mutation
        this.syncOptions();
    }
    syncOptions() {
        var _a;
        const value = this.value;
        const obj = this.obj;
        const isArray = Array.isArray(value);
        const matcher = (_a = obj.matcher) !== null && _a !== void 0 ? _a : defaultMatcher;
        const options = obj.options;
        let i = options.length;
        while (i-- > 0) {
            const option = options[i];
            const optionValue = hasOwn.call(option, 'model') ? option.model : option.value;
            if (isArray) {
                option.selected = value.findIndex(item => !!matcher(optionValue, item)) !== -1;
                continue;
            }
            option.selected = !!matcher(optionValue, value);
        }
    }
    syncValue() {
        // Spec for synchronizing value from `<select/>`  to `SelectObserver`
        // When synchronizing value to observed <select/> element, do the following steps:
        // A. If `<select/>` is multiple
        //    1. Check if current value, called `currentValue` is an array
        //      a. If not an array, return true to signal value has changed
        //      b. If is an array:
        //        i. gather all current selected <option/>, in to array called `values`
        //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
        //        iii. loop through the `values` array and add items that are selected based on matcher
        //        iv. Return false to signal value hasn't changed
        // B. If the select is single
        //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
        //    2. assign `this.currentValue` to `this.oldValue`
        //    3. assign `value` to `this.currentValue`
        //    4. return `true` to signal value has changed
        const obj = this.obj;
        const options = obj.options;
        const len = options.length;
        const currentValue = this.value;
        let i = 0;
        if (obj.multiple) {
            // A.
            if (!(currentValue instanceof Array)) {
                // A.1.a
                return true;
            }
            // A.1.b
            // multi select
            let option;
            const matcher = obj.matcher || defaultMatcher;
            // A.1.b.i
            const values = [];
            while (i < len) {
                option = options[i];
                if (option.selected) {
                    values.push(hasOwn.call(option, 'model')
                        ? option.model
                        : option.value);
                }
                ++i;
            }
            // A.1.b.ii
            i = 0;
            while (i < currentValue.length) {
                const a = currentValue[i];
                // Todo: remove arrow fn
                if (values.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
            // A.1.b.iii
            i = 0;
            while (i < values.length) {
                const a = values[i];
                // Todo: remove arrow fn
                if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.push(a);
                }
                ++i;
            }
            // A.1.b.iv
            return false;
        }
        // B. single select
        // B.1
        let value = null;
        while (i < len) {
            const option = options[i];
            if (option.selected) {
                value = hasOwn.call(option, 'model')
                    ? option.model
                    : option.value;
                break;
            }
            ++i;
        }
        // B.2
        this.oldValue = this.value;
        // B.3
        this.value = value;
        // B.4
        return true;
    }
    start() {
        (this.nodeObserver = new this.obj.ownerDocument.defaultView.MutationObserver(this.handleNodeChange.bind(this)))
            .observe(this.obj, childObserverOptions);
        this.observeArray(this.value instanceof Array ? this.value : null);
        this.observing = true;
    }
    stop() {
        var _a;
        this.nodeObserver.disconnect();
        (_a = this.arrayObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this.nodeObserver
            = this.arrayObserver
                = void 0;
        this.observing = false;
    }
    // todo: observe all kind of collection
    observeArray(array) {
        var _a;
        (_a = this.arrayObserver) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        this.arrayObserver = void 0;
        if (array != null) {
            if (!this.obj.multiple) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            (this.arrayObserver = this.observerLocator.getArrayObserver(array)).subscribe(this);
        }
    }
    handleEvent() {
        const shouldNotify = this.syncValue();
        if (shouldNotify) {
            this.queue.add(this);
            // this.subs.notify(this.currentValue, this.oldValue, LF.none);
        }
    }
    handleNodeChange() {
        this.syncOptions();
        const shouldNotify = this.syncValue();
        if (shouldNotify) {
            this.queue.add(this);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.handler.subscribe(this.obj, this);
            this.start();
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.handler.dispose();
            this.stop();
        }
    }
    flush() {
        oV$1 = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV$1, 0 /* none */);
    }
}
subscriberCollection(SelectValueObserver);
withFlushQueue(SelectValueObserver);
// a shared variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV$1 = void 0;

const customPropertyPrefix = '--';
class StyleAttributeAccessor {
    constructor(obj) {
        this.obj = obj;
        this.value = '';
        this.oldValue = '';
        this.styles = {};
        this.version = 0;
        this.hasChanges = false;
        this.type = 2 /* Node */ | 4 /* Layout */;
    }
    getValue() {
        return this.obj.style.cssText;
    }
    setValue(newValue, flags) {
        this.value = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    getStyleTuplesFromString(currentValue) {
        const styleTuples = [];
        const urlRegexTester = /url\([^)]+$/;
        let offset = 0;
        let currentChunk = '';
        let nextSplit;
        let indexOfColon;
        let attribute;
        let value;
        while (offset < currentValue.length) {
            nextSplit = currentValue.indexOf(';', offset);
            if (nextSplit === -1) {
                nextSplit = currentValue.length;
            }
            currentChunk += currentValue.substring(offset, nextSplit);
            offset = nextSplit + 1;
            // Make sure we never split a url so advance to next
            if (urlRegexTester.test(currentChunk)) {
                currentChunk += ';';
                continue;
            }
            indexOfColon = currentChunk.indexOf(':');
            attribute = currentChunk.substring(0, indexOfColon).trim();
            value = currentChunk.substring(indexOfColon + 1).trim();
            styleTuples.push([attribute, value]);
            currentChunk = '';
        }
        return styleTuples;
    }
    getStyleTuplesFromObject(currentValue) {
        let value;
        const styles = [];
        for (const property in currentValue) {
            value = currentValue[property];
            if (value == null) {
                continue;
            }
            if (typeof value === 'string') {
                // Custom properties should not be tampered with
                if (property.startsWith(customPropertyPrefix)) {
                    styles.push([property, value]);
                    continue;
                }
                styles.push([kebabCase(property), value]);
                continue;
            }
            styles.push(...this.getStyleTuples(value));
        }
        return styles;
    }
    getStyleTuplesFromArray(currentValue) {
        const len = currentValue.length;
        if (len > 0) {
            const styles = [];
            for (let i = 0; i < len; ++i) {
                styles.push(...this.getStyleTuples(currentValue[i]));
            }
            return styles;
        }
        return emptyArray;
    }
    getStyleTuples(currentValue) {
        if (typeof currentValue === 'string') {
            return this.getStyleTuplesFromString(currentValue);
        }
        if (currentValue instanceof Array) {
            return this.getStyleTuplesFromArray(currentValue);
        }
        if (currentValue instanceof Object) {
            return this.getStyleTuplesFromObject(currentValue);
        }
        return emptyArray;
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.value;
            const styles = this.styles;
            const styleTuples = this.getStyleTuples(currentValue);
            let style;
            let version = this.version;
            this.oldValue = currentValue;
            let tuple;
            let name;
            let value;
            const len = styleTuples.length;
            for (let i = 0; i < len; ++i) {
                tuple = styleTuples[i];
                name = tuple[0];
                value = tuple[1];
                this.setProperty(name, value);
                styles[name] = version;
            }
            this.styles = styles;
            this.version += 1;
            if (version === 0) {
                return;
            }
            version -= 1;
            for (style in styles) {
                if (!Object.prototype.hasOwnProperty.call(styles, style) || styles[style] !== version) {
                    continue;
                }
                this.obj.style.removeProperty(style);
            }
        }
    }
    setProperty(style, value) {
        let priority = '';
        if (value != null && typeof value.indexOf === 'function' && value.includes('!important')) {
            priority = 'important';
            value = value.replace('!important', '');
        }
        this.obj.style.setProperty(style, value, priority);
    }
    bind(flags) {
        this.value = this.oldValue = this.obj.style.cssText;
    }
}

/**
 * Observer for non-radio, non-checkbox input.
 */
class ValueAttributeObserver {
    constructor(obj, propertyKey, handler) {
        this.propertyKey = propertyKey;
        this.handler = handler;
        this.value = '';
        this.oldValue = '';
        this.hasChanges = false;
        // ObserverType.Layout is not always true, it depends on the element & property combo
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.obj = obj;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.value;
    }
    setValue(newValue, flags) {
        if (Object.is(newValue, this.value)) {
            return;
        }
        this.oldValue = this.value;
        this.value = newValue;
        this.hasChanges = true;
        if (!this.handler.config.readonly && (flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        var _a;
        if (this.hasChanges) {
            this.hasChanges = false;
            this.obj[this.propertyKey] = (_a = this.value) !== null && _a !== void 0 ? _a : this.handler.config.default;
            if ((flags & 2 /* fromBind */) === 0) {
                this.queue.add(this);
            }
        }
    }
    handleEvent() {
        this.oldValue = this.value;
        this.value = this.obj[this.propertyKey];
        if (this.oldValue !== this.value) {
            this.hasChanges = false;
            this.queue.add(this);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.handler.subscribe(this.obj, this);
            this.value = this.oldValue = this.obj[this.propertyKey];
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.handler.dispose();
        }
    }
    flush() {
        oV = this.oldValue;
        this.oldValue = this.value;
        this.subs.notify(this.value, oV, 0 /* none */);
    }
}
subscriberCollection(ValueAttributeObserver);
withFlushQueue(ValueAttributeObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;

const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';
// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
const nsAttributes = Object.assign(createLookup(), {
    'xlink:actuate': ['actuate', xlinkNS],
    'xlink:arcrole': ['arcrole', xlinkNS],
    'xlink:href': ['href', xlinkNS],
    'xlink:role': ['role', xlinkNS],
    'xlink:show': ['show', xlinkNS],
    'xlink:title': ['title', xlinkNS],
    'xlink:type': ['type', xlinkNS],
    'xml:lang': ['lang', xmlNS],
    'xml:space': ['space', xmlNS],
    'xmlns': ['xmlns', xmlnsNS],
    'xmlns:xlink': ['xlink', xmlnsNS],
});
const elementPropertyAccessor = new PropertyAccessor();
elementPropertyAccessor.type = 2 /* Node */ | 4 /* Layout */;
class NodeObserverConfig {
    constructor(config) {
        var _a;
        this.type = (_a = config.type) !== null && _a !== void 0 ? _a : ValueAttributeObserver;
        this.events = config.events;
        this.readonly = config.readonly;
        this.default = config.default;
    }
}
class NodeObserverLocator {
    constructor(locator, platform, dirtyChecker, svgAnalyzer) {
        this.locator = locator;
        this.platform = platform;
        this.dirtyChecker = dirtyChecker;
        this.svgAnalyzer = svgAnalyzer;
        this.allowDirtyCheck = true;
        this.events = createLookup();
        this.globalEvents = createLookup();
        this.overrides = createLookup();
        this.globalOverrides = createLookup();
        // todo: atm, platform is required to be resolved too eagerly for the `.handles()` check
        // also a lot of tests assume default availability of observation
        // those 2 assumptions make it not the right time to extract the following line into a
        // default configuration for NodeObserverLocator yet
        // but in the future, they should be, so apps that don't use check box/select, or implement a different
        // observer don't have to pay the of the default implementation
        const inputEvents = ['change', 'input'];
        const inputEventsConfig = { events: inputEvents, default: '' };
        this.useConfig({
            INPUT: {
                value: inputEventsConfig,
                valueAsNumber: { events: inputEvents, default: 0 },
                checked: { type: CheckedObserver, events: inputEvents },
                files: { events: inputEvents, readonly: true },
            },
            SELECT: {
                value: { type: SelectValueObserver, events: ['change'], default: '' },
            },
            TEXTAREA: {
                value: inputEventsConfig,
            },
        });
        const contentEventsConfig = { events: ['change', 'input', 'blur', 'keyup', 'paste'], default: '' };
        const scrollEventsConfig = { events: ['scroll'], default: 0 };
        this.useConfigGlobal({
            scrollTop: scrollEventsConfig,
            scrollLeft: scrollEventsConfig,
            textContent: contentEventsConfig,
            innerHTML: contentEventsConfig,
        });
        this.overrideAccessorGlobal('css', 'style', 'class');
        this.overrideAccessor({
            INPUT: ['value', 'checked', 'model'],
            SELECT: ['value'],
            TEXTAREA: ['value'],
        });
    }
    static register(container) {
        Registration.aliasTo(INodeObserverLocator, NodeObserverLocator).register(container);
        Registration.singleton(INodeObserverLocator, NodeObserverLocator).register(container);
    }
    // deepscan-disable-next-line
    handles(obj, _key) {
        return obj instanceof this.platform.Node;
    }
    useConfig(nodeNameOrConfig, key, eventsConfig) {
        var _a, _b;
        const lookup = this.events;
        let existingMapping;
        if (typeof nodeNameOrConfig === 'string') {
            existingMapping = (_a = lookup[nodeNameOrConfig]) !== null && _a !== void 0 ? _a : (lookup[nodeNameOrConfig] = createLookup());
            if (existingMapping[key] == null) {
                existingMapping[key] = new NodeObserverConfig(eventsConfig);
            }
            else {
                throwMappingExisted(nodeNameOrConfig, key);
            }
        }
        else {
            for (const nodeName in nodeNameOrConfig) {
                existingMapping = (_b = lookup[nodeName]) !== null && _b !== void 0 ? _b : (lookup[nodeName] = createLookup());
                const newMapping = nodeNameOrConfig[nodeName];
                for (key in newMapping) {
                    if (existingMapping[key] == null) {
                        existingMapping[key] = new NodeObserverConfig(newMapping[key]);
                    }
                    else {
                        throwMappingExisted(nodeName, key);
                    }
                }
            }
        }
    }
    useConfigGlobal(configOrKey, eventsConfig) {
        const lookup = this.globalEvents;
        if (typeof configOrKey === 'object') {
            for (const key in configOrKey) {
                if (lookup[key] == null) {
                    lookup[key] = new NodeObserverConfig(configOrKey[key]);
                }
                else {
                    throwMappingExisted('*', key);
                }
            }
        }
        else {
            if (lookup[configOrKey] == null) {
                lookup[configOrKey] = new NodeObserverConfig(eventsConfig);
            }
            else {
                throwMappingExisted('*', configOrKey);
            }
        }
    }
    // deepscan-disable-nextline
    getAccessor(obj, key, requestor) {
        var _a;
        if (key in this.globalOverrides || (key in ((_a = this.overrides[obj.tagName]) !== null && _a !== void 0 ? _a : emptyObject))) {
            return this.getObserver(obj, key, requestor);
        }
        switch (key) {
            // class / style / css attribute will be observed using .getObserver() per overrides
            //
            // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
            // but for now stick to what vCurrent does
            case 'src':
            case 'href':
            // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
            case 'role':
                return attrAccessor;
            default: {
                const nsProps = nsAttributes[key];
                if (nsProps !== undefined) {
                    return AttributeNSAccessor.forNs(nsProps[1]);
                }
                if (isDataAttribute(obj, key, this.svgAnalyzer)) {
                    return attrAccessor;
                }
                return elementPropertyAccessor;
            }
        }
    }
    overrideAccessor(tagNameOrOverrides, key) {
        var _a, _b;
        var _c, _d;
        let existingTagOverride;
        if (typeof tagNameOrOverrides === 'string') {
            existingTagOverride = (_a = (_c = this.overrides)[tagNameOrOverrides]) !== null && _a !== void 0 ? _a : (_c[tagNameOrOverrides] = createLookup());
            existingTagOverride[key] = true;
        }
        else {
            for (const tagName in tagNameOrOverrides) {
                for (const key of tagNameOrOverrides[tagName]) {
                    existingTagOverride = (_b = (_d = this.overrides)[tagName]) !== null && _b !== void 0 ? _b : (_d[tagName] = createLookup());
                    existingTagOverride[key] = true;
                }
            }
        }
    }
    /**
     * For all elements:
     * compose a list of properties,
     * to indicate that an overser should be returned instead of an accessor in `.getAccessor()`
     */
    overrideAccessorGlobal(...keys) {
        for (const key of keys) {
            this.globalOverrides[key] = true;
        }
    }
    getObserver(el, key, requestor) {
        var _a, _b;
        switch (key) {
            case 'role':
                return attrAccessor;
            case 'class':
                return new ClassAttributeAccessor(el);
            case 'css':
            case 'style':
                return new StyleAttributeAccessor(el);
        }
        const eventsConfig = (_b = (_a = this.events[el.tagName]) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : this.globalEvents[key];
        if (eventsConfig != null) {
            return new eventsConfig.type(el, key, new EventSubscriber(eventsConfig), requestor, this.locator);
        }
        const nsProps = nsAttributes[key];
        if (nsProps !== undefined) {
            return AttributeNSAccessor.forNs(nsProps[1]);
        }
        if (isDataAttribute(el, key, this.svgAnalyzer)) {
            // todo: should observe
            return attrAccessor;
        }
        if (key in el.constructor.prototype) {
            if (this.allowDirtyCheck) {
                return this.dirtyChecker.createProperty(el, key);
            }
            // consider:
            // - maybe add a adapter API to handle unknown obj/key combo
            throw new Error(`Unable to observe property ${String(key)}. Register observation mapping with .useConfig().`);
        }
        else {
            // todo: probably still needs to get the property descriptor via getOwnPropertyDescriptor
            // but let's start with simplest scenario
            return new SetterObserver(el, key);
        }
    }
}
NodeObserverLocator.inject = [IServiceLocator, IPlatform, IDirtyChecker, ISVGAnalyzer];
function getCollectionObserver(collection, observerLocator) {
    if (collection instanceof Array) {
        return observerLocator.getArrayObserver(collection);
    }
    if (collection instanceof Map) {
        return observerLocator.getMapObserver(collection);
    }
    if (collection instanceof Set) {
        return observerLocator.getSetObserver(collection);
    }
}
function throwMappingExisted(nodeName, key) {
    throw new Error(`Mapping for property ${String(key)} of <${nodeName} /> already exists`);
}

var __decorate$h = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$h = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let UpdateTriggerBindingBehavior = class UpdateTriggerBindingBehavior {
    constructor(observerLocator) {
        this.observerLocator = observerLocator;
    }
    bind(flags, _scope, _hostScope, binding, ...events) {
        if (events.length === 0) {
            throw new Error('The updateTrigger binding behavior requires at least one event name argument: eg <input value.bind="firstName & updateTrigger:\'blur\'">');
        }
        if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
            throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
        }
        // ensure the binding's target observer has been set.
        const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty);
        if (!targetObserver.handler) {
            throw new Error('The updateTrigger binding behavior can only be applied to two-way/ from-view bindings on input/select elements.');
        }
        binding.targetObserver = targetObserver;
        // stash the original element subscribe function.
        const originalHandler = targetObserver.handler;
        targetObserver.originalHandler = originalHandler;
        // replace the element subscribe function with one that uses the correct events.
        targetObserver.handler = new EventSubscriber(new NodeObserverConfig({
            default: originalHandler.config.default,
            events,
            readonly: originalHandler.config.readonly
        }));
    }
    unbind(flags, _scope, _hostScope, binding) {
        // restore the state of the binding.
        binding.targetObserver.handler.dispose();
        binding.targetObserver.handler = binding.targetObserver.originalHandler;
        binding.targetObserver.originalHandler = null;
    }
};
UpdateTriggerBindingBehavior = __decorate$h([
    bindingBehavior('updateTrigger'),
    __param$h(0, IObserverLocator)
], UpdateTriggerBindingBehavior);

var __decorate$g = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$g = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const unset = Symbol();
// Using passive to help with performance
const defaultCaptureEventInit = {
    passive: true,
    capture: true
};
// Using passive to help with performance
const defaultBubbleEventInit = {
    passive: true
};
// weakly connect a document to a blur manager
// to avoid polluting the document properties
const blurDocMap = new WeakMap();
class BlurManager {
    constructor(platform) {
        this.platform = platform;
        this.blurs = [];
        blurDocMap.set(platform.document, this);
        this.handler = createHandler(this, this.blurs);
    }
    static createFor(platform) {
        return blurDocMap.get(platform.document) || new BlurManager(platform);
    }
    register(blur) {
        const blurs = this.blurs;
        if (!blurs.includes(blur) && blurs.push(blur) === 1) {
            this.addListeners();
        }
    }
    unregister(blur) {
        const blurs = this.blurs;
        const index = blurs.indexOf(blur);
        if (index > -1) {
            blurs.splice(index, 1);
        }
        if (blurs.length === 0) {
            this.removeListeners();
        }
    }
    addListeners() {
        const p = this.platform;
        const doc = p.document;
        const win = p.window;
        const handler = this.handler;
        if (win.navigator.pointerEnabled) {
            doc.addEventListener('pointerdown', handler, defaultCaptureEventInit);
        }
        doc.addEventListener('touchstart', handler, defaultCaptureEventInit);
        doc.addEventListener('mousedown', handler, defaultCaptureEventInit);
        doc.addEventListener('focus', handler, defaultCaptureEventInit);
        win.addEventListener('blur', handler, defaultBubbleEventInit);
    }
    removeListeners() {
        const p = this.platform;
        const doc = p.document;
        const win = p.window;
        const handler = this.handler;
        if (win.navigator.pointerEnabled) {
            doc.removeEventListener('pointerdown', handler, defaultCaptureEventInit);
        }
        doc.removeEventListener('touchstart', handler, defaultCaptureEventInit);
        doc.removeEventListener('mousedown', handler, defaultCaptureEventInit);
        doc.removeEventListener('focus', handler, defaultCaptureEventInit);
        win.removeEventListener('blur', handler, defaultBubbleEventInit);
    }
}
let Blur = class Blur {
    constructor(element, p) {
        this.element = element;
        this.p = p;
        /**
         * By default, the behavior should be least surprise possible, that:
         *
         * it searches for anything from root context,
         * and root context is document body
         */
        this.linkedMultiple = true;
        this.searchSubTree = true;
        this.linkingContext = null;
        this.value = unset;
        this.manager = BlurManager.createFor(p);
    }
    attached() {
        this.manager.register(this);
    }
    detaching() {
        this.manager.unregister(this);
    }
    handleEventTarget(target) {
        if (this.value === false) {
            return;
        }
        const p = this.p;
        if (target === p.window || target === p.document || !this.contains(target)) {
            this.triggerBlur();
        }
    }
    contains(target) {
        if (!this.value) {
            return false;
        }
        let els;
        let i;
        let j, jj;
        let link;
        const element = this.element;
        if (containsElementOrShadowRoot(element, target)) {
            return true;
        }
        if (!this.linkedWith) {
            return false;
        }
        const doc = this.p.document;
        const linkedWith = this.linkedWith;
        const linkingContext = this.linkingContext;
        const searchSubTree = this.searchSubTree;
        const linkedMultiple = this.linkedMultiple;
        const links = Array.isArray(linkedWith) ? linkedWith : [linkedWith];
        const contextNode = (typeof linkingContext === 'string'
            ? doc.querySelector(linkingContext)
            : linkingContext)
            || doc.body;
        const ii = links.length;
        for (i = 0; ii > i; ++i) {
            link = links[i];
            // When user specify to link with something by a string, it acts as a CSS selector
            // We need to do some querying stuff to determine if target above is contained.
            if (typeof link === 'string') {
                // Default behavior, search the whole tree, from context that user specified, which default to document body
                if (searchSubTree) {
                    // todo: are there too many knobs?? Consider remove "linkedMultiple"??
                    if (!linkedMultiple) {
                        const el = contextNode.querySelector(link);
                        els = el !== null ? [el] : emptyArray;
                    }
                    else {
                        els = contextNode.querySelectorAll(link);
                    }
                    jj = els.length;
                    for (j = 0; jj > j; ++j) {
                        if (els[j].contains(target)) {
                            return true;
                        }
                    }
                }
                else {
                    // default to document body, if user didn't define a linking context, and wanted to ignore subtree.
                    // This is specifically performant and useful for dialogs, plugins
                    // that usually generate contents to document body
                    els = contextNode.children;
                    jj = els.length;
                    for (j = 0; jj > j; ++j) {
                        if (els[j].matches(link)) {
                            return true;
                        }
                    }
                }
            }
            else {
                // When user passed in something that is not a string,
                // simply check if has method `contains` (allow duck typing)
                // and call it against target.
                // This enables flexible usages
                if (link && link.contains(target)) {
                    return true;
                }
            }
        }
        return false;
    }
    triggerBlur() {
        this.value = false;
        if (typeof this.onBlur === 'function') {
            this.onBlur.call(null);
        }
    }
};
__decorate$g([
    bindable()
], Blur.prototype, "value", void 0);
__decorate$g([
    bindable()
], Blur.prototype, "onBlur", void 0);
__decorate$g([
    bindable()
], Blur.prototype, "linkedWith", void 0);
__decorate$g([
    bindable()
], Blur.prototype, "linkedMultiple", void 0);
__decorate$g([
    bindable()
], Blur.prototype, "searchSubTree", void 0);
__decorate$g([
    bindable()
], Blur.prototype, "linkingContext", void 0);
Blur = __decorate$g([
    customAttribute('blur'),
    __param$g(0, INode),
    __param$g(1, IPlatform)
], Blur);
const containsElementOrShadowRoot = (container, target) => {
    if (container.contains(target)) {
        return true;
    }
    let parentNode = null;
    while (target != null) {
        if (target === container) {
            return true;
        }
        parentNode = target.parentNode;
        if (parentNode === null && target.nodeType === 11 /* DocumentFragment */) {
            target = target.host;
            continue;
        }
        target = parentNode;
    }
    return false;
};
const createHandler = (manager, checkTargets) => {
    // *******************************
    // EVENTS ORDER
    // -----------------------------
    // pointerdown
    // touchstart
    // pointerup
    // touchend
    // mousedown
    // --------------
    // BLUR
    // FOCUS
    // --------------
    // mouseup
    // click
    //
    // ******************************
    //
    // There are cases focus happens without mouse interaction (keyboard)
    // So it needs to capture both mouse / focus movement
    //
    // ******************************
    let hasChecked = false;
    const revertCheckage = () => {
        hasChecked = false;
    };
    const markChecked = () => {
        hasChecked = true;
        manager.platform.domWriteQueue.queueTask(revertCheckage, { preempt: true });
    };
    const handleMousedown = (e) => {
        if (!hasChecked) {
            handleEvent(e);
            markChecked();
        }
    };
    /**
     * Handle globally captured focus event
     * This can happen via a few way:
     * User clicks on a focusable element
     * User uses keyboard to navigate to a focusable element
     * User goes back to the window from another browser tab
     * User clicks on a non-focusable element
     * User clicks on the window, outside of the document
     */
    const handleFocus = (e) => {
        if (hasChecked) {
            return;
        }
        // there are two way a focus gets captured on window
        // when the windows itself got focus
        // and when an element in the document gets focus
        // when the window itself got focus, reacting to it is quite unnecessary
        // as it doesn't really affect element inside the document
        // Do a simple check and bail immediately
        const isWindow = e.target === manager.platform.window;
        if (isWindow) {
            for (let i = 0, ii = checkTargets.length; ii > i; ++i) {
                checkTargets[i].triggerBlur();
            }
        }
        else {
            handleEvent(e);
        }
        markChecked();
    };
    const handleWindowBlur = () => {
        hasChecked = false;
        for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
            checkTargets[i].triggerBlur();
        }
    };
    const handleEvent = (e) => {
        const target = e.composed ? e.composedPath()[0] : e.target;
        if (target === null) {
            return;
        }
        for (let i = 0, ii = checkTargets.length; i < ii; ++i) {
            checkTargets[i].handleEventTarget(target);
        }
    };
    return {
        onpointerdown: handleMousedown,
        ontouchstart: handleMousedown,
        onmousedown: handleMousedown,
        onfocus: handleFocus,
        onblur: handleWindowBlur,
        handleEvent(e) {
            this[`on${e.type}`](e);
        }
    };
};

var __decorate$f = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$f = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
/**
 * Focus attribute for element focus binding
 */
let Focus = class Focus {
    constructor(element, p) {
        this.element = element;
        this.p = p;
        /**
         * Indicates whether `apply` should be called when `attached` callback is invoked
         */
        this.needsApply = false;
    }
    binding() {
        this.valueChanged();
    }
    /**
     * Invoked everytime the bound value changes.
     *
     * @param newValue - The new value.
     */
    valueChanged() {
        // In theory, we could/should react immediately
        // but focus state of an element cannot be achieved
        // while it's disconnected from the document
        // thus, there neesd to be a check if it's currently connected or not
        // before applying the value to the element
        if (this.$controller.isActive) {
            this.apply();
        }
        else {
            // If the element is not currently connect
            // toggle the flag to add pending work for later
            // in attached lifecycle
            this.needsApply = true;
        }
    }
    /**
     * Invoked when the attribute is attached to the DOM.
     */
    attached() {
        if (this.needsApply) {
            this.needsApply = false;
            this.apply();
        }
        const el = this.element;
        el.addEventListener('focus', this);
        el.addEventListener('blur', this);
    }
    /**
     * Invoked when the attribute is afterDetachChildren from the DOM.
     */
    afterDetachChildren() {
        const el = this.element;
        el.removeEventListener('focus', this);
        el.removeEventListener('blur', this);
    }
    /**
     * EventTarget interface handler for better memory usage
     */
    handleEvent(e) {
        // there are only two event listened to
        // if the even is focus, it menans the element is focused
        // only need to switch the value to true
        if (e.type === 'focus') {
            this.value = true;
        }
        else if (!this.isElFocused) {
            // else, it's blur event
            // when a blur event happens, there are two situations
            // 1. the element itself lost the focus
            // 2. window lost the focus
            // To handle both (1) and (2), only need to check if
            // current active element is still the same element of this focus custom attribute
            // If it's not, it's a blur event happened on Window because the browser tab lost focus
            this.value = false;
        }
    }
    /**
     * Focus/blur based on current value
     */
    apply() {
        const el = this.element;
        const isFocused = this.isElFocused;
        const shouldFocus = this.value;
        if (shouldFocus && !isFocused) {
            el.focus();
        }
        else if (!shouldFocus && isFocused) {
            el.blur();
        }
    }
    get isElFocused() {
        return this.element === this.p.document.activeElement;
    }
};
__decorate$f([
    bindable({ mode: BindingMode.twoWay })
], Focus.prototype, "value", void 0);
Focus = __decorate$f([
    customAttribute('focus'),
    __param$f(0, INode),
    __param$f(1, IPlatform)
], Focus);

var __decorate$e = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$e = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let Show = class Show {
    constructor(el, p, instr) {
        this.el = el;
        this.p = p;
        this.isActive = false;
        this.task = null;
        this.$val = '';
        this.$prio = '';
        this.update = () => {
            this.task = null;
            // Only compare at the synchronous moment when we're about to update, because the value might have changed since the update was queued.
            if (Boolean(this.value) !== this.isToggled) {
                if (this.isToggled === this.base) {
                    this.isToggled = !this.base;
                    // Note: in v1 we used the 'au-hide' class, but in v2 it's so trivial to conditionally apply classes (e.g. 'hide.class="someCondition"'),
                    // that it's probably better to avoid the CSS inject infra involvement and keep this CA as simple as possible.
                    // Instead, just store and restore the property values (with each mutation, to account for in-between updates), to cover the common cases, until there is convincing feedback to do otherwise.
                    this.$val = this.el.style.getPropertyValue('display');
                    this.$prio = this.el.style.getPropertyPriority('display');
                    this.el.style.setProperty('display', 'none', 'important');
                }
                else {
                    this.isToggled = this.base;
                    this.el.style.setProperty('display', this.$val, this.$prio);
                    // If the style attribute is now empty, remove it.
                    if (this.el.getAttribute('style') === '') {
                        this.el.removeAttribute('style');
                    }
                }
            }
        };
        // if this is declared as a 'hide' attribute, then this.base will be false, inverting everything.
        this.isToggled = this.base = instr.alias !== 'hide';
    }
    binding() {
        this.isActive = true;
        this.update();
    }
    detaching() {
        var _a;
        this.isActive = false;
        (_a = this.task) === null || _a === void 0 ? void 0 : _a.cancel();
        this.task = null;
    }
    valueChanged() {
        if (this.isActive && this.task === null) {
            this.task = this.p.domWriteQueue.queueTask(this.update);
        }
    }
};
__decorate$e([
    bindable
], Show.prototype, "value", void 0);
Show = __decorate$e([
    customAttribute('show'),
    alias('hide'),
    __param$e(0, INode),
    __param$e(1, IPlatform),
    __param$e(2, IInstruction)
], Show);

var __decorate$d = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$d = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let Portal = class Portal {
    constructor(factory, originalLoc, p) {
        this.factory = factory;
        this.originalLoc = originalLoc;
        this.p = p;
        this.id = nextId('au$component');
        this.strict = false;
        // to make the shape of this object consistent.
        // todo: is this necessary
        this.currentTarget = p.document.createElement('div');
        this.view = this.factory.create();
        setEffectiveParentNode(this.view.nodes, originalLoc);
    }
    attaching(initiator, parent, flags) {
        if (this.callbackContext == null) {
            this.callbackContext = this.$controller.scope.bindingContext;
        }
        const newTarget = this.currentTarget = this.resolveTarget();
        this.view.setHost(newTarget);
        return this.$activating(initiator, newTarget, flags);
    }
    detaching(initiator, parent, flags) {
        return this.$deactivating(initiator, this.currentTarget, flags);
    }
    targetChanged() {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        const oldTarget = this.currentTarget;
        const newTarget = this.currentTarget = this.resolveTarget();
        if (oldTarget === newTarget) {
            return;
        }
        this.view.setHost(newTarget);
        // TODO(fkleuver): fix and test possible race condition
        const ret = onResolve(this.$deactivating(null, newTarget, $controller.flags), () => {
            return this.$activating(null, newTarget, $controller.flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    $activating(initiator, target, flags) {
        const { activating, callbackContext, view } = this;
        view.setHost(target);
        return onResolve(activating === null || activating === void 0 ? void 0 : activating.call(callbackContext, target, view), () => {
            return this.activate(initiator, target, flags);
        });
    }
    activate(initiator, target, flags) {
        const { $controller, view } = this;
        if (initiator === null) {
            view.nodes.appendTo(target);
        }
        else {
            // TODO(fkleuver): fix and test possible race condition
            return onResolve(view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope), () => {
                return this.$activated(target);
            });
        }
        return this.$activated(target);
    }
    $activated(target) {
        const { activated, callbackContext, view } = this;
        return activated === null || activated === void 0 ? void 0 : activated.call(callbackContext, target, view);
    }
    $deactivating(initiator, target, flags) {
        const { deactivating, callbackContext, view } = this;
        return onResolve(deactivating === null || deactivating === void 0 ? void 0 : deactivating.call(callbackContext, target, view), () => {
            return this.deactivate(initiator, target, flags);
        });
    }
    deactivate(initiator, target, flags) {
        const { $controller, view } = this;
        if (initiator === null) {
            view.nodes.remove();
        }
        else {
            return onResolve(view.deactivate(initiator, $controller, flags), () => {
                return this.$deactivated(target);
            });
        }
        return this.$deactivated(target);
    }
    $deactivated(target) {
        const { deactivated, callbackContext, view } = this;
        return deactivated === null || deactivated === void 0 ? void 0 : deactivated.call(callbackContext, target, view);
    }
    resolveTarget() {
        const p = this.p;
        // with a $ in front to make it less confusing/error prone
        const $document = p.document;
        let target = this.target;
        let context = this.renderContext;
        if (target === '') {
            if (this.strict) {
                throw new Error('Empty querySelector');
            }
            return $document.body;
        }
        if (typeof target === 'string') {
            let queryContext = $document;
            if (typeof context === 'string') {
                context = $document.querySelector(context);
            }
            if (context instanceof p.Node) {
                queryContext = context;
            }
            target = queryContext.querySelector(target);
        }
        if (target instanceof p.Node) {
            return target;
        }
        if (target == null) {
            if (this.strict) {
                throw new Error('Portal target not found');
            }
            return $document.body;
        }
        return target;
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
        this.callbackContext = null;
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
};
__decorate$d([
    bindable({ primary: true })
], Portal.prototype, "target", void 0);
__decorate$d([
    bindable({ callback: 'targetChanged' })
], Portal.prototype, "renderContext", void 0);
__decorate$d([
    bindable()
], Portal.prototype, "strict", void 0);
__decorate$d([
    bindable()
], Portal.prototype, "deactivating", void 0);
__decorate$d([
    bindable()
], Portal.prototype, "activating", void 0);
__decorate$d([
    bindable()
], Portal.prototype, "deactivated", void 0);
__decorate$d([
    bindable()
], Portal.prototype, "activated", void 0);
__decorate$d([
    bindable()
], Portal.prototype, "callbackContext", void 0);
Portal = __decorate$d([
    templateController('portal'),
    __param$d(0, IViewFactory),
    __param$d(1, IRenderLocation),
    __param$d(2, IPlatform)
], Portal);

class FlagsTemplateController {
    constructor(factory, location, flags) {
        this.factory = factory;
        this.flags = flags;
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    attaching(initiator, parent, flags) {
        const { $controller } = this;
        return this.view.activate(initiator, $controller, flags | this.flags, $controller.scope, $controller.hostScope);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
}
class FrequentMutations extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 512 /* persistentTargetObserverQueue */);
    }
}
/**
 * @internal
 */
FrequentMutations.inject = [IViewFactory, IRenderLocation];
class ObserveShallow extends FlagsTemplateController {
    constructor(factory, location) {
        super(factory, location, 128 /* observeLeafPropertiesOnly */);
    }
}
/**
 * @internal
 */
ObserveShallow.inject = [IViewFactory, IRenderLocation];
templateController('frequent-mutations')(FrequentMutations);
templateController('observe-shallow')(ObserveShallow);

var __decorate$c = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$c = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let If = class If {
    constructor(ifFactory, location, work) {
        this.ifFactory = ifFactory;
        this.location = location;
        this.work = work;
        this.id = nextId('au$component');
        this.elseFactory = void 0;
        this.elseView = void 0;
        this.ifView = void 0;
        this.view = void 0;
        this.value = false;
        this.pending = void 0;
        this.wantsDeactivate = false;
    }
    attaching(initiator, parent, flags) {
        return onResolve(this.pending, () => {
            var _a;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void ((_a = (this.view = this.updateView(this.value, flags))) === null || _a === void 0 ? void 0 : _a.activate(initiator, this.$controller, flags, this.$controller.scope, this.$controller.hostScope));
        });
    }
    detaching(initiator, parent, flags) {
        this.wantsDeactivate = true;
        return onResolve(this.pending, () => {
            var _a;
            this.wantsDeactivate = false;
            this.pending = void 0;
            // Promise return values from user VM hooks are awaited by the initiator
            void ((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(initiator, this.$controller, flags));
        });
    }
    valueChanged(newValue, oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.pending = onResolve(this.pending, () => {
            return this.swap(flags);
        });
    }
    swap(flags) {
        var _a;
        if (this.view === this.updateView(this.value, flags)) {
            return;
        }
        this.work.start();
        const ctrl = this.$controller;
        return onResolve((_a = this.view) === null || _a === void 0 ? void 0 : _a.deactivate(this.view, ctrl, flags), () => {
            // return early if detaching was called during the swap
            if (this.wantsDeactivate) {
                return;
            }
            // value may have changed during deactivate
            const nextView = this.view = this.updateView(this.value, flags);
            return onResolve(nextView === null || nextView === void 0 ? void 0 : nextView.activate(nextView, ctrl, flags, ctrl.scope, ctrl.hostScope), () => {
                this.work.finish();
                // only null the pending promise if nothing changed since the activation start
                if (this.view === this.updateView(this.value, flags)) {
                    this.pending = void 0;
                }
            });
        });
    }
    /** @internal */
    updateView(value, flags) {
        if (value) {
            return this.ifView = this.ensureView(this.ifView, this.ifFactory, flags);
        }
        if (this.elseFactory !== void 0) {
            return this.elseView = this.ensureView(this.elseView, this.elseFactory, flags);
        }
        return void 0;
    }
    /** @internal */
    ensureView(view, factory, flags) {
        if (view === void 0) {
            view = factory.create(flags);
            view.setLocation(this.location);
        }
        return view;
    }
    dispose() {
        var _a, _b;
        (_a = this.ifView) === null || _a === void 0 ? void 0 : _a.dispose();
        this.ifView = void 0;
        (_b = this.elseView) === null || _b === void 0 ? void 0 : _b.dispose();
        this.elseView = void 0;
        this.view = void 0;
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
};
__decorate$c([
    bindable
], If.prototype, "value", void 0);
If = __decorate$c([
    templateController('if'),
    __param$c(0, IViewFactory),
    __param$c(1, IRenderLocation),
    __param$c(2, IWorkTracker)
], If);
let Else = class Else {
    constructor(factory) {
        this.factory = factory;
        this.id = nextId('au$component');
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        const children = controller.children;
        const ifBehavior = children[children.length - 1];
        if (ifBehavior instanceof If) {
            ifBehavior.elseFactory = this.factory;
        }
        else if (ifBehavior.viewModel instanceof If) {
            ifBehavior.viewModel.elseFactory = this.factory;
        }
        else {
            throw new Error(`Unsupported IfBehavior`); // TODO: create error code
        }
    }
};
Else = __decorate$c([
    templateController({ name: 'else' }),
    __param$c(0, IViewFactory)
], Else);

var __decorate$b = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$b = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
function dispose(disposable) {
    disposable.dispose();
}
let Repeat = class Repeat {
    constructor(location, parent, factory) {
        this.location = location;
        this.parent = parent;
        this.factory = factory;
        this.id = nextId('au$component');
        this.hasPendingInstanceMutation = false;
        this.observer = void 0;
        this.views = [];
        this.key = void 0;
        this.normalizedItems = void 0;
    }
    binding(initiator, parent, flags) {
        this.checkCollectionObserver(flags);
        const bindings = this.parent.bindings;
        let binding = (void 0);
        for (let i = 0, ii = bindings.length; i < ii; ++i) {
            binding = bindings[i];
            if (binding.target === this && binding.targetProperty === 'items') {
                this.forOf = binding.sourceExpression;
                break;
            }
        }
        this.local = this.forOf.declaration.evaluate(flags, this.$controller.scope, null, binding.locator, null);
    }
    attaching(initiator, parent, flags) {
        this.normalizeToArray(flags);
        return this.activateAllViews(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        this.checkCollectionObserver(flags);
        return this.deactivateAllViews(initiator, flags);
    }
    // called by SetterObserver
    itemsChanged(flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        flags |= $controller.flags;
        this.checkCollectionObserver(flags);
        this.normalizeToArray(flags);
        const ret = onResolve(this.deactivateAllViews(null, flags), () => {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
            return this.activateAllViews(null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    // called by a CollectionObserver
    handleCollectionChange(indexMap, flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        flags |= $controller.flags;
        this.normalizeToArray(flags);
        if (indexMap === void 0) {
            const ret = onResolve(this.deactivateAllViews(null, flags), () => {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                return this.activateAllViews(null, flags);
            });
            if (ret instanceof Promise) {
                ret.catch(err => { throw err; });
            }
        }
        else {
            const oldLength = this.views.length;
            applyMutationsToIndices(indexMap);
            // first detach+unbind+(remove from array) the deleted view indices
            if (indexMap.deletedItems.length > 0) {
                indexMap.deletedItems.sort(compareNumber);
                const ret = onResolve(this.deactivateAndRemoveViewsByKey(indexMap, flags), () => {
                    // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add a variety of `if` integration tests
                    return this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
                });
                if (ret instanceof Promise) {
                    ret.catch(err => { throw err; });
                }
            }
            else {
                // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.createAndActivateAndSortViewsByKey(oldLength, indexMap, flags);
            }
        }
    }
    // todo: subscribe to collection from inner expression
    checkCollectionObserver(flags) {
        const oldObserver = this.observer;
        if ((flags & 4 /* fromUnbind */)) {
            if (oldObserver !== void 0) {
                oldObserver.unsubscribe(this);
            }
        }
        else if (this.$controller.isActive) {
            const newObserver = this.observer = getCollectionObserver$1(this.items);
            if (oldObserver !== newObserver && oldObserver) {
                oldObserver.unsubscribe(this);
            }
            if (newObserver) {
                newObserver.subscribe(this);
            }
        }
    }
    normalizeToArray(flags) {
        const items = this.items;
        if (items instanceof Array) {
            this.normalizedItems = items;
            return;
        }
        const forOf = this.forOf;
        if (forOf === void 0) {
            return;
        }
        const normalizedItems = [];
        this.forOf.iterate(flags, items, (arr, index, item) => {
            normalizedItems[index] = item;
        });
        this.normalizedItems = normalizedItems;
    }
    activateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        const { $controller, factory, local, location, items } = this;
        const parentScope = $controller.scope;
        const hostScope = $controller.hostScope;
        const newLen = this.forOf.count(flags, items);
        const views = this.views = Array(newLen);
        this.forOf.iterate(flags, items, (arr, i, item) => {
            view = views[i] = factory.create(flags).setLocation(location);
            view.nodes.unlink();
            viewScope = Scope.fromParent(parentScope, BindingContext.create(local, item));
            setContextualProperties(viewScope.overrideContext, i, newLen);
            ret = view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, viewScope, hostScope);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
        });
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    deactivateAllViews(initiator, flags) {
        let promises = void 0;
        let ret;
        let view;
        const { views, $controller } = this;
        for (let i = 0, ii = views.length; i < ii; ++i) {
            view = views[i];
            view.release();
            ret = view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    deactivateAndRemoveViewsByKey(indexMap, flags) {
        let promises = void 0;
        let ret;
        let view;
        const { $controller, views } = this;
        const deleted = indexMap.deletedItems;
        const deletedLen = deleted.length;
        let i = 0;
        for (; i < deletedLen; ++i) {
            view = views[deleted[i]];
            view.release();
            ret = view.deactivate(view, $controller, flags);
            if (ret instanceof Promise) {
                (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
            }
        }
        i = 0;
        let j = 0;
        for (; i < deletedLen; ++i) {
            j = deleted[i] - i;
            views.splice(j, 1);
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    createAndActivateAndSortViewsByKey(oldLength, indexMap, flags) {
        var _a;
        let promises = void 0;
        let ret;
        let view;
        let viewScope;
        const { $controller, factory, local, normalizedItems, location, views } = this;
        const mapLen = indexMap.length;
        for (let i = 0; i < mapLen; ++i) {
            if (indexMap[i] === -2) {
                view = factory.create(flags);
                views.splice(i, 0, view);
            }
        }
        if (views.length !== mapLen) {
            // TODO: create error code and use reporter with more informative message
            throw new Error(`viewsLen=${views.length}, mapLen=${mapLen}`);
        }
        const parentScope = $controller.scope;
        const hostScope = $controller.hostScope;
        const newLen = indexMap.length;
        synchronizeIndices(views, indexMap);
        // this algorithm retrieves the indices of the longest increasing subsequence of items in the repeater
        // the items on those indices are not moved; this minimizes the number of DOM operations that need to be performed
        const seq = longestIncreasingSubsequence(indexMap);
        const seqLen = seq.length;
        let next;
        let j = seqLen - 1;
        let i = newLen - 1;
        for (; i >= 0; --i) {
            view = views[i];
            next = views[i + 1];
            view.nodes.link((_a = next === null || next === void 0 ? void 0 : next.nodes) !== null && _a !== void 0 ? _a : location);
            if (indexMap[i] === -2) {
                viewScope = Scope.fromParent(parentScope, BindingContext.create(local, normalizedItems[i]));
                setContextualProperties(viewScope.overrideContext, i, newLen);
                view.setLocation(location);
                ret = view.activate(view, $controller, flags, viewScope, hostScope);
                if (ret instanceof Promise) {
                    (promises !== null && promises !== void 0 ? promises : (promises = [])).push(ret);
                }
            }
            else if (j < 0 || seqLen === 1 || i !== seq[j]) {
                setContextualProperties(view.scope.overrideContext, i, newLen);
                view.nodes.insertBefore(view.location);
            }
            else {
                if (oldLength !== newLen) {
                    setContextualProperties(view.scope.overrideContext, i, newLen);
                }
                --j;
            }
        }
        if (promises !== void 0) {
            return promises.length === 1
                ? promises[0]
                : Promise.all(promises);
        }
    }
    dispose() {
        this.views.forEach(dispose);
        this.views = (void 0);
    }
    accept(visitor) {
        const { views } = this;
        if (views !== void 0) {
            for (let i = 0, ii = views.length; i < ii; ++i) {
                if (views[i].accept(visitor) === true) {
                    return true;
                }
            }
        }
    }
};
__decorate$b([
    bindable
], Repeat.prototype, "items", void 0);
Repeat = __decorate$b([
    templateController('repeat'),
    __param$b(0, IRenderLocation),
    __param$b(1, IController),
    __param$b(2, IViewFactory)
], Repeat);
let maxLen = 16;
let prevIndices = new Int32Array(maxLen);
let tailIndices = new Int32Array(maxLen);
// Based on inferno's lis_algorithm @ https://github.com/infernojs/inferno/blob/master/packages/inferno/src/DOM/patching.ts#L732
// with some tweaks to make it just a bit faster + account for IndexMap (and some names changes for readability)
/** @internal */
function longestIncreasingSubsequence(indexMap) {
    const len = indexMap.length;
    if (len > maxLen) {
        maxLen = len;
        prevIndices = new Int32Array(len);
        tailIndices = new Int32Array(len);
    }
    let cursor = 0;
    let cur = 0;
    let prev = 0;
    let i = 0;
    let j = 0;
    let low = 0;
    let high = 0;
    let mid = 0;
    for (; i < len; i++) {
        cur = indexMap[i];
        if (cur !== -2) {
            j = prevIndices[cursor];
            prev = indexMap[j];
            if (prev !== -2 && prev < cur) {
                tailIndices[i] = j;
                prevIndices[++cursor] = i;
                continue;
            }
            low = 0;
            high = cursor;
            while (low < high) {
                mid = (low + high) >> 1;
                prev = indexMap[prevIndices[mid]];
                if (prev !== -2 && prev < cur) {
                    low = mid + 1;
                }
                else {
                    high = mid;
                }
            }
            prev = indexMap[prevIndices[low]];
            if (cur < prev || prev === -2) {
                if (low > 0) {
                    tailIndices[i] = prevIndices[low - 1];
                }
                prevIndices[low] = i;
            }
        }
    }
    i = ++cursor;
    const result = new Int32Array(i);
    cur = prevIndices[cursor - 1];
    while (cursor-- > 0) {
        result[cursor] = cur;
        cur = tailIndices[cur];
    }
    while (i-- > 0)
        prevIndices[i] = 0;
    return result;
}
function setContextualProperties(oc, index, length) {
    const isFirst = index === 0;
    const isLast = index === length - 1;
    const isEven = index % 2 === 0;
    oc.$index = index;
    oc.$first = isFirst;
    oc.$last = isLast;
    oc.$middle = !isFirst && !isLast;
    oc.$even = isEven;
    oc.$odd = !isEven;
    oc.$length = length;
}

var __decorate$a = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$a = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let With = class With {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        this.id = nextId('au$component');
        this.view = this.factory.create().setLocation(location);
    }
    valueChanged(newValue, oldValue, flags) {
        if (this.$controller.isActive) {
            // TODO(fkleuver): add logic to the controller that ensures correct handling of race conditions and add integration tests
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.activateView(this.view, 2 /* fromBind */);
        }
    }
    attaching(initiator, parent, flags) {
        return this.activateView(initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.view.deactivate(initiator, this.$controller, flags);
    }
    activateView(initiator, flags) {
        const { $controller, value } = this;
        const scope = Scope.fromParent($controller.scope, value === void 0 ? {} : value);
        return this.view.activate(initiator, $controller, flags, scope, $controller.hostScope);
    }
    dispose() {
        this.view.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
};
__decorate$a([
    bindable
], With.prototype, "value", void 0);
With = __decorate$a([
    templateController('with'),
    __param$a(0, IViewFactory),
    __param$a(1, IRenderLocation)
], With);

var __decorate$9 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$9 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let Switch = class Switch {
    constructor(factory, location) {
        this.factory = factory;
        this.location = location;
        this.id = nextId('au$component');
        /** @internal */
        this.cases = [];
        this.activeCases = [];
        /**
         * This is kept around here so that changes can be awaited from the tests.
         * This needs to be removed after the scheduler is ready to handle/queue the floating promises.
         */
        this.promise = void 0;
    }
    link(flags, _parentContext, _controller, _childController, _target, _instruction) {
        this.view = this.factory.create(flags, this.$controller).setLocation(this.location);
    }
    attaching(initiator, parent, flags) {
        const view = this.view;
        const $controller = this.$controller;
        this.queue(() => view.activate(initiator, $controller, flags, $controller.scope, $controller.hostScope));
        this.queue(() => this.swap(initiator, flags, this.value));
        return this.promise;
    }
    detaching(initiator, parent, flags) {
        this.queue(() => {
            const view = this.view;
            return view.deactivate(initiator, this.$controller, flags);
        });
        return this.promise;
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
    valueChanged(_newValue, _oldValue, flags) {
        if (!this.$controller.isActive) {
            return;
        }
        this.queue(() => this.swap(null, flags, this.value));
    }
    caseChanged($case, flags) {
        this.queue(() => this.handleCaseChange($case, flags));
    }
    handleCaseChange($case, flags) {
        const isMatch = $case.isMatch(this.value, flags);
        const activeCases = this.activeCases;
        const numActiveCases = activeCases.length;
        // Early termination #1
        if (!isMatch) {
            /** The previous match started with this; thus clear. */
            if (numActiveCases > 0 && activeCases[0].id === $case.id) {
                return this.clearActiveCases(null, flags);
            }
            /**
             * There are 2 different scenarios here:
             * 1. $case in activeCases: Indicates by-product of fallthrough. The starting case still satisfies. Return.
             * 2. $case not in activeCases: It was previously not active, and currently also not a match. Return.
             */
            return;
        }
        // Early termination #2
        if (numActiveCases > 0 && activeCases[0].id < $case.id) {
            // Even if this case now a match, the previous case still wins by as that has lower ordinal.
            return;
        }
        // compute the new active cases
        const newActiveCases = [];
        let fallThrough = $case.fallThrough;
        if (!fallThrough) {
            newActiveCases.push($case);
        }
        else {
            const cases = this.cases;
            const idx = cases.indexOf($case);
            for (let i = idx, ii = cases.length; i < ii && fallThrough; i++) {
                const c = cases[i];
                newActiveCases.push(c);
                fallThrough = c.fallThrough;
            }
        }
        return onResolve(this.clearActiveCases(null, flags, newActiveCases), () => {
            this.activeCases = newActiveCases;
            return this.activateCases(null, flags);
        });
    }
    swap(initiator, flags, value) {
        const newActiveCases = [];
        let fallThrough = false;
        for (const $case of this.cases) {
            if (fallThrough || $case.isMatch(value, flags)) {
                newActiveCases.push($case);
                fallThrough = $case.fallThrough;
            }
            if (newActiveCases.length > 0 && !fallThrough) {
                break;
            }
        }
        const defaultCase = this.defaultCase;
        if (newActiveCases.length === 0 && defaultCase !== void 0) {
            newActiveCases.push(defaultCase);
        }
        return onResolve(this.activeCases.length > 0
            ? this.clearActiveCases(initiator, flags, newActiveCases)
            : void 0, () => {
            this.activeCases = newActiveCases;
            if (newActiveCases.length === 0) {
                return;
            }
            return this.activateCases(initiator, flags);
        });
    }
    activateCases(initiator, flags) {
        const controller = this.$controller;
        if (!controller.isActive) {
            return;
        }
        const cases = this.activeCases;
        const length = cases.length;
        if (length === 0) {
            return;
        }
        const scope = controller.scope;
        const hostScope = controller.hostScope;
        // most common case
        if (length === 1) {
            return cases[0].activate(initiator, flags, scope, hostScope);
        }
        return resolveAll(...cases.map(($case) => $case.activate(initiator, flags, scope, hostScope)));
    }
    clearActiveCases(initiator, flags, newActiveCases = []) {
        const cases = this.activeCases;
        const numCases = cases.length;
        if (numCases === 0) {
            return;
        }
        if (numCases === 1) {
            const firstCase = cases[0];
            if (!newActiveCases.includes(firstCase)) {
                cases.length = 0;
                return firstCase.deactivate(initiator, flags);
            }
            return;
        }
        return onResolve(resolveAll(...cases.reduce((acc, $case) => {
            if (!newActiveCases.includes($case)) {
                acc.push($case.deactivate(initiator, flags));
            }
            return acc;
        }, [])), () => {
            cases.length = 0;
        });
    }
    queue(action) {
        const previousPromise = this.promise;
        let promise = void 0;
        promise = this.promise = onResolve(onResolve(previousPromise, action), () => {
            if (this.promise === promise) {
                this.promise = void 0;
            }
        });
    }
    accept(visitor) {
        if (this.$controller.accept(visitor) === true) {
            return true;
        }
        if (this.activeCases.some(x => x.accept(visitor))) {
            return true;
        }
    }
};
__decorate$9([
    bindable
], Switch.prototype, "value", void 0);
Switch = __decorate$9([
    templateController('switch'),
    __param$9(0, IViewFactory),
    __param$9(1, IRenderLocation)
], Switch);
let Case = class Case {
    constructor(factory, locator, location, logger) {
        this.factory = factory;
        this.locator = locator;
        this.id = nextId('au$component');
        this.fallThrough = false;
        this.debug = logger.config.level <= 1 /* debug */;
        this.logger = logger.scopeTo(`${this.constructor.name}-#${this.id}`);
        this.view = this.factory.create().setLocation(location);
    }
    link(flags, parentContext, controller, _childController, _target, _instruction) {
        const switchController = controller.parent;
        const $switch = switchController === null || switchController === void 0 ? void 0 : switchController.viewModel;
        if ($switch instanceof Switch) {
            this.$switch = $switch;
            this.linkToSwitch($switch);
        }
        else {
            throw new Error('The parent switch not found; only `*[switch] > *[case|default-case]` relation is supported.');
        }
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(initiator, flags);
    }
    isMatch(value, flags) {
        if (this.debug) {
            this.logger.debug('isMatch()');
        }
        const $value = this.value;
        if (Array.isArray($value)) {
            if (this.observer === void 0) {
                this.observer = this.observeCollection(flags, $value);
            }
            return $value.includes(value);
        }
        return $value === value;
    }
    valueChanged(newValue, _oldValue, flags) {
        var _a;
        if (Array.isArray(newValue)) {
            (_a = this.observer) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
            this.observer = this.observeCollection(flags, newValue);
        }
        else if (this.observer !== void 0) {
            this.observer.unsubscribe(this);
        }
        this.$switch.caseChanged(this, flags);
    }
    handleCollectionChange(_indexMap, flags) {
        this.$switch.caseChanged(this, flags);
    }
    activate(initiator, flags, scope, hostScope) {
        const view = this.view;
        if (view.isActive) {
            return;
        }
        return view.activate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags, scope, hostScope);
    }
    deactivate(initiator, flags) {
        const view = this.view;
        if (!view.isActive) {
            return;
        }
        return view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags);
    }
    dispose() {
        var _a, _b;
        (_a = this.observer) === null || _a === void 0 ? void 0 : _a.unsubscribe(this);
        (_b = this.view) === null || _b === void 0 ? void 0 : _b.dispose();
        this.view = (void 0);
    }
    linkToSwitch(auSwitch) {
        auSwitch.cases.push(this);
    }
    observeCollection(flags, $value) {
        const observer = this.locator.getArrayObserver($value);
        observer.subscribe(this);
        return observer;
    }
    accept(visitor) {
        var _a;
        if (this.$controller.accept(visitor) === true) {
            return true;
        }
        return (_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor);
    }
};
__decorate$9([
    bindable
], Case.prototype, "value", void 0);
__decorate$9([
    bindable({
        set: v => {
            switch (v) {
                case 'true': return true;
                case 'false': return false;
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                default: return !!v;
            }
        },
        mode: BindingMode.oneTime
    })
], Case.prototype, "fallThrough", void 0);
Case = __decorate$9([
    templateController('case'),
    __param$9(0, IViewFactory),
    __param$9(1, IObserverLocator),
    __param$9(2, IRenderLocation),
    __param$9(3, ILogger)
], Case);
let DefaultCase = class DefaultCase extends Case {
    linkToSwitch($switch) {
        if ($switch.defaultCase !== void 0) {
            throw new Error('Multiple \'default-case\'s are not allowed.');
        }
        $switch.defaultCase = this;
    }
};
DefaultCase = __decorate$9([
    templateController('default-case')
], DefaultCase);

function createElement(p, tagOrType, props, children) {
    if (typeof tagOrType === 'string') {
        return createElementForTag(p, tagOrType, props, children);
    }
    else if (CustomElement.isType(tagOrType)) {
        return createElementForType(p, tagOrType, props, children);
    }
    else {
        throw new Error(`Invalid tagOrType.`);
    }
}
/**
 * RenderPlan. Todo: describe goal of this class
 */
class RenderPlan {
    constructor(node, instructions, dependencies) {
        this.node = node;
        this.instructions = instructions;
        this.dependencies = dependencies;
        this.lazyDefinition = void 0;
    }
    get definition() {
        if (this.lazyDefinition === void 0) {
            this.lazyDefinition = CustomElementDefinition.create({
                name: CustomElement.generateName(),
                template: this.node,
                needsCompile: typeof this.node === 'string',
                instructions: this.instructions,
                dependencies: this.dependencies,
            });
        }
        return this.lazyDefinition;
    }
    getContext(parentContainer) {
        return getRenderContext(this.definition, parentContainer);
    }
    createView(parentContainer) {
        return this.getViewFactory(parentContainer).create();
    }
    getViewFactory(parentContainer) {
        return this.getContext(parentContainer).getViewFactory();
    }
    /** @internal */
    mergeInto(parent, instructions, dependencies) {
        parent.appendChild(this.node);
        instructions.push(...this.instructions);
        dependencies.push(...this.dependencies);
    }
}
function createElementForTag(p, tagName, props, children) {
    const instructions = [];
    const allInstructions = [];
    const dependencies = [];
    const element = p.document.createElement(tagName);
    let hasInstructions = false;
    if (props) {
        Object.keys(props)
            .forEach(to => {
            const value = props[to];
            if (isInstruction(value)) {
                hasInstructions = true;
                instructions.push(value);
            }
            else {
                element.setAttribute(to, value);
            }
        });
    }
    if (hasInstructions) {
        element.className = 'au';
        allInstructions.push(instructions);
    }
    if (children) {
        addChildren(p, element, children, allInstructions, dependencies);
    }
    return new RenderPlan(element, allInstructions, dependencies);
}
function createElementForType(p, Type, props, children) {
    const definition = CustomElement.getDefinition(Type);
    const tagName = definition.name;
    const instructions = [];
    const allInstructions = [instructions];
    const dependencies = [];
    const childInstructions = [];
    const bindables = definition.bindables;
    const element = p.document.createElement(tagName);
    element.className = 'au';
    if (!dependencies.includes(Type)) {
        dependencies.push(Type);
    }
    instructions.push(new HydrateElementInstruction(tagName, void 0, childInstructions, null));
    if (props) {
        Object.keys(props)
            .forEach(to => {
            const value = props[to];
            if (isInstruction(value)) {
                childInstructions.push(value);
            }
            else {
                const bindable = bindables[to];
                if (bindable !== void 0) {
                    childInstructions.push({
                        type: "re" /* setProperty */,
                        to,
                        value
                    });
                }
                else {
                    childInstructions.push(new SetAttributeInstruction(value, to));
                }
            }
        });
    }
    if (children) {
        addChildren(p, element, children, allInstructions, dependencies);
    }
    return new RenderPlan(element, allInstructions, dependencies);
}
function addChildren(p, parent, children, allInstructions, dependencies) {
    for (let i = 0, ii = children.length; i < ii; ++i) {
        const current = children[i];
        switch (typeof current) {
            case 'string':
                parent.appendChild(p.document.createTextNode(current));
                break;
            case 'object':
                if (current instanceof p.Node) {
                    parent.appendChild(current);
                }
                else if ('mergeInto' in current) {
                    current.mergeInto(parent, allInstructions, dependencies);
                }
        }
    }
}

var __decorate$8 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$8 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
function toLookup(acc, item) {
    const to = item.to;
    if (to !== void 0 && to !== 'subject' && to !== 'composing') {
        acc[to] = item;
    }
    return acc;
}
let Compose = class Compose {
    constructor(p, instruction) {
        this.p = p;
        this.id = nextId('au$component');
        this.subject = void 0;
        this.composing = false;
        this.view = void 0;
        this.lastSubject = void 0;
        this.properties = instruction.instructions.reduce(toLookup, {});
    }
    attaching(initiator, parent, flags) {
        const { subject, view } = this;
        if (view === void 0 || this.lastSubject !== subject) {
            this.lastSubject = subject;
            this.composing = true;
            return this.compose(void 0, subject, initiator, flags);
        }
        return this.compose(view, subject, initiator, flags);
    }
    detaching(initiator, parent, flags) {
        return this.deactivate(this.view, initiator, flags);
    }
    subjectChanged(newValue, previousValue, flags) {
        const { $controller } = this;
        if (!$controller.isActive) {
            return;
        }
        if (this.lastSubject === newValue) {
            return;
        }
        this.lastSubject = newValue;
        this.composing = true;
        flags |= $controller.flags;
        const ret = onResolve(this.deactivate(this.view, null, flags), () => {
            // TODO(fkleuver): handle & test race condition
            return this.compose(void 0, newValue, null, flags);
        });
        if (ret instanceof Promise) {
            ret.catch(err => { throw err; });
        }
    }
    compose(view, subject, initiator, flags) {
        return onResolve(view === void 0
            ? onResolve(subject, resolvedSubject => {
                return this.resolveView(resolvedSubject, flags);
            })
            : view, resolvedView => {
            return this.activate(resolvedView, initiator, flags);
        });
    }
    deactivate(view, initiator, flags) {
        return view === null || view === void 0 ? void 0 : view.deactivate(initiator !== null && initiator !== void 0 ? initiator : view, this.$controller, flags);
    }
    activate(view, initiator, flags) {
        const { $controller } = this;
        return onResolve(view === null || view === void 0 ? void 0 : view.activate(initiator !== null && initiator !== void 0 ? initiator : view, $controller, flags, $controller.scope, $controller.hostScope), () => {
            this.composing = false;
        });
    }
    resolveView(subject, flags) {
        const view = this.provideViewFor(subject, flags);
        if (view) {
            view.setLocation(this.$controller.location);
            view.lockScope(this.$controller.scope);
            return view;
        }
        return void 0;
    }
    provideViewFor(subject, flags) {
        if (!subject) {
            return void 0;
        }
        if (isController(subject)) { // IController
            return subject;
        }
        if ('createView' in subject) { // RenderPlan
            return subject.createView(this.$controller.context);
        }
        if ('create' in subject) { // IViewFactory
            return subject.create(flags);
        }
        if ('template' in subject) { // Raw Template Definition
            const definition = CustomElementDefinition.getOrCreate(subject);
            return getRenderContext(definition, this.$controller.context).getViewFactory().create(flags);
        }
        // Constructable (Custom Element Constructor)
        return createElement(this.p, subject, this.properties, this.$controller.host.childNodes).createView(this.$controller.context);
    }
    dispose() {
        var _a;
        (_a = this.view) === null || _a === void 0 ? void 0 : _a.dispose();
        this.view = (void 0);
    }
    accept(visitor) {
        var _a;
        if (((_a = this.view) === null || _a === void 0 ? void 0 : _a.accept(visitor)) === true) {
            return true;
        }
    }
};
__decorate$8([
    bindable
], Compose.prototype, "subject", void 0);
__decorate$8([
    bindable({ mode: BindingMode.fromView })
], Compose.prototype, "composing", void 0);
Compose = __decorate$8([
    customElement({ name: 'au-compose', template: null, containerless: true }),
    __param$8(0, IPlatform),
    __param$8(1, IInstruction)
], Compose);
function isController(subject) {
    return 'lockScope' in subject;
}

var __decorate$7 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$7 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const ISanitizer = DI.createInterface('ISanitizer', x => x.singleton(class {
    sanitize(input) {
        return input.replace(SCRIPT_REGEX, '');
    }
}));
/**
 * Simple html sanitization converter to preserve whitelisted elements and attributes on a bound property containing html.
 */
let SanitizeValueConverter = class SanitizeValueConverter {
    constructor(sanitizer) {
        this.sanitizer = sanitizer;
    }
    /**
     * Process the provided markup that flows to the view.
     *
     * @param untrustedMarkup - The untrusted markup to be sanitized.
     */
    toView(untrustedMarkup) {
        if (untrustedMarkup == null) {
            return null;
        }
        return this.sanitizer.sanitize(untrustedMarkup);
    }
};
SanitizeValueConverter = __decorate$7([
    __param$7(0, ISanitizer)
], SanitizeValueConverter);
valueConverter('sanitize')(SanitizeValueConverter);

var __decorate$6 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$6 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let ViewValueConverter = class ViewValueConverter {
    constructor(viewLocator) {
        this.viewLocator = viewLocator;
    }
    toView(object, viewNameOrSelector) {
        return this.viewLocator.getViewComponentForObject(object, viewNameOrSelector);
    }
};
ViewValueConverter = __decorate$6([
    __param$6(0, IViewLocator)
], ViewValueConverter);
valueConverter('view')(ViewValueConverter);

const DebounceBindingBehaviorRegistration = DebounceBindingBehavior;
const OneTimeBindingBehaviorRegistration = OneTimeBindingBehavior;
const ToViewBindingBehaviorRegistration = ToViewBindingBehavior;
const FromViewBindingBehaviorRegistration = FromViewBindingBehavior;
const SignalBindingBehaviorRegistration = SignalBindingBehavior;
const ThrottleBindingBehaviorRegistration = ThrottleBindingBehavior;
const TwoWayBindingBehaviorRegistration = TwoWayBindingBehavior;
const ITemplateCompilerRegistration = TemplateCompiler;
const INodeObserverLocatorRegistration = NodeObserverLocator;
/**
 * Default HTML-specific (but environment-agnostic) implementations for the following interfaces:
 * - `ITemplateCompiler`
 * - `ITargetAccessorLocator`
 * - `ITargetObserverLocator`
 */
const DefaultComponents = [
    ITemplateCompilerRegistration,
    INodeObserverLocatorRegistration,
];
const RefAttributePatternRegistration = RefAttributePattern;
const DotSeparatedAttributePatternRegistration = DotSeparatedAttributePattern;
/**
 * Default binding syntax for the following attribute name patterns:
 * - `ref`
 * - `target.command` (dot-separated)
 */
const DefaultBindingSyntax = [
    RefAttributePatternRegistration,
    DotSeparatedAttributePatternRegistration
];
const CallBindingCommandRegistration = CallBindingCommand;
const DefaultBindingCommandRegistration = DefaultBindingCommand;
const ForBindingCommandRegistration = ForBindingCommand;
const FromViewBindingCommandRegistration = FromViewBindingCommand;
const OneTimeBindingCommandRegistration = OneTimeBindingCommand;
const ToViewBindingCommandRegistration = ToViewBindingCommand;
const TwoWayBindingCommandRegistration = TwoWayBindingCommand;
const RefBindingCommandRegistration = RefBindingCommand;
const TriggerBindingCommandRegistration = TriggerBindingCommand;
const DelegateBindingCommandRegistration = DelegateBindingCommand;
const CaptureBindingCommandRegistration = CaptureBindingCommand;
const AttrBindingCommandRegistration = AttrBindingCommand;
const ClassBindingCommandRegistration = ClassBindingCommand;
const StyleBindingCommandRegistration = StyleBindingCommand;
/**
 * Default HTML-specific (but environment-agnostic) binding commands:
 * - Property observation: `.bind`, `.one-time`, `.from-view`, `.to-view`, `.two-way`
 * - Function call: `.call`
 * - Collection observation: `.for`
 * - Event listeners: `.trigger`, `.delegate`, `.capture`
 */
const DefaultBindingLanguage = [
    DefaultBindingCommandRegistration,
    OneTimeBindingCommandRegistration,
    FromViewBindingCommandRegistration,
    ToViewBindingCommandRegistration,
    TwoWayBindingCommandRegistration,
    CallBindingCommandRegistration,
    ForBindingCommandRegistration,
    RefBindingCommandRegistration,
    TriggerBindingCommandRegistration,
    DelegateBindingCommandRegistration,
    CaptureBindingCommandRegistration,
    ClassBindingCommandRegistration,
    StyleBindingCommandRegistration,
    AttrBindingCommandRegistration,
];
const SanitizeValueConverterRegistration = SanitizeValueConverter;
const ViewValueConverterRegistration = ViewValueConverter;
const FrequentMutationsRegistration = FrequentMutations;
const ObserveShallowRegistration = ObserveShallow;
const IfRegistration = If;
const ElseRegistration = Else;
const RepeatRegistration = Repeat;
const WithRegistration = With;
const SwitchRegistration = Switch;
const CaseRegistration = Case;
const DefaultCaseRegistration = DefaultCase;
const AttrBindingBehaviorRegistration = AttrBindingBehavior;
const SelfBindingBehaviorRegistration = SelfBindingBehavior;
const UpdateTriggerBindingBehaviorRegistration = UpdateTriggerBindingBehavior;
const ComposeRegistration = Compose;
const PortalRegistration = Portal;
const FocusRegistration = Focus;
const BlurRegistration = Blur;
const ShowRegistration = Show;
/**
 * Default HTML-specific (but environment-agnostic) resources:
 * - Binding Behaviors: `oneTime`, `toView`, `fromView`, `twoWay`, `signal`, `debounce`, `throttle`, `attr`, `self`, `updateTrigger`
 * - Custom Elements: `au-compose`, `au-slot`
 * - Custom Attributes: `blur`, `focus`, `portal`
 * - Template controllers: `if`/`else`, `repeat`, `with`
 * - Value Converters: `sanitize`
 */
const DefaultResources = [
    DebounceBindingBehaviorRegistration,
    OneTimeBindingBehaviorRegistration,
    ToViewBindingBehaviorRegistration,
    FromViewBindingBehaviorRegistration,
    SignalBindingBehaviorRegistration,
    ThrottleBindingBehaviorRegistration,
    TwoWayBindingBehaviorRegistration,
    SanitizeValueConverterRegistration,
    ViewValueConverterRegistration,
    FrequentMutationsRegistration,
    ObserveShallowRegistration,
    IfRegistration,
    ElseRegistration,
    RepeatRegistration,
    WithRegistration,
    SwitchRegistration,
    CaseRegistration,
    DefaultCaseRegistration,
    AttrBindingBehaviorRegistration,
    SelfBindingBehaviorRegistration,
    UpdateTriggerBindingBehaviorRegistration,
    ComposeRegistration,
    PortalRegistration,
    FocusRegistration,
    BlurRegistration,
    ShowRegistration,
    AuSlot,
];
const CallBindingRendererRegistration = CallBindingRenderer;
const CustomAttributeRendererRegistration = CustomAttributeRenderer;
const CustomElementRendererRegistration = CustomElementRenderer;
const InterpolationBindingRendererRegistration = InterpolationBindingRenderer;
const IteratorBindingRendererRegistration = IteratorBindingRenderer;
const LetElementRendererRegistration = LetElementRenderer;
const PropertyBindingRendererRegistration = PropertyBindingRenderer;
const RefBindingRendererRegistration = RefBindingRenderer;
const SetPropertyRendererRegistration = SetPropertyRenderer;
const TemplateControllerRendererRegistration = TemplateControllerRenderer;
const ListenerBindingRendererRegistration = ListenerBindingRenderer;
const AttributeBindingRendererRegistration = AttributeBindingRenderer;
const SetAttributeRendererRegistration = SetAttributeRenderer;
const SetClassAttributeRendererRegistration = SetClassAttributeRenderer;
const SetStyleAttributeRendererRegistration = SetStyleAttributeRenderer;
const StylePropertyBindingRendererRegistration = StylePropertyBindingRenderer;
const TextBindingRendererRegistration = TextBindingRenderer;
/**
 * Default renderers for:
 * - PropertyBinding: `bind`, `one-time`, `to-view`, `from-view`, `two-way`
 * - IteratorBinding: `for`
 * - CallBinding: `call`
 * - RefBinding: `ref`
 * - InterpolationBinding: `${}`
 * - SetProperty
 * - `customElement` hydration
 * - `customAttribute` hydration
 * - `templateController` hydration
 * - `let` element hydration
 * - Listener Bindings: `trigger`, `capture`, `delegate`
 * - SetAttribute
 * - StyleProperty: `style`, `css`
 * - TextBinding: `${}`
 */
const DefaultRenderers = [
    PropertyBindingRendererRegistration,
    IteratorBindingRendererRegistration,
    CallBindingRendererRegistration,
    RefBindingRendererRegistration,
    InterpolationBindingRendererRegistration,
    SetPropertyRendererRegistration,
    CustomElementRendererRegistration,
    CustomAttributeRendererRegistration,
    TemplateControllerRendererRegistration,
    LetElementRendererRegistration,
    ListenerBindingRendererRegistration,
    AttributeBindingRendererRegistration,
    SetAttributeRendererRegistration,
    SetClassAttributeRendererRegistration,
    SetStyleAttributeRendererRegistration,
    StylePropertyBindingRendererRegistration,
    TextBindingRendererRegistration,
];
/**
 * A DI configuration object containing html-specific (but environment-agnostic) registrations:
 * - `RuntimeConfiguration` from `@aurelia/runtime`
 * - `DefaultComponents`
 * - `DefaultResources`
 * - `DefaultRenderers`
 */
const StandardConfiguration = {
    /**
     * Apply this configuration to the provided container.
     */
    register(container) {
        return container.register(...DefaultComponents, ...DefaultResources, ...DefaultBindingSyntax, ...DefaultBindingLanguage, ...DefaultRenderers);
    },
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer() {
        return this.register(DI.createContainer());
    }
};

const IAurelia = DI.createInterface('IAurelia');
class Aurelia$1 {
    constructor(container = DI.createContainer()) {
        this.container = container;
        this._isRunning = false;
        this._isStarting = false;
        this._isStopping = false;
        this._root = void 0;
        this.next = void 0;
        this.startPromise = void 0;
        this.stopPromise = void 0;
        if (container.has(IAurelia, true)) {
            throw new Error('An instance of Aurelia is already registered with the container or an ancestor of it.');
        }
        container.register(Registration.instance(IAurelia, this));
        container.registerResolver(IAppRoot, this.rootProvider = new InstanceProvider('IAppRoot'));
    }
    get isRunning() { return this._isRunning; }
    get isStarting() { return this._isStarting; }
    get isStopping() { return this._isStopping; }
    get root() {
        if (this._root == void 0) {
            if (this.next == void 0) {
                throw new Error(`root is not defined`); // TODO: create error code
            }
            return this.next;
        }
        return this._root;
    }
    register(...params) {
        this.container.register(...params);
        return this;
    }
    app(config) {
        this.next = new AppRoot(config, this.initPlatform(config.host), this.container, this.rootProvider, false);
        return this;
    }
    enhance(config) {
        this.next = new AppRoot(config, this.initPlatform(config.host), this.container, this.rootProvider, true);
        return this;
    }
    async waitForIdle() {
        const platform = this.root.platform;
        await platform.domWriteQueue.yield();
        await platform.domReadQueue.yield();
        await platform.taskQueue.yield();
    }
    initPlatform(host) {
        let p;
        if (!this.container.has(IPlatform, false)) {
            if (host.ownerDocument.defaultView === null) {
                throw new Error(`Failed to initialize the platform object. The host element's ownerDocument does not have a defaultView`);
            }
            p = new BrowserPlatform(host.ownerDocument.defaultView);
            this.container.register(Registration.instance(IPlatform, p));
        }
        else {
            p = this.container.get(IPlatform);
        }
        return p;
    }
    start(root = this.next) {
        if (root == void 0) {
            throw new Error(`There is no composition root`);
        }
        if (this.startPromise instanceof Promise) {
            return this.startPromise;
        }
        return this.startPromise = onResolve(this.stop(), () => {
            Reflect.set(root.host, '$aurelia', this);
            this.rootProvider.prepare(this._root = root);
            this._isStarting = true;
            return onResolve(root.activate(), () => {
                this._isRunning = true;
                this._isStarting = false;
                this.startPromise = void 0;
                this.dispatchEvent(root, 'au-started', root.host);
            });
        });
    }
    stop(dispose = false) {
        if (this.stopPromise instanceof Promise) {
            return this.stopPromise;
        }
        if (this._isRunning === true) {
            const root = this._root;
            this._isRunning = false;
            this._isStopping = true;
            return this.stopPromise = onResolve(root.deactivate(), () => {
                Reflect.deleteProperty(root.host, '$aurelia');
                if (dispose) {
                    root.dispose();
                }
                this._root = void 0;
                this.rootProvider.dispose();
                this._isStopping = false;
                this.dispatchEvent(root, 'au-stopped', root.host);
            });
        }
    }
    dispose() {
        if (this._isRunning || this._isStopping) {
            throw new Error(`The aurelia instance must be fully stopped before it can be disposed`);
        }
        this.container.dispose();
    }
    dispatchEvent(root, name, target) {
        const ev = new root.platform.window.CustomEvent(name, { detail: this, bubbles: true, cancelable: true });
        target.dispatchEvent(ev);
    }
}

const retryStrategy = {
    fixed: 0,
    incremental: 1,
    exponential: 2,
    random: 3
};
const defaultRetryConfig = {
    maxRetries: 3,
    interval: 1000,
    strategy: retryStrategy.fixed
};
/**
 * Interceptor that retries requests on error, based on a given RetryConfiguration.
 */
class RetryInterceptor {
    /**
     * Creates an instance of RetryInterceptor.
     */
    constructor(retryConfig) {
        this.retryConfig = { ...defaultRetryConfig, ...(retryConfig !== undefined ? retryConfig : {}) };
        if (this.retryConfig.strategy === retryStrategy.exponential &&
            this.retryConfig.interval <= 1000) {
            throw new Error('An interval less than or equal to 1 second is not allowed when using the exponential retry strategy');
        }
    }
    /**
     * Called with the request before it is sent. It remembers the request so it can be retried on error.
     *
     * @param request - The request to be sent.
     * @returns The existing request, a new request or a response; or a Promise for any of these.
     */
    request(request) {
        if (!request.retryConfig) {
            request.retryConfig = { ...this.retryConfig };
            request.retryConfig.counter = 0;
        }
        // do this on every request
        request.retryConfig.requestClone = request.clone();
        return request;
    }
    /**
     * Called with the response after it is received. Clears the remembered request, as it was succesfull.
     *
     * @param response - The response.
     * @returns The response; or a Promise for one.
     */
    response(response, request) {
        // retry was successful, so clean up after ourselves
        Reflect.deleteProperty(request, 'retryConfig');
        return response;
    }
    /**
     * Handles fetch errors and errors generated by previous interceptors. This
     * function acts as a Promise rejection handler. It wil retry the remembered request based on the
     * configured RetryConfiguration.
     *
     * @param error - The rejection value from the fetch request or from a
     * previous interceptor.
     * @returns The response of the retry; or a Promise for one.
     */
    responseError(error, request, httpClient) {
        const { retryConfig } = request;
        const { requestClone } = retryConfig;
        return Promise.resolve().then(() => {
            if (retryConfig.counter < retryConfig.maxRetries) {
                const result = retryConfig.doRetry !== undefined ? retryConfig.doRetry(error, request) : true;
                return Promise.resolve(result).then(doRetry => {
                    if (doRetry) {
                        retryConfig.counter++;
                        const delay = calculateDelay(retryConfig);
                        return new Promise(resolve => setTimeout(resolve, !isNaN(delay) ? delay : 0))
                            .then(() => {
                            const newRequest = requestClone.clone();
                            if (typeof (retryConfig.beforeRetry) === 'function') {
                                return retryConfig.beforeRetry(newRequest, httpClient);
                            }
                            return newRequest;
                        })
                            .then(newRequest => {
                            const retryableRequest = { ...newRequest, retryConfig };
                            return httpClient.fetch(retryableRequest);
                        });
                    }
                    // no more retries, so clean up
                    Reflect.deleteProperty(request, 'retryConfig');
                    throw error;
                });
            }
            // no more retries, so clean up
            Reflect.deleteProperty(request, 'retryConfig');
            throw error;
        });
    }
}
function calculateDelay(retryConfig) {
    const { interval, strategy, minRandomInterval, maxRandomInterval, counter } = retryConfig;
    if (typeof (strategy) === 'function') {
        return retryConfig.strategy(counter);
    }
    switch (strategy) {
        case (retryStrategy.fixed):
            return retryStrategies[retryStrategy.fixed](interval);
        case (retryStrategy.incremental):
            return retryStrategies[retryStrategy.incremental](counter, interval);
        case (retryStrategy.exponential):
            return retryStrategies[retryStrategy.exponential](counter, interval);
        case (retryStrategy.random):
            return retryStrategies[retryStrategy.random](counter, interval, minRandomInterval, maxRandomInterval);
        default:
            throw new Error('Unrecognized retry strategy');
    }
}
const retryStrategies = [
    // fixed
    interval => interval,
    // incremental
    (retryCount, interval) => interval * retryCount,
    // exponential
    (retryCount, interval) => retryCount === 1 ? interval : interval ** retryCount / 1000,
    // random
    (retryCount, interval, minRandomInterval = 0, maxRandomInterval = 60000) => {
        return Math.random() * (maxRandomInterval - minRandomInterval) + minRandomInterval;
    }
];

/**
 * A class for configuring HttpClients.
 */
class HttpClientConfiguration {
    constructor() {
        /**
         * The base URL to be prepended to each Request's url before sending.
         */
        this.baseUrl = '';
        /**
         * Default values to apply to init objects when creating Requests. Note that
         * defaults cannot be applied when Request objects are manually created because
         * Request provides its own defaults and discards the original init object.
         * See also https://developer.mozilla.org/en-US/docs/Web/API/Request/Request
         */
        this.defaults = {};
        /**
         * Interceptors to be added to the HttpClient.
         */
        this.interceptors = [];
        this.dispatcher = null;
    }
    /**
     * Sets the baseUrl.
     *
     * @param baseUrl - The base URL.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withBaseUrl(baseUrl) {
        this.baseUrl = baseUrl;
        return this;
    }
    /**
     * Sets the defaults.
     *
     * @param defaults - The defaults.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withDefaults(defaults) {
        this.defaults = defaults;
        return this;
    }
    /**
     * Adds an interceptor to be run on all requests or responses.
     *
     * @param interceptor - An object with request, requestError,
     * response, or responseError methods. request and requestError act as
     * resolve and reject handlers for the Request before it is sent.
     * response and responseError act as resolve and reject handlers for
     * the Response after it has been received.
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    withInterceptor(interceptor) {
        this.interceptors.push(interceptor);
        return this;
    }
    /**
     * Applies a configuration that addresses common application needs, including
     * configuring same-origin credentials, and using rejectErrorResponses.
     *
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    useStandardConfiguration() {
        const standardConfig = { credentials: 'same-origin' };
        Object.assign(this.defaults, standardConfig, this.defaults);
        return this.rejectErrorResponses();
    }
    /**
     * Causes Responses whose status codes fall outside the range 200-299 to reject.
     * The fetch API only rejects on network errors or other conditions that prevent
     * the request from completing, meaning consumers must inspect Response.ok in the
     * Promise continuation to determine if the server responded with a success code.
     * This method adds a response interceptor that causes Responses with error codes
     * to be rejected, which is common behavior in HTTP client libraries.
     *
     * @returns The chainable instance of this configuration object.
     * @chainable
     */
    rejectErrorResponses() {
        return this.withInterceptor({ response: rejectOnError });
    }
    withRetry(config) {
        const interceptor = new RetryInterceptor(config);
        return this.withInterceptor(interceptor);
    }
    withDispatcher(dispatcher) {
        this.dispatcher = dispatcher;
        return this;
    }
}
function rejectOnError(response) {
    if (!response.ok) {
        throw response;
    }
    return response;
}

const absoluteUrlRegexp = /^([a-z][a-z0-9+\-.]*:)?\/\//i;
DI.createInterface('IHttpClient', x => x.singleton(HttpClient));
/**
 * An HTTP client based on the Fetch API.
 */
class HttpClient {
    /**
     * Creates an instance of HttpClient.
     */
    constructor() {
        this.dispatcher = null;
        this.activeRequestCount = 0;
        this.isRequesting = false;
        this.isConfigured = false;
        this.baseUrl = '';
        this.defaults = null;
        this.interceptors = [];
    }
    /**
     * Configure this client with default settings to be used by all requests.
     *
     * @param config - A configuration object, or a function that takes a config
     * object and configures it.
     * @returns The chainable instance of this HttpClient.
     * @chainable
     */
    configure(config) {
        let normalizedConfig;
        if (typeof config === 'object') {
            const requestInitConfiguration = { defaults: config };
            normalizedConfig = requestInitConfiguration;
        }
        else if (typeof config === 'function') {
            normalizedConfig = new HttpClientConfiguration();
            normalizedConfig.baseUrl = this.baseUrl;
            normalizedConfig.defaults = { ...this.defaults };
            normalizedConfig.interceptors = this.interceptors;
            normalizedConfig.dispatcher = this.dispatcher;
            const c = config(normalizedConfig);
            if (Object.prototype.isPrototypeOf.call(HttpClientConfiguration.prototype, c)) {
                normalizedConfig = c;
            }
        }
        else {
            throw new Error('invalid config');
        }
        const defaults = normalizedConfig.defaults;
        if (defaults !== undefined && Object.prototype.isPrototypeOf.call(Headers.prototype, defaults.headers)) {
            // Headers instances are not iterable in all browsers. Require a plain
            // object here to allow default headers to be merged into request headers.
            throw new Error('Default headers must be a plain object.');
        }
        const interceptors = normalizedConfig.interceptors;
        if (interceptors !== undefined && interceptors.length) {
            // find if there is a RetryInterceptor
            if (interceptors.filter(x => Object.prototype.isPrototypeOf.call(RetryInterceptor.prototype, x)).length > 1) {
                throw new Error('Only one RetryInterceptor is allowed.');
            }
            const retryInterceptorIndex = interceptors.findIndex(x => Object.prototype.isPrototypeOf.call(RetryInterceptor.prototype, x));
            if (retryInterceptorIndex >= 0 && retryInterceptorIndex !== interceptors.length - 1) {
                throw new Error('The retry interceptor must be the last interceptor defined.');
            }
        }
        this.baseUrl = normalizedConfig.baseUrl;
        this.defaults = defaults;
        this.interceptors = normalizedConfig.interceptors !== undefined ? normalizedConfig.interceptors : [];
        this.dispatcher = normalizedConfig.dispatcher;
        this.isConfigured = true;
        return this;
    }
    /**
     * Starts the process of fetching a resource. Default configuration parameters
     * will be applied to the Request. The constructed Request will be passed to
     * registered request interceptors before being sent. The Response will be passed
     * to registered Response interceptors before it is returned.
     *
     * See also https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    fetch(input, init) {
        this.trackRequestStart();
        let request = this.buildRequest(input, init);
        return this.processRequest(request, this.interceptors).then(result => {
            let response;
            if (Object.prototype.isPrototypeOf.call(Response.prototype, result)) {
                response = Promise.resolve(result);
            }
            else if (Object.prototype.isPrototypeOf.call(Request.prototype, result)) {
                request = result;
                response = fetch(request);
            }
            else {
                throw new Error(`An invalid result was returned by the interceptor chain. Expected a Request or Response instance, but got [${result}]`);
            }
            return this.processResponse(response, this.interceptors, request);
        })
            .then(result => {
            if (Object.prototype.isPrototypeOf.call(Request.prototype, result)) {
                return this.fetch(result);
            }
            return result;
        })
            .then(result => {
            this.trackRequestEnd();
            return result;
        }, error => {
            this.trackRequestEnd();
            throw error;
        });
    }
    buildRequest(input, init) {
        const defaults = this.defaults !== null ? this.defaults : {};
        let request;
        let body;
        let requestContentType;
        const parsedDefaultHeaders = parseHeaderValues(defaults.headers);
        if (Object.prototype.isPrototypeOf.call(Request.prototype, input)) {
            request = input;
            requestContentType = new Headers(request.headers).get('Content-Type');
        }
        else {
            if (!init) {
                init = {};
            }
            body = init.body;
            const bodyObj = body !== undefined ? { body: body } : null;
            const requestInit = { ...defaults, headers: {}, ...init, ...bodyObj };
            requestContentType = new Headers(requestInit.headers).get('Content-Type');
            request = new Request(getRequestUrl(this.baseUrl, input), requestInit);
        }
        if (!requestContentType) {
            if (new Headers(parsedDefaultHeaders).has('content-type')) {
                request.headers.set('Content-Type', new Headers(parsedDefaultHeaders).get('content-type'));
            }
            else if (body !== undefined && isJSON(body)) {
                request.headers.set('Content-Type', 'application/json');
            }
        }
        setDefaultHeaders(request.headers, parsedDefaultHeaders);
        if (body !== undefined && Object.prototype.isPrototypeOf.call(Blob.prototype, body) && body.type) {
            // work around bug in IE & Edge where the Blob type is ignored in the request
            // https://connect.microsoft.com/IE/feedback/details/2136163
            request.headers.set('Content-Type', body.type);
        }
        return request;
    }
    /**
     * Calls fetch as a GET request.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    get(input, init) {
        return this.fetch(input, init);
    }
    /**
     * Calls fetch with request method set to POST.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    post(input, body, init) {
        return this.callFetch(input, body, init, 'POST');
    }
    /**
     * Calls fetch with request method set to PUT.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    put(input, body, init) {
        return this.callFetch(input, body, init, 'PUT');
    }
    /**
     * Calls fetch with request method set to PATCH.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    patch(input, body, init) {
        return this.callFetch(input, body, init, 'PATCH');
    }
    /**
     * Calls fetch with request method set to DELETE.
     *
     * @param input - The resource that you wish to fetch. Either a
     * Request object, or a string containing the URL of the resource.
     * @param body - The body of the request.
     * @param init - An options object containing settings to be applied to
     * the Request.
     * @returns A Promise for the Response from the fetch request.
     */
    delete(input, body, init) {
        return this.callFetch(input, body, init, 'DELETE');
    }
    trackRequestStart() {
        this.isRequesting = !!(++this.activeRequestCount);
        if (this.isRequesting && this.dispatcher !== null) {
            const evt = new this.dispatcher.ownerDocument.defaultView.CustomEvent('aurelia-fetch-client-request-started', { bubbles: true, cancelable: true });
            setTimeout(() => { this.dispatcher.dispatchEvent(evt); }, 1);
        }
    }
    trackRequestEnd() {
        this.isRequesting = !!(--this.activeRequestCount);
        if (!this.isRequesting && this.dispatcher !== null) {
            const evt = new this.dispatcher.ownerDocument.defaultView.CustomEvent('aurelia-fetch-client-requests-drained', { bubbles: true, cancelable: true });
            setTimeout(() => { this.dispatcher.dispatchEvent(evt); }, 1);
        }
    }
    processRequest(request, interceptors) {
        return this.applyInterceptors(request, interceptors, 'request', 'requestError', this);
    }
    processResponse(response, interceptors, request) {
        return this.applyInterceptors(response, interceptors, 'response', 'responseError', request, this);
    }
    applyInterceptors(input, interceptors, successName, errorName, ...interceptorArgs) {
        return (interceptors !== undefined ? interceptors : [])
            .reduce((chain, interceptor) => {
            const successHandler = interceptor[successName];
            const errorHandler = interceptor[errorName];
            // TODO: Fix this, as it violates `strictBindCallApply`.
            return chain.then(successHandler ? (value => successHandler.call(interceptor, value, ...interceptorArgs)) : identity, errorHandler ? (reason => errorHandler.call(interceptor, reason, ...interceptorArgs)) : thrower);
        }, Promise.resolve(input));
    }
    callFetch(input, body, init, method) {
        if (!init) {
            init = {};
        }
        init.method = method;
        if (body) {
            init.body = body;
        }
        return this.fetch(input, init);
    }
}
function parseHeaderValues(headers) {
    const parsedHeaders = {};
    const $headers = headers !== undefined ? headers : {};
    for (const name in $headers) {
        if (Object.prototype.hasOwnProperty.call($headers, name)) {
            parsedHeaders[name] = (typeof $headers[name] === 'function')
                ? $headers[name]()
                : $headers[name];
        }
    }
    return parsedHeaders;
}
function getRequestUrl(baseUrl, url) {
    if (absoluteUrlRegexp.test(url)) {
        return url;
    }
    return (baseUrl !== undefined ? baseUrl : '') + url;
}
function setDefaultHeaders(headers, defaultHeaders) {
    const $defaultHeaders = defaultHeaders !== undefined ? defaultHeaders : {};
    for (const name in $defaultHeaders) {
        if (Object.prototype.hasOwnProperty.call($defaultHeaders, name) && !headers.has(name)) {
            headers.set(name, $defaultHeaders[name]);
        }
    }
}
function isJSON(str) {
    try {
        JSON.parse(str);
    }
    catch (err) {
        return false;
    }
    return true;
}
function identity(x) {
    return x;
}
function thrower(x) {
    throw x;
}

class ConfigurableRoute {
    constructor(path, caseSensitive, handler) {
        this.path = path;
        this.caseSensitive = caseSensitive;
        this.handler = handler;
    }
}
class Endpoint {
    constructor(route, paramNames) {
        this.route = route;
        this.paramNames = paramNames;
    }
}
class RecognizedRoute {
    constructor(endpoint, params) {
        this.endpoint = endpoint;
        this.params = params;
    }
}
class Candidate {
    constructor(chars, states, skippedStates, result) {
        var _a;
        this.chars = chars;
        this.states = states;
        this.skippedStates = skippedStates;
        this.result = result;
        this.head = states[states.length - 1];
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        this.endpoint = (_a = this.head) === null || _a === void 0 ? void 0 : _a.endpoint;
    }
    advance(ch) {
        const { chars, states, skippedStates, result } = this;
        let stateToAdd = null;
        let matchCount = 0;
        const state = states[states.length - 1];
        function $process(nextState, skippedState) {
            if (nextState.isMatch(ch)) {
                if (++matchCount === 1) {
                    stateToAdd = nextState;
                }
                else {
                    result.add(new Candidate(chars.concat(ch), states.concat(nextState), skippedState === null ? skippedStates : skippedStates.concat(skippedState), result));
                }
            }
            if (state.segment === null && nextState.isOptional && nextState.nextStates !== null) {
                if (nextState.nextStates.length > 1) {
                    throw new Error(`${nextState.nextStates.length} nextStates`);
                }
                const separator = nextState.nextStates[0];
                if (!separator.isSeparator) {
                    throw new Error(`Not a separator`);
                }
                if (separator.nextStates !== null) {
                    for (const $nextState of separator.nextStates) {
                        $process($nextState, nextState);
                    }
                }
            }
        }
        if (state.isDynamic) {
            $process(state, null);
        }
        if (state.nextStates !== null) {
            for (const nextState of state.nextStates) {
                $process(nextState, null);
            }
        }
        if (stateToAdd !== null) {
            states.push(this.head = stateToAdd);
            chars.push(ch);
            if (stateToAdd.endpoint !== null) {
                this.endpoint = stateToAdd.endpoint;
            }
        }
        if (matchCount === 0) {
            result.remove(this);
        }
    }
    finalize() {
        function collectSkippedStates(skippedStates, state) {
            const nextStates = state.nextStates;
            if (nextStates !== null) {
                if (nextStates.length === 1 && nextStates[0].segment === null) {
                    collectSkippedStates(skippedStates, nextStates[0]);
                }
                else {
                    for (const nextState of nextStates) {
                        if (nextState.isOptional && nextState.endpoint !== null) {
                            skippedStates.push(nextState);
                            if (nextState.nextStates !== null) {
                                for (const $nextState of nextState.nextStates) {
                                    collectSkippedStates(skippedStates, $nextState);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }
        collectSkippedStates(this.skippedStates, this.head);
    }
    getParams() {
        const { states, chars, endpoint } = this;
        const params = {};
        // First initialize all properties with undefined so they all exist (even if they're not filled, e.g. non-matched optional params)
        for (const name of endpoint.paramNames) {
            params[name] = void 0;
        }
        for (let i = 0, ii = states.length; i < ii; ++i) {
            const state = states[i];
            if (state.isDynamic) {
                const name = state.segment.name;
                if (params[name] === void 0) {
                    params[name] = chars[i];
                }
                else {
                    params[name] += chars[i];
                }
            }
        }
        return params;
    }
    /**
     * Compares this candidate to another candidate to determine the correct sorting order.
     *
     * This algorithm is different from `sortSolutions` in v1's route-recognizer in that it compares
     * the candidates segment-by-segment, rather than merely comparing the cumulative of segment types
     *
     * This resolves v1's ambiguity in situations like `/foo/:id/bar` vs. `/foo/bar/:id`, which had the
     * same sorting value because they both consist of two static segments and one dynamic segment.
     *
     * With this algorithm, `/foo/bar/:id` would always be sorted first because the second segment is different,
     * and static wins over dynamic.
     *
     * ### NOTE
     * This algorithm violates some of the invariants of v1's algorithm,
     * but those invariants were arguably not very sound to begin with. Example:
     *
     * `/foo/*path/bar/baz` vs. `/foo/bar/*path1/*path2`
     * - in v1, the first would win because that match has fewer stars
     * - in v2, the second will win because there is a bigger static match at the start of the pattern
     *
     * The algorithm should be more logical and easier to reason about in v2, but it's important to be aware of
     * subtle difference like this which might surprise some users who happened to rely on this behavior from v1,
     * intentionally or unintentionally.
     *
     * @param b - The candidate to compare this to.
     * Parameter name is `b` because the method should be used like so: `states.sort((a, b) => a.compareTo(b))`.
     * This will bring the candidate with the highest score to the first position of the array.
     */
    compareTo(b) {
        const statesA = this.states;
        const statesB = b.states;
        for (let iA = 0, iB = 0, ii = Math.max(statesA.length, statesB.length); iA < ii; ++iA) {
            let stateA = statesA[iA];
            if (stateA === void 0) {
                return 1;
            }
            let stateB = statesB[iB];
            if (stateB === void 0) {
                return -1;
            }
            let segmentA = stateA.segment;
            let segmentB = stateB.segment;
            if (segmentA === null) {
                if (segmentB === null) {
                    ++iB;
                    continue;
                }
                if ((stateA = statesA[++iA]) === void 0) {
                    return 1;
                }
                segmentA = stateA.segment;
            }
            else if (segmentB === null) {
                if ((stateB = statesB[++iB]) === void 0) {
                    return -1;
                }
                segmentB = stateB.segment;
            }
            if (segmentA.kind < segmentB.kind) {
                return 1;
            }
            if (segmentA.kind > segmentB.kind) {
                return -1;
            }
            ++iB;
        }
        const skippedStatesA = this.skippedStates;
        const skippedStatesB = b.skippedStates;
        const skippedStatesALen = skippedStatesA.length;
        const skippedStatesBLen = skippedStatesB.length;
        if (skippedStatesALen < skippedStatesBLen) {
            return 1;
        }
        if (skippedStatesALen > skippedStatesBLen) {
            return -1;
        }
        for (let i = 0; i < skippedStatesALen; ++i) {
            const skippedStateA = skippedStatesA[i];
            const skippedStateB = skippedStatesB[i];
            if (skippedStateA.length < skippedStateB.length) {
                return 1;
            }
            if (skippedStateA.length > skippedStateB.length) {
                return -1;
            }
        }
        // This should only be possible with a single pattern with multiple consecutive star segments.
        // TODO: probably want to warn or even throw here, but leave it be for now.
        return 0;
    }
}
function hasEndpoint(candidate) {
    return candidate.head.endpoint !== null;
}
function compareChains(a, b) {
    return a.compareTo(b);
}
class RecognizeResult {
    constructor(rootState) {
        this.candidates = [];
        this.candidates = [new Candidate([''], [rootState], [], this)];
    }
    get isEmpty() {
        return this.candidates.length === 0;
    }
    getSolution() {
        const candidates = this.candidates.filter(hasEndpoint);
        if (candidates.length === 0) {
            return null;
        }
        for (const candidate of candidates) {
            candidate.finalize();
        }
        candidates.sort(compareChains);
        return candidates[0];
    }
    add(candidate) {
        this.candidates.push(candidate);
    }
    remove(candidate) {
        this.candidates.splice(this.candidates.indexOf(candidate), 1);
    }
    advance(ch) {
        const candidates = this.candidates.slice();
        for (const candidate of candidates) {
            candidate.advance(ch);
        }
    }
}
class RouteRecognizer {
    constructor() {
        this.rootState = new State$1(null, null, '');
        this.cache = new Map();
    }
    add(routeOrRoutes) {
        if (routeOrRoutes instanceof Array) {
            for (const route of routeOrRoutes) {
                this.$add(route);
            }
        }
        else {
            this.$add(routeOrRoutes);
        }
        // Clear the cache whenever there are state changes, because the recognizeResults could be arbitrarily different as a result
        this.cache.clear();
    }
    $add(route) {
        const path = route.path;
        const $route = new ConfigurableRoute(route.path, route.caseSensitive === true, route.handler);
        // Normalize leading, trailing and double slashes by ignoring empty segments
        const parts = path === '' ? [''] : path.split('/').filter(isNotEmpty);
        const paramNames = [];
        let state = this.rootState;
        for (const part of parts) {
            // Each segment always begins with a slash, so we represent this with a non-segment state
            state = state.append(null, '/');
            switch (part.charAt(0)) {
                case ':': { // route parameter
                    const isOptional = part.endsWith('?');
                    const name = isOptional ? part.slice(1, -1) : part.slice(1);
                    paramNames.push(name);
                    state = new DynamicSegment(name, isOptional).appendTo(state);
                    break;
                }
                case '*': { // dynamic route
                    const name = part.slice(1);
                    paramNames.push(name);
                    state = new StarSegment(name).appendTo(state);
                    break;
                }
                default: { // standard path route
                    state = new StaticSegment(part, $route.caseSensitive).appendTo(state);
                    break;
                }
            }
        }
        const endpoint = new Endpoint($route, paramNames);
        state.setEndpoint(endpoint);
    }
    recognize(path) {
        let result = this.cache.get(path);
        if (result === void 0) {
            this.cache.set(path, result = this.$recognize(path));
        }
        return result;
    }
    $recognize(path) {
        path = decodeURI(path);
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        if (path.length > 1 && path.endsWith('/')) {
            path = path.slice(0, -1);
        }
        const result = new RecognizeResult(this.rootState);
        for (let i = 0, ii = path.length; i < ii; ++i) {
            const ch = path.charAt(i);
            result.advance(ch);
            if (result.isEmpty) {
                return null;
            }
        }
        const candidate = result.getSolution();
        if (candidate === null) {
            return null;
        }
        const { endpoint } = candidate;
        const params = candidate.getParams();
        return new RecognizedRoute(endpoint, params);
    }
}
class State$1 {
    constructor(prevState, segment, value) {
        this.prevState = prevState;
        this.segment = segment;
        this.value = value;
        this.nextStates = null;
        this.endpoint = null;
        switch (segment === null || segment === void 0 ? void 0 : segment.kind) {
            case 2 /* dynamic */:
                this.length = prevState.length + 1;
                this.isSeparator = false;
                this.isDynamic = true;
                this.isOptional = segment.optional;
                break;
            case 1 /* star */:
                this.length = prevState.length + 1;
                this.isSeparator = false;
                this.isDynamic = true;
                this.isOptional = false;
                break;
            case 3 /* static */:
                this.length = prevState.length + 1;
                this.isSeparator = false;
                this.isDynamic = false;
                this.isOptional = false;
                break;
            case undefined:
                this.length = prevState === null ? 0 : prevState.length;
                this.isSeparator = true;
                this.isDynamic = false;
                this.isOptional = false;
                break;
        }
    }
    append(segment, value) {
        let state;
        let nextStates = this.nextStates;
        if (nextStates === null) {
            state = void 0;
            nextStates = this.nextStates = [];
        }
        else if (segment === null) {
            state = nextStates.find(s => s.value === value);
        }
        else {
            state = nextStates.find(s => { var _a; return (_a = s.segment) === null || _a === void 0 ? void 0 : _a.equals(segment); });
        }
        if (state === void 0) {
            nextStates.push(state = new State$1(this, segment, value));
        }
        return state;
    }
    setEndpoint(endpoint) {
        if (this.endpoint !== null) {
            throw new Error(`Cannot add ambiguous route. The pattern '${endpoint.route.path}' clashes with '${this.endpoint.route.path}'`);
        }
        this.endpoint = endpoint;
        if (this.isOptional) {
            this.prevState.setEndpoint(endpoint);
            if (this.prevState.isSeparator && this.prevState.prevState !== null) {
                this.prevState.prevState.setEndpoint(endpoint);
            }
        }
    }
    isMatch(ch) {
        const segment = this.segment;
        switch (segment === null || segment === void 0 ? void 0 : segment.kind) {
            case 2 /* dynamic */:
                return !this.value.includes(ch);
            case 1 /* star */:
                return true;
            case 3 /* static */:
            case undefined:
                // segment separators (slashes) are non-segments. We could say return ch === '/' as well, technically.
                return this.value.includes(ch);
        }
    }
}
function isNotEmpty(segment) {
    return segment.length > 0;
}
var SegmentKind;
(function (SegmentKind) {
    SegmentKind[SegmentKind["star"] = 1] = "star";
    SegmentKind[SegmentKind["dynamic"] = 2] = "dynamic";
    SegmentKind[SegmentKind["static"] = 3] = "static";
})(SegmentKind || (SegmentKind = {}));
class StaticSegment {
    constructor(value, caseSensitive) {
        this.value = value;
        this.caseSensitive = caseSensitive;
    }
    get kind() { return 3 /* static */; }
    appendTo(state) {
        const { value, value: { length } } = this;
        if (this.caseSensitive) {
            for (let i = 0; i < length; ++i) {
                state = state.append(
                /* segment */ this, 
                /* value   */ value.charAt(i));
            }
        }
        else {
            for (let i = 0; i < length; ++i) {
                const ch = value.charAt(i);
                state = state.append(
                /* segment */ this, 
                /* value   */ ch.toUpperCase() + ch.toLowerCase());
            }
        }
        return state;
    }
    equals(b) {
        return (b.kind === 3 /* static */ &&
            b.caseSensitive === this.caseSensitive &&
            b.value === this.value);
    }
}
class DynamicSegment {
    constructor(name, optional) {
        this.name = name;
        this.optional = optional;
    }
    get kind() { return 2 /* dynamic */; }
    appendTo(state) {
        state = state.append(
        /* segment */ this, 
        /* value   */ '/');
        return state;
    }
    equals(b) {
        return (b.kind === 2 /* dynamic */ &&
            b.optional === this.optional &&
            b.name === this.name);
    }
}
class StarSegment {
    constructor(name) {
        this.name = name;
    }
    get kind() { return 1 /* star */; }
    appendTo(state) {
        state = state.append(
        /* segment */ this, 
        /* value   */ '');
        return state;
    }
    equals(b) {
        return (b.kind === 1 /* star */ &&
            b.name === this.name);
    }
}

class Batch {
    constructor(stack, cb, head) {
        this.stack = stack;
        this.cb = cb;
        this.done = false;
        this.next = null;
        this.head = head !== null && head !== void 0 ? head : this;
    }
    static start(cb) {
        return new Batch(0, cb, null);
    }
    push() {
        let cur = this;
        do {
            ++cur.stack;
            cur = cur.next;
        } while (cur !== null);
    }
    pop() {
        let cur = this;
        do {
            if (--cur.stack === 0) {
                cur.invoke();
            }
            cur = cur.next;
        } while (cur !== null);
    }
    invoke() {
        const cb = this.cb;
        if (cb !== null) {
            this.cb = null;
            cb(this);
            this.done = true;
        }
    }
    continueWith(cb) {
        if (this.next === null) {
            return this.next = new Batch(this.stack, cb, this.head);
        }
        else {
            return this.next.continueWith(cb);
        }
    }
    start() {
        this.head.push();
        this.head.pop();
        return this;
    }
}
function mergeDistinct(prev, next) {
    prev = prev.slice();
    next = next.slice();
    const merged = [];
    while (prev.length > 0) {
        const p = prev.shift();
        if (merged.every(m => m.context.vpa !== p.context.vpa)) {
            const i = next.findIndex(n => n.context.vpa === p.context.vpa);
            if (i >= 0) {
                merged.push(...next.splice(0, i + 1));
            }
            else {
                merged.push(p);
            }
        }
    }
    merged.push(...next);
    return merged;
}
function tryStringify(value) {
    try {
        return JSON.stringify(value);
    }
    catch (_a) {
        return Object.prototype.toString.call(value);
    }
}
function ensureArrayOfStrings(value) {
    return typeof value === 'string' ? [value] : value;
}
function ensureString(value) {
    return typeof value === 'string' ? value : value[0];
}

function isNotNullishOrTypeOrViewModel(value) {
    return (typeof value === 'object' &&
        value !== null &&
        !isCustomElementViewModel(value));
}
function isPartialCustomElementDefinition(value) {
    // 'name' is the only mandatory property of a CustomElementDefinition.
    // It overlaps with RouteType and may overlap with CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'name') === true);
}
function isPartialChildRouteConfig(value) {
    // 'component' is the only mandatory property of a ChildRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
function isPartialRedirectRouteConfig(value) {
    // 'redirectTo' and 'path' are mandatory properties of a RedirectRouteConfig
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'redirectTo') === true);
}
// Yes, `isPartialChildRouteConfig` and `isPartialViewportInstruction` have identical logic but since that is coincidental,
// and the two are intended to be used in specific contexts, we keep these as two separate functions for now.
function isPartialViewportInstruction(value) {
    // 'component' is the only mandatory property of a INavigationInstruction
    // It may overlap with RouteType and CustomElementViewModel, so this ducktype check is only valid when those are ruled out *first*
    return (isNotNullishOrTypeOrViewModel(value) &&
        Object.prototype.hasOwnProperty.call(value, 'component') === true);
}
function expectType(expected, prop, value) {
    throw new Error(`Invalid route config property: "${prop}". Expected ${expected}, but got ${tryStringify(value)}.`);
}
/**
 * Validate a `IRouteConfig` or `IChildRouteConfig`.
 *
 * The validation of these types is the same, except that `component` is a mandatory property of `IChildRouteConfig`.
 * This property is checked for in `validateComponent`.
 */
function validateRouteConfig(config, parentPath) {
    if (config === null || config === void 0) {
        throw new Error(`Invalid route config: expected an object or string, but got: ${String(config)}.`);
    }
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'id':
            case 'viewport':
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            case 'caseSensitive':
                if (typeof value !== 'boolean') {
                    expectType('boolean', path, value);
                }
                break;
            case 'data':
                if (typeof value !== 'object' || value === null) {
                    expectType('object', path, value);
                }
                break;
            case 'title':
                switch (typeof value) {
                    case 'string':
                    case 'function':
                        break;
                    default:
                        expectType('string or function', path, value);
                }
                break;
            case 'path':
                if (value instanceof Array) {
                    for (let i = 0; i < value.length; ++i) {
                        if (typeof value[i] !== 'string') {
                            expectType('string', `${path}[${i}]`, value[i]);
                        }
                    }
                }
                else if (typeof value !== 'string') {
                    expectType('string or Array of strings', path, value);
                }
                break;
            case 'component':
                validateComponent(value, path);
                break;
            case 'routes': {
                if (!(value instanceof Array)) {
                    expectType('Array', path, value);
                }
                for (const route of value) {
                    const childPath = `${path}[${value.indexOf(route)}]`; // TODO(fkleuver): remove 'any' (this type got very messy for some reason)
                    validateComponent(route, childPath);
                }
                break;
            }
            case 'transitionPlan':
                switch (typeof value) {
                    case 'string':
                        switch (value) {
                            case 'none':
                            case 'replace':
                            case 'invoke-lifecycles':
                                break;
                            default:
                                expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                        }
                        break;
                    case 'function':
                        break;
                    default:
                        expectType('string(\'none\'|\'replace\'|\'invoke-lifecycles\') or function', path, value);
                }
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(`Unknown route config property: "${parentPath}.${key}". Please specify known properties only.`);
        }
    }
}
function validateRedirectRouteConfig(config, parentPath) {
    if (config === null || config === void 0) {
        throw new Error(`Invalid route config: expected an object or string, but got: ${String(config)}.`);
    }
    const keys = Object.keys(config);
    for (const key of keys) {
        const value = config[key];
        const path = [parentPath, key].join('.');
        switch (key) {
            case 'path':
            case 'redirectTo':
                if (typeof value !== 'string') {
                    expectType('string', path, value);
                }
                break;
            default:
                // We don't *have* to throw here, but let's be as strict as possible until someone gives a valid reason for not doing so.
                throw new Error(`Unknown redirect config property: "${parentPath}.${key}". Only 'path' and 'redirectTo' should be specified for redirects.`);
        }
    }
}
function validateComponent(component, parentPath) {
    switch (typeof component) {
        case 'function':
            break;
        case 'object':
            if (component instanceof Promise) {
                break;
            }
            if (isPartialRedirectRouteConfig(component)) {
                validateRedirectRouteConfig(component, parentPath);
                break;
            }
            if (isPartialChildRouteConfig(component)) {
                validateRouteConfig(component, parentPath);
                break;
            }
            if (!isCustomElementViewModel(component) &&
                !isPartialCustomElementDefinition(component)) {
                expectType(`an object with at least a 'component' property (see Routeable)`, parentPath, component);
            }
            break;
        case 'string':
            break;
        default:
            expectType('function, object or string (see Routeable)', parentPath, component);
    }
}
function shallowEquals(a, b) {
    if (a === b) {
        return true;
    }
    if (typeof a !== typeof b) {
        return false;
    }
    if (a === null || b === null) {
        return false;
    }
    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
        return false;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) {
        return false;
    }
    for (let i = 0, ii = aKeys.length; i < ii; ++i) {
        const key = aKeys[i];
        if (key !== bKeys[i]) {
            return false;
        }
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
}

var __decorate$5 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$5 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
class Subscription {
    constructor(events, 
    /**
     * A unique serial number that makes individual subscribers more easily distinguishable in chronological order.
     *
     * Mainly for debugging purposes.
     */
    serial, inner) {
        this.events = events;
        this.serial = serial;
        this.inner = inner;
        this.disposed = false;
    }
    dispose() {
        if (!this.disposed) {
            this.disposed = true;
            this.inner.dispose();
            const subscriptions = this.events['subscriptions'];
            subscriptions.splice(subscriptions.indexOf(this), 1);
        }
    }
}
const IRouterEvents = DI.createInterface('IRouterEvents', x => x.singleton(RouterEvents));
let RouterEvents = class RouterEvents {
    constructor(ea, logger) {
        this.ea = ea;
        this.logger = logger;
        this.subscriptionSerial = 0;
        this.subscriptions = [];
        this.logger = logger.scopeTo('RouterEvents');
    }
    publish(event) {
        this.logger.trace(`publishing %s`, event);
        this.ea.publish(event.name, event);
    }
    subscribe(event, callback) {
        const subscription = new Subscription(this, ++this.subscriptionSerial, this.ea.subscribe(event, (message) => {
            this.logger.trace(`handling %s for subscription #${subscription.serial}`, event);
            callback(message);
        }));
        this.subscriptions.push(subscription);
        return subscription;
    }
};
RouterEvents = __decorate$5([
    __param$5(0, IEventAggregator),
    __param$5(1, ILogger)
], RouterEvents);
class LocationChangeEvent {
    constructor(id, url, trigger, state) {
        this.id = id;
        this.url = url;
        this.trigger = trigger;
        this.state = state;
    }
    get name() { return 'au:router:location-change'; }
    toString() {
        return `LocationChangeEvent(id:${this.id},url:'${this.url}',trigger:'${this.trigger}')`;
    }
}
class NavigationStartEvent {
    constructor(id, instructions, trigger, managedState) {
        this.id = id;
        this.instructions = instructions;
        this.trigger = trigger;
        this.managedState = managedState;
    }
    get name() { return 'au:router:navigation-start'; }
    toString() {
        return `NavigationStartEvent(id:${this.id},instructions:'${this.instructions}',trigger:'${this.trigger}')`;
    }
}
class NavigationEndEvent {
    constructor(id, instructions, finalInstructions) {
        this.id = id;
        this.instructions = instructions;
        this.finalInstructions = finalInstructions;
    }
    get name() { return 'au:router:navigation-end'; }
    toString() {
        return `NavigationEndEvent(id:${this.id},instructions:'${this.instructions}',finalInstructions:'${this.finalInstructions}')`;
    }
}
class NavigationCancelEvent {
    constructor(id, instructions, reason) {
        this.id = id;
        this.instructions = instructions;
        this.reason = reason;
    }
    get name() { return 'au:router:navigation-cancel'; }
    toString() {
        return `NavigationCancelEvent(id:${this.id},instructions:'${this.instructions}',reason:${String(this.reason)})`;
    }
}

var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$4 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const IBaseHrefProvider = DI.createInterface('IBaseHrefProvider', x => x.singleton(BrowserBaseHrefProvider));
/**
 * Default browser base href provider.
 *
 * Retrieves the base href based on the `<base>` element from `window.document.head`
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
let BrowserBaseHrefProvider = class BrowserBaseHrefProvider {
    constructor(window) {
        this.window = window;
    }
    getBaseHref() {
        const base = this.window.document.head.querySelector('base');
        if (base === null) {
            return null;
        }
        return normalizePath(base.href);
    }
};
BrowserBaseHrefProvider = __decorate$4([
    __param$4(0, IWindow)
], BrowserBaseHrefProvider);
const ILocationManager = DI.createInterface('ILocationManager', x => x.singleton(BrowserLocationManager));
/**
 * Default browser location manager.
 *
 * Encapsulates all DOM interactions (`window`, `location` and `history` apis) and exposes them in an environment-agnostic manner.
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
let BrowserLocationManager = class BrowserLocationManager {
    constructor(logger, events, history, location, window, baseHrefProvider) {
        var _a;
        this.logger = logger;
        this.events = events;
        this.history = history;
        this.location = location;
        this.window = window;
        this.baseHrefProvider = baseHrefProvider;
        this.eventId = 0;
        this.logger = logger.root.scopeTo('LocationManager');
        const baseHref = baseHrefProvider.getBaseHref();
        if (baseHref === null) {
            const origin = (_a = location.origin) !== null && _a !== void 0 ? _a : '';
            const normalized = this.baseHref = normalizePath(origin);
            this.logger.warn(`no baseHref provided, defaulting to origin '${normalized}' (normalized from '${origin}')`);
        }
        else {
            const normalized = this.baseHref = normalizePath(baseHref);
            this.logger.debug(`baseHref set to '${normalized}' (normalized from '${baseHref}')`);
        }
    }
    startListening() {
        this.logger.trace(`startListening()`);
        this.window.addEventListener('popstate', this.onPopState, false);
        this.window.addEventListener('hashchange', this.onHashChange, false);
    }
    stopListening() {
        this.logger.trace(`stopListening()`);
        this.window.removeEventListener('popstate', this.onPopState, false);
        this.window.removeEventListener('hashchange', this.onHashChange, false);
    }
    onPopState(event) {
        this.logger.trace(`onPopState()`);
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), 'popstate', event.state));
    }
    onHashChange(_event) {
        this.logger.trace(`onHashChange()`);
        this.events.publish(new LocationChangeEvent(++this.eventId, this.getPath(), 'hashchange', null));
    }
    pushState(state, title, url) {
        try {
            const stateString = JSON.stringify(state);
            this.logger.trace(`pushState(state:${stateString},title:'${title}',url:'${url}')`);
        }
        catch (err) {
            this.logger.warn(`pushState(state:NOT_SERIALIZABLE,title:'${title}',url:'${url}')`);
        }
        this.history.pushState(state, title, url);
    }
    replaceState(state, title, url) {
        try {
            const stateString = JSON.stringify(state);
            this.logger.trace(`replaceState(state:${stateString},title:'${title}',url:'${url}')`);
        }
        catch (err) {
            this.logger.warn(`replaceState(state:NOT_SERIALIZABLE,title:'${title}',url:'${url}')`);
        }
        this.history.replaceState(state, title, url);
    }
    getPath() {
        const { pathname, search, hash } = this.location;
        const path = this.normalize(`${pathname}${normalizeQuery(search)}${hash}`);
        this.logger.trace(`getPath() -> '${path}'`);
        return path;
    }
    currentPathEquals(path) {
        const equals = this.getPath() === this.normalize(path);
        this.logger.trace(`currentPathEquals(path:'${path}') -> ${equals}`);
        return equals;
    }
    getExternalURL(path) {
        const $path = path;
        let base = this.baseHref;
        if (base.endsWith('/')) {
            base = base.slice(0, -1);
        }
        if (path.startsWith('/')) {
            path = path.slice(1);
        }
        const url = `${base}/${path}`;
        this.logger.trace(`getExternalURL(path:'${$path}') -> '${url}'`);
        return url;
    }
    normalize(path) {
        const $path = path;
        if (path.startsWith(this.baseHref)) {
            path = path.slice(this.baseHref.length);
        }
        path = normalizePath(path);
        this.logger.trace(`normalize(path:'${$path}') -> '${path}'`);
        return path;
    }
};
__decorate$4([
    bound
], BrowserLocationManager.prototype, "onPopState", null);
__decorate$4([
    bound
], BrowserLocationManager.prototype, "onHashChange", null);
BrowserLocationManager = __decorate$4([
    __param$4(0, ILogger),
    __param$4(1, IRouterEvents),
    __param$4(2, IHistory),
    __param$4(3, ILocation),
    __param$4(4, IWindow),
    __param$4(5, IBaseHrefProvider)
], BrowserLocationManager);
/**
 * Strip trailing `/index.html` and trailing `/` from the path, if present.
 */
function normalizePath(path) {
    let start;
    let end;
    let index;
    if ((index = path.indexOf('?')) >= 0 || (index = path.indexOf('#')) >= 0) {
        start = path.slice(0, index);
        end = path.slice(index);
    }
    else {
        start = path;
        end = '';
    }
    if (start.endsWith('/')) {
        start = start.slice(0, -1);
    }
    else if (start.endsWith('/index.html')) {
        start = start.slice(0, -11 /* '/index.html'.length */);
    }
    return `${start}${end}`;
}
function normalizeQuery(query) {
    return query.length > 0 && !query.startsWith('?') ? `?${query}` : query;
}

// No-fallthrough disabled due to large numbers of false positives
class ViewportRequest {
    constructor(viewportName, componentName, resolution, append) {
        this.viewportName = viewportName;
        this.componentName = componentName;
        this.resolution = resolution;
        this.append = append;
    }
    static create(input) {
        return new ViewportRequest(input.viewportName, input.componentName, input.resolution, input.append);
    }
    toString() {
        return `VR(viewport:'${this.viewportName}',component:'${this.componentName}',resolution:'${this.resolution}',append:${this.append})`;
    }
}
const viewportAgentLookup = new WeakMap();
class ViewportAgent {
    constructor(viewport, hostController, ctx) {
        this.viewport = viewport;
        this.hostController = hostController;
        this.ctx = ctx;
        this.isActive = false;
        this.curCA = null;
        this.nextCA = null;
        this.state = 8256 /* bothAreEmpty */;
        this.$resolution = 'dynamic';
        this.$plan = 'replace';
        this.currNode = null;
        this.nextNode = null;
        this.currTransition = null;
        this.prevTransition = null;
        this.logger = ctx.get(ILogger).scopeTo(`ViewportAgent<${ctx.friendlyPath}>`);
        this.logger.trace(`constructor()`);
    }
    get $state() { return $state(this.state); }
    get currState() { return this.state & 16256 /* curr */; }
    set currState(state) { this.state = (this.state & 127 /* next */) | state; }
    get nextState() { return this.state & 127 /* next */; }
    set nextState(state) { this.state = (this.state & 16256 /* curr */) | state; }
    static for(viewport, ctx) {
        let viewportAgent = viewportAgentLookup.get(viewport);
        if (viewportAgent === void 0) {
            const controller = Controller.getCachedOrThrow(viewport);
            viewportAgentLookup.set(viewport, viewportAgent = new ViewportAgent(viewport, controller, ctx));
        }
        return viewportAgent;
    }
    activateFromViewport(initiator, parent, flags) {
        const tr = this.currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this.isActive = true;
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
                switch (this.currState) {
                    case 8192 /* currIsEmpty */:
                        this.logger.trace(`activateFromViewport() - nothing to activate at %s`, this);
                        return;
                    case 4096 /* currIsActive */:
                        this.logger.trace(`activateFromViewport() - activating existing componentAgent at %s`, this);
                        return this.curCA.activate(initiator, parent, flags);
                    default:
                        this.unexpectedState('activateFromViewport 1');
                }
            case 2 /* nextLoadDone */: {
                if (this.currTransition === null) {
                    throw new Error(`Unexpected viewport activation outside of a transition context at ${this}`);
                }
                if (this.$resolution !== 'static') {
                    throw new Error(`Unexpected viewport activation at ${this}`);
                }
                this.logger.trace(`activateFromViewport() - running ordinary activate at %s`, this);
                const b = Batch.start(b1 => { this.activate(initiator, this.currTransition, b1); });
                const p = new Promise(resolve => { b.continueWith(() => { resolve(); }); });
                return b.start().done ? void 0 : p;
            }
            default:
                this.unexpectedState('activateFromViewport 2');
        }
    }
    deactivateFromViewport(initiator, parent, flags) {
        const tr = this.currTransition;
        if (tr !== null) {
            ensureTransitionHasNotErrored(tr);
        }
        this.isActive = false;
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
                this.logger.trace(`deactivateFromViewport() - nothing to deactivate at %s`, this);
                return;
            case 4096 /* currIsActive */:
                this.logger.trace(`deactivateFromViewport() - deactivating existing componentAgent at %s`, this);
                return this.curCA.deactivate(initiator, parent, flags);
            case 128 /* currDeactivate */:
                // This will happen with bottom-up deactivation because the child is already deactivated, the parent
                // again tries to deactivate the child (that would be this viewport) but the router hasn't finalized the transition yet.
                // Since this is viewport was already deactivated, and we know the precise circumstance under which that happens, we can safely ignore the call.
                this.logger.trace(`deactivateFromViewport() - already deactivating at %s`, this);
                return;
            default: {
                if (this.currTransition === null) {
                    throw new Error(`Unexpected viewport deactivation outside of a transition context at ${this}`);
                }
                this.logger.trace(`deactivateFromViewport() - running ordinary deactivate at %s`, this);
                const b = Batch.start(b1 => { this.deactivate(initiator, this.currTransition, b1); });
                const p = new Promise(resolve => { b.continueWith(() => { resolve(); }); });
                return b.start().done ? void 0 : p;
            }
        }
    }
    handles(req) {
        if (!this.isAvailable(req.resolution)) {
            return false;
        }
        if (req.append && this.currState === 4096 /* currIsActive */) {
            this.logger.trace(`handles(req:%s) -> false (append mode, viewport already has content %s)`, req, this.curCA);
            return false;
        }
        if (req.viewportName.length > 0 && this.viewport.name !== req.viewportName) {
            this.logger.trace(`handles(req:%s) -> false (names don't match)`, req);
            return false;
        }
        if (this.viewport.usedBy.length > 0 && !this.viewport.usedBy.split(',').includes(req.componentName)) {
            this.logger.trace(`handles(req:%s) -> false (componentName not included in usedBy)`, req);
            return false;
        }
        this.logger.trace(`handles(req:%s) -> true`, req);
        return true;
    }
    isAvailable(resolution) {
        if (resolution === 'dynamic' && !this.isActive) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (viewport is not active and we're in dynamic resolution resolution)`, resolution);
            return false;
        }
        if (this.nextState !== 64 /* nextIsEmpty */) {
            this.logger.trace(`isAvailable(resolution:%s) -> false (update already scheduled for %s)`, resolution, this.nextNode);
            return false;
        }
        return true;
    }
    canUnload(tr, b) {
        if (this.currTransition === null) {
            this.currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b.push();
        // run canUnload bottom-up
        Batch.start(b1 => {
            this.logger.trace(`canUnload() - invoking on children at %s`, this);
            for (const node of this.currNode.children) {
                node.context.vpa.canUnload(tr, b1);
            }
        }).continueWith(b1 => {
            switch (this.currState) {
                case 4096 /* currIsActive */:
                    this.logger.trace(`canUnload() - invoking on existing component at %s`, this);
                    switch (this.$plan) {
                        case 'none':
                            this.currState = 1024 /* currCanUnloadDone */;
                            return;
                        case 'invoke-lifecycles':
                        case 'replace':
                            this.currState = 2048 /* currCanUnload */;
                            b1.push();
                            Batch.start(b2 => {
                                this.logger.trace(`canUnload() - finished invoking on children, now invoking on own component at %s`, this);
                                this.curCA.canUnload(tr, this.nextNode, b2);
                            }).continueWith(() => {
                                this.logger.trace(`canUnload() - finished at %s`, this);
                                this.currState = 1024 /* currCanUnloadDone */;
                                b1.pop();
                            }).start();
                            return;
                    }
                case 8192 /* currIsEmpty */:
                    this.logger.trace(`canUnload() - nothing to unload at %s`, this);
                    return;
                default:
                    tr.handleError(new Error(`Unexpected state at canUnload of ${this}`));
            }
        }).continueWith(() => {
            b.pop();
        }).start();
    }
    canLoad(tr, b) {
        if (this.currTransition === null) {
            this.currTransition = tr;
        }
        ensureTransitionHasNotErrored(tr);
        if (tr.guardsResult !== true) {
            return;
        }
        b.push();
        // run canLoad top-down
        Batch.start(b1 => {
            switch (this.nextState) {
                case 32 /* nextIsScheduled */:
                    this.logger.trace(`canLoad() - invoking on new component at %s`, this);
                    this.nextState = 16 /* nextCanLoad */;
                    switch (this.$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this.curCA.canLoad(tr, this.nextNode, b1);
                        case 'replace':
                            this.nextCA = this.nextNode.context.createComponentAgent(this.hostController, this.nextNode);
                            return this.nextCA.canLoad(tr, this.nextNode, b1);
                    }
                case 64 /* nextIsEmpty */:
                    this.logger.trace(`canLoad() - nothing to load at %s`, this);
                    return;
                default:
                    this.unexpectedState('canLoad');
            }
        }).continueWith(b1 => {
            const next = this.nextNode;
            switch (this.$plan) {
                case 'none':
                case 'invoke-lifecycles':
                    this.logger.trace(`canLoad(next:%s) - plan set to '%s', compiling residue`, next, this.$plan);
                    // These plans can only occur if there is already a current component active in this viewport,
                    // and it is the same component as `next`.
                    // This means the RouteContext of `next` was created during a previous transition and might contain
                    // already-active children. If that is the case, we want to eagerly call the router hooks on them during the
                    // first pass of activation, instead of lazily in a later pass after `processResidue`.
                    // By calling `compileResidue` here on the current context, we're ensuring that such nodes are created and
                    // their target viewports have the appropriate updates scheduled.
                    b1.push();
                    void onResolve(processResidue(next), () => {
                        b1.pop();
                    });
                    return;
                case 'replace':
                    // In the case of 'replace', always process this node and its subtree as if it's a new one
                    switch (this.$resolution) {
                        case 'dynamic':
                            // Residue compilation will happen at `ViewportAgent#processResidue`
                            this.logger.trace(`canLoad(next:%s) - (resolution: 'dynamic'), delaying residue compilation until activate`, next, this.$plan);
                            return;
                        case 'static':
                            this.logger.trace(`canLoad(next:%s) - (resolution: '${this.$resolution}'), creating nextCA and compiling residue`, next, this.$plan);
                            b1.push();
                            void onResolve(processResidue(next), () => {
                                b1.pop();
                            });
                            return;
                    }
            }
        }).continueWith(b1 => {
            switch (this.nextState) {
                case 16 /* nextCanLoad */:
                    this.logger.trace(`canLoad() - finished own component, now invoking on children at %s`, this);
                    this.nextState = 8 /* nextCanLoadDone */;
                    for (const node of this.nextNode.children) {
                        node.context.vpa.canLoad(tr, b1);
                    }
                    return;
                case 64 /* nextIsEmpty */:
                    return;
                default:
                    this.unexpectedState('canLoad');
            }
        }).continueWith(() => {
            this.logger.trace(`canLoad() - finished at %s`, this);
            b.pop();
        }).start();
    }
    unload(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        // run unload bottom-up
        Batch.start(b1 => {
            this.logger.trace(`unload() - invoking on children at %s`, this);
            for (const node of this.currNode.children) {
                node.context.vpa.unload(tr, b1);
            }
        }).continueWith(b1 => {
            switch (this.currState) {
                case 1024 /* currCanUnloadDone */:
                    this.logger.trace(`unload() - invoking on existing component at %s`, this);
                    switch (this.$plan) {
                        case 'none':
                            this.currState = 256 /* currUnloadDone */;
                            return;
                        case 'invoke-lifecycles':
                        case 'replace':
                            this.currState = 512 /* currUnload */;
                            b1.push();
                            Batch.start(b2 => {
                                this.logger.trace(`unload() - finished invoking on children, now invoking on own component at %s`, this);
                                this.curCA.unload(tr, this.nextNode, b2);
                            }).continueWith(() => {
                                this.logger.trace(`unload() - finished at %s`, this);
                                this.currState = 256 /* currUnloadDone */;
                                b1.pop();
                            }).start();
                            return;
                    }
                case 8192 /* currIsEmpty */:
                    this.logger.trace(`unload() - nothing to unload at %s`, this);
                    for (const node of this.currNode.children) {
                        node.context.vpa.unload(tr, b);
                    }
                    return;
                default:
                    this.unexpectedState('unload');
            }
        }).continueWith(() => {
            b.pop();
        }).start();
    }
    load(tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        // run load top-down
        Batch.start(b1 => {
            switch (this.nextState) {
                case 8 /* nextCanLoadDone */: {
                    this.logger.trace(`load() - invoking on new component at %s`, this);
                    this.nextState = 4 /* nextLoad */;
                    switch (this.$plan) {
                        case 'none':
                            return;
                        case 'invoke-lifecycles':
                            return this.curCA.load(tr, this.nextNode, b1);
                        case 'replace':
                            return this.nextCA.load(tr, this.nextNode, b1);
                    }
                }
                case 64 /* nextIsEmpty */:
                    this.logger.trace(`load() - nothing to load at %s`, this);
                    return;
                default:
                    this.unexpectedState('load');
            }
        }).continueWith(b1 => {
            switch (this.nextState) {
                case 4 /* nextLoad */:
                    this.logger.trace(`load() - finished own component, now invoking on children at %s`, this);
                    this.nextState = 2 /* nextLoadDone */;
                    for (const node of this.nextNode.children) {
                        node.context.vpa.load(tr, b1);
                    }
                    return;
                case 64 /* nextIsEmpty */:
                    return;
                default:
                    this.unexpectedState('load');
            }
        }).continueWith(() => {
            this.logger.trace(`load() - finished at %s`, this);
            b.pop();
        }).start();
    }
    deactivate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        switch (this.currState) {
            case 256 /* currUnloadDone */:
                this.logger.trace(`deactivate() - invoking on existing component at %s`, this);
                this.currState = 128 /* currDeactivate */;
                switch (this.$plan) {
                    case 'none':
                    case 'invoke-lifecycles':
                        b.pop();
                        return;
                    case 'replace': {
                        const controller = this.hostController;
                        const deactivateFlags = this.viewport.stateful ? 0 /* none */ : 32 /* dispose */;
                        tr.run(() => {
                            return this.curCA.deactivate(initiator, controller, deactivateFlags);
                        }, () => {
                            b.pop();
                        });
                    }
                }
                return;
            case 8192 /* currIsEmpty */:
                this.logger.trace(`deactivate() - nothing to deactivate at %s`, this);
                b.pop();
                return;
            case 128 /* currDeactivate */:
                this.logger.trace(`deactivate() - already deactivating at %s`, this);
                b.pop();
                return;
            default:
                this.unexpectedState('deactivate');
        }
    }
    activate(initiator, tr, b) {
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        b.push();
        if (this.nextState === 32 /* nextIsScheduled */ &&
            this.$resolution === 'dynamic') {
            this.logger.trace(`activate() - invoking canLoad(), load() and activate() on new component due to resolution 'dynamic' at %s`, this);
            // This is the default v2 mode "lazy loading" situation
            Batch.start(b1 => {
                this.canLoad(tr, b1);
            }).continueWith(b1 => {
                this.load(tr, b1);
            }).continueWith(b1 => {
                this.activate(initiator, tr, b1);
            }).continueWith(() => {
                b.pop();
            }).start();
            return;
        }
        switch (this.nextState) {
            case 2 /* nextLoadDone */:
                this.logger.trace(`activate() - invoking on existing component at %s`, this);
                this.nextState = 1 /* nextActivate */;
                // run activate top-down
                Batch.start(b1 => {
                    switch (this.$plan) {
                        case 'none':
                        case 'invoke-lifecycles':
                            return;
                        case 'replace': {
                            const controller = this.hostController;
                            const activateFlags = 0 /* none */;
                            tr.run(() => {
                                b1.push();
                                return this.nextCA.activate(initiator, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }
                    }
                }).continueWith(b1 => {
                    this.processDynamicChildren(tr, b1);
                }).continueWith(() => {
                    b.pop();
                }).start();
                return;
            case 64 /* nextIsEmpty */:
                this.logger.trace(`activate() - nothing to activate at %s`, this);
                b.pop();
                return;
            default:
                this.unexpectedState('activate');
        }
    }
    swap(tr, b) {
        if (this.currState === 8192 /* currIsEmpty */) {
            this.logger.trace(`swap() - running activate on next instead, because there is nothing to deactivate at %s`, this);
            this.activate(null, tr, b);
            return;
        }
        if (this.nextState === 64 /* nextIsEmpty */) {
            this.logger.trace(`swap() - running deactivate on current instead, because there is nothing to activate at %s`, this);
            this.deactivate(null, tr, b);
            return;
        }
        ensureTransitionHasNotErrored(tr);
        ensureGuardsResultIsTrue(this, tr);
        if (!(this.currState === 256 /* currUnloadDone */ &&
            this.nextState === 2 /* nextLoadDone */)) {
            this.unexpectedState('swap');
        }
        this.currState = 128 /* currDeactivate */;
        this.nextState = 1 /* nextActivate */;
        switch (this.$plan) {
            case 'none':
            case 'invoke-lifecycles': {
                this.logger.trace(`swap() - skipping this level and swapping children instead at %s`, this);
                const nodes = mergeDistinct(this.nextNode.children, this.currNode.children);
                for (const node of nodes) {
                    node.context.vpa.swap(tr, b);
                }
                return;
            }
            case 'replace': {
                this.logger.trace(`swap() - running normally at %s`, this);
                const controller = this.hostController;
                const curCA = this.curCA;
                const nextCA = this.nextCA;
                const deactivateFlags = this.viewport.stateful ? 0 /* none */ : 32 /* dispose */;
                const activateFlags = 0 /* none */;
                b.push();
                switch (tr.options.swapStrategy) {
                    case 'sequential-add-first':
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            tr.run(() => {
                                return curCA.deactivate(null, controller, deactivateFlags);
                            }, () => {
                                b.pop();
                            });
                        }).start();
                        return;
                    case 'sequential-remove-first':
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return curCA.deactivate(null, controller, deactivateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            b.pop();
                        }).start();
                        return;
                    case 'parallel-remove-first':
                        tr.run(() => {
                            b.push();
                            return curCA.deactivate(null, controller, deactivateFlags);
                        }, () => {
                            b.pop();
                        });
                        Batch.start(b1 => {
                            tr.run(() => {
                                b1.push();
                                return nextCA.activate(null, controller, activateFlags);
                            }, () => {
                                b1.pop();
                            });
                        }).continueWith(b1 => {
                            this.processDynamicChildren(tr, b1);
                        }).continueWith(() => {
                            b.pop();
                        }).start();
                        return;
                }
            }
        }
    }
    processDynamicChildren(tr, b) {
        this.logger.trace(`processDynamicChildren() - %s`, this);
        const next = this.nextNode;
        tr.run(() => {
            b.push();
            return getDynamicChildren(next);
        }, newChildren => {
            Batch.start(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.canLoad(tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.load(tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(b1 => {
                for (const node of newChildren) {
                    tr.run(() => {
                        b1.push();
                        return node.context.vpa.activate(null, tr, b1);
                    }, () => {
                        b1.pop();
                    });
                }
            }).continueWith(() => {
                b.pop();
            }).start();
        });
    }
    scheduleUpdate(options, next) {
        var _a, _b;
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
                this.nextNode = next;
                this.nextState = 32 /* nextIsScheduled */;
                this.$resolution = options.resolutionMode;
                break;
            default:
                this.unexpectedState('scheduleUpdate 1');
        }
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
            case 4096 /* currIsActive */:
            case 1024 /* currCanUnloadDone */:
                break;
            default:
                this.unexpectedState('scheduleUpdate 2');
        }
        const cur = (_b = (_a = this.curCA) === null || _a === void 0 ? void 0 : _a.routeNode) !== null && _b !== void 0 ? _b : null;
        if (cur === null || cur.component !== next.component) {
            // Component changed (or is cleared), so set to 'replace'
            this.$plan = 'replace';
        }
        else {
            // Component is the same, so determine plan based on config and/or convention
            const plan = next.context.definition.config.transitionPlan;
            if (typeof plan === 'function') {
                this.$plan = plan(cur, next);
            }
            else {
                this.$plan = plan;
            }
        }
        this.logger.trace(`scheduleUpdate(next:%s) - plan set to '%s'`, next, this.$plan);
    }
    cancelUpdate() {
        if (this.currNode !== null) {
            this.currNode.children.forEach(function (node) {
                node.context.vpa.cancelUpdate();
            });
        }
        if (this.nextNode !== null) {
            this.nextNode.children.forEach(function (node) {
                node.context.vpa.cancelUpdate();
            });
        }
        this.logger.trace(`cancelUpdate(nextNode:%s)`, this.nextNode);
        switch (this.currState) {
            case 8192 /* currIsEmpty */:
            case 4096 /* currIsActive */:
                break;
            case 2048 /* currCanUnload */:
            case 1024 /* currCanUnloadDone */:
                this.currState = 4096 /* currIsActive */;
                break;
        }
        switch (this.nextState) {
            case 64 /* nextIsEmpty */:
            case 32 /* nextIsScheduled */:
            case 16 /* nextCanLoad */:
            case 8 /* nextCanLoadDone */:
                this.nextNode = null;
                this.nextState = 64 /* nextIsEmpty */;
                break;
        }
    }
    endTransition() {
        if (this.currNode !== null) {
            this.currNode.children.forEach(function (node) {
                node.context.vpa.endTransition();
            });
        }
        if (this.nextNode !== null) {
            this.nextNode.children.forEach(function (node) {
                node.context.vpa.endTransition();
            });
        }
        if (this.currTransition !== null) {
            ensureTransitionHasNotErrored(this.currTransition);
            switch (this.nextState) {
                case 64 /* nextIsEmpty */:
                    switch (this.currState) {
                        case 128 /* currDeactivate */:
                            this.logger.trace(`endTransition() - setting currState to State.nextIsEmpty at %s`, this);
                            this.currState = 8192 /* currIsEmpty */;
                            this.curCA = null;
                            break;
                        default:
                            this.unexpectedState('endTransition 1');
                    }
                    break;
                case 1 /* nextActivate */:
                    switch (this.currState) {
                        case 8192 /* currIsEmpty */:
                        case 128 /* currDeactivate */:
                            switch (this.$plan) {
                                case 'none':
                                case 'invoke-lifecycles':
                                    this.logger.trace(`endTransition() - setting currState to State.currIsActive at %s`, this);
                                    this.currState = 4096 /* currIsActive */;
                                    break;
                                case 'replace':
                                    this.logger.trace(`endTransition() - setting currState to State.currIsActive and reassigning curCA at %s`, this);
                                    this.currState = 4096 /* currIsActive */;
                                    this.curCA = this.nextCA;
                                    break;
                            }
                            this.currNode = this.nextNode;
                            break;
                        default:
                            this.unexpectedState('endTransition 2');
                    }
                    break;
                default:
                    this.unexpectedState('endTransition 3');
            }
            this.$plan = 'replace';
            this.nextState = 64 /* nextIsEmpty */;
            this.nextNode = null;
            this.nextCA = null;
            this.prevTransition = this.currTransition;
            this.currTransition = null;
        }
    }
    toString() {
        return `VPA(state:${this.$state},plan:'${this.$plan}',resolution:'${this.$resolution}',n:${this.nextNode},c:${this.currNode},viewport:${this.viewport})`;
    }
    dispose() {
        var _a;
        if (this.viewport.stateful /* TODO: incorporate statefulHistoryLength / router opts as well */) {
            this.logger.trace(`dispose() - not disposing stateful viewport at %s`, this);
        }
        else {
            this.logger.trace(`dispose() - disposing %s`, this);
            (_a = this.curCA) === null || _a === void 0 ? void 0 : _a.dispose();
        }
    }
    unexpectedState(label) {
        throw new Error(`Unexpected state at ${label} of ${this}`);
    }
}
function ensureGuardsResultIsTrue(vpa, tr) {
    if (tr.guardsResult !== true) {
        throw new Error(`Unexpected guardsResult ${tr.guardsResult} at ${vpa}`);
    }
}
function ensureTransitionHasNotErrored(tr) {
    if (tr.error !== void 0) {
        throw tr.error;
    }
}
var State;
(function (State) {
    State[State["curr"] = 16256] = "curr";
    State[State["currIsEmpty"] = 8192] = "currIsEmpty";
    State[State["currIsActive"] = 4096] = "currIsActive";
    State[State["currCanUnload"] = 2048] = "currCanUnload";
    State[State["currCanUnloadDone"] = 1024] = "currCanUnloadDone";
    State[State["currUnload"] = 512] = "currUnload";
    State[State["currUnloadDone"] = 256] = "currUnloadDone";
    State[State["currDeactivate"] = 128] = "currDeactivate";
    State[State["next"] = 127] = "next";
    State[State["nextIsEmpty"] = 64] = "nextIsEmpty";
    State[State["nextIsScheduled"] = 32] = "nextIsScheduled";
    State[State["nextCanLoad"] = 16] = "nextCanLoad";
    State[State["nextCanLoadDone"] = 8] = "nextCanLoadDone";
    State[State["nextLoad"] = 4] = "nextLoad";
    State[State["nextLoadDone"] = 2] = "nextLoadDone";
    State[State["nextActivate"] = 1] = "nextActivate";
    State[State["bothAreEmpty"] = 8256] = "bothAreEmpty";
})(State || (State = {}));
// Stringifying uses arrays and does not have a negligible cost, so cache the results to not let trace logging
// in and of its own slow things down too much.
const $stateCache = new Map();
function $state(state) {
    let str = $stateCache.get(state);
    if (str === void 0) {
        $stateCache.set(state, str = stringifyState(state));
    }
    return str;
}
function stringifyState(state) {
    const flags = [];
    if ((state & 8192 /* currIsEmpty */) === 8192 /* currIsEmpty */) {
        flags.push('currIsEmpty');
    }
    if ((state & 4096 /* currIsActive */) === 4096 /* currIsActive */) {
        flags.push('currIsActive');
    }
    if ((state & 2048 /* currCanUnload */) === 2048 /* currCanUnload */) {
        flags.push('currCanUnload');
    }
    if ((state & 1024 /* currCanUnloadDone */) === 1024 /* currCanUnloadDone */) {
        flags.push('currCanUnloadDone');
    }
    if ((state & 512 /* currUnload */) === 512 /* currUnload */) {
        flags.push('currUnload');
    }
    if ((state & 256 /* currUnloadDone */) === 256 /* currUnloadDone */) {
        flags.push('currUnloadDone');
    }
    if ((state & 128 /* currDeactivate */) === 128 /* currDeactivate */) {
        flags.push('currDeactivate');
    }
    if ((state & 64 /* nextIsEmpty */) === 64 /* nextIsEmpty */) {
        flags.push('nextIsEmpty');
    }
    if ((state & 32 /* nextIsScheduled */) === 32 /* nextIsScheduled */) {
        flags.push('nextIsScheduled');
    }
    if ((state & 16 /* nextCanLoad */) === 16 /* nextCanLoad */) {
        flags.push('nextCanLoad');
    }
    if ((state & 8 /* nextCanLoadDone */) === 8 /* nextCanLoadDone */) {
        flags.push('nextCanLoadDone');
    }
    if ((state & 4 /* nextLoad */) === 4 /* nextLoad */) {
        flags.push('nextLoad');
    }
    if ((state & 2 /* nextLoadDone */) === 2 /* nextLoadDone */) {
        flags.push('nextLoadDone');
    }
    if ((state & 1 /* nextActivate */) === 1 /* nextActivate */) {
        flags.push('nextActivate');
    }
    return flags.join('|');
}

// The commented-out terminal symbols below are for reference / potential future need (should there be use cases to loosen up the syntax)
// These are the currently used terminal symbols.
// We're deliberately having every "special" (including the not-in-use '&', ''', '~', ';') as a terminal symbol,
// so as to make the syntax maximally restrictive for consistency and to minimize the risk of us having to introduce breaking changes in the future.
const terminal = ['?', '#', '/', '+', '(', ')', '.', '@', '!', '=', ',', '&', '\'', '~', ';'];
class ParserState {
    constructor(input) {
        this.input = input;
        this.buffers = [];
        this.bufferIndex = 0;
        this.index = 0;
        this.rest = input;
    }
    get done() {
        return this.rest.length === 0;
    }
    startsWith(...values) {
        const rest = this.rest;
        return values.some(function (value) {
            return rest.startsWith(value);
        });
    }
    consumeOptional(str) {
        if (this.startsWith(str)) {
            this.rest = this.rest.slice(str.length);
            this.index += str.length;
            this.append(str);
            return true;
        }
        return false;
    }
    consume(str) {
        if (!this.consumeOptional(str)) {
            this.expect(`'${str}'`);
        }
    }
    expect(msg) {
        throw new Error(`Expected ${msg} at index ${this.index} of '${this.input}', but got: '${this.rest}' (rest='${this.rest}')`);
    }
    ensureDone() {
        if (!this.done) {
            throw new Error(`Unexpected '${this.rest}' at index ${this.index} of '${this.input}'`);
        }
    }
    advance() {
        const char = this.rest[0];
        this.rest = this.rest.slice(1);
        ++this.index;
        this.append(char);
    }
    record() {
        this.buffers[this.bufferIndex++] = '';
    }
    playback() {
        const bufferIndex = --this.bufferIndex;
        const buffers = this.buffers;
        const buffer = buffers[bufferIndex];
        buffers[bufferIndex] = '';
        return buffer;
    }
    discard() {
        this.buffers[--this.bufferIndex] = '';
    }
    append(str) {
        const bufferIndex = this.bufferIndex;
        const buffers = this.buffers;
        for (let i = 0; i < bufferIndex; ++i) {
            buffers[i] += str;
        }
    }
}
var ExpressionKind;
(function (ExpressionKind) {
    ExpressionKind[ExpressionKind["Route"] = 0] = "Route";
    ExpressionKind[ExpressionKind["CompositeSegment"] = 1] = "CompositeSegment";
    ExpressionKind[ExpressionKind["ScopedSegment"] = 2] = "ScopedSegment";
    ExpressionKind[ExpressionKind["SegmentGroup"] = 3] = "SegmentGroup";
    ExpressionKind[ExpressionKind["Segment"] = 4] = "Segment";
    ExpressionKind[ExpressionKind["Component"] = 5] = "Component";
    ExpressionKind[ExpressionKind["Action"] = 6] = "Action";
    ExpressionKind[ExpressionKind["Viewport"] = 7] = "Viewport";
    ExpressionKind[ExpressionKind["ParameterList"] = 8] = "ParameterList";
    ExpressionKind[ExpressionKind["Parameter"] = 9] = "Parameter";
})(ExpressionKind || (ExpressionKind = {}));
const fragmentRouteExpressionCache = new Map();
const routeExpressionCache = new Map();
class RouteExpression {
    constructor(raw, isAbsolute, root, queryParams, fragment, fragmentIsRoute) {
        this.raw = raw;
        this.isAbsolute = isAbsolute;
        this.root = root;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.fragmentIsRoute = fragmentIsRoute;
    }
    get kind() { return 0 /* Route */; }
    static parse(path, fragmentIsRoute) {
        const cache = fragmentIsRoute ? fragmentRouteExpressionCache : routeExpressionCache;
        let result = cache.get(path);
        if (result === void 0) {
            cache.set(path, result = RouteExpression.$parse(path, fragmentIsRoute));
        }
        return result;
    }
    static $parse(path, fragmentIsRoute) {
        // First strip off the fragment (and if fragment should be used as route, set it as the path)
        let fragment;
        const fragmentStart = path.indexOf('#');
        if (fragmentStart >= 0) {
            const rawFragment = path.slice(fragmentStart + 1);
            fragment = decodeURIComponent(rawFragment);
            if (fragmentIsRoute) {
                path = fragment;
            }
            else {
                path = path.slice(0, fragmentStart);
            }
        }
        else {
            if (fragmentIsRoute) {
                path = '';
            }
            fragment = null;
        }
        // Strip off and parse the query string using built-in URLSearchParams.
        let queryParams = null;
        const queryStart = path.indexOf('?');
        if (queryStart >= 0) {
            const queryString = path.slice(queryStart + 1);
            path = path.slice(0, queryStart);
            queryParams = new URLSearchParams(queryString);
        }
        if (path === '') {
            return new RouteExpression('', false, SegmentExpression.EMPTY, Object.freeze(queryParams !== null && queryParams !== void 0 ? queryParams : new URLSearchParams()), fragment, fragmentIsRoute);
        }
        /*
         * Now parse the actual route
         *
         * Notes:
         * A NT-Name as per DOM level 2: https://www.w3.org/TR/1998/REC-xml-19980210#NT-Name
         *  [4]  NameChar ::= Letter | Digit | '.' | '-' | '_' | ':' | CombiningChar | Extender
         *  [5]  Name     ::= (Letter | '_' | ':') (NameChar)*
         *
         * As per https://url.spec.whatwg.org/#url-code-points - URL code points (from the ASCII range) are:
         * a-zA-Z0-9!$&'()*+,-./:;=?@_~
         * The other valid option is a % followed by two ASCII hex digits
         * Anything else is invalid.
         */
        const state = new ParserState(path);
        state.record();
        const isAbsolute = state.consumeOptional('/');
        const root = CompositeSegmentExpression.parse(state);
        state.ensureDone();
        const raw = state.playback();
        return new RouteExpression(raw, isAbsolute, root, Object.freeze(queryParams !== null && queryParams !== void 0 ? queryParams : new URLSearchParams()), fragment, fragmentIsRoute);
    }
    toInstructionTree(options) {
        return new ViewportInstructionTree(options, this.isAbsolute, this.root.toInstructions(options.append, 0, 0), this.queryParams, this.fragment);
    }
    toString() {
        return this.raw;
    }
}
/**
 * A single 'traditional' (slash-separated) segment consisting of one or more sibling segments.
 *
 * ### Variations:
 *
 * 1: `a+b`
 * - siblings: [`a`, `b`]
 * - append: `false`
 *
 * 2: `+a`
 * - siblings: [`a`]
 * - append: `true`
 *
 * 3: `+a+a`
 * - siblings: [`a`, `b`]
 * - append: `true`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 * - b = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
class CompositeSegmentExpression {
    constructor(raw, siblings, append) {
        this.raw = raw;
        this.siblings = siblings;
        this.append = append;
    }
    get kind() { return 1 /* CompositeSegment */; }
    static parse(state) {
        state.record();
        // If a segment starts with '+', e.g. '/+a' / '/+a@vp' / '/a/+b' / '/+a+b' etc, then its siblings
        // are considered to be "append"
        const append = state.consumeOptional('+');
        const siblings = [];
        do {
            siblings.push(ScopedSegmentExpression.parse(state));
        } while (state.consumeOptional('+'));
        if (!append && siblings.length === 1) {
            state.discard();
            return siblings[0];
        }
        const raw = state.playback();
        return new CompositeSegmentExpression(raw, siblings, append);
    }
    toInstructions(append, open, close) {
        switch (this.siblings.length) {
            case 0:
                return [];
            case 1:
                return this.siblings[0].toInstructions(append, open, close);
            case 2:
                return [
                    ...this.siblings[0].toInstructions(append, open, 0),
                    ...this.siblings[1].toInstructions(append, 0, close),
                ];
            default:
                return [
                    ...this.siblings[0].toInstructions(append, open, 0),
                    ...this.siblings.slice(1, -1).flatMap(function (x) {
                        return x.toInstructions(append, 0, 0);
                    }),
                    ...this.siblings[this.siblings.length - 1].toInstructions(append, 0, close),
                ];
        }
    }
    toString() {
        return this.raw;
    }
}
/**
 * The (single) left-hand side and the (one or more) right-hand side of a slash-separated segment.
 *
 * Variations:
 *
 * 1: `a/b`
 * - left: `a`
 * - right: `b`
 *
 * Where
 * - a = `SegmentGroupExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression`)
 * - b = `ScopedSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression`)
 */
class ScopedSegmentExpression {
    constructor(raw, left, right) {
        this.raw = raw;
        this.left = left;
        this.right = right;
    }
    get kind() { return 2 /* ScopedSegment */; }
    static parse(state) {
        state.record();
        const left = SegmentGroupExpression.parse(state);
        if (state.consumeOptional('/')) {
            const right = ScopedSegmentExpression.parse(state);
            const raw = state.playback();
            return new ScopedSegmentExpression(raw, left, right);
        }
        state.discard();
        return left;
    }
    toInstructions(append, open, close) {
        const leftInstructions = this.left.toInstructions(append, open, 0);
        const rightInstructions = this.right.toInstructions(false, 0, close);
        let cur = leftInstructions[leftInstructions.length - 1];
        while (cur.children.length > 0) {
            cur = cur.children[cur.children.length - 1];
        }
        cur.children.push(...rightInstructions);
        return leftInstructions;
    }
    toString() {
        return this.raw;
    }
}
/**
 * Any kind of segment wrapped in parentheses, increasing its precedence.
 * Specifically, the parentheses are needed to deeply specify scoped siblings.
 * The precedence is intentionally similar to the familiar mathematical `/` and `+` operators.
 *
 * For example, consider this viewport structure:
 * - viewport-a
 * - - viewport-a1
 * - - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * This can only be deeply specified by using the grouping operator: `a/(a1+a2)+b/b1`
 *
 * Because `a/a1+a2+b/b1` would be interpreted differently:
 * - viewport-a
 * - - viewport-a1
 * - viewport-a2
 * - viewport-b
 * - - viewport-b1
 *
 * ### Variations:
 *
 * 1: `(a)`
 * - expression: `a`
 *
 * Where
 * - a = `CompositeSegmentExpressionOrHigher` (`SegmentExpression | SegmentGroupExpression | ScopedSegmentExpression | CompositeSegmentExpression`)
 */
class SegmentGroupExpression {
    constructor(raw, expression) {
        this.raw = raw;
        this.expression = expression;
    }
    get kind() { return 3 /* SegmentGroup */; }
    static parse(state) {
        state.record();
        if (state.consumeOptional('(')) {
            const expression = CompositeSegmentExpression.parse(state);
            state.consume(')');
            const raw = state.playback();
            return new SegmentGroupExpression(raw, expression);
        }
        state.discard();
        return SegmentExpression.parse(state);
    }
    toInstructions(append, open, close) {
        return this.expression.toInstructions(append, open + 1, close + 1);
    }
    toString() {
        return this.raw;
    }
}
/**
 * A (non-composite) segment specifying a single component and (optional) viewport / action.
 */
class SegmentExpression {
    constructor(raw, component, action, viewport, scoped) {
        this.raw = raw;
        this.component = component;
        this.action = action;
        this.viewport = viewport;
        this.scoped = scoped;
    }
    get kind() { return 4 /* Segment */; }
    static get EMPTY() { return new SegmentExpression('', ComponentExpression.EMPTY, ActionExpression.EMPTY, ViewportExpression.EMPTY, true); }
    static parse(state) {
        state.record();
        const component = ComponentExpression.parse(state);
        const action = ActionExpression.parse(state);
        const viewport = ViewportExpression.parse(state);
        const scoped = !state.consumeOptional('!');
        const raw = state.playback();
        return new SegmentExpression(raw, component, action, viewport, scoped);
    }
    toInstructions(append, open, close) {
        return [
            ViewportInstruction.create({
                component: this.component.name,
                params: this.component.parameterList.toObject(),
                viewport: this.viewport.name,
                append,
                open,
                close,
            }),
        ];
    }
    toString() {
        return this.raw;
    }
}
class ComponentExpression {
    constructor(raw, name, parameterList) {
        this.raw = raw;
        this.name = name;
        this.parameterList = parameterList;
        switch (name.charAt(0)) {
            case ':':
                this.isParameter = true;
                this.isStar = false;
                this.isDynamic = true;
                this.parameterName = name.slice(1);
                break;
            case '*':
                this.isParameter = false;
                this.isStar = true;
                this.isDynamic = true;
                this.parameterName = name.slice(1);
                break;
            default:
                this.isParameter = false;
                this.isStar = false;
                this.isDynamic = false;
                this.parameterName = name;
                break;
        }
    }
    get kind() { return 5 /* Component */; }
    static get EMPTY() { return new ComponentExpression('', '', ParameterListExpression.EMPTY); }
    static parse(state) {
        state.record();
        state.record();
        if (!state.done) {
            if (state.startsWith('./')) {
                state.advance();
            }
            else if (state.startsWith('../')) {
                state.advance();
                state.advance();
            }
            else {
                while (!state.done && !state.startsWith(...terminal)) {
                    state.advance();
                }
            }
        }
        const name = decodeURIComponent(state.playback());
        if (name.length === 0) {
            state.expect('component name');
        }
        const parameterList = ParameterListExpression.parse(state);
        const raw = state.playback();
        return new ComponentExpression(raw, name, parameterList);
    }
    toString() {
        return this.raw;
    }
}
class ActionExpression {
    constructor(raw, name, parameterList) {
        this.raw = raw;
        this.name = name;
        this.parameterList = parameterList;
    }
    get kind() { return 6 /* Action */; }
    static get EMPTY() { return new ActionExpression('', '', ParameterListExpression.EMPTY); }
    static parse(state) {
        state.record();
        let name = '';
        if (state.consumeOptional('.')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            name = decodeURIComponent(state.playback());
            if (name.length === 0) {
                state.expect('method name');
            }
        }
        const parameterList = ParameterListExpression.parse(state);
        const raw = state.playback();
        return new ActionExpression(raw, name, parameterList);
    }
    toString() {
        return this.raw;
    }
}
class ViewportExpression {
    constructor(raw, name) {
        this.raw = raw;
        this.name = name;
    }
    get kind() { return 7 /* Viewport */; }
    static get EMPTY() { return new ViewportExpression('', ''); }
    static parse(state) {
        state.record();
        let name = '';
        if (state.consumeOptional('@')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            name = decodeURIComponent(state.playback());
            if (name.length === 0) {
                state.expect('viewport name');
            }
        }
        const raw = state.playback();
        return new ViewportExpression(raw, name);
    }
    toString() {
        return this.raw;
    }
}
class ParameterListExpression {
    constructor(raw, expressions) {
        this.raw = raw;
        this.expressions = expressions;
    }
    get kind() { return 8 /* ParameterList */; }
    static get EMPTY() { return new ParameterListExpression('', []); }
    static parse(state) {
        state.record();
        const expressions = [];
        if (state.consumeOptional('(')) {
            do {
                expressions.push(ParameterExpression.parse(state, expressions.length));
                if (!state.consumeOptional(',')) {
                    break;
                }
            } while (!state.done && !state.startsWith(')'));
            state.consume(')');
        }
        const raw = state.playback();
        return new ParameterListExpression(raw, expressions);
    }
    toObject() {
        const params = {};
        for (const expr of this.expressions) {
            params[expr.key] = expr.value;
        }
        return params;
    }
    toString() {
        return this.raw;
    }
}
class ParameterExpression {
    constructor(raw, key, value) {
        this.raw = raw;
        this.key = key;
        this.value = value;
    }
    get kind() { return 9 /* Parameter */; }
    static get EMPTY() { return new ParameterExpression('', '', ''); }
    static parse(state, index) {
        state.record();
        state.record();
        while (!state.done && !state.startsWith(...terminal)) {
            state.advance();
        }
        let key = decodeURIComponent(state.playback());
        if (key.length === 0) {
            state.expect('parameter key');
        }
        let value;
        if (state.consumeOptional('=')) {
            state.record();
            while (!state.done && !state.startsWith(...terminal)) {
                state.advance();
            }
            value = decodeURIComponent(state.playback());
            if (value.length === 0) {
                state.expect('parameter value');
            }
        }
        else {
            value = key;
            key = index.toString();
        }
        const raw = state.playback();
        return new ParameterExpression(raw, key, value);
    }
    toString() {
        return this.raw;
    }
}
Object.freeze({
    RouteExpression,
    CompositeSegmentExpression,
    ScopedSegmentExpression,
    SegmentGroupExpression,
    SegmentExpression,
    ComponentExpression,
    ActionExpression,
    ViewportExpression,
    ParameterListExpression,
    ParameterExpression,
});

/* eslint-disable @typescript-eslint/restrict-template-expressions */
let nodeId = 0;
class RouteNode {
    constructor(
    /** @internal */
    id, 
    /**
     * The original configured path pattern that was matched, or the component name if it was resolved via direct routing.
     */
    path, 
    /**
     * If one or more redirects have occurred, then this is the final path match, in all other cases this is identical to `path`
     */
    finalPath, 
    /**
     * The `RouteContext` associated with this route.
     *
     * Child route components will be created by this context.
     *
     * Viewports that live underneath the component associated with this route, will be registered to this context.
     */
    context, 
    /** @internal */
    originalInstruction, 
    /** Can only be `null` for the composition root */
    instruction, params, queryParams, fragment, data, 
    /**
     * The viewport is always `null` for the root `RouteNode`.
     *
     * NOTE: It might make sense to have a `null` viewport mean other things as well (such as, don't load this component)
     * but that is currently not a deliberately implemented feature and we might want to explicitly validate against it
     * if we decide not to implement that.
     */
    viewport, title, component, append, children, 
    /**
     * Not-yet-resolved viewport instructions.
     *
     * Instructions need an `IRouteContext` to be resolved into complete `RouteNode`s.
     *
     * Resolved instructions are removed from this array, such that a `RouteNode` can be considered
     * "fully resolved" when it has `residue.length === 0` and `children.length >= 0`
     */
    residue) {
        this.id = id;
        this.path = path;
        this.finalPath = finalPath;
        this.context = context;
        this.originalInstruction = originalInstruction;
        this.instruction = instruction;
        this.params = params;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.data = data;
        this.viewport = viewport;
        this.title = title;
        this.component = component;
        this.append = append;
        this.children = children;
        this.residue = residue;
        /** @internal */
        this.version = 1;
        this.originalInstruction = instruction;
    }
    get root() {
        return this.tree.root;
    }
    static create(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return new RouteNode(
        /*          id */ ++nodeId, 
        /*        path */ input.path, 
        /*   finalPath */ input.finalPath, 
        /*     context */ input.context, 
        /* originalIns */ input.instruction, 
        /* instruction */ input.instruction, (_a = 
        /*      params */ input.params) !== null && _a !== void 0 ? _a : {}, (_b = 
        /* queryParams */ input.queryParams) !== null && _b !== void 0 ? _b : Object.freeze(new URLSearchParams()), (_c = 
        /*    fragment */ input.fragment) !== null && _c !== void 0 ? _c : null, (_d = 
        /*        data */ input.data) !== null && _d !== void 0 ? _d : {}, (_e = 
        /*    viewport */ input.viewport) !== null && _e !== void 0 ? _e : null, (_f = 
        /*       title */ input.title) !== null && _f !== void 0 ? _f : null, 
        /*   component */ input.component, 
        /*      append */ input.append, (_g = 
        /*    children */ input.children) !== null && _g !== void 0 ? _g : [], (_h = 
        /*     residue */ input.residue) !== null && _h !== void 0 ? _h : []);
    }
    contains(instructions) {
        var _a, _b;
        if (this.context === instructions.options.context) {
            const nodeChildren = this.children;
            const instructionChildren = instructions.children;
            for (let i = 0, ii = nodeChildren.length; i < ii; ++i) {
                for (let j = 0, jj = instructionChildren.length; j < jj; ++j) {
                    if (i + j < ii && ((_b = (_a = nodeChildren[i + j].instruction) === null || _a === void 0 ? void 0 : _a.contains(instructionChildren[j])) !== null && _b !== void 0 ? _b : false)) {
                        if (j + 1 === jj) {
                            return true;
                        }
                    }
                    else {
                        break;
                    }
                }
            }
        }
        return this.children.some(function (x) {
            return x.contains(instructions);
        });
    }
    appendChild(child) {
        this.children.push(child);
        child.setTree(this.tree);
    }
    appendChildren(...children) {
        for (const child of children) {
            this.appendChild(child);
        }
    }
    clearChildren() {
        for (const c of this.children) {
            c.clearChildren();
            c.context.vpa.cancelUpdate();
        }
        this.children.length = 0;
    }
    getTitle(separator) {
        const titleParts = [
            ...this.children.map(x => x.getTitle(separator)),
            this.getTitlePart(),
        ].filter(x => x !== null);
        if (titleParts.length === 0) {
            return null;
        }
        return titleParts.join(separator);
    }
    getTitlePart() {
        if (typeof this.title === 'function') {
            return this.title.call(void 0, this);
        }
        return this.title;
    }
    computeAbsolutePath() {
        if (this.context.isRoot) {
            return '';
        }
        const parentPath = this.context.parent.node.computeAbsolutePath();
        const thisPath = this.instruction.toUrlComponent(false);
        if (parentPath.length > 0) {
            if (thisPath.length > 0) {
                return [parentPath, thisPath].join('/');
            }
            return parentPath;
        }
        return thisPath;
    }
    /** @internal */
    setTree(tree) {
        this.tree = tree;
        for (const child of this.children) {
            child.setTree(tree);
        }
    }
    /** @internal */
    finalizeInstruction() {
        const children = this.children.map(x => x.finalizeInstruction());
        const instruction = this.instruction.clone();
        instruction.children.splice(0, instruction.children.length, ...children);
        return this.instruction = instruction;
    }
    /** @internal */
    clone() {
        const clone = new RouteNode(this.id, this.path, this.finalPath, this.context, this.originalInstruction, this.instruction, { ...this.params }, { ...this.queryParams }, this.fragment, { ...this.data }, this.viewport, this.title, this.component, this.append, this.children.map(x => x.clone()), [...this.residue]);
        clone.version = this.version + 1;
        if (clone.context.node === this) {
            clone.context.node = clone;
        }
        return clone;
    }
    toString() {
        var _a, _b, _c, _d, _e;
        const props = [];
        const component = (_c = (_b = (_a = this.context) === null || _a === void 0 ? void 0 : _a.definition.component) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : '';
        if (component.length > 0) {
            props.push(`c:'${component}'`);
        }
        const path = (_e = (_d = this.context) === null || _d === void 0 ? void 0 : _d.definition.config.path) !== null && _e !== void 0 ? _e : '';
        if (path.length > 0) {
            props.push(`path:'${path}'`);
        }
        if (this.children.length > 0) {
            props.push(`children:[${this.children.map(String).join(',')}]`);
        }
        if (this.residue.length > 0) {
            props.push(`residue:${this.residue.map(function (r) {
                if (typeof r === 'string') {
                    return `'${r}'`;
                }
                return String(r);
            }).join(',')}`);
        }
        return `RN(ctx:'${this.context.friendlyPath}',${props.join(',')})`;
    }
}
class RouteTree {
    constructor(options, queryParams, fragment, root) {
        this.options = options;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.root = root;
    }
    contains(instructions) {
        return this.root.contains(instructions);
    }
    clone() {
        const clone = new RouteTree(this.options.clone(), { ...this.queryParams }, this.fragment, this.root.clone());
        clone.root.setTree(this);
        return clone;
    }
    finalizeInstructions() {
        return new ViewportInstructionTree(this.options, true, this.root.children.map(x => x.finalizeInstruction()), this.queryParams, this.fragment);
    }
    toString() {
        return this.root.toString();
    }
}
/**
 * Returns a stateful `RouteTree` based on the provided context and transition.
 *
 * This expression will always start from the root context and build a new complete tree, up until (and including)
 * the context that was passed-in.
 *
 * If there are any additional child navigations to be resolved lazily, those will be added to the leaf
 * `RouteNode`s `residue` property which is then resolved by the router after the leaf node is loaded.
 *
 * This means that a `RouteTree` can (and often will) be built incrementally during the loading process.
 */
function updateRouteTree(rt, vit, ctx) {
    const log = ctx.get(ILogger).scopeTo('RouteTree');
    // The root of the routing tree is always the CompositionRoot of the Aurelia app.
    // From a routing perspective it's simply a "marker": it does not need to be loaded,
    // nor put in a viewport, have its hooks invoked, or any of that. The router does not touch it,
    // other than by reading (deps, optional route config, owned viewports) from it.
    const rootCtx = ctx.root;
    rt.options = vit.options;
    rt.queryParams = vit.queryParams;
    rt.fragment = vit.fragment;
    if (vit.isAbsolute) {
        ctx = rootCtx;
    }
    if (ctx === rootCtx) {
        rt.root.setTree(rt);
        rootCtx.node = rt.root;
    }
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`updateRouteTree(rootCtx:%s,rt:%s,vit:%s)${suffix}`, rootCtx, rt, vit);
    return onResolve(ctx.resolved, () => {
        return updateNode(log, vit, ctx, rootCtx.node);
    });
}
function updateNode(log, vit, ctx, node) {
    log.trace(`updateNode(ctx:%s,node:%s)`, ctx, node);
    node.queryParams = vit.queryParams;
    node.fragment = vit.fragment;
    let maybePromise;
    if (!node.context.isRoot) {
        // TODO(fkleuver): store `options` on every individual instruction instead of just on the tree, or split it up etc? this needs a bit of cleaning up
        maybePromise = node.context.vpa.scheduleUpdate(node.tree.options, node);
    }
    else {
        maybePromise = void 0;
    }
    return onResolve(maybePromise, () => {
        if (node.context === ctx) {
            // Do an in-place update (remove children and re-add them by compiling the instructions into nodes)
            node.clearChildren();
            return onResolve(resolveAll(...vit.children.map(vi => {
                return createAndAppendNodes(log, node, vi, node.tree.options.append || vi.append);
            })), () => {
                return resolveAll(...ctx.getAvailableViewportAgents('dynamic').map(vpa => {
                    const defaultInstruction = ViewportInstruction.create({
                        component: vpa.viewport.default,
                        viewport: vpa.viewport.name,
                    });
                    return createAndAppendNodes(log, node, defaultInstruction, node.append);
                }));
            });
        }
        // Drill down until we're at the node whose context matches the provided navigation context
        return resolveAll(...node.children.map(child => {
            return updateNode(log, vit, ctx, child);
        }));
    });
}
function processResidue(node) {
    const ctx = node.context;
    const log = ctx.get(ILogger).scopeTo('RouteTree');
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`processResidue(node:%s)${suffix}`, node);
    return onResolve(ctx.resolved, () => {
        return resolveAll(...node.residue.splice(0).map(vi => {
            return createAndAppendNodes(log, node, vi, node.append);
        }), ...ctx.getAvailableViewportAgents('static').map(vpa => {
            const defaultInstruction = ViewportInstruction.create({
                component: vpa.viewport.default,
                viewport: vpa.viewport.name,
            });
            return createAndAppendNodes(log, node, defaultInstruction, node.append);
        }));
    });
}
function getDynamicChildren(node) {
    const ctx = node.context;
    const log = ctx.get(ILogger).scopeTo('RouteTree');
    const suffix = ctx.resolved instanceof Promise ? ' - awaiting promise' : '';
    log.trace(`getDynamicChildren(node:%s)${suffix}`, node);
    return onResolve(ctx.resolved, () => {
        const existingChildren = node.children.slice();
        return onResolve(resolveAll(...node.residue.splice(0).map(vi => {
            return createAndAppendNodes(log, node, vi, node.append);
        }), ...ctx.getAvailableViewportAgents('dynamic').map(vpa => {
            const defaultInstruction = ViewportInstruction.create({
                component: vpa.viewport.default,
                viewport: vpa.viewport.name,
            });
            return createAndAppendNodes(log, node, defaultInstruction, node.append);
        })), () => {
            return node.children.filter(x => !existingChildren.includes(x));
        });
    });
}
function createAndAppendNodes(log, node, vi, append) {
    var _a, _b;
    log.trace(`createAndAppendNodes(node:%s,vi:%s,append:${append})`, node, vi);
    switch (vi.component.type) {
        case 0 /* string */: {
            switch (vi.component.value) {
                case '..':
                    // Allow going "too far up" just like directory command `cd..`, simply clamp it to the root
                    node.clearChildren();
                    node = (_b = (_a = node.context.parent) === null || _a === void 0 ? void 0 : _a.node) !== null && _b !== void 0 ? _b : node;
                // falls through
                case '.':
                    return resolveAll(...vi.children.map(childVI => {
                        return createAndAppendNodes(log, node, childVI, childVI.append);
                    }));
                default: {
                    const childNode = createNode(log, node, vi, append);
                    if (childNode === null) {
                        return;
                    }
                    return appendNode(log, node, childNode);
                }
            }
        }
        case 4 /* IRouteViewModel */:
        case 2 /* CustomElementDefinition */: {
            const routeDef = RouteDefinition.resolve(vi.component.value);
            const childNode = createDirectNode(log, node, vi, append, routeDef.component);
            return appendNode(log, node, childNode);
        }
    }
}
function createNode(log, node, vi, append) {
    const ctx = node.context;
    let collapse = 0;
    let path = vi.component.value;
    let cur = vi;
    while (cur.children.length === 1) {
        cur = cur.children[0];
        if (cur.component.type === 0 /* string */) {
            ++collapse;
            path = `${path}/${cur.component.value}`;
        }
        else {
            break;
        }
    }
    const rr = ctx.recognize(path);
    if (rr === null) {
        const name = vi.component.value;
        let ced = ctx.find(CustomElement, name);
        switch (node.tree.options.routingMode) {
            case 'configured-only':
                if (ced === null) {
                    if (name === '') {
                        // TODO: maybe throw here instead? Do we want to force the empty route to always be configured?
                        return null;
                    }
                    throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);
                }
                throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
            case 'configured-first':
                if (ced === null) {
                    if (name === '') {
                        return null;
                    }
                    const vpName = vi.viewport === null || vi.viewport.length === 0 ? 'default' : vi.viewport;
                    const fallbackVPA = ctx.getFallbackViewportAgent('dynamic', vpName);
                    if (fallbackVPA === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' and no fallback was provided for viewport '${vpName}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                    }
                    const fallback = fallbackVPA.viewport.fallback;
                    ced = ctx.find(CustomElement, fallback);
                    if (ced === null) {
                        throw new Error(`the requested component '${name}' and the fallback '${fallback}' at viewport '${vpName}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                    }
                }
                return createDirectNode(log, node, vi, append, ced);
        }
    }
    // If it's a multi-segment match, collapse the viewport instructions to correct the tree structure.
    const finalPath = rr.residue === null ? path : path.slice(0, -(rr.residue.length + 1));
    vi.component.value = finalPath;
    for (let i = 0; i < collapse; ++i) {
        vi.children = vi.children[0].children;
    }
    return createConfiguredNode(log, node, vi, append, rr);
}
function createConfiguredNode(log, node, vi, append, rr, route = rr.route.endpoint.route) {
    const ctx = node.context;
    const rt = node.tree;
    return onResolve(route.handler, $handler => {
        route.handler = $handler;
        if ($handler.redirectTo === null) {
            const vpName = $handler.viewport;
            const ced = $handler.component;
            const vpa = ctx.resolveViewportAgent(ViewportRequest.create({
                viewportName: vpName,
                componentName: ced.name,
                append,
                resolution: rt.options.resolutionMode,
            }));
            const router = ctx.get(IRouter);
            const childCtx = router.getRouteContext(vpa, ced, vpa.hostController.context);
            childCtx.node = RouteNode.create({
                path: rr.route.endpoint.route.path,
                finalPath: route.path,
                context: childCtx,
                instruction: vi,
                params: {
                    ...node.params,
                    ...rr.route.params
                },
                queryParams: rt.queryParams,
                fragment: rt.fragment,
                data: $handler.data,
                viewport: vpName,
                component: ced,
                append,
                title: $handler.config.title,
                residue: rr.residue === null ? [] : [ViewportInstruction.create(rr.residue)],
            });
            childCtx.node.setTree(node.tree);
            log.trace(`createConfiguredNode(vi:%s) -> %s`, vi, childCtx.node);
            return childCtx.node;
        }
        // Migrate parameters to the redirect
        const origPath = RouteExpression.parse(route.path, false);
        const redirPath = RouteExpression.parse($handler.redirectTo, false);
        let origCur;
        let redirCur;
        const newSegs = [];
        switch (origPath.root.kind) {
            case 2 /* ScopedSegment */:
            case 4 /* Segment */:
                origCur = origPath.root;
                break;
            default:
                throw new Error(`Unexpected expression kind ${origPath.root.kind}`);
        }
        switch (redirPath.root.kind) {
            case 2 /* ScopedSegment */:
            case 4 /* Segment */:
                redirCur = redirPath.root;
                break;
            default:
                throw new Error(`Unexpected expression kind ${redirPath.root.kind}`);
        }
        let origSeg;
        let redirSeg;
        let origDone = false;
        let redirDone = false;
        while (!(origDone && redirDone)) {
            if (origDone) {
                origSeg = null;
            }
            else if (origCur.kind === 4 /* Segment */) {
                origSeg = origCur;
                origDone = true;
            }
            else if (origCur.left.kind === 4 /* Segment */) {
                origSeg = origCur.left;
                switch (origCur.right.kind) {
                    case 2 /* ScopedSegment */:
                    case 4 /* Segment */:
                        origCur = origCur.right;
                        break;
                    default:
                        throw new Error(`Unexpected expression kind ${origCur.right.kind}`);
                }
            }
            else {
                throw new Error(`Unexpected expression kind ${origCur.left.kind}`);
            }
            if (redirDone) {
                redirSeg = null;
            }
            else if (redirCur.kind === 4 /* Segment */) {
                redirSeg = redirCur;
                redirDone = true;
            }
            else if (redirCur.left.kind === 4 /* Segment */) {
                redirSeg = redirCur.left;
                switch (redirCur.right.kind) {
                    case 2 /* ScopedSegment */:
                    case 4 /* Segment */:
                        redirCur = redirCur.right;
                        break;
                    default:
                        throw new Error(`Unexpected expression kind ${redirCur.right.kind}`);
                }
            }
            else {
                throw new Error(`Unexpected expression kind ${redirCur.left.kind}`);
            }
            if (redirSeg !== null) {
                if (redirSeg.component.isDynamic && (origSeg === null || origSeg === void 0 ? void 0 : origSeg.component.isDynamic)) {
                    newSegs.push(rr.route.params[origSeg.component.name]);
                }
                else {
                    newSegs.push(redirSeg.raw);
                }
            }
        }
        const newPath = newSegs.filter(Boolean).join('/');
        const redirRR = ctx.recognize(newPath);
        if (redirRR === null) {
            const name = newPath;
            const ced = ctx.find(CustomElement, newPath);
            switch (rt.options.routingMode) {
                case 'configured-only':
                    if (ced === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add '${name}' to the routes list of the route decorator of '${ctx.component.name}'?`);
                    }
                    throw new Error(`'${name}' did not match any configured route, but it does match a registered component name at '${ctx.friendlyPath}' - did you forget to add a @route({ path: '${name}' }) decorator to '${name}' or unintentionally set routingMode to 'configured-only'?`);
                case 'configured-first':
                    if (ced === null) {
                        throw new Error(`'${name}' did not match any configured route or registered component name at '${ctx.friendlyPath}' - did you forget to add the component '${name}' to the dependencies of '${ctx.component.name}' or to register it as a global dependency?`);
                    }
                    return createDirectNode(log, node, vi, append, ced);
            }
        }
        return createConfiguredNode(log, node, vi, append, rr, redirRR.route.endpoint.route);
    });
}
function createDirectNode(log, node, vi, append, ced) {
    var _a;
    const ctx = node.context;
    const rt = node.tree;
    const vpName = (_a = vi.viewport) !== null && _a !== void 0 ? _a : 'default';
    const vpa = ctx.resolveViewportAgent(ViewportRequest.create({
        viewportName: vpName,
        componentName: ced.name,
        append,
        resolution: rt.options.resolutionMode,
    }));
    const router = ctx.get(IRouter);
    const childCtx = router.getRouteContext(vpa, ced, vpa.hostController.context);
    // TODO(fkleuver): process redirects in direct routing (?)
    const rd = RouteDefinition.resolve(ced);
    // TODO: add ActionExpression state representation to RouteNode
    childCtx.node = RouteNode.create({
        path: ced.name,
        finalPath: ced.name,
        context: childCtx,
        instruction: vi,
        params: {
            ...ctx.node.params,
            ...vi.params,
        },
        queryParams: rt.queryParams,
        fragment: rt.fragment,
        data: rd.data,
        viewport: vpName,
        component: ced,
        append,
        title: rd.config.title,
        residue: [...vi.children],
    });
    childCtx.node.setTree(ctx.node.tree);
    log.trace(`createDirectNode(vi:%s) -> %s`, vi, childCtx.node);
    return childCtx.node;
}
function appendNode(log, node, childNode) {
    return onResolve(childNode, $childNode => {
        log.trace(`appendNode($childNode:%s)`, $childNode);
        node.appendChild($childNode);
        return $childNode.context.vpa.scheduleUpdate(node.tree.options, $childNode);
    });
}

var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$3 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
const AuNavId = 'au-nav-id';
function isManagedState(state) {
    return isObject(state) && Object.prototype.hasOwnProperty.call(state, AuNavId) === true;
}
function toManagedState(state, navId) {
    return { ...state, [AuNavId]: navId };
}
function valueOrFuncToValue(instructions, valueOrFunc) {
    if (typeof valueOrFunc === 'function') {
        return valueOrFunc(instructions);
    }
    return valueOrFunc;
}
class RouterOptions {
    constructor(useUrlFragmentHash, useHref, statefulHistoryLength, 
    /**
     * The operating mode of the router that determines how components are resolved based on a url.
     *
     * - `configured-only`: only match the url against configured routes.
     * - `configured-first`: first tries to resolve by configured routes, then by component name from available dependencies. (default)
     *
     * Default: `configured-first`
     */
    routingMode, swapStrategy, resolutionMode, 
    /**
     * The strategy to use for determining the query parameters when both the previous and the new url has a query string.
     *
     * - `overwrite`: uses the query params of the new url. (default)
     * - `preserve`: uses the query params of the previous url.
     * - `merge`: uses the query params of both the previous and the new url. When a param name exists in both, the value from the new url is used.
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    queryParamsStrategy, 
    /**
     * The strategy to use for determining the fragment (value that comes after `#`) when both the previous and the new url have one.
     *
     * - `overwrite`: uses the fragment of the new url. (default)
     * - `preserve`: uses the fragment of the previous url.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `overwrite`
     */
    fragmentStrategy, 
    /**
     * The strategy to use for interacting with the browser's `history` object (if applicable).
     *
     * - `none`: do not interact with the `history` object at all.
     * - `replace`: replace the current state in history
     * - `push`: push a new state onto the history (default)
     * - A function that returns one of the 3 above values based on the navigation.
     *
     * Default: `push`
     */
    historyStrategy, 
    /**
     * The strategy to use for when navigating to the same URL.
     *
     * - `ignore`: do nothing (default).
     * - `reload`: reload the current URL, effectively performing a refresh.
     * - A function that returns one of the 2 above values based on the navigation.
     *
     * Default: `ignore`
     */
    sameUrlStrategy) {
        this.useUrlFragmentHash = useUrlFragmentHash;
        this.useHref = useHref;
        this.statefulHistoryLength = statefulHistoryLength;
        this.routingMode = routingMode;
        this.swapStrategy = swapStrategy;
        this.resolutionMode = resolutionMode;
        this.queryParamsStrategy = queryParamsStrategy;
        this.fragmentStrategy = fragmentStrategy;
        this.historyStrategy = historyStrategy;
        this.sameUrlStrategy = sameUrlStrategy;
    }
    static get DEFAULT() { return RouterOptions.create({}); }
    static create(input) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return new RouterOptions((_a = input.useUrlFragmentHash) !== null && _a !== void 0 ? _a : false, (_b = input.useHref) !== null && _b !== void 0 ? _b : true, (_c = input.statefulHistoryLength) !== null && _c !== void 0 ? _c : 0, (_d = input.routingMode) !== null && _d !== void 0 ? _d : 'configured-first', (_e = input.swapStrategy) !== null && _e !== void 0 ? _e : 'sequential-remove-first', (_f = input.resolutionMode) !== null && _f !== void 0 ? _f : 'dynamic', (_g = input.queryParamsStrategy) !== null && _g !== void 0 ? _g : 'overwrite', (_h = input.fragmentStrategy) !== null && _h !== void 0 ? _h : 'overwrite', (_j = input.historyStrategy) !== null && _j !== void 0 ? _j : 'push', (_k = input.sameUrlStrategy) !== null && _k !== void 0 ? _k : 'ignore');
    }
    /** @internal */
    getQueryParamsStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.queryParamsStrategy);
    }
    /** @internal */
    getFragmentStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.fragmentStrategy);
    }
    /** @internal */
    getHistoryStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.historyStrategy);
    }
    /** @internal */
    getSameUrlStrategy(instructions) {
        return valueOrFuncToValue(instructions, this.sameUrlStrategy);
    }
    stringifyProperties() {
        return [
            ['routingMode', 'mode'],
            ['swapStrategy', 'swap'],
            ['resolutionMode', 'resolution'],
            ['queryParamsStrategy', 'queryParams'],
            ['fragmentStrategy', 'fragment'],
            ['historyStrategy', 'history'],
            ['sameUrlStrategy', 'sameUrl'],
        ].map(([key, name]) => {
            const value = this[key];
            return `${name}:${typeof value === 'function' ? value : `'${value}'`}`;
        }).join(',');
    }
    clone() {
        return new RouterOptions(this.useUrlFragmentHash, this.useHref, this.statefulHistoryLength, this.routingMode, this.swapStrategy, this.resolutionMode, this.queryParamsStrategy, this.fragmentStrategy, this.historyStrategy, this.sameUrlStrategy);
    }
    toString() {
        return `RO(${this.stringifyProperties()})`;
    }
}
class NavigationOptions extends RouterOptions {
    constructor(routerOptions, title, titleSeparator, append, 
    /**
     * Specify a context to use for relative navigation.
     *
     * - `null` (or empty): navigate relative to the root (absolute navigation)
     * - `IRouteContext`: navigate relative to specifically this RouteContext (advanced users).
     * - `HTMLElement`: navigate relative to the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): navigate relative to this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     */
    context, 
    /**
     * Specify an object to be serialized to a query string, and then set to the query string of the new URL.
     */
    queryParams, 
    /**
     * Specify the hash fragment for the new URL.
     */
    fragment, 
    /**
     * Specify any kind of state to be stored together with the history entry for this navigation.
     */
    state) {
        super(routerOptions.useUrlFragmentHash, routerOptions.useHref, routerOptions.statefulHistoryLength, routerOptions.routingMode, routerOptions.swapStrategy, routerOptions.resolutionMode, routerOptions.queryParamsStrategy, routerOptions.fragmentStrategy, routerOptions.historyStrategy, routerOptions.sameUrlStrategy);
        this.title = title;
        this.titleSeparator = titleSeparator;
        this.append = append;
        this.context = context;
        this.queryParams = queryParams;
        this.fragment = fragment;
        this.state = state;
    }
    static get DEFAULT() { return NavigationOptions.create({}); }
    static create(input) {
        var _a, _b, _c, _d, _e, _f, _g;
        return new NavigationOptions(RouterOptions.create(input), (_a = input.title) !== null && _a !== void 0 ? _a : null, (_b = input.titleSeparator) !== null && _b !== void 0 ? _b : ' | ', (_c = input.append) !== null && _c !== void 0 ? _c : false, (_d = input.context) !== null && _d !== void 0 ? _d : null, (_e = input.queryParams) !== null && _e !== void 0 ? _e : null, (_f = input.fragment) !== null && _f !== void 0 ? _f : '', (_g = input.state) !== null && _g !== void 0 ? _g : null);
    }
    clone() {
        return new NavigationOptions(super.clone(), this.title, this.titleSeparator, this.append, this.context, { ...this.queryParams }, this.fragment, this.state === null ? null : { ...this.state });
    }
    toString() {
        return `NO(${super.stringifyProperties()})`;
    }
}
class Navigation {
    constructor(id, instructions, trigger, options, prevNavigation, 
    // Set on next navigation, this is the route after all redirects etc have been processed.
    finalInstructions) {
        this.id = id;
        this.instructions = instructions;
        this.trigger = trigger;
        this.options = options;
        this.prevNavigation = prevNavigation;
        this.finalInstructions = finalInstructions;
    }
    static create(input) {
        return new Navigation(input.id, input.instructions, input.trigger, input.options, input.prevNavigation, input.finalInstructions);
    }
    toString() {
        return `N(id:${this.id},instructions:${this.instructions},trigger:'${this.trigger}')`;
    }
}
class Transition {
    constructor(id, prevInstructions, instructions, finalInstructions, instructionsChanged, trigger, options, managedState, previousRouteTree, routeTree, promise, resolve, reject, guardsResult, error) {
        this.id = id;
        this.prevInstructions = prevInstructions;
        this.instructions = instructions;
        this.finalInstructions = finalInstructions;
        this.instructionsChanged = instructionsChanged;
        this.trigger = trigger;
        this.options = options;
        this.managedState = managedState;
        this.previousRouteTree = previousRouteTree;
        this.routeTree = routeTree;
        this.promise = promise;
        this.resolve = resolve;
        this.reject = reject;
        this.guardsResult = guardsResult;
        this.error = error;
    }
    static create(input) {
        return new Transition(input.id, input.prevInstructions, input.instructions, input.finalInstructions, input.instructionsChanged, input.trigger, input.options, input.managedState, input.previousRouteTree, input.routeTree, input.promise, input.resolve, input.reject, input.guardsResult, void 0);
    }
    run(cb, next) {
        if (this.guardsResult !== true) {
            return;
        }
        try {
            const ret = cb();
            if (ret instanceof Promise) {
                ret.then(next).catch(err => {
                    this.handleError(err);
                });
            }
            else {
                next(ret);
            }
        }
        catch (err) {
            this.handleError(err);
        }
    }
    handleError(err) {
        this.reject(this.error = err);
    }
    toString() {
        return `T(id:${this.id},trigger:'${this.trigger}',instructions:${this.instructions},options:${this.options})`;
    }
}
const IRouter = DI.createInterface('IRouter', x => x.singleton(Router));
let Router = class Router {
    constructor(container, p, logger, events, locationMgr) {
        this.container = container;
        this.p = p;
        this.logger = logger;
        this.events = events;
        this.locationMgr = locationMgr;
        this._ctx = null;
        this._routeTree = null;
        this._currentTr = null;
        this.options = RouterOptions.DEFAULT;
        this.navigated = false;
        this.navigationId = 0;
        this.lastSuccessfulNavigation = null;
        this.activeNavigation = null;
        this.instructions = ViewportInstructionTree.create('');
        this.nextTr = null;
        this.locationChangeSubscription = null;
        this.vpaLookup = new Map();
        this.logger = logger.root.scopeTo('Router');
    }
    get ctx() {
        let ctx = this._ctx;
        if (ctx === null) {
            if (!this.container.has(IRouteContext, true)) {
                throw new Error(`Root RouteContext is not set. Did you forget to register RouteConfiguration, or try to navigate before calling Aurelia.start()?`);
            }
            ctx = this._ctx = this.container.get(IRouteContext);
        }
        return ctx;
    }
    get routeTree() {
        let routeTree = this._routeTree;
        if (routeTree === null) {
            // Lazy instantiation for only the very first (synthetic) tree.
            // Doing it here instead of in the constructor to delay it until we have the context.
            const ctx = this.ctx;
            routeTree = this._routeTree = new RouteTree(NavigationOptions.create({ ...this.options }), Object.freeze(new URLSearchParams()), null, RouteNode.create({
                path: '',
                finalPath: '',
                context: ctx,
                instruction: null,
                component: ctx.definition.component,
                append: false,
            }));
        }
        return routeTree;
    }
    get currentTr() {
        let currentTr = this._currentTr;
        if (currentTr === null) {
            currentTr = this._currentTr = Transition.create({
                id: 0,
                prevInstructions: this.instructions,
                instructions: this.instructions,
                finalInstructions: this.instructions,
                instructionsChanged: true,
                trigger: 'api',
                options: NavigationOptions.DEFAULT,
                managedState: null,
                previousRouteTree: this.routeTree.clone(),
                routeTree: this.routeTree,
                resolve: null,
                reject: null,
                promise: null,
                guardsResult: true,
                error: void 0,
            });
        }
        return currentTr;
    }
    set currentTr(value) {
        this._currentTr = value;
    }
    /**
     * Get the closest RouteContext relative to the provided component, controller or node.
     *
     * @param context - The object from which to resolve the closest RouteContext.
     *
     * @returns when the value is:
     * - `null`: the root
     * - `IRouteContext`: the provided value (no-op)
     * - `HTMLElement`: the context of the routeable component (page) that directly or indirectly contains this element.
     * - `ICustomElementViewModel` (the `this` object when working from inside a view model): the context of this component (if it was loaded as a route), or the routeable component (page) directly or indirectly containing it.
     * - `ICustomElementController`: same as `ICustomElementViewModel`, but using the controller object instead of the view model object (advanced users).
     */
    resolveContext(context) {
        return RouteContext.resolve(this.ctx, context);
    }
    start(routerOptions, performInitialNavigation) {
        this.options = RouterOptions.create(routerOptions);
        this.locationMgr.startListening();
        this.locationChangeSubscription = this.events.subscribe('au:router:location-change', e => {
            // TODO(fkleuver): add a throttle config.
            // At the time of writing, chromium throttles popstate events at a maximum of ~100 per second.
            // While macroTasks run up to 250 times per second, it is extremely unlikely that more than ~100 per second of these will run due to the double queueing.
            // However, this throttle limit could theoretically be hit by e.g. integration tests that don't mock Location/History.
            this.p.taskQueue.queueTask(() => {
                // Don't try to restore state that might not have anything to do with the Aurelia app
                const state = isManagedState(e.state) ? e.state : null;
                const options = NavigationOptions.create({
                    ...this.options,
                    historyStrategy: 'replace',
                });
                const instructions = ViewportInstructionTree.create(e.url, options);
                // The promise will be stored in the transition. However, unlike `load()`, `start()` does not return this promise in any way.
                // The router merely guarantees that it will be awaited (or canceled) before the next transition, so a race condition is impossible either way.
                // However, it is possible to get floating promises lingering during non-awaited unit tests, which could have unpredictable side-effects.
                // So we do want to solve this at some point.
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                this.enqueue(instructions, e.trigger, state, null);
            });
        });
        if (!this.navigated && performInitialNavigation) {
            return this.load(this.locationMgr.getPath(), { historyStrategy: 'replace' });
        }
    }
    stop() {
        var _a;
        this.locationMgr.stopListening();
        (_a = this.locationChangeSubscription) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    load(instructionOrInstructions, options) {
        const instructions = this.createViewportInstructions(instructionOrInstructions, options);
        this.logger.trace('load(instructions:%s)', instructions);
        return this.enqueue(instructions, 'api', null, null);
    }
    isActive(instructionOrInstructions, context) {
        const ctx = this.resolveContext(context);
        const instructions = this.createViewportInstructions(instructionOrInstructions, { context: ctx });
        this.logger.trace('isActive(instructions:%s,ctx:%s)', instructions, ctx);
        // TODO: incorporate potential context offset by `../` etc in the instructions
        return this.routeTree.contains(instructions);
    }
    /**
     * Retrieve the RouteContext, which contains statically configured routes combined with the customElement metadata associated with a type.
     *
     * The customElement metadata is lazily associated with a type via the RouteContext the first time `getOrCreate` is called.
     *
     * This API is also used for direct routing even when there is no configuration at all.
     *
     * @param viewportAgent - The ViewportAgent hosting the component associated with this RouteContext. If the RouteContext for the component+viewport combination already exists, the ViewportAgent will be updated in case it changed.
     * @param component - The custom element definition.
     * @param renderContext - The `controller.context` of the component hosting the viewport that the route will be loaded into.
     *
     */
    getRouteContext(viewportAgent, component, renderContext) {
        const logger = renderContext.get(ILogger).scopeTo('RouteContext');
        const routeDefinition = RouteDefinition.resolve(component.Type);
        let routeDefinitionLookup = this.vpaLookup.get(viewportAgent);
        if (routeDefinitionLookup === void 0) {
            this.vpaLookup.set(viewportAgent, routeDefinitionLookup = new WeakMap());
        }
        let routeContext = routeDefinitionLookup.get(routeDefinition);
        if (routeContext === void 0) {
            logger.trace(`creating new RouteContext for %s`, routeDefinition);
            const parent = renderContext.has(IRouteContext, true) ? renderContext.get(IRouteContext) : null;
            routeDefinitionLookup.set(routeDefinition, routeContext = new RouteContext(viewportAgent, parent, component, routeDefinition, renderContext));
        }
        else {
            logger.trace(`returning existing RouteContext for %s`, routeDefinition);
            if (viewportAgent !== null) {
                routeContext.vpa = viewportAgent;
            }
        }
        return routeContext;
    }
    createViewportInstructions(instructionOrInstructions, options) {
        return ViewportInstructionTree.create(instructionOrInstructions, this.getNavigationOptions(options));
    }
    /**
     * Enqueue an instruction tree to be processed as soon as possible.
     *
     * Will wait for any existing in-flight transition to finish, otherwise starts immediately.
     *
     * @param instructions - The instruction tree that determines the transition
     * @param trigger - `'popstate'` or `'hashchange'` if initiated by a browser event, or `'api'` for manually initiated transitions via the `load` api.
     * @param state - The state to restore, if any.
     * @param failedTr - If this is a redirect / fallback from a failed transition, the previous transition is passed forward to ensure the orinal promise resolves with the latest result.
     */
    enqueue(instructions, trigger, state, failedTr) {
        const lastTr = this.currentTr;
        if (trigger !== 'api' && lastTr.trigger === 'api' && lastTr.instructions.equals(instructions)) {
            // User-triggered navigation that results in `replaceState` with the same URL. The API call already triggered the navigation; event is ignored.
            this.logger.debug(`Ignoring navigation triggered by '%s' because it is the same URL as the previous navigation which was triggered by 'api'.`, trigger);
            return true;
        }
        let resolve = (void 0); // Need this initializer because TS doesn't know the promise executor will run synchronously
        let reject = (void 0);
        let promise;
        if (failedTr === null) {
            promise = new Promise(function ($resolve, $reject) { resolve = $resolve; reject = $reject; });
        }
        else {
            // Ensure that `await router.load` only resolves when the transition truly finished, so chain forward on top of
            // any previously failed transition that caused a recovering backwards navigation.
            this.logger.debug(`Reusing promise/resolve/reject from the previously failed transition %s`, failedTr);
            promise = failedTr.promise;
            resolve = failedTr.resolve;
            reject = failedTr.reject;
        }
        // This is an intentional overwrite: if a new transition is scheduled while the currently scheduled transition hasn't even started yet,
        // then the currently scheduled transition is effectively canceled/ignored.
        // This is consistent with the runtime's controller behavior, where if you rapidly call async activate -> deactivate -> activate (for example), then the deactivate is canceled.
        const nextTr = this.nextTr = Transition.create({
            id: ++this.navigationId,
            trigger,
            managedState: state,
            prevInstructions: lastTr.finalInstructions,
            finalInstructions: instructions,
            instructionsChanged: !lastTr.finalInstructions.equals(instructions),
            instructions,
            options: instructions.options,
            promise,
            resolve,
            reject,
            previousRouteTree: this.routeTree,
            routeTree: this._routeTree = this.routeTree.clone(),
            guardsResult: true,
            error: void 0,
        });
        this.logger.debug(`Scheduling transition: %s`, nextTr);
        if (this.activeNavigation === null) {
            // Catch any errors that might be thrown by `run` and reject the original promise which is awaited down below
            try {
                this.run(nextTr);
            }
            catch (err) {
                nextTr.handleError(err);
            }
        }
        return nextTr.promise.then(ret => {
            this.logger.debug(`Transition succeeded: %s`, nextTr);
            return ret;
        }).catch(err => {
            this.logger.error(`Navigation failed: %s`, nextTr, err);
            throw err;
        });
    }
    run(tr) {
        this.currentTr = tr;
        this.nextTr = null;
        // Clone it because the prevNavigation could have observers and stuff on it, and it's meant to be a standalone snapshot from here on.
        const prevNavigation = this.lastSuccessfulNavigation === null ? null : Navigation.create({
            ...this.lastSuccessfulNavigation,
            // There could be arbitrary state stored on a navigation, so to prevent memory leaks we only keep one `prevNavigation` around
            prevNavigation: null,
        });
        this.activeNavigation = Navigation.create({
            id: tr.id,
            instructions: tr.instructions,
            trigger: tr.trigger,
            options: tr.options,
            prevNavigation,
            finalInstructions: tr.finalInstructions,
        });
        const navigationContext = this.resolveContext(tr.options.context);
        const routeChanged = (!this.navigated ||
            tr.instructions.children.length !== navigationContext.node.children.length ||
            tr.instructions.children.some((x, i) => { var _a, _b; return !((_b = (_a = navigationContext.node.children[i]) === null || _a === void 0 ? void 0 : _a.originalInstruction.equals(x)) !== null && _b !== void 0 ? _b : false); }));
        const shouldProcessRoute = routeChanged || tr.options.getSameUrlStrategy(this.instructions) === 'reload';
        if (!shouldProcessRoute) {
            this.logger.trace(`run(tr:%s) - NOT processing route`, tr);
            this.navigated = true;
            this.activeNavigation = null;
            tr.resolve(false);
            this.runNextTransition(tr);
            return;
        }
        this.logger.trace(`run(tr:%s) - processing route`, tr);
        this.events.publish(new NavigationStartEvent(tr.id, tr.instructions, tr.trigger, tr.managedState));
        // If user triggered a new transition in response to the NavigationStartEvent
        // (in which case `this.nextTransition` will NOT be null), we short-circuit here and go straight to processing the next one.
        if (this.nextTr !== null) {
            this.logger.debug(`run(tr:%s) - aborting because a new transition was queued in response to the NavigationStartEvent`, tr);
            return this.run(this.nextTr);
        }
        this.activeNavigation = Navigation.create({
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            ...this.activeNavigation,
            // After redirects are applied, this could be a different route
            finalInstructions: tr.finalInstructions,
        });
        // TODO: run global guards
        //
        //
        // ---
        tr.run(() => {
            this.logger.trace(`run() - compiling route tree: %s`, tr.finalInstructions);
            return updateRouteTree(tr.routeTree, tr.finalInstructions, navigationContext);
        }, () => {
            const prev = tr.previousRouteTree.root.children;
            const next = tr.routeTree.root.children;
            const all = mergeDistinct(prev, next);
            Batch.start(b => {
                this.logger.trace(`run() - invoking canUnload on ${prev.length} nodes`);
                for (const node of prev) {
                    node.context.vpa.canUnload(tr, b);
                }
            }).continueWith(b => {
                if (tr.guardsResult !== true) {
                    b.push(); // prevent the next step in the batch from running
                    this.cancelNavigation(tr);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking canLoad on ${next.length} nodes`);
                for (const node of next) {
                    node.context.vpa.canLoad(tr, b);
                }
            }).continueWith(b => {
                if (tr.guardsResult !== true) {
                    b.push();
                    this.cancelNavigation(tr);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking unload on ${prev.length} nodes`);
                for (const node of prev) {
                    node.context.vpa.unload(tr, b);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking load on ${next.length} nodes`);
                for (const node of next) {
                    node.context.vpa.load(tr, b);
                }
            }).continueWith(b => {
                this.logger.trace(`run() - invoking swap on ${all.length} nodes`);
                for (const node of all) {
                    node.context.vpa.swap(tr, b);
                }
            }).continueWith(() => {
                this.logger.trace(`run() - finalizing transition`);
                // order doesn't matter for this operation
                all.forEach(function (node) {
                    node.context.vpa.endTransition();
                });
                this.navigated = true;
                this.instructions = tr.finalInstructions = tr.routeTree.finalizeInstructions();
                this.events.publish(new NavigationEndEvent(tr.id, tr.instructions, this.instructions));
                this.lastSuccessfulNavigation = this.activeNavigation;
                this.activeNavigation = null;
                this.applyHistoryState(tr);
                tr.resolve(true);
                this.runNextTransition(tr);
            }).start();
        });
    }
    applyHistoryState(tr) {
        switch (tr.options.getHistoryStrategy(this.instructions)) {
            case 'none':
                // do nothing
                break;
            case 'push':
                this.locationMgr.pushState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), tr.finalInstructions.toUrl());
                break;
            case 'replace':
                this.locationMgr.replaceState(toManagedState(tr.options.state, tr.id), this.updateTitle(tr), tr.finalInstructions.toUrl());
                break;
        }
    }
    getTitle(tr) {
        var _a, _b;
        switch (typeof tr.options.title) {
            case 'function':
                return (_a = tr.options.title.call(void 0, tr.routeTree.root)) !== null && _a !== void 0 ? _a : '';
            case 'string':
                return tr.options.title;
            default:
                return (_b = tr.routeTree.root.getTitle(tr.options.titleSeparator)) !== null && _b !== void 0 ? _b : '';
        }
    }
    updateTitle(tr) {
        const title = this.getTitle(tr);
        if (title.length > 0) {
            this.p.document.title = title;
        }
        return this.p.document.title;
    }
    cancelNavigation(tr) {
        this.logger.trace(`cancelNavigation(tr:%s)`, tr);
        const prev = tr.previousRouteTree.root.children;
        const next = tr.routeTree.root.children;
        const all = mergeDistinct(prev, next);
        // order doesn't matter for this operation
        all.forEach(function (node) {
            node.context.vpa.cancelUpdate();
        });
        this.activeNavigation = null;
        this.instructions = tr.prevInstructions;
        this._routeTree = tr.previousRouteTree;
        this.events.publish(new NavigationCancelEvent(tr.id, tr.instructions, `guardsResult is ${tr.guardsResult}`));
        if (tr.guardsResult === false) {
            tr.resolve(false);
            // In case a new navigation was requested in the meantime, immediately start processing it
            this.runNextTransition(tr);
        }
        else {
            void onResolve(this.enqueue(tr.guardsResult, 'api', tr.managedState, tr), () => {
                this.logger.trace(`cancelNavigation(tr:%s) - finished redirect`, tr);
            });
        }
    }
    runNextTransition(tr) {
        if (this.nextTr !== null) {
            this.logger.trace(`runNextTransition(tr:%s) -> scheduling nextTransition: %s`, tr, this.nextTr);
            this.p.taskQueue.queueTask(() => {
                // nextTransition is allowed to change up until the point when it's actually time to process it,
                // so we need to check it for null again when the scheduled task runs.
                const nextTr = this.nextTr;
                if (nextTr !== null) {
                    try {
                        this.run(nextTr);
                    }
                    catch (err) {
                        nextTr.handleError(err);
                    }
                }
            });
        }
    }
    getNavigationOptions(options) {
        return NavigationOptions.create({ ...this.options, ...options });
    }
};
Router = __decorate$3([
    __param$3(0, IContainer),
    __param$3(1, IPlatform),
    __param$3(2, ILogger),
    __param$3(3, IRouterEvents),
    __param$3(4, ILocationManager)
], Router);

/* eslint-disable @typescript-eslint/restrict-template-expressions */
DI.createInterface('IViewportInstruction');
class ViewportInstruction {
    constructor(context, append, open, close, component, viewport, params, children) {
        this.context = context;
        this.append = append;
        this.open = open;
        this.close = close;
        this.component = component;
        this.viewport = viewport;
        this.params = params;
        this.children = children;
    }
    static create(instruction, context) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        if (instruction instanceof ViewportInstruction) {
            return instruction;
        }
        if (isPartialViewportInstruction(instruction)) {
            const component = TypedNavigationInstruction.create(instruction.component);
            const children = (_b = (_a = instruction.children) === null || _a === void 0 ? void 0 : _a.map(ViewportInstruction.create)) !== null && _b !== void 0 ? _b : [];
            return new ViewportInstruction((_d = (_c = instruction.context) !== null && _c !== void 0 ? _c : context) !== null && _d !== void 0 ? _d : null, (_e = instruction.append) !== null && _e !== void 0 ? _e : false, (_f = instruction.open) !== null && _f !== void 0 ? _f : 0, (_g = instruction.close) !== null && _g !== void 0 ? _g : 0, component, (_h = instruction.viewport) !== null && _h !== void 0 ? _h : null, (_j = instruction.params) !== null && _j !== void 0 ? _j : null, children);
        }
        const typedInstruction = TypedNavigationInstruction.create(instruction);
        return new ViewportInstruction(context !== null && context !== void 0 ? context : null, false, 0, 0, typedInstruction, null, null, []);
    }
    contains(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length < otherChildren.length) {
            return false;
        }
        // TODO(fkleuver): incorporate viewports when null / '' descrepancies are fixed,
        // as well as params when inheritance is fully fixed
        if (!this.component.equals(other.component)) {
            return false;
        }
        for (let i = 0, ii = otherChildren.length; i < ii; ++i) {
            if (!thisChildren[i].contains(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        if (
        // TODO(fkleuver): decide if we really need to include `context` in this comparison
        !this.component.equals(other.component) ||
            this.viewport !== other.viewport ||
            !shallowEquals(this.params, other.params)) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    clone() {
        return new ViewportInstruction(this.context, this.append, this.open, this.close, this.component.clone(), this.viewport, this.params === null ? null : { ...this.params }, [...this.children]);
    }
    toUrlComponent(recursive = true) {
        // TODO(fkleuver): use the context to determine create full tree
        const component = this.component.toUrlComponent();
        const params = this.params === null || Object.keys(this.params).length === 0 ? '' : `(${stringifyParams(this.params)})`;
        const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `@${this.viewport}`;
        const thisPart = `${'('.repeat(this.open)}${component}${params}${viewport}${')'.repeat(this.close)}`;
        const childPart = recursive ? this.children.map(x => x.toUrlComponent()).join('+') : '';
        if (thisPart.length > 0) {
            if (childPart.length > 0) {
                return [thisPart, childPart].join('/');
            }
            return thisPart;
        }
        return childPart;
    }
    toString() {
        const component = `c:${this.component}`;
        const viewport = this.viewport === null || this.viewport.length === 0 ? '' : `viewport:${this.viewport}`;
        const children = this.children.length === 0 ? '' : `children:[${this.children.map(String).join(',')}]`;
        const props = [component, viewport, children].filter(Boolean).join(',');
        return `VPI(${props})`;
    }
}
function stringifyParams(params) {
    const keys = Object.keys(params);
    const values = Array(keys.length);
    const indexKeys = [];
    const namedKeys = [];
    for (const key of keys) {
        if (isArrayIndex(key)) {
            indexKeys.push(Number(key));
        }
        else {
            namedKeys.push(key);
        }
    }
    for (let i = 0; i < keys.length; ++i) {
        const indexKeyIdx = indexKeys.indexOf(i);
        if (indexKeyIdx > -1) {
            values[i] = params[i];
            indexKeys.splice(indexKeyIdx, 1);
        }
        else {
            const namedKey = namedKeys.shift();
            values[i] = `${namedKey}=${params[namedKey]}`;
        }
    }
    return values.join(',');
}
/**
 * Associate the object with an id so it can be stored in history as a serialized url segment.
 *
 * WARNING: As the implementation is right now, this is a memory leak disaster.
 * This is really a placeholder implementation at the moment and should NOT be used / advertised for production until a leak-free solution is made.
 */
const getObjectId = (function () {
    let lastId = 0;
    const objectIdMap = new Map();
    return function (obj) {
        let id = objectIdMap.get(obj);
        if (id === void 0) {
            objectIdMap.set(obj, id = ++lastId);
        }
        return id;
    };
})();
class ViewportInstructionTree {
    constructor(options, isAbsolute, children, queryParams, fragment) {
        this.options = options;
        this.isAbsolute = isAbsolute;
        this.children = children;
        this.queryParams = queryParams;
        this.fragment = fragment;
    }
    static create(instructionOrInstructions, options) {
        const $options = NavigationOptions.create({ ...options });
        if (instructionOrInstructions instanceof ViewportInstructionTree) {
            return new ViewportInstructionTree($options, instructionOrInstructions.isAbsolute, instructionOrInstructions.children.map(x => ViewportInstruction.create(x, $options.context)), instructionOrInstructions.queryParams, instructionOrInstructions.fragment);
        }
        if (instructionOrInstructions instanceof Array) {
            return new ViewportInstructionTree($options, false, instructionOrInstructions.map(x => ViewportInstruction.create(x, $options.context)), Object.freeze(new URLSearchParams()), null);
        }
        if (typeof instructionOrInstructions === 'string') {
            const expr = RouteExpression.parse(instructionOrInstructions, $options.useUrlFragmentHash);
            return expr.toInstructionTree($options);
        }
        return new ViewportInstructionTree($options, false, [ViewportInstruction.create(instructionOrInstructions, $options.context)], Object.freeze(new URLSearchParams()), null);
    }
    equals(other) {
        const thisChildren = this.children;
        const otherChildren = other.children;
        if (thisChildren.length !== otherChildren.length) {
            return false;
        }
        for (let i = 0, ii = thisChildren.length; i < ii; ++i) {
            if (!thisChildren[i].equals(otherChildren[i])) {
                return false;
            }
        }
        return true;
    }
    toUrl() {
        const path = this.children.map(x => x.toUrlComponent()).join('+');
        const query = this.queryParams.toString();
        return query !== '' ? `${path}?${query}` : path;
    }
    toString() {
        return `[${this.children.map(String).join(',')}]`;
    }
}
var NavigationInstructionType;
(function (NavigationInstructionType) {
    NavigationInstructionType[NavigationInstructionType["string"] = 0] = "string";
    NavigationInstructionType[NavigationInstructionType["ViewportInstruction"] = 1] = "ViewportInstruction";
    NavigationInstructionType[NavigationInstructionType["CustomElementDefinition"] = 2] = "CustomElementDefinition";
    NavigationInstructionType[NavigationInstructionType["Promise"] = 3] = "Promise";
    NavigationInstructionType[NavigationInstructionType["IRouteViewModel"] = 4] = "IRouteViewModel";
})(NavigationInstructionType || (NavigationInstructionType = {}));
class TypedNavigationInstruction {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    static create(instruction) {
        if (instruction instanceof TypedNavigationInstruction) {
            return instruction;
        }
        if (typeof instruction === 'string') {
            return new TypedNavigationInstruction(0 /* string */, instruction);
        }
        else if (!isObject(instruction)) {
            // Typings prevent this from happening, but guard it anyway due to `as any` and the sorts being a thing in userland code and tests.
            expectType('function/class or object', '', instruction);
        }
        else if (typeof instruction === 'function') {
            // This is the class itself
            // CustomElement.getDefinition will throw if the type is not a custom element
            const definition = CustomElement.getDefinition(instruction);
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, definition);
        }
        else if (instruction instanceof Promise) {
            return new TypedNavigationInstruction(3 /* Promise */, instruction);
        }
        else if (isPartialViewportInstruction(instruction)) {
            const viewportInstruction = ViewportInstruction.create(instruction);
            return new TypedNavigationInstruction(1 /* ViewportInstruction */, viewportInstruction);
        }
        else if (isCustomElementViewModel(instruction)) {
            return new TypedNavigationInstruction(4 /* IRouteViewModel */, instruction);
        }
        else if (instruction instanceof CustomElementDefinition) {
            // We might have gotten a complete definition. In that case use it as-is.
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, instruction);
        }
        else if (isPartialCustomElementDefinition(instruction)) {
            // If we just got a partial definition, define a new anonymous class
            const Type = CustomElement.define(instruction);
            const definition = CustomElement.getDefinition(Type);
            return new TypedNavigationInstruction(2 /* CustomElementDefinition */, definition);
        }
        else {
            throw new Error(`Invalid component ${tryStringify(instruction)}: must be either a class, a custom element ViewModel, or a (partial) custom element definition`);
        }
    }
    equals(other) {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
            case 4 /* IRouteViewModel */:
            case 3 /* Promise */:
            case 0 /* string */:
                return this.type === other.type && this.value === other.value;
            case 1 /* ViewportInstruction */:
                return this.type === other.type && this.value.equals(other.value);
        }
    }
    clone() {
        return new TypedNavigationInstruction(this.type, this.value);
    }
    toUrlComponent() {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
                return this.value.name;
            case 4 /* IRouteViewModel */:
            case 3 /* Promise */:
                return `au$obj${getObjectId(this.value)}`;
            case 1 /* ViewportInstruction */:
                return this.value.toUrlComponent();
            case 0 /* string */:
                return this.value;
        }
    }
    toString() {
        switch (this.type) {
            case 2 /* CustomElementDefinition */:
                return `CEDef(name:'${this.value.name}')`;
            case 3 /* Promise */:
                return `Promise`;
            case 4 /* IRouteViewModel */:
                return `VM(name:'${CustomElement.getDefinition(this.value.constructor).name}')`;
            case 1 /* ViewportInstruction */:
                return this.value.toString();
            case 0 /* string */:
                return `'${this.value}'`;
        }
    }
}

const noRoutes = emptyArray;
function defaultReentryBehavior(current, next) {
    if (!shallowEquals(current.params, next.params)) {
        return 'invoke-lifecycles';
    }
    return 'none';
}
class RouteConfig {
    constructor(
    /**
     * The id for this route, which can be used in the view for generating hrefs.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    id, 
    /**
     * The path to match against the url.
     *
     * If left blank, the path will be derived from the component's static `path` property (if it exists), or otherwise the component name will be used (if direct routing is enabled).
     */
    path, 
    /**
     * The title to use for this route when matched.
     *
     * If left blank, this route will not contribute to the generated title.
     */
    title, 
    /**
     * The path to which to redirect when the url matches the path in this config.
     *
     * If the path begins with a slash (`/`), the redirect path is considered absolute, otherwise it is considered relative to the parent path.
     */
    redirectTo, 
    /**
     * Whether the `path` should be case sensitive.
     */
    caseSensitive, 
    /**
     * How to behave when this component scheduled to be loaded again in the same viewport:
     *
     * - `replace`: completely removes the current component and creates a new one, behaving as if the component changed.
     * - `invoke-lifecycles`: calls `canUnload`, `canLoad`, `unload` and `load` (default if only the parameters have changed)
     * - `none`: does nothing (default if nothing has changed for the viewport)
     *
     * By default, calls the router lifecycle hooks only if the parameters have changed, otherwise does nothing.
     */
    transitionPlan, 
    /**
     * The name of the viewport this component should be loaded into.
     *
     * (TODO: decide on, and provide more details about, whether this can be specified without specifying path, and what happens in different combinations of situations)
     */
    viewport, 
    /**
     * Any custom data that should be accessible to matched components or hooks.
     */
    data, 
    /**
     * The child routes that can be navigated to from this route. See `Routeable` for more information.
     */
    routes) {
        this.id = id;
        this.path = path;
        this.title = title;
        this.redirectTo = redirectTo;
        this.caseSensitive = caseSensitive;
        this.transitionPlan = transitionPlan;
        this.viewport = viewport;
        this.data = data;
        this.routes = routes;
    }
    static create(configOrPath, Type) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
        if (typeof configOrPath === 'string' || configOrPath instanceof Array) {
            const path = configOrPath;
            const redirectTo = (_a = Type === null || Type === void 0 ? void 0 : Type.redirectTo) !== null && _a !== void 0 ? _a : null;
            const caseSensitive = (_b = Type === null || Type === void 0 ? void 0 : Type.caseSensitive) !== null && _b !== void 0 ? _b : false;
            const id = (_c = Type === null || Type === void 0 ? void 0 : Type.id) !== null && _c !== void 0 ? _c : (path instanceof Array ? path[0] : path);
            const title = (_d = Type === null || Type === void 0 ? void 0 : Type.title) !== null && _d !== void 0 ? _d : null;
            const reentryBehavior = (_e = Type === null || Type === void 0 ? void 0 : Type.transitionPlan) !== null && _e !== void 0 ? _e : defaultReentryBehavior;
            const viewport = (_f = Type === null || Type === void 0 ? void 0 : Type.viewport) !== null && _f !== void 0 ? _f : null;
            const data = (_g = Type === null || Type === void 0 ? void 0 : Type.data) !== null && _g !== void 0 ? _g : {};
            const children = (_h = Type === null || Type === void 0 ? void 0 : Type.routes) !== null && _h !== void 0 ? _h : noRoutes;
            return new RouteConfig(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, children);
        }
        else if (typeof configOrPath === 'object') {
            const config = configOrPath;
            validateRouteConfig(config, '');
            const path = (_k = (_j = config.path) !== null && _j !== void 0 ? _j : Type === null || Type === void 0 ? void 0 : Type.path) !== null && _k !== void 0 ? _k : null;
            const title = (_m = (_l = config.title) !== null && _l !== void 0 ? _l : Type === null || Type === void 0 ? void 0 : Type.title) !== null && _m !== void 0 ? _m : null;
            const redirectTo = (_p = (_o = config.redirectTo) !== null && _o !== void 0 ? _o : Type === null || Type === void 0 ? void 0 : Type.redirectTo) !== null && _p !== void 0 ? _p : null;
            const caseSensitive = (_r = (_q = config.caseSensitive) !== null && _q !== void 0 ? _q : Type === null || Type === void 0 ? void 0 : Type.caseSensitive) !== null && _r !== void 0 ? _r : false;
            const id = (_t = (_s = config.id) !== null && _s !== void 0 ? _s : Type === null || Type === void 0 ? void 0 : Type.id) !== null && _t !== void 0 ? _t : (path instanceof Array ? path[0] : path);
            const reentryBehavior = (_v = (_u = config.transitionPlan) !== null && _u !== void 0 ? _u : Type === null || Type === void 0 ? void 0 : Type.transitionPlan) !== null && _v !== void 0 ? _v : defaultReentryBehavior;
            const viewport = (_x = (_w = config.viewport) !== null && _w !== void 0 ? _w : Type === null || Type === void 0 ? void 0 : Type.viewport) !== null && _x !== void 0 ? _x : null;
            const data = {
                ...Type === null || Type === void 0 ? void 0 : Type.data,
                ...config.data,
            };
            const children = [
                ...((_y = config.routes) !== null && _y !== void 0 ? _y : noRoutes),
                ...((_z = Type === null || Type === void 0 ? void 0 : Type.routes) !== null && _z !== void 0 ? _z : noRoutes),
            ];
            return new RouteConfig(id, path, title, redirectTo, caseSensitive, reentryBehavior, viewport, data, children);
        }
        else {
            expectType('string, function/class or object', '', configOrPath);
        }
    }
    static configure(configOrPath, Type) {
        const config = RouteConfig.create(configOrPath, Type);
        Metadata.define(Route.name, config, Type);
        return Type;
    }
    static getConfig(Type) {
        if (!Metadata.hasOwn(Route.name, Type)) {
            // In the case of a type, this means there was no @route decorator on the class.
            // However there might still be static properties, and this API provides a unified way of accessing those.
            Route.configure({}, Type);
        }
        return Metadata.getOwn(Route.name, Type);
    }
    saveTo(Type) {
        Metadata.define(Route.name, this, Type);
    }
}
const Route = {
    name: Protocol.resource.keyFor('route'),
    /**
     * Returns `true` if the specified type has any static route configuration (either via static properties or a &#64;route decorator)
     */
    isConfigured(Type) {
        return Metadata.hasOwn(Route.name, Type);
    },
    /**
     * Apply the specified configuration to the specified type, overwriting any existing configuration.
     */
    configure(configOrPath, Type) {
        const config = RouteConfig.create(configOrPath, Type);
        Metadata.define(Route.name, config, Type);
        return Type;
    },
    /**
     * Get the `RouteConfig` associated with the specified type, creating a new one if it does not yet exist.
     */
    getConfig(Type) {
        if (!Route.isConfigured(Type)) {
            // This means there was no @route decorator on the class.
            // However there might still be static properties, and this API provides a unified way of accessing those.
            Route.configure({}, Type);
        }
        return Metadata.getOwn(Route.name, Type);
    },
};

class RouteDefinition {
    constructor(config, component) {
        var _a, _b, _c, _d, _e;
        this.config = config;
        this.component = component;
        this.hasExplicitPath = config.path !== null;
        this.caseSensitive = config.caseSensitive;
        this.path = ensureArrayOfStrings((_a = config.path) !== null && _a !== void 0 ? _a : component.name);
        this.redirectTo = (_b = config.redirectTo) !== null && _b !== void 0 ? _b : null;
        this.viewport = (_c = config.viewport) !== null && _c !== void 0 ? _c : 'default';
        this.id = ensureString((_d = config.id) !== null && _d !== void 0 ? _d : this.path);
        this.data = (_e = config.data) !== null && _e !== void 0 ? _e : {};
    }
    static resolve(routeable, context) {
        if (isPartialRedirectRouteConfig(routeable)) {
            return new RouteDefinition(routeable, null);
        }
        // Check if this component already has a `RouteDefinition` associated with it, where the `config` matches the `RouteConfig` that is currently associated with the type.
        // If a type is re-configured via `Route.configure`, that effectively invalidates any existing `RouteDefinition` and we re-create and associate it.
        // Note: RouteConfig is associated with Type, but RouteDefinition is associated with CustomElementDefinition.
        return onResolve(this.resolveCustomElementDefinition(routeable, context), def => {
            const config = isPartialChildRouteConfig(routeable)
                ? {
                    ...Route.getConfig(def.Type),
                    ...routeable
                }
                : Route.getConfig(def.Type);
            if (!Metadata.hasOwn(Route.name, def)) {
                const routeDefinition = new RouteDefinition(config, def);
                Metadata.define(Route.name, routeDefinition, def);
            }
            else {
                let routeDefinition = Metadata.getOwn(Route.name, def);
                if (routeDefinition.config !== config) {
                    routeDefinition = new RouteDefinition(config, def);
                    Metadata.define(Route.name, routeDefinition, def);
                }
            }
            return Metadata.getOwn(Route.name, def);
        });
    }
    static resolveCustomElementDefinition(routeable, context) {
        if (isPartialChildRouteConfig(routeable)) {
            return this.resolveCustomElementDefinition(routeable.component, context);
        }
        const typedInstruction = TypedNavigationInstruction.create(routeable);
        switch (typedInstruction.type) {
            case 0 /* string */: {
                if (context === void 0) {
                    throw new Error(`When retrieving the RouteDefinition for a component name, a RouteContext (that can resolve it) must be provided`);
                }
                const component = context.find(CustomElement, typedInstruction.value);
                if (component === null) {
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    throw new Error(`Could not find a CustomElement named '${typedInstruction.value}' in the current container scope of ${context}. This means the component is neither registered at Aurelia startup nor via the 'dependencies' decorator or static property.`);
                }
                return component;
            }
            case 2 /* CustomElementDefinition */:
                return typedInstruction.value;
            case 4 /* IRouteViewModel */:
                // Get the class from the constructor property. There might be static properties on it.
                return CustomElement.getDefinition(typedInstruction.value.constructor);
            case 3 /* Promise */:
                if (context === void 0) {
                    throw new Error(`RouteContext must be provided when resolving an imported module`);
                }
                return context.resolveLazy(typedInstruction.value);
        }
    }
    register(container) {
        var _a;
        (_a = this.component) === null || _a === void 0 ? void 0 : _a.register(container);
    }
    toUrlComponent() {
        return 'not-implemented'; // TODO
    }
    toString() {
        const path = this.config.path === null ? 'null' : `'${this.config.path}'`;
        if (this.component !== null) {
            return `RD(config.path:${path},c.name:'${this.component.name}')`;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            return `RD(config.path:${path},redirectTo:'${this.redirectTo}')`;
        }
    }
}

const componentAgentLookup = new WeakMap();
class ComponentAgent {
    constructor(instance, controller, definition, routeNode, ctx) {
        var _a, _b, _c, _d;
        this.instance = instance;
        this.controller = controller;
        this.definition = definition;
        this.routeNode = routeNode;
        this.ctx = ctx;
        this.logger = ctx.get(ILogger).scopeTo(`ComponentAgent<${ctx.friendlyPath}>`);
        this.logger.trace(`constructor()`);
        const lifecycleHooks = controller.lifecycleHooks;
        this.canLoadHooks = ((_a = lifecycleHooks.canLoad) !== null && _a !== void 0 ? _a : []).map(x => x.instance);
        this.loadHooks = ((_b = lifecycleHooks.load) !== null && _b !== void 0 ? _b : []).map(x => x.instance);
        this.canUnloadHooks = ((_c = lifecycleHooks.canUnload) !== null && _c !== void 0 ? _c : []).map(x => x.instance);
        this.unloadHooks = ((_d = lifecycleHooks.unload) !== null && _d !== void 0 ? _d : []).map(x => x.instance);
        this.hasCanLoad = 'canLoad' in instance;
        this.hasLoad = 'load' in instance;
        this.hasCanUnload = 'canUnload' in instance;
        this.hasUnload = 'unload' in instance;
    }
    static for(componentInstance, hostController, routeNode, ctx) {
        let componentAgent = componentAgentLookup.get(componentInstance);
        if (componentAgent === void 0) {
            const definition = RouteDefinition.resolve(componentInstance.constructor);
            const controller = Controller.forCustomElement(ctx.get(IAppRoot), ctx, componentInstance, hostController.host, null);
            componentAgentLookup.set(componentInstance, componentAgent = new ComponentAgent(componentInstance, controller, definition, routeNode, ctx));
        }
        return componentAgent;
    }
    activate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`activate() - initial`);
            return this.controller.activate(this.controller, parent, flags);
        }
        this.logger.trace(`activate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.activate(initiator, parent, flags);
    }
    deactivate(initiator, parent, flags) {
        if (initiator === null) {
            this.logger.trace(`deactivate() - initial`);
            return this.controller.deactivate(this.controller, parent, flags);
        }
        this.logger.trace(`deactivate()`);
        // Promise return values from user VM hooks are awaited by the initiator
        void this.controller.deactivate(initiator, parent, flags);
    }
    dispose() {
        this.logger.trace(`dispose()`);
        this.controller.dispose();
    }
    canUnload(tr, next, b) {
        this.logger.trace(`canUnload(next:%s) - invoking ${this.canUnloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canUnloadHooks) {
            tr.run(() => {
                b.push();
                return hook.canUnload(this.instance, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        if (this.hasCanUnload) {
            tr.run(() => {
                b.push();
                return this.instance.canUnload(next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = false;
                }
                b.pop();
            });
        }
        b.pop();
    }
    canLoad(tr, next, b) {
        this.logger.trace(`canLoad(next:%s) - invoking ${this.canLoadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.canLoadHooks) {
            tr.run(() => {
                b.push();
                return hook.canLoad(this.instance, next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        if (this.hasCanLoad) {
            tr.run(() => {
                b.push();
                return this.instance.canLoad(next.params, next, this.routeNode);
            }, ret => {
                if (tr.guardsResult === true && ret !== true) {
                    tr.guardsResult = ret === false ? false : ViewportInstructionTree.create(ret);
                }
                b.pop();
            });
        }
        b.pop();
    }
    unload(tr, next, b) {
        this.logger.trace(`unload(next:%s) - invoking ${this.unloadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.unloadHooks) {
            tr.run(() => {
                b.push();
                return hook.unload(this.instance, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasUnload) {
            tr.run(() => {
                b.push();
                return this.instance.unload(next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    load(tr, next, b) {
        this.logger.trace(`load(next:%s) - invoking ${this.loadHooks.length} hooks`, next);
        b.push();
        for (const hook of this.loadHooks) {
            tr.run(() => {
                b.push();
                return hook.load(this.instance, next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        if (this.hasLoad) {
            tr.run(() => {
                b.push();
                return this.instance.load(next.params, next, this.routeNode);
            }, () => {
                b.pop();
            });
        }
        b.pop();
    }
    toString() {
        return `CA(ctx:'${this.ctx.friendlyPath}',c:'${this.definition.component.name}')`;
    }
}

/* eslint-disable @typescript-eslint/restrict-template-expressions */
const IRouteContext = DI.createInterface('IRouteContext');
const RESIDUE = 'au$residue';
/**
 * Holds the information of a component in the context of a specific container. May or may not have statically configured routes.
 *
 * The `RouteContext` is cached using a 3-part composite key consisting of the CustomElementDefinition, the RouteDefinition and the RenderContext.
 *
 * This means there can be more than one `RouteContext` per component type if either:
 * - The `RouteDefinition` for a type is overridden manually via `Route.define`
 * - Different components (with different `RenderContext`s) reference the same component via a child route config
 */
class RouteContext {
    constructor(viewportAgent, parent, component, definition, parentContainer) {
        var _a;
        this.parent = parent;
        this.component = component;
        this.definition = definition;
        this.parentContainer = parentContainer;
        this.childViewportAgents = [];
        /**
         * The (fully resolved) configured child routes of this context's `RouteDefinition`
         */
        this.childRoutes = [];
        this._resolved = null;
        this._allResolved = null;
        this.prevNode = null;
        this._node = null;
        this._vpa = null;
        this._vpa = viewportAgent;
        if (parent === null) {
            this.root = this;
            this.path = [this];
            this.friendlyPath = component.name;
        }
        else {
            this.root = parent.root;
            this.path = [...parent.path, this];
            this.friendlyPath = `${parent.friendlyPath}/${component.name}`;
        }
        this.logger = parentContainer.get(ILogger).scopeTo(`RouteContext<${this.friendlyPath}>`);
        this.logger.trace('constructor()');
        this.moduleLoader = parentContainer.get(IModuleLoader);
        const container = this.container = parentContainer.createChild({ inheritParentResources: true });
        container.registerResolver(IController, this.hostControllerProvider = new InstanceProvider(), true);
        // We don't need to store it here but we use an InstanceProvider so that it can be disposed indirectly via the container.
        const contextProvider = new InstanceProvider();
        container.registerResolver(IRouteContext, contextProvider, true);
        contextProvider.prepare(this);
        container.register(definition);
        container.register(...component.dependencies);
        this.recognizer = new RouteRecognizer();
        const promises = [];
        const allPromises = [];
        for (const child of definition.config.routes) {
            if (child instanceof Promise) {
                const p = this.addRoute(child);
                promises.push(p);
                allPromises.push(p);
            }
            else {
                const routeDef = RouteDefinition.resolve(child, this);
                if (routeDef instanceof Promise) {
                    if (isPartialChildRouteConfig(child) && child.path != null) {
                        for (const path of ensureArrayOfStrings(child.path)) {
                            this.$addRoute(path, (_a = child.caseSensitive) !== null && _a !== void 0 ? _a : false, routeDef);
                        }
                        const idx = this.childRoutes.length;
                        const p = routeDef.then(resolvedRouteDef => {
                            return this.childRoutes[idx] = resolvedRouteDef;
                        });
                        this.childRoutes.push(p);
                        allPromises.push(p.then(noop));
                    }
                    else {
                        throw new Error(`Invalid route config. When the component property is a lazy import, the path must be specified. To use lazy loading without specifying the path (e.g. in direct routing), pass the import promise as a direct value to the routes array instead of providing it as the component property on an object literal.`);
                    }
                }
                else {
                    for (const path of routeDef.path) {
                        this.$addRoute(path, routeDef.caseSensitive, routeDef);
                    }
                    this.childRoutes.push(routeDef);
                }
            }
        }
        if (promises.length > 0) {
            this._resolved = Promise.all(promises).then(() => {
                this._resolved = null;
            });
        }
        if (allPromises.length > 0) {
            this._allResolved = Promise.all(allPromises).then(() => {
                this._allResolved = null;
            });
        }
    }
    get id() {
        return this.container.id;
    }
    get isRoot() {
        return this.parent === null;
    }
    get depth() {
        return this.path.length - 1;
    }
    /** @internal */
    get resolved() {
        return this._resolved;
    }
    /** @internal */
    get allResolved() {
        return this._allResolved;
    }
    get node() {
        const node = this._node;
        if (node === null) {
            throw new Error(`Invariant violation: RouteNode should be set immediately after the RouteContext is created. Context: ${this}`);
        }
        return node;
    }
    set node(value) {
        const prev = this.prevNode = this._node;
        if (prev !== value) {
            this._node = value;
            this.logger.trace(`Node changed from %s to %s`, this.prevNode, value);
        }
    }
    /**
     * The viewport hosting the component associated with this RouteContext.
     * The root RouteContext has no ViewportAgent and will throw when attempting to access this property.
     */
    get vpa() {
        const vpa = this._vpa;
        if (vpa === null) {
            throw new Error(`RouteContext has no ViewportAgent: ${this}`);
        }
        return vpa;
    }
    set vpa(value) {
        if (value === null || value === void 0) {
            throw new Error(`Cannot set ViewportAgent to ${value} for RouteContext: ${this}`);
        }
        const prev = this._vpa;
        if (prev !== value) {
            this._vpa = value;
            this.logger.trace(`ViewportAgent changed from %s to %s`, prev, value);
        }
    }
    /**
     * Create a new `RouteContext` and register it in the provided container.
     *
     * Uses the `RenderContext` of the registered `IAppRoot` as the root context.
     *
     * @param container - The container from which to resolve the `IAppRoot` and in which to register the `RouteContext`
     */
    static setRoot(container) {
        const logger = container.get(ILogger).scopeTo('RouteContext');
        if (!container.has(IAppRoot, true)) {
            logAndThrow(new Error(`The provided container has no registered IAppRoot. RouteContext.setRoot can only be used after Aurelia.app was called, on a container that is within that app's component tree.`), logger);
        }
        if (container.has(IRouteContext, true)) {
            logAndThrow(new Error(`A root RouteContext is already registered. A possible cause is the RouterConfiguration being registered more than once in the same container tree. If you have a multi-rooted app, make sure you register RouterConfiguration only in the "forked" containers and not in the common root.`), logger);
        }
        const { controller } = container.get(IAppRoot);
        if (controller === void 0) {
            logAndThrow(new Error(`The provided IAppRoot does not (yet) have a controller. A possible cause is calling this API manually before Aurelia.start() is called`), logger);
        }
        const router = container.get(IRouter);
        const routeContext = router.getRouteContext(null, controller.context.definition, controller.context);
        container.register(Registration.instance(IRouteContext, routeContext));
        routeContext.node = router.routeTree.root;
    }
    static resolve(root, context) {
        const logger = root.get(ILogger).scopeTo('RouteContext');
        if (context === null || context === void 0) {
            logger.trace(`resolve(context:%s) - returning root RouteContext`, context);
            return root;
        }
        if (isRouteContext(context)) {
            logger.trace(`resolve(context:%s) - returning provided RouteContext`, context);
            return context;
        }
        if (context instanceof root.get(IPlatform).Node) {
            try {
                // CustomElement.for can theoretically throw in (as of yet) unknown situations.
                // If that happens, we want to know about the situation and *not* just fall back to the root context, as that might make
                // some already convoluted issues impossible to troubleshoot.
                // That's why we catch, log and re-throw instead of just letting the error bubble up.
                // This also gives us a set point in the future to potentially handle supported scenarios where this could occur.
                const controller = CustomElement.for(context, { searchParents: true });
                logger.trace(`resolve(context:Node(nodeName:'${context.nodeName}'),controller:'${controller.context.definition.name}') - resolving RouteContext from controller's RenderContext`);
                return controller.context.get(IRouteContext);
            }
            catch (err) {
                logger.error(`Failed to resolve RouteContext from Node(nodeName:'${context.nodeName}')`, err);
                throw err;
            }
        }
        if (isCustomElementViewModel(context)) {
            const controller = context.$controller;
            logger.trace(`resolve(context:CustomElementViewModel(name:'${controller.context.definition.name}')) - resolving RouteContext from controller's RenderContext`);
            return controller.context.get(IRouteContext);
        }
        if (isCustomElementController(context)) {
            const controller = context;
            logger.trace(`resolve(context:CustomElementController(name:'${controller.context.definition.name}')) - resolving RouteContext from controller's RenderContext`);
            return controller.context.get(IRouteContext);
        }
        logAndThrow(new Error(`Invalid context type: ${Object.prototype.toString.call(context)}`), logger);
    }
    // #region IServiceLocator api
    has(key, searchAncestors) {
        // this.logger.trace(`has(key:${String(key)},searchAncestors:${searchAncestors})`);
        return this.container.has(key, searchAncestors);
    }
    get(key) {
        // this.logger.trace(`get(key:${String(key)})`);
        return this.container.get(key);
    }
    getAll(key) {
        // this.logger.trace(`getAll(key:${String(key)})`);
        return this.container.getAll(key);
    }
    // #endregion
    // #region IContainer api
    register(...params) {
        // this.logger.trace(`register(params:[${params.map(String).join(',')}])`);
        return this.container.register(...params);
    }
    registerResolver(key, resolver) {
        // this.logger.trace(`registerResolver(key:${String(key)})`);
        return this.container.registerResolver(key, resolver);
    }
    registerTransformer(key, transformer) {
        // this.logger.trace(`registerTransformer(key:${String(key)})`);
        return this.container.registerTransformer(key, transformer);
    }
    getResolver(key, autoRegister) {
        // this.logger.trace(`getResolver(key:${String(key)})`);
        return this.container.getResolver(key, autoRegister);
    }
    invoke(key, dynamicDependencies) {
        return this.container.invoke(key, dynamicDependencies);
    }
    getFactory(key) {
        // this.logger.trace(`getFactory(key:${String(key)})`);
        return this.container.getFactory(key);
    }
    registerFactory(key, factory) {
        // this.logger.trace(`registerFactory(key:${String(key)})`);
        this.container.registerFactory(key, factory);
    }
    createChild() {
        // this.logger.trace(`createChild()`);
        return this.container.createChild();
    }
    disposeResolvers() {
        // this.logger.trace(`disposeResolvers()`);
        this.container.disposeResolvers();
    }
    find(kind, name) {
        // this.logger.trace(`findResource(kind:${kind.name},name:'${name}')`);
        return this.container.find(kind, name);
    }
    create(kind, name) {
        // this.logger.trace(`createResource(kind:${kind.name},name:'${name}')`);
        return this.container.create(kind, name);
    }
    dispose() {
        this.container.dispose();
    }
    // #endregion
    resolveViewportAgent(req) {
        this.logger.trace(`resolveViewportAgent(req:%s)`, req);
        const agent = this.childViewportAgents.find(x => { return x.handles(req); });
        if (agent === void 0) {
            throw new Error(`Failed to resolve ${req} at:\n${this.printTree()}`);
        }
        return agent;
    }
    getAvailableViewportAgents(resolution) {
        return this.childViewportAgents.filter(x => x.isAvailable(resolution));
    }
    getFallbackViewportAgent(resolution, name) {
        var _a;
        return (_a = this.childViewportAgents.find(x => x.isAvailable(resolution) && x.viewport.name === name && x.viewport.fallback.length > 0)) !== null && _a !== void 0 ? _a : null;
    }
    /**
     * Create a component based on the provided viewportInstruction.
     *
     * @param hostController - The `ICustomElementController` whose component (typically `au-viewport`) will host this component.
     * @param routeNode - The routeNode that describes the component + state.
     */
    createComponentAgent(hostController, routeNode) {
        this.logger.trace(`createComponentAgent(routeNode:%s)`, routeNode);
        this.hostControllerProvider.prepare(hostController);
        const routeDefinition = RouteDefinition.resolve(routeNode.component);
        const componentInstance = this.container.get(routeDefinition.component.key);
        const componentAgent = ComponentAgent.for(componentInstance, hostController, routeNode, this);
        this.hostControllerProvider.dispose();
        return componentAgent;
    }
    registerViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (this.childViewportAgents.includes(agent)) {
            this.logger.trace(`registerViewport(agent:%s) -> already registered, so skipping`, agent);
        }
        else {
            this.logger.trace(`registerViewport(agent:%s) -> adding`, agent);
            this.childViewportAgents.push(agent);
        }
        return agent;
    }
    unregisterViewport(viewport) {
        const agent = ViewportAgent.for(viewport, this);
        if (this.childViewportAgents.includes(agent)) {
            this.logger.trace(`unregisterViewport(agent:%s) -> unregistering`, agent);
            this.childViewportAgents.splice(this.childViewportAgents.indexOf(agent), 1);
        }
        else {
            this.logger.trace(`unregisterViewport(agent:%s) -> not registered, so skipping`, agent);
        }
    }
    recognize(path) {
        var _a;
        this.logger.trace(`recognize(path:'${path}')`);
        const result = this.recognizer.recognize(path);
        if (result === null) {
            return null;
        }
        let residue;
        if (Reflect.has(result.params, RESIDUE)) {
            residue = (_a = result.params[RESIDUE]) !== null && _a !== void 0 ? _a : null;
            Reflect.deleteProperty(result.params, RESIDUE);
        }
        else {
            residue = null;
        }
        return new $RecognizedRoute(result, residue);
    }
    addRoute(routeable) {
        this.logger.trace(`addRoute(routeable:'${routeable}')`);
        return onResolve(RouteDefinition.resolve(routeable, this), routeDef => {
            for (const path of routeDef.path) {
                this.$addRoute(path, routeDef.caseSensitive, routeDef);
            }
            this.childRoutes.push(routeDef);
        });
    }
    $addRoute(path, caseSensitive, handler) {
        this.recognizer.add({
            path,
            caseSensitive,
            handler,
        });
        this.recognizer.add({
            path: `${path}/*${RESIDUE}`,
            caseSensitive,
            handler,
        });
    }
    resolveLazy(promise) {
        return this.moduleLoader.load(promise, m => {
            let defaultExport = void 0;
            let firstNonDefaultExport = void 0;
            for (const item of m.items) {
                if (item.isConstructable) {
                    const def = item.definitions.find(isCustomElementDefinition);
                    if (def !== void 0) {
                        if (item.key === 'default') {
                            defaultExport = def;
                        }
                        else if (firstNonDefaultExport === void 0) {
                            firstNonDefaultExport = def;
                        }
                    }
                }
            }
            if (defaultExport === void 0) {
                if (firstNonDefaultExport === void 0) {
                    // TODO: make error more accurate and add potential causes/solutions
                    throw new Error(`${promise} does not appear to be a component or CustomElement recognizable by Aurelia`);
                }
                return firstNonDefaultExport;
            }
            return defaultExport;
        });
    }
    toString() {
        const vpAgents = this.childViewportAgents;
        const viewports = vpAgents.map(String).join(',');
        return `RC(path:'${this.friendlyPath}',viewports:[${viewports}])`;
    }
    printTree() {
        const tree = [];
        for (let i = 0; i < this.path.length; ++i) {
            tree.push(`${' '.repeat(i)}${this.path[i]}`);
        }
        return tree.join('\n');
    }
}
function isRouteContext(value) {
    return value instanceof RouteContext;
}
function logAndThrow(err, logger) {
    logger.error(err);
    throw err;
}
function isCustomElementDefinition(value) {
    return CustomElement.isType(value.Type);
}
class $RecognizedRoute {
    constructor(route, residue) {
        this.route = route;
        this.residue = residue;
    }
}

var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$2 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let ViewportCustomElement = class ViewportCustomElement {
    constructor(logger, ctx) {
        this.logger = logger;
        this.ctx = ctx;
        this.name = 'default';
        this.usedBy = '';
        this.default = '';
        this.fallback = '';
        this.noScope = false;
        this.noLink = false;
        this.noHistory = false;
        this.stateful = false;
        this.agent = (void 0);
        this.controller = (void 0);
        this.logger = logger.scopeTo(`au-viewport<${ctx.friendlyPath}>`);
        this.logger.trace('constructor()');
    }
    hydrated(controller) {
        this.logger.trace('hydrated()');
        this.controller = controller;
        this.agent = this.ctx.registerViewport(this);
    }
    attaching(initiator, parent, flags) {
        this.logger.trace('attaching()');
        return this.agent.activateFromViewport(initiator, this.controller, flags);
    }
    detaching(initiator, parent, flags) {
        this.logger.trace('detaching()');
        return this.agent.deactivateFromViewport(initiator, this.controller, flags);
    }
    dispose() {
        this.logger.trace('dispose()');
        this.ctx.unregisterViewport(this);
        this.agent.dispose();
        this.agent = (void 0);
    }
    toString() {
        const propStrings = [];
        for (const prop of props) {
            const value = this[prop];
            // Only report props that don't have default values (but always report name)
            // This is a bit naive and dirty right now, but it's mostly for debugging purposes anyway. Can clean up later. Maybe put it in a serializer
            switch (typeof value) {
                case 'string':
                    if (value !== '') {
                        propStrings.push(`${prop}:'${value}'`);
                    }
                    break;
                case 'boolean':
                    if (value) {
                        propStrings.push(`${prop}:${value}`);
                    }
                    break;
                default: {
                    propStrings.push(`${prop}:${String(value)}`);
                }
            }
        }
        return `VP(ctx:'${this.ctx.friendlyPath}',${propStrings.join(',')})`;
    }
};
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "name", void 0);
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "usedBy", void 0);
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "default", void 0);
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "fallback", void 0);
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "noScope", void 0);
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "noLink", void 0);
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "noHistory", void 0);
__decorate$2([
    bindable
], ViewportCustomElement.prototype, "stateful", void 0);
ViewportCustomElement = __decorate$2([
    customElement({ name: 'au-viewport' }),
    __param$2(0, ILogger),
    __param$2(1, IRouteContext)
], ViewportCustomElement);
const props = [
    'name',
    'usedBy',
    'default',
    'fallback',
    'noScope',
    'noLink',
    'noHistory',
    'stateful',
];

var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param$1 = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let LoadCustomAttribute = class LoadCustomAttribute {
    constructor(target, el, router, events, delegator, ctx) {
        this.target = target;
        this.el = el;
        this.router = router;
        this.events = events;
        this.delegator = delegator;
        this.ctx = ctx;
        this.attribute = 'href';
        this.active = false;
        this.href = null;
        this.instructions = null;
        this.eventListener = null;
        this.navigationEndListener = null;
        this.onClick = (e) => {
            if (this.instructions === null) {
                return;
            }
            // Ensure this is an ordinary left-button click.
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
                return;
            }
            e.preventDefault();
            // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
            void this.router.load(this.instructions, { context: this.ctx });
        };
        // Ensure the element is not explicitly marked as external.
        this.isEnabled = !el.hasAttribute('external') && !el.hasAttribute('data-external');
    }
    binding() {
        if (this.isEnabled) {
            this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick);
        }
        this.valueChanged();
        this.navigationEndListener = this.events.subscribe('au:router:navigation-end', _e => {
            this.valueChanged();
            this.active = this.instructions !== null && this.router.isActive(this.instructions, this.ctx);
        });
    }
    attaching() {
        if (this.ctx.allResolved !== null) {
            return this.ctx.allResolved.then(() => {
                this.valueChanged();
            });
        }
    }
    unbinding() {
        if (this.isEnabled) {
            this.eventListener.dispose();
        }
        this.navigationEndListener.dispose();
    }
    valueChanged() {
        if (this.route !== null && this.route !== void 0 && this.ctx.allResolved === null) {
            const def = this.ctx.childRoutes.find(x => x.id === this.route);
            if (def !== void 0) {
                // TODO(fkleuver): massive temporary hack. Will not work for siblings etc. Need to fix.
                const parentPath = this.ctx.node.computeAbsolutePath();
                // Note: This is very much preliminary just to fill the feature gap of v1's `generate`. It probably misses a few edge cases.
                // TODO(fkleuver): move this logic to RouteExpression and expose via public api, add tests etc
                let path = def.path[0];
                if (typeof this.params === 'object' && this.params !== null) {
                    const keys = Object.keys(this.params);
                    for (const key of keys) {
                        const value = this.params[key];
                        if (value != null && String(value).length > 0) {
                            path = path.replace(new RegExp(`[*:]${key}[?]?`), value);
                        }
                    }
                }
                // Remove leading and trailing optional param parts
                path = path.replace(/\/[*:][^/]+[?]/g, '').replace(/[*:][^/]+[?]\//g, '');
                if (parentPath) {
                    if (path) {
                        this.href = [parentPath, path].join('/');
                    }
                    else {
                        this.href = parentPath;
                    }
                }
                else {
                    this.href = path;
                }
                this.instructions = this.router.createViewportInstructions(path, { context: this.ctx });
            }
            else {
                if (typeof this.params === 'object' && this.params !== null) {
                    this.instructions = this.router.createViewportInstructions({ component: this.route, params: this.params }, { context: this.ctx });
                }
                else {
                    this.instructions = this.router.createViewportInstructions(this.route, { context: this.ctx });
                }
                this.href = this.instructions.toUrl();
            }
        }
        else {
            this.instructions = null;
            this.href = null;
        }
        const controller = CustomElement.for(this.el, { optional: true });
        if (controller !== null) {
            controller.viewModel[this.attribute] = this.instructions;
        }
        else {
            if (this.href === null) {
                this.el.removeAttribute(this.attribute);
            }
            else {
                this.el.setAttribute(this.attribute, this.href);
            }
        }
    }
};
__decorate$1([
    bindable({ mode: BindingMode.toView, primary: true, callback: 'valueChanged' })
], LoadCustomAttribute.prototype, "route", void 0);
__decorate$1([
    bindable({ mode: BindingMode.toView, callback: 'valueChanged' })
], LoadCustomAttribute.prototype, "params", void 0);
__decorate$1([
    bindable({ mode: BindingMode.toView })
], LoadCustomAttribute.prototype, "attribute", void 0);
__decorate$1([
    bindable({ mode: BindingMode.fromView })
], LoadCustomAttribute.prototype, "active", void 0);
LoadCustomAttribute = __decorate$1([
    customAttribute('load'),
    __param$1(0, IEventTarget),
    __param$1(1, INode),
    __param$1(2, IRouter),
    __param$1(3, IRouterEvents),
    __param$1(4, IEventDelegator),
    __param$1(5, IRouteContext)
], LoadCustomAttribute);

var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (undefined && undefined.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
let HrefCustomAttribute = class HrefCustomAttribute {
    constructor(target, el, router, delegator, ctx, w) {
        this.target = target;
        this.el = el;
        this.router = router;
        this.delegator = delegator;
        this.ctx = ctx;
        this.eventListener = null;
        this.isInitialized = false;
        this.onClick = (e) => {
            // Ensure this is an ordinary left-button click.
            if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey || e.button !== 0) {
                return;
            }
            // Use the normalized attribute instead of this.value to ensure consistency.
            const href = this.el.getAttribute('href');
            if (href !== null) {
                e.preventDefault();
                // Floating promises from `Router#load` are ok because the router keeps track of state and handles the errors, etc.
                void this.router.load(href, { context: this.ctx });
            }
        };
        if (router.options.useHref &&
            // Ensure the element is an anchor
            el.nodeName === 'A' &&
            // Ensure the anchor is not explicitly marked as external.
            !el.hasAttribute('external') &&
            !el.hasAttribute('data-external')) {
            // Ensure the anchor targets the current window.
            switch (el.getAttribute('target')) {
                case null:
                case w.name:
                case '_self':
                    this.isEnabled = true;
                    break;
                default:
                    this.isEnabled = false;
                    break;
            }
        }
        else {
            this.isEnabled = false;
        }
    }
    binding() {
        if (!this.isInitialized) {
            this.isInitialized = true;
            this.isEnabled = this.isEnabled && getRef(this.el, CustomAttribute.getDefinition(LoadCustomAttribute).key) === null;
        }
        if (this.isEnabled) {
            this.el.setAttribute('href', this.value);
            this.eventListener = this.delegator.addEventListener(this.target, this.el, 'click', this.onClick);
        }
    }
    unbinding() {
        if (this.isEnabled) {
            this.eventListener.dispose();
        }
    }
    valueChanged(newValue) {
        this.el.setAttribute('href', newValue);
    }
};
__decorate([
    bindable({ mode: BindingMode.toView })
], HrefCustomAttribute.prototype, "value", void 0);
HrefCustomAttribute = __decorate([
    customAttribute({ name: 'href', noMultiBindings: true }),
    __param(0, IEventTarget),
    __param(1, INode),
    __param(2, IRouter),
    __param(3, IEventDelegator),
    __param(4, IRouteContext),
    __param(5, IWindow)
], HrefCustomAttribute);

class ScrollState {
    constructor(el) {
        this.el = el;
        this.top = el.scrollTop;
        this.left = el.scrollLeft;
    }
    static has(el) {
        return el.scrollTop > 0 || el.scrollLeft > 0;
    }
    restore() {
        this.el.scrollTo(this.left, this.top);
        this.el = null;
    }
}
function restoreState(state) {
    state.restore();
}
class HostElementState {
    constructor(host) {
        this.scrollStates = [];
        this.save(host.children);
    }
    save(elements) {
        let el;
        for (let i = 0, ii = elements.length; i < ii; ++i) {
            el = elements[i];
            if (ScrollState.has(el)) {
                this.scrollStates.push(new ScrollState(el));
            }
            this.save(el.children);
        }
    }
    restore() {
        this.scrollStates.forEach(restoreState);
        this.scrollStates = null;
    }
}
DI.createInterface('IStateManager', x => x.singleton(ScrollStateManager));
class ScrollStateManager {
    constructor() {
        this.cache = new WeakMap();
    }
    saveState(controller) {
        this.cache.set(controller.host, new HostElementState(controller.host));
    }
    restoreState(controller) {
        const state = this.cache.get(controller.host);
        if (state !== void 0) {
            state.restore();
            this.cache.delete(controller.host);
        }
    }
}

const PLATFORM = BrowserPlatform.getOrCreate(globalThis);
function createContainer() {
    return DI.createContainer()
        .register(Registration.instance(IPlatform, PLATFORM), StandardConfiguration);
}
class Aurelia extends Aurelia$1 {
    constructor(container = createContainer()) {
        super(container);
    }
    static start(root) {
        return new Aurelia().start(root);
    }
    static app(config) {
        return new Aurelia().app(config);
    }
    static enhance(config) {
        return new Aurelia().enhance(config);
    }
    static register(...params) {
        return new Aurelia().register(...params);
    }
    app(config) {
        if (CustomElement.isType(config)) {
            // Default to custom element element name
            const definition = CustomElement.getDefinition(config);
            let host = document.querySelector(definition.name);
            if (host === null) {
                // When no target is found, default to body.
                // For example, when user forgot to write <my-app></my-app> in html.
                host = document.body;
            }
            return super.app({
                host: host,
                component: config
            });
        }
        return super.app(config);
    }
}

export { Aurelia, customElement };
