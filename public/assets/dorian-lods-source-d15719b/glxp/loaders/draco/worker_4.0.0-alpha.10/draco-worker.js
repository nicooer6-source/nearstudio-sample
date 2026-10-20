(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __reExport = (target, module, desc) => {
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
    }
    return target;
  };
  var __toModule = (module) => {
    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", module && module.__esModule && "default" in module ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
  };

  // (disabled):../worker-utils/src/lib/node/require-utils.node
  var require_require_utils = __commonJS({
    "(disabled):../worker-utils/src/lib/node/require-utils.node"() {
    }
  });

  // ../worker-utils/src/lib/env-utils/version.ts
  var VERSION = true ? "4.0.0-alpha.10" : DEFAULT_VERSION;
  if (false) {
    console.error("loaders.gl: The __VERSION__ variable is not injected using babel plugin. Latest unstable workers would be fetched from the CDN.");
  }

  // ../worker-utils/src/lib/env-utils/assert.ts
  function assert(condition, message) {
    if (!condition) {
      throw new Error(message || "loaders.gl assertion failed.");
    }
  }

  // ../worker-utils/src/lib/env-utils/globals.ts
  var globals = {
    self: typeof self !== "undefined" && self,
    window: typeof window !== "undefined" && window,
    global: typeof global !== "undefined" && global,
    document: typeof document !== "undefined" && document
  };
  var self_ = globals.self || globals.window || globals.global || {};
  var window_ = globals.window || globals.self || globals.global || {};
  var global_ = globals.global || globals.self || globals.window || {};
  var document_ = globals.document || {};
  var isBrowser = typeof process !== "object" || String(process) !== "[object process]" || process.browser;
  var isWorker = typeof importScripts === "function";
  var isMobile = typeof window !== "undefined" && typeof window.orientation !== "undefined";
  var matches = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);
  var nodeVersion = matches && parseFloat(matches[1]) || 0;

  // ../worker-utils/src/lib/worker-utils/get-transfer-list.ts
  function getTransferList(object, recursive = true, transfers) {
    const transfersSet = transfers || new Set();
    if (!object) {
    } else if (isTransferable(object)) {
      transfersSet.add(object);
    } else if (isTransferable(object.buffer)) {
      transfersSet.add(object.buffer);
    } else if (ArrayBuffer.isView(object)) {
    } else if (recursive && typeof object === "object") {
      for (const key in object) {
        getTransferList(object[key], recursive, transfersSet);
      }
    }
    return transfers === void 0 ? Array.from(transfersSet) : [];
  }
  function isTransferable(object) {
    if (!object) {
      return false;
    }
    if (object instanceof ArrayBuffer) {
      return true;
    }
    if (typeof MessagePort !== "undefined" && object instanceof MessagePort) {
      return true;
    }
    if (typeof ImageBitmap !== "undefined" && object instanceof ImageBitmap) {
      return true;
    }
    if (typeof OffscreenCanvas !== "undefined" && object instanceof OffscreenCanvas) {
      return true;
    }
    return false;
  }

  // ../worker-utils/src/lib/worker-farm/worker-body.ts
  function getParentPort() {
    let parentPort;
    try {
      eval("globalThis.parentPort = require('worker_threads').parentPort");
      parentPort = globalThis.parentPort;
    } catch {
    }
    return parentPort;
  }
  var onMessageWrapperMap = new Map();
  var WorkerBody = class {
    static inWorkerThread() {
      return typeof self !== "undefined" || Boolean(getParentPort());
    }
    static set onmessage(onMessage) {
      function handleMessage(message) {
        const parentPort3 = getParentPort();
        const { type, payload } = parentPort3 ? message : message.data;
        onMessage(type, payload);
      }
      const parentPort2 = getParentPort();
      if (parentPort2) {
        parentPort2.on("message", handleMessage);
        parentPort2.on("exit", () => console.debug("Node worker closing"));
      } else {
        globalThis.onmessage = handleMessage;
      }
    }
    static addEventListener(onMessage) {
      let onMessageWrapper = onMessageWrapperMap.get(onMessage);
      if (!onMessageWrapper) {
        onMessageWrapper = (message) => {
          if (!isKnownMessage(message)) {
            return;
          }
          const parentPort3 = getParentPort();
          const { type, payload } = parentPort3 ? message : message.data;
          onMessage(type, payload);
        };
      }
      const parentPort2 = getParentPort();
      if (parentPort2) {
        console.error("not implemented");
      } else {
        globalThis.addEventListener("message", onMessageWrapper);
      }
    }
    static removeEventListener(onMessage) {
      const onMessageWrapper = onMessageWrapperMap.get(onMessage);
      onMessageWrapperMap.delete(onMessage);
      const parentPort2 = getParentPort();
      if (parentPort2) {
        console.error("not implemented");
      } else {
        globalThis.removeEventListener("message", onMessageWrapper);
      }
    }
    static postMessage(type, payload) {
      const data = { source: "loaders.gl", type, payload };
      const transferList = getTransferList(payload);
      const parentPort2 = getParentPort();
      if (parentPort2) {
        parentPort2.postMessage(data, transferList);
      } else {
        globalThis.postMessage(data, transferList);
      }
    }
  };
  function isKnownMessage(message) {
    const { type, data } = message;
    return type === "message" && data && typeof data.source === "string" && data.source.startsWith("loaders.gl");
  }

  // ../worker-utils/src/lib/library-utils/library-utils.ts
  var node = __toModule(require_require_utils());
  var LATEST = "beta";
  var VERSION2 = typeof VERSION !== "undefined" ? VERSION : LATEST;
  var loadLibraryPromises = {};
  async function loadLibrary(libraryUrl, moduleName = null, options = {}) {
    if (moduleName) {
      libraryUrl = getLibraryUrl(libraryUrl, moduleName, options);
    }
    loadLibraryPromises[libraryUrl] = loadLibraryPromises[libraryUrl] || loadLibraryFromFile(libraryUrl);
    return await loadLibraryPromises[libraryUrl];
  }
  function getLibraryUrl(library, moduleName, options) {
    if (library.startsWith("http")) {
      return library;
    }
    const modules = options.modules || {};
    if (modules[library]) {
      return modules[library];
    }
    if (!isBrowser) {
      return `modules/${moduleName}/dist/libs/${library}`;
    }
    if (options.CDN) {
      assert(options.CDN.startsWith("http"));
      return `${options.CDN}/${moduleName}@${VERSION2}/dist/libs/${library}`;
    }
    if (isWorker) {
      return `../${library}`;
    }
    return `modules/${moduleName}/src/libs/${library}`;
  }
  async function loadLibraryFromFile(libraryUrl) {
    if (libraryUrl.endsWith("wasm")) {
      const response2 = await fetch(libraryUrl);
      return await response2.arrayBuffer();
    }
    if (!isBrowser) {
      try {
        return node && node.requireFromFile && await node.requireFromFile(libraryUrl);
      } catch {
        return null;
      }
    }
    if (isWorker) {
      return importScripts(libraryUrl);
    }
    const response = await fetch(libraryUrl);
    const scriptSource = await response.text();
    return loadLibraryFromString(scriptSource, libraryUrl);
  }
  function loadLibraryFromString(scriptSource, id) {
    if (!isBrowser) {
      return node.requireFromString && node.requireFromString(scriptSource, id);
    }
    if (isWorker) {
      eval.call(global_, scriptSource);
      return null;
    }
    const script = document.createElement("script");
    script.id = id;
    try {
      script.appendChild(document.createTextNode(scriptSource));
    } catch (e) {
      script.text = scriptSource;
    }
    document.body.appendChild(script);
    return null;
  }

  // ../loader-utils/src/lib/worker-loader-utils/create-loader-worker.ts
  var requestId = 0;
  function createLoaderWorker(loader) {
    if (!WorkerBody.inWorkerThread()) {
      return;
    }
    WorkerBody.onmessage = async (type, payload) => {
      switch (type) {
        case "process":
          try {
            const { input, options = {}, context = {} } = payload;
            const result = await parseData({
              loader,
              arrayBuffer: input,
              options,
              context: {
                ...context,
                parse: parseOnMainThread
              }
            });
            WorkerBody.postMessage("done", { result });
          } catch (error) {
            const message = error instanceof Error ? error.message : "";
            WorkerBody.postMessage("error", { error: message });
          }
          break;
        default:
      }
    };
  }
  function parseOnMainThread(arrayBuffer, options) {
    return new Promise((resolve, reject) => {
      const id = requestId++;
      const onMessage = (type, payload2) => {
        if (payload2.id !== id) {
          return;
        }
        switch (type) {
          case "done":
            WorkerBody.removeEventListener(onMessage);
            resolve(payload2.result);
            break;
          case "error":
            WorkerBody.removeEventListener(onMessage);
            reject(payload2.error);
            break;
          default:
        }
      };
      WorkerBody.addEventListener(onMessage);
      const payload = { id, input: arrayBuffer, options };
      WorkerBody.postMessage("process", payload);
    });
  }
  async function parseData({ loader, arrayBuffer, options, context }) {
    let data;
    let parser;
    if (loader.parseSync || loader.parse) {
      data = arrayBuffer;
      parser = loader.parseSync || loader.parse;
    } else if (loader.parseTextSync) {
      const textDecoder = new TextDecoder();
      data = textDecoder.decode(arrayBuffer);
      parser = loader.parseTextSync;
    } else {
      throw new Error(`Could not load data with ${loader.name} loader`);
    }
    options = {
      ...options,
      modules: loader && loader.options && loader.options.modules || {},
      worker: false
    };
    return await parser(data, { ...options }, context, loader);
  }

  // src/lib/utils/version.ts
  var VERSION3 = true ? "4.0.0-alpha.10" : "latest";

  // src/draco-loader.ts
  var DEFAULT_DRACO_OPTIONS = {
    draco: {
      decoderType: typeof WebAssembly === "object" ? "wasm" : "js",
      libraryPath: "libs/",
      extraAttributes: {},
      attributeNameEntry: void 0
    }
  };
  var DracoLoader = {
    name: "Draco",
    id: "draco",
    module: "draco",
    version: VERSION3,
    worker: true,
    extensions: ["drc"],
    mimeTypes: ["application/octet-stream"],
    binary: true,
    tests: ["DRACO"],
    options: DEFAULT_DRACO_OPTIONS
  };

  // ../schema/src/lib/table/simple-table/data-type.ts
  function getDataTypeFromTypedArray(array) {
    switch (array.constructor) {
      case Int8Array:
        return "int8";
      case Uint8Array:
      case Uint8ClampedArray:
        return "uint8";
      case Int16Array:
        return "int16";
      case Uint16Array:
        return "uint16";
      case Int32Array:
        return "int32";
      case Uint32Array:
        return "uint32";
      case Float32Array:
        return "float32";
      case Float64Array:
        return "float64";
      default:
        return "null";
    }
  }

  // ../schema/src/lib/mesh/mesh-utils.ts
  function getMeshBoundingBox(attributes) {
    let minX = Infinity;
    let minY = Infinity;
    let minZ = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxZ = -Infinity;
    const positions = attributes.POSITION ? attributes.POSITION.value : [];
    const len = positions && positions.length;
    for (let i = 0; i < len; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const z = positions[i + 2];
      minX = x < minX ? x : minX;
      minY = y < minY ? y : minY;
      minZ = z < minZ ? z : minZ;
      maxX = x > maxX ? x : maxX;
      maxY = y > maxY ? y : maxY;
      maxZ = z > maxZ ? z : maxZ;
    }
    return [
      [minX, minY, minZ],
      [maxX, maxY, maxZ]
    ];
  }

  // ../schema/src/lib/mesh/deduce-mesh-schema.ts
  function deduceMeshField(name, attribute, optionalMetadata) {
    const type = getDataTypeFromTypedArray(attribute.value);
    const metadata = optionalMetadata ? optionalMetadata : makeMeshAttributeMetadata(attribute);
    return {
      name,
      type: { type: "fixed-size-list", listSize: attribute.size, children: [{ name: "value", type }] },
      nullable: false,
      metadata
    };
  }
  function makeMeshAttributeMetadata(attribute) {
    const result = {};
    if ("byteOffset" in attribute) {
      result.byteOffset = attribute.byteOffset.toString(10);
    }
    if ("byteStride" in attribute) {
      result.byteStride = attribute.byteStride.toString(10);
    }
    if ("normalized" in attribute) {
      result.normalized = attribute.normalized.toString();
    }
    return result;
  }

  // src/lib/utils/get-draco-schema.ts
  function getDracoSchema(attributes, loaderData, indices) {
    const metadata = makeMetadata(loaderData.metadata);
    const fields = [];
    const namedLoaderDataAttributes = transformAttributesLoaderData(loaderData.attributes);
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const field = getArrowFieldFromAttribute(attributeName, attribute, namedLoaderDataAttributes[attributeName]);
      fields.push(field);
    }
    if (indices) {
      const indicesField = getArrowFieldFromAttribute("indices", indices);
      fields.push(indicesField);
    }
    return { fields, metadata };
  }
  function transformAttributesLoaderData(loaderData) {
    const result = {};
    for (const key in loaderData) {
      const dracoAttribute = loaderData[key];
      result[dracoAttribute.name || "undefined"] = dracoAttribute;
    }
    return result;
  }
  function getArrowFieldFromAttribute(attributeName, attribute, loaderData) {
    const metadataMap = loaderData ? makeMetadata(loaderData.metadata) : void 0;
    const field = deduceMeshField(attributeName, attribute, metadataMap);
    return field;
  }
  function makeMetadata(metadata) {
    Object.entries(metadata);
    const serializedMetadata = {};
    for (const key in metadata) {
      serializedMetadata[`${key}.string`] = JSON.stringify(metadata[key]);
    }
    return serializedMetadata;
  }

  // src/lib/draco-parser.ts
  var DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP = {
    POSITION: "POSITION",
    NORMAL: "NORMAL",
    COLOR: "COLOR_0",
    TEX_COORD: "TEXCOORD_0"
  };
  var DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP = {
    1: Int8Array,
    2: Uint8Array,
    3: Int16Array,
    4: Uint16Array,
    5: Int32Array,
    6: Uint32Array,
    9: Float32Array
  };
  var INDEX_ITEM_SIZE = 4;
  var DracoParser = class {
    constructor(draco) {
      this.draco = draco;
      this.decoder = new this.draco.Decoder();
      this.metadataQuerier = new this.draco.MetadataQuerier();
    }
    destroy() {
      this.draco.destroy(this.decoder);
      this.draco.destroy(this.metadataQuerier);
    }
    parseSync(arrayBuffer, options = {}) {
      const buffer = new this.draco.DecoderBuffer();
      buffer.Init(new Int8Array(arrayBuffer), arrayBuffer.byteLength);
      this._disableAttributeTransforms(options);
      const geometry_type = this.decoder.GetEncodedGeometryType(buffer);
      const dracoGeometry = geometry_type === this.draco.TRIANGULAR_MESH ? new this.draco.Mesh() : new this.draco.PointCloud();
      try {
        let dracoStatus;
        switch (geometry_type) {
          case this.draco.TRIANGULAR_MESH:
            dracoStatus = this.decoder.DecodeBufferToMesh(buffer, dracoGeometry);
            break;
          case this.draco.POINT_CLOUD:
            dracoStatus = this.decoder.DecodeBufferToPointCloud(buffer, dracoGeometry);
            break;
          default:
            throw new Error("DRACO: Unknown geometry type.");
        }
        if (!dracoStatus.ok() || !dracoGeometry.ptr) {
          const message = `DRACO decompression failed: ${dracoStatus.error_msg()}`;
          throw new Error(message);
        }
        const loaderData = this._getDracoLoaderData(dracoGeometry, geometry_type, options);
        const geometry = this._getMeshData(dracoGeometry, loaderData, options);
        const boundingBox = getMeshBoundingBox(geometry.attributes);
        const schema = getDracoSchema(geometry.attributes, loaderData, geometry.indices);
        const data = {
          loader: "draco",
          loaderData,
          header: {
            vertexCount: dracoGeometry.num_points(),
            boundingBox
          },
          ...geometry,
          schema
        };
        return data;
      } finally {
        this.draco.destroy(buffer);
        if (dracoGeometry) {
          this.draco.destroy(dracoGeometry);
        }
      }
    }
    _getDracoLoaderData(dracoGeometry, geometry_type, options) {
      const metadata = this._getTopLevelMetadata(dracoGeometry);
      const attributes = this._getDracoAttributes(dracoGeometry, options);
      return {
        geometry_type,
        num_attributes: dracoGeometry.num_attributes(),
        num_points: dracoGeometry.num_points(),
        num_faces: dracoGeometry instanceof this.draco.Mesh ? dracoGeometry.num_faces() : 0,
        metadata,
        attributes
      };
    }
    _getDracoAttributes(dracoGeometry, options) {
      const dracoAttributes = {};
      for (let attributeId = 0; attributeId < dracoGeometry.num_attributes(); attributeId++) {
        const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attributeId);
        const metadata = this._getAttributeMetadata(dracoGeometry, attributeId);
        dracoAttributes[dracoAttribute.unique_id()] = {
          unique_id: dracoAttribute.unique_id(),
          attribute_type: dracoAttribute.attribute_type(),
          data_type: dracoAttribute.data_type(),
          num_components: dracoAttribute.num_components(),
          byte_offset: dracoAttribute.byte_offset(),
          byte_stride: dracoAttribute.byte_stride(),
          normalized: dracoAttribute.normalized(),
          attribute_index: attributeId,
          metadata
        };
        const quantization = this._getQuantizationTransform(dracoAttribute, options);
        if (quantization) {
          dracoAttributes[dracoAttribute.unique_id()].quantization_transform = quantization;
        }
        const octahedron = this._getOctahedronTransform(dracoAttribute, options);
        if (octahedron) {
          dracoAttributes[dracoAttribute.unique_id()].octahedron_transform = octahedron;
        }
      }
      return dracoAttributes;
    }
    _getMeshData(dracoGeometry, loaderData, options) {
      const attributes = this._getMeshAttributes(loaderData, dracoGeometry, options);
      const positionAttribute = attributes.POSITION;
      if (!positionAttribute) {
        throw new Error("DRACO: No position attribute found.");
      }
      if (dracoGeometry instanceof this.draco.Mesh) {
        switch (options.topology) {
          case "triangle-strip":
            return {
              topology: "triangle-strip",
              mode: 4,
              attributes,
              indices: {
                value: this._getTriangleStripIndices(dracoGeometry),
                size: 1
              }
            };
          case "triangle-list":
          default:
            return {
              topology: "triangle-list",
              mode: 5,
              attributes,
              indices: {
                value: this._getTriangleListIndices(dracoGeometry),
                size: 1
              }
            };
        }
      }
      return {
        topology: "point-list",
        mode: 0,
        attributes
      };
    }
    _getMeshAttributes(loaderData, dracoGeometry, options) {
      const attributes = {};
      for (const loaderAttribute of Object.values(loaderData.attributes)) {
        const attributeName = this._deduceAttributeName(loaderAttribute, options);
        loaderAttribute.name = attributeName;
        const { value, size } = this._getAttributeValues(dracoGeometry, loaderAttribute);
        attributes[attributeName] = {
          value,
          size,
          byteOffset: loaderAttribute.byte_offset,
          byteStride: loaderAttribute.byte_stride,
          normalized: loaderAttribute.normalized
        };
      }
      return attributes;
    }
    _getTriangleListIndices(dracoGeometry) {
      const numFaces = dracoGeometry.num_faces();
      const numIndices = numFaces * 3;
      const byteLength = numIndices * INDEX_ITEM_SIZE;
      const ptr = this.draco._malloc(byteLength);
      try {
        this.decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
        return new Uint32Array(this.draco.HEAPF32.buffer, ptr, numIndices).slice();
      } finally {
        this.draco._free(ptr);
      }
    }
    _getTriangleStripIndices(dracoGeometry) {
      const dracoArray = new this.draco.DracoInt32Array();
      try {
        this.decoder.GetTriangleStripsFromMesh(dracoGeometry, dracoArray);
        return getUint32Array(dracoArray);
      } finally {
        this.draco.destroy(dracoArray);
      }
    }
    _getAttributeValues(dracoGeometry, attribute) {
      const TypedArrayCtor = DRACO_DATA_TYPE_TO_TYPED_ARRAY_MAP[attribute.data_type];
      const numComponents = attribute.num_components;
      const numPoints = dracoGeometry.num_points();
      const numValues = numPoints * numComponents;
      const byteLength = numValues * TypedArrayCtor.BYTES_PER_ELEMENT;
      const dataType = getDracoDataType(this.draco, TypedArrayCtor);
      let value;
      const ptr = this.draco._malloc(byteLength);
      try {
        const dracoAttribute = this.decoder.GetAttribute(dracoGeometry, attribute.attribute_index);
        this.decoder.GetAttributeDataArrayForAllPoints(dracoGeometry, dracoAttribute, dataType, byteLength, ptr);
        value = new TypedArrayCtor(this.draco.HEAPF32.buffer, ptr, numValues).slice();
      } finally {
        this.draco._free(ptr);
      }
      return { value, size: numComponents };
    }
    _deduceAttributeName(attribute, options) {
      const uniqueId = attribute.unique_id;
      for (const [attributeName, attributeUniqueId] of Object.entries(options.extraAttributes || {})) {
        if (attributeUniqueId === uniqueId) {
          return attributeName;
        }
      }
      const thisAttributeType = attribute.attribute_type;
      for (const dracoAttributeConstant in DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP) {
        const attributeType = this.draco[dracoAttributeConstant];
        if (attributeType === thisAttributeType) {
          return DRACO_TO_GLTF_ATTRIBUTE_NAME_MAP[dracoAttributeConstant];
        }
      }
      const entryName = options.attributeNameEntry || "name";
      if (attribute.metadata[entryName]) {
        return attribute.metadata[entryName].string;
      }
      return `CUSTOM_ATTRIBUTE_${uniqueId}`;
    }
    _getTopLevelMetadata(dracoGeometry) {
      const dracoMetadata = this.decoder.GetMetadata(dracoGeometry);
      return this._getDracoMetadata(dracoMetadata);
    }
    _getAttributeMetadata(dracoGeometry, attributeId) {
      const dracoMetadata = this.decoder.GetAttributeMetadata(dracoGeometry, attributeId);
      return this._getDracoMetadata(dracoMetadata);
    }
    _getDracoMetadata(dracoMetadata) {
      if (!dracoMetadata || !dracoMetadata.ptr) {
        return {};
      }
      const result = {};
      const numEntries = this.metadataQuerier.NumEntries(dracoMetadata);
      for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
        const entryName = this.metadataQuerier.GetEntryName(dracoMetadata, entryIndex);
        result[entryName] = this._getDracoMetadataField(dracoMetadata, entryName);
      }
      return result;
    }
    _getDracoMetadataField(dracoMetadata, entryName) {
      const dracoArray = new this.draco.DracoInt32Array();
      try {
        this.metadataQuerier.GetIntEntryArray(dracoMetadata, entryName, dracoArray);
        const intArray = getInt32Array(dracoArray);
        return {
          int: this.metadataQuerier.GetIntEntry(dracoMetadata, entryName),
          string: this.metadataQuerier.GetStringEntry(dracoMetadata, entryName),
          double: this.metadataQuerier.GetDoubleEntry(dracoMetadata, entryName),
          intArray
        };
      } finally {
        this.draco.destroy(dracoArray);
      }
    }
    _disableAttributeTransforms(options) {
      const { quantizedAttributes = [], octahedronAttributes = [] } = options;
      const skipAttributes = [...quantizedAttributes, ...octahedronAttributes];
      for (const dracoAttributeName of skipAttributes) {
        this.decoder.SkipAttributeTransform(this.draco[dracoAttributeName]);
      }
    }
    _getQuantizationTransform(dracoAttribute, options) {
      const { quantizedAttributes = [] } = options;
      const attribute_type = dracoAttribute.attribute_type();
      const skip = quantizedAttributes.map((type) => this.decoder[type]).includes(attribute_type);
      if (skip) {
        const transform = new this.draco.AttributeQuantizationTransform();
        try {
          if (transform.InitFromAttribute(dracoAttribute)) {
            return {
              quantization_bits: transform.quantization_bits(),
              range: transform.range(),
              min_values: new Float32Array([1, 2, 3]).map((i) => transform.min_value(i))
            };
          }
        } finally {
          this.draco.destroy(transform);
        }
      }
      return null;
    }
    _getOctahedronTransform(dracoAttribute, options) {
      const { octahedronAttributes = [] } = options;
      const attribute_type = dracoAttribute.attribute_type();
      const octahedron = octahedronAttributes.map((type) => this.decoder[type]).includes(attribute_type);
      if (octahedron) {
        const transform = new this.draco.AttributeQuantizationTransform();
        try {
          if (transform.InitFromAttribute(dracoAttribute)) {
            return {
              quantization_bits: transform.quantization_bits()
            };
          }
        } finally {
          this.draco.destroy(transform);
        }
      }
      return null;
    }
  };
  function getDracoDataType(draco, attributeType) {
    switch (attributeType) {
      case Float32Array:
        return draco.DT_FLOAT32;
      case Int8Array:
        return draco.DT_INT8;
      case Int16Array:
        return draco.DT_INT16;
      case Int32Array:
        return draco.DT_INT32;
      case Uint8Array:
        return draco.DT_UINT8;
      case Uint16Array:
        return draco.DT_UINT16;
      case Uint32Array:
        return draco.DT_UINT32;
      default:
        return draco.DT_INVALID;
    }
  }
  function getInt32Array(dracoArray) {
    const numValues = dracoArray.size();
    const intArray = new Int32Array(numValues);
    for (let i = 0; i < numValues; i++) {
      intArray[i] = dracoArray.GetValue(i);
    }
    return intArray;
  }
  function getUint32Array(dracoArray) {
    const numValues = dracoArray.size();
    const intArray = new Int32Array(numValues);
    for (let i = 0; i < numValues; i++) {
      intArray[i] = dracoArray.GetValue(i);
    }
    return intArray;
  }

  // src/lib/draco-module-loader.ts
  var DRACO_DECODER_VERSION = "1.5.5";
  var DRACO_ENCODER_VERSION = "1.4.1";
  // CHANGED FOR ASTROGL
  var STATIC_DECODER_URL = `decoder_${DRACO_DECODER_VERSION}`;
  var DRACO_JS_DECODER_URL = `${STATIC_DECODER_URL}/draco_decoder.js`;
  var DRACO_WASM_WRAPPER_URL = `${STATIC_DECODER_URL}/draco_wasm_wrapper.js`;
  var DRACO_WASM_DECODER_URL = `${STATIC_DECODER_URL}/draco_decoder.wasm`;
  var DRACO_ENCODER_URL = `https://raw.githubusercontent.com/google/draco/${DRACO_ENCODER_VERSION}/javascript/draco_encoder.js`;
  var loadDecoderPromise;
  async function loadDracoDecoderModule(options) {
    const modules = options.modules || {};
    if (modules.draco3d) {
      loadDecoderPromise = loadDecoderPromise || modules.draco3d.createDecoderModule({}).then((draco) => {
        return { draco };
      });
    } else {
      loadDecoderPromise = loadDecoderPromise || loadDracoDecoder(options);
    }
    return await loadDecoderPromise;
  }
  async function loadDracoDecoder(options) {
    let DracoDecoderModule;
    let wasmBinary;
    switch (options.draco && options.draco.decoderType) {
      case "js":
        DracoDecoderModule = await loadLibrary(DRACO_JS_DECODER_URL, "draco", options);
        break;
      case "wasm":
      default:
        [DracoDecoderModule, wasmBinary] = await Promise.all([
          await loadLibrary(DRACO_WASM_WRAPPER_URL, "draco", options),
          await loadLibrary(DRACO_WASM_DECODER_URL, "draco", options)
        ]);
    }
    DracoDecoderModule = DracoDecoderModule || globalThis.DracoDecoderModule;
    return await initializeDracoDecoder(DracoDecoderModule, wasmBinary);
  }
  function initializeDracoDecoder(DracoDecoderModule, wasmBinary) {
    const options = {};
    if (wasmBinary) {
      options.wasmBinary = wasmBinary;
    }
    return new Promise((resolve) => {
      DracoDecoderModule({
        ...options,
        onModuleLoaded: (draco) => resolve({ draco })
      });
    });
  }

  // src/index.ts
  var DracoLoader2 = {
    ...DracoLoader,
    parse
  };
  async function parse(arrayBuffer, options) {
    const { draco } = await loadDracoDecoderModule(options);
    const dracoParser = new DracoParser(draco);
    try {
      return dracoParser.parseSync(arrayBuffer, options?.draco);
    } finally {
      dracoParser.destroy();
    }
  }

  // src/workers/draco-worker.ts
  createLoaderWorker(DracoLoader2);
})();
