/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.exonum = (function() {
    
        /**
         * Namespace exonum.
         * @exports exonum
         * @namespace
         */
        var exonum = {};
    
        exonum.Hash = (function() {
    
            /**
             * Properties of a Hash.
             * @memberof exonum
             * @interface IHash
             * @property {Uint8Array|null} [data] Hash data
             */
    
            /**
             * Constructs a new Hash.
             * @memberof exonum
             * @classdesc Represents a Hash.
             * @implements IHash
             * @constructor
             * @param {exonum.IHash=} [properties] Properties to set
             */
            function Hash(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Hash data.
             * @member {Uint8Array} data
             * @memberof exonum.Hash
             * @instance
             */
            Hash.prototype.data = $util.newBuffer([]);
    
            /**
             * Creates a new Hash instance using the specified properties.
             * @function create
             * @memberof exonum.Hash
             * @static
             * @param {exonum.IHash=} [properties] Properties to set
             * @returns {exonum.Hash} Hash instance
             */
            Hash.create = function create(properties) {
                return new Hash(properties);
            };
    
            /**
             * Encodes the specified Hash message. Does not implicitly {@link exonum.Hash.verify|verify} messages.
             * @function encode
             * @memberof exonum.Hash
             * @static
             * @param {exonum.IHash} message Hash message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Hash.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.hasOwnProperty("data"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                return writer;
            };
    
            /**
             * Encodes the specified Hash message, length delimited. Does not implicitly {@link exonum.Hash.verify|verify} messages.
             * @function encodeDelimited
             * @memberof exonum.Hash
             * @static
             * @param {exonum.IHash} message Hash message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Hash.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Hash message from the specified reader or buffer.
             * @function decode
             * @memberof exonum.Hash
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {exonum.Hash} Hash
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Hash.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.exonum.Hash();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.data = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Hash message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof exonum.Hash
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {exonum.Hash} Hash
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Hash.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Hash message.
             * @function verify
             * @memberof exonum.Hash
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Hash.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };
    
            /**
             * Creates a Hash message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof exonum.Hash
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {exonum.Hash} Hash
             */
            Hash.fromObject = function fromObject(object) {
                if (object instanceof $root.exonum.Hash)
                    return object;
                var message = new $root.exonum.Hash();
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length)
                        message.data = object.data;
                return message;
            };
    
            /**
             * Creates a plain object from a Hash message. Also converts values to other types if specified.
             * @function toObject
             * @memberof exonum.Hash
             * @static
             * @param {exonum.Hash} message Hash
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Hash.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                return object;
            };
    
            /**
             * Converts this Hash to JSON.
             * @function toJSON
             * @memberof exonum.Hash
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Hash.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Hash;
        })();
    
        exonum.PublicKey = (function() {
    
            /**
             * Properties of a PublicKey.
             * @memberof exonum
             * @interface IPublicKey
             * @property {Uint8Array|null} [data] PublicKey data
             */
    
            /**
             * Constructs a new PublicKey.
             * @memberof exonum
             * @classdesc Represents a PublicKey.
             * @implements IPublicKey
             * @constructor
             * @param {exonum.IPublicKey=} [properties] Properties to set
             */
            function PublicKey(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * PublicKey data.
             * @member {Uint8Array} data
             * @memberof exonum.PublicKey
             * @instance
             */
            PublicKey.prototype.data = $util.newBuffer([]);
    
            /**
             * Creates a new PublicKey instance using the specified properties.
             * @function create
             * @memberof exonum.PublicKey
             * @static
             * @param {exonum.IPublicKey=} [properties] Properties to set
             * @returns {exonum.PublicKey} PublicKey instance
             */
            PublicKey.create = function create(properties) {
                return new PublicKey(properties);
            };
    
            /**
             * Encodes the specified PublicKey message. Does not implicitly {@link exonum.PublicKey.verify|verify} messages.
             * @function encode
             * @memberof exonum.PublicKey
             * @static
             * @param {exonum.IPublicKey} message PublicKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PublicKey.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.hasOwnProperty("data"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                return writer;
            };
    
            /**
             * Encodes the specified PublicKey message, length delimited. Does not implicitly {@link exonum.PublicKey.verify|verify} messages.
             * @function encodeDelimited
             * @memberof exonum.PublicKey
             * @static
             * @param {exonum.IPublicKey} message PublicKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PublicKey.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a PublicKey message from the specified reader or buffer.
             * @function decode
             * @memberof exonum.PublicKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {exonum.PublicKey} PublicKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PublicKey.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.exonum.PublicKey();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.data = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a PublicKey message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof exonum.PublicKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {exonum.PublicKey} PublicKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PublicKey.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a PublicKey message.
             * @function verify
             * @memberof exonum.PublicKey
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            PublicKey.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };
    
            /**
             * Creates a PublicKey message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof exonum.PublicKey
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {exonum.PublicKey} PublicKey
             */
            PublicKey.fromObject = function fromObject(object) {
                if (object instanceof $root.exonum.PublicKey)
                    return object;
                var message = new $root.exonum.PublicKey();
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length)
                        message.data = object.data;
                return message;
            };
    
            /**
             * Creates a plain object from a PublicKey message. Also converts values to other types if specified.
             * @function toObject
             * @memberof exonum.PublicKey
             * @static
             * @param {exonum.PublicKey} message PublicKey
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            PublicKey.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                return object;
            };
    
            /**
             * Converts this PublicKey to JSON.
             * @function toJSON
             * @memberof exonum.PublicKey
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            PublicKey.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return PublicKey;
        })();
    
        exonum.BitVec = (function() {
    
            /**
             * Properties of a BitVec.
             * @memberof exonum
             * @interface IBitVec
             * @property {Uint8Array|null} [data] BitVec data
             * @property {number|Long|null} [len] BitVec len
             */
    
            /**
             * Constructs a new BitVec.
             * @memberof exonum
             * @classdesc Represents a BitVec.
             * @implements IBitVec
             * @constructor
             * @param {exonum.IBitVec=} [properties] Properties to set
             */
            function BitVec(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * BitVec data.
             * @member {Uint8Array} data
             * @memberof exonum.BitVec
             * @instance
             */
            BitVec.prototype.data = $util.newBuffer([]);
    
            /**
             * BitVec len.
             * @member {number|Long} len
             * @memberof exonum.BitVec
             * @instance
             */
            BitVec.prototype.len = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new BitVec instance using the specified properties.
             * @function create
             * @memberof exonum.BitVec
             * @static
             * @param {exonum.IBitVec=} [properties] Properties to set
             * @returns {exonum.BitVec} BitVec instance
             */
            BitVec.create = function create(properties) {
                return new BitVec(properties);
            };
    
            /**
             * Encodes the specified BitVec message. Does not implicitly {@link exonum.BitVec.verify|verify} messages.
             * @function encode
             * @memberof exonum.BitVec
             * @static
             * @param {exonum.IBitVec} message BitVec message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BitVec.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.hasOwnProperty("data"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                if (message.len != null && message.hasOwnProperty("len"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.len);
                return writer;
            };
    
            /**
             * Encodes the specified BitVec message, length delimited. Does not implicitly {@link exonum.BitVec.verify|verify} messages.
             * @function encodeDelimited
             * @memberof exonum.BitVec
             * @static
             * @param {exonum.IBitVec} message BitVec message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BitVec.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a BitVec message from the specified reader or buffer.
             * @function decode
             * @memberof exonum.BitVec
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {exonum.BitVec} BitVec
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BitVec.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.exonum.BitVec();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.data = reader.bytes();
                        break;
                    case 2:
                        message.len = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a BitVec message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof exonum.BitVec
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {exonum.BitVec} BitVec
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BitVec.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a BitVec message.
             * @function verify
             * @memberof exonum.BitVec
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            BitVec.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                if (message.len != null && message.hasOwnProperty("len"))
                    if (!$util.isInteger(message.len) && !(message.len && $util.isInteger(message.len.low) && $util.isInteger(message.len.high)))
                        return "len: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a BitVec message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof exonum.BitVec
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {exonum.BitVec} BitVec
             */
            BitVec.fromObject = function fromObject(object) {
                if (object instanceof $root.exonum.BitVec)
                    return object;
                var message = new $root.exonum.BitVec();
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length)
                        message.data = object.data;
                if (object.len != null)
                    if ($util.Long)
                        (message.len = $util.Long.fromValue(object.len)).unsigned = true;
                    else if (typeof object.len === "string")
                        message.len = parseInt(object.len, 10);
                    else if (typeof object.len === "number")
                        message.len = object.len;
                    else if (typeof object.len === "object")
                        message.len = new $util.LongBits(object.len.low >>> 0, object.len.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a BitVec message. Also converts values to other types if specified.
             * @function toObject
             * @memberof exonum.BitVec
             * @static
             * @param {exonum.BitVec} message BitVec
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            BitVec.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.len = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.len = options.longs === String ? "0" : 0;
                }
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                if (message.len != null && message.hasOwnProperty("len"))
                    if (typeof message.len === "number")
                        object.len = options.longs === String ? String(message.len) : message.len;
                    else
                        object.len = options.longs === String ? $util.Long.prototype.toString.call(message.len) : options.longs === Number ? new $util.LongBits(message.len.low >>> 0, message.len.high >>> 0).toNumber(true) : message.len;
                return object;
            };
    
            /**
             * Converts this BitVec to JSON.
             * @function toJSON
             * @memberof exonum.BitVec
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BitVec.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return BitVec;
        })();
    
        return exonum;
    })();
    
    $root.votings_service = (function() {
    
        /**
         * Namespace votings_service.
         * @exports votings_service
         * @namespace
         */
        var votings_service = {};
    
        /**
         * VotingState enum.
         * @name votings_service.VotingState
         * @enum {string}
         * @property {number} Registration=0 Registration value
         * @property {number} InProcess=1 InProcess value
         * @property {number} Stopped=2 Stopped value
         * @property {number} Finished=3 Finished value
         */
        votings_service.VotingState = (function() {
            var valuesById = {}, values = Object.create(valuesById);
            values[valuesById[0] = "Registration"] = 0;
            values[valuesById[1] = "InProcess"] = 1;
            values[valuesById[2] = "Stopped"] = 2;
            values[valuesById[3] = "Finished"] = 3;
            return values;
        })();
    
        votings_service.CryptoSystemSettings = (function() {
    
            /**
             * Properties of a CryptoSystemSettings.
             * @memberof votings_service
             * @interface ICryptoSystemSettings
             * @property {votings_service.ISealedBoxPublicKey|null} [public_key] CryptoSystemSettings public_key
             * @property {votings_service.ISealedBoxSecretKey|null} [private_key] CryptoSystemSettings private_key
             */
    
            /**
             * Constructs a new CryptoSystemSettings.
             * @memberof votings_service
             * @classdesc Represents a CryptoSystemSettings.
             * @implements ICryptoSystemSettings
             * @constructor
             * @param {votings_service.ICryptoSystemSettings=} [properties] Properties to set
             */
            function CryptoSystemSettings(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * CryptoSystemSettings public_key.
             * @member {votings_service.ISealedBoxPublicKey|null|undefined} public_key
             * @memberof votings_service.CryptoSystemSettings
             * @instance
             */
            CryptoSystemSettings.prototype.public_key = null;
    
            /**
             * CryptoSystemSettings private_key.
             * @member {votings_service.ISealedBoxSecretKey|null|undefined} private_key
             * @memberof votings_service.CryptoSystemSettings
             * @instance
             */
            CryptoSystemSettings.prototype.private_key = null;
    
            /**
             * Creates a new CryptoSystemSettings instance using the specified properties.
             * @function create
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {votings_service.ICryptoSystemSettings=} [properties] Properties to set
             * @returns {votings_service.CryptoSystemSettings} CryptoSystemSettings instance
             */
            CryptoSystemSettings.create = function create(properties) {
                return new CryptoSystemSettings(properties);
            };
    
            /**
             * Encodes the specified CryptoSystemSettings message. Does not implicitly {@link votings_service.CryptoSystemSettings.verify|verify} messages.
             * @function encode
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {votings_service.ICryptoSystemSettings} message CryptoSystemSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CryptoSystemSettings.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    $root.votings_service.SealedBoxPublicKey.encode(message.public_key, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.private_key != null && message.hasOwnProperty("private_key"))
                    $root.votings_service.SealedBoxSecretKey.encode(message.private_key, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified CryptoSystemSettings message, length delimited. Does not implicitly {@link votings_service.CryptoSystemSettings.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {votings_service.ICryptoSystemSettings} message CryptoSystemSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CryptoSystemSettings.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a CryptoSystemSettings message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.CryptoSystemSettings} CryptoSystemSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CryptoSystemSettings.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.CryptoSystemSettings();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.public_key = $root.votings_service.SealedBoxPublicKey.decode(reader, reader.uint32());
                        break;
                    case 2:
                        message.private_key = $root.votings_service.SealedBoxSecretKey.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a CryptoSystemSettings message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.CryptoSystemSettings} CryptoSystemSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CryptoSystemSettings.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a CryptoSystemSettings message.
             * @function verify
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CryptoSystemSettings.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.public_key != null && message.hasOwnProperty("public_key")) {
                    var error = $root.votings_service.SealedBoxPublicKey.verify(message.public_key);
                    if (error)
                        return "public_key." + error;
                }
                if (message.private_key != null && message.hasOwnProperty("private_key")) {
                    var error = $root.votings_service.SealedBoxSecretKey.verify(message.private_key);
                    if (error)
                        return "private_key." + error;
                }
                return null;
            };
    
            /**
             * Creates a CryptoSystemSettings message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.CryptoSystemSettings} CryptoSystemSettings
             */
            CryptoSystemSettings.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.CryptoSystemSettings)
                    return object;
                var message = new $root.votings_service.CryptoSystemSettings();
                if (object.public_key != null) {
                    if (typeof object.public_key !== "object")
                        throw TypeError(".votings_service.CryptoSystemSettings.public_key: object expected");
                    message.public_key = $root.votings_service.SealedBoxPublicKey.fromObject(object.public_key);
                }
                if (object.private_key != null) {
                    if (typeof object.private_key !== "object")
                        throw TypeError(".votings_service.CryptoSystemSettings.private_key: object expected");
                    message.private_key = $root.votings_service.SealedBoxSecretKey.fromObject(object.private_key);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a CryptoSystemSettings message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.CryptoSystemSettings
             * @static
             * @param {votings_service.CryptoSystemSettings} message CryptoSystemSettings
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CryptoSystemSettings.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.public_key = null;
                    object.private_key = null;
                }
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    object.public_key = $root.votings_service.SealedBoxPublicKey.toObject(message.public_key, options);
                if (message.private_key != null && message.hasOwnProperty("private_key"))
                    object.private_key = $root.votings_service.SealedBoxSecretKey.toObject(message.private_key, options);
                return object;
            };
    
            /**
             * Converts this CryptoSystemSettings to JSON.
             * @function toJSON
             * @memberof votings_service.CryptoSystemSettings
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CryptoSystemSettings.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return CryptoSystemSettings;
        })();
    
        votings_service.BallotConfig = (function() {
    
            /**
             * Properties of a BallotConfig.
             * @memberof votings_service
             * @interface IBallotConfig
             * @property {number|null} [district_id] BallotConfig district_id
             * @property {string|null} [question] BallotConfig question
             * @property {Object.<string,string>|null} [options] BallotConfig options
             * @property {number|null} [min_choices] BallotConfig min_choices
             * @property {number|null} [max_choices] BallotConfig max_choices
             */
    
            /**
             * Constructs a new BallotConfig.
             * @memberof votings_service
             * @classdesc Represents a BallotConfig.
             * @implements IBallotConfig
             * @constructor
             * @param {votings_service.IBallotConfig=} [properties] Properties to set
             */
            function BallotConfig(properties) {
                this.options = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * BallotConfig district_id.
             * @member {number} district_id
             * @memberof votings_service.BallotConfig
             * @instance
             */
            BallotConfig.prototype.district_id = 0;
    
            /**
             * BallotConfig question.
             * @member {string} question
             * @memberof votings_service.BallotConfig
             * @instance
             */
            BallotConfig.prototype.question = "";
    
            /**
             * BallotConfig options.
             * @member {Object.<string,string>} options
             * @memberof votings_service.BallotConfig
             * @instance
             */
            BallotConfig.prototype.options = $util.emptyObject;
    
            /**
             * BallotConfig min_choices.
             * @member {number} min_choices
             * @memberof votings_service.BallotConfig
             * @instance
             */
            BallotConfig.prototype.min_choices = 0;
    
            /**
             * BallotConfig max_choices.
             * @member {number} max_choices
             * @memberof votings_service.BallotConfig
             * @instance
             */
            BallotConfig.prototype.max_choices = 0;
    
            /**
             * Creates a new BallotConfig instance using the specified properties.
             * @function create
             * @memberof votings_service.BallotConfig
             * @static
             * @param {votings_service.IBallotConfig=} [properties] Properties to set
             * @returns {votings_service.BallotConfig} BallotConfig instance
             */
            BallotConfig.create = function create(properties) {
                return new BallotConfig(properties);
            };
    
            /**
             * Encodes the specified BallotConfig message. Does not implicitly {@link votings_service.BallotConfig.verify|verify} messages.
             * @function encode
             * @memberof votings_service.BallotConfig
             * @static
             * @param {votings_service.IBallotConfig} message BallotConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BallotConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.district_id);
                if (message.question != null && message.hasOwnProperty("question"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.question);
                if (message.options != null && message.hasOwnProperty("options"))
                    for (var keys = Object.keys(message.options), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 0 =*/8).uint32(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.options[keys[i]]).ldelim();
                if (message.min_choices != null && message.hasOwnProperty("min_choices"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.min_choices);
                if (message.max_choices != null && message.hasOwnProperty("max_choices"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.max_choices);
                return writer;
            };
    
            /**
             * Encodes the specified BallotConfig message, length delimited. Does not implicitly {@link votings_service.BallotConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.BallotConfig
             * @static
             * @param {votings_service.IBallotConfig} message BallotConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BallotConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a BallotConfig message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.BallotConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.BallotConfig} BallotConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BallotConfig.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.BallotConfig(), key;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.district_id = reader.uint32();
                        break;
                    case 2:
                        message.question = reader.string();
                        break;
                    case 3:
                        reader.skip().pos++;
                        if (message.options === $util.emptyObject)
                            message.options = {};
                        key = reader.uint32();
                        reader.pos++;
                        message.options[key] = reader.string();
                        break;
                    case 4:
                        message.min_choices = reader.uint32();
                        break;
                    case 5:
                        message.max_choices = reader.uint32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a BallotConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.BallotConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.BallotConfig} BallotConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BallotConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a BallotConfig message.
             * @function verify
             * @memberof votings_service.BallotConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            BallotConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    if (!$util.isInteger(message.district_id))
                        return "district_id: integer expected";
                if (message.question != null && message.hasOwnProperty("question"))
                    if (!$util.isString(message.question))
                        return "question: string expected";
                if (message.options != null && message.hasOwnProperty("options")) {
                    if (!$util.isObject(message.options))
                        return "options: object expected";
                    var key = Object.keys(message.options);
                    for (var i = 0; i < key.length; ++i) {
                        if (!$util.key32Re.test(key[i]))
                            return "options: integer key{k:uint32} expected";
                        if (!$util.isString(message.options[key[i]]))
                            return "options: string{k:uint32} expected";
                    }
                }
                if (message.min_choices != null && message.hasOwnProperty("min_choices"))
                    if (!$util.isInteger(message.min_choices))
                        return "min_choices: integer expected";
                if (message.max_choices != null && message.hasOwnProperty("max_choices"))
                    if (!$util.isInteger(message.max_choices))
                        return "max_choices: integer expected";
                return null;
            };
    
            /**
             * Creates a BallotConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.BallotConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.BallotConfig} BallotConfig
             */
            BallotConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.BallotConfig)
                    return object;
                var message = new $root.votings_service.BallotConfig();
                if (object.district_id != null)
                    message.district_id = object.district_id >>> 0;
                if (object.question != null)
                    message.question = String(object.question);
                if (object.options) {
                    if (typeof object.options !== "object")
                        throw TypeError(".votings_service.BallotConfig.options: object expected");
                    message.options = {};
                    for (var keys = Object.keys(object.options), i = 0; i < keys.length; ++i)
                        message.options[keys[i]] = String(object.options[keys[i]]);
                }
                if (object.min_choices != null)
                    message.min_choices = object.min_choices >>> 0;
                if (object.max_choices != null)
                    message.max_choices = object.max_choices >>> 0;
                return message;
            };
    
            /**
             * Creates a plain object from a BallotConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.BallotConfig
             * @static
             * @param {votings_service.BallotConfig} message BallotConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            BallotConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.options = {};
                if (options.defaults) {
                    object.district_id = 0;
                    object.question = "";
                    object.min_choices = 0;
                    object.max_choices = 0;
                }
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    object.district_id = message.district_id;
                if (message.question != null && message.hasOwnProperty("question"))
                    object.question = message.question;
                var keys2;
                if (message.options && (keys2 = Object.keys(message.options)).length) {
                    object.options = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.options[keys2[j]] = message.options[keys2[j]];
                }
                if (message.min_choices != null && message.hasOwnProperty("min_choices"))
                    object.min_choices = message.min_choices;
                if (message.max_choices != null && message.hasOwnProperty("max_choices"))
                    object.max_choices = message.max_choices;
                return object;
            };
    
            /**
             * Converts this BallotConfig to JSON.
             * @function toJSON
             * @memberof votings_service.BallotConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BallotConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return BallotConfig;
        })();
    
        votings_service.Voting = (function() {
    
            /**
             * Properties of a Voting.
             * @memberof votings_service
             * @interface IVoting
             * @property {string|null} [voting_id] Voting voting_id
             * @property {votings_service.ICryptoSystemSettings|null} [crypto_system] Voting crypto_system
             * @property {Object.<string,votings_service.IBallotConfig>|null} [ballots_config] Voting ballots_config
             * @property {votings_service.VotingState|null} [state] Voting state
             */
    
            /**
             * Constructs a new Voting.
             * @memberof votings_service
             * @classdesc Represents a Voting.
             * @implements IVoting
             * @constructor
             * @param {votings_service.IVoting=} [properties] Properties to set
             */
            function Voting(properties) {
                this.ballots_config = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Voting voting_id.
             * @member {string} voting_id
             * @memberof votings_service.Voting
             * @instance
             */
            Voting.prototype.voting_id = "";
    
            /**
             * Voting crypto_system.
             * @member {votings_service.ICryptoSystemSettings|null|undefined} crypto_system
             * @memberof votings_service.Voting
             * @instance
             */
            Voting.prototype.crypto_system = null;
    
            /**
             * Voting ballots_config.
             * @member {Object.<string,votings_service.IBallotConfig>} ballots_config
             * @memberof votings_service.Voting
             * @instance
             */
            Voting.prototype.ballots_config = $util.emptyObject;
    
            /**
             * Voting state.
             * @member {votings_service.VotingState} state
             * @memberof votings_service.Voting
             * @instance
             */
            Voting.prototype.state = 0;
    
            /**
             * Creates a new Voting instance using the specified properties.
             * @function create
             * @memberof votings_service.Voting
             * @static
             * @param {votings_service.IVoting=} [properties] Properties to set
             * @returns {votings_service.Voting} Voting instance
             */
            Voting.create = function create(properties) {
                return new Voting(properties);
            };
    
            /**
             * Encodes the specified Voting message. Does not implicitly {@link votings_service.Voting.verify|verify} messages.
             * @function encode
             * @memberof votings_service.Voting
             * @static
             * @param {votings_service.IVoting} message Voting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Voting.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.crypto_system != null && message.hasOwnProperty("crypto_system"))
                    $root.votings_service.CryptoSystemSettings.encode(message.crypto_system, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.ballots_config != null && message.hasOwnProperty("ballots_config"))
                    for (var keys = Object.keys(message.ballots_config), i = 0; i < keys.length; ++i) {
                        writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 0 =*/8).uint32(keys[i]);
                        $root.votings_service.BallotConfig.encode(message.ballots_config[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
                    }
                if (message.state != null && message.hasOwnProperty("state"))
                    writer.uint32(/* id 4, wireType 0 =*/32).int32(message.state);
                return writer;
            };
    
            /**
             * Encodes the specified Voting message, length delimited. Does not implicitly {@link votings_service.Voting.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.Voting
             * @static
             * @param {votings_service.IVoting} message Voting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Voting.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Voting message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.Voting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.Voting} Voting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Voting.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.Voting(), key;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.crypto_system = $root.votings_service.CryptoSystemSettings.decode(reader, reader.uint32());
                        break;
                    case 3:
                        reader.skip().pos++;
                        if (message.ballots_config === $util.emptyObject)
                            message.ballots_config = {};
                        key = reader.uint32();
                        reader.pos++;
                        message.ballots_config[key] = $root.votings_service.BallotConfig.decode(reader, reader.uint32());
                        break;
                    case 4:
                        message.state = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Voting message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.Voting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.Voting} Voting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Voting.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Voting message.
             * @function verify
             * @memberof votings_service.Voting
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Voting.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.crypto_system != null && message.hasOwnProperty("crypto_system")) {
                    var error = $root.votings_service.CryptoSystemSettings.verify(message.crypto_system);
                    if (error)
                        return "crypto_system." + error;
                }
                if (message.ballots_config != null && message.hasOwnProperty("ballots_config")) {
                    if (!$util.isObject(message.ballots_config))
                        return "ballots_config: object expected";
                    var key = Object.keys(message.ballots_config);
                    for (var i = 0; i < key.length; ++i) {
                        if (!$util.key32Re.test(key[i]))
                            return "ballots_config: integer key{k:uint32} expected";
                        {
                            var error = $root.votings_service.BallotConfig.verify(message.ballots_config[key[i]]);
                            if (error)
                                return "ballots_config." + error;
                        }
                    }
                }
                if (message.state != null && message.hasOwnProperty("state"))
                    switch (message.state) {
                    default:
                        return "state: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                return null;
            };
    
            /**
             * Creates a Voting message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.Voting
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.Voting} Voting
             */
            Voting.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.Voting)
                    return object;
                var message = new $root.votings_service.Voting();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.crypto_system != null) {
                    if (typeof object.crypto_system !== "object")
                        throw TypeError(".votings_service.Voting.crypto_system: object expected");
                    message.crypto_system = $root.votings_service.CryptoSystemSettings.fromObject(object.crypto_system);
                }
                if (object.ballots_config) {
                    if (typeof object.ballots_config !== "object")
                        throw TypeError(".votings_service.Voting.ballots_config: object expected");
                    message.ballots_config = {};
                    for (var keys = Object.keys(object.ballots_config), i = 0; i < keys.length; ++i) {
                        if (typeof object.ballots_config[keys[i]] !== "object")
                            throw TypeError(".votings_service.Voting.ballots_config: object expected");
                        message.ballots_config[keys[i]] = $root.votings_service.BallotConfig.fromObject(object.ballots_config[keys[i]]);
                    }
                }
                switch (object.state) {
                case "Registration":
                case 0:
                    message.state = 0;
                    break;
                case "InProcess":
                case 1:
                    message.state = 1;
                    break;
                case "Stopped":
                case 2:
                    message.state = 2;
                    break;
                case "Finished":
                case 3:
                    message.state = 3;
                    break;
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Voting message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.Voting
             * @static
             * @param {votings_service.Voting} message Voting
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Voting.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.ballots_config = {};
                if (options.defaults) {
                    object.voting_id = "";
                    object.crypto_system = null;
                    object.state = options.enums === String ? "Registration" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.crypto_system != null && message.hasOwnProperty("crypto_system"))
                    object.crypto_system = $root.votings_service.CryptoSystemSettings.toObject(message.crypto_system, options);
                var keys2;
                if (message.ballots_config && (keys2 = Object.keys(message.ballots_config)).length) {
                    object.ballots_config = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.ballots_config[keys2[j]] = $root.votings_service.BallotConfig.toObject(message.ballots_config[keys2[j]], options);
                }
                if (message.state != null && message.hasOwnProperty("state"))
                    object.state = options.enums === String ? $root.votings_service.VotingState[message.state] : message.state;
                return object;
            };
    
            /**
             * Converts this Voting to JSON.
             * @function toJSON
             * @memberof votings_service.Voting
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Voting.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Voting;
        })();
    
        votings_service.Voter = (function() {
    
            /**
             * Properties of a Voter.
             * @memberof votings_service
             * @interface IVoter
             * @property {string|null} [voter_id] Voter voter_id
             * @property {boolean|null} [is_participation_revoked] Voter is_participation_revoked
             * @property {number|null} [ballot_issuing_district] Voter ballot_issuing_district
             */
    
            /**
             * Constructs a new Voter.
             * @memberof votings_service
             * @classdesc Represents a Voter.
             * @implements IVoter
             * @constructor
             * @param {votings_service.IVoter=} [properties] Properties to set
             */
            function Voter(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Voter voter_id.
             * @member {string} voter_id
             * @memberof votings_service.Voter
             * @instance
             */
            Voter.prototype.voter_id = "";
    
            /**
             * Voter is_participation_revoked.
             * @member {boolean} is_participation_revoked
             * @memberof votings_service.Voter
             * @instance
             */
            Voter.prototype.is_participation_revoked = false;
    
            /**
             * Voter ballot_issuing_district.
             * @member {number} ballot_issuing_district
             * @memberof votings_service.Voter
             * @instance
             */
            Voter.prototype.ballot_issuing_district = 0;
    
            /**
             * Creates a new Voter instance using the specified properties.
             * @function create
             * @memberof votings_service.Voter
             * @static
             * @param {votings_service.IVoter=} [properties] Properties to set
             * @returns {votings_service.Voter} Voter instance
             */
            Voter.create = function create(properties) {
                return new Voter(properties);
            };
    
            /**
             * Encodes the specified Voter message. Does not implicitly {@link votings_service.Voter.verify|verify} messages.
             * @function encode
             * @memberof votings_service.Voter
             * @static
             * @param {votings_service.IVoter} message Voter message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Voter.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voter_id);
                if (message.is_participation_revoked != null && message.hasOwnProperty("is_participation_revoked"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.is_participation_revoked);
                if (message.ballot_issuing_district != null && message.hasOwnProperty("ballot_issuing_district"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.ballot_issuing_district);
                return writer;
            };
    
            /**
             * Encodes the specified Voter message, length delimited. Does not implicitly {@link votings_service.Voter.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.Voter
             * @static
             * @param {votings_service.IVoter} message Voter message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Voter.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Voter message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.Voter
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.Voter} Voter
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Voter.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.Voter();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voter_id = reader.string();
                        break;
                    case 2:
                        message.is_participation_revoked = reader.bool();
                        break;
                    case 3:
                        message.ballot_issuing_district = reader.uint32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Voter message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.Voter
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.Voter} Voter
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Voter.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Voter message.
             * @function verify
             * @memberof votings_service.Voter
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Voter.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    if (!$util.isString(message.voter_id))
                        return "voter_id: string expected";
                if (message.is_participation_revoked != null && message.hasOwnProperty("is_participation_revoked"))
                    if (typeof message.is_participation_revoked !== "boolean")
                        return "is_participation_revoked: boolean expected";
                if (message.ballot_issuing_district != null && message.hasOwnProperty("ballot_issuing_district"))
                    if (!$util.isInteger(message.ballot_issuing_district))
                        return "ballot_issuing_district: integer expected";
                return null;
            };
    
            /**
             * Creates a Voter message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.Voter
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.Voter} Voter
             */
            Voter.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.Voter)
                    return object;
                var message = new $root.votings_service.Voter();
                if (object.voter_id != null)
                    message.voter_id = String(object.voter_id);
                if (object.is_participation_revoked != null)
                    message.is_participation_revoked = Boolean(object.is_participation_revoked);
                if (object.ballot_issuing_district != null)
                    message.ballot_issuing_district = object.ballot_issuing_district >>> 0;
                return message;
            };
    
            /**
             * Creates a plain object from a Voter message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.Voter
             * @static
             * @param {votings_service.Voter} message Voter
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Voter.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voter_id = "";
                    object.is_participation_revoked = false;
                    object.ballot_issuing_district = 0;
                }
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    object.voter_id = message.voter_id;
                if (message.is_participation_revoked != null && message.hasOwnProperty("is_participation_revoked"))
                    object.is_participation_revoked = message.is_participation_revoked;
                if (message.ballot_issuing_district != null && message.hasOwnProperty("ballot_issuing_district"))
                    object.ballot_issuing_district = message.ballot_issuing_district;
                return object;
            };
    
            /**
             * Converts this Voter to JSON.
             * @function toJSON
             * @memberof votings_service.Voter
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Voter.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Voter;
        })();
    
        votings_service.Choices = (function() {
    
            /**
             * Properties of a Choices.
             * @memberof votings_service
             * @interface IChoices
             * @property {Array.<number>|null} [data] Choices data
             */
    
            /**
             * Constructs a new Choices.
             * @memberof votings_service
             * @classdesc Represents a Choices.
             * @implements IChoices
             * @constructor
             * @param {votings_service.IChoices=} [properties] Properties to set
             */
            function Choices(properties) {
                this.data = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Choices data.
             * @member {Array.<number>} data
             * @memberof votings_service.Choices
             * @instance
             */
            Choices.prototype.data = $util.emptyArray;
    
            /**
             * Creates a new Choices instance using the specified properties.
             * @function create
             * @memberof votings_service.Choices
             * @static
             * @param {votings_service.IChoices=} [properties] Properties to set
             * @returns {votings_service.Choices} Choices instance
             */
            Choices.create = function create(properties) {
                return new Choices(properties);
            };
    
            /**
             * Encodes the specified Choices message. Does not implicitly {@link votings_service.Choices.verify|verify} messages.
             * @function encode
             * @memberof votings_service.Choices
             * @static
             * @param {votings_service.IChoices} message Choices message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Choices.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.data.length) {
                    writer.uint32(/* id 1, wireType 2 =*/10).fork();
                    for (var i = 0; i < message.data.length; ++i)
                        writer.uint32(message.data[i]);
                    writer.ldelim();
                }
                return writer;
            };
    
            /**
             * Encodes the specified Choices message, length delimited. Does not implicitly {@link votings_service.Choices.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.Choices
             * @static
             * @param {votings_service.IChoices} message Choices message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Choices.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Choices message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.Choices
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.Choices} Choices
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Choices.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.Choices();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        if (!(message.data && message.data.length))
                            message.data = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.data.push(reader.uint32());
                        } else
                            message.data.push(reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Choices message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.Choices
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.Choices} Choices
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Choices.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Choices message.
             * @function verify
             * @memberof votings_service.Choices
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Choices.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data")) {
                    if (!Array.isArray(message.data))
                        return "data: array expected";
                    for (var i = 0; i < message.data.length; ++i)
                        if (!$util.isInteger(message.data[i]))
                            return "data: integer[] expected";
                }
                return null;
            };
    
            /**
             * Creates a Choices message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.Choices
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.Choices} Choices
             */
            Choices.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.Choices)
                    return object;
                var message = new $root.votings_service.Choices();
                if (object.data) {
                    if (!Array.isArray(object.data))
                        throw TypeError(".votings_service.Choices.data: array expected");
                    message.data = [];
                    for (var i = 0; i < object.data.length; ++i)
                        message.data[i] = object.data[i] >>> 0;
                }
                return message;
            };
    
            /**
             * Creates a plain object from a Choices message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.Choices
             * @static
             * @param {votings_service.Choices} message Choices
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Choices.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.data = [];
                if (message.data && message.data.length) {
                    object.data = [];
                    for (var j = 0; j < message.data.length; ++j)
                        object.data[j] = message.data[j];
                }
                return object;
            };
    
            /**
             * Converts this Choices to JSON.
             * @function toJSON
             * @memberof votings_service.Choices
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Choices.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Choices;
        })();
    
        votings_service.EncryptedChoice = (function() {
    
            /**
             * Properties of an EncryptedChoice.
             * @memberof votings_service
             * @interface IEncryptedChoice
             * @property {Uint8Array|null} [encrypted_message] EncryptedChoice encrypted_message
             * @property {votings_service.ISealedBoxNonce|null} [nonce] EncryptedChoice nonce
             * @property {votings_service.ISealedBoxPublicKey|null} [public_key] EncryptedChoice public_key
             */
    
            /**
             * Constructs a new EncryptedChoice.
             * @memberof votings_service
             * @classdesc Represents an EncryptedChoice.
             * @implements IEncryptedChoice
             * @constructor
             * @param {votings_service.IEncryptedChoice=} [properties] Properties to set
             */
            function EncryptedChoice(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * EncryptedChoice encrypted_message.
             * @member {Uint8Array} encrypted_message
             * @memberof votings_service.EncryptedChoice
             * @instance
             */
            EncryptedChoice.prototype.encrypted_message = $util.newBuffer([]);
    
            /**
             * EncryptedChoice nonce.
             * @member {votings_service.ISealedBoxNonce|null|undefined} nonce
             * @memberof votings_service.EncryptedChoice
             * @instance
             */
            EncryptedChoice.prototype.nonce = null;
    
            /**
             * EncryptedChoice public_key.
             * @member {votings_service.ISealedBoxPublicKey|null|undefined} public_key
             * @memberof votings_service.EncryptedChoice
             * @instance
             */
            EncryptedChoice.prototype.public_key = null;
    
            /**
             * Creates a new EncryptedChoice instance using the specified properties.
             * @function create
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {votings_service.IEncryptedChoice=} [properties] Properties to set
             * @returns {votings_service.EncryptedChoice} EncryptedChoice instance
             */
            EncryptedChoice.create = function create(properties) {
                return new EncryptedChoice(properties);
            };
    
            /**
             * Encodes the specified EncryptedChoice message. Does not implicitly {@link votings_service.EncryptedChoice.verify|verify} messages.
             * @function encode
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {votings_service.IEncryptedChoice} message EncryptedChoice message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EncryptedChoice.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.encrypted_message != null && message.hasOwnProperty("encrypted_message"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.encrypted_message);
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    $root.votings_service.SealedBoxNonce.encode(message.nonce, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    $root.votings_service.SealedBoxPublicKey.encode(message.public_key, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified EncryptedChoice message, length delimited. Does not implicitly {@link votings_service.EncryptedChoice.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {votings_service.IEncryptedChoice} message EncryptedChoice message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EncryptedChoice.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes an EncryptedChoice message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.EncryptedChoice} EncryptedChoice
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EncryptedChoice.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.EncryptedChoice();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.encrypted_message = reader.bytes();
                        break;
                    case 2:
                        message.nonce = $root.votings_service.SealedBoxNonce.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.public_key = $root.votings_service.SealedBoxPublicKey.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes an EncryptedChoice message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.EncryptedChoice} EncryptedChoice
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EncryptedChoice.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies an EncryptedChoice message.
             * @function verify
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EncryptedChoice.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.encrypted_message != null && message.hasOwnProperty("encrypted_message"))
                    if (!(message.encrypted_message && typeof message.encrypted_message.length === "number" || $util.isString(message.encrypted_message)))
                        return "encrypted_message: buffer expected";
                if (message.nonce != null && message.hasOwnProperty("nonce")) {
                    var error = $root.votings_service.SealedBoxNonce.verify(message.nonce);
                    if (error)
                        return "nonce." + error;
                }
                if (message.public_key != null && message.hasOwnProperty("public_key")) {
                    var error = $root.votings_service.SealedBoxPublicKey.verify(message.public_key);
                    if (error)
                        return "public_key." + error;
                }
                return null;
            };
    
            /**
             * Creates an EncryptedChoice message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.EncryptedChoice} EncryptedChoice
             */
            EncryptedChoice.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.EncryptedChoice)
                    return object;
                var message = new $root.votings_service.EncryptedChoice();
                if (object.encrypted_message != null)
                    if (typeof object.encrypted_message === "string")
                        $util.base64.decode(object.encrypted_message, message.encrypted_message = $util.newBuffer($util.base64.length(object.encrypted_message)), 0);
                    else if (object.encrypted_message.length)
                        message.encrypted_message = object.encrypted_message;
                if (object.nonce != null) {
                    if (typeof object.nonce !== "object")
                        throw TypeError(".votings_service.EncryptedChoice.nonce: object expected");
                    message.nonce = $root.votings_service.SealedBoxNonce.fromObject(object.nonce);
                }
                if (object.public_key != null) {
                    if (typeof object.public_key !== "object")
                        throw TypeError(".votings_service.EncryptedChoice.public_key: object expected");
                    message.public_key = $root.votings_service.SealedBoxPublicKey.fromObject(object.public_key);
                }
                return message;
            };
    
            /**
             * Creates a plain object from an EncryptedChoice message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.EncryptedChoice
             * @static
             * @param {votings_service.EncryptedChoice} message EncryptedChoice
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EncryptedChoice.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.encrypted_message = "";
                    else {
                        object.encrypted_message = [];
                        if (options.bytes !== Array)
                            object.encrypted_message = $util.newBuffer(object.encrypted_message);
                    }
                    object.nonce = null;
                    object.public_key = null;
                }
                if (message.encrypted_message != null && message.hasOwnProperty("encrypted_message"))
                    object.encrypted_message = options.bytes === String ? $util.base64.encode(message.encrypted_message, 0, message.encrypted_message.length) : options.bytes === Array ? Array.prototype.slice.call(message.encrypted_message) : message.encrypted_message;
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    object.nonce = $root.votings_service.SealedBoxNonce.toObject(message.nonce, options);
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    object.public_key = $root.votings_service.SealedBoxPublicKey.toObject(message.public_key, options);
                return object;
            };
    
            /**
             * Converts this EncryptedChoice to JSON.
             * @function toJSON
             * @memberof votings_service.EncryptedChoice
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EncryptedChoice.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return EncryptedChoice;
        })();
    
        votings_service.Ballot = (function() {
    
            /**
             * Properties of a Ballot.
             * @memberof votings_service
             * @interface IBallot
             * @property {number|null} [index] Ballot index
             * @property {exonum.IPublicKey|null} [voter] Ballot voter
             * @property {number|null} [district_id] Ballot district_id
             * @property {votings_service.IEncryptedChoice|null} [encrypted_choice] Ballot encrypted_choice
             * @property {Array.<number>|null} [decrypted_choices] Ballot decrypted_choices
             * @property {exonum.IHash|null} [store_tx_hash] Ballot store_tx_hash
             * @property {exonum.IHash|null} [decrypt_tx_hash] Ballot decrypt_tx_hash
             * @property {boolean|null} [invalid] Ballot invalid
             */
    
            /**
             * Constructs a new Ballot.
             * @memberof votings_service
             * @classdesc Represents a Ballot.
             * @implements IBallot
             * @constructor
             * @param {votings_service.IBallot=} [properties] Properties to set
             */
            function Ballot(properties) {
                this.decrypted_choices = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * Ballot index.
             * @member {number} index
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.index = 0;
    
            /**
             * Ballot voter.
             * @member {exonum.IPublicKey|null|undefined} voter
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.voter = null;
    
            /**
             * Ballot district_id.
             * @member {number} district_id
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.district_id = 0;
    
            /**
             * Ballot encrypted_choice.
             * @member {votings_service.IEncryptedChoice|null|undefined} encrypted_choice
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.encrypted_choice = null;
    
            /**
             * Ballot decrypted_choices.
             * @member {Array.<number>} decrypted_choices
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.decrypted_choices = $util.emptyArray;
    
            /**
             * Ballot store_tx_hash.
             * @member {exonum.IHash|null|undefined} store_tx_hash
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.store_tx_hash = null;
    
            /**
             * Ballot decrypt_tx_hash.
             * @member {exonum.IHash|null|undefined} decrypt_tx_hash
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.decrypt_tx_hash = null;
    
            /**
             * Ballot invalid.
             * @member {boolean} invalid
             * @memberof votings_service.Ballot
             * @instance
             */
            Ballot.prototype.invalid = false;
    
            /**
             * Creates a new Ballot instance using the specified properties.
             * @function create
             * @memberof votings_service.Ballot
             * @static
             * @param {votings_service.IBallot=} [properties] Properties to set
             * @returns {votings_service.Ballot} Ballot instance
             */
            Ballot.create = function create(properties) {
                return new Ballot(properties);
            };
    
            /**
             * Encodes the specified Ballot message. Does not implicitly {@link votings_service.Ballot.verify|verify} messages.
             * @function encode
             * @memberof votings_service.Ballot
             * @static
             * @param {votings_service.IBallot} message Ballot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ballot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.index != null && message.hasOwnProperty("index"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.index);
                if (message.voter != null && message.hasOwnProperty("voter"))
                    $root.exonum.PublicKey.encode(message.voter, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.district_id);
                if (message.encrypted_choice != null && message.hasOwnProperty("encrypted_choice"))
                    $root.votings_service.EncryptedChoice.encode(message.encrypted_choice, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                if (message.decrypted_choices != null && message.decrypted_choices.length) {
                    writer.uint32(/* id 5, wireType 2 =*/42).fork();
                    for (var i = 0; i < message.decrypted_choices.length; ++i)
                        writer.uint32(message.decrypted_choices[i]);
                    writer.ldelim();
                }
                if (message.store_tx_hash != null && message.hasOwnProperty("store_tx_hash"))
                    $root.exonum.Hash.encode(message.store_tx_hash, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
                if (message.decrypt_tx_hash != null && message.hasOwnProperty("decrypt_tx_hash"))
                    $root.exonum.Hash.encode(message.decrypt_tx_hash, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
                if (message.invalid != null && message.hasOwnProperty("invalid"))
                    writer.uint32(/* id 8, wireType 0 =*/64).bool(message.invalid);
                return writer;
            };
    
            /**
             * Encodes the specified Ballot message, length delimited. Does not implicitly {@link votings_service.Ballot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.Ballot
             * @static
             * @param {votings_service.IBallot} message Ballot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Ballot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a Ballot message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.Ballot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.Ballot} Ballot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ballot.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.Ballot();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.index = reader.uint32();
                        break;
                    case 2:
                        message.voter = $root.exonum.PublicKey.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.district_id = reader.uint32();
                        break;
                    case 4:
                        message.encrypted_choice = $root.votings_service.EncryptedChoice.decode(reader, reader.uint32());
                        break;
                    case 5:
                        if (!(message.decrypted_choices && message.decrypted_choices.length))
                            message.decrypted_choices = [];
                        if ((tag & 7) === 2) {
                            var end2 = reader.uint32() + reader.pos;
                            while (reader.pos < end2)
                                message.decrypted_choices.push(reader.uint32());
                        } else
                            message.decrypted_choices.push(reader.uint32());
                        break;
                    case 6:
                        message.store_tx_hash = $root.exonum.Hash.decode(reader, reader.uint32());
                        break;
                    case 7:
                        message.decrypt_tx_hash = $root.exonum.Hash.decode(reader, reader.uint32());
                        break;
                    case 8:
                        message.invalid = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a Ballot message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.Ballot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.Ballot} Ballot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Ballot.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a Ballot message.
             * @function verify
             * @memberof votings_service.Ballot
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Ballot.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.index != null && message.hasOwnProperty("index"))
                    if (!$util.isInteger(message.index))
                        return "index: integer expected";
                if (message.voter != null && message.hasOwnProperty("voter")) {
                    var error = $root.exonum.PublicKey.verify(message.voter);
                    if (error)
                        return "voter." + error;
                }
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    if (!$util.isInteger(message.district_id))
                        return "district_id: integer expected";
                if (message.encrypted_choice != null && message.hasOwnProperty("encrypted_choice")) {
                    var error = $root.votings_service.EncryptedChoice.verify(message.encrypted_choice);
                    if (error)
                        return "encrypted_choice." + error;
                }
                if (message.decrypted_choices != null && message.hasOwnProperty("decrypted_choices")) {
                    if (!Array.isArray(message.decrypted_choices))
                        return "decrypted_choices: array expected";
                    for (var i = 0; i < message.decrypted_choices.length; ++i)
                        if (!$util.isInteger(message.decrypted_choices[i]))
                            return "decrypted_choices: integer[] expected";
                }
                if (message.store_tx_hash != null && message.hasOwnProperty("store_tx_hash")) {
                    var error = $root.exonum.Hash.verify(message.store_tx_hash);
                    if (error)
                        return "store_tx_hash." + error;
                }
                if (message.decrypt_tx_hash != null && message.hasOwnProperty("decrypt_tx_hash")) {
                    var error = $root.exonum.Hash.verify(message.decrypt_tx_hash);
                    if (error)
                        return "decrypt_tx_hash." + error;
                }
                if (message.invalid != null && message.hasOwnProperty("invalid"))
                    if (typeof message.invalid !== "boolean")
                        return "invalid: boolean expected";
                return null;
            };
    
            /**
             * Creates a Ballot message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.Ballot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.Ballot} Ballot
             */
            Ballot.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.Ballot)
                    return object;
                var message = new $root.votings_service.Ballot();
                if (object.index != null)
                    message.index = object.index >>> 0;
                if (object.voter != null) {
                    if (typeof object.voter !== "object")
                        throw TypeError(".votings_service.Ballot.voter: object expected");
                    message.voter = $root.exonum.PublicKey.fromObject(object.voter);
                }
                if (object.district_id != null)
                    message.district_id = object.district_id >>> 0;
                if (object.encrypted_choice != null) {
                    if (typeof object.encrypted_choice !== "object")
                        throw TypeError(".votings_service.Ballot.encrypted_choice: object expected");
                    message.encrypted_choice = $root.votings_service.EncryptedChoice.fromObject(object.encrypted_choice);
                }
                if (object.decrypted_choices) {
                    if (!Array.isArray(object.decrypted_choices))
                        throw TypeError(".votings_service.Ballot.decrypted_choices: array expected");
                    message.decrypted_choices = [];
                    for (var i = 0; i < object.decrypted_choices.length; ++i)
                        message.decrypted_choices[i] = object.decrypted_choices[i] >>> 0;
                }
                if (object.store_tx_hash != null) {
                    if (typeof object.store_tx_hash !== "object")
                        throw TypeError(".votings_service.Ballot.store_tx_hash: object expected");
                    message.store_tx_hash = $root.exonum.Hash.fromObject(object.store_tx_hash);
                }
                if (object.decrypt_tx_hash != null) {
                    if (typeof object.decrypt_tx_hash !== "object")
                        throw TypeError(".votings_service.Ballot.decrypt_tx_hash: object expected");
                    message.decrypt_tx_hash = $root.exonum.Hash.fromObject(object.decrypt_tx_hash);
                }
                if (object.invalid != null)
                    message.invalid = Boolean(object.invalid);
                return message;
            };
    
            /**
             * Creates a plain object from a Ballot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.Ballot
             * @static
             * @param {votings_service.Ballot} message Ballot
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Ballot.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.decrypted_choices = [];
                if (options.defaults) {
                    object.index = 0;
                    object.voter = null;
                    object.district_id = 0;
                    object.encrypted_choice = null;
                    object.store_tx_hash = null;
                    object.decrypt_tx_hash = null;
                    object.invalid = false;
                }
                if (message.index != null && message.hasOwnProperty("index"))
                    object.index = message.index;
                if (message.voter != null && message.hasOwnProperty("voter"))
                    object.voter = $root.exonum.PublicKey.toObject(message.voter, options);
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    object.district_id = message.district_id;
                if (message.encrypted_choice != null && message.hasOwnProperty("encrypted_choice"))
                    object.encrypted_choice = $root.votings_service.EncryptedChoice.toObject(message.encrypted_choice, options);
                if (message.decrypted_choices && message.decrypted_choices.length) {
                    object.decrypted_choices = [];
                    for (var j = 0; j < message.decrypted_choices.length; ++j)
                        object.decrypted_choices[j] = message.decrypted_choices[j];
                }
                if (message.store_tx_hash != null && message.hasOwnProperty("store_tx_hash"))
                    object.store_tx_hash = $root.exonum.Hash.toObject(message.store_tx_hash, options);
                if (message.decrypt_tx_hash != null && message.hasOwnProperty("decrypt_tx_hash"))
                    object.decrypt_tx_hash = $root.exonum.Hash.toObject(message.decrypt_tx_hash, options);
                if (message.invalid != null && message.hasOwnProperty("invalid"))
                    object.invalid = message.invalid;
                return object;
            };
    
            /**
             * Converts this Ballot to JSON.
             * @function toJSON
             * @memberof votings_service.Ballot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Ballot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return Ballot;
        })();
    
        votings_service.DecryptionStatistics = (function() {
    
            /**
             * Properties of a DecryptionStatistics.
             * @memberof votings_service
             * @interface IDecryptionStatistics
             * @property {number|null} [decrypted_ballots_amount] DecryptionStatistics decrypted_ballots_amount
             * @property {number|null} [invalid_ballots_amount] DecryptionStatistics invalid_ballots_amount
             */
    
            /**
             * Constructs a new DecryptionStatistics.
             * @memberof votings_service
             * @classdesc Represents a DecryptionStatistics.
             * @implements IDecryptionStatistics
             * @constructor
             * @param {votings_service.IDecryptionStatistics=} [properties] Properties to set
             */
            function DecryptionStatistics(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * DecryptionStatistics decrypted_ballots_amount.
             * @member {number} decrypted_ballots_amount
             * @memberof votings_service.DecryptionStatistics
             * @instance
             */
            DecryptionStatistics.prototype.decrypted_ballots_amount = 0;
    
            /**
             * DecryptionStatistics invalid_ballots_amount.
             * @member {number} invalid_ballots_amount
             * @memberof votings_service.DecryptionStatistics
             * @instance
             */
            DecryptionStatistics.prototype.invalid_ballots_amount = 0;
    
            /**
             * Creates a new DecryptionStatistics instance using the specified properties.
             * @function create
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {votings_service.IDecryptionStatistics=} [properties] Properties to set
             * @returns {votings_service.DecryptionStatistics} DecryptionStatistics instance
             */
            DecryptionStatistics.create = function create(properties) {
                return new DecryptionStatistics(properties);
            };
    
            /**
             * Encodes the specified DecryptionStatistics message. Does not implicitly {@link votings_service.DecryptionStatistics.verify|verify} messages.
             * @function encode
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {votings_service.IDecryptionStatistics} message DecryptionStatistics message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DecryptionStatistics.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.decrypted_ballots_amount != null && message.hasOwnProperty("decrypted_ballots_amount"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.decrypted_ballots_amount);
                if (message.invalid_ballots_amount != null && message.hasOwnProperty("invalid_ballots_amount"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.invalid_ballots_amount);
                return writer;
            };
    
            /**
             * Encodes the specified DecryptionStatistics message, length delimited. Does not implicitly {@link votings_service.DecryptionStatistics.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {votings_service.IDecryptionStatistics} message DecryptionStatistics message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DecryptionStatistics.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a DecryptionStatistics message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.DecryptionStatistics} DecryptionStatistics
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DecryptionStatistics.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.DecryptionStatistics();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.decrypted_ballots_amount = reader.uint32();
                        break;
                    case 2:
                        message.invalid_ballots_amount = reader.uint32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a DecryptionStatistics message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.DecryptionStatistics} DecryptionStatistics
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DecryptionStatistics.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a DecryptionStatistics message.
             * @function verify
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DecryptionStatistics.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.decrypted_ballots_amount != null && message.hasOwnProperty("decrypted_ballots_amount"))
                    if (!$util.isInteger(message.decrypted_ballots_amount))
                        return "decrypted_ballots_amount: integer expected";
                if (message.invalid_ballots_amount != null && message.hasOwnProperty("invalid_ballots_amount"))
                    if (!$util.isInteger(message.invalid_ballots_amount))
                        return "invalid_ballots_amount: integer expected";
                return null;
            };
    
            /**
             * Creates a DecryptionStatistics message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.DecryptionStatistics} DecryptionStatistics
             */
            DecryptionStatistics.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.DecryptionStatistics)
                    return object;
                var message = new $root.votings_service.DecryptionStatistics();
                if (object.decrypted_ballots_amount != null)
                    message.decrypted_ballots_amount = object.decrypted_ballots_amount >>> 0;
                if (object.invalid_ballots_amount != null)
                    message.invalid_ballots_amount = object.invalid_ballots_amount >>> 0;
                return message;
            };
    
            /**
             * Creates a plain object from a DecryptionStatistics message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.DecryptionStatistics
             * @static
             * @param {votings_service.DecryptionStatistics} message DecryptionStatistics
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DecryptionStatistics.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.decrypted_ballots_amount = 0;
                    object.invalid_ballots_amount = 0;
                }
                if (message.decrypted_ballots_amount != null && message.hasOwnProperty("decrypted_ballots_amount"))
                    object.decrypted_ballots_amount = message.decrypted_ballots_amount;
                if (message.invalid_ballots_amount != null && message.hasOwnProperty("invalid_ballots_amount"))
                    object.invalid_ballots_amount = message.invalid_ballots_amount;
                return object;
            };
    
            /**
             * Converts this DecryptionStatistics to JSON.
             * @function toJSON
             * @memberof votings_service.DecryptionStatistics
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DecryptionStatistics.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return DecryptionStatistics;
        })();
    
        votings_service.VotingResults = (function() {
    
            /**
             * Properties of a VotingResults.
             * @memberof votings_service
             * @interface IVotingResults
             * @property {number|null} [district_id] VotingResults district_id
             * @property {Object.<string,number>|null} [tally] VotingResults tally
             * @property {number|null} [invalid_ballots_amount] VotingResults invalid_ballots_amount
             */
    
            /**
             * Constructs a new VotingResults.
             * @memberof votings_service
             * @classdesc Represents a VotingResults.
             * @implements IVotingResults
             * @constructor
             * @param {votings_service.IVotingResults=} [properties] Properties to set
             */
            function VotingResults(properties) {
                this.tally = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * VotingResults district_id.
             * @member {number} district_id
             * @memberof votings_service.VotingResults
             * @instance
             */
            VotingResults.prototype.district_id = 0;
    
            /**
             * VotingResults tally.
             * @member {Object.<string,number>} tally
             * @memberof votings_service.VotingResults
             * @instance
             */
            VotingResults.prototype.tally = $util.emptyObject;
    
            /**
             * VotingResults invalid_ballots_amount.
             * @member {number} invalid_ballots_amount
             * @memberof votings_service.VotingResults
             * @instance
             */
            VotingResults.prototype.invalid_ballots_amount = 0;
    
            /**
             * Creates a new VotingResults instance using the specified properties.
             * @function create
             * @memberof votings_service.VotingResults
             * @static
             * @param {votings_service.IVotingResults=} [properties] Properties to set
             * @returns {votings_service.VotingResults} VotingResults instance
             */
            VotingResults.create = function create(properties) {
                return new VotingResults(properties);
            };
    
            /**
             * Encodes the specified VotingResults message. Does not implicitly {@link votings_service.VotingResults.verify|verify} messages.
             * @function encode
             * @memberof votings_service.VotingResults
             * @static
             * @param {votings_service.IVotingResults} message VotingResults message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            VotingResults.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.district_id);
                if (message.tally != null && message.hasOwnProperty("tally"))
                    for (var keys = Object.keys(message.tally), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 0 =*/8).uint32(keys[i]).uint32(/* id 2, wireType 0 =*/16).uint32(message.tally[keys[i]]).ldelim();
                if (message.invalid_ballots_amount != null && message.hasOwnProperty("invalid_ballots_amount"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.invalid_ballots_amount);
                return writer;
            };
    
            /**
             * Encodes the specified VotingResults message, length delimited. Does not implicitly {@link votings_service.VotingResults.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.VotingResults
             * @static
             * @param {votings_service.IVotingResults} message VotingResults message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            VotingResults.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a VotingResults message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.VotingResults
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.VotingResults} VotingResults
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            VotingResults.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.VotingResults(), key;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.district_id = reader.uint32();
                        break;
                    case 2:
                        reader.skip().pos++;
                        if (message.tally === $util.emptyObject)
                            message.tally = {};
                        key = reader.uint32();
                        reader.pos++;
                        message.tally[key] = reader.uint32();
                        break;
                    case 3:
                        message.invalid_ballots_amount = reader.uint32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a VotingResults message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.VotingResults
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.VotingResults} VotingResults
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            VotingResults.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a VotingResults message.
             * @function verify
             * @memberof votings_service.VotingResults
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            VotingResults.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    if (!$util.isInteger(message.district_id))
                        return "district_id: integer expected";
                if (message.tally != null && message.hasOwnProperty("tally")) {
                    if (!$util.isObject(message.tally))
                        return "tally: object expected";
                    var key = Object.keys(message.tally);
                    for (var i = 0; i < key.length; ++i) {
                        if (!$util.key32Re.test(key[i]))
                            return "tally: integer key{k:uint32} expected";
                        if (!$util.isInteger(message.tally[key[i]]))
                            return "tally: integer{k:uint32} expected";
                    }
                }
                if (message.invalid_ballots_amount != null && message.hasOwnProperty("invalid_ballots_amount"))
                    if (!$util.isInteger(message.invalid_ballots_amount))
                        return "invalid_ballots_amount: integer expected";
                return null;
            };
    
            /**
             * Creates a VotingResults message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.VotingResults
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.VotingResults} VotingResults
             */
            VotingResults.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.VotingResults)
                    return object;
                var message = new $root.votings_service.VotingResults();
                if (object.district_id != null)
                    message.district_id = object.district_id >>> 0;
                if (object.tally) {
                    if (typeof object.tally !== "object")
                        throw TypeError(".votings_service.VotingResults.tally: object expected");
                    message.tally = {};
                    for (var keys = Object.keys(object.tally), i = 0; i < keys.length; ++i)
                        message.tally[keys[i]] = object.tally[keys[i]] >>> 0;
                }
                if (object.invalid_ballots_amount != null)
                    message.invalid_ballots_amount = object.invalid_ballots_amount >>> 0;
                return message;
            };
    
            /**
             * Creates a plain object from a VotingResults message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.VotingResults
             * @static
             * @param {votings_service.VotingResults} message VotingResults
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            VotingResults.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.tally = {};
                if (options.defaults) {
                    object.district_id = 0;
                    object.invalid_ballots_amount = 0;
                }
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    object.district_id = message.district_id;
                var keys2;
                if (message.tally && (keys2 = Object.keys(message.tally)).length) {
                    object.tally = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.tally[keys2[j]] = message.tally[keys2[j]];
                }
                if (message.invalid_ballots_amount != null && message.hasOwnProperty("invalid_ballots_amount"))
                    object.invalid_ballots_amount = message.invalid_ballots_amount;
                return object;
            };
    
            /**
             * Converts this VotingResults to JSON.
             * @function toJSON
             * @memberof votings_service.VotingResults
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            VotingResults.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return VotingResults;
        })();
    
        votings_service.TxCryptoSystemSettings = (function() {
    
            /**
             * Properties of a TxCryptoSystemSettings.
             * @memberof votings_service
             * @interface ITxCryptoSystemSettings
             * @property {votings_service.ISealedBoxPublicKey|null} [public_key] TxCryptoSystemSettings public_key
             */
    
            /**
             * Constructs a new TxCryptoSystemSettings.
             * @memberof votings_service
             * @classdesc Represents a TxCryptoSystemSettings.
             * @implements ITxCryptoSystemSettings
             * @constructor
             * @param {votings_service.ITxCryptoSystemSettings=} [properties] Properties to set
             */
            function TxCryptoSystemSettings(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxCryptoSystemSettings public_key.
             * @member {votings_service.ISealedBoxPublicKey|null|undefined} public_key
             * @memberof votings_service.TxCryptoSystemSettings
             * @instance
             */
            TxCryptoSystemSettings.prototype.public_key = null;
    
            /**
             * Creates a new TxCryptoSystemSettings instance using the specified properties.
             * @function create
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {votings_service.ITxCryptoSystemSettings=} [properties] Properties to set
             * @returns {votings_service.TxCryptoSystemSettings} TxCryptoSystemSettings instance
             */
            TxCryptoSystemSettings.create = function create(properties) {
                return new TxCryptoSystemSettings(properties);
            };
    
            /**
             * Encodes the specified TxCryptoSystemSettings message. Does not implicitly {@link votings_service.TxCryptoSystemSettings.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {votings_service.ITxCryptoSystemSettings} message TxCryptoSystemSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxCryptoSystemSettings.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    $root.votings_service.SealedBoxPublicKey.encode(message.public_key, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified TxCryptoSystemSettings message, length delimited. Does not implicitly {@link votings_service.TxCryptoSystemSettings.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {votings_service.ITxCryptoSystemSettings} message TxCryptoSystemSettings message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxCryptoSystemSettings.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxCryptoSystemSettings message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxCryptoSystemSettings} TxCryptoSystemSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxCryptoSystemSettings.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxCryptoSystemSettings();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.public_key = $root.votings_service.SealedBoxPublicKey.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxCryptoSystemSettings message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxCryptoSystemSettings} TxCryptoSystemSettings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxCryptoSystemSettings.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxCryptoSystemSettings message.
             * @function verify
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxCryptoSystemSettings.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.public_key != null && message.hasOwnProperty("public_key")) {
                    var error = $root.votings_service.SealedBoxPublicKey.verify(message.public_key);
                    if (error)
                        return "public_key." + error;
                }
                return null;
            };
    
            /**
             * Creates a TxCryptoSystemSettings message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxCryptoSystemSettings} TxCryptoSystemSettings
             */
            TxCryptoSystemSettings.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxCryptoSystemSettings)
                    return object;
                var message = new $root.votings_service.TxCryptoSystemSettings();
                if (object.public_key != null) {
                    if (typeof object.public_key !== "object")
                        throw TypeError(".votings_service.TxCryptoSystemSettings.public_key: object expected");
                    message.public_key = $root.votings_service.SealedBoxPublicKey.fromObject(object.public_key);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a TxCryptoSystemSettings message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxCryptoSystemSettings
             * @static
             * @param {votings_service.TxCryptoSystemSettings} message TxCryptoSystemSettings
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxCryptoSystemSettings.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.public_key = null;
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    object.public_key = $root.votings_service.SealedBoxPublicKey.toObject(message.public_key, options);
                return object;
            };
    
            /**
             * Converts this TxCryptoSystemSettings to JSON.
             * @function toJSON
             * @memberof votings_service.TxCryptoSystemSettings
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxCryptoSystemSettings.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxCryptoSystemSettings;
        })();
    
        votings_service.TxBallotConfig = (function() {
    
            /**
             * Properties of a TxBallotConfig.
             * @memberof votings_service
             * @interface ITxBallotConfig
             * @property {number|null} [district_id] TxBallotConfig district_id
             * @property {string|null} [question] TxBallotConfig question
             * @property {Object.<string,string>|null} [options] TxBallotConfig options
             * @property {number|null} [min_choices] TxBallotConfig min_choices
             * @property {number|null} [max_choices] TxBallotConfig max_choices
             */
    
            /**
             * Constructs a new TxBallotConfig.
             * @memberof votings_service
             * @classdesc Represents a TxBallotConfig.
             * @implements ITxBallotConfig
             * @constructor
             * @param {votings_service.ITxBallotConfig=} [properties] Properties to set
             */
            function TxBallotConfig(properties) {
                this.options = {};
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxBallotConfig district_id.
             * @member {number} district_id
             * @memberof votings_service.TxBallotConfig
             * @instance
             */
            TxBallotConfig.prototype.district_id = 0;
    
            /**
             * TxBallotConfig question.
             * @member {string} question
             * @memberof votings_service.TxBallotConfig
             * @instance
             */
            TxBallotConfig.prototype.question = "";
    
            /**
             * TxBallotConfig options.
             * @member {Object.<string,string>} options
             * @memberof votings_service.TxBallotConfig
             * @instance
             */
            TxBallotConfig.prototype.options = $util.emptyObject;
    
            /**
             * TxBallotConfig min_choices.
             * @member {number} min_choices
             * @memberof votings_service.TxBallotConfig
             * @instance
             */
            TxBallotConfig.prototype.min_choices = 0;
    
            /**
             * TxBallotConfig max_choices.
             * @member {number} max_choices
             * @memberof votings_service.TxBallotConfig
             * @instance
             */
            TxBallotConfig.prototype.max_choices = 0;
    
            /**
             * Creates a new TxBallotConfig instance using the specified properties.
             * @function create
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {votings_service.ITxBallotConfig=} [properties] Properties to set
             * @returns {votings_service.TxBallotConfig} TxBallotConfig instance
             */
            TxBallotConfig.create = function create(properties) {
                return new TxBallotConfig(properties);
            };
    
            /**
             * Encodes the specified TxBallotConfig message. Does not implicitly {@link votings_service.TxBallotConfig.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {votings_service.ITxBallotConfig} message TxBallotConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxBallotConfig.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    writer.uint32(/* id 1, wireType 0 =*/8).uint32(message.district_id);
                if (message.question != null && message.hasOwnProperty("question"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.question);
                if (message.options != null && message.hasOwnProperty("options"))
                    for (var keys = Object.keys(message.options), i = 0; i < keys.length; ++i)
                        writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 0 =*/8).uint32(keys[i]).uint32(/* id 2, wireType 2 =*/18).string(message.options[keys[i]]).ldelim();
                if (message.min_choices != null && message.hasOwnProperty("min_choices"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint32(message.min_choices);
                if (message.max_choices != null && message.hasOwnProperty("max_choices"))
                    writer.uint32(/* id 5, wireType 0 =*/40).uint32(message.max_choices);
                return writer;
            };
    
            /**
             * Encodes the specified TxBallotConfig message, length delimited. Does not implicitly {@link votings_service.TxBallotConfig.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {votings_service.ITxBallotConfig} message TxBallotConfig message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxBallotConfig.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxBallotConfig message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxBallotConfig} TxBallotConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxBallotConfig.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxBallotConfig(), key;
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.district_id = reader.uint32();
                        break;
                    case 2:
                        message.question = reader.string();
                        break;
                    case 3:
                        reader.skip().pos++;
                        if (message.options === $util.emptyObject)
                            message.options = {};
                        key = reader.uint32();
                        reader.pos++;
                        message.options[key] = reader.string();
                        break;
                    case 4:
                        message.min_choices = reader.uint32();
                        break;
                    case 5:
                        message.max_choices = reader.uint32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxBallotConfig message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxBallotConfig} TxBallotConfig
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxBallotConfig.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxBallotConfig message.
             * @function verify
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxBallotConfig.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    if (!$util.isInteger(message.district_id))
                        return "district_id: integer expected";
                if (message.question != null && message.hasOwnProperty("question"))
                    if (!$util.isString(message.question))
                        return "question: string expected";
                if (message.options != null && message.hasOwnProperty("options")) {
                    if (!$util.isObject(message.options))
                        return "options: object expected";
                    var key = Object.keys(message.options);
                    for (var i = 0; i < key.length; ++i) {
                        if (!$util.key32Re.test(key[i]))
                            return "options: integer key{k:uint32} expected";
                        if (!$util.isString(message.options[key[i]]))
                            return "options: string{k:uint32} expected";
                    }
                }
                if (message.min_choices != null && message.hasOwnProperty("min_choices"))
                    if (!$util.isInteger(message.min_choices))
                        return "min_choices: integer expected";
                if (message.max_choices != null && message.hasOwnProperty("max_choices"))
                    if (!$util.isInteger(message.max_choices))
                        return "max_choices: integer expected";
                return null;
            };
    
            /**
             * Creates a TxBallotConfig message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxBallotConfig} TxBallotConfig
             */
            TxBallotConfig.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxBallotConfig)
                    return object;
                var message = new $root.votings_service.TxBallotConfig();
                if (object.district_id != null)
                    message.district_id = object.district_id >>> 0;
                if (object.question != null)
                    message.question = String(object.question);
                if (object.options) {
                    if (typeof object.options !== "object")
                        throw TypeError(".votings_service.TxBallotConfig.options: object expected");
                    message.options = {};
                    for (var keys = Object.keys(object.options), i = 0; i < keys.length; ++i)
                        message.options[keys[i]] = String(object.options[keys[i]]);
                }
                if (object.min_choices != null)
                    message.min_choices = object.min_choices >>> 0;
                if (object.max_choices != null)
                    message.max_choices = object.max_choices >>> 0;
                return message;
            };
    
            /**
             * Creates a plain object from a TxBallotConfig message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxBallotConfig
             * @static
             * @param {votings_service.TxBallotConfig} message TxBallotConfig
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxBallotConfig.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.objects || options.defaults)
                    object.options = {};
                if (options.defaults) {
                    object.district_id = 0;
                    object.question = "";
                    object.min_choices = 0;
                    object.max_choices = 0;
                }
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    object.district_id = message.district_id;
                if (message.question != null && message.hasOwnProperty("question"))
                    object.question = message.question;
                var keys2;
                if (message.options && (keys2 = Object.keys(message.options)).length) {
                    object.options = {};
                    for (var j = 0; j < keys2.length; ++j)
                        object.options[keys2[j]] = message.options[keys2[j]];
                }
                if (message.min_choices != null && message.hasOwnProperty("min_choices"))
                    object.min_choices = message.min_choices;
                if (message.max_choices != null && message.hasOwnProperty("max_choices"))
                    object.max_choices = message.max_choices;
                return object;
            };
    
            /**
             * Converts this TxBallotConfig to JSON.
             * @function toJSON
             * @memberof votings_service.TxBallotConfig
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxBallotConfig.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxBallotConfig;
        })();
    
        votings_service.TxCreateVoting = (function() {
    
            /**
             * Properties of a TxCreateVoting.
             * @memberof votings_service
             * @interface ITxCreateVoting
             * @property {votings_service.ITxCryptoSystemSettings|null} [crypto_system] TxCreateVoting crypto_system
             * @property {Array.<votings_service.ITxBallotConfig>|null} [ballots_config] TxCreateVoting ballots_config
             */
    
            /**
             * Constructs a new TxCreateVoting.
             * @memberof votings_service
             * @classdesc Represents a TxCreateVoting.
             * @implements ITxCreateVoting
             * @constructor
             * @param {votings_service.ITxCreateVoting=} [properties] Properties to set
             */
            function TxCreateVoting(properties) {
                this.ballots_config = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxCreateVoting crypto_system.
             * @member {votings_service.ITxCryptoSystemSettings|null|undefined} crypto_system
             * @memberof votings_service.TxCreateVoting
             * @instance
             */
            TxCreateVoting.prototype.crypto_system = null;
    
            /**
             * TxCreateVoting ballots_config.
             * @member {Array.<votings_service.ITxBallotConfig>} ballots_config
             * @memberof votings_service.TxCreateVoting
             * @instance
             */
            TxCreateVoting.prototype.ballots_config = $util.emptyArray;
    
            /**
             * Creates a new TxCreateVoting instance using the specified properties.
             * @function create
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {votings_service.ITxCreateVoting=} [properties] Properties to set
             * @returns {votings_service.TxCreateVoting} TxCreateVoting instance
             */
            TxCreateVoting.create = function create(properties) {
                return new TxCreateVoting(properties);
            };
    
            /**
             * Encodes the specified TxCreateVoting message. Does not implicitly {@link votings_service.TxCreateVoting.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {votings_service.ITxCreateVoting} message TxCreateVoting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxCreateVoting.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.crypto_system != null && message.hasOwnProperty("crypto_system"))
                    $root.votings_service.TxCryptoSystemSettings.encode(message.crypto_system, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
                if (message.ballots_config != null && message.ballots_config.length)
                    for (var i = 0; i < message.ballots_config.length; ++i)
                        $root.votings_service.TxBallotConfig.encode(message.ballots_config[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified TxCreateVoting message, length delimited. Does not implicitly {@link votings_service.TxCreateVoting.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {votings_service.ITxCreateVoting} message TxCreateVoting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxCreateVoting.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxCreateVoting message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxCreateVoting} TxCreateVoting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxCreateVoting.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxCreateVoting();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.crypto_system = $root.votings_service.TxCryptoSystemSettings.decode(reader, reader.uint32());
                        break;
                    case 2:
                        if (!(message.ballots_config && message.ballots_config.length))
                            message.ballots_config = [];
                        message.ballots_config.push($root.votings_service.TxBallotConfig.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxCreateVoting message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxCreateVoting} TxCreateVoting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxCreateVoting.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxCreateVoting message.
             * @function verify
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxCreateVoting.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.crypto_system != null && message.hasOwnProperty("crypto_system")) {
                    var error = $root.votings_service.TxCryptoSystemSettings.verify(message.crypto_system);
                    if (error)
                        return "crypto_system." + error;
                }
                if (message.ballots_config != null && message.hasOwnProperty("ballots_config")) {
                    if (!Array.isArray(message.ballots_config))
                        return "ballots_config: array expected";
                    for (var i = 0; i < message.ballots_config.length; ++i) {
                        var error = $root.votings_service.TxBallotConfig.verify(message.ballots_config[i]);
                        if (error)
                            return "ballots_config." + error;
                    }
                }
                return null;
            };
    
            /**
             * Creates a TxCreateVoting message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxCreateVoting} TxCreateVoting
             */
            TxCreateVoting.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxCreateVoting)
                    return object;
                var message = new $root.votings_service.TxCreateVoting();
                if (object.crypto_system != null) {
                    if (typeof object.crypto_system !== "object")
                        throw TypeError(".votings_service.TxCreateVoting.crypto_system: object expected");
                    message.crypto_system = $root.votings_service.TxCryptoSystemSettings.fromObject(object.crypto_system);
                }
                if (object.ballots_config) {
                    if (!Array.isArray(object.ballots_config))
                        throw TypeError(".votings_service.TxCreateVoting.ballots_config: array expected");
                    message.ballots_config = [];
                    for (var i = 0; i < object.ballots_config.length; ++i) {
                        if (typeof object.ballots_config[i] !== "object")
                            throw TypeError(".votings_service.TxCreateVoting.ballots_config: object expected");
                        message.ballots_config[i] = $root.votings_service.TxBallotConfig.fromObject(object.ballots_config[i]);
                    }
                }
                return message;
            };
    
            /**
             * Creates a plain object from a TxCreateVoting message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxCreateVoting
             * @static
             * @param {votings_service.TxCreateVoting} message TxCreateVoting
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxCreateVoting.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.ballots_config = [];
                if (options.defaults)
                    object.crypto_system = null;
                if (message.crypto_system != null && message.hasOwnProperty("crypto_system"))
                    object.crypto_system = $root.votings_service.TxCryptoSystemSettings.toObject(message.crypto_system, options);
                if (message.ballots_config && message.ballots_config.length) {
                    object.ballots_config = [];
                    for (var j = 0; j < message.ballots_config.length; ++j)
                        object.ballots_config[j] = $root.votings_service.TxBallotConfig.toObject(message.ballots_config[j], options);
                }
                return object;
            };
    
            /**
             * Converts this TxCreateVoting to JSON.
             * @function toJSON
             * @memberof votings_service.TxCreateVoting
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxCreateVoting.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxCreateVoting;
        })();
    
        votings_service.TxRegisterVoters = (function() {
    
            /**
             * Properties of a TxRegisterVoters.
             * @memberof votings_service
             * @interface ITxRegisterVoters
             * @property {string|null} [voting_id] TxRegisterVoters voting_id
             * @property {Array.<string>|null} [voters] TxRegisterVoters voters
             */
    
            /**
             * Constructs a new TxRegisterVoters.
             * @memberof votings_service
             * @classdesc Represents a TxRegisterVoters.
             * @implements ITxRegisterVoters
             * @constructor
             * @param {votings_service.ITxRegisterVoters=} [properties] Properties to set
             */
            function TxRegisterVoters(properties) {
                this.voters = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxRegisterVoters voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxRegisterVoters
             * @instance
             */
            TxRegisterVoters.prototype.voting_id = "";
    
            /**
             * TxRegisterVoters voters.
             * @member {Array.<string>} voters
             * @memberof votings_service.TxRegisterVoters
             * @instance
             */
            TxRegisterVoters.prototype.voters = $util.emptyArray;
    
            /**
             * Creates a new TxRegisterVoters instance using the specified properties.
             * @function create
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {votings_service.ITxRegisterVoters=} [properties] Properties to set
             * @returns {votings_service.TxRegisterVoters} TxRegisterVoters instance
             */
            TxRegisterVoters.create = function create(properties) {
                return new TxRegisterVoters(properties);
            };
    
            /**
             * Encodes the specified TxRegisterVoters message. Does not implicitly {@link votings_service.TxRegisterVoters.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {votings_service.ITxRegisterVoters} message TxRegisterVoters message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxRegisterVoters.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.voters != null && message.voters.length)
                    for (var i = 0; i < message.voters.length; ++i)
                        writer.uint32(/* id 2, wireType 2 =*/18).string(message.voters[i]);
                return writer;
            };
    
            /**
             * Encodes the specified TxRegisterVoters message, length delimited. Does not implicitly {@link votings_service.TxRegisterVoters.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {votings_service.ITxRegisterVoters} message TxRegisterVoters message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxRegisterVoters.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxRegisterVoters message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxRegisterVoters} TxRegisterVoters
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxRegisterVoters.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxRegisterVoters();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        if (!(message.voters && message.voters.length))
                            message.voters = [];
                        message.voters.push(reader.string());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxRegisterVoters message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxRegisterVoters} TxRegisterVoters
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxRegisterVoters.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxRegisterVoters message.
             * @function verify
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxRegisterVoters.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.voters != null && message.hasOwnProperty("voters")) {
                    if (!Array.isArray(message.voters))
                        return "voters: array expected";
                    for (var i = 0; i < message.voters.length; ++i)
                        if (!$util.isString(message.voters[i]))
                            return "voters: string[] expected";
                }
                return null;
            };
    
            /**
             * Creates a TxRegisterVoters message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxRegisterVoters} TxRegisterVoters
             */
            TxRegisterVoters.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxRegisterVoters)
                    return object;
                var message = new $root.votings_service.TxRegisterVoters();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.voters) {
                    if (!Array.isArray(object.voters))
                        throw TypeError(".votings_service.TxRegisterVoters.voters: array expected");
                    message.voters = [];
                    for (var i = 0; i < object.voters.length; ++i)
                        message.voters[i] = String(object.voters[i]);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a TxRegisterVoters message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxRegisterVoters
             * @static
             * @param {votings_service.TxRegisterVoters} message TxRegisterVoters
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxRegisterVoters.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.voters = [];
                if (options.defaults)
                    object.voting_id = "";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.voters && message.voters.length) {
                    object.voters = [];
                    for (var j = 0; j < message.voters.length; ++j)
                        object.voters[j] = message.voters[j];
                }
                return object;
            };
    
            /**
             * Converts this TxRegisterVoters to JSON.
             * @function toJSON
             * @memberof votings_service.TxRegisterVoters
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxRegisterVoters.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxRegisterVoters;
        })();
    
        votings_service.TxStopRegistration = (function() {
    
            /**
             * Properties of a TxStopRegistration.
             * @memberof votings_service
             * @interface ITxStopRegistration
             * @property {string|null} [voting_id] TxStopRegistration voting_id
             * @property {number|Long|null} [seed] TxStopRegistration seed
             */
    
            /**
             * Constructs a new TxStopRegistration.
             * @memberof votings_service
             * @classdesc Represents a TxStopRegistration.
             * @implements ITxStopRegistration
             * @constructor
             * @param {votings_service.ITxStopRegistration=} [properties] Properties to set
             */
            function TxStopRegistration(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxStopRegistration voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxStopRegistration
             * @instance
             */
            TxStopRegistration.prototype.voting_id = "";
    
            /**
             * TxStopRegistration seed.
             * @member {number|Long} seed
             * @memberof votings_service.TxStopRegistration
             * @instance
             */
            TxStopRegistration.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new TxStopRegistration instance using the specified properties.
             * @function create
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {votings_service.ITxStopRegistration=} [properties] Properties to set
             * @returns {votings_service.TxStopRegistration} TxStopRegistration instance
             */
            TxStopRegistration.create = function create(properties) {
                return new TxStopRegistration(properties);
            };
    
            /**
             * Encodes the specified TxStopRegistration message. Does not implicitly {@link votings_service.TxStopRegistration.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {votings_service.ITxStopRegistration} message TxStopRegistration message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxStopRegistration.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.seed != null && message.hasOwnProperty("seed"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.seed);
                return writer;
            };
    
            /**
             * Encodes the specified TxStopRegistration message, length delimited. Does not implicitly {@link votings_service.TxStopRegistration.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {votings_service.ITxStopRegistration} message TxStopRegistration message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxStopRegistration.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxStopRegistration message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxStopRegistration} TxStopRegistration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxStopRegistration.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxStopRegistration();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.seed = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxStopRegistration message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxStopRegistration} TxStopRegistration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxStopRegistration.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxStopRegistration message.
             * @function verify
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxStopRegistration.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                        return "seed: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a TxStopRegistration message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxStopRegistration} TxStopRegistration
             */
            TxStopRegistration.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxStopRegistration)
                    return object;
                var message = new $root.votings_service.TxStopRegistration();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.seed != null)
                    if ($util.Long)
                        (message.seed = $util.Long.fromValue(object.seed)).unsigned = true;
                    else if (typeof object.seed === "string")
                        message.seed = parseInt(object.seed, 10);
                    else if (typeof object.seed === "number")
                        message.seed = object.seed;
                    else if (typeof object.seed === "object")
                        message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a TxStopRegistration message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxStopRegistration
             * @static
             * @param {votings_service.TxStopRegistration} message TxStopRegistration
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxStopRegistration.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seed = options.longs === String ? "0" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (typeof message.seed === "number")
                        object.seed = options.longs === String ? String(message.seed) : message.seed;
                    else
                        object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber(true) : message.seed;
                return object;
            };
    
            /**
             * Converts this TxStopRegistration to JSON.
             * @function toJSON
             * @memberof votings_service.TxStopRegistration
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxStopRegistration.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxStopRegistration;
        })();
    
        votings_service.TxRevokeVoterParticipation = (function() {
    
            /**
             * Properties of a TxRevokeVoterParticipation.
             * @memberof votings_service
             * @interface ITxRevokeVoterParticipation
             * @property {string|null} [voting_id] TxRevokeVoterParticipation voting_id
             * @property {string|null} [voter_id] TxRevokeVoterParticipation voter_id
             * @property {number|Long|null} [seed] TxRevokeVoterParticipation seed
             */
    
            /**
             * Constructs a new TxRevokeVoterParticipation.
             * @memberof votings_service
             * @classdesc Represents a TxRevokeVoterParticipation.
             * @implements ITxRevokeVoterParticipation
             * @constructor
             * @param {votings_service.ITxRevokeVoterParticipation=} [properties] Properties to set
             */
            function TxRevokeVoterParticipation(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxRevokeVoterParticipation voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxRevokeVoterParticipation
             * @instance
             */
            TxRevokeVoterParticipation.prototype.voting_id = "";
    
            /**
             * TxRevokeVoterParticipation voter_id.
             * @member {string} voter_id
             * @memberof votings_service.TxRevokeVoterParticipation
             * @instance
             */
            TxRevokeVoterParticipation.prototype.voter_id = "";
    
            /**
             * TxRevokeVoterParticipation seed.
             * @member {number|Long} seed
             * @memberof votings_service.TxRevokeVoterParticipation
             * @instance
             */
            TxRevokeVoterParticipation.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new TxRevokeVoterParticipation instance using the specified properties.
             * @function create
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {votings_service.ITxRevokeVoterParticipation=} [properties] Properties to set
             * @returns {votings_service.TxRevokeVoterParticipation} TxRevokeVoterParticipation instance
             */
            TxRevokeVoterParticipation.create = function create(properties) {
                return new TxRevokeVoterParticipation(properties);
            };
    
            /**
             * Encodes the specified TxRevokeVoterParticipation message. Does not implicitly {@link votings_service.TxRevokeVoterParticipation.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {votings_service.ITxRevokeVoterParticipation} message TxRevokeVoterParticipation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxRevokeVoterParticipation.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.voter_id);
                if (message.seed != null && message.hasOwnProperty("seed"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.seed);
                return writer;
            };
    
            /**
             * Encodes the specified TxRevokeVoterParticipation message, length delimited. Does not implicitly {@link votings_service.TxRevokeVoterParticipation.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {votings_service.ITxRevokeVoterParticipation} message TxRevokeVoterParticipation message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxRevokeVoterParticipation.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxRevokeVoterParticipation message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxRevokeVoterParticipation} TxRevokeVoterParticipation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxRevokeVoterParticipation.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxRevokeVoterParticipation();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.voter_id = reader.string();
                        break;
                    case 3:
                        message.seed = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxRevokeVoterParticipation message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxRevokeVoterParticipation} TxRevokeVoterParticipation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxRevokeVoterParticipation.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxRevokeVoterParticipation message.
             * @function verify
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxRevokeVoterParticipation.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    if (!$util.isString(message.voter_id))
                        return "voter_id: string expected";
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                        return "seed: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a TxRevokeVoterParticipation message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxRevokeVoterParticipation} TxRevokeVoterParticipation
             */
            TxRevokeVoterParticipation.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxRevokeVoterParticipation)
                    return object;
                var message = new $root.votings_service.TxRevokeVoterParticipation();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.voter_id != null)
                    message.voter_id = String(object.voter_id);
                if (object.seed != null)
                    if ($util.Long)
                        (message.seed = $util.Long.fromValue(object.seed)).unsigned = true;
                    else if (typeof object.seed === "string")
                        message.seed = parseInt(object.seed, 10);
                    else if (typeof object.seed === "number")
                        message.seed = object.seed;
                    else if (typeof object.seed === "object")
                        message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a TxRevokeVoterParticipation message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxRevokeVoterParticipation
             * @static
             * @param {votings_service.TxRevokeVoterParticipation} message TxRevokeVoterParticipation
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxRevokeVoterParticipation.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    object.voter_id = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seed = options.longs === String ? "0" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    object.voter_id = message.voter_id;
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (typeof message.seed === "number")
                        object.seed = options.longs === String ? String(message.seed) : message.seed;
                    else
                        object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber(true) : message.seed;
                return object;
            };
    
            /**
             * Converts this TxRevokeVoterParticipation to JSON.
             * @function toJSON
             * @memberof votings_service.TxRevokeVoterParticipation
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxRevokeVoterParticipation.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxRevokeVoterParticipation;
        })();
    
        votings_service.TxIssueBallot = (function() {
    
            /**
             * Properties of a TxIssueBallot.
             * @memberof votings_service
             * @interface ITxIssueBallot
             * @property {string|null} [voting_id] TxIssueBallot voting_id
             * @property {string|null} [voter_id] TxIssueBallot voter_id
             * @property {number|null} [district_id] TxIssueBallot district_id
             * @property {number|Long|null} [seed] TxIssueBallot seed
             */
    
            /**
             * Constructs a new TxIssueBallot.
             * @memberof votings_service
             * @classdesc Represents a TxIssueBallot.
             * @implements ITxIssueBallot
             * @constructor
             * @param {votings_service.ITxIssueBallot=} [properties] Properties to set
             */
            function TxIssueBallot(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxIssueBallot voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxIssueBallot
             * @instance
             */
            TxIssueBallot.prototype.voting_id = "";
    
            /**
             * TxIssueBallot voter_id.
             * @member {string} voter_id
             * @memberof votings_service.TxIssueBallot
             * @instance
             */
            TxIssueBallot.prototype.voter_id = "";
    
            /**
             * TxIssueBallot district_id.
             * @member {number} district_id
             * @memberof votings_service.TxIssueBallot
             * @instance
             */
            TxIssueBallot.prototype.district_id = 0;
    
            /**
             * TxIssueBallot seed.
             * @member {number|Long} seed
             * @memberof votings_service.TxIssueBallot
             * @instance
             */
            TxIssueBallot.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new TxIssueBallot instance using the specified properties.
             * @function create
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {votings_service.ITxIssueBallot=} [properties] Properties to set
             * @returns {votings_service.TxIssueBallot} TxIssueBallot instance
             */
            TxIssueBallot.create = function create(properties) {
                return new TxIssueBallot(properties);
            };
    
            /**
             * Encodes the specified TxIssueBallot message. Does not implicitly {@link votings_service.TxIssueBallot.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {votings_service.ITxIssueBallot} message TxIssueBallot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxIssueBallot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.voter_id);
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint32(message.district_id);
                if (message.seed != null && message.hasOwnProperty("seed"))
                    writer.uint32(/* id 4, wireType 0 =*/32).uint64(message.seed);
                return writer;
            };
    
            /**
             * Encodes the specified TxIssueBallot message, length delimited. Does not implicitly {@link votings_service.TxIssueBallot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {votings_service.ITxIssueBallot} message TxIssueBallot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxIssueBallot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxIssueBallot message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxIssueBallot} TxIssueBallot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxIssueBallot.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxIssueBallot();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.voter_id = reader.string();
                        break;
                    case 3:
                        message.district_id = reader.uint32();
                        break;
                    case 4:
                        message.seed = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxIssueBallot message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxIssueBallot} TxIssueBallot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxIssueBallot.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxIssueBallot message.
             * @function verify
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxIssueBallot.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    if (!$util.isString(message.voter_id))
                        return "voter_id: string expected";
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    if (!$util.isInteger(message.district_id))
                        return "district_id: integer expected";
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                        return "seed: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a TxIssueBallot message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxIssueBallot} TxIssueBallot
             */
            TxIssueBallot.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxIssueBallot)
                    return object;
                var message = new $root.votings_service.TxIssueBallot();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.voter_id != null)
                    message.voter_id = String(object.voter_id);
                if (object.district_id != null)
                    message.district_id = object.district_id >>> 0;
                if (object.seed != null)
                    if ($util.Long)
                        (message.seed = $util.Long.fromValue(object.seed)).unsigned = true;
                    else if (typeof object.seed === "string")
                        message.seed = parseInt(object.seed, 10);
                    else if (typeof object.seed === "number")
                        message.seed = object.seed;
                    else if (typeof object.seed === "object")
                        message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a TxIssueBallot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxIssueBallot
             * @static
             * @param {votings_service.TxIssueBallot} message TxIssueBallot
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxIssueBallot.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    object.voter_id = "";
                    object.district_id = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seed = options.longs === String ? "0" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.voter_id != null && message.hasOwnProperty("voter_id"))
                    object.voter_id = message.voter_id;
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    object.district_id = message.district_id;
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (typeof message.seed === "number")
                        object.seed = options.longs === String ? String(message.seed) : message.seed;
                    else
                        object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber(true) : message.seed;
                return object;
            };
    
            /**
             * Converts this TxIssueBallot to JSON.
             * @function toJSON
             * @memberof votings_service.TxIssueBallot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxIssueBallot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxIssueBallot;
        })();
    
        votings_service.TxAddVoterKey = (function() {
    
            /**
             * Properties of a TxAddVoterKey.
             * @memberof votings_service
             * @interface ITxAddVoterKey
             * @property {string|null} [voting_id] TxAddVoterKey voting_id
             * @property {exonum.IPublicKey|null} [voter_key] TxAddVoterKey voter_key
             */
    
            /**
             * Constructs a new TxAddVoterKey.
             * @memberof votings_service
             * @classdesc Represents a TxAddVoterKey.
             * @implements ITxAddVoterKey
             * @constructor
             * @param {votings_service.ITxAddVoterKey=} [properties] Properties to set
             */
            function TxAddVoterKey(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxAddVoterKey voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxAddVoterKey
             * @instance
             */
            TxAddVoterKey.prototype.voting_id = "";
    
            /**
             * TxAddVoterKey voter_key.
             * @member {exonum.IPublicKey|null|undefined} voter_key
             * @memberof votings_service.TxAddVoterKey
             * @instance
             */
            TxAddVoterKey.prototype.voter_key = null;
    
            /**
             * Creates a new TxAddVoterKey instance using the specified properties.
             * @function create
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {votings_service.ITxAddVoterKey=} [properties] Properties to set
             * @returns {votings_service.TxAddVoterKey} TxAddVoterKey instance
             */
            TxAddVoterKey.create = function create(properties) {
                return new TxAddVoterKey(properties);
            };
    
            /**
             * Encodes the specified TxAddVoterKey message. Does not implicitly {@link votings_service.TxAddVoterKey.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {votings_service.ITxAddVoterKey} message TxAddVoterKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxAddVoterKey.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.voter_key != null && message.hasOwnProperty("voter_key"))
                    $root.exonum.PublicKey.encode(message.voter_key, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified TxAddVoterKey message, length delimited. Does not implicitly {@link votings_service.TxAddVoterKey.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {votings_service.ITxAddVoterKey} message TxAddVoterKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxAddVoterKey.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxAddVoterKey message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxAddVoterKey} TxAddVoterKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxAddVoterKey.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxAddVoterKey();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.voter_key = $root.exonum.PublicKey.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxAddVoterKey message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxAddVoterKey} TxAddVoterKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxAddVoterKey.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxAddVoterKey message.
             * @function verify
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxAddVoterKey.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.voter_key != null && message.hasOwnProperty("voter_key")) {
                    var error = $root.exonum.PublicKey.verify(message.voter_key);
                    if (error)
                        return "voter_key." + error;
                }
                return null;
            };
    
            /**
             * Creates a TxAddVoterKey message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxAddVoterKey} TxAddVoterKey
             */
            TxAddVoterKey.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxAddVoterKey)
                    return object;
                var message = new $root.votings_service.TxAddVoterKey();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.voter_key != null) {
                    if (typeof object.voter_key !== "object")
                        throw TypeError(".votings_service.TxAddVoterKey.voter_key: object expected");
                    message.voter_key = $root.exonum.PublicKey.fromObject(object.voter_key);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a TxAddVoterKey message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxAddVoterKey
             * @static
             * @param {votings_service.TxAddVoterKey} message TxAddVoterKey
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxAddVoterKey.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    object.voter_key = null;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.voter_key != null && message.hasOwnProperty("voter_key"))
                    object.voter_key = $root.exonum.PublicKey.toObject(message.voter_key, options);
                return object;
            };
    
            /**
             * Converts this TxAddVoterKey to JSON.
             * @function toJSON
             * @memberof votings_service.TxAddVoterKey
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxAddVoterKey.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxAddVoterKey;
        })();
    
        votings_service.TxEncryptedChoice = (function() {
    
            /**
             * Properties of a TxEncryptedChoice.
             * @memberof votings_service
             * @interface ITxEncryptedChoice
             * @property {Uint8Array|null} [encrypted_message] TxEncryptedChoice encrypted_message
             * @property {votings_service.ISealedBoxNonce|null} [nonce] TxEncryptedChoice nonce
             * @property {votings_service.ISealedBoxPublicKey|null} [public_key] TxEncryptedChoice public_key
             */
    
            /**
             * Constructs a new TxEncryptedChoice.
             * @memberof votings_service
             * @classdesc Represents a TxEncryptedChoice.
             * @implements ITxEncryptedChoice
             * @constructor
             * @param {votings_service.ITxEncryptedChoice=} [properties] Properties to set
             */
            function TxEncryptedChoice(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxEncryptedChoice encrypted_message.
             * @member {Uint8Array} encrypted_message
             * @memberof votings_service.TxEncryptedChoice
             * @instance
             */
            TxEncryptedChoice.prototype.encrypted_message = $util.newBuffer([]);
    
            /**
             * TxEncryptedChoice nonce.
             * @member {votings_service.ISealedBoxNonce|null|undefined} nonce
             * @memberof votings_service.TxEncryptedChoice
             * @instance
             */
            TxEncryptedChoice.prototype.nonce = null;
    
            /**
             * TxEncryptedChoice public_key.
             * @member {votings_service.ISealedBoxPublicKey|null|undefined} public_key
             * @memberof votings_service.TxEncryptedChoice
             * @instance
             */
            TxEncryptedChoice.prototype.public_key = null;
    
            /**
             * Creates a new TxEncryptedChoice instance using the specified properties.
             * @function create
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {votings_service.ITxEncryptedChoice=} [properties] Properties to set
             * @returns {votings_service.TxEncryptedChoice} TxEncryptedChoice instance
             */
            TxEncryptedChoice.create = function create(properties) {
                return new TxEncryptedChoice(properties);
            };
    
            /**
             * Encodes the specified TxEncryptedChoice message. Does not implicitly {@link votings_service.TxEncryptedChoice.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {votings_service.ITxEncryptedChoice} message TxEncryptedChoice message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxEncryptedChoice.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.encrypted_message != null && message.hasOwnProperty("encrypted_message"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.encrypted_message);
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    $root.votings_service.SealedBoxNonce.encode(message.nonce, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    $root.votings_service.SealedBoxPublicKey.encode(message.public_key, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified TxEncryptedChoice message, length delimited. Does not implicitly {@link votings_service.TxEncryptedChoice.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {votings_service.ITxEncryptedChoice} message TxEncryptedChoice message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxEncryptedChoice.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxEncryptedChoice message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxEncryptedChoice} TxEncryptedChoice
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxEncryptedChoice.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxEncryptedChoice();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.encrypted_message = reader.bytes();
                        break;
                    case 2:
                        message.nonce = $root.votings_service.SealedBoxNonce.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.public_key = $root.votings_service.SealedBoxPublicKey.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxEncryptedChoice message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxEncryptedChoice} TxEncryptedChoice
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxEncryptedChoice.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxEncryptedChoice message.
             * @function verify
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxEncryptedChoice.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.encrypted_message != null && message.hasOwnProperty("encrypted_message"))
                    if (!(message.encrypted_message && typeof message.encrypted_message.length === "number" || $util.isString(message.encrypted_message)))
                        return "encrypted_message: buffer expected";
                if (message.nonce != null && message.hasOwnProperty("nonce")) {
                    var error = $root.votings_service.SealedBoxNonce.verify(message.nonce);
                    if (error)
                        return "nonce." + error;
                }
                if (message.public_key != null && message.hasOwnProperty("public_key")) {
                    var error = $root.votings_service.SealedBoxPublicKey.verify(message.public_key);
                    if (error)
                        return "public_key." + error;
                }
                return null;
            };
    
            /**
             * Creates a TxEncryptedChoice message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxEncryptedChoice} TxEncryptedChoice
             */
            TxEncryptedChoice.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxEncryptedChoice)
                    return object;
                var message = new $root.votings_service.TxEncryptedChoice();
                if (object.encrypted_message != null)
                    if (typeof object.encrypted_message === "string")
                        $util.base64.decode(object.encrypted_message, message.encrypted_message = $util.newBuffer($util.base64.length(object.encrypted_message)), 0);
                    else if (object.encrypted_message.length)
                        message.encrypted_message = object.encrypted_message;
                if (object.nonce != null) {
                    if (typeof object.nonce !== "object")
                        throw TypeError(".votings_service.TxEncryptedChoice.nonce: object expected");
                    message.nonce = $root.votings_service.SealedBoxNonce.fromObject(object.nonce);
                }
                if (object.public_key != null) {
                    if (typeof object.public_key !== "object")
                        throw TypeError(".votings_service.TxEncryptedChoice.public_key: object expected");
                    message.public_key = $root.votings_service.SealedBoxPublicKey.fromObject(object.public_key);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a TxEncryptedChoice message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxEncryptedChoice
             * @static
             * @param {votings_service.TxEncryptedChoice} message TxEncryptedChoice
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxEncryptedChoice.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    if (options.bytes === String)
                        object.encrypted_message = "";
                    else {
                        object.encrypted_message = [];
                        if (options.bytes !== Array)
                            object.encrypted_message = $util.newBuffer(object.encrypted_message);
                    }
                    object.nonce = null;
                    object.public_key = null;
                }
                if (message.encrypted_message != null && message.hasOwnProperty("encrypted_message"))
                    object.encrypted_message = options.bytes === String ? $util.base64.encode(message.encrypted_message, 0, message.encrypted_message.length) : options.bytes === Array ? Array.prototype.slice.call(message.encrypted_message) : message.encrypted_message;
                if (message.nonce != null && message.hasOwnProperty("nonce"))
                    object.nonce = $root.votings_service.SealedBoxNonce.toObject(message.nonce, options);
                if (message.public_key != null && message.hasOwnProperty("public_key"))
                    object.public_key = $root.votings_service.SealedBoxPublicKey.toObject(message.public_key, options);
                return object;
            };
    
            /**
             * Converts this TxEncryptedChoice to JSON.
             * @function toJSON
             * @memberof votings_service.TxEncryptedChoice
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxEncryptedChoice.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxEncryptedChoice;
        })();
    
        votings_service.TxStoreBallot = (function() {
    
            /**
             * Properties of a TxStoreBallot.
             * @memberof votings_service
             * @interface ITxStoreBallot
             * @property {string|null} [voting_id] TxStoreBallot voting_id
             * @property {number|null} [district_id] TxStoreBallot district_id
             * @property {votings_service.ITxEncryptedChoice|null} [encrypted_choice] TxStoreBallot encrypted_choice
             */
    
            /**
             * Constructs a new TxStoreBallot.
             * @memberof votings_service
             * @classdesc Represents a TxStoreBallot.
             * @implements ITxStoreBallot
             * @constructor
             * @param {votings_service.ITxStoreBallot=} [properties] Properties to set
             */
            function TxStoreBallot(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxStoreBallot voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxStoreBallot
             * @instance
             */
            TxStoreBallot.prototype.voting_id = "";
    
            /**
             * TxStoreBallot district_id.
             * @member {number} district_id
             * @memberof votings_service.TxStoreBallot
             * @instance
             */
            TxStoreBallot.prototype.district_id = 0;
    
            /**
             * TxStoreBallot encrypted_choice.
             * @member {votings_service.ITxEncryptedChoice|null|undefined} encrypted_choice
             * @memberof votings_service.TxStoreBallot
             * @instance
             */
            TxStoreBallot.prototype.encrypted_choice = null;
    
            /**
             * Creates a new TxStoreBallot instance using the specified properties.
             * @function create
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {votings_service.ITxStoreBallot=} [properties] Properties to set
             * @returns {votings_service.TxStoreBallot} TxStoreBallot instance
             */
            TxStoreBallot.create = function create(properties) {
                return new TxStoreBallot(properties);
            };
    
            /**
             * Encodes the specified TxStoreBallot message. Does not implicitly {@link votings_service.TxStoreBallot.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {votings_service.ITxStoreBallot} message TxStoreBallot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxStoreBallot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.district_id);
                if (message.encrypted_choice != null && message.hasOwnProperty("encrypted_choice"))
                    $root.votings_service.TxEncryptedChoice.encode(message.encrypted_choice, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
                return writer;
            };
    
            /**
             * Encodes the specified TxStoreBallot message, length delimited. Does not implicitly {@link votings_service.TxStoreBallot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {votings_service.ITxStoreBallot} message TxStoreBallot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxStoreBallot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxStoreBallot message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxStoreBallot} TxStoreBallot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxStoreBallot.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxStoreBallot();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.district_id = reader.uint32();
                        break;
                    case 3:
                        message.encrypted_choice = $root.votings_service.TxEncryptedChoice.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxStoreBallot message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxStoreBallot} TxStoreBallot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxStoreBallot.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxStoreBallot message.
             * @function verify
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxStoreBallot.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    if (!$util.isInteger(message.district_id))
                        return "district_id: integer expected";
                if (message.encrypted_choice != null && message.hasOwnProperty("encrypted_choice")) {
                    var error = $root.votings_service.TxEncryptedChoice.verify(message.encrypted_choice);
                    if (error)
                        return "encrypted_choice." + error;
                }
                return null;
            };
    
            /**
             * Creates a TxStoreBallot message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxStoreBallot} TxStoreBallot
             */
            TxStoreBallot.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxStoreBallot)
                    return object;
                var message = new $root.votings_service.TxStoreBallot();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.district_id != null)
                    message.district_id = object.district_id >>> 0;
                if (object.encrypted_choice != null) {
                    if (typeof object.encrypted_choice !== "object")
                        throw TypeError(".votings_service.TxStoreBallot.encrypted_choice: object expected");
                    message.encrypted_choice = $root.votings_service.TxEncryptedChoice.fromObject(object.encrypted_choice);
                }
                return message;
            };
    
            /**
             * Creates a plain object from a TxStoreBallot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxStoreBallot
             * @static
             * @param {votings_service.TxStoreBallot} message TxStoreBallot
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxStoreBallot.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    object.district_id = 0;
                    object.encrypted_choice = null;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.district_id != null && message.hasOwnProperty("district_id"))
                    object.district_id = message.district_id;
                if (message.encrypted_choice != null && message.hasOwnProperty("encrypted_choice"))
                    object.encrypted_choice = $root.votings_service.TxEncryptedChoice.toObject(message.encrypted_choice, options);
                return object;
            };
    
            /**
             * Converts this TxStoreBallot to JSON.
             * @function toJSON
             * @memberof votings_service.TxStoreBallot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxStoreBallot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxStoreBallot;
        })();
    
        votings_service.TxStopVoting = (function() {
    
            /**
             * Properties of a TxStopVoting.
             * @memberof votings_service
             * @interface ITxStopVoting
             * @property {string|null} [voting_id] TxStopVoting voting_id
             * @property {number|Long|null} [seed] TxStopVoting seed
             */
    
            /**
             * Constructs a new TxStopVoting.
             * @memberof votings_service
             * @classdesc Represents a TxStopVoting.
             * @implements ITxStopVoting
             * @constructor
             * @param {votings_service.ITxStopVoting=} [properties] Properties to set
             */
            function TxStopVoting(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxStopVoting voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxStopVoting
             * @instance
             */
            TxStopVoting.prototype.voting_id = "";
    
            /**
             * TxStopVoting seed.
             * @member {number|Long} seed
             * @memberof votings_service.TxStopVoting
             * @instance
             */
            TxStopVoting.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new TxStopVoting instance using the specified properties.
             * @function create
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {votings_service.ITxStopVoting=} [properties] Properties to set
             * @returns {votings_service.TxStopVoting} TxStopVoting instance
             */
            TxStopVoting.create = function create(properties) {
                return new TxStopVoting(properties);
            };
    
            /**
             * Encodes the specified TxStopVoting message. Does not implicitly {@link votings_service.TxStopVoting.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {votings_service.ITxStopVoting} message TxStopVoting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxStopVoting.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.seed != null && message.hasOwnProperty("seed"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.seed);
                return writer;
            };
    
            /**
             * Encodes the specified TxStopVoting message, length delimited. Does not implicitly {@link votings_service.TxStopVoting.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {votings_service.ITxStopVoting} message TxStopVoting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxStopVoting.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxStopVoting message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxStopVoting} TxStopVoting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxStopVoting.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxStopVoting();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.seed = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxStopVoting message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxStopVoting} TxStopVoting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxStopVoting.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxStopVoting message.
             * @function verify
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxStopVoting.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                        return "seed: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a TxStopVoting message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxStopVoting} TxStopVoting
             */
            TxStopVoting.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxStopVoting)
                    return object;
                var message = new $root.votings_service.TxStopVoting();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.seed != null)
                    if ($util.Long)
                        (message.seed = $util.Long.fromValue(object.seed)).unsigned = true;
                    else if (typeof object.seed === "string")
                        message.seed = parseInt(object.seed, 10);
                    else if (typeof object.seed === "number")
                        message.seed = object.seed;
                    else if (typeof object.seed === "object")
                        message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a TxStopVoting message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxStopVoting
             * @static
             * @param {votings_service.TxStopVoting} message TxStopVoting
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxStopVoting.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seed = options.longs === String ? "0" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (typeof message.seed === "number")
                        object.seed = options.longs === String ? String(message.seed) : message.seed;
                    else
                        object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber(true) : message.seed;
                return object;
            };
    
            /**
             * Converts this TxStopVoting to JSON.
             * @function toJSON
             * @memberof votings_service.TxStopVoting
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxStopVoting.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxStopVoting;
        })();
    
        votings_service.TxPublishDecryptionKey = (function() {
    
            /**
             * Properties of a TxPublishDecryptionKey.
             * @memberof votings_service
             * @interface ITxPublishDecryptionKey
             * @property {string|null} [voting_id] TxPublishDecryptionKey voting_id
             * @property {votings_service.ISealedBoxSecretKey|null} [private_key] TxPublishDecryptionKey private_key
             * @property {number|Long|null} [seed] TxPublishDecryptionKey seed
             */
    
            /**
             * Constructs a new TxPublishDecryptionKey.
             * @memberof votings_service
             * @classdesc Represents a TxPublishDecryptionKey.
             * @implements ITxPublishDecryptionKey
             * @constructor
             * @param {votings_service.ITxPublishDecryptionKey=} [properties] Properties to set
             */
            function TxPublishDecryptionKey(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxPublishDecryptionKey voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxPublishDecryptionKey
             * @instance
             */
            TxPublishDecryptionKey.prototype.voting_id = "";
    
            /**
             * TxPublishDecryptionKey private_key.
             * @member {votings_service.ISealedBoxSecretKey|null|undefined} private_key
             * @memberof votings_service.TxPublishDecryptionKey
             * @instance
             */
            TxPublishDecryptionKey.prototype.private_key = null;
    
            /**
             * TxPublishDecryptionKey seed.
             * @member {number|Long} seed
             * @memberof votings_service.TxPublishDecryptionKey
             * @instance
             */
            TxPublishDecryptionKey.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new TxPublishDecryptionKey instance using the specified properties.
             * @function create
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {votings_service.ITxPublishDecryptionKey=} [properties] Properties to set
             * @returns {votings_service.TxPublishDecryptionKey} TxPublishDecryptionKey instance
             */
            TxPublishDecryptionKey.create = function create(properties) {
                return new TxPublishDecryptionKey(properties);
            };
    
            /**
             * Encodes the specified TxPublishDecryptionKey message. Does not implicitly {@link votings_service.TxPublishDecryptionKey.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {votings_service.ITxPublishDecryptionKey} message TxPublishDecryptionKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxPublishDecryptionKey.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.private_key != null && message.hasOwnProperty("private_key"))
                    $root.votings_service.SealedBoxSecretKey.encode(message.private_key, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                if (message.seed != null && message.hasOwnProperty("seed"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.seed);
                return writer;
            };
    
            /**
             * Encodes the specified TxPublishDecryptionKey message, length delimited. Does not implicitly {@link votings_service.TxPublishDecryptionKey.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {votings_service.ITxPublishDecryptionKey} message TxPublishDecryptionKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxPublishDecryptionKey.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxPublishDecryptionKey message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxPublishDecryptionKey} TxPublishDecryptionKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxPublishDecryptionKey.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxPublishDecryptionKey();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.private_key = $root.votings_service.SealedBoxSecretKey.decode(reader, reader.uint32());
                        break;
                    case 3:
                        message.seed = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxPublishDecryptionKey message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxPublishDecryptionKey} TxPublishDecryptionKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxPublishDecryptionKey.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxPublishDecryptionKey message.
             * @function verify
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxPublishDecryptionKey.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.private_key != null && message.hasOwnProperty("private_key")) {
                    var error = $root.votings_service.SealedBoxSecretKey.verify(message.private_key);
                    if (error)
                        return "private_key." + error;
                }
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                        return "seed: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a TxPublishDecryptionKey message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxPublishDecryptionKey} TxPublishDecryptionKey
             */
            TxPublishDecryptionKey.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxPublishDecryptionKey)
                    return object;
                var message = new $root.votings_service.TxPublishDecryptionKey();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.private_key != null) {
                    if (typeof object.private_key !== "object")
                        throw TypeError(".votings_service.TxPublishDecryptionKey.private_key: object expected");
                    message.private_key = $root.votings_service.SealedBoxSecretKey.fromObject(object.private_key);
                }
                if (object.seed != null)
                    if ($util.Long)
                        (message.seed = $util.Long.fromValue(object.seed)).unsigned = true;
                    else if (typeof object.seed === "string")
                        message.seed = parseInt(object.seed, 10);
                    else if (typeof object.seed === "number")
                        message.seed = object.seed;
                    else if (typeof object.seed === "object")
                        message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a TxPublishDecryptionKey message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxPublishDecryptionKey
             * @static
             * @param {votings_service.TxPublishDecryptionKey} message TxPublishDecryptionKey
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxPublishDecryptionKey.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    object.private_key = null;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seed = options.longs === String ? "0" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.private_key != null && message.hasOwnProperty("private_key"))
                    object.private_key = $root.votings_service.SealedBoxSecretKey.toObject(message.private_key, options);
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (typeof message.seed === "number")
                        object.seed = options.longs === String ? String(message.seed) : message.seed;
                    else
                        object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber(true) : message.seed;
                return object;
            };
    
            /**
             * Converts this TxPublishDecryptionKey to JSON.
             * @function toJSON
             * @memberof votings_service.TxPublishDecryptionKey
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxPublishDecryptionKey.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxPublishDecryptionKey;
        })();
    
        votings_service.TxDecryptBallot = (function() {
    
            /**
             * Properties of a TxDecryptBallot.
             * @memberof votings_service
             * @interface ITxDecryptBallot
             * @property {string|null} [voting_id] TxDecryptBallot voting_id
             * @property {number|null} [ballot_index] TxDecryptBallot ballot_index
             * @property {number|Long|null} [seed] TxDecryptBallot seed
             */
    
            /**
             * Constructs a new TxDecryptBallot.
             * @memberof votings_service
             * @classdesc Represents a TxDecryptBallot.
             * @implements ITxDecryptBallot
             * @constructor
             * @param {votings_service.ITxDecryptBallot=} [properties] Properties to set
             */
            function TxDecryptBallot(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxDecryptBallot voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxDecryptBallot
             * @instance
             */
            TxDecryptBallot.prototype.voting_id = "";
    
            /**
             * TxDecryptBallot ballot_index.
             * @member {number} ballot_index
             * @memberof votings_service.TxDecryptBallot
             * @instance
             */
            TxDecryptBallot.prototype.ballot_index = 0;
    
            /**
             * TxDecryptBallot seed.
             * @member {number|Long} seed
             * @memberof votings_service.TxDecryptBallot
             * @instance
             */
            TxDecryptBallot.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new TxDecryptBallot instance using the specified properties.
             * @function create
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {votings_service.ITxDecryptBallot=} [properties] Properties to set
             * @returns {votings_service.TxDecryptBallot} TxDecryptBallot instance
             */
            TxDecryptBallot.create = function create(properties) {
                return new TxDecryptBallot(properties);
            };
    
            /**
             * Encodes the specified TxDecryptBallot message. Does not implicitly {@link votings_service.TxDecryptBallot.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {votings_service.ITxDecryptBallot} message TxDecryptBallot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxDecryptBallot.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.ballot_index != null && message.hasOwnProperty("ballot_index"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint32(message.ballot_index);
                if (message.seed != null && message.hasOwnProperty("seed"))
                    writer.uint32(/* id 3, wireType 0 =*/24).uint64(message.seed);
                return writer;
            };
    
            /**
             * Encodes the specified TxDecryptBallot message, length delimited. Does not implicitly {@link votings_service.TxDecryptBallot.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {votings_service.ITxDecryptBallot} message TxDecryptBallot message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxDecryptBallot.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxDecryptBallot message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxDecryptBallot} TxDecryptBallot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxDecryptBallot.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxDecryptBallot();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.ballot_index = reader.uint32();
                        break;
                    case 3:
                        message.seed = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxDecryptBallot message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxDecryptBallot} TxDecryptBallot
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxDecryptBallot.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxDecryptBallot message.
             * @function verify
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxDecryptBallot.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.ballot_index != null && message.hasOwnProperty("ballot_index"))
                    if (!$util.isInteger(message.ballot_index))
                        return "ballot_index: integer expected";
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                        return "seed: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a TxDecryptBallot message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxDecryptBallot} TxDecryptBallot
             */
            TxDecryptBallot.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxDecryptBallot)
                    return object;
                var message = new $root.votings_service.TxDecryptBallot();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.ballot_index != null)
                    message.ballot_index = object.ballot_index >>> 0;
                if (object.seed != null)
                    if ($util.Long)
                        (message.seed = $util.Long.fromValue(object.seed)).unsigned = true;
                    else if (typeof object.seed === "string")
                        message.seed = parseInt(object.seed, 10);
                    else if (typeof object.seed === "number")
                        message.seed = object.seed;
                    else if (typeof object.seed === "object")
                        message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a TxDecryptBallot message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxDecryptBallot
             * @static
             * @param {votings_service.TxDecryptBallot} message TxDecryptBallot
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxDecryptBallot.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    object.ballot_index = 0;
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seed = options.longs === String ? "0" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.ballot_index != null && message.hasOwnProperty("ballot_index"))
                    object.ballot_index = message.ballot_index;
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (typeof message.seed === "number")
                        object.seed = options.longs === String ? String(message.seed) : message.seed;
                    else
                        object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber(true) : message.seed;
                return object;
            };
    
            /**
             * Converts this TxDecryptBallot to JSON.
             * @function toJSON
             * @memberof votings_service.TxDecryptBallot
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxDecryptBallot.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxDecryptBallot;
        })();
    
        votings_service.TxFinalizeVoting = (function() {
    
            /**
             * Properties of a TxFinalizeVoting.
             * @memberof votings_service
             * @interface ITxFinalizeVoting
             * @property {string|null} [voting_id] TxFinalizeVoting voting_id
             * @property {number|Long|null} [seed] TxFinalizeVoting seed
             */
    
            /**
             * Constructs a new TxFinalizeVoting.
             * @memberof votings_service
             * @classdesc Represents a TxFinalizeVoting.
             * @implements ITxFinalizeVoting
             * @constructor
             * @param {votings_service.ITxFinalizeVoting=} [properties] Properties to set
             */
            function TxFinalizeVoting(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * TxFinalizeVoting voting_id.
             * @member {string} voting_id
             * @memberof votings_service.TxFinalizeVoting
             * @instance
             */
            TxFinalizeVoting.prototype.voting_id = "";
    
            /**
             * TxFinalizeVoting seed.
             * @member {number|Long} seed
             * @memberof votings_service.TxFinalizeVoting
             * @instance
             */
            TxFinalizeVoting.prototype.seed = $util.Long ? $util.Long.fromBits(0,0,true) : 0;
    
            /**
             * Creates a new TxFinalizeVoting instance using the specified properties.
             * @function create
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {votings_service.ITxFinalizeVoting=} [properties] Properties to set
             * @returns {votings_service.TxFinalizeVoting} TxFinalizeVoting instance
             */
            TxFinalizeVoting.create = function create(properties) {
                return new TxFinalizeVoting(properties);
            };
    
            /**
             * Encodes the specified TxFinalizeVoting message. Does not implicitly {@link votings_service.TxFinalizeVoting.verify|verify} messages.
             * @function encode
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {votings_service.ITxFinalizeVoting} message TxFinalizeVoting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxFinalizeVoting.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    writer.uint32(/* id 1, wireType 2 =*/10).string(message.voting_id);
                if (message.seed != null && message.hasOwnProperty("seed"))
                    writer.uint32(/* id 2, wireType 0 =*/16).uint64(message.seed);
                return writer;
            };
    
            /**
             * Encodes the specified TxFinalizeVoting message, length delimited. Does not implicitly {@link votings_service.TxFinalizeVoting.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {votings_service.ITxFinalizeVoting} message TxFinalizeVoting message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            TxFinalizeVoting.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a TxFinalizeVoting message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.TxFinalizeVoting} TxFinalizeVoting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxFinalizeVoting.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.TxFinalizeVoting();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.voting_id = reader.string();
                        break;
                    case 2:
                        message.seed = reader.uint64();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a TxFinalizeVoting message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.TxFinalizeVoting} TxFinalizeVoting
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            TxFinalizeVoting.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a TxFinalizeVoting message.
             * @function verify
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            TxFinalizeVoting.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    if (!$util.isString(message.voting_id))
                        return "voting_id: string expected";
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (!$util.isInteger(message.seed) && !(message.seed && $util.isInteger(message.seed.low) && $util.isInteger(message.seed.high)))
                        return "seed: integer|Long expected";
                return null;
            };
    
            /**
             * Creates a TxFinalizeVoting message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.TxFinalizeVoting} TxFinalizeVoting
             */
            TxFinalizeVoting.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.TxFinalizeVoting)
                    return object;
                var message = new $root.votings_service.TxFinalizeVoting();
                if (object.voting_id != null)
                    message.voting_id = String(object.voting_id);
                if (object.seed != null)
                    if ($util.Long)
                        (message.seed = $util.Long.fromValue(object.seed)).unsigned = true;
                    else if (typeof object.seed === "string")
                        message.seed = parseInt(object.seed, 10);
                    else if (typeof object.seed === "number")
                        message.seed = object.seed;
                    else if (typeof object.seed === "object")
                        message.seed = new $util.LongBits(object.seed.low >>> 0, object.seed.high >>> 0).toNumber(true);
                return message;
            };
    
            /**
             * Creates a plain object from a TxFinalizeVoting message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.TxFinalizeVoting
             * @static
             * @param {votings_service.TxFinalizeVoting} message TxFinalizeVoting
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            TxFinalizeVoting.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.voting_id = "";
                    if ($util.Long) {
                        var long = new $util.Long(0, 0, true);
                        object.seed = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                    } else
                        object.seed = options.longs === String ? "0" : 0;
                }
                if (message.voting_id != null && message.hasOwnProperty("voting_id"))
                    object.voting_id = message.voting_id;
                if (message.seed != null && message.hasOwnProperty("seed"))
                    if (typeof message.seed === "number")
                        object.seed = options.longs === String ? String(message.seed) : message.seed;
                    else
                        object.seed = options.longs === String ? $util.Long.prototype.toString.call(message.seed) : options.longs === Number ? new $util.LongBits(message.seed.low >>> 0, message.seed.high >>> 0).toNumber(true) : message.seed;
                return object;
            };
    
            /**
             * Converts this TxFinalizeVoting to JSON.
             * @function toJSON
             * @memberof votings_service.TxFinalizeVoting
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            TxFinalizeVoting.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return TxFinalizeVoting;
        })();
    
        votings_service.BigUint = (function() {
    
            /**
             * Properties of a BigUint.
             * @memberof votings_service
             * @interface IBigUint
             * @property {Uint8Array|null} [data] BigUint data
             */
    
            /**
             * Constructs a new BigUint.
             * @memberof votings_service
             * @classdesc Represents a BigUint.
             * @implements IBigUint
             * @constructor
             * @param {votings_service.IBigUint=} [properties] Properties to set
             */
            function BigUint(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * BigUint data.
             * @member {Uint8Array} data
             * @memberof votings_service.BigUint
             * @instance
             */
            BigUint.prototype.data = $util.newBuffer([]);
    
            /**
             * Creates a new BigUint instance using the specified properties.
             * @function create
             * @memberof votings_service.BigUint
             * @static
             * @param {votings_service.IBigUint=} [properties] Properties to set
             * @returns {votings_service.BigUint} BigUint instance
             */
            BigUint.create = function create(properties) {
                return new BigUint(properties);
            };
    
            /**
             * Encodes the specified BigUint message. Does not implicitly {@link votings_service.BigUint.verify|verify} messages.
             * @function encode
             * @memberof votings_service.BigUint
             * @static
             * @param {votings_service.IBigUint} message BigUint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BigUint.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.hasOwnProperty("data"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                return writer;
            };
    
            /**
             * Encodes the specified BigUint message, length delimited. Does not implicitly {@link votings_service.BigUint.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.BigUint
             * @static
             * @param {votings_service.IBigUint} message BigUint message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            BigUint.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a BigUint message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.BigUint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.BigUint} BigUint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BigUint.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.BigUint();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.data = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a BigUint message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.BigUint
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.BigUint} BigUint
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            BigUint.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a BigUint message.
             * @function verify
             * @memberof votings_service.BigUint
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            BigUint.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };
    
            /**
             * Creates a BigUint message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.BigUint
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.BigUint} BigUint
             */
            BigUint.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.BigUint)
                    return object;
                var message = new $root.votings_service.BigUint();
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length)
                        message.data = object.data;
                return message;
            };
    
            /**
             * Creates a plain object from a BigUint message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.BigUint
             * @static
             * @param {votings_service.BigUint} message BigUint
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            BigUint.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                return object;
            };
    
            /**
             * Converts this BigUint to JSON.
             * @function toJSON
             * @memberof votings_service.BigUint
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            BigUint.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return BigUint;
        })();
    
        votings_service.SealedBoxPublicKey = (function() {
    
            /**
             * Properties of a SealedBoxPublicKey.
             * @memberof votings_service
             * @interface ISealedBoxPublicKey
             * @property {Uint8Array|null} [data] SealedBoxPublicKey data
             */
    
            /**
             * Constructs a new SealedBoxPublicKey.
             * @memberof votings_service
             * @classdesc Represents a SealedBoxPublicKey.
             * @implements ISealedBoxPublicKey
             * @constructor
             * @param {votings_service.ISealedBoxPublicKey=} [properties] Properties to set
             */
            function SealedBoxPublicKey(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * SealedBoxPublicKey data.
             * @member {Uint8Array} data
             * @memberof votings_service.SealedBoxPublicKey
             * @instance
             */
            SealedBoxPublicKey.prototype.data = $util.newBuffer([]);
    
            /**
             * Creates a new SealedBoxPublicKey instance using the specified properties.
             * @function create
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {votings_service.ISealedBoxPublicKey=} [properties] Properties to set
             * @returns {votings_service.SealedBoxPublicKey} SealedBoxPublicKey instance
             */
            SealedBoxPublicKey.create = function create(properties) {
                return new SealedBoxPublicKey(properties);
            };
    
            /**
             * Encodes the specified SealedBoxPublicKey message. Does not implicitly {@link votings_service.SealedBoxPublicKey.verify|verify} messages.
             * @function encode
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {votings_service.ISealedBoxPublicKey} message SealedBoxPublicKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SealedBoxPublicKey.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.hasOwnProperty("data"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                return writer;
            };
    
            /**
             * Encodes the specified SealedBoxPublicKey message, length delimited. Does not implicitly {@link votings_service.SealedBoxPublicKey.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {votings_service.ISealedBoxPublicKey} message SealedBoxPublicKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SealedBoxPublicKey.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a SealedBoxPublicKey message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.SealedBoxPublicKey} SealedBoxPublicKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SealedBoxPublicKey.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.SealedBoxPublicKey();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.data = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a SealedBoxPublicKey message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.SealedBoxPublicKey} SealedBoxPublicKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SealedBoxPublicKey.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a SealedBoxPublicKey message.
             * @function verify
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SealedBoxPublicKey.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };
    
            /**
             * Creates a SealedBoxPublicKey message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.SealedBoxPublicKey} SealedBoxPublicKey
             */
            SealedBoxPublicKey.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.SealedBoxPublicKey)
                    return object;
                var message = new $root.votings_service.SealedBoxPublicKey();
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length)
                        message.data = object.data;
                return message;
            };
    
            /**
             * Creates a plain object from a SealedBoxPublicKey message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.SealedBoxPublicKey
             * @static
             * @param {votings_service.SealedBoxPublicKey} message SealedBoxPublicKey
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SealedBoxPublicKey.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                return object;
            };
    
            /**
             * Converts this SealedBoxPublicKey to JSON.
             * @function toJSON
             * @memberof votings_service.SealedBoxPublicKey
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SealedBoxPublicKey.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return SealedBoxPublicKey;
        })();
    
        votings_service.SealedBoxSecretKey = (function() {
    
            /**
             * Properties of a SealedBoxSecretKey.
             * @memberof votings_service
             * @interface ISealedBoxSecretKey
             * @property {Uint8Array|null} [data] SealedBoxSecretKey data
             */
    
            /**
             * Constructs a new SealedBoxSecretKey.
             * @memberof votings_service
             * @classdesc Represents a SealedBoxSecretKey.
             * @implements ISealedBoxSecretKey
             * @constructor
             * @param {votings_service.ISealedBoxSecretKey=} [properties] Properties to set
             */
            function SealedBoxSecretKey(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * SealedBoxSecretKey data.
             * @member {Uint8Array} data
             * @memberof votings_service.SealedBoxSecretKey
             * @instance
             */
            SealedBoxSecretKey.prototype.data = $util.newBuffer([]);
    
            /**
             * Creates a new SealedBoxSecretKey instance using the specified properties.
             * @function create
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {votings_service.ISealedBoxSecretKey=} [properties] Properties to set
             * @returns {votings_service.SealedBoxSecretKey} SealedBoxSecretKey instance
             */
            SealedBoxSecretKey.create = function create(properties) {
                return new SealedBoxSecretKey(properties);
            };
    
            /**
             * Encodes the specified SealedBoxSecretKey message. Does not implicitly {@link votings_service.SealedBoxSecretKey.verify|verify} messages.
             * @function encode
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {votings_service.ISealedBoxSecretKey} message SealedBoxSecretKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SealedBoxSecretKey.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.hasOwnProperty("data"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                return writer;
            };
    
            /**
             * Encodes the specified SealedBoxSecretKey message, length delimited. Does not implicitly {@link votings_service.SealedBoxSecretKey.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {votings_service.ISealedBoxSecretKey} message SealedBoxSecretKey message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SealedBoxSecretKey.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a SealedBoxSecretKey message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.SealedBoxSecretKey} SealedBoxSecretKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SealedBoxSecretKey.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.SealedBoxSecretKey();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.data = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a SealedBoxSecretKey message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.SealedBoxSecretKey} SealedBoxSecretKey
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SealedBoxSecretKey.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a SealedBoxSecretKey message.
             * @function verify
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SealedBoxSecretKey.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };
    
            /**
             * Creates a SealedBoxSecretKey message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.SealedBoxSecretKey} SealedBoxSecretKey
             */
            SealedBoxSecretKey.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.SealedBoxSecretKey)
                    return object;
                var message = new $root.votings_service.SealedBoxSecretKey();
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length)
                        message.data = object.data;
                return message;
            };
    
            /**
             * Creates a plain object from a SealedBoxSecretKey message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.SealedBoxSecretKey
             * @static
             * @param {votings_service.SealedBoxSecretKey} message SealedBoxSecretKey
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SealedBoxSecretKey.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                return object;
            };
    
            /**
             * Converts this SealedBoxSecretKey to JSON.
             * @function toJSON
             * @memberof votings_service.SealedBoxSecretKey
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SealedBoxSecretKey.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return SealedBoxSecretKey;
        })();
    
        votings_service.SealedBoxNonce = (function() {
    
            /**
             * Properties of a SealedBoxNonce.
             * @memberof votings_service
             * @interface ISealedBoxNonce
             * @property {Uint8Array|null} [data] SealedBoxNonce data
             */
    
            /**
             * Constructs a new SealedBoxNonce.
             * @memberof votings_service
             * @classdesc Represents a SealedBoxNonce.
             * @implements ISealedBoxNonce
             * @constructor
             * @param {votings_service.ISealedBoxNonce=} [properties] Properties to set
             */
            function SealedBoxNonce(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }
    
            /**
             * SealedBoxNonce data.
             * @member {Uint8Array} data
             * @memberof votings_service.SealedBoxNonce
             * @instance
             */
            SealedBoxNonce.prototype.data = $util.newBuffer([]);
    
            /**
             * Creates a new SealedBoxNonce instance using the specified properties.
             * @function create
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {votings_service.ISealedBoxNonce=} [properties] Properties to set
             * @returns {votings_service.SealedBoxNonce} SealedBoxNonce instance
             */
            SealedBoxNonce.create = function create(properties) {
                return new SealedBoxNonce(properties);
            };
    
            /**
             * Encodes the specified SealedBoxNonce message. Does not implicitly {@link votings_service.SealedBoxNonce.verify|verify} messages.
             * @function encode
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {votings_service.ISealedBoxNonce} message SealedBoxNonce message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SealedBoxNonce.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.data != null && message.hasOwnProperty("data"))
                    writer.uint32(/* id 1, wireType 2 =*/10).bytes(message.data);
                return writer;
            };
    
            /**
             * Encodes the specified SealedBoxNonce message, length delimited. Does not implicitly {@link votings_service.SealedBoxNonce.verify|verify} messages.
             * @function encodeDelimited
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {votings_service.ISealedBoxNonce} message SealedBoxNonce message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SealedBoxNonce.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };
    
            /**
             * Decodes a SealedBoxNonce message from the specified reader or buffer.
             * @function decode
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {votings_service.SealedBoxNonce} SealedBoxNonce
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SealedBoxNonce.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.votings_service.SealedBoxNonce();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.data = reader.bytes();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };
    
            /**
             * Decodes a SealedBoxNonce message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {votings_service.SealedBoxNonce} SealedBoxNonce
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SealedBoxNonce.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };
    
            /**
             * Verifies a SealedBoxNonce message.
             * @function verify
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SealedBoxNonce.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.data != null && message.hasOwnProperty("data"))
                    if (!(message.data && typeof message.data.length === "number" || $util.isString(message.data)))
                        return "data: buffer expected";
                return null;
            };
    
            /**
             * Creates a SealedBoxNonce message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {votings_service.SealedBoxNonce} SealedBoxNonce
             */
            SealedBoxNonce.fromObject = function fromObject(object) {
                if (object instanceof $root.votings_service.SealedBoxNonce)
                    return object;
                var message = new $root.votings_service.SealedBoxNonce();
                if (object.data != null)
                    if (typeof object.data === "string")
                        $util.base64.decode(object.data, message.data = $util.newBuffer($util.base64.length(object.data)), 0);
                    else if (object.data.length)
                        message.data = object.data;
                return message;
            };
    
            /**
             * Creates a plain object from a SealedBoxNonce message. Also converts values to other types if specified.
             * @function toObject
             * @memberof votings_service.SealedBoxNonce
             * @static
             * @param {votings_service.SealedBoxNonce} message SealedBoxNonce
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SealedBoxNonce.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    if (options.bytes === String)
                        object.data = "";
                    else {
                        object.data = [];
                        if (options.bytes !== Array)
                            object.data = $util.newBuffer(object.data);
                    }
                if (message.data != null && message.hasOwnProperty("data"))
                    object.data = options.bytes === String ? $util.base64.encode(message.data, 0, message.data.length) : options.bytes === Array ? Array.prototype.slice.call(message.data) : message.data;
                return object;
            };
    
            /**
             * Converts this SealedBoxNonce to JSON.
             * @function toJSON
             * @memberof votings_service.SealedBoxNonce
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SealedBoxNonce.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };
    
            return SealedBoxNonce;
        })();
    
        return votings_service;
    })();

    return $root;
});
